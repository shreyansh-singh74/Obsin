import React, { useMemo } from 'react';
import { useVaultStore } from '@/store/useVaultStore';
import { MarkdownRenderer } from '@/components/reader/MarkdownRenderer';
import { MobileTocToggle } from '@/components/reader/TableOfContents';
import { FileText } from 'lucide-react';

export const ReadingCanvas: React.FC = () => {
  const {
    notes, activeNotePath, activeVault,
  } = useVaultStore();

  const activeNote = useMemo(() => {
    if (!notes || !activeNotePath) return null;
    return notes.find((n) => n.path === activeNotePath) || null;
  }, [notes, activeNotePath]);



  if (!activeVault) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-[var(--surface-card)] border border-[var(--border-subtle)] flex items-center justify-center">
          <FileText className="w-7 h-7 text-[var(--icon-muted)]" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">No Active Vault</h2>
          <p className="text-xs text-[var(--text-muted)] max-w-xs leading-relaxed">Select a repository from the sidebar to start reading your notes.</p>
        </div>
      </div>
    );
  }

  if (!activeNote) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-[var(--surface-card)] border border-[var(--border-subtle)] flex items-center justify-center">
          <FileText className="w-7 h-7 text-[var(--icon-muted)]" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">Select a Note</h2>
          <p className="text-xs text-[var(--text-muted)] max-w-xs leading-relaxed">Choose a note from the sidebar or press <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface-card)] border border-[var(--border-subtle)] text-[var(--text-secondary)] font-mono text-[10px]">⌘K</kbd> to search.</p>
        </div>
      </div>
    );
  }


  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[var(--surface-page)] transition-colors duration-[var(--duration-fast)] ease-[var(--ease-standard)]">


      {/* Main content area: reading canvas */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Reading Document Canvas Container */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="reading-canvas-container px-6 sm:px-8 md:px-14 lg:px-20 py-6 sm:py-8 md:py-12 max-w-full">
          {/* Title Header */}
          <div className="mb-4">
            <h1 className="text-xl md:text-2xl font-bold text-[var(--text-primary)] tracking-tight leading-snug break-words">
              {activeNote.name}
            </h1>

            {/* Tags & Metadata */}
            {(activeNote.tags.length > 0 || activeNote.aliases.length > 0) && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {activeNote.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent-text)] text-[11px] font-medium"
                  >
                    #{tag}
                  </span>
                ))}

                {activeNote.aliases.map((alias) => (
                  <span
                    key={alias}
                    className="px-2 py-0.5 rounded-full bg-[var(--warning-bg)] text-[var(--warning-text)] text-[11px] font-medium"
                  >
                    alias: {alias}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Markdown Renderer */}
          <MarkdownRenderer content={activeNote.content} notePath={activeNote.path} noteName={activeNote.name} />
          </div>
        </main>
      </div>

      {/* TOC toggle */}
      <MobileTocToggle content={activeNote.content} />
    </div>
  );
};
