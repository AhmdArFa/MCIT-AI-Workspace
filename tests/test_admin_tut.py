"""Admin console: per-user Tut Agent chats, files, generations and usage."""

from unittest.mock import AsyncMock, patch

import httpx
import pytest

from open_notebook import accounts
from open_notebook.tut import activity

ALICE = accounts.Account(id="mcit_user:alice1", username="alice", role="user")


class FakeClient:
    calls: list = []
    response = httpx.Response(200, json={"linked": True, "chats": []})

    def __init__(self, *a, **kw):
        pass

    async def __aenter__(self):
        return self

    async def __aexit__(self, *a):
        return False

    async def get(self, url, params=None, headers=None):
        FakeClient.calls.append((url, params, headers))
        return FakeClient.response


@pytest.fixture
def configured(monkeypatch):
    monkeypatch.setenv("TUT_AGENT_INTERNAL_URL", "http://tut-agent:3210/")
    monkeypatch.setenv("MCIT_ADMIN_BOOTSTRAP_TOKEN", "server-token")
    FakeClient.calls = []
    FakeClient.response = httpx.Response(200, json={"linked": True, "chats": []})
    with patch.object(activity.httpx, "AsyncClient", FakeClient):
        yield


@pytest.mark.asyncio
async def test_request_names_exactly_one_account(configured):
    await activity.fetch(ALICE, "chats")
    url, params, headers = FakeClient.calls[0]
    assert url == "http://tut-agent:3210/webapi/mcit/admin/user-activity"
    assert params["sub"] == ALICE.id and params["view"] == "chats"
    assert params["email"] == "alice@mcit.local"
    assert headers == {"x-mcit-bootstrap-token": "server-token"}


@pytest.mark.asyncio
async def test_chat_messages_carry_topic(configured):
    await activity.fetch(ALICE, "messages", "tpc_1")
    assert FakeClient.calls[0][1]["topicId"] == "tpc_1"


@pytest.mark.asyncio
async def test_unknown_view_rejected(configured):
    with pytest.raises(ValueError):
        await activity.fetch(ALICE, "everyone")


@pytest.mark.asyncio
async def test_not_found_and_errors(configured):
    FakeClient.response = httpx.Response(404, json={})
    with pytest.raises(LookupError):
        await activity.fetch(ALICE, "messages", "other-persons-topic")
    FakeClient.response = httpx.Response(500, json={})
    with pytest.raises(activity.TutUnavailable):
        await activity.fetch(ALICE, "chats")


@pytest.mark.asyncio
async def test_not_configured(monkeypatch):
    monkeypatch.delenv("TUT_AGENT_INTERNAL_URL", raising=False)
    monkeypatch.delenv("MCIT_ADMIN_BOOTSTRAP_TOKEN", raising=False)
    with pytest.raises(activity.TutUnavailable):
        await activity.fetch(ALICE, "chats")
    assert await activity.overview(ALICE) == {"available": False, "linked": False}


@pytest.mark.asyncio
async def test_overview_merges_into_admin_totals(configured):
    from api.routers import admin

    FakeClient.response = httpx.Response(
        200,
        json={
            "linked": True,
            "counts": {"chats": 3, "files": 1, "generations": 2},
            "usage": {
                "requests": 4,
                "input_tokens": 100,
                "output_tokens": 50,
                "total_tokens": 150,
            },
        },
    )
    usage = [{"input_tokens": 10, "output_tokens": 5, "requests": 1}]
    with (
        patch.object(admin, "_count", AsyncMock(return_value=0)),
        patch.object(admin, "usage_summary", AsyncMock(return_value=usage)),
        patch.object(admin.storage, "list_files", return_value=[]),
    ):
        out = await admin._overview(ALICE)
    assert out["tut"]["counts"]["chats"] == 3
    assert out["usage"] == {"requests": 1, "input_tokens": 10, "output_tokens": 5}
    assert out["total_usage"] == {
        "requests": 5,
        "input_tokens": 110,
        "output_tokens": 55,
    }
