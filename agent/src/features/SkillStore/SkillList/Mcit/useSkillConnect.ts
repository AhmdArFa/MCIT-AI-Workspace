'use client';

import { COMPOSIO_APP_TYPES, getMcitSkillProviderById } from '@tut/const';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useToolStore } from '@/store/tool';
import { composioStoreSelectors, mcitSkillStoreSelectors } from '@/store/tool/selectors';
import { ComposioServerStatus } from '@/store/tool/slices/composioStore';
import { McitSkillStatus } from '@/store/tool/slices/mcitSkillStore/types';
import { useUserStore } from '@/store/user';
import { userProfileSelectors } from '@/store/user/selectors';

const POLL_INTERVAL_MS = 1000;
const POLL_TIMEOUT_MS = 15_000;

interface UseSkillConnectOptions {
  identifier: string;
  serverName?: string;
  type: 'composio' | 'mcit';
}

export const useSkillConnect = ({ identifier, serverName, type }: UseSkillConnectOptions) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isWaitingAuth, setIsWaitingAuth] = useState(false);

  const oauthWindowRef = useRef<Window | null>(null);
  const windowCheckIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // MCIT AI skill hooks
  const checkMcitStatus = useToolStore((s) => s.checkMcitSkillStatus);
  const revokeMcitConnect = useToolStore((s) => s.revokeMcitSkill);
  const getAuthorizeUrl = useToolStore((s) => s.getMcitSkillAuthorizeUrl);
  const mcitServer = useToolStore(mcitSkillStoreSelectors.getServerByIdentifier(identifier));

  // Composio hooks
  const userId = useUserStore(userProfileSelectors.userId);
  const createComposioConnection = useToolStore((s) => s.createComposioConnection);
  const refreshComposioConnectionStatus = useToolStore((s) => s.refreshComposioConnectionStatus);
  const removeComposioConnection = useToolStore((s) => s.removeComposioConnection);
  const composioServer = useToolStore(composioStoreSelectors.getServerByIdentifier(identifier));

  const cleanup = useCallback(() => {
    if (windowCheckIntervalRef.current) {
      clearInterval(windowCheckIntervalRef.current);
      windowCheckIntervalRef.current = null;
    }
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    if (pollTimeoutRef.current) {
      clearTimeout(pollTimeoutRef.current);
      pollTimeoutRef.current = null;
    }
    oauthWindowRef.current = null;
    setIsWaitingAuth(false);
  }, []);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  useEffect(() => {
    const connected =
      type === 'mcit'
        ? mcitServer?.status === McitSkillStatus.CONNECTED
        : composioServer?.status === ComposioServerStatus.ACTIVE;

    if (connected && isWaitingAuth) {
      cleanup();
    }
  }, [type, mcitServer?.status, composioServer?.status, isWaitingAuth, cleanup]);

  // Listen for OAuth success message from popup window (for MCIT AI skills)
  useEffect(() => {
    if (type !== 'mcit') return;

    const handleMessage = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      if (
        event.data?.type === 'MCIT_SKILL_AUTH_SUCCESS' &&
        event.data?.provider === identifier
      ) {
        cleanup();
        await checkMcitStatus(identifier);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [type, identifier, cleanup, checkMcitStatus]);

  const startFallbackPolling = useCallback(
    (serverIdOrName: string) => {
      if (pollIntervalRef.current) return;

      pollIntervalRef.current = setInterval(async () => {
        try {
          if (type === 'mcit') {
            await checkMcitStatus(serverIdOrName);
          } else {
            await refreshComposioConnectionStatus(serverIdOrName);
          }
        } catch (error) {
          console.error('[SkillStore] Failed to check status:', error);
        }
      }, POLL_INTERVAL_MS);

      pollTimeoutRef.current = setTimeout(() => {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
        setIsWaitingAuth(false);
      }, POLL_TIMEOUT_MS);
    },
    [type, checkMcitStatus, refreshComposioConnectionStatus],
  );

  const startWindowMonitor = useCallback(
    (oauthWindow: Window, serverIdOrName: string) => {
      windowCheckIntervalRef.current = setInterval(async () => {
        try {
          if (oauthWindow.closed) {
            if (windowCheckIntervalRef.current) {
              clearInterval(windowCheckIntervalRef.current);
              windowCheckIntervalRef.current = null;
            }
            oauthWindowRef.current = null;
            // Check status and then reset waiting state
            if (type === 'mcit') {
              await checkMcitStatus(serverIdOrName);
            } else {
              await refreshComposioConnectionStatus(serverIdOrName);
            }
            setIsWaitingAuth(false);
          }
        } catch {
          if (windowCheckIntervalRef.current) {
            clearInterval(windowCheckIntervalRef.current);
            windowCheckIntervalRef.current = null;
          }
          startFallbackPolling(serverIdOrName);
        }
      }, 500);
    },
    [type, checkMcitStatus, refreshComposioConnectionStatus, startFallbackPolling],
  );

  const openOAuthWindow = useCallback(
    (redirectUrl: string, serverIdOrName: string) => {
      cleanup();
      setIsWaitingAuth(true);

      const oauthWindow = window.open(redirectUrl, '_blank', 'width=600,height=700');
      if (oauthWindow) {
        oauthWindowRef.current = oauthWindow;
        startWindowMonitor(oauthWindow, serverIdOrName);
      } else {
        startFallbackPolling(serverIdOrName);
      }
    },
    [cleanup, startWindowMonitor, startFallbackPolling],
  );

  // Handle connect for MCIT AI
  const handleMcitConnect = useCallback(async () => {
    if (mcitServer?.isConnected) return;

    setIsConnecting(true);
    try {
      const provider = getMcitSkillProviderById(identifier);
      if (!provider) return;

      // Skip redirectUri on desktop (app:// protocol) since the system browser can't navigate to it
      const redirectUri = window.location.protocol.startsWith('http')
        ? `${window.location.origin}/oauth/callback/success?provider=${encodeURIComponent(identifier)}`
        : undefined;
      const { authorizeUrl } = await getAuthorizeUrl(identifier, { redirectUri });
      openOAuthWindow(authorizeUrl, identifier);
    } catch (error) {
      console.error('[SkillStore] Failed to get authorize URL:', error);
    } finally {
      setIsConnecting(false);
    }
  }, [identifier, mcitServer?.isConnected, getAuthorizeUrl, openOAuthWindow]);

  // Handle connect for Composio
  const handleComposioConnect = useCallback(async () => {
    if (!userId) return;
    if (composioServer) return;

    const appType = COMPOSIO_APP_TYPES.find((t) => t.identifier === identifier);

    setIsConnecting(true);
    try {
      const newServer = await createComposioConnection({
        appSlug: appType?.appSlug ?? serverName ?? identifier,
        identifier,
        label: appType?.label ?? identifier,
      });

      if (newServer) {
        if (newServer.status === ComposioServerStatus.ACTIVE) {
          await refreshComposioConnectionStatus(newServer.identifier);
        } else if (newServer.redirectUrl) {
          openOAuthWindow(newServer.redirectUrl, newServer.identifier);
        }
      }
    } catch (error) {
      console.error('[SkillStore] Failed to connect server:', error);
    } finally {
      setIsConnecting(false);
    }
  }, [
    userId,
    serverName,
    composioServer,
    identifier,
    createComposioConnection,
    refreshComposioConnectionStatus,
    openOAuthWindow,
  ]);

  const handleConnect = type === 'mcit' ? handleMcitConnect : handleComposioConnect;

  const handleDisconnect = useCallback(async () => {
    if (type === 'mcit' && mcitServer) {
      const provider = mcitServer.identifier;
      await revokeMcitConnect(provider);

      // The list is a replica view: `undefined` means "not loaded yet", which
      // reads the same as an empty list here (no row ⇒ not connected).
      const latestServer = (useToolStore.getState().mcitSkillServers ?? []).find(
        (server) => server.identifier === provider,
      );

      return latestServer?.status !== McitSkillStatus.CONNECTED;
    } else if (type === 'composio' && composioServer) {
      const serverIdentifier = composioServer.identifier;
      await removeComposioConnection(serverIdentifier);

      const latestServer = useToolStore
        .getState()
        .composioServers.find((server) => server.identifier === serverIdentifier);

      return latestServer?.status !== ComposioServerStatus.ACTIVE;
    }

    return true;
  }, [type, mcitServer, composioServer, revokeMcitConnect, removeComposioConnection]);

  const isConnected =
    type === 'mcit'
      ? mcitServer?.status === McitSkillStatus.CONNECTED
      : composioServer?.status === ComposioServerStatus.ACTIVE;

  return {
    handleConnect,
    handleDisconnect,
    isConnected,
    isConnecting: isConnecting || isWaitingAuth,
  };
};
