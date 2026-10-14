"""MCP bridge: MCIT AI and the Craft engines as tools for Tut Agent.

Tut Agent (MCIT-Agent) connects to ``POST /api/mcp`` (MCP Streamable HTTP,
JSON responses) with the user's agent token (``/api/auth/agent-token``).
Every tool runs as that user, inside their private database, library and
Craft workspace, so the agent can only see and change what the user owns.

Unrestricted Craft MCP calls are deliberately not exposed: some upstream
engines can read absolute paths outside their configured workspace. Studio
uses fixed, server-controlled CLI invocations instead.
"""

from __future__ import annotations

import json
import re
import uuid
from typing import Any, Awaitable, Callable, Dict, List, cast

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse, Response
from loguru import logger

from api.auth import current_account
from open_notebook.craft.pipelines import Mode
from open_notebook.domain.notebook import Note, Notebook, text_search, vector_search
from open_notebook.exports import storage

router = APIRouter(tags=["mcp"])

PROTOCOL = "2025-03-26"
Tool = Callable[[Dict[str, Any]], Awaitable[Any]]


def _schema(props: Dict[str, Any], required: List[str]) -> Dict[str, Any]:
    return {"type": "object", "properties": props, "required": required, "additionalProperties": False}


S = {"type": "string"}


async def notebooks_list(_: Dict[str, Any]):
    items = await Notebook.get_all(order_by="updated desc")
    return [{"id": n.id, "name": n.name, "description": n.description} for n in items if not n.archived]


async def notebook_read(a: Dict[str, Any]):
    nb = await Notebook.get(a["notebook_id"])
    sources = await nb.get_sources()
    notes = await nb.get_notes(include_content=True)
    return {
        "id": nb.id,
        "name": nb.name,
        "description": nb.description,
        "sources": [{"id": s.id, "title": s.title} for s in sources],
        "notes": [{"id": n.id, "title": n.title, "content": (n.content or "")[:4000]} for n in notes],
    }


async def knowledge_search(a: Dict[str, Any]):
    ids = [a["notebook_id"]] if a.get("notebook_id") else None
    limit = int(a.get("limit") or 8)
    try:
        rows = await vector_search(a["query"], limit, True, True, notebook_ids=ids)
    except Exception:
        rows = await text_search(a["query"], limit, True, True, notebook_ids=ids)
    return rows


async def note_create(a: Dict[str, Any]):
    nb = await Notebook.get(a["notebook_id"])
    note = Note(title=a.get("title") or "Tut Agent note", content=a["content"], note_type="ai")
    await note.save()
    await note.add_to_notebook(nb.id or "")
    return {"id": note.id}


async def files_list(_: Dict[str, Any]):
    return [
        {"id": f.id, "filename": f.filename, "format": f.format, "title": f.title, "notebook": f.notebook_name}
        for f in storage.list_files()
    ]


def _public(path: str) -> str:
    import os

    return (os.getenv("MCIT_PUBLIC_URL") or "").rstrip("/") + path


async def studio_produce(a: Dict[str, Any]):
    """Start one Studio feature; use studio_status to follow the real run."""
    from open_notebook.craft.pipelines import PRESETS, canonical
    from open_notebook.exports.content import StudioOptions
    from open_notebook.exports.produce import produce
    from open_notebook.tut import jobs

    feature = canonical(a.get("feature") or a.get("preset") or "")
    if feature not in PRESETS:
        raise ValueError("Unknown Studio feature: use presentation, report, infograph or spreadsheet")
    mode = a.get("mode") or "dark"
    if mode not in ("dark", "light"):
        raise ValueError("Unknown mode: use dark or light")
    template = a.get("template") or ("custom" if a.get("design") else "default")
    await Notebook.get(a["notebook_id"])
    opts = StudioOptions(
        theme=mode,
        instructions=a.get("instructions"),
        length=a.get("length") or "medium",
        slide_count=int(a.get("slide_count") or 10),
        template=template,
    )
    async def work(run):
        await produce(run, a["notebook_id"], feature, cast(Mode, mode), opts, design=a.get("design"))

    run = jobs.start("studio", work, feature="studio")
    return {
        "job_id": run.id,
        "status": run.status,
        "next": "Call studio_status with this job_id to see live steps and usage, then deliver its files when completed.",
    }


async def studio_status(a: Dict[str, Any]):
    """Status of a job owned by this account, including the same file records as Files."""
    from open_notebook.tut import jobs

    run = jobs.get_run(a["job_id"])
    if run is None:
        raise ValueError("Studio job not found")
    events = run.events
    errors = [e["message"] for e in events if e["type"] == "error"]
    steps = [e.get("title") or e.get("message") for e in events if e["type"] in ("step", "progress") and (e.get("title") or e.get("message"))]
    files = [
        {
            **e["file"],
            "open_url": _public(f"/files?open={e['file']['id']}"),
            "download_url": _public(f"/api/studio/files/{e['file']['id']}/download"),
        }
        for e in events if e["type"] == "file"
    ]
    return {
        "job_id": run.id,
        "status": run.status,
        "errors": errors,
        "usage": run.usage,
        "files": files,
        "steps": steps[-40:],
        "next": "Call studio_status again later." if run.status == "running" else None,
        "deliver_as": "When completed, show each file as [filename](open_url) and [Download](download_url). Report any audit_issues.",
    }


async def skills_list(_: Dict[str, Any]):
    from open_notebook.craft.kit import skills as kit_skills

    return kit_skills.index()


async def skill_read(a: Dict[str, Any]):
    from open_notebook.craft.kit import skills as kit_skills

    return {"name": a["name"], "content": kit_skills.read(a["name"])}


async def file_info(a: Dict[str, Any]):
    item = storage.get_file(a["file_id"])
    if not item:
        raise ValueError("File not found")
    return item.model_dump() | {"open_url": _public(f"/files?open={item.id}"), "download_url": _public(f"/api/studio/files/{item.id}/download")}


async def file_rename(a: Dict[str, Any]):
    item = storage.get_file(a["file_id"])
    if not item:
        raise ValueError("File not found")
    stem = re.sub(r"[^\w .()-]+", "", a["name"]).strip()[:80] or item.title
    storage.update_meta(item.id, filename=f"{stem}.{item.format}", title=stem)
    return storage.get_file(item.id).model_dump()  # type: ignore[union-attr]


async def file_delete(a: Dict[str, Any]):
    if not storage.delete_file(a["file_id"]):
        raise ValueError("File not found")
    return {"deleted": a["file_id"]}


TOOLS: Dict[str, Dict[str, Any]] = {
    "notebooks_list": {"fn": notebooks_list, "description": "List the user's notebooks.", "schema": _schema({}, [])},
    "notebook_read": {
        "fn": notebook_read,
        "description": "Read a notebook: its sources and notes.",
        "schema": _schema({"notebook_id": S}, ["notebook_id"]),
    },
    "knowledge_search": {
        "fn": knowledge_search,
        "description": "Search the user's sources and notes (optionally one notebook).",
        "schema": _schema({"query": S, "notebook_id": S, "limit": {"type": "integer"}}, ["query"]),
    },
    "note_create": {
        "fn": note_create,
        "description": "Save a note into a notebook.",
        "schema": _schema({"notebook_id": S, "title": S, "content": S}, ["notebook_id", "content"]),
    },
    "files_list": {"fn": files_list, "description": "List the user's generated files.", "schema": _schema({}, [])},
    "studio_produce": {
        "fn": studio_produce,
        "description": (
            "Generate a document from a notebook with the approved MCIT templates: presentation (pptx+pdf), "
            "report (pdf+docx, short|medium|long), infograph (sketchnote png+pdf) or spreadsheet (xlsx: paste the "
            "figures in instructions; computed cells are formulas). template=default uses the approved template; "
            "template=custom applies `design` and runs the audit loop. Returns a job_id; call studio_status "
            "to follow actual progress and deliver the files when completed."
        ),
        "schema": _schema(
            {
                "notebook_id": S,
                "feature": {"type": "string", "enum": ["presentation", "report", "infograph", "spreadsheet"]},
                "mode": {"type": "string", "enum": ["dark", "light"]},
                "template": {"type": "string", "enum": ["default", "custom"]},
                "design": S,
                "length": {"type": "string", "enum": ["short", "medium", "long"]},
                "slide_count": {"type": "integer", "minimum": 4, "maximum": 20},
                "instructions": S,
            },
            ["notebook_id", "feature"],
        ),
    },
    "studio_status": {
        "fn": studio_status,
        "description": "Poll a Studio job you started. Returns live steps, usage, errors, audit issues and links to the completed files. Poll again while running.",
        "schema": _schema({"job_id": S}, ["job_id"]),
    },
    "skills_list": {"fn": skills_list, "description": "List the MCIT document skills (templates, presentation, report, Word, infograph, spreadsheet, figures, design helper).", "schema": _schema({}, [])},
    "skill_read": {
        "fn": skill_read,
        "description": "Read one MCIT document skill before producing that kind of file.",
        "schema": _schema({"name": S}, ["name"]),
    },
    "file_info": {"fn": file_info, "description": "Details and links for one file in the user's library.", "schema": _schema({"file_id": S}, ["file_id"])},
    "file_rename": {"fn": file_rename, "description": "Rename a file in the user's library.", "schema": _schema({"file_id": S, "name": S}, ["file_id", "name"])},
    "file_delete": {"fn": file_delete, "description": "Delete a file from the user's library.", "schema": _schema({"file_id": S}, ["file_id"])},
}


def _ok(rid: Any, result: Any) -> Dict[str, Any]:
    return {"jsonrpc": "2.0", "id": rid, "result": result}


def _err(rid: Any, code: int, message: str) -> Dict[str, Any]:
    return {"jsonrpc": "2.0", "id": rid, "error": {"code": code, "message": message}}


async def _handle(msg: Dict[str, Any]) -> Dict[str, Any] | None:
    method, rid, params = msg.get("method"), msg.get("id"), msg.get("params") or {}
    if rid is None:  # notification
        return None
    if method == "initialize":
        return _ok(
            rid,
            {
                "protocolVersion": PROTOCOL,
                "capabilities": {"tools": {"listChanged": False}},
                "serverInfo": {"name": "mcit-ai", "title": "MCIT AI", "version": "1.0"},
                "instructions": "Tools for the user's MCIT AI notebooks, files, Studio and the Craft document engines.",
            },
        )
    if method == "ping":
        return _ok(rid, {})
    if method == "tools/list":
        return _ok(
            rid,
            {"tools": [{"name": n, "description": t["description"], "inputSchema": t["schema"]} for n, t in TOOLS.items()]},
        )
    if method == "tools/call":
        tool = TOOLS.get(params.get("name", ""))
        if not tool:
            return _err(rid, -32602, "Unknown tool")
        try:
            data = await tool["fn"](params.get("arguments") or {})
            text = data if isinstance(data, str) else json.dumps(data, default=str)
            return _ok(rid, {"content": [{"type": "text", "text": text}], "isError": False})
        except Exception as e:
            logger.info(f"MCP tool {params.get('name')} failed: {type(e).__name__}")
            return _ok(rid, {"content": [{"type": "text", "text": str(e)[:500] or type(e).__name__}], "isError": True})
    return _err(rid, -32601, "Method not found")


@router.post("/mcp")
async def mcp_endpoint(request: Request):
    current_account(request)
    body = await request.json()
    headers = {"Mcp-Session-Id": request.headers.get("mcp-session-id") or uuid.uuid4().hex}
    if isinstance(body, list):
        replies = [r for r in [await _handle(m) for m in body] if r is not None]
        return JSONResponse(replies, headers=headers) if replies else Response(status_code=202, headers=headers)
    reply = await _handle(body)
    if reply is None:
        return Response(status_code=202, headers=headers)
    return JSONResponse(reply, headers=headers)


@router.get("/mcp")
async def mcp_stream_unsupported():
    return Response(status_code=405)
