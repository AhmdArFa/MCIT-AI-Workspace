"""Read the figures a user pastes into a Studio or Tut request.

Agent-as-data-entry needs the exact numbers the user typed, so tables are
parsed deterministically (markdown pipes, tab or comma separated lines,
"Label: v1, v2" lines). The model only names and explains them.
"""

from __future__ import annotations

import re
from typing import Any, List, Optional

from open_notebook.exports.content import Table

_NUM = re.compile(r"^[-+]?(\d{1,3}(,\d{3})+|\d+)(\.\d+)?%?$")


def _cell(v: str) -> Any:
    t = v.strip().strip("*").strip()
    if _NUM.match(t.replace(" ", "")):
        n = t.replace(",", "").replace("%", "").replace(" ", "")
        try:
            f = float(n)
            return int(f) if f.is_integer() and "." not in n else f
        except ValueError:
            return t
    if t in ("", "-", "n/a", "N/A", "\u2014"):
        return ""
    return t


def _split(line: str) -> Optional[List[str]]:
    if "|" in line:
        cells = [c for c in line.strip().strip("|").split("|")]
        return [c.strip() for c in cells]
    if "\t" in line:
        return [c.strip() for c in line.split("\t")]
    m = re.match(r"^\s*([^:,\d][^:]*):\s*(.+)$", line)
    if m and re.search(r"\d", m.group(2)):
        return [m.group(1).strip()] + [c.strip() for c in re.split(r"[;,]\s+|;|\s{2,}", m.group(2))]
    if line.count(",") >= 1 and not re.search(r"\d,\d{3}", line):
        return [c.strip() for c in line.split(",")]
    return None


def parse_pasted_tables(text: Optional[str]) -> List[Table]:
    if not text:
        return []
    tables: List[Table] = []
    block: List[List[str]] = []
    name = ""

    def flush() -> None:
        nonlocal block, name
        rows = [r for r in block if any(c for c in r)]
        if len(rows) >= 2:
            width = max(len(r) for r in rows)
            rows = [r + [""] * (width - len(r)) for r in rows]
            header, body = rows[0], rows[1:]
            nums = [_cell(c) for c in header[1:]]
            all_numeric = all(isinstance(v, (int, float)) for v in nums)
            years = all(isinstance(v, int) and 1900 <= v <= 2100 for v in nums)
            if all_numeric and not years:  # no header row given: the first row is data
                header, body = ["Indicator"] + [f"Value {i}" for i in range(1, width)], rows
            parsed = [[_cell(c) if j else c.strip() for j, c in enumerate(r)] for r in body]
            if sum(isinstance(v, (int, float)) for r in parsed for v in r[1:]) >= 2:
                tables.append(Table(name=name or f"Table {len(tables) + 1}", columns=[h.strip() or "Indicator" for h in header], rows=parsed))
        block, name = [], ""

    for raw in text.splitlines():
        line = raw.rstrip()
        if re.fullmatch(r"\s*\|?\s*:?-{2,}.*", line):
            continue  # markdown separator row
        cells = _split(line) if line.strip() else None
        if cells and len(cells) >= 2:
            block.append(cells)
        else:
            flush()
            if line.strip() and not block:
                name = re.sub(r"[#*:]+", "", line).strip()[:60]
    flush()
    return tables
