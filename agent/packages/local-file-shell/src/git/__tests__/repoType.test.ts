import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { afterEach, beforeEach, expect, it } from 'vitest';

import { detectGitHubRepository } from '../repoType';

let root: string;
beforeEach(async () => {
  root = await mkdtemp(path.join(os.tmpdir(), 'project-repository-'));
  await mkdir(path.join(root, '.git'));
});
afterEach(async () => {
  await rm(root, { recursive: true, force: true });
});
it.each([
  'git@github.com:mcit/mcit.git',
  'https://secret-token@github.com/AhmdArFa/MCIT-Agent.git',
  'ssh://git@github.com/AhmdArFa/MCIT-Agent.git',
])('returns only repository identity for %s', async (remote) => {
  await writeFile(path.join(root, '.git/config'), `[remote "origin"]\n url = ${remote}\n`);
  expect(await detectGitHubRepository(root)).toBe('https://github.com/AhmdArFa/MCIT-Agent');
});
it('does not use another remote or a look-alike host', async () => {
  await writeFile(
    path.join(root, '.git/config'),
    '[remote "origin"]\n url = https://evilgithub.com/a/b\n[remote "upstream"]\n url = https://github.com/a/b\n',
  );
  expect(await detectGitHubRepository(root)).toBeUndefined();
});
it('resolves a linked worktree to the common origin', async () => {
  await writeFile(
    path.join(root, '.git/config'),
    '[remote "origin"]\n url = git@github.com:a/b.git\n',
  );
  await mkdir(path.join(root, '.git/worktrees/feature'), { recursive: true });
  await writeFile(path.join(root, '.git/worktrees/feature/commondir'), '../..');
  await mkdir(path.join(root, 'feature'));
  await writeFile(
    path.join(root, 'feature/.git'),
    `gitdir: ${path.join(root, '.git/worktrees/feature')}`,
  );
  expect(await detectGitHubRepository(path.join(root, 'feature'))).toBe('https://github.com/a/b');
});
