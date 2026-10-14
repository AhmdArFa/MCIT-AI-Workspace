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
    name: 'MCIT AI',
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
    // A connected MCP server is discoverable but not available to the agent
    // until its identifier is pinned. Scope this write to this user's personal
    // inbox: no shared agent, workspace, or other user's config is touched.
    const inbox = await new AgentModel(serverDB, userId).getBuiltinAgent('inbox');
    if (!inbox) throw new Error('Personal inbox agent not found');
    const plugins = Array.isArray(inbox.plugins) ? inbox.plugins : [];
    // Custom tool mode: exactly the declared tools (MCIT AI plus the inbox's own),
    // so a local model sees a focused tool list it can actually use.
    const chatConfig = { ...(inbox.chatConfig as Record<string, unknown> | null), enableAgentMode: true, toolMode: 'custom' };
    await serverDB
      .update(agents)
      .set({ chatConfig: chatConfig as any, plugins: plugins.includes(IDENTIFIER) ? plugins : [...plugins, IDENTIFIER] })
      .where(and(eq(agents.id, inbox.id), eq(agents.userId, userId), isNull(agents.workspaceId)));
    return NextResponse.json({ connector_id: id, linked: true, tools: toolCount });
  } catch (error) {
    return NextResponse.json(
      { connector_id: id, error: error instanceof Error ? error.message : 'Tool sync failed', linked: true },
      { status: 502 },
    );
  }
};
