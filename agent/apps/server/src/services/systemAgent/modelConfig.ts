import { DEFAULT_SYSTEM_AGENT_CONFIG } from '@tut/const';
import type { SystemAgentItem, UserSystemAgentConfigKey } from '@tut/types';

interface ResolveSystemAgentModelConfigParams {
  override?: Partial<Pick<SystemAgentItem, 'model' | 'provider'>>;
  taskConfig?: Partial<SystemAgentItem>;
  taskKey: UserSystemAgentConfigKey;
}

export const resolveSystemAgentModelConfig = async ({
  override,
  taskConfig,
  taskKey,
}: ResolveSystemAgentModelConfigParams): Promise<{ model: string; provider: string }> => {
  const defaults = DEFAULT_SYSTEM_AGENT_CONFIG[taskKey];
  const model = override?.model || taskConfig?.model || defaults.model;
  const provider = override?.provider || taskConfig?.provider || defaults.provider;

  return { model, provider };
};
