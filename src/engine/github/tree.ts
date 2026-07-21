import { fetchGitHubApi } from './api';

export interface GitTreeItem {
  path: string;
  mode: string;
  type: 'tree' | 'blob';
  sha: string;
  size?: number;
  url: string;
}

export interface FetchTreeResult {
  treeSha: string;
  items: GitTreeItem[];
  markdownFiles: GitTreeItem[];
}

export async function fetchRepositoryTree(
  owner: string,
  repo: string,
  branch = 'main',
  token?: string
): Promise<FetchTreeResult> {
  const endpoint = `/repos/${owner}/${repo}/git/trees/${encodeURIComponent(branch)}?recursive=1`;
  const { data } = await fetchGitHubApi(endpoint, token);

  if (!data.tree || !Array.isArray(data.tree)) {
    throw new Error(`Invalid repository tree response from GitHub API for ${owner}/${repo}`);
  }

  const items: GitTreeItem[] = data.tree;
  const markdownFiles = items.filter(
    (item) => item.type === 'blob' && item.path.toLowerCase().endsWith('.md')
  );

  return {
    treeSha: data.sha || branch,
    items,
    markdownFiles,
  };
}
