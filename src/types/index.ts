export interface VaultConfig {
  id: string; // e.g. "default-vault" or "work-vault"
  owner: string; // GitHub owner
  repo: string; // GitHub repo name
  branch: string; // Default "main" or "master"
  name: string; // Display name
  lastOpened: string; // ISO date string
}

export interface Note {
  vaultId: string;
  path: string; // Relative path in repo, e.g. "Programming/Docker.md"
  name: string; // Note title / file basename without extension
  folder: string; // Folder path, e.g. "Programming"
  content: string; // Raw markdown ONLY
  sha: string; // Git blob SHA
  updatedAt: string; // ISO date string
  tags: string[]; // Parsed frontmatter tags
  aliases: string[]; // Parsed frontmatter aliases
  headings: string[]; // Extracted headings (# Section)
}

export interface SyncMeta {
  vaultId: string;
  lastCommitSha: string;
  lastSyncTime: string;
  status: 'idle' | 'syncing' | 'completed' | 'error';
  progressMessage?: string;
  processedCount?: number;
  totalCount?: number;
}

export interface WikiLinkMap {
  vaultId: string;
  slug: string; // Lowercase slug, e.g. "docker"
  path: string; // Destination path, e.g. "Programming/Docker.md"
}

export interface Backlink {
  vaultId: string;
  targetSlug: string; // The note being linked to
  sourcePath: string; // The note containing the wiki-link
  sourceTitle: string; // Title of the source note
}

export interface AssetMeta {
  vaultId: string;
  path: string;
  sha: string;
  mime: string;
  size: number;
  cacheKey: string;
}

export interface UserSettings {
  id: string; // Always 'default'
  theme: 'light' | 'dark' | 'sepia';
  fontSize: number; // e.g. 16
  readingWidth: number; // e.g. 720
  lineSpacing: number; // e.g. 1.8
  activeVaultId: string;
  lastOpenedPath?: string;
}

export interface GithubUser {
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
    avatar_url: string;
  };
  private: boolean;
  html_url: string;
  description: string | null;
  default_branch: string;
  updated_at: string;
}

export interface GitHubBranch {
  name: string;
  protected: boolean;
}