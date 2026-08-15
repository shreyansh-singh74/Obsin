import { fetchAuthenticationUser } from "@/engine/github/auth";
import { useAuthStore } from "@/store/useAuthStore";
import { Github, Key, Loader2, LogIn, X } from "lucide-react";
import React, { useState } from "react";

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
    const [tokenInput, setTokenInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const setAuth = useAuthStore((state) => state.setAuth);

    if (!isOpen) return null;

    const handlePatSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tokenInput.trim()) return;

        setIsLoading(true);
        setError(null);

        try {
            const user = await fetchAuthenticationUser(tokenInput.trim());
            setAuth(tokenInput.trim(), user);
            onClose();
        }
        catch (err: any) {
            setError(err.message || `Failed to authenticate. Check your toekn.`);
        }
        finally {
            setIsLoading(false);
        }
    }


    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-md rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-page)] p-6 shadow-2xl">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                    <X className="h-5 w-5" />
                </button>
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 rounded-lg bg-[var(--accent-subtle)] text-[var(--accent-text)]">
                        <Github className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Connect to GitHub</h2>
                        <p className="text-xs text-[var(--text-muted)]">Access and sync your Obsidian vaults</p>
                    </div>
                </div>
                {error && (
                    <div className="mb-4 p-3 text-xs rounded-md bg-red-500/10 border border-red-500/20 text-red-400">
                        {error}
                    </div>
                )}
                <form onSubmit={handlePatSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
                            Personal Access Token (PAT)
                        </label>
                        <div className="relative">
                            <Key className="absolute left-3 top-2.5 h-4 w-4 text-[var(--text-subtle)]" />
                            <input
                                type="password"
                                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                                value={tokenInput}
                                onChange={(e) => setTokenInput(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 text-sm rounded-md bg-[var(--surface-input)] border border-[var(--border-subtle)] focus:outline-none focus:border-[var(--accent-text)] text-[var(--text-primary)] font-mono"
                            />
                        </div>
                        <p className="text-[11px] text-[var(--text-subtle)] mt-1">
                            Requires <code className="font-mono">repo</code> & <code className="font-mono">read:user</code> scopes.
                        </p>
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading || !tokenInput.trim()}
                        className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-md bg-[var(--accent-solid)] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" /> Validating Token...
                            </>
                        ) : (
                            <>
                                <LogIn className="h-4 w-4" /> Connect Account
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}