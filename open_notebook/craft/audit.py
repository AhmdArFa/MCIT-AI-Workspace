"""The audit-refactor loop shared by the four Studio features.

Each pass builds the files, audits them with real engine output (DeckCraft
slide renders, PdfCraft and WordCraft page renders, GridCraft formula
checks, VectorCraft exports) and lists the issues. If there are issues, the
feature's fixer adjusts the build plan and the next pass rebuilds. The loop
stops at zero issues or after ``MAX_PASSES``; whatever remains is reported
with the file (``audit_issues``), never dropped.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Awaitable, Callable, Dict, Generic, List, Optional, TypeVar

from PIL import Image, ImageFont, ImageStat

from open_notebook.craft.kit.assets import font_path

MAX_PASSES = 5

Plan = TypeVar("Plan")
Progress = Callable[[str], Awaitable[None]]


@dataclass
class Issue:
    code: str
    message: str
    where: str = ""

    def __str__(self) -> str:
        return f"{self.where}: {self.message}" if self.where else self.message


@dataclass
class LoopResult(Generic[Plan]):
    files: Dict[str, bytes]
    passes: int
    issues: List[Issue]
    history: List[List[str]] = field(default_factory=list)
    plan: Optional[Plan] = None

    @property
    def clean(self) -> bool:
        return not self.issues


async def audit_loop(
    plan: Plan,
    build: Callable[[Plan, int], Awaitable[Dict[str, bytes]]],
    audit: Callable[[Plan, Dict[str, bytes], int], Awaitable[List[Issue]]],
    fix: Callable[[Plan, List[Issue], int], Any],  # returns a plan, None, or an awaitable of either
    progress: Progress,
    max_passes: int = MAX_PASSES,
) -> LoopResult[Plan]:
    history: List[List[str]] = []
    files: Dict[str, bytes] = {}
    issues: List[Issue] = []
    for n in range(1, max_passes + 1):
        files = await build(plan, n)
        await progress(f"Audit pass {n}: rendering and checking")
        issues = await audit(plan, files, n)
        history.append([str(i) for i in issues])
        if not issues:
            await progress(f"Audit pass {n}: no issues")
            return LoopResult(files, n, [], history, plan)
        await progress(f"Audit pass {n}: {len(issues)} issue(s): " + "; ".join(str(i) for i in issues[:4]))
        nxt = fix(plan, issues, n)
        if hasattr(nxt, "__await__"):
            nxt = await nxt
        if nxt is None:
            break
        plan = nxt
    await progress(f"Delivered after {len(history)} pass(es) with {len(issues)} open issue(s), listed on the file")
    return LoopResult(files, len(history), issues, history, plan)


# --------------------------------------------------------------- measuring

_font_cache: Dict[tuple, ImageFont.FreeTypeFont | ImageFont.ImageFont] = {}


def _font(family: str, bold: bool, px: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    key = (family, bold, px)
    if key not in _font_cache:
        p = font_path(family, "Bold" if bold else "Regular") or font_path("Libre Franklin", "Bold" if bold else "Regular")
        _font_cache[key] = ImageFont.truetype(str(p), px) if p else ImageFont.load_default()
    return _font_cache[key]


def wrap_lines(text: str, family: str, bold: bool, size_pt: float, width_in: float) -> int:
    """Lines a paragraph needs in a box of ``width_in`` inches at ``size_pt``."""
    px = max(4, int(size_pt * 4))  # 4 px per point: 288 dpi measurement
    f = _font(family, bold, px)
    limit = width_in * 72 * 4
    lines = 0
    for para in str(text).split("\n"):
        words = para.split()
        if not words:
            lines += 1
            continue
        cur = ""
        lines += 1
        for w in words:
            trial = f"{cur} {w}".strip()
            if f.getlength(trial) <= limit:
                cur = trial
            else:
                if cur:
                    lines += 1
                cur = w
                while f.getlength(cur) > limit and len(cur) > 1:  # a single word wider than the box
                    lines += 1
                    cur = cur[len(cur) // 2 :]
    return lines


def text_height_in(text: str, family: str, bold: bool, size_pt: float, width_in: float, leading: float = 1.22, para_after_pt: float = 0) -> float:
    n = wrap_lines(text, family, bold, size_pt, width_in)
    return (n * size_pt * leading + para_after_pt) / 72


# ----------------------------------------------------------------- renders


def blank_render(png: Path, threshold: float = 3.0) -> bool:
    """True when a rendered page/slide is a flat colour (nothing drawn)."""
    with Image.open(png) as im:
        stat = ImageStat.Stat(im.convert("L"))
        return stat.stddev[0] < threshold


def copy_issues(text: str) -> List[Issue]:
    """Copy rules from the kit: no dashes as punctuation, no placeholders."""
    out: List[Issue] = []
    if "\u2014" in text or "\u2013" in text:
        out.append(Issue("dash", "Uses em or en dashes in copy"))
    if re.search(r"\b(lorem ipsum|TBD|TODO|\[insert|placeholder)\b", text, re.I):
        out.append(Issue("placeholder", "Contains placeholder text"))
    return out


def strip_dashes(s: str) -> str:
    return re.sub(r"\s*[\u2014\u2013]\s*", ", ", s).replace(", ,", ",")
