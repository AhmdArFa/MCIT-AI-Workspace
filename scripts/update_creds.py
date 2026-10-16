import asyncio
import os
from open_notebook.database.repository import repo_query

async def main():
    base = os.environ.get("OLLAMA_API_BASE", "http://host.docker.internal:11430")
    print(f"Updating ollama credentials base_url to: {base}")
    await repo_query("UPDATE credential SET base_url = $base WHERE provider = 'ollama';", {"base": base})
    rows = await repo_query("SELECT id, name, provider, base_url FROM credential;")
    print("Credentials now:", rows)

if __name__ == "__main__":
    asyncio.run(main())
