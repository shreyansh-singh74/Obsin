const MAX_BODY_BYTES = 2_048;
const RATE_WINDOW_MS = 10 * 60 * 1_000;
const RATE_LIMIT = 180;
const DEVICE_GRANT_TYPE = 'urn:ietf:params:oauth:grant-type:device_code';
const rateBuckets = new Map<string, { startedAt: number; count: number }>();

function getClientIp(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

function getRetryAfter(request: Request): number | null {
  const now = Date.now();
  const ip = getClientIp(request);
  const current = rateBuckets.get(ip);

  if (!current || now - current.startedAt >= RATE_WINDOW_MS) {
    rateBuckets.set(ip, { startedAt: now, count: 1 });
  } else {
    current.count += 1;
    if (current.count > RATE_LIMIT) {
      return Math.max(1, Math.ceil((RATE_WINDOW_MS - (now - current.startedAt)) / 1_000));
    }
  }

  if (rateBuckets.size > 1_000) {
    for (const [key, bucket] of rateBuckets) {
      if (now - bucket.startedAt >= RATE_WINDOW_MS) rateBuckets.delete(key);
    }
  }

  return null;
}

function jsonError(status: number, error: string, description: string): Response {
  return new Response(JSON.stringify({ error, error_description: description }), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

/**
 * Serverless proxy for GitHub Device Flow — Step 2: Poll for access token.
 * Browsers cannot call https://github.com/login/oauth/access_token directly (CORS).
 */
export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', {
        status: 405,
        headers: { Allow: 'POST', 'Cache-Control': 'no-store' },
      });
    }

    const retryAfter = getRetryAfter(request);
    if (retryAfter !== null) {
      return new Response(
        JSON.stringify({ error: 'rate_limited', error_description: 'Too many device token requests' }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store',
            'Retry-After': String(retryAfter),
          },
        }
      );
    }

    const configuredClientId = process.env.GITHUB_CLIENT_ID || process.env.VITE_GITHUB_CLIENT_ID;
    if (!configuredClientId) {
      return jsonError(500, 'server_configuration_error', 'GitHub OAuth is not configured');
    }

    const contentLength = Number(request.headers.get('content-length') || '0');
    if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
      return jsonError(413, 'invalid_request', 'Request body is too large');
    }

    try {
      const rawBody = await request.text();
      if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
        return jsonError(413, 'invalid_request', 'Request body is too large');
      }

      const params = new URLSearchParams(rawBody);
      const allowedFields = new Set(['client_id', 'device_code', 'grant_type']);
      if ([...params.keys()].some((key) => !allowedFields.has(key))) {
        return jsonError(400, 'invalid_request', 'Request contains unsupported fields');
      }
      if ([...allowedFields].some((key) => params.getAll(key).length > 1)) {
        return jsonError(400, 'invalid_request', 'Request contains duplicate fields');
      }
      if (params.get('client_id') !== configuredClientId) {
        return jsonError(403, 'invalid_client', 'Client ID does not match server configuration');
      }

      const deviceCode = params.get('device_code');
      if (!deviceCode || deviceCode.length > 512 || !/^[A-Za-z0-9._-]+$/.test(deviceCode)) {
        return jsonError(400, 'invalid_request', 'Invalid device code');
      }
      if (params.get('grant_type') !== DEVICE_GRANT_TYPE) {
        return jsonError(400, 'unsupported_grant_type', 'Invalid device grant type');
      }

      const upstreamBody = new URLSearchParams({
        client_id: configuredClientId,
        device_code: deviceCode,
        grant_type: DEVICE_GRANT_TYPE,
      });
      const upstream = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
        },
        body: upstreamBody.toString(),
      });

      return new Response(await upstream.text(), {
        status: upstream.status,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
        },
      });
    } catch {
      return jsonError(502, 'proxy_error', 'GitHub device token request failed');
    }
  },
};
