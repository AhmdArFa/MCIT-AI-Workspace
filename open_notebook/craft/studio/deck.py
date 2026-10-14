"""Presentation: PptxGenJS builds the Noir deck, DeckCraft renders every slide.

Default: the approved structure (hero cover, agenda, content layouts, end
cover) with the user's content. Custom: the same reference design with the
user's direction applied (density, visual emphasis, accent), then the audit
loop. Both always pass through the audit loop before delivery.
"""

from __future__ import annotations

import asyncio
import copy
import json
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional

from open_notebook.craft.audit import (
    Issue,
    audit_loop,
    blank_render,
    copy_issues,
    strip_dashes,
    text_height_in,
)
from open_notebook.craft.engines import CraftFailed
from open_notebook.craft.kit.assets import END, HERO, LOGO, head_family
from open_notebook.craft.kit.tokens import FONTS, theme
from open_notebook.craft.runner import run_cli
from open_notebook.craft.studio import Rendered, job_dir
from open_notebook.craft.studio.direction import Direction

DECK_DIR = Path(__file__).resolve().parent.parent / "deck"
NODE = "node"

W, H, M = 13.333, 7.5, 0.75


def _slides_from_sections(doc) -> List[Dict[str, Any]]:
    slides: List[Dict[str, Any]] = []
    if doc.stats:
        slides.append({"layout": "stats", "title": "At a glance", "stats": [s.model_dump() for s in doc.stats[:4]]})
    for sec in doc.sections:
        bullets = sec.bullets or [b.strip() for b in sec.body.split(". ") if b.strip()][:5]
        slides.append({"layout": "bullets", "title": sec.heading, "bullets": bullets[:5]})
    if doc.recommendations:
        slides.append({"layout": "process", "title": "Recommendations", "steps": doc.recommendations[:5]})
    return slides


def build_plan(doc, mode: str, direction: Direction) -> Dict[str, Any]:
    t = theme(mode)
    content = [s.model_dump() for s in doc.slides] if doc.slides else _slides_from_sections(doc)
    content = [direction.apply_to_slide(s) for s in content]
    for s in content:
        for k in ("title", "subtitle", "quote", "notes"):
            if s.get(k):
                s[k] = strip_dashes(str(s[k]))
        for k in ("bullets", "left", "right", "steps"):
            s[k] = [strip_dashes(str(b)) for b in s.get(k) or []]
    agenda = [s["title"] for s in content if s.get("layout") not in ("section", "quote")][:8]
    slides = ([{"layout": "agenda", "title": "Agenda", "eyebrow": "Overview", "bullets": agenda}] if len(agenda) >= 3 else []) + content
    return {
        "title": strip_dashes(doc.title),
        "subtitle": strip_dashes(doc.subtitle or doc.summary[:150]),
        "eyebrow": doc.notebook_name or "MCIT AI",
        "date": datetime.now().strftime("%d %B %Y"),
        "closing": "Thank You",
        "footer": "Ministry of Communications and Information Technology",
        "url": "mcit.gov.eg",
        "logo": str(LOGO) if LOGO.exists() else "",
        "hero": str(HERO) if HERO.exists() else "",
        "end": str(END) if END.exists() else "",
        "theme": {
            "bg": t.bg,
            "surface": t.surface,
            "border": t.border,
            "text": t.text,
            "muted": t.muted,
            "accent": direction.accent_value(t),
            "premium": t.premium,
            "series": list(t.series),
            "onAccent": t.on_accent,
            "fontHead": head_family(),
            "fontBody": FONTS.body,
            "fontCover": FONTS.cover,
        },
        "scale": {"title": 1.0, "body": direction.body_scale},
        "slides": slides,
    }


# ------------------------------------------------------------------ fitting


def _fits(plan: Dict[str, Any]) -> List[Issue]:
    """Measure every text box against its frame with the real font metrics."""
    out: List[Issue] = []
    th, tb = plan["theme"]["fontHead"], plan["theme"]["fontBody"]
    st, sb = plan["scale"]["title"], plan["scale"]["body"]
    cover_h = text_height_in(plan["title"], th, True, 42 * st, 8.6)
    if cover_h > 1.9:
        out.append(Issue("overflow_cover", "Cover title does not fit", "slide 1"))

    for i, s in enumerate(plan["slides"], start=2):
        where = f"slide {i}"
        sb = plan["scale"]["body"] * float(s.get("scale") or 1)
        top = 2.2 if s.get("subtitle") else 1.9
        h = H - 0.75 - top
        if text_height_in(s.get("title", ""), th, True, 30 * st, W - 2 * M - 1.6) > 0.95:
            out.append(Issue("overflow_title", "Title wraps past its frame", where))
        lay = s.get("layout", "bullets")

        def used_h(items: List[str], size: float, width: float) -> float:
            return sum(text_height_in(b, tb, False, size * sb, width - 0.25, para_after_pt=9) for b in items)

        def body_fits(items: List[str], size: float, width: float, height: float) -> bool:
            used = used_h(items, size, width)
            if used < height * 0.22 and items and float(s.get("scale") or 1) < 1.3:
                out.append(Issue("sparse", "Slide is sparse: content fills under a quarter of the frame", where))
            return used <= height

        if lay == "bullets":
            items = s.get("bullets", [])
            size = 24 if len(items) <= 3 else 20 if len(items) <= 5 else 18
            if not body_fits(items, size, W - 2 * M, h):
                out.append(Issue("overflow", "Bullets overflow the slide", where))
        elif lay in ("two_column", "comparison"):
            cw = (W - 2 * M - 0.4) / 2
            for side in ("left", "right"):
                size = 18 if len(s.get(side, [])) <= 3 else 16
                if not body_fits(s.get(side, []), size, cw - 0.6, h - 1.15):
                    out.append(Issue("overflow", f"{side.title()} column overflows", where))
        elif lay in ("process", "timeline"):
            steps = (s.get("steps") or s.get("bullets") or [])[:5]
            n = max(len(steps), 1)
            cw = (W - 2 * M - 0.25 * (n - 1)) / n
            if any(text_height_in(x, tb, False, 14 * sb, cw - 0.1) > h - 1.2 for x in steps):
                out.append(Issue("overflow", "A step does not fit its column", where))
        elif lay == "stats" and len(s.get("stats", [])) == 1:
            pass
        elif lay == "stats":
            n = max(1, min(len(s.get("stats", [])), 4))
            cw = (W - 2 * M - 0.3 * (n - 1)) / n
            if any(text_height_in(x.get("label", ""), tb, False, 14 * sb, cw - 0.5) > 1.25 for x in s.get("stats", [])[:4]):
                out.append(Issue("overflow", "A stat label does not fit its card", where))
            if not s.get("stats"):
                out.append(Issue("empty", "Stats slide has no figures", where))
        elif lay == "cards":
            items = s.get("bullets", [])[:4]
            n = max(1, len(items))
            cw = (W - 2 * M - 0.3 * (n - 1)) / n
            if any(text_height_in(x, tb, False, 17 * sb, cw - 0.5) > 1.6 for x in items):
                out.append(Issue("overflow", "A card overflows", where))
        elif lay == "agenda":
            items = s.get("bullets", [])
            cols = 2 if len(items) > 4 else 1
            cw = (W - 2 * M - 0.5 * (cols - 1)) / cols
            if any(text_height_in(x, tb, False, 17 * sb, cw - 0.95) > 0.62 for x in items):
                out.append(Issue("overflow", "An agenda item wraps", where))
        elif lay == "quote":
            if text_height_in(s.get("quote") or "", th, False, 28 * st, W - 2 * M - 0.8) > 3.3:
                out.append(Issue("overflow", "Quote does not fit", where))
        elif lay == "chart" and not (s.get("chart_labels") and s.get("chart_values")):
            out.append(Issue("empty", "Chart slide has no data", where))
        elif lay == "table" and not s.get("table_columns"):
            out.append(Issue("empty", "Table slide has no columns", where))
        elif lay in ("chart", "image") and s.get("bullets"):
            width = 3.9 if lay == "chart" else 4.0
            if not body_fits(s["bullets"], 14, width, h):
                out.append(Issue("overflow", "Side notes overflow", where))
        if lay not in ("section", "chart", "table", "image", "quote", "stats") and not any(
            s.get(k) for k in ("bullets", "left", "right", "steps")
        ):
            out.append(Issue("empty", "Slide has no content", where))

    prev = None
    for i, s in enumerate(plan["slides"], start=2):
        if prev and s.get("layout") == prev and s.get("layout") not in ("section",):
            out.append(Issue("repeat", f"Same layout as the previous slide ({prev})", f"slide {i}"))
        prev = s.get("layout")
    return out


def _fix(plan: Dict[str, Any], issues: List[Issue], n: int) -> Optional[Dict[str, Any]]:
    p = copy.deepcopy(plan)
    changed = False
    codes = {i.code for i in issues}
    if "overflow_cover" in codes:
        if p["scale"]["title"] > 0.72:
            p["scale"]["title"] = round(p["scale"]["title"] * 0.88, 3)
        else:
            p["title"] = _trim(p["title"], 60).rstrip(".")
        changed = True
    if "overflow" in codes or "overflow_title" in codes:
        if p["scale"]["body"] > 0.8:
            p["scale"]["body"] = round(p["scale"]["body"] * 0.92, 3)
            changed = True
        if "overflow_title" in codes and p["scale"]["title"] > 0.8:
            p["scale"]["title"] = round(p["scale"]["title"] * 0.92, 3)
            changed = True
        if n >= 2:  # tighten copy: shorten long items, then split crowded slides
            out: List[Dict[str, Any]] = []
            crowded = {int(i.where.split()[-1]) for i in issues if i.code == "overflow" and i.where.startswith("slide ")}
            for idx, s in enumerate(p["slides"], start=2):
                if idx in crowded:
                    for k in ("bullets", "left", "right", "steps"):
                        s[k] = [_trim(x, 110 if n == 2 else 85) for x in s.get(k) or []]
                    if n >= 3 and len(s.get("bullets") or []) > 4 and s.get("layout") == "bullets":
                        half = (len(s["bullets"]) + 1) // 2
                        a, b = dict(s), dict(s)
                        a["bullets"], b["bullets"] = s["bullets"][:half], s["bullets"][half:]
                        b["title"] = f"{s['title']} (continued)"
                        b["layout"] = "cards" if len(b["bullets"]) <= 4 else "bullets"
                        out += [a, b]
                        changed = True
                        continue
                    changed = True
                out.append(s)
            p["slides"] = out
    if "repeat" in codes:
        alt = {"bullets": "cards", "cards": "bullets", "two_column": "comparison", "comparison": "two_column", "process": "timeline", "timeline": "process"}
        for i in issues:
            if i.code == "repeat":
                idx = int(i.where.split()[-1]) - 2
                if 0 <= idx < len(p["slides"]):
                    s = p["slides"][idx]
                    nxt = alt.get(s.get("layout", ""))
                    if nxt == "cards" and len(s.get("bullets") or []) > 4:
                        nxt = None
                    if nxt:
                        s["layout"] = nxt
                        changed = True
    if "sparse" in codes:
        sparse = {int(i.where.split()[-1]) for i in issues if i.code == "sparse"}
        for idx, s in enumerate(p["slides"], start=2):
            if idx in sparse and float(s.get("scale") or 1) < 1.3:
                s["scale"] = round(min(1.3, float(s.get("scale") or 1) * 1.15), 3)
                changed = True
    if "empty" in codes:
        keep = []
        empties = {int(i.where.split()[-1]) for i in issues if i.code == "empty"}
        for idx, s in enumerate(p["slides"], start=2):
            if idx in empties:
                if s.get("bullets"):
                    s["layout"] = "bullets"
                    keep.append(s)
                changed = True
                continue
            keep.append(s)
        p["slides"] = keep
    if "dash" in codes or "placeholder" in codes:
        changed = True  # dashes are stripped while planning; placeholders cannot be auto-fixed below
    return p if changed else None


def _trim(text: str, n: int) -> str:
    text = str(text)
    if len(text) <= n:
        return text
    cut = text[:n].rsplit(" ", 1)[0].rstrip(",;:")
    return cut + "."


def _all_text(plan: Dict[str, Any]) -> str:
    parts = [plan["title"], plan["subtitle"]]
    for s in plan["slides"]:
        parts += [s.get("title", ""), s.get("subtitle", ""), s.get("quote", "")]
        for k in ("bullets", "left", "right", "steps"):
            parts += [str(x) for x in s.get(k) or []]
    return "\n".join(parts)


async def render(doc, mode: str, direction: Direction, progress) -> Rendered:
    work = job_dir()
    plan = build_plan(doc, mode, direction)
    await progress(f"Template: Noir presentation ({mode}), {len(plan['slides']) + 2} slides with hero and end covers")

    async def build(p: Dict[str, Any], n: int) -> Dict[str, bytes]:
        (work / "spec.json").write_text(json.dumps(p), "utf-8")
        out = work / f"deck-{n}.pptx"
        await progress(f"Building the slides (pass {n})")
        proc = await asyncio.create_subprocess_exec(
            NODE, str(DECK_DIR / "build_deck.mjs"), str(work / "spec.json"), str(out),
            cwd=str(DECK_DIR), stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE,
        )
        _, err = await asyncio.wait_for(proc.communicate(), timeout=180)
        if proc.returncode != 0 or not out.exists():
            raise CraftFailed("Deck construction failed: " + err.decode("utf-8", "replace")[-300:])
        return {"pptx": out.read_bytes()}

    async def audit(p: Dict[str, Any], files: Dict[str, bytes], n: int) -> List[Issue]:
        pptx = work / f"deck-{n}.pptx"
        renders = work / f"render-{n}"
        renders.mkdir(exist_ok=True)
        await run_cli("deckcraft", ["render", str(pptx), "--all", "--scale", "1", str(renders)], cwd=work)
        pngs = sorted(renders.glob("*.png"))
        issues: List[Issue] = []
        expected = len(p["slides"]) + 2
        if len(pngs) != expected:
            issues.append(Issue("render", f"DeckCraft rendered {len(pngs)} of {expected} slides"))
        for i, png in enumerate(pngs, start=1):
            if i not in (1, expected) and blank_render(png):
                issues.append(Issue("blank", "Slide renders empty", f"slide {i}"))
        if not p["hero"]:
            issues.append(Issue("cover", "Hero cover art is not installed", "slide 1"))
        if not p["end"]:
            issues.append(Issue("cover", "End cover art is not installed", f"slide {expected}"))
        issues += _fits(p)
        issues += copy_issues(_all_text(p))
        return issues

    result = await audit_loop(plan, build, audit, _fix, progress)
    final = work / f"deck-{result.passes}.pptx"
    await progress("DeckCraft: exporting the PDF copy")
    pdf = work / "deck.pdf"
    await run_cli("deckcraft", ["convert", str(final), str(pdf)], cwd=work)
    files = {"pptx": final.read_bytes(), "pdf": pdf.read_bytes()}
    return Rendered(files, result.passes, result.issues, result.history)
