/**
 * Serverless proxy for GitHub Device Flow — Step 2: Poll for access token.
 * Browsers cannot call https://github.com/login/oauth/access_token directly (CORS).
 * This edge function forwards the polling request server-side and returns the response.
 */
export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    try {
      const body = await request.text();

      const upstream = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
        },
        body,
      });

      const data = await upstream.text();

      return new Response(data, {
        status: upstream.status,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
        },
      });
    } catch (err: any) {
      return new Response(
        JSON.stringify({ error: 'proxy_error', error_description: err.message }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );
    }
  },
};
