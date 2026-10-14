'use client';

import { resolveConnectorCatalogItem } from '@tut/const';
import type { BuiltinInterventionProps } from '@tut/types';
import { Flexbox } from '@mcit-vendor/ui';
import { Avatar } from '@mcit-vendor/ui/base-ui';
import { CheckCircle } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { serverConfigSelectors, useServerConfigStore } from '@/store/serverConfig';
import { useToolStore } from '@/store/tool';
import {
  composioStoreSelectors,
  mcitSkillStoreSelectors,
  mcpStoreSelectors,
  pluginSelectors,
} from '@/store/tool/selectors';
import { ComposioServerStatus } from '@/store/tool/slices/composioStore/types';
import { McitSkillStatus } from '@/store/tool/slices/mcitSkillStore/types';

import type { InstallPluginParams } from '../../types';

/**
 * InstallPlugin Intervention Component
 *
 * This component only renders the UI for user confirmation.
 * The actual OAuth flow and installation logic is handled in ExecutionRuntime.installPlugin()
 * which runs after the user approves the intervention.
 */
const InstallPluginIntervention = memo<BuiltinInterventionProps<InstallPluginParams>>(
  ({ args }) => {
    const { identifier, source } = args;
    const { t } = useTranslation('chat');
    const isComposioEnabled = useServerConfigStore(serverConfigSelectors.enableComposio);
    const isMcitSkillEnabled = useServerConfigStore(serverConfigSelectors.enableMcitSkill);

    // Tool store selectors
    const isPluginInstalled = useToolStore((s) => pluginSelectors.isPluginInstalled(identifier)(s));

    // Get Composio server state
    const composioServer = useToolStore((s) =>
      composioStoreSelectors.getServers(s).find((srv) => srv.identifier === identifier),
    );

    // Get McitSkill server state
    const mcitSkillServer = useToolStore((s) =>
      mcitSkillStoreSelectors.getServers(s).find((srv) => srv.identifier === identifier),
    );

    // Get Market MCP plugin info
    const marketPlugin = useToolStore((s) => mcpStoreSelectors.getPluginById(identifier)(s));

    // Get Builtin tool info
    const builtinTool = useToolStore((s) =>
      s.builtinTools.find((tool) => tool.identifier === identifier),
    );

    const connector = resolveConnectorCatalogItem(identifier, {
      composio: isComposioEnabled,
      mcit: isMcitSkillEnabled,
    });
    const composioAppInfo = connector?.type === 'composio' ? connector.serverType : undefined;
    const isComposio = source === 'official' && !!composioAppInfo;

    const mcitSkillProviderInfo = connector?.type === 'mcit' ? connector.provider : undefined;
    const isMcitSkill = source === 'official' && !!mcitSkillProviderInfo;

    // Render success state (already installed)
    if (isPluginInstalled) {
      return (
        <Flexbox
          horizontal
          align="center"
          gap={12}
          style={{
            background: 'var(--tut-fill-tertiary)',
            borderRadius: 8,
            padding: 16,
          }}
        >
          <CheckCircle size={20} style={{ color: 'var(--tut-success-6)' }} />
          <Flexbox gap={4}>
            <span style={{ fontWeight: 600 }}>
              {isComposio || isMcitSkill
                ? t('agentBuilder.installPlugin.connectedAndEnabled')
                : t('agentBuilder.installPlugin.installedAndEnabled')}
            </span>
            <span style={{ color: 'var(--tut-text-secondary)', fontSize: 12 }}>
              {composioAppInfo?.label || mcitSkillProviderInfo?.label || identifier}
            </span>
          </Flexbox>
        </Flexbox>
      );
    }

    // Render Composio tool
    if (isComposio) {
      const icon = typeof composioAppInfo?.icon === 'string' ? composioAppInfo.icon : undefined;
      const isPendingAuth = composioServer?.status === ComposioServerStatus.PENDING_AUTH;

      return (
        <Flexbox
          gap={12}
          style={{ background: 'var(--tut-fill-tertiary)', borderRadius: 8, padding: 16 }}
        >
          <Flexbox horizontal align="center" gap={12}>
            {icon ? (
              <img
                alt={composioAppInfo?.label || identifier}
                height={40}
                src={icon}
                style={{ borderRadius: 8 }}
                width={40}
              />
            ) : (
              <Avatar avatar="☁️" size={40} style={{ borderRadius: 8 }} />
            )}
            <Flexbox flex={1} gap={4}>
              <Flexbox horizontal align="center" gap={8}>
                <span style={{ fontWeight: 600 }}>{composioAppInfo?.label || identifier}</span>
                <span style={{ color: 'var(--tut-text-tertiary)', fontSize: 12 }}>Composio</span>
              </Flexbox>
              <span style={{ color: 'var(--tut-text-secondary)', fontSize: 12 }}>
                {isPendingAuth
                  ? t('agentBuilder.installPlugin.requiresAuth')
                  : t('agentBuilder.installPlugin.clickApproveToConnect')}
              </span>
            </Flexbox>
          </Flexbox>
        </Flexbox>
      );
    }

    // Render McitSkill provider
    if (isMcitSkill) {
      const icon =
        typeof mcitSkillProviderInfo?.icon === 'string'
          ? mcitSkillProviderInfo.icon
          : undefined;
      const isNotConnected =
        !mcitSkillServer || mcitSkillServer.status !== McitSkillStatus.CONNECTED;

      return (
        <Flexbox
          gap={12}
          style={{ background: 'var(--tut-fill-tertiary)', borderRadius: 8, padding: 16 }}
        >
          <Flexbox horizontal align="center" gap={12}>
            {icon ? (
              <img
                alt={mcitSkillProviderInfo?.label || identifier}
                height={40}
                src={icon}
                style={{ borderRadius: 8 }}
                width={40}
              />
            ) : (
              <Avatar avatar="🔗" size={40} style={{ borderRadius: 8 }} />
            )}
            <Flexbox flex={1} gap={4}>
              <Flexbox horizontal align="center" gap={8}>
                <span style={{ fontWeight: 600 }}>
                  {mcitSkillProviderInfo?.label || identifier}
                </span>
                <span style={{ color: 'var(--tut-text-tertiary)', fontSize: 12 }}>
                  Mcit Skill
                </span>
              </Flexbox>
              <span style={{ color: 'var(--tut-text-secondary)', fontSize: 12 }}>
                {isNotConnected
                  ? t('agentBuilder.installPlugin.requiresAuth')
                  : t('agentBuilder.installPlugin.clickApproveToConnect')}
              </span>
            </Flexbox>
          </Flexbox>
        </Flexbox>
      );
    }

    // Render MCP marketplace plugin or Builtin tool
    // Note: The actual installation happens in ExecutionRuntime after user approves
    const pluginName = marketPlugin?.name || builtinTool?.manifest?.meta?.title || identifier;
    const pluginIcon = marketPlugin?.icon || builtinTool?.manifest?.meta?.avatar;
    const pluginType = source === 'market' ? 'MCP Plugin' : 'Builtin Tool';

    return (
      <Flexbox
        gap={12}
        style={{ background: 'var(--tut-fill-tertiary)', borderRadius: 8, padding: 16 }}
      >
        <Flexbox horizontal align="center" gap={12}>
          {pluginIcon && typeof pluginIcon === 'string' && pluginIcon.startsWith('http') ? (
            <img
              alt={pluginName}
              height={40}
              src={pluginIcon}
              style={{ borderRadius: 8 }}
              width={40}
            />
          ) : (
            <Avatar avatar={pluginIcon || '🔧'} size={40} style={{ borderRadius: 8 }} />
          )}
          <Flexbox flex={1} gap={4}>
            <Flexbox horizontal align="center" gap={8}>
              <span style={{ fontWeight: 600 }}>{pluginName}</span>
              <span style={{ color: 'var(--tut-text-tertiary)', fontSize: 12 }}>{pluginType}</span>
            </Flexbox>
            <span style={{ color: 'var(--tut-text-secondary)', fontSize: 12 }}>
              {t('agentBuilder.installPlugin.clickApproveToInstall')}
            </span>
          </Flexbox>
        </Flexbox>
      </Flexbox>
    );
  },
);

export default InstallPluginIntervention;
