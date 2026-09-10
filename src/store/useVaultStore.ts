import { create } from 'zustand';
import type { VaultConfig, Note } from '@/types';
import { getNotesByVault } from '@/db/repository/notesRepo';
import { getAllVaults, saveVault, deleteVault } from '@/db/repository/vaultsRepo';
import { getAssetPaths } from '@/db/repository/assetsRepo';
import { searchEngine } from '@/engine/search';

interface VaultState {
  activeVault: VaultConfig | null;
  vaults: VaultConfig[];
  notes: Note[];
  assetPaths: string[];
  activeNotePath: string | null;
  isLoading: boolean;
  error: string | null;

  // Reading history
  history: string[];
  historyIndex: number;

  // Favorites
  favorites: Set<string>;

  // Sidebar folder expansion
  expandedFolderPaths: Set<string>;
  expandFolderPath: (path: string) => void;

  setActiveVault: (vault: VaultConfig) => Promise<void>;
  setActiveNotePath: (path: string | null) => void;
  navigateBack: () => void;
  navigateForward: () => void;
  canGoBack: () => boolean;
  canGoForward: () => boolean;
  toggleFavorite: (path: string) => void;
  isFavorite: (path: string) => boolean;
  loadVaults: () => Promise<void>;
  refreshNotes: () => Promise<void>;
  dropVault: (vaultId: string) => Promise<void>;
  setError: (error: string | null) => void;
}

export const useVaultStore = create<VaultState>((set, get) => ({
  activeVault: null,
  vaults: [],
  notes: [],
  assetPaths: [],
  activeNotePath: null,
  isLoading: false,
  error: null,
  history: [],
  historyIndex: -1,
  favorites: new Set<string>(),
  expandedFolderPaths: new Set<string>(),

  setActiveVault: async (vault: VaultConfig) => {
    const updatedVault = { ...vault, lastOpened: new Date().toISOString() };
    await saveVault(updatedVault);
    set({ activeVault: updatedVault, activeNotePath: null, isLoading: true, history: [], historyIndex: -1 });

    try {
      const [notes, assetPaths] = await Promise.all([
        getNotesByVault(vault.id),
        getAssetPaths(vault.id),
      ]);
      // Rebuild the in-memory search index from local data so search works
      // even offline, before/without any sync.
      searchEngine.indexVault(vault.id, notes);
      const firstNotePath = notes.length > 0 ? notes[0].path : null;
      const initialHistory = firstNotePath ? [firstNotePath] : [];
      set({ notes, assetPaths, activeNotePath: firstNotePath, isLoading: false, history: initialHistory, historyIndex: firstNotePath ? 0 : -1 });
    } catch (err: any) {
      set({ error: err.message || 'Failed to load notes for vault', isLoading: false });
    }
  },

  setActiveNotePath: (path: string | null) => {
    const { history, historyIndex } = get();
    if (!path) {
      set({ activeNotePath: null });
      return;
    }

    // Don't add duplicate consecutive entries
    if (history[historyIndex] === path) {
      set({ activeNotePath: path });
      return;
    }

    // Truncate forward history when navigating to a new note
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(path);

    // Cap history at 100 entries
    if (newHistory.length > 100) {
      newHistory.shift();
    }

    set({
      activeNotePath: path,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  navigateBack: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      set({ activeNotePath: history[newIndex], historyIndex: newIndex });
    }
  },

  navigateForward: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      set({ activeNotePath: history[newIndex], historyIndex: newIndex });
    }
  },

  canGoBack: () => {
    return get().historyIndex > 0;
  },

  canGoForward: () => {
    const { history, historyIndex } = get();
    return historyIndex < history.length - 1;
  },

  toggleFavorite: (path: string) => {
    const { favorites } = get();
    const newFavorites = new Set(favorites);
    if (newFavorites.has(path)) {
      newFavorites.delete(path);
    } else {
      newFavorites.add(path);
    }
    set({ favorites: newFavorites });
  },

  isFavorite: (path: string) => {
    return get().favorites.has(path);
  },

  expandFolderPath: (path: string) => {
    const { expandedFolderPaths } = get();
    const newExpanded = new Set(expandedFolderPaths);
    // Expand this folder and all ancestors
    const parts = path.split('/');
    let current = '';
    for (let i = 0; i < parts.length; i++) {
      current = current ? current + '/' + parts[i] : parts[i];
      newExpanded.add(current);
    }
    set({ expandedFolderPaths: newExpanded });
  },

  loadVaults: async () => {
    try {
      const vaults = await getAllVaults();
      set({ vaults });
      if (vaults.length > 0 && !get().activeVault) {
        await get().setActiveVault(vaults[0]);
      }
    } catch (err: any) {
      set({ error: err.message || 'Failed to load vaults from DB' });
    }
  },

  refreshNotes: async () => {
    const activeVault = get().activeVault;
    if (!activeVault) return;
    const [notes, assetPaths] = await Promise.all([
      getNotesByVault(activeVault.id),
      getAssetPaths(activeVault.id),
    ]);
    // Keep the search index in step with refreshed notes.
    searchEngine.indexVault(activeVault.id, notes);
    const currentActivePath = get().activeNotePath;
    const validPath = notes.some((n) => n.path === currentActivePath)
      ? currentActivePath
      : notes.length > 0
      ? notes[0].path
      : null;

    set({ notes, assetPaths, activeNotePath: validPath });
  },

  dropVault: async (vaultId: string) => {
    const { activeVault, vaults } = get();

    // Clear the in-memory search index for this vault
    searchEngine.clearIndex(vaultId);

    // Delete from IndexedDB (all 7 vault-scoped tables)
    await deleteVault(vaultId);

    // Refresh vault list
    const remaining = vaults.filter((v) => v.id !== vaultId);
    set({ vaults: remaining });

    // If the dropped vault was active, switch to another or clear
    if (activeVault?.id === vaultId) {
      if (remaining.length > 0) {
        await get().setActiveVault(remaining[0]);
      } else {
        set({ activeVault: null, notes: [], assetPaths: [], activeNotePath: null });
      }
    }
  },

  setError: (error: string | null) => {
    set({ error });
  },
}));
