"use client";

import { cn } from "@/lib/utils";
import { useId } from "react";

import { gsap, useGSAP } from "@/lib/gsap";

/**
 * A hand-drawn lipstick stroke under a phrase, drawn as the page scrolls
 * past (scrubbed, so it follows the scroll both ways). Place it inside a
 * `relative` inline wrapper around the phrase; it takes the wrapper's text
 * colour unless `className` sets another. Fully drawn with reduced motion.
 *
 * It may sit inside text that SplitText rebuilds (e.g. ScrubWords), which
 * replaces the drawing with a copy; so the stroke is looked up by id on
 * the next tick, after any split, rather than held by a ref.
 */
export function DrawUnderline({ className }: { className?: string }) {
  const id = useId();

  useGSAP(() => {
    gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
      gsap.delayedCall(0, () => {
        const svg = document.getElementById(id);
        const path = svg?.querySelector("path");
        if (!(svg && path)) return;
        gsap.fromTo(
          path,
          { drawSVG: "0%" },
          {
            drawSVG: "100%",
            ease: "none",
            scrollTrigger: {
              trigger: svg,
              start: "top 85%",
              end: "top 50%",
              scrub: 0.6,
            },
          },
        );
      });
    });
  });

  return (
    <svg
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-x-[-0.04em] bottom-[-0.14em] h-[0.3em] w-[calc(100%+0.08em)] overflow-visible",
        className,
      )}
      fill="none"
      id={id}
      preserveAspectRatio="none"
      viewBox="0 0 300 20"
    >
      <path
        d="M4 13 C 48 6, 96 16, 150 10 S 246 6, 296 11"
        stroke="currentColor"
        strokeLinecap="round"
        // In the drawing's own units (it stretches to the phrase). A
        // non-scaling stroke would keep its width exact, but DrawSVG can't
        // measure a path drawn that way.
        strokeWidth="5"
      />
    </svg>
  );
}
