"""One Studio production: Tut Agent writes, the Craft engines build and audit,
the file library keeps the result.

The same stored file is announced in the chat (job ``file`` events with its
id, name and version) and listed in Files, so both always show one file.
"""

from typing import Any, Dict, Optional

from open_notebook.craft.engines import CraftUnavailable
from open_notebook.craft.kit.assets import missing_for
from open_notebook.craft.pipelines import PRESETS, canonical, run_pipeline
from open_notebook.craft.studio.direction import parse as parse_direction
from open_notebook.domain.notebook import Notebook
from open_notebook.exports import storage
from open_notebook.exports.content import (
    StudioOptions,
    generate_document,
    norm_length,
    rewrite_section,
)
from open_notebook.tut import NAME as TUT
from open_notebook.tut.jobs import Run


async def produce(
    run: Run,
    notebook_id: str,
    preset_id: str,
    mode: str,
    options: StudioOptions,
    model_id: Optional[str] = None,
    design: Optional[str] = None,
) -> Dict[str, Any]:
    feature = canonical(preset_id)
    preset = PRESETS[feature]
    if mode not in preset.modes:
        mode = preset.modes[0]
    missing = missing_for(feature)
    if missing:
        raise ValueError(f"{preset.name} needs assets the administrator has not installed yet: {', '.join(missing)}")
    direction = parse_direction(design, options.template)
    length = norm_length(options.length)
    nb = await Notebook.get(notebook_id)

    run.step(f"{TUT} is reading the notebook", "think")
    label = f"{preset.name}, {mode}" + (f", {length}" if preset.lengths else "") + f", {direction.describe()}"
    await run.progress(f"Skill: {preset.name.lower()} ({label})")
    doc = await generate_document(nb, preset.kind, options, model_id, progress=run.progress)  # type: ignore[arg-type]
    doc_id = storage.save_document(doc)

    run.step("Building and auditing the files", "render")
    try:
        async def rewrite(heading: str, body: str, min_words: int) -> str:
            return await rewrite_section(nb, doc.title, heading, body, min_words, options, model_id, run.progress)

        rendered = await run_pipeline(feature, doc, mode, length, direction, run.progress, rewrite=rewrite)
    except CraftUnavailable as e:
        raise ValueError(f"{e}. Ask your administrator to install the Craft engines.") from None

    run.step("Saving to your files", "deliver")
    files = []
    for ext in preset.outputs:
        data = rendered.files.get(ext)
        if not data:
            continue
        item = storage.store_bytes(doc, ext, data, notebook_id, doc_id, audit_issues=rendered.issue_text)
        storage.update_meta(
            item.id,
            preset=f"{feature}:{mode}" + (f":{length}" if preset.lengths else ""),
            engine=",".join(preset.engines),
            theme=mode,
        )
        item = storage.get_file(item.id) or item
        meta = item.model_dump() | {"url": f"/api/studio/files/{item.id}/download", "audit_passes": rendered.passes}
        run.emit("file", file=meta)
        files.append(meta)
    if rendered.issues:
        run.emit("message", content=f"{len(rendered.issues)} audit issue(s) remain after {rendered.passes} pass(es): " + "; ".join(rendered.issue_text))
    return {
        "title": doc.title,
        "audit": {"passes": rendered.passes, "issues": rendered.issue_text},
        "files": [{"id": f["id"], "filename": f["filename"], "version": f.get("version", 1)} for f in files],
    }
