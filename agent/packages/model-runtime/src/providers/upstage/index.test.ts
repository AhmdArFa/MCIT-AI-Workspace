// @vitest-environment node
import { testProvider } from '../../providerTestUtils';
import { TutUpstageAI } from './index';

testProvider({
  Runtime: TutUpstageAI,
  provider: 'upstage',
  defaultBaseURL: 'https://api.upstage.ai/v1/solar',
  chatDebugEnv: 'DEBUG_UPSTAGE_CHAT_COMPLETION',
  chatModel: 'solar-pro',
});
