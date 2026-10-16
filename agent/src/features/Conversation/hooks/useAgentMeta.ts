import { resolveMcitPersona } from '@tut/const';
import { type MetaData } from '@tut/types';
import { useMemo } from 'react';

import { DEFAULT_AVATAR } from '@/const/meta';
import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';

import { contextSelectors, useConversationStore } from '../store';

const TUT_AI_TITLE = 'TuT Agent';

/**
 * Hook to get agent meta data for a specific agent or the current conversation.
 * Handles special cases for builtin agents (inbox, page agent, agent builder)
 * by resolving to the selected sovereign MCIT persona (Tut, Cleopatra, Thoth, etc.).
 *
 * @param messageAgentId - Optional agent ID from the message. If provided, uses this agent's meta.
 *                         Falls back to the current conversation's agent if not provided.
 */
export const useAgentMeta = (messageAgentId?: string | null): MetaData => {
  const contextAgentId = useConversationStore(contextSelectors.agentId);
  // Use message's agentId if provided, otherwise fallback to context agentId
  const agentId = messageAgentId || contextAgentId;
  const agentMeta = useAgentStore(agentSelectors.getAgentMetaById(agentId));
  const builtinAgentIdMap = useAgentStore((s) => s.builtinAgentIdMap);

  return useMemo(() => {
    // Check if the current agent is a builtin agent
    const builtinAgentIds = Object.values(builtinAgentIdMap);
    const isBuiltinAgent = builtinAgentIds.includes(agentId);
    const persona = resolveMcitPersona(agentMeta?.avatar || agentMeta?.name || agentMeta?.title);

    if (isBuiltinAgent) {
      const isDefaultOrTut =
        !agentMeta?.title ||
        agentMeta.title === TUT_AI_TITLE ||
        agentMeta.title === 'TuT Agent' ||
        agentMeta.title === 'Tut Agent' ||
        agentMeta.title === 'TuT' ||
        agentMeta.title === 'Tut' ||
        agentMeta.title.includes('TuT Agent') ||
        agentMeta.title.includes('Tut Agent');
      return {
        ...agentMeta,
        title: isDefaultOrTut ? persona.label : agentMeta.title,
        description: agentMeta?.description || persona.title,
        avatar: agentMeta?.avatar || persona.src || DEFAULT_AVATAR,
      };
    }

    return {
      ...agentMeta,
      avatar: agentMeta?.avatar || persona.src || DEFAULT_AVATAR,
    };
  }, [agentId, agentMeta, builtinAgentIdMap]);
};


/**
 * Hook to check if the current agent is a builtin agent
 */
export const useIsBuiltinAgent = (): boolean => {
  const agentId = useConversationStore(contextSelectors.agentId);
  const builtinAgentIdMap = useAgentStore((s) => s.builtinAgentIdMap);

  return useMemo(() => {
    const builtinAgentIds = Object.values(builtinAgentIdMap);
    return builtinAgentIds.includes(agentId);
  }, [agentId, builtinAgentIdMap]);
};
