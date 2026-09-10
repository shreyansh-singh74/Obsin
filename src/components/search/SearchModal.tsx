import React, { useEffect, useState } from 'react';
import { Bookmark, FileText, Hash, Heading, Search } from 'lucide-react';
import { useVaultStore } from '@/store/useVaultStore';
import { searchEngine, type SearchResultItem } from '@/engine/search';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from '@/components/ui/command';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MATCH_LABELS: Record<SearchResultItem['matchedField'], string> = {
  title: 'Title',
  heading: 'Heading',
  tag: 'Tag',
  alias: 'Alias',
  content: 'Content',
};

function ResultIcon({ field }: { field: SearchResultItem['matchedField'] }) {
  if (field === 'heading') return <Heading className="size-4 text-[var(--success-text)]" />;
  if (field === 'tag') return <Hash className="size-4 text-[var(--warning-text)]" />;
  if (field === 'alias') return <Bookmark className="size-4 text-[var(--accent-text)]" />;
  return <FileText className="size-4 text-[var(--info-text)]" />;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const { activeVault, notes, setActiveNotePath } = useVaultStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    setQuery('');
    setResults([]);
  }, [isOpen]);

  useEffect(() => {
    if (!activeVault || !query.trim()) {
      setResults([]);
      return;
    }

    setResults(searchEngine.search(activeVault.id, query, notes, 25));
  }, [query, activeVault, notes]);

  function openResult(path: string) {
    setActiveNotePath(path);
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[var(--z-modal)] flex items-start justify-center bg-black/55 px-3 pt-[10vh] backdrop-blur-[2px] animate-fade-in sm:px-6 sm:pt-[14vh]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search vault"
        className="w-full max-w-xl overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-modal)] shadow-[var(--shadow-lg)] animate-pop-in"
      >
        <Command
          shouldFilter={false}
          loop
          onKeyDown={(event) => {
            if (event.key === 'Escape') onClose();
          }}
        >
          <CommandInput
            autoFocus
            value={query}
            onValueChange={setQuery}
            placeholder="Search notes, headings, tags, aliases..."
          />

          <CommandList>
            {!query.trim() && (
              <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
                <div className="mb-3 flex size-10 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--surface-card)]">
                  <Search className="size-4 text-[var(--text-muted)]" />
                </div>
                <p className="text-sm font-medium text-[var(--text-primary)]">Search your vault</p>
                <p className="mt-1 max-w-xs text-xs leading-relaxed text-[var(--text-muted)]">
                  Find notes by title, content, heading, tag, or alias.
                </p>
              </div>
            )}

            {query.trim() && results.length === 0 && (
              <CommandEmpty>
                <p className="font-medium text-[var(--text-primary)]">No results found</p>
                <p className="mt-1 text-xs">Try a different title, tag, or phrase.</p>
              </CommandEmpty>
            )}

            {results.length > 0 && (
              <CommandGroup heading={`${results.length} result${results.length === 1 ? '' : 's'}`}>
                {results.map((item) => (
                  <CommandItem
                    key={item.path}
                    value={item.path}
                    onSelect={() => openResult(item.path)}
                  >
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--surface-input)]">
                      <ResultIcon field={item.matchedField} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-xs font-semibold text-[var(--text-primary)]">
                          {item.title}
                        </span>
                        <span className="shrink-0 rounded-full bg-[var(--surface-card)] px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-[var(--text-subtle)]">
                          {MATCH_LABELS[item.matchedField]}
                        </span>
                      </div>

                      {item.headingMatch ? (
                        <p className="mt-0.5 truncate text-[11px] text-[var(--success-text)]">
                          {item.headingMatch}
                        </p>
                      ) : item.snippet ? (
                        <p className="mt-0.5 truncate text-[11px] text-[var(--text-muted)]">
                          {item.snippet}
                        </p>
                      ) : item.folder ? (
                        <p className="mt-0.5 truncate text-[11px] text-[var(--text-subtle)]">
                          {item.folder}
                        </p>
                      ) : null}
                    </div>

                    {item.folder && (
                      <CommandShortcut className="hidden max-w-32 truncate sm:block">
                        {item.folder}
                      </CommandShortcut>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>

          <div className="hidden items-center gap-4 border-t border-[var(--border-subtle)] px-4 py-2 text-[10px] text-[var(--text-subtle)] sm:flex">
            <span className="flex items-center gap-1.5"><kbd className="rounded border border-[var(--border-default)] bg-[var(--surface-card)] px-1.5 py-0.5">↑↓</kbd> Navigate</span>
            <span className="flex items-center gap-1.5"><kbd className="rounded border border-[var(--border-default)] bg-[var(--surface-card)] px-1.5 py-0.5">↵</kbd> Open</span>
            <span className="ml-auto flex items-center gap-1.5"><kbd className="rounded border border-[var(--border-default)] bg-[var(--surface-card)] px-1.5 py-0.5">Esc</kbd> Close</span>
          </div>
        </Command>
      </div>
    </div>
  );
};
