import FlexSearch from 'flexsearch';
import type { Note } from '@/types';

export interface SearchResultItem {
  path: string;
  title: string;
  folder: string;
  matchedField: 'title' | 'heading' | 'tag' | 'alias' | 'content';
  snippet?: string;
  headingMatch?: string;
}

interface FlexDocRecord {
  id: string; // path
  title: string;
  folder: string;
  content: string;
  headings: string;
  tags: string;
  aliases: string;
}

class SearchEngine {
  private indices = new Map<string, any>();

  /**
   * Initializes or gets the FlexSearch index instance for a specific vaultId.
   */
  private getOrCreateIndex(vaultId: string): any {
    if (!this.indices.has(vaultId)) {
      const index = new FlexSearch.Document<FlexDocRecord>({
        document: {
          id: 'id',
          index: ['title', 'content', 'headings', 'tags', 'aliases'],
        },
        tokenize: 'forward',
        resolution: 9,
        cache: true,
      });
      this.indices.set(vaultId, index);
    }
    return this.indices.get(vaultId)!;
  }

  /**
   * Indexes a full set of notes for a vault.
   */
  public indexVault(vaultId: string, notes: Note[]): void {
    const index = this.getOrCreateIndex(vaultId);

    for (const note of notes) {
      index.add({
        id: note.path,
        title: note.name,
        folder: note.folder,
        content: note.content,
        headings: note.headings.join(' '),
        tags: note.tags.join(' '),
        aliases: note.aliases.join(' '),
      });
    }
  }

  /**
   * Performs an instant search across indexed notes.
   */
  public search(vaultId: string, query: string, notes: Note[], limit = 20): SearchResultItem[] {
    const cleanQuery = query.trim();
    if (!cleanQuery) return [];

    const index = this.getOrCreateIndex(vaultId);
    const results = index.search(cleanQuery, { limit });

    const noteMap = new Map<string, Note>();
    for (const note of notes) {
      noteMap.set(note.path, note);
    }

    const searchResults: SearchResultItem[] = [];
    const seenPaths = new Set<string>();

    const queryLower = cleanQuery.toLowerCase();

    for (const fieldResult of results) {
      const fieldName = fieldResult.field as 'title' | 'content' | 'headings' | 'tags' | 'aliases';

      for (const rawItem of fieldResult.result) {
        const path = String(rawItem);
        if (seenPaths.has(path)) continue;

        const note = noteMap.get(path);
        if (!note) continue;

        seenPaths.add(path);

        // Find matched heading if any
        let matchedHeading: string | undefined;
        if (fieldName === 'headings' || note.headings.length > 0) {
          matchedHeading = note.headings.find((h) => h.toLowerCase().includes(queryLower));
        }

        // Generate snippet for content match
        let snippet: string | undefined;
        if (fieldName === 'content' || note.content) {
          const idx = note.content.toLowerCase().indexOf(queryLower);
          if (idx !== -1) {
            const start = Math.max(0, idx - 40);
            const end = Math.min(note.content.length, idx + queryLower.length + 60);
            snippet =
              (start > 0 ? '...' : '') +
              note.content.substring(start, end).replace(/\n/g, ' ') +
              (end < note.content.length ? '...' : '');
          }
        }

        let matchedType: SearchResultItem['matchedField'] = 'content';
        if (fieldName === 'title' || note.name.toLowerCase().includes(queryLower)) {
          matchedType = 'title';
        } else if (matchedHeading) {
          matchedType = 'heading';
        } else if (fieldName === 'tags' || note.tags.some((t) => t.toLowerCase().includes(queryLower))) {
          matchedType = 'tag';
        } else if (fieldName === 'aliases' || note.aliases.some((a) => a.toLowerCase().includes(queryLower))) {
          matchedType = 'alias';
        }

        searchResults.push({
          path: note.path,
          title: note.name,
          folder: note.folder,
          matchedField: matchedType,
          snippet,
          headingMatch: matchedHeading,
        });

        if (searchResults.length >= limit) break;
      }

      if (searchResults.length >= limit) break;
    }

    return searchResults;
  }

  /**
   * Clears index cache for a vault.
   */
  public clearIndex(vaultId: string): void {
    this.indices.delete(vaultId);
  }
}

export const searchEngine = new SearchEngine();
