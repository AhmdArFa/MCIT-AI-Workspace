import asyncio
import os
import sys
import httpx
import json

sys.path.insert(0, os.path.abspath("."))

from open_notebook import accounts

async def test_pptx_edit():
    accs = await accounts.list_accounts()
    token = accounts.issue_session(accs[0], hours=24, scope="mcp")["token"]
    async with httpx.AsyncClient(timeout=30.0) as client:
        files_res = await client.post(
            "http://127.0.0.1:5055/api/mcp",
            headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
            json={"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "files_list", "arguments": {}}},
        )
        files = json.loads(files_res.json()["result"]["content"][0]["text"])
        pptx_files = [f for f in files if f.get("format") == "pptx"]
        print(f"Found {len(pptx_files)} PPTX files.")
        if pptx_files:
            f = pptx_files[0]
            print(f"Testing edit on: {f['filename']} (id={f['id']})")
            
            # Read slides first
            read_res = await client.post(
                "http://127.0.0.1:5055/api/mcp",
                headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
                json={"jsonrpc": "2.0", "id": 2, "method": "tools/call", "params": {"name": "file_read_content", "arguments": {"file_id": f["id"]}}},
            )
            read_data = json.loads(read_res.json()["result"]["content"][0]["text"])
            print(f"Slide count: {read_data.get('slide_count')}")
            if len(read_data.get("slides", [])) > 1:
                print("Slide 2 Title before edit:", read_data["slides"][1].get("title"))
            
            # Edit slide 2
            edit_res = await client.post(
                "http://127.0.0.1:5055/api/mcp",
                headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
                json={"jsonrpc": "2.0", "id": 3, "method": "tools/call", "params": {
                    "name": "file_edit_content",
                    "arguments": {
                        "file_id": f["id"],
                        "action": "update_slide",
                        "slide_index": 2,
                        "title": "Strategic Executive Imperatives",
                        "bullets": ["Operational Resilience Focus", "Board-Level Cyber Accountability"]
                    }
                }},
            )
            edit_data = json.loads(edit_res.json()["result"]["content"][0]["text"])
            print("Edit result:", edit_data)
            assert edit_data.get("status") == "success", "Edit status should be success"
            
            # Re-read to confirm change
            read_res2 = await client.post(
                "http://127.0.0.1:5055/api/mcp",
                headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
                json={"jsonrpc": "2.0", "id": 4, "method": "tools/call", "params": {"name": "file_read_content", "arguments": {"file_id": f["id"]}}},
            )
            read_data2 = json.loads(read_res2.json()["result"]["content"][0]["text"])
            print("Slide 2 Title after edit:", read_data2["slides"][1].get("title"))
            assert read_data2["slides"][1].get("title") == "Strategic Executive Imperatives", "Title must match updated value"
            print("\n=== PPTX EDIT TOOL VERIFIED SUCCESSFULLY! ===")

if __name__ == "__main__":
    asyncio.run(test_pptx_edit())
