import { TUT_DEFAULT_MODEL_LIST } from 'model-bank';

import { tutHubOnlineModelDescriptions } from '../mcitOnlineModelDescriptions';
import { modelDescriptionOverrides } from '../modelDescriptionOverrides';

const locales: Record<`${string}.description`, string> = {};

TUT_DEFAULT_MODEL_LIST.forEach((model) => {
  if (!model.description) return;

  locales[`${model.id}.description`] = model.description;
});

Object.assign(locales, modelDescriptionOverrides);
Object.assign(locales, tutHubOnlineModelDescriptions);

export default locales;
