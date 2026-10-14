import type { BuiltinManifestResolver } from '@tut/types';

import { TutAgentManifest } from './manifest';
import { systemPromptWithoutSubAgent } from './systemRole';
import { TutAgentApiName } from './types';

/**
 * Context-aware manifest for the tut-agent tool.
 *
 * `tut-agent` bundles plan / todo / media-analysis APIs together with the
 * `callSubAgent` dispatch. The dispatch must be hidden in two contexts:
 *
 * - **Inside a group** (`scope` is `group` / `group_agent`): coordination already
 *   happens through real member agents via GroupManagement; an isolated ad-hoc
 *   sub-agent on top of that is redundant and confusing.
 * - **Inside a sub-agent** (`isSubAgent`): a nested sub-agent must not spawn
 *   further sub-agents.
 *
 * In both cases plan / todo / media-analysis APIs stay available, so this returns a
 * trimmed manifest (not `null`). It rewrites BOTH halves of the manifest in step:
 * the `api` list drops `callSubAgent`, and `systemRole` switches to the variant
 * without the sub-agent section — otherwise the prompt would keep instructing the
 * model to dispatch a tool that is no longer in its tool list.
 */
export const resolveTutAgentManifest: BuiltinManifestResolver = (context) => {
  const inGroup = context.scope === 'group' || context.scope === 'group_agent';
  const hideSubAgentDispatch = inGroup || context.isSubAgent === true;

  if (!hideSubAgentDispatch) return TutAgentManifest;

  return {
    ...TutAgentManifest,
    api: TutAgentManifest.api.filter((api) => api.name !== TutAgentApiName.callSubAgent),
    systemRole: systemPromptWithoutSubAgent,
  };
};
