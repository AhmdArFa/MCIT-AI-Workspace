import asyncio
import os
import sys
import httpx

# Add project root to sys.path
sys.path.insert(0, os.path.abspath("."))

from open_notebook import accounts

async def test_mcp_studio_produce():
    print("=== TESTING MCP STUDIO PRODUCE FOR TUT AGENT ===")
    
    # 1. Issue an agent MCP session token
    accs = await accounts.list_accounts()
    acc = accs[0]
    print(f"Using account: {acc.username} (id={acc.id})")
    
    session = accounts.issue_session(acc, hours=24, scope="mcp")
    token = session["token"]
    print(f"Issued agent MCP token: {token[:20]}...")

    # 2. Call MCP tools/list to verify available tools
    async with httpx.AsyncClient(timeout=180.0) as client:
        list_res = await client.post(
            "http://127.0.0.1:5055/api/mcp",
            headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
            json={"jsonrpc": "2.0", "id": 1, "method": "tools/list", "params": {}},
        )
        print(f"tools/list response: {list_res.status_code}")
        tools = list_res.json().get("result", {}).get("tools", [])
        tool_names = [t["name"] for t in tools]
        print(f"Registered tools ({len(tools)}): {tool_names}")
        assert "studio_produce" in tool_names, "studio_produce must be registered in tools/list"
        assert "studio_status" in tool_names, "studio_status must be registered in tools/list"

        # 3. Call studio_produce to generate a presentation
        print("\nCalling studio_produce via MCP for 'Digital Government Roadmap' (8 slides)...")
        call_res = await client.post(
            "http://127.0.0.1:5055/api/mcp",
            headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
            json={
                "jsonrpc": "2.0",
                "id": 2,
                "method": "tools/call",
                "params": {
                    "name": "studio_produce",
                    "arguments": {
                        "feature": "presentation",
                        "instructions": "Digital Government Roadmap: Key Pillars, Architecture, Implementation Milestones, and Citizen Impact.",
                        "slide_count": 8,
                        "mode": "dark",
                        "wait_seconds": 150,
                    },
                },
            },
        )
        print(f"studio_produce response status: {call_res.status_code}")
        res_json = call_res.json()
        print(f"studio_produce response body: {res_json}")

        content_list = res_json.get("result", {}).get("content", [])
        assert content_list, f"No content in response: {res_json}"
        import json
        payload = json.loads(content_list[0]["text"])
        print("\nParsed Result Payload:")
        print(f"  Status: {payload.get('status')}")
        print(f"  Job ID: {payload.get('job_id')}")
        print(f"  Files: {payload.get('files')}")
        print(f"  Markdown Presentation:\n{payload.get('markdown_presentation')}")

        assert payload.get("status") == "completed", f"Expected completed status, got: {payload.get('status')}"
        assert payload.get("files"), "Expected at least 1 file generated"

    print("\n=== MCP STUDIO PRODUCE TEST COMPLETED SUCCESSFULLY! ===")

if __name__ == "__main__":
    asyncio.run(test_mcp_studio_produce())
