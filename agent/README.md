# MCIT Agent

Private AI agent for the **Ministry of Communications and Information Technology (MCIT)**.

| | |
|---|---|
| **Product** | MCIT AI |
| **Default agent** | **Tut Agent** (Tutankhamun avatar) |
| **Core** | MCIT AI Core (agents, tools, gateway) |
| **Credit** | Developed by Eng Ahmed Arfa for MCIT |

## Architecture & Features

- Branding: **MCIT AI** everywhere user-facing (en-US locales + branding const)
- Default agent: **Tut Agent** + `/avatars/mcit/tutankhamun.webp`
- Avatar gallery: 9 local Egyptian-pharaoh WebPs (no GitHub runtime fetch)
- Chat model list: opens **on click only** (`openOnHover: false`); home cloud model shortcuts disabled
- **Studio** (`/studio`): Presentation (PPTX outline), Report (PDF), Infograph via local Ollama
- **Admin bootstrap** (`/admin` + `/webapi/mcit/admin/bootstrap`): one-time admin with server token
- Auth: trusted origins for Alloy/preview ports; captcha off by default in MCIT env
- Ollama env hooks for local models; cloud providers still configurable in Settings

## Quick start

```bash
cd docker-compose/mcit
cp .env.example .env
# set KEY_VAULTS_SECRET, AUTH_SECRET, POSTGRES_PASSWORD, JWKS_*, MCIT_ADMIN_BOOTSTRAP_TOKEN
docker compose up -d
# optional features sidecar (Studio/Admin API on stock image):
MCIT_ADMIN_BOOTSTRAP_TOKEN=... OLLAMA_PROXY_URL=http://127.0.0.1:11434 \
  node scripts/mcit-features-server.js
```

UI: `http://localhost:3210`  
Create first admin: open `/admin` with bootstrap token  
Then sign in at `/signin`

See `docs/MCIT_AUTH.md` and `MCIT_README.md`.

## Models

1. Run Ollama with your models (`qwen2.5:7b`, etc.)
2. Set `OLLAMA_PROXY_URL` and enable Ollama in Settings → Providers
3. In chat, click the **model button** to pick among **enabled** models only

## Studio formats

| Format | Route / API |
|--------|-------------|
| Presentation (PPTX outline) | Studio UI + `POST /webapi/mcit/studio` `{format:"pptx"}` |
| Report (PDF structure) | `{format:"pdf"}` |
| Infograph | `{format:"infograph"}` |

Binary PPTX/PDF packaging can be layered on the same draft API.

## Build note

Full MCIT branding + Studio SPA routes can be built directly using `pnpm install && bun run build:docker` or run in development via `bun run dev`.
