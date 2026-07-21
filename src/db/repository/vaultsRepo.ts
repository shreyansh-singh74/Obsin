import { db } from '../index';
import type { VaultConfig } from '@/types';

export async function getAllVaults(): Promise<VaultConfig[]> {
  return await db.vaults.orderBy('lastOpened').reverse().toArray();
}

export async function getVaultById(id: string): Promise<VaultConfig | undefined> {
  return await db.vaults.get(id);
}

export async function saveVault(vault: VaultConfig): Promise<string> {
  await db.vaults.put(vault);
  return vault.id;
}

export async function deleteVault(id: string): Promise<void> {
  await db.transaction('rw', [db.vaults, db.notes, db.wikiLinkMap, db.backlinks, db.assetMeta, db.syncMeta], async () => {
    await db.vaults.delete(id);
    await db.notes.where('vaultId').equals(id).delete();
    await db.wikiLinkMap.where('vaultId').equals(id).delete();
    await db.backlinks.where('vaultId').equals(id).delete();
    await db.assetMeta.where('vaultId').equals(id).delete();
    await db.syncMeta.delete(id);
  });
}
