"""Read-only view of one person's Tut Agent workspace for the admin console.

Tut Agent keeps its own store (chats, files, generations and per-message
token usage). The admin console reads it through Tut's server-to-server
endpoint ``/webapi/mcit/admin/user-activity``, authenticated with the shared
``MCIT_ADMIN_BOOTSTRAP_TOKEN``. Every request names exactly one MCIT AI
account (its OIDC subject), and Tut answers only with that person's rows.
"""

from __future__ import annotations

import os
from typing import Any, Dict, Optional

import httpx

from open_notebook import accounts

VIEWS = ("overview", "chats", "messages", "files", "generations", "usage")


class TutUnavailable(RuntimeError):
    """Tut Agent is not configured or did not answer."""


def _config() -> Optional[tuple[str, str]]:
    base = (os.getenv("TUT_AGENT_INTERNAL_URL") or "").rstrip("/")
    token = os.getenv("MCIT_ADMIN_BOOTSTRAP_TOKEN") or ""
    return (base, token) if base and token else None


def _email(account: accounts.Account) -> str:
    return f"{account.username}@{os.getenv('MCIT_EMAIL_DOMAIN') or 'mcit.local'}"


async def fetch(
    account: accounts.Account,
    view: str,
    topic_id: Optional[str] = None,
    timeout: float = 15,
) -> Dict[str, Any]:
    if view not in VIEWS:
        raise ValueError(f"Unknown view {view}")
    config = _config()
    if not config:
        raise TutUnavailable("Tut Agent is not connected to the admin console")
    base, token = config
    params = {"sub": account.id, "email": _email(account), "view": view}
    if topic_id:
        params["topicId"] = topic_id
    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            r = await client.get(
                f"{base}/webapi/mcit/admin/user-activity",
                params=params,
                headers={"x-mcit-bootstrap-token": token},
            )
    except httpx.HTTPError as e:
        raise TutUnavailable(f"Tut Agent did not answer ({type(e).__name__})") from e
    if r.status_code == 404:
        raise LookupError("Not found")
    if r.status_code >= 400:
        raise TutUnavailable(f"Tut Agent answered {r.status_code}")
    return r.json()


async def overview(account: accounts.Account) -> Dict[str, Any]:
    """Counts and token totals; never raises, so account lists always load."""
    try:
        data = await fetch(account, "overview", timeout=4)
    except Exception:
        return {"available": False, "linked": False}
    return {"available": True, **data}
