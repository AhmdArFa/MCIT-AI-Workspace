import { TutAi21AI } from './providers/ai21';
import { Tut302AI } from './providers/ai302';
import { TutAi360AI } from './providers/ai360';
import { TutAiHubMixAI } from './providers/aihubmix';
import { TutAkashChatAI } from './providers/akashchat';
import { TutAntGroupAI } from './providers/antgroup';
import { TutAnthropicAI } from './providers/anthropic';
import { TutAzureAI } from './providers/azureai';
import { TutAzureOpenAI } from './providers/azureOpenai';
import { TutBaichuanAI } from './providers/baichuan';
import { TutBailianCodingPlanAI } from './providers/bailianCodingPlan';
import { TutBedrockAI } from './providers/bedrock';
import { TutBflAI } from './providers/bfl';
import { TutCerebrasAI } from './providers/cerebras';
import { TutChatGPTAI } from './providers/chatGPT';
import { TutCloudflareAI } from './providers/cloudflare';
import { TutCohereAI } from './providers/cohere';
import { TutCometAPIAI } from './providers/cometapi';
import { TutComfyUI } from './providers/comfyui';
import { TutDeepSeekAI } from './providers/deepseek';
import { TutFalAI } from './providers/fal';
import { TutFireworksAI } from './providers/fireworksai';
import { TutGiteeAI } from './providers/giteeai';
import { TutGithubAI } from './providers/github';
import { TutGithubCopilotAI } from './providers/githubCopilot';
import { TutGLMCodingPlanAI } from './providers/glmCodingPlan';
import { TutGoogleAI } from './providers/google';
import { TutGroq } from './providers/groq';
import { TutHigressAI } from './providers/higress';
import { TutHuggingFaceAI } from './providers/huggingface';
import { TutHunyuanAI } from './providers/hunyuan';
import { TutInfiniAI } from './providers/infiniai';
import { TutInternLMAI } from './providers/internlm';
import { TutJinaAI } from './providers/jina';
import { TutKimiCodingPlanAI } from './providers/kimiCodingPlan';
import { TutLMStudioAI } from './providers/lmstudio';
import { McitAI } from './providers/mcit';
import { TutLongCatAI } from './providers/longcat';
import { TutMetaAI } from './providers/meta';
import { TutMinimaxAI } from './providers/minimax';
import { TutMinimaxCodingPlanAI } from './providers/minimaxCodingPlan';
import { TutMistralAI } from './providers/mistral';
import { TutModelScopeAI } from './providers/modelscope';
import { TutMoonshotAI } from './providers/moonshot';
import { TutNebiusAI } from './providers/nebius';
import { TutNewAPIAI } from './providers/newapi';
import { TutNovitaAI } from './providers/novita';
import { TutNvidiaAI } from './providers/nvidia';
import { TutOllamaAI } from './providers/ollama';
import { TutOllamaCloudAI } from './providers/ollamacloud';
import { TutOpenAI } from './providers/openai';
import { TutOpenCodeCodingPlanAI } from './providers/opencodeCodingPlan';
import { TutOpenCodeZenAI } from './providers/opencodeZen';
import { TutOpenRouterAI } from './providers/openrouter';
import { TutPerplexityAI } from './providers/perplexity';
import { TutPPIOAI } from './providers/ppio';
import { TutQiniuAI } from './providers/qiniu';
import { TutQwenAI } from './providers/qwen';
import { TutReplicateAI } from './providers/replicate';
import { TutSambaNovaAI } from './providers/sambanova';
import { TutSearch1API } from './providers/search1api';
import { TutSenseNovaAI } from './providers/sensenova';
import { TutSiliconCloudAI } from './providers/siliconcloud';
import { TutSparkAI } from './providers/spark';
import { TutStepfunAI } from './providers/stepfun';
import { TutStraicoAI } from './providers/straico';
import { TutStreamLakeAI } from './providers/streamlake';
import { TutSuperGrokAI } from './providers/superGrok';
import { TutTaichuAI } from './providers/taichu';
import { TutTencentCloudAI } from './providers/tencentcloud';
import { TutTogetherAI } from './providers/togetherai';
import { TutUnslothAI } from './providers/unsloth';
import { TutUpstageAI } from './providers/upstage';
import { TutV0AI } from './providers/v0';
import { TutVercelAIGatewayAI } from './providers/vercelaigateway';
import { TutVLLMAI } from './providers/vllm';
import { TutVolcengineAI } from './providers/volcengine';
import { TutVolcengineCodingPlanAI } from './providers/volcengineCodingPlan';
import { TutWenxinAI } from './providers/wenxin';
import { TutXAI } from './providers/xai';
import { TutXiaomiMiMoAI } from './providers/xiaomimimo';
import { TutXinferenceAI } from './providers/xinference';
import { TutZenMuxAI } from './providers/zenmux';
import { TutZeroOneAI } from './providers/zeroone';
import { TutZhipuAI } from './providers/zhipu';

export const providerRuntimeMap = {
  ai21: TutAi21AI,
  ai302: Tut302AI,
  ai360: TutAi360AI,
  aihubmix: TutAiHubMixAI,
  akashchat: TutAkashChatAI,
  antgroup: TutAntGroupAI,
  anthropic: TutAnthropicAI,
  bailiancodingplan: TutBailianCodingPlanAI,
  azure: TutAzureOpenAI,
  azureai: TutAzureAI,
  baichuan: TutBaichuanAI,
  bedrock: TutBedrockAI,
  bfl: TutBflAI,
  cerebras: TutCerebrasAI,
  chatgpt: TutChatGPTAI,
  cloudflare: TutCloudflareAI,
  cohere: TutCohereAI,
  cometapi: TutCometAPIAI,
  comfyui: TutComfyUI,
  deepseek: TutDeepSeekAI,
  fal: TutFalAI,
  fireworksai: TutFireworksAI,
  giteeai: TutGiteeAI,
  github: TutGithubAI,
  githubcopilot: TutGithubCopilotAI,
  google: TutGoogleAI,
  glmcodingplan: TutGLMCodingPlanAI,
  groq: TutGroq,
  higress: TutHigressAI,
  huggingface: TutHuggingFaceAI,
  hunyuan: TutHunyuanAI,
  infiniai: TutInfiniAI,
  internlm: TutInternLMAI,
  jina: TutJinaAI,
  kimicodingplan: TutKimiCodingPlanAI,
  lmstudio: TutLMStudioAI,
  mcit: McitAI,
  longcat: TutLongCatAI,
  meta: TutMetaAI,
  minimax: TutMinimaxAI,
  minimaxcodingplan: TutMinimaxCodingPlanAI,
  mistral: TutMistralAI,
  modelscope: TutModelScopeAI,
  moonshot: TutMoonshotAI,
  nebius: TutNebiusAI,
  newapi: TutNewAPIAI,
  novita: TutNovitaAI,
  nvidia: TutNvidiaAI,
  ollama: TutOllamaAI,
  ollamacloud: TutOllamaCloudAI,
  opencodecodingplan: TutOpenCodeCodingPlanAI,
  opencodezen: TutOpenCodeZenAI,
  openai: TutOpenAI,
  openrouter: TutOpenRouterAI,
  perplexity: TutPerplexityAI,
  ppio: TutPPIOAI,
  qiniu: TutQiniuAI,
  qwen: TutQwenAI,
  replicate: TutReplicateAI,
  router: TutNewAPIAI,
  sambanova: TutSambaNovaAI,
  search1api: TutSearch1API,
  sensenova: TutSenseNovaAI,
  siliconcloud: TutSiliconCloudAI,
  spark: TutSparkAI,
  stepfun: TutStepfunAI,
  straico: TutStraicoAI,
  streamlake: TutStreamLakeAI,
  supergrok: TutSuperGrokAI,
  taichu: TutTaichuAI,
  tencentcloud: TutTencentCloudAI,
  togetherai: TutTogetherAI,
  unsloth: TutUnslothAI,
  upstage: TutUpstageAI,
  v0: TutV0AI,
  vercelaigateway: TutVercelAIGatewayAI,
  vllm: TutVLLMAI,
  volcengine: TutVolcengineAI,
  volcenginecodingplan: TutVolcengineCodingPlanAI,
  wenxin: TutWenxinAI,
  xai: TutXAI,
  xiaomimimo: TutXiaomiMiMoAI,
  xinference: TutXinferenceAI,
  zenmux: TutZenMuxAI,
  zeroone: TutZeroOneAI,
  zhipu: TutZhipuAI,
};
