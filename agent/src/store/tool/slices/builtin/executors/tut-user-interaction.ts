import { UserInteractionExecutionRuntime } from '@tut/builtin-tool-user-interaction/executionRuntime';
import { UserInteractionExecutor } from '@tut/builtin-tool-user-interaction/executor';

const runtime = new UserInteractionExecutionRuntime();

export const userInteractionExecutor = new UserInteractionExecutor(runtime);
