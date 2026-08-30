import React, { useState } from 'react';
import { useVaultStore } from '@/store/useVaultStore';
import { useAuthStore } from '@/store/useAuthStore';
import { saveVault } from '@/db/repository/vaultsRepo';
import { executeVaultSync } from '@/engine/sync';
import type { VaultConfig } from '@/types';
import { useSidebar } from '@/components/ui/sidebar';
import { Database, Plus, Check, ChevronDown, FolderGit2, Link, Key, AlertTriangle } from 'lucide-react';

export const VaultSelector: React.FC = () => {
  const { activeVault, vaults, setActiveVault, loadVaults, refreshNotes } = useVaultStore();
  const { token, setToken } = useAuthStore();
  const { open: isSidebarOpen } = useSidebar();
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

    if (patToken.trim()) {
      setToken(patToken.trim());
    }

    setIsSubmitting(true);
    const vaultId = `${finalOwner}/${finalRepo}`.toLowerCase();
    const newVault: VaultConfig = {
      id: vaultId,
      owner: finalOwner,
      repo: finalRepo,
      branch: branch.trim(),
      name: name.trim() || `${finalOwner}/${finalRepo}`,
      lastOpened: new Date().toISOString(),
    };

    try {
      await saveVault(newVault);
      await loadVaults();
      await setActiveVault(newVault);

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
    <div className="relative w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        title={activeVault ? `Active Vault: ${activeVault.name}` : 'Select GitHub Vault'}
        className={`w-full flex items-center gap-2 px-2.5 py-2.5 md:py-1.5 rounded-[var(--radius-md)] bg-[var(--surface-card)] hover:bg-[var(--surface-hover)] border border-[var(--border-default)] text-xs font-medium text-[var(--text-primary)] transition-all duration-[var(--duration-fast)] cursor-pointer min-h-[44px] md:min-h-0 ${
          !isSidebarOpen ? 'justify-center px-0' : 'justify-between'
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          <FolderGit2 className="w-4 h-4 text-[var(--accent-text)] shrink-0" />
          {isSidebarOpen && (
            <span className="truncate font-semibold text-xs">{activeVault ? activeVault.name : 'Select Vault'}</span>
          )}
        </div>
        {isSidebarOpen && <ChevronDown className="w-3 h-3 text-[var(--icon-muted)] shrink-0" />}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1.5 w-64 bg-[var(--surface-popover)] border border-[var(--border-default)] rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] z-[var(--z-dropdown)] overflow-hidden py-1 animate-pop-in">
          <div className="px-3 py-2 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border-subtle)]/50">
            Vaults · {vaults.length}
          </div>

          <div className="max-h-56 overflow-y-auto">
            {vaults.map((v) => (
              <button
                key={v.id}
                onClick={async () => {
                  await setActiveVault(v);
                  setIsOpen(false);
                }}
                className="w-full px-3 py-3 md:py-2.5 text-left text-xs flex items-center justify-between hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all duration-[var(--duration-fast)] cursor-pointer min-h-[44px] md:min-h-0"
              >
                <div className="truncate pr-2">
                  <span className="font-medium block truncate text-[var(--text-primary)]">{v.name}</span>
                  <span className="text-[10px] text-[var(--text-muted)] font-mono block truncate">{v.owner}/{v.repo}</span>
                </div>
                {activeVault?.id === v.id && <Check className="w-3.5 h-3.5 text-[var(--accent-text)] shrink-0" />}
              </button>
            ))}
          </div>

          <div className="border-t border-[var(--border-subtle)] pt-1 mt-1">
            <button
              onClick={() => {
                setShowAddModal(true);
                setIsOpen(false);
              }}
              className="w-full px-3 py-3 md:py-2.5 text-left text-xs text-[var(--accent-text)] hover:bg-[var(--accent-soft)] font-medium flex items-center gap-2 transition-all duration-[var(--duration-fast)] cursor-pointer min-h-[44px] md:min-h-0"
            >
              <Plus className="w-3.5 h-3.5" /> Add GitHub Repository
            </button>
          </div>
        </div>
      )}

      {/* Add Vault Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[var(--z-modal)] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[var(--surface-modal)] border border-[var(--border-default)] rounded-[var(--radius-lg)] max-w-md w-full p-6 shadow-[var(--shadow-lg)] space-y-4">
            <div className="flex items-center gap-2 text-[var(--text-primary)]">
              <Database className="w-5 h-5 text-[var(--accent-text)]" />
              <h3 className="font-semibold text-base">Add GitHub Markdown Vault</h3>
            </div>

            {errorMessage && (
              <div className="p-3 bg-[var(--danger-bg)] border border-[var(--danger-text)]/30 rounded-[var(--radius-md)] text-[var(--danger-text)] text-xs leading-relaxed flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-[var(--danger-text)] shrink-0 mt-0.5" />
                <div>{errorMessage}</div>
              </div>
            )}

            <form onSubmit={handleAddVault} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[var(--text-muted)] font-medium mb-1 flex items-center gap-1">
                  <Link className="w-3.5 h-3.5 text-[var(--accent-text)]" /> Paste GitHub Repository URL
                </label>
                <input
                  type="url"
                  placeholder="https://github.com/owner/repository"
                  value={repoUrl}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  className="w-full bg-[var(--surface-input)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] px-3 py-3 md:py-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--focus-ring)] font-mono text-xs min-h-[44px] md:min-h-0"
                />
              </div>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-[var(--border-subtle)]"></div>
                <span className="flex-shrink mx-2 text-[10px] text-[var(--text-subtle)] font-mono uppercase">Or Enter Manually</span>
                <div className="flex-grow border-t border-[var(--border-subtle)]"></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[var(--text-muted)] font-medium mb-1">GitHub Owner</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. shreyansh-singh74"
                    value={owner}
                    onChange={(e) => setOwner(e.target.value)}
                    className="w-full bg-[var(--surface-input)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] px-3 py-3 md:py-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--focus-ring)] font-mono min-h-[44px] md:min-h-0"
                  />
                </div>
                <div>
                  <label className="block text-[var(--text-muted)] font-medium mb-1">Repository Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. gem"
                    value={repo}
                    onChange={(e) => setRepo(e.target.value)}
                    className="w-full bg-[var(--surface-input)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] px-3 py-3 md:py-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--focus-ring)] font-mono min-h-[44px] md:min-h-0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[var(--text-muted)] font-medium mb-1">Display Label</label>
                  <input
                    type="text"
                    placeholder="e.g. My Gem Brain"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[var(--surface-input)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] px-3 py-3 md:py-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--focus-ring)] font-sans min-h-[44px] md:min-h-0"
                  />
                </div>
                <div>
                  <label className="block text-[var(--text-muted)] font-medium mb-1">Branch (Optional)</label>
                  <input
                    type="text"
                    placeholder="Auto-discover"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-full bg-[var(--surface-input)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] px-3 py-3 md:py-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--focus-ring)] font-mono min-h-[44px] md:min-h-0"
                  />
                </div>
              </div>

              <div className="pt-1">
                <label className="block text-[var(--text-muted)] font-medium mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Key className="w-3.5 h-3.5 text-[var(--accent-text)]" /> GitHub Token (PAT)
                  </span>
                  <span className="text-[10px] text-[var(--text-subtle)] font-normal">Increases rate limit to 5,000/hr</span>
                </label>
                <input
                  type="password"
                  placeholder="ghp_... (Required if rate limit is reached or repo is private)"
                  value={patToken}
                  onChange={(e) => setPatToken(e.target.value)}
                  className="w-full bg-[var(--surface-input)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] px-3 py-3 md:py-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--focus-ring)] font-mono text-xs min-h-[44px] md:min-h-0"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  disabled={isSubmitting}
                  className="px-4 py-3 md:py-2 rounded-[var(--radius-md)] bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer min-h-[44px] md:min-h-0"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-3 md:py-2 rounded-[var(--radius-md)] bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--text-on-accent)] font-medium transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer min-h-[44px] md:min-h-0"
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
