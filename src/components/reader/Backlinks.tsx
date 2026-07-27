import React, { useState, useEffect } from 'react';
import { getBacklinksForNote } from '@/db/repository/backlinksRepo';
import { useVaultStore } from '@/store/useVaultStore';
import type { Backlink } from '@/types';
import { ArrowLeftRight, FileText } from 'lucide-react';

interface BacklinksProps {
  noteName: string;
}

export const Backlinks: React.FC<BacklinksProps> = ({ noteName }) => {
  const { activeVault, setActiveNotePath } = useVaultStore();
  const [backlinks, setBacklinks] = useState<Backlink[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchBacklinks() {
      if (!activeVault || !noteName) return;
      setIsLoading(true);
      const links = await getBacklinksForNote(activeVault.id, noteName);
      if (isMounted) {
        setBacklinks(links);
        setIsLoading(false);
      }
    }
    fetchBacklinks();
    return () => {
      isMounted = false;
    };
  }, [activeVault, noteName]);

  if (isLoading || backlinks.length === 0) return null;

  return (
    <div className="mt-12 pt-6 border-t border-[var(--border-subtle)] space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-2">
        <ArrowLeftRight className="w-3.5 h-3.5 text-[var(--accent-text)]" /> Backlinks ({backlinks.length})
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {backlinks.map((link) => (
          <button
            key={link.sourcePath}
            onClick={() => setActiveNotePath(link.sourcePath)}
            className="flex items-center gap-2 p-2.5 rounded-[var(--radius-md)] bg-[var(--surface-card)] hover:bg-[var(--surface-hover)] border border-[var(--border-subtle)] text-left transition-all duration-[var(--duration-fast)] group cursor-pointer"
          >
            <FileText className="w-4 h-4 text-[var(--icon-muted)] group-hover:text-[var(--accent-text)] shrink-0" />
            <div className="truncate">
              <span className="block text-xs font-medium text-[var(--text-primary)] group-hover:text-[var(--accent-text)] truncate">
                {link.sourceTitle}
              </span>
              <span className="block text-[10px] text-[var(--text-muted)] font-mono truncate">
                {link.sourcePath}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
