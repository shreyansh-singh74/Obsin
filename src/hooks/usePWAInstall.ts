import { useSyncExternalStore } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

export type InstallOutcome = "accepted" | "dismissed" | "unavailable";

export interface PWAInstallState {
  /** A deferred `beforeinstallprompt` event is ready to be used. */
  canInstall: boolean;
  /** The app is already running as an installed PWA. */
  isInstalled: boolean;
  /** Browser has no programmatic install (iOS) — show manual steps instead. */
  isManualInstall: boolean;
}

function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari only exposes the installed state here.
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

/** iOS/iPadOS never fires `beforeinstallprompt`; install is share-sheet only. */
function isIOS(): boolean {
  return (
    /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

// Module-level state: `beforeinstallprompt` fires once, early, and is easy to
// miss if only a mounted component listens for it. Capturing it here (this
// module is evaluated before React renders) makes the install option available
// on every route for the rest of the session.
let deferredPrompt: BeforeInstallPromptEvent | null = null;
let isInstalled = isStandalone();
const listeners = new Set<() => void>();
let snapshot: PWAInstallState = buildSnapshot();

function buildSnapshot(): PWAInstallState {
  return {
    canInstall: deferredPrompt !== null && !isInstalled,
    isInstalled,
    isManualInstall: !isInstalled && isIOS(),
  };
}

function emitChange() {
  snapshot = buildSnapshot();
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return snapshot;
}

window.addEventListener("beforeinstallprompt", (event) => {
  // Suppress the browser's own mini-infobar so the app controls the CTA.
  event.preventDefault();
  deferredPrompt = event;
  emitChange();
});

window.addEventListener("appinstalled", () => {
  isInstalled = true;
  deferredPrompt = null;
  emitChange();
});

/** Opens the browser's install dialog. The event is single-use, so it is
 *  always consumed here — never kept around for a second click. */
export async function promptInstall(): Promise<InstallOutcome> {
  if (!deferredPrompt) return "unavailable";

  const promptEvent = deferredPrompt;
  deferredPrompt = null;
  emitChange();

  await promptEvent.prompt();
  const { outcome } = await promptEvent.userChoice;
  if (outcome === "accepted") {
    isInstalled = true;
    emitChange();
  }
  return outcome;
}

export function usePWAInstall() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return { ...state, promptInstall };
}
