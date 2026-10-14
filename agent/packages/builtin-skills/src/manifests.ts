import type { BuiltinSkillManifest } from '@tut/types';

import { AgentBrowserManifest } from './agent-browser/manifest';
import { ArtifactsManifest } from './artifacts/manifest';
import { McitManifest } from './mcit/manifest';
import { TaskManifest } from './task/manifest';

export { AgentBrowserIdentifier } from './agent-browser/manifest';
export { ArtifactsIdentifier } from './artifacts/manifest';
export { McitIdentifier } from './mcit/manifest';
export { TaskIdentifier } from './task/manifest';

export const builtinSkillManifests: BuiltinSkillManifest[] = [
  AgentBrowserManifest,
  ArtifactsManifest,
  McitManifest,
  TaskManifest,
];
