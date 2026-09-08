import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useVaultStore } from '@/store/useVaultStore';
import { getSyncMeta } from '@/db/repository/syncMetaRepo';

export const OfflineBanner: React.FC = () => {
  const isOnline = useOnlineStatus();
  const isOffline = !isOnline;
  const activeVault = useVaultStore((s) => s.activeVault);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  useEffect(() => {
    if (!isOffline || !activeVault) {
      setLastSyncTime(null);
      return;
    }
    let cancelled = false;
    getSyncMeta(activeVault.id).then((meta) => {
      if (!cancelled) setLastSyncTime(meta?.lastSyncTime ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [isOffline, activeVault]);

  // Request persistent storage when banner first mounts
  useEffect(() => {
    if (navigator.storage && navigator.storage.persist) {
      navigator.storage.persist().then((persistent) => {
        if (persistent) {
          console.log('IndexedDB storage persistence granted by browser.');
        }
      });
    }
  }, []);

  if (!isOffline) return null;

  return (
    <div className="bg-[var(--warning-bg)] border-b border-[var(--warning-text)]/30 px-4 py-1.5 text-xs text-[var(--warning-text)] flex items-center justify-center gap-2 font-mono shadow-inner">
      <WifiOff className="w-3.5 h-3.5 text-[var(--warning-text)] shrink-0" />
      <span>
        Offline Mode — Reading notes locally from IndexedDB
        {lastSyncTime ? ` · Last synced ${new Date(lastSyncTime).toLocaleString()}` : ''}
      </span>
    </div>
  );
};
