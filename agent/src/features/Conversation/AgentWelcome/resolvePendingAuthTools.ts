import type {
  ComposioAppType,
  ConnectorCatalogAvailability,
  McitSkillProviderType,
} from '@tut/const';
import { resolveConnectorCatalogItem } from '@tut/const';

import type { ComposioServer } from '@/store/tool/slices/composioStore';
import { ComposioServerStatus } from '@/store/tool/slices/composioStore';
import type { McitSkillServer } from '@/store/tool/slices/mcitSkillStore/types';
import { McitSkillStatus } from '@/store/tool/slices/mcitSkillStore/types';

/** A Composio connector that still requires authorization. */
export interface PendingComposioTool extends ComposioAppType {
  /** Authorization system used by the alert row. */
  authType: 'composio';
  /** Existing pending connection, when one has already been created. */
  server?: ComposioServer;
}

/** A MCIT AI Market connector that still requires provider authorization. */
export interface PendingMcitTool extends McitSkillProviderType {
  /** Authorization system used by the alert row. */
  authType: 'mcit';
  /** Current provider connection state, when it has already been checked. */
  server?: McitSkillServer;
}

/** A built-in capability that requires the shared Market session. */
export interface PendingMarketTool {
  /** Authorization system used by the alert row. */
  authType: 'market';
  /** Display avatar for the built-in capability. */
  avatar: string;
  /** Agent plugin identifier. */
  identifier: string;
  /** User-facing capability name. */
  label: string;
}

/** One unresolved authorization requirement displayed by the agent welcome card. */
export type PendingAuthTool = PendingComposioTool | PendingMcitTool | PendingMarketTool;

/** Inputs needed to derive pending authorization rows without reading React stores. */
export interface ResolvePendingAuthToolsInput {
  /** Enabled connector systems for canonical source resolution. */
  availability: ConnectorCatalogAvailability;
  /** Whether the first Composio connection request has settled. */
  composioInitialized: boolean;
  /** Current Composio connection states. */
  composioServers: ComposioServer[];
  /** Whether the first MCIT AI Market connection request has settled. */
  mcitInitialized: boolean;
  /** Current MCIT AI Market connection states. */
  mcitServers: McitSkillServer[];
  /** Whether the shared Market session is authenticated. */
  marketAuthenticated: boolean;
  /** Built-in capabilities gated only by the shared Market session. */
  marketTools: PendingMarketTool[];
  /** Active agent plugin identifiers. */
  plugins: string[];
}

/**
 * Resolves agent plugin identifiers into their pending authorization rows.
 *
 * Use when:
 * - Agent configuration stores unqualified connector identifiers
 * - The welcome card must choose exactly one OAuth system for each identifier
 *
 * Expects:
 * - Connection initialization flags prevent transient false unauthorized rows
 * - Connector catalog ownership is resolved before legacy Market-only tools
 *
 * Returns:
 * - Deduplicated pending rows in agent plugin order
 */
export const resolvePendingAuthTools = ({
  availability,
  composioInitialized,
  composioServers,
  mcitInitialized,
  mcitServers,
  marketAuthenticated,
  marketTools,
  plugins,
}: ResolvePendingAuthToolsInput): PendingAuthTool[] => {
  const pending: PendingAuthTool[] = [];
  const seenIdentifiers = new Set<string>();

  for (const identifier of plugins) {
    if (seenIdentifiers.has(identifier)) continue;
    seenIdentifiers.add(identifier);

    const composioServer = composioServers.find((item) => item.identifier === identifier);
    const mcitServer = mcitServers.find((item) => item.identifier === identifier);

    const connector = resolveConnectorCatalogItem(identifier, availability);
    if (connector?.type === 'mcit') {
      if (!mcitInitialized) continue;
      if (mcitServer?.status !== McitSkillStatus.CONNECTED) {
        pending.push({ ...connector.provider, authType: 'mcit', server: mcitServer });
      }
      continue;
    }

    if (connector?.type === 'composio') {
      if (!composioInitialized) continue;
      if (!composioServer || composioServer.status === ComposioServerStatus.PENDING_AUTH) {
        pending.push({ ...connector.serverType, authType: 'composio', server: composioServer });
      }
      continue;
    }

    const marketTool = marketTools.find((item) => item.identifier === identifier);
    if (marketTool && !marketAuthenticated) pending.push(marketTool);
  }

  return pending;
};
