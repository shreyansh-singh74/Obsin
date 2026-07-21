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
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500 space-y-3">
        <FileText className="w-12 h-12 stroke-1 text-slate-600 animate-bounce" />
        <h2 className="text-base font-semibold text-slate-300">No Active Vault</h2>
        <p className="text-xs max-w-sm">Select or add a GitHub repository vault from the top header dropdown to start reading your notes.</p>
      </div>
    );
  }

  if (!activeNote) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500 space-y-3">
        <FileText className="w-12 h-12 stroke-1 text-slate-600" />
        <h2 className="text-base font-semibold text-slate-300">Select a Note</h2>
        <p className="text-xs max-w-sm">Choose a markdown note from the folder sidebar or press <code className="text-indigo-400 font-mono">⌘K</code> to search across your vault.</p>
      </div>
    );
  }

  const pathParts = activeNote.path.split('/');

  return (
    <div className="flex-1 overflow-y-auto app-bg flex flex-col transition-colors duration-200">
      {/* Top Breadcrumb Bar */}
      <div className="border-b app-border px-8 py-3 surface-bg text-xs font-mono text-secondary-theme flex items-center justify-between sticky top-0 backdrop-blur z-20">
        <div className="flex items-center gap-1.5 truncate max-w-xl">
          <span className="text-indigo-400 font-semibold">{activeVault.name}</span>
          {pathParts.map((part, i) => (
            <React.Fragment key={i}>
              <span className="text-slate-600">/</span>
              <span className={i === pathParts.length - 1 ? 'text-slate-200 font-medium truncate' : 'text-slate-400 truncate'}>
                {part}
              </span>
            </React.Fragment>
          ))}
        </div>

        <div className="flex items-center gap-3 text-[10px] text-slate-500 shrink-0">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-600" /> {Math.ceil(activeNote.content.split(/\s+/).length / 200)} min read
          </span>
          <span className="flex items-center gap-1 font-mono text-indigo-400/80">
            SHA: {activeNote.sha.substring(0, 7)}
          </span>
        </div>
      </div>

      {/* Reading Document Canvas Container (Enforcing 720px max-width) */}
      <main className="flex-1 max-w-[720px] w-full mx-auto px-6 py-10">
        {/* Title Header */}
        <div className="space-y-4 mb-8 pb-6 border-b border-slate-800/80">
          <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight leading-tight">
            {activeNote.name}
          </h1>

          {/* Tags & Metadata Badges */}
          {(activeNote.tags.length > 0 || activeNote.aliases.length > 0) && (
            <div className="flex flex-wrap gap-2 text-xs pt-1">
              {activeNote.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-mono text-xs"
                >
                  <Tag className="w-3 h-3 text-indigo-400" /> #{tag}
                </span>
              ))}

              {activeNote.aliases.map((alias) => (
                <span
                  key={alias}
                  className="px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono text-xs"
                >
                  alias: {alias}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* On-Demand Raw Markdown Renderer */}
        <MarkdownRenderer content={activeNote.content} noteName={activeNote.name} />
      </main>
    </div>
  );
};
