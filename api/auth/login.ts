import { createHash, randomBytes } from 'node:crypto';

const GITHUB_AUTHORIZE_URL = 'https://github.com/login/oauth/authorize';

const STATE_MAX_AGE_SECONDS = 10 * 60;

const COOKIE_STATE = 'obsin_oauth_state';
const COOKIE_VERIFIER = 'obsin_oauth_verifier';
const COOKIE_NONCE = 'obsin_oauth_nonce';

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method !== 'GET') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    const clientId = process.env.GITHUB_CLIENT_ID || process.env.VITE_GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      return new Response(
        'Auth is not configured. Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in your Vercel project settings.',
        { status: 500 }
      );
    }

    const url = new URL(request.url);
    const secure = url.protocol === 'https:';
    const redirectUri = process.env.GITHUB_CALLBACK_URL ?? `${url.origin}/api/auth/callback`;
    const scope = process.env.GITHUB_OAUTH_SCOPE ?? 'repo read:user';

    const state = randomBytes(32).toString('hex');
    const codeVerifier = randomBytes(48).toString('base64url');
    const codeChallenge = createHash('sha256').update(codeVerifier).digest('base64url');
    const nonce = url.searchParams.get('nonce') ?? randomBytes(16).toString('hex');

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope,
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });

    const cookieBase = `Path=/api/auth; HttpOnly; SameSite=Lax; Max-Age=${STATE_MAX_AGE_SECONDS}${secure ? '; Secure' : ''}`;

    const headers = new Headers({
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    });
    headers.append('Set-Cookie', `${COOKIE_STATE}=${state}; ${cookieBase}`);
    headers.append('Set-Cookie', `${COOKIE_VERIFIER}=${codeVerifier}; ${cookieBase}`);
    headers.append('Set-Cookie', `${COOKIE_NONCE}=${nonce}; ${cookieBase}`);

    return new Response(
      JSON.stringify({ authorizeUrl: `${GITHUB_AUTHORIZE_URL}?${params.toString()}` }),
      { status: 200, headers }
    );
  },
};
