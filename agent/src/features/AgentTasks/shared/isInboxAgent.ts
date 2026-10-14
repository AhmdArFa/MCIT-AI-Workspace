import { INBOX_SESSION_ID } from '@tut/const';

export const isInboxAgentId = (agentId: string, inboxAgentId?: string | null): boolean =>
  agentId === INBOX_SESSION_ID || (!!inboxAgentId && agentId === inboxAgentId);
