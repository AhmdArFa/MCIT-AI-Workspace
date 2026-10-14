import { describe, expect, it } from 'vitest';

import { resolveNavPanelKey } from './routeKey';

describe('resolveNavPanelKey', () => {
  it.each([
    ['/', null, 'home'],
    ['/tut-team', 'tut-team', 'home'],
    ['/tasks', null, 'home'],
    ['/tut-team/task/task-1', 'tut-team', 'home'],
    ['/agent/agent-1', null, 'agent'],
    ['/tut-team/agent/agent-1', 'tut-team', 'agent'],
    ['/agent/agent-1/docs', null, 'agent-docs'],
    ['/agent/agent-1/docs/docs-1', null, 'agent-docs'],
    ['/tut-team/agent/agent-1/docs/docs-1', 'tut-team', 'agent-docs'],
    ['/group/group-1', null, 'group'],
    ['/settings/profile', null, 'settings'],
    ['/tut-team/settings/general', 'tut-team', 'workspace-settings'],
    ['/tut-team/community', 'tut-team', 'discover'],
    ['/tut-team/resource', 'tut-team', 'resource'],
    ['/tut-team/resource/library', 'tut-team', 'resourceLibrary'],
    ['/tut-team/memory', 'tut-team', 'memory'],
    ['/tut-team/eval', 'tut-team', 'eval'],
    ['/tut-team/eval/bench/benchmark-1', 'tut-team', 'evalBench'],
    ['/tut-team/page/page-1', 'tut-team', 'page'],
    ['/project/project-1', null, 'project'],
    ['/tut-team/project/project-1/library/kb-1', 'tut-team', 'project'],
    ['/tut-team/image', 'tut-team', 'image'],
    ['/tut-team/video', 'tut-team', 'video'],
  ])('maps %s to %s', (pathname, activeWorkspaceSlug, expected) => {
    expect(resolveNavPanelKey(pathname, activeWorkspaceSlug)).toBe(expected);
  });
});
