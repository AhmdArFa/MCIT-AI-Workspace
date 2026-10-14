import type { BuiltinInspector } from '@tut/types';

import { SelfFeedbackIntentApiName } from '../../types';
import { DeclareSelfFeedbackIntentInspector } from './DeclareSelfFeedbackIntent';

export const SelfFeedbackIntentInspectors: Record<string, BuiltinInspector> = {
  [SelfFeedbackIntentApiName.declareSelfFeedbackIntent]:
    DeclareSelfFeedbackIntentInspector as BuiltinInspector,
};

export { DeclareSelfFeedbackIntentInspector } from './DeclareSelfFeedbackIntent';
