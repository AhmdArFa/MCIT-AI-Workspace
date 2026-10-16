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
import math
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
from open_notebook.craft.kit.tokens import FONTS, MIDNIGHT, PALE_GOLD, PULSE, SILVER, WHITE
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
    from open_notebook.craft.kit.assets import hand_family
    hf = hand_family()
    bf = hand_family()
    rng = random.Random(plan.seed)
    e = lambda s: html.escape(str(s))  # noqa: E731
    W = CANVAS_W
    M = 70
    parts: List[str] = [
        "<defs><style>@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&amp;display=swap');</style></defs>"
    ]
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


def _wrap_safe(text: str, family: str, bold: bool, px: int, width: float) -> List[str]:
    try:
        return _wrap(text, family, bold, px, width)
    except Exception:
        chars_per_line = max(10, int(width / (px * 0.52)))
        words = str(text).split()
        lines = []
        cur = ""
        for w in words:
            if len(cur) + len(w) + 1 <= chars_per_line or not cur:
                cur = f"{cur} {w}".strip()
            else:
                lines.append(cur)
                cur = w
        if cur:
            lines.append(cur)
        return lines


def _detect_diagram_type(doc, direction: Direction) -> str:
    raw_type = (
        getattr(doc, "diagram_type", None)
        or (getattr(doc.options, "diagram_type", None) if getattr(doc, "options", None) else None)
        or ""
    ).strip().lower()
    if raw_type:
        return raw_type
    if getattr(doc, "blueprint", None) or (getattr(doc.options, "blueprint", None) if getattr(doc, "options", None) else None):
        return "blueprint"
    inst = (getattr(doc.options, "instructions", "") if getattr(doc, "options", None) else "") or ""
    text = (direction.text + " " + inst + " " + getattr(doc, "title", "")).lower()
    if ("nodes" in text and "edges" in text) or "layout_algorithm" in text:
        return "blueprint"
    if getattr(doc, "custom_svg", None) or (getattr(doc.options, "custom_svg", None) if getattr(doc, "options", None) else None):
        return "custom_svg"
    if any(k in text for k in ("blueprint", "topology", "network", "graph", "threat vector", "relationship", "node")):
        return "blueprint" if ("node" in text or "blueprint" in text or "topology" in text) else "network"
    if any(k in text for k in ("architecture", "stack", "layers", "tier", "technical architecture")):
        return "architecture"
    if any(k in text for k in ("quadrant", "matrix", "2x2", "prioritization", "impact vs")):
        return "quadrant"
    if any(k in text for k in ("flywheel", "cycle", "lifecycle", "loop", "circular")):
        return "cycle"
    return "sketchnote"


def _get_theme_colors(doc, mode: str) -> Dict[str, Any]:
    opts = getattr(doc, "options", None)
    dark = mode == "dark"
    bg = getattr(opts, "bg_color", None) or (MIDNIGHT if dark else WHITE)
    card_bg = "#081226" if dark else "#F8FAFC"
    border = getattr(opts, "primary_color", None) or ("#1E507A" if dark else "#E2E8F0")
    accent = getattr(opts, "accent_color", None) or PULSE
    text = getattr(opts, "text_color", None) or (WHITE if dark else "#0F172A")
    muted = SILVER if dark else "#64748B"
    gold = PALE_GOLD
    return {
        "dark": dark,
        "bg": bg.lstrip("#"),
        "card_bg": card_bg.lstrip("#"),
        "border": border.lstrip("#"),
        "accent": accent.lstrip("#"),
        "text": text.lstrip("#"),
        "muted": muted.lstrip("#"),
        "gold": gold.lstrip("#"),
    }


def _normalize_sections(doc) -> List[Dict[str, Any]]:
    out = []
    for s in (getattr(doc, "sections", []) or []):
        heading = getattr(s, "heading", None) if not isinstance(s, dict) else s.get("heading")
        if not heading:
            heading = getattr(s, "title", None) if not isinstance(s, dict) else s.get("title")
        bullets = getattr(s, "bullets", None) if not isinstance(s, dict) else s.get("bullets")
        body = getattr(s, "body", None) if not isinstance(s, dict) else s.get("body")
        out.append({
            "heading": str(heading or ""),
            "bullets": [str(b) for b in (bullets or []) if b],
            "body": str(body or ""),
        })
    if not out and getattr(doc, "slides", None):
        for sl in doc.slides:
            title = getattr(sl, "title", "") if not isinstance(sl, dict) else sl.get("title", "")
            bullets = getattr(sl, "bullets", []) if not isinstance(sl, dict) else sl.get("bullets", [])
            notes = getattr(sl, "notes", "") if not isinstance(sl, dict) else sl.get("notes", "")
            out.append({
                "heading": str(title),
                "bullets": [str(b) for b in (bullets or []) if b],
                "body": str(notes),
            })
    if not out and getattr(doc, "key_points", None):
        for i, kp in enumerate(doc.key_points):
            out.append({"heading": f"Pillar {i+1}", "bullets": [str(kp)], "body": ""})
    return out


def _compose_architecture(doc, mode: str) -> Tuple[str, int]:
    c = _get_theme_colors(doc, mode)
    W = CANVAS_W
    M = 80
    hf = "Nohemi, 'Libre Franklin', 'Inter', sans-serif"
    bf = "'Libre Franklin', 'Inter', sans-serif"
    e = lambda s: html.escape(str(s))

    raw_sections = _normalize_sections(doc)
    tiers = raw_sections[:5] if raw_sections else [
        {"heading": "Intelligence & Predictive Telemetry", "bullets": ["Continuous threat discovery", "AI-driven pattern matching", "Automated incident escalation"], "body": ""},
        {"heading": "Zero-Trust Identity & Access Mesh", "bullets": ["Hardware-backed attestation", "Least-privilege authorization", "Real-time session verification"], "body": ""},
        {"heading": "Distributed Resilient Fabric", "bullets": ["Immutable transactional ledger", "Multi-region failover automation", "Decoupled microservices"], "body": ""},
        {"heading": "Sovereign Data & Cryptographic Core", "bullets": ["Post-quantum cryptographic agility", "Confidential compute enclaves", "End-to-end data provenance"], "body": ""},
    ]

    parts: List[str] = []
    parts.append(f'''<defs>
      <marker id="arrow-down" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#{c['accent']}"/>
      </marker>
    </defs>''')

    top = 60
    parts.append(f'<rect x="{M}" y="{top}" width="280" height="34" rx="17" fill="#{c["accent"]}" fill-opacity="0.15" stroke="#{c["accent"]}" stroke-width="1.5"/>')
    parts.append(f'<text x="{M + 140}" y="{top + 22}" text-anchor="middle" font-family="{hf}" font-size="13" font-weight="700" letter-spacing="2" fill="#{c["accent"]}">ENTERPRISE ARCHITECTURE</text>')

    top += 60
    t_lines = _wrap_safe(strip_dashes(doc.title).upper(), head_family(), True, 44, W - 2 * M)
    for line in t_lines[:2]:
        parts.append(f'<text x="{M}" y="{top}" font-family="{hf}" font-size="44" font-weight="800" fill="#{c["text"]}">{e(line)}</text>')
        top += 54

    sub = strip_dashes(getattr(doc, "subtitle", "") or getattr(doc, "summary", "") or "Comprehensive structural framework and layered security architecture.")
    sub_lines = _wrap_safe(sub, FONTS.body, False, 20, W - 2 * M)[:2]
    for line in sub_lines:
        parts.append(f'<text x="{M}" y="{top}" font-family="{bf}" font-size="20" fill="#{c["muted"]}">{e(line)}</text>')
        top += 28

    top += 30
    tier_w = W - 2 * M
    tier_gap = 36
    n_tiers = len(tiers)
    tier_h = max(130, min(175, int((900 - top) / max(1, n_tiers))))

    for idx, tier in enumerate(tiers):
        ty = top + idx * (tier_h + tier_gap)
        parts.append(f'<rect x="{M}" y="{ty}" width="{tier_w}" height="{tier_h}" rx="14" fill="#{c["card_bg"]}" stroke="#{c["border"]}" stroke-width="1.8"/>')
        parts.append(f'<rect x="{M}" y="{ty}" width="10" height="{tier_h}" rx="5" fill="#{c["accent"]}"/>')

        heading = strip_dashes(tier.get("heading") or f"Tier {idx+1}")
        tier_label = f"TIER 0{idx+1} · {heading.upper()}"
        parts.append(f'<text x="{M + 32}" y="{ty + 34}" font-family="{hf}" font-size="19" font-weight="700" fill="#{c["accent"]}" letter-spacing="1">{e(tier_label)}</text>')

        bullets = [strip_dashes(b) for b in (tier.get("bullets") or []) if b][:3]
        if not bullets and tier.get("body"):
            bullets = _short_lines(strip_dashes(tier["body"]), 3, 10)
        if not bullets:
            bullets = ["System baseline established", "Continuous verification cycle", "Automated orchestration policy"]

        sub_n = len(bullets)
        sub_gap = 18
        sub_w = (tier_w - 64 - sub_gap * (sub_n - 1)) / max(1, sub_n)
        sub_top = ty + 50
        sub_h = tier_h - 66

        for s_i, bullet in enumerate(bullets):
            bx = M + 32 + s_i * (sub_w + sub_gap)
            parts.append(f'<rect x="{bx}" y="{sub_top}" width="{sub_w}" height="{sub_h}" rx="8" fill="#{c["bg"]}" stroke="#{c["border"]}" stroke-width="1"/>')
            b_lines = _wrap_safe(bullet, FONTS.body, False, 14, sub_w - 24)[:2]
            line_y = sub_top + (sub_h - (len(b_lines) * 18)) / 2 + 13
            for bln in b_lines:
                parts.append(f'<text x="{bx + 14}" y="{line_y}" font-family="{bf}" font-size="14" fill="#{c["text"]}">{e(bln)}</text>')
                line_y += 18

        if idx < n_tiers - 1:
            arrow_x = W / 2
            arrow_y1 = ty + tier_h + 3
            arrow_y2 = arrow_y1 + tier_gap - 6
            parts.append(f'<line x1="{arrow_x}" y1="{arrow_y1}" x2="{arrow_x}" y2="{arrow_y2}" stroke="#{c["accent"]}" stroke-width="2" marker-end="url(#arrow-down)"/>')

    bot_y = top + n_tiers * (tier_h + tier_gap) + 10
    conclusion = strip_dashes(getattr(doc, "conclusion", "") or (doc.recommendations[0] if getattr(doc, "recommendations", None) else "End-to-end resilience achieved through continuous telemetry and defense-in-depth orchestration."))
    parts.append(f'<rect x="{M}" y="{bot_y}" width="{tier_w}" height="84" rx="12" fill="#{c["accent"]}" fill-opacity="0.1" stroke="#{c["accent"]}" stroke-width="1.5"/>')
    parts.append(f'<text x="{M + 24}" y="{bot_y + 28}" font-family="{hf}" font-size="13" font-weight="700" letter-spacing="2" fill="#{c["gold"]}">{e("STRATEGIC ARCHITECTURAL IMPERATIVE")}</text>')
    conc_lines = _wrap_safe(conclusion, FONTS.body, False, 16, tier_w - 48)[:2]
    for i, cln in enumerate(conc_lines):
        parts.append(f'<text x="{M + 24}" y="{bot_y + 52 + i * 20}" font-family="{bf}" font-size="16" fill="#{c["text"]}">{e(cln)}</text>')

    H = int(bot_y + 84 + 60)
    parts.append(f'<text x="{W - M}" y="{H - 24}" text-anchor="end" font-family="{bf}" font-size="14" fill="#{c["muted"]}">MCIT AI · Ministry of Communications and Information Technology</text>')

    svg = (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">'
        f'<rect width="{W}" height="{H}" fill="#{c["bg"]}"/>' + "".join(parts) + "</svg>"
    )
    return svg, H


def _compose_network_graph(doc, mode: str) -> Tuple[str, int]:
    c = _get_theme_colors(doc, mode)
    W, H = 1600, 1150
    M = 80
    hf = "Nohemi, 'Libre Franklin', 'Inter', sans-serif"
    bf = "'Libre Franklin', 'Inter', sans-serif"
    e = lambda s: html.escape(str(s))

    parts: List[str] = []
    top = 55
    parts.append(f'<rect x="{M}" y="{top}" width="260" height="34" rx="17" fill="#{c["accent"]}" fill-opacity="0.15" stroke="#{c["accent"]}" stroke-width="1.5"/>')
    parts.append(f'<text x="{M + 130}" y="{top + 22}" text-anchor="middle" font-family="{hf}" font-size="13" font-weight="700" letter-spacing="2" fill="#{c["accent"]}">{e("TOPOLOGY & THREAT MESH")}</text>')

    top += 55
    parts.append(f'<text x="{M}" y="{top}" font-family="{hf}" font-size="38" font-weight="800" fill="#{c["text"]}">{e(strip_dashes(doc.title).upper())}</text>')
    sub = strip_dashes(getattr(doc, "subtitle", "") or getattr(doc, "summary", "") or "Interconnected systems, attack surfaces, and threat vector telemetry.")
    parts.append(f'<text x="{M}" y="{top + 28}" font-family="{bf}" font-size="18" fill="#{c["muted"]}">{e(sub[:110])}</text>')

    cx, cy = W / 2, 600
    hub_r = 110

    norm = _normalize_sections(doc)
    items = []
    for s in norm[:6]:
        sub_text = (s["bullets"] or [s["body"]])[0] if (s["bullets"] or s["body"]) else "Active node"
        items.append({"title": strip_dashes(s["heading"]), "sub": strip_dashes(sub_text)[:45]})
    if not items:
        items = [
            {"title": "Cloud Core Fabric", "sub": "Multi-tenant orchestration layer"},
            {"title": "Identity & Access Mesh", "sub": "Zero-trust session attestation"},
            {"title": "Edge Compute & API", "sub": "Public-facing gateway endpoints"},
            {"title": "Telemetry & SIEM", "sub": "AI anomaly detection pipeline"},
            {"title": "Data Storage Enclaves", "sub": "Post-quantum encrypted volume"},
            {"title": "Supply Chain Rail", "sub": "Third-party vendor verification"},
        ]

    n_sat = len(items)
    rx, ry = 480, 260

    sat_coords = []
    for i, it in enumerate(items):
        angle = (2 * math.pi * i / n_sat) - (math.pi / 2)
        sx = cx + rx * math.cos(angle)
        sy = cy + ry * math.sin(angle)
        sat_coords.append((sx, sy, it))

    for sx, sy, _ in sat_coords:
        parts.append(f'<line x1="{cx}" y1="{cy}" x2="{sx}" y2="{sy}" stroke="#{c["accent"]}" stroke-width="2" stroke-opacity="0.5" stroke-dasharray="6 6"/>')

    for i in range(n_sat):
        sx1, sy1, _ = sat_coords[i]
        sx2, sy2, _ = sat_coords[(i + 1) % n_sat]
        parts.append(f'<line x1="{sx1}" y1="{sy1}" x2="{sx2}" y2="{sy2}" stroke="#{c["border"]}" stroke-width="1.2" stroke-opacity="0.6"/>')

    parts.append(f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" fill="none" stroke="#{c["border"]}" stroke-width="1" stroke-dasharray="4 8" stroke-opacity="0.4"/>')

    parts.append(f'<circle cx="{cx}" cy="{cy}" r="{hub_r}" fill="#{c["card_bg"]}" stroke="#{c["accent"]}" stroke-width="3"/>')
    parts.append(f'<circle cx="{cx}" cy="{cy}" r="{hub_r - 12}" fill="none" stroke="#{c["gold"]}" stroke-width="1.5" stroke-dasharray="4 4"/>')
    parts.append(f'<text x="{cx}" y="{cy - 16}" text-anchor="middle" font-family="{hf}" font-size="12" font-weight="700" letter-spacing="2" fill="#{c["gold"]}">CENTRAL HUB</text>')
    hub_title = strip_dashes(getattr(doc, "title", "SOVEREIGN SYSTEM"))[:26]
    parts.append(f'<text x="{cx}" y="{cy + 10}" text-anchor="middle" font-family="{hf}" font-size="17" font-weight="700" fill="#{c["text"]}">{e(hub_title)}</text>')
    parts.append(f'<text x="{cx}" y="{cy + 28}" text-anchor="middle" font-family="{bf}" font-size="12" fill="#{c["muted"]}">Orchestration Fabric</text>')

    sw, sh = 220, 84
    for sx, sy, it in sat_coords:
        bx = sx - sw / 2
        by = sy - sh / 2
        parts.append(f'<rect x="{bx}" y="{by}" width="{sw}" height="{sh}" rx="10" fill="#{c["card_bg"]}" stroke="#{c["border"]}" stroke-width="1.8"/>')
        parts.append(f'<circle cx="{bx + 20}" cy="{by + 24}" r="6" fill="#{c["accent"]}"/>')
        parts.append(f'<text x="{bx + 34}" y="{by + 28}" font-family="{hf}" font-size="14" font-weight="700" fill="#{c["text"]}">{e(it["title"][:22])}</text>')
        parts.append(f'<text x="{bx + 16}" y="{by + 54}" font-family="{bf}" font-size="12" fill="#{c["muted"]}">{e(it["sub"][:28])}</text>')

    stats = getattr(doc, "stats", []) or []
    if stats:
        st = stats[0]
        st_val = getattr(st, "value", None) or (st.get("value") if isinstance(st, dict) else "")
        st_lbl = getattr(st, "label", None) or (st.get("label") if isinstance(st, dict) else "")
        parts.append(f'<rect x="{M}" y="{H - 140}" width="240" height="74" rx="10" fill="#{c["card_bg"]}" stroke="#{c["border"]}" stroke-width="1.5"/>')
        parts.append(f'<text x="{M + 20}" y="{H - 104}" font-family="{hf}" font-size="28" font-weight="800" fill="#{c["accent"]}">{e(st_val)}</text>')
        parts.append(f'<text x="{M + 20}" y="{H - 84}" font-family="{bf}" font-size="12" fill="#{c["muted"]}">{e(str(st_lbl)[:26])}</text>')

    parts.append(f'<text x="{W - M}" y="{H - 30}" text-anchor="end" font-family="{bf}" font-size="14" fill="#{c["muted"]}">MCIT AI · Ministry of Communications and Information Technology</text>')

    svg = (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">'
        f'<rect width="{W}" height="{H}" fill="#{c["bg"]}"/>' + "".join(parts) + "</svg>"
    )
    return svg, H


def _compose_quadrant_matrix(doc, mode: str) -> Tuple[str, int]:
    c = _get_theme_colors(doc, mode)
    W, H = 1600, 1200
    M = 80
    hf = "Nohemi, 'Libre Franklin', 'Inter', sans-serif"
    bf = "'Libre Franklin', 'Inter', sans-serif"
    e = lambda s: html.escape(str(s))

    parts: List[str] = []
    top = 55
    parts.append(f'<rect x="{M}" y="{top}" width="260" height="34" rx="17" fill="#{c["accent"]}" fill-opacity="0.15" stroke="#{c["accent"]}" stroke-width="1.5"/>')
    parts.append(f'<text x="{M + 130}" y="{top + 22}" text-anchor="middle" font-family="{hf}" font-size="13" font-weight="700" letter-spacing="2" fill="#{c["accent"]}">STRATEGIC DECISION MATRIX</text>')

    top += 55
    parts.append(f'<text x="{M}" y="{top}" font-family="{hf}" font-size="38" font-weight="800" fill="#{c["text"]}">{e(strip_dashes(doc.title).upper())}</text>')
    sub = strip_dashes(getattr(doc, "subtitle", "") or getattr(doc, "summary", "") or "Priority prioritization across systemic impact and execution urgency.")
    parts.append(f'<text x="{M}" y="{top + 28}" font-family="{bf}" font-size="18" fill="#{c["muted"]}">{e(sub[:120])}</text>')

    grid_top = top + 70
    grid_w = W - 2 * M
    grid_h = 780
    qw = (grid_w - 30) / 2
    qh = (grid_h - 30) / 2

    norm = _normalize_sections(doc)
    bullets_pool = list(getattr(doc, "recommendations", []) or []) + [strip_dashes(b) for s in norm for b in s["bullets"]]
    while len(bullets_pool) < 12:
        bullets_pool.append("Continuous capability enhancement and operational tracking")

    quads = [
        {"name": "STRATEGIC FOUNDATIONS", "sub": "High Systemic Impact · Structural Horizon", "bullets": bullets_pool[3:6], "x": M, "y": grid_top, "accent": c["border"]},
        {"name": "CRITICAL TRANSFORMATION", "sub": "High Systemic Impact · Immediate Execution", "bullets": bullets_pool[0:3], "x": M + qw + 30, "y": grid_top, "accent": c["accent"]},
        {"name": "BASELINE MAINTENANCE", "sub": "Moderate Impact · Structural Horizon", "bullets": bullets_pool[9:12], "x": M, "y": grid_top + qh + 30, "accent": c["border"]},
        {"name": "OPERATIONAL QUICK WINS", "sub": "Moderate Impact · Immediate Execution", "bullets": bullets_pool[6:9], "x": M + qw + 30, "y": grid_top + qh + 30, "accent": c["gold"]},
    ]

    for q in quads:
        qx, qy = q["x"], q["y"]
        parts.append(f'<rect x="{qx}" y="{qy}" width="{qw}" height="{qh}" rx="14" fill="#{c["card_bg"]}" stroke="#{q["accent"]}" stroke-width="2"/>')
        parts.append(f'<text x="{qx + 30}" y="{qy + 42}" font-family="{hf}" font-size="20" font-weight="700" fill="#{q["accent"]}">{e(q["name"])}</text>')
        parts.append(f'<text x="{qx + 30}" y="{qy + 66}" font-family="{bf}" font-size="14" fill="#{c["muted"]}">{e(q["sub"])}</text>')

        by = qy + 104
        for b in q["bullets"]:
            parts.append(f'<circle cx="{qx + 34}" cy="{by - 4}" r="4" fill="#{q["accent"]}"/>')
            b_lines = _wrap_safe(b, FONTS.body, False, 15, qw - 70)[:2]
            for bln in b_lines:
                parts.append(f'<text x="{qx + 50}" y="{by}" font-family="{bf}" font-size="15" fill="#{c["text"]}">{e(bln)}</text>')
                by += 22
            by += 10

    mid_x = M + qw + 15
    mid_y = grid_top + qh + 15
    parts.append(f'<line x1="{M}" y1="{mid_y}" x2="{M + grid_w}" y2="{mid_y}" stroke="#{c["border"]}" stroke-width="1.5" stroke-dasharray="6 6"/>')
    parts.append(f'<line x1="{mid_x}" y1="{grid_top}" x2="{mid_x}" y2="{grid_top + grid_h}" stroke="#{c["border"]}" stroke-width="1.5" stroke-dasharray="6 6"/>')

    parts.append(f'<text x="{W - M}" y="{H - 30}" text-anchor="end" font-family="{bf}" font-size="14" fill="#{c["muted"]}">MCIT AI · Ministry of Communications and Information Technology</text>')

    svg = (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">'
        f'<rect width="{W}" height="{H}" fill="#{c["bg"]}"/>' + "".join(parts) + "</svg>"
    )
    return svg, H


def _compose_flywheel(doc, mode: str) -> Tuple[str, int]:
    c = _get_theme_colors(doc, mode)
    W, H = 1600, 1250
    M = 80
    hf = "Nohemi, 'Libre Franklin', 'Inter', sans-serif"
    bf = "'Libre Franklin', 'Inter', sans-serif"
    e = lambda s: html.escape(str(s))

    parts: List[str] = []
    top = 55
    parts.append(f'<rect x="{M}" y="{top}" width="260" height="34" rx="17" fill="#{c["accent"]}" fill-opacity="0.15" stroke="#{c["accent"]}" stroke-width="1.5"/>')
    parts.append(f'<text x="{M + 130}" y="{top + 22}" text-anchor="middle" font-family="{hf}" font-size="13" font-weight="700" letter-spacing="2" fill="#{c["accent"]}">CONTINUOUS FLYWHEEL</text>')

    top += 55
    parts.append(f'<text x="{M}" y="{top}" font-family="{hf}" font-size="38" font-weight="800" fill="#{c["text"]}">{e(strip_dashes(doc.title).upper())}</text>')
    sub = strip_dashes(getattr(doc, "subtitle", "") or getattr(doc, "summary", "") or "Closed-loop feedback architecture and institutional momentum.")
    parts.append(f'<text x="{M}" y="{top + 28}" font-family="{bf}" font-size="18" fill="#{c["muted"]}">{e(sub[:120])}</text>')

    cx, cy = W / 2, 650
    hub_r = 120
    orbit_r = 380

    phases = [
        {"title": "1. Telemetry & Baseline", "sub": "Real-time observability across all assets"},
        {"title": "2. Risk Prioritization", "sub": "AI-ranked attack surface scoring"},
        {"title": "3. Automated Containment", "sub": "Micro-segmentation and token revocation"},
        {"title": "4. Resilient Recovery", "sub": "Zero-data-loss failover orchestration"},
        {"title": "5. Policy Refinement", "sub": "Institutional learning & model tuning"},
    ]
    norm = _normalize_sections(doc)
    if len(norm) >= 4:
        phases = []
        for i, s in enumerate(norm[:5]):
            sub_text = (s["bullets"] or [s["body"]])[0] if (s["bullets"] or s["body"]) else "Strategic phase"
            phases.append({"title": f"{i+1}. {strip_dashes(s['heading'])}", "sub": strip_dashes(sub_text)[:45]})

    n = len(phases)
    parts.append(f'<circle cx="{cx}" cy="{cy}" r="{orbit_r}" fill="none" stroke="#{c["accent"]}" stroke-width="2.5" stroke-dasharray="14 10" stroke-opacity="0.4"/>')

    parts.append(f'<circle cx="{cx}" cy="{cy}" r="{hub_r}" fill="#{c["card_bg"]}" stroke="#{c["accent"]}" stroke-width="3"/>')
    parts.append(f'<text x="{cx}" y="{cy - 12}" text-anchor="middle" font-family="{hf}" font-size="13" font-weight="700" letter-spacing="2" fill="#{c["gold"]}">MOMENTUM CORE</text>')
    parts.append(f'<text x="{cx}" y="{cy + 14}" text-anchor="middle" font-family="{hf}" font-size="18" font-weight="700" fill="#{c["text"]}">FLYWHEEL</text>')

    node_w, node_h = 240, 90
    for i, p in enumerate(phases):
        angle = (2 * math.pi * i / n) - (math.pi / 2)
        nx = cx + orbit_r * math.cos(angle)
        ny = cy + orbit_r * math.sin(angle)
        bx, by = nx - node_w / 2, ny - node_h / 2
        parts.append(f'<rect x="{bx}" y="{by}" width="{node_w}" height="{node_h}" rx="12" fill="#{c["card_bg"]}" stroke="#{c["border"]}" stroke-width="2"/>')
        parts.append(f'<text x="{bx + 18}" y="{by + 32}" font-family="{hf}" font-size="16" font-weight="700" fill="#{c["accent"]}">{e(p["title"][:24])}</text>')
        p_lines = _wrap_safe(p["sub"], FONTS.body, False, 13, node_w - 36)[:2]
        for idx, pln in enumerate(p_lines):
            parts.append(f'<text x="{bx + 18}" y="{by + 54 + idx * 16}" font-family="{bf}" font-size="13" fill="#{c["muted"]}">{e(pln)}</text>')

    parts.append(f'<text x="{W - M}" y="{H - 30}" text-anchor="end" font-family="{bf}" font-size="14" fill="#{c["muted"]}">MCIT AI · Ministry of Communications and Information Technology</text>')

    svg = (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">'
        f'<rect width="{W}" height="{H}" fill="#{c["bg"]}"/>' + "".join(parts) + "</svg>"
    )
    return svg, H


def _compose_blueprint(doc, mode: str) -> Tuple[str, int]:
    from open_notebook.craft.studio.blueprint import (
        BlueprintEdge,
        BlueprintNode,
        parse_blueprint_spec,
        render_blueprint_svg,
    )

    raw_bp = (
        getattr(doc, "blueprint", None)
        or (getattr(doc.options, "blueprint", None) if getattr(doc, "options", None) else None)
        or (getattr(doc.options, "instructions", None) if getattr(doc, "options", None) else None)
        or (getattr(doc, "custom_svg", None) if getattr(doc, "custom_svg", None) else None)
        or ""
    )
    title = strip_dashes(getattr(doc, "title", "System Topology Architecture"))
    spec = parse_blueprint_spec(raw_bp, default_title=title)

    # Detect if handwritten / sketch style is requested
    inst = (getattr(doc.options, "instructions", "") if getattr(doc, "options", None) else "") or ""
    design = (getattr(doc.options, "design_style", "") if getattr(doc, "options", None) else "") or ""
    override = str(spec.metadata.get("style_override") or spec.metadata.get("style") or "").lower()
    combined_hints = (inst + " " + design + " " + override).lower()
    if any(
        k in combined_hints
        for k in ("handwritten", "sketch", "hand_drawn", "hand written", "whiteboard", "chalkboard", "doodle", "rough")
    ):
        spec.metadata["style_override"] = "handwritten_sketch"

    if not spec.nodes:
        norm = _normalize_sections(doc)
        spec.title = title
        spec.subtitle = strip_dashes(
            getattr(doc, "subtitle", "")
            or getattr(doc, "summary", "")
            or "Synthesized system topology mesh"
        )
        spec.nodes.append(
            BlueprintNode(
                id="CORE_HUB",
                label=title[:24],
                role="Core",
                color="#00F0FF",
                description="Central sovereign orchestration core",
                weight=1.5,
            )
        )
        for idx, s in enumerate(norm[:7]):
            nid = f"N{idx+1}"
            role = "AI" if idx == 0 else ("Security" if idx == 1 else ("Data" if idx == 2 else "Node"))
            spec.nodes.append(
                BlueprintNode(
                    id=nid,
                    label=strip_dashes(s["heading"])[:24],
                    role=role,
                    description=(s["bullets"][0] if s["bullets"] else s["body"])[:32] if (s["bullets"] or s["body"]) else "",
                    weight=1.0,
                )
            )
            spec.edges.append(
                BlueprintEdge(
                    source=nid,
                    target="CORE_HUB",
                    weight=0.7,
                    style="directional_flow",
                )
            )
            if idx > 0:
                prev_id = f"N{idx}"
                spec.edges.append(
                    BlueprintEdge(
                        source=prev_id,
                        target=nid,
                        weight=0.4,
                        style="directional_flow",
                    )
                )

    return render_blueprint_svg(spec, mode)


def _compose_custom_svg(doc, mode: str) -> Tuple[str, int]:
    custom = (
        getattr(doc, "custom_svg", "")
        or (getattr(doc.options, "custom_svg", "") if getattr(doc, "options", None) else "")
        or ""
    ).strip()
    # Check if custom is JSON blueprint topology
    if ("nodes" in custom and "edges" in custom) or custom.startswith("{") or "force_directed_spring" in custom:
        return _compose_blueprint(doc, mode)
    if not custom.startswith("<svg"):
        c = _get_theme_colors(doc, mode)
        custom = (
            f'<svg xmlns="http://www.w3.org/2000/svg" width="{CANVAS_W}" height="1000" viewBox="0 0 {CANVAS_W} 1000">'
            f'<rect width="{CANVAS_W}" height="1000" fill="#{c["bg"]}"/>'
            f'{custom}'
            f'</svg>'
        )
    h_match = re.search(r'height="(\d+)"', custom)
    H = int(h_match.group(1)) if h_match else 1000
    return custom, H


async def render(doc, mode: str, direction: Direction, progress) -> Rendered:
    work = job_dir()
    dtype = _detect_diagram_type(doc, direction)

    if dtype in ("architecture", "network", "quadrant", "cycle", "custom_svg", "blueprint"):
        await progress(f"VectorCraft: generating dynamic programmatic vector infographic ({dtype}, {mode})")
        if dtype == "blueprint":
            svg, _ = _compose_blueprint(doc, mode)
        elif dtype == "architecture":
            svg, _ = _compose_architecture(doc, mode)
        elif dtype == "network":
            if getattr(doc, "blueprint", None) or (getattr(doc.options, "blueprint", None) if getattr(doc, "options", None) else None):
                svg, _ = _compose_blueprint(doc, mode)
            else:
                svg, _ = _compose_network_graph(doc, mode)
        elif dtype == "quadrant":
            svg, _ = _compose_quadrant_matrix(doc, mode)
        elif dtype == "cycle":
            svg, _ = _compose_flywheel(doc, mode)
        else:
            svg, _ = _compose_custom_svg(doc, mode)

        src = work / f"{dtype}-1.svg"
        src.write_text(svg, "utf-8")
        png, pdf = work / f"{dtype}-1.png", work / f"{dtype}-1.pdf"
        await run_cli("vectorcraft", ["convert", str(src), str(png), "--scale", "1"], cwd=work)
        await run_cli("vectorcraft", ["convert", str(src), str(pdf)], cwd=work)
        return Rendered(
            files={"png": png.read_bytes(), "pdf": pdf.read_bytes(), "svg": svg.encode("utf-8")},
            passes=1,
            issues=[],
        )

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

