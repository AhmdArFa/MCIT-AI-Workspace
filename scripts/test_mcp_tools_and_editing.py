import asyncio
import os
import sys
import httpx

sys.path.insert(0, os.path.abspath("."))

from open_notebook import accounts

async def test_mcp_features():
    print("=== TESTING EXPANDED MCP TOOLS AND DOCUMENT EDITING ===")
    
    # 1. Issue an agent MCP session token
    accs = await accounts.list_accounts()
    acc = accs[0]
    session = accounts.issue_session(acc, hours=24, scope="mcp")
    token = session["token"]
    print(f"Using account: {acc.username}, issued token")

    async with httpx.AsyncClient(timeout=30.0) as client:
        # 2. List tools
        res = await client.post(
            "http://127.0.0.1:5055/api/mcp",
            headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
            json={"jsonrpc": "2.0", "id": 1, "method": "tools/list", "params": {}},
        )
        assert res.status_code == 200, f"tools/list failed: {res.status_code}"
        tools = res.json().get("result", {}).get("tools", [])
        tool_names = [t["name"] for t in tools]
        print(f"Registered tools ({len(tools)}): {tool_names}")
        
        # Verify new tools
        assert "file_read_content" in tool_names, "file_read_content must be registered"
        assert "file_edit_content" in tool_names, "file_edit_content must be registered"
        assert "file_open_editor" in tool_names, "file_open_editor must be registered"
        assert "studio_produce" in tool_names, "studio_produce must be registered"
        
        # Verify studio_produce schema has theme_preset, primary_color, slide_count <= 30
        produce_tool = next(t for t in tools if t["name"] == "studio_produce")
        props = produce_tool["inputSchema"]["properties"]
        assert "theme_preset" in props, "theme_preset must be in schema"
        assert "primary_color" in props, "primary_color must be in schema"
        assert "bg_color" in props, "bg_color must be in schema"
        assert props["slide_count"]["maximum"] == 30, f"slide_count maximum should be 30, got {props['slide_count']['maximum']}"
        print("studio_produce schema verified with custom colors, theme_preset and 30 slides max!")

        # 3. List existing files and test file_read_content / file_open_editor
        files_res = await client.post(
            "http://127.0.0.1:5055/api/mcp",
            headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
            json={"jsonrpc": "2.0", "id": 2, "method": "tools/call", "params": {"name": "files_list", "arguments": {}}},
        )
        import json
        files_list = json.loads(files_res.json()["result"]["content"][0]["text"])
        print(f"User files in library: {len(files_list)}")
        
        if files_list:
            test_file = files_list[0]
            fid = test_file["id"]
            print(f"Testing tools on file: {test_file.get('filename')} (id={fid}, format={test_file.get('format')})")
            
            # Test file_open_editor
            editor_res = await client.post(
                "http://127.0.0.1:5055/api/mcp",
                headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
                json={"jsonrpc": "2.0", "id": 3, "method": "tools/call", "params": {"name": "file_open_editor", "arguments": {"file_id": fid}}},
            )
            editor_data = json.loads(editor_res.json()["result"]["content"][0]["text"])
            print("file_open_editor result:", editor_data)
            assert "editor_url" in editor_data, "editor_url must be returned"
            assert "open=" in editor_data["editor_url"], "editor_url should contain open="

            # Test file_read_content
            read_res = await client.post(
                "http://127.0.0.1:5055/api/mcp",
                headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
                json={"jsonrpc": "2.0", "id": 4, "method": "tools/call", "params": {"name": "file_read_content", "arguments": {"file_id": fid}}},
            )
            read_data = json.loads(read_res.json()["result"]["content"][0]["text"])
            print("file_read_content result keys:", list(read_data.keys()))
            assert "file_id" in read_data, "file_id must be in read_data"

    print("\n=== ALL MCP TOOLS AND ONLYOFFICE INTEGRATION TESTS PASSED! ===")

if __name__ == "__main__":
    asyncio.run(test_mcp_features())
