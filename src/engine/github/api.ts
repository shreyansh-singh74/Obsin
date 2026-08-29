export interface GitHubRateLimit {
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp in seconds
}

export class GitHubApiError extends Error {
  status: number;
  rateLimit?: GitHubRateLimit;

  constructor(message: string, status: number, rateLimit?: GitHubRateLimit) {
    super(message);
    this.name = 'GitHubApiError';
    this.status = status;
    this.rateLimit = rateLimit;
  }
}

export function parseRateLimitHeaders(headers: Headers): GitHubRateLimit | undefined {
  const limit = headers.get('x-ratelimit-limit');
  const remaining = headers.get('x-ratelimit-remaining');
  const reset = headers.get('x-ratelimit-reset');

  if (limit && remaining && reset) {
    return {
      limit: parseInt(limit, 10),
      remaining: parseInt(remaining, 10),
      reset: parseInt(reset, 10),
    };
  }
  return undefined;
}

export async function fetchGitHubApi(
  endpoint: string,
  token?: string,
  options: RequestInit = {}
): Promise<{ data: any; rateLimit?: GitHubRateLimit }> {
  const url = endpoint.startsWith('http') ? endpoint : `https://api.github.com${endpoint}`;
  
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token.trim()}`;
  }

  const response = await fetch(url, { ...options, headers });
  const rateLimit = parseRateLimitHeaders(response.headers);

  if (!response.ok) {
    let errorMsg = `GitHub API request failed with status ${response.status}: ${response.statusText}`;
    try {
      const json = await response.json();
      if (json.message) errorMsg = json.message;
    } catch {
      // Ignore JSON parse error
    }

    // Handle token expiration (401) — auto-redirect to auth
    if (response.status === 401 && token) {
      const { handleTokenExpired } = await import('./session');
      handleTokenExpired();
    }

    throw new GitHubApiError(errorMsg, response.status, rateLimit);
  }

  const data = await response.json();
  return { data, rateLimit };
}
