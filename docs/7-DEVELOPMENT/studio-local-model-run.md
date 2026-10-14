# Verified run: Studio presentation through Tut Agent on a local model

Final verified run: 14 October 2026, 15:48–15:50 UTC, on the final commits of
branch `refactor/tut-craft-onlyoffice` (MCIT AI `613517e`, Tut Agent
`1a116b55`). Model: **gemma4:e4b** on the local Ollama server. An earlier run
on the same day (13:53 UTC, before the naming refactor) used the same model
and gave the same kind of result.

This run checks the full Studio path with a real model and no cloud keys:
MCIT AI API → Tut Agent Responses API (`/api/v1/responses`, the real agent
runtime) → Ollama → PptxGenJS → DeckCraft → the user's library.

## Setup

| Part | What ran |
|---|---|
| Model server | Ollama (`ollama/ollama:latest`), the project's own local-model wiring (`OLLAMA_PROXY_URL`, see [ollama.md](../5-CONFIGURATION/ollama.md)) |
| Model | `gemma4:e4b`, Tut Agent's built-in default (`DEFAULT_MODEL` / `DEFAULT_PROVIDER = ollama`), on CPU only |
| Tut Agent | `agent/` at this branch, Postgres (ParadeDB pg17) and Redis, migrations applied |
| MCIT AI | API at this branch, SurrealDB v2, DeckCraft 0.6.1 CLI (`CRAFT_BIN_DIR`) |
| Account | Bootstrap `admin`, linked to its Tut user by the OIDC subject; personal Tut API key saved under Account → Tut Agent |

## Steps

1. Notebook "Digital Egypt 2030" with one note (programme brief, 704 characters).
2. `POST /api/studio/jobs` with `{"preset": "presentation", "mode": "dark", "slide_count": 5}`.
3. Poll `GET /api/studio/jobs/{id}` until `completed` (about 2.5 minutes on one CPU core).

## Result

Job log, as Studio reported it:

```
Tut Agent is reading the notebook
Loaded 704 characters from 0 source(s)
Drafting structure: calling the model         <- Tut Agent, agent "inbox", gemma4:e4b via Ollama
Drafted 3 content slides
Building the slides with PptxGenJS
DeckCraft: validating the presentation
DeckCraft: 5 slides verified
DeckCraft: exporting the PDF copy
Delivered 2 file(s) for "Digital Egypt 2030: Program Update".
```

Files in the admin's library:

| File | Size | Check |
|---|---|---|
| `Digital-Egypt-2030-Program-Update.pptx` | 131,667 bytes | 5 slides: title, "Service availability on the Digital Egypt portal" (170+ services by 2025), "The three pillars of the Digital Egypt programme", "Priorities for the next phase of development" (fibre under Decent Life, data centre capacity, National AI Strategy), closing |
| `Digital-Egypt-2030-Program-Update.pdf` | 797,325 bytes | valid PDF (DeckCraft export) |

Tut Agent's store records the reply as `assistant · gemma4:e4b · ollama`.
Slide content follows the note. One model slip shows on the pillars slide
("Digits government services"); the local 4B model's wording is not edited.

The same run also exercised the admin console's Tut Agent views. The admin's
Tut workspace showed 1 chat with 2 messages and 1 `gemma4:e4b` reply. A second
account showed `linked: false`, a member got 403 on the admin feed, and Tut's
feed returned 401 without the server token.

## Known gaps

- Tut Agent's Ollama runtime does not report token counts, so per-message
  `usage` and `agent_operations.total_tokens` are empty for Ollama replies.
  The admin console counts these replies but shows 0 tokens. Cloud providers
  that report usage fill these columns.
- Studio's own job usage (`usage_event`) records 0 tokens for the same reason.
