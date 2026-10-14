"""Report: the Noir report as a print PDF (ReportLab + PdfCraft) and an
editable Word document, from the same content. The Word file is a filled copy
of the approved Word master (kit: templates/word/), checked with WordCraft.

Structure (kit: templates/TEMPLATES.md): cover with hero art, contents, at a
glance, chapters with figures, findings and recommendations, back cover with
end art. Short, Medium and Long differ in real depth: number of chapters,
sub-sections, figures and tables, not in padding.
"""

from __future__ import annotations

import html
import re
from dataclasses import dataclass, field, replace
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

from open_notebook.craft.audit import (
    Issue,
    audit_loop,
    blank_render,
    copy_issues,
    strip_dashes,
)
from open_notebook.craft.kit.assets import END, HERO, LOGO, font_path, head_family
from open_notebook.craft.kit.tokens import Theme, theme
from open_notebook.craft.runner import run_cli
from open_notebook.craft.studio import Rendered, job_dir
from open_notebook.craft.studio.direction import Direction
from open_notebook.craft.studio.word_template import build_report_docx


@dataclass(frozen=True)
class Depth:
    chapters: int
    figures: int
    subsections: bool
    pages: Tuple[int, int]  # expected page band (inclusive)


DEPTH: Dict[str, Depth] = {
    "short": Depth(3, 1, False, (6, 10)),
    "medium": Depth(5, 3, False, (9, 16)),
    "long": Depth(8, 6, True, (15, 30)),
}


# ------------------------------------------------------------------- figures


def _numeric(v: Any) -> Optional[float]:
    if isinstance(v, (int, float)):
        return float(v)
    m = re.fullmatch(r"\s*[-+]?[\d,]*\.?\d+\s*%?\s*", str(v or ""))
    if not m:
        return None
    try:
        return float(str(v).replace(",", "").replace("%", "").strip())
    except ValueError:
        return None


def figure_series(doc) -> List[Tuple[str, List[str], List[float], str]]:
    """(title, labels, values, unit) series that carry real numbers."""
    out: List[Tuple[str, List[str], List[float], str]] = []
    tables = list(doc.tables) + [s.table for s in doc.sections if s.table]
    for t in tables:
        if not t.columns or len(t.rows) < 2:
            continue
        for ci in range(1, len(t.columns)):
            labels, values = [], []
            for r in t.rows[:12]:
                if ci < len(r):
                    v = _numeric(r[ci])
                    if v is not None:
                        labels.append(str(r[0])[:24])
                        values.append(v)
            if len(values) >= 2:
                out.append((f"{t.name}: {t.columns[ci]}", labels, values, ""))
    # Key stats are not charted together: they rarely share a unit, and a mixed-unit chart misleads.
    return out


def render_figure(series: Tuple[str, List[str], List[float], str], t: Theme, path: Path, width_in: float) -> Path:
    import matplotlib

    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    from matplotlib import font_manager

    body = font_path("Libre Franklin", "Regular")
    if body:
        font_manager.fontManager.addfont(str(body))
    title, labels, values, _ = series
    fig, ax = plt.subplots(figsize=(width_in, width_in * 0.46), dpi=220)
    bg = "#" + t.bg
    fig.patch.set_facecolor(bg)
    ax.set_facecolor(bg)
    colors = ["#" + t.accent] + ["#" + t.series[1]] * (len(values) - 1) if len(values) > 1 else ["#" + t.accent]
    horizontal = max(len(x) for x in labels) > 10 or len(labels) > 6
    if horizontal:
        ax.barh(labels[::-1], values[::-1], color=colors[::-1], height=0.62)
        for i, v in enumerate(values[::-1]):
            ax.text(v, i, f"  {v:,.0f}" if v >= 10 else f"  {v:,.2f}", va="center", color="#" + t.text, fontsize=8, family="Libre Franklin")
        ax.xaxis.set_visible(False)
    else:
        ax.bar(labels, values, color=colors, width=0.6)
        for i, v in enumerate(values):
            ax.text(i, v, f"{v:,.0f}" if v >= 10 else f"{v:,.2f}", ha="center", va="bottom", color="#" + t.text, fontsize=8, family="Libre Franklin")
        ax.yaxis.set_visible(False)
    for side in ("top", "right", "left"):
        ax.spines[side].set_visible(False)
    ax.spines["bottom"].set_color("#" + t.border)
    ax.tick_params(colors="#" + t.muted, labelsize=8, length=0)
    for lbl in ax.get_xticklabels() + ax.get_yticklabels():
        lbl.set_fontfamily("Libre Franklin")
    fig.tight_layout()
    fig.savefig(path, facecolor=bg)
    plt.close(fig)
    return path


# --------------------------------------------------------------------- plan


@dataclass
class ReportPlan:
    title: str
    subtitle: str
    summary: str
    stats: List[Tuple[str, str]]
    chapters: List[Dict[str, Any]]  # {heading, body, bullets, table, figure}
    findings: List[str]
    recommendations: List[str]
    conclusion: str
    mode: str
    length: str
    body_size: float = 10.5
    figure_width: float = 6.3
    issues_seen: List[str] = field(default_factory=list)


_LIST_ITEM = re.compile(r"^\s*(?:[*\-\u2022\u25aa]|\d+[.)])\s+(.*)$")
_INLINE_ITEMS = re.compile(r"\s[*\u2022]\s+(?=[A-Z0-9\"'(])")
_LABEL = re.compile(r"^\s*\"?(?:bullets?|key points?|key achievements?)\"?\s*[:\-]\s*", re.I)


def body_blocks(text: str) -> List[Tuple[str, str]]:
    """Model prose as ("h" | "p" | "li", text) blocks.

    Local models mix Markdown into chapter text: a ``###`` heading followed by
    its paragraph on the next line, ``*`` list lines, list items run together
    inside one paragraph, ``**bold**`` markers and JSON-ish labels. Both the PDF
    and the Word file lay the chapter out from these blocks so neither shows
    raw markup or a whole paragraph styled as a heading."""
    clean = re.sub(r"\*\*|__", "", text or "")
    blocks: List[Tuple[str, str]] = []
    para: List[str] = []

    def flush() -> None:
        if not para:
            return
        raw = " ".join(para)
        labelled = bool(_LABEL.match(raw))  # "Bullets: a * b": every part is an item
        joined = _LABEL.sub("", raw).strip()
        para.clear()
        parts = _INLINE_ITEMS.split(" " + joined)
        head = parts[0].strip()
        if head:
            blocks.append(("li" if labelled else "p", head))
        blocks.extend(("li", x.strip()) for x in parts[1:] if x.strip())

    for raw in clean.splitlines():
        line = raw.strip()
        if not line:
            flush()
            continue
        h = re.match(r"^#{1,6}\s+(.*)$", line)
        if h:
            flush()
            title = h.group(1).strip().rstrip(":")
            blocks.append(("h", title) if len(title) <= 110 else ("p", title))
            continue
        m = _LIST_ITEM.match(line)
        if m:
            flush()
            item = _LABEL.sub("", m.group(1)).strip()
            if item:
                blocks.append(("li", item))
            continue
        para.append(line)
    flush()
    return blocks


def build_plan(doc, mode: str, length: str, direction: Direction, work: Path) -> ReportPlan:
    t = theme(mode)
    depth = DEPTH.get(length, DEPTH["medium"])
    series = figure_series(doc)
    if direction.data_first:
        series = series[: depth.figures + 1]
    chapters: List[Dict[str, Any]] = []
    for i, sec in enumerate(doc.sections[: depth.chapters]):
        chapters.append(
            {
                "heading": strip_dashes(sec.heading),
                "body": strip_dashes(sec.body),
                "bullets": [strip_dashes(b) for b in sec.bullets],
                "table": sec.table.model_dump() if sec.table else None,
                "figure": None,
                "image": sec.image_path or "",
                "image_caption": sec.image_caption,
            }
        )
    # place figures in order, one per chapter, up to the depth's budget
    for n, s in enumerate(series[: depth.figures]):
        if not chapters:
            break
        ch = chapters[min(n * max(1, len(chapters) // max(1, depth.figures)), len(chapters) - 1)]
        if ch["figure"]:
            ch = next((c for c in chapters if not c["figure"]), ch)
        path = render_figure(s, t, work / f"figure-{n + 1}.png", 6.3)
        ch["figure"] = {"path": str(path), "caption": f"Figure {n + 1}. {strip_dashes(s[0])}"}
    findings = [strip_dashes(k) for k in doc.key_points[: 6 if length != "short" else 4]]
    return ReportPlan(
        title=strip_dashes(doc.title),
        subtitle=strip_dashes(doc.subtitle),
        summary=strip_dashes(doc.summary),
        stats=[(s.value, strip_dashes(s.label)) for s in doc.stats[:6]],
        chapters=chapters,
        findings=findings,
        recommendations=[strip_dashes(r) for r in doc.recommendations],
        conclusion=strip_dashes(doc.conclusion),
        mode=mode,
        length=length,
        body_size=10.5 if direction.density != "airy" else 11.5,
    )


# ---------------------------------------------------------------------- PDF


def _register_fonts() -> Tuple[str, str, str]:
    from reportlab.pdfbase import pdfmetrics
    from reportlab.pdfbase.ttfonts import TTFont

    names = {}
    for fam, style, key in (
        (head_family(), "Bold", "Head"),
        ("Libre Franklin", "Regular", "Body"),
        ("Libre Franklin", "SemiBold", "BodySemi"),
        ("Inter", "Regular", "Cover"),
    ):
        p = font_path(fam, style)
        if p:
            try:
                pdfmetrics.registerFont(TTFont(f"MCIT-{key}", str(p)))
                names[key] = f"MCIT-{key}"
            except Exception:
                pass
    return names.get("Head", "Helvetica-Bold"), names.get("Body", "Helvetica"), names.get("BodySemi", "Helvetica-Bold")


def build_pdf(plan: ReportPlan, out: Path) -> int:
    from reportlab.lib import colors
    from reportlab.lib.enums import TA_CENTER
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import ParagraphStyle
    from reportlab.lib.units import mm
    from reportlab.platypus import (
        BaseDocTemplate,
        Frame,
        Image,
        KeepTogether,
        NextPageTemplate,
        PageBreak,
        PageTemplate,
        Paragraph,
        Spacer,
        Table,
        TableStyle,
    )
    from reportlab.platypus.tableofcontents import TableOfContents

    t = theme(plan.mode)
    head, body, semi = _register_fonts()
    C = lambda h: colors.HexColor("#" + h)  # noqa: E731
    PW, PH = A4
    margin = 22 * mm

    st = {
        "h1": ParagraphStyle("h1", fontName=head, fontSize=24, leading=29, textColor=C(t.text), spaceAfter=4),
        "h2": ParagraphStyle("h2", fontName=semi, fontSize=14, leading=18, textColor=C(t.text), spaceBefore=10, spaceAfter=4),
        "eyebrow": ParagraphStyle("eb", fontName=semi, fontSize=8.5, leading=11, textColor=C(t.accent)),
        "body": ParagraphStyle("body", fontName=body, fontSize=plan.body_size, leading=plan.body_size * 1.55, textColor=C(t.text), spaceAfter=7),
        "bullet": ParagraphStyle("bul", fontName=body, fontSize=plan.body_size, leading=plan.body_size * 1.5, textColor=C(t.text), leftIndent=12, bulletIndent=0, spaceAfter=4),
        "caption": ParagraphStyle("cap", fontName=body, fontSize=8.5, leading=11, textColor=C(t.muted), spaceBefore=4, spaceAfter=10),
        "stat": ParagraphStyle("stat", fontName=head, fontSize=24, leading=28, textColor=C(t.accent)),
        "statlab": ParagraphStyle("statl", fontName=body, fontSize=9, leading=12, textColor=C(t.muted)),
        "toc1": ParagraphStyle("toc1", fontName=body, fontSize=11, leading=22, textColor=C(t.text)),
        "cell": ParagraphStyle("cell", fontName=body, fontSize=8.5, leading=11, textColor=C(t.text)),
        "cellh": ParagraphStyle("cellh", fontName=semi, fontSize=8.5, leading=11, textColor=C(t.on_accent)),
        "thanks": ParagraphStyle("th", fontName=head, fontSize=34, leading=40, textColor=colors.white, alignment=TA_CENTER),
        "gold": ParagraphStyle("gold", fontName=body, fontSize=11, leading=15, textColor=C("F7EF8A"), alignment=TA_CENTER),
    }
    esc = lambda s: html.escape(str(s or ""))  # noqa: E731

    class Doc(BaseDocTemplate):
        def afterFlowable(self, f):
            if isinstance(f, Paragraph) and f.style.name == "h1":
                self.notify("TOCEntry", (0, f.getPlainText(), self.page))

    def paint_bg(c, color):
        c.setFillColor(C(color))
        c.rect(0, 0, PW, PH, stroke=0, fill=1)

    def on_cover(c, d):
        c.saveState()
        paint_bg(c, "010612")
        art_h = 335
        if HERO.exists():
            c.drawImage(_cover_jpeg(HERO, out.parent), 0, PH - art_h, PW, art_h, preserveAspectRatio=False)
        if LOGO.exists():
            c.setFillColor(colors.white)
            c.roundRect(margin, PH - 30 - 40, 74, 40, 6, stroke=0, fill=1)
            c.drawImage(str(LOGO), margin + 6, PH - 30 - 36, 62, 32, preserveAspectRatio=True, mask="auto")
        c.setFillColor(C("B9C2CE"))
        c.setFont(body, 9)
        c.drawString(margin, PH - art_h - 48, "MINISTRY OF COMMUNICATIONS AND INFORMATION TECHNOLOGY")
        c.restoreState()

    def on_content(c, d):
        c.saveState()
        paint_bg(c, t.bg)
        c.setFont(body, 8)
        c.setFillColor(C(t.muted))
        c.drawString(margin, PH - 14 * mm, plan.title[:90])
        c.drawRightString(PW - margin, 12 * mm, str(d.page))
        c.setStrokeColor(C(t.border))
        c.setLineWidth(0.5)
        c.line(margin, PH - 16 * mm, PW - margin, PH - 16 * mm)
        c.restoreState()

    def on_back(c, d):
        c.saveState()
        paint_bg(c, "010612")
        if END.exists():
            c.drawImage(_cover_jpeg(END, out.parent), 0, PH - 335, PW, 335, preserveAspectRatio=False)
        c.restoreState()

    doc = Doc(str(out), pagesize=A4, title=plan.title, author="MCIT AI", leftMargin=margin, rightMargin=margin, topMargin=margin, bottomMargin=margin)
    content_frame = Frame(margin, 20 * mm, PW - 2 * margin, PH - 20 * mm - 22 * mm, id="c")
    cover_frame = Frame(margin, 40 * mm, PW - 2 * margin, PH - 335 - 70 - 40 * mm, id="cv")
    back_frame = Frame(margin, 30 * mm, PW - 2 * margin, PH - 335 - 30 * mm - 40, id="bk")
    doc.addPageTemplates(
        [
            PageTemplate("cover", [cover_frame], onPage=on_cover),
            PageTemplate("content", [content_frame], onPage=on_content),
            PageTemplate("back", [back_frame], onPage=on_back),
        ]
    )

    cover_title = ParagraphStyle("ct", fontName=head, fontSize=34, leading=40, textColor=colors.white)
    cover_sub = ParagraphStyle("cs", fontName=body, fontSize=13, leading=18, textColor=C("B9C2CE"), spaceBefore=10)
    accent_rule = Table([[""]], colWidths=[48], rowHeights=[3], hAlign="LEFT")
    accent_rule.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, -1), C(t.accent))]))

    story: List[Any] = [Paragraph(esc(plan.title), cover_title)]
    if plan.subtitle:
        story.append(Paragraph(esc(plan.subtitle), cover_sub))
    from datetime import datetime

    story += [Spacer(1, 16), Paragraph(datetime.now().strftime("%d %B %Y"), ParagraphStyle("d", parent=cover_sub, fontSize=10))]
    story += [NextPageTemplate("content"), PageBreak()]

    # contents
    toc = TableOfContents()
    toc.levelStyles = [st["toc1"]]
    toc.dotsMinLevel = 0
    story += [Paragraph("CONTENTS", st["eyebrow"]), Spacer(1, 6), Paragraph("Contents", ParagraphStyle("toch", parent=st["h1"])), accent_rule, Spacer(1, 14), toc, PageBreak()]

    # at a glance
    story += [Paragraph("AT A GLANCE", st["eyebrow"]), Paragraph("At a glance", st["h1"]), accent_rule, Spacer(1, 12)]
    if plan.summary:
        story.append(Paragraph(esc(plan.summary), st["body"]))
    if plan.stats:
        cells = [[Paragraph(esc(v), st["stat"]), Paragraph(esc(lab), st["statlab"])] for v, lab in plan.stats]
        rows = []
        for i in range(0, len(cells), 3):
            chunk = cells[i : i + 3]
            rows.append([[c[0], c[1]] for c in chunk] + [""] * (3 - len(chunk)))
        cw = (PW - 2 * margin) / 3
        grid = Table(rows, colWidths=[cw] * 3)
        grid.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, -1), C(t.surface)),
                    ("LINEBELOW", (0, 0), (-1, -1), 0.5, C(t.border)),
                    ("VALIGN", (0, 0), (-1, -1), "TOP"),
                    ("TOPPADDING", (0, 0), (-1, -1), 10),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
                    ("LEFTPADDING", (0, 0), (-1, -1), 10),
                ]
            )
        )
        story += [Spacer(1, 8), grid]

    # chapters
    for i, ch in enumerate(plan.chapters, start=1):
        story += [PageBreak(), Paragraph(f"CHAPTER {i:02d}", st["eyebrow"]), Paragraph(esc(ch["heading"]), st["h1"]), accent_rule, Spacer(1, 12)]
        for kind, text in body_blocks(ch["body"]):
            if kind == "h":
                story.append(Paragraph(esc(text), st["h2"]))
            elif kind == "li":
                story.append(Paragraph(esc(text), st["bullet"], bulletText="\u25aa"))
            else:
                story.append(Paragraph(esc(text), st["body"]))
        for b in ch["bullets"]:
            story.append(Paragraph(esc(b), st["bullet"], bulletText="\u25aa"))
        if ch.get("figure"):
            img = Image(ch["figure"]["path"], width=plan.figure_width * 72, height=plan.figure_width * 72 * 0.46)
            story.append(KeepTogether([Spacer(1, 8), img, Paragraph(esc(ch["figure"]["caption"]), st["caption"])]))
        if ch.get("image") and Path(ch["image"]).exists():
            try:
                img = Image(ch["image"], width=plan.figure_width * 72, height=plan.figure_width * 72 * 0.56, kind="proportional")
                story.append(KeepTogether([Spacer(1, 8), img, Paragraph(esc(ch.get("image_caption") or ""), st["caption"])]))
            except Exception:
                pass
        tb = ch.get("table")
        if tb and tb.get("columns"):
            data = [[Paragraph(esc(c), st["cellh"]) for c in tb["columns"]]]
            for r in tb.get("rows", [])[:18]:
                data.append([Paragraph(esc(x), st["cell"]) for x in (list(r) + [""] * len(tb["columns"]))[: len(tb["columns"])]])
            table = Table(data, repeatRows=1, colWidths=[(PW - 2 * margin) / len(tb["columns"])] * len(tb["columns"]))
            table.setStyle(
                TableStyle(
                    [
                        ("BACKGROUND", (0, 0), (-1, 0), C(t.accent)),
                        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [C(t.surface), C(t.bg)]),
                        ("LINEBELOW", (0, 0), (-1, -1), 0.4, C(t.border)),
                        ("VALIGN", (0, 0), (-1, -1), "TOP"),
                    ]
                )
            )
            story += [Spacer(1, 10), table, Paragraph(esc(tb.get("name") or ""), st["caption"])]

    # findings and recommendations
    story += [PageBreak(), Paragraph("FINDINGS", st["eyebrow"]), Paragraph("Findings and recommendations", st["h1"]), accent_rule, Spacer(1, 12)]
    if plan.findings:
        story.append(Paragraph("Key findings", st["h2"]))
        story += [Paragraph(esc(f), st["bullet"], bulletText="\u25aa") for f in plan.findings]
    if plan.recommendations:
        story.append(Paragraph("Recommendations", st["h2"]))
        story += [Paragraph(f"<b>{n:02d}</b>&nbsp;&nbsp;{esc(r)}", st["bullet"]) for n, r in enumerate(plan.recommendations, start=1)]
    if plan.conclusion:
        story += [Paragraph("Conclusion", st["h2"]), Paragraph(esc(plan.conclusion), st["body"])]

    # back cover
    story += [NextPageTemplate("back"), PageBreak(), Spacer(1, 60), Paragraph("Thank You", st["thanks"]), Spacer(1, 14), Paragraph("Ministry of Communications and Information Technology", st["gold"]), Paragraph("mcit.gov.eg", st["gold"])]
    doc.multiBuild(story)
    return doc.page


# --------------------------------------------------------------------- Word


def build_docx(plan: ReportPlan, work: Path) -> Path:
    """Editable Word report: a filled copy of the approved Noir Word master."""
    return build_report_docx(plan, work / "report.docx")


# -------------------------------------------------------------------- loop


def _cover_jpeg(src: Path, work: Path) -> str:
    """Full-resolution JPEG of the constant cover for the PDF (same art, a tenth of the size)."""
    from PIL import Image as PILImage

    out = work / f"{src.stem}-print.jpg"
    if not out.exists():
        with PILImage.open(src) as im:
            im.convert("RGB").save(out, "JPEG", quality=92, optimize=True)
    return str(out)


async def render(doc, mode: str, length: str, direction: Direction, progress, rewrite=None) -> Rendered:
    """``rewrite(heading, body, min_words)`` lets the audit loop send a thin
    chapter back to Tut Agent for a deeper draft."""
    work = job_dir()
    plan = build_plan(doc, mode, length, direction, work)
    depth = DEPTH.get(length, DEPTH["medium"])
    await progress(f"Template: Noir report ({mode}, {length}): {len(plan.chapters)} chapters, {sum(1 for c in plan.chapters if c['figure'])} figures")

    async def build(p: ReportPlan, n: int) -> Dict[str, bytes]:
        await progress(f"Laying out the PDF (pass {n})")
        pdf = work / f"report-{n}.pdf"
        build_pdf(p, pdf)
        await progress(f"Filling the Word template (pass {n})")
        docx = build_docx(p, work)
        final_pdf = work / f"report-final-{n}.pdf"
        await run_cli("pdfcraft", ["edit", str(pdf), "--out", str(final_pdf), "--title", p.title, "--author", "MCIT AI"], cwd=work)
        return {"pdf": final_pdf.read_bytes(), "docx": docx.read_bytes()}

    async def audit(p: ReportPlan, files: Dict[str, bytes], n: int) -> List[Issue]:
        import json as _json

        issues: List[Issue] = []
        pdf = work / f"report-final-{n}.pdf"
        info = _json.loads(await run_cli("pdfcraft", ["info", str(pdf)], cwd=work) or "{}")
        pages = int(info.get("pages") or info.get("page_count") or 0)
        lo, hi = depth.pages
        if pages and pages > hi + 4:
            issues.append(Issue("length", f"{pages} pages is longer than a {length} report"))
        if len(p.chapters) < min(depth.chapters, 2):
            issues.append(Issue("depth", f"Only {len(p.chapters)} chapter(s) for a {length} report"))
        series_n = sum(1 for c in p.chapters if c.get("figure"))
        renders = work / f"pages-{n}"
        renders.mkdir(exist_ok=True)
        for pg in range(1, (pages or 1) + 1):
            png = renders / f"p{pg}.png"
            await run_cli("pdfcraft", ["render", str(pdf), "--page", str(pg), "--dpi", "40", "--out", str(png)], cwd=work)
            if pg not in (1, pages) and blank_render(png, 1.0):
                issues.append(Issue("blank", "Page renders empty", f"page {pg}"))
        text = await run_cli("pdfcraft", ["text", str(pdf)], cwd=work)
        min_words = {"short": 70, "medium": 140, "long": 240}.get(length, 140)
        for ch in p.chapters:
            words = len((ch["body"] or "").split())
            if words < min_words:
                issues.append(Issue("thin", f"Chapter '{ch['heading'][:40]}' has {words} words (needs {min_words} for {length})"))
        for ch in p.chapters:
            if ch["heading"][:30] not in text.replace("\n", " "):
                issues.append(Issue("missing", f"Chapter '{ch['heading'][:40]}' did not render"))
        issues += copy_issues(text)
        if not HERO.exists() or not END.exists():
            issues.append(Issue("cover", "Constant cover art is not installed"))
        docx = work / "report.docx"
        winfo = _json.loads(await run_cli("wordcraft", ["info", str(docx)], cwd=work) or "{}")
        wpages = int(winfo.get("pages") or 0)
        if wpages < 3:
            issues.append(Issue("word", f"Word document has {wpages} page(s)"))
        else:
            wpng = renders / "w1.png"
            await run_cli("wordcraft", ["render", str(docx), str(wpng), "--page", "2", "--scale", "0.5"], cwd=work)
            if blank_render(wpng, 1.0):
                issues.append(Issue("blank", "Word page renders empty", "docx page 2"))
        p.issues_seen = [str(i) for i in issues]
        _ = series_n
        return issues

    async def fix(p: ReportPlan, issues: List[Issue], n: int) -> Optional[ReportPlan]:
        codes = {i.code for i in issues}
        if "thin" in codes and rewrite is not None:
            min_words = {"short": 70, "medium": 140, "long": 240}.get(length, 140)
            chapters = []
            for ch in p.chapters:
                if len((ch["body"] or "").split()) < min_words:
                    await progress(f"Rewriting thin chapter: {ch['heading']}")
                    try:
                        body = await rewrite(ch["heading"], ch["body"], min_words)
                        ch = {**ch, "body": strip_dashes(body)} if body else ch
                    except Exception as e:
                        await progress(f"Chapter rewrite failed ({e})")
                chapters.append(ch)
            return replace(p, chapters=chapters)
        if "length" in codes and p.body_size > 9.5:
            return replace(p, body_size=p.body_size - 0.5, figure_width=max(5.2, p.figure_width - 0.4))
        if "dash" in codes:
            return replace(p, chapters=[{**c, "body": strip_dashes(c["body"])} for c in p.chapters])
        return None

    result = await audit_loop(plan, build, audit, fix, progress)
    return Rendered(result.files, result.passes, result.issues, result.history)
