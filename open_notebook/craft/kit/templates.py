"""Master template index: one approved template family per Studio feature.

Each feature has a DEFAULT (the approved template, generated immediately with
the user's content) and a CUSTOM path (start from the reference design, apply
the user's direction, then run the audit-refactor loop until zero issues or
five passes).

Reference binaries live in ``assets/templates/<kind>/``. The generators
reproduce the approved structure in code, so a template file is a design
reference for QA, not a runtime dependency.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, Literal, Tuple

from open_notebook.craft.kit.assets import TEMPLATES_DIR

Feature = Literal["presentation", "report", "infograph", "spreadsheet"]
FEATURES: Tuple[Feature, ...] = ("presentation", "report", "infograph", "spreadsheet")

# Studio feature id -> pipeline id (old preset ids kept as aliases for saved jobs)
ALIASES = {"sketchnote": "infograph", "noir_sheet": "spreadsheet"}


@dataclass(frozen=True)
class Template:
    feature: Feature
    name: str
    description: str
    modes: Tuple[str, ...]
    outputs: Tuple[str, ...]
    engines: Tuple[str, ...]
    structure: Tuple[str, ...]
    reference_files: Tuple[str, ...] = field(default_factory=tuple)
    skill: str = ""

    def references_present(self) -> Dict[str, bool]:
        return {f: (TEMPLATES_DIR / f).exists() for f in self.reference_files}


TEMPLATES: Dict[str, Template] = {
    "presentation": Template(
        "presentation",
        "Presentation",
        "Midnight Noir briefing deck: constant hero and end covers, varied layouts, native charts.",
        ("dark", "light"),
        ("pptx", "pdf"),
        ("deckcraft",),
        (
            "cover (hero art)",
            "agenda",
            "section opener",
            "hero stat",
            "chart",
            "two column",
            "findings",
            "timeline",
            "table",
            "closing (end art)",
        ),
        ("powerpoint/MCIT-WSIS-Egypt-30-DARK.pptx", "powerpoint/MCIT-WSIS-Egypt-30-LIGHT.pptx"),
        "powerpoint",
    ),
    "report": Template(
        "report",
        "Report",
        "Noir report as a print PDF and an editable Word document, short, medium or long.",
        ("dark", "light"),
        ("pdf", "docx"),
        ("pdfcraft", "wordcraft"),
        ("cover (hero art)", "contents", "at a glance", "chapters with figures", "findings", "back cover (end art)"),
        (
            "report/MCIT-WSIS-Report-Noir-DARK.pdf",
            "report/MCIT-WSIS-Report-Noir-LIGHT.pdf",
            "word/MCIT-WSIS-Report-Noir-DARK.docx",
            "word/MCIT-WSIS-Report-Noir-LIGHT.docx",
        ),
        "pdf-report",
    ),
    "infograph": Template(
        "infograph",
        "Infograph",
        "One-page sketchnote: speech-bubble title, two columns, hand-drawn artwork, verdict box.",
        ("light", "dark"),
        ("png", "pdf", "svg"),
        ("vectorcraft",),
        ("speech-bubble title", "two columns of numbered blocks", "doodle per block", "arrows", "verdict box"),
        ("infograph/wsis-sketchnote.png", "infograph/sketchnote-toolchain.png"),
        "infograph",
    ),
    "spreadsheet": Template(
        "spreadsheet",
        "Spreadsheet",
        "Noir monthly report workbook: you paste the figures, Tut enters them, every computed cell is a formula.",
        ("dark", "light"),
        ("xlsx",),
        ("gridcraft",),
        ("title band", "input period columns", "computed columns (formulas)", "totals (formulas)", "chart"),
        (
            "spreadsheet/MCIT-ICT-Monthly-Report-Noir-Template.xlsx",
            "spreadsheet/MCIT-ICT-2025-FullYear-Noir-Template.xlsx",
        ),
        "spreadsheet",
    ),
}


def canonical(feature: str) -> str:
    return ALIASES.get(feature, feature)
