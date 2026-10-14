import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = async () => {
  const ollamaBase =
    process.env.OLLAMA_PROXY_URL?.replace(/\/$/, '') ||
    process.env.OLLAMA_HOST ||
    'http://127.0.0.1:11434';

  try {
    const res = await fetch(`${ollamaBase}/api/tags`, {
      signal: AbortSignal.timeout(4000),
    });

    if (!res.ok) {
      return NextResponse.json(
        {
          connected: false,
          models: ['gemma4:e4b', 'qwen2.5:7b', 'qwen2.5:14b', 'qwen3:4b-instruct'],
          error: `Ollama responded with HTTP ${res.status}`,
        },
        { status: 200 },
      );
    }

    const data = (await res.json()) as {
      models?: Array<{ name: string; size?: number; modified_at?: string }>;
    };

    const models = (data.models || []).map((m) => ({
      name: m.name,
      size: m.size,
      modified: m.modified_at,
      displayName: m.name.replace(':latest', ''),
    }));

    return NextResponse.json({
      connected: true,
      provider: 'ollama',
      defaultModel: 'gemma4:e4b',
      models,
    });
  } catch (error) {
    return NextResponse.json({
      connected: false,
      provider: 'ollama',
      defaultModel: 'gemma4:e4b',
      models: [
        { name: 'gemma4:e4b', displayName: 'Gemma 4 e4b (Default)' },
        { name: 'qwen2.5:7b', displayName: 'Qwen 2.5 7B' },
        { name: 'qwen2.5:14b', displayName: 'Qwen 2.5 14B' },
        { name: 'qwen3:4b-instruct', displayName: 'Qwen 3 4B Instruct' },
      ],
      warning: error instanceof Error ? error.message : 'Ollama host not reachable',
    });
  }
};
