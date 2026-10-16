import sys
from open_notebook.craft.studio.blueprint import parse_blueprint_spec, render_blueprint_svg

test_json = {
    "type": "NetworkArchitecture",
    "layout_algorithm": "force_directed_spring",
    "nodes": [
        {"id": "N1", "label": "Computing Infrastructure", "role": "Core", "color": "#00F0FF"},
        {"id": "N2", "label": "AI Inference Models", "role": "Input", "color": "#00E599"},
        {"id": "N3", "label": "Governance Mesh", "role": "Governance", "color": "#EF4444"},
        {"id": "N4", "label": "Data Storage Enclave", "role": "Storage", "color": "#F59E0B"},
        {"id": "N5", "label": "Edge API Gateway", "role": "Gateway", "color": "#06B6D4"},
    ],
    "edges": [
        {"source": "N2", "target": "N1", "weight": 0.8, "style": "directional_flow", "label": "Inference"},
        {"source": "N3", "target": "N1", "weight": 0.6, "style": "governance_constraint", "label": "Policy"},
        {"source": "N1", "target": "N4", "weight": 0.7, "style": "directional_flow"},
        {"source": "N5", "target": "N1", "weight": 0.5, "style": "directional_flow"},
    ],
    "metadata": {
        "source_document": "WEF 2026 Framework",
        "style_override": "pure_vector_geometric",
    },
}

for algo in ["force_directed_spring", "hierarchical", "circular", "grid"]:
    test_json["layout_algorithm"] = algo
    spec = parse_blueprint_spec(test_json)
    svg, h = render_blueprint_svg(spec, "dark")
    print(f"Algorithm: {algo} -> SVG len: {len(svg)}, height: {h}")
    assert "<svg" in svg and "</svg>" in svg
    assert "Computing Infrastructure" in svg

print("ALL BLUEPRINT ALGORITHMS PASSED!")
