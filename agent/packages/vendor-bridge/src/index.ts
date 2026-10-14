/**
 * Vendor bridge (see NOTICE): the UI kit names a few exports after its
 * publisher. This file is the only place those upstream names appear; the
 * rest of the code base uses the neutral names below.
 */
export {
  type LobeCustomStylish as TutCustomStylish,
  type LobeCustomToken as TutCustomToken,
  lobeStaticStylish as tutStaticStylish,
} from '@lobehub/ui';

export { VENDOR_THEME, vendorClass, vendorVar } from './css';

/** Format of trusted-client secrets issued by the skill marketplace SDK. */
export const VENDOR_MARKET_SECRET_PREFIX = 'lobehub-market_tcs_';
