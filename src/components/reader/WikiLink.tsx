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
    return <span className="opacity-50 text-[var(--accent-text)] font-mono text-xs">{children}</span>;
  }

  if (!resolvedPath) {
    return (
      <span
        title={`Unresolved wiki link: [[${target}]]`}
        className="inline-flex items-center gap-1 text-[var(--text-subtle)] line-through underline-offset-2 decoration-[var(--danger-text)]/50 cursor-not-allowed bg-[var(--surface-card)] px-1.5 py-0.5 rounded-[var(--radius-xs)] text-xs border border-[var(--border-subtle)]"
      >
        <AlertCircle className="w-3 h-3 text-[var(--danger-text)] shrink-0" />
        <span>{children}</span>
      </span>
    );
  }

  return (
    <button
      onClick={handleClick}
      title={`Jump to ${target}${heading ? `#${heading}` : ''}`}
      className="inline-flex items-center gap-1 text-[var(--accent-text)] hover:text-[var(--accent)] font-medium underline underline-offset-4 decoration-[var(--accent-soft)] hover:decoration-[var(--accent)] bg-[var(--accent-soft)] hover:bg-[var(--accent-soft-hover)] px-1.5 py-0.5 rounded-[var(--radius-xs)] text-xs border border-[var(--accent-soft)] transition-all duration-[var(--duration-fast)] cursor-pointer"
    >
      <Link2 className="w-3 h-3 text-[var(--accent-text)] shrink-0" />
      <span>{children}</span>
    </button>
  );
};
