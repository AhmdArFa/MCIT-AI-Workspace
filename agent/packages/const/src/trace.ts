import type { TraceNameMap } from '@tut/types';

export const TUT_CHAT_TRACE_HEADER = 'X-tut-trace';
export const TUT_CHAT_TRACE_ID = 'X-tut-chat-trace-id';
export const TUT_CHAT_OBSERVATION_ID = 'X-tut-observation-id';

export interface TracePayload {
  /**
   * if user allow to trace
   */
  enabled?: boolean;
  observationId?: string;
  /**
   * chat session: agentId or groupId
   */
  sessionId?: string;
  tags?: string[];
  /**
   * chat topicId
   */
  topicId?: string;
  traceId?: string;
  traceName?: TraceNameMap;
  /**
   * user uuid
   */
  userId?: string;
}
