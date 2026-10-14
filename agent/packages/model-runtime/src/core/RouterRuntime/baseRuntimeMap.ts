import { TutAnthropicAI } from '../../providers/anthropic';
import { TutAzureAI } from '../../providers/azureai';
import { TutAzureOpenAI } from '../../providers/azureOpenai';
import { TutBedrockAI } from '../../providers/bedrock';
import { TutCloudflareAI } from '../../providers/cloudflare';
import { TutDeepSeekAI } from '../../providers/deepseek';
import { TutFalAI } from '../../providers/fal';
import { TutGoogleAI } from '../../providers/google';
import { TutMetaAI } from '../../providers/meta';
import { TutMinimaxAI } from '../../providers/minimax';
import { TutMoonshotAI } from '../../providers/moonshot';
import { TutOpenAI } from '../../providers/openai';
import { TutQwenAI } from '../../providers/qwen';
import { TutVertexAI } from '../../providers/vertexai';
import { TutVolcengineAI } from '../../providers/volcengine';
import { TutXAI } from '../../providers/xai';
import { TutXiaomiMiMoAI } from '../../providers/xiaomimimo';
import { TutZhipuAI } from '../../providers/zhipu';
import type { ApiType, RuntimeClass } from './apiTypes';

export const baseRuntimeMap = {
  anthropic: TutAnthropicAI,
  azure: TutAzureAI,
  azureopenai: TutAzureOpenAI,
  bedrock: TutBedrockAI,
  cloudflare: TutCloudflareAI,
  deepseek: TutDeepSeekAI,
  fal: TutFalAI,
  google: TutGoogleAI,
  meta: TutMetaAI,
  minimax: TutMinimaxAI,
  moonshot: TutMoonshotAI,
  openai: TutOpenAI,
  qwen: TutQwenAI,
  vertexai: TutVertexAI,
  volcengine: TutVolcengineAI,
  xai: TutXAI,
  xiaomimimo: TutXiaomiMiMoAI,
  zhipu: TutZhipuAI,
} satisfies Record<ApiType, RuntimeClass>;
