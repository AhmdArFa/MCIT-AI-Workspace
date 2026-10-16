import asyncio
import os
import sys

sys.path.insert(0, os.path.abspath("."))

from open_notebook.tut.client import draft

async def test():
    print("Testing Tut Agent draft...")
    resp = await draft("Return a JSON object: {\"status\": \"ok\", \"message\": \"Tut Agent is active and responsive\"}")
    print("Draft response received:")
    print("Content:", resp.content)
    print("Usage:", getattr(resp, "usage", None))

if __name__ == "__main__":
    asyncio.run(test())
