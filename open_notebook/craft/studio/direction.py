"""Design direction for the custom path.

The default option uses the approved template as is. A custom request keeps
the template (structure, covers, palette, type) and applies the user's
direction through a small set of explicit levers, so every custom output
stays inside the Noir system and passes the same audit.
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Any, Dict, Optional

from open_notebook.craft.kit.tokens import ROYAL, Theme


@dataclass(frozen=True)
class Direction:
    custom: bool = False
    text: str = ""
    density: str = "standard"  # compact | standard | airy
    visual: bool = False  # prefer cards, stats, timelines over bullet lists
    accent: str = "pulse"  # pulse | royal
    data_first: bool = False  # lead with figures and charts

    @property
    def body_scale(self) -> float:
        return {"compact": 0.9, "standard": 1.0, "airy": 1.06}[self.density]

    def accent_value(self, t: Theme) -> str:
        if self.accent == "royal" and t.is_dark:
            return ROYAL
        return t.accent

    def apply_to_slide(self, s: Dict[str, Any]) -> Dict[str, Any]:
        s = dict(s)
        if self.visual and s.get("layout") == "bullets":
            n = len(s.get("bullets") or [])
            if 2 <= n <= 4:
                s["layout"] = "cards"
            elif n == 5:
                s["layout"] = "process"
                s["steps"] = s.get("bullets")
        if self.density == "compact":
            for k in ("bullets", "left", "right", "steps"):
                s[k] = (s.get(k) or [])[:4]
        return s

    def describe(self) -> str:
        if not self.custom:
            return "approved default template"
        bits = [self.density]
        if self.visual:
            bits.append("visual layouts")
        if self.data_first:
            bits.append("data first")
        if self.accent != "pulse":
            bits.append(f"{self.accent} accent")
        return "custom design (" + ", ".join(bits) + ")"


_VISUAL = re.compile(r"\b(visual|cards?|icons?|less text|minimal text|infographic|diagram)\w*", re.I)
_COMPACT = re.compile(r"\b(compact|concise|brief|dense|short(er)? bullets?|less text|minimal)\b", re.I)
_AIRY = re.compile(r"\b(airy|spacious|breathing|large text|bigger text|readable)\b", re.I)
_DATA = re.compile(r"\b(data|numbers|figures|charts?|kpis?|statistics|metrics)\b", re.I)
_ROYAL = re.compile(r"\b(royal|deep blue|navy accent|calmer|conservative)\b", re.I)


def parse(design: Optional[str], template: str = "default") -> Direction:
    """``template`` is "default" or "custom"; ``design`` is the user's direction."""
    text = (design or "").strip()
    if template != "custom" and not text:
        return Direction()
    return Direction(
        custom=True,
        text=text,
        density="compact" if _COMPACT.search(text) else ("airy" if _AIRY.search(text) else "standard"),
        visual=bool(_VISUAL.search(text)),
        accent="royal" if _ROYAL.search(text) else "pulse",
        data_first=bool(_DATA.search(text)),
    )
