import type { AgentHookMatcher } from '@tut/types';
import { isRecord } from '@tut/utils/object';

/** Match the combined tool name; registration/restoration validates the regex first. */
export function matchesHook(matcher: AgentHookMatcher | undefined, event: unknown): boolean {
  if (!matcher || matcher === '*') return true;
  if (!isRecord(event) || typeof event.identifier !== 'string' || typeof event.apiName !== 'string')
    return false;
  return new RegExp(matcher).test(`${event.identifier}/${event.apiName}`);
}
