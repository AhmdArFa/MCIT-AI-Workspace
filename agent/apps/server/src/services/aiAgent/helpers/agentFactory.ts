import type { Agent, GeneralAgentConfig } from '@tut/agent-runtime';
import { GeneralChatAgent, GraphAgent } from '@tut/agent-runtime';
import type { TutAgentChatConfig, TutAgentConfig } from '@tut/types';
import { AgentGraphSchema } from '@tut/types/agent/graph';
import debug from 'debug';

import type { AgentRuntimeServiceOptions } from '@/server/services/agentRuntime/AgentRuntimeService';

const log = debug('tut-server:ai-agent-service');

/**
 * Content written onto a tool row that the user stopped before it ran. Mirrors
 * the runtime's aborted-tool wording so a stopped call reads the same whether
 * it was settled here or by `resolve_aborted_tools`.
 */
export const STOPPED_TOOL_CONTENT = 'Tool execution was aborted by user.';

export const createGraphAwareAgentFactory =
  (
    upstreamFactory?: AgentRuntimeServiceOptions['agentFactory'],
  ): ((config: GeneralAgentConfig) => Agent) =>
  (config) => {
    if (upstreamFactory) {
      return upstreamFactory(config);
    }

    const runtimeAgentConfig = config.agentConfig as TutAgentConfig | undefined;
    // Graph Agent is an agency-level behavior: read from `agencyConfig`.
    // Legacy rows stored the graph on `chatConfig` — fall back so existing
    // agents keep running until their next write migrates them.
    const agencyConfig = runtimeAgentConfig?.agencyConfig;
    const legacyChatConfig = runtimeAgentConfig?.chatConfig as
      (TutAgentChatConfig & { enableGraphMode?: boolean; graph?: unknown }) | undefined;
    const graph = agencyConfig?.graph ?? legacyChatConfig?.graph;
    const graphEnabled =
      (agencyConfig?.enableGraphMode ?? legacyChatConfig?.enableGraphMode) === true;
    if (graphEnabled && graph) {
      const graphResult = AgentGraphSchema.safeParse(graph);

      if (graphResult.success) {
        return new GraphAgent({ ...config, graph: graphResult.data });
      }

      log('Invalid graph agent snapshot, falling back to default runtime: %O', graphResult.error);
    }

    return new GeneralChatAgent(config);
  };
