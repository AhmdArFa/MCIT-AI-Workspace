import { createReplicaState, type ReplicaState } from '@/libs/replica';
import type { TutDocument } from '@/types/document';

import type { PageListValue } from '../../projection';

export interface PageListSliceState {
  /**
   * By-id page cache, read by `getDocumentById` as a fallback behind the list.
   * Filled for pages opened outside the loaded list (mobile, deep links) — the
   * editor's title / emoji / workspace lock state resolve from here.
   */
  pageDetailMap: Record<string, TutDocument>;
  /** Local-first bookkeeping for `pageDetailMap`. */
  pageDetailReplica: ReplicaState<TutDocument>;
  /**
   * The paged page list (`pageListMap.all`), what the sidebar reads. The map
   * shape keeps the door open for another list query without moving fields.
   */
  pageListMap: Record<string, PageListValue>;
  /** Local-first bookkeeping for `pageListMap`. */
  pageListReplica: ReplicaState<PageListValue>;
}

export const initialPageListState: PageListSliceState = {
  pageDetailMap: {},
  pageDetailReplica: createReplicaState(),
  pageListMap: {},
  pageListReplica: createReplicaState(),
};
