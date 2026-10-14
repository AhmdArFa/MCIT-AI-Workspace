import type { BuiltinStreaming } from '@tut/types';

import { TutAgentApiName } from '../../types';
import { CallSubAgentStreaming } from './CallSubAgent';
import { CreatePlanStreaming } from './CreatePlan';

/**
 * Tut Agent Streaming Components Registry
 *
 * Streaming components render tool calls while they are still
 * executing, allowing real-time feedback to users.
 */
export const TutAgentStreamings: Record<string, BuiltinStreaming> = {
  [TutAgentApiName.callSubAgent]: CallSubAgentStreaming as BuiltinStreaming,
  [TutAgentApiName.createPlan]: CreatePlanStreaming as BuiltinStreaming,
};

export { CallSubAgentStreaming } from './CallSubAgent';
export { CreatePlanStreaming } from './CreatePlan';
