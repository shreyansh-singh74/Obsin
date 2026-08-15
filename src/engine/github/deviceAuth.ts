export interface DeviceCodeResponse {
  device_code: string;
  user_code: string;
  verification_uri: string;
  expires_in: number;
  interval: number;
}

export interface AccessTokenResponse {
  access_token?: string;
  token_type?: string;
  scope?: string;
  error?: string;
  error_description?: string;
  interval?: number;
}

export function getGitHubClientId(): string | null {
  return import.meta.env.VITE_GITHUB_CLIENT_ID || null;
}

/**
 * Step 1: Request Device and User Verification Codes from GitHub.
 * In dev: goes through Vite proxy → GitHub (bypasses CORS in browser).
 * In prod: goes through our Vercel serverless proxy → GitHub (no CORS issue).
 */
export async function requestDeviceCode(clientId: string): Promise<DeviceCodeResponse> {
  const url = import.meta.env.DEV
    ? '/github-oauth/login/device/code'
    : '/api/github/device-code';

  const params = new URLSearchParams({
    client_id: clientId,
    scope: 'repo read:user',
  });

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: params.toString(),
  });

  const data = await response.json();

  if (!response.ok || data.error) {
    throw new Error(data.error_description || data.error || 'Failed to request device authorization code');
  }

  return data;
}

/**
 * Step 2: Poll GitHub for Access Token authorization.
 * In dev: goes through Vite proxy → GitHub.
 * In prod: goes through our Vercel serverless proxy → GitHub.
 */
export async function pollForAccessToken(
  clientId: string,
  deviceCode: string
): Promise<AccessTokenResponse> {
  const url = import.meta.env.DEV
    ? '/github-oauth/login/oauth/access_token'
    : '/api/github/access-token';

  const params = new URLSearchParams({
    client_id: clientId,
    device_code: deviceCode,
    grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
  });

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: params.toString(),
  });

  return await response.json();
}
