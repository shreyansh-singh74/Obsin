import { create } from 'zustand';
import type { VaultConfig, Note } from '@/types';
import { getNotesByVault } from '@/db/repository/notesRepo';
import { getAllVaults, saveVault } from '@/db/repository/vaultsRepo';

interface VaultState {
  activeVault: VaultConfig | null;
  vaults: VaultConfig[];
  notes: Note[];
  activeNotePath: string | null;
  isLoading: boolean;
  error: string | null;

  setActiveVault: (vault: VaultConfig) => Promise<void>;
  setActiveNotePath: (path: string | null) => void;
  loadVaults: () => Promise<void>;
  refreshNotes: () => Promise<void>;
  setError: (error: string | null) => void;
}

export const useVaultStore = create<VaultState>((set, get) => ({
  activeVault: null,
  vaults: [],
  notes: [],
  activeNotePath: null,
  isLoading: false,
  error: null,

  setActiveVault: async (vault: VaultConfig) => {
    const updatedVault = { ...vault, lastOpened: new Date().toISOString() };
    await saveVault(updatedVault);
    set({ activeVault: updatedVault, activeNotePath: null, isLoading: true });

    try {
      const notes = await getNotesByVault(vault.id);
      const firstNotePath = notes.length > 0 ? notes[0].path : null;
      set({ notes, activeNotePath: firstNotePath, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to load notes for vault', isLoading: false });
    }
  },

  setActiveNotePath: (path: string | null) => {
    set({ activeNotePath: path });
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
    const notes = await getNotesByVault(activeVault.id);
    const currentActivePath = get().activeNotePath;
    const validPath = notes.some((n) => n.path === currentActivePath)
      ? currentActivePath
      : notes.length > 0
      ? notes[0].path
      : null;

    set({ notes, activeNotePath: validPath });
  },

  setError: (error: string | null) => {
    set({ error });
  },
}));
