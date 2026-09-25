import { useAuthStore } from '@/store/useAuthStore';

/**
 * Checks if the stored token is still valid by making a lightweight API call.
 * Returns true if valid or if we can't conclusively prove it's invalid (e.g. rate limit, offline).
 * Only returns false if GitHub explicitly rejects the token as invalid or revoked.
 */
export async function validateToken(token: string): Promise<boolean> {
  if (!token) return false;

  try {
    const response = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    // 200 = valid token with read:user scope
    if (response.ok) return true;

    // 403 = rate limited or missing specific permissions, but token format & auth is valid
    if (response.status === 403) return true;

    // If 401, check if this is a fine-grained PAT or restricted token lacking 'user' scope
    // by making a test request to an endpoint accessible with repository permissions.
    if (response.status === 401) {
      try {
        const repoCheck = await fetch('https://api.github.com/user/repos?per_page=1', {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github.v3+json',
          },
        });
        if (repoCheck.ok || repoCheck.status === 403) {
          return true;
        }
      } catch {
        // Network failure during secondary check — assume token might be valid
        return true;
      }
      return false;
    }

    // Other unexpected status codes: don't aggressively wipe
    return true;
  } catch {
    // Network failure / offline / CORS issue — never assume invalid
    return true;
  }
}

/**
 * Handles an explicit token expiration/revocation.
 * Clears the invalid token and redirects to auth page.
 */
export function handleTokenExpired(): void {
  const { clearToken } = useAuthStore.getState();
  clearToken();

  // Redirect to auth page with error message
  const currentPath = window.location.pathname;
  if (currentPath !== '/auth' && currentPath !== '/') {
    window.location.href = '/auth?error=Session+expired.+Please+sign+in+again.';
  }
}

/**
 * Checks if a GitHub API error indicates token expiration.
 */
export function isTokenExpiredError(status: number): boolean {
  return status === 401;
}

/**
 * Validates token on app startup and sets up periodic validation.
 * Call this once when the app initializes.
 */
export function setupSessionValidation(): () => void {
  const token = useAuthStore.getState().token;

  if (!token) return () => {};

  // Validate on startup
  validateToken(token).then((isValid) => {
    if (!isValid) {
      console.warn('Stored token is invalid or revoked by GitHub');
      handleTokenExpired();
    }
  });

  // Periodically validate every 15 minutes
  const interval = setInterval(() => {
    const currentToken = useAuthStore.getState().token;
    if (!currentToken) return;

    validateToken(currentToken).then((isValid) => {
      if (!isValid) {
        console.warn('Token expired or revoked during session');
        handleTokenExpired();
      }
    });
  }, 15 * 60 * 1000);

  return () => clearInterval(interval);
}

