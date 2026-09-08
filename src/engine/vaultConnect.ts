import { saveVault } from '@/db/repository/vaultsRepo';
import { executeVaultSync } from '@/engine/sync';
import { useVaultStore } from '@/store/useVaultStore';
import type { VaultConfig } from '@/types';

/**
 * Standardized vault-connect routine — the ONE path for wiring up a vault:
 * save to IndexedDB → set active (loads notes locally) → sync if online
 * → refresh. Used by RepoSelector (auth page) and VaultSelector (sidebar).
 *
 * Offline-safe: saves + local activation always succeed; sync is skipped
 * (not failed) when there is no network.
 */
export async function connectVault(vault: VaultConfig, token?: string): Promise<void> {
  const { setActiveVault, refreshNotes } = useVaultStore.getState();

  await saveVault(vault);
  await setActiveVault(vault);

  if (typeof navigator !== 'undefined' && navigator.onLine) {
    await executeVaultSync(vault, token);
  } else {
    console.info(`Offline: ${vault.name} will use previously downloaded data.`);
  }

  await refreshNotes();
}
