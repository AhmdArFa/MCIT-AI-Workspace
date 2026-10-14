import { createReplicaState, type ReplicaState } from '@/libs/replica';

import { type McitSkillServer, type McitSkillTool } from './types';

/**
 * MCIT AI Skill Store state interface
 *
 * NOTE: connection states and tool data are a local-first copy of the Market
 * API — the replica persists them and the network only confirms.
 */
export interface McitSkillStoreState {
  /** Set of executing tool call IDs */
  mcitSkillExecutingToolIds: Set<string>;
  /** Set of loading Provider IDs */
  mcitSkillLoadingIds: Set<string>;
  /**
   * The connected providers of the active scope — the view of the
   * `mcitSkillServers` replica. `undefined` until the persisted row hydrates
   * or the first network response lands, so an un-loaded list never reads as an
   * empty one (and the empty default never blocks hydration).
   */
  mcitSkillServers?: McitSkillServer[];
  /** Replica bookkeeping of `mcitSkillServers`. */
  mcitSkillServersReplica: ReplicaState<McitSkillServer[]>;
  /** Replica view of the provider tool catalogs, one entry per provider id. */
  mcitSkillToolsMap: Record<string, McitSkillTool[]>;
  /** Replica bookkeeping of `mcitSkillToolsMap`. */
  mcitSkillToolsReplica: ReplicaState<McitSkillTool[]>;
}

/**
 * MCIT AI Skill Store initial state
 */
export const initialMcitSkillStoreState: McitSkillStoreState = {
  mcitSkillExecutingToolIds: new Set(),
  mcitSkillLoadingIds: new Set(),
  // Absent until the persisted row hydrates or the first network response lands.
  mcitSkillServers: undefined,
  mcitSkillServersReplica: createReplicaState(),
  mcitSkillToolsMap: {},
  mcitSkillToolsReplica: createReplicaState(),
};
