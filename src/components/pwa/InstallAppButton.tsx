import { usePWAInstall } from "@/hooks/usePWAInstall";

/** Renders nothing unless the browser fires `beforeinstallprompt`. */
export function InstallAppButton({ className = "" }: { className?: string }) {
  const { canInstall, promptInstall } = usePWAInstall();
  if (!canInstall) return null;
  return (
    <button
      type="button"
      onClick={() => void promptInstall()}
      className={`inline-flex min-h-10 items-center rounded-full border border-white/20 px-4 py-2 font-medium text-white transition-colors hover:bg-white/10 ${className}`}
    >
      Install App
    </button>
  );
}
