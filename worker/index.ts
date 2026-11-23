import dealIds from './deal-ids.json';

export interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  LIKE_SALT?: string;
}

const VALID_IDS = new Set<string>(dealIds as string[]);
const FALLBACK_SALT = 'bf-deals-likes-dev-salt-change-me';
const CACHE_TTL_SECONDS = 30;
const RATE_LIMIT_PER_MIN = 30;
const ALLOWED_ORIGINS = new Set([
  'https://bf-deals.haleduykhang.workers.dev',
  'http://127.0.0.1:8787',
  'http://localhost:8787',
  'http://127.0.0.1:4321',
  'http://localhost:4321',
]);

function json(data: unknown, init: ResponseInit = {}): Response {
  const headers = new Headers(init.headers);
  headers.set('content-type', 'application/json; charset=utf-8');
  headers.set('access-control-allow-origin', headers.get('access-control-allow-origin') || '*');
  headers.set('access-control-allow-methods', 'GET, POST, DELETE, OPTIONS');
  headers.set('access-control-allow-headers', 'content-type');
  return new Response(JSON.stringify(data), { ...init, headers });
}

function corsOrigin(request: Request): string | null {
  const origin = request.headers.get('Origin');
  if (!origin) return null;
  if (ALLOWED_ORIGINS.has(origin)) return origin;
  // Preview / custom workers.dev subdomains
  try {
    const u = new URL(origin);
    if (u.hostname.endsWith('.workers.dev') || u.hostname === 'localhost' || u.hostname === '127.0.0.1') {
      return origin;
    }
  } catch {
    /* ignore */
  }
  return null;
}

function clientIp(request: Request): string {
  return (
    request.headers.get('CF-Connecting-IP') ||
    request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() ||
    '0.0.0.0'
  );
}

async function hashIp(ip: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(`${ip}:${salt}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function likesCacheKey(request: Request): Request {
  const url = new URL(request.url);
  return new Request(`${url.origin}/api/likes`, { method: 'GET' });
}

async function getCounts(db: D1Database): Promise<Record<string, number>> {
  const { results } = await db
    .prepare('SELECT deal_id, COUNT(*) AS c FROM likes GROUP BY deal_id')
    .all<{ deal_id: string; c: number }>();
  const out: Record<string, number> = {};
  for (const row of results || []) {
    out[row.deal_id] = Number(row.c) || 0;
  }
  return out;
}

async function countForDeal(db: D1Database, dealId: string): Promise<number> {
  const row = await db
    .prepare('SELECT COUNT(*) AS c FROM likes WHERE deal_id = ?')
    .bind(dealId)
    .first<{ c: number }>();
  return Number(row?.c) || 0;
}

async function hasLiked(db: D1Database, dealId: string, ipHash: string): Promise<boolean> {
  const row = await db
    .prepare('SELECT 1 AS ok FROM likes WHERE deal_id = ? AND ip_hash = ?')
    .bind(dealId, ipHash)
    .first();
  return Boolean(row);
}

async function checkRateLimit(db: D1Database, ipHash: string): Promise<boolean> {
  const windowStart = Math.floor(Date.now() / 60000) * 60;
  await db
    .prepare(
      `INSERT INTO like_rate (ip_hash, window_start, count) VALUES (?, ?, 1)
       ON CONFLICT(ip_hash, window_start) DO UPDATE SET count = count + 1`
    )
    .bind(ipHash, windowStart)
    .run();
  const row = await db
    .prepare('SELECT count AS c FROM like_rate WHERE ip_hash = ? AND window_start = ?')
    .bind(ipHash, windowStart)
    .first<{ c: number }>();
  return (Number(row?.c) || 0) <= RATE_LIMIT_PER_MIN;
}

async function invalidateLikesCache(request: Request): Promise<void> {
  try {
    const cache = caches.default;
    await cache.delete(likesCacheKey(request));
  } catch {
    /* ignore */
  }
}

function originOkForMutation(request: Request): boolean {
  // Same-origin navigations / fetch without Origin (rare) — require Origin for POST/DELETE
  const allowed = corsOrigin(request);
  return allowed !== null;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (!url.pathname.startsWith('/api/')) {
      return env.ASSETS.fetch(request);
    }

    if (request.method === 'OPTIONS') {
      const origin = corsOrigin(request) || '*';
      return new Response(null, {
        status: 204,
        headers: {
          'access-control-allow-origin': origin,
          'access-control-allow-methods': 'GET, POST, DELETE, OPTIONS',
          'access-control-allow-headers': 'content-type',
          'access-control-max-age': '86400',
        },
      });
    }

    const origin = corsOrigin(request);
    const corsHeaders: HeadersInit = origin
      ? { 'access-control-allow-origin': origin, vary: 'Origin' }
      : { 'access-control-allow-origin': '*' };

    // GET /api/likes
    if (url.pathname === '/api/likes' && request.method === 'GET') {
      const cache = caches.default;
      const cached = await cache.match(likesCacheKey(request));
      if (cached) return cached;

      try {
        const counts = await getCounts(env.DB);
        const res = json(counts, {
          headers: {
            ...corsHeaders,
            'cache-control': `public, max-age=${CACHE_TTL_SECONDS}`,
          },
        });
        // Store a clone in Cache API
        const toCache = res.clone();
        await cache.put(likesCacheKey(request), toCache);
        return res;
      } catch (err) {
        return json(
          { error: 'likes_unavailable', message: String(err) },
          { status: 503, headers: corsHeaders }
        );
      }
    }

    // POST|DELETE /api/likes/:dealId
    const match = url.pathname.match(/^\/api\/likes\/([^/]+)\/?$/);
    if (match && (request.method === 'POST' || request.method === 'DELETE')) {
      if (!originOkForMutation(request)) {
        return json({ error: 'bad_origin' }, { status: 403, headers: corsHeaders });
      }

      const dealId = decodeURIComponent(match[1]);
      if (!VALID_IDS.has(dealId)) {
        return json({ error: 'unknown_deal' }, { status: 404, headers: corsHeaders });
      }

      const salt = env.LIKE_SALT || FALLBACK_SALT;
      const ipHash = await hashIp(clientIp(request), salt);

      try {
        const allowed = await checkRateLimit(env.DB, ipHash);
        if (!allowed) {
          return json({ error: 'rate_limited' }, { status: 429, headers: corsHeaders });
        }

        if (request.method === 'POST') {
          await env.DB
            .prepare(
              'INSERT OR IGNORE INTO likes (deal_id, ip_hash, created_at) VALUES (?, ?, ?)'
            )
            .bind(dealId, ipHash, Math.floor(Date.now() / 1000))
            .run();
        } else {
          await env.DB
            .prepare('DELETE FROM likes WHERE deal_id = ? AND ip_hash = ?')
            .bind(dealId, ipHash)
            .run();
        }

        await invalidateLikesCache(request);
        const count = await countForDeal(env.DB, dealId);
        const liked = await hasLiked(env.DB, dealId, ipHash);
        return json({ count, liked }, { headers: corsHeaders });
      } catch (err) {
        return json(
          { error: 'db_error', message: String(err) },
          { status: 503, headers: corsHeaders }
        );
      }
    }

    return json({ error: 'not_found' }, { status: 404, headers: corsHeaders });
  },
};
