<p align="center">
  <img src="logo.png" alt="MCIT AI" width="120" />
</p>

<h1 align="center">MCIT AI</h1>

<p align="center">
  The private AI workspace of the Ministry of Communications and Information Technology.<br/>
  Research notebooks, a professional agent and finished office documents, on infrastructure you control.
</p>

---

## Overview

MCIT AI brings three capabilities together behind a single sign-in:

- **Notebooks**: collect sources (files, web pages, text), take notes, search them and
  chat with a model that answers only from the material you select, with citations.
- **Tut Agent**: a multi-step agent with tools, skills, knowledge bases, memory and
  multi-agent groups. It shows its reasoning, tool calls and progress as it works.
- **Studio**: turns a notebook into finished deliverables (presentations, reports,
  infographics and spreadsheets) built by dedicated document engines and opened in an
  integrated office editor.

Everything runs on local models by default. No cloud API key is required, and each
account's data is isolated from every other account.

## Key features

| Area | Capabilities |
|---|---|
| **Notebooks** | Multi-format ingestion, full-text and vector search, notes, grounded chat with citations, podcasts with local speech |
| **Tut Agent** | Agent runtime with tool calling, skills, knowledge bases, long-term memory, agent groups and a dedicated interface at `/tut` |
| **Studio** | Presentation (dark or light), report (dark or light), sketchnote infographic and spreadsheet presets |
| **Office editor** | ONLYOFFICE Docs opens and edits every `.docx`, `.xlsx`, `.pptx` and `.pdf`. Edits are saved back to the library |
| **Accounts** | Administrator-managed accounts, roles, per-account databases and storage, one login for every component |
| **Administration** | User management, per-user views of chats, files, generations and token usage (including Tut Agent), service monitoring and an audit log |
| **Security** | Server-side session revocation, single sign-out across MCIT AI and Tut Agent, encrypted credentials, administrator-only platform settings |
| **Interface** | Midnight Noir dark theme (default) and a light theme, 14 interface languages |

## Architecture

```
            Browser
               │
   ┌───────────┴───────────┐
   │                       │
MCIT AI web (Next.js)   Tut Agent web
   │                       │
MCIT AI API (FastAPI) ◄── OpenID Connect ──► Tut Agent server
   │      │       │                              │
   │      │       └── Craft engines ─────┐       ├── PostgreSQL
   │      │           (DeckCraft,        │       ├── Redis
   │      │            WordCraft, …)     │       └── Object storage
   │      └── ONLYOFFICE Docs ◄──────────┘
   │
SurrealDB (one database per account)          Ollama (local models)
```

| Component | Location | Technology |
|---|---|---|
| Web application | [`frontend/`](frontend) | Next.js, React, Tailwind |
| API and workers | [`api/`](api), [`open_notebook/`](open_notebook), [`commands/`](commands) | Python 3.12, FastAPI, LangGraph, SurrealDB |
| Tut Agent | [`agent/`](agent) | Next.js, TypeScript, PostgreSQL (Drizzle), Redis |
| Document pipelines | [`open_notebook/craft/`](open_notebook/craft) | PptxGenJS, Craft engine CLIs |
| Deployment | [`docker-compose.yml`](docker-compose.yml), [`Dockerfile`](Dockerfile) | Docker Compose |

### Studio pipelines

| Preset | Pipeline | Output |
|---|---|---|
| Presentation | Tut Agent drafts the deck → PptxGenJS builds the slides → DeckCraft validates and exports PDF | `.pptx`, `.pdf` |
| Report | Tut Agent drafts the report → WordCraft builds the document and PDF → PdfCraft verifies it | `.docx`, `.pdf` |
| Sketchnote | Tut Agent drafts the one-pager → SVG layout → VectorCraft exports PDF and PNG | `.svg`, `.pdf`, `.png` |
| Spreadsheet | Tut Agent extracts the tables → GridCraft builds and styles the workbook | `.xlsx` |

Studio calls Tut Agent with the signed-in user's own API key (stored encrypted in that
user's database), so every generation runs with that person's permissions.

## Quick start

**Requirements:** Docker with Compose v2, 16 GB RAM (more for larger local models), about
30 GB of free disk space.

```bash
git clone https://github.com/AhmdArFa/MCIT-AI-Workspace.git
cd MCIT-AI
cp .env.example .env          # replace every CHANGE_ME, e.g. with: openssl rand -hex 32
docker compose up -d --build
```

| Address | Service |
|---|---|
| http://localhost:8502 | MCIT AI |
| http://localhost:3210 | Tut Agent (signs in through MCIT AI) |
| http://localhost:8082 | Office editor (used by MCIT AI) |

Sign in with the bootstrap administrator **`admin` / `1234`**, then change the password
immediately in **Account** or the admin console.

On first start the stack pulls the default local models through Ollama. To use another
local model, set `OLLAMA_CHAT_MODEL` in `.env` (for example `gemma4:e4b`). See
[docs/5-CONFIGURATION/ollama.md](docs/5-CONFIGURATION/ollama.md).

### Connect Studio to Tut Agent

1. Open Tut Agent and create a personal API key.
2. In MCIT AI, open **Account → Studio connection** and paste the key.
3. Open a notebook, choose **Studio** and pick a preset.

## Configuration

All settings live in `.env`. The full list is in
[docs/5-CONFIGURATION/environment-reference.md](docs/5-CONFIGURATION/environment-reference.md).

| Variable | Purpose |
|---|---|
| `MCIT_AUTH_SECRET` | Signs MCIT AI sessions |
| `OPEN_NOTEBOOK_ENCRYPTION_KEY` | Encrypts stored credentials |
| `MCIT_ADMIN_USERNAME`, `MCIT_ADMIN_PASSWORD` | Bootstrap administrator |
| `TUT_OIDC_CLIENT_SECRET` | Single sign-on between MCIT AI and Tut Agent |
| `TUT_ADMIN_TOKEN` | Lets the admin console read Tut Agent activity (server-to-server) |
| `ONLYOFFICE_JWT_SECRET` | Secures the office editor |
| `OLLAMA_CHAT_MODEL`, `OLLAMA_EMBEDDING_MODEL` | Local models |
| `MCIT_PUBLIC_URL`, `TUT_AGENT_PUBLIC_URL` | Public addresses behind your reverse proxy |

## Accounts and data isolation

- Administrators create accounts. There is no self-registration.
- Each account has its own SurrealDB database and data folder. The server binds every
  request to the signed-in account, so a client cannot address another account's storage.
- Tut Agent signs users in through MCIT AI (OpenID Connect). Signing out ends both sessions
  for that browser, and other browsers and devices stay signed in.
- Administrators can review a person's workspace, including their Tut Agent chats, files,
  generations and token usage, only through the admin console.

## Development

```bash
# Backend
uv sync
uv run pytest tests/
uv run ruff check . && uv run python -m mypy .

# Web application
cd frontend && npm ci && npm test && npm run build

# Tut Agent
cd agent && pnpm install && pnpm test-app
```

Local development order: SurrealDB → API → worker → web app (`make start-all`). See
[docs/7-DEVELOPMENT/development-setup.md](docs/7-DEVELOPMENT/development-setup.md) and the
architecture guide in [docs/7-DEVELOPMENT/architecture.md](docs/7-DEVELOPMENT/architecture.md).

For local Studio work, download the Craft engine CLIs pinned in the
[`Dockerfile`](Dockerfile), set `CRAFT_BIN_DIR`, and run `npm ci` in
[`open_notebook/craft/deck`](open_notebook/craft/deck).

## Documentation

| Topic | Location |
|---|---|
| Getting started | [docs/0-START-HERE](docs/0-START-HERE/index.md) |
| Installation | [docs/1-INSTALLATION](docs/1-INSTALLATION/index.md) |
| Concepts and user guide | [docs/2-CORE-CONCEPTS](docs/2-CORE-CONCEPTS/index.md), [docs/3-USER-GUIDE](docs/3-USER-GUIDE/index.md) |
| Models and configuration | [docs/4-AI-PROVIDERS](docs/4-AI-PROVIDERS/index.md), [docs/5-CONFIGURATION](docs/5-CONFIGURATION/index.md) |
| Development and decisions | [docs/7-DEVELOPMENT](docs/7-DEVELOPMENT/index.md) |
| Verified Studio run on a local model | [docs/7-DEVELOPMENT/studio-local-model-run.md](docs/7-DEVELOPMENT/studio-local-model-run.md) |

## Production checklist

- Replace every secret in `.env` and change the administrator password.
- Put MCIT AI, Tut Agent and the office editor behind TLS.
- Keep SurrealDB, PostgreSQL, Redis, object storage and Ollama on a private network.
- Review [PRIVACY_AUDIT.md](PRIVACY_AUDIT.md) before onboarding users.

## License

Copyright © Ministry of Communications and Information Technology (MCIT).

This repository includes third-party components under their own licenses. The required
notices are in [NOTICE](NOTICE) and [agent/NOTICE](agent/NOTICE).
