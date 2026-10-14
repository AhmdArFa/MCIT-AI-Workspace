import type { BuiltinIntervention } from '@tut/types';

import { TaskApiName } from '../../types';
import CreateGoalIntervention from './CreateGoal';

export const TaskInterventions: Record<string, BuiltinIntervention> = {
  [TaskApiName.createGoal]: CreateGoalIntervention as BuiltinIntervention,
};
