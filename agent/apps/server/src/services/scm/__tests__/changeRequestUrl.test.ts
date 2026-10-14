import { describe, expect, it } from 'vitest';

import { parseChangeRequestUrl } from '../changeRequestUrl';

describe('parseChangeRequestUrl', () => {
  it('reads a GitHub pull request URL, including a tab under it', () => {
    const expected = {
      number: 20171,
      provider: 'github',
      repoFullName: 'mcit/mcit',
      url: 'https://github.com/mcit/mcit/pull/20171',
    };
    expect(parseChangeRequestUrl('https://github.com/mcit/mcit/pull/20171')).toEqual(
      expected,
    );
    expect(
      parseChangeRequestUrl(' https://github.com/mcit/mcit/pull/20171/files?w=1#diff '),
    ).toEqual(expected);
  });

  it('rejects anything that does not name a pull request', () => {
    for (const value of [
      'not a url',
      'http://github.com/mcit/mcit/pull/1',
      'https://gitlab.com/mcit/mcit/pull/1',
      'https://github.com.evil.dev/mcit/mcit/pull/1',
      'https://github.com/mcit/mcit/issues/1',
      'https://github.com/mcit/mcit/pull/0',
      'https://github.com/mcit/mcit/pull/abc',
    ])
      expect(parseChangeRequestUrl(value)).toBeNull();
  });
});
