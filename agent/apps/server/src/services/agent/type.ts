import { type TutAgentConfig } from '@/types/agent';

export interface UpdateAgentResult {
  agent?: TutAgentConfig;
  success: boolean;
}
