---
name: templates
description: The master template system. Read before any document task: pick the approved template, edit a copy for the request, audit it with the engine, deliver.
---

# Templates (master skill)

Never design from scratch when a template exists. Every document follows the loop:

1. Pick the template for the feature and theme (dark by default, light on request).
2. Work on a copy, never the master.
3. Apply the request: new title, data and sections. Keep the template's structure,
   constant covers, palette and typography.
4. Audit with the engine: DeckCraft renders every slide, PdfCraft and WordCraft
   render every page, GridCraft checks every formula, VectorCraft exports the PNG.
5. Fix every issue and audit again. Stop at zero issues, or after five passes
   report the remaining issues plainly. Never ship silently.
6. Deliver: the same file appears in the chat and in Files.

| Feature | Default template | Engines | Outputs |
|---|---|---|---|
| Presentation | Noir briefing deck (dark or light) | PptxGenJS, DeckCraft | pptx, pdf |
| Report | Noir report: cover, contents, at a glance, chapters with figures, findings, back cover | ReportLab, PdfCraft, WordCraft | pdf, docx |
| Infograph | Sketchnote: speech-bubble title, two columns, doodles, verdict box | VectorCraft, Open Doodles | png, pdf, svg |
| Spreadsheet | Noir monthly report: input columns, formula columns, totals, chart | GridCraft | xlsx |

Covers are constant: hero art on the first slide or page, end art on the last. The
gold ornament lives on the covers only. The logo sits on a white card.

Theme: Midnight Noir. Midnight #010612, Abyss #030F1F, Royal #1E507A, Pulse #16A6E9,
Pale Gold #F7EF8A, White, Silver #B9C2CE. Nohemi headings, Libre Franklin body,
Inter on covers. One accent per page. No gradients, glows, glass or decorative shapes.
No em or en dashes in copy. No source-credit lines.
