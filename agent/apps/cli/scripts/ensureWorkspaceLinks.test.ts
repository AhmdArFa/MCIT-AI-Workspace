import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { ensureWorkspaceLinks } from './ensureWorkspaceLinks';

let workspace: string | undefined;

/**
 * Lays out a repo the way pnpm sees it: `packages/<name>` next to the CLI, with
 * the CLI declaring workspace dependencies on them.
 */
const createWorkspace = (dependencies: Record<string, string>) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'cli-workspace-links-'));
  workspace = root;

  const cliDir = path.join(root, 'apps', 'cli');
  fs.mkdirSync(path.join(cliDir, 'node_modules', '@tut'), { recursive: true });
  fs.writeFileSync(
    path.join(cliDir, 'package.json'),
    JSON.stringify({ devDependencies: dependencies, name: '@tut/cli' }),
  );

  return { cliDir, root };
};

const createPackage = (root: string, name: string) => {
  const packageDir = path.join(root, 'packages', name.replace('@tut/', ''));
  fs.mkdirSync(packageDir, { recursive: true });
  fs.writeFileSync(path.join(packageDir, 'package.json'), JSON.stringify({ name }));

  return packageDir;
};

afterEach(() => {
  if (workspace) fs.rmSync(workspace, { force: true, recursive: true });
  workspace = undefined;
});

describe('ensureWorkspaceLinks', () => {
  it('repoints a dangling link so the bundler can resolve the package', () => {
    const { cliDir, root } = createWorkspace({ '@tut/device-control': 'workspace:*' });
    const packageDir = createPackage(root, '@tut/device-control');

    // pnpm 12 writes this link with two extra `../` segments when apps/cli is
    // installed from a workspace root that lives elsewhere.
    const linkPath = path.join(cliDir, 'node_modules', '@tut', 'device-control');
    fs.symlinkSync('../../../../../../packages/device-control', linkPath, 'dir');
    expect(fs.existsSync(path.join(linkPath, 'package.json'))).toBe(false);

    const result = ensureWorkspaceLinks(cliDir);

    expect(result).toEqual({ missing: [], repaired: ['@tut/device-control'] });
    expect(fs.realpathSync(linkPath)).toBe(fs.realpathSync(packageDir));
  });

  it('creates a link that was never written', () => {
    const { cliDir, root } = createWorkspace({ '@tut/device-identity': 'workspace:*' });
    const packageDir = createPackage(root, '@tut/device-identity');

    const result = ensureWorkspaceLinks(cliDir);

    expect(result.repaired).toEqual(['@tut/device-identity']);
    expect(fs.realpathSync(path.join(cliDir, 'node_modules', '@tut', 'device-identity'))).toBe(
      fs.realpathSync(packageDir),
    );
  });

  it('leaves healthy links untouched and ignores registry dependencies', () => {
    const { cliDir, root } = createWorkspace({ '@tut/utils': 'workspace:*', 'ws': '^8.21.0' });
    const packageDir = createPackage(root, '@tut/utils');

    const linkPath = path.join(cliDir, 'node_modules', '@tut', 'utils');
    fs.symlinkSync(path.relative(path.dirname(linkPath), packageDir), linkPath, 'dir');

    expect(ensureWorkspaceLinks(cliDir)).toEqual({ missing: [], repaired: [] });
    expect(fs.lstatSync(linkPath).isSymbolicLink()).toBe(true);
  });

  it('reports a workspace dependency that has no package directory', () => {
    const { cliDir } = createWorkspace({ '@tut/gone': 'workspace:*' });

    expect(ensureWorkspaceLinks(cliDir)).toEqual({ missing: ['@tut/gone'], repaired: [] });
  });

  it('finds nested packages such as business/const', () => {
    const { cliDir, root } = createWorkspace({ '@tut/business-const': 'workspace:*' });
    const packageDir = path.join(root, 'packages', 'business', 'const');
    fs.mkdirSync(packageDir, { recursive: true });
    fs.writeFileSync(
      path.join(packageDir, 'package.json'),
      JSON.stringify({ name: '@tut/business-const' }),
    );

    expect(ensureWorkspaceLinks(cliDir).repaired).toEqual(['@tut/business-const']);
    expect(fs.realpathSync(path.join(cliDir, 'node_modules', '@tut', 'business-const'))).toBe(
      fs.realpathSync(packageDir),
    );
  });
});
