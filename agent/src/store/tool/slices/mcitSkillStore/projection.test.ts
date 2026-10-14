import { describe, expect, it } from 'vitest';

import {
  createMcitSkillLocalIntent,
  type McitSkillLocalIntent,
  mergeMcitSkillServers,
} from './projection';
import { type McitSkillServer, McitSkillStatus } from './types';

const tool = (name: string) => ({
  description: `${name} tool`,
  inputSchema: { type: 'object' },
  name,
});

const server = (identifier: string, tools?: McitSkillServer['tools']): McitSkillServer => ({
  identifier,
  isConnected: true,
  name: identifier,
  status: McitSkillStatus.CONNECTED,
  ...(tools ? { tools } : {}),
});

describe('mergeMcitSkillServers', () => {
  it('keeps a confirmed row’s tools when the response carries none', () => {
    const confirmed = [server('linear', [tool('createIssue')])];

    const merged = mergeMcitSkillServers(
      [server('linear')],
      createMcitSkillLocalIntent(),
      confirmed,
    );

    expect(merged).toHaveLength(1);
    expect(merged[0].tools).toEqual([tool('createIssue')]);
  });

  it('lets a fresh catalog replace the cached one', () => {
    const confirmed = [server('linear', [tool('createIssue')])];

    const merged = mergeMcitSkillServers(
      [server('linear', [tool('listIssues')])],
      createMcitSkillLocalIntent(),
      confirmed,
    );

    expect(merged[0].tools).toEqual([tool('listIssues')]);
  });

  it('does not attach cached tools to a provider the response no longer lists', () => {
    const confirmed = [server('linear', [tool('createIssue')])];

    const merged = mergeMcitSkillServers([], createMcitSkillLocalIntent(), confirmed);

    expect(merged).toEqual([]);
  });

  it('keeps the response reference when there is no cached catalog', () => {
    const incoming = [server('linear')];

    const merged = mergeMcitSkillServers(incoming, createMcitSkillLocalIntent(), []);

    expect(merged).toBe(incoming);
  });

  it('carries cached tools onto a pending add and still settles the intent', () => {
    const intent: McitSkillLocalIntent = createMcitSkillLocalIntent();
    intent.added.set('github', server('github'));

    // The response does not list the just-connected provider yet, and it also
    // drops the tools of the provider it does list.
    const merged = mergeMcitSkillServers([server('linear')], intent, [
      server('linear', [tool('createIssue')]),
      server('github', [tool('listIssues')]),
    ]);

    expect(merged.map((s) => s.identifier)).toEqual(['linear', 'github']);
    expect(merged[0].tools).toEqual([tool('createIssue')]);
    expect(merged[1].tools).toEqual([tool('listIssues')]);

    // Once the response echoes `github`, the pending add settles.
    const settled: McitSkillLocalIntent = createMcitSkillLocalIntent();
    settled.added.set('github', server('github'));
    mergeMcitSkillServers([server('linear'), server('github')], settled, []);

    expect(settled.added.size).toBe(0);
  });
});
