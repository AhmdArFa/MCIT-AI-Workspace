import type { BuiltinIntervention } from '@tut/types';

import { CredsApiName } from '../../types';
import RequestCredsInputIntervention from './RequestCredsInput';

export const CredsInterventions: Record<string, BuiltinIntervention> = {
  [CredsApiName.requestCredsInput]: RequestCredsInputIntervention as BuiltinIntervention,
};
