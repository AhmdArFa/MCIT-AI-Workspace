import type { LLMParams } from 'model-bank';
import { z } from 'zod';

import type { FileItem } from '../files';
import type { KnowledgeBaseItem } from '../knowledgeBase';
import type { FewShots } from '../llm';
import type { TutAgentAgencyConfig } from './agencyConfig';
import { AgentChatConfigSchema, type TutAgentChatConfig } from './chatConfig';
import { type AgentPluginEntry, AgentPluginEntrySchema } from './pluginConfig';
import type { AgentProfile } from './profile';
import type { TutAgentTTSConfig } from './tts';

/**
 * A single entry in the agent usage ranking (by topic count). `id` is the
 * agentId — the ranking is agent-native (no sessionId).
 */
export interface AgentRankItem {
  avatar: string | null;
  backgroundColor: string | null;
  count: number;
  id: string;
  /** Personal name; resolve the label with `agentDisplayName(item, fallback)`. */
  name: string | null;
  title: string | null;
}

/** An agent whose execution is routed to a specific device — see the device detail page. */
export interface DeviceBoundAgentItem {
  avatar: string | null;
  backgroundColor: string | null;
  id: string;
  /** Personal name; resolve the label with `agentDisplayName(item, fallback)`. */
  name: string | null;
  title: string | null;
  visibility: 'private' | 'public';
}

export interface TutAgentConfig {
  /**
   * Agency configuration: device binding, heterogeneous agent provider, etc.
   */
  agencyConfig?: TutAgentAgencyConfig;

  avatar?: string;
  backgroundColor?: string;

  chatConfig: TutAgentChatConfig;

  /**
   * Editor content (JSON format)
   * Used to save the complete state of the rich text editor, including special nodes like mention
   */
  editorData?: any;

  fewShots?: FewShots;
  files?: FileItem[];
  id?: string;
  /**
   * knowledge bases
   */
  knowledgeBases?: KnowledgeBaseItem[];

  /**
   * Language model used by the agent
   * @default gpt-4o-mini
   */
  model: string;
  /**
   * The agent's personal name (e.g. "Alice", "小艾") — the identity it is
   * addressed by. Distinct from {@link TutAgentConfig.title}, which describes
   * the role it plays ("Health Assistant" / "健康助手"). Optional: agents
   * created before this field existed have no name.
   */
  name?: string;

  /**
   * Opening message
   */
  openingMessage?: string;

  /**
   * Opening questions
   */
  openingQuestions?: string[];
  /**
   * Language model parameters
   */
  params: LLMParams;

  /**
   * Enabled plugins. Each entry is either a legacy bare identifier string
   * (implicit pinned) or a tri-state `{ identifier, mode }` object — see
   * `AgentPluginEntry` / `parsePluginEntry`. Prefer the read helpers
   * (`getActivePluginIds`, `getPinnedPluginIds`, `getDisabledPluginIds`,
   * `getPluginMode`) over reading this field directly.
   */
  plugins?: AgentPluginEntry[];
  /** Character sheet — traits and artwork; see {@link AgentProfile}. */
  profile?: AgentProfile | null;

  /**
   *  Model provider
   */
  provider?: string;

  /**
   * System role
   */
  systemRole: string;

  /**
   * The role the agent plays, shown as its display label across the app
   * (see {@link TutAgentConfig.name} for the personal name).
   */
  title?: string;

  /**
   * Text-to-speech service
   */
  tts: TutAgentTTSConfig;

  /**
   * Flag for assistants generated automatically (e.g., from templates)
   */
  virtual?: boolean;
}

export type TutAgentConfigKeys =
  keyof TutAgentConfig | ['params', keyof TutAgentConfig['params']];

/**
 * Zod schema for creating a new agent.
 * Covers all user-configurable fields; system fields (id, userId, timestamps) are excluded.
 */
export const CreateAgentSchema = z.object({
  agencyConfig: z.custom<TutAgentAgencyConfig>().optional(),
  avatar: z.string().nullish(),
  backgroundColor: z.string().nullish(),
  chatConfig: AgentChatConfigSchema.optional(),
  description: z.string().nullish(),
  editorData: z.unknown().optional(),
  fewShots: z.unknown().optional(),
  marketIdentifier: z.string().nullish(),
  model: z.string().nullish(),
  name: z.string().nullish(),
  openingMessage: z.string().nullish(),
  openingQuestions: z.array(z.string()).optional(),
  params: z.record(z.string(), z.unknown()).optional(),
  plugins: z.array(AgentPluginEntrySchema).optional(),
  provider: z.string().nullish(),
  sessionGroupId: z.string().nullish(),
  systemRole: z.string().nullish(),
  tags: z.array(z.string()).optional(),
  title: z.string().nullish(),
  tts: z.custom<TutAgentTTSConfig>().optional(),
  virtual: z.boolean().nullish(),
  /**
   * `private` keeps the agent visible only to its creator within the workspace;
   * `public` (default) makes it visible to every workspace member. Ignored in
   * personal mode (no workspaceId).
   */
  visibility: z.enum(['private', 'public']).optional(),
});

export type CreateAgentConfig = z.infer<typeof CreateAgentSchema>;

// Agent database item type (independent from schema)
export interface AgentItem {
  agencyConfig?: TutAgentAgencyConfig | null;
  avatar?: string | null;
  backgroundColor?: string | null;
  chatConfig?: TutAgentChatConfig | null;
  clientId?: string | null;
  createdAt: Date;
  description?: string | null;
  editorData?: any | null;
  fewShots?: any | null;
  id: string;
  /** Market agent identifier for published agents */
  marketIdentifier?: string | null;
  /** Default extension bag for values with no column and no home in `profile`. */
  metadata?: Record<string, unknown> | null;
  model?: string | null;
  /** Personal name of the agent — see {@link TutAgentConfig.name}. */
  name?: string | null;
  openingMessage?: string | null;
  openingQuestions?: string[];
  params?: any;
  plugins?: AgentPluginEntry[];
  /** Character sheet — traits and artwork; see {@link AgentProfile}. */
  profile?: AgentProfile | null;
  provider?: string | null;
  /** Session group ID for direct grouping */
  sessionGroupId?: string | null;
  slug?: string | null;
  /**
   * The society (agent org) this agent belongs to, or `null` for a standalone
   * one. A real column rather than a metadata key: agents get listed and
   * filtered by it.
   */
  societyId?: string | null;
  systemRole?: string | null;
  tags?: string[];
  title?: string | null;
  tts?: TutAgentTTSConfig | null;
  updatedAt: Date;
  userId: string;
  virtual?: boolean | null;
  /**
   * Workspace-scoped visibility. `public` (default) = every workspace member
   * can see this agent; `private` = creator-only. Ignored in personal mode.
   */
  visibility?: 'private' | 'public';
  /** Owning workspace; null for personal (non-workspace) agents. */
  workspaceId?: string | null;
}
