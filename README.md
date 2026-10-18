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
  chat with a model that answers only from the processed passages of the sources you
  select, with numbered citations back to those passages.
- **Tut Agent**: a multi-step agent with tools, skills, knowledge bases, memory and
  multi-agent groups. It can use MCIT AI itself (notebooks, search, Studio, files)
  and shows its reasoning, tool calls and progress as it works.
- **Studio**: turns a notebook into finished deliverables (presentations, reports,
  infographics and spreadsheets) in the approved MCIT document style, checked page by
  page before delivery and opened in an integrated office editor.

Everything runs on local models by default. No cloud API key is required, and each
account's data is isolated from every other account.

## Key features

| Area | Capabilities |
|---|---|
| **Notebooks** | Multi-format ingestion, full-text and vector search, notes, grounded chat with passage citations, podcasts with local speech |
| **Tut Agent** | Agent runtime with tool calling, skills, knowledge bases, long-term memory and agent groups at `/tut`; MCIT AI tools are connected for each user automatically |
| **Studio** | Presentation, report (short, medium or long), infographic and spreadsheet, each in dark or light, from the approved template or a custom direction |
| **Office editor** | ONLYOFFICE Docs opens and edits every `.docx`, `.xlsx`, `.pptx` and `.pdf` in a large side panel. Edits are saved back to the library |
| **Accounts** | Administrator-managed accounts, roles, per-account databases and storage, one login for every component |
| **Administration** | User management, per-user views of chats, files, generations and token usage (including Tut Agent), document kit status, service monitoring and an audit log |
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
   │      │       │      ◄── MCP tools ───        │
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
| Studio and document kit | [`open_notebook/craft/`](open_notebook/craft) | PptxGenJS, ReportLab, Craft engine CLIs |
| Deployment | [`docker-compose.yml`](docker-compose.yml), [`Dockerfile`](Dockerfile) | Docker Compose |

## Studio

Tut Agent drafts the content from the notebook; dedicated engines build the files; an
audit loop renders and checks the result and fixes what it finds (up to five passes)
before anything is delivered. Progress, model calls and token usage are shown step by
step while a file is being made.

| Feature | Pipeline | Output |
|---|---|---|
| Presentation | PptxGenJS builds the slides with the approved covers → DeckCraft renders every slide and exports PDF | `.pptx`, `.pdf` |
| Report | Outline, then one chapter per call → ReportLab and PdfCraft build the print PDF → the Word file is a filled copy of the approved Word master, checked with WordCraft | `.pdf`, `.docx` |
| Infograph | Sketchnote layout with Open Doodles → VectorCraft renders and exports | `.png`, `.pdf`, `.svg` |
| Spreadsheet | GridCraft enters the figures exactly as given, adds guarded formulas and checks every one | `.xlsx` |

Reports come in three real depths: short, medium and long differ in the number of
chapters, sub-sections, figures and tables. A chapter that comes back too thin is sent
back to Tut Agent for a deeper draft.

### Document kit

The approved design assets live in
[`open_notebook/craft/kit/assets/`](open_notebook/craft/kit/assets):

- `covers/`: the constant hero and closing cover art used by decks and reports
- `templates/`: the approved PowerPoint, PDF report, Word report, infographic and
  spreadsheet references for both themes
- `fonts/`: Nohemi (headings), Libre Franklin (body) and Inter (covers)
- `doodles/`: Open Doodles (CC0) for infographics

The admin console (**Monitoring → Document kit**) shows whether every asset is
installed. `CRAFT_KIT_DIR` can point at a mounted copy of the kit instead.

## Quick start

**Requirements:** Docker with Compose v2, 16 GB RAM (more for larger local models), about 30 GB of free disk space. Host Ollama with `gemma4:e4b` recommended for GPU acceleration.

### One-Click Bootstrap (Recommended)

Run the automated setup script which configures `.env`, launches the container stack, unlocks the 131k context window and full reasoning mode, and verifies all services:

```bash
# Clone the repository
git clone https://github.com/AhmdArFa/TuT-AI.git
cd TuT-AI

# On Windows (PowerShell):
.\scripts\setup_tut_ai.ps1

# On Linux / macOS (Bash):
chmod +x ./scripts/setup_tut_ai.sh
./scripts/setup_tut_ai.sh
```

### Manual Start

```bash
cp .env.example .env          # replace CHANGE_ME if needed
docker compose up -d
```

| Address | Service | Description |
|---|---|---|
| http://localhost:8502 | TuT AI Platform | Notebooks, 4-Card Squared Studio, Knowledge Base |
| http://localhost:3210 | TuT Agent | Sovereign Egyptian AI Agent, 1-Click Avatar Switcher, In-Chat Documents |
| http://localhost:8082 | Office Editor | Integrated ONLYOFFICE Docs for generated presentations, reports & spreadsheets |

Sign in with the bootstrap administrator **`admin` / `1234`**, then change the password
immediately in **Account** or the admin console.

On first start the stack pulls the default local models through Ollama
(`qwen2.5:7b` and `nomic-embed-text`). To use another local model, set
`OLLAMA_CHAT_MODEL` in `.env` (for example `gemma4:e4b`). See
[docs/5-CONFIGURATION/ollama.md](docs/5-CONFIGURATION/ollama.md).

### Connect Studio and Tut Agent

1. Open Tut Agent and create a personal API key with the `model:invoke`, `chat:write`
   and `agent:write` scopes.
2. In MCIT AI, open **Account → Studio connection** and paste the key.
3. Open a notebook, choose **Studio** and pick a feature.

Connecting does both directions: Studio drafts through your Tut Agent, and your Tut
Agent gets the MCIT AI tools (notebooks, knowledge search, the four Studio features,
document skills and files) under your own account.

## Configuration

All settings live in `.env`. The full list is in
[docs/5-CONFIGURATION/environment-reference.md](docs/5-CONFIGURATION/environment-reference.md).

| Variable | Purpose |
|---|---|
| `MCIT_AUTH_SECRET` | Signs MCIT AI sessions |
| `OPEN_NOTEBOOK_ENCRYPTION_KEY` | Encrypts stored credentials |
| `MCIT_ADMIN_USERNAME`, `MCIT_ADMIN_PASSWORD` | Bootstrap administrator |
| `TUT_OIDC_CLIENT_SECRET` | Single sign-on between MCIT AI and Tut Agent |
| `TUT_ADMIN_TOKEN` | Server-to-server access for the admin console and the Tut Agent tool connection |
| `ONLYOFFICE_JWT_SECRET` | Secures the office editor |
| `OLLAMA_CHAT_MODEL`, `OLLAMA_EMBEDDING_MODEL` | Local models |
| `TUT_DRAFT_TIMEOUT_SECONDS` | Longest time a Studio drafting call may take (default 900) |
| `MCIT_PUBLIC_URL`, `TUT_AGENT_PUBLIC_URL`, `ONLYOFFICE_PUBLIC_URL` | Public addresses behind your reverse proxy |

## Accounts and data isolation

- Administrators create accounts. There is no self-registration.
- Each account has its own SurrealDB database and data folder. The server binds every
  request, and every background job, to the signed-in account, so a client cannot
  address another account's storage.
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
| Verified Studio runs and system checks on a local model | [docs/7-DEVELOPMENT/studio-local-model-run.md](docs/7-DEVELOPMENT/studio-local-model-run.md) |

## Production checklist

- Replace every secret in `.env` and change the administrator password.
- Put MCIT AI, Tut Agent and the office editor behind TLS.
- Keep SurrealDB, PostgreSQL, Redis, object storage and Ollama on a private network.
- Review [PRIVACY_AUDIT.md](PRIVACY_AUDIT.md) before onboarding users.

## License

Copyright © Ministry of Communications and Information Technology (MCIT).

This repository includes third-party components under their own licenses. The required
notices are in [NOTICE](NOTICE) and [agent/NOTICE](agent/NOTICE).
