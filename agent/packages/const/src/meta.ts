import { BRANDING_LOGO_URL } from '@tut/business-const';
import type { MetaData } from '@tut/types';

/** Tut Agent — default MCIT agent avatar (same slot as upstream default agent). */
export const DEFAULT_AVATAR = '/avatars/mcit/tutankhamun.webp';
export const DEFAULT_USER_AVATAR = '👤';
export const DEFAULT_SUPERVISOR_AVATAR = '🎙️';
export const DEFAULT_SUPERVISOR_ID = 'supervisor';
export const DEFAULT_BACKGROUND_COLOR = undefined;
export const DEFAULT_AGENT_META: MetaData = {
  avatar: '/avatars/mcit/tutankhamun.webp',
  title: 'Tut Agent',
};
export const DEFAULT_INBOX_TITLE = 'Tut Agent';
export const DEFAULT_INBOX_AVATAR = BRANDING_LOGO_URL || '/avatars/mcit/tutankhamun.webp';
export const DEFAULT_USER_AVATAR_URL = BRANDING_LOGO_URL || '/avatars/mcit/tutankhamun.webp';
