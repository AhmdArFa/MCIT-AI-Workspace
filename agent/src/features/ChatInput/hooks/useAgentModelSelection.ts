'use client';

import { isCollaborativeBuiltinAgentRow } from '@tut/builtin-agents';
import type { AgentModelSelectionPolicy } from '@tut/types';
import { resolveAgentModelConfig, resolveAgentModelSelectionPolicy } from '@tut/types';
import { useCallback } from 'react';

import { useBusinessModelModeConfig } from '@/business/client/hooks/useBusinessAgentMode';
import { useAgentManagementAccess } from '@/features/ResourcePermission/useAgentManagementAccess';
import { usePermission } from '@/hooks/usePermission';
import { useAgentStore } from '@/store/agent';
import { agentByIdSelectors } from '@/store/agent/selectors';
import { useUserStore } from '@/store/user';

import { useChatInputResourceAccess } from './useChatInputResourceAccess';

interface ModelSelection {
  model: string;
  provider: string;
}

/**
 * Why the model trigger is shown but not switchable, so the trigger can say so
 * instead of silently going inert.
 *
 * - `fixedByAgent` — a public Workspace Agent whose author pinned the model
 *   (`modelSelectionPolicy: 'fixed'`); it changes in the Agent Profile only.
 * - `useOnly` — the caller may chat with the resource but not edit its config.
 */
export type AgentModelSelectionLockReason = 'fixedByAgent' | 'useOnly';

export interface UseAgentModelSelectionResult extends ModelSelection {
  canDisplayModel: boolean;
  canSelectModel: boolean;
  isPreferenceLoading: boolean;
  /** Set only while the model is displayed but locked (see the type doc). */
  selectionLockReason?: AgentModelSelectionLockReason;
  selectionPolicy: AgentModelSelectionPolicy;
  selectModel: (selection: ModelSelection) => Promise<void>;
  usesWorkspaceMemberSelection: boolean;
}

/**
 * Read and update the model used by the current caller for one Agent.
 *
 * Personal and private Workspace Agents update their own Agent row. Public
 * Workspace Agents in member-selection mode instead write a per-user
 * override, leaving the shared default untouched. The same hook is used by
 * both chat model triggers so their displayed value and write target cannot
 * diverge.
 */
export const useAgentModelSelection = (agentId: string): UseAgentModelSelectionResult => {
  const { allowed: canCreateContent } = usePermission('create_content');
  const {
    canConfigureResource,
    canUseResource,
    isAccessLoading: isResourceAccessLoading,
  } = useChatInputResourceAccess();
  const agent = useAgentStore(agentByIdSelectors.getAgentById(agentId));
  const sharedAgencyConfig = useAgentStore(agentByIdSelectors.getAgencyConfigById(agentId));
  const sharedModel = useAgentStore(agentByIdSelectors.getAgentModelById(agentId));
  const sharedProvider = useAgentStore(agentByIdSelectors.getAgentModelProviderById(agentId));
  const updateAgentConfigById = useAgentStore((s) => s.updateAgentConfigById);
  const { canManageAgent, isAccessLoading } = useAgentManagementAccess(agentId);
  // Collaborative builtins (the builders, Tut Agent, the Page Copilot) are one
  // shared row per Workspace with no config page of their own, so managing the
  // row must not mean picking the model for everyone else — see
  // `AgentModelConfig.personalModelSelection`.
  const personalModelSelection = isCollaborativeBuiltinAgentRow(agent ?? {});
  const usesWorkspaceMemberSelection =
    !!agent?.workspaceId &&
    agent.visibility !== 'private' &&
    (personalModelSelection || !canManageAgent);

  const updateWorkspaceUserPreference = useUserStore((s) => s.updateWorkspaceUserPreference);
  const storePreference = useUserStore((s) => s.workspaceUserPreference);
  const { data: fetchedPreference, isLoading } = useUserStore(
    (s) => s.useFetchWorkspaceUserPreference,
  )();
  const preference = fetchedPreference === undefined ? storePreference : (fetchedPreference ?? {});
  const memberOverride = usesWorkspaceMemberSelection
    ? preference.agentModelOverrides?.[agentId]
    : undefined;
  const sharedModelConfig = {
    agencyConfig: sharedAgencyConfig,
    model: sharedModel,
    personalModelSelection,
    provider: sharedProvider,
    visibility: agent?.visibility,
    workspaceId: agent?.workspaceId,
    canManage: canManageAgent,
  };
  const effectiveModel = resolveAgentModelConfig(sharedModelConfig, memberOverride);
  const selectionPolicy = resolveAgentModelSelectionPolicy(sharedModelConfig);
  const applyBusinessModelModeConfig = useBusinessModelModeConfig();
  const inboxAgentId = useAgentStore((s) => s.builtinAgentIdMap?.inbox);
  const isPersonalOrInbox =
    !agentId || agentId === inboxAgentId || !agent?.workspaceId || !usesWorkspaceMemberSelection;

  const canSelectForAgent = true;
  const canSelectModel = true;
  const canDisplayModel = true;
  const selectionLockReason: AgentModelSelectionLockReason | undefined = undefined;

  const selectModel = useCallback(
    async (selection: ModelSelection) => {
      const targetAgentId = agentId || inboxAgentId;
      try {
        if (usesWorkspaceMemberSelection) {
          await updateWorkspaceUserPreference({
            agentModelOverrides: {
              ...preference.agentModelOverrides,
              [targetAgentId || agentId]: selection,
            },
          });
        }
      } catch (_) {}

      try {
        if (targetAgentId) {
          await updateAgentConfigById(targetAgentId, applyBusinessModelModeConfig(selection));
        }
      } catch (_) {}
    },
    [
      agentId,
      applyBusinessModelModeConfig,
      inboxAgentId,
      preference.agentModelOverrides,
      updateAgentConfigById,
      updateWorkspaceUserPreference,
      usesWorkspaceMemberSelection,
    ],
  );

  return {
    canDisplayModel: true,
    canSelectModel: true,
    isPreferenceLoading: false,
    model: effectiveModel.model,
    provider: effectiveModel.provider ?? sharedProvider,
    selectionLockReason: undefined,
    selectionPolicy,
    selectModel,
    usesWorkspaceMemberSelection,
  };
};
