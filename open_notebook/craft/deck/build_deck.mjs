// Builds a Midnight Noir .pptx from a Studio deck spec with PptxGenJS.
// Usage: node build_deck.mjs <spec.json> <out.pptx>
//
// Spec: { title, subtitle, eyebrow, date, closing, footer, logo, hero, end,
//         theme: {bg,surface,border,text,muted,accent,premium,series[],onAccent,fontHead,fontBody,fontCover},
//         scale: {title, body} (audit-loop adjustments), slides: [...] }
//
// Rules (kit: covers/USAGE.md, PALETTE.md): hero art full-bleed on the first
// slide, end art on the last; content slides on solid Midnight or White; one
// accent per slide; no stripes, underlines, gradients or slide numbers.
import { readFileSync } from "node:fs";
import pptxgen from "pptxgenjs";

const [, , specPath, outPath] = process.argv;
const spec = JSON.parse(readFileSync(specPath, "utf-8"));
const t = spec.theme;
const sc = Object.assign({ title: 1, body: 1 }, spec.scale || {});

const pptx = new pptxgen();
pptx.layout = "LAYOUT_WIDE"; // 13.333 x 7.5 in
pptx.author = "MCIT AI";
pptx.company = "Ministry of Communications and Information Technology";
pptx.title = spec.title;

const W = 13.333;
const H = 7.5;
const M = 0.75;
const head = (o = {}) => ({ fontFace: t.fontHead, color: t.text, bold: true, ...o });
const body = (o = {}) => ({ fontFace: t.fontBody, color: t.text, ...o });
const muted = (o = {}) => ({ fontFace: t.fontBody, color: t.muted, ...o });
let slideScale = 1;
const fs = (n) => Math.round(n * sc.body * slideScale * 10) / 10;
const ft = (n) => Math.round(n * sc.title * 10) / 10;

pptx.defineSlideMaster({
  title: "NOIR",
  background: { color: t.bg },
  objects: [
    { text: { text: spec.footer || "MCIT AI", options: { x: M, y: H - 0.48, w: 9, h: 0.3, fontSize: 9, ...muted() } } },
  ],
});

function logoCard(slide, x, y) {
  if (!spec.logo) return;
  slide.addShape(pptx.ShapeType.roundRect, { x, y, w: 1.35, h: 0.82, rectRadius: 0.1, fill: { color: "FFFFFF" }, line: { color: "FFFFFF" } });
  slide.addImage({ path: spec.logo, x: x + 0.12, y: y + 0.08, w: 1.11, h: 0.66, sizing: { type: "contain", w: 1.11, h: 0.66 } });
}

function header(slide, sl) {
  // Approved template: logo on a white card, top right of every content slide
  if (spec.logo) {
    slide.addShape(pptx.ShapeType.roundRect, { x: W - M - 1.25, y: 0.35, w: 1.25, h: 0.62, rectRadius: 0.08, fill: { color: "FFFFFF" }, line: { color: "FFFFFF" } });
    slide.addImage({ path: spec.logo, x: W - M - 1.17, y: 0.4, w: 1.09, h: 0.52, sizing: { type: "contain", w: 1.09, h: 0.52 } });
  }
  if (sl.eyebrow) slide.addText(String(sl.eyebrow).toUpperCase(), { x: M, y: 0.42, w: W - 2 * M, h: 0.3, fontSize: 11, charSpacing: 3, bold: true, color: t.accent, fontFace: t.fontBody });
  slide.addText(sl.title, { x: M, y: 0.7, w: W - 2 * M - 1.6, h: 0.9, fontSize: ft(30), ...head(), valign: "top", fit: "shrink" });
  if (sl.subtitle) slide.addText(sl.subtitle, { x: M, y: 1.55, w: W - 2 * M, h: 0.45, fontSize: fs(15), ...muted() });
}

const bulletRuns = (items, size) =>
  items.map((b) => ({ text: String(b), options: { bullet: { indent: 16 }, paraSpaceAfter: 9, ...body({ fontSize: size }) } }));

function card(slide, x, y, w, h) {
  slide.addShape(pptx.ShapeType.roundRect, { x, y, w, h, rectRadius: 0.06, fill: { color: t.surface }, line: { color: t.border, width: 0.75 } });
}

// ---------------------------------------------------------------- cover
{
  const s = pptx.addSlide();
  s.background = { color: t.bg };
  if (spec.hero) s.addImage({ path: spec.hero, x: 0, y: 0, w: W, h: H, sizing: { type: "cover", w: W, h: H } });
  logoCard(s, M, 0.55);
  s.addText((spec.eyebrow || "MCIT AI").toUpperCase(), { x: M, y: 2.35, w: 8.5, h: 0.4, fontSize: 12, charSpacing: 4, bold: true, color: "B9C2CE", fontFace: t.fontCover });
  s.addText(spec.title, { x: M, y: 2.8, w: 8.6, h: 1.9, fontSize: ft(42), fontFace: t.fontHead, bold: true, color: "FFFFFF", valign: "top", fit: "shrink" });
  if (spec.subtitle) s.addText(spec.subtitle, { x: M, y: 4.75, w: 8.4, h: 0.9, fontSize: fs(17), fontFace: t.fontBody, color: "B9C2CE", valign: "top" });
  if (spec.date) s.addText(spec.date, { x: M, y: 6.45, w: 6, h: 0.35, fontSize: 12, fontFace: t.fontCover, color: "B9C2CE" });
}

let lastLayout = "";
for (const sl of spec.slides) {
  const s = pptx.addSlide({ masterName: "NOIR" });
  slideScale = sl.scale || 1; // audit loop: per-slide fill adjustment
  const top = sl.subtitle ? 2.2 : 1.9;
  const h = H - 0.75 - top;

  if (sl.layout === "section") {
    s.addText(String(sl.number || "").padStart(2, "0"), { x: M, y: 2.2, w: 3, h: 1.2, fontSize: 60, fontFace: t.fontHead, bold: true, color: t.accent });
    s.addText(sl.title, { x: M, y: 3.45, w: W - 2 * M, h: 1.1, fontSize: ft(36), ...head(), valign: "top", fit: "shrink" });
    if (sl.subtitle) s.addText(sl.subtitle, { x: M, y: 4.6, w: 9, h: 0.6, fontSize: fs(16), ...muted() });
    lastLayout = sl.layout;
    if (sl.notes) s.addNotes(sl.notes);
    continue;
  }

  header(s, sl);
  switch (sl.layout) {
    case "agenda": {
      const items = (sl.bullets || []).slice(0, 8);
      const cols = items.length > 4 ? 2 : 1;
      const per = Math.ceil(items.length / cols);
      const cw = (W - 2 * M - 0.5 * (cols - 1)) / cols;
      items.forEach((it, i) => {
        const c = Math.floor(i / per);
        const r = i % per;
        const x = M + c * (cw + 0.5);
        const y = top + 0.15 + r * 1.05;
        s.addText(String(i + 1).padStart(2, "0"), { x, y, w: 0.9, h: 0.6, fontSize: 22, fontFace: t.fontHead, bold: true, color: t.accent });
        s.addText(String(it), { x: x + 0.95, y, w: cw - 0.95, h: 0.6, fontSize: fs(17), ...body(), valign: "middle" });
        s.addShape(pptx.ShapeType.line, { x, y: y + 0.82, w: cw, h: 0, line: { color: t.border, width: 0.75 } });
      });
      break;
    }
    case "stats":
    case "cards": {
      if (sl.layout === "stats" && (sl.stats || []).length === 1) {
        const st = sl.stats[0];
        s.addText(String(st.value), { x: M, y: top + 0.3, w: W - 2 * M, h: 2.2, fontSize: ft(110), fontFace: t.fontHead, bold: true, color: t.accent, fit: "shrink" });
        s.addText(String(st.label), { x: M, y: top + 2.6, w: 9, h: 0.9, fontSize: fs(22), ...body(), valign: "top" });
        if ((sl.bullets || []).length) s.addText(bulletRuns(sl.bullets.slice(0, 3), fs(15)), { x: M, y: top + 3.5, w: W - 2 * M, h: h - 3.6, valign: "top" });
        break;
      }
      const items = sl.layout === "stats" ? (sl.stats || []).map((x) => [x.value, x.label]) : (sl.bullets || []).map((b) => ["", b]);
      const n = Math.max(1, Math.min(items.length, 4));
      const gap = 0.3;
      const cw = (W - 2 * M - gap * (n - 1)) / n;
      items.slice(0, 4).forEach(([v, l], i) => {
        const x = M + i * (cw + gap);
        card(s, x, top + 0.2, cw, 2.7);
        const label = v ? String(v) : String(i + 1).padStart(2, "0");
        s.addText(label, { x: x + 0.25, y: top + 0.4, w: cw - 0.5, h: v ? 1.1 : 0.7, fontSize: v ? ft(38) : 26, fontFace: t.fontHead, bold: true, color: t.accent, fit: "shrink" });
        s.addText(String(l), { x: x + 0.25, y: v ? top + 1.5 : top + 1.15, w: cw - 0.5, h: v ? 1.25 : 1.6, fontSize: fs(v ? 14 : 17), ...body(), valign: "top" });
      });
      if ((sl.bullets || []).length && sl.layout === "stats")
        s.addText(bulletRuns(sl.bullets.slice(0, 3), fs(14)), { x: M, y: top + 3.15, w: W - 2 * M, h: h - 3.2, valign: "top" });
      break;
    }
    case "two_column":
    case "comparison": {
      const cw = (W - 2 * M - 0.4) / 2;
      [[sl.left_title, sl.left], [sl.right_title, sl.right]].forEach(([ct, items], i) => {
        const x = M + i * (cw + 0.4);
        card(s, x, top, cw, h);
        if (ct) s.addText(ct, { x: x + 0.3, y: top + 0.25, w: cw - 0.6, h: 0.55, fontSize: fs(20), fontFace: t.fontHead, bold: true, color: i === 0 ? t.accent : t.text });
        s.addText(bulletRuns(items || [], fs((items || []).length <= 3 ? 18 : 16)), { x: x + 0.3, y: top + 0.95, w: cw - 0.6, h: h - 1.15, valign: "top" });
      });
      break;
    }
    case "process":
    case "timeline": {
      const steps = ((sl.steps || []).length ? sl.steps : sl.bullets || []).slice(0, 5);
      const n = Math.max(steps.length, 1);
      const gap = 0.25;
      const cw = (W - 2 * M - gap * (n - 1)) / n;
      const ly = top + 0.75;
      s.addShape(pptx.ShapeType.line, { x: M, y: ly, w: W - 2 * M, h: 0, line: { color: t.border, width: 1 } });
      steps.forEach((st, i) => {
        const x = M + i * (cw + gap);
        s.addShape(pptx.ShapeType.ellipse, { x: x, y: ly - 0.13, w: 0.26, h: 0.26, fill: { color: i === 0 ? t.accent : t.surface }, line: { color: t.accent, width: 1 } });
        s.addText(String(i + 1).padStart(2, "0"), { x, y: top, w: 1, h: 0.45, fontSize: 18, fontFace: t.fontHead, bold: true, color: t.accent });
        s.addText(String(st), { x, y: ly + 0.35, w: cw - 0.1, h: h - 1.2, fontSize: fs(14), ...body(), valign: "top" });
      });
      break;
    }
    case "quote": {
      s.addText(`\u201C${sl.quote || (sl.bullets || [])[0] || ""}\u201D`, { x: M + 0.4, y: top + 0.2, w: W - 2 * M - 0.8, h: 3.3, fontSize: ft(28), fontFace: t.fontHead, color: t.text, valign: "middle" });
      break;
    }
    case "chart": {
      const has = (sl.chart_labels || []).length && (sl.chart_values || []).length;
      const side = (sl.bullets || []).length ? 4.2 : 0;
      if (has)
        s.addChart(pptx.ChartType.bar, [{ name: sl.title, labels: sl.chart_labels, values: sl.chart_values }], {
          x: M, y: top, w: W - 2 * M - side, h,
          chartColors: [t.accent], catAxisLabelColor: t.muted, valAxisLabelColor: t.muted,
          catAxisLabelFontFace: t.fontBody, valAxisLabelFontFace: t.fontBody,
          valGridLine: { color: t.border, size: 0.5 }, catGridLine: { style: "none" },
          valAxisLineShow: false, catAxisLineShow: false,
          showValue: true, dataLabelColor: t.text, dataLabelFontFace: t.fontBody, dataLabelFontSize: 11, catAxisLabelFontSize: 11,
        });
      if (side) s.addText(bulletRuns(sl.bullets, fs(14)), { x: W - M - 3.9, y: top, w: 3.9, h, valign: "top" });
      break;
    }
    case "table": {
      const cols = sl.table_columns || [];
      const rows = [cols.map((c) => ({ text: String(c), options: { bold: true, color: t.onAccent, fill: { color: t.accent } } }))];
      (sl.table_rows || []).slice(0, 10).forEach((r, i) =>
        rows.push(r.map((c) => ({ text: String(c ?? ""), options: { color: t.text, fill: { color: i % 2 ? t.bg : t.surface } } }))),
      );
      const n = Math.max(1, rows.length);
      const size = n <= 6 ? 16 : n <= 9 ? 14 : 12;
      const rowH = Math.min(0.62, (h - 0.2) / n);
      if (cols.length) s.addTable(rows, { x: M, y: top, w: W - 2 * M, rowH, fontSize: fs(size), fontFace: t.fontBody, border: { type: "solid", color: t.border, pt: 0.5 }, valign: "middle", autoPage: false });
      break;
    }
    case "image": {
      const side = (sl.bullets || []).length ? 4.3 : 0;
      if (sl.image_path) s.addImage({ path: sl.image_path, x: M, y: top, w: W - 2 * M - side, h: h - 0.4, sizing: { type: "contain", w: W - 2 * M - side, h: h - 0.4 } });
      if (sl.image_caption) s.addText(sl.image_caption, { x: M, y: top + h - 0.35, w: W - 2 * M - side, h: 0.3, fontSize: 10, ...muted() });
      if (side) s.addText(bulletRuns(sl.bullets, fs(14)), { x: W - M - 4.0, y: top, w: 4.0, h, valign: "top" });
      break;
    }
    case "architecture":
    case "stack":
    case "layers": {
      const layers = ((sl.steps && sl.steps.length) ? sl.steps : sl.bullets || []).slice(0, 5);
      const n = Math.max(1, layers.length);
      const gap = 0.2;
      const lh = (h - gap * (n - 1)) / n;
      layers.forEach((layerText, i) => {
        const ly = top + i * (lh + gap);
        s.addShape(pptx.ShapeType.roundRect, {
          x: M, y: ly, w: W - 2 * M, h: lh, rectRadius: 0.08,
          fill: { color: i === 0 ? t.surface : t.bg },
          line: { color: i === 0 ? t.accent : t.border, width: i === 0 ? 1.5 : 0.75 }
        });
        s.addText(`LAYER ${i + 1}`, {
          x: M + 0.3, y: ly + 0.1, w: 2.2, h: lh - 0.2,
          fontSize: 13, fontFace: t.fontHead, bold: true, color: t.accent, valign: "middle"
        });
        s.addText(String(layerText), {
          x: M + 2.6, y: ly + 0.1, w: W - 2 * M - 2.9, h: lh - 0.2,
          fontSize: fs(15), ...body(), valign: "middle"
        });
      });
      break;
    }
    case "matrix":
    case "quadrant": {
      const quads = (sl.bullets || []).slice(0, 4);
      const qw = (W - 2 * M - 0.3) / 2;
      const qh = (h - 0.3) / 2;
      const qTitles = sl.left && sl.left.length ? [sl.left_title || "Pillar 1", sl.right_title || "Pillar 2", "Pillar 3", "Pillar 4"] : ["Strategic Focus 1", "Strategic Focus 2", "Strategic Focus 3", "Strategic Focus 4"];
      quads.forEach((qText, i) => {
        const qx = M + (i % 2) * (qw + 0.3);
        const qy = top + Math.floor(i / 2) * (qh + 0.3);
        card(s, qx, qy, qw, qh);
        s.addText(qTitles[i] || `Quadrant ${i+1}`, {
          x: qx + 0.25, y: qy + 0.2, w: qw - 0.5, h: 0.4,
          fontSize: fs(17), fontFace: t.fontHead, bold: true, color: i === 0 ? t.accent : t.text
        });
        s.addText(String(qText), {
          x: qx + 0.25, y: qy + 0.65, w: qw - 0.5, h: qh - 0.8,
          fontSize: fs(14), ...body(), valign: "top"
        });
      });
      break;
    }
    case "canvas":
    case "custom":
    case "freeform": {
      if (Array.isArray(sl.elements) && sl.elements.length) {
        for (const el of sl.elements) {
          const ex = el.x !== undefined ? el.x : M;
          const ey = el.y !== undefined ? el.y : top;
          const ew = el.w !== undefined ? el.w : 3.0;
          const eh = el.h !== undefined ? el.h : 2.0;
          const eFill = el.fill || t.surface;
          const eBorder = el.border || t.border;
          const eColor = el.color || t.text;
          const eAccent = el.accent || t.accent;

          if (el.type === "card" || el.type === "shape" || el.type === "box") {
            const shapeName = el.shape || "roundRect";
            const shapeType = pptx.ShapeType[shapeName] || pptx.ShapeType.roundRect;
            s.addShape(shapeType, {
              x: ex, y: ey, w: ew, h: eh,
              rectRadius: el.radius || 0.08,
              fill: { color: eFill },
              line: { color: eBorder, width: el.borderWidth || 0.75 }
            });
            if (el.title) {
              s.addText(String(el.title), {
                x: ex + 0.2, y: ey + 0.15, w: ew - 0.4, h: 0.4,
                fontSize: el.titleSize || fs(16), fontFace: t.fontHead, bold: true, color: eAccent
              });
            }
            if (el.text || el.content) {
              s.addText(String(el.text || el.content), {
                x: ex + 0.2, y: ey + (el.title ? 0.6 : 0.2), w: ew - 0.4, h: eh - (el.title ? 0.7 : 0.4),
                fontSize: el.fontSize || fs(13), ...body({ color: eColor }), valign: "top"
              });
            }
          } else if (el.type === "metric" || el.type === "stat") {
            card(s, ex, ey, ew, eh);
            s.addText(String(el.value || ""), {
              x: ex + 0.15, y: ey + 0.15, w: ew - 0.3, h: eh * 0.55,
              fontSize: el.valueSize || ft(32), fontFace: t.fontHead, bold: true, color: eAccent, fit: "shrink"
            });
            s.addText(String(el.label || ""), {
              x: ex + 0.15, y: ey + eh * 0.6, w: ew - 0.3, h: eh * 0.35,
              fontSize: el.labelSize || fs(13), ...body({ color: eColor }), valign: "top"
            });
          } else if (el.type === "text") {
            s.addText(String(el.text || ""), {
              x: ex, y: ey, w: ew, h: eh,
              fontSize: el.fontSize || fs(14), fontFace: el.bold ? t.fontHead : t.fontBody,
              bold: !!el.bold, color: eColor, valign: el.valign || "top"
            });
          } else if (el.type === "arrow" || el.type === "line" || el.type === "connector") {
            s.addShape(pptx.ShapeType.line, {
              x: ex, y: ey, w: ew, h: eh,
              line: { color: eAccent, width: el.width || 1.5, dashType: el.dashed ? "dash" : "solid" }
            });
          } else if (el.type === "badge") {
            s.addShape(pptx.ShapeType.roundRect, {
              x: ex, y: ey, w: ew, h: eh,
              rectRadius: 0.2, fill: { color: eAccent }
            });
            s.addText(String(el.text || ""), {
              x: ex, y: ey, w: ew, h: eh,
              fontSize: el.fontSize || 12, bold: true, color: t.onAccent, align: "center", valign: "middle"
            });
          }
        }
        break;
      }
      const n = (sl.bullets || []).length;
      s.addText(bulletRuns(sl.bullets || [], fs(20)), { x: M, y: top, w: W - 2 * M, h, valign: "top" });
      break;
    }
    default: {
      const n = (sl.bullets || []).length;
      const size = n <= 3 ? 24 : n <= 5 ? 20 : 18;
      s.addText(bulletRuns(sl.bullets || [], fs(size)), { x: M, y: top + (n <= 3 ? 0.3 : 0), w: W - 2 * M, h, valign: "top", paraSpaceAfter: n <= 3 ? 22 : 9 });
    }
  }
  lastLayout = sl.layout;
  if (sl.notes) s.addNotes(sl.notes);
}

// ---------------------------------------------------------------- closing
{
  const s = pptx.addSlide();
  s.background = { color: t.bg };
  if (spec.end) s.addImage({ path: spec.end, x: 0, y: 0, w: W, h: H, sizing: { type: "cover", w: W, h: H } });
  // The end art carries its figure on the right; the closing block sits on the open left side.
  s.addText(spec.closing || "Thank You", { x: M, y: 2.75, w: 7.2, h: 1.2, fontSize: 48, fontFace: t.fontHead, bold: true, color: "FFFFFF", align: "left" });
  s.addText(spec.footer || "Ministry of Communications and Information Technology", { x: M, y: 4.05, w: 7.2, h: 0.45, fontSize: 15, fontFace: t.fontCover, color: "F7EF8A", align: "left" });
  if (spec.url) s.addText(spec.url, { x: M, y: 4.5, w: 7.2, h: 0.4, fontSize: 13, fontFace: t.fontCover, color: "F7EF8A", align: "left" });
}

await pptx.writeFile({ fileName: outPath });
