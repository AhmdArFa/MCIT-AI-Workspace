import asyncio
import os
import sys
from pathlib import Path

# Add project root to sys.path
sys.path.insert(0, os.path.abspath("."))

from open_notebook.domain.notebook import Notebook
from open_notebook.exports.content import (
    StudioOptions,
    content_slide_count,
    generate_document,
    PRESENTATION_PERSPECTIVES,
)
from open_notebook.craft.studio.deck import build_plan

async def run_test():
    print("=== TESTING STUDIO PRESENTATION GENERATION ===")

    # Test with sample material similar to WEF Cyber PDF
    pdf_source = Path(r"C:\Users\abdoh\OneDrive\Documents\Desktop\data set\WEF_Cybersecuritys_Strategic_Inflection_Point_2026.pdf")
    print(f"Checking if PDF exists at {pdf_source}: {pdf_source.exists()}")

    # Create dummy notebook for testing
    nb = Notebook(name="WEF Cybersecurity Analysis", description="Test notebook")

    options_8 = StudioOptions(slide_count=8, instructions="Focus on board governance and operational risk")
    options_12 = StudioOptions(slide_count=12, instructions="Focus on technology architecture and mitigation roadmap")

    print(f"Content slide count for 8 slides: {content_slide_count(8)} (Total with cover/agenda/closing: {content_slide_count(8) + 3})")
    print(f"Content slide count for 12 slides: {content_slide_count(12)} (Total with cover/agenda/closing: {content_slide_count(12) + 3})")

    # Verify perspectives
    print(f"Perspectives registered: {[p['name'] for p in PRESENTATION_PERSPECTIVES]}")

    # Build mock doc and test build_plan
    from open_notebook.exports.content import StudioDocument, Slide
    mock_slides = [
        Slide(layout="stats", title="Cyber Attack Escalation", subtitle="Annualized damages index", stats=[{"value": "$10.5T", "label": "projected loss"}]),
        Slide(layout="cards", title="Core Exposure Vectors", subtitle="Critical vulnerabilities", bullets=["Cloud Infrastructure: Shared key gaps", "Identity Integrity: Credential stuffing"]),
        Slide(layout="image", title="Ecosystem Resilience", subtitle="Collaborative defence model", image_path="doodle:plant", bullets=["Iterative institutional learning", "Cross-sector intelligence sharing"]),
        Slide(layout="comparison", title="Legacy vs Adaptive Perimeter", left_title="Legacy", left=["Siloed audits"], right_title="Adaptive", right=["Continuous telemetry"]),
        Slide(layout="table", title="Resilience Benchmark Matrix", table_columns=["Pillar", "Current", "Target"], table_rows=[["Detection", "18 Days", "< 2 Hours"], ["Containment", "Manual", "Automated"]]),
    ]
    doc = StudioDocument(
        kind="presentation",
        title="Cybersecurity Strategic Inflection Point",
        subtitle="Navigating Asymmetric Risks in 2026",
        slides=mock_slides,
        options=options_8,
    )

    from open_notebook.craft.studio.direction import Direction
    direction = Direction()
    plan = build_plan(doc, "graphite", direction)

    print(f"Plan built: total slides in plan = {len(plan['slides']) + 2} (covers: hero + end + agenda + content)")
    assert len(plan['slides']) + 2 == 8, f"Expected 8 slides, got {len(plan['slides']) + 2}"

    # Verify image slide resolution
    img_slide = next(s for s in plan['slides'] if s.get('layout') == 'image')
    print(f"Image slide path resolved to: {img_slide.get('image_path')}")
    assert Path(img_slide.get('image_path')).exists(), f"Image path must exist on disk: {img_slide.get('image_path')}"
    assert img_slide.get('image_path').endswith(".svg"), "Image path should resolve to SVG doodle"

    # Verify no WEF_ or dummy titles
    for idx, s in enumerate(plan['slides'], start=1):
        t = s.get('title', '')
        assert not t.startswith("WEF_"), f"Slide {idx} title has raw prefix: {t}"
        assert not t.endswith(".pdf"), f"Slide {idx} title has raw extension: {t}"
        assert "(Cont.)" not in t, f"Slide {idx} title has (Cont.): {t}"
        print(f"  Slide {idx} [{s.get('layout')}]: {t}")

    print("=== ALL PRESENTATION ENGINE TESTS PASSED! ===")

if __name__ == "__main__":
    asyncio.run(run_test())
