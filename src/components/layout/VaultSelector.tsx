import React, { useState } from 'react';
import { useVaultStore } from '@/store/useVaultStore';
import { useAuthStore } from '@/store/useAuthStore';
import { saveVault } from '@/db/repository/vaultsRepo';
import { executeVaultSync } from '@/engine/sync';
import type { VaultConfig } from '@/types';
import { Database, Plus, Check, ChevronDown, FolderGit2, Link, Key, AlertTriangle } from 'lucide-react';

export const VaultSelector: React.FC = () => {
  const { activeVault, vaults, setActiveVault, loadVaults, refreshNotes } = useVaultStore();
  const { token, setToken } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const [repoUrl, setRepoUrl] = useState('');
  const [name, setName] = useState('');
  const [owner, setOwner] = useState('');
  const [repo, setRepo] = useState('');
  const [branch, setBranch] = useState('');
  const [patToken, setPatToken] = useState(token);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Handle URL parsing helper (e.g. https://github.com/owner/repo)
  function handleUrlChange(url: string) {
    setRepoUrl(url);
    setErrorMessage('');
    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (match) {
      setOwner(match[1]);
      setRepo(match[2].replace(/\.git$/, ''));
    }
  }

  async function handleAddVault(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage('');
    const finalOwner = owner.trim();
    const finalRepo = repo.trim();
    const activeToken = patToken.trim() || token.trim();

    if (!finalOwner || !finalRepo) {
      setErrorMessage('Please enter both owner and repository name, or paste a GitHub URL.');
      return;
    }

    // Save token if user entered one in modal
    if (patToken.trim()) {
      setToken(patToken.trim());
    }

    setIsSubmitting(true);
    const vaultId = `${finalOwner}/${finalRepo}`.toLowerCase();
    const newVault: VaultConfig = {
      id: vaultId,
      owner: finalOwner,
      repo: finalRepo,
      branch: branch.trim(), // Defaults to auto-discovered branch
      name: name.trim() || `${finalOwner}/${finalRepo}`,
      lastOpened: new Date().toISOString(),
    };

    try {
      await saveVault(newVault);
      await loadVaults();
      await setActiveVault(newVault);

      // Auto-trigger sync upon creation
      await executeVaultSync(newVault, activeToken);
      await refreshNotes();

      setShowAddModal(false);
      setIsOpen(false);
      setRepoUrl('');
      setName('');
      setOwner('');
      setRepo('');
      setBranch('');
    } catch (err: any) {
      console.error('Failed to connect vault:', err);
      let msg = err.message || 'Failed to fetch vault from GitHub';
      if (msg.includes('rate limit') || msg.includes('403') || msg.includes('restricted')) {
        msg = 'GitHub API rate limit reached (60 req/hr). Please enter your GitHub Personal Access Token (PAT) below to unlock 5,000 req/hr!';
      }
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-200 transition-all cursor-pointer shadow-sm"
      >
        <FolderGit2 className="w-3.5 h-3.5 text-indigo-400" />
        <span className="truncate max-w-[140px] font-semibold">{activeVault ? activeVault.name : 'Select Vault'}</span>
        <ChevronDown className="w-3 h-3 text-slate-500" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden py-1">
          <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            Your Connected Vaults ({vaults.length})
          </div>

          <div className="max-h-56 overflow-y-auto">
            {vaults.map((v) => (
              <button
                key={v.id}
                onClick={async () => {
                  await setActiveVault(v);
                  setIsOpen(false);
                }}
                className="w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer border-b border-slate-800/40 last:border-0"
              >
                <div className="truncate pr-2">
                  <span className="font-medium block truncate text-slate-200">{v.name}</span>
                  <span className="text-[10px] text-slate-500 font-mono block truncate">{v.owner}/{v.repo}</span>
                </div>
                {activeVault?.id === v.id && <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
              </button>
            ))}
          </div>

          <div className="border-t border-slate-800 pt-1 mt-1">
            <button
              onClick={() => {
                setShowAddModal(true);
                setIsOpen(false);
              }}
              className="w-full px-3 py-2.5 text-left text-xs text-indigo-400 hover:bg-slate-800 font-medium flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add GitHub Repository Vault
            </button>
          </div>
        </div>
      )}

      {/* Add Vault Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-slate-200">
              <Database className="w-5 h-5 text-indigo-400" />
              <h3 className="font-semibold text-base">Add GitHub Markdown Vault</h3>
            </div>

            {errorMessage && (
              <div className="p-3 bg-rose-950/50 border border-rose-800 rounded-lg text-rose-200 text-xs leading-relaxed flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>{errorMessage}</div>
              </div>
            )}

            <form onSubmit={handleAddVault} className="space-y-3.5 text-xs">
              {/* GitHub URL Quick Paste */}
              <div>
                <label className="block text-slate-400 font-medium mb-1 flex items-center gap-1">
                  <Link className="w-3.5 h-3.5 text-indigo-400" /> Paste GitHub Repository URL
                </label>
                <input
                  type="url"
                  placeholder="https://github.com/owner/repository"
                  value={repoUrl}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono text-xs"
                />
              </div>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-800"></div>
                <span className="flex-shrink mx-2 text-[10px] text-slate-500 font-mono uppercase">Or Enter Manually</span>
                <div className="flex-grow border-t border-slate-800"></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">GitHub Owner</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. shreyansh-singh74"
                    value={owner}
                    onChange={(e) => setOwner(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Repository Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. gem"
                    value={repo}
                    onChange={(e) => setRepo(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Display Label</label>
                  <input
                    type="text"
                    placeholder="e.g. My Gem Brain"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 font-sans"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Branch (Optional)</label>
                  <input
                    type="text"
                    placeholder="Auto-discover"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              {/* Token Input Field */}
              <div className="pt-1">
                <label className="block text-slate-400 font-medium mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Key className="w-3.5 h-3.5 text-indigo-400" /> GitHub Token (PAT)
                  </span>
                  <span className="text-[10px] text-slate-500 font-normal">Increases rate limit to 5,000/hr</span>
                </label>
                <input
                  type="password"
                  placeholder="ghp_... (Required if rate limit is reached or repo is private)"
                  value={patToken}
                  onChange={(e) => setPatToken(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  disabled={isSubmitting}
                  className="px-3 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors shadow-lg shadow-indigo-600/20 disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? 'Fetching & Syncing...' : 'Add & Sync Vault'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
