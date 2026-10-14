/** Bundled MCIT agent avatar gallery (local static assets only — no runtime GitHub fetch). */
export const MCIT_AVATAR_GALLERY = [
  {
    id: 'tut',
    label: 'Tut Agent',
    src: '/avatars/mcit/tutankhamun.webp',
    isDefault: true,
  },
  { id: 'thoth', label: 'Thoth', src: '/avatars/mcit/thoth-avatar.webp' },
  { id: 'cleopatra', label: 'Cleopatra', src: '/avatars/mcit/cleopatra.webp' },
  { id: 'nefertiti', label: 'Nefertiti', src: '/avatars/mcit/nefertiti.webp' },
  { id: 'nefertari', label: 'Nefertari', src: '/avatars/mcit/nefertari.webp' },
  { id: 'hatshepsut', label: 'Hatshepsut', src: '/avatars/mcit/hatshepsut.webp' },
  { id: 'ramesses', label: 'Ramesses', src: '/avatars/mcit/ramesses.webp' },
  { id: 'akhenaten', label: 'Akhenaten', src: '/avatars/mcit/akhenaten.webp' },
  { id: 'khufu', label: 'Khufu', src: '/avatars/mcit/khufu.webp' },
] as const;

export const MCIT_DEFAULT_AVATAR = MCIT_AVATAR_GALLERY[0].src;
export const MCIT_DEFAULT_AGENT_NAME = 'Tut Agent';

/** Chat / list avatar sizes aligned with Tut design tokens (readable, not tiny). */
export const MCIT_AVATAR_SIZE = {
  chat: 40,
  header: 32,
  home: 96,
  profile: 96,
  sidebar: 36,
} as const;
