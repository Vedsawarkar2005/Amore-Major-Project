import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

import { SwatchReveal } from "@/components/motion/swatch-reveal";

type SplitRowProps = {
  id: string;
  title: ReactNode;
  children?: ReactNode;
  className?: string;
  /** Heading level; sections under a page's h1 use h2. */
  as?: "h1" | "h2";
};

/**
 * A heading on the left with a short supporting paragraph on the right.
 * Section headings (h2) are uncovered on scroll by a swipe of the picked
 * shade, line by line (SwatchReveal); a page's h1 is left static because
 * it's usually the largest paint above the fold.
 */
export function SplitRow({
  id,
  title,
  children,
  className,
  as: Heading = "h2",
}: SplitRowProps) {
  return (
    <div
      className={cn(
        "grid gap-6 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:items-end md:gap-16",
        className,
      )}
    >
      {Heading === "h1" ? (
        <h1 className="text-balance text-display" id={id}>
          {title}
        </h1>
      ) : (
        <SwatchReveal>
          {/* Section titles print in the picked shade's ink (`--shade`). */}
          <h2 className="text-shade-ink text-title" id={id}>
            {title}
          </h2>
        </SwatchReveal>
      )}
      {children ? (
        <div className="max-w-md text-lead text-muted-foreground">
          {children}
        </div>
      ) : null}
    </div>
  );
}
