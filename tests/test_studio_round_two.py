"""Studio round two: document kit, audit loop, four features, notebook RAG, MCP."""

import asyncio
import json
from unittest.mock import AsyncMock, patch

import pytest

from open_notebook.craft import audit
from open_notebook.craft.audit import Issue, audit_loop
from open_notebook.craft.kit import assets as kit_assets
from open_notebook.craft.kit import skills as kit_skills
from open_notebook.craft.kit.templates import FEATURES, TEMPLATES, canonical
from open_notebook.craft.kit.tokens import DARK, LIGHT, theme
from open_notebook.craft.pipelines import PRESETS
from open_notebook.craft.studio import deck, sheet
from open_notebook.craft.studio.direction import parse
from open_notebook.craft.studio.report import DEPTH, figure_series
from open_notebook.exports.content import (
    Section,
    Stat,
    StudioDocument,
    Table,
    content_slide_count,
)
from open_notebook.exports.pasted import parse_pasted_tables


async def _noop(_):
    return None


# ------------------------------------------------------------------- kit


def test_exactly_four_features():
    assert set(PRESETS) == set(FEATURES) == {"presentation", "report", "infograph", "spreadsheet"}
    assert canonical("sketchnote") == "infograph" and canonical("noir_sheet") == "spreadsheet"
    assert PRESETS["report"].lengths == ("short", "medium", "long")
    assert set(PRESETS["presentation"].modes) == set(PRESETS["report"].modes) == {"dark", "light"}
    assert PRESETS["report"].outputs == ("pdf", "docx")


def test_midnight_noir_tokens():
    assert DARK.bg == "010612" and DARK.surface == "030F1F" and DARK.accent == "16A6E9"
    assert DARK.premium == "F7EF8A" and DARK.muted == "B9C2CE"
    assert LIGHT.bg == "FFFFFF" and theme("light") is LIGHT and theme(None) is DARK


def test_eight_skills_served_without_vendor_names():
    names = {s["name"] for s in kit_skills.index()}
    assert names == {"templates", "powerpoint", "pdf-report", "wordcraft", "infograph", "spreadsheet", "figures", "design-helper"}
    for n in names:
        text = kit_skills.read(n).lower()
        assert "alloy" not in text and "platinum" not in text
    with pytest.raises(ValueError):
        kit_skills.read("../../etc/passwd")


def test_readiness_lists_missing_covers(tmp_path, monkeypatch):
    monkeypatch.setattr(kit_assets, "HERO", tmp_path / "covers/cover-hero.png")
    monkeypatch.setattr(kit_assets, "END", tmp_path / "covers/cover-end.png")
    monkeypatch.setattr(
        kit_assets,
        "REQUIREMENTS",
        [
            kit_assets.Requirement("cover-hero", tmp_path / "covers/cover-hero.png", ("presentation", "report"), "Opening cover art"),
            kit_assets.Requirement("cover-end", tmp_path / "covers/cover-end.png", ("presentation", "report"), "Closing cover art"),
        ],
    )
    r = kit_assets.readiness()
    assert r["missing"]["presentation"] == ["Opening cover art", "Closing cover art"]
    assert "infograph" not in r["missing"]


# ------------------------------------------------------------- audit loop


def test_audit_loop_stops_at_zero_issues():
    calls = []

    async def build(p, n):
        calls.append(n)
        return {"x": b"1"}

    async def check(p, files, n):
        return [] if p >= 2 else [Issue("a", "too big")]

    res = asyncio.run(audit_loop(0, build, check, lambda p, i, n: p + 1, _noop))
    assert res.clean and res.passes == 3 and calls == [1, 2, 3]


def test_audit_loop_caps_at_five_and_reports_remaining():
    async def build(p, n):
        return {}

    async def check(p, files, n):
        return [Issue("stuck", "never fixed")]

    res = asyncio.run(audit_loop(0, build, check, lambda p, i, n: p + 1, _noop))
    assert res.passes == 5 and [str(i) for i in res.issues] == ["never fixed"] and len(res.history) == 5


def test_copy_rules():
    assert {i.code for i in audit.copy_issues("Growth \u2014 strong. TODO")} == {"dash", "placeholder"}
    assert audit.strip_dashes("Growth \u2014 strong") == "Growth, strong"


# ---------------------------------------------------------- presentation


def _deck_doc(n_bullets=3, long=False):
    text = "A very long bullet that keeps going with many words to overflow the frame " * (6 if long else 0)
    return StudioDocument(
        kind="presentation",
        title="Digital Egypt",
        slides=[
            {"layout": "bullets", "title": "One", "bullets": [text + f"point {i}" for i in range(n_bullets)]},
            {"layout": "bullets", "title": "Two", "bullets": ["a", "b"]},
            {"layout": "stats", "title": "Three", "stats": [{"value": "170+", "label": "services"}]},
        ],
    )


def test_deck_plan_adds_agenda_and_covers():
    plan = deck.build_plan(_deck_doc(), "dark", parse(None))
    assert plan["slides"][0]["layout"] == "agenda" and plan["theme"]["bg"] == "010612"
    assert plan["closing"] == "Thank You" and "url" in plan


def test_deck_fit_check_finds_overflow_and_fix_clears_it():
    plan = deck.build_plan(_deck_doc(8, long=True), "dark", parse(None))
    issues = deck._fits(plan)
    assert any(i.code == "overflow" for i in issues)
    fixed = plan
    for n in range(1, 6):
        nxt = deck._fix(fixed, deck._fits(fixed), n)
        if nxt is None:
            break
        fixed = nxt
    assert not [i for i in deck._fits(fixed) if i.code == "overflow"]


def test_deck_repeat_layout_is_flagged_and_changed():
    plan = deck.build_plan(_deck_doc(), "light", parse(None))
    issues = deck._fits(plan)
    assert any(i.code == "repeat" for i in issues)
    fixed = deck._fix(plan, issues, 1)
    assert fixed is not None
    assert fixed["slides"][2]["layout"] != "bullets"


def test_slide_count_leaves_room_for_cover_agenda_closing():
    assert content_slide_count(10) == 7 and content_slide_count(4) == 3


def test_custom_direction_levers():
    d = parse("make it more visual and compact with a calmer royal accent", "custom")
    assert d.custom and d.visual and d.density == "compact" and d.accent == "royal"
    assert parse(None).custom is False and "default" in parse(None).describe()
    assert d.apply_to_slide({"layout": "bullets", "bullets": ["a", "b", "c"]})["layout"] == "cards"


# ---------------------------------------------------------------- report


def test_report_depths_are_distinct():
    assert DEPTH["short"].chapters < DEPTH["medium"].chapters < DEPTH["long"].chapters
    assert DEPTH["long"].subsections and not DEPTH["short"].subsections


def test_figures_only_from_real_series():
    doc = StudioDocument(
        title="R",
        stats=[Stat(value="170+", label="services"), Stat(value="27", label="governorates")],
        sections=[Section(heading="S", table=Table(name="Services", columns=["Year", "Online"], rows=[["2021", 90], ["2025", 170]]))],
    )
    series = figure_series(doc)
    assert [s[0] for s in series] == ["Services: Online"]  # mixed-unit stats are never charted together


# ----------------------------------------------------------- spreadsheet


def test_pasted_tables_markdown_tsv_and_lines():
    md = "ICT indicators\n| Indicator | Sep | Oct |\n|---|---|---|\n| Mobile (m) | 103.2 | 103.9 |\n| Broadband (m) | 11.4 | 11.6 |"
    t = parse_pasted_tables(md)[0]
    assert t.name == "ICT indicators" and t.columns == ["Indicator", "Sep", "Oct"] and t.rows[0] == ["Mobile (m)", 103.2, 103.9]
    tsv = "Indicator\t2024\t2025\nServices\t1,200\t1,450\nUsers\t3\t4"
    assert parse_pasted_tables(tsv)[0].rows[0] == ["Services", 1200, 1450]
    lines = "Mobile: 103.2, 103.9\nBroadband: 11.4, 11.6"
    assert parse_pasted_tables(lines)[0].rows[1] == ["Broadband", 11.4, 11.6]
    assert parse_pasted_tables("no figures here") == []


def test_sheet_computed_cells_are_guarded_formulas():
    doc = StudioDocument(kind="spreadsheet", title="ICT", tables=[Table(name="KPIs", columns=["Indicator", "Sep", "Oct"], rows=[["Services", 168, 171], ["Users", 10, ""]])])
    plan = sheet.build_plan(doc, "dark", parse(None))
    s = plan.sheets[0]
    assert s.periods == ["Sep", "Oct"] and s.computed == ["Change", "Change %"] and s.total
    cmds = sheet.sheet_commands(plan, 0, s)
    rows = [json.loads(c.split("=", 1)[1]) for c in cmds if c.startswith("range.setValues")]
    data = rows[1]["values"]
    assert data[0][:3] == ["Services", 168.0, 171.0]
    assert data[1][2] is None  # a blank figure stays blank, never 0
    for r in data:
        assert all(str(x).startswith("=IF(") for x in r[3:])
    total = rows[2]["values"][0]
    assert total[0] == "Total" and all(str(x).startswith("=IF(") for x in total[1:])


def test_sheet_no_total_across_mixed_units():
    doc = StudioDocument(kind="spreadsheet", title="ICT", tables=[Table(name="KPIs", columns=["Indicator", "Sep", "Oct"], rows=[["Mobile (m)", 103, 104], ["Capacity (MW)", 60, 62]])])
    assert sheet.build_plan(doc, "light", parse(None)).sheets[0].total is False


def test_sheet_text_injection_is_neutralised():
    assert sheet._safe_text("=HYPERLINK(1)") == "'=HYPERLINK(1)"
    assert sheet._safe_text("-12") == "-12"


# --------------------------------------------------------------- RAG chat


def test_citations_keep_only_cited_passages():
    from open_notebook.notebook_rag import format_context, used_citations

    chunks = [
        {"n": 1, "chunk_id": "c1", "source_id": "source:a", "source_title": "A", "text": "alpha", "score": 0.9},
        {"n": 2, "chunk_id": "c2", "source_id": "source:b", "source_title": "B", "text": "beta", "score": 0.8},
    ]
    assert "[2] (from \"B\")" in format_context(chunks)
    used = used_citations("Alpha is true [1].", chunks)
    assert [c["n"] for c in used] == [1] and used[0]["excerpt"] == "alpha" and "score" not in used[0]


def test_no_sources_message_offers_processing():
    from open_notebook.notebook_rag import SourceStatus, no_sources_message

    assert "no sources yet" in no_sources_message(None, SourceStatus(0, 0, []))
    msg = no_sources_message(None, SourceStatus(2, 0, [{"id": "source:1", "title": "a"}]))
    assert "none is processed" in msg


def test_chat_without_processed_sources_answers_plainly():
    from fastapi.testclient import TestClient
    from langchain_core.runnables import RunnableConfig
    from langgraph.checkpoint.memory import MemorySaver
    from langgraph.graph import END, START, StateGraph

    from api.main import app
    from open_notebook.graphs.chat import ThreadState
    from open_notebook.notebook_rag import SourceStatus

    g = StateGraph(ThreadState)
    g.add_node("agent", lambda s, c: (_ for _ in ()).throw(AssertionError("model must not be called")))
    g.add_edge(START, "agent")
    g.add_edge("agent", END)
    graph = g.compile(checkpointer=MemorySaver())
    from unittest.mock import MagicMock

    session = MagicMock(model_override=None, save=AsyncMock())
    with (
        patch("api.routers.chat.chat_graph", graph),
        patch("api.routers.chat.get_session_or_404", new=AsyncMock(return_value=("chat_session:z", session))),
        patch("api.routers.chat.repo_query", new=AsyncMock(return_value=[])),
        patch("open_notebook.notebook_rag.source_status", new=AsyncMock(return_value=SourceStatus(1, 0, [{"id": "source:1", "title": "Brief"}]))),
    ):
        r = TestClient(app).post("/api/chat/execute", json={"session_id": "chat_session:z", "message": "q", "context": {}})
    assert r.status_code == 200
    last = r.json()["messages"][-1]
    assert last["type"] == "ai" and last["ingest"] == [{"id": "source:1", "title": "Brief"}]
    _ = RunnableConfig


# -------------------------------------------------------------------- MCP


def test_mcp_tools_cover_the_four_features_and_files():
    from api.routers import mcp

    schema = mcp.TOOLS["studio_produce"]["schema"]["properties"]
    assert schema["feature"]["enum"] == ["presentation", "report", "infograph", "spreadsheet"]
    assert {"template", "design", "length", "slide_count", "mode"} <= set(schema)
    assert {"studio_status", "skills_list", "skill_read", "file_info", "file_rename", "file_delete"} <= set(mcp.TOOLS)
    assert {"craft_engines", "craft_tools", "craft_publish"}.isdisjoint(mcp.TOOLS)
    with pytest.raises(ValueError):
        asyncio.run(mcp.studio_produce({"notebook_id": "notebook:1", "feature": "poster"}))


def test_mcp_studio_status_is_owner_scoped_and_returns_stored_file_links():
    from api.routers import mcp
    from open_notebook import tenancy
    from open_notebook.tut import jobs

    with tenancy.tenant_scope("mcit_user:alice"):
        run = jobs.Run("studio")
        run.emit("progress", message="Building the slides")
        run.emit("file", file={"id": "file-1", "filename": "deck.pptx", "audit_issues": []})
    with patch.dict(jobs._runs, {run.id: run}):
        with tenancy.tenant_scope("mcit_user:bob"):
            with pytest.raises(ValueError, match="not found"):
                asyncio.run(mcp.studio_status({"job_id": run.id}))
        with tenancy.tenant_scope("mcit_user:alice"):
            result = asyncio.run(mcp.studio_status({"job_id": run.id}))
    assert result["status"] == "running"
    assert result["steps"] == ["Building the slides"]
    assert result["files"][0]["filename"] == "deck.pptx"
    assert result["files"][0]["open_url"].endswith("/files?open=file-1")


def test_produce_refuses_without_required_assets():
    from typing import cast

    from open_notebook.exports import produce as produce_mod
    from open_notebook.exports.content import StudioOptions
    from open_notebook.tut.jobs import Run

    with patch.object(produce_mod, "missing_for", return_value=["Opening cover art"]):
        with pytest.raises(ValueError, match="Opening cover art"):
            asyncio.run(produce_mod.produce(cast(Run, object()), "notebook:1", "presentation", "dark", StudioOptions()))


def test_templates_index_is_complete():
    for fid in FEATURES:
        t = TEMPLATES[fid]
        assert t.structure and t.engines and t.outputs and t.skill


def test_submitted_commands_carry_the_tenant_even_when_args_have_none():
    from open_notebook import tenancy

    seen = {}
    with patch("surreal_commands.submit_command", side_effect=lambda app, name, payload, *a, **k: seen.update(payload) or "command:1"):
        with tenancy.tenant_scope("mcit_user:alice"):
            tenancy.submit_command("open_notebook", "process_source", {"source_id": "source:1", "tenant": None})
    assert seen["tenant"] == "mcit_user:alice"
