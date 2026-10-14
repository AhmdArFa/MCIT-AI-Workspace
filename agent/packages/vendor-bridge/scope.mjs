/**
 * Vendor bridge for build configs (see NOTICE).
 *
 * Source code imports the third-party UI kit through npm aliases under
 * `@mcit-vendor/*`. Bundlers and test runners see the files at their real
 * install path, so dependency lists (dedupe, prebundle, inline, transpile)
 * must name both. This is the one place the real scope is spelled out.
 */
export const VENDOR_ALIAS_SCOPE = '@mcit-vendor';
export const VENDOR_REAL_SCOPE = '@lobehub';

const ALIAS_PREFIX = `${VENDOR_ALIAS_SCOPE}/`;

/** `@mcit-vendor/ui` -> the package name it aliases. */
export const toRealName = (name) =>
  name.startsWith(ALIAS_PREFIX) ? `${VENDOR_REAL_SCOPE}/${name.slice(ALIAS_PREFIX.length)}` : name;

/** Adds the real name next to every alias in a dependency list. */
export const withVendorNames = (list) =>
  list.flatMap((item) =>
    typeof item === 'string' && item.startsWith(ALIAS_PREFIX) ? [item, toRealName(item)] : [item],
  );

/** Matches module ids inside the vendor scope, e.g. vendorPath('ui'). */
export const vendorPath = (sub = '') => new RegExp(`${VENDOR_REAL_SCOPE}\\/${sub}`);

/** CSS custom property emitted by a UI kit component (see src/css.ts). */
export const vendorVar = (name) => `--lobe-${name}`;
/** Class name rendered by a UI kit component. */
export const vendorClass = (name) => `lobe-${name}`;
