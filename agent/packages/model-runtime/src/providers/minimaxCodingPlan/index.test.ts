// @vitest-environment node
import { ModelProvider } from 'model-bank';

import { testProvider } from '../../providerTestUtils';
import { TutMinimaxCodingPlanAI } from './index';

const provider = ModelProvider.MinimaxCodingPlan;
const defaultBaseURL = 'https://api.minimaxi.com/v1';

testProvider({
  Runtime: TutMinimaxCodingPlanAI,
  provider,
  defaultBaseURL,
  chatDebugEnv: 'DEBUG_MINIMAX_CODING_PLAN_CHAT_COMPLETION',
  chatModel: 'MiniMax-M2.7',
  test: {
    skipAPICall: true,
  },
});
