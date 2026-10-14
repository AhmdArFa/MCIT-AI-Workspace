import { describe, expect, it } from 'vitest';

import { buildAgentDocumentUrl } from './url';

describe('buildAgentDocumentUrl', () => {
  it('strips the docs_ prefix to match the route param', () => {
    expect(
      buildAgentDocumentUrl('https://mcit.gov.eg', 'agt_9GOn6nUgGw35', 'docs_MWkYMvbvzssoyWZ9'),
    ).toBe('https://mcit.gov.eg/agent/agt_9GOn6nUgGw35/docs/MWkYMvbvzssoyWZ9');
  });

  it('keeps ids that have no prefix as-is', () => {
    expect(buildAgentDocumentUrl('https://mcit.gov.eg', 'agt_x', 'MWkYMvbvzssoyWZ9')).toBe(
      'https://mcit.gov.eg/agent/agt_x/docs/MWkYMvbvzssoyWZ9',
    );
  });

  it('trims a trailing slash from the origin', () => {
    expect(buildAgentDocumentUrl('https://mcit.gov.eg/', 'agt_x', 'docs_y')).toBe(
      'https://mcit.gov.eg/agent/agt_x/docs/y',
    );
  });

  it('trims multiple trailing slashes from the origin without a regexp', () => {
    expect(buildAgentDocumentUrl('https://mcit.gov.eg///', 'agt_x', 'docs_y')).toBe(
      'https://mcit.gov.eg/agent/agt_x/docs/y',
    );
  });

  it('prefixes the standalone route with a workspace slug when provided', () => {
    expect(
      buildAgentDocumentUrl('https://mcit.gov.eg', 'agt_x', 'docs_y', {
        workspaceSlug: 'tut-team',
      }),
    ).toBe('https://mcit.gov.eg/tut-team/agent/agt_x/docs/y');
  });

  it('returns undefined when no origin is available', () => {
    expect(buildAgentDocumentUrl(undefined, 'agt_x', 'docs_y')).toBeUndefined();
    expect(buildAgentDocumentUrl('', 'agt_x', 'docs_y')).toBeUndefined();
    expect(buildAgentDocumentUrl('/', 'agt_x', 'docs_y')).toBeUndefined();
  });
});
