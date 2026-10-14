"""Studio feature pipelines (presentation, report, infograph, spreadsheet).

Every pipeline takes the drafted ``StudioDocument``, the theme mode and the
design direction (``None`` for the approved default template, or the user's
custom direction) and returns ``Rendered``: the files plus the audit result.
"""

from __future__ import annotations

import re
import uuid
from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, List

from open_notebook import tenancy
from open_notebook.craft.audit import Issue


@dataclass
class Rendered:
    files: Dict[str, bytes]
    passes: int = 1
    issues: List[Issue] = field(default_factory=list)
    history: List[List[str]] = field(default_factory=list)

    @property
    def issue_text(self) -> List[str]:
        return [str(i) for i in self.issues]


def job_dir() -> Path:
    path = tenancy.craft_workspace() / "jobs" / uuid.uuid4().hex[:12]
    path.mkdir(parents=True, exist_ok=True)
    return path


def slug(text: str) -> str:
    return re.sub(r"[^A-Za-z0-9]+", "-", text).strip("-")[:60] or "document"
