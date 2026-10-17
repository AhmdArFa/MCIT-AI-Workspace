import { and, eq, isNull } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { AgentModel } from '@/database/models/agent';
import { ConnectorModel } from '@/database/models/connector';
import { ConnectorToolModel } from '@/database/models/connectorTool';
import { agents, users } from '@/database/schemas';
import { account } from '@/database/schemas/betterAuth';
import {
  ConnectorMcpConnectionType,
  ConnectorSourceType,
  ConnectorStatus,
} from '@/database/schemas/connector';
import { serverDB } from '@/database/server';
import { verifyMcitAdminToken } from '@/libs/mcit/adminToken';
import { KeyVaultsGateKeeper } from '@/server/modules/KeyVaultsEncrypt';
import { syncConnectorToolsById } from '@/server/services/connector/sync';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const IDENTIFIER = 'mcit-ai';

/**
 * POST /webapi/mcit/admin/connect-mcp  { sub, email, url, token }
 *
 * Server-to-server (MCIT AI backend, MCIT_ADMIN_BOOTSTRAP_TOKEN). Connects the
 * person's Tut Agent to the MCIT AI tools (notebooks, knowledge search, Studio
 * features, document skills, files) as a personal MCP connector with their own
 * MCIT AI token, then syncs the tool list so Tut can use them right away.
 * Strictly one person: the MCIT account is resolved through its OIDC link.
 */
export const POST = async (req: Request) => {
  if (!verifyMcitAdminToken(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  let body: { email?: string; sub?: string; token?: string; url?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  const { sub, email, token, url } = body;
  if (!sub || !token || !url) return NextResponse.json({ error: 'sub, token and url are required' }, { status: 400 });

  const linked = await serverDB
    .select({ userId: account.userId })
    .from(account)
    .where(and(eq(account.providerId, 'generic-oidc'), eq(account.accountId, sub)))
    .limit(1);
  let userId = linked[0]?.userId;
  if (!userId && email) {
    const byEmail = await serverDB.select({ id: users.id }).from(users).where(eq(users.email, email.toLowerCase())).limit(1);
    userId = byEmail[0]?.id;
  }
  // The person has not opened Tut Agent yet: connect on their first sign-in instead
  if (!userId) return NextResponse.json({ linked: false });

  const connectorModel = new ConnectorModel(serverDB, userId, undefined, await KeyVaultsGateKeeper.initWithEnvKey());
  const connectorToolModel = new ConnectorToolModel(serverDB, userId);
  const fields = {
    credentials: JSON.stringify({ token, type: 'bearer' }),
    mcpConnectionType: ConnectorMcpConnectionType.http,
    mcpServerUrl: url,
    name: 'TuT AI',
  };
  const existing = await connectorModel.findScopedByIdentifier(IDENTIFIER);
  const id = existing
    ? (await connectorModel.update(existing.id, { ...fields, isEnabled: true, status: ConnectorStatus.disconnected }), existing.id)
    : (
        await connectorModel.create({
          ...fields,
          agentId: null,
          identifier: IDENTIFIER,
          isEnabled: true,
          metadata: null,
          mcpStdioConfig: null,
          oidcConfig: null,
          sourceType: ConnectorSourceType.custom,
          status: ConnectorStatus.disconnected,
        } as any)
      ).id;

  try {
    const { toolCount } = await syncConnectorToolsById(id, { connectorModel, connectorToolModel });
    // Pin TuT AI tools across all personal agents owned by this user
    const userAgents = await serverDB
      .select({ chatConfig: agents.chatConfig, id: agents.id, plugins: agents.plugins, systemRole: agents.systemRole })
      .from(agents)
      .where(and(eq(agents.userId, userId), isNull(agents.workspaceId)));

    const TUT_STUDIO_PROMPT =
      'You are Tut Agent, an elite AI research architect, master presentation designer, and autonomous document creator integrated with TuT AI.\n' +
      'You operate with the creative intelligence, analytical depth, and versatility of state-of-the-art AI agents (like ChatGPT Canvas and Claude):\n' +
      '1. Autonomous Document Creation (`generate_document` / `studio_produce`):\n' +
      '- Generate documents directly in your response. Never tell the user that you forwarded requests to a background studio or provide background Job IDs.\n' +
      '- When asked to create, draft, or analyze a topic into a presentation (.pptx), report (.docx), or spreadsheet (.xlsx), immediately call `generate_document`.\n' +
      '- Innovate and personalize: dynamically tailor slide count (4 to 30), narrative perspective (e.g. Executive Briefing, Strategic Roadmap, Deep Technical Analysis), visual layout variety (cards, metrics, comparisons, process flows, hand-drawn diagram figures), and color schemes (\'red_white\', \'royal_navy\', \'emerald\', or custom brand colors).\n' +
      '- Always present generated files in chat using root-relative markdown links: `[{filename}](/f/{tut_id})` so the user can click to open and edit the document live in the right collapsible ONLYOFFICE panel without leaving the chat conversation.\n' +
      '2. In-Chat ONLYOFFICE & Programmatic Editing:\n' +
      '- Read detailed internal slide/document elements with `file_read_content`.\n' +
      '- Surgically edit slides, bullets, tables, or paragraphs upon user request using `file_edit_content`.\n' +
      '- Launch or embed ONLYOFFICE collaborative editing via `file_open_editor`.\n' +
      '3. Knowledge Synthesis & Deep Analytical Grounding:\n' +
      '- Draw upon notebooks and sources (`notebooks_list`, `notebook_read`, `knowledge_search`) to infuse concrete facts, figures, and insights into every deliverable.\n' +
      'Respond with clarity, intellectual rigor, and elegance in the user\'s language (Arabic or English).';

    for (const agt of userAgents) {
      const plugins = Array.isArray(agt.plugins) ? agt.plugins : [];
      const chatConfig = {
        ...(agt.chatConfig as Record<string, unknown> | null),
        enableAgentMode: true,
        toolMode: 'all',
        enableHistoryCount: true,
        historyCount: 100,
        enableContextCompression: false,
        enableStaleToolResultTrim: false,
        memory: {
          enabled: true,
          toolPermission: 'read-write',
        },
      };
      const params = {
        num_ctx: 131072,
        max_tokens: 16384,
        temperature: 1.0,
        top_p: 0.95,
        top_k: 64,
      };
      const updatedPlugins = plugins.includes(IDENTIFIER) ? plugins : [...plugins, IDENTIFIER];
      const systemRole = TUT_STUDIO_PROMPT;

      await serverDB
        .update(agents)
        .set({
          chatConfig: chatConfig as any,
          params: params as any,
          plugins: updatedPlugins,
          systemRole,
        })
        .where(eq(agents.id, agt.id));
    }
    return NextResponse.json({ connector_id: id, linked: true, tools: toolCount });
  } catch (error) {
    return NextResponse.json(
      { connector_id: id, error: error instanceof Error ? error.message : 'Tool sync failed', linked: true },
      { status: 502 },
    );
  }
};
