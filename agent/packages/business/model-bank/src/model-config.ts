import type { AiFullModelCard, AiModelType } from 'model-bank';
import { loadModels as loadModelBankModels, ModelProvider } from 'model-bank';

interface McitModelConfig {
  models: AiFullModelCard[];
  planCardModels: string[];
  updatedAt?: string;
  version: number;
}

export interface McitModelPricingContext {
  plan: string;
  scope: 'personal';
}

export interface McitModelPricingOptions {
  pricingContext?: McitModelPricingContext;
}

const getDefaultMcitModelConfig = (): McitModelConfig => ({
  models: [],
  planCardModels: [],
  version: 1,
});

const loadMcitModelConfig = async (): Promise<McitModelConfig> =>
  getDefaultMcitModelConfig();

export const loadModels = async (_options?: McitModelPricingOptions) =>
  loadModelBankModels({
    providerLoaders: {
      [ModelProvider.Mcit]: loadMcitModels,
    },
  });

const loadMcitModels = async (): Promise<AiFullModelCard[]> =>
  (await loadMcitModelConfig()).models;

export const loadMcitPlanCardModels = async (): Promise<string[]> =>
  (await loadMcitModelConfig()).planCardModels;

export const isMcitModelAvailable = (
  _id: string,
  _expectedType: AiModelType,
  _options?: {
    getUserEmail?: () => Promise<string | null | undefined>;
    userEmail?: string | null;
  },
): boolean => false;
