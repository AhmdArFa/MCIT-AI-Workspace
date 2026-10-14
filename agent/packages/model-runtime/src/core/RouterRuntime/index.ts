import type { TutRuntimeAI } from '../BaseAI';

export interface RuntimeItem {
  id: string;
  models?: string[] | (() => Promise<string[]>);
  runtime: TutRuntimeAI;
}

export type { CreateRouterRuntimeOptions, UniformRuntime } from './createRuntime';
export { createRouterRuntime } from './createRuntime';
export type { RouteAttemptFinished, RouteAttemptResult } from './routeAttempt';
