import { db } from '../index';
import { slugifyWikiLink } from '@/utils/slug';
import type { Note, WikiLinkMap } from '@/types';

export async function updateWikiLinkMap(vaultId: string, notes: Note[]): Promise<void> {
  const entries: WikiLinkMap[] = [];

  for (const note of notes) {
    // 1. Primary slug from note title / filename
    const primarySlug = slugifyWikiLink(note.name);
    entries.push({ vaultId, slug: primarySlug, path: note.path });

    // 2. Slugs from aliases
    for (const alias of note.aliases) {
      const aliasSlug = slugifyWikiLink(alias);
      entries.push({ vaultId, slug: aliasSlug, path: note.path });
    }
  }

  await db.transaction('rw', db.wikiLinkMap, async () => {
    await db.wikiLinkMap.where('vaultId').equals(vaultId).delete();
    if (entries.length > 0) {
      await db.wikiLinkMap.bulkPut(entries);
    }
  });
}

export async function resolveWikiLinkPath(vaultId: string, targetLink: string): Promise<string | null> {
  const slug = slugifyWikiLink(targetLink);
  const match = await db.wikiLinkMap.get([vaultId, slug]);
  return match ? match.path : null;
}
