import asyncio
import os
import sys
import httpx
import json

sys.path.insert(0, os.path.abspath("."))

from open_notebook import accounts

async def test_generation():
    print("=== TESTING DIRECT TUT AGENT FILE GENERATION & S3 DOCS SYNC ===")
    accs = await accounts.list_accounts()
    token = accounts.issue_session(accs[0], hours=24, scope="mcp")["token"]

    async with httpx.AsyncClient(timeout=600.0) as client:
        # 1. Test tools list includes generate_document
        tools_res = await client.post(
            "http://127.0.0.1:5055/api/mcp",
            headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
            json={"jsonrpc": "2.0", "id": 1, "method": "tools/list", "params": {}},
        )
        tool_names = [t["name"] for t in tools_res.json()["result"]["tools"]]
        print(f"Registered tools ({len(tool_names)}):", tool_names)
        assert "generate_document" in tool_names, "generate_document must be registered"
        assert "studio_produce" in tool_names, "studio_produce must be registered"

        # 2. Call generate_document directly
        print("\nCalling generate_document: 12 slides, red_white theme, executive briefing...")
        gen_res = await client.post(
            "http://127.0.0.1:5055/api/mcp",
            headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
            json={
                "jsonrpc": "2.0",
                "id": 2,
                "method": "tools/call",
                "params": {
                    "name": "generate_document",
                    "arguments": {
                        "feature": "presentation",
                        "slide_count": 12,
                        "theme_preset": "red_white",
                        "primary_color": "#D32F2F",
                        "bg_color": "#FFFFFF",
                        "design_style": "corporate",
                        "instructions": "Cybersecurity Strategic Inflection Point: Executive Guidance for Board Leadership in 2026-2027",
                    },
                },
            },
        )
        assert gen_res.status_code == 200, f"Expected 200, got {gen_res.status_code}: {gen_res.text}"
        res_text = gen_res.json()["result"]["content"][0]["text"]
        print("Generation Response snippet:", res_text[:300])
        gen_data = json.loads(res_text)
        assert gen_data.get("status") == "success", f"Expected success status, got {gen_data}"
        files = gen_data.get("files", [])
        assert len(files) >= 1, "Expected at least 1 generated file"

        # Inspect generated PPTX file
        pptx_file = next((f for f in files if f.get("filename", "").endswith(".pptx")), files[0])
        print("\nGenerated File Details:")
        print(f"Filename: {pptx_file.get('filename')}")
        print(f"Tut Agent File ID: {pptx_file.get('tut_file_id')}")
        print(f"Tut Agent Preview: {pptx_file.get('preview_url')}")
        print(f"Tut Agent Download: {pptx_file.get('tut_download_url')}")
        print(f"ONLYOFFICE Editor: {pptx_file.get('open_url')}")

        tut_id = pptx_file.get("tut_file_id")
        assert tut_id, "tut_file_id must be present (synced to Tut Agent S3 files)"

        # 3. Verify file download from Tut Agent native endpoint
        print(f"\nVerifying direct download from Tut Agent endpoint: http://127.0.0.1:3210/f/{tut_id}")
        tut_dl_res = await client.get(f"http://127.0.0.1:3210/f/{tut_id}?download=1", follow_redirects=True)
        print(f"Tut Agent download status: {tut_dl_res.status_code}, content size: {len(tut_dl_res.content)} bytes")
        assert tut_dl_res.status_code == 200, f"Expected 200 from Tut Agent, got {tut_dl_res.status_code}"
        assert len(tut_dl_res.content) > 1000, "PPTX file should be substantive (>1KB)"

        # 4. Verify slide count via file_read_content
        read_res = await client.post(
            "http://127.0.0.1:5055/api/mcp",
            headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
            json={
                "jsonrpc": "2.0",
                "id": 3,
                "method": "tools/call",
                "params": {"name": "file_read_content", "arguments": {"file_id": pptx_file["mcit_file_id"]}},
            },
        )
        read_data = json.loads(read_res.json()["result"]["content"][0]["text"])
        slide_count = read_data.get("slide_count")
        print(f"Verified slide count: {slide_count} slides")
        assert slide_count == 12, f"Expected exactly 12 slides, got {slide_count}"

        print("\n=== DIRECT TUT AGENT FILE GENERATION & DOCS SYNC VERIFIED 100% SUCCESSFULLY! ===")

if __name__ == "__main__":
    asyncio.run(test_generation())
