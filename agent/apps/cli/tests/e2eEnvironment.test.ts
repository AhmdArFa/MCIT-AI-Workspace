import { describe, expect, it } from 'vitest';

import { validateE2EEnvironment } from './e2eEnvironment';

const selectedEnvironment = {
  MCIT_CLI_HOME: '.mcit-e2e',
  MCIT_E2E_ALLOW_WRITES: '1',
  MCIT_SERVER: 'http://localhost:3010',
};

describe('live E2E environment', () => {
  it('requires explicit write authorization', () => {
    expect(() =>
      validateE2EEnvironment({ ...selectedEnvironment, MCIT_E2E_ALLOW_WRITES: undefined }),
    ).toThrow('ALLOW_WRITES');
  });

  it.each([undefined, '', '.mcit', '/tmp/../home/.mcit/'])(
    'rejects an absent or default home: %s',
    (home) => {
      expect(() =>
        validateE2EEnvironment({ ...selectedEnvironment, MCIT_CLI_HOME: home }),
      ).toThrow('dedicated');
    },
  );

  it.each([undefined, 'file:///tmp/server', 'https://user:secret@example.test'])(
    'rejects a missing or unsafe server: %s',
    (server) => {
      expect(() =>
        validateE2EEnvironment({ ...selectedEnvironment, MCIT_SERVER: server }),
      ).toThrow();
    },
  );

  it('preserves the selected home and environment', () => {
    const env = Object.freeze({ ...selectedEnvironment });
    expect(() => validateE2EEnvironment(env)).not.toThrow();
    expect(env).toEqual(selectedEnvironment);
  });
});
