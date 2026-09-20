import { useState } from "react";
import { Download, Share, X } from "lucide-react";
import { usePWAInstall } from "@/hooks/usePWAInstall";

const DISMISS_KEY = "obsin_install_prompt_dismissed";

/**
 * Install affordance shown on open whenever the app is installable. Chromium
 * browsers get a real "Install now" button backed by `beforeinstallprompt`;
 * iOS gets share-sheet instructions since it has no programmatic install.
 */
export function InstallPromptBanner() {
  const { canInstall, isInstalled, isManualInstall, promptInstall } = usePWAInstall();
  const [isDismissed, setIsDismissed] = useState(
    () => localStorage.getItem(DISMISS_KEY) === "1",
  );

  if (isInstalled || isDismissed || (!canInstall && !isManualInstall)) return null;

  function handleDismiss() {
    localStorage.setItem(DISMISS_KEY, "1");
    setIsDismissed(true);
  }

  return (
    <aside
      aria-label="Install Obsin"
      className="pointer-events-none fixed inset-x-0 bottom-4 z-[var(--z-popover)] flex justify-center px-4"
    >
      <div className="pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3 shadow-[var(--shadow-lg)]">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent-soft)] text-[var(--accent-text)]">
          <Download className="size-4" />
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-medium text-[var(--text-primary)]">Install Obsin</p>
          <p className="text-[11px] leading-snug text-[var(--text-muted)]">
            {isManualInstall ? (
              <>
                Tap <Share className="inline size-3 -mt-0.5" /> Share, then Add to Home Screen.
              </>
            ) : (
              "Read your vault offline, right from your home screen."
            )}
          </p>
        </div>

        {canInstall && (
          <button
            type="button"
            onClick={() => void promptInstall()}
            className="shrink-0 rounded-[var(--radius-md)] bg-[var(--accent)] px-3 py-2 text-xs font-medium text-[var(--text-on-accent)] transition-colors duration-[var(--duration-fast)] hover:bg-[var(--accent-hover)] cursor-pointer"
          >
            Install now
          </button>
        )}

        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss install prompt"
          className="shrink-0 rounded-[var(--radius-sm)] p-1 text-[var(--text-subtle)] transition-colors duration-[var(--duration-fast)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] cursor-pointer"
        >
          <X className="size-3.5" />
        </button>
      </div>
    </aside>
  );
}
