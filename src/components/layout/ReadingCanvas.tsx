import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useVaultStore } from '@/store/useVaultStore';
import { MarkdownRenderer } from '@/components/reader/MarkdownRenderer';
import { HtmlRenderer } from '@/components/reader/HtmlRenderer';
import { MobileTocToggle, TableOfContents } from '@/components/reader/TableOfContents';
import { useSidebar } from '@/components/ui/sidebar';
import { FileText, FolderGit2, Search, Network, PanelLeft } from 'lucide-react';

export const ReadingCanvas: React.FC = () => {
  const {
    notes, activeNotePath, activeVault,
  } = useVaultStore();
  const { setOpen } = useSidebar();

  const activeNote = useMemo(() => {
    if (!notes || !activeNotePath) return null;
    return notes.find((n) => n.path === activeNotePath) || null;
  }, [notes, activeNotePath]);



  if (!activeVault) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-[var(--surface-card)] border border-[var(--border-subtle)] flex items-center justify-center">
          <FolderGit2 className="w-7 h-7 text-[var(--icon-muted)]" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">No Active Vault</h2>
          <p className="text-xs text-[var(--text-muted)] max-w-xs leading-relaxed">Select a repository from the sidebar to start reading your notes.</p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md bg-[var(--surface-card)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
          >
            <PanelLeft className="w-3.5 h-3.5" /> Open sidebar
          </button>
          <Link
            to="/auth"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md bg-[var(--accent)] text-[var(--text-on-accent)] hover:bg-[var(--accent-hover)] transition-colors"
          >
            <FolderGit2 className="w-3.5 h-3.5" /> Connect a vault
          </Link>
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
          <p className="text-xs text-[var(--text-muted)] max-w-xs leading-relaxed">Choose a note from the sidebar or open search to jump anywhere.</p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md bg-[var(--surface-card)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
          >
            <PanelLeft className="w-3.5 h-3.5" /> Browse files
          </button>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, ctrlKey: true }))}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md bg-[var(--surface-card)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" /> Search <kbd className="font-mono text-[10px] text-[var(--text-subtle)]">⌘K</kbd>
          </button>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'g', metaKey: true, ctrlKey: true }))}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md bg-[var(--surface-card)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
          >
            <Network className="w-3.5 h-3.5" /> Graph <kbd className="font-mono text-[10px] text-[var(--text-subtle)]">⌘G</kbd>
          </button>
        </div>
      </div>
    );
  }


  const isHtml = activeNote.format === 'html' || /\.html?$/i.test(activeNote.path);

  return (
    <div className="flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden bg-[var(--surface-page)] transition-colors duration-[var(--duration-fast)] ease-[var(--ease-standard)]">


      {/* Main content area: reading canvas */}
      <div className="flex-1 flex min-h-0 min-w-0 overflow-hidden">
        {/* Reading Document Canvas Container */}
        <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden">
          <div className="reading-canvas-container px-6 sm:px-8 md:px-14 lg:px-20 py-6 sm:py-8 md:py-12 min-w-0">
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

          {isHtml ? (
            <HtmlRenderer content={activeNote.content} noteName={activeNote.name} />
          ) : (
            <MarkdownRenderer content={activeNote.content} notePath={activeNote.path} noteName={activeNote.name} />
          )}
          </div>
        </main>

        {/* Desktop outline rail — sticky TOC for long notes (xl+) */}
        {!isHtml && (
          <aside className="hidden xl:block w-64 shrink-0 border-l border-[var(--border-subtle)] overflow-y-auto">
            <div className="sticky top-0 p-4">
              <TableOfContents content={activeNote.content} />
            </div>
          </aside>
        )}
      </div>

      {/* Markdown-only TOC toggle (mobile/tablet) */}
      {!isHtml && <MobileTocToggle content={activeNote.content} />}
    </div>
  );
};
