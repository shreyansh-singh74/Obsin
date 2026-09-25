import { useEffect } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { LandingPage } from "./landing/LandingPage";
import { AppShell } from "./components/app/AppShell";
import { JSX } from "react/jsx-runtime";
import { useAuthStore } from "./store/useAuthStore";
import { useVaultStore } from "./store/useVaultStore";
import { AuthPage } from "./pages/AuthPage";
import { InstallPromptBanner } from "./components/pwa/InstallPromptBanner";

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const token = useAuthStore((state) => state.token);
  const vaults = useVaultStore((state) => state.vaults);
  const hasLoadedVaults = useVaultStore((state) => state.hasLoadedVaults);
  const loadVaults = useVaultStore((state) => state.loadVaults);

  useEffect(() => {
    if (!hasLoadedVaults) {
      loadVaults();
    }
  }, [hasLoadedVaults, loadVaults]);

  // While waiting to check IndexedDB for offline/stored vaults, avoid prematurely redirecting.
  if (!token && !hasLoadedVaults) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[var(--surface-page,#161616)] text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-white" />
          <span className="text-xs text-white/50">Loading local vault data...</span>
        </div>
      </div>
    );
  }

  // A user can access /app if they have a valid token OR if they have existing downloaded vaults in IndexedDB
  const hasVaults = vaults.length > 0;
  if (!token && !hasVaults) {
    return <Navigate to="/auth" replace />;
  }

  return children;
}


export function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <InstallPromptBanner />
    </>
  );
}
