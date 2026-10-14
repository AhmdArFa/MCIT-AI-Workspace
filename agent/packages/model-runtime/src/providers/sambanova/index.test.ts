// @vitest-environment node
import { ModelProvider } from 'model-bank';

import { testProvider } from '../../providerTestUtils';
import { TutSambaNovaAI } from './index';

const provider = ModelProvider.SambaNova;
const defaultBaseURL = 'https://api.sambanova.ai/v1';

testProvider({
  Runtime: TutSambaNovaAI,
  provider,
  defaultBaseURL,
  chatDebugEnv: 'DEBUG_SAMBANOVA_CHAT_COMPLETION',
  chatModel: 'Meta-Llama-3.1-8B-Instruct',
  test: {
    skipAPICall: true,
  },
});
