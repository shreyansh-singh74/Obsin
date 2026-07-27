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
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[var(--radius-md)] bg-[var(--surface-input)] hover:bg-[var(--surface-hover)] border border-[var(--border-subtle)] text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all duration-[var(--duration-fast)] disabled:opacity-50 cursor-pointer"
      >
        <RefreshCw className={`w-3.5 h-3.5 text-[var(--accent-text)] ${isSyncing ? 'animate-spin' : ''}`} />
        <span>{isSyncing ? 'Syncing...' : 'Sync'}</span>
      </button>

      {isSyncing && (
        <div className="hidden sm:flex items-center gap-2 text-xs text-[var(--text-muted)] bg-[var(--surface-input)] border border-[var(--border-subtle)] px-3 py-1 rounded-[var(--radius-md)]">
          <span className="truncate max-w-[180px] text-[11px] font-mono">{progressMessage}</span>
          {totalCount > 0 && (
            <span className="font-mono text-[var(--accent-text)] text-[10px]">
              {Math.round((completedCount / totalCount) * 100)}%
            </span>
          )}
        </div>
      )}

      {stage === 'completed' && (
        <span className="flex items-center gap-1 text-[11px] text-[var(--success-text)] font-mono bg-[var(--success-bg)] border border-[var(--success-text)]/30 px-2 py-1 rounded-[var(--radius-sm)]">
          <CheckCircle2 className="w-3 h-3" /> Updated
        </span>
      )}

      {stage === 'error' && (
        <span
          title={error || 'Sync error'}
          className="flex items-center gap-1 text-[11px] text-[var(--danger-text)] font-mono bg-[var(--danger-bg)] border border-[var(--danger-text)]/30 px-2 py-1 rounded-[var(--radius-sm)] truncate max-w-[150px]"
        >
          <AlertCircle className="w-3 h-3" /> Sync Failed
        </span>
      )}
    </div>
  );
};
