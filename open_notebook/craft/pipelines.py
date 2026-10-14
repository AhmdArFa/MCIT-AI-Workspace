"""Studio: exactly four features, each with one approved template family.

=================  =====================================================
Feature            Pipeline (engines, outputs)
=================  =====================================================
presentation       PptxGenJS builds, DeckCraft renders and exports (pptx, pdf)
report             ReportLab and PdfCraft (pdf), filled Word master checked by WordCraft (docx)
infograph          sketchnote layout, VectorCraft render (png, pdf, svg)
spreadsheet        GridCraft data entry, formulas and checks (xlsx)
=================  =====================================================

Every feature runs the audit-refactor loop (``open_notebook.craft.audit``).
Old preset ids (``sketchnote``, ``noir_sheet``) resolve to their feature.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Awaitable, Callable, Dict, Literal, Tuple

from open_notebook.craft.kit.templates import ALIASES, TEMPLATES, canonical
from open_notebook.craft.studio import Rendered
from open_notebook.craft.studio.direction import Direction

Mode = Literal["dark", "light"]
PresetId = Literal["presentation", "report", "infograph", "spreadsheet"]
Progress = Callable[[str], Awaitable[None]]


@dataclass(frozen=True)
class Preset:
    id: str
    name: str
    description: str
    kind: str  # StudioDocument kind used for drafting
    modes: Tuple[str, ...]
    outputs: Tuple[str, ...]
    engines: Tuple[str, ...]
    lengths: Tuple[str, ...] = ()


_KIND = {"presentation": "presentation", "report": "report", "infograph": "infographic", "spreadsheet": "spreadsheet"}

PRESETS: Dict[str, Preset] = {
    fid: Preset(
        fid,
        t.name,
        t.description,
        _KIND[fid],
        t.modes,
        t.outputs,
        t.engines,
        ("short", "medium", "long") if fid == "report" else (),
    )
    for fid, t in TEMPLATES.items()
}


async def run_pipeline(feature: str, doc, mode: str, length: str, direction: Direction, progress: Progress, rewrite=None) -> Rendered:
    feature = canonical(feature)
    if feature == "presentation":
        from open_notebook.craft.studio import deck

        return await deck.render(doc, mode, direction, progress)
    if feature == "report":
        from open_notebook.craft.studio import report

        return await report.render(doc, mode, length, direction, progress, rewrite=rewrite)
    if feature == "infograph":
        from open_notebook.craft.studio import infograph

        return await infograph.render(doc, mode, direction, progress)
    if feature == "spreadsheet":
        from open_notebook.craft.studio import sheet

        return await sheet.render(doc, mode, direction, progress)
    raise ValueError(f"Unknown Studio feature {feature}")


__all__ = ["ALIASES", "Mode", "PRESETS", "Preset", "PresetId", "canonical", "run_pipeline"]
