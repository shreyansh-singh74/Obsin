import { create } from 'zustand';

export type SyncStage = 'idle' | 'fetching-tree' | 'comparing-shas' | 'downloading-blobs' | 'building-indices' | 'completed' | 'error';

interface SyncState {
  stage: SyncStage;
  progressMessage: string;
  completedCount: number;
  totalCount: number;
  error: string | null;

  setSyncStage: (stage: SyncStage, message?: string) => void;
  setProgress: (completed: number, total: number, message?: string) => void;
  setSyncError: (error: string) => void;
  resetSync: () => void;
}

export const useSyncStore = create<SyncState>((set) => ({
  stage: 'idle',
  progressMessage: '',
  completedCount: 0,
  totalCount: 0,
  error: null,

  setSyncStage: (stage: SyncStage, message = '') => {
    set({ stage, progressMessage: message, error: stage === 'error' ? message : null });
  },

  setProgress: (completedCount: number, totalCount: number, message?: string) => {
    set((state) => ({
      completedCount,
      totalCount,
      progressMessage: message !== undefined ? message : state.progressMessage,
    }));
  },

  setSyncError: (error: string) => {
    set({ stage: 'error', error, progressMessage: error });
  },

  resetSync: () => {
    set({
      stage: 'idle',
      progressMessage: '',
      completedCount: 0,
      totalCount: 0,
      error: null,
    });
  },
}));
