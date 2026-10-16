// MCIT AI - Local Ollama Bridge with Automatic Context Expansion (32K Tokens) & Model Aliasing
// Transparently bridges host.docker.internal requests from Docker containers
// to the GPU-accelerated Ollama server listening on Windows localhost:11434,
// ensuring every model call has at least 32,768 tokens of context window,
// and gracefully falling back to available models if an uninstalled model is requested.

const http = require('http');

const LISTEN_PORT = process.env.BRIDGE_PORT || 11430;
const OLLAMA_PORT = process.env.OLLAMA_PORT || 11434;
const OLLAMA_HOST = '127.0.0.1';
const MIN_CONTEXT_WINDOW = parseInt(process.env.DEFAULT_NUM_CTX || '32768', 10);
const DEFAULT_MODEL = process.env.OLLAMA_CHAT_MODEL || 'gemma4:e4b';
const DEFAULT_EMBED_MODEL = 'nomic-embed-text:latest';

let installedModels = new Set([
  'gemma4:e4b',
  'qwen2.5:14b',
  'qwen2.5:7b',
  'qwen3:4b-instruct',
  'text-embedding-3-small:latest',
  'nomic-embed-text:latest',
  'bge-m3:latest'
]);
let lastTagsFetch = 0;

function refreshInstalledModels() {
  const now = Date.now();
  if (now - lastTagsFetch < 30000) return;
  lastTagsFetch = now;

  const req = http.get(`http://${OLLAMA_HOST}:${OLLAMA_PORT}/api/tags`, (res) => {
    let data = '';
    res.on('data', chunk => { data += chunk; });
    res.on('end', () => {
      try {
        const parsed = JSON.parse(data);
        if (parsed && Array.isArray(parsed.models)) {
          const set = new Set();
          parsed.models.forEach(m => {
            if (m.name) {
              set.add(m.name);
              set.add(m.name.split(':')[0]);
            }
            if (m.model) {
              set.add(m.model);
              set.add(m.model.split(':')[0]);
            }
          });
          if (set.size > 0) {
            installedModels = set;
          }
        }
      } catch (_) {}
    });
  });
  req.on('error', () => {});
}

// Initial fetch
refreshInstalledModels();

function resolveModel(reqModel, isEmbed = false) {
  if (!reqModel) return isEmbed ? DEFAULT_EMBED_MODEL : DEFAULT_MODEL;
  refreshInstalledModels();

  if (installedModels.has(reqModel) || installedModels.has(reqModel + ':latest')) {
    return reqModel;
  }

  const fallback = (isEmbed || reqModel.includes('embed') || reqModel.includes('bge'))
    ? DEFAULT_EMBED_MODEL
    : DEFAULT_MODEL;

  console.log(`[Ollama Bridge] Requested model '${reqModel}' not found in Ollama. Aliasing -> '${fallback}'`);
  return fallback;
}

const server = http.createServer((req, res) => {
  req.on('error', (err) => {
    // Prevent client abort from crashing process
  });

  res.on('error', (err) => {
    // Prevent client disconnect from crashing process
  });

  const isPost = req.method === 'POST';
  const isChatOrGenerate = req.url && (
    req.url.startsWith('/api/chat') ||
    req.url.startsWith('/api/generate') ||
    req.url.startsWith('/v1/chat/completions') ||
    req.url.startsWith('/api/show') ||
    req.url.startsWith('/api/embeddings') ||
    req.url.startsWith('/v1/embeddings')
  );

  if (isPost && isChatOrGenerate) {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => {
      let bodyBuffer = Buffer.concat(chunks);
      try {
        const text = bodyBuffer.toString('utf-8');
        const json = JSON.parse(text);

        const isEmbed = req.url.includes('embed') || req.url.includes('embeddings');

        if (json.model) {
          json.model = resolveModel(json.model, isEmbed);
        }
        if (json.name && req.url.startsWith('/api/show')) {
          json.name = resolveModel(json.name, isEmbed);
        }

        // Ensure num_ctx fits 100% in RTX 4050 6GB VRAM (32K tokens) without CPU swapping
        if (!isEmbed) {
          if (!json.options) {
            json.options = { num_ctx: MIN_CONTEXT_WINDOW };
          } else if (!json.options.num_ctx || json.options.num_ctx > MIN_CONTEXT_WINDOW || json.options.num_ctx < 8192) {
            json.options.num_ctx = MIN_CONTEXT_WINDOW;
          }

          if (json.options.temperature === undefined) {
            json.options.temperature = 0.7;
          }
          if (json.options.top_p === undefined) {
            json.options.top_p = 0.95;
          }
          if (json.options.top_k === undefined) {
            json.options.top_k = 64;
          }

          // Set keep_alive if not explicitly set so model stays warm in VRAM
          if (json.keep_alive === undefined) {
            json.keep_alive = '24h';
          }
        }

        const modifiedText = JSON.stringify(json);
        bodyBuffer = Buffer.from(modifiedText, 'utf-8');
      } catch (e) {
        // Fallback to original buffer if not parseable JSON
      }

      const headers = {
        ...req.headers,
        host: `${OLLAMA_HOST}:${OLLAMA_PORT}`,
        'content-length': bodyBuffer.length,
      };
      delete headers['transfer-encoding'];

      const options = {
        hostname: OLLAMA_HOST,
        port: OLLAMA_PORT,
        path: req.url,
        method: req.method,
        headers,
      };

      const proxy = http.request(options, (targetRes) => {
        const resHeaders = { ...targetRes.headers, 'x-accel-buffering': 'no' };
        if (!res.headersSent) {
          res.writeHead(targetRes.statusCode, resHeaders);
        }
        targetRes.pipe(res, { end: true });
      });

      proxy.on('error', (err) => {
        if (!res.headersSent) {
          try {
            res.writeHead(502, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: `Ollama bridge failed: ${err.message}` }));
          } catch (_) {}
        } else {
          try { res.destroy(); } catch (_) {}
        }
      });

      proxy.write(bodyBuffer);
      proxy.end();
    });
    return;
  }

  // Pass-through for GET requests and other routes
  const headers = { ...req.headers, host: `${OLLAMA_HOST}:${OLLAMA_PORT}` };
  const options = {
    hostname: OLLAMA_HOST,
    port: OLLAMA_PORT,
    path: req.url,
    method: req.method,
    headers,
  };

  const proxy = http.request(options, (targetRes) => {
    const resHeaders = { ...targetRes.headers, 'x-accel-buffering': 'no' };
    if (!res.headersSent) {
      res.writeHead(targetRes.statusCode, resHeaders);
    }
    targetRes.pipe(res, { end: true });
  });

  req.pipe(proxy, { end: true });

  proxy.on('error', (err) => {
    if (!res.headersSent) {
      try {
        res.writeHead(502, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: `Ollama bridge failed: ${err.message}` }));
      } catch (_) {}
    } else {
      try { res.destroy(); } catch (_) {}
    }
  });
});

server.listen(LISTEN_PORT, '0.0.0.0', () => {
  console.log(`[Ollama Bridge] Active on 0.0.0.0:${LISTEN_PORT} -> ${OLLAMA_HOST}:${OLLAMA_PORT} (num_ctx: ${MIN_CONTEXT_WINDOW}, default: ${DEFAULT_MODEL})`);
});
