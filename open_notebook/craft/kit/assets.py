"""Constant assets of the document kit and their readiness.

Layout (``open_notebook/craft/kit/assets/``)::

    covers/cover-hero.png   first slide / cover page of every deck and report
    covers/cover-end.png    last slide / back cover of every deck and report
    covers/cover-clean.png  clean variant (rare)
    fonts/                  Nohemi (Regular, Bold), Libre Franklin, Inter
    doodles/                Open Doodles SVGs (CC0) for sketchnotes
    templates/<kind>/       approved reference files (see templates.py)
    mcit-logo.png           logo, always placed on a white card

``CRAFT_KIT_DIR`` overrides the location (for example a mounted volume that
carries the approved binaries in production).
"""

from __future__ import annotations

import os
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path
from typing import Any, Dict, List, Optional

ASSETS_DIR = Path(os.getenv("CRAFT_KIT_DIR") or Path(__file__).parent / "assets")

COVERS = ASSETS_DIR / "covers"
FONTS_DIR = ASSETS_DIR / "fonts"
DOODLES = ASSETS_DIR / "doodles"
TEMPLATES_DIR = ASSETS_DIR / "templates"
LOGO = ASSETS_DIR / "mcit-logo.png"

HERO = COVERS / "cover-hero.png"
END = COVERS / "cover-end.png"
CLEAN = COVERS / "cover-clean.png"

# font family -> {style: file}
FONT_FILES: Dict[str, Dict[str, str]] = {
    "Nohemi": {"Regular": "Nohemi-Regular.ttf", "Bold": "Nohemi-Bold.ttf"},
    "Libre Franklin": {
        "Regular": "LibreFranklin-Regular.ttf",
        "Medium": "LibreFranklin-Medium.ttf",
        "SemiBold": "LibreFranklin-SemiBold.ttf",
        "Bold": "LibreFranklin-Bold.ttf",
    },
    "Inter": {"Regular": "Inter-Regular.ttf", "SemiBold": "Inter-SemiBold.ttf", "Bold": "Inter-Bold.ttf"},
}

# Nohemi is also accepted as .otf
_ALT_EXT = (".ttf", ".otf")


def font_path(family: str, style: str = "Regular") -> Optional[Path]:
    name = FONT_FILES.get(family, {}).get(style)
    if not name:
        return None
    stem = Path(name).stem
    for ext in _ALT_EXT:
        p = FONTS_DIR / f"{stem}{ext}"
        if p.exists():
            return p
    return None


def head_family() -> str:
    """Nohemi when installed; Libre Franklin keeps documents rendering otherwise."""
    return "Nohemi" if font_path("Nohemi", "Bold") else "Libre Franklin"


@dataclass(frozen=True)
class Requirement:
    id: str
    path: Path
    needed_by: tuple
    purpose: str


REQUIREMENTS: List[Requirement] = [
    Requirement("cover-hero", HERO, ("presentation", "report"), "Opening cover art"),
    Requirement("cover-end", END, ("presentation", "report"), "Closing cover art"),
    # Headings fall back to Libre Franklin if Nohemi is missing: listed, not blocking.
    Requirement("font-nohemi", FONTS_DIR / "Nohemi-Bold.ttf", (), "Heading font (Nohemi)"),
    Requirement("font-libre-franklin", FONTS_DIR / "LibreFranklin-Regular.ttf", ("presentation", "report", "infograph", "spreadsheet"), "Body font"),
    Requirement("doodles", DOODLES, ("infograph",), "Sketchnote artwork"),
    Requirement("logo", LOGO, ("presentation", "report"), "MCIT logo"),
]


def _present(req: Requirement) -> bool:
    if req.id == "font-nohemi":
        return font_path("Nohemi", "Bold") is not None
    if req.path.is_dir():
        return any(req.path.glob("*.svg"))
    return req.path.exists()


def _rel(p: Path) -> str:
    try:
        return str(p.relative_to(ASSETS_DIR))
    except ValueError:
        return p.name


def readiness() -> Dict[str, Any]:
    """Which assets are installed, and what each Studio feature still needs."""
    items = [
        {"id": r.id, "purpose": r.purpose, "installed": _present(r), "file": _rel(r.path)}
        for r in REQUIREMENTS
    ]
    missing_by_feature: Dict[str, List[str]] = {}
    for r in REQUIREMENTS:
        if not _present(r):
            for f in r.needed_by:
                missing_by_feature.setdefault(f, []).append(r.purpose)
    return {"assets": items, "missing": missing_by_feature}


def missing_for(feature: str) -> List[str]:
    return list(readiness()["missing"].get(feature, []))


@lru_cache(maxsize=1)
def doodles() -> List[Path]:
    return sorted(p for p in DOODLES.glob("*.svg") if p.stat().st_size > 500)
