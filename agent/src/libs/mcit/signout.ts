/** Allow-list for where single sign-out may send the browser back to. */
export const allowedOrigins = (): string[] =>
  [process.env.MCIT_PUBLIC_URL, ...(process.env.AUTH_TRUSTED_ORIGINS || '').split(',')]
    .map((value) => (value || '').trim().replace(/\/$/, ''))
    .filter(Boolean);

export const safeReturnTo = (value: string | null, origins = allowedOrigins()): string | null => {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    return origins.includes(url.origin) ? url.toString() : null;
  } catch {
    return null;
  }
};
