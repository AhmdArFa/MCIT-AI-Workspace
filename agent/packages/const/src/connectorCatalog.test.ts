import { describe, expect, it } from 'vitest';

import { getComposioAppByIdentifier } from './composio';
import { getConnectorCatalog, resolveConnectorCatalogItem } from './connectorCatalog';

describe('connectorCatalog', () => {
  /**
   * @example Generic connector surfaces render one canonical owner for overlapping identifiers.
   */
  it('prefers MCIT AI for GitHub, Notion, and X collisions', () => {
    // ROOT CAUSE:
    //
    // The onboarding flow added GitHub, Notion, and X to the raw Composio capability catalog.
    // Generic connector surfaces then concatenated that catalog with MCIT AI providers, producing
    // duplicate rows and sending unqualified agent plugin IDs through Composio authorization.
    //
    // Before: github/notion/twitter each resolved to both MCIT AI and Composio.
    // After: each unqualified identifier resolves once, with MCIT AI as its canonical owner.
    const catalog = getConnectorCatalog({ composio: true, mcit: true });

    for (const identifier of ['github', 'notion', 'twitter']) {
      const matches = catalog.filter((item) =>
        item.type === 'mcit'
          ? item.provider.id === identifier
          : item.serverType.identifier === identifier,
      );
      expect(matches).toHaveLength(1);
      expect(matches[0]?.type).toBe('mcit');
    }
  });

  /** @example GitHub cannot resolve to a legacy Composio authorization path. */
  it('excludes GitHub from the raw Composio capability lookup', () => {
    expect(getComposioAppByIdentifier('github')).toBeUndefined();
  });

  /**
   * @example A disabled canonical owner does not expose a conflicting fallback authorization path.
   */
  it('does not fall back to Composio when an overlapping MCIT AI owner is disabled', () => {
    const catalog = getConnectorCatalog({ composio: true, mcit: false });

    for (const identifier of ['github', 'notion', 'twitter']) {
      expect(
        catalog.some((item) =>
          item.type === 'mcit'
            ? item.provider.id === identifier
            : item.serverType.identifier === identifier,
        ),
      ).toBe(false);
    }

    expect(
      resolveConnectorCatalogItem('twitter', { composio: true, mcit: false }),
    ).toBeUndefined();
    expect(resolveConnectorCatalogItem('gmail', { composio: true, mcit: false })).toMatchObject({
      type: 'composio',
    });
  });
});
