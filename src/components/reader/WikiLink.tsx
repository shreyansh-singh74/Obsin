import React, { useState, useEffect } from 'react';
import { resolveWikiLinkPath } from '@/db/repository/wikiMapRepo';
import { useVaultStore } from '@/store/useVaultStore';
import { Link2, AlertCircle } from 'lucide-react';

interface WikiLinkProps {
  target: string;
  heading?: string;
  children: React.ReactNode;
}

export const WikiLink: React.FC<WikiLinkProps> = ({ target, heading, children }) => {
  const { activeVault, setActiveNotePath } = useVaultStore();
  const [resolvedPath, setResolvedPath] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function checkResolution() {
      if (!activeVault) return;
      setIsLoading(true);
      const path = await resolveWikiLinkPath(activeVault.id, target);
      if (isMounted) {
        setResolvedPath(path);
        setIsLoading(false);
      }
    }
    checkResolution();
    return () => {
      isMounted = false;
    };
  }, [activeVault, target]);

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    if (resolvedPath) {
      setActiveNotePath(resolvedPath);
    }
  }

  if (isLoading) {
    return <span className="inline-opacity-50 text-indigo-400 font-mono text-xs">{children}</span>;
  }

  if (!resolvedPath) {
    return (
      <span
        title={`Unresolved wiki link: [[${target}]]`}
        className="inline-flex items-center gap-1 text-slate-500 line-through underline-offset-2 decoration-rose-500/50 cursor-not-allowed bg-slate-900/60 px-1.5 py-0.5 rounded text-xs border border-slate-800"
      >
        <AlertCircle className="w-3 h-3 text-rose-400 shrink-0" />
        <span>{children}</span>
      </span>
    );
  }

  return (
    <button
      onClick={handleClick}
      title={`Jump to ${target}${heading ? `#${heading}` : ''}`}
      className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-medium underline underline-offset-4 decoration-indigo-500/40 hover:decoration-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 px-1.5 py-0.5 rounded text-xs border border-indigo-500/30 transition-all cursor-pointer"
    >
      <Link2 className="w-3 h-3 text-indigo-400 shrink-0" />
      <span>{children}</span>
    </button>
  );
};
