// Based on GitHubRepoCard — MIT licensed, restyled to Obsin dark theme.
// Adapted: no Star button (GitHubRepo has no stars/forks fields); click selects vault.
import { forwardRef, type ComponentPropsWithoutRef } from "react";

import { Github, Lock, CheckCircle2 } from "lucide-react";

import { cn } from "@/lib/utils";

export type VaultRepoCardProps = Readonly<
  {
    owner: string;
    name: string;
    description?: string | null;
    isPrivate?: boolean;
    selected?: boolean;
  } & ComponentPropsWithoutRef<"div">
>;

export const VaultRepoCard = forwardRef<HTMLDivElement, VaultRepoCardProps>(
  (
    {
      className,
      owner,
      name,
      description,
      isPrivate = false,
      selected = false,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        data-slot="vault-repo-card"
        role="button"
        tabIndex={0}
        aria-pressed={selected}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && props.onClick) {
            e.preventDefault();
            props.onClick(e as unknown as React.MouseEvent<HTMLDivElement>);
          }
        }}
        className={cn(
          "group w-full rounded-xl border p-4 font-sans transition-all duration-200 cursor-pointer",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8A35F2]/60",
          selected
            ? "border-[#8A35F2] bg-[#8A35F2]/[0.12] shadow-[0_0_24px_rgba(138,53,242,0.15)]"
            : "border-white/[0.07] bg-white/[0.03] hover:border-white/[0.14] hover:bg-white/[0.06]",
          className,
        )}
        {...props}
      >
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-lg border transition-colors",
              selected
                ? "border-[#8A35F2]/40 bg-[#8A35F2]/15 text-[#c4b5fd]"
                : "border-white/[0.07] bg-black/40 text-white/60 group-hover:text-white/90 group-hover:border-white/15",
            )}
          >
            <Github size={17} strokeWidth={1.8} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold tracking-tight text-white">
              {name}
            </p>
            <p className="truncate text-[11px] text-white/40">
              {owner}/{name}
            </p>
          </div>
          {selected ? (
            <CheckCircle2 size={18} className="shrink-0 text-[#8A35F2]" />
          ) : (
            <span className="flex shrink-0 items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] px-2 py-1 text-[10px] font-medium text-white/45">
              <Lock size={9} className={isPrivate ? "text-amber-400" : "text-emerald-400"} />
              {isPrivate ? "Private" : "Public"}
            </span>
          )}
        </div>

        {description ? (
          <p className="mt-2.5 line-clamp-2 pl-12 text-xs leading-relaxed text-white/45">
            {description}
          </p>
        ) : null}
      </div>
    );
  },
);

VaultRepoCard.displayName = "VaultRepoCard";
