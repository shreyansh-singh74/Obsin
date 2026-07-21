import React, { useState, useEffect, useRef } from 'react';
import { useVaultStore } from '@/store/useVaultStore';
import { searchEngine, SearchResultItem } from '@/engine/search';
import { Search, FileText, Hash, Bookmark, Heading, X } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const { activeVault, notes, setActiveNotePath } = useVaultStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!activeVault || !query.trim()) {
      setResults([]);
      return;
    }

    const searchHits = searchEngine.search(activeVault.id, query, notes, 25);
    setResults(searchHits);
    setSelectedIndex(0);
  }, [query, activeVault, notes]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        setActiveNotePath(results[selectedIndex].path);
        onClose();
      }
    }
  }

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-start justify-center pt-16 px-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
      >
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3 bg-slate-900/90">
          <Search className="w-5 h-5 text-indigo-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search title, content, headings (#), tags, aliases..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-sm font-sans text-slate-100 placeholder-slate-500 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded hover:bg-slate-800 text-slate-500 hover:text-slate-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="text-[10px] font-mono text-slate-500 border border-slate-800 px-1.5 py-0.5 rounded bg-slate-950">
            ESC
          </span>
        </div>

        {/* Search Results List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {results.length > 0 ? (
            results.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={`${item.path}-${idx}`}
                  onClick={() => {
                    setActiveNotePath(item.path);
                    onClose();
                  }}
                  className={`w-full text-left p-3 rounded-xl transition-all flex items-start gap-3 cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600/20 border border-indigo-500/40 text-white'
                      : 'hover:bg-slate-800/60 border border-transparent text-slate-300'
                  }`}
                >
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-indigo-400 shrink-0 mt-0.5">
                    {item.matchedField === 'heading' ? (
                      <Heading className="w-4 h-4 text-emerald-400" />
                    ) : item.matchedField === 'tag' ? (
                      <Hash className="w-4 h-4 text-amber-400" />
                    ) : item.matchedField === 'alias' ? (
                      <Bookmark className="w-4 h-4 text-purple-400" />
                    ) : (
                      <FileText className="w-4 h-4 text-indigo-400" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-xs text-slate-100 truncate">{item.title}</span>
                      {item.folder && (
                        <span className="text-[10px] font-mono text-slate-500 truncate max-w-[150px]">
                          {item.folder}
                        </span>
                      )}
                    </div>

                    {item.headingMatch && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-300 font-mono mt-0.5">
                        <Heading className="w-3 h-3" /> Section: {item.headingMatch}
                      </span>
                    )}

                    {item.snippet && (
                      <p className="text-xs text-slate-400 font-mono mt-1 line-clamp-2 leading-snug opacity-90">
                        {item.snippet}
                      </p>
                    )}
                  </div>
                </button>
              );
            })
          ) : query.trim() ? (
            <div className="p-8 text-center text-xs text-slate-500 font-mono space-y-1">
              <p>No search results found for "{query}"</p>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-500 font-sans space-y-1">
              <p className="text-slate-400 font-medium">Type a search term to find notes instantly</p>
              <p className="text-[11px] font-mono text-slate-600">Supports searching headers (#), tags, aliases, and contents</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
