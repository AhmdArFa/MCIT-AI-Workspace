import { AskUserQuestionInspector } from '@tut/builtin-tool-user-interaction/client';
import type { BuiltinInspector } from '@tut/types';

import { TutAgentApiName } from '../../types';
import { AnalyzeMediaInspector } from './AnalyzeMedia';
import { CallSubAgentInspector } from './CallSubAgent';
import { ClearTodosInspector } from './ClearTodos';
import { CreatePlanInspector } from './CreatePlan';
import { CreateTodosInspector } from './CreateTodos';
import { UpdatePlanInspector } from './UpdatePlan';
import { UpdateTodosInspector } from './UpdateTodos';
import { VentInspector } from './Vent';

/**
 * Tut Agent Inspector Components Registry
 *
 * Inspector components customize the title/header area
 * of tool calls in the conversation UI.
 */
export const TutAgentInspectors: Record<string, BuiltinInspector> = {
  [TutAgentApiName.analyzeMedia]: AnalyzeMediaInspector as BuiltinInspector,
  [TutAgentApiName.askUserQuestion]: AskUserQuestionInspector as BuiltinInspector,
  [TutAgentApiName.callSubAgent]: CallSubAgentInspector as BuiltinInspector,
  [TutAgentApiName.clearTodos]: ClearTodosInspector as BuiltinInspector,
  [TutAgentApiName.createPlan]: CreatePlanInspector as BuiltinInspector,
  [TutAgentApiName.createTodos]: CreateTodosInspector as BuiltinInspector,
  [TutAgentApiName.updatePlan]: UpdatePlanInspector as BuiltinInspector,
  [TutAgentApiName.updateTodos]: UpdateTodosInspector as BuiltinInspector,
  [TutAgentApiName.vent]: VentInspector as BuiltinInspector,
};
