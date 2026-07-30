import { useEffect, useState } from "react";
import { Android } from "@/components/ui/android";
import { Safari } from "@/components/ui/safari";

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

              <div className="relative mt-8 flex min-h-0 flex-1 items-end justify-center pb-2 pt-4 md:mt-auto md:pb-4 md:pt-8">
                <div className="relative flex w-full max-w-[1180px] items-end justify-end select-text">
                  <div className="relative w-[88%] max-w-[940px]">
                    <Safari
                      url="pocketvault.local/vault/daily-notes"
                      mode="default"
                      className="drop-shadow-[0_22px_45px_rgba(0,0,0,0.35)]"
                    >
                      <ObsidianPreview />
                    </Safari>
                  </div>

                  <div className="relative z-20 ml-[-7%] w-[27%] min-w-[220px] max-w-[350px] self-end">
                    <Android className="drop-shadow-[0_28px_55px_rgba(0,0,0,0.42)]">
                      <AndroidPreview />
                    </Android>
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

function ObsidianPreview() {
  const navItems = ["Inbox", "Projects", "References", "Books", "Archive"];
  const notes = [
    ["Jul 30, 2026", "Browser reading workflow..."],
    ["Research capture", "Links, highlights, backlinks"],
    ["Project map", "Ideas connected by topic"],
  ];

  return (
    <div
      className="grid size-full grid-cols-[22%_25%_53%] bg-[#0F1117] text-[#D7DDE8]"
      style={{ fontSize: "clamp(5px, 1.2cqw, 16px)" }}
    >
      <aside className="flex min-w-0 flex-col bg-[#1A1D24] px-[1.5em] py-[1.5em]">
        <div className="rounded-[0.45em] bg-[#242A36] px-[1.1em] py-[0.9em] text-[1em] font-bold text-[#E5E7EB]">
          PocketVault
        </div>
        <div className="mt-[1.6em] rounded-[0.45em] bg-[#283246] px-[1.1em] py-[0.9em] text-[0.85em] font-semibold text-[#9DB7FF]">
          Daily notes
        </div>
        <div className="mt-[1.4em] space-y-[1em] px-[1.1em] text-[0.8em] text-[#9CA3AF]">
          {navItems.map((item) => (
            <p key={item}>{item}</p>
          ))}
        </div>
        <div className="mt-auto flex items-center gap-[0.8em] rounded-[0.6em] bg-[#202632] px-[1.1em] py-[0.9em]">
          <span className="size-[1.2em] rounded-full bg-[#5B8CFF]" />
          <div>
            <p className="text-[0.8em] font-bold text-[#E5E7EB]">Synced</p>
            <p className="mt-[0.35em] text-[0.65em] text-[#9CA3AF]">12 vault changes</p>
          </div>
        </div>
      </aside>

      <aside className="min-w-0 bg-[#151820] px-[1.5em] py-[1.5em]">
        <div className="rounded-[0.45em] bg-[#242A36] px-[1.1em] py-[0.9em] text-[0.8em] text-[#9CA3AF]">
          Search notes...
        </div>
        <h2 className="mt-[2em] text-[1em] font-bold text-[#E5E7EB]">Daily Notes</h2>
        <div className="mt-[1.4em] space-y-[1.1em]">
          {notes.map(([title, body], index) => (
            <div
              key={title}
              className={`rounded-[0.6em] px-[1.1em] py-[1em] ${index === 0 ? "bg-[#243048]" : "bg-[#1D222D]"}`}
            >
              <p className="text-[0.8em] font-bold text-[#E5E7EB]">{title}</p>
              <p className="mt-[0.6em] text-[0.65em] text-[#9CA3AF]">{body}</p>
            </div>
          ))}
        </div>
      </aside>

      <article className="min-w-0 px-[2em] py-[2em]">
        <p className="text-[0.8em] font-bold text-[#5B8CFF]">
          vault/daily-notes/2026-07-30.md
        </p>
        <h2 className="mt-[1.1em] text-[2.15em] font-extrabold leading-tight text-[#F4F7FB]">
          Daily reading list
        </h2>
        <p className="mt-[1em] text-[0.95em] leading-relaxed text-[#AAB2C0]">
          A browser-first view of the notes already living in your Obsidian vault.
        </p>
        <div className="my-[1.7em] h-px bg-[#2D3442]" />
        <h3 className="text-[1.2em] font-bold text-[#E5E7EB]">Today</h3>
        <ul className="mt-[1em] space-y-[0.9em] text-[0.9em] leading-relaxed">
          <li>Finish highlights from the distributed systems article.</li>
          <li>Connect ideas to [[Offline-first sync]] and [[Local search]].</li>
          <li>Review backlinks before publishing the research note.</li>
        </ul>
        <div className="mt-[1.8em] max-w-[24em] rounded-[0.7em] border border-[#2F3B52] bg-[#182033] px-[1.3em] py-[1em]">
          <p className="text-[0.8em] font-bold text-[#9DB7FF]">Linked note</p>
          <p className="mt-[0.5em] text-[0.9em]">Offline-first sync</p>
        </div>
        <div className="my-[1.7em] h-px bg-[#2D3442]" />
        <h3 className="text-[1.2em] font-bold text-[#E5E7EB]">Backlinks</h3>
        <div className="mt-[1em] inline-block rounded-[0.6em] bg-[#1B202B] px-[1.3em] py-[0.85em] text-[0.8em] text-[#AAB2C0]">
          3 references from Research capture
        </div>
      </article>
    </div>
  );
}

function AndroidPreview() {
  const stats = [
    ["12", "notes today"],
    ["4", "open backlinks"],
    ["98%", "offline ready"],
  ];

  const cards = [
    ["Continue reading", "Distributed systems notes are synced and ready."],
    ["Capture idea", "Save a thought to the inbox in two taps."],
    ["Search vault", "Jump to any note without leaving the current view."],
  ];

  return (
    <div
      className="flex size-full flex-col bg-[#0C0F14] text-[#E5EAF2]"
      style={{ fontSize: "clamp(5.5px, 1.35cqw, 15px)" }}
    >
      <div className="flex items-center gap-[0.8em] border-b border-white/6 px-[1.2em] py-[1.1em]">
        <div className="size-[0.85em] rounded-full bg-[#5B8CFF] shadow-[0_0_0_0.45em_rgba(91,140,255,0.16)]" />
        <div>
          <p className="text-[0.9em] font-bold text-[#F4F7FB]">PocketVault</p>
          <p className="mt-[0.2em] text-[0.68em] text-[#8B95A7]">Mobile companion</p>
        </div>
        <div className="ml-auto rounded-full bg-white/6 px-[0.8em] py-[0.42em] text-[0.66em] font-semibold text-[#B8C0D0]">
          Live
        </div>
      </div>

      <div className="px-[1.2em] pb-[1em] pt-[1.05em]">
        <div className="rounded-[1.2em] border border-white/6 bg-gradient-to-br from-[#12213A] to-[#0F1726] px-[1em] py-[0.95em] shadow-[0_12px_34px_rgba(0,0,0,0.28)]">
          <p className="text-[0.7em] font-semibold uppercase tracking-[0.18em] text-[#8B95A7]">
            Today
          </p>
          <p className="mt-[0.55em] text-[1.08em] font-bold leading-tight text-[#F4F7FB]">
            Read and sync from the vault on mobile.
          </p>
          <p className="mt-[0.7em] text-[0.72em] leading-relaxed text-[#AAB2C0]">
            Keep the browser open on desktop and continue the same note on your phone.
          </p>
        </div>

        <div className="mt-[0.85em] grid grid-cols-3 gap-[0.55em]">
          {stats.map(([value, label]) => (
            <div key={label} className="rounded-[1em] bg-white/5 px-[0.7em] py-[0.72em] text-center">
              <p className="text-[0.95em] font-bold text-[#F4F7FB]">{value}</p>
              <p className="mt-[0.22em] text-[0.58em] text-[#9AA5B8]">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-[1.2em] pb-[1.1em]">
        <div className="space-y-[0.72em]">
          {cards.map(([title, body], index) => (
            <div
              key={title}
              className={`rounded-[1.05em] border px-[1em] py-[0.86em] ${index === 0 ? "border-[#27406D] bg-[#12213A]" : "border-white/6 bg-[#111622]"}`}
            >
              <p className="text-[0.82em] font-bold text-[#F4F7FB]">{title}</p>
              <p className="mt-[0.35em] text-[0.68em] leading-relaxed text-[#AAB2C0]">{body}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-auto border-t border-white/6 px-[1.2em] py-[1em]">
        <div className="flex items-center justify-between rounded-[1em] bg-white/5 px-[0.95em] py-[0.85em]">
          <div>
            <p className="text-[0.72em] font-semibold text-[#8B95A7]">Sync status</p>
            <p className="mt-[0.24em] text-[0.84em] font-bold text-[#F4F7FB]">Up to date</p>
          </div>
          <div className="h-[0.78em] w-[2.1em] rounded-full bg-[#5B8CFF] shadow-[0_0_0_0.35em_rgba(91,140,255,0.14)]" />
        </div>
      </div>
    </div>
  );
}
