import { agentBuilderExecutor } from '@tut/builtin-tool-agent-builder/executor';
import { agentManagementExecutor } from '@tut/builtin-tool-agent-management/executor';
import { auvExecutor } from '@tut/builtin-tool-auv/client/executor';
import { browserExecutor } from '@tut/builtin-tool-browser/client/executor';
import { calculatorExecutor } from '@tut/builtin-tool-calculator/executor';
import { cloudSandboxExecutor } from '@tut/builtin-tool-cloud-sandbox/executor';
import { credsExecutor } from '@tut/builtin-tool-creds/executor';
import { dashboardExecutor } from '@tut/builtin-tool-dashboard/client/executor';
import { goalExecutor } from '@tut/builtin-tool-goal/client/executor';
import { groupAgentBuilderExecutor } from '@tut/builtin-tool-group-agent-builder/executor';
import { groupManagementExecutor } from '@tut/builtin-tool-group-management/executor';
import { imageGenerationExecutor } from '@tut/builtin-tool-image-generation/executor';
import { knowledgeBaseExecutor } from '@tut/builtin-tool-knowledge-base/client/executor';
import { tutAgentExecutor } from '@tut/builtin-tool-tut-agent/client/executor';
import { memoryExecutor } from '@tut/builtin-tool-memory/executor';
import { taskExecutor } from '@tut/builtin-tool-task/client/executor';
import { videoGenerationExecutor } from '@tut/builtin-tool-video-generation/executor';

import type { IBuiltinToolExecutor } from '../types';
import {
  ampExecutor,
  claudeCodeExecutor,
  codeBuddyExecutor,
  codexExecutor,
  cursorExecutor,
  devinExecutor,
  droidExecutor,
  grokBuildExecutor,
  kimiCodeExecutor,
  openCodeExecutor,
  piExecutor,
  qoderExecutor,
  traeExecutor,
} from './heteroCli';
import { activatorExecutor } from './tut-activator';
import { agentDocumentsExecutor } from './tut-agent-documents';
import { attachmentsExecutor } from './tut-attachments';
import { messageExecutor } from './tut-message';
import { notebookExecutor } from './tut-notebook';
import { pageAgentExecutor } from './tut-page-agent';
import { skillStoreExecutor } from './tut-skill-store';
import { skillsExecutor } from './tut-skills';
import { userInteractionExecutor } from './tut-user-interaction';
import { webBrowsing } from './tut-web-browsing';
import { webOnboardingExecutor } from './tut-web-onboarding';
import { localSystemExecutorWithGitEffects } from './localSystem';

export const builtinToolExecutors = [
  // Hook-only executors for heterogeneous CLI agents —
  // observe their shell tool results via `onAfterCall` (never invoked).
  ampExecutor,
  claudeCodeExecutor,
  codeBuddyExecutor,
  codexExecutor,
  cursorExecutor,
  droidExecutor,
  devinExecutor,
  grokBuildExecutor,
  kimiCodeExecutor,
  openCodeExecutor,
  piExecutor,
  qoderExecutor,
  traeExecutor,
  agentBuilderExecutor,
  agentDocumentsExecutor,
  agentManagementExecutor,
  attachmentsExecutor,
  auvExecutor,
  calculatorExecutor,
  cloudSandboxExecutor,
  credsExecutor,
  groupAgentBuilderExecutor,
  groupManagementExecutor,
  goalExecutor,
  imageGenerationExecutor,
  knowledgeBaseExecutor,
  browserExecutor,
  localSystemExecutorWithGitEffects,
  memoryExecutor,
  messageExecutor,
  notebookExecutor,
  pageAgentExecutor,
  skillStoreExecutor,
  skillsExecutor,
  taskExecutor,
  dashboardExecutor,
  videoGenerationExecutor,
  activatorExecutor,
  userInteractionExecutor,
  tutAgentExecutor,
  webOnboardingExecutor,
  webBrowsing,
] satisfies IBuiltinToolExecutor[];
