import type { BuiltinIntervention } from '@tut/types';

import { WebOnboardingApiName } from '../../../types';
import PickAgentsIntervention from './PickAgents';

export const AgentMarketplaceInterventions: Record<string, BuiltinIntervention> = {
  [WebOnboardingApiName.showAgentMarketplace]: PickAgentsIntervention as BuiltinIntervention,
};
