import type { TutSessions } from './agentSession';
import type { TutSessionGroups, SessionGroupId } from './sessionGroup';

export * from './agentSession';
export * from './sessionGroup';

export interface ChatSessionList {
  sessionGroups: TutSessionGroups;
  sessions: TutSessions;
}

export interface UpdateSessionParams {
  group?: SessionGroupId;
  meta?: any;
  pinned?: boolean;
  updatedAt: Date;
}
