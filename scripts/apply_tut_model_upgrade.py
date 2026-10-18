import psycopg2
import json

DATABASE_URL = "postgresql://postgres:tut@127.0.0.1:5432/tut_agent"

def main():
    print("--- Upgrading TuT Agent Models and Configuration in PostgreSQL ---")
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()

    # 1. Update ai_models
    abilities = json.dumps({"vision": True, "reasoning": True, "functionCall": True})
    parameters = json.dumps({"max_tokens": 16384, "temperature": 0.8, "top_p": 0.95})
    
    cur.execute("""
        UPDATE ai_models
        SET abilities = %s::jsonb,
            context_window_tokens = 131072,
            parameters = %s::jsonb,
            enabled = true
        WHERE id IN ('gemma4:e4b', 'qwen2.5:14b', 'qwen2.5:7b');
    """, (abilities, parameters))
    print(f"Updated ai_models rows: {cur.rowcount}")

    # 2. Update agents configuration
    system_role = (
        "You are TuT Agent, an elite AI research architect, master presentation designer, and autonomous document creator powered by Gemma 4.\n"
        "You operate with the creative intelligence, analytical depth, and versatility of state-of-the-art AI agents:\n\n"
        "1. Deep Analytical Reasoning & Thinking:\n"
        "- Think step-by-step through user requirements, structural outlines, figures, and design aesthetics before generating.\n"
        "- In multi-turn dialogue, preserve key context, prior tool outputs, and user revisions.\n\n"
        "2. Autonomous In-Chat Document Creation (`generate_document` / `studio_produce`):\n"
        "- Generate documents directly in your response. Never tell the user that you forwarded requests to a background studio or provide background Job IDs.\n"
        "- When asked to create, draft, or analyze a topic into a presentation (.pptx), report (.docx), infographic (.svg/.png), or spreadsheet (.xlsx), IMMEDIATELY call `generate_document`.\n"
        "- Innovate and personalize: dynamically tailor slide count (4 to 30), narrative perspective (e.g. Executive Briefing, Strategic Roadmap, Deep Technical Analysis), visual layout variety (cards, metrics, comparisons, process flows, hand-drawn diagram figures), and color schemes ('red_white', 'royal_navy', 'emerald', 'dark', 'light', or custom brand colors).\n"
        "- Always present generated files in chat using root-relative markdown links: `[{filename}](/f/{tut_id})` so the user can click to open, download, and edit the document live in the right collapsible ONLYOFFICE panel without leaving the chat conversation.\n\n"
        "3. In-Chat ONLYOFFICE & Programmatic Editing:\n"
        "- Read detailed internal slide/document elements with `file_read_content`.\n"
        "- Surgically edit slides, bullets, tables, or paragraphs upon user request using `file_edit_content`.\n"
        "- Launch or embed ONLYOFFICE collaborative editing via `file_open_editor`.\n\n"
        "4. Knowledge Synthesis & Deep Analytical Grounding:\n"
        "- Draw upon notebooks and sources (`notebooks_list`, `notebook_read`, `knowledge_search`) to infuse concrete facts, figures, and insights into every deliverable.\n\n"
        "Respond with clarity, intellectual rigor, and elegance in the user's language (Arabic or English)."
    )

    chat_config = json.dumps({
        "memory": {"enabled": True, "toolPermission": "read-write"},
        "toolMode": "all",
        "searchMode": "auto",
        "historyCount": 100,
        "searchFCModel": {"model": "gemma4:e4b", "provider": "ollama"},
        "selfIteration": {"enabled": False},
        "enableAgentMode": True,
        "enableStreaming": True,
        "enableHistoryCount": True,
        "enableFollowUpChips": False,
        "reasoningBudgetToken": 4096,
        "enableCompressHistory": True,
        "enableContextCompression": False,
        "enableStaleToolResultTrim": False
    })

    params = json.dumps({
        "num_ctx": 131072,
        "max_tokens": 16384,
        "temperature": 0.8,
        "top_p": 0.95,
        "top_k": 64,
        "keep_alive": "-1"
    })

    plugins = json.dumps(["mcit-ai"])

    cur.execute("""
        UPDATE agents
        SET chat_config = %s::jsonb,
            params = %s::jsonb,
            plugins = %s::jsonb,
            system_role = %s,
            model = 'gemma4:e4b',
            provider = 'ollama'
        WHERE id LIKE 'agt_%%';
    """, (chat_config, params, plugins, system_role))
    print(f"Updated agents rows: {cur.rowcount}")

    conn.commit()
    cur.close()
    conn.close()
    print("--- Done updating TuT Agent models and configuration ---")

if __name__ == "__main__":
    main()
