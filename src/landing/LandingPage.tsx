import React, { lazy, Suspense, useEffect, useRef, useState } from "react";
import {
  IconCloudOff,
  IconFolderOpen,
  IconBrandGithub,
  IconSparkles,
  IconPlayerPlay,
  IconHistory,
  IconBrandX,
  IconBug,
  IconShieldLock,
  IconFileText,
  IconLicense,
  IconSearch,
  IconGitBranch,
  IconNotes,
} from "@tabler/icons-react";
import { Safari } from "@/components/ui/safari";
import { Highlighter } from "@/components/ui/highlighter";
import logoMark from "@/assets/logo.svg";

const MiniPlayer = lazy(() =>
  import("@/components/ui/video-player").then((m) => ({ default: m.MiniPlayer }))
);

export function LandingPage() {
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    function onScroll() {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        const maxScroll = window.innerHeight * 0.9;
        const value = Math.min(scrollY / maxScroll, 1);
        setProgress(value);
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const scale = 1 - progress * 0.18;
  const translateY = -progress * 24;
  const opacity = Math.max(0, 1 - progress * 1.25);

  return (
    <main className="bg-[#1e1e1e4d]">
      <section className="relative h-[135vh] bg-black">
        <div className="sticky top-0 z-20 h-screen overflow-visible bg-[#1B1B1B] p-2">
          <div
            className="relative h-full w-full overflow-hidden bg-[#0b0b0b] transition-transform duration-75 ease-out"
            style={{
              transform: `translateY(${translateY}px) scale(${scale})`,
              opacity,
              transformOrigin: "top center",
              backfaceVisibility: "hidden",
              pointerEvents: opacity === 0 ? "none" : "auto",
              willChange: "transform, opacity",
            }}
          >
            <div
              className="pointer-events-none fixed inset-0 opacity-[0.08]"
              style={{
                backgroundImage:
                  "radial-gradient(circle, rgba(255,255,255,.5) 0.6px, transparent 0.7px)",
                backgroundSize: "4px 4px",
              }}
            />
            <div className="relative z-10 mx-auto h-full max-w-6xl px-4 py-4 sm:px-6 sm:py-5 md:px-8 md:py-6">
              <header className="pointer-events-auto absolute left-4 right-4 top-4 z-30 flex items-center justify-between px-1 sm:left-6 sm:right-6 md:left-8 md:right-8">
                <a href="/" className="flex items-center gap-3 text-white">
                  <img
                    src={logoMark}
                    alt="Obsin"
                    className="h-24 w-24 shrink-0 sm:h-28 sm:w-28 md:h-32 md:w-32 -mt-8"
                  />
                </a>

                <nav className="flex items-center gap-2 text-[0.95rem] text-white/72">
                  <a
                    href="/auth"
                    className="inline-flex min-h-10 items-center rounded-full bg-white px-4 py-2 font-medium text-black transition-colors hover:bg-white/90 -mt-10"
                  >
                    Connect Vault
                  </a>
                </nav>
              </header>

              <div className="grid h-full grid-rows-[auto_minmax(0,1fr)] gap-6 pt-16 lg:gap-8 lg:pt-18">
                <div className="max-w-4xl pt-2 md:pt-6">
                  <h1 className="max-w-full text-[clamp(1.5rem,5vw,4.5rem)] font-semibold leading-[1.02] tracking-tight text-[#E5E7EB]">
                    Your knowledge. Everywhere.
                  </h1>
                  <p className="mt-5 max-w-[17em] text-[clamp(1.35rem,3.25vw,2.25rem)] leading-tight text-[#9CA3AF]">
                    Read, search, and access your Obsidian vault from any browser.
                  </p>
                  <a
                    href="/auth"
                    className="mt-7 inline-flex min-h-12 w-full items-center justify-center rounded-[7px] bg-[#8A35F2] px-6 py-4 text-center text-lg font-medium leading-tight text-white transition-colors hover:bg-[#7c2ee0] focus:outline-none focus:ring-2 focus:ring-[#9b55ff] focus:ring-offset-2 focus:ring-offset-[#0b0b0b] sm:mt-8 sm:w-auto sm:max-w-none sm:px-8 sm:text-xl"
                  >
                    Get Started
                  </a>
                </div>

                <div className="relative flex min-h-0 items-end justify-start overflow-hidden pb-1 @container-size md:pb-3">
                  <div
                    className="relative flex select-text"
                    style={{ width: "min(100%, calc(100cqh * 1203 / 753), 960px)" }}
                  >
                    <div className="relative w-full">
                      <Safari
                        url="obsin.local/vault/daily-notes"
                        mode="default"
                        className="drop-shadow-[0_22px_45px_rgba(0,0,0,0.01)]"
                      >
                        <ObsidianPreview />
                      </Safari>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-30 min-h-screen bg-[#1B1B1B] px-6 text-white">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-4xl font-semibold leading-tight">
            Built for <Highlighter action="highlight" color="#8353a2">Obsidian</Highlighter> &{" "}
            <Highlighter action="highlight" color="black">.md</Highlighter> Files
          </h2>
          <p className="mt-4 max-w-xl text-white/70">
            Your Obsidian.  Now in every browser.
          </p>

          {/* Video on higher z-index so it overlaps the gradient */}
          <div className="relative z-10 mt-10 mb-24 overflow-hidden rounded-[28px] border border-white/10 bg-black shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
            <Suspense fallback={<div className="aspect-video w-full bg-[#111] animate-pulse" />}>
              <MiniPlayer
                className="w-full"
                src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
                poster="https://picsum.photos/seed/flower/1280/720"
              />
            </Suspense>
          </div>
          {/* Gradient fade between video and features */}
          <div className="relative z-0 -mt-48 h-48 bg-gradient-to-b from-transparent via-[#1B1B1B] to-[#111] pointer-events-none" />
        </div>
        <CoreFeatures />
      </section>



      {/* CTA Section */}
      <section className="relative z-30 bg-[#1B1B1B] px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Start reading your vault today.
          </h2>
          <p className="mt-4 text-lg text-[#888] max-w-xl mx-auto">
            Connect your GitHub repo and access your Obsidian notes from any browser. Free and open source.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/auth"
              className="inline-flex h-11 items-center justify-center rounded-lg bg-[#8A35F2] px-6 text-sm font-medium text-white transition-colors hover:bg-[#7c2ee0] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#A78BFA]"
            >
              Get Started It's Free
            </a>
            <a
              href="https://github.com/shreyansh-singh74/Obsin"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-[#333] bg-transparent px-6 text-sm font-medium text-[#ccc] transition-colors hover:bg-[#1a1a1a] hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#555]"
            >
              <IconBrandGithub className="h-4 w-4" />
              View on GitHub
            </a>
          </div>
          <p className="mt-6 text-sm text-[#555]">
            No account required. Your notes stay in your repo.
          </p>
        </div>
      </section>

      <footer className="relative z-30 border-t border-white/5 bg-[#111]">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:px-8 lg:px-10">
          {/* Top: Logo + tagline */}
          <div className="flex flex-col items-center text-center mb-12">
            <img src={logoMark} alt="Obsin" className="h-20 w-20 mb-4 opacity-80" />
            <p className="text-sm text-white/40 max-w-xs">
              Your Obsidian vault, accessible from any browser. Open source.
            </p>
          </div>

          {/* Middle: Link columns */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 mb-12">
            {/* Product */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-white/30">Product</h4>
              <div className="space-y-2">
                <a href="#features" className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors">
                  <IconSparkles className="h-3.5 w-3.5" />
                  Features
                </a>
                <a href="/auth" className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors">
                  <IconPlayerPlay className="h-3.5 w-3.5" />
                  Get Started
                </a>
                <a href="#" className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors">
                  <IconHistory className="h-3.5 w-3.5" />
                  Changelog
                </a>
              </div>
            </div>

            {/* Community */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-white/30">Community</h4>
              <div className="space-y-2">
                <a href="https://github.com/shreyansh-singh74/Obsin" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors">
                  <IconBrandGithub className="h-3.5 w-3.5" />
                  GitHub
                </a>
                <a href="https://x.com/ShreyanshWorks" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors">
                  <IconBrandX className="h-3.5 w-3.5" />
                  Twitter / X
                </a>
                <a href="https://github.com/shreyansh-singh74/Obsin/issues" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors">
                  <IconBug className="h-3.5 w-3.5" />
                  Report a Bug
                </a>
              </div>
            </div>

            {/* Legal */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-white/30">Legal</h4>
              <div className="space-y-2">
                <a href="#" className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors">
                  <IconShieldLock className="h-3.5 w-3.5" />
                  Privacy Policy
                </a>
                <a href="#" className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors">
                  <IconFileText className="h-3.5 w-3.5" />
                  Terms of Service
                </a>
                <a href="#" className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors">
                  <IconLicense className="h-3.5 w-3.5" />
                  License (MIT)
                </a>
              </div>
            </div>
          </div>

          {/* Bottom: Copyright + divider */}
          <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-white/30">© 2026 Obsin. Built with care.</p>
            <p className="text-xs text-white/20 font-mono">v0.1.0</p>
          </div>
        </div>
      </footer>
    </main>
  );
}


// --- Feature type and preview components ---

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  preview?: React.ReactNode;
  className?: string;
}

function OfflinePreview() {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-[#333] bg-[#1a1a1a] px-4 py-3 mt-4">
      <span className="inline-block h-2.5 w-2.5 rounded-full bg-green-400 shrink-0" />
      <div className="text-sm">
        <span className="text-green-400 font-medium">Cached locally</span>
        <span className="text-[#666] ml-2">· Last sync: Just now</span>
      </div>
    </div>
  );
}

function SearchPreview() {
  return (
    <div className="mt-4 rounded-xl border border-[#333] bg-[#111] p-3 space-y-0.5">
      <div className="flex items-center gap-2 text-xs text-[#666] px-2 pb-2 border-b border-[#2a2a2a]">
        <IconSearch className="h-3.5 w-3.5" />
        <span>Search notes...</span>
      </div>
      {["Daily Notes", "Ideas", "Projects", "Reading List"].map((n) => (
        <div key={n} className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm hover:bg-[#222] transition-colors cursor-pointer group">
          <span className="text-[#ccc]">{n}</span>
          <svg className="h-3.5 w-3.5 text-[#555] group-hover:text-[#8A35F2] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </div>
      ))}
    </div>
  );
}

function SyncPreview() {
  const icons = [
    { label: "GitHub", icon: <IconBrandGithub className="h-5 w-5 text-[#ccc]" /> },
    { label: "Vault", icon: <IconFolderOpen className="h-5 w-5 text-[#A78BFA]" /> },
    { label: "Browser", icon: <IconCloudOff className="h-5 w-5 text-[#8A35F2]" /> },
  ];
  return (
    <div className="mt-4 flex items-center justify-center gap-0">
      {icons.map((n, i) => (
        <React.Fragment key={n.label}>
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-12 h-12 rounded-xl bg-[#222] border border-[#333] flex items-center justify-center">
              {n.icon}
            </div>
            <span className="text-xs text-[#888] font-medium">{n.label}</span>
          </div>
          {i < icons.length - 1 && (
            <svg className="h-4 w-4 text-[#8A35F2] mx-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
function MarkdownPreview() {
  return (
    <div className="mt-4 space-y-3 text-sm">
      <div className="bg-[#8A35F2]/10 border border-[#8A35F2]/20 rounded-lg px-4 py-3 text-[#c4b5fd]">
        <span className="text-[#A78BFA] font-medium">Tip</span> — Use callouts to break up long notes.
      </div>
      <div className="flex items-center gap-2 text-[#ccc]">
        <span className="h-4 w-4 rounded border border-[#8A35F2] bg-[#8A35F2]/20 flex items-center justify-center">
          <svg className="h-2.5 w-2.5 text-[#A78BFA]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
        </span>
        <span>Render task lists as checkboxes</span>
      </div>
      <div className="font-mono text-[#888] text-center py-2">
        y = mx + b
      </div>
    </div>
  );
}

function WikiLinksPreview() {
  return (
    <div className="mt-4 flex items-center gap-2 text-sm flex-wrap">
      {["Ideas", "Telepathy", "Projects"].map((link, i) => (
        <React.Fragment key={link}>
          <span className="text-[#A78BFA] hover:text-[#c4b5fd] cursor-pointer transition-colors">[[{link}]]</span>
          {i < 2 && <svg className="h-3 w-3 text-[#555]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>}
        </React.Fragment>
      ))}
    </div>
  );
}

function FolderPreview() {
  const items = [
    { name: "Daily", indent: 0 },
    { name: "2024-12-20", indent: 1 },
    { name: "Ideas", indent: 0 },
    { name: "Projects", indent: 0 },
    { name: "Reading List", indent: 0 },
    { name: "On Writing", indent: 1 },
  ];
  return (
    <div className="mt-4 space-y-0.5 text-sm">
      {items.map((item) => (
        <div key={item.name} className={`flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-[#222] transition-colors cursor-pointer ${item.indent ? "text-[#666]" : "text-[#ccc] font-medium"}`}>
          <svg className={`h-4 w-4 shrink-0 ${item.indent ? "text-[#555]" : "text-[#A78BFA]"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
          <span className="truncate">{item.name}</span>
        </div>
      ))}
    </div>
  );
}

const features: Feature[] = [
  {
    icon: <IconCloudOff className="h-5 w-5" />,
    title: "Offline First",
    description: "Read your vault anywhere, even without a connection.",
    preview: <OfflinePreview />,
    className: "md:col-span-1",
  },
  {
    icon: <IconSearch className="h-5 w-5" />,
    title: "Instant Search",
    description: "Find any note the moment you start typing.",
    preview: <SearchPreview />,
    className: "md:col-span-1",
  },
  {
    icon: <IconGitBranch className="h-5 w-5" />,
    title: "GitHub Sync",
    description: "Keep your browser vault in step with GitHub.",
    preview: <SyncPreview />,
    className: "md:col-span-1",
  },
  {
    icon: <IconNotes className="h-5 w-5" />,
    title: "Markdown Support",
    description: "Callouts, math, tasks — everything renders.",
    preview: <MarkdownPreview />,
    className: "md:col-span-1",
  },
  {
    icon: <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>,
    title: "Wiki Links",
    description: "Follow [[links]] between your notes.",
    preview: <WikiLinksPreview />,
    className: "sm:col-span-1 lg:col-span-2",
  },
  {
    icon: <IconFolderOpen className="h-5 w-5" />,
    title: "Folder Navigation",
    description: "Browse your vault exactly like Obsidian.",
    preview: <FolderPreview />,
    className: "sm:col-span-1 lg:col-span-2",
  },
];

function FeatureCard({ feature }: { feature: Feature }) {
  return (
    <div className={`group relative rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a] p-6 flex flex-col transition-all duration-200 hover:border-[#3a3a3a] hover:bg-[#1f1f1f] ${feature.className ?? ""}`}>
      <div className="flex items-center gap-3 mb-2">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#8A35F2]/10 text-[#A78BFA]">
          {feature.icon}
        </span>
        <h3 className="text-base font-semibold text-white">{feature.title}</h3>
      </div>
      <p className="text-sm text-[#888] leading-relaxed mb-1">{feature.description}</p>
      {feature.preview}
    </div>
  );
}

function CoreFeatures() {
  return (
    <section id="features" className="relative py-24 sm:py-32 bg-[#111]">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#A78BFA] mb-3">Core Features</p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Read, search, and stay in sync anywhere.
          </h2>
          <p className="mt-4 text-lg text-[#888]">
            Everything in your Obsidian vault, working in the browser.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f) => (
            <FeatureCard key={f.title} feature={f} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ObsidianPreview() {
  const folders = [
    ["›", "Clippings"],
    ["›", "Daily"],
    ["⌄", "Ideas"],
    ["›", "Meta"],
    ["›", "Projects"],
    ["›", "References"],
  ];

  const notes = [
    "Evergreen notes",
    "Calmness is a superpower",
    "Travel",
    "Creativity is combinatorial",
    "Emergence",
    "Recipes",
    "Books",
    "Health",
    "What if it were easy",
    "Tools",
  ];

  return (
    <div
      className="grid size-full grid-cols-[27%_42%_31%] grid-rows-[6.2%_93.8%] bg-[#1e1e1e] text-[#d4d4d4]"
      style={{ fontSize: "clamp(5.5px, 1.22cqw, 15px)" }}
    >
      <div className="col-span-3 grid grid-cols-[27%_42%_31%] border-b border-[#333] bg-[#242424] text-[0.82em] text-[#aaa]">
        <div className="flex items-center gap-[0.75em] border-r border-[#343434] px-[1em]">
          {/* <span className="size-[0.92em] rounded-full bg-[#ff5f57]" />
          <span className="size-[0.92em] rounded-full bg-[#ffbd2e]" />
          <span className="size-[0.92em] rounded-full bg-[#28c840]" />
          <span className="ml-[0.7em] rounded-[0.25em] border border-[#6c6c6c] px-[0.42em] py-[0.22em] text-[0.9em]">
            □
          </span>
          <span>⌕</span>
          <span>⌁</span> */}
        </div>
        <div className="flex min-w-0 items-center border-r border-[#343434]">
          <div className="flex h-full min-w-0 items-center bg-[#1f1f1f] px-[1.15em] text-[#ddd]">
            <span className="truncate">Writing is telepathy</span>
            <span className="ml-[0.8em] text-[#777]">×</span>
          </div>
          <div className="min-w-0 px-[1.1em] text-[#777]">
            <span className="truncate">Evergreen notes</span>
          </div>
          <span className="ml-auto px-[1em] text-[1.2em] text-[#777]">+</span>
        </div>
        <div className="flex min-w-0 items-center px-[1.1em]">
          <span className="mr-[0.65em] text-[1.05em] text-[#aaa]">⌘</span>
          <span className="truncate text-[#d0d0d0]">Graph of Writing is t...</span>
          <span className="ml-auto text-[1.25em] text-[#777]">+</span>
        </div>
      </div>

      <aside className="min-w-0 border-r border-[#343434] bg-[#262626] text-[#b7b7b7]">
        <div className="space-y-[0.32em] px-[0.8em] py-[0.8em]">
          {folders.map(([icon, label]) => (
            <div key={label} className="flex items-center gap-[0.42em] text-[0.92em]">
              <span className="w-[0.8em] text-[#8b8b8b]">{icon}</span>
              <span>{label}</span>
            </div>
          ))}
          <div className="ml-[0.1em] rounded-[0.28em] bg-[#363636] px-[2.1em] py-[0.45em] text-[#e2e2e2]">
            Writing is telepathy
          </div>
        </div>

        <div className="space-y-[0.78em] px-[1.9em] text-[0.86em] leading-none text-[#aaa]">
          {notes.map((note) => (
            <p key={note} className="truncate">
              {note}
            </p>
          ))}
        </div>
        <div className="mt-[1.25em] border-t border-[#3a3a3a] px-[1.05em] py-[0.72em] text-[0.9em] text-[#d0d0d0]">
          ↕ Notes
          <span className="float-right text-[#9a9a9a]">? ⚙</span>
        </div>
      </aside>

      <article className="min-w-0 overflow-hidden border-r border-[#343434] bg-[#1e1e1e] px-[3.8em] py-[2.8em]">
        <h2 className="max-w-[8em] text-[2.55em] font-bold leading-[1.08] text-[#e7e7e7]">
          Writing is telepathy
        </h2>
        <div className="mt-[1em] inline-flex rounded-[0.7em] bg-[#332c52] px-[0.65em] py-[0.2em] text-[0.9em] text-[#b79cff]">
          #evergreen
        </div>
        <p className="mt-[0.9em] text-[1em] text-[#bdbdbd]">
          From <span className="border-b border-[#9f86ff] text-[#b79cff]">On Writing</span>
        </p>

        <h3 className="mt-[0.85em] max-w-[11em] text-[1.8em] font-bold leading-[1.08] text-[#e1e1e1]">
          Ideas can travel through time and space
        </h3>
        <p className="mt-[0.8em] max-w-[20em] text-[1.08em] leading-[1.38] text-[#b8b8b8]">
          Ideas can travel through space without being uttered out loud. The
          process of telepathy requires two places:
        </p>
        <ul className="mt-[0.75em] max-w-[20.5em] list-disc space-y-[0.65em] pl-[1.35em] text-[1em] leading-[1.34] text-[#c7c7c7]">
          <li>
            <strong>A sending place</strong>, a transmission place — where the
            writer sends ideas, such as a desk
          </li>
          <li>
            <strong>A receiving place</strong> — where the reader receives the
            ideas/imagery such as a couch, a comfortable chair, in bed
          </li>
        </ul>
        <h3 className="mt-[1.05em] text-[1.45em] font-bold text-[#e1e1e1]">Quote</h3>
      </article>

      <GraphPreview />
    </div>
  );
}

function GraphPreview() {
  const nodes = [
    [18, 38, 2.5], [32, 30, 2.3], [43, 41, 2.4], [60, 30, 2.2],
    [69, 48, 4.2], [79, 36, 2.6], [91, 28, 2.3], [86, 56, 4.3],
    [74, 70, 2.2], [57, 74, 2.1], [41, 68, 4.1], [24, 64, 2.5],
  ];

  const greenNodes = new Set([3, 9]);
  const brightNodes = new Set([4, 7]);

  const edges = [
    [0, 1], [0, 10], [1, 2], [2, 3], [3, 5],
    [4, 5], [4, 7], [5, 6], [6, 7], [7, 8],
    [9, 10], [10, 11], [11, 0],
  ];

  return (
    <aside className="relative min-w-0 overflow-hidden bg-[#1e1e1e]">
      <svg viewBox="0 0 100 100" className="absolute inset-0 size-full">
        {edges.map(([from, to]) => (
          <line
            key={`${from}-${to}`}
            x1={nodes[from][0]}
            y1={nodes[from][1]}
            x2={nodes[to][0]}
            y2={nodes[to][1]}
            stroke="#4a4a4a"
            strokeWidth="0.45"
          />
        ))}
        {nodes.map(([cx, cy, r], index) => (
          <circle
            key={`${cx}-${cy}`}
            cx={cx}
            cy={cy}
            r={r}
            fill={
              greenNodes.has(index)
                ? "#20c45a"
                : brightNodes.has(index)
                  ? "#f1f1f1"
                  : "#a9a9a9"
            }
          />
        ))}
      </svg>
      <div className="absolute bottom-[1em] right-[1em] flex gap-[0.6em] rounded-[0.35em] border border-[#3a3a3a] bg-[#222] px-[0.9em] py-[0.5em] text-[0.78em] text-[#777]">
        <span>1 backlink</span>
        <span>206 words</span>
      </div>
    </aside>
  );
}
