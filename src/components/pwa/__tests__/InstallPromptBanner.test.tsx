import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

interface FakeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function stubMatchMedia(standalone: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: standalone && query.includes("standalone"),
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
}

function dispatchInstallPrompt(outcome: "accepted" | "dismissed") {
  const prompt = vi.fn().mockResolvedValue(undefined);
  const event = new Event("beforeinstallprompt", { cancelable: true }) as FakeInstallPromptEvent;
  Object.assign(event, { prompt, userChoice: Promise.resolve({ outcome }) });
  act(() => {
    window.dispatchEvent(event);
  });
  return prompt;
}

/** The install hook holds module-level state, so each test re-imports it. */
async function renderBanner() {
  vi.resetModules();
  const { InstallPromptBanner } = await import("../InstallPromptBanner");
  render(<InstallPromptBanner />);
  return { InstallPromptBanner };
}

beforeEach(() => {
  vi.resetModules();
  localStorage.clear();
  stubMatchMedia(false);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("InstallPromptBanner", () => {
  it("offers Install now once the browser reports the app is installable", async () => {
    await renderBanner();

    expect(screen.queryByRole("button", { name: "Install now" })).not.toBeInTheDocument();

    dispatchInstallPrompt("accepted");

    expect(await screen.findByRole("button", { name: "Install now" })).toBeInTheDocument();
  });

  it("triggers the native install dialog and hides after acceptance", async () => {
    await renderBanner();
    const nativePrompt = dispatchInstallPrompt("accepted");

    const installButton = await screen.findByRole("button", { name: "Install now" });
    await userEvent.click(installButton);

    expect(nativePrompt).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("button", { name: "Install now" })).not.toBeInTheDocument();
  });

  it("stays hidden when the app already runs as an installed PWA", async () => {
    stubMatchMedia(true);
    await renderBanner();

    dispatchInstallPrompt("accepted");

    expect(screen.queryByLabelText("Install Obsin")).not.toBeInTheDocument();
  });

  it("stays dismissed once the user closes it", async () => {
    await renderBanner();
    dispatchInstallPrompt("accepted");

    await userEvent.click(await screen.findByLabelText("Dismiss install prompt"));
    expect(screen.queryByLabelText("Install Obsin")).not.toBeInTheDocument();

    await renderBanner();
    dispatchInstallPrompt("accepted");

    expect(screen.queryByLabelText("Install Obsin")).not.toBeInTheDocument();
  });
});
