import { Route,Routes,Navigate } from "react-router-dom";
import { LandingPage } from "./landing/LandingPage";
import { AppShell } from "./components/app/AppShell";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/app" element={<AppShell />} />
      <Route path="*" element={<Navigate to ="/" replace />} />      

    </Routes>
  )
}
