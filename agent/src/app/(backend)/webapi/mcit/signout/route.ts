import { serverDB } from '@/database/server';
import { NextResponse } from 'next/server';
import { cookies, headers } from 'next/headers';

import { auth } from '@/auth';
import type { OIDCSessionCookieContext } from '@/libs/oidc-provider/session-cleanup';
import { safeReturnTo } from '@/libs/mcit/signout';
import { clearCurrentOIDCSession } from '@/libs/oidc-provider/session-cleanup';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /webapi/mcit/signout?return_to=<MCIT AI sign-in page>
 *
 * Single sign-out, Tut side. MCIT AI sends the browser here right after it
 * revokes its own session. This ends the Tut Agent session of the *current
 * browser only* (database row, secondary-storage entry and cookies) and
 * clears the OIDC provider session, then returns to MCIT AI. Sessions in
 * other browsers or on other devices are left alone.
 *
 * It must be a top-level GET: the session cookie is SameSite=Lax, so a
 * cross-site POST would arrive without it. Signing out is the only effect,
 * and `return_to` is restricted to the configured MCIT AI origins.
 */

export async function GET(req: Request) {
  const requested = new URL(req.url).searchParams.get('return_to');
  const target = safeReturnTo(requested) || new URL('/signin', req.url).toString();
  const response = NextResponse.redirect(target, { status: 302 });
  response.headers.set('Cache-Control', 'no-store');

  const cookieStore = await cookies();

  try {
    const cookieWrites: Parameters<OIDCSessionCookieContext['setCookie']>[] = [];
    await clearCurrentOIDCSession(serverDB, {
      getCookie: (name) => cookieStore.get(name)?.value ?? null,
      setCookie: (...args) => cookieWrites.push(args),
    });
    for (const write of cookieWrites) response.cookies.set(...write);
  } catch {
    // Not signed in to the OIDC provider: nothing to clear
  }

  try {
    // Deletes this session from the database and secondary storage and
    // returns the Set-Cookie headers that expire its cookies.
    const result = await auth.api.signOut({ asResponse: true, headers: await headers() });
    for (const cookie of result.headers.getSetCookie?.() ?? []) {
      response.headers.append('Set-Cookie', cookie);
    }
  } catch {
    // No active Tut session in this browser
  }

  // Belt and braces: expire every auth cookie this browser still holds, so
  // the short-lived session cookie cache cannot outlive the sign-out.
  for (const { name } of cookieStore.getAll()) {
    if (/(^|[._-])(session_token|session_data|dont_remember)$/.test(name)) {
      response.cookies.set(name, '', { maxAge: 0, path: '/' });
    }
  }

  return response;
}
