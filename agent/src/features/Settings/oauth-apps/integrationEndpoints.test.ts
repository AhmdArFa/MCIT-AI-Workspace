import { describe, expect, it } from 'vitest';

import { getIntegrationEndpoints, resolveIssuer } from './integrationEndpoints';

describe('getIntegrationEndpoints', () => {
  it('gives a web app the authorization-code endpoints', () => {
    expect(getIntegrationEndpoints('https://mcit.gov.eg/oidc', 'web')).toEqual([
      { key: 'issuer', url: 'https://mcit.gov.eg/oidc' },
      {
        key: 'discovery',
        url: 'https://mcit.gov.eg/oidc/.well-known/openid-configuration',
      },
      { key: 'authorization', url: 'https://mcit.gov.eg/oidc/auth' },
      { key: 'token', url: 'https://mcit.gov.eg/oidc/token' },
    ]);
  });

  it('gives a device app the device authorization endpoint instead', () => {
    const endpoints = getIntegrationEndpoints('http://localhost:3010/oidc/', 'native');

    expect(endpoints.map((e) => e.key)).toEqual([
      'issuer',
      'discovery',
      'deviceAuthorization',
      'token',
    ]);
    expect(endpoints[0].url).toBe('http://localhost:3010/oidc');
    expect(endpoints[2].url).toBe('http://localhost:3010/oidc/device/auth');
  });

  it('keeps the configured issuer verbatim, including a reverse-proxy path prefix', () => {
    const endpoints = getIntegrationEndpoints('https://example.com/tut/oidc', 'web');

    expect(endpoints[0].url).toBe('https://example.com/tut/oidc');
    expect(endpoints[1].url).toBe('https://example.com/tut/oidc/.well-known/openid-configuration');
    expect(endpoints[3].url).toBe('https://example.com/tut/oidc/token');
  });
});

describe('resolveIssuer', () => {
  it("prefers the server's configured issuer", () => {
    expect(resolveIssuer('https://auth.example.com/tut/oidc', 'app://renderer')).toBe(
      'https://auth.example.com/tut/oidc',
    );
  });

  it('falls back to the app origin (the connected server on desktop) for an older server', () => {
    expect(resolveIssuer(undefined, 'https://my-mcit.example.com')).toBe(
      'https://my-mcit.example.com/oidc',
    );
    expect(resolveIssuer(undefined, 'https://my-mcit.example.com/')).toBe(
      'https://my-mcit.example.com/oidc',
    );
  });
});
