import { describe, expect, it } from 'vitest';

import { createMcit, DEFAULT_BASE_URL } from './index';

const captureFetch = () => {
  const requests: Request[] = [];
  const fetch = (async (input: Request) => {
    requests.push(input);
    return new Response(JSON.stringify({ status: 'ok' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  }) as typeof globalThis.fetch;
  return { fetch, requests };
};

describe('createMcit', () => {
  it('targets MCIT AI by default with bearer auth', async () => {
    const { fetch, requests } = captureFetch();
    const mcit = createMcit({ apiKey: 'sk-lh-test', fetch });

    const { data, response } = await mcit.health.check();

    expect(requests[0].url).toBe(`${DEFAULT_BASE_URL}/api/v1/health`);
    expect(requests[0].headers.get('authorization')).toBe('Bearer sk-lh-test');
    expect(response?.status).toBe(200);
    expect(data).toEqual({ status: 'ok' });
  });

  it('honors a custom baseURL and extra headers', async () => {
    const { fetch, requests } = captureFetch();
    const mcit = createMcit({
      apiKey: 'sk-lh-test',
      baseURL: 'http://localhost:3010',
      fetch,
      headers: { 'X-Custom': 'yes' },
    });

    await mcit.agents.list();

    expect(requests[0].url).toBe('http://localhost:3010/api/v1/agents');
    expect(requests[0].headers.get('authorization')).toBe('Bearer sk-lh-test');
    expect(requests[0].headers.get('x-custom')).toBe('yes');
  });

  it('serializes JSON bodies from typed resource calls', async () => {
    const { fetch, requests } = captureFetch();
    const mcit = createMcit({ apiKey: 'sk-lh-test', fetch });

    await mcit.agentGroups.create({ body: { name: 'group' } });

    expect(requests[0].method).toBe('POST');
    expect(requests[0].url).toBe(`${DEFAULT_BASE_URL}/api/v1/agent-groups`);
    expect(await requests[0].json()).toEqual({ name: 'group' });
  });

  it('substitutes path params in resource calls', async () => {
    const { fetch, requests } = captureFetch();
    const mcit = createMcit({ apiKey: 'sk-lh-test', fetch });

    await mcit.agents.get({ path: { id: 'agt_123' } });

    expect(requests[0].method).toBe('GET');
    expect(requests[0].url).toBe(`${DEFAULT_BASE_URL}/api/v1/agents/agt_123`);
  });

  it('preserves per-call Headers instances and tuple arrays on write methods', async () => {
    const { fetch, requests } = captureFetch();
    const mcit = createMcit({ apiKey: 'sk-lh-test', fetch });

    await mcit.agentGroups.create({
      body: { name: 'group' },
      headers: new Headers([['X-Trace', '1']]),
    });
    await mcit.agents.create({
      body: { systemRole: 'r', title: 't' },
      headers: [['X-Tuple', '2']],
    });

    expect(requests[0].headers.get('x-trace')).toBe('1');
    expect(requests[0].headers.get('content-type')).toBe('application/json');
    expect(requests[1].headers.get('x-tuple')).toBe('2');
    expect(requests[1].headers.get('content-type')).toBe('application/json');
  });

  it('normalizes tuple-array headers at client level and on read methods', async () => {
    const { fetch, requests } = captureFetch();
    const mcit = createMcit({
      apiKey: 'sk-lh-test',
      fetch,
      headers: [['X-Client', 'a']],
    });

    await mcit.agents.list({ headers: [['X-Call', 'b']] });

    expect(requests[0].headers.get('x-client')).toBe('a');
    expect(requests[0].headers.get('x-call')).toBe('b');
  });

  it('drops a client-default Content-Type on form-data uploads', async () => {
    const { fetch, requests } = captureFetch();
    const mcit = createMcit({
      apiKey: 'sk-lh-test',
      fetch,
      headers: { 'Content-Type': 'application/json' },
    });

    await mcit.files.create({ body: { file: new Blob(['x']) } });

    const contentType = requests[0].headers.get('content-type');
    expect(contentType).not.toBe('application/json');
    expect(contentType ?? 'multipart/form-data').toContain('multipart/form-data');
  });

  it('keeps client instances isolated between SDK instances', async () => {
    const a = captureFetch();
    const b = captureFetch();
    createMcit({ apiKey: 'sk-lh-a', fetch: a.fetch });
    const clientB = createMcit({ apiKey: 'sk-lh-b', baseURL: 'http://b.local', fetch: b.fetch });

    await clientB.users.me();

    expect(a.requests).toHaveLength(0);
    expect(b.requests[0].url).toBe('http://b.local/api/v1/users/me');
    expect(b.requests[0].headers.get('authorization')).toBe('Bearer sk-lh-b');
  });
});
