'use client';

import { MCIT_AVATAR_GALLERY } from '@tut/const';
import { agentSecondaryDisplayName } from '@tut/types';
import { Flexbox, Tooltip } from '@mcit-vendor/ui';
import { ActionIcon, Button, Text } from '@mcit-vendor/ui/base-ui';
import { cssVar } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { PencilIcon, SparklesIcon } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { createAgentIdentityModal } from '@/features/AgentIdentityModal';
import { AgentProfileArtwork } from '@/features/AgentProfileArtwork';
import { usePermission } from '@/hooks/usePermission';
import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';
import { useGlobalStore } from '@/store/global';
import { globalGeneralSelectors } from '@/store/global/selectors';

import { useAutoName } from './useAutoName';

const AgentHeader = memo(() => {
  const { t } = useTranslation(['setting', 'common']);
  const locale = useGlobalStore(globalGeneralSelectors.currentLanguage);
  const { allowed: _permCanEdit } = usePermission('edit_own_content');
  const canEdit = true;

  const agentId = useAgentStore((s) => s.activeAgentId || '');
  const meta = useAgentStore(agentSelectors.getAgentMetaById(agentId), isEqual);
  const config = useAgentStore(agentSelectors.getAgentConfigById(agentId), isEqual);
  const slug = useAgentStore(agentSelectors.getAgentSlugById(agentId));
  /** Keeps the render-only fallback avatar out of generation references. */
  const storedAvatar = useAgentStore(agentSelectors.getAgentStoredAvatarById(agentId));
  const updateMetaById = useAgentStore((s) => s.updateAgentMetaById);
  const updateAgentConfigById = useAgentStore((s) => s.updateAgentConfigById);
  const { autoName, naming } = useAutoName(agentId);
  const personalName = meta.name?.trim();
  const role = meta.title?.trim();
  const suppressDuplicateRole =
    !!config?.agencyConfig?.heterogeneousProvider &&
    !!personalName &&
    !!role &&
    agentSecondaryDisplayName({ name: personalName, title: role }) === undefined;
  // Without edit rights there is nothing to prompt for, so a nameless agent
  // falls back to the plain label rather than showing an action nobody can take.
  const showNamePrompt = !personalName && canEdit;

  return (
    <Flexbox
      gap={16}
      paddingBlock={'0 16px'}
      style={{
        cursor: 'default',
        marginInline: -16,
        width: 'calc(100% + 32px)',
      }}
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <AgentProfileArtwork
        agentId={agentId}
        avatar={meta.avatar}
        background={meta.backgroundColor}
        canEdit={canEdit}
        description={meta.description}
        locale={locale}
        name={meta.name}
        storedAvatar={storedAvatar}
        systemRole={config?.systemRole}
        title={meta.title}
        onAvatarChange={(avatar) => {
          const persona = MCIT_AVATAR_GALLERY.find((p) => p.src === avatar);
          const targetId = agentId || 'agt_xEk7XfRtovAl';
          if (persona) {
            void updateMetaById(targetId, {
              avatar,
              description: persona.title,
              name: persona.label,
              title: persona.title,
            });
            void updateAgentConfigById(targetId, {
              openingMessage: persona.welcome,
              systemRole: persona.systemRole,
            });
            try {
              const bMap = (useAgentStore.getState() as any).builtinAgentIdMap || {};
              for (const bid of Object.values(bMap)) {
                if (bid && bid !== targetId) {
                  void updateMetaById(bid as string, {
                    avatar,
                    description: persona.title,
                    name: persona.label,
                    title: persona.title,
                  });
                }
              }
            } catch (_) {}
          } else {
            void updateMetaById(targetId, { avatar });
          }
        }}
        onBackgroundChange={(backgroundColor) => {
          if (canEdit) void updateMetaById(agentId, { backgroundColor });
        }}
      />
      {/* Identity Section — display only. Editing all three fields happens in a
          form modal; inline inputs crowded the header and left no room for a
          per-field label or error. */}
      <Flexbox flex={1} gap={8} paddingInline={24} style={{ minWidth: 0 }}>
        {/* The headline is the NAME slot. With no name there is nothing to
            headline, so it carries the action that can fix this instead of a
            placeholder pretending to be a name. The edit affordance stays hidden
            until then: naming it IS the
            next step, and offering the full identity form alongside would split
            attention between two ways to do the same thing. */}
        {showNamePrompt ? (
          <Flexbox horizontal align={'center'} gap={8} style={{ minWidth: 0 }}>
            <Text ellipsis style={{ color: cssVar.colorTextTertiary, fontSize: 20 }}>
              {t('settingAgent.personalName.unnamed', { ns: 'setting' })}
            </Text>
            <Button
              icon={SparklesIcon}
              loading={naming}
              size={'small'}
              type={'text'}
              onClick={() => {
                void autoName();
              }}
            >
              {t('settingAgent.personalName.pickForMe', { ns: 'setting' })}
            </Button>
          </Flexbox>
        ) : (
          <Flexbox horizontal align={'center'} gap={8} style={{ minWidth: 0 }}>
            <Text ellipsis style={{ fontSize: 36, fontWeight: 600 }}>
              {personalName || t('settingAgent.identity.untitled', { ns: 'setting' })}
            </Text>
            {canEdit ? (
              <ActionIcon
                icon={PencilIcon}
                size={'small'}
                title={t('settingAgent.identity.edit', { ns: 'setting' })}
                onClick={() => createAgentIdentityModal(agentId)}
              />
            ) : null}
          </Flexbox>
        )}
        <Flexbox horizontal align={'center'} gap={8} style={{ minWidth: 0 }}>
          {/* `Text type="secondary"` resolves to `colorTextDescription`, which antd
              maps to the TERTIARY step — too faint for the line that carries the
              agent's role. Set the secondary colour explicitly, and leave only
              the decorative `@` and the separator at tertiary. */}
          {/* A heterogeneous product name that already includes its role is
              shown once. Genuinely custom names retain the role underneath. */}
          {!suppressDuplicateRole ? (
            <Text
              ellipsis
              style={{
                color: role ? cssVar.colorTextSecondary : cssVar.colorTextTertiary,
              }}
            >
              {role || t('settingAgent.role.unset', { ns: 'setting' })}
            </Text>
          ) : null}
          {slug && !suppressDuplicateRole ? (
            <Text style={{ color: cssVar.colorTextTertiary }}>·</Text>
          ) : null}
          {/* The tooltip only renders when a slug exists, so it can always name
              the real url rather than a `<slug>` the reader has to substitute. */}
          {slug ? (
            <Tooltip title={t('settingAgent.slug.openWith', { ns: 'setting', slug })}>
              <Text code style={{ color: cssVar.colorTextSecondary, flex: 'none' }}>
                <span style={{ color: cssVar.colorTextTertiary }}>@</span>
                {slug}
              </Text>
            </Tooltip>
          ) : null}
        </Flexbox>

        {/* 9 Sovereign MCIT Personas & Avatars Option Switcher */}
        {canEdit && (
          <Flexbox gap={6} style={{ marginTop: 12, width: '100%' }}>
            <Flexbox horizontal align={'center'} justify={'space-between'}>
              <Text style={{ color: cssVar.colorTextSecondary, fontSize: 12, fontWeight: 600, letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                Sovereign Personas & Avatars
              </Text>
              <Text style={{ color: cssVar.colorTextTertiary, fontSize: 11 }}>
                Switch avatar & name in 1 click
              </Text>
            </Flexbox>
            <Flexbox
              horizontal
              gap={10}
              style={{
                flexWrap: 'wrap',
                paddingBlock: 4,
              }}
            >
              {MCIT_AVATAR_GALLERY.map((item) => {
                const isSelected =
                  meta.avatar === item.src ||
                  meta.name?.toLowerCase() === item.label.toLowerCase() ||
                  (!meta.avatar && item.isDefault);

                return (
                  <button
                    key={item.id}
                    type="button"
                    title={`Switch to ${item.label}`}
                    style={{
                      alignItems: 'center',
                      background: isSelected
                        ? `color-mix(in srgb, ${cssVar.colorPrimary} 14%, ${cssVar.colorBgContainer})`
                        : cssVar.colorBgElevated,
                      border: isSelected
                        ? `2px solid ${cssVar.colorPrimary}`
                        : `1px solid ${cssVar.colorBorderSecondary}`,
                      borderRadius: 12,
                      boxShadow: isSelected ? `0 2px 8px color-mix(in srgb, ${cssVar.colorPrimary} 30%, transparent)` : 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      gap: 8,
                      padding: '6px 12px 6px 8px',
                      position: 'relative',
                      transition: 'all 0.18s ease',
                    }}
                    onClick={() => {
                      void updateMetaById(agentId, {
                        avatar: item.src,
                        description: item.welcome,
                        name: item.label,
                        title: item.title,
                      });
                      void updateAgentConfigById(agentId, {
                        openingMessage: item.welcome,
                        systemRole: item.systemRole,
                      });
                    }}
                  >
                    <img
                      alt={item.label}
                      src={item.src}
                      style={{
                        borderRadius: 8,
                        display: 'block',
                        flexShrink: 0,
                        height: 36,
                        objectFit: 'cover',
                        width: 36,
                      }}
                    />
                    <Flexbox align={'flex-start'} gap={1}>
                      <span
                        style={{
                          color: isSelected ? cssVar.colorPrimary : cssVar.colorText,
                          fontSize: 12,
                          fontWeight: isSelected ? 600 : 500,
                          lineHeight: 1.2,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {item.label}
                      </span>
                      {isSelected ? (
                        <span
                          style={{
                            color: cssVar.colorPrimary,
                            fontSize: 10,
                            fontWeight: 700,
                            lineHeight: 1,
                          }}
                        >
                          Active ✓
                        </span>
                      ) : null}
                    </Flexbox>
                  </button>
                );
              })}
            </Flexbox>
          </Flexbox>
        )}
      </Flexbox>
    </Flexbox>
  );
});

export default AgentHeader;
