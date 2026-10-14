import { and, desc, eq, sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { serverDB } from '@/database/server';
import {
  files,
  generationBatches,
  generations,
  messages,
  topics,
  users,
} from '@/database/schemas';
import { account } from '@/database/schemas/betterAuth';
import { verifyMcitAdminToken } from '@/libs/mcit/adminToken';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /webapi/mcit/admin/user-activity?sub=<MCIT account id>&view=<view>
 *
 * Read-only feed for the MCIT AI admin console. Views: overview, chats,
 * messages (needs topicId), files, generations, usage.
 *
 * Isolation: the MCIT account is resolved to exactly one Tut user through
 * the OIDC link (provider generic-oidc, account id = MCIT subject), with
 * the account e-mail as fallback, and every query below is filtered by that
 * user id. Nothing here can return another person's data.
 */

const LIMIT = 200;

const resolveUserId = async (sub: string, email: string | null): Promise<string | null> => {
  const linked = await serverDB
    .select({ userId: account.userId })
    .from(account)
    .where(and(eq(account.providerId, 'generic-oidc'), eq(account.accountId, sub)))
    .limit(1);
  if (linked[0]) return linked[0].userId;
  if (!email) return null;
  const byEmail = await serverDB
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1);
  return byEmail[0]?.id ?? null;
};

// usage lives in messages.usage; rows written before that column existed keep it in metadata.usage
const usageOf = sql`coalesce(${messages.usage}, ${messages.metadata} -> 'usage')`;
const num = (path: string) => sql<number>`coalesce(sum((${usageOf} ->> ${path})::numeric), 0)`;

const views = {
  chats: (userId: string) =>
    serverDB
      .select({
        createdAt: topics.createdAt,
        id: topics.id,
        // qualified columns: inside the subquery a bare "id" would resolve to messages.id
        messageCount: sql<number>`(select count(*) from "messages" m where m."topic_id" = "topics"."id" and m."user_id" = ${userId})`.mapWith(Number),
        title: topics.title,
        updatedAt: topics.updatedAt,
      })
      .from(topics)
      .where(eq(topics.userId, userId))
      .orderBy(desc(topics.updatedAt))
      .limit(LIMIT),

  files: (userId: string) =>
    serverDB
      .select({
        createdAt: files.createdAt,
        fileType: files.fileType,
        id: files.id,
        name: files.name,
        size: files.size,
        source: files.source,
      })
      .from(files)
      .where(eq(files.userId, userId))
      .orderBy(desc(files.createdAt))
      .limit(LIMIT),

  generations: (userId: string) =>
    serverDB
      .select({
        createdAt: generations.createdAt,
        id: generations.id,
        model: generationBatches.model,
        prompt: generationBatches.prompt,
        provider: generationBatches.provider,
      })
      .from(generations)
      .innerJoin(generationBatches, eq(generations.generationBatchId, generationBatches.id))
      .where(and(eq(generations.userId, userId), eq(generationBatches.userId, userId)))
      .orderBy(desc(generations.createdAt))
      .limit(LIMIT),

  usage: (userId: string) =>
    serverDB
      .select({
        cost: num('cost'),
        inputTokens: num('totalInputTokens'),
        model: messages.model,
        outputTokens: num('totalOutputTokens'),
        provider: messages.provider,
        requests: sql<number>`count(*)`,
        totalTokens: num('totalTokens'),
      })
      .from(messages)
      .where(and(eq(messages.userId, userId), eq(messages.role, 'assistant')))
      .groupBy(messages.model, messages.provider)
      .orderBy(desc(num('totalTokens'))),
};

const count = async (table: typeof topics | typeof files | typeof generations, userId: string) =>
  Number(
    (
      await serverDB
        .select({ n: sql<number>`count(*)` })
        .from(table)
        .where(eq(table.userId, userId))
    )[0]?.n ?? 0,
  );

export const GET = async (req: Request) => {
  if (!verifyMcitAdminToken(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const params = new URL(req.url).searchParams;
  const sub = params.get('sub') || '';
  const view = params.get('view') || 'overview';
  if (!sub) return NextResponse.json({ error: 'sub is required' }, { status: 400 });

  try {
    const userId = await resolveUserId(sub, params.get('email'));
    // The person has not opened Tut Agent yet: an empty workspace, not an error
    if (!userId) return NextResponse.json({ linked: false });

    if (view === 'overview') {
      const usage = await views.usage(userId);
      const sum = (key: 'inputTokens' | 'outputTokens' | 'requests' | 'totalTokens') =>
        usage.reduce((total, row) => total + Number(row[key] || 0), 0);
      return NextResponse.json({
        counts: {
          chats: await count(topics, userId),
          files: await count(files, userId),
          generations: await count(generations, userId),
        },
        linked: true,
        usage: {
          input_tokens: sum('inputTokens'),
          output_tokens: sum('outputTokens'),
          requests: sum('requests'),
          total_tokens: sum('totalTokens'),
        },
      });
    }

    if (view === 'messages') {
      const topicId = params.get('topicId') || '';
      const owned = await serverDB
        .select({ id: topics.id })
        .from(topics)
        .where(and(eq(topics.id, topicId), eq(topics.userId, userId)))
        .limit(1);
      if (!owned[0]) return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
      const rows = await serverDB
        .select({
          content: messages.content,
          createdAt: messages.createdAt,
          model: messages.model,
          role: messages.role,
          usage: usageOf,
        })
        .from(messages)
        .where(and(eq(messages.topicId, topicId), eq(messages.userId, userId)))
        .orderBy(messages.createdAt)
        .limit(1000);
      return NextResponse.json({ linked: true, messages: rows });
    }

    if (view in views) {
      const rows = await views[view as keyof typeof views](userId);
      return NextResponse.json({ linked: true, [view]: rows });
    }
    return NextResponse.json({ error: 'Unknown view' }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Query failed' },
      { status: 500 },
    );
  }
};
