const COOKIE_STATE = 'obsin_oauth_state';
const COOKIE_VERIFIER = 'obsin_oauth_verifier';
const COOKIE_TOKEN = 'obsin_token_handoff';

// Allowlisted production base URL (stops host-header open-redirect attacks)
const ALLOWED_BASE =
  process.env.GITHUB_CALLBACK_URL?.replace('/api/auth/callback', '') ||
  'https://obsin.vercel.app';

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method !== 'GET') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const returnedState = url.searchParams.get('state');
    const errorParam = url.searchParams.get('error');

    // ── Parse cookies ──────────────────────────────────────────────────────────
    const cookieHeader = request.headers.get('cookie') ?? '';
    const parseCookie = (name: string): string | null => {
      const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
      return match ? decodeURIComponent(match[1]) : null;
    };

    const expectedState = parseCookie(COOKIE_STATE);
    const codeVerifier = parseCookie(COOKIE_VERIFIER);

    // Use fixed base URL; fall back to request origin only on localhost
    const isLocalhost = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
    const baseUrl = isLocalhost ? url.origin : ALLOWED_BASE;

    const clearCookies = `${COOKIE_STATE}=; Max-Age=0; Path=/api/auth; HttpOnly; SameSite=Lax; Secure, ${COOKIE_VERIFIER}=; Max-Age=0; Path=/api/auth; HttpOnly; SameSite=Lax; Secure`;

    const redirectError = (msg: string): Response => {
      const headers = new Headers({ Location: `${baseUrl}/auth?error=${encodeURIComponent(msg)}` });
      headers.set('Set-Cookie', clearCookies);
      return new Response(null, { status: 302, headers });
    };

    // ── Handle GitHub error responses ──────────────────────────────────────────
    if (errorParam) {
      const errorDesc = url.searchParams.get('error_description') || 'GitHub OAuth authorization failed.';
      return redirectError(errorDesc);
    }

    // ── Verify state (login-CSRF protection) ───────────────────────────────────
    if (!returnedState || !expectedState || returnedState !== expectedState) {
      return redirectError('OAuth state mismatch — possible CSRF. Please try again.');
    }

    if (!code) {
      return redirectError('Missing authorization code');
    }

    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      return redirectError('OAuth is not configured on server');
    }

    try {
      // ── Exchange code for token (include code_verifier for PKCE) ─────────────
      const body: Record<string, string> = {
        client_id: clientId,
        client_secret: clientSecret,
        code,
      };
      if (codeVerifier) {
        body.code_verifier = codeVerifier;
      }

      const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(body),
      });

      const tokenData = await tokenRes.json();

      if (!tokenRes.ok || tokenData.error || !tokenData.access_token) {
        const msg = tokenData.error_description || 'Failed to exchange authorization code for access token';
        return redirectError(msg);
      }

      const accessToken = tokenData.access_token as string;

      // ── Deliver token via short-lived HttpOnly cookie, NOT the URL ────────────
      // The /auth page reads and clears this cookie via /api/auth/token
      const secure = !isLocalhost;
      const handoffCookieOpts = `HttpOnly; SameSite=Lax; Path=/api/auth; Max-Age=60${secure ? '; Secure' : ''}`;

      const headers = new Headers({
        Location: `${baseUrl}/auth?oauth=ok`,
        'Cache-Control': 'no-store',
      });
      // Clear state/verifier, set handoff
      headers.append('Set-Cookie', `${COOKIE_STATE}=; Max-Age=0; Path=/api/auth; HttpOnly; SameSite=Lax${secure ? '; Secure' : ''}`);
      headers.append('Set-Cookie', `${COOKIE_VERIFIER}=; Max-Age=0; Path=/api/auth; HttpOnly; SameSite=Lax${secure ? '; Secure' : ''}`);
      headers.append('Set-Cookie', `${COOKIE_TOKEN}=${encodeURIComponent(accessToken)}; ${handoffCookieOpts}`);

      return new Response(null, { status: 302, headers });
    } catch (err: any) {
      return redirectError(err.message || 'OAuth exchange error');
    }
  },
};
