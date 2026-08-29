import { useAuthStore } from '@/store/useAuthStore';

/**
 * Checks if the stored token is still valid by making a lightweight API call.
 * Returns true if valid, false if expired/invalid.
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

    // 200 = valid, 401 = expired/invalid, 403 = rate limited (but token is still valid)
    return response.ok || response.status === 403;
  } catch {
    // Network error — assume token might be valid
    return true;
  }
}

/**
 * Handles a 401 response from GitHub API.
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

  // Validate immediately
  validateToken(token).then((isValid) => {
    if (!isValid) {
      console.warn('Stored token is invalid/expired');
      handleTokenExpired();
    }
  });

  // Validate every 5 minutes
  const interval = setInterval(() => {
    const currentToken = useAuthStore.getState().token;
    if (!currentToken) return;

    validateToken(currentToken).then((isValid) => {
      if (!isValid) {
        console.warn('Token expired during session');
        handleTokenExpired();
      }
    });
  }, 5 * 60 * 1000);

  return () => clearInterval(interval);
}
