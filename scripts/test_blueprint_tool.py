import asyncio
import api.routers.mcp as mcp

async def main():
    topology = {
        "type": "NetworkArchitecture",
        "layout_algorithm": "force_directed_spring",
        "title": "Sovereign AI Infrastructure Mesh",
        "subtitle": "National computing fabric & intelligence interconnect",
        "nodes": [
            {"id": "N1", "label": "Computing Infrastructure", "role": "Core", "color": "#00F0FF", "description": "National HPC GPU Cluster"},
            {"id": "N2", "label": "AI Foundation Models", "role": "AI", "color": "#A855F7", "description": "Allam 2.0 & Multimodal Stack"},
            {"id": "N3", "label": "Sovereign Data Enclave", "role": "Storage", "color": "#F59E0B", "description": "Post-quantum encrypted vault"},
            {"id": "N4", "label": "National Security Mesh", "role": "Security", "color": "#FF007A", "description": "Continuous zero-trust attestation"},
            {"id": "N5", "label": "API Service Gateway", "role": "Gateway", "color": "#06B6D4", "description": "GovTech integration fabric"},
            {"id": "N6", "label": "Governance & Ethics Board", "role": "Governance", "color": "#EF4444", "description": "WEF AI regulatory guardrails"},
        ],
        "edges": [
            {"source": "N2", "target": "N1", "weight": 0.9, "style": "directional_flow", "label": "Compute Fabric"},
            {"source": "N1", "target": "N3", "weight": 0.8, "style": "directional_flow", "label": "State Telemetry"},
            {"source": "N4", "target": "N1", "weight": 0.7, "style": "governance_constraint", "label": "Security Boundary"},
            {"source": "N5", "target": "N1", "weight": 0.6, "style": "directional_flow"},
            {"source": "N6", "target": "N2", "weight": 0.75, "style": "governance_constraint", "label": "Safety Alignment"},
        ],
        "metadata": {
            "source_document": "WEF 2026 Framework",
            "style_override": "pure_vector_geometric"
        }
    }

    print("Executing generate_visual_blueprint tool...")
    res = await mcp.generate_visual_blueprint(topology)
    print("Result status:", res.get("status"))
    print("Nodes count:", res.get("nodes_count"))
    print("Edges count:", res.get("edges_count"))
    print("Files generated:", [f.get("filename") for f in res.get("files", [])])
    print("Deliver message:\n", res.get("deliver_as"))

if __name__ == "__main__":
    asyncio.run(main())
