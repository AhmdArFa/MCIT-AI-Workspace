import { describe, expect, it } from 'vitest';

import { TutAgentManifest } from './manifest';
import { resolveTutAgentManifest } from './resolveManifest';
import { systemPromptWithoutSubAgent } from './systemRole';
import { TutAgentApiName } from './types';

const apiNames = (manifest: { api: { name: string }[] }) => manifest.api.map((a) => a.name);

describe('resolveTutAgentManifest', () => {
  it('returns the full static manifest in a normal (main, non-sub-agent) turn', () => {
    const result = resolveTutAgentManifest({ scope: 'main' });

    // identical reference — no trimming, no clone
    expect(result).toBe(TutAgentManifest);
    expect(apiNames(result!)).toContain(TutAgentApiName.callSubAgent);
    // full prompt still describes sub-agent dispatch
    expect(result!.systemRole).toContain('callSubAgent');
  });

  it('returns the full manifest when no context signals are set', () => {
    expect(resolveTutAgentManifest({})).toBe(TutAgentManifest);
  });

  it.each(['group', 'group_agent'])(
    'hides callSubAgent in both api and systemRole (keeping plan/todo/visual) in scope %s',
    (scope) => {
      const result = resolveTutAgentManifest({ scope })!;

      const names = apiNames(result);
      expect(names).not.toContain(TutAgentApiName.callSubAgent);
      // the rest of tut-agent stays available
      expect(names).toContain(TutAgentApiName.createPlan);
      expect(names).toContain(TutAgentApiName.createTodos);
      expect(names).toContain(TutAgentApiName.analyzeMedia);
      // exactly one API removed
      expect(names).toHaveLength(TutAgentManifest.api.length - 1);

      // systemRole is rewritten so the prompt no longer mentions the hidden tool
      expect(result.systemRole).toBe(systemPromptWithoutSubAgent);
      expect(result.systemRole).not.toContain('callSubAgent');
      expect(result.systemRole).not.toContain('sub_agents');
      // plan/todo guidance survives in the rewritten prompt
      expect(result.systemRole).toContain('plan_and_todos');

      // non-api fields preserved
      expect(result.identifier).toBe(TutAgentManifest.identifier);
    },
  );

  it('hides callSubAgent (api + systemRole) inside a sub-agent run regardless of scope', () => {
    const result = resolveTutAgentManifest({ isSubAgent: true, scope: 'main' })!;

    expect(apiNames(result)).not.toContain(TutAgentApiName.callSubAgent);
    expect(apiNames(result)).toContain(TutAgentApiName.createPlan);
    expect(result.systemRole).not.toContain('callSubAgent');
  });

  it('does not mutate the original static manifest', () => {
    const before = TutAgentManifest.api.length;
    resolveTutAgentManifest({ scope: 'group' });
    expect(TutAgentManifest.api).toHaveLength(before);
    // the full manifest's systemRole still describes sub-agent dispatch
    expect(TutAgentManifest.systemRole).toContain('callSubAgent');
  });
});
