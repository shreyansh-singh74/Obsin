import { getAssetBlob, putAssetBlob } from '@/db/repository/assetsRepo';
import type { AssetBlob } from '@/types';

/**
 * Image fetch pipeline with IndexedDB blob caching.
 *
 * - Cache key is [vaultId, path] and entries store the git blob SHA they were
 *   fetched for, so a changed file on GitHub invalidates the local blob.
 * - Fetch candidates are tried in order (media.githubusercontent.com first —
 *   it honors the Authorization header for private repos — then raw).
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
  const { vaultId, path, sha, urls, token } = req;

  const cached = await getCachedAssetBlob(vaultId, path, sha);
  if (cached) return cached;

  if (urls.length === 0) {
    throw new Error(`No fetch URLs for asset: ${path}`);
  }

  let lastError: Error | null = null;
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

  throw lastError || new Error(`Failed to fetch image: ${path}`);
}

/** Fetches a single URL as a Blob, attaching the auth header when present. */
async function fetchImageBlob(url: string, token?: string): Promise<Blob> {
  const response = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.status} ${url}`);
  }

  return response.blob();
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
