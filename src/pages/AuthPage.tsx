import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { fetchAuthenticationUser } from '@/engine/github/auth';
import { RepoSelector } from '@/components/sync/RepoSelector';
import {
  requestDeviceCode,
  pollForAccessToken,
  getGitHubClientId,
  DeviceCodeResponse,
} from '@/engine/github/deviceAuth';
import {
  Github,
  Key,
  LogIn,
  Loader2,
  ArrowLeft,
  LogOut,
  Copy,
  Check,
  ExternalLink,
  X,
} from 'lucide-react';
import logoMark from '@/assets/logo.svg';

export const AuthPage: React.FC = () => {
  const [tokenInput, setTokenInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Device Flow State
  const [deviceFlowData, setDeviceFlowData] = useState<DeviceCodeResponse | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [deviceFlowCountdown, setDeviceFlowCountdown] = useState(0);

  // Popup OAuth state
  const popupRef = useRef<Window | null>(null);
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

  const { user, setAuth, clearToken } = useAuthStore();
  const navigate = useNavigate();

  // Check URL query parameters for OAuth callback signal or error
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const oauthOk = searchParams.get('oauth');
    const urlError = searchParams.get('error');

    // Always clean URL immediately — never leave sensitive params in history
    window.history.replaceState({}, '', '/auth');

    if (urlError) {
      setError(decodeURIComponent(urlError));
      return;
    }

    if (oauthOk === 'ok') {
      // Retrieve the token from the one-time HttpOnly handoff cookie via server endpoint
      setIsLoading(true);
      fetch('/api/auth/token', { credentials: 'same-origin' })
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok || !data.access_token) {
            throw new Error(data.error || 'OAuth handoff failed — token not found');
          }
          return data.access_token as string;
        })
        .then(async (token) => {
          const userProfile = await fetchAuthenticationUser(token);
          setAuth(token, userProfile);
          // If this page opened as a popup, send the token back to the parent window
          if (window.opener && !window.opener.closed) {
            window.opener.postMessage({ type: 'obsin-oauth-complete', token, user: userProfile }, '*');
            window.close();
          }
        })
        .catch((err) => {
          setError(err.message || 'Failed to authenticate OAuth user');
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [setAuth]);

  // Countdown timer for device flow expiry
  useEffect(() => {
    if (!deviceFlowData) {
      setDeviceFlowCountdown(0);
      return;
    }

    const expiresAt = Date.now() + (deviceFlowData.expires_in || 900) * 1000;
    setDeviceFlowCountdown(Math.max(0, Math.floor((expiresAt - Date.now()) / 1000)));

    const timer = setInterval(() => {
      const remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
      setDeviceFlowCountdown(remaining);
      if (remaining <= 0) {
        clearInterval(timer);
        setDeviceFlowData(null);
        setError('Device code expired. Please try again.');
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [deviceFlowData]);

  // Resilient Adaptive Polling Effect for Device Flow
  useEffect(() => {
    if (!deviceFlowData) {
      if (pollTimerRef.current) {
        clearTimeout(pollTimerRef.current);
        pollTimerRef.current = null;
      }
      return;
    }

    const clientId = getGitHubClientId();
    if (!clientId) return;

    let currentIntervalSec = deviceFlowData.interval || 5;

    const poll = async () => {
      try {
        const res = await pollForAccessToken(clientId, deviceFlowData.device_code);
        console.log('GitHub Device Flow polling status:', res);

        if (res.access_token) {
          setDeviceFlowData(null);
          setIsLoading(true);

          const userProfile = await fetchAuthenticationUser(res.access_token);
          setAuth(res.access_token, userProfile);
          setIsLoading(false);
          return;
        }

        if (res.error === 'slow_down') {
          currentIntervalSec = res.interval || (currentIntervalSec + 5);
        } else if (res.error && res.error !== 'authorization_pending') {
          setDeviceFlowData(null);
          setError(res.error_description || res.error);
          return;
        }
      } catch (err: any) {
        console.warn('Device flow poll error:', err);
      }

      pollTimerRef.current = setTimeout(poll, currentIntervalSec * 1000);
    };

    pollTimerRef.current = setTimeout(poll, currentIntervalSec * 1000);

    return () => {
      if (pollTimerRef.current) {
        clearTimeout(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    };
  }, [deviceFlowData, setAuth]);

  // Listen for OAuth token from popup window (postMessage from child)
  useEffect(() => {
    function handleOAuthMessage(event: MessageEvent) {
      if (event.data?.type === 'obsin-oauth-complete' && event.data.token) {
        const { token: receivedToken, user: receivedUser } = event.data;
        setAuth(receivedToken, receivedUser);
        // Close the popup if still open
        if (popupRef.current && !popupRef.current.closed) {
          popupRef.current.close();
        }
      }
    }
    window.addEventListener('message', handleOAuthMessage);
    return () => window.removeEventListener('message', handleOAuthMessage);
  }, [setAuth]);

  // Cleanup popup reference on unmount
  useEffect(() => {
    return () => {
      if (popupRef.current && !popupRef.current.closed) {
        popupRef.current.close();
      }
    };
  }, []);

  // Initiate GitHub Device Authorization Grant Flow (100% Client-Side OAuth)
  const handleGitHubDeviceOAuth = async () => {
    const clientId = getGitHubClientId();

    if (!clientId) {
      setIsOAuthLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/auth/login');
        const contentType = res.headers.get('content-type');
        if (res.ok && contentType && contentType.includes('application/json')) {
          const data = await res.json();
          if (data.authorizeUrl) {
            // Open in popup instead of redirecting the whole page
            const popup = window.open(
              data.authorizeUrl,
              'github-oauth',
              'width=600,height=700,scrollbars=yes,resizable=yes'
            );
            popupRef.current = popup;

            // Token arrives via postMessage from the popup — no polling needed

            return;
          }
        }
        throw new Error('OAuth Client ID is missing. Please add GITHUB_CLIENT_ID to your .env file.');
      } catch (err: any) {
        setError(err.message || 'Could not initiate GitHub OAuth');
      } finally {
        setIsOAuthLoading(false);
      }
      return;
    }

    setIsOAuthLoading(true);
    setError(null);

    try {
      const deviceData = await requestDeviceCode(clientId);
      setDeviceFlowData(deviceData);
    } catch (err: any) {
      setError(err.message || 'Failed to initiate GitHub Device Flow');
    } finally {
      setIsOAuthLoading(false);
    }
  };

  const handleCopyUserCode = () => {
    if (deviceFlowData?.user_code) {
      navigator.clipboard.writeText(deviceFlowData.user_code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const cancelDeviceFlow = () => {
    setDeviceFlowData(null);
  };

  const handlePatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const userProfile = await fetchAuthenticationUser(tokenInput.trim());
      setAuth(tokenInput.trim(), userProfile);
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate. Check your token.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCountdown = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(124,58,237,0.08)_0%,_transparent_60%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(124,58,237,0.04)_0%,_transparent_50%)] pointer-events-none" />
      {/* Top Header Link */}
      <a href="/" className="absolute top-6 left-6 flex items-center gap-2 text-sm text-white/60 hover:text-white">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </a>

      <div className="w-full max-w-lg bg-[#161616]/90 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-8 shadow-[0_0_80px_rgba(124,58,237,0.06)] relative z-10">
        {/* Brand */}
        <div className="flex flex-col items-center text-center mb-7">
          <img src={logoMark} alt="Obsin" className="h-14 w-14 mb-3 opacity-90" />
          <h1 className="text-xl font-bold tracking-tight">Connect to Obsin</h1>
          <p className="text-sm text-white/50 mt-1.5 leading-relaxed">
            {user ? 'Select your Obsidian vault repository' : 'Sign in with GitHub to access your Obsidian vaults'}
          </p>
        </div>

        {/* Authenticated Flow: Repo Selector */}
        {user ? (
          <div className="space-y-6">
            {/* Connected Profile Bar */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <div className="flex items-center gap-3">
                <img src={user.avatar_url} alt={user.login} className="w-9 h-9 rounded-full" />
                <div>
                  <h3 className="text-sm font-medium text-white">{user.name || user.login}</h3>
                  <p className="text-[11px] text-white/50">@{user.login}</p>
                </div>
              </div>
              <button
                onClick={clearToken}
                className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-md bg-white/[0.04] hover:bg-red-500/15 hover:text-red-300 text-white/50 transition-all duration-200 cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            </div>

            {/* Repository Selector */}
            <RepoSelector onVaultSelected={() => navigate('/app')} />
          </div>
        ) : (
          /* Unauthenticated Flow: OAuth & PAT */
          <div className="space-y-6">
            {error && (
              <div className="p-3 text-xs rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
                {error}
              </div>
            )}

            {/* Device Flow Verification Overlay */}
            {deviceFlowData ? (
              <div className="p-6 rounded-xl bg-[#8A35F2]/[0.06] border border-[#8A35F2]/20 space-y-5 text-center relative">
                <button
                  onClick={cancelDeviceFlow}
                  className="absolute top-3 right-3 text-white/50 hover:text-white cursor-pointer"
                  title="Cancel"
                >
                  <X className="w-4 h-4" />
                </button>

                <div>
                  <h3 className="text-sm font-semibold text-white">Authorize Obsin on GitHub</h3>
                  <p className="text-xs text-white/60 mt-1">
                    Copy the verification code below and enter it on GitHub:
                  </p>
                </div>

                {/* User Code Box */}
                <div className="flex items-center justify-center gap-3 py-3 px-4 bg-black/60 rounded-xl border border-white/10 font-mono text-2xl tracking-widest text-[#8A35F2] font-bold">
                  <span>{deviceFlowData.user_code}</span>
                  <button
                    onClick={handleCopyUserCode}
                    className="p-1.5 rounded-md hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
                    title="Copy Code"
                  >
                    {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                {/* Countdown Timer */}
                <div className="flex items-center justify-center gap-2 text-xs">
                  <span className="text-white/50">Expires in</span>
                  <span className={`font-mono font-bold ${deviceFlowCountdown < 60 ? 'text-red-400' : 'text-[#8A35F2]'}`}>
                    {formatCountdown(deviceFlowCountdown)}
                  </span>
                </div>

                <a
                  href={deviceFlowData.verification_uri}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => {
                    e.preventDefault();
                    window.open(
                      deviceFlowData.verification_uri,
                      'github-device-auth',
                      'width=600,height=700,scrollbars=yes,resizable=yes'
                    );
                  }}
                  className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-[#8A35F2] hover:bg-[#7c2ee0] text-white font-medium text-sm transition-all duration-200 cursor-pointer shadow-[0_2px_12px_rgba(138,53,242,0.25)] hover:shadow-[0_4px_20px_rgba(138,53,242,0.35)]"
                >
                  Open GitHub Verification <ExternalLink className="w-4 h-4" />
                </a>

                <div className="flex items-center justify-center gap-2 text-xs text-white/50 pt-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#8A35F2]" />
                  <span>Waiting for authorization on GitHub...</span>
                </div>
              </div>
            ) : (
              <>
                {/* Primary GitHub OAuth Button */}
                <button
                  onClick={handleGitHubDeviceOAuth}
                  disabled={isOAuthLoading || isLoading}
                  className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white hover:bg-white/90 text-black font-semibold text-sm transition-all duration-200 cursor-pointer shadow-[0_2px_16px_rgba(255,255,255,0.08)] hover:shadow-[0_4px_24px_rgba(255,255,255,0.12)] disabled:opacity-50"
                >
                  {isOAuthLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin text-black" /> Connecting to GitHub...
                    </>
                  ) : (
                    <>
                      <Github className="h-5 w-5" /> Sign in with GitHub
                    </>
                  )}
                </button>

                {/* Divider */}
                <div className="relative flex items-center justify-center py-1">
                  <div className="w-full border-t border-white/[0.06]" />
                  <span className="absolute bg-[#161616] px-3 text-[11px] text-white/30 font-medium uppercase tracking-widest">
                    or token
                  </span>
                </div>

                {/* Secondary PAT Form */}
                <form onSubmit={handlePatSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-white/70 mb-2">
                      Personal Access Token (PAT)
                    </label>
                    <div className="relative">
                      <Key className="absolute left-3.5 top-3 h-4 w-4 text-white/40" />
                      <input
                        type="password"
                        placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                        value={tokenInput}
                        onChange={(e) => setTokenInput(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg bg-black/40 border border-white/[0.08] focus:outline-none focus:border-[#8A35F2]/60 focus:ring-1 focus:ring-[#8A35F2]/20 text-white font-mono placeholder:text-white/20 transition-colors duration-200"
                      />
                    </div>
                    <p className="text-[11px] text-white/40 mt-1.5">
                      Requires <code className="font-mono text-white/60">repo</code> & <code className="font-mono text-white/60">read:user</code> permissions.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || isOAuthLoading || !tokenInput.trim()}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#8A35F2] hover:bg-[#7c2ee0] text-white font-medium text-sm transition-all duration-200 disabled:opacity-40 cursor-pointer shadow-[0_2px_12px_rgba(138,53,242,0.2)] hover:shadow-[0_4px_20px_rgba(138,53,242,0.3)]"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Validating Token...
                      </>
                    ) : (
                      <>
                        <LogIn className="h-4 w-4" /> Connect with Token
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
