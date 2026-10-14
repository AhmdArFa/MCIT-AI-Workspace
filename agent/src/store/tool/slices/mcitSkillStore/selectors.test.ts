import { describe, expect, it } from 'vitest';

import { initialState } from '../../initialState';
import { type ToolStore } from '../../store';
import { mcitSkillStoreSelectors } from './selectors';
import { type McitSkillServer } from './types';
import { McitSkillStatus } from './types';

describe('mcitSkillStoreSelectors', () => {
  describe('getServers', () => {
    it('should return empty array when no servers exist', () => {
      const state = { ...initialState } as ToolStore;
      const result = mcitSkillStoreSelectors.getServers(state);
      expect(result).toEqual([]);
    });

    it('should return all servers', () => {
      const servers: McitSkillServer[] = [
        {
          identifier: 'linear',
          name: 'Linear',
          isConnected: true,
          status: McitSkillStatus.CONNECTED,
        },
        {
          identifier: 'github',
          name: 'GitHub',
          isConnected: false,
          status: McitSkillStatus.NOT_CONNECTED,
        },
      ];
      const state = { ...initialState, mcitSkillServers: servers } as ToolStore;
      const result = mcitSkillStoreSelectors.getServers(state);
      expect(result).toEqual(servers);
    });

    it('should handle undefined mcitSkillServers', () => {
      const state = { ...initialState, mcitSkillServers: undefined } as unknown as ToolStore;
      const result = mcitSkillStoreSelectors.getServers(state);
      expect(result).toEqual([]);
    });
  });

  describe('getConnectedServers', () => {
    it('should return only connected servers', () => {
      const servers: McitSkillServer[] = [
        {
          identifier: 'linear',
          name: 'Linear',
          isConnected: true,
          status: McitSkillStatus.CONNECTED,
        },
        {
          identifier: 'github',
          name: 'GitHub',
          isConnected: false,
          status: McitSkillStatus.NOT_CONNECTED,
        },
        {
          identifier: 'slack',
          name: 'Slack',
          isConnected: false,
          status: McitSkillStatus.ERROR,
        },
      ];
      const state = { ...initialState, mcitSkillServers: servers } as ToolStore;
      const result = mcitSkillStoreSelectors.getConnectedServers(state);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Linear');
    });

    it('should return empty array when no servers are connected', () => {
      const servers: McitSkillServer[] = [
        {
          identifier: 'github',
          name: 'GitHub',
          isConnected: false,
          status: McitSkillStatus.NOT_CONNECTED,
        },
      ];
      const state = { ...initialState, mcitSkillServers: servers } as ToolStore;
      const result = mcitSkillStoreSelectors.getConnectedServers(state);
      expect(result).toEqual([]);
    });

    it('should return empty array when no servers exist', () => {
      const state = { ...initialState } as ToolStore;
      const result = mcitSkillStoreSelectors.getConnectedServers(state);
      expect(result).toEqual([]);
    });
  });

  describe('getAllServerIdentifiers', () => {
    it('should return set of all server identifiers', () => {
      const servers: McitSkillServer[] = [
        {
          identifier: 'linear',
          name: 'Linear',
          isConnected: true,
          status: McitSkillStatus.CONNECTED,
        },
        {
          identifier: 'github',
          name: 'GitHub',
          isConnected: false,
          status: McitSkillStatus.NOT_CONNECTED,
        },
      ];
      const state = { ...initialState, mcitSkillServers: servers } as ToolStore;
      const result = mcitSkillStoreSelectors.getAllServerIdentifiers(state);
      expect(result).toEqual(new Set(['linear', 'github']));
    });

    it('should return empty set when no servers exist', () => {
      const state = { ...initialState } as ToolStore;
      const result = mcitSkillStoreSelectors.getAllServerIdentifiers(state);
      expect(result).toEqual(new Set());
    });
  });

  describe('getServerByIdentifier', () => {
    it('should return server by identifier', () => {
      const servers: McitSkillServer[] = [
        {
          identifier: 'linear',
          name: 'Linear',
          isConnected: true,
          status: McitSkillStatus.CONNECTED,
        },
      ];
      const state = { ...initialState, mcitSkillServers: servers } as ToolStore;
      const result = mcitSkillStoreSelectors.getServerByIdentifier('linear')(state);
      expect(result?.identifier).toBe('linear');
      expect(result?.name).toBe('Linear');
    });

    it('should return undefined when server not found', () => {
      const state = { ...initialState } as ToolStore;
      const result = mcitSkillStoreSelectors.getServerByIdentifier('non-existent')(state);
      expect(result).toBeUndefined();
    });

    it('should return undefined when mcitSkillServers is undefined', () => {
      const state = { ...initialState, mcitSkillServers: undefined } as unknown as ToolStore;
      const result = mcitSkillStoreSelectors.getServerByIdentifier('linear')(state);
      expect(result).toBeUndefined();
    });
  });

  describe('isMcitSkillServer', () => {
    it('should return true for existing server', () => {
      const servers: McitSkillServer[] = [
        {
          identifier: 'linear',
          name: 'Linear',
          isConnected: true,
          status: McitSkillStatus.CONNECTED,
        },
      ];
      const state = { ...initialState, mcitSkillServers: servers } as ToolStore;
      const result = mcitSkillStoreSelectors.isMcitSkillServer('linear')(state);
      expect(result).toBe(true);
    });

    it('should return false for non-existing server', () => {
      const state = { ...initialState } as ToolStore;
      const result = mcitSkillStoreSelectors.isMcitSkillServer('non-existent')(state);
      expect(result).toBe(false);
    });

    it('should return false when mcitSkillServers is undefined', () => {
      const state = { ...initialState, mcitSkillServers: undefined } as unknown as ToolStore;
      const result = mcitSkillStoreSelectors.isMcitSkillServer('linear')(state);
      expect(result).toBe(false);
    });
  });

  describe('isServerLoading', () => {
    it('should return true when server is loading', () => {
      const state = {
        ...initialState,
        mcitSkillLoadingIds: new Set(['linear']),
      } as ToolStore;
      const result = mcitSkillStoreSelectors.isServerLoading('linear')(state);
      expect(result).toBe(true);
    });

    it('should return false when server is not loading', () => {
      const state = {
        ...initialState,
        mcitSkillLoadingIds: new Set(),
      } as ToolStore;
      const result = mcitSkillStoreSelectors.isServerLoading('linear')(state);
      expect(result).toBe(false);
    });

    it('should return false when mcitSkillLoadingIds is undefined', () => {
      const state = {
        ...initialState,
        mcitSkillLoadingIds: undefined,
      } as unknown as ToolStore;
      const result = mcitSkillStoreSelectors.isServerLoading('linear')(state);
      expect(result).toBe(false);
    });
  });

  describe('isToolExecuting', () => {
    it('should return true when tool is executing', () => {
      const state = {
        ...initialState,
        mcitSkillExecutingToolIds: new Set(['linear:createIssue']),
      } as ToolStore;
      const result = mcitSkillStoreSelectors.isToolExecuting('linear', 'createIssue')(state);
      expect(result).toBe(true);
    });

    it('should return false when tool is not executing', () => {
      const state = {
        ...initialState,
        mcitSkillExecutingToolIds: new Set(),
      } as ToolStore;
      const result = mcitSkillStoreSelectors.isToolExecuting('linear', 'createIssue')(state);
      expect(result).toBe(false);
    });

    it('should return false for different tool', () => {
      const state = {
        ...initialState,
        mcitSkillExecutingToolIds: new Set(['linear:createIssue']),
      } as ToolStore;
      const result = mcitSkillStoreSelectors.isToolExecuting('linear', 'listIssues')(state);
      expect(result).toBe(false);
    });

    it('should return false when mcitSkillExecutingToolIds is undefined', () => {
      const state = {
        ...initialState,
        mcitSkillExecutingToolIds: undefined,
      } as unknown as ToolStore;
      const result = mcitSkillStoreSelectors.isToolExecuting('linear', 'createIssue')(state);
      expect(result).toBe(false);
    });
  });

  describe('getAllTools', () => {
    it('should return all tools from connected servers', () => {
      const servers: McitSkillServer[] = [
        {
          identifier: 'linear',
          name: 'Linear',
          isConnected: true,
          status: McitSkillStatus.CONNECTED,
          tools: [
            { name: 'createIssue', description: 'Create issue', inputSchema: { type: 'object' } },
            { name: 'listIssues', description: 'List issues', inputSchema: { type: 'object' } },
          ],
        },
        {
          identifier: 'github',
          name: 'GitHub',
          isConnected: false,
          status: McitSkillStatus.NOT_CONNECTED,
          tools: [{ name: 'createPR', description: 'Create PR', inputSchema: { type: 'object' } }],
        },
      ];
      const state = { ...initialState, mcitSkillServers: servers } as ToolStore;
      const result = mcitSkillStoreSelectors.getAllTools(state);

      // Only tools from connected server (Linear) should be returned
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('createIssue');
      expect(result[0].provider).toBe('linear');
      expect(result[1].name).toBe('listIssues');
      expect(result[1].provider).toBe('linear');
    });

    it('should return empty array when no connected servers have tools', () => {
      const servers: McitSkillServer[] = [
        {
          identifier: 'linear',
          name: 'Linear',
          isConnected: true,
          status: McitSkillStatus.CONNECTED,
        },
      ];
      const state = { ...initialState, mcitSkillServers: servers } as ToolStore;
      const result = mcitSkillStoreSelectors.getAllTools(state);
      expect(result).toEqual([]);
    });

    it('should return empty array when no servers exist', () => {
      const state = { ...initialState } as ToolStore;
      const result = mcitSkillStoreSelectors.getAllTools(state);
      expect(result).toEqual([]);
    });

    it('should combine tools from multiple connected servers', () => {
      const servers: McitSkillServer[] = [
        {
          identifier: 'linear',
          name: 'Linear',
          isConnected: true,
          status: McitSkillStatus.CONNECTED,
          tools: [
            { name: 'createIssue', description: 'Create issue', inputSchema: { type: 'object' } },
          ],
        },
        {
          identifier: 'github',
          name: 'GitHub',
          isConnected: true,
          status: McitSkillStatus.CONNECTED,
          tools: [{ name: 'createPR', description: 'Create PR', inputSchema: { type: 'object' } }],
        },
      ];
      const state = { ...initialState, mcitSkillServers: servers } as ToolStore;
      const result = mcitSkillStoreSelectors.getAllTools(state);

      expect(result).toHaveLength(2);
      expect(result[0].provider).toBe('linear');
      expect(result[1].provider).toBe('github');
    });
  });

  describe('mcitSkillAsTutTools', () => {
    it('should convert connected servers with tools to TutTool format', () => {
      const servers: McitSkillServer[] = [
        {
          identifier: 'linear',
          name: 'Linear',
          icon: 'linear-icon',
          isConnected: true,
          status: McitSkillStatus.CONNECTED,
          tools: [
            { name: 'createIssue', description: 'Create issue', inputSchema: { type: 'object' } },
          ],
        },
      ];
      const state = { ...initialState, mcitSkillServers: servers } as ToolStore;
      const result = mcitSkillStoreSelectors.mcitSkillAsTutTools(state);

      expect(result).toHaveLength(1);
      expect(result[0].identifier).toBe('linear');
      expect(result[0].type).toBe('plugin');
      expect(result[0].manifest.api).toHaveLength(1);
      expect(result[0].manifest.api[0].name).toBe('createIssue');
      expect(result[0].manifest.meta.title).toBe('Linear');
      expect(result[0].manifest.meta.avatar).toBe('linear-icon');
    });

    it('should not include disconnected servers', () => {
      const servers: McitSkillServer[] = [
        {
          identifier: 'linear',
          name: 'Linear',
          isConnected: false,
          status: McitSkillStatus.NOT_CONNECTED,
          tools: [
            { name: 'createIssue', description: 'Create issue', inputSchema: { type: 'object' } },
          ],
        },
      ];
      const state = { ...initialState, mcitSkillServers: servers } as ToolStore;
      const result = mcitSkillStoreSelectors.mcitSkillAsTutTools(state);
      expect(result).toEqual([]);
    });

    it('should not include servers without tools', () => {
      const servers: McitSkillServer[] = [
        {
          identifier: 'linear',
          name: 'Linear',
          isConnected: true,
          status: McitSkillStatus.CONNECTED,
        },
      ];
      const state = { ...initialState, mcitSkillServers: servers } as ToolStore;
      const result = mcitSkillStoreSelectors.mcitSkillAsTutTools(state);
      expect(result).toEqual([]);
    });

    it('should not include servers with empty tools array', () => {
      const servers: McitSkillServer[] = [
        {
          identifier: 'linear',
          name: 'Linear',
          isConnected: true,
          status: McitSkillStatus.CONNECTED,
          tools: [],
        },
      ];
      const state = { ...initialState, mcitSkillServers: servers } as ToolStore;
      const result = mcitSkillStoreSelectors.mcitSkillAsTutTools(state);
      expect(result).toEqual([]);
    });

    it('should use default avatar when icon is not provided', () => {
      const servers: McitSkillServer[] = [
        {
          identifier: 'linear',
          name: 'Linear',
          isConnected: true,
          status: McitSkillStatus.CONNECTED,
          tools: [
            { name: 'createIssue', description: 'Create issue', inputSchema: { type: 'object' } },
          ],
        },
      ];
      const state = { ...initialState, mcitSkillServers: servers } as ToolStore;
      const result = mcitSkillStoreSelectors.mcitSkillAsTutTools(state);

      expect(result[0].manifest.meta.avatar).toBe('🔗');
    });

    it('should include all apis from server', () => {
      const servers: McitSkillServer[] = [
        {
          identifier: 'linear',
          name: 'Linear',
          isConnected: true,
          status: McitSkillStatus.CONNECTED,
          tools: [
            { name: 'createIssue', description: 'Create issue', inputSchema: { type: 'object' } },
            { name: 'listIssues', description: 'List issues', inputSchema: { type: 'object' } },
            { name: 'updateIssue', description: 'Update issue', inputSchema: { type: 'object' } },
          ],
        },
      ];
      const state = { ...initialState, mcitSkillServers: servers } as ToolStore;
      const result = mcitSkillStoreSelectors.mcitSkillAsTutTools(state);

      expect(result[0].manifest.api).toHaveLength(3);
      expect(result[0].manifest.api[0].name).toBe('createIssue');
      expect(result[0].manifest.api[1].name).toBe('listIssues');
      expect(result[0].manifest.api[2].name).toBe('updateIssue');
    });

    it('should handle undefined description in tools', () => {
      const servers: McitSkillServer[] = [
        {
          identifier: 'linear',
          name: 'Linear',
          isConnected: true,
          status: McitSkillStatus.CONNECTED,
          tools: [{ name: 'createIssue', inputSchema: { type: 'object' } }],
        },
      ];
      const state = { ...initialState, mcitSkillServers: servers } as ToolStore;
      const result = mcitSkillStoreSelectors.mcitSkillAsTutTools(state);

      expect(result[0].manifest.api[0].description).toBe('');
    });
  });

  describe('metaList', () => {
    it('should return metadata for connected servers', () => {
      const servers: McitSkillServer[] = [
        {
          identifier: 'linear',
          name: 'Linear',
          icon: 'linear-icon',
          isConnected: true,
          status: McitSkillStatus.CONNECTED,
        },
        {
          identifier: 'github',
          name: 'GitHub',
          icon: 'github-icon',
          isConnected: false,
          status: McitSkillStatus.NOT_CONNECTED,
        },
      ];
      const state = { ...initialState, mcitSkillServers: servers } as ToolStore;
      const result = mcitSkillStoreSelectors.metaList(state);

      expect(result).toHaveLength(1);
      expect(result[0].identifier).toBe('linear');
      expect(result[0].meta.title).toBe('Linear');
      expect(result[0].meta.avatar).toBe('linear-icon');
      expect(result[0].meta.description).toBe('MCIT AI Skill: Linear');
    });

    it('should return empty array when no connected servers', () => {
      const servers: McitSkillServer[] = [
        {
          identifier: 'linear',
          name: 'Linear',
          isConnected: false,
          status: McitSkillStatus.NOT_CONNECTED,
        },
      ];
      const state = { ...initialState, mcitSkillServers: servers } as ToolStore;
      const result = mcitSkillStoreSelectors.metaList(state);
      expect(result).toEqual([]);
    });

    it('should return empty array when no servers exist', () => {
      const state = { ...initialState } as ToolStore;
      const result = mcitSkillStoreSelectors.metaList(state);
      expect(result).toEqual([]);
    });

    it('should use default avatar when icon is not provided', () => {
      const servers: McitSkillServer[] = [
        {
          identifier: 'linear',
          name: 'Linear',
          isConnected: true,
          status: McitSkillStatus.CONNECTED,
        },
      ];
      const state = { ...initialState, mcitSkillServers: servers } as ToolStore;
      const result = mcitSkillStoreSelectors.metaList(state);

      expect(result[0].meta.avatar).toBe('🔗');
    });

    it('should return metadata for multiple connected servers', () => {
      const servers: McitSkillServer[] = [
        {
          identifier: 'linear',
          name: 'Linear',
          icon: 'linear-icon',
          isConnected: true,
          status: McitSkillStatus.CONNECTED,
        },
        {
          identifier: 'github',
          name: 'GitHub',
          icon: 'github-icon',
          isConnected: true,
          status: McitSkillStatus.CONNECTED,
        },
        {
          identifier: 'slack',
          name: 'Slack',
          icon: 'slack-icon',
          isConnected: true,
          status: McitSkillStatus.CONNECTED,
        },
      ];
      const state = { ...initialState, mcitSkillServers: servers } as ToolStore;
      const result = mcitSkillStoreSelectors.metaList(state);

      expect(result).toHaveLength(3);
      expect(result.map((r) => r.identifier)).toEqual(['linear', 'github', 'slack']);
    });
  });
});
