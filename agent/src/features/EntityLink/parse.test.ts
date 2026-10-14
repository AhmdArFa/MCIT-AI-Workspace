import { describe, expect, it } from 'vitest';

import { parseTutLink } from './parse';

describe('parseTutLink', () => {
  it('parses github pull request', () => {
    expect(parseTutLink('https://github.com/AhmdArFa/MCIT-Agent/pull/15557')).toEqual({
      canonicalLabel: 'AhmdArFa/MCIT-Agent#15557',
      kind: 'github',
    });
  });

  it('parses github issue', () => {
    expect(parseTutLink('https://github.com/AhmdArFa/MCIT-Agent/issues/15554')).toEqual({
      canonicalLabel: 'AhmdArFa/MCIT-Agent#15554',
      kind: 'github',
    });
  });

  it('parses github commit (short sha)', () => {
    expect(parseTutLink('https://github.com/AhmdArFa/MCIT-Agent/commit/d36aa75701abc')).toEqual({
      canonicalLabel: 'AhmdArFa/MCIT-Agent@d36aa75',
      kind: 'github',
    });
  });

  it('parses github repo root', () => {
    expect(parseTutLink('https://github.com/AhmdArFa/MCIT-Agent')).toEqual({
      canonicalLabel: 'AhmdArFa/MCIT-Agent',
      kind: 'github',
    });
  });

  it('parses linear issue', () => {
    expect(parseTutLink('https://linear.app/mcit/issue/TST-10001/codex-pptx-preview')).toEqual({
      canonicalLabel: 'TST-10001',
      kind: 'linear',
    });
  });

  it('parses github user / org pages with the github icon', () => {
    expect(parseTutLink('https://github.com/AhmdArFa')).toEqual({
      canonicalLabel: 'AhmdArFa',
      kind: 'github',
    });
  });

  it('uses the full URL as label for generic http links', () => {
    expect(parseTutLink('https://example.com/foo')).toEqual({
      canonicalLabel: 'https://example.com/foo',
      domain: 'example.com',
      kind: 'generic',
    });
    // bare github.com (no owner) → generic
    expect(parseTutLink('https://github.com')?.kind).toBe('generic');
  });

  it('labels npm packages by package name', () => {
    expect(parseTutLink('https://www.npmjs.com/package/@tut/ui')).toEqual({
      canonicalLabel: '@tut/ui',
      domain: 'npmjs.com',
      kind: 'generic',
    });
    expect(parseTutLink('https://www.npmjs.com/package/react/v/18.0.0')?.canonicalLabel).toBe(
      'react',
    );
  });

  it('labels figma links by file name', () => {
    expect(parseTutLink('https://www.figma.com/file/abc123/Design-File')?.canonicalLabel).toBe(
      'Design File',
    );
    expect(parseTutLink('https://www.figma.com/design/abc123/My-Board')?.canonicalLabel).toBe(
      'My Board',
    );
  });

  it('parses mailto links as email', () => {
    expect(parseTutLink('mailto:hi@example.com')).toEqual({
      canonicalLabel: 'hi@example.com',
      kind: 'email',
    });
    expect(parseTutLink('mailto:hi@example.com?subject=Hello')?.canonicalLabel).toBe(
      'hi@example.com',
    );
  });

  it('keeps root-relative links for the internal-link renderer', () => {
    expect(parseTutLink('/foo/bar')).toEqual({
      canonicalLabel: '/foo/bar',
      kind: 'generic',
    });
  });

  it('ignores citation, footnote and non-http hrefs', () => {
    expect(parseTutLink('citation-1')).toBeNull();
    expect(parseTutLink('#user-content-fn-1')).toBeNull();
    expect(parseTutLink(undefined)).toBeNull();
  });
});
