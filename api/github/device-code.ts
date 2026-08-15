/**
 * Serverless proxy for GitHub Device Flow — Step 1: Request device code.
 * Browsers cannot call https://github.com/login/device/code directly (CORS).
 * This edge function forwards the request server-side and returns the response.
 */
export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    const clientId = process.env.GITHUB_CLIENT_ID;
    if (!clientId) {
      return new Response(JSON.stringify({ error: 'server_misconfigured', error_description: 'GITHUB_CLIENT_ID is not set' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    try {
      const body = await request.text();

      const upstream = await fetch('https://github.com/login/device/code', {
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
