import { Route, Routes, Navigate } from "react-router-dom";
import { LandingPage } from "./landing/LandingPage";
import { AppShell } from "./components/app/AppShell";
import { JSX } from "react/jsx-runtime";
import { useAuthStore } from "./store/useAuthStore";
import { useVaultStore } from "./store/useVaultStore";
import { AuthPage } from "./pages/AuthPage";


function ProtectedRoute({ children }: { children: JSX.Element }) {
  const token = useAuthStore((state) => state.token);
  const vaults = useVaultStore((state) => state.vaults);
  const hasNotes = useVaultStore((state) => state.notes.length > 0);

  // Online access requires a token. Offline, a returning user with
  // already-downloaded data may read without signing in again.
  const hasLocalData = vaults.length > 0 && hasNotes;
  if (!token && navigator.onLine) {
    return <Navigate to="/auth" replace />;
  }
  if (!token && !hasLocalData) {
    return <Navigate to="/auth" replace />;
  }
  return children;
}


export function App() {
  return (
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
  );
}
