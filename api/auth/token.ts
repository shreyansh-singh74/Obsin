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
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', {
        status: 405,
        headers: { Allow: 'POST', 'Cache-Control': 'no-store' },
      });
    }

    // Require an exact same-origin browser request before consuming the cookie.
    const requestUrl = new URL(request.url);
    const origin = request.headers.get('origin');
    const fetchSite = request.headers.get('sec-fetch-site');
    let originMatches = false;
    if (origin) {
      try {
        originMatches = new URL(origin).origin === requestUrl.origin;
      } catch {
        originMatches = false;
      }
    }

    if (!originMatches || (fetchSite !== 'same-origin' && fetchSite !== 'same-site')) {
      return new Response('Forbidden', {
        status: 403,
        headers: { 'Cache-Control': 'no-store' },
      });
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
      requestUrl.hostname === 'localhost' || requestUrl.hostname === '127.0.0.1';
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
