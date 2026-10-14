/**
 * Vendor bridge (see NOTICE): CSS names the UI kit emits itself.
 * Use these instead of spelling the vendor's class or variable prefix.
 */
const PREFIX = 'lobe' as const;

/** CSS custom property set or read by a UI kit component, e.g. vendorVar('flex-gap'). */
export const vendorVar = (name: string) => `--${PREFIX}-${name}`;

/** Class name a UI kit component renders, e.g. vendorClass('flex'). */
export const vendorClass = <T extends string>(name: T) => `${PREFIX}-${name}` as `${typeof PREFIX}-${T}`;

/** Built-in highlighter / mermaid theme shipped by the UI kit. */
export const VENDOR_THEME = vendorClass('theme');
