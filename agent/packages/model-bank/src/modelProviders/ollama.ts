import { ollamaChatModels } from '../aiModels/ollama';
import type { ModelProviderCard } from '../types';

const Ollama: ModelProviderCard = {
  chatModels: ollamaChatModels,
  checkModel: 'gemma4:e4b',
  defaultShowBrowserRequest: true,
  description:
    'Ollama offers models across code generation, math, multilingual processing, and chat, supporting both enterprise and local deployments.',
  enabled: true,
  id: 'ollama',
  modelList: { showModelFetcher: true },
  modelsUrl: 'https://ollama.com/library',
  name: 'Ollama',
  settings: {
    defaultShowBrowserRequest: true,
    sdkType: 'ollama',
    showApiKey: false,
    showModelFetcher: true,
  },
  showApiKey: false,
  url: 'https://ollama.com',
};

export default Ollama;

