import type { PartialDeep } from 'type-fest';

import { defineReplica } from '@/libs/replica';
import type { AgentItem, TutAgentConfig } from '@/types/agent';

export interface AgentConfigParams {
  agentId: string;
}

/**
 * One agent's config per entry, keyed by agent id. The fetch resolves `null`
 * when the agent is gone or no longer visible to the viewer.
 */
export const agentConfigResource = defineReplica<
  AgentConfigParams,
  PartialDeep<AgentItem>,
  TutAgentConfig | null
>({
  key: ({ agentId }) => agentId,
  name: 'agentConfig',
  version: 1,
});
