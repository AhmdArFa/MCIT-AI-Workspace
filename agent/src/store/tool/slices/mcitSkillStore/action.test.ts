import { randomUUID } from 'node:crypto';

import type * as TutchatConstModule from '@tut/const';
import { act, renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { SWRConfig } from 'swr';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { cacheScope, createReplicaState } from '@/libs/replica';
import { toolsClient } from '@/libs/trpc/client';
import { useUserStore } from '@/store/user';

import { useToolStore } from '../../store';
import { initialMcitSkillStoreState } from './initialState';
import { McitSkillStatus } from './types';

// Each test owns a fresh replica scope, so the store's replica entries and the
// connections list's local intent never leak from one case to the next.
let scope = '';
vi.spyOn(cacheScope, 'get').mockImplementation(() => scope);
vi.spyOn(cacheScope, 'use').mockImplementation(() => scope);

beforeEach(() => {
  vi.clearAllMocks();
  scope = `mcit-skill-action-${randomUUID()}:personal`;
  useUserStore.setState({ isSignedIn: false });
  act(() => useToolStore.setState(initialMcitSkillStoreState));
});

vi.mock('@tut/const', async (importOriginal) => {
  const actual = await importOriginal<typeof TutchatConstModule>();
  return {
    ...actual,
    getMcitSkillProviderById: vi.fn((id: string) => ({
      id,
      label: id.charAt(0).toUpperCase() + id.slice(1),
      icon: '🔗',
    })),
  };
});

vi.mock('@/libs/trpc/client', () => ({
  toolsClient: {
    market: {
      connectCallTool: { mutate: vi.fn() },
      connectGetAuthorizeUrl: { query: vi.fn() },
      connectGetStatus: { query: vi.fn() },
      connectListConnections: { query: vi.fn() },
      connectListTools: { query: vi.fn() },
      connectRefresh: { mutate: vi.fn() },
      connectRevoke: { mutate: vi.fn() },
    },
  },
}));

const createSWRWrapper = () => {
  const value = { dedupingInterval: 0, provider: () => new Map() };

  return function SWRTestWrapper({ children }: { children: ReactNode }) {
    return createElement(SWRConfig, { value }, children);
  };
};

describe('mcitSkillStore actions', () => {
  describe('callMcitSkillTool', () => {
    it('should call tool successfully and return result', async () => {
      const { result } = renderHook(() => useToolStore());

      act(() => {
        useToolStore.setState({
          mcitSkillServers: [],
          mcitSkillLoadingIds: new Set(),
          mcitSkillExecutingToolIds: new Set(),
        });
      });

      const mockResponse = {
        data: { result: 'success' },
      };
      vi.mocked(toolsClient.market.connectCallTool.mutate).mockResolvedValue(mockResponse as any);

      let callResult;
      await act(async () => {
        callResult = await result.current.callMcitSkillTool({
          provider: 'linear',
          toolName: 'createIssue',
          args: { title: 'Test Issue' },
        });
      });

      expect(callResult).toEqual({ data: mockResponse.data, success: true });
      expect(toolsClient.market.connectCallTool.mutate).toHaveBeenCalledWith({
        provider: 'linear',
        toolName: 'createIssue',
        args: { title: 'Test Issue' },
        topicId: undefined,
      });
    });

    it('should return failure when the tool response is unsuccessful', async () => {
      const { result } = renderHook(() => useToolStore());

      act(() => {
        useToolStore.setState({
          mcitSkillExecutingToolIds: new Set(),
          mcitSkillLoadingIds: new Set(),
          mcitSkillServers: [],
        });
      });

      vi.mocked(toolsClient.market.connectCallTool.mutate).mockResolvedValue({
        data: null,
        error: { code: 'POSTHOG_QUERY_FAILED', message: 'Query failed' },
        success: false,
      } as any);

      let callResult;
      await act(async () => {
        callResult = await result.current.callMcitSkillTool({
          args: { query: 'select * from events' },
          provider: 'posthog',
          toolName: 'query',
        });
      });

      expect(callResult).toEqual({
        data: null,
        error: 'Query failed',
        errorCode: 'POSTHOG_QUERY_FAILED',
        success: false,
      });
      expect(result.current.mcitSkillExecutingToolIds.has('posthog:query')).toBe(false);
    });

    it('should use string response data as the failure message when no structured error is provided', async () => {
      const { result } = renderHook(() => useToolStore());

      act(() => {
        useToolStore.setState({
          mcitSkillExecutingToolIds: new Set(),
          mcitSkillLoadingIds: new Set(),
          mcitSkillServers: [],
        });
      });

      vi.mocked(toolsClient.market.connectCallTool.mutate).mockResolvedValue({
        data: 'PostHog query timed out',
        success: false,
      } as any);

      let callResult;
      await act(async () => {
        callResult = await result.current.callMcitSkillTool({
          args: { query: 'select * from events' },
          provider: 'posthog',
          toolName: 'query',
        });
      });

      expect(callResult).toEqual({
        data: 'PostHog query timed out',
        error: 'PostHog query timed out',
        errorCode: undefined,
        success: false,
      });
      expect(result.current.mcitSkillExecutingToolIds.has('posthog:query')).toBe(false);
    });

    it('should stringify response data objects as the failure message', async () => {
      const { result } = renderHook(() => useToolStore());

      act(() => {
        useToolStore.setState({
          mcitSkillExecutingToolIds: new Set(),
          mcitSkillLoadingIds: new Set(),
          mcitSkillServers: [],
        });
      });

      vi.mocked(toolsClient.market.connectCallTool.mutate).mockResolvedValue({
        data: { detail: 'PostHog query timed out', status: 504 },
        success: false,
      } as any);

      let callResult;
      await act(async () => {
        callResult = await result.current.callMcitSkillTool({
          args: { query: 'select * from events' },
          provider: 'posthog',
          toolName: 'query',
        });
      });

      expect(callResult).toEqual({
        data: { detail: 'PostHog query timed out', status: 504 },
        error: JSON.stringify({ detail: 'PostHog query timed out', status: 504 }),
        errorCode: undefined,
        success: false,
      });
    });

    it('should use a generic failure message when an unsuccessful response has no detail', async () => {
      const { result } = renderHook(() => useToolStore());

      act(() => {
        useToolStore.setState({
          mcitSkillExecutingToolIds: new Set(),
          mcitSkillLoadingIds: new Set(),
          mcitSkillServers: [],
        });
      });

      vi.mocked(toolsClient.market.connectCallTool.mutate).mockResolvedValue({
        data: null,
        success: false,
      } as any);

      let callResult;
      await act(async () => {
        callResult = await result.current.callMcitSkillTool({
          args: {},
          provider: 'posthog',
          toolName: 'query',
        });
      });

      expect(callResult).toEqual({
        data: null,
        error: 'MCIT AI Skill call failed',
        errorCode: undefined,
        success: false,
      });
    });

    it('should track executing state during tool call', async () => {
      const { result } = renderHook(() => useToolStore());

      act(() => {
        useToolStore.setState({
          mcitSkillServers: [],
          mcitSkillLoadingIds: new Set(),
          mcitSkillExecutingToolIds: new Set(),
        });
      });

      let resolvePromise: (value: any) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      vi.mocked(toolsClient.market.connectCallTool.mutate).mockReturnValue(promise as any);

      const callPromise = act(async () => {
        return result.current.callMcitSkillTool({
          provider: 'linear',
          toolName: 'createIssue',
        });
      });

      // Tool should be marked as executing during the call
      await waitFor(() => {
        expect(result.current.mcitSkillExecutingToolIds.has('linear:createIssue')).toBe(true);
      });

      // Resolve the promise
      resolvePromise!({ data: {} });
      await callPromise;

      // Tool should no longer be executing after completion
      expect(result.current.mcitSkillExecutingToolIds.has('linear:createIssue')).toBe(false);
    });

    it('should handle NOT_CONNECTED error', async () => {
      const { result } = renderHook(() => useToolStore());

      act(() => {
        useToolStore.setState({
          mcitSkillServers: [],
          mcitSkillLoadingIds: new Set(),
          mcitSkillExecutingToolIds: new Set(),
        });
      });

      vi.mocked(toolsClient.market.connectCallTool.mutate).mockRejectedValue(
        new Error('NOT_CONNECTED'),
      );

      let callResult;
      await act(async () => {
        callResult = await result.current.callMcitSkillTool({
          provider: 'linear',
          toolName: 'createIssue',
        });
      });

      expect(callResult).toEqual({
        error: 'NOT_CONNECTED',
        errorCode: 'NOT_CONNECTED',
        success: false,
      });
      expect(result.current.mcitSkillExecutingToolIds.has('linear:createIssue')).toBe(false);
    });

    it('should handle TOKEN_EXPIRED error', async () => {
      const { result } = renderHook(() => useToolStore());

      act(() => {
        useToolStore.setState({
          mcitSkillServers: [],
          mcitSkillLoadingIds: new Set(),
          mcitSkillExecutingToolIds: new Set(),
        });
      });

      vi.mocked(toolsClient.market.connectCallTool.mutate).mockRejectedValue(
        new Error('TOKEN_EXPIRED'),
      );

      let callResult;
      await act(async () => {
        callResult = await result.current.callMcitSkillTool({
          provider: 'linear',
          toolName: 'createIssue',
        });
      });

      expect(callResult).toEqual({
        error: 'TOKEN_EXPIRED',
        errorCode: 'NOT_CONNECTED',
        success: false,
      });
    });

    it('should handle generic error', async () => {
      const { result } = renderHook(() => useToolStore());

      act(() => {
        useToolStore.setState({
          mcitSkillServers: [],
          mcitSkillLoadingIds: new Set(),
          mcitSkillExecutingToolIds: new Set(),
        });
      });

      vi.mocked(toolsClient.market.connectCallTool.mutate).mockRejectedValue(
        new Error('Network error'),
      );

      let callResult;
      await act(async () => {
        callResult = await result.current.callMcitSkillTool({
          provider: 'linear',
          toolName: 'createIssue',
        });
      });

      expect(callResult).toEqual({
        error: 'Network error',
        success: false,
      });
    });
  });

  describe('checkMcitSkillStatus', () => {
    it('should check status and add server when connected', async () => {
      const { result } = renderHook(() => useToolStore());

      act(() => {
        useToolStore.setState({
          mcitSkillServers: [],
          mcitSkillLoadingIds: new Set(),
          mcitSkillExecutingToolIds: new Set(),
        });
      });

      const mockResponse = {
        connected: true,
        icon: 'linear-icon',
        connection: {
          providerUsername: 'testuser',
          scopes: ['read', 'write'],
          tokenExpiresAt: '2024-12-31T00:00:00Z',
        },
      };
      vi.mocked(toolsClient.market.connectGetStatus.query).mockResolvedValue(mockResponse as any);
      vi.mocked(toolsClient.market.connectListTools.query).mockResolvedValue({
        provider: 'linear',
        tools: [],
      });

      let server;
      await act(async () => {
        server = await result.current.checkMcitSkillStatus('linear');
      });

      expect(server).toMatchObject({
        identifier: 'linear',
        name: 'Linear',
        isConnected: true,
        status: McitSkillStatus.CONNECTED,
        providerUsername: 'testuser',
        scopes: ['read', 'write'],
      });
      expect(result.current.mcitSkillServers).toHaveLength(1);
      expect(result.current.mcitSkillLoadingIds.has('linear')).toBe(false);
    });

    it('should check status and add server when not connected', async () => {
      const { result } = renderHook(() => useToolStore());

      act(() => {
        useToolStore.setState({
          mcitSkillServers: [],
          mcitSkillLoadingIds: new Set(),
          mcitSkillExecutingToolIds: new Set(),
        });
      });

      const mockResponse = {
        connected: false,
        icon: 'linear-icon',
      };
      vi.mocked(toolsClient.market.connectGetStatus.query).mockResolvedValue(mockResponse as any);

      let server;
      await act(async () => {
        server = await result.current.checkMcitSkillStatus('linear');
      });

      expect(server).toMatchObject({
        identifier: 'linear',
        isConnected: false,
        status: McitSkillStatus.NOT_CONNECTED,
      });
      expect(toolsClient.market.connectListTools.query).not.toHaveBeenCalled();
    });

    it('should update existing server instead of adding new one', async () => {
      const { result } = renderHook(() => useToolStore());

      act(() => {
        useToolStore.setState({
          mcitSkillServers: [
            {
              identifier: 'linear',
              name: 'Linear',
              isConnected: false,
              status: McitSkillStatus.NOT_CONNECTED,
            },
          ],
          mcitSkillLoadingIds: new Set(),
          mcitSkillExecutingToolIds: new Set(),
        });
      });

      const mockResponse = {
        connected: true,
        icon: 'linear-icon',
        connection: {
          providerUsername: 'testuser',
          scopes: ['read'],
          tokenExpiresAt: '2024-12-31T00:00:00Z',
        },
      };
      vi.mocked(toolsClient.market.connectGetStatus.query).mockResolvedValue(mockResponse as any);
      vi.mocked(toolsClient.market.connectListTools.query).mockResolvedValue({
        provider: 'linear',
        tools: [],
      });

      await act(async () => {
        await result.current.checkMcitSkillStatus('linear');
      });

      expect(result.current.mcitSkillServers).toHaveLength(1);
      expect((result.current.mcitSkillServers ?? [])[0].isConnected).toBe(true);
      expect((result.current.mcitSkillServers ?? [])[0].status).toBe(
        McitSkillStatus.CONNECTED,
      );
    });

    it('should track loading state during status check', async () => {
      const { result } = renderHook(() => useToolStore());

      act(() => {
        useToolStore.setState({
          mcitSkillServers: [],
          mcitSkillLoadingIds: new Set(),
          mcitSkillExecutingToolIds: new Set(),
        });
      });

      let resolvePromise: (value: any) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      vi.mocked(toolsClient.market.connectGetStatus.query).mockReturnValue(promise as any);

      const checkPromise = act(async () => {
        return result.current.checkMcitSkillStatus('linear');
      });

      // Should be loading during the check
      await waitFor(() => {
        expect(result.current.mcitSkillLoadingIds.has('linear')).toBe(true);
      });

      // Resolve the promise
      resolvePromise!({ connected: false, icon: '' });
      await checkPromise;

      // Should not be loading after completion
      expect(result.current.mcitSkillLoadingIds.has('linear')).toBe(false);
    });

    it('should handle error and return undefined', async () => {
      const { result } = renderHook(() => useToolStore());

      act(() => {
        useToolStore.setState({
          mcitSkillServers: [],
          mcitSkillLoadingIds: new Set(),
          mcitSkillExecutingToolIds: new Set(),
        });
      });

      vi.mocked(toolsClient.market.connectGetStatus.query).mockRejectedValue(
        new Error('Network error'),
      );

      let server;
      await act(async () => {
        server = await result.current.checkMcitSkillStatus('linear');
      });

      expect(server).toBeUndefined();
      expect(result.current.mcitSkillLoadingIds.has('linear')).toBe(false);
    });
  });

  describe('getMcitSkillAuthorizeUrl', () => {
    it('should return authorization URL and code', async () => {
      const { result } = renderHook(() => useToolStore());

      const mockResponse = {
        authorizeUrl: 'https://auth.linear.app/authorize?code=abc123',
        code: 'abc123',
        expiresIn: 600,
      };
      vi.mocked(toolsClient.market.connectGetAuthorizeUrl.query).mockResolvedValue(
        mockResponse as any,
      );

      let authInfo;
      await act(async () => {
        authInfo = await result.current.getMcitSkillAuthorizeUrl('linear');
      });

      expect(authInfo).toEqual({
        authorizeUrl: 'https://auth.linear.app/authorize?code=abc123',
        code: 'abc123',
        expiresIn: 600,
      });
      expect(toolsClient.market.connectGetAuthorizeUrl.query).toHaveBeenCalledWith({
        provider: 'linear',
        redirectUri: undefined,
        scopes: undefined,
      });
    });

    it('should pass options to query', async () => {
      const { result } = renderHook(() => useToolStore());

      const mockResponse = {
        authorizeUrl: 'https://auth.linear.app/authorize',
        code: 'xyz789',
        expiresIn: 300,
      };
      vi.mocked(toolsClient.market.connectGetAuthorizeUrl.query).mockResolvedValue(
        mockResponse as any,
      );

      await act(async () => {
        await result.current.getMcitSkillAuthorizeUrl('linear', {
          scopes: ['read', 'write'],
          redirectUri: 'https://example.com/callback',
        });
      });

      expect(toolsClient.market.connectGetAuthorizeUrl.query).toHaveBeenCalledWith({
        provider: 'linear',
        scopes: ['read', 'write'],
        redirectUri: 'https://example.com/callback',
      });
    });
  });

  describe('internal_updateMcitSkillServer', () => {
    it('should update existing server', () => {
      const { result } = renderHook(() => useToolStore());

      act(() => {
        useToolStore.setState({
          mcitSkillServers: [
            {
              identifier: 'linear',
              name: 'Linear',
              isConnected: true,
              status: McitSkillStatus.CONNECTED,
            },
          ],
          mcitSkillLoadingIds: new Set(),
          mcitSkillExecutingToolIds: new Set(),
        });
      });

      act(() => {
        result.current.internal_updateMcitSkillServer('linear', {
          status: McitSkillStatus.ERROR,
          errorMessage: 'Token expired',
        });
      });

      expect((result.current.mcitSkillServers ?? [])[0]).toMatchObject({
        identifier: 'linear',
        status: McitSkillStatus.ERROR,
        errorMessage: 'Token expired',
      });
    });

    it('should do nothing when server not found', () => {
      const { result } = renderHook(() => useToolStore());

      act(() => {
        useToolStore.setState({
          mcitSkillServers: [],
          mcitSkillLoadingIds: new Set(),
          mcitSkillExecutingToolIds: new Set(),
        });
      });

      act(() => {
        result.current.internal_updateMcitSkillServer('non-existent', {
          status: McitSkillStatus.ERROR,
        });
      });

      expect(result.current.mcitSkillServers).toHaveLength(0);
    });
  });

  describe('refreshMcitSkillToken', () => {
    it('should refresh token successfully and update server', async () => {
      const { result } = renderHook(() => useToolStore());

      act(() => {
        useToolStore.setState({
          mcitSkillServers: [
            {
              identifier: 'linear',
              name: 'Linear',
              isConnected: true,
              status: McitSkillStatus.CONNECTED,
              tokenExpiresAt: '2024-01-01T00:00:00Z',
            },
          ],
          mcitSkillLoadingIds: new Set(),
          mcitSkillExecutingToolIds: new Set(),
        });
      });

      const mockResponse = {
        refreshed: true,
        connection: {
          tokenExpiresAt: '2024-12-31T00:00:00Z',
        },
      };
      vi.mocked(toolsClient.market.connectRefresh.mutate).mockResolvedValue(mockResponse as any);

      let refreshed;
      await act(async () => {
        refreshed = await result.current.refreshMcitSkillToken('linear');
      });

      expect(refreshed).toBe(true);
      expect((result.current.mcitSkillServers ?? [])[0].tokenExpiresAt).toBe(
        '2024-12-31T00:00:00Z',
      );
      expect((result.current.mcitSkillServers ?? [])[0].status).toBe(
        McitSkillStatus.CONNECTED,
      );
    });

    it('should return false when refresh fails', async () => {
      const { result } = renderHook(() => useToolStore());

      act(() => {
        useToolStore.setState({
          mcitSkillServers: [
            {
              identifier: 'linear',
              name: 'Linear',
              isConnected: true,
              status: McitSkillStatus.CONNECTED,
            },
          ],
          mcitSkillLoadingIds: new Set(),
          mcitSkillExecutingToolIds: new Set(),
        });
      });

      const mockResponse = {
        refreshed: false,
      };
      vi.mocked(toolsClient.market.connectRefresh.mutate).mockResolvedValue(mockResponse as any);

      let refreshed;
      await act(async () => {
        refreshed = await result.current.refreshMcitSkillToken('linear');
      });

      expect(refreshed).toBe(false);
    });

    it('should return false on error', async () => {
      const { result } = renderHook(() => useToolStore());

      act(() => {
        useToolStore.setState({
          mcitSkillServers: [],
          mcitSkillLoadingIds: new Set(),
          mcitSkillExecutingToolIds: new Set(),
        });
      });

      vi.mocked(toolsClient.market.connectRefresh.mutate).mockRejectedValue(
        new Error('Refresh failed'),
      );

      let refreshed;
      await act(async () => {
        refreshed = await result.current.refreshMcitSkillToken('linear');
      });

      expect(refreshed).toBe(false);
    });
  });

  describe('refreshMcitSkillTools', () => {
    it('should refresh tools for server', async () => {
      const { result } = renderHook(() => useToolStore());

      act(() => {
        useToolStore.setState({
          mcitSkillServers: [
            {
              identifier: 'linear',
              name: 'Linear',
              isConnected: true,
              status: McitSkillStatus.CONNECTED,
            },
          ],
          mcitSkillLoadingIds: new Set(),
          mcitSkillExecutingToolIds: new Set(),
        });
      });

      const mockTools = {
        tools: [
          { name: 'createIssue', description: 'Create an issue', inputSchema: { type: 'object' } },
          { name: 'listIssues', description: 'List issues', inputSchema: { type: 'object' } },
        ],
      };
      vi.mocked(toolsClient.market.connectListTools.query).mockResolvedValue(mockTools as any);

      await act(async () => {
        await result.current.refreshMcitSkillTools('linear');
      });

      expect((result.current.mcitSkillServers ?? [])[0].tools).toHaveLength(2);
      expect((result.current.mcitSkillServers ?? [])[0].tools![0].name).toBe('createIssue');
      expect((result.current.mcitSkillServers ?? [])[0].tools![1].name).toBe('listIssues');
    });

    it('should do nothing when server not found', async () => {
      vi.mocked(toolsClient.market.connectListTools.query).mockClear();

      const { result } = renderHook(() => useToolStore());

      act(() => {
        useToolStore.setState({
          mcitSkillServers: [],
          mcitSkillLoadingIds: new Set(),
          mcitSkillExecutingToolIds: new Set(),
        });
      });

      await act(async () => {
        await result.current.refreshMcitSkillTools('non-existent');
      });

      // The action still calls the API, but the state update does nothing
      // since server is not found
    });

    it('should handle error gracefully', async () => {
      const { result } = renderHook(() => useToolStore());

      act(() => {
        useToolStore.setState({
          mcitSkillServers: [
            {
              identifier: 'linear',
              name: 'Linear',
              isConnected: true,
              status: McitSkillStatus.CONNECTED,
            },
          ],
          mcitSkillLoadingIds: new Set(),
          mcitSkillExecutingToolIds: new Set(),
        });
      });

      vi.mocked(toolsClient.market.connectListTools.query).mockRejectedValue(
        new Error('Network error'),
      );

      await act(async () => {
        await result.current.refreshMcitSkillTools('linear');
      });

      // Should not crash and server should remain unchanged
      expect((result.current.mcitSkillServers ?? [])[0].tools).toBeUndefined();
    });
  });

  describe('revokeMcitSkill', () => {
    it('should revoke skill and remove server from state', async () => {
      const { result } = renderHook(() => useToolStore());

      act(() => {
        useToolStore.setState({
          mcitSkillServers: [
            {
              identifier: 'linear',
              name: 'Linear',
              isConnected: true,
              status: McitSkillStatus.CONNECTED,
            },
            {
              identifier: 'github',
              name: 'GitHub',
              isConnected: true,
              status: McitSkillStatus.CONNECTED,
            },
          ],
          mcitSkillLoadingIds: new Set(),
          mcitSkillExecutingToolIds: new Set(),
        });
      });

      vi.mocked(toolsClient.market.connectRevoke.mutate).mockResolvedValue({} as any);

      await act(async () => {
        await result.current.revokeMcitSkill('linear');
      });

      expect(result.current.mcitSkillServers).toHaveLength(1);
      expect((result.current.mcitSkillServers ?? [])[0].identifier).toBe('github');
      expect(toolsClient.market.connectRevoke.mutate).toHaveBeenCalledWith({
        provider: 'linear',
      });
    });

    it('should track loading state during revoke', async () => {
      const { result } = renderHook(() => useToolStore());

      act(() => {
        useToolStore.setState({
          mcitSkillServers: [
            {
              identifier: 'linear',
              name: 'Linear',
              isConnected: true,
              status: McitSkillStatus.CONNECTED,
            },
          ],
          mcitSkillLoadingIds: new Set(),
          mcitSkillExecutingToolIds: new Set(),
        });
      });

      let resolvePromise: (value: any) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      vi.mocked(toolsClient.market.connectRevoke.mutate).mockReturnValue(promise as any);

      const revokePromise = act(async () => {
        return result.current.revokeMcitSkill('linear');
      });

      // Should be loading during revoke
      await waitFor(() => {
        expect(result.current.mcitSkillLoadingIds.has('linear')).toBe(true);
      });

      // Resolve the promise
      resolvePromise!({});
      await revokePromise;

      // Should not be loading after completion
      expect(result.current.mcitSkillLoadingIds.has('linear')).toBe(false);
    });

    it('should handle error gracefully', async () => {
      const { result } = renderHook(() => useToolStore());

      act(() => {
        useToolStore.setState({
          mcitSkillServers: [
            {
              identifier: 'linear',
              name: 'Linear',
              isConnected: true,
              status: McitSkillStatus.CONNECTED,
            },
          ],
          mcitSkillLoadingIds: new Set(),
          mcitSkillExecutingToolIds: new Set(),
        });
      });

      vi.mocked(toolsClient.market.connectRevoke.mutate).mockRejectedValue(
        new Error('Revoke failed'),
      );

      await act(async () => {
        await result.current.revokeMcitSkill('linear');
      });

      // Server should still be in state after error
      expect(result.current.mcitSkillServers).toHaveLength(1);
      expect(result.current.mcitSkillLoadingIds.has('linear')).toBe(false);
    });
  });

  describe('useFetchMcitSkillConnections', () => {
    it('should not fetch when disabled', async () => {
      act(() => {
        useToolStore.setState({
          mcitSkillServers: [],
          mcitSkillLoadingIds: new Set(),
          mcitSkillExecutingToolIds: new Set(),
        });
      });

      vi.mocked(toolsClient.market.connectListConnections.query).mockClear();

      renderHook(() => useToolStore.getState().useFetchMcitSkillConnections(false), {
        wrapper: createSWRWrapper(),
      });

      await new Promise((resolve) => setTimeout(resolve, 20));

      expect(toolsClient.market.connectListConnections.query).not.toHaveBeenCalled();
    });

    it('should not fetch when user is not signed in', async () => {
      act(() => {
        useToolStore.setState({
          mcitSkillServers: [],
          mcitSkillLoadingIds: new Set(),
          mcitSkillExecutingToolIds: new Set(),
        });
        useUserStore.setState({ isSignedIn: false });
      });

      vi.mocked(toolsClient.market.connectListConnections.query).mockClear();

      renderHook(() => useToolStore.getState().useFetchMcitSkillConnections(true), {
        wrapper: createSWRWrapper(),
      });

      await new Promise((resolve) => setTimeout(resolve, 20));

      expect(toolsClient.market.connectListConnections.query).not.toHaveBeenCalled();
    });

    it('should sync the connections into the replica view when enabled', async () => {
      act(() => {
        useToolStore.setState({
          mcitSkillServers: [],
          mcitSkillLoadingIds: new Set(),
          mcitSkillExecutingToolIds: new Set(),
        });
        useUserStore.setState({ isSignedIn: true });
      });

      const mockConnections = {
        connections: [
          {
            providerId: 'linear',
            icon: 'linear-icon',
            providerUsername: 'testuser',
            scopes: ['read'],
            tokenExpiresAt: '2024-12-31T00:00:00Z',
          },
        ],
      };
      vi.mocked(toolsClient.market.connectListConnections.query).mockResolvedValue(
        mockConnections as any,
      );
      vi.mocked(toolsClient.market.connectListTools.query).mockResolvedValue({
        provider: 'linear',
        tools: [],
      });

      renderHook(() => useToolStore.getState().useFetchMcitSkillConnections(true), {
        wrapper: createSWRWrapper(),
      });

      await waitFor(() => {
        expect(toolsClient.market.connectListConnections.query).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(useToolStore.getState().mcitSkillServers).toHaveLength(1);
      });
      expect(useToolStore.getState().mcitSkillServers?.[0].identifier).toBe('linear');
      expect(useToolStore.getState().mcitSkillServers?.[0].name).toBe('Linear');
      expect(useToolStore.getState().mcitSkillServers?.[0].status).toBe(
        McitSkillStatus.CONNECTED,
      );
    });
  });

  describe('useFetchProviderTools', () => {
    it('should fetch, normalize and expose provider tools through the replica view', async () => {
      act(() => {
        useToolStore.setState({
          mcitSkillToolsMap: {},
          mcitSkillToolsReplica: createReplicaState(),
        });
      });

      vi.mocked(toolsClient.market.connectListTools.query).mockResolvedValue({
        provider: 'posthog',
        tools: [
          {
            description: 'Run a PostHog query',
            inputSchema: { properties: { query: { type: 'string' } }, type: 'object' },
            name: 'query',
          },
        ],
      } as any);

      const { result } = renderHook(
        () => useToolStore.getState().useFetchProviderTools('posthog'),
        { wrapper: createSWRWrapper() },
      );

      await waitFor(() => {
        expect(useToolStore.getState().mcitSkillToolsMap.posthog).toEqual([
          {
            description: 'Run a PostHog query',
            inputSchema: { properties: { query: { type: 'string' } }, type: 'object' },
            name: 'query',
          },
        ]);
      });

      expect(toolsClient.market.connectListTools.query).toHaveBeenCalledWith({
        provider: 'posthog',
      });
      expect(typeof result.current.revalidate).toBe('function');
    });

    it('should not fetch tools when provider is undefined', async () => {
      vi.mocked(toolsClient.market.connectListTools.query).mockClear();

      act(() => {
        useToolStore.setState({
          mcitSkillToolsMap: {},
          mcitSkillToolsReplica: createReplicaState(),
        });
      });

      renderHook(() => useToolStore.getState().useFetchProviderTools(undefined), {
        wrapper: createSWRWrapper(),
      });

      await new Promise((resolve) => setTimeout(resolve, 20));

      expect(toolsClient.market.connectListTools.query).not.toHaveBeenCalled();
      expect(useToolStore.getState().mcitSkillToolsMap).toEqual({});
    });
  });

  describe('connection list identity', () => {
    it('keeps one row when the same provider connects twice', async () => {
      const { result } = renderHook(() => useToolStore());

      act(() => {
        useToolStore.setState({
          mcitSkillServers: [],
          mcitSkillLoadingIds: new Set(),
          mcitSkillExecutingToolIds: new Set(),
        });
      });

      vi.mocked(toolsClient.market.connectGetStatus.query).mockResolvedValue({
        connected: true,
        icon: 'linear-icon',
      } as any);
      vi.mocked(toolsClient.market.connectListTools.query).mockResolvedValue({
        provider: 'linear',
        tools: [],
      });

      await act(async () => {
        await result.current.checkMcitSkillStatus('linear');
      });
      await act(async () => {
        await result.current.checkMcitSkillStatus('linear');
      });

      expect(result.current.mcitSkillServers).toHaveLength(1);
      expect(result.current.mcitSkillServers?.[0].identifier).toBe('linear');
    });
  });
});
