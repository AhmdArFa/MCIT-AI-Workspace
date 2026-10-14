# Verified runs: the four Studio features on a local model

Date: 14 October 2026. Model: **gemma4:e4b** on the project's local Ollama
server (`OLLAMA_CONTEXT_LENGTH=16384`), CPU only, no cloud keys. Every
drafting call goes through Tut Agent's Responses API (the real agent runtime);
token counts are the live counts Ollama reports.

Assets: the approved kit covers (`cover-hero.png`, `cover-end.png`), the
approved reference templates, Libre Franklin and Inter. Nohemi was not yet
installed, so headings used the Libre Franklin fallback (listed in Admin,
Monitoring, Document kit).

## Studio features

| Feature | Options | Time | Model calls | Tokens in / out | Audit | Output |
|---|---|---|---|---|---|---|
| Presentation | dark, default template, 8 slides | 347 s | 1 | 9,877 / 2,724 | pass 1: a title wrapped and a card overflowed; pass 2: no issues | pptx + pdf, 8 slides, hero and end covers |
| Presentation | light, custom ("more visual, data first") | 259 s | 1 | 9,877 / 2,816 | pass 1: no issues | pptx + pdf |
| Report | light, medium | 1,070 s | 6 (outline + 5 chapters) | 49,170 / 8,801 | pass 1: no issues | PDF 10 pages, Word 7 pages (1,596 words), covers on both |
| Infograph | light, default | 265 s | 1 | 8,195 / 2,027 | pass 1: no issues | png + pdf + svg, 5 blocks with Open Doodles |
| Spreadsheet | dark, figures pasted in the request | 255 s | 1 | 8,195 / 2,406 | pass 1: no issues | xlsx: the 8 figures exactly as pasted; Change and Change % are guarded formulas; GridCraft check: 8 of 8 formulas match |

Checks the audit loop ran: DeckCraft renders of every slide, PdfCraft page
renders and text extraction, WordCraft page count and render, VectorCraft
export, GridCraft recalculation and formula read-back, text-fit measurement
with the real fonts, layout repetition, copy rules (no dashes, no
placeholders). The dark presentation shows the loop working: pass 1 found a wrapped title
and an overflowing card from the real slide text, the fixer tightened them,
and pass 2 was clean.

Each file was stored once and listed in Files with the same id, name and
version that the Studio progress panel attached.

## Tut Agent automation

Tut Agent was asked in its own chat (Responses API, agent `inbox`) to build a
spreadsheet from pasted figures. It called `studio_produce`, polled
`studio_status`, and answered with links to the stored file:

- 8 minutes end to end, 38,666 tokens across the agent turns
- `Digital-Egypt-Programme-Performance-and-Strategic-Outlook.xlsx`, version 1,
  no audit issues, figures entered exactly (103.2 / 103.9; 168 / 171)
- The link opens the same file in Files (`/files?open=<id>`)

A direct question ("What notebooks do I have?") made one `notebooks_list`
call (245 ms) and answered with the real notebook name.

## Notebook chat (RAG)

Question: "How many government services were available by 2025?"
Answer: "By 2025, more than 170 government services were available on the
Digital Egypt portal [1]." The response carried citation [1] with the source
chunk id, the source id and the passage text.

## Fixed during verification

- Source processing lost the tenant (`tenant=None` in command args), so no
  source could be processed; fixed in `tenancy.submit_command`.
- Tut's Ollama runtime dropped token counts and tool-call history (the model
  repeated the same call); both fixed in the Ollama provider.
- Report drafts overflowed a 4,096-token context; the Ollama context is now
  16,384 and chapters are written one per call.
- WordCraft cover pictures exceeded the command-argument limit; covers are
  embedded as print-resolution JPEGs of the same art.
