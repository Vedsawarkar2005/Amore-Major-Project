"use client";

import type { ReactNode } from "react";

import { gsap, SplitText } from "@/lib/gsap";

import { ScrollMotion } from "./scroll-motion";

function revealLines(target: Element) {
  SplitText.create(target, {
    type: "lines",
    mask: "lines",
    linesClass: "split-line",
    // Re-split when fonts load or the width changes; the animation
    // returned from onSplit is re-created and time-synced.
    autoSplit: true,
    onSplit: (self) =>
      gsap.from(self.lines, {
        yPercent: 110,
        duration: 1.1,
        ease: "expo.out",
        stagger: 0.09,
        scrollTrigger: { trigger: target, start: "top 88%", once: true },
        onComplete: () => self.revert(),
      }),
  });
}

/**
 * Reveals its child's text line by line — each line rises out of a mask — the
 * first time it scrolls into view. Afterwards the split is reverted, restoring
 * the original markup and accessibility tree.
 *
 * Wrap a single text element (usually a heading). Renders no box of its own.
 * Keep it off above-the-fold headings: hiding them would delay LCP.
 */
export function RevealLines({ children }: { children: ReactNode }) {
  return <ScrollMotion animate={revealLines}>{children}</ScrollMotion>;
}
