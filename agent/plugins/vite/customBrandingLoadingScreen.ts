// Deep import on purpose: the package root barrel uses extensionless relative
// imports that Node's type-stripping loader (which evaluates externalized
// config-time imports) cannot resolve. branding.ts is a dependency-free leaf
// exposed via the './branding' subpath — keep it import-free.
import { BRANDING_NAME } from '@tut/business-const/branding';
import type { Plugin } from 'vite';

const LOADING_BRAND_BLOCK = /<div id="loading-brand"[^>]*>[\S\s]*?<\/div>/;

const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

/**
 * Replace the bundled wordmark artwork in the static loading screen with the
 * brand name as text (MCIT AI by default), so no other logo flashes before
 * the SPA boots.
 */
export const customBrandingLoadingScreen = (): Plugin => ({
  name: 'custom-branding-loading-screen',
  transformIndexHtml: {
    handler(html) {
      return html.replace(
        LOADING_BRAND_BLOCK,
        `<div id="loading-brand" aria-label="Loading" role="status" style="font-size: 26px; font-weight: 700; letter-spacing: 0.02em;">${escapeHtml(
          BRANDING_NAME,
        )}</div>`,
      );
    },
    order: 'pre',
  },
});
