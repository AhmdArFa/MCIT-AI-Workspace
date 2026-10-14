import { type BuiltinSkill } from '@tut/types';

import { systemPrompt } from './content';
import { AgentBrowserIdentifier, AgentBrowserManifest } from './manifest';

export { AgentBrowserIdentifier };

export const AgentBrowserSkill: BuiltinSkill = {
  ...AgentBrowserManifest,
  content: systemPrompt,
};
