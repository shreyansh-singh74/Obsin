import React, { useEffect, useState } from 'react';
import { fetchUserRepos, fetchRepoBranches } from '@/engine/github/repos';
import { useAuthStore } from '@/store/useAuthStore';
import { useVaultStore } from '@/store/useVaultStore';
import type { GitHubRepo, GitHubBranch, VaultConfig } from '@/types';
import {
  FolderGit2,
  Search,
  Lock,
  Globe,
  GitBranch,
  Loader2,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';

interface RepoSelectorProps {
  onVaultSelected: (vault: VaultConfig) => void;
}

export const RepoSelector: React.FC<RepoSelectorProps> = ({ onVaultSelected }) => {
  const token = useAuthStore((state) => state.token);
  const setActiveVault = useVaultStore((state) => state.setActiveVault);

  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingRepos, setIsLoadingRepos] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);
  const [branches, setBranches] = useState<GitHubBranch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [isLoadingBranches, setIsLoadingBranches] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!token) return;

    setIsLoadingRepos(true);
    setError(null);

    fetchUserRepos(token)
      .then((data) => {
        setRepos(data);
      })
      .catch((err: any) => {
        setError(err.message || 'Failed to fetch GitHub repositories.');
      })
      .finally(() => {
        setIsLoadingRepos(false);
      });
  }, [token]);

  const handleSelectRepo = async (repo: GitHubRepo) => {
    setSelectedRepo(repo);
    setSelectedBranch(repo.default_branch);
    setIsLoadingBranches(true);

    try {
      const fetchedBranches = await fetchRepoBranches(token, repo.owner.login, repo.name);
      setBranches(fetchedBranches);
      if (fetchedBranches.length > 0 && !fetchedBranches.some((b) => b.name === repo.default_branch)) {
        setSelectedBranch(fetchedBranches[0].name);
      }
    } catch {
      // Fallback to default branch if branches fetch fails
      setBranches([{ name: repo.default_branch, protected: false }]);
    } finally {
      setIsLoadingBranches(false);
    }
  };

  const handleConnectVault = async () => {
    if (!selectedRepo) return;

    setIsSubmitting(true);
    const newVault: VaultConfig = {
      id: `vault-${selectedRepo.owner.login}-${selectedRepo.name}`,
      name: selectedRepo.name,
      owner: selectedRepo.owner.login,
      repo: selectedRepo.name,
      branch: selectedBranch || selectedRepo.default_branch,
      lastOpened: new Date().toISOString(),
    };

    try {
      await setActiveVault(newVault);
      onVaultSelected(newVault);
    } catch (err: any) {
      setError(err.message || 'Failed to set active vault.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredRepos = repos.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 border-b border-white/10 pb-4">
        <div className="p-2.5 rounded-xl bg-[#8A35F2]/20 text-[#8A35F2]">
          <FolderGit2 className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">Select Obsidian Vault Repository</h2>
          <p className="text-xs text-white/60">Choose the GitHub repository containing your notes</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 text-xs rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3 h-4 w-4 text-white/40" />
        <input
          type="text"
          placeholder="Search your repositories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg bg-black/40 border border-white/10 focus:outline-none focus:border-[#8A35F2] text-white placeholder:text-white/30"
        />
      </div>

      {/* Repositories List */}
      <div className="max-h-60 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
        {isLoadingRepos ? (
          <div className="flex flex-col items-center justify-center py-8 text-white/50 text-xs gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-[#8A35F2]" />
            Loading GitHub Repositories...
          </div>
        ) : filteredRepos.length === 0 ? (
          <div className="text-center py-8 text-white/40 text-xs">
            No repositories found.
          </div>
        ) : (
          filteredRepos.map((repo) => {
            const isSelected = selectedRepo?.id === repo.id;
            return (
              <div
                key={repo.id}
                onClick={() => handleSelectRepo(repo)}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#8A35F2]/15 border-[#8A35F2] text-white'
                    : 'bg-white/5 border-white/5 hover:bg-white/10 text-white/80'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {repo.private ? (
                    <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                  ) : (
                    <Globe className="w-4 h-4 text-blue-400 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <h4 className="text-sm font-medium truncate">{repo.name}</h4>
                    <p className="text-[11px] text-white/40 truncate">{repo.full_name}</p>
                  </div>
                </div>

                {isSelected && <CheckCircle2 className="w-4 h-4 text-[#8A35F2] shrink-0" />}
              </div>
            );
          })
        )}
      </div>

      {/* Branch Selection & Connect Button */}
      {selectedRepo && (
        <div className="pt-4 border-t border-white/10 space-y-4">
          <div>
            <label className="block text-xs font-medium text-white/70 mb-1.5 flex items-center gap-1.5">
              <GitBranch className="w-3.5 h-3.5 text-[#8A35F2]" />
              Select Target Branch
            </label>
            {isLoadingBranches ? (
              <div className="flex items-center gap-2 text-xs text-white/50 py-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Fetching branches...
              </div>
            ) : (
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="w-full py-2 px-3 text-sm rounded-lg bg-black/60 border border-white/10 focus:outline-none focus:border-[#8A35F2] text-white"
              >
                {branches.map((b) => (
                  <option key={b.name} value={b.name} className="bg-[#161616]">
                    {b.name} {b.name === selectedRepo.default_branch ? '(default)' : ''}
                  </option>
                ))}
              </select>
            )}
          </div>

          <button
            onClick={handleConnectVault}
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-[#8A35F2] hover:bg-[#7c2ee0] text-white font-medium text-sm transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Connecting Vault...
              </>
            ) : (
              <>
                Connect Vault & Open App <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
