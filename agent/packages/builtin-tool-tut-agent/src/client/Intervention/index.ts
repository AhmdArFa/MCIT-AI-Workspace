import { AskUserQuestionIntervention } from '@tut/builtin-tool-user-interaction/client';
import type { BuiltinIntervention } from '@tut/types';

import { TutAgentApiName } from '../../types';
import AddTodoIntervention from './AddTodo';
import ClearTodosIntervention from './ClearTodos';
import CreatePlanIntervention from './CreatePlan';

/**
 * Tut Agent Intervention Components Registry
 *
 * Intervention components allow users to review and modify tool parameters
 * before the tool is executed.
 *
 * `askUserQuestion` reuses the standalone user-interaction card: it renders as
 * an inline custom form (not the default approve/reject) — see
 * `isCustomInteractionIdentifier` in customInteractionHandlers.
 */
export const TutAgentInterventions: Record<string, BuiltinIntervention> = {
  [TutAgentApiName.askUserQuestion]: AskUserQuestionIntervention as BuiltinIntervention,
  [TutAgentApiName.clearTodos]: ClearTodosIntervention as BuiltinIntervention,
  [TutAgentApiName.createPlan]: CreatePlanIntervention as BuiltinIntervention,
  [TutAgentApiName.createTodos]: AddTodoIntervention as BuiltinIntervention,
};

export { default as AddTodoIntervention } from './AddTodo';
export { default as ClearTodosIntervention } from './ClearTodos';
export { default as CreatePlanIntervention } from './CreatePlan';
