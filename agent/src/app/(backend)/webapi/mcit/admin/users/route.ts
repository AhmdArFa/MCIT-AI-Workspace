import { createHash, timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { serverDB } from '@/database/server';
import { users } from '@/database/schemas';
import { desc, eq } from 'drizzle-orm';
import { auth } from '@/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function safeEqual(a: string, b: string) {
  const ha = createHash('sha256').update(a).digest();
  const hb = createHash('sha256').update(b).digest();
  return timingSafeEqual(ha, hb);
}

function verifyAdminToken(req: Request): boolean {
  const expected = process.env.MCIT_ADMIN_BOOTSTRAP_TOKEN || '';
  if (!expected) return false;
  const provided = req.headers.get('x-mcit-bootstrap-token') || '';
  return Boolean(provided && safeEqual(provided, expected));
}

// GET: Return all users and system monitoring telemetry
export const GET = async (req: Request) => {
  if (!verifyAdminToken(req)) {
    return NextResponse.json(
      { error: 'Unauthorized. Admin bootstrap token required.' },
      { status: 401 },
    );
  }

  try {
    const userList = await serverDB
      .select({
        id: users.id,
        email: users.email,
        username: users.username,
        fullName: users.fullName,
        role: users.role,
        banned: users.banned,
        createdAt: users.createdAt,
        lastActiveAt: users.lastActiveAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt));

    // Check Ollama status & models
    let ollamaStatus = 'unreachable';
    let ollamaModels: string[] = [];
    try {
      const ollamaRes = await fetch('http://127.0.0.1:11434/api/tags', {
        signal: AbortSignal.timeout(3000),
      });
      if (ollamaRes.ok) {
        const oData = (await ollamaRes.json()) as { models?: Array<{ name: string }> };
        ollamaStatus = 'connected';
        ollamaModels = (oData.models || []).map((m) => m.name);
      }
    } catch {
      ollamaStatus = 'offline';
    }

    return NextResponse.json({
      users: userList,
      stats: {
        totalUsers: userList.length,
        adminCount: userList.filter((u) => u.role === 'admin').length,
        database: 'connected',
        ollamaStatus,
        ollamaModels,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to query admin users' },
      { status: 500 },
    );
  }
};

// POST: Create a new user (admin provisioning only)
export const POST = async (req: Request) => {
  if (!verifyAdminToken(req)) {
    return NextResponse.json(
      { error: 'Unauthorized. Admin bootstrap token required.' },
      { status: 401 },
    );
  }

  let body: { email?: string; password?: string; name?: string; role?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const email = (body.email || '').trim().toLowerCase();
  const password = body.password || '';
  const name = (body.name || '').trim();
  const role = body.role === 'admin' ? 'admin' : 'user';

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
  }
  if (!password || password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
  }

  const base = process.env.INTERNAL_APP_URL || process.env.APP_URL || 'http://127.0.0.1:3010';
  const origin = base.replace(/\/$/, '');

  try {
    let createdUser: { id?: string; email?: string; name?: string } | null = null;

    // Primary method: Direct Better Auth server API call
    try {
      const directResult = await auth.api.signUpEmail({
        body: {
          email,
          password,
          name: name || email.split('@')[0],
        },
      });
      if (directResult && 'user' in directResult && directResult.user) {
        createdUser = directResult.user;
      }
    } catch {
      // Direct call threw, proceed to HTTP fallback
    }

    // Fallback method: HTTP request with origin and admin headers
    if (!createdUser?.id) {
      const signUpRes = await fetch(`${origin}/api/auth/sign-up/email`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'origin': origin,
          'x-mcit-admin-internal': '1',
        },
        body: JSON.stringify({
          email,
          password,
          name: name || email.split('@')[0],
        }),
        signal: AbortSignal.timeout(30_000),
      });

      const data = await signUpRes.json().catch(() => ({}));
      if (!signUpRes.ok) {
        const msg =
          (data as { message?: string; error?: { message?: string } })?.message ||
          (data as { error?: { message?: string } })?.error?.message ||
          `Provisioning failed (${signUpRes.status})`;
        return NextResponse.json({ error: msg }, { status: signUpRes.status });
      }
      createdUser = data.user;
    }

    if (!createdUser?.id) {
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }

    // Update role if admin
    if (role === 'admin') {
      await serverDB.update(users).set({ role: 'admin' }).where(eq(users.id, createdUser.id));
    }

    return NextResponse.json({
      ok: true,
      user: {
        id: createdUser.id,
        email,
        name: name || email.split('@')[0],
        role,
      },
      message: `User ${email} created successfully.`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Provisioning failed' },
      { status: 500 },
    );
  }
};

// DELETE: Remove a user
export const DELETE = async (req: Request) => {
  if (!verifyAdminToken(req)) {
    return NextResponse.json(
      { error: 'Unauthorized. Admin bootstrap token required.' },
      { status: 401 },
    );
  }

  let body: { id?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const id = body.id;
  if (!id) {
    return NextResponse.json({ error: 'User id is required' }, { status: 400 });
  }

  try {
    await serverDB.delete(users).where(eq(users.id, id));
    return NextResponse.json({ ok: true, message: `User deleted successfully.` });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete user' },
      { status: 500 },
    );
  }
};
