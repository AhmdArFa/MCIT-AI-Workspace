import asyncio
from open_notebook.database.repository import repo_query

async def main():
    print("Updating Ollama credential in SurrealDB to num_ctx=32768...")
    await repo_query("UPDATE credential SET num_ctx = 32768, config.num_ctx = 32768 WHERE provider = 'ollama';")
    res = await repo_query("SELECT id, name, provider, num_ctx, config FROM credential WHERE provider = 'ollama';")
    print("Updated Ollama credentials:", res)

if __name__ == "__main__":
    asyncio.run(main())
