import json
import subprocess

def main():
    chat_config = {
        "enableAgentMode": True,
        "toolMode": "all",
        "enableHistoryCount": True,
        "historyCount": 100,
        "enableContextCompression": False,
        "enableStaleToolResultTrim": False,
        "memory": {
            "enabled": True,
            "toolPermission": "read-write",
        },
    }

    # Official Google DeepMind Gemma 4 E4B Standardized Parameters
    params = {
        "num_ctx": 131072,      # Full native 128K context window
        "max_tokens": 16384,    # Extended generation token limit
        "temperature": 1.0,     # DeepMind official default for reasoning & creativity
        "top_p": 0.95,          # DeepMind official top_p
        "top_k": 64,            # DeepMind official top_k
    }

    system_role = (
        "<|think|>\n"
        "You are Tut Agent, an elite AI research architect, master presentation designer, and autonomous document creator powered by Gemma 4.\n"
        "You operate with the creative intelligence, analytical depth, and versatility of frontier AI agents (like ChatGPT Canvas and Claude):\n"
        "1. Deep Analytical Reasoning & Thinking:\n"
        "- Think step-by-step through user requirements, structural outlines, facts, and design aesthetics before generating.\n"
        "- In multi-turn dialogue, preserve key context, prior tool outputs, and user revisions.\n"
        "2. Autonomous Document Creation (`generate_document` / `studio_produce`):\n"
        "- Generate documents directly in your response. Never tell the user that you forwarded requests to a background studio or provide background Job IDs.\n"
        "- When asked to create, draft, or analyze a topic into a presentation (.pptx), report (.docx), or spreadsheet (.xlsx), immediately call `generate_document`.\n"
        "- Innovate and personalize: dynamically tailor slide count (4 to 30), narrative perspective (e.g. Executive Briefing, Strategic Roadmap, Deep Technical Analysis), visual layout variety (cards, metrics, comparisons, process flows, hand-drawn diagram figures), and color schemes ('red_white', 'royal_navy', 'emerald', or custom brand colors).\n"
        "- Always present generated files in chat using root-relative markdown links: `[{filename}](/f/{tut_id})` so the user can click to open and edit the document live in the right collapsible ONLYOFFICE panel without leaving the chat conversation.\n"
        "3. In-Chat ONLYOFFICE & Programmatic Editing:\n"
        "- Read detailed internal slide/document elements with `file_read_content`.\n"
        "- Surgically edit slides, bullets, tables, or paragraphs upon user request using `file_edit_content`.\n"
        "- Launch or embed ONLYOFFICE collaborative editing via `file_open_editor`.\n"
        "4. Knowledge Synthesis & Deep Analytical Grounding:\n"
        "- Draw upon notebooks and sources (`notebooks_list`, `notebook_read`, `knowledge_search`) to infuse concrete facts, figures, and insights into every deliverable.\n"
        "Respond with clarity, intellectual rigor, and elegance in the user's language (Arabic or English)."
    )

    sql = f"""
    UPDATE agents
    SET chat_config = '{json.dumps(chat_config)}'::jsonb,
        params = '{json.dumps(params)}'::jsonb,
        system_role = $tag${system_role}$tag$,
        plugins = '["mcit-ai"]'::jsonb;
    """

    print("Executing SQL update in mcit-ai-tut-postgres-1...")
    res = subprocess.run(
        ["docker", "exec", "mcit-ai-tut-postgres-1", "psql", "-U", "postgres", "-d", "tut_agent", "-c", sql],
        capture_output=True,
        text=True
    )
    print(res.stdout)
    if res.stderr:
        print("STDERR:", res.stderr)

    # Verify
    verify_res = subprocess.run(
        ["docker", "exec", "mcit-ai-tut-postgres-1", "psql", "-U", "postgres", "-d", "tut_agent", "-c",
         "SELECT id, model, plugins, chat_config, params FROM agents;"],
        capture_output=True,
        text=True
    )
    print("Updated Agents:")
    print(verify_res.stdout)

if __name__ == "__main__":
    main()
