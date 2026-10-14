#!/usr/bin/env node
/**
 * MCIT features sidecar — Studio generation + admin bootstrap.
 * Listens on MCIT_FEATURES_PORT (default 3215). Proxy /webapi/mcit/* here when needed.
 */
const http = require('http');
const { createHash, timingSafeEqual, randomBytes } = require('crypto');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.MCIT_FEATURES_PORT || 3215);
const OLLAMA = (process.env.OLLAMA_PROXY_URL || 'http://127.0.0.1:11434').replace(/\/$/, '');
const MODEL = process.env.MCIT_STUDIO_MODEL || process.env.OLLAMA_CHAT_MODEL || 'qwen2.5:7b';
const BOOTSTRAP = process.env.MCIT_ADMIN_BOOTSTRAP_TOKEN || '';
const APP = (process.env.INTERNAL_APP_URL || 'http://127.0.0.1:3210').replace(/\/$/, '');
const FLAG = process.env.MCIT_ADMIN_FLAG_FILE || '/tmp/mcit-admin-bootstrapped.flag';

function json(res, code, body) {
  const data = JSON.stringify(body);
  res.writeHead(code, {
    'content-type': 'application/json',
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'content-type,x-mcit-bootstrap-token',
    'access-control-allow-methods': 'GET,POST,OPTIONS',
  });
  res.end(data);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'));
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

function safeEqual(a, b) {
  const ha = createHash('sha256').update(String(a)).digest();
  const hb = createHash('sha256').update(String(b)).digest();
  return timingSafeEqual(ha, hb);
}

function fallbackDraft(format, topic) {
  if (format === 'pptx') {
    return `# Presentation: ${topic}\n\n## Slide 1 — Title\n- ${topic}\n- MCIT AI Studio\n\n## Slide 2 — Context\n- Goals\n- Stakeholders\n\n## Slide 3 — Recommendations\n- Actions\n- Owners`;
  }
  if (format === 'infograph') {
    return `# Infograph: ${topic}\nHeadline: ${topic}\nCallouts: Scope · Impact · Timeline · Owners\nFooter: MCIT AI Studio`;
  }
  return `# Report: ${topic}\n\n## Executive summary\n…\n\n## Analysis\n…\n\n## Recommendations\n1. …\n2. …`;
}

async function ollamaGenerate(prompt) {
  const res = await fetch(`${OLLAMA}/api/generate`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ model: MODEL, prompt, stream: false }),
    signal: AbortSignal.timeout(120000),
  });
  if (!res.ok) throw new Error(`ollama ${res.status}`);
  const data = await res.json();
  return (data.response || '').trim();
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return json(res, 204, {});

  const url = new URL(req.url || '/', `http://127.0.0.1:${PORT}`);

  if (req.method === 'GET' && url.pathname === '/health') {
    return json(res, 200, { ok: true, service: 'mcit-features' });
  }

  if (req.method === 'GET' && url.pathname === '/webapi/mcit/admin/bootstrap') {
    return json(res, 200, {
      bootstrapEnabled: Boolean(BOOTSTRAP) && !fs.existsSync(FLAG),
      path: '/admin',
    });
  }

  if (req.method === 'POST' && url.pathname === '/webapi/mcit/admin/bootstrap') {
    if (!BOOTSTRAP) return json(res, 403, { error: 'Bootstrap disabled (set MCIT_ADMIN_BOOTSTRAP_TOKEN)' });
    if (fs.existsSync(FLAG)) return json(res, 409, { error: 'Admin already bootstrapped on this host' });
    const token = req.headers['x-mcit-bootstrap-token'] || '';
    if (!token || !safeEqual(token, BOOTSTRAP)) return json(res, 401, { error: 'Invalid bootstrap token' });
    let body;
    try {
      body = await readBody(req);
    } catch {
      return json(res, 400, { error: 'Invalid JSON' });
    }
    const username = String(body.username || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    if (username.length < 3) return json(res, 400, { error: 'username too short' });
    if (!email.includes('@')) return json(res, 400, { error: 'valid email required' });
    if (password.length < 12) return json(res, 400, { error: 'password min 12 chars' });
    try {
      const signUp = await fetch(`${APP}/api/auth/sign-up/email`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, password, name: username }),
        signal: AbortSignal.timeout(30000),
      });
      const payload = await signUp.json().catch(() => ({}));
      if (!signUp.ok) {
        return json(res, signUp.status === 422 ? 409 : 400, {
          error: payload.message || payload.error?.message || `sign-up failed (${signUp.status})`,
        });
      }
      fs.writeFileSync(FLAG, new Date().toISOString());
      return json(res, 200, { ok: true, email, username });
    } catch (e) {
      return json(res, 500, { error: e.message || 'bootstrap failed' });
    }
  }

  if (req.method === 'POST' && url.pathname === '/webapi/mcit/studio') {
    let body;
    try {
      body = await readBody(req);
    } catch {
      return json(res, 400, { error: 'Invalid JSON' });
    }
    const format = body.format || 'pdf';
    const topic = String(body.topic || '').trim();
    if (!topic) return json(res, 400, { error: 'topic is required' });
    const system =
      format === 'pptx'
        ? 'Write a professional slide outline (title + 5-8 slides with bullets).'
        : format === 'infograph'
          ? 'Write a one-page infograph structure with headline and callouts.'
          : 'Write a professional report with executive summary, analysis, recommendations.';
    const prompt = `You are MCIT Studio for the Ministry of Communications and Information Technology.\n${system}\n\nTopic:\n${topic}`;
    try {
      const content = await ollamaGenerate(prompt);
      return json(res, 200, { format, model: MODEL, provider: 'ollama', content: content || fallbackDraft(format, topic) });
    } catch (e) {
      return json(res, 200, {
        format,
        model: MODEL,
        provider: 'offline-fallback',
        content: fallbackDraft(format, topic),
        warning: e.message,
      });
    }
  }

  json(res, 404, { error: 'not found', path: url.pathname });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[mcit-features] :${PORT} ollama=${OLLAMA} model=${MODEL}`);
});
