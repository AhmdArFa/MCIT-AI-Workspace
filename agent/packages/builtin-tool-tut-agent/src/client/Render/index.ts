import { AskUserQuestionRender } from '@tut/builtin-tool-user-interaction/client';

import { TutAgentApiName } from '../../types';
import CallSubAgentRender from './CallSubAgent';
import CreatePlan from './CreatePlan';
import TodoListRender from './TodoList';

/**
 * Tut Agent Tool Render Components Registry
 *
 * Sub-agent dispatch operations render a card showing the dispatched
 * task(s). Plan operations render the PlanCard UI. Todo operations
 * share a single TodoList render.
 */
export const TutAgentRenders = {
  [TutAgentApiName.askUserQuestion]: AskUserQuestionRender,
  [TutAgentApiName.callSubAgent]: CallSubAgentRender,

  // Plan operations render the PlanCard UI
  [TutAgentApiName.createPlan]: CreatePlan,
  [TutAgentApiName.updatePlan]: CreatePlan,

  // All todo operations render the same TodoList UI
  [TutAgentApiName.clearTodos]: TodoListRender,
  [TutAgentApiName.createTodos]: TodoListRender,
  [TutAgentApiName.updateTodos]: TodoListRender,
};

export { default as CallSubAgentRender } from './CallSubAgent';
export { default as CreatePlan, PlanCard } from './CreatePlan';
export type { TodoListRenderState } from './TodoList';
export { default as TodoListRender, TodoListUI } from './TodoList';
