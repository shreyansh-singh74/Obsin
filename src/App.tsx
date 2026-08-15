import { Route, Routes, Navigate } from "react-router-dom";
import { LandingPage } from "./landing/LandingPage";
import { AppShell } from "./components/app/AppShell";
import { JSX } from "react/jsx-runtime";
import { useAuthStore } from "./store/useAuthStore";
import { AuthPage } from "./pages/AuthPage";


function ProtectedRoute({ children }: { children: JSX.Element }) {
  const token = useAuthStore((state) => state.token);

  if (!token) {
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
