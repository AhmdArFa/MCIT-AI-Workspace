import { createHash, timingSafeEqual } from 'node:crypto';

const safeEqual = (a: string, b: string) =>
  timingSafeEqual(createHash('sha256').update(a).digest(), createHash('sha256').update(b).digest());

/**
 * Server-to-server calls from the MCIT AI backend (admin console) carry the
 * shared MCIT_ADMIN_BOOTSTRAP_TOKEN. Browsers never see this token.
 */
export const verifyMcitAdminToken = (req: Request): boolean => {
  const expected = process.env.MCIT_ADMIN_BOOTSTRAP_TOKEN || '';
  if (!expected) return false;
  const provided = req.headers.get('x-mcit-bootstrap-token') || '';
  return Boolean(provided && safeEqual(provided, expected));
};
