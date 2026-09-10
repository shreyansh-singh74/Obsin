import { db } from '../index';
import type { AssetMeta, AssetBlob } from '@/types';
import type { GitTreeItem } from '@/engine/github/tree';
import { matchAssetReference, isImagePath, getMimeType } from '@/utils/assets';

/**
 * Asset index: metadata for every image in the vault (written during sync),
 * plus the binary blob cache used for offline reading.
 */

/** Writes the vault-wide asset index from the git tree's image blobs. */
export async function updateAssetIndex(vaultId: string, assetFiles: GitTreeItem[]): Promise<void> {
  const entries: AssetMeta[] = assetFiles
    .filter((item) => isImagePath(item.path))
    .map((item) => ({
      vaultId,
      path: item.path,
      sha: item.sha,
      mime: getMimeType(item.path),
      size: item.size ?? 0,
      cacheKey: item.sha,
    }));

  await db.transaction('rw', db.assetMeta, async () => {
    await db.assetMeta.where('vaultId').equals(vaultId).delete();
    if (entries.length > 0) {
      await db.assetMeta.bulkPut(entries);
    }
  });
}

/**
 * Resolves a raw image reference from a note to a repo-relative asset path
 * using the vault's asset index. Returns null when no plausible match exists.
 */
export async function resolveAssetPath(
  vaultId: string,
  ref: string,
  notePath: string
): Promise<string | null> {
  const metas = await db.assetMeta.where('vaultId').equals(vaultId).toArray();
  if (metas.length === 0) return null;
  const paths = metas.map((m) => m.path);
  const match = matchAssetReference(ref, notePath, paths);
  return match ? match.path : null;
}

export async function getAssetMeta(vaultId: string, path: string): Promise<AssetMeta | undefined> {
  return db.assetMeta.get([vaultId, path]);
}

export async function getAssetBlob(vaultId: string, path: string): Promise<AssetBlob | undefined> {
  return db.assetBlobs.get([vaultId, path]);
}

export async function putAssetBlob(entry: AssetBlob): Promise<void> {
  await db.assetBlobs.put(entry);
}

export async function putAssetBlobs(entries: AssetBlob[]): Promise<void> {
  if (entries.length > 0) {
    await db.assetBlobs.bulkPut(entries);
  }
}

/** Deletes blob cache entries for a list of repo-relative paths. */
export async function deleteAssetBlobsByPaths(vaultId: string, paths: string[]): Promise<void> {
  if (paths.length === 0) return;
  await db.assetBlobs.bulkDelete(paths.map((p) => [vaultId, p] as [string, string]));
}

/** Returns the repo-relative paths of all indexed assets for a vault. */
export async function getAssetPaths(vaultId: string): Promise<string[]> {
  const metas = await db.assetMeta.where('vaultId').equals(vaultId).toArray();
  return metas.map((m) => m.path);
}

/** True when the vault has a built asset index (i.e. a sync ran with asset indexing). */
export async function hasAssetIndex(vaultId: string): Promise<boolean> {
  const count = await db.assetMeta.where('vaultId').equals(vaultId).count();
  return count > 0;
}

/** Approximate total size of cached image blobs for a vault, in bytes. */
export async function getAssetBlobUsage(vaultId: string): Promise<number> {
  const entries = await db.assetBlobs.where('vaultId').equals(vaultId).toArray();
  return entries.reduce((sum, e) => sum + (e.size || 0), 0);
}

/**
 * Removes asset metadata and blobs for paths that no longer exist in the
 * remote tree (ghost-asset prevention during sync).
 */
export async function pruneAssetsNotInPaths(vaultId: string, remotePaths: string[]): Promise<void> {
  const remoteSet = new Set(remotePaths);
  const existing = await db.assetMeta.where('vaultId').equals(vaultId).toArray();
  const ghostPaths = existing.filter((m) => !remoteSet.has(m.path)).map((m) => m.path);
  if (ghostPaths.length === 0) return;
  await deleteAssetBlobsByPaths(vaultId, ghostPaths);
  await db.assetMeta.bulkDelete(ghostPaths.map((p) => [vaultId, p] as [string, string]));
}
