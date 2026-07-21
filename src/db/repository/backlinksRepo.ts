import { db } from '../index';
import { slugifyWikiLink } from '@/utils/slug';
import type { Note, Backlink } from '@/types';

/**
 * Parses all [[WikiLinks]] in note contents and stores precomputed backlink records in IndexedDB.
 */
export async function generateBacklinkTable(vaultId: string, notes: Note[]): Promise<void> {
  const backlinks: Backlink[] = [];
  const wikiLinkRegex = /\[\[([^\]|#]+)(?:#[^\]|]+)?(?:\|[^\]]+)?\]\]/g;

  for (const note of notes) {
    let match: RegExpExecArray | null;
    const seenSlugsInNote = new Set<string>();

    while ((match = wikiLinkRegex.exec(note.content)) !== null) {
      const rawTarget = match[1];
      const targetSlug = slugifyWikiLink(rawTarget);

      if (targetSlug && !seenSlugsInNote.has(targetSlug)) {
        seenSlugsInNote.add(targetSlug);
        backlinks.push({
          vaultId,
          targetSlug,
          sourcePath: note.path,
          sourceTitle: note.name,
        });
      }
    }
  }

  await db.transaction('rw', db.backlinks, async () => {
    await db.backlinks.where('vaultId').equals(vaultId).delete();
    if (backlinks.length > 0) {
      await db.backlinks.bulkPut(backlinks);
    }
  });
}

/**
 * Returns pre-computed backlinks for a given note target in O(1) time.
 */
export async function getBacklinksForNote(vaultId: string, noteName: string): Promise<Backlink[]> {
  const targetSlug = slugifyWikiLink(noteName);
  return await db.backlinks.where('vaultId').equals(vaultId).filter((b) => b.targetSlug === targetSlug).toArray();
}
