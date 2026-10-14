'use client';

import { type McitSkillProviderType } from '@tut/const';
import { Center, DropdownMenu, Flexbox, Icon, Tooltip } from '@mcit-vendor/ui';
import { Avatar, Button, Button as TutButton, confirmModal } from '@mcit-vendor/ui/base-ui';
import { cssVar } from 'antd-style';
import { CircleCheck, MoreHorizontalIcon, SquareArrowOutUpRight, Unplug } from 'lucide-react';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import NavItem from '@/features/NavPanel/components/NavItem';
import { createMcitSkillDetailModal } from '@/features/SkillStore/SkillDetail';
import { usePermission } from '@/hooks/usePermission';
import { useToolStore } from '@/store/tool';
import { type McitSkillServer } from '@/store/tool/slices/mcitSkillStore/types';
import { McitSkillStatus } from '@/store/tool/slices/mcitSkillStore/types';

import { styles } from './style';

const POLL_INTERVAL_MS = 1000;
const POLL_TIMEOUT_MS = 15_000;

interface McitSkillItemProps {
  isSelected?: boolean;
  onDelete?: () => void;
  onSelect?: () => void;
  provider: McitSkillProviderType;
  server?: McitSkillServer;
}

const McitSkillItem = memo<McitSkillItemProps>(
  ({ provider, server, isSelected, onSelect, onDelete }) => {
    const { t } = useTranslation('setting');
    const { allowed: canCreate, reason: createReason } = usePermission('create_content');
    const { allowed: canEdit, reason: editReason } = usePermission('edit_own_content');
    const [isConnecting, setIsConnecting] = useState(false);
    const [isWaitingAuth, setIsWaitingAuth] = useState(false);

    const oauthWindowRef = useRef<Window | null>(null);
    const windowCheckIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const checkStatus = useToolStore((s) => s.checkMcitSkillStatus);
    const revokeConnect = useToolStore((s) => s.revokeMcitSkill);
    const getAuthorizeUrl = useToolStore((s) => s.getMcitSkillAuthorizeUrl);

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
      if (server?.status === McitSkillStatus.CONNECTED && isWaitingAuth) {
        cleanup();
      }
    }, [server?.status, isWaitingAuth, cleanup]);

    const startFallbackPolling = useCallback(() => {
      if (pollIntervalRef.current) return;

      pollIntervalRef.current = setInterval(async () => {
        try {
          await checkStatus(provider.id);
        } catch (error) {
          console.error('[McitSkill] Failed to check status:', error);
        }
      }, POLL_INTERVAL_MS);

      pollTimeoutRef.current = setTimeout(() => {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
        setIsWaitingAuth(false);
      }, POLL_TIMEOUT_MS);
    }, [checkStatus, provider.id]);

    const startWindowMonitor = useCallback(
      (oauthWindow: Window) => {
        windowCheckIntervalRef.current = setInterval(async () => {
          try {
            if (oauthWindow.closed) {
              if (windowCheckIntervalRef.current) {
                clearInterval(windowCheckIntervalRef.current);
                windowCheckIntervalRef.current = null;
              }
              oauthWindowRef.current = null;
              await checkStatus(provider.id);
              setIsWaitingAuth(false);
            }
          } catch {
            console.info(
              '[McitSkill] COOP blocked window.closed access, falling back to polling',
            );
            if (windowCheckIntervalRef.current) {
              clearInterval(windowCheckIntervalRef.current);
              windowCheckIntervalRef.current = null;
            }
            startFallbackPolling();
          }
        }, 500);
      },
      [checkStatus, provider.id, startFallbackPolling],
    );

    const openOAuthWindow = useCallback(
      (authorizeUrl: string) => {
        cleanup();
        setIsWaitingAuth(true);

        const oauthWindow = window.open(authorizeUrl, '_blank', 'width=600,height=700');
        if (oauthWindow) {
          oauthWindowRef.current = oauthWindow;
          startWindowMonitor(oauthWindow);
        } else {
          startFallbackPolling();
        }
      },
      [cleanup, startWindowMonitor, startFallbackPolling],
    );

    useEffect(() => {
      const handleMessage = async (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;

        if (
          event.data?.type === 'MCIT_SKILL_AUTH_SUCCESS' &&
          event.data?.provider === provider.id
        ) {
          cleanup();
          await checkStatus(provider.id);
        }
      };

      window.addEventListener('message', handleMessage);
      return () => window.removeEventListener('message', handleMessage);
    }, [provider.id, cleanup, checkStatus]);

    const handleConnect = async () => {
      if (!canCreate || !canEdit) return;
      if (server?.isConnected) return;

      setIsConnecting(true);
      try {
        // Skip redirectUri on desktop (app:// protocol) since the system browser can't navigate to it
        const redirectUri = window.location.protocol.startsWith('http')
          ? `${window.location.origin}/oauth/callback/success?provider=${encodeURIComponent(provider.id)}`
          : undefined;
        const { authorizeUrl } = await getAuthorizeUrl(provider.id, { redirectUri });
        openOAuthWindow(authorizeUrl);
      } catch (error) {
        console.error('[McitSkill] Failed to get authorize URL:', error);
      } finally {
        setIsConnecting(false);
      }
    };

    const handleDisconnect = () => {
      if (!canEdit) return;
      confirmModal({
        cancelText: t('cancel', { ns: 'common' }),
        content: t('tools.mcitSkill.disconnectConfirm.desc', { name: provider.label }),
        okButtonProps: { danger: true },
        okText: t('tools.mcitSkill.disconnect'),
        onOk: async () => {
          if (server) {
            await revokeConnect(server.identifier);
          } else if (isSelected) {
            onDelete?.();
          }
        },
        title: t('tools.mcitSkill.disconnectConfirm.title', { name: provider.label }),
      });
    };

    const renderIcon = () => {
      const { icon, label } = provider;
      if (typeof icon === 'string') {
        return <Avatar alt={label} avatar={icon} size={16} />;
      }
      return <Icon fill={cssVar.colorText} icon={icon} size={16} />;
    };

    const renderStatus = () => {
      if (!server) {
        return (
          <span className={styles.disconnected}>
            {t('tools.mcitSkill.disconnected', { defaultValue: 'Disconnected' })}
          </span>
        );
      }

      switch (server.status) {
        case McitSkillStatus.CONNECTED: {
          return (
            <span className={styles.connected}>
              {t('tools.mcitSkill.connected', { defaultValue: 'Connected' })}
            </span>
          );
        }
        case McitSkillStatus.ERROR: {
          return <span className={styles.error}>{t('tools.mcitSkill.error')}</span>;
        }
        default: {
          return (
            <span className={styles.disconnected}>
              {t('tools.mcitSkill.disconnected', { defaultValue: 'Disconnected' })}
            </span>
          );
        }
      }
    };

    const renderAction = () => {
      if (isConnecting || isWaitingAuth) {
        return (
          <Button disabled loading type="default">
            {t('tools.mcitSkill.connect')}
          </Button>
        );
      }

      if (!server || server.status !== McitSkillStatus.CONNECTED) {
        return (
          <Tooltip title={!canCreate ? createReason : editReason}>
            <Button
              disabled={!canCreate || !canEdit}
              icon={<Icon icon={SquareArrowOutUpRight} />}
              type="default"
              onClick={handleConnect}
            >
              {t('tools.mcitSkill.connect')}
            </Button>
          </Tooltip>
        );
      }

      return (
        <DropdownMenu
          placement="bottomRight"
          items={[
            {
              disabled: !canEdit,
              icon: <Icon icon={Unplug} />,
              key: 'disconnect',
              label: t('tools.mcitSkill.disconnect', { defaultValue: 'Disconnect' }),
              onClick: handleDisconnect,
            },
          ]}
        >
          <Tooltip title={editReason}>
            <TutButton disabled={!canEdit} icon={MoreHorizontalIcon} />
          </Tooltip>
        </DropdownMenu>
      );
    };

    const isConnected = server?.status === McitSkillStatus.CONNECTED;

    // Compact connect/status control for the left-list (NavItem) row. Mirrors the
    // ChatInput skills dropdown UX: connected → green check; otherwise a Connect
    // button that opens the OAuth flow inline, so users can tell what is connected
    // and aren't left staring at a blank detail panel wondering if it's a bug.
    const renderNavExtra = () => {
      if (isConnecting || isWaitingAuth) {
        return <Button disabled loading size="small" type="text" />;
      }
      if (isConnected) {
        return (
          <Tooltip title={t('tools.mcitSkill.connected', { defaultValue: 'Connected' })}>
            <Center width={20}>
              <Icon icon={CircleCheck} size={16} style={{ color: cssVar.colorSuccess }} />
            </Center>
          </Tooltip>
        );
      }
      return (
        <Tooltip title={!canCreate ? createReason : editReason}>
          <Button
            disabled={!canCreate || !canEdit}
            icon={<Icon icon={SquareArrowOutUpRight} />}
            size="small"
            type="text"
            onClick={handleConnect}
          >
            {t('tools.mcitSkill.connect')}
          </Button>
        </Tooltip>
      );
    };

    if (onSelect) {
      const renderNavIcon = () => {
        const { icon, label } = provider;
        if (typeof icon === 'string') return <Avatar alt={label} avatar={icon} size={18} />;
        return <Icon fill={cssVar.colorText} icon={icon} size={18} />;
      };
      return (
        <NavItem
          active={isSelected}
          extra={renderNavExtra()}
          icon={renderNavIcon}
          title={provider.label}
          titleColor={!isConnected ? cssVar.colorTextDescription : undefined}
          // Only connected connectors open the detail panel. When disconnected,
          // the row is inert and the only affordance is the inline Connect button —
          // otherwise clicking opens a blank detail panel that reads as a bug.
          onClick={isConnected ? onSelect : undefined}
        />
      );
    }

    return (
      <Flexbox
        horizontal
        align="center"
        className={styles.container}
        gap={8}
        justify="space-between"
        style={{
          ...(isSelected ? { background: 'var(--ant-color-primary-bg)', borderRadius: 6 } : {}),
          ...(onSelect ? { cursor: 'pointer' } : {}),
        }}
        onClick={onSelect}
      >
        <Flexbox horizontal align="center" gap={8} style={{ flex: 1, overflow: 'hidden' }}>
          <Flexbox
            horizontal
            align="center"
            gap={8}
            style={{ cursor: onSelect ? undefined : 'pointer' }}
            onClick={
              onSelect
                ? undefined
                : () => createMcitSkillDetailModal({ identifier: provider.id })
            }
          >
            <div className={`${styles.icon} ${!isConnected ? styles.disconnectedIcon : ''}`}>
              {renderIcon()}
            </div>
            <span className={`${styles.title} ${!isConnected ? styles.disconnectedTitle : ''}`}>
              {provider.label}
            </span>
          </Flexbox>
          {!isConnected && renderStatus()}
        </Flexbox>
        {!onSelect && (
          <Flexbox horizontal align="center" gap={8}>
            {isConnected && renderStatus()}
            {renderAction()}
          </Flexbox>
        )}
      </Flexbox>
    );
  },
);

McitSkillItem.displayName = 'McitSkillItem';

export default McitSkillItem;
