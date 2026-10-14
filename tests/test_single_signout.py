"""Single sign-out: one sign-out ends the MCIT AI session and hands the
browser to Tut Agent to end the paired Tut session (this browser only)."""

from unittest.mock import AsyncMock, patch
from urllib.parse import parse_qs, urlparse

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from api.auth import SESSION_COOKIE
from api.routers import auth as auth_router
from api.routers import oidc as oidc_router
from open_notebook import accounts

ALICE = accounts.Account(id="mcit_user:alice1", username="alice", role="user")


@pytest.fixture
def env(monkeypatch):
    monkeypatch.setenv("TUT_AGENT_PUBLIC_URL", "http://tut.local:3210")
    monkeypatch.setenv("MCIT_PUBLIC_URL", "http://mcit.local:8502")


@pytest.fixture
def client(env):
    app = FastAPI()
    app.include_router(auth_router.router, prefix="/api")
    app.include_router(oidc_router.router, prefix="/api")
    revoked: list = []
    with (
        patch.object(accounts, "revoke_session", AsyncMock(side_effect=revoked.append)),
        patch.object(accounts, "audit", AsyncMock()),
    ):
        c = TestClient(app)
        c.revoked = revoked  # type: ignore[attr-defined]
        yield c


def _claims(token: str) -> dict:
    claims = accounts.decode_session(token)
    assert claims is not None
    return claims


def test_tokens_have_unique_ids():
    a = _claims(accounts.issue_session(ALICE)["token"])
    b = _claims(accounts.issue_session(ALICE)["token"])
    assert a["jti"] and b["jti"] and a["jti"] != b["jti"]


def test_logout_revokes_bearer_and_cookie_and_points_to_tut(client):
    bearer = accounts.issue_session(ALICE)["token"]
    cookie = accounts.issue_session(ALICE)["token"]
    client.cookies.set(SESSION_COOKIE, cookie)
    r = client.post("/api/auth/logout", headers={"Authorization": f"Bearer {bearer}"})
    assert r.status_code == 200
    jtis = {c["jti"] for c in client.revoked}
    assert jtis == {_claims(bearer)["jti"], _claims(cookie)["jti"]}
    assert SESSION_COOKIE in r.headers.get("set-cookie", "")

    url = urlparse(r.json()["tut_signout_url"])
    assert f"{url.scheme}://{url.netloc}" == "http://tut.local:3210"
    assert url.path == "/webapi/mcit/signout"
    assert parse_qs(url.query)["return_to"] == ["http://mcit.local:8502/login"]


def test_logout_same_token_revoked_once(client):
    token = accounts.issue_session(ALICE)["token"]
    client.cookies.set(SESSION_COOKIE, token)
    client.post("/api/auth/logout", headers={"Authorization": f"Bearer {token}"})
    assert len(client.revoked) == 1


def test_logout_without_session_still_succeeds(client):
    r = client.post("/api/auth/logout")
    assert r.status_code == 200 and client.revoked == []


def test_logout_without_tut_has_no_tut_step(client, monkeypatch):
    monkeypatch.delenv("TUT_AGENT_PUBLIC_URL")
    assert client.post("/api/auth/logout").json()["tut_signout_url"] is None


def test_oidc_logout_from_tut_ends_mcit_session(client):
    token = accounts.issue_session(ALICE)["token"]
    client.cookies.set(SESSION_COOKIE, token)
    r = client.get(
        "/api/oidc/logout",
        params={"post_logout_redirect_uri": "http://tut.local:3210/signin"},
        follow_redirects=False,
    )
    assert (
        r.status_code == 302 and r.headers["location"] == "http://tut.local:3210/signin"
    )
    assert [c["jti"] for c in client.revoked] == [_claims(token)["jti"]]


def test_revoked_session_cannot_start_tut_sign_in(client, monkeypatch):
    monkeypatch.setenv("TUT_OIDC_CLIENT_ID", "tut-agent")
    token = accounts.issue_session(ALICE)["token"]
    client.cookies.set(SESSION_COOKIE, token)
    with (
        patch.object(accounts, "get_account", AsyncMock(return_value=ALICE)),
        patch.object(accounts, "is_session_revoked", AsyncMock(return_value=True)),
    ):
        r = client.get(
            "/api/oidc/authorize",
            params={
                "client_id": "tut-agent",
                "redirect_uri": "http://tut.local:3210/cb",
            },
            follow_redirects=False,
        )
    assert r.status_code == 302 and r.headers["location"].startswith("/login")
