"""MCIT AI Studio: turn notebook material into a structured, render-ready document.

One LLM call (the default transformation model, local Ollama by default)
returns JSON. Every renderer (PDF, DOCX, PPTX, SVG, HTML, MD) consumes the
same structure, so a user generates once and downloads any format.
"""

import copy
import json
import re
import time
from datetime import datetime
from pathlib import Path
from typing import Any, Awaitable, Callable, Dict, List, Literal, Optional

from loguru import logger
from pydantic import BaseModel, Field

from open_notebook.domain.notebook import Notebook
from open_notebook.exceptions import InvalidInputError

ExportKind = Literal["report", "presentation", "infographic", "summary", "spreadsheet"]
Progress = Callable[[str], Awaitable[None]]
SlideLayout = Literal[
    "bullets",
    "two_column",
    "stats",
    "process",
    "quote",
    "comparison",
    "chart",
    "cards",
    "table",
    "image",
    "canvas",
    "custom",
    "freeform",
    "architecture",
    "stack",
    "layers",
    "matrix",
    "quadrant",
    "timeline",
]

# qwen2.5:7b runs with an 8k-token window through Esperanto's Ollama default.
MAX_CONTEXT_CHARS = 16_000


class StudioOptions(BaseModel):
    theme: str = "graphite"
    slide_count: int = Field(8, ge=4, le=30)
    length: Literal["short", "medium", "long", "brief", "standard", "detailed"] = (
        "medium"
    )
    template: str = "default"
    audience: str = "senior leadership"
    tone: Literal["formal", "neutral", "persuasive", "plain"] = "formal"
    speaker_notes: bool = True
    include_sources: bool = True
    instructions: Optional[str] = None
    theme_preset: Optional[str] = None
    primary_color: Optional[str] = None
    accent_color: Optional[str] = None
    bg_color: Optional[str] = None
    text_color: Optional[str] = None
    design_style: Optional[str] = None
    diagram_type: Optional[str] = None
    custom_svg: Optional[str] = None
    blueprint: Optional[Any] = None


LENGTH_ALIASES = {"brief": "short", "standard": "medium", "detailed": "long"}


def norm_length(v: str) -> str:
    return LENGTH_ALIASES.get(v, v)


class Table(BaseModel):
    name: str
    columns: List[str]
    rows: List[List[Any]] = Field(default_factory=list)


class Stat(BaseModel):
    value: str
    label: str


class Section(BaseModel):
    heading: str
    body: str = ""
    bullets: List[str] = Field(default_factory=list)
    table: Optional[Table] = None
    image_path: str = ""
    image_caption: str = ""


class Slide(BaseModel):
    layout: SlideLayout = "bullets"
    title: str
    subtitle: str = ""
    bullets: List[str] = Field(default_factory=list)
    left_title: str = ""
    left: List[str] = Field(default_factory=list)
    right_title: str = ""
    right: List[str] = Field(default_factory=list)
    stats: List[Stat] = Field(default_factory=list)
    steps: List[str] = Field(default_factory=list)
    quote: str = ""
    chart_labels: List[str] = Field(default_factory=list)
    chart_values: List[float] = Field(default_factory=list)
    table_columns: List[str] = Field(default_factory=list)
    table_rows: List[List[Any]] = Field(default_factory=list)
    image_path: str = ""
    image_caption: str = ""
    notes: str = ""
    elements: List[Dict[str, Any]] = Field(default_factory=list)


class StudioDocument(BaseModel):
    kind: ExportKind = "report"
    title: str
    subtitle: str = ""
    summary: str = ""
    key_points: List[str] = Field(default_factory=list)
    stats: List[Stat] = Field(default_factory=list)
    sections: List[Section] = Field(default_factory=list)
    slides: List[Slide] = Field(default_factory=list)
    recommendations: List[str] = Field(default_factory=list)
    conclusion: str = ""
    tables: List[Table] = Field(default_factory=list)
    sources: List[str] = Field(default_factory=list)
    notebook_name: str = ""
    options: StudioOptions = Field(default_factory=StudioOptions)
    diagram_type: Optional[str] = None
    custom_svg: Optional[str] = None
    blueprint: Optional[Any] = None
    generated_at: str = Field(
        default_factory=lambda: datetime.now().strftime("%d %B %Y")
    )


# Report depth (matches open_notebook/craft/studio/report.py DEPTH): real
# chapters, sub-sections and figures, never padded repetition.
LENGTH_HINT = {
    "short": "Outline EXACTLY 3 sections. 3-4 key points, 3 recommendations.",
    "medium": "Outline EXACTLY 5 sections. 5-6 key points, 4 recommendations.",
    "long": (
        "Outline EXACTLY 8 sections covering distinct aspects (context, current state, each pillar or programme, "
        "data, risks, outlook). 6 key points, 5-6 recommendations."
    ),
}
REPORT_OUTLINE_RULE = (
    "This is the OUTLINE pass: each section body is ONE sentence saying what the section covers, with 2-3 short "
    "bullets. Every chapter is then written in its own pass. Put every quantitative series from the material in a "
    "section table (numbers as numbers)."
)
SECTION_DEPTH = {
    "short": "Write 2 paragraphs (3-4 sentences each) and 2-3 bullets.",
    "medium": "Write 3 paragraphs (4-6 sentences each) and 3 bullets.",
    "long": (
        'Write 2 sub-sections, each starting with a line "### <sub-heading>" followed by 2 substantial paragraphs '
        "(5-7 sentences each), then 3-5 bullets."
    ),
}

KIND_GUIDANCE: Dict[str, str] = {
    "report": "a formal research report. Include 3-5 recommendations.",
    "infographic": (
        "a high-impact visual architecture infographic. You have complete design freedom: you can define "
        "a technical architecture stack, an abstract network topology / threat vector map, a 2x2 strategic quadrant matrix, "
        "an iterative resilience flywheel, or a clean visual breakdown with 4-8 core components, key figures, and clear takeaways. "
        "Optionally output raw vector SVG in 'custom_svg' or set 'diagram_type' ('architecture', 'network', 'quadrant', 'cycle', 'custom_svg')."
    ),
    "spreadsheet": (
        "an Excel workbook. Extract every quantitative series from the material into tables: "
        "each table has a name, column headers and rows (numbers as numbers). Add 3-6 KPI stats, "
        "a short summary and 2-4 sections that interpret the numbers."
    ),
    "summary": (
        "an executive summary: a 4-6 sentence summary, 5-8 key points, 1-3 short "
        "sections and a brief conclusion."
    ),
}

DOC_SCHEMA = """{
  "title": "string", "subtitle": "string", "summary": "string",
  "key_points": ["string"],
  "stats": [{"value": "short figure", "label": "what it measures"}],
  "sections": [{"heading": "string", "body": "string", "bullets": ["string"], "image_path": "string", "image_caption": "string"}],
  "tables": [{"name": "string", "columns": ["string"], "rows": [["string"]]}],
  "recommendations": ["string"], "conclusion": "string",
  "diagram_type": "architecture | network | quadrant | cycle | custom_svg",
  "custom_svg": "optional full raw SVG string"
}"""

SHEET_SCHEMA = """{
  "title": "string", "subtitle": "string", "summary": "string",
  "stats": [{"value": "short figure", "label": "what it measures"}],
  "tables": [{"name": "Sheet name", "columns": ["Category", "2024", "2025"], "rows": [["Online services", 120, 170]]}],
  "sections": [{"heading": "string", "body": "string", "bullets": ["string"]}],
  "conclusion": "string"
}"""

DECK_SCHEMA = """{
  "title": "deck title", "subtitle": "one line",
  "summary": "2 sentence overview",
  "slides": [
    {"layout": "bullets", "title": "...", "bullets": ["3-5 items, max 12 words"], "image_path": "optional path", "image_caption": "...", "notes": "speaker notes"},
    {"layout": "table", "title": "...", "table_columns": ["Column A", "Column B"], "table_rows": [["Val 1", "Val 2"]], "bullets": ["1 key takeaway"], "notes": "..."},
    {"layout": "image", "title": "...", "image_path": "exact path from material", "image_caption": "...", "bullets": ["2-3 observations"], "notes": "..."},
    {"layout": "stats", "title": "...", "stats": [{"value": "4500", "label": "villages connected"}], "notes": "..."},
    {"layout": "two_column", "title": "...", "left_title": "...", "left": ["..."], "right_title": "...", "right": ["..."], "notes": "..."},
    {"layout": "comparison", "title": "...", "left_title": "Before", "left": ["..."], "right_title": "After", "right": ["..."], "notes": "..."},
    {"layout": "process", "title": "...", "steps": ["3-5 short steps"], "notes": "..."},
    {"layout": "cards", "title": "...", "bullets": ["3-4 short ideas, each 'Heading: one sentence'"], "notes": "..."},
    {"layout": "chart", "title": "...", "chart_labels": ["A", "B"], "chart_values": [10, 20], "notes": "..."},
    {"layout": "quote", "title": "...", "quote": "one strong sentence from the material", "notes": "..."}
  ],
  "conclusion": "closing message"
}"""


class EmptyNotebookError(InvalidInputError):
    """Raised with a precise reason so the UI can offer the right one-click fix."""

    def __init__(self, message: str, reason: str, pending: Optional[List[str]] = None):
        super().__init__(message)
        self.reason = reason
        self.pending = pending or []


async def gather_notebook_content_and_assets(
    notebook: Notebook,
) -> tuple[str, List[str], List[Table], List[Dict[str, Any]]]:
    from open_notebook.exports.assets import (
        format_assets_for_prompt,
        gather_source_assets,
    )

    sources = await notebook.get_sources(include_full_text=True)
    notes = await notebook.get_notes(include_content=True)
    parts: List[str] = []
    titles: List[str] = []
    unprocessed: List[str] = []

    for s in sources:
        text = (getattr(s, "full_text", None) or "").strip()
        title = s.title or "Untitled source"
        titles.append(title)
        if text:
            parts.append(f"## Source: {title}\n{text}")
        else:
            # Fall back to insights when the full text is missing
            try:
                insights = await s.get_insights()
            except Exception:
                insights = []
            body = "\n".join(
                getattr(i, "content", "") for i in insights if getattr(i, "content", "")
            )
            if body:
                parts.append(f"## Source insights: {title}\n{body}")
            else:
                unprocessed.append(str(s.id))

    for n in notes:
        content = (getattr(n, "content", None) or "").strip()
        if content:
            parts.append(f"## Note: {n.title or 'Untitled note'}\n{content}")

    # Extract tables and images from uploaded sources
    extracted_tables, extracted_images = gather_source_assets(sources)
    assets_block = format_assets_for_prompt(extracted_tables, extracted_images)
    if assets_block:
        parts.append(f"## Uploaded Visual & Tabular Assets\n{assets_block}")

    material = "\n\n".join(parts)
    if not material.strip():
        if not sources and not notes:
            raise EmptyNotebookError(
                f'The notebook "{notebook.name}" has no sources yet. Add files, links or text to it first.',
                reason="empty",
            )
        raise EmptyNotebookError(
            f'{len(unprocessed)} source(s) in "{notebook.name}" have not finished processing.',
            reason="unprocessed",
            pending=unprocessed,
        )
    if len(material) > MAX_CONTEXT_CHARS:
        material = material[:MAX_CONTEXT_CHARS] + "\n\n[...truncated...]"
    return material, titles, extracted_tables, extracted_images


async def gather_notebook_material(notebook: Notebook) -> tuple[str, List[str]]:
    material, titles, _, _ = await gather_notebook_content_and_assets(notebook)
    return material, titles


def _clean_json_candidate(candidate: str) -> str:
    # Remove single-line JS comments // ...
    candidate = re.sub(r"//.*$", "", candidate, flags=re.MULTILINE)
    # Remove trailing commas before } or ]
    candidate = re.sub(r",\s*([\]}])", r"\1", candidate)
    return candidate


def _parse_markdown_fallback(text: str) -> Dict[str, Any]:
    lines = text.strip().splitlines()
    title = "Generated Document"
    summary = ""
    sections: List[Dict[str, Any]] = []
    slides: List[Dict[str, Any]] = []
    current_sec: Dict[str, Any] = {"heading": "Overview", "body": "", "bullets": []}

    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue
        if stripped.startswith("# ") and title == "Generated Document":
            title = stripped.lstrip("# ").strip()
        elif stripped.startswith("## ") or stripped.startswith("### "):
            if current_sec["body"] or current_sec["bullets"]:
                sections.append(current_sec)
                slides.append(
                    {
                        "layout": "bullets",
                        "title": current_sec["heading"],
                        "bullets": current_sec["bullets"]
                        or [current_sec["body"][:100]],
                        "notes": current_sec["body"],
                    }
                )
            current_sec = {
                "heading": stripped.lstrip("# ").strip(),
                "body": "",
                "bullets": [],
            }
        elif stripped.startswith(("- ", "* ", "• ")) or re.match(
            r"^\d+\.\s+", stripped
        ):
            bullet = re.sub(r"^(?:[-*•]|\d+\.)\s+", "", stripped)
            current_sec["bullets"].append(bullet)
        else:
            if not summary and len(sections) == 0:
                summary = stripped
            if current_sec["body"]:
                current_sec["body"] += " " + stripped
            else:
                current_sec["body"] = stripped

    if current_sec["body"] or current_sec["bullets"]:
        sections.append(current_sec)
        slides.append(
            {
                "layout": "bullets",
                "title": current_sec["heading"],
                "bullets": current_sec["bullets"] or [current_sec["body"][:100]],
                "notes": current_sec["body"],
            }
        )

    return {
        "title": title,
        "summary": summary,
        "sections": sections,
        "slides": slides,
        "key_points": [b for s in sections for b in s.get("bullets", [])][:6],
        "conclusion": summary,
    }


def _extract_json(text: str) -> Dict[str, Any]:
    text = re.sub(r"<think>.*?</think>", "", text, flags=re.S)
    fenced = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
    candidate = fenced.group(1).strip() if fenced else text.strip()
    start = candidate.find("{")
    end = candidate.rfind("}")
    if start != -1 and end != -1 and end > start:
        candidate = candidate[start : end + 1]
    else:
        raise ValueError("no JSON object in model output")

    try:
        return json.loads(candidate, strict=False)
    except Exception:
        pass

    cleaned = _clean_json_candidate(candidate)
    try:
        return json.loads(cleaned, strict=False)
    except Exception:
        pass

    for closure in ["}", "]}", "]}}", '"}', '"]}', '"}]}}']:
        try:
            return json.loads(cleaned + closure, strict=False)
        except Exception:
            continue

    return json.loads(cleaned, strict=False)


def _as_list(v: Any) -> List[str]:
    if v is None:
        return []
    if isinstance(v, str):
        return [v] if v.strip() else []
    out = []
    for x in v:
        if isinstance(x, dict):
            out.append(": ".join(str(y) for y in x.values() if y))
        elif str(x).strip():
            out.append(str(x))
    return out


def _stats(v: Any) -> List[Dict[str, str]]:
    out = []
    for st in v or []:
        if isinstance(st, dict) and st.get("value"):
            out.append(
                {"value": str(st["value"])[:16], "label": str(st.get("label", ""))}
            )
    return out


def _num(x: Any) -> Any:
    if isinstance(x, (int, float)) or x is None:
        return x
    t = str(x).replace(",", "").strip()
    try:
        return float(t) if "." in t else int(t)
    except ValueError:
        return str(x)


def _floats(v: Any) -> List[float]:
    out = []
    for x in v or []:
        try:
            out.append(float(str(x).replace(",", "").replace("%", "")))
        except ValueError:
            continue
    return out


def _coerce(data: Dict[str, Any]) -> Dict[str, Any]:
    """Tolerate small-model schema drift (strings vs lists, missing keys)."""
    out: Dict[str, Any] = {
        "title": str(data.get("title") or "Untitled"),
        "subtitle": str(data.get("subtitle") or ""),
        "summary": str(data.get("summary") or ""),
        "key_points": _as_list(data.get("key_points")),
        "recommendations": _as_list(data.get("recommendations")),
        "conclusion": str(data.get("conclusion") or ""),
        "stats": _stats(data.get("stats")),
        "diagram_type": str(data.get("diagram_type") or ""),
        "custom_svg": str(data.get("custom_svg") or ""),
        "blueprint": data.get("blueprint"),
        "sections": [],
        "slides": [],
        "tables": [],
    }
    for tb in data.get("tables") or []:
        if isinstance(tb, dict) and tb.get("columns"):
            cols = [str(c) for c in tb["columns"]][:20]
            rows = []
            for r in tb.get("rows") or []:
                if isinstance(r, list):
                    rows.append([_num(x) for x in r][: len(cols)])
                elif isinstance(r, dict):
                    rows.append([_num(r.get(c)) for c in cols])
            if rows:
                out["tables"].append(
                    {
                        "name": str(tb.get("name") or "Data")[:31],
                        "columns": cols,
                        "rows": rows[:500],
                    }
                )
    for sec in data.get("sections") or []:
        if isinstance(sec, dict):
            sec_table = None
            if isinstance(sec.get("table"), dict) and sec["table"].get("columns"):
                tb = sec["table"]
                cols = [str(c) for c in tb["columns"]][:12]
                rows = [
                    [_num(x) for x in r][: len(cols)]
                    for r in tb.get("rows") or []
                    if isinstance(r, list)
                ]
                if rows:
                    sec_table = {
                        "name": str(tb.get("name") or "Table")[:31],
                        "columns": cols,
                        "rows": rows[:50],
                    }
            out["sections"].append(
                {
                    "heading": str(sec.get("heading") or sec.get("title") or ""),
                    "body": str(sec.get("body") or sec.get("content") or ""),
                    "bullets": _as_list(sec.get("bullets")),
                    "table": sec_table,
                    "image_path": str(sec.get("image_path") or ""),
                    "image_caption": str(sec.get("image_caption") or ""),
                }
            )
    valid = {
        "bullets",
        "two_column",
        "stats",
        "process",
        "quote",
        "comparison",
        "chart",
        "cards",
        "table",
        "image",
        "architecture",
        "stack",
        "layers",
        "matrix",
        "quadrant",
        "timeline",
        "canvas",
        "custom",
        "freeform",
    }
    for sl in data.get("slides") or []:
        if not isinstance(sl, dict):
            continue
        layout = str(sl.get("layout") or "bullets")
        labels, values = (
            _as_list(sl.get("chart_labels")),
            _floats(sl.get("chart_values")),
        )
        t_cols = _as_list(sl.get("table_columns"))
        t_rows = []
        for r in sl.get("table_rows") or []:
            if isinstance(r, list):
                t_rows.append([_num(x) for x in r][: len(t_cols) or 12])
            elif isinstance(r, dict):
                t_rows.append([_num(r.get(c)) for c in t_cols])
        if not t_cols and isinstance(sl.get("table"), dict):
            tb = sl["table"]
            t_cols = _as_list(tb.get("columns"))
            for r in tb.get("rows") or []:
                if isinstance(r, list):
                    t_rows.append([_num(x) for x in r][: len(t_cols)])

        raw_elements = sl.get("elements")
        elements = [dict(e) for e in raw_elements if isinstance(e, dict)] if isinstance(raw_elements, list) else []

        slide = {
            "layout": layout if layout in valid else "bullets",
            "title": str(sl.get("title") or ""),
            "subtitle": str(sl.get("subtitle") or ""),
            "bullets": _as_list(sl.get("bullets")),
            "left_title": str(sl.get("left_title") or ""),
            "left": _as_list(sl.get("left")),
            "right_title": str(sl.get("right_title") or ""),
            "right": _as_list(sl.get("right")),
            "stats": _stats(sl.get("stats")),
            "steps": _as_list(sl.get("steps")),
            "quote": str(sl.get("quote") or ""),
            "chart_labels": labels[: len(values)],
            "chart_values": values[: len(labels)],
            "table_columns": t_cols,
            "table_rows": t_rows,
            "image_path": str(sl.get("image_path") or ""),
            "image_caption": str(sl.get("image_caption") or ""),
            "notes": str(sl.get("notes") or ""),
            "elements": elements,
        }
        slide = _repair_slide(slide)
        if slide["title"]:
            out["slides"].append(slide)
    return out


def _repair_slide(s: Dict[str, Any]) -> Dict[str, Any]:
    """Downgrade a layout whose required content is missing, so no slide renders empty."""
    lay = s["layout"]
    if lay in ("canvas", "custom", "freeform"):
        if not s.get("elements") and not s.get("bullets"):
            lay = "bullets"
    elif lay in ("architecture", "stack", "layers"):
        if not s.get("bullets") and not s.get("steps") and not s.get("elements"):
            lay = "bullets"
    elif lay in ("matrix", "quadrant"):
        if not s.get("bullets") and not s.get("left") and not s.get("elements"):
            lay = "bullets"
    elif lay == "table" and (not s.get("table_rows") or not s.get("table_columns")):
        lay = "bullets"
    elif lay == "image" and not s.get("image_path"):
        try:
            from open_notebook.craft.kit.assets import doodles

            avail = {p.stem: str(p) for p in doodles()}
            if "plant" in avail:
                s["image_path"] = avail["plant"]
            elif avail:
                s["image_path"] = next(iter(avail.values()))
            else:
                lay = "bullets"
        except Exception:
            lay = "bullets"
    elif lay == "stats" and not s["stats"]:
        lay = "bullets"
    elif lay == "chart" and len(s["chart_values"]) < 2:
        lay = "stats" if s["stats"] else "bullets"
    elif lay in ("two_column", "comparison") and not (s["left"] and s["right"]):
        s["bullets"] = s["bullets"] or (s["left"] + s["right"])
        lay = "bullets"
    elif lay == "process" and len(s["steps"]) < 2:
        s["bullets"] = s["bullets"] or s["steps"]
        lay = "bullets"
    elif lay == "quote" and not s["quote"]:
        lay = "bullets"
    elif lay == "cards" and len(s["bullets"]) < 2:
        lay = "bullets"
    elif lay == "bullets" and not s["bullets"]:
        s["bullets"] = (
            s["steps"] or s["left"] + s["right"] or ([s["quote"]] if s["quote"] else [])
        )
    s["layout"] = lay
    return s


def content_slide_count(total: int) -> int:
    """The number of content slides to generate for a total slide count."""
    t = max(4, min(20, int(total)))
    return t - 3 if t >= 6 else t - 2


def _writing_rules() -> str:
    try:
        from open_notebook.tut.writing import compact_writing_rules

        return compact_writing_rules()
    except Exception as e:  # skills are an enhancement, never a hard failure
        logger.warning(f"Could not load writing skills: {e}")
        return ""


def build_prompt(
    notebook: Notebook, kind: ExportKind, material: str, o: StudioOptions
) -> str:
    if kind == "presentation":
        n = content_slide_count(o.slide_count)
        task = (
            f'a slide deck with EXACTLY {n} content slides in the "slides" array. '
            f'CRITICAL: The "slides" array MUST contain EXACTLY {n} slide items (total presentation will have {o.slide_count} slides including title cover, agenda and closing). '
            "Vary the layouts: use at least four different layouts, never the same layout "
            "twice in a row (layouts: bullets, cards, stats, chart, two_column, comparison, process, timeline, table, image, quote). "
            "The cover, agenda and closing slides are added for you; do not write them. "
            "When tables exist in the material, dedicate at least one slide "
            "to a 'table' layout with actual table_columns and table_rows. When images/figures exist "
            "in the material, dedicate at least one slide to an 'image' layout using the exact "
            "image_path and caption from the material. Use 'stats' or 'chart' only with numbers "
            "that appear in the material. Bullets are fragments of at most 12 words."
            + (
                " Write 2-3 sentences of speaker notes per slide."
                if o.speaker_notes
                else ""
            )
        )
        schema = DECK_SCHEMA
    else:
        task = KIND_GUIDANCE[kind] + " " + LENGTH_HINT[norm_length(o.length)]
        if kind == "report":
            task += " " + REPORT_OUTLINE_RULE
        schema = SHEET_SCHEMA if kind == "spreadsheet" else DOC_SCHEMA
    rules = _writing_rules()
    template_hint = ""
    return f"""You are Tut Agent, the MCIT AI agent, working as a senior analyst at the Ministry of Communications and Information Technology (MCIT).
Using ONLY the material below, write the content for {task}
Audience: {o.audience}. Tone: {o.tone}. English only.
Never invent numbers, names, dates or facts that are not in the material.
When tables or figures are provided in the material, integrate them into the output.
{f"User instructions: {o.instructions}" if o.instructions else ""}
{template_hint}
{rules}

Notebook: {notebook.name}

MATERIAL:
{material}

CRITICAL FORMAT REQUIREMENT:
Return ONLY a valid JSON object matching the schema below.
Do NOT write markdown articles, essays, conversational commentary, or explanations.
Your response MUST start directly with '{{' and terminate with '}}'.

JSON SCHEMA:
{schema}
"""


async def _noop(_: str) -> None:
    return None


async def _call_json(
    llm, prompt: str, progress: Progress, label: str
) -> Dict[str, Any]:
    raw = ""
    for attempt in range(3):
        await progress(f"{label}: calling the model" + (" (retry)" if attempt else ""))
        try:
            if hasattr(llm, "ainvoke"):
                response = await llm.ainvoke(prompt)
            elif hasattr(llm, "to_langchain"):
                response = await llm.to_langchain().ainvoke(prompt)
            elif hasattr(llm, "achat_complete"):
                chat_res = await llm.achat_complete(messages=[{"role": "user", "content": prompt}])
                content_val = chat_res.choices[0].message.content if hasattr(chat_res, "choices") and chat_res.choices else str(chat_res)
                response = type("Resp", (), {"content": content_val})()
            else:
                raise ValueError(f"Uncallable model: {type(llm)}")
        except Exception as e:  # an incomplete or timed-out model turn: try again
            if attempt == 2:
                raise
            await progress(f"{label}: {e}; retrying")
            continue
        raw = (
            response.content
            if isinstance(response.content, str)
            else str(response.content)
        )
        try:
            return _extract_json(raw)
        except Exception as e:
            if attempt == 2:
                # If after 3 attempts it's still not valid JSON, recover via Markdown AST parser
                try:
                    fallback = _parse_markdown_fallback(raw)
                    if (
                        fallback.get("sections")
                        or fallback.get("slides")
                        or fallback.get("summary")
                    ):
                        logger.warning(
                            f"{label}: JSON parsing failed ({e}), recovered via Markdown AST parser"
                        )
                        return fallback
                except Exception:
                    pass
            await progress(
                f"{label}: model output was not valid JSON ({type(e).__name__}), retrying"
            )
    raise ValueError(f"{label}: the model did not return valid JSON after 3 attempts")


async def _expand_long(
    llm,
    notebook: Notebook,
    material: str,
    data: Dict[str, Any],
    o: StudioOptions,
    progress: Progress,
) -> None:
    """Reports: write each chapter in its own pass so the depth is real, not padding."""
    depth = SECTION_DEPTH.get(norm_length(o.length), SECTION_DEPTH["medium"])
    sections = data.get("sections") or []
    for i, sec in enumerate(sections, 1):
        prompt = f"""You are writing section {i} of {len(sections)} of an MCIT report titled "{data.get("title")}".
Section heading: {sec.get("heading")}
{depth} Use ONLY facts from the material.
Audience: {o.audience}. Tone: {o.tone}. Do not repeat other sections; go deeper on this one.
{_writing_rules()}

MATERIAL:
{material[:9000]}

CRITICAL FORMAT REQUIREMENT:
Return ONLY a valid JSON object: {{"body": "paragraphs separated by blank lines", "bullets": ["..."]}}
Start directly with '{{' and terminate with '}}'. No extra commentary or markdown.
"""
        try:
            part = await _call_json(
                llm,
                prompt,
                progress,
                f"Writing section {i}/{len(sections)}: {sec.get('heading')}",
            )
            sec["body"] = str(part.get("body") or sec.get("body") or "")
            sec["bullets"] = _as_list(part.get("bullets")) or sec.get("bullets") or []
        except Exception as e:
            await progress(f"Section {i} kept its outline text ({e})")


# ------------------------------------------------------------------ Presentations: Dynamic Perspectives & Multi-stage Storyboarding

PRESENTATION_PERSPECTIVES = [
    {
        "id": "strategic_outlook",
        "name": "Executive Strategic Outlook",
        "lens": "High-level strategic vision, macroeconomic/organizational imperatives, key executive decisions, and high-impact KPIs.",
        "preferred_layouts": ["stats", "cards", "comparison", "quote", "bullets"],
        "doodle_focus": ["plant", "levitate", "loving", "meditating", "groovy"],
    },
    {
        "id": "technical_deep_dive",
        "name": "Strategic & Technical Deep Dive",
        "lens": "Architecture, technical mechanisms, granular threat/risk vectors, operational protocols, benchmarks, and structural breakdown.",
        "preferred_layouts": ["two_column", "table", "process", "cards", "stats"],
        "doodle_focus": [
            "unboxing",
            "sleek",
            "reading",
            "reading-side",
            "sitting-reading",
        ],
    },
    {
        "id": "action_roadmap",
        "name": "Action & Implementation Roadmap",
        "lens": "Operational phased rollout, milestone delivery, stakeholder coordination, timelines, capability building, and concrete execution steps.",
        "preferred_layouts": ["process", "cards", "comparison", "stats", "table"],
        "doodle_focus": ["sprinting", "running", "jumping", "dog-jump", "strolling"],
    },
    {
        "id": "policy_governance",
        "name": "Governance, Risk & Policy Framework",
        "lens": "Compliance, accountability mechanisms, risk mitigation matrices, regulatory alignment, governance oversight, and institutional resilience.",
        "preferred_layouts": ["table", "two_column", "cards", "quote", "stats"],
        "doodle_focus": ["meditating", "sitting", "reading", "plant", "chilling"],
    },
    {
        "id": "ecosystem_dynamics",
        "name": "Market Dynamics & Ecosystem Transformation",
        "lens": "Industry trends, competitive dynamics, ecosystem collaboration, disruption drivers, and future trajectory.",
        "preferred_layouts": ["comparison", "stats", "cards", "process", "image"],
        "doodle_focus": ["float", "roller-skating", "swinging", "groovy", "ballet"],
    },
]


def _clean_title(text: str, fallback: str = "Strategic Overview") -> str:
    if not text:
        return fallback
    clean = str(text).strip()
    clean = re.sub(
        r"\.(pdf|docx|xlsx|pptx|csv|txt|png|jpg|webp)$", "", clean, flags=re.IGNORECASE
    )
    clean = re.sub(
        r"^(WEF|MCIT|DOC|FIG|FIGURE|TABLE|SOURCE|PAGE)[_\s:-]+",
        "",
        clean,
        flags=re.IGNORECASE,
    )
    clean = clean.replace("_", " ")
    clean = re.sub(
        r"\s*\((?:Cont\.?|Part\s*\d+|Phase\s*\d+)\)\s*$", "", clean, flags=re.IGNORECASE
    )
    clean = re.sub(r"\s+", " ", clean).strip()
    if len(clean) < 3 or re.match(r"^[0-9\W]+$", clean):
        return fallback
    return clean


def _get_available_doodles() -> Dict[str, str]:
    try:
        from open_notebook.craft.kit.assets import doodles

        return {p.stem: str(p) for p in doodles()}
    except Exception as e:
        logger.warning(f"Could not load doodles: {e}")
        return {}


def _select_perspective(
    instructions: Optional[str], notebook_name: str, seed_offset: int = 0
) -> Dict[str, Any]:
    text = (instructions or "").lower()
    if any(
        k in text
        for k in (
            "roadmap",
            "action",
            "timeline",
            "implement",
            "rollout",
            "phases",
            "milestone",
        )
    ):
        return PRESENTATION_PERSPECTIVES[2]
    if any(
        k in text
        for k in (
            "tech",
            "architecture",
            "deep dive",
            "security",
            "threat",
            "engineering",
        )
    ):
        return PRESENTATION_PERSPECTIVES[1]
    if any(
        k in text
        for k in (
            "govern",
            "policy",
            "risk",
            "compliance",
            "regulatory",
            "oversight",
        )
    ):
        return PRESENTATION_PERSPECTIVES[3]
    if any(
        k in text
        for k in (
            "market",
            "ecosystem",
            "trend",
            "industry",
            "competit",
            "disrupt",
        )
    ):
        return PRESENTATION_PERSPECTIVES[4]
    if any(
        k in text for k in ("exec", "brief", "summary", "outlook", "vision", "leader")
    ):
        return PRESENTATION_PERSPECTIVES[0]

    t_seed = (
        int(time.time() * 1000) // 1000
        + seed_offset
        + hash(instructions or "")
        + hash(notebook_name)
    )
    return PRESENTATION_PERSPECTIVES[t_seed % len(PRESENTATION_PERSPECTIVES)]


def _format_source_assets_for_planner(
    extracted_tables: List[Table],
    extracted_images: List[Dict[str, Any]],
    doodles_map: Dict[str, str],
) -> str:
    parts = []
    if extracted_tables:
        t_summaries = []
        for idx, t in enumerate(extracted_tables[:4], 1):
            clean_name = _clean_title(t.name, fallback=f"Data Table {idx}")
            t_summaries.append(
                f"- Table {idx} ('{clean_name}'): columns={t.columns[:5]}"
            )
        parts.append("Available Source Tables:\n" + "\n".join(t_summaries))
    if extracted_images:
        img_summaries = []
        for idx, img in enumerate(extracted_images[:4], 1):
            cap = _clean_title(img.get("caption", ""), fallback=f"Figure {idx}")
            img_summaries.append(f"- Figure {idx} ('{cap}'): path={img.get('path')}")
        parts.append("Available Source Figures:\n" + "\n".join(img_summaries))
    if doodles_map:
        doodle_names = list(doodles_map.keys())[:15]
        parts.append(f"Available Hand-Drawn Open Doodles: {', '.join(doodle_names)}")
    return "\n\n".join(parts)


async def _plan_presentation_storyboard(
    llm,
    notebook: Notebook,
    material: str,
    target_n: int,
    perspective: Dict[str, Any],
    options: StudioOptions,
    assets_summary: str,
    progress: Progress,
) -> Optional[List[Dict[str, Any]]]:
    prompt = f"""You are Tut Agent, the MCIT senior analyst and presentation architect.
Your task is to plan the storyboard for a {target_n}-slide executive presentation.
CRITICAL: Plan EXACTLY {target_n} content slides. Do NOT plan cover, agenda, or closing slides (they are added automatically).

ANALYTICAL PERSPECTIVE: {perspective["name"]}
LENS: {perspective["lens"]}
TARGET AUDIENCE: {options.audience}
TONE: {options.tone}
{f"USER INSTRUCTIONS: {options.instructions}" if options.instructions else ""}

AVAILABLE ASSETS:
{assets_summary}

STORYBOARD RULES:
1. Provide EXACTLY {target_n} slide plans in sequential order (1 to {target_n}).
2. For each slide, choose a distinct layout from: bullets, cards, stats, two_column, comparison, process, table, image, quote, chart.
3. VARY LAYOUTS: Never use the same layout twice in a row. Use at least 4 distinct layouts across the deck.
4. SLIDE TITLES: Must be active, analytical, thematic headings (3-7 words, e.g. "Global Cyber Exposure Trajectory", "Operational Vulnerability Vectors", "Governance & Accountability Framework").
5. STRICT FORBIDDEN: NEVER use document filenames, document codes (e.g. WEF_...), file extensions (.pdf), or generic placeholders (e.g. "Milestone 1", "Cont.").
6. VISUAL ASSETS: For 'image' slides, assign an approved doodle (e.g. 'doodle:plant', 'doodle:sprinting', 'doodle:meditating', 'doodle:unboxing') or source figure. For 'table' slides, assign a quantitative comparison topic.

NOTEBOOK: {notebook.name}
MATERIAL EXCERPT:
{material[:8000]}

CRITICAL FORMAT REQUIREMENT:
Return ONLY a valid JSON object matching this schema:
{{
  "deck_title": "Active Presentation Title",
  "deck_subtitle": "Strategic thesis statement",
  "slides": [
    {{
      "number": 1,
      "title": "Analytical Slide Heading",
      "subtitle": "One clear framing sentence",
      "layout": "stats",
      "visual_asset": null,
      "purpose": "Communicate high-impact headline metrics"
    }}
  ]
}}
"""
    try:
        res = await _call_json(
            llm, prompt, progress, "Brainstorming & storyboard planning"
        )
        slides = res.get("slides")
        if isinstance(slides, list) and len(slides) >= max(3, target_n - 2):
            return slides
    except Exception as e:
        logger.warning(
            f"Storyboard planning pass failed ({e}); proceeding with direct synthesis"
        )
    return None


def _post_process_presentation_slides(
    data: Dict[str, Any],
    target_n: int,
    perspective: Dict[str, Any],
    titles: List[str],
    extracted_tables: List[Table],
    extracted_images: List[Dict[str, Any]],
    doodles_map: Dict[str, str],
) -> Dict[str, Any]:
    slides: List[Dict[str, Any]] = data.get("slides") or []
    cleaned_slides: List[Dict[str, Any]] = []

    # Clean overall presentation title & subtitle
    data["title"] = _clean_title(data.get("title", ""), fallback=perspective["name"])
    if data.get("subtitle"):
        data["subtitle"] = _clean_title(data["subtitle"], fallback="")

    default_doodle = doodles_map.get("plant") or (
        next(iter(doodles_map.values())) if doodles_map else ""
    )

    for idx, sl in enumerate(slides):
        if not isinstance(sl, dict):
            continue

        raw_title = sl.get("title") or f"Key Insight {idx + 1}"
        cleaned_title = _clean_title(raw_title, fallback=f"Strategic Focus {idx + 1}")
        sl["title"] = cleaned_title

        if sl.get("subtitle"):
            sl["subtitle"] = _clean_title(sl["subtitle"], fallback="")

        layout = sl.get("layout", "bullets")

        # 1. Image layout
        if layout == "image":
            img_p = str(sl.get("image_path") or "").strip()
            resolved_path = ""

            if img_p.startswith("doodle:"):
                d_name = img_p.split(":", 1)[1].strip()
                resolved_path = doodles_map.get(d_name, "")
            elif img_p in doodles_map:
                resolved_path = doodles_map[img_p]
            elif Path(img_p).exists() and Path(img_p).is_file():
                resolved_path = img_p
            elif extracted_images:
                for ex_img in extracted_images:
                    if Path(ex_img["path"]).exists():
                        resolved_path = ex_img["path"]
                        if not sl.get("image_caption"):
                            sl["image_caption"] = _clean_title(
                                ex_img.get("caption", "")
                            )
                        break

            if not resolved_path or not Path(resolved_path).exists():
                pref_doodles = perspective.get("doodle_focus", [])
                chosen = next(
                    (doodles_map[d] for d in pref_doodles if d in doodles_map),
                    default_doodle,
                )
                resolved_path = chosen

            sl["image_path"] = resolved_path
            if not sl.get("bullets"):
                sl["bullets"] = [
                    "Key strategic visual representation.",
                    "Alignment with core transformation milestones.",
                ]
            else:
                sl["bullets"] = [
                    _clean_title(b, fallback=b) for b in sl["bullets"] if b
                ]

        # 2. Table layout
        elif layout == "table":
            t_cols = sl.get("table_columns") or []
            t_rows = sl.get("table_rows") or []

            valid_table = (
                len(t_cols) >= 2
                and len(t_rows) >= 1
                and all(len(r) >= 2 for r in t_rows if isinstance(r, list))
            )
            if not valid_table:
                if (
                    extracted_tables
                    and len(extracted_tables[0].columns) >= 2
                    and len(extracted_tables[0].rows) >= 2
                ):
                    best_t = extracted_tables[0]
                    sl["table_columns"] = best_t.columns[:5]
                    sl["table_rows"] = [r[:5] for r in best_t.rows[:6]]
                    if not sl.get("bullets"):
                        sl["bullets"] = ["Empirical baseline data from documentation."]
                else:
                    sl["layout"] = "cards"
                    if not sl.get("bullets"):
                        sl["bullets"] = [
                            "Core Capability: Foundational readiness",
                            "Operational Target: Standardized execution",
                            "Strategic Impact: Long-term sustainability",
                        ]

        # 3. Stats layout
        elif layout == "stats":
            stats = sl.get("stats") or []
            if not stats:
                sl["layout"] = "bullets"
                if not sl.get("bullets"):
                    sl["bullets"] = [
                        "Key performance indicator analysis.",
                        "Operational target metrics.",
                    ]

        # 4. Process layout
        elif layout == "process":
            steps = sl.get("steps") or []
            if len(steps) < 2:
                sl["layout"] = "bullets"
                sl["bullets"] = (
                    sl.get("bullets")
                    or steps
                    or ["Phase 1: Initiation", "Phase 2: Execution"]
                )

        cleaned_slides.append(sl)

    # Strictly enforce target_n slide count
    if len(cleaned_slides) > target_n:
        cleaned_slides = cleaned_slides[:target_n]
    elif len(cleaned_slides) < target_n:
        thematic_fillers = [
            {
                "layout": "cards",
                "title": "Strategic Implementation Enablers",
                "subtitle": "Cross-cutting foundational pillars",
                "bullets": [
                    "Governance Framework: Transparent oversight and leadership accountability",
                    "Technology Readiness: Robust digital infrastructure and secure platforms",
                    "Capability Development: Upskilling, specialized talent, and institutional knowledge",
                ],
                "notes": "Discussion of core implementation enablers.",
            },
            {
                "layout": "comparison",
                "title": "Operational Risk & Mitigation Trajectory",
                "subtitle": "Target risk posture",
                "left_title": "Identified Risk Vectors",
                "left": [
                    "Adoption bottlenecks",
                    "Resource constraints",
                    "Integration latency",
                ],
                "right_title": "Mitigation Playbooks",
                "right": [
                    "Phased pilot deployment",
                    "Cross-departmental taskforces",
                    "Automated governance validation",
                ],
                "notes": "Risk mitigation strategy.",
            },
            {
                "layout": "image",
                "title": "Future Horizon & Strategic Outlook",
                "subtitle": "Long-term sustainability and scalability",
                "image_path": doodles_map.get("plant") or default_doodle,
                "bullets": [
                    "Long-term ecosystem value creation",
                    "Continuous monitoring and policy refinement",
                    "Scalable impact across all operational units",
                ],
                "notes": "Forward-looking strategic horizon.",
            },
            {
                "layout": "process",
                "title": "Execution Phases & Next Horizons",
                "subtitle": "Structured delivery roadmap",
                "steps": [
                    "Phase 1: Assessment & baseline validation",
                    "Phase 2: Core rollout & pilot enablement",
                    "Phase 3: Full-scale institutional adoption",
                ],
                "notes": "Delivery timeline and phases.",
            },
        ]
        f_idx = 0
        while len(cleaned_slides) < target_n:
            filler = copy.deepcopy(thematic_fillers[f_idx % len(thematic_fillers)])
            cleaned_slides.append(filler)
            f_idx += 1

    data["slides"] = cleaned_slides
    return data


async def _generate_presentation(
    llm,
    notebook: Notebook,
    material: str,
    titles: List[str],
    extracted_tables: List[Table],
    extracted_images: List[Dict[str, Any]],
    options: StudioOptions,
    progress: Progress,
) -> Dict[str, Any]:
    target_n = content_slide_count(options.slide_count)
    perspective = _select_perspective(options.instructions, notebook.name)
    doodles_map = _get_available_doodles()
    assets_summary = _format_source_assets_for_planner(
        extracted_tables, extracted_images, doodles_map
    )

    await progress(
        f"Tut Agent: adopting '{perspective['name']}' perspective ({target_n} content slides)"
    )

    # Stage 1: Storyboard Planning
    storyboard = await _plan_presentation_storyboard(
        llm,
        notebook,
        material,
        target_n,
        perspective,
        options,
        assets_summary,
        progress,
    )

    storyboard_context = ""
    if storyboard:
        sb_lines = []
        for s in storyboard[:target_n]:
            sb_lines.append(
                f"- Slide {s.get('number', '?')}: [{s.get('layout', 'bullets')}] {s.get('title', 'Overview')} - {s.get('purpose', '')} (Visual: {s.get('visual_asset', 'none')})"
            )
        storyboard_context = (
            "APPROVED STORYBOARD TO FOLLOW:\n" + "\n".join(sb_lines) + "\n\n"
        )

    # Stage 2: Slide Drafting
    draft_prompt = f"""You are Tut Agent, the MCIT AI senior analyst at the Ministry of Communications and Information Technology.
Draft the content for a high-impact presentation of EXACTLY {target_n} content slides.

PERSPECTIVE: {perspective["name"]} ({perspective["lens"]})
AUDIENCE: {options.audience}. TONE: {options.tone}.
{f"USER INSTRUCTIONS: {options.instructions}" if options.instructions else ""}

{storyboard_context}AVAILABLE ASSETS:
{assets_summary}

CRITICAL SLIDE RULES:
1. Return EXACTLY {target_n} slides in the "slides" array.
2. Layouts: bullets, cards, stats, two_column, comparison, process, table, image, quote, chart, architecture (layered stack), matrix (2x2 strategic quadrants), canvas (custom freeform shapes & connectors).
3. Slide titles: Analytical, professional, active titles (3-7 words). STRICTLY FORBIDDEN: never use filenames (e.g. WEF_..., .pdf), never use '(Cont.)' or generic filler titles.
4. When drafting a 'table' slide: provide 3-5 clean columns (e.g. Category, Current State, 2026 Target, Priority) and 3-6 rows with real figures or factual items from the material. NEVER output unparsed fragments.
5. When drafting an 'image' slide: specify an approved doodle (e.g. 'doodle:plant', 'doodle:sprinting', 'doodle:meditating', 'doodle:unboxing') or figure path, and include 2-4 high-value analytical bullet points.
6. Bullets: concise fragments of at most 12 words.
7. Speaker notes: 2-3 executive speaking sentences per slide.
8. Ground all facts and numbers strictly in the material below.

MATERIAL:
{material}

CRITICAL FORMAT REQUIREMENT:
Return ONLY a valid JSON object matching this schema:
{{
  "title": "Overall Presentation Title",
  "subtitle": "Subtitle or strategic context",
  "summary": "Executive summary of the presentation",
  "slides": [
    {{"layout": "stats", "title": "Headline Impact Metrics", "subtitle": "Core performance indicators", "stats": [{{"value": "$10.5T", "label": "projected cyber damages"}}, {{"value": "43%", "label": "increase in attack frequency"}}], "notes": "Speaker notes"}},
    {{"layout": "cards", "title": "Strategic Vector Breakdown", "subtitle": "Core vulnerability domains", "bullets": ["Cloud Infrastructure: Shared responsibility gaps", "Identity Integrity: Credential stuffing expansion", "Operational Resilience: Supply chain dependency risks"], "notes": "Speaker notes"}},
    {{"layout": "architecture", "title": "Defense-in-Depth Architecture", "subtitle": "Tiered institutional posture", "steps": ["Tier 1: Continuous Observability & AI Telemetry", "Tier 2: Identity Governance & Zero-Trust Verification", "Tier 3: Automated Micro-segmentation & Isolation", "Tier 4: Dynamic Threat Response Playbooks"], "notes": "Speaker notes"}},
    {{"layout": "matrix", "title": "Risk-Value Prioritization Quadrant", "subtitle": "Resource allocation matrix", "bullets": ["High Impact / High Urgency: Critical Infrastructure Isolation", "High Impact / Low Urgency: Long-term Cryptographic Agility", "Low Impact / High Urgency: Phishing Awareness Drills", "Low Impact / Low Urgency: Legacy Archival Migration"], "notes": "Speaker notes"}},
    {{"layout": "comparison", "title": "Legacy vs Adaptive Posture", "subtitle": "Operational shift", "left_title": "Legacy Perimeter", "left": ["Point-in-time audits", "Siloed response"], "right_title": "Adaptive Defense", "right": ["Continuous telemetry", "Automated orchestration"], "notes": "Speaker notes"}},
    {{"layout": "table", "title": "Resilience Capability Matrix", "subtitle": "Benchmark comparison", "table_columns": ["Pillar", "Baseline", "Target State", "Strategic Imperative"], "table_rows": [["Detection", "18 Days", "< 2 Hours", "AI Telemetry"], ["Containment", "Manual", "Automated Playbooks", "Zero Trust"]], "notes": "Speaker notes"}}
  ],
  "conclusion": "Closing executive takeaway"
}}
"""
    raw_data = await _call_json(
        llm, draft_prompt, progress, "Drafting presentation content"
    )
    data = _coerce(raw_data)

    data = _post_process_presentation_slides(
        data,
        target_n,
        perspective,
        titles,
        extracted_tables,
        extracted_images,
        doodles_map,
    )
    return data


async def generate_document(
    notebook: Notebook,
    kind: ExportKind,
    options: Optional[StudioOptions] = None,
    model_id: Optional[str] = None,
    progress: Optional[Progress] = None,
) -> StudioDocument:
    o = options or StudioOptions()
    o.length = norm_length(o.length)  # type: ignore[assignment]
    progress = progress or _noop
    await progress(f'Reading notebook "{notebook.name}"')
    pasted: List[Table] = []
    if kind == "spreadsheet":
        from open_notebook.exports.pasted import parse_pasted_tables

        pasted = parse_pasted_tables(o.instructions)
        if pasted:
            await progress(
                f"Found {sum(len(t.rows) for t in pasted)} row(s) of figures in your request to enter"
            )
    try:
        (
            material,
            titles,
            extracted_tables,
            extracted_images,
        ) = await gather_notebook_content_and_assets(notebook)
    except EmptyNotebookError:
        inst = getattr(o, "instructions", None) or ""
        if pasted:
            material = "(Pasted sources)"
        elif inst.strip():
            material = (
                f"Topic and instructions:\n{inst.strip()}\n\n"
                f"Please synthesize an authoritative, professional, and comprehensive document based on these instructions."
            )
        else:
            material = (
                f"Subject: {notebook.name}\n"
                f"Please synthesize an authoritative, professional, and comprehensive document covering strategic objectives, core capabilities, implementation roadmap, and value metrics."
            )
        titles, extracted_tables, extracted_images = ["Document Subject"], [], []
    await progress(
        f"Loaded {len(material):,} characters from {len(titles)} source(s) ("
        f"{len(extracted_tables)} table(s), {len(extracted_images)} image(s))"
    )

    from open_notebook.tut.client import TutModel

    if kind == "presentation":
        llm = TutModel(model_id, temperature=0.75)
        data = await _generate_presentation(
            llm,
            notebook,
            material,
            titles,
            extracted_tables,
            extracted_images,
            o,
            progress,
        )
        await progress(f"Drafted {len(data['slides'])} content slides")
    elif kind == "infographic" and (
        o.blueprint
        or o.diagram_type == "blueprint"
        or (o.instructions and '"nodes"' in o.instructions and '"edges"' in o.instructions)
    ):
        from open_notebook.craft.studio.blueprint import parse_blueprint_spec

        bp_raw = o.blueprint or o.instructions
        spec = parse_blueprint_spec(bp_raw, default_title=notebook.name)
        await progress(
            f"Synthesizing visual blueprint topology ({len(spec.nodes)} nodes, {len(spec.edges)} edges)"
        )
        data = {
            "title": spec.title,
            "subtitle": spec.subtitle,
            "summary": spec.subtitle,
            "diagram_type": "blueprint",
            "blueprint": bp_raw,
            "sections": [],
            "slides": [],
            "tables": [],
            "stats": [],
            "key_points": [n.label for n in spec.nodes[:6]],
            "recommendations": [],
            "conclusion": (
                f"Topology synthesized with {len(spec.nodes)} nodes and "
                f"{len(spec.edges)} edges via {spec.layout_algorithm}."
            ),
        }
    else:
        prompt = build_prompt(notebook, kind, material, o)
        llm = TutModel(model_id)
        data = _coerce(await _call_json(llm, prompt, progress, "Drafting structure"))

        # Augment tables if extracted tables exist and none were generated
        if extracted_tables and not data.get("tables"):
            data["tables"] = [
                t.model_dump() if hasattr(t, "model_dump") else t
                for t in extracted_tables[:4]
            ]
        if kind == "spreadsheet" and pasted:
            # The user's figures are entered exactly as pasted; the model's tables never replace them.
            data["tables"] = [t.model_dump() for t in pasted]
        elif kind == "spreadsheet" and not data["tables"]:
            await progress(
                "No numeric tables found in the material; building from key figures"
            )
            if data["stats"]:
                data["tables"] = [
                    {
                        "name": "Key figures",
                        "columns": ["Measure", "Value"],
                        "rows": [
                            [st["label"], _num(st["value"])] for st in data["stats"]
                        ],
                    }
                ]
        elif kind in ("report", "summary"):
            if extracted_images and data.get("sections"):
                for idx, sec in enumerate(data["sections"]):
                    if idx < len(extracted_images) and not sec.get("image_path"):
                        sec["image_path"] = extracted_images[idx]["path"]
                        sec["image_caption"] = extracted_images[idx].get("caption", "")

    if kind == "report":
        data["sections"] = (data.get("sections") or [])[
            : {"short": 3, "medium": 5, "long": 8}[o.length]
        ]
        await _expand_long(llm, notebook, material, data, o, progress)
    return StudioDocument(
        kind=kind,
        sources=titles if o.include_sources else [],
        notebook_name=notebook.name,
        options=o,
        **data,
    )


async def rewrite_section(
    notebook: Notebook,
    title: str,
    heading: str,
    current: str,
    min_words: int,
    options: StudioOptions,
    model_id: Optional[str] = None,
    progress: Optional[Progress] = None,
) -> str:
    """Deeper draft of one report chapter, used by the audit loop for thin chapters."""
    from open_notebook.tut.client import TutModel

    material, _, _, _ = await gather_notebook_content_and_assets(notebook)
    depth = SECTION_DEPTH.get(norm_length(options.length), SECTION_DEPTH["medium"])
    prompt = f"""You are rewriting one chapter of an MCIT report titled "{title}".
Chapter heading: {heading}
The current draft is too short ({len(current.split())} words). Write at least {min_words + 40} words.
{depth} Use ONLY facts from the material; go deeper (context, figures, what they mean, what follows).
Audience: {options.audience}. Tone: {options.tone}.
{_writing_rules()}

CURRENT DRAFT:
{current}

MATERIAL:
{material[:9000]}

CRITICAL FORMAT REQUIREMENT:
Return ONLY a valid JSON object: {{"body": "paragraphs separated by blank lines"}}
Start directly with '{{' and terminate with '}}'. No extra commentary or markdown.
"""
    part = await _call_json(
        TutModel(model_id), prompt, progress or _noop, f"Rewriting {heading}"
    )
    return str(part.get("body") or "")
