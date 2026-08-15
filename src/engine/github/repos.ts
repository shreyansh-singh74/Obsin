import { fetchGitHubApi } from './api';
import { GitHubRepo, GitHubBranch } from '@/types';

/**
 * Fetches up to 100 repositories owned or accessible by the authenticated user, sorted by last updated.
 */
export async function fetchUserRepos(token: string): Promise<GitHubRepo[]> {
  const { data } = await fetchGitHubApi('/user/repos?sort=updated&per_page=100', token);

  return data.map((repo: any) => ({
    id: repo.id,
    name: repo.name,
    full_name: repo.full_name,
    owner: {
      login: repo.owner.login,
      avatar_url: repo.owner.avatar_url,
    },
    private: repo.private,
    html_url: repo.html_url,
    description: repo.description ?? null,
    default_branch: repo.default_branch || 'main',
    updated_at: repo.updated_at,
  }));
}

/**
 * Fetches all branches for a specific repository.
 */
export async function fetchRepoBranches(
  token: string,
  owner: string,
  repo: string
): Promise<GitHubBranch[]> {
  const { data } = await fetchGitHubApi(`/repos/${owner}/${repo}/branches`, token);

  return data.map((branch: any) => ({
    name: branch.name,
    protected: branch.protected ?? false,
  }));
}
