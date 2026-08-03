import { useEffect, useState } from "react";
import { Safari } from "@/components/ui/safari";
import { Highlighter } from "@/components/ui/highlighter";
import { MiniPlayer } from "@/components/ui/video-player";
import logoMark from "@/assets/logo.svg";
import BatLogoMaker from "@/assets/2.svg";

export function LandingPage() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function onScroll() {
      const scrollY = window.scrollY;
      const maxScroll = window.innerHeight * 0.9;

      const value = Math.min(scrollY / maxScroll, 1);
      setProgress(value);
    }

    window.addEventListener("scroll", onScroll);
    onScroll();

    return () => window.removeEventListener("scroll", onScroll);
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
                    href="/app"
                    className="inline-flex min-h-10 items-center rounded-full bg-white px-4 py-2 font-medium text-black transition-colors hover:bg-white/90 -mt-10"
                  >
                    Connect Vault
                  </a>
                </nav>
              </header>

              <div className="grid h-full grid-rows-[auto_minmax(0,1fr)] gap-6 pt-16 lg:gap-8 lg:pt-18">
                <div className="max-w-4xl pt-2 md:pt-6">
                  <h1 className="max-w-full whitespace-nowrap text-[clamp(1.5rem,5vw,4.5rem)] font-semibold leading-[1.02] tracking-tight text-[#E5E7EB]">
                    Your knowledge. Everywhere.
                  </h1>
                  <p className="mt-5 max-w-[17em] text-[clamp(1.35rem,3.25vw,2.25rem)] leading-tight text-[#9CA3AF]">
                    Read, search, and access your Obsidian vault from any browser.
                  </p>
                  <a
                    href="/app"
                    className="mt-7 inline-flex min-h-15 w-full max-w-94.25 items-center justify-center rounded-[7px] bg-[#8A35F2] px-6 py-4 text-center text-xl font-medium leading-tight text-white transition-colors hover:bg-[#7c2ee0] focus:outline-none focus:ring-2 focus:ring-[#9b55ff] focus:ring-offset-2 focus:ring-offset-[#0b0b0b] sm:mt-8 sm:w-auto sm:px-6"
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

          <div className="mt-10 overflow-hidden rounded-[28px] border border-white/10 bg-black shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
            <MiniPlayer
              className="w-full"
              src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
              poster="https://picsum.photos/seed/flower/1280/720"
            />
          </div>
        </div>
      </section>

      <footer className="relative z-30">
        <div className=" px-6 pb-12 pt-10 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-6xl">
            <a className="flex justify-center items-center gap-3">
              <img
                src={BatLogoMaker}
                alt="Obsin"
                className="w-200 h-auto -mt-160 -mb-160"
              />
            </a>
          </div>
        </div>

        <div className="mt-40 px-6 py-10 sm:px-8 lg:px-10">
          <div className="mx-auto flex max-w-6xl items-start justify-between">
            {/* Left */}
            <div className="space-y-4">
              <p className="text-sm text-white/60">Follow us</p>

              <div className="flex gap-10">
                <a href="https://x.com/ShreyanshWorks" className="text-white/90 transition hover:text-white">
                  Twitter
                </a>

                <a href="https://github.com/shreyansh-singh74/Obsin" className="text-white/90 transition hover:text-white">
                  GitHub
                </a>
              </div>
            </div>

            {/* Right */}
            <div className="flex flex-col items-end gap-8">
              <div className="flex gap-6">
                <a href="#" className="text-white/90 transition hover:text-white">
                  Terms
                </a>

                <a href="#" className="text-white/90 transition hover:text-white">
                  Privacy
                </a>

                <a href="#" className="text-white/90 transition hover:text-white">
                  Data Controls
                </a>
              </div>

              <p className="text-sm text-white/55">© 2026 Obsin</p>
            </div>
          </div>
        </div>
      </footer>
    </main>
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
    [20, 51, 2.1], [35, 52, 2.1], [49, 56, 2.3], [57, 44, 2.2],
    [73, 25, 2.6], [86, 20, 2.3], [95, 46, 2.2], [96, 68, 5.2],
    [82, 78, 2.4], [91, 82, 2.3], [84, 90, 2.2], [58, 24, 2.4],
  ];

  const greenNodes = new Set([3, 9, 17, 18]);
  const brightNodes = new Set([4, 7, 10, 19]);

  const edges = [
    [0, 1], [0, 10], [1, 2], [1, 12], [2, 3], [2, 10], [2, 14],
    [3, 5], [4, 5], [4, 7], [4, 10], [4, 14], [5, 6], [5, 16],
    [6, 17], [7, 8], [7, 18], [7, 20], [8, 19], [8, 20], [9, 10],
    [10, 11], [10, 13], [11, 12], [13, 14], [14, 15], [15, 23],
    [16, 17], [18, 19], [19, 20], [20, 21], [21, 22],
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
