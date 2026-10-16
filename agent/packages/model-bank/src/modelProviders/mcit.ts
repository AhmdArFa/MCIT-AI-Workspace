import { BRANDING_NAME } from '@tut/business-const';

import type { ModelProviderCard } from '../types';

/**
 * The branded first-party provider. Display metadata follows the business
 * branding slot: OSS/cloud keep the MCIT AI identity, while custom-branding
 * distributions (BRANDING_NAME override) get their own name and drop the
 * MCIT AI marketing copy/links automatically.
 */
const isCustomBranding = BRANDING_NAME !== 'MCIT AI';

const Mcit: ModelProviderCard = {
  chatModels: [],
  ...(isCustomBranding
    ? {}
    : {
        description:
          'MCIT AI uses official APIs to access AI models and measures usage with Credits tied to model tokens.',
        modelsUrl: 'https://mcit.gov.eg/zh/docs/usage/subscription/model-pricing',
      }),
  enabled: false,
  id: 'mcit',
  name: BRANDING_NAME,
  settings: {
    modelEditable: false,
    showAddNewModel: false,
    showModelFetcher: false,
  },
  showConfig: false,
  url: isCustomBranding ? '' : 'https://mcit.gov.eg',
};

export default Mcit;

export const planCardModels = [
  'deepseek-v4-pro',
  'claude-sonnet-4-6',
  'gemini-3.1-pro-preview',
  'gpt-5.5',
];
