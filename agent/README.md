# Tut Agent

The agent of **MCIT AI**: multi-step work with tools, skills, knowledge bases,
memory and agent groups, with a live view of every step, tool call and token.
It runs as its own application next to the MCIT AI platform and signs users in
through MCIT AI.

## How it fits

| | |
|---|---|
| Sign-in | OpenID Connect against MCIT AI (`AUTH_SSO_PROVIDERS=generic-oidc`); password sign-in is off |
| Sign-out | `/webapi/mcit/signout` ends this browser's Tut session; MCIT AI sends the browser here on sign-out |
| MCIT AI tools | A personal MCP connector (`mcit-ai`) gives Tut the notebooks, knowledge search, the four Studio features, the document skills and the file library |
| Admin feed | `/webapi/mcit/admin/user-activity` (server-to-server) lets the MCIT AI admin console read one person's Tut chats, files, generations and usage |
| Models | Local models through Ollama by default (`OLLAMA_PROXY_URL`); token usage is metered per reply |

## Run

Tut Agent is started by the platform's `docker-compose.yml` (service `tut-agent`
with PostgreSQL, Redis and object storage). For development:

```bash
pnpm install
pnpm db:migrate
pnpm dev
```

## Tests

```bash
pnpm test-app        # application tests (vitest)
```

## Licence

See [NOTICE](NOTICE) and [LICENSES/](LICENSES).
