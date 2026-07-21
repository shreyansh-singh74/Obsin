import React from 'react';
import { useSyncStore } from '@/store/useSyncStore';
import { useVaultStore } from '@/store/useVaultStore';
import { useAuthStore } from '@/store/useAuthStore';
import { executeVaultSync } from '@/engine/sync';
import { RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

export const SyncStatusBadge: React.FC = () => {
  const { stage, progressMessage, completedCount, totalCount, error } = useSyncStore();
  const { activeVault, refreshNotes } = useVaultStore();
  const { token } = useAuthStore();

  async function handleTriggerSync() {
    if (!activeVault || stage !== 'idle') return;
    await executeVaultSync(activeVault, token);
    await refreshNotes();
  }

  const isSyncing = stage !== 'idle' && stage !== 'completed' && stage !== 'error';

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleTriggerSync}
        disabled={isSyncing || !activeVault}
        title="Sync vault with GitHub"
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 hover:text-white transition-all disabled:opacity-50 cursor-pointer"
      >
        <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${isSyncing ? 'animate-spin' : ''}`} />
        <span>{isSyncing ? 'Syncing...' : 'Sync'}</span>
      </button>

      {isSyncing && (
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1 rounded-lg">
          <span className="truncate max-w-[180px] text-[11px] font-mono">{progressMessage}</span>
          {totalCount > 0 && (
            <span className="font-mono text-indigo-400 text-[10px]">
              {Math.round((completedCount / totalCount) * 100)}%
            </span>
          )}
        </div>
      )}

      {stage === 'completed' && (
        <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono bg-emerald-950/40 border border-emerald-900/50 px-2 py-1 rounded-md">
          <CheckCircle2 className="w-3 h-3" /> Updated
        </span>
      )}

      {stage === 'error' && (
        <span
          title={error || 'Sync error'}
          className="flex items-center gap-1 text-[11px] text-rose-400 font-mono bg-rose-950/40 border border-rose-900/50 px-2 py-1 rounded-md truncate max-w-[150px]"
        >
          <AlertCircle className="w-3 h-3" /> Sync Failed
        </span>
      )}
    </div>
  );
};
