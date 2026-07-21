import { db } from '../index';
import type { Note } from '@/types';

export async function upsertNote(note: Note): Promise<void> {
  await db.notes.put(note);
}

export async function bulkUpsertNotes(notes: Note[]): Promise<void> {
  if (notes.length === 0) return;
  await db.notes.bulkPut(notes);
}

export async function getNoteByPath(vaultId: string, path: string): Promise<Note | undefined> {
  return await db.notes.get([vaultId, path]);
}

export async function getNotesByVault(vaultId: string): Promise<Note[]> {
  return await db.notes.where('vaultId').equals(vaultId).toArray();
}

export async function deleteNotesByPaths(vaultId: string, paths: string[]): Promise<void> {
  if (paths.length === 0) return;
  const keys: [string, string][] = paths.map((path) => [vaultId, path]);
  await db.notes.bulkDelete(keys);
}

export async function getNoteCount(vaultId: string): Promise<number> {
  return await db.notes.where('vaultId').equals(vaultId).count();
}
