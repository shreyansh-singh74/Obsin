import Dexie, { type Table } from 'dexie';
import type {
  VaultConfig,
  Note,
  WikiLinkMap,
  Backlink,
  AssetMeta,
  SyncMeta,
  UserSettings,
} from '@/types';

export class ObsinDB extends Dexie {
  vaults!: Table<VaultConfig, string>;
  notes!: Table<Note, [string, string]>; // Composite PK [vaultId, path]
  wikiLinkMap!: Table<WikiLinkMap, [string, string]>; // Composite PK [vaultId, slug]
  backlinks!: Table<Backlink, [string, string, string]>; // Composite PK [vaultId, targetSlug, sourcePath]
  assetMeta!: Table<AssetMeta, [string, string]>; // Composite PK [vaultId, path]
  syncMeta!: Table<SyncMeta, string>; // PK vaultId
  userSettings!: Table<UserSettings, string>; // PK id ('default')

  constructor() {
    super('ObsinDB');

    this.version(1).stores({
      vaults: 'id, lastOpened',
      notes: '[vaultId+path], vaultId, path, sha, *tags, *aliases',
      wikiLinkMap: '[vaultId+slug], vaultId, slug, path',
      backlinks: '[vaultId+targetSlug+sourcePath], vaultId, targetSlug, sourcePath',
      assetMeta: '[vaultId+path], vaultId, path, sha',
      syncMeta: 'vaultId',
      userSettings: 'id',
    });
  }
}

export const db = new ObsinDB();
