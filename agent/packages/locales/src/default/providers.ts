import { DEFAULT_MODEL_PROVIDER_LIST } from 'model-bank/modelProviders';
import McitProvider from 'model-bank/modelProviders/mcit';

const locales: Record<`${string}.description`, string> = {};

const providers = [McitProvider, ...DEFAULT_MODEL_PROVIDER_LIST];

providers.forEach((provider) => {
  if (!provider.description) return;
  locales[`${provider.id}.description`] = provider.description;
});

export default locales;
