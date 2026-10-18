const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function run() {
  console.log('--- Applying TuT Model and Agent Upgrades ---');

  // 1. Update ai_models
  const abilities = JSON.stringify({ vision: true, reasoning: true, functionCall: true });
  const parameters = JSON.stringify({ max_tokens: 16384, temperature: 0.8, top_p: 0.95 });

  const modelsRes = await pool.query(`
    UPDATE ai_models
    SET abilities = $1::jsonb,
        context_window_tokens = 131072,
        parameters = $2::jsonb,
        enabled = true
    WHERE id IN ('gemma4:e4b', 'qwen2.5:14b', 'qwen2.5:7b');
  `, [abilities, parameters]);
  console.log(`Updated ai_models rows: ${modelsRes.rowCount}`);

  // 2. System prompt
  const systemRole = `You are TuT Agent, an elite AI research architect, master presentation designer, and autonomous document creator powered by Gemma 4.
You operate with the creative intelligence, analytical depth, and versatility of state-of-the-art AI agents:

1. Deep Analytical Reasoning & Thinking:
- Think step-by-step through user requirements, structural outlines, figures, and design aesthetics before generating.
- In multi-turn dialogue, preserve key context, prior tool outputs, and user revisions.

2. Autonomous In-Chat Document Creation (generate_document / studio_produce):
- Generate documents directly in your response. Never tell the user that you forwarded requests to a background studio or provide background Job IDs.
- When asked to create, draft, or analyze a topic into a presentation (.pptx), report (.docx), infographic (.svg/.png), or spreadsheet (.xlsx), IMMEDIATELY call generate_document.
- Innovate and personalize: dynamically tailor slide count (4 to 30), narrative perspective (e.g. Executive Briefing, Strategic Roadmap, Deep Technical Analysis), visual layout variety (cards, metrics, comparisons, process flows, hand-drawn diagram figures), and color schemes ('red_white', 'royal_navy', 'emerald', 'dark', 'light', or custom brand colors).
- Always present generated files in chat using root-relative markdown links: [{filename}](/f/{tut_id}) so the user can click to open, download, and edit the document live in the right collapsible ONLYOFFICE panel without leaving the chat conversation.

3. In-Chat ONLYOFFICE & Programmatic Editing:
- Read detailed internal slide/document elements with file_read_content.
- Surgically edit slides, bullets, tables, or paragraphs upon user request using file_edit_content.
- Launch or embed ONLYOFFICE collaborative editing via file_open_editor.

4. Knowledge Synthesis & Deep Analytical Grounding:
- Draw upon notebooks and sources (notebooks_list, notebook_read, knowledge_search) to infuse concrete facts, figures, and insights into every deliverable.

Respond with clarity, intellectual rigor, and elegance in the user's language (Arabic or English).`;

  // 3. chat_config
  const chatConfig = JSON.stringify({
    memory: { enabled: true, toolPermission: "read-write" },
    toolMode: "all",
    searchMode: "auto",
    historyCount: 100,
    searchFCModel: { model: "gemma4:e4b", provider: "ollama" },
    selfIteration: { enabled: false },
    enableAgentMode: true,
    enableStreaming: true,
    enableHistoryCount: true,
    enableFollowUpChips: false,
    reasoningBudgetToken: 4096,
    enableCompressHistory: true,
    enableContextCompression: false,
    enableStaleToolResultTrim: false
  });

  const params = JSON.stringify({
    num_ctx: 131072,
    max_tokens: 16384,
    temperature: 0.8,
    top_p: 0.95,
    top_k: 64,
    keep_alive: "-1"
  });

  const plugins = JSON.stringify(["mcit-ai"]);

  const agentsRes = await pool.query(`
    UPDATE agents
    SET chat_config = $1::jsonb,
        params = $2::jsonb,
        plugins = $3::jsonb,
        system_role = $4,
        model = 'gemma4:e4b',
        provider = 'ollama'
    WHERE id LIKE 'agt_%';
  `, [chatConfig, params, plugins, systemRole]);
  console.log(`Updated agents rows: ${agentsRes.rowCount}`);

  // Check results
  const checkRes = await pool.query(`
    SELECT id, model, provider, (chat_config->>'toolMode') as tool_mode, (chat_config->>'reasoningBudgetToken') as reasoning_budget
    FROM agents WHERE id LIKE 'agt_%';
  `);
  console.log('Verified agents:', checkRes.rows);

  const checkModels = await pool.query(`
    SELECT id, user_id, context_window_tokens, abilities, parameters
    FROM ai_models WHERE id IN ('gemma4:e4b', 'qwen2.5:14b', 'qwen2.5:7b');
  `);
  console.log('Verified models:', checkModels.rows);

  await pool.end();
  console.log('--- Done! ---');
}

run().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
