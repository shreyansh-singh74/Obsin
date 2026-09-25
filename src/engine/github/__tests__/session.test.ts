import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { validateToken, isTokenExpiredError } from '../session';

/**
 * Regression tests for the "keeps logging me out" bug:
 * validateToken must NEVER report a token invalid on network failures or
 * rate limits — only when GitHub explicitly rejects it everywhere.
 */
describe('validateToken', () => {
  const okResponse = (status: number, ok = status >= 200 && status < 300) =>
    ({ ok, status, statusText: '' }) as Response;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns false when no token is provided', async () => {
    expect(await validateToken('')).toBe(false);
  });

  it('returns true for a valid token (200)', async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse(200));
    vi.stubGlobal('fetch', fetchMock);

    expect(await validateToken('ghp_valid')).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('keeps the token on rate limiting (403) — token is still valid', async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse(403, false));
    vi.stubGlobal('fetch', fetchMock);

    expect(await validateToken('ghp_valid')).toBe(true);
  });

  it('keeps the token on network errors (offline / CORS)', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));
    vi.stubGlobal('fetch', fetchMock);

    expect(await validateToken('ghp_valid')).toBe(true);
  });

  it('keeps a fine-grained PAT that fails /user but can read repos', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(okResponse(401, false)) // /user rejected
      .mockResolvedValueOnce(okResponse(200)); // /user/repos works
    vi.stubGlobal('fetch', fetchMock);

    expect(await validateToken('github_pat_fine_grained')).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('rejects only when GitHub rejects every probe (401 + 401)', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(okResponse(401, false))
      .mockResolvedValueOnce(okResponse(401, false));
    vi.stubGlobal('fetch', fetchMock);

    expect(await validateToken('ghp_revoked')).toBe(false);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('does not wipe the token when the secondary probe errors out', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(okResponse(401, false))
      .mockRejectedValueOnce(new TypeError('Failed to fetch'));
    vi.stubGlobal('fetch', fetchMock);

    expect(await validateToken('ghp_flaky')).toBe(true);
  });
});

describe('isTokenExpiredError', () => {
  it('treats only 401 as expiration', () => {
    expect(isTokenExpiredError(401)).toBe(true);
    expect(isTokenExpiredError(403)).toBe(false);
    expect(isTokenExpiredError(404)).toBe(false);
    expect(isTokenExpiredError(500)).toBe(false);
  });
});
