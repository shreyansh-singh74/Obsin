import { fetchGitHubApi, GitHubApiError } from './api';

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
  branchUsed: string;
}

export async function fetchRepositoryTree(
  owner: string,
  repo: string,
  branch?: string,
  token?: string
): Promise<FetchTreeResult> {
  let targetBranch = branch?.trim();

  // 1. Get repository metadata to discover default branch and verify access
  let defaultBranch = 'main';
  try {
    const repoMeta = await fetchGitHubApi(`/repos/${owner}/${repo}`, token);
    if (repoMeta.data && repoMeta.data.default_branch) {
      defaultBranch = repoMeta.data.default_branch;
    }
  } catch (err: any) {
    if (err instanceof GitHubApiError) {
      if (err.status === 404) {
        throw new Error(
          `Repository '${owner}/${repo}' not found. If this is a private repository, please add a GitHub Personal Access Token in settings.`
        );
      } else if (err.status === 401 || err.status === 403) {
        throw new Error(
          `GitHub API access restricted (${err.message}). Please configure a Personal Access Token (PAT) with repo access.`
        );
      }
    }
    // If metadata fetch failed for any reason, continue with target branch or fallback
  }

  const branchToUse = targetBranch || defaultBranch;

  // 2. Fetch Git tree recursively
  try {
    const endpoint = `/repos/${owner}/${repo}/git/trees/${encodeURIComponent(branchToUse)}?recursive=1`;
    const { data } = await fetchGitHubApi(endpoint, token);

    if (!data.tree || !Array.isArray(data.tree)) {
      throw new Error(`Invalid git tree structure returned for ${owner}/${repo} on branch '${branchToUse}'`);
    }

    const items: GitTreeItem[] = data.tree;
    const markdownFiles = items.filter(
      (item) => item.type === 'blob' && item.path.toLowerCase().endsWith('.md')
    );

    return {
      treeSha: data.sha || branchToUse,
      items,
      markdownFiles,
      branchUsed: branchToUse,
    };
  } catch (err: any) {
    // If specified branch failed and it's different from defaultBranch, try defaultBranch
    if (branchToUse !== defaultBranch) {
      console.warn(`Branch '${branchToUse}' failed, retrying default branch '${defaultBranch}'...`);
      return fetchRepositoryTree(owner, repo, defaultBranch, token);
    }
    throw err;
  }
}
