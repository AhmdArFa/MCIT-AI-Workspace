"""Midnight Noir design tokens (single source: kit PALETTE.md, 2026-10-14).

Rules carried by every renderer:

* Dark is the default; light only when the user asks.
* One accent per page or slide: Pulse for data, Pale Gold for a single
  premium moment. Never both competing on one page.
* Pale Gold is never body text and never a chart series.
* The gold ornament lives on the constant covers only.
* No gradients, no glows, no glass, no decorative shapes.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Literal, Tuple

Mode = Literal["dark", "light"]

MIDNIGHT = "010612"
ABYSS = "030F1F"
ROYAL = "1E507A"
PULSE = "16A6E9"
PALE_GOLD = "F7EF8A"
WHITE = "FFFFFF"
SILVER = "B9C2CE"


@dataclass(frozen=True)
class Fonts:
    head: str = "Nohemi"
    head_fallback: str = "Libre Franklin"
    body: str = "Libre Franklin"
    cover: str = "Inter"


FONTS = Fonts()


@dataclass(frozen=True)
class Theme:
    mode: Mode
    bg: str  # page / slide background
    surface: str  # panels, cards
    border: str  # hairlines
    text: str  # primary text
    muted: str  # secondary text
    accent: str  # Pulse: data, highlights
    premium: str  # Pale Gold (dark) / deep gold (light): one moment per page
    series: Tuple[str, ...]  # chart series, accent first
    on_accent: str  # text on accent fills

    @property
    def is_dark(self) -> bool:
        return self.mode == "dark"


DARK = Theme(
    mode="dark",
    bg=MIDNIGHT,
    surface=ABYSS,
    border="1B2A40",
    text=WHITE,
    muted=SILVER,
    accent=PULSE,
    premium=PALE_GOLD,
    series=(PULSE, ROYAL, SILVER, "5C7A99"),
    on_accent=MIDNIGHT,
)

# Light shares structure and tokens; only the surfaces flip.
LIGHT = Theme(
    mode="light",
    bg=WHITE,
    surface="F2F5F9",
    border="DCE2EA",
    text=MIDNIGHT,
    muted="4A5568",
    accent=ROYAL,
    premium="8A7A12",
    series=(ROYAL, PULSE, "6B7A8F", SILVER),
    on_accent=WHITE,
)


def theme(mode: str | None) -> Theme:
    return LIGHT if mode == "light" else DARK


def hex_rgb(value: str) -> Tuple[float, float, float]:
    v = value.lstrip("#")
    return tuple(int(v[i : i + 2], 16) / 255 for i in (0, 2, 4))  # type: ignore[return-value]
