# 🏛️ TuT AI: Sovereign Artificial Intelligence Platform
## Comprehensive Technical Retrospective, Architecture Breakdown & Future Roadmap

**Ministry of Communications and Information Technology (MCIT), Egypt**  
**Repository:** [github.com/AhmdArFa/TuT-AI](https://github.com/AhmdArFa/TuT-AI)  
**Date:** October 2026  

---

## 1. Executive Summary & Core Mission

**TuT AI** is Egypt's private, sovereign, and self-hosted artificial intelligence workspace engineered specifically for government and administrative sovereignty. Built to operate **100% locally and offline without external cloud dependencies**, TuT AI secures state data while delivering frontier AI capabilities on local hardware.

At the epicenter of TuT AI's operational power are three specialized production engines:
1. **Intelligent Deep Summarization Engine:** Advanced multi-source synthesis, grounded RAG citations, and tiered hierarchical executive digests across hundreds of pages of complex Arabic and English documents.
2. **Autonomous Presentation Engine (PowerPoint / PDF):** End-to-end generation of professional, multi-slide decks (`.pptx`, `.pdf`) with ministerial typography, master covers, metric cards, and instant in-chat download/editing.
3. **Vector Infographics Studio:** Automated conversion of complex data and strategic workflows into visual sketchnotes and diagrams (`.png`, `.svg`, `.pdf`) using dedicated rendering engines.

---

## 2. Core Feature Deep-Dives: Summarization, Presentations & Infographics

### A. Intelligent Deep Summarization Engine
* **Multi-Format Ingestion:** Ingests dense PDFs, administrative decrees, technical specifications, and spreadsheets.
* **Hierarchical Synthesis:** Generates multi-depth summaries:
  - *Executive Digest:* High-level strategic briefing for leadership.
  - *Thematic Breakdown:* Chapter-by-chapter extraction of key arguments and decisions.
  - *Action Item Extraction:* Direct tabular extraction of deliverables, dates, and accountabilities.
* **Numbered Grounded Passage Citations:** Every summary statement is strictly bound to its verified source passage, eliminating hallucinations and ensuring administrative reliability.

### B. Autonomous Presentation Generation (`.pptx` & `.pdf`)
* **Live In-Chat Generation:** Users can prompt TuT Agent in natural language (e.g., *"Generate a 12-slide strategy presentation on our Digital Egypt goals"*), and the agent drafts, structures, and compiles a complete `.pptx` file directly in the chat stream.
* **DeckCraft Engine Pipeline:**
  1. *Architectural Planning:* TuT Agent drafts slide titles, narratives, metric highlights, and bullet points.
  2. *Design System Enforcement:* Slides are compiled using approved ministerial layouts (Nohemi headings, Libre Franklin body, obsidian dark or crisp light).
  3. *5-Pass Audit Loop:* The system renders slide previews, inspects text overflow and alignment, adjusts layout parameters, and exports the final `.pptx` and `.pdf`.
* **Instant In-Chat Preview & Office Integration:** Downloadable in-stream and immediately editable in the embedded ONLYOFFICE Document Server on port `8082`.

### C. Vector Infographics Studio (`.png`, `.svg`, `.pdf`)
* **Visual Storytelling:** Automatically translates abstract data, policy roadmaps, and timelines into sketchnote infographics.
* **VectorCraft & Open Doodles:** Renders structured vector art, flowchart arrows, metric callout badges, and humanized visual icons.
* **Multi-Format Export:** Produces high-resolution raster (`.png`), vector (`.svg`), and print-ready (`.pdf`) outputs ready for immediate inclusion in official publications.

---

## 3. The Development Journey & Experiments: What Was Tested vs. What Stayed

### Phase 1: Sovereign Egyptian Brand & Identity
* **Experimented:** Transitioned away from generic open-source branding (LobeHub remnants).
* **Adopted:** Engineered the **TuT AI Sovereign Persona Suite** featuring 10 historic Egyptian personas (King Tut, Akhenaten, Imhotep, Horus, Thoth, Nefertiti, etc.). Deployed a 3D transparent holographic portrait within an obsidian cartouche framed in royal gold (`#D4AF37`).

### Phase 2: Design System Testing & Safe Rollback
* **Experimented:** Tested an external experimental design system (`design system`). During third-party AI automation, regressions occurred in ChatInput bindings, style classes, and route manifests.
* **Adopted (Safe Rollback & Selective Integration):** Executed a surgical Git rollback to checkpoint tags (`checkpoint-last-update` and commit `2aabdee7`), preserving system stability while selectively integrating user-requested UI refinements:
  - **Squared 4-Card Studio Modal:** Redesigned from a vertical list into a responsive `grid-cols-2 sm:grid-cols-4` squared card grid with gold interactive states.
  - **Podcasts Deprecation:** Removed the unused `/podcasts` route from the sidebar and added an HTTP 307 redirect to `/notebooks`.

### Phase 3: Model Intelligence & Velocity Optimization
* **Experimented:** Default Ollama local setups suffered from tight 2k–4k context limits, cold-start model unload latency, and shallow reasoning budgets.
* **Adopted:**
  - Upgraded PostgreSQL `ai_models` and `agents` tables to **131,072 context tokens** and **16,384 max output tokens**.
  - Activated reasoning mode `pro` with an **8,192 thinking token budget** and tool mode `all`.
  - Pinned `gemma4:e4b` into NVIDIA GeForce RTX 4050 GPU VRAM (5,145 MB allocated) with `keep_alive: "-1"`, eliminating cold-start delays.

### Phase 4: Structured Output Fallback & Self-Healing Architecture
* **Experimented:** Local Ollama engines crashed on TRPC Next.js structured object requests (`this._runtime.generateObject`).
* **Adopted:** Implemented a self-healing fallback proxy in `startServer.js` and server chunks that intercepts calls, routes directly to Ollama, strips markdown code fences, and guarantees valid JSON returns.

---

## 4. Final System Status & Service Architecture

The repository is fully verified, operational, and published on GitHub:
👉 **[https://github.com/AhmdArFa/TuT-AI](https://github.com/AhmdArFa/TuT-AI)**

### Service Topology:
| Service | Port | Architectural Role | Status |
|---|---|---|---|
| **TuT Agent Chat** | `3210` | Conversational Agent, 1-Click Persona Switcher, In-Chat PPTX & Reports | 🟢 Healthy |
| **TuT Web Platform** | `8502` | Notebooks, Deep Summarization, Squared 4-Card Studio Modal | 🟢 Healthy |
| **ONLYOFFICE Docs** | `8082` | Full Web Office Suite for editing generated presentations & spreadsheets | 🟢 Healthy |
| **TuT API & Workers** | `5055` | FastAPI Backend, LangGraph Workflows, Craft Rendering Engines | 🟢 Healthy |
| **SurrealDB** | `8000` | Account-isolated database for notes, chunks, and vector embeddings | 🟢 Healthy |
| **PostgreSQL (ParadeDB)**| `5432` | Agent memory, skills, tool metadata, and hybrid full-text search | 🟢 Healthy |
| **Kokoro TTS** | `8880` | Local neural text-to-speech engine | 🟢 Healthy |

---

## 5. Strategic Future Work Roadmap

1. **High-Velocity Inference (vLLM Engine):** Replace standard Ollama CPU-GPU bottlenecks with a high-throughput `vLLM` container to achieve **60–80+ tokens/sec** streaming.
2. **Egyptian Administrative Fine-Tuning (LoRA):** Fine-tune specialized LoRA adapters on official ministerial decrees, circulars, and executive correspondence.
3. **Multimodal Document Vision:** Enable direct extraction of scanned PDFs, historical handwriting, and engineering blueprints via vision models.
4. **Collaborative Agent Swarms:** Enable autonomous hand-offs where "Thoth" conducts source research, "Imhotep" builds analytical spreadsheets, and "TuT" compiles the final PowerPoint deck.
5. **Pre-Built Container Registry (GHCR):** Provide zero-compile distribution so ministerial staff can deploy the entire ecosystem via `docker compose pull`.
