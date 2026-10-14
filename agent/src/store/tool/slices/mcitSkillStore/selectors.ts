import urlJoin from 'url-join';

import { OFFICIAL_SITE } from '@/const/url';

import { type ToolStoreState } from '../../initialState';
import { type McitSkillServer } from './types';
import { McitSkillStatus } from './types';

/**
 * MCIT AI Skill Store Selectors
 */
export const mcitSkillStoreSelectors = {
  /**
   * Get all MCIT AI Skill server identifiers as a set
   */
  getAllServerIdentifiers: (s: ToolStoreState): Set<string> => {
    const servers = s.mcitSkillServers || [];
    return new Set(servers.map((server) => server.identifier));
  },

  /**
   * Get all available tools from all connected servers
   */
  getAllTools: (s: ToolStoreState) => {
    const connectedServers = mcitSkillStoreSelectors.getConnectedServers(s);
    return connectedServers.flatMap((server) =>
      (server.tools || []).map((tool) => ({
        ...tool,
        provider: server.identifier,
      })),
    );
  },

  /**
   * Get all connected servers
   */
  getConnectedServers: (s: ToolStoreState): McitSkillServer[] =>
    (s.mcitSkillServers || []).filter(
      (server) => server.status === McitSkillStatus.CONNECTED,
    ),

  /**
   * Get server by identifier
   * @param identifier - Provider identifier (e.g., 'linear')
   */
  getServerByIdentifier: (identifier: string) => (s: ToolStoreState) =>
    s.mcitSkillServers?.find((server) => server.identifier === identifier),

  /**
   * Get all MCIT AI Skill servers
   */
  getServers: (s: ToolStoreState): McitSkillServer[] => s.mcitSkillServers || [],

  /**
   * Check if the given identifier is a MCIT AI Skill server
   * @param identifier - Provider identifier (e.g., 'linear')
   */
  isMcitSkillServer:
    (identifier: string) =>
    (s: ToolStoreState): boolean => {
      const servers = s.mcitSkillServers || [];
      return servers.some((server) => server.identifier === identifier);
    },

  /**
   * Check if a server is loading
   * @param identifier - Provider identifier (e.g., 'linear')
   */
  isServerLoading: (identifier: string) => (s: ToolStoreState) =>
    s.mcitSkillLoadingIds?.has(identifier) || false,

  /**
   * Check if a tool is currently executing
   */
  isToolExecuting: (provider: string, toolName: string) => (s: ToolStoreState) => {
    const toolId = `${provider}:${toolName}`;
    return s.mcitSkillExecutingToolIds?.has(toolId) || false;
  },

  /**
   * Get all MCIT AI Skill tools as TutTool format for agent use
   * Converts MCIT AI Skill tools into the format expected by ToolNameResolver
   */
  mcitSkillAsTutTools: (s: ToolStoreState) => {
    const servers = s.mcitSkillServers || [];
    const tools: any[] = [];

    for (const server of servers) {
      if (!server.tools || server.status !== McitSkillStatus.CONNECTED) continue;

      const apis = server.tools.map((tool) => ({
        description: tool.description || '',
        name: tool.name,
        parameters: tool.inputSchema || {},
      }));

      if (apis.length > 0) {
        tools.push({
          identifier: server.identifier,
          manifest: {
            api: apis,
            author: 'MCIT AI Market',
            homepage: urlJoin(OFFICIAL_SITE, 'market'),
            identifier: server.identifier,
            meta: {
              avatar: server.icon || '🔗',
              description: `MCIT AI Skill: ${server.name}`,
              tags: ['mcit-skill', server.identifier],
              title: server.name,
            },
            type: 'builtin',
            version: '1.0.0',
          },
          type: 'plugin',
        });
      }
    }

    return tools;
  },

  /**
   * Get metadata list for all connected MCIT AI Skill servers
   * Used by toolSelectors.metaList for unified tool metadata resolution
   */
  metaList: (s: ToolStoreState) => {
    const servers = s.mcitSkillServers || [];

    return servers
      .filter((server) => server.status === McitSkillStatus.CONNECTED)
      .map((server) => ({
        identifier: server.identifier,
        meta: {
          avatar: server.icon || '🔗',
          description: `MCIT AI Skill: ${server.name}`,
          title: server.name,
        },
      }));
  },
};
