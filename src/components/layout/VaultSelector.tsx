import React, { useState } from 'react';
import { useVaultStore } from '@/store/useVaultStore';
import { saveVault } from '@/db/repository/vaultsRepo';
import type { VaultConfig } from '@/types';
import { Database, Plus, Check, ChevronDown, FolderGit2 } from 'lucide-react';

export const VaultSelector: React.FC = () => {
  const { activeVault, vaults, setActiveVault, loadVaults } = useVaultStore();
  const [isOpen, setIsOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const [name, setName] = useState('');
  const [owner, setOwner] = useState('');
  const [repo, setRepo] = useState('');
  const [branch, setBranch] = useState('main');

  async function handleAddVault(e: React.FormEvent) {
    e.preventDefault();
    if (!owner || !repo) return;

    const vaultId = `${owner}/${repo}`.toLowerCase();
    const newVault: VaultConfig = {
      id: vaultId,
      owner,
      repo,
      branch: branch || 'main',
      name: name || `${owner}/${repo}`,
      lastOpened: new Date().toISOString(),
    };

    await saveVault(newVault);
    await loadVaults();
    await setActiveVault(newVault);

    setShowAddModal(false);
    setIsOpen(false);
    setName('');
    setOwner('');
    setRepo('');
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-200 transition-all cursor-pointer"
      >
        <FolderGit2 className="w-3.5 h-3.5 text-indigo-400" />
        <span className="truncate max-w-[140px]">{activeVault ? activeVault.name : 'Select Vault'}</span>
        <ChevronDown className="w-3 h-3 text-slate-500" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden py-1">
          <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            Your Vaults ({vaults.length})
          </div>

          <div className="max-h-48 overflow-y-auto">
            {vaults.map((v) => (
              <button
                key={v.id}
                onClick={async () => {
                  await setActiveVault(v);
                  setIsOpen(false);
                }}
                className="w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <div className="truncate pr-2">
                  <span className="font-medium block truncate">{v.name}</span>
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
              className="w-full px-3 py-2 text-left text-xs text-indigo-400 hover:bg-slate-800 font-medium flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add New Vault
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
              <h3 className="font-semibold text-base">Add GitHub Vault</h3>
            </div>

            <form onSubmit={handleAddVault} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Vault Display Name</label>
                <input
                  type="text"
                  placeholder="e.g. Work Notes"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">GitHub Owner</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. username"
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
                    placeholder="e.g. obsidian-notes"
                    value={repo}
                    onChange={(e) => setRepo(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Branch</label>
                <input
                  type="text"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/20"
                >
                  Add & Connect Vault
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
