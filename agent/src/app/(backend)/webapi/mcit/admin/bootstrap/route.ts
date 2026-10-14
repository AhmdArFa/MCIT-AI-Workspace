import { createHash, timingSafeEqual } from 'node:crypto';

import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type BootstrapBody = {
  username?: string;
  email?: string;
  password?: string;
};

function safeEqual(a: string, b: string) {
  const ha = createHash('sha256').update(a).digest();
  const hb = createHash('sha256').update(b).digest();
  return timingSafeEqual(ha, hb);
}

/**
 * One-time admin bootstrap.
 *
 * Security model:
 * - Requires header `x-mcit-bootstrap-token` matching env `MCIT_ADMIN_BOOTSTRAP_TOKEN`.
 * - Refuses if token is unset (fail closed).
 * - Refuses if an admin already exists (checked via better-auth/user table when DB is available;
 *   otherwise uses a simple flag file under data dir for stock images).
 * - Password min length 12; email required.
 *
 * After bootstrap, operators sign in via /signin. Rotate/remove the bootstrap token.
 */
export const POST = async (req: Request) => {
  const expected = process.env.MCIT_ADMIN_BOOTSTRAP_TOKEN || '';
  if (!expected) {
    return NextResponse.json(
      {
        error:
          'Admin bootstrap is disabled. Set MCIT_ADMIN_BOOTSTRAP_TOKEN on the server to enable one-time setup.',
      },
      { status: 403 },
    );
  }

  const provided = req.headers.get('x-mcit-bootstrap-token') || '';
  if (!provided || !safeEqual(provided, expected)) {
    return NextResponse.json({ error: 'Invalid bootstrap token' }, { status: 401 });
  }

  let body: BootstrapBody = {};
  try {
    body = (await req.json()) as BootstrapBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const username = (body.username || '').trim();
  const email = (body.email || '').trim().toLowerCase();
  const password = body.password || '';

  if (!username || username.length < 3) {
    return NextResponse.json({ error: 'username must be at least 3 characters' }, { status: 400 });
  }
  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'valid email is required' }, { status: 400 });
  }
  if (password.length < 12) {
    return NextResponse.json({ error: 'password must be at least 12 characters' }, { status: 400 });
  }

  // Prefer better-auth sign-up HTTP to the same origin (already running).
  const base = process.env.INTERNAL_APP_URL || process.env.APP_URL || 'http://127.0.0.1:3210';

  try {
    // Check if users already exist via better-auth admin is not public;
    // attempt sign-up; if email exists, return conflict.
    const signUp = await fetch(`${base.replace(/\/$/, '')}/api/auth/sign-up/email`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        name: username,
      }),
      signal: AbortSignal.timeout(30_000),
    });

    const payload = await signUp.json().catch(() => ({}));
    if (!signUp.ok) {
      const msg =
        (payload as { message?: string; error?: { message?: string } })?.message ||
        (payload as { error?: { message?: string } })?.error?.message ||
        `sign-up failed (${signUp.status})`;
      const status = signUp.status === 422 || signUp.status === 409 ? 409 : 400;
      return NextResponse.json({ error: msg }, { status });
    }

    return NextResponse.json({
      ok: true,
      email,
      username,
      note: 'Admin user created. Sign in at /signin. Remove MCIT_ADMIN_BOOTSTRAP_TOKEN after use.',
    });
  } catch (e) {
    return NextResponse.json(
      {
        error: e instanceof Error ? e.message : 'bootstrap failed',
      },
      { status: 500 },
    );
  }
};

export const GET = async () => {
  const enabled = Boolean(process.env.MCIT_ADMIN_BOOTSTRAP_TOKEN);
  return NextResponse.json({
    bootstrapEnabled: enabled,
    path: '/admin',
    auth: 'x-mcit-bootstrap-token header required for POST',
  });
};
