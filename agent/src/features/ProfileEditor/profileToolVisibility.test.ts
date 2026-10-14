import { describe, expect, it } from 'vitest';

import { getVisibleProfileToolIds } from './profileToolVisibility';

describe('getVisibleProfileToolIds', () => {
  it('excludes runtime-managed builtins, internal skills, and agent connectors', () => {
    const result = getVisibleProfileToolIds(
      ['tut-web-browsing', 'task', 'agent-connector', 'workspace-plugin'],
      {
        agentConnectorIdentifiers: new Set(['agent-connector']),
        nonConfigurableBuiltinToolIdentifiers: new Set(['tut-web-browsing']),
      },
    );

    expect(result).toEqual(['workspace-plugin']);
  });
});
