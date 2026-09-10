import React, { useEffect, useState } from 'react';
import { fetchUserRepos, fetchRepoBranches } from '@/engine/github/repos';
import { connectVault } from '@/engine/vaultConnect';
import { useAuthStore } from '@/store/useAuthStore';
import { useSyncStore } from '@/store/useSyncStore';
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
  Cloud,
  GitCompare,
  Download,
  Database,
  Check,
} from 'lucide-react';

interface RepoSelectorProps {
  onVaultSelected: (vault: VaultConfig) => void;
}

const SYNC_STEPS = [
  { stage: 'fetching-tree', label: 'Connecting to GitHub', icon: Cloud, description: 'Fetching repository tree...' },
  { stage: 'comparing-shas', label: 'Comparing files', icon: GitCompare, description: 'Checking for changes...' },
  { stage: 'downloading-blobs', label: 'Downloading notes', icon: Download, description: 'Fetching updated content...' },
  { stage: 'building-indices', label: 'Building index', icon: Database, description: 'Indexing notes & assets...' },
] as const;

export const RepoSelector: React.FC<RepoSelectorProps> = ({ onVaultSelected }) => {
  const token = useAuthStore((state) => state.token);
  const syncStage = useSyncStore((s) => s.stage);
  const syncMessage = useSyncStore((s) => s.progressMessage);
  const completedCount = useSyncStore((s) => s.completedCount);
  const totalCount = useSyncStore((s) => s.totalCount);

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
      await connectVault(newVault, token || undefined);
      onVaultSelected(newVault);
    } catch (err: any) {
      setError(err.message || 'Failed to connect vault.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredRepos = repos.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentStepIndex = SYNC_STEPS.findIndex((s) => s.stage === syncStage);
  const isSyncing = isSubmitting && syncStage !== 'idle' && syncStage !== 'completed' && syncStage !== 'error';

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

      {/* Sync Progress Overlay */}
      {isSyncing && (
        <div className="rounded-xl bg-[#8A35F2]/[0.06] border border-[#8A35F2]/20 p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Loader2 className="h-5 w-5 animate-spin text-[#8A35F2]" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Syncing Vault</h3>
              <p className="text-xs text-white/50 mt-0.5">{syncMessage || 'Starting sync...'}</p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="space-y-2">
            {SYNC_STEPS.map((step, index) => {
              const StepIcon = step.icon;
              const isCompleted = currentStepIndex > index;
              const isCurrent = currentStepIndex === index;

              return (
                <div
                  key={step.stage}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-300 ${
                    isCurrent
                      ? 'bg-[#8A35F2]/10 border border-[#8A35F2]/30'
                      : isCompleted
                      ? 'bg-white/[0.02]'
                      : 'opacity-40'
                  }`}
                >
                  <div className={`shrink-0 ${isCurrent ? 'text-[#8A35F2]' : isCompleted ? 'text-emerald-400' : 'text-white/30'}`}>
                    {isCompleted ? (
                      <Check className="h-4 w-4" />
                    ) : isCurrent ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <StepIcon className="h-4 w-4" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className={`text-xs font-medium ${isCurrent ? 'text-white' : isCompleted ? 'text-white/70' : 'text-white/40'}`}>
                      {step.label}
                    </span>
                    {isCurrent && syncMessage && (
                      <p className="text-[11px] text-white/40 truncate mt-0.5">{syncMessage}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Download progress */}
          {syncStage === 'downloading-blobs' && totalCount > 0 && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] text-white/50">
                <span>{completedCount} of {totalCount} files</span>
                <span>{Math.round((completedCount / totalCount) * 100)}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#8A35F2] transition-all duration-300"
                  style={{ width: `${(completedCount / totalCount) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Search Input */}
      {!isSyncing && (
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
      )}

      {/* Repositories List */}
      {!isSyncing && (
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
      )}

      {/* Branch Selection & Connect Button */}
      {selectedRepo && !isSyncing && (
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
                <Loader2 className="h-4 w-4 animate-spin" /> Connecting...
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
