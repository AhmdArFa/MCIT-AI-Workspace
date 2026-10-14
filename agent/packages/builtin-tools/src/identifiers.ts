import { AcceptanceEvidenceManifest } from '@tut/builtin-tool-acceptance-evidence';
import { TutActivatorManifest } from '@tut/builtin-tool-activator';
import { AgentBuilderManifest } from '@tut/builtin-tool-agent-builder';
import { AgentDocumentsManifest } from '@tut/builtin-tool-agent-documents';
import { AgentManagementManifest } from '@tut/builtin-tool-agent-management';
import {
  agentSignalFeedbackIntentManifest,
  agentSignalReflectionManifest,
  agentSignalReviewManifest,
  agentSignalSkillManagementManifest,
} from '@tut/builtin-tool-agent-signal';
import { AttachmentsManifest } from '@tut/builtin-tool-attachments';
import { AuvManifest } from '@tut/builtin-tool-auv';
import { BrowserManifest } from '@tut/builtin-tool-browser';
import { CalculatorManifest } from '@tut/builtin-tool-calculator/manifest';
import { CloudSandboxManifest } from '@tut/builtin-tool-cloud-sandbox';
import { CredsManifest } from '@tut/builtin-tool-creds';
import { DashboardManifest } from '@tut/builtin-tool-dashboard';
import {
  GoalManifest,
  GoalReportManifest,
  GoalSupervisorManifest,
} from '@tut/builtin-tool-goal';
import { GroupAgentBuilderManifest } from '@tut/builtin-tool-group-agent-builder';
import { GroupManagementManifest } from '@tut/builtin-tool-group-management';
import { ImageGenerationManifest } from '@tut/builtin-tool-image-generation';
import { KnowledgeBaseManifest } from '@tut/builtin-tool-knowledge-base';
import { TutAgentManifest } from '@tut/builtin-tool-tut-agent';
import { LocalSystemManifest } from '@tut/builtin-tool-local-system';
import { MemoryManifest } from '@tut/builtin-tool-memory';
import { NotebookManifest } from '@tut/builtin-tool-notebook';
import { PageAgentManifest } from '@tut/builtin-tool-page-agent';
import { selfFeedbackIntentManifest } from '@tut/builtin-tool-self-iteration';
import { SkillStoreManifest } from '@tut/builtin-tool-skill-store';
import { SkillsManifest } from '@tut/builtin-tool-skills';
import { UserInteractionManifest } from '@tut/builtin-tool-user-interaction';
import { VerifyToolManifest } from '@tut/builtin-tool-verify';
import { VideoGenerationManifest } from '@tut/builtin-tool-video-generation';
import { WebBrowsingManifest } from '@tut/builtin-tool-web-browsing';
import { WebOnboardingManifest } from '@tut/builtin-tool-web-onboarding';

export const builtinToolIdentifiers: string[] = [
  AcceptanceEvidenceManifest.identifier,
  AgentBuilderManifest.identifier,
  AgentDocumentsManifest.identifier,
  AgentManagementManifest.identifier,
  AttachmentsManifest.identifier,
  AuvManifest.identifier,
  CalculatorManifest.identifier,
  CloudSandboxManifest.identifier,
  CredsManifest.identifier,
  DashboardManifest.identifier,
  GroupAgentBuilderManifest.identifier,
  GroupManagementManifest.identifier,
  GoalManifest.identifier,
  GoalSupervisorManifest.identifier,
  GoalReportManifest.identifier,
  ImageGenerationManifest.identifier,
  VideoGenerationManifest.identifier,
  KnowledgeBaseManifest.identifier,
  BrowserManifest.identifier,
  LocalSystemManifest.identifier,
  MemoryManifest.identifier,
  NotebookManifest.identifier,
  PageAgentManifest.identifier,
  selfFeedbackIntentManifest.identifier,
  agentSignalReviewManifest.identifier,
  agentSignalReflectionManifest.identifier,
  agentSignalFeedbackIntentManifest.identifier,
  agentSignalSkillManagementManifest.identifier,
  SkillsManifest.identifier,
  SkillStoreManifest.identifier,
  TutActivatorManifest.identifier,
  WebBrowsingManifest.identifier,
  UserInteractionManifest.identifier,
  TutAgentManifest.identifier,
  WebOnboardingManifest.identifier,
  VerifyToolManifest.identifier,
];
