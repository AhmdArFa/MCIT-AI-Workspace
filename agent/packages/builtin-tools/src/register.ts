import {
  TutActivatorInspectors,
  TutActivatorManifest,
  TutActivatorRenders,
} from '@tut/builtin-tool-activator/client';
import {
  AgentBuilderInspectors,
  AgentBuilderInterventions,
  AgentBuilderManifest,
  AgentBuilderRenders,
  AgentBuilderStreamings,
} from '@tut/builtin-tool-agent-builder/client';
import {
  AgentDocumentsInspectors,
  AgentDocumentsInterventions,
  AgentDocumentsManifest,
  AgentDocumentsRenders,
  AgentDocumentsStreamings,
} from '@tut/builtin-tool-agent-documents/client';
import {
  AgentManagementInspectors,
  AgentManagementManifest,
  AgentManagementRenders,
  AgentManagementStreamings,
} from '@tut/builtin-tool-agent-management/client';
import { AuvIdentifier, AuvInspectors } from '@tut/builtin-tool-auv/client';
import {
  BrowserInspectors,
  BrowserManifest,
  BrowserRenders,
} from '@tut/builtin-tool-browser/client';
import {
  ClaudeCodeApiName,
  ClaudeCodeIdentifier,
  ClaudeCodeInspectors,
  ClaudeCodeInterventions,
  ClaudeCodeRenders,
  ClaudeCodeStreamings,
} from '@tut/builtin-tool-claude-code/client';
import {
  CloudSandboxInspectors,
  CloudSandboxInterventions,
  CloudSandboxManifest,
  CloudSandboxRenders,
  CloudSandboxStreamings,
} from '@tut/builtin-tool-cloud-sandbox/client';
import { CredsIdentifier, CredsInterventions } from '@tut/builtin-tool-creds/client';
import {
  DashboardInspectors,
  DashboardInterventions,
  DashboardManifest,
  DashboardRenders,
} from '@tut/builtin-tool-dashboard/client';
import {
  GoalInspectors,
  GoalInterventions,
  GoalManifest,
  GoalRenders,
  GoalSupervisorInspectors,
  GoalSupervisorManifest,
} from '@tut/builtin-tool-goal/client';
import {
  GroupAgentBuilderInspectors,
  GroupAgentBuilderManifest,
  GroupAgentBuilderRenders,
  GroupAgentBuilderStreamings,
} from '@tut/builtin-tool-group-agent-builder/client';
import {
  GroupManagementInspectors,
  GroupManagementInterventions,
  GroupManagementManifest,
  GroupManagementRenders,
  GroupManagementStreamings,
} from '@tut/builtin-tool-group-management/client';
import {
  ImageGenerationInspectors,
  ImageGenerationManifest,
  ImageGenerationRenders,
  ImageGenerationStreamings,
} from '@tut/builtin-tool-image-generation/client';
import {
  KnowledgeBaseInspectors,
  KnowledgeBaseManifest,
  KnowledgeBaseRenders,
} from '@tut/builtin-tool-knowledge-base/client';
import {
  TutAgentInspectors,
  TutAgentInterventions,
  TutAgentManifest,
  TutAgentRenders,
  TutAgentStreamings,
} from '@tut/builtin-tool-tut-agent/client';
import {
  LocalSystemApiName,
  LocalSystemIdentifier,
  LocalSystemInspectors,
  LocalSystemInterventions,
  LocalSystemListFilesPlaceholder,
  LocalSystemManifest,
  LocalSystemRenders,
  LocalSystemSearchFilesPlaceholder,
  LocalSystemStreamings,
} from '@tut/builtin-tool-local-system/client';
import {
  MemoryInspectors,
  MemoryInterventions,
  MemoryManifest,
  MemoryRenders,
  MemoryStreamings,
} from '@tut/builtin-tool-memory/client';
import {
  MessageInspectors,
  MessageInterventions,
  MessageManifest,
  MessageRenders,
  MessageStreamings,
} from '@tut/builtin-tool-message/client';
import {
  PageAgentInspectors,
  PageAgentManifest,
  PageAgentRenders,
  PageAgentStreamings,
} from '@tut/builtin-tool-page-agent/client';
import {
  RemoteDeviceInspectors,
  RemoteDeviceManifest,
  RemoteDeviceRenders,
} from '@tut/builtin-tool-remote-device/client';
import {
  SelfFeedbackIntentInspectors,
  selfFeedbackIntentManifest,
} from '@tut/builtin-tool-self-iteration/client';
import {
  SkillStoreInspectors,
  SkillStoreManifest,
  SkillStoreRenders,
} from '@tut/builtin-tool-skill-store/client';
import {
  SkillsInspectors,
  SkillsManifest,
  SkillsRenders,
} from '@tut/builtin-tool-skills/client';
import {
  TaskInspectors,
  TaskInterventions,
  TaskManifest,
  TaskRenders,
} from '@tut/builtin-tool-task/client';
import {
  UserInteractionIdentifier,
  UserInteractionInspectors,
  UserInteractionInterventions,
  UserInteractionRenders,
} from '@tut/builtin-tool-user-interaction/client';
import {
  VideoGenerationInspectors,
  VideoGenerationManifest,
  VideoGenerationPlaceholders,
  VideoGenerationRenders,
} from '@tut/builtin-tool-video-generation/client';
import {
  WebBrowsingInspectors,
  WebBrowsingManifest,
  WebBrowsingPlaceholders,
  WebBrowsingPortal,
  WebBrowsingPortalTitle,
  WebBrowsingRenders,
} from '@tut/builtin-tool-web-browsing/client';
import {
  WebOnboardingInspectors,
  WebOnboardingInterventions,
  WebOnboardingManifest,
  WebOnboardingRenders,
} from '@tut/builtin-tool-web-onboarding/client';
import {
  createEditLocalFileInspector,
  createReadLocalFileInspector,
  createRunCommandInspector,
  createWriteLocalFileInspector,
} from '@tut/shared-tool-ui/inspectors';
import { RunCommandRender } from '@tut/shared-tool-ui/renders';
import type {
  BuiltinInspector,
  BuiltinIntervention,
  BuiltinPlaceholder,
  BuiltinPortal,
  BuiltinPortalTitle,
  BuiltinRender,
  BuiltinStreaming,
} from '@tut/types';

import { CodexInspectors, CodexRenders } from './codex';
import { GithubIdentifier, GithubInspectors, GithubRenders } from './github';
import { registerBuiltinInspectors } from './inspectors';
import { registerBuiltinInterventions } from './interventions';
import { KimiCodeInspectors, KimiCodeRenders } from './kimiCode';
import { LinearIdentifier, LinearInspectors, LinearRenders } from './linear';
import { NotebookIdentifier, NotebookRenders } from './notebook';
import { registerBuiltinPlaceholders } from './placeholders';
import { registerBuiltinPortals } from './portals';
import { registerBuiltinRenders } from './renders';
import { registerBuiltinStreamings } from './streamings';
import { TwitterIdentifier, TwitterInspectors } from './twitter';

const DROID_IDENTIFIER = 'droid';
const DEVIN_IDENTIFIER = 'devin';
const QODER_IDENTIFIER = 'qoder';
const OPENCODE_IDENTIFIER = 'opencode';
const PI_IDENTIFIER = 'pi';
const KIMI_CODE_IDENTIFIER = 'kimi-code';

const heterogeneousCliInspectors: Record<string, BuiltinInspector> = {
  bash: createRunCommandInspector(
    'builtins.tut-local-system.apiName.runCommand',
  ) as BuiltinInspector,
  read: createReadLocalFileInspector(
    'builtins.tut-local-system.apiName.readFile',
  ) as BuiltinInspector,
  write: createWriteLocalFileInspector(
    'builtins.tut-local-system.apiName.writeFile',
  ) as BuiltinInspector,
};

const heterogeneousCliRenders: Record<string, BuiltinRender> = {
  bash: RunCommandRender as BuiltinRender,
  read: LocalSystemRenders[LocalSystemApiName.readFile] as BuiltinRender,
  write: LocalSystemRenders[LocalSystemApiName.writeFile] as BuiltinRender,
};

const heterogeneousCliStreamings: Record<string, BuiltinStreaming> = {
  bash: LocalSystemStreamings[LocalSystemApiName.runCommand] as BuiltinStreaming,
  write: LocalSystemStreamings[LocalSystemApiName.writeFile] as BuiltinStreaming,
};

/**
 * Devin's ACP stream reports the CLI's inference tool names via
 * `_meta['cognition.ai/inferenceToolName']` (exec/read/write/edit/…), so the
 * shared command and local-file surfaces apply under those apiName keys.
 * `edit` gets an inspector but no render: its tool result is flattened diff
 * text, not the `diffText` patch EditLocalFile expects. `grep`/`glob` stay
 * inspector-less too — their count icons key off tut-shaped pluginState
 * (totalMatches/totalCount) that ACP updates never carry, so a successful
 * search would render as a failure.
 */
const devinCliInspectors: Record<string, BuiltinInspector> = {
  edit: createEditLocalFileInspector('builtins.devin.apiName.edit') as BuiltinInspector,
  exec: createRunCommandInspector('builtins.devin.apiName.exec') as BuiltinInspector,
  read: createReadLocalFileInspector('builtins.devin.apiName.read') as BuiltinInspector,
  write: createWriteLocalFileInspector('builtins.devin.apiName.write') as BuiltinInspector,
};

const devinCliRenders: Record<string, BuiltinRender> = {
  exec: RunCommandRender as BuiltinRender,
  read: LocalSystemRenders[LocalSystemApiName.readFile] as BuiltinRender,
  write: LocalSystemRenders[LocalSystemApiName.writeFile] as BuiltinRender,
};

let builtinToolSurfacesRegistered = false;

export const registerBuiltinToolSurfaces = (): void => {
  if (builtinToolSurfacesRegistered) return;

  registerBuiltinRenders({
    [AgentBuilderManifest.identifier]: AgentBuilderRenders as Record<string, BuiltinRender>,
    [AgentDocumentsManifest.identifier]: AgentDocumentsRenders as Record<string, BuiltinRender>,
    [AgentManagementManifest.identifier]: AgentManagementRenders as Record<string, BuiltinRender>,
    [ClaudeCodeIdentifier]: ClaudeCodeRenders as Record<string, BuiltinRender>,
    [DROID_IDENTIFIER]: {
      [ClaudeCodeApiName.AskUserQuestion]: ClaudeCodeRenders[ClaudeCodeApiName.AskUserQuestion],
    },
    [DEVIN_IDENTIFIER]: {
      ...devinCliRenders,
      [ClaudeCodeApiName.AskUserQuestion]: ClaudeCodeRenders[ClaudeCodeApiName.AskUserQuestion],
    },
    [QODER_IDENTIFIER]: ClaudeCodeRenders as Record<string, BuiltinRender>,
    [CloudSandboxManifest.identifier]: CloudSandboxRenders as Record<string, BuiltinRender>,
    [GroupAgentBuilderManifest.identifier]: GroupAgentBuilderRenders as Record<
      string,
      BuiltinRender
    >,
    [GroupManagementManifest.identifier]: GroupManagementRenders as Record<string, BuiltinRender>,
    [GoalManifest.identifier]: GoalRenders as Record<string, BuiltinRender>,
    [ImageGenerationManifest.identifier]: ImageGenerationRenders as Record<string, BuiltinRender>,
    [VideoGenerationManifest.identifier]: VideoGenerationRenders as Record<string, BuiltinRender>,
    [KnowledgeBaseManifest.identifier]: KnowledgeBaseRenders as Record<string, BuiltinRender>,
    [TutAgentManifest.identifier]: TutAgentRenders as Record<string, BuiltinRender>,
    [BrowserManifest.identifier]: BrowserRenders as Record<string, BuiltinRender>,
    [LocalSystemManifest.identifier]: LocalSystemRenders as Record<string, BuiltinRender>,
    [MemoryManifest.identifier]: MemoryRenders as Record<string, BuiltinRender>,
    [MessageManifest.identifier]: MessageRenders as Record<string, BuiltinRender>,
    [NotebookIdentifier]: NotebookRenders,
    [PageAgentManifest.identifier]: PageAgentRenders as Record<string, BuiltinRender>,
    [RemoteDeviceManifest.identifier]: RemoteDeviceRenders as Record<string, BuiltinRender>,
    [SkillStoreManifest.identifier]: SkillStoreRenders as Record<string, BuiltinRender>,
    [SkillsManifest.identifier]: SkillsRenders as Record<string, BuiltinRender>,
    [DashboardManifest.identifier]: DashboardRenders as Record<string, BuiltinRender>,
    [TaskManifest.identifier]: TaskRenders as Record<string, BuiltinRender>,
    [UserInteractionIdentifier]: UserInteractionRenders as Record<string, BuiltinRender>,
    [TutActivatorManifest.identifier]: TutActivatorRenders as Record<string, BuiltinRender>,
    [WebBrowsingManifest.identifier]: WebBrowsingRenders as Record<string, BuiltinRender>,
    [WebOnboardingManifest.identifier]: WebOnboardingRenders as Record<string, BuiltinRender>,
    [OPENCODE_IDENTIFIER]: heterogeneousCliRenders,
    [PI_IDENTIFIER]: heterogeneousCliRenders,
    [KIMI_CODE_IDENTIFIER]: KimiCodeRenders as Record<string, BuiltinRender>,
    codex: {
      ...CodexRenders,
      command_execution: RunCommandRender as BuiltinRender,
    },
    [GithubIdentifier]: GithubRenders,
    [LinearIdentifier]: LinearRenders,
  });

  registerBuiltinInspectors({
    [AuvIdentifier]: AuvInspectors as Record<string, BuiltinInspector>,
    // Read-only alias for messages recorded by the original private desktop PR.
    // New manifests and execution routes only advertise tut-computer-use.
    'tut-auv': AuvInspectors as Record<string, BuiltinInspector>,
    [AgentBuilderManifest.identifier]: AgentBuilderInspectors as Record<string, BuiltinInspector>,
    [AgentDocumentsManifest.identifier]: AgentDocumentsInspectors as Record<
      string,
      BuiltinInspector
    >,
    [AgentManagementManifest.identifier]: AgentManagementInspectors as Record<
      string,
      BuiltinInspector
    >,
    [ClaudeCodeIdentifier]: ClaudeCodeInspectors as Record<string, BuiltinInspector>,
    [DROID_IDENTIFIER]: {
      [ClaudeCodeApiName.AskUserQuestion]: ClaudeCodeInspectors[ClaudeCodeApiName.AskUserQuestion],
    },
    [DEVIN_IDENTIFIER]: {
      ...devinCliInspectors,
      [ClaudeCodeApiName.AskUserQuestion]: ClaudeCodeInspectors[ClaudeCodeApiName.AskUserQuestion],
    },
    [QODER_IDENTIFIER]: ClaudeCodeInspectors as Record<string, BuiltinInspector>,
    [CloudSandboxManifest.identifier]: CloudSandboxInspectors as Record<string, BuiltinInspector>,
    [GroupAgentBuilderManifest.identifier]: GroupAgentBuilderInspectors as Record<
      string,
      BuiltinInspector
    >,
    [GroupManagementManifest.identifier]: GroupManagementInspectors as Record<
      string,
      BuiltinInspector
    >,
    [GoalManifest.identifier]: GoalInspectors as Record<string, BuiltinInspector>,
    [GoalSupervisorManifest.identifier]: GoalSupervisorInspectors,
    [ImageGenerationManifest.identifier]: ImageGenerationInspectors as Record<
      string,
      BuiltinInspector
    >,
    [VideoGenerationManifest.identifier]: VideoGenerationInspectors as Record<
      string,
      BuiltinInspector
    >,
    [KnowledgeBaseManifest.identifier]: KnowledgeBaseInspectors as Record<string, BuiltinInspector>,
    [TutAgentManifest.identifier]: TutAgentInspectors as Record<string, BuiltinInspector>,
    [BrowserManifest.identifier]: BrowserInspectors as Record<string, BuiltinInspector>,
    [LocalSystemManifest.identifier]: LocalSystemInspectors as Record<string, BuiltinInspector>,
    [MemoryManifest.identifier]: MemoryInspectors as Record<string, BuiltinInspector>,
    [MessageManifest.identifier]: MessageInspectors as Record<string, BuiltinInspector>,
    [PageAgentManifest.identifier]: PageAgentInspectors as Record<string, BuiltinInspector>,
    [RemoteDeviceManifest.identifier]: RemoteDeviceInspectors as Record<string, BuiltinInspector>,
    [TutActivatorManifest.identifier]: TutActivatorInspectors as Record<string, BuiltinInspector>,
    [selfFeedbackIntentManifest.identifier]: SelfFeedbackIntentInspectors as Record<
      string,
      BuiltinInspector
    >,
    [SkillStoreManifest.identifier]: SkillStoreInspectors as Record<string, BuiltinInspector>,
    [SkillsManifest.identifier]: SkillsInspectors as Record<string, BuiltinInspector>,
    [DashboardManifest.identifier]: DashboardInspectors as Record<string, BuiltinInspector>,
    [TaskManifest.identifier]: TaskInspectors as Record<string, BuiltinInspector>,
    [UserInteractionIdentifier]: UserInteractionInspectors as Record<string, BuiltinInspector>,
    [WebBrowsingManifest.identifier]: WebBrowsingInspectors as Record<string, BuiltinInspector>,
    [WebOnboardingManifest.identifier]: WebOnboardingInspectors as Record<string, BuiltinInspector>,
    [OPENCODE_IDENTIFIER]: heterogeneousCliInspectors,
    [PI_IDENTIFIER]: heterogeneousCliInspectors,
    [KIMI_CODE_IDENTIFIER]: KimiCodeInspectors,
    'codex': CodexInspectors,
    [GithubIdentifier]: GithubInspectors,
    [LinearIdentifier]: LinearInspectors,
    [TwitterIdentifier]: TwitterInspectors,
  });

  registerBuiltinStreamings({
    [AgentBuilderManifest.identifier]: AgentBuilderStreamings as Record<string, BuiltinStreaming>,
    [AgentDocumentsManifest.identifier]: AgentDocumentsStreamings as Record<
      string,
      BuiltinStreaming
    >,
    [AgentManagementManifest.identifier]: AgentManagementStreamings as Record<
      string,
      BuiltinStreaming
    >,
    [ClaudeCodeIdentifier]: ClaudeCodeStreamings as Record<string, BuiltinStreaming>,
    [QODER_IDENTIFIER]: ClaudeCodeStreamings as Record<string, BuiltinStreaming>,
    [CloudSandboxManifest.identifier]: CloudSandboxStreamings as Record<string, BuiltinStreaming>,
    [ImageGenerationManifest.identifier]: ImageGenerationStreamings,
    [GroupAgentBuilderManifest.identifier]: GroupAgentBuilderStreamings as Record<
      string,
      BuiltinStreaming
    >,
    [GroupManagementManifest.identifier]: GroupManagementStreamings as Record<
      string,
      BuiltinStreaming
    >,
    [TutAgentManifest.identifier]: TutAgentStreamings as Record<string, BuiltinStreaming>,
    [LocalSystemManifest.identifier]: LocalSystemStreamings as Record<string, BuiltinStreaming>,
    [MemoryManifest.identifier]: MemoryStreamings as Record<string, BuiltinStreaming>,
    [MessageManifest.identifier]: MessageStreamings as Record<string, BuiltinStreaming>,
    [OPENCODE_IDENTIFIER]: heterogeneousCliStreamings,
    [PageAgentManifest.identifier]: PageAgentStreamings as Record<string, BuiltinStreaming>,
    [PI_IDENTIFIER]: heterogeneousCliStreamings,
  });

  registerBuiltinInterventions({
    [AgentBuilderManifest.identifier]: AgentBuilderInterventions as Record<
      string,
      BuiltinIntervention
    >,
    [AgentDocumentsManifest.identifier]: AgentDocumentsInterventions as Record<
      string,
      BuiltinIntervention
    >,
    [ClaudeCodeIdentifier]: ClaudeCodeInterventions as Record<string, BuiltinIntervention>,
    [DROID_IDENTIFIER]: {
      [ClaudeCodeApiName.AskUserQuestion]:
        ClaudeCodeInterventions[ClaudeCodeApiName.AskUserQuestion],
    },
    [DEVIN_IDENTIFIER]: {
      [ClaudeCodeApiName.AskUserQuestion]:
        ClaudeCodeInterventions[ClaudeCodeApiName.AskUserQuestion],
    },
    [QODER_IDENTIFIER]: ClaudeCodeInterventions as Record<string, BuiltinIntervention>,
    [CredsIdentifier]: CredsInterventions as Record<string, BuiltinIntervention>,
    [CloudSandboxManifest.identifier]: CloudSandboxInterventions as Record<
      string,
      BuiltinIntervention
    >,
    [GroupManagementManifest.identifier]: GroupManagementInterventions as Record<
      string,
      BuiltinIntervention
    >,
    [GoalManifest.identifier]: GoalInterventions as Record<string, BuiltinIntervention>,
    [TutAgentManifest.identifier]: TutAgentInterventions as Record<string, BuiltinIntervention>,
    [LocalSystemIdentifier]: LocalSystemInterventions as Record<string, BuiltinIntervention>,
    [MemoryManifest.identifier]: MemoryInterventions as Record<string, BuiltinIntervention>,
    [MessageManifest.identifier]: MessageInterventions as Record<string, BuiltinIntervention>,
    [DashboardManifest.identifier]: DashboardInterventions as Record<string, BuiltinIntervention>,
    [TaskManifest.identifier]: TaskInterventions as Record<string, BuiltinIntervention>,
    [UserInteractionIdentifier]: UserInteractionInterventions as Record<
      string,
      BuiltinIntervention
    >,
    [WebOnboardingManifest.identifier]: WebOnboardingInterventions as Record<
      string,
      BuiltinIntervention
    >,
  });

  registerBuiltinPlaceholders({
    [LocalSystemIdentifier]: {
      [LocalSystemApiName.searchFiles]: LocalSystemSearchFilesPlaceholder as BuiltinPlaceholder,
      [LocalSystemApiName.listFiles]: LocalSystemListFilesPlaceholder as BuiltinPlaceholder,
      // Legacy aliases — keep these so historical messages keep rendering.
      listLocalFiles: LocalSystemListFilesPlaceholder as BuiltinPlaceholder,
      searchLocalFiles: LocalSystemSearchFilesPlaceholder as BuiltinPlaceholder,
    },
    [VideoGenerationManifest.identifier]: VideoGenerationPlaceholders as Record<
      string,
      BuiltinPlaceholder
    >,
    [WebBrowsingManifest.identifier]: WebBrowsingPlaceholders as Record<string, BuiltinPlaceholder>,
  });

  registerBuiltinPortals({
    portals: {
      [WebBrowsingManifest.identifier]: WebBrowsingPortal as BuiltinPortal,
    },
    titles: {
      [WebBrowsingManifest.identifier]: WebBrowsingPortalTitle as BuiltinPortalTitle,
    },
  });

  builtinToolSurfacesRegistered = true;
};
