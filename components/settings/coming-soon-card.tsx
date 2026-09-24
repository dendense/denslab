import type { LucideIcon } from "lucide-react";
import { Lock } from "lucide-react";

/**
 * Placeholder card for features that are planned but not built. Dashed border
 * signals "not active yet" while staying inside the Neobrutalist palette.
 */
export function ComingSoonCard({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <section className="border-brutal-thin border-dashed bg-canvas p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="flex h-9 w-9 shrink-0 items-center justify-center border-brutal-thin bg-canvas"
        >
          <Icon className="h-4 w-4" />
        </span>

        <div className="min-w-0 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-base font-bold sm:text-lg">
              {title}
            </h3>
            <span className="border-brutal-thin inline-flex items-center gap-1 bg-accent px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide text-on-accent">
              <Lock className="h-3 w-3" aria-hidden="true" />
              Coming soon
            </span>
          </div>

          <p className="font-mono text-xs leading-relaxed">{description}</p>
        </div>
      </div>
    </section>
  );
}
