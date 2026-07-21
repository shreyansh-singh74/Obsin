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
    <div className="mt-12 pt-6 border-t border-slate-800 space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
        <ArrowLeftRight className="w-3.5 h-3.5 text-indigo-400" /> Backlinks ({backlinks.length})
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {backlinks.map((link) => (
          <button
            key={link.sourcePath}
            onClick={() => setActiveNotePath(link.sourcePath)}
            className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-indigo-500/40 text-left transition-all group cursor-pointer"
          >
            <FileText className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 shrink-0" />
            <div className="truncate">
              <span className="block text-xs font-medium text-slate-200 group-hover:text-indigo-300 truncate">
                {link.sourceTitle}
              </span>
              <span className="block text-[10px] text-slate-500 font-mono truncate">
                {link.sourcePath}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
