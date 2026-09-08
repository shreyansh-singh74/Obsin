import { db } from '@/db';
import type { SyncMeta } from '@/types';

/** Reads sync metadata (last commit SHA, last sync time, status) for a vault. */
export async function getSyncMeta(vaultId: string): Promise<SyncMeta | undefined> {
  return db.syncMeta.get(vaultId);
}
