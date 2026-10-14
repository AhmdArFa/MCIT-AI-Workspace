"""The MCIT document skills, served to Tut Agent over MCP."""

from __future__ import annotations

import re
from pathlib import Path
from typing import Dict, List

SKILLS_DIR = Path(__file__).parent / "skills"


def index() -> List[Dict[str, str]]:
    out = []
    for p in sorted(SKILLS_DIR.glob("*.md")):
        text = p.read_text("utf-8")
        m = re.search(r"^description:\s*(.+)$", text, re.M)
        out.append({"name": p.stem, "description": m.group(1).strip() if m else ""})
    return out


def read(name: str) -> str:
    p = (SKILLS_DIR / f"{name}.md").resolve()
    if p.parent != SKILLS_DIR.resolve() or not p.exists():
        raise ValueError(f"Unknown skill {name}")
    return p.read_text("utf-8")
