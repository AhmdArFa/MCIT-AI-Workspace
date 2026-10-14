"""Infograph: the Noir sketchnote (speech-bubble title, two columns of numbered
blocks with hand-drawn Open Doodles, curved arrows, verdict box).

The layout is computed here with real font metrics, written as SVG with the
doodle artwork inlined, and VectorCraft renders the PNG and PDF. The audit
checks every text line against its block, block overlaps, doodle placement
and the rendered output.
"""

from __future__ import annotations

import copy
import html
import random
import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, List, Optional, Tuple

from PIL import Image

from open_notebook.craft.audit import (
    Issue,
    _font,
    audit_loop,
    blank_render,
    copy_issues,
    strip_dashes,
)
from open_notebook.craft.kit.assets import doodles, head_family
from open_notebook.craft.kit.tokens import FONTS, MIDNIGHT, PULSE, SILVER, WHITE
from open_notebook.craft.runner import run_cli
from open_notebook.craft.studio import Rendered, job_dir
from open_notebook.craft.studio.direction import Direction

CANVAS_W = 1600


@dataclass
class Block:
    heading: str
    lines: List[str]
    doodle: Optional[Path] = None


@dataclass
class InfoPlan:
    title: str
    subtitle: str
    left_title: str
    right_title: str
    left: List[Block]
    right: List[Block]
    verdict: str
    mode: str
    body_px: int = 22
    head_px: int = 27
    seed: int = 7
    rects: List[Tuple[str, Tuple[float, float, float, float]]] = field(default_factory=list)


def _short_lines(text: str, n: int = 3, max_words: int = 12) -> List[str]:
    parts = [p.strip() for p in re.split(r"(?<=[.;])\s+|\n", text) if p.strip()]
    out = []
    for p in parts[:n]:
        words = p.split()
        out.append(" ".join(words[:max_words]).rstrip(",;") + ("" if len(words) <= max_words else "."))
    return out


def build_plan(doc, mode: str, direction: Direction) -> InfoPlan:
    blocks: List[Block] = []
    for sec in doc.sections[:8]:
        lines = [strip_dashes(b) for b in sec.bullets[:3]] or _short_lines(strip_dashes(sec.body))
        blocks.append(Block(strip_dashes(sec.heading), [x for x in lines if x][:3]))
    if len(blocks) < 4:
        for s in doc.stats[: 6 - len(blocks)]:
            blocks.append(Block(strip_dashes(s.value), [strip_dashes(s.label)]))
    art = doodles()
    rng = random.Random(len(doc.title))
    picks = rng.sample(art, k=min(len(art), len(blocks))) if art else []
    for b, d in zip(blocks, picks):
        b.doodle = d
    half = (len(blocks) + 1) // 2
    return InfoPlan(
        title=strip_dashes(doc.title),
        subtitle=strip_dashes(doc.subtitle or doc.summary[:120]),
        left_title="The picture today",
        right_title="What comes next",
        left=blocks[:half],
        right=blocks[half:],
        verdict=strip_dashes(doc.conclusion or (doc.recommendations[0] if doc.recommendations else doc.summary))[:160],
        mode=mode,
        body_px=20 if direction.density == "compact" else 22,
    )


# ------------------------------------------------------------------- layout


def _wrap(text: str, family: str, bold: bool, px: int, width: float) -> List[str]:
    f = _font(family, bold, px)
    words, lines, cur = str(text).split(), [], ""
    for w in words:
        t = f"{cur} {w}".strip()
        if f.getlength(t) <= width or not cur:
            cur = t
        else:
            lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def _wobble(points: List[Tuple[float, float]], rng: random.Random, amp: float = 1.4) -> str:
    d = f"M{points[0][0]:.1f},{points[0][1]:.1f}"
    for (x0, y0), (x1, y1) in zip(points, points[1:]):
        mx, my = (x0 + x1) / 2 + rng.uniform(-amp, amp), (y0 + y1) / 2 + rng.uniform(-amp, amp)
        d += f" Q{mx:.1f},{my:.1f} {x1:.1f},{y1:.1f}"
    return d


def _rrect(x: float, y: float, w: float, h: float, r: float, rng: random.Random) -> str:
    """Hand-drawn rounded rectangle: true corner curves, a slight wobble on the edges."""
    j = lambda: rng.uniform(-1.2, 1.2)  # noqa: E731
    return (
        f"M{x + r:.1f},{y:.1f} Q{x + w / 2:.1f},{y + j():.1f} {x + w - r:.1f},{y:.1f} Q{x + w:.1f},{y:.1f} {x + w:.1f},{y + r:.1f}"
        f" Q{x + w + j():.1f},{y + h / 2:.1f} {x + w:.1f},{y + h - r:.1f} Q{x + w:.1f},{y + h:.1f} {x + w - r:.1f},{y + h:.1f}"
        f" Q{x + w / 2:.1f},{y + h + j():.1f} {x + r:.1f},{y + h:.1f} Q{x:.1f},{y + h:.1f} {x:.1f},{y + h - r:.1f}"
        f" Q{x + j():.1f},{y + h / 2:.1f} {x:.1f},{y + r:.1f} Q{x:.1f},{y:.1f} {x + r:.1f},{y:.1f} Z"
    )


def _doodle_svg(path: Path, x: float, y: float, w: float, h: float) -> str:
    raw = path.read_text("utf-8", errors="ignore")
    vb = re.search(r'viewBox="([\d.\s-]+)"', raw)
    if vb:
        vx, vy, vw, vh = [float(v) for v in vb.group(1).split()]
    else:
        width = re.search(r'width="([\d.]+)', raw)
        height = re.search(r'height="([\d.]+)', raw)
        vw = float(width.group(1)) if width else 1000
        vh = float(height.group(1)) if height else 1000
        vx = vy = 0.0
    inner = re.sub(r"^.*?<svg[^>]*>", "", raw, flags=re.S)
    inner = re.sub(r"</svg>\s*$", "", inner.strip(), flags=re.S)
    s = min(w / vw, h / vh)
    ox, oy = x + (w - vw * s) / 2, y + (h - vh * s) / 2
    return f'<g transform="translate({ox:.1f},{oy:.1f}) scale({s:.4f}) translate({-vx},{-vy})">{inner}</g>'


def compose(plan: InfoPlan) -> Tuple[str, int]:
    dark = plan.mode == "dark"
    bg, ink, muted, accent = (MIDNIGHT, WHITE, SILVER, PULSE) if dark else (WHITE, MIDNIGHT, "4A5568", PULSE)
    hf, bf = head_family(), FONTS.body
    rng = random.Random(plan.seed)
    e = lambda s: html.escape(str(s))  # noqa: E731
    W = CANVAS_W
    M = 70
    parts: List[str] = []
    plan.rects = []

    # speech-bubble title
    tlines = _wrap(plan.title.upper(), hf, True, 54, W - 2 * M - 80)
    th = 70 + 62 * len(tlines) + (40 if plan.subtitle else 0)
    bx, by, bw = M, 50, W - 2 * M
    parts.append(f'<path d="{_rrect(bx, by, bw, th, 26, rng)}" fill="none" stroke="#{ink}" stroke-width="3.5" stroke-linecap="round"/>')
    tx = W / 2 - 40
    parts.append(f'<path d="M{tx},{by + th - 2} L{tx + 26},{by + th + 42} L{tx + 58},{by + th - 2}" fill="#{bg}" stroke="#{ink}" stroke-width="3.5" stroke-linejoin="round"/>')
    for i, ln in enumerate(tlines):
        parts.append(f'<text x="{W / 2}" y="{by + 78 + i * 62}" text-anchor="middle" font-family="{e(hf)}" font-weight="700" font-size="54" fill="#{ink}">{e(ln)}</text>')
    if plan.subtitle:
        sub = _wrap(plan.subtitle, bf, False, 24, bw - 120)[:1]
        parts.append(f'<text x="{W / 2}" y="{by + 78 + len(tlines) * 62 + 6}" text-anchor="middle" font-family="{e(bf)}" font-size="24" fill="#{muted}">{e(sub[0] if sub else "")}</text>')
    plan.rects.append(("title", (bx, by, bw, th)))

    top = by + th + 80
    col_w = (W - 2 * M - 60) / 2
    xs = [M, M + col_w + 60]
    heads = [plan.left_title, plan.right_title]
    ys = []
    for c, x in enumerate(xs):
        parts.append(f'<path d="{_rrect(x + col_w / 2 - 190, top, 380, 58, 29, rng)}" fill="#{accent}" stroke="#{accent}" stroke-width="2"/>')
        parts.append(f'<text x="{x + col_w / 2}" y="{top + 39}" text-anchor="middle" font-family="{e(hf)}" font-weight="700" font-size="28" fill="#{MIDNIGHT if dark else WHITE}">{e(heads[c].upper())}</text>')
        ys.append(top + 100)

    n = 1
    centers: List[List[Tuple[float, float]]] = [[], []]
    for c, blocks in enumerate((plan.left, plan.right)):
        x = xs[c]
        y = ys[c]
        for b in blocks:
            art_w = 170 if b.doodle else 0
            text_w = col_w - art_w - 110
            hl = _wrap(b.heading, hf, True, plan.head_px, text_w)
            bl: List[str] = []
            for line in b.lines:
                bl += _wrap(line, bf, False, plan.body_px, text_w)
            h = max(16 + len(hl) * (plan.head_px + 8) + 10 + len(bl) * (plan.body_px + 9) + 18, 190 if b.doodle else 0)
            # badge
            parts.append(f'<circle cx="{x + 32}" cy="{y + 30}" r="25" fill="#{accent}"/>')
            parts.append(f'<text x="{x + 32}" y="{y + 40}" text-anchor="middle" font-family="{e(hf)}" font-weight="700" font-size="26" fill="#{MIDNIGHT if dark else WHITE}">{n}</text>')
            ty = y + 36
            for ln in hl:
                parts.append(f'<text x="{x + 76}" y="{ty}" font-family="{e(hf)}" font-weight="700" font-size="{plan.head_px}" fill="#{ink}">{e(ln)}</text>')
                ty += plan.head_px + 8
            uw = min(text_w, _font(hf, True, plan.head_px).getlength(hl[-1]) if hl else 0)
            parts.append(f'<path d="{_wobble([(x + 76, ty - plan.head_px + 6), (x + 76 + uw, ty - plan.head_px + 4)], rng, 1.8)}" stroke="#{accent}" stroke-width="3" fill="none" stroke-linecap="round"/>')
            ty += 10
            for ln in bl:
                parts.append(f'<text x="{x + 76}" y="{ty}" font-family="{e(bf)}" font-size="{plan.body_px}" fill="#{muted if dark else ink}">{e(ln)}</text>')
                ty += plan.body_px + 9
            if b.doodle:
                dx, dy = x + col_w - art_w - 10, y + 6
                if dark:  # the artwork is drawn in black ink: it sits on a white card, never recoloured
                    parts.append(f'<path d="{_rrect(dx - 8, dy - 8, art_w + 16, 186, 18, rng)}" fill="#{WHITE}" stroke="none"/>')
                parts.append(_doodle_svg(b.doodle, dx, dy, art_w, 170))
                plan.rects.append((f"doodle {n}", (dx, dy, art_w, 170)))
            plan.rects.append((f"block {n}", (x, y, col_w, h)))
            centers[c].append((x + 32, y + 30))
            y += h + 34
            n += 1
        ys[c] = y

    # arrows between consecutive blocks in each column
    for c in (0, 1):
        for (x0, y0), (x1, y1) in zip(centers[c], centers[c][1:]):
            sx, sy, ex, ey = x0, y0 + 32, x1, y1 - 32
            cx = sx - 46
            parts.append(f'<path d="M{sx - 6},{sy} Q{cx},{(sy + ey) / 2} {ex - 6},{ey}" fill="none" stroke="#{muted}" stroke-width="2.5" stroke-linecap="round"/>')
            parts.append(f'<path d="M{ex - 16},{ey - 12} L{ex - 6},{ey} L{ex + 6},{ey - 12}" fill="none" stroke="#{muted}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>')

    bottom = max(ys) + 10
    # dashed divider
    dx = M + col_w + 30
    parts.append(f'<path d="M{dx},{top + 80} L{dx},{bottom - 20}" stroke="#{muted}" stroke-width="2" stroke-dasharray="10 12" fill="none"/>')

    # verdict box
    vl = _wrap(plan.verdict, hf, True, 30, W - 2 * M - 260)
    vh = 70 + 40 * len(vl)
    vy = bottom + 20
    parts.append(f'<path d="{_rrect(M + 90, vy, W - 2 * M - 180, vh, 22, rng)}" fill="none" stroke="#{accent}" stroke-width="4"/>')
    parts.append(f'<text x="{W / 2}" y="{vy + 40}" text-anchor="middle" font-family="{e(bf)}" font-weight="600" font-size="20" letter-spacing="4" fill="#{accent}">THE VERDICT</text>')
    for i, ln in enumerate(vl):
        parts.append(f'<text x="{W / 2}" y="{vy + 80 + i * 40}" text-anchor="middle" font-family="{e(hf)}" font-weight="700" font-size="30" fill="#{ink}">{e(ln)}</text>')
    plan.rects.append(("verdict", (M + 90, vy, W - 2 * M - 180, vh)))
    H = int(vy + vh + 50 + 40)
    parts.append(f'<text x="{W - M}" y="{H - 30}" text-anchor="end" font-family="{e(bf)}" font-size="16" fill="#{muted}">MCIT AI · Ministry of Communications and Information Technology</text>')
    svg = (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">'
        f'<rect width="{W}" height="{H}" fill="#{bg}"/>' + "".join(parts) + "</svg>"
    )
    return svg, H


def _overlaps(rects: List[Tuple[str, Tuple[float, float, float, float]]]) -> List[Issue]:
    out = []
    blocks = [r for r in rects if r[0].startswith("block") or r[0] in ("title", "verdict")]
    for i, (na, a) in enumerate(blocks):
        for nb, b in blocks[i + 1 :]:
            if a[0] < b[0] + b[2] - 1 and b[0] < a[0] + a[2] - 1 and a[1] < b[1] + b[3] - 1 and b[1] < a[1] + a[3] - 1:
                out.append(Issue("overlap", f"{na} overlaps {nb}"))
    for name, (x, y, w, h) in rects:
        if x < 0 or x + w > CANVAS_W:
            out.append(Issue("clip", f"{name} runs off the canvas"))
    return out


async def render(doc, mode: str, direction: Direction, progress) -> Rendered:
    work = job_dir()
    plan = build_plan(doc, mode, direction)
    await progress(f"Template: Noir sketchnote ({mode}), {len(plan.left) + len(plan.right)} blocks with hand-drawn artwork")

    async def build(p: InfoPlan, n: int) -> Dict[str, bytes]:
        svg, _ = compose(p)
        src = work / f"sketchnote-{n}.svg"
        src.write_text(svg, "utf-8")
        await progress(f"VectorCraft: rendering the sketchnote (pass {n})")
        png, pdf = work / f"sketchnote-{n}.png", work / f"sketchnote-{n}.pdf"
        await run_cli("vectorcraft", ["convert", str(src), str(png), "--scale", "1"], cwd=work)
        await run_cli("vectorcraft", ["convert", str(src), str(pdf)], cwd=work)
        return {"png": png.read_bytes(), "pdf": pdf.read_bytes(), "svg": svg.encode("utf-8")}

    async def audit(p: InfoPlan, files: Dict[str, bytes], n: int) -> List[Issue]:
        issues: List[Issue] = []
        png = work / f"sketchnote-{n}.png"
        if blank_render(png):
            issues.append(Issue("blank", "Rendered sketchnote is empty"))
        with Image.open(png) as im:
            if im.size[0] < CANVAS_W * 0.9:
                issues.append(Issue("render", f"Rendered at {im.size[0]} px wide"))
        issues += _overlaps(p.rects)
        if len(p.left) + len(p.right) < 4:
            issues.append(Issue("depth", "Fewer than four blocks"))
        if not doodles():
            issues.append(Issue("artwork", "Doodle artwork is not installed"))
        if abs(len(p.left) - len(p.right)) > 1:
            issues.append(Issue("balance", "Columns are unbalanced"))
        issues += copy_issues(" ".join([p.title, p.verdict] + [b.heading + " " + " ".join(b.lines) for b in p.left + p.right]))
        return issues

    def fix(p: InfoPlan, issues: List[Issue], n: int) -> Optional[InfoPlan]:
        q = copy.deepcopy(p)
        codes = {i.code for i in issues}
        if "balance" in codes:
            blocks = q.left + q.right
            half = (len(blocks) + 1) // 2
            q.left, q.right = blocks[:half], blocks[half:]
            return q
        if "overlap" in codes or "clip" in codes:
            q.body_px = max(18, q.body_px - 2)
            q.head_px = max(23, q.head_px - 2)
            return q
        return None

    result = await audit_loop(plan, build, audit, fix, progress)
    return Rendered(result.files, result.passes, result.issues, result.history)
