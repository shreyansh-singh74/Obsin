import React, { useMemo, useState } from 'react';
import { useVaultStore } from '@/store/useVaultStore';
import { Tag, X, Hash } from 'lucide-react';

interface TagBrowserProps {
  onNoteSelected?: () => void;
}

/**
 * Tag browser panel — shows all tags as a clickable cloud,
 * filtering the note list when a tag is selected.
 */
export const TagBrowser: React.FC<TagBrowserProps> = ({ onNoteSelected }) => {
  const { notes, setActiveNotePath, activeNotePath } = useVaultStore();
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Extract all unique tags with counts
  const tagCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const note of notes) {
      for (const tag of note.tags) {
        counts.set(tag, (counts.get(tag) || 0) + 1);
      }
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1]);
  }, [notes]);

  // Notes matching the selected tag
  const filteredNotes = useMemo(() => {
    if (!selectedTag) return [];
    return notes.filter((n) => n.tags.includes(selectedTag));
  }, [notes, selectedTag]);

  if (tagCounts.length === 0) return null;

  return (
    <div className="border-t border-[var(--border-subtle)] px-3 py-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1">
          <Hash className="w-3 h-3 text-[var(--accent-text)]" />
          Tags
          <span className="text-[var(--text-subtle)] font-normal">({tagCounts.length})</span>
        </span>
        {selectedTag && (
          <button
            onClick={() => setSelectedTag(null)}
            className="text-[10px] text-[var(--accent-text)] hover:text-[var(--accent)] flex items-center gap-0.5 cursor-pointer"
          >
            <X className="w-2.5 h-2.5" /> clear
          </button>
        )}
      </div>

      {/* Tag cloud */}
      <div className="flex flex-wrap gap-1 mb-2">
        {tagCounts.map(([tag, count]) => (
          <button
            key={tag}
            onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium transition-all cursor-pointer border ${
              selectedTag === tag
                ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                : 'bg-[var(--surface-card)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:border-[var(--accent-soft)] hover:text-[var(--accent-text)]'
            }`}
          >
            #{tag}
            <span className={`text-[9px] ${selectedTag === tag ? 'text-white/70' : 'text-[var(--text-subtle)]'}`}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Filtered notes list */}
      {selectedTag && filteredNotes.length > 0 && (
        <div className="space-y-0.5 mt-2 max-h-[200px] overflow-y-auto">
          <p className="text-[10px] text-[var(--text-muted)] mb-1">
            {filteredNotes.length} note{filteredNotes.length !== 1 ? 's' : ''} tagged #{selectedTag}
          </p>
          {filteredNotes.map((note) => (
            <button
              key={note.path}
              onClick={() => {
                setActiveNotePath(note.path);
                onNoteSelected?.();
              }}
              className={`w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                note.path === activeNotePath
                  ? 'bg-[var(--accent-soft)] text-[var(--accent-text)]'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Tag className="w-3 h-3 text-[var(--icon-muted)] shrink-0" />
              <span className="truncate">{note.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
