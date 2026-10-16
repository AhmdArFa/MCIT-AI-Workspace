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

# Executive Crimson / Red & White theme requested by leadership
RED_WHITE = Theme(
    mode="light",
    bg="FFFFFF",
    surface="F9FAFB",
    border="E5E7EB",
    text="111827",
    muted="6B7280",
    accent="C00000",
    premium="8B0000",
    series=("C00000", "8B0000", "EF4444", "4B5563"),
    on_accent="FFFFFF",
)

# Diplomatic Royal Navy & Gold
ROYAL_NAVY = Theme(
    mode="dark",
    bg="0B192C",
    surface="1E3E62",
    border="2D4059",
    text="FFFFFF",
    muted="CBD5E1",
    accent="E2B659",
    premium="FFD700",
    series=("E2B659", "1E3E62", "4B70F5", "CBD5E1"),
    on_accent="0B192C",
)

# Sovereign Emerald & Gold
EMERALD = Theme(
    mode="dark",
    bg="0A1F17",
    surface="113526",
    border="1C4E39",
    text="FFFFFF",
    muted="94A3B8",
    accent="10B981",
    premium="D4AF37",
    series=("10B981", "D4AF37", "059669", "CBD5E1"),
    on_accent="FFFFFF",
)


def theme(mode: str | None) -> Theme:
    return LIGHT if mode == "light" else DARK


def resolve_theme(
    preset: str | None = None,
    mode: str | None = None,
    primary_color: str | None = None,
    accent_color: str | None = None,
    bg_color: str | None = None,
    text_color: str | None = None,
) -> Theme:
    """Resolve theme with preset and custom color overrides."""
    p = (preset or mode or "dark").lower().strip()
    if any(k in p for k in ("red", "crimson", "ruby")):
        base = RED_WHITE
    elif any(k in p for k in ("navy", "royal", "blue")):
        base = ROYAL_NAVY
    elif any(k in p for k in ("emerald", "green", "saudi")):
        base = EMERALD
    elif "light" in p or "white" in p:
        base = LIGHT
    else:
        base = DARK

    # Clean hex helper
    def _clean(h: str | None) -> str | None:
        if not h:
            return None
        c = h.strip().lstrip("#").upper()
        return c if len(c) in (6, 8) else None

    bg = _clean(bg_color) or base.bg
    accent = _clean(accent_color) or _clean(primary_color) or base.accent
    text = _clean(text_color) or base.text

    # Calculate background luminance if custom bg provided
    r, g, b = hex_rgb(bg)
    luminance = 0.299 * r + 0.587 * g + 0.114 * b
    is_dark = luminance < 0.5
    resolved_mode: Mode = "dark" if is_dark else "light"
    surface = "111827" if is_dark else "F9FAFB"
    border = "374151" if is_dark else "E5E7EB"
    muted = "9CA3AF" if is_dark else "6B7280"

    return Theme(
        mode=resolved_mode,
        bg=bg,
        surface=base.surface if bg == base.bg else surface,
        border=base.border if bg == base.bg else border,
        text=text,
        muted=base.muted if text == base.text else muted,
        accent=accent,
        premium=base.premium,
        series=(accent, base.series[1], base.series[2], base.series[3]),
        on_accent="FFFFFF" if is_dark else "000000",
    )


def hex_rgb(value: str) -> Tuple[float, float, float]:
    v = value.lstrip("#")
    if len(v) < 6:
        v = (v + "000000")[:6]
    return tuple(int(v[i : i + 2], 16) / 255 for i in (0, 2, 4))  # type: ignore[return-value]
