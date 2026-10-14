"""Notebook chat retrieval (RAG only, no tools).

Every turn retrieves the most relevant chunks from the notebook's processed
sources (vector search over ``source_embedding``, with a keyword fallback),
numbers them [1]..[n], and the model answers from those passages and cites
them. The citations travel with the answer so the UI can show the exact
passage behind every claim.
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Any, Dict, List, Optional

from loguru import logger

from open_notebook.database.repository import ensure_record_id, repo_query
from open_notebook.domain.notebook import Notebook

TOP_K = 8
MAX_CHUNK_CHARS = 1400


@dataclass
class SourceStatus:
    total: int
    processed: int
    pending: List[Dict[str, str]]  # sources without chunks: {id, title}

    @property
    def ready(self) -> bool:
        return self.processed > 0


async def source_status(notebook: Optional[Notebook]) -> SourceStatus:
    if notebook is None:
        return SourceStatus(0, 0, [])
    sources = await notebook.get_sources()
    if not sources:
        return SourceStatus(0, 0, [])
    ids = [ensure_record_id(str(s.id)) for s in sources]
    rows = await repo_query(
        "SELECT source, count() AS n FROM source_embedding WHERE source IN $ids GROUP BY source",
        {"ids": ids},
    )
    done = {str(r.get("source")) for r in rows or [] if int(r.get("n") or 0) > 0}
    pending = [{"id": str(s.id), "title": s.title or "Untitled source"} for s in sources if str(s.id) not in done]
    return SourceStatus(len(sources), len(done), pending)


def _keywords(q: str) -> List[str]:
    stop = {"the", "and", "for", "with", "what", "how", "why", "are", "is", "was", "does", "this", "that", "from", "about", "into", "which", "who"}
    return [w for w in re.findall(r"[A-Za-z0-9\u0600-\u06FF]{3,}", q.lower()) if w not in stop][:8]


async def retrieve(notebook: Notebook, query: str, k: int = TOP_K) -> List[Dict[str, Any]]:
    sources = await notebook.get_sources()
    if not sources:
        return []
    ids = [ensure_record_id(str(s.id)) for s in sources]
    rows: List[Dict[str, Any]] = []
    try:
        from open_notebook.utils.embedding import generate_embedding

        emb = await generate_embedding(query)
        rows = await repo_query(
            """SELECT id, content, source.id AS source_id, source.title AS title,
                      vector::similarity::cosine(embedding, $emb) AS score
               FROM source_embedding
               WHERE source IN $ids AND embedding != NONE AND array::len(embedding) = array::len($emb)
               ORDER BY score DESC LIMIT $k""",
            {"emb": emb, "ids": ids, "k": k * 2},
        ) or []
    except Exception as e:  # embedding model unavailable: keyword retrieval keeps the chat grounded
        logger.warning(f"Vector retrieval failed, using keyword retrieval: {e}")
    if not rows:
        words = _keywords(query)
        if words:
            rows = await repo_query(
                """SELECT id, content, source.id AS source_id, source.title AS title, 0.0 AS score
                   FROM source_embedding WHERE source IN $ids AND string::lowercase(content) CONTAINSANY $words LIMIT $k""",
                {"ids": ids, "words": words, "k": k * 2},
            ) or []
    seen: set[str] = set()
    out: List[Dict[str, Any]] = []
    for r in rows:
        text = (r.get("content") or "").strip()
        key = text[:120]
        if not text or key in seen:
            continue
        seen.add(key)
        out.append(
            {
                "n": len(out) + 1,
                "chunk_id": str(r.get("id")),
                "source_id": str(r.get("source_id")),
                "source_title": r.get("title") or "Source",
                "text": text[:MAX_CHUNK_CHARS],
                "score": round(float(r.get("score") or 0), 4),
            }
        )
        if len(out) >= k:
            break
    return out


def format_context(chunks: List[Dict[str, Any]]) -> str:
    return "\n\n".join(f"[{c['n']}] (from \"{c['source_title']}\")\n{c['text']}" for c in chunks)


def used_citations(answer: str, chunks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    cited = {int(n) for n in re.findall(r"\[(\d{1,2})\]", answer or "")}
    return [{k: v for k, v in c.items() if k != "score"} | {"excerpt": c["text"][:400]} for c in chunks if c["n"] in cited]


def no_sources_message(notebook: Optional[Notebook], status: SourceStatus) -> str:
    name = f'"{notebook.name}"' if notebook else "This notebook"
    if status.total == 0:
        return f"{name} has no sources yet, so there is nothing to answer from. Add files, links or text to the notebook, then ask again."
    return (
        f"{name} has {status.total} source(s), but none is processed yet, so I cannot answer from them. "
        f"Process the uploaded file(s) and ask again."
    )
