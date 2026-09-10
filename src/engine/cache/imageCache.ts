import { getAssetBlob, putAssetBlob } from '@/db/repository/assetsRepo';
import type { AssetBlob } from '@/types';

/**
 * Image fetch pipeline with IndexedDB blob caching.
 *
 * - Cache key is [vaultId, path] and entries store the git blob SHA they were
 *   fetched for, so a changed file on GitHub invalidates the local blob.
 * - For private repos, uses the GitHub Contents API (supports CORS + bearer auth).
 * - For public repos or when no token, uses raw.githubusercontent.com directly.
 */

export interface AssetImageRequest {
  vaultId: string;
  /** Repo-relative asset path, e.g. "Attachments/Pasted image 123.png" */
  path: string;
  /** Git blob SHA from the asset index; null when the path isn't indexed. */
  sha: string | null;
  /** Ordered fetch URL candidates. */
  urls: string[];
  token?: string;
  /** GitHub owner (needed for Contents API fallback). */
  owner?: string;
  /** GitHub repo name (needed for Contents API fallback). */
  repo?: string;
  /** Git branch (needed for Contents API fallback). */
  branch?: string;
}

/**
 * Returns the cached blob for an asset if present. When `sha` is provided and
 * mismatches the cached entry, the stale blob is treated as a miss.
 */
export async function getCachedAssetBlob(
  vaultId: string,
  path: string,
  sha: string | null
): Promise<Blob | null> {
  const entry = await getAssetBlob(vaultId, path);
  if (!entry) return null;
  if (sha && entry.sha !== sha) return null; // changed upstream
  return entry.blob;
}

/**
 * Fetches an image blob: cache-first (IndexedDB), then network across the
 * ordered URL candidates. Successful network fetches are written to the cache.
 */
export async function fetchAssetImage(req: AssetImageRequest): Promise<Blob> {
  const { vaultId, path, sha, urls, token, owner, repo, branch } = req;

  const cached = await getCachedAssetBlob(vaultId, path, sha);
  if (cached) return cached;

  let lastError: Error | null = null;

  // 1. Indexed assets have an immutable git blob SHA. Fetching by SHA avoids
  // branch drift, path encoding issues, and raw-host authentication quirks.
  if (sha && owner && repo) {
    try {
      const blob = await fetchViaGitBlobApi(owner, repo, sha, path, token);
      const entry: AssetBlob = {
        vaultId,
        path,
        sha,
        blob,
        size: blob.size,
        updatedAt: new Date().toISOString(),
      };
      await putAssetBlob(entry);
      return blob;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }

  // 2. Try direct URLs (works for public repos)
  for (const url of urls) {
    try {
      const blob = await fetchImageBlob(url, token);
      const entry: AssetBlob = {
        vaultId,
        path,
        sha: sha || 'unknown',
        blob,
        size: blob.size,
        updatedAt: new Date().toISOString(),
      };
      await putAssetBlob(entry);
      return blob;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }

  // 3. For private repos: use GitHub Contents API (supports CORS + bearer auth).
  // Extract repo-relative paths from the URL candidates so we try each
  // candidate location (same-folder, Attachments/, assets/, root, etc.).
  if (token && owner && repo && branch) {
    const candidatePaths = extractPathsFromUrls(urls, owner, repo, branch);
    // Always include the primary path first
    if (!candidatePaths.includes(path)) candidatePaths.unshift(path);

    for (const candidatePath of candidatePaths) {
      try {
        const blob = await fetchViaContentsApi(owner, repo, branch, candidatePath, token);
        const entry: AssetBlob = {
          vaultId,
          path: candidatePath,
          sha: sha || 'unknown',
          blob,
          size: blob.size,
          updatedAt: new Date().toISOString(),
        };
        await putAssetBlob(entry);
        return blob;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
      }
    }
  } else {
    console.warn('[Obsin] No token/owner/repo/branch for Contents API:', { hasToken: !!token, owner, repo, branch });
  }

  throw lastError || new Error(`Failed to fetch image: ${path}`);
}

/** Fetches an indexed asset through GitHub's Git Blobs API. */
async function fetchViaGitBlobApi(
  owner: string,
  repo: string,
  sha: string,
  path: string,
  token?: string
): Promise<Blob> {
  const url = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/blobs/${encodeURIComponent(sha)}`;
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
  };
  if (token) {
    headers.Authorization = `Bearer ${token.trim()}`;
  }

  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error(`Git Blobs API failed: ${response.status} ${path}`);
  }

  const data = await response.json();
  if (data.encoding !== 'base64' || typeof data.content !== 'string') {
    throw new Error(`Unexpected encoding from Git Blobs API: ${data.encoding}`);
  }

  return decodeBase64Blob(data.content, mimeTypeForPath(path));
}

/**
 * Fetches a file via the GitHub Contents API.
 * Returns the decoded blob from base64 content.
 */
async function fetchViaContentsApi(
  owner: string,
  repo: string,
  branch: string,
  path: string,
  token: string
): Promise<Blob> {
  const encodedPath = path.split('/').map(encodeURIComponent).join('/');
  const url = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${encodedPath}?ref=${encodeURIComponent(branch)}`;

  const response = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github.v3+json',
      Authorization: `Bearer ${token.trim()}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Contents API failed: ${response.status} ${path}`);
  }

  const data = await response.json();

  if (data.encoding !== 'base64' || !data.content) {
    throw new Error(`Unexpected encoding from Contents API: ${data.encoding}`);
  }

  return decodeBase64Blob(data.content, mimeTypeForPath(path));
}

function decodeBase64Blob(content: string, mime: string): Blob {
  const binaryString = atob(content.replace(/\n/g, ''));
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime });
}

function mimeTypeForPath(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase() || '';
  const mimeMap: Record<string, string> = {
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    bmp: 'image/bmp',
    ico: 'image/x-icon',
    tiff: 'image/tiff',
    tif: 'image/tiff',
    avif: 'image/avif',
  };
  return mimeMap[ext] || 'application/octet-stream';
}

/** Fetches a single URL as a Blob. Pass `token` for private repos. */
async function fetchImageBlob(url: string, token?: string): Promise<Blob> {
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token.trim()}`;
  }
  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.status} ${url}`);
  }

  return response.blob();
}

/**
 * Extracts repo-relative paths from raw.githubusercontent.com /
 * media.githubusercontent.com URLs so the Contents API can try each
 * candidate location.
 */
function extractPathsFromUrls(
  urls: string[],
  owner: string,
  repo: string,
  branch: string
): string[] {
  const paths: string[] = [];
  const prefixes = [
    `raw.githubusercontent.com/${owner}/${repo}/${branch}/`,
    `media.githubusercontent.com/media/${owner}/${repo}/${branch}/`,
  ];

  for (const url of urls) {
    for (const prefix of prefixes) {
      const idx = url.indexOf(prefix);
      if (idx !== -1) {
        const repoPath = decodeURIComponent(url.slice(idx + prefix.length).split('?')[0]);
        if (repoPath && !paths.includes(repoPath)) {
          paths.push(repoPath);
        }
        break;
      }
    }
  }

  return paths;
}

/**
 * Creates (and manages) an object URL for a blob. Callers must call `revoke`
 * when the consuming component unmounts to avoid memory leaks.
 */
export function createObjectUrl(blob: Blob): string {
  return URL.createObjectURL(blob);
}

export function revokeObjectUrl(url: string): void {
  if (url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
}

/**
 * Evicts the blob for a single asset (e.g. after a failed render retry).
 */
export async function evictAssetBlob(vaultId: string, path: string): Promise<void> {
  const { deleteAssetBlobsByPaths } = await import('@/db/repository/assetsRepo');
  await deleteAssetBlobsByPaths(vaultId, [path]);
}
