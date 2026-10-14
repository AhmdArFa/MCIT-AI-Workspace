# Verified runs: the four Studio features on a local model

Date: 14 October 2026. Model: **gemma4:e4b** on the project's local Ollama
server (`OLLAMA_CONTEXT_LENGTH=16384`), CPU only, no cloud keys. Every
drafting call goes through Tut Agent's Responses API (the real agent runtime);
token counts are the live counts Ollama reports.

Assets: the approved kit covers (`cover-hero.png`, `cover-end.png`), the
approved reference templates, Libre Franklin and Inter. The first runs below
used the Libre Franklin fallback for headings; from the report runs marked
"Nohemi" on, the kit's Nohemi files and the two Word masters
(`templates/word/MCIT-WSIS-Report-Noir-{DARK,LIGHT}.docx`) were installed, and
the Word report is a filled copy of the master for its theme.

## Studio features

| Feature | Options | Time | Model calls | Tokens in / out | Audit | Output |
|---|---|---|---|---|---|---|
| Presentation | dark, default template, 8 slides | 347 s | 1 | 9,877 / 2,724 | pass 1: a title wrapped and a card overflowed; pass 2: no issues | pptx + pdf, 8 slides, hero and end covers |
| Presentation | light, custom ("more visual, data first") | 259 s | 1 | 9,877 / 2,816 | pass 1: no issues | pptx + pdf |
| Report | light, medium | 1,070 s | 6 (outline + 5 chapters) | 49,170 / 8,801 | pass 1: no issues | PDF 10 pages, Word 7 pages (1,596 words), covers on both |
| Report (Nohemi) | dark, long | 2,514 s | 13 (outline, 8 chapters, 3 rewrites) | 121,361 / 21,102 | pass 1: 3 chapters under the long word count, rewritten by Tut Agent; pass 2: no issues | PDF 21 pages, Word 21 pages |
| Report (Nohemi) | light, short | 704 s | 4 | 37,124 / 6,954 | pass 1: no issues | PDF 8 pages, Word 8 pages |
| Report (Nohemi) | dark, medium | 1,062 s | 6 | 55,562 / 10,080 | pass 1: no issues | PDF 10 pages, Word 10 pages |
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

## System checks

- Sign in and sign out: protected pages return to sign-in after sign out, and
  the Tut Agent session ends with it (single sign-out).
- Single sign-on: Tut Agent's sign-in offers one MCIT AI button; one click
  opened Tut as the signed-in MCIT AI administrator, inside the MCIT AI page.
  (The button read "Continue with GenericOidc"; it now reads "Continue with
  MCIT AI" in English, Arabic and Chinese.)
- Admin console: accounts, per-user counts, tokens and storage; Monitoring
  lists every document kit asset as installed.
- Office editing (ONLYOFFICE Docs): the 21-page dark report opened in the
  large panel, was edited, and the save came back to MCIT AI (file rewritten,
  `file.saved` in the activity log). Kit fonts are mounted into the document
  server so edited files keep Nohemi and Libre Franklin.

## Fixed during verification

- Source processing lost the tenant (`tenant=None` in command args), so no
  source could be processed; fixed in `tenancy.submit_command`.
- Tut's Ollama runtime dropped token counts and tool-call history (the model
  repeated the same call); both fixed in the Ollama provider.
- Report drafts overflowed a 4,096-token context; the Ollama context is now
  16,384 and chapters are written one per call.
- WordCraft cover pictures exceeded the command-argument limit; covers are
  embedded as print-resolution JPEGs of the same art.
- Local models mix Markdown into chapter text (`###` heading lines followed by
  their paragraph, `*` lists run into one paragraph, `**bold**`). The first
  long report showed whole paragraphs styled as headings; chapter text is now
  read into headings, paragraphs and list items before layout (PDF and Word).
- The light Word master's closing page carried dark-mode text colours (white
  "Thank You" on a white page); light output maps them to the light ink.
- Tut Agent's development server could not load its UI kit after the vendor
  rename (dependencies were pre-bundled under the alias name only); both names
  are pre-bundled now.
