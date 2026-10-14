# Tut Agent: sign-in, sign-out and server-to-server routes

## Sign-in

Tut Agent has no passwords of its own. Users sign in through MCIT AI over
OpenID Connect (`AUTH_SSO_PROVIDERS=generic-oidc`, issuer
`<MCIT AI>/api/oidc`, client `tut-agent`). `AUTH_TRUSTED_ORIGINS` lists the
MCIT AI and Tut Agent public addresses.

## Single sign-out

Signing out of MCIT AI revokes that browser's MCIT AI session and sends the
browser to `GET /webapi/mcit/signout?return_to=<MCIT AI>/login`. The route
ends this browser's Tut session (database row, secondary storage, cookies) and
returns to MCIT AI. `return_to` must match `MCIT_PUBLIC_URL` or
`AUTH_TRUSTED_ORIGINS`.

## Server-to-server routes

Both require the `x-mcit-bootstrap-token` header with
`MCIT_ADMIN_BOOTSTRAP_TOKEN` (compared in constant time; closed when unset)
and resolve exactly one person through the OIDC link.

| Route | Purpose |
|---|---|
| `GET /webapi/mcit/admin/user-activity?sub=&view=` | Admin console: chats, messages, files, generations, usage |
| `POST /webapi/mcit/admin/connect-mcp` | Connect the person's Tut Agent to the MCIT AI tools |
