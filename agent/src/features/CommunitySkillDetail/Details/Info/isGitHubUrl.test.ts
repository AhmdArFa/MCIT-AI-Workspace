import { describe, expect, it } from 'vitest';

import { isGitHubUrl } from './isGitHubUrl';

describe('isGitHubUrl', () => {
  it.each([
    'https://github.com/AhmdArFa/MCIT-Agent',
    'https://www.github.com/AhmdArFa/MCIT-Agent',
    'https://gist.github.com/example',
  ])('accepts GitHub hosts: %s', (url) => {
    expect(isGitHubUrl(url)).toBe(true);
  });

  it.each([
    'https://evilgithub.com/AhmdArFa/MCIT-Agent',
    'https://github.com.evil.example/mcit/mcit',
    'https://github.com@evil.example/mcit/mcit',
  ])('rejects hosts that only contain github.com: %s', (url) => {
    expect(isGitHubUrl(url)).toBe(false);
  });

  it.each([undefined, '', 'not-a-url'])('rejects invalid URLs: %s', (url) => {
    expect(isGitHubUrl(url)).toBe(false);
  });
});
