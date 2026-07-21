import { searchEngine } from '@/engine/search';
import { getNotesByVault } from '@/db/repository/notesRepo';

export async function rebuildSearchIndex(vaultId: string): Promise<void> {
  const notes = await getNotesByVault(vaultId);
  searchEngine.clearIndex(vaultId);
  searchEngine.indexVault(vaultId, notes);
}

export function formatRateLimitResetTime(resetUnixSeconds: number): string {
  const resetDate = new Date(resetUnixSeconds * 1000);
  const now = new Date();
  const diffMs = resetDate.getTime() - now.getTime();
  const diffMinutes = Math.ceil(diffMs / (1000 * 60));
  
  if (diffMinutes <= 1) return 'in less than a minute';
  return `in ~${diffMinutes} minutes (${resetDate.toLocaleTimeString()})`;
}
