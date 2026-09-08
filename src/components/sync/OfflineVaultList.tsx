import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVaultStore } from '@/store/useVaultStore';
import { getSyncMeta } from '@/db/repository/syncMetaRepo';
import { WifiOff, FolderGit2, ChevronRight, Clock } from 'lucide-react';
import type { VaultConfig } from '@/types';

interface OfflineVaultListProps {
  /** Called when the user picks a vault to open offline. */
  onOpenVault?: (vault: VaultConfig) => void;
}

/**
 * Shown on the AuthPage when the user is offline (or repo listing failed):
 * lists vaults already downloaded to IndexedDB so the user can jump straight
 * into reading instead of being walled by sign-in.
 */
export const OfflineVaultList: React.FC<OfflineVaultListProps> = ({ onOpenVault }) => {
  const navigate = useNavigate();
  const { vaults, setActiveVault } = useVaultStore();
  const [lastSyncTimes, setLastSyncTimes] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    async function loadSyncTimes() {
      const entries: Record<string, string> = {};
      for (const v of vaults) {
        const meta = await getSyncMeta(v.id);
        if (meta?.lastSyncTime) entries[v.id] = meta.lastSyncTime;
      }
      if (!cancelled) setLastSyncTimes(entries);
    }
    loadSyncTimes();
    return () => {
      cancelled = true;
    };
  }, [vaults]);

  async function handleOpen(vault: VaultConfig) {
    await setActiveVault(vault);
    onOpenVault?.(vault);
    navigate('/app');
  }

  if (vaults.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
        <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
        <div className="text-xs leading-relaxed">
          <p className="text-white font-medium">You're offline</p>
          <p className="text-white/50">Vaults below were downloaded earlier and are ready to read.</p>
        </div>
      </div>

      <div className="space-y-2">
        {vaults.map((vault) => (
          <button
            key={vault.id}
            onClick={() => handleOpen(vault)}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 text-white/80 transition-colors cursor-pointer min-h-[44px]"
          >
            <div className="flex items-center gap-3 min-w-0">
              <FolderGit2 className="w-4 h-4 text-[#8A35F2] shrink-0" />
              <div className="min-w-0 text-left">
                <p className="text-sm font-medium truncate">{vault.name}</p>
                <p className="text-[11px] text-white/40 truncate font-mono">
                  {vault.owner}/{vault.repo}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {lastSyncTimes[vault.id] && (
                <span className="hidden sm:flex items-center gap-1 text-[10px] text-white/40 font-mono">
                  <Clock className="w-3 h-3" />
                  {new Date(lastSyncTimes[vault.id]).toLocaleDateString()}
                </span>
              )}
              <ChevronRight className="w-4 h-4 text-white/40" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
