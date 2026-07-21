import { fetchRepositoryTree, GitTreeItem } from '@/engine/github/tree';
import { batchFetchMarkdownFiles } from '@/engine/github/batch';
import { bulkUpsertNotes, deleteNotesByPaths, getNotesByVault } from '@/db/repository/notesRepo';
import { updateWikiLinkMap } from '@/db/repository/wikiMapRepo';
import { generateBacklinkTable } from '@/db/repository/backlinksRepo';
import { saveVault } from '@/db/repository/vaultsRepo';
import { searchEngine } from '@/engine/search';
import { useSyncStore } from '@/store/useSyncStore';
import { db } from '@/db';
import type { Note, VaultConfig, SyncMeta } from '@/types';

export async function executeVaultSync(vault: VaultConfig, token?: string): Promise<Note[]> {
  const { setSyncStage, setProgress, setSyncError, resetSync } = useSyncStore.getState();

  try {
    // Stage 1: Fetch Repository Tree & discover branch
    setSyncStage('fetching-tree', `Connecting to GitHub API for ${vault.owner}/${vault.repo}...`);
    const { treeSha, markdownFiles, branchUsed } = await fetchRepositoryTree(
      vault.owner,
      vault.repo,
      vault.branch,
      token
    );

    // Save updated branch if auto-discovered
    if (branchUsed && branchUsed !== vault.branch) {
      vault.branch = branchUsed;
      await saveVault(vault);
    }

    // Stage 2: Compare SHAs against local IndexedDB
    setSyncStage('comparing-shas', 'Comparing remote SHAs with local database...');
    const localNotes = await getNotesByVault(vault.id);
    const localNotesMap = new Map<string, Note>();
    for (const note of localNotes) {
      localNotesMap.set(note.path, note);
    }

    const filesToFetch: GitTreeItem[] = [];
    const remotePathsSet = new Set<string>();

    for (const remoteFile of markdownFiles) {
      remotePathsSet.add(remoteFile.path);
      const existingLocalNote = localNotesMap.get(remoteFile.path);

      // Fetch if new or SHA changed
      if (!existingLocalNote || existingLocalNote.sha !== remoteFile.sha) {
        filesToFetch.push(remoteFile);
      }
    }

    // Ghost Note Prevention: Detect local files deleted on GitHub
    const pathsToDelete: string[] = [];
    for (const localPath of localNotesMap.keys()) {
      if (!remotePathsSet.has(localPath)) {
        pathsToDelete.push(localPath);
      }
    }

    if (pathsToDelete.length > 0) {
      console.log(`Ghost note prevention: Purging ${pathsToDelete.length} deleted remote files...`);
      await deleteNotesByPaths(vault.id, pathsToDelete);
    }

    // Stage 3: Download Changed Blobs
    if (filesToFetch.length > 0) {
      setSyncStage('downloading-blobs', `Fetching ${filesToFetch.length} updated markdown files...`);

      const fetchedNotes = await batchFetchMarkdownFiles(
        vault.id,
        vault.owner,
        vault.repo,
        vault.branch,
        filesToFetch,
        token,
        (progress) => {
          setProgress(
            progress.completed,
            progress.total,
            `Downloading (${progress.completed}/${progress.total}): ${progress.currentPath}`
          );
        }
      );

      // Save updated notes to IndexedDB
      await bulkUpsertNotes(fetchedNotes);
    } else {
      console.log('No notes changed remotely. Database up-to-date.');
    }

    // Stage 4: Building WikiLink Maps & Backlinks
    setSyncStage('building-indices', 'Building WikiLink map and pre-computing backlinks...');
    const currentVaultNotes = await getNotesByVault(vault.id);

    await updateWikiLinkMap(vault.id, currentVaultNotes);
    await generateBacklinkTable(vault.id, currentVaultNotes);

    // Stage 5: Building FlexSearch Index
    searchEngine.indexVault(vault.id, currentVaultNotes);

    // Stage 6: Update Sync Meta
    const syncMeta: SyncMeta = {
      vaultId: vault.id,
      lastCommitSha: treeSha,
      lastSyncTime: new Date().toISOString(),
      status: 'completed',
    };
    await db.syncMeta.put(syncMeta);

    setSyncStage('completed', `Sync completed! ${currentVaultNotes.length} notes active.`);
    setTimeout(() => {
      resetSync();
    }, 3000);

    return currentVaultNotes;
  } catch (err: any) {
    console.error('Vault Sync Error:', err);
    setSyncError(err.message || 'Vault synchronization failed.');
    throw err;
  }
}
