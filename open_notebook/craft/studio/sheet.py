"""Spreadsheet: the Noir report workbook built with GridCraft.

Agent-as-data-entry: the figures the user pasted (or the tables Tut extracted
from the notebook) go into the input columns exactly as given. Every
computed column and total is a formula with a blank guard, never a typed
value. The audit recalculates the workbook with GridCraft, reads the formulas
back and fails on any typed value in a computed cell or any error value.
"""

from __future__ import annotations

import copy
import json
import re
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional

from open_notebook.craft.audit import Issue, audit_loop, strip_dashes
from open_notebook.craft.kit.assets import head_family
from open_notebook.craft.kit.tokens import FONTS, theme
from open_notebook.craft.runner import run_cli
from open_notebook.craft.studio import Rendered, job_dir
from open_notebook.craft.studio.direction import Direction

FIRST_ROW = 5  # header row; data starts below it


def col(n: int) -> str:
    s = ""
    n += 1
    while n:
        n, r = divmod(n - 1, 26)
        s = chr(65 + r) + s
    return s


def _num(v: Any) -> Optional[float]:
    if isinstance(v, bool):
        return None
    if isinstance(v, (int, float)):
        return float(v)
    t = str(v or "").strip().replace(",", "")
    if re.fullmatch(r"[-+]?\d*\.?\d+", t):
        return float(t)
    return None


def _safe_text(v: Any) -> str:
    t = str(v if v is not None else "")
    return "'" + t if t[:1] in ("=", "+", "-", "@") and _num(t) is None else t


@dataclass
class SheetSpec:
    name: str
    title: str
    label_header: str
    periods: List[str]  # input column headers
    rows: List[List[Any]]  # [label, v1, v2, ...] (None for blanks)
    computed: List[str] = field(default_factory=list)  # e.g. ["Change", "Change %"]
    total: bool = True  # only when every row shares one unit
    units: List[str] = field(default_factory=list)  # per row; a Unit column when any is known


@dataclass
class WorkbookPlan:
    title: str
    subtitle: str
    mode: str
    sheets: List[SheetSpec]
    width_label: float = 34
    width_num: float = 14


def build_plan(doc, mode: str, direction: Direction) -> WorkbookPlan:
    sheets: List[SheetSpec] = []
    used = set()
    tables = list(doc.tables) + [s.table for s in doc.sections if s.table]
    for t in tables:
        if not t.columns or not t.rows:
            continue
        numeric_cols = [i for i in range(1, len(t.columns)) if sum(_num(r[i]) is not None for r in t.rows if i < len(r)) >= max(1, len(t.rows) // 2)]
        if not numeric_cols:
            continue
        name = re.sub(r"[\[\]:*?/\\]", "", strip_dashes(t.name or f"Table {len(sheets) + 1}"))[:28] or f"Table {len(sheets) + 1}"
        while name in used:
            name = name[:25] + f" {len(sheets) + 1}"
        used.add(name)
        rows = []
        for r in t.rows[:200]:
            r = list(r) + [None] * len(t.columns)
            rows.append([strip_dashes(str(r[0]))] + [_num(r[i]) if _num(r[i]) is not None else (None if str(r[i] or "").strip() in ("", "-", "n/a", "N/A") else r[i]) for i in numeric_cols])
        row_units = []
        for r in rows:
            m = re.search(r"\s*\(([^)]{1,24})\)\s*$", str(r[0]))
            row_units.append(m.group(1).strip() if m else "")
            if m:
                r[0] = str(r[0])[: m.start()].strip()
        units = {u.lower() for u in row_units}
        sheets.append(
            SheetSpec(
                total=len(units) == 1,
                units=row_units if any(row_units) else [],
                name=name,
                title=strip_dashes(t.name or doc.title),
                label_header=strip_dashes(t.columns[0]) or "Indicator",
                periods=[strip_dashes(str(t.columns[i])) for i in numeric_cols],
                rows=rows,
                computed=["Change", "Change %"] if len(numeric_cols) >= 2 else [],
            )
        )
    if not sheets and doc.stats:
        rows = [[strip_dashes(s.label), _num(s.value)] for s in doc.stats]
        sheets.append(SheetSpec("Key figures", "Key figures", "Indicator", ["Value"], rows, []))
    return WorkbookPlan(strip_dashes(doc.title), strip_dashes(doc.subtitle or doc.summary[:120]), mode, sheets)


def sheet_commands(plan: WorkbookPlan, idx: int, s: SheetSpec) -> List[str]:
    t = theme(plan.mode)
    hf, bf = head_family(), FONTS.body
    n_in = len(s.periods)
    ncols = 1 + n_in + len(s.computed) + (1 if s.units else 0)
    last = col(ncols - 1)
    h = FIRST_ROW
    r0, r1 = h + 1, h + len(s.rows)
    tot = r1 + 1
    cmds: List[str] = []
    q = lambda d: json.dumps(d, ensure_ascii=False)  # noqa: E731
    sh = {"sheet": s.name}
    cmds.append(f"cell.set={q({**sh, 'cell': 'A1', 'input': _safe_text(s.title or plan.title)})}")
    cmds.append(f"cell.set={q({**sh, 'cell': 'A2', 'input': _safe_text(plan.subtitle or 'MCIT AI')})}")
    header = [s.label_header] + s.periods + s.computed + (["Unit"] if s.units else [])
    cmds.append(f"range.setValues={q({**sh, 'range': f'A{h}', 'values': [header]})}")
    values = []
    for i, r in enumerate(s.rows):
        row: List[Any] = [_safe_text(r[0])]
        for v in r[1 : 1 + n_in]:
            row.append(v if isinstance(v, (int, float)) else (None if v is None else _safe_text(v)))
        rr = r0 + i
        if s.computed:
            a, b = col(n_in - 1), col(n_in)  # previous and latest period
            row.append(f'=IF(OR({b}{rr}="",{a}{rr}=""),"",{b}{rr}-{a}{rr})')
            row.append(f'=IF(OR({b}{rr}="",{a}{rr}="",{a}{rr}=0),"",({b}{rr}-{a}{rr})/{a}{rr})')
        if s.units:
            row.append(_safe_text(s.units[i] if i < len(s.units) else ""))
        values.append(row)
    if values:
        cmds.append(f"range.setValues={q({**sh, 'range': f'A{r0}', 'values': values})}")
    if s.total:
        total = ["Total"]
        for c in range(1, 1 + n_in):
            L = col(c)
            total.append(f'=IF(COUNT({L}{r0}:{L}{r1})=0,"",SUM({L}{r0}:{L}{r1}))')
        if s.computed:
            a, b = col(n_in - 1), col(n_in)
            both = f'({a}{r0}:{a}{r1}<>"")*({b}{r0}:{b}{r1}<>"")'
            total.append(f'=IF(SUMPRODUCT({both})=0,"",SUMPRODUCT({both}*({b}{r0}:{b}{r1}-{a}{r0}:{a}{r1})))')
            total.append(f'=IF(OR({col(n_in + 1)}{tot}="",SUMPRODUCT({both}*{a}{r0}:{a}{r1})=0),"",{col(n_in + 1)}{tot}/SUMPRODUCT({both}*{a}{r0}:{a}{r1}))')
        cmds.append(f"range.setValues={q({**sh, 'range': f'A{tot}', 'values': [total]})}")
    else:
        tot = r1

    used = f"A1:{last}{tot + 1}"
    style: List[tuple[str, Dict[str, Any]]] = [
        ("home.fillColor", {"range": used, "color": "#" + t.bg}),
        ("home.fontName", {"range": used, "name": bf}),
        ("home.fontSize", {"range": used, "size": 11}),
        ("home.fontColor", {"range": used, "color": "#" + t.text}),
        ("home.mergeCells", {"range": f"A1:{last}1"}),
        ("home.fontName", {"range": "A1", "name": hf}),
        ("home.fontSize", {"range": "A1", "size": 18}),
        ("home.bold", {"range": "A1"}),
        ("home.fontColor", {"range": "A2", "color": "#" + t.muted}),
        ("home.fillColor", {"range": f"A{h}:{last}{h}", "color": "#" + t.accent}),
        ("home.fontColor", {"range": f"A{h}:{last}{h}", "color": "#" + t.on_accent}),
        ("home.bold", {"range": f"A{h}:{last}{h}"}),
        ("home.fillColor", {"range": f"A{tot}:{last}{tot}", "color": "#" + t.surface}),
        ("home.bold", {"range": f"A{tot}:{last}{tot}"}),
        ("home.borders", {"range": f"A{h}:{last}{tot}", "preset": "insideHorizontal", "color": "#" + t.border}),
        ("home.borders", {"range": f"A{tot}:{last}{tot}", "preset": "top", "color": "#" + t.accent}),
        ("home.numberFormat", {"range": f"B{r0}:{col(n_in)}{tot}", "code": "#,##0.##"}),
        ("home.columnWidth", {"range": "A1", "width": plan.width_label}),
        ("home.columnWidth", {"range": f"B1:{last}1", "width": plan.width_num}),
        ("home.rowHeight", {"range": "A1", "height": 30}),
    ]
    if s.computed:
        style += [
            ("home.numberFormat", {"range": f"{col(n_in + 1)}{r0}:{col(n_in + 1)}{tot}", "code": "+#,##0.##;[Red]-#,##0.##;0"}),
            # negatives in red, as in the approved monthly template
            ("home.numberFormat", {"range": f"{col(n_in + 2)}{r0}:{col(n_in + 2)}{tot}", "code": "+0.0%;[Red]-0.0%;0.0%"}),
        ]
    cmds += [f"{cid}={q({**sh, **params})}" for cid, params in style]
    cmds.append(f"view.freezePanes={q({**sh, 'cell': f'B{r0}'})}")
    if len(s.rows) >= 2:
        chart_at = f"{col(ncols + 1)}{h}"
        cmds.append(f"selection.set={q({**sh, 'range': f'A{h}:{col(n_in)}{r1}'})}")
        cmds.append(f"insert.chart={q({'range': f'A{h}:{col(n_in)}{r1}', 'type': 'column', 'subtype': 'clustered', 'title': s.title[:60], 'at': chart_at, 'width': 520, 'height': 300})}")
        cmds.append(f"chart.changeColors={q({'colors': ['#' + c for c in t.series]})}")
    return cmds


def all_commands(plan: WorkbookPlan) -> List[str]:
    cmds: List[str] = []
    for i, s in enumerate(plan.sheets):
        if i == 0:
            cmds.append(f"sheet.rename={json.dumps({'name': s.name})}")
        else:
            cmds.append(f"home.insertSheet={json.dumps({'name': s.name})}")
        cmds += sheet_commands(plan, i, s)
    cmds.append(f"sheet.activate={json.dumps({'sheet': plan.sheets[0].name})}")
    return cmds


async def render(doc, mode: str, direction: Direction, progress) -> Rendered:
    work = job_dir()
    plan = build_plan(doc, mode, direction)
    if not plan.sheets:
        from open_notebook.exceptions import InvalidInputError

        raise InvalidInputError("No figures to enter. Paste the figures in the request or add a source that contains tables.")
    cells = sum(len(s.rows) * len(s.periods) for s in plan.sheets)
    await progress(f"Template: Noir report workbook ({mode}), {len(plan.sheets)} sheet(s), {cells} figures to enter")

    async def build(p: WorkbookPlan, n: int) -> Dict[str, bytes]:
        script = work / f"build-{n}.jsonl"
        lines = []
        for c in all_commands(p):
            cid, _, params = c.partition("=")
            lines.append(json.dumps({"id": cid, "params": json.loads(params) if params else {}}))
        script.write_text("\n".join(lines), "utf-8")
        out = work / f"workbook-{n}.xlsx"
        await progress(f"GridCraft: entering figures and formulas (pass {n})")
        await run_cli("gridcraft", ["run", "--script", str(script), "--out", str(out), "--quiet"], cwd=work, timeout=300)
        return {"xlsx": out.read_bytes()}

    async def audit(p: WorkbookPlan, files: Dict[str, bytes], n: int) -> List[Issue]:
        issues: List[Issue] = []
        out = work / f"workbook-{n}.xlsx"
        try:
            await run_cli("gridcraft", ["check", str(out)], cwd=work)
        except Exception as e:
            issues.append(Issue("calc", f"GridCraft check failed: {str(e)[:160]}"))
        info = json.loads(await run_cli("gridcraft", ["info", str(out), "--json"], cwd=work) or "{}")
        sheet_names = [s.get("name") for s in info.get("sheets", [])] if isinstance(info.get("sheets"), list) else []
        for s in p.sheets:
            if sheet_names and s.name not in sheet_names:
                issues.append(Issue("sheet", f"Sheet {s.name} is missing"))
                continue
            n_in = len(s.periods)
            r0, r1 = FIRST_ROW + 1, FIRST_ROW + len(s.rows)
            last = col(n_in + len(s.computed))
            end = r1 + 1 if s.total else r1
            formulas = await run_cli("gridcraft", ["cat", str(out), "--sheet", s.name, "--range", f"A{r0}:{last}{end}", "--formulas", "--csv"], cwd=work)
            values = await run_cli("gridcraft", ["cat", str(out), "--sheet", s.name, "--range", f"A{r0}:{last}{end}", "--csv"], cwd=work)
            import csv
            import io

            frows = list(csv.reader(io.StringIO(formulas)))
            vrows = list(csv.reader(io.StringIO(values)))
            for i, fr in enumerate(frows):
                computed_cols = range(1 + n_in, 1 + n_in + len(s.computed))
                is_total = s.total and i == len(frows) - 1
                for c in list(computed_cols) + (list(range(1, 1 + n_in)) if is_total else []):
                    if c < len(fr) and not fr[c].startswith("="):
                        issues.append(Issue("typed", f"{col(c)}{r0 + i} holds a typed value instead of a formula", s.name))
                    elif c < len(fr) and 'IF(' not in fr[c].upper():
                        issues.append(Issue("guard", f"{col(c)}{r0 + i} has no blank guard", s.name))
                for c, v in enumerate(vrows[i] if i < len(vrows) else []):
                    if v.startswith("#") and v.endswith(("!", "?", "A")):
                        issues.append(Issue("error", f"{col(c)}{r0 + i} shows {v}", s.name))
                if not is_total and i < len(s.rows):
                    for c in range(1, 1 + n_in):
                        want = s.rows[i][c] if c < len(s.rows[i]) else None
                        got = vrows[i][c] if i < len(vrows) and c < len(vrows[i]) else ""
                        parsed = _num(got)
                        if isinstance(want, (int, float)) and parsed is not None and abs(parsed - want) > 1e-6 * max(1, abs(want)):
                            issues.append(Issue("entry", f"{col(c)}{r0 + i} is {got}, expected {want}", s.name))
            sheet_info: Dict[str, Any] = next((x for x in info.get("sheets", []) if x.get("name") == s.name), {})
            if len(s.rows) >= 2 and not sheet_info.get("charts"):
                issues.append(Issue("chart", "Chart is missing", s.name))
        return issues

    def fix(p: WorkbookPlan, issues: List[Issue], n: int) -> Optional[WorkbookPlan]:
        codes = {i.code for i in issues}
        q = copy.deepcopy(p)
        if "sheet" in codes:
            for s in q.sheets:
                s.name = re.sub(r"[^A-Za-z0-9 ]", "", s.name)[:28] or "Data"
            return q
        if "chart" in codes or "typed" in codes or "guard" in codes or "error" in codes:
            return q  # rebuild from the generator (formulas are written by code, never typed)
        return None

    result = await audit_loop(plan, build, audit, fix, progress)
    return Rendered(result.files, result.passes, result.issues, result.history)
