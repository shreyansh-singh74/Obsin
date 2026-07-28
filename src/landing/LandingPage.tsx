import { useEffect, useState } from "react";

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
        <div className="sticky top-0 z-20 h-screen overflow-visible bg-black p-2">
          <div
            className="h-full w-full overflow-hidden bg-[#262626] transition-transform duration-75 ease-out"
            style={{
              transform: `translateY(${translateY}px) scale(${scale})`,
              opacity,
              transformOrigin: "top center",
              backfaceVisibility: "hidden",
              pointerEvents: opacity === 0 ? "none" : "auto",
              willChange: "transform, opacity",
            }}
          >
            <div className="mx-auto flex h-full max-w-6xl flex-col px-6 py-10 md:px-12">
              <div className="pt-4 md:pt-8">
                <h1 className="max-w-4xl text-5xl font-semibold leading-[1.03] tracking-tight text-[#E5E7EB] md:text-7xl">
                  Your knowledge. Everywhere.
                </h1>
                <p className="mt-6 max-w-2xl text-2xl leading-tight text-[#9CA3AF] md:text-4xl">
                  Read, search, and access your Obsidian vault from any browser.
                </p>
                <a
                  href="/app"
                  className="mt-10 inline-flex h-14 items-center justify-center bg-[#5B8CFF] px-7 text-base font-semibold text-white transition-colors hover:bg-[#4f7de6] focus:outline-none focus:ring-2 focus:ring-[#5B8CFF] focus:ring-offset-2 focus:ring-offset-[#262626]"
                >
                  Get Started
                </a>
              </div>

              <div className="relative mt-auto hidden min-h-0 flex-1 items-end pb-4 pt-10 md:flex">
                <a
                  href="/app"
                  className="group flex h-[360px] w-[78%] flex-col overflow-hidden border border-[#3A404C] bg-[#1B1D22] text-left transition-colors hover:border-[#5B8CFF]"
                >
                  <div className="flex h-11 items-center gap-2 border-b border-[#3A404C] bg-[#2D333D] px-4">
                    <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                    <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
                    <span className="h-3 w-3 rounded-full bg-[#28c840]" />
                    <span className="ml-4 text-sm text-[#9CA3AF]">PocketVault browser</span>
                  </div>
                  <div className="grid flex-1 grid-cols-[220px_1fr]">
                    <aside className="border-r border-[#3A404C] bg-[#242830] p-4 text-sm text-[#9CA3AF]">
                      {["Inbox", "Daily notes", "Projects", "References", "Books"].map((item) => (
                        <div key={item} className="mb-3">
                          {item}
                        </div>
                      ))}
                    </aside>
                    <div className="p-8">
                      <p className="text-sm font-medium text-[#5B8CFF]">vault/search.md</p>
                      <h2 className="mt-4 text-4xl font-semibold text-[#E5E7EB]">
                        Knowledge that follows your work.
                      </h2>
                      <p className="mt-5 max-w-lg text-lg leading-relaxed text-[#9CA3AF]">
                        Open notes, search ideas, and continue reading without leaving the browser.
                      </p>
                    </div>
                  </div>
                </a>

                <div className="absolute bottom-4 right-4 h-[300px] w-[160px] overflow-hidden border border-[#3A404C] bg-[#111318] p-4 shadow-2xl shadow-black/40">
                  <div className="mb-6 flex items-center justify-between text-xs text-[#E5E7EB]">
                    <span>11:56</span>
                    <span className="text-[#9CA3AF]">LTE</span>
                  </div>
                  <h3 className="text-xl font-semibold text-[#E5E7EB]">Reading List</h3>
                  <p className="mt-2 text-xs text-[#9CA3AF]">Synced from your vault</p>
                  <div className="mt-5 space-y-3 text-xs text-[#9CA3AF]">
                    <div className="border border-[#3A404C] bg-[#242830] p-3">Research notes</div>
                    <div className="border border-[#3A404C] bg-[#242830] p-3">Browser capture</div>
                    <div className="border border-[#3A404C] bg-[#242830] p-3">Trip planning</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-30 -mt-[35vh] min-h-screen bg-black px-6 py-24 text-white">
        <h2 className="text-4xl font-semibold">Next thing comes here</h2>
        <p className="mt-4 max-w-xl text-white/70">
          This section appears after the white panel moves up and shrinks.
        </p>
      </section>
    </main>
  );
}
