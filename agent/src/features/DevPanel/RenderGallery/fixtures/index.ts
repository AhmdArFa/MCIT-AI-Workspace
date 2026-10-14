'use client';

import { builtinTools } from '@tut/builtin-tools';
import { DEFAULT_INBOX_AVATAR } from '@tut/const';
import type { BuiltinToolManifest, TutChatPluginApi } from '@tut/types';

import type { ToolRenderFixture } from '../lifecycleMode';
import { buildSchemaSample, humanize, single, type ToolsetFixtureModule } from './_helpers';
import claudeCode from './claude-code';
import codex from './codex';
import devin from './devin';
import github from './github';
import kimiCode from './kimi-code';
import linear from './linear';
import tutActivator from './tut-activator';
import tutAgent from './tut-agent';
import tutAgentBuilder from './tut-agent-builder';
import tutAgentDocuments from './tut-agent-documents';
import tutAgentManagement from './tut-agent-management';
import tutBrowser from './tut-browser';
import tutCloudSandbox from './tut-cloud-sandbox';
import tutGroupAgentBuilder from './tut-group-agent-builder';
import tutGroupManagement from './tut-group-management';
import tutImageGeneration from './tut-image-generation';
import tutKnowledgeBase from './tut-knowledge-base';
import tutLocalSystem from './tut-local-system';
import tutNotebook from './tut-notebook';
import tutPageAgent from './tut-page-agent';
import tutSkillStore from './tut-skill-store';
import tutSkills from './tut-skills';
import tutTask from './tut-task';
import tutUserInteraction from './tut-user-interaction';
import tutUserMemory from './tut-user-memory';
import tutWebBrowsing from './tut-web-browsing';
import tutWebOnboarding from './tut-web-onboarding';
import { tutAuv } from './tutAuv';

export type { ToolRenderFixture, ToolRenderFixtureVariant } from '../lifecycleMode';

export interface ToolRenderMeta {
  api?: TutChatPluginApi;
  apiName: string;
  description?: string;
  identifier: string;
  toolsetDescription?: string;
  toolsetName: string;
}

export const DEVTOOLS_GROUP_ID = 'devtools-preview-group';

/**
 * Identity for the seeded Aggregate-preview conversation. The fixture messages
 * resolve their avatar/name through this agentId, so seeding `agentMap` with
 * this meta makes the preview turn read as "Tut Agent" instead of the
 * unresolved-agent fallback ("Unnamed Assistant").
 */
export const DEVTOOLS_AGENT_ID = 'devtools-render-gallery';

export const DEVTOOLS_AGENT_META = {
  avatar: DEFAULT_INBOX_AVATAR,
  title: 'Tut Agent',
};

export const DEVTOOLS_GROUP_DETAIL = {
  agents: [
    {
      avatar: '🧭',
      backgroundColor: '#E8F3FF',
      id: 'researcher-agent',
      title: 'Researcher',
    },
    {
      avatar: '🛠',
      backgroundColor: '#FFF3E8',
      id: 'builder-agent',
      title: 'Builder',
    },
  ],
  avatar: '👥',
  backgroundColor: '#EEF2FF',
  description: 'Fixture group used by /devtools to preview grouped task renders.',
  id: DEVTOOLS_GROUP_ID,
  title: 'Devtools Preview Group',
};

const toolsetModules: ToolsetFixtureModule[] = [
  claudeCode,
  codex,
  devin,
  github,
  kimiCode,
  linear,
  tutActivator,
  tutAgent,
  tutAgentBuilder,
  tutAgentDocuments,
  tutAgentManagement,
  tutAuv,
  tutBrowser,
  tutCloudSandbox,
  tutGroupAgentBuilder,
  tutGroupManagement,
  tutImageGeneration,
  tutKnowledgeBase,
  tutLocalSystem,
  tutNotebook,
  tutPageAgent,
  tutSkillStore,
  tutSkills,
  tutTask,
  tutUserInteraction,
  tutUserMemory,
  tutWebBrowsing,
  tutWebOnboarding,
];

const fixtureRegistry = new Map<string, ToolRenderFixture>();
const customToolsets = new Map<string, ToolsetFixtureModule>();

for (const toolset of toolsetModules) {
  customToolsets.set(toolset.identifier, toolset);
  for (const [apiName, fixture] of Object.entries(toolset.fixtures)) {
    fixtureRegistry.set(`${toolset.identifier}:${apiName}`, fixture);
  }
}

const manifestByIdentifier = new Map<string, BuiltinToolManifest>(
  builtinTools.map((tool) => [tool.identifier, tool.manifest]),
);

export const getToolRenderFixture = (
  identifier: string,
  apiName: string,
  api?: TutChatPluginApi,
): ToolRenderFixture => {
  const fixture = fixtureRegistry.get(`${identifier}:${apiName}`);
  if (fixture) return fixture;

  return single({
    args: buildSchemaSample(api?.parameters, apiName) || {},
  });
};

export const getToolRenderMeta = (identifier: string, apiName: string): ToolRenderMeta => {
  const manifest = manifestByIdentifier.get(identifier);
  const api = manifest?.api.find((item) => item.name === apiName);
  const customToolset = customToolsets.get(identifier);
  const customApi = customToolset?.apiList?.find((item) => item.name === apiName);

  return {
    api,
    apiName,
    description: api?.description || customApi?.description,
    identifier,
    toolsetDescription: manifest?.meta.description || customToolset?.meta?.description,
    toolsetName: manifest?.meta.title || customToolset?.meta?.title || humanize(identifier),
  };
};
