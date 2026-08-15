/**
 * One-time token handoff endpoint.
 * The OAuth callback stores the access token in a short-lived HttpOnly cookie
 * (obsin_token_handoff) instead of passing it in the redirect URL.
 * The /auth page calls this endpoint immediately after receiving ?oauth=ok,
 * reads the token, and the cookie is cleared (Max-Age=0) so it can only be
 * consumed once.
 */
const COOKIE_TOKEN = 'obsin_token_handoff';

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method !== 'GET') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    // Only allow same-origin requests (basic CSRF mitigation for this endpoint)
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');
    if (origin) {
      const originHost = new URL(origin).host;
      if (originHost !== host) {
        return new Response('Forbidden', { status: 403 });
      }
    }

    const cookieHeader = request.headers.get('cookie') ?? '';
    const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${COOKIE_TOKEN}=([^;]+)`));
    const encodedToken = match ? match[1] : null;

    if (!encodedToken) {
      return new Response(JSON.stringify({ error: 'no_token' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
      });
    }

    const accessToken = decodeURIComponent(encodedToken);

    const isLocalhost =
      (request.headers.get('host') ?? '').startsWith('localhost') ||
      (request.headers.get('host') ?? '').startsWith('127.0.0.1');
    const secure = !isLocalhost;

    const headers = new Headers({
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    });

    // Immediately clear the handoff cookie (one-time use)
    headers.set(
      'Set-Cookie',
      `${COOKIE_TOKEN}=; Max-Age=0; Path=/api/auth; HttpOnly; SameSite=Lax${secure ? '; Secure' : ''}`
    );

    return new Response(JSON.stringify({ access_token: accessToken }), {
      status: 200,
      headers,
    });
  },
};
