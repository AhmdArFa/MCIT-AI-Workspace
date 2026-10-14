"""Editable Word report built from a copy of the approved Noir template.

The kit ships two 7-page masters (``templates/word/MCIT-WSIS-Report-Noir-{DARK,LIGHT}.docx``).
Their body is a fixed sequence of formatted blocks: the hero cover, a contents
page, an at-a-glance page, chapter pages (eyebrow, title, rule, body, figure
and caption) and the closing cover.  Instead of re-creating that design, this
module copies the master, clones those blocks as prototypes, and fills them
with the request's content.  Covers, page colour, fonts, sizes, colours and
spacing therefore come from the master itself; the master is never modified.
"""

from __future__ import annotations

import copy
import zipfile
from pathlib import Path
from typing import Any, Dict, List, Optional, Sequence

from lxml import etree
from PIL import Image as PILImage

from open_notebook.craft.kit.assets import TEMPLATES_DIR

W_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
R_NS = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
WP_NS = "http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
A_NS = "http://schemas.openxmlformats.org/drawingml/2006/main"
PIC_NS = "http://schemas.openxmlformats.org/drawingml/2006/picture"
REL_NS = "http://schemas.openxmlformats.org/package/2006/relationships"
CT_NS = "http://schemas.openxmlformats.org/package/2006/content-types"
IMAGE_REL = "http://schemas.openxmlformats.org/officeDocument/2006/relationships/image"
NS = {"w": W_NS, "r": R_NS, "wp": WP_NS, "a": A_NS, "pic": PIC_NS}


def _w(tag: str) -> str:
    return f"{{{W_NS}}}{tag}"


def template_path(mode: str) -> Path:
    name = "DARK" if mode == "dark" else "LIGHT"
    return TEMPLATES_DIR / "word" / f"MCIT-WSIS-Report-Noir-{name}.docx"


class TemplateShapeError(RuntimeError):
    """The master no longer has the block sequence this builder expects."""


def _text(el) -> str:
    return "".join(el.itertext())


def _has_page_break(el) -> bool:
    return bool(el.xpath('.//w:br[@w:type="page"]', namespaces=NS))


def _has_picture(el) -> bool:
    return bool(el.xpath(".//w:drawing", namespaces=NS))


class _Prototypes:
    """Locates each formatted block of the master by its role."""

    def __init__(self, body) -> None:
        blocks = [el for el in body if el.tag != _w("sectPr")]
        self.sect = body.find(_w("sectPr"))
        breaks = [i for i, el in enumerate(blocks) if el.tag == _w("p") and _has_page_break(el)]
        if len(breaks) < 5 or not _has_picture(blocks[0]):
            raise TemplateShapeError("Word master: expected a picture cover and at least five page sections")
        self.cover = blocks[: breaks[0]]
        # last break that carries the closing cover picture
        end_i = next((i for i in reversed(breaks) if _has_picture(blocks[i])), None)
        if end_i is None:
            raise TemplateShapeError("Word master: closing cover not found")
        self.back = blocks[end_i:]
        tables = [el for el in blocks if el.tag == _w("tbl")]
        if len(tables) < 2:
            raise TemplateShapeError("Word master: contents and data tables not found")
        self.contents_table, self.data_table = tables[0], tables[1]

        def section(start: int) -> List[Any]:
            nxt = next((b for b in breaks if b > start), len(blocks))
            return blocks[start:nxt]

        # second section = at a glance: eyebrow, title, rule, table, body
        glance = section(breaks[1])
        self.eyebrow, self.title, self.rule = glance[0], glance[1], glance[2]
        # first chapter section: eyebrow, title, rule, body..., picture, figure label, caption
        chapter = section(breaks[2])
        paras = [el for el in chapter if el.tag == _w("p")]
        pic_i = next((i for i, el in enumerate(paras) if _has_picture(el)), None)
        if pic_i is None or pic_i + 2 >= len(paras):
            raise TemplateShapeError("Word master: chapter figure not found")
        self.body = paras[3]
        self.picture, self.fig_label, self.caption = paras[pic_i], paras[pic_i + 1], paras[pic_i + 2]
        # findings section: its first paragraph after the rule is a finding line
        findings = section(breaks[-2] if breaks[-1] == end_i else breaks[-1])
        fparas = [el for el in findings if el.tag == _w("p")]
        self.point = fparas[3] if len(fparas) > 3 else self.body
        self.cover_texts = [el for el in self.cover if el.tag == _w("p") and _text(el).strip()]


def _set_text(el, text: str, keep_break: bool = True):
    """Clone ``el`` and put ``text`` in its first text run; other text runs go."""
    el = copy.deepcopy(el)
    runs = el.xpath(".//w:r[w:t]", namespaces=NS)
    if not runs:
        # empty prototype: add a run modelled on the paragraph mark formatting
        r = etree.SubElement(el, _w("r"))
        mark = el.find(f"{_w('pPr')}/{_w('rPr')}")
        if mark is not None:
            r.append(copy.deepcopy(mark))
        t = etree.SubElement(r, _w("t"))
        runs = [r]
    first = runs[0]
    ts = first.findall(_w("t"))
    ts[0].text = text
    ts[0].set("{http://www.w3.org/XML/1998/namespace}space", "preserve")
    for t in ts[1:]:
        first.remove(t)
    for r in runs[1:]:
        r.getparent().remove(r)
    if not keep_break:
        for br in el.xpath('.//w:br[@w:type="page"]', namespaces=NS):
            r = br.getparent()
            r.remove(br)
            if not r.findall(_w("t")) and r.getparent() is not None and len([c for c in r if c.tag != _w("rPr")]) == 0:
                r.getparent().remove(r)
    return el


def _set_size(el, half_points: int):
    for tag in ("sz", "szCs"):
        for node in el.iter(_w(tag)):
            node.set(_w("val"), str(half_points))
    return el


def _bold(el):
    for rpr in el.iter(_w("rPr")):
        for tag in ("b", "bCs"):
            node = rpr.find(_w(tag))
            if node is None:
                node = etree.SubElement(rpr, _w(tag))
            node.attrib.pop(_w("val"), None)
    return el


def _cell_text(tc, text: str):
    p = tc.find(_w("p"))
    tc.replace(p, _set_text(p, text))


def _table(proto, header: Sequence[str], rows: Sequence[Sequence[str]], total_width: Optional[int] = None):
    """A table in the master's style with any number of columns."""
    tbl = copy.deepcopy(proto)
    trs = tbl.findall(_w("tr"))
    head_tr, body_tr = trs[0], trs[1] if len(trs) > 1 else trs[0]
    for tr in trs:
        tbl.remove(tr)
    grid = tbl.find(_w("tblGrid"))
    cols = grid.findall(_w("gridCol"))
    width = total_width or sum(int(c.get(_w("w"), "0")) for c in cols) or 9760
    n = max(1, len(header))
    col_w = width // n
    for c in cols:
        grid.remove(c)
    for _ in range(n):
        etree.SubElement(grid, _w("gridCol")).set(_w("w"), str(col_w))

    def row(proto_tr, values: Sequence[str]):
        tr = copy.deepcopy(proto_tr)
        cells = tr.findall(_w("tc"))
        for c in cells:
            tr.remove(c)
        for j in range(n):
            tc = copy.deepcopy(cells[min(j, len(cells) - 1)])
            tcw = tc.find(f"{_w('tcPr')}/{_w('tcW')}")
            if tcw is not None:
                tcw.set(_w("w"), str(col_w))
            _cell_text(tc, str(values[j]) if j < len(values) else "")
            tr.append(tc)
        return tr

    tbl.append(row(head_tr, header))
    for r in rows:
        tbl.append(row(body_tr, r))
    return tbl


class _Package:
    """The copied master: parts, relationships and added media."""

    def __init__(self, src: Path) -> None:
        with zipfile.ZipFile(src) as z:
            self.parts: Dict[str, bytes] = {n: z.read(n) for n in z.namelist()}
        self.doc = etree.fromstring(self.parts["word/document.xml"])
        self.rels = etree.fromstring(self.parts["word/_rels/document.xml.rels"])
        self.types = etree.fromstring(self.parts["[Content_Types].xml"])
        self._n = 0

    def add_image(self, path: Path) -> str:
        self._n += 1
        ext = path.suffix.lower().lstrip(".") or "png"
        name = f"media/mcit-figure-{self._n}.{ext}"
        self.parts[f"word/{name}"] = path.read_bytes()
        ids = {r.get("Id") for r in self.rels}
        rid = next(f"rIdMcit{i}" for i in range(1, 10_000) if f"rIdMcit{i}" not in ids)
        rel = etree.SubElement(self.rels, f"{{{REL_NS}}}Relationship")
        rel.set("Id", rid)
        rel.set("Type", IMAGE_REL)
        rel.set("Target", name)
        if not any(d.get("Extension", "").lower() == ext for d in self.types.findall(f"{{{CT_NS}}}Default")):
            d = etree.SubElement(self.types, f"{{{CT_NS}}}Default")
            d.set("Extension", ext)
            d.set("ContentType", "image/jpeg" if ext in ("jpg", "jpeg") else f"image/{ext}")
        return rid

    def drop_unused_media(self) -> None:
        xml = etree.tostring(self.doc).decode()
        for rel in list(self.rels):
            if rel.get("Type") == IMAGE_REL and f'"{rel.get("Id")}"' not in xml:
                self.parts.pop("word/" + rel.get("Target", "").lstrip("/"), None)
                self.rels.remove(rel)

    def set_core(self, title: str) -> None:
        core = self.parts.get("docProps/core.xml")
        if not core:
            return
        root = etree.fromstring(core)
        dc = "http://purl.org/dc/elements/1.1/"
        for tag, value in (("title", title), ("creator", "MCIT AI")):
            node = root.find(f"{{{dc}}}{tag}")
            if node is None:
                node = etree.SubElement(root, f"{{{dc}}}{tag}")
            node.text = value
        cp = "http://schemas.openxmlformats.org/package/2006/metadata/core-properties"
        mod = root.find(f"{{{cp}}}lastModifiedBy")
        if mod is not None:
            mod.text = "MCIT AI"
        self.parts["docProps/core.xml"] = etree.tostring(root, xml_declaration=True, encoding="UTF-8", standalone=True)

    def save(self, out: Path) -> Path:
        self.parts["word/document.xml"] = etree.tostring(self.doc, xml_declaration=True, encoding="UTF-8", standalone=True)
        self.parts["word/_rels/document.xml.rels"] = etree.tostring(self.rels, xml_declaration=True, encoding="UTF-8", standalone=True)
        self.parts["[Content_Types].xml"] = etree.tostring(self.types, xml_declaration=True, encoding="UTF-8", standalone=True)
        order = ["[Content_Types].xml"] + [n for n in self.parts if n != "[Content_Types].xml"]
        with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as z:
            for n in order:
                z.writestr(n, self.parts[n])
        return out


def _picture(proto, pkg: _Package, path: Path, doc_id: int):
    el = copy.deepcopy(proto)
    rid = pkg.add_image(path)
    el.xpath(".//a:blip", namespaces=NS)[0].set(f"{{{R_NS}}}embed", rid)
    extent = el.xpath(".//wp:extent", namespaces=NS)[0]
    cx = int(extent.get("cx"))
    with PILImage.open(path) as im:
        w, h = im.size
    cy = int(cx * h / max(1, w))
    extent.set("cy", str(cy))
    for ext in el.xpath(".//a:ext", namespaces=NS):
        ext.set("cx", str(cx))
        ext.set("cy", str(cy))
    for pr in el.xpath(".//wp:docPr", namespaces=NS):
        pr.set("id", str(doc_id))
        pr.set("name", f"Figure {doc_id}")
        pr.set("descr", "")
    for pr in el.xpath(".//pic:cNvPr", namespaces=NS):
        pr.set("name", path.name)
    return el


# The LIGHT master's closing page still carries dark-mode text colours (white
# "Thank You", pale yellow link, pale grey line) on a white page. Light output
# maps them to the light palette's own ink colours so every line stays readable.
LIGHT_INK = {"FFFFFF": "0A1628", "F7EF8A": "1E507A", "B9C2CE": "5A6B82"}


def _light_ink(el) -> None:
    for node in el.iter(_w("color")):
        v = (node.get(_w("val")) or "").upper()
        if v in LIGHT_INK:
            node.set(_w("val"), LIGHT_INK[v])


def build_report_docx(plan, out: Path, kicker: str = "ARAB REPUBLIC OF EGYPT   |   MCIT REPORT") -> Path:
    """Fill a copy of the mode's Word master with ``plan`` (a ReportPlan)."""
    from open_notebook.craft.studio.report import body_blocks

    src = template_path(plan.mode)
    if not src.exists():
        raise FileNotFoundError(f"Word master not installed: {src.name}")
    pkg = _Package(src)
    body = pkg.doc.find(_w("body"))
    P = _Prototypes(body)
    body_sz = max(18, min(26, round(plan.body_size * 2)))
    out_blocks: List[Any] = []
    add = out_blocks.append

    # cover: picture, kicker, title, subtitle, ministry, site
    texts = P.cover_texts
    for el in P.cover:
        if el is P.cover[0] or el not in texts:
            add(copy.deepcopy(el))
            continue
        i = texts.index(el)
        if i == 0:
            add(_set_text(el, kicker))
        elif i == 1:
            add(_set_text(el, plan.title))
        elif i == 2:
            if plan.subtitle:
                add(_set_text(el, plan.subtitle))
        else:
            add(copy.deepcopy(el))

    def eyebrow(text: str):
        add(_set_text(P.eyebrow, text.upper()))

    def heading(text: str):
        add(_set_text(P.title, text))
        add(copy.deepcopy(P.rule))

    def subhead(text: str):
        el = _bold(_set_size(_set_text(P.title, text, keep_break=False), 30))
        for bdr in el.xpath(".//w:pPr/w:pBdr", namespaces=NS):
            bdr.getparent().remove(bdr)  # the rule belongs to section titles only
        add(el)

    def para(text: str):
        add(_set_size(_set_text(P.body, text), body_sz))

    def point(text: str, mark: str = "\u2022"):
        add(_set_size(_set_text(P.point, f"{mark}  {text}"), body_sz))

    # contents
    eyebrow("Inside this report")
    heading("Contents")
    entries = [("At a glance", "01")]
    entries += [(ch["heading"], f"{i + 1:02d}") for i, ch in enumerate(plan.chapters, start=1)]
    entries.append(("Findings and recommendations", f"{len(plan.chapters) + 2:02d}"))
    contents = _table(P.contents_table, [entries[0][0].upper(), entries[0][1]], [(a.upper(), b) for a, b in entries[1:]])
    add(contents)

    # at a glance
    eyebrow("Headlines")
    heading("At a Glance")
    def spacer():
        add(_set_size(_set_text(P.body, ""), body_sz))

    if plan.stats:
        add(_table(P.data_table, ["INDICATOR", "VALUE"], [(label, value) for value, label in plan.stats]))
        spacer()
    if plan.summary:
        para(plan.summary)

    doc_id = 100
    for i, ch in enumerate(plan.chapters, start=1):
        eyebrow(f"Chapter {i:02d}")
        heading(ch["heading"])
        for kind, text in body_blocks(ch.get("body") or ""):
            {"h": subhead, "li": point}.get(kind, para)(text)
        for b in ch.get("bullets") or []:
            point(b)
        fig = ch.get("figure")
        if fig and Path(fig["path"]).exists():
            doc_id += 1
            add(_picture(P.picture, pkg, Path(fig["path"]), doc_id))
            label, _, rest = fig["caption"].partition(". ")
            add(_set_text(P.fig_label, label.upper()))
            add(_set_text(P.caption, rest or fig["caption"]))
        tb = ch.get("table")
        if tb and tb.get("columns"):
            add(_table(P.data_table, [str(c).upper() for c in tb["columns"]], [[str(x) for x in r] for r in tb.get("rows", [])[:18]]))
            if tb.get("name"):
                add(_set_text(P.caption, str(tb["name"])))
            else:
                spacer()

    eyebrow("Findings")
    heading("Key Findings")
    for f in plan.findings:
        point(f)
    if plan.recommendations:
        subhead("Recommendations")
        for n, r in enumerate(plan.recommendations, start=1):
            point(r, f"{n}.")
    if plan.conclusion:
        subhead("Conclusion")
        para(plan.conclusion)

    for el in P.back:
        add(copy.deepcopy(el))

    if plan.mode != "dark":
        for el in out_blocks:
            if not _has_picture(el) or _text(el).strip():
                _light_ink(el)

    for el in list(body):
        body.remove(el)
    for el in out_blocks:
        body.append(el)
    if P.sect is not None:
        body.append(P.sect)
    pkg.drop_unused_media()
    pkg.set_core(plan.title)
    return pkg.save(out)
