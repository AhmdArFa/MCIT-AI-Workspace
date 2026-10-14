/**
 * Avatar sizes are designed for desktop. On phones the same pixel sizes eat
 * the narrow message column and session rows, so they step down:
 * hero-sized avatars (64px and up) scale to three quarters, list and message
 * avatars (32-63px) lose 8px but never drop below 28px, and small inline
 * avatars stay as they are.
 */
export const responsiveAvatarSize = (size: number, mobile: boolean): number => {
  if (!mobile) return size;
  if (size >= 64) return Math.round(size * 0.75);
  if (size >= 32) return Math.max(28, size - 8);
  return size;
};
