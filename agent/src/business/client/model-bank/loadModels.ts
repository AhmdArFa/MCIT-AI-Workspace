import type { BuiltinModelIdentifier } from 'model-bank';

export const loadDefaultHiddenBuiltinModels = async (): Promise<BuiltinModelIdentifier[]> => [];

export { loadModels } from '@tut/business-model-bank/model-config';
