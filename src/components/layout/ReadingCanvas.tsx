import React, { useMemo } from 'react';
import { useVaultStore } from '@/store/useVaultStore';
import { MarkdownRenderer } from '@/components/reader/MarkdownRenderer';
import { FileText, Tag, Clock } from 'lucide-react';

export const ReadingCanvas: React.FC = () => {
  const { notes, activeNotePath, activeVault } = useVaultStore();

  const activeNote = useMemo(() => {
    if (!notes || !activeNotePath) return null;
    return notes.find((n) => n.path === activeNotePath) || null;
  }, [notes, activeNotePath]);

  if (!activeVault) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-[var(--text-muted)] space-y-3 bg-[var(--surface-page)]">
        <FileText className="w-12 h-12 stroke-1 text-[var(--icon-muted)] animate-bounce" />
        <h2 className="text-base font-semibold text-[var(--text-primary)]">No Active Vault</h2>
        <p className="text-xs max-w-sm text-[var(--text-secondary)]">Select or add a GitHub repository vault from the top header dropdown to start reading your notes.</p>
      </div>
    );
  }

  if (!activeNote) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-[var(--text-muted)] space-y-3 bg-[var(--surface-page)]">
        <FileText className="w-12 h-12 stroke-1 text-[var(--icon-muted)]" />
        <h2 className="text-base font-semibold text-[var(--text-primary)]">Select a Note</h2>
        <p className="text-xs max-w-sm text-[var(--text-secondary)]">Choose a markdown note from the folder sidebar or press <code className="text-[var(--accent-text)] font-mono">⌘K</code> to search across your vault.</p>
      </div>
    );
  }

  const pathParts = activeNote.path.split('/');

  return (
    <div className="flex-1 overflow-y-auto bg-[var(--surface-page)] flex flex-col transition-colors duration-[var(--duration-fast)] ease-[var(--ease-standard)]">
      {/* Top Breadcrumb Bar */}
      <div className="border-b border-[var(--border-subtle)] px-4 md:px-6 py-2.5 md:py-3 bg-[var(--surface-sidebar)] text-xs md:text-xs font-mono text-[var(--text-secondary)] flex items-center justify-between sticky top-0 backdrop-blur z-[var(--z-sticky)]">
        <div className="flex items-center gap-1.5 min-w-0 overflow-x-auto scrollbar-none max-w-full">
          <span className="text-[var(--accent-text)] font-semibold shrink-0">{activeVault.name}</span>
          {pathParts.map((part, i) => (
            <React.Fragment key={i}>
              <span className="text-[var(--text-subtle)] shrink-0">/</span>
              <span className={`shrink-0 ${i === pathParts.length - 1 ? 'text-[var(--text-primary)] font-medium' : 'text-[var(--text-muted)]'}`}>
                {part}
              </span>
            </React.Fragment>
          ))}
        </div>

        <div className="flex items-center gap-3 text-[10px] text-[var(--text-muted)] shrink-0 pl-3">
          <span className="hidden sm:flex items-center gap-1">
            <Clock className="w-3 h-3 text-[var(--icon-muted)]" /> {Math.ceil(activeNote.content.split(/\s+/).length / 200)} min read
          </span>
          <span className="hidden sm:flex items-center gap-1 font-mono text-[var(--accent-text)]">
            SHA: {activeNote.sha.substring(0, 7)}
          </span>
        </div>
      </div>

      {/* Reading Document Canvas Container (Responsive Max-Width: min(740px, 100%)) */}
      <main className="flex-1 reading-canvas-container px-4 md:px-6 py-6 md:py-10">
        {/* Title Header */}
        <div className="space-y-4 mb-8 pb-6 border-b border-[var(--border-subtle)]">
          <h1 className="text-2xl md:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight leading-tight">
            {activeNote.name}
          </h1>

          {/* Tags & Metadata Badges */}
          {(activeNote.tags.length > 0 || activeNote.aliases.length > 0) && (
            <div className="flex flex-wrap gap-2 text-xs pt-1">
              {activeNote.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[var(--radius-sm)] bg-[var(--accent-soft)] text-[var(--accent-text)] border border-[var(--accent-soft)] font-mono text-xs"
                >
                  <Tag className="w-3 h-3 text-[var(--accent-text)]" /> #{tag}
                </span>
              ))}

              {activeNote.aliases.map((alias) => (
                <span
                  key={alias}
                  className="px-2.5 py-1 rounded-[var(--radius-sm)] bg-[var(--warning-bg)] text-[var(--warning-text)] border border-[var(--warning-text)]/20 font-mono text-xs"
                >
                  alias: {alias}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* On-Demand Raw Markdown Renderer */}
        <MarkdownRenderer content={activeNote.content} notePath={activeNote.path} noteName={activeNote.name} />
      </main>
    </div>
  );
};
