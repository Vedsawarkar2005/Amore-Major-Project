"use client";

import type { ReactNode } from "react";

import { gsap, SplitText } from "@/lib/gsap";

import { ScrollMotion } from "./scroll-motion";

function swatchReveal(target: Element) {
  SplitText.create(target, {
    type: "lines",
    linesClass: "swatch-line",
    // Re-split when fonts load or the width changes; the timeline returned
    // from onSplit is re-created and time-synced.
    autoSplit: true,
    onSplit: (self) => {
      const blocks = self.lines.map((line) => {
        const block = document.createElement("span");
        block.className = "swatch-block";
        block.setAttribute("aria-hidden", "true");
        line.append(block);
        return block;
      });
      // Hidden until the swipe passes over them.
      gsap.set(self.lines, { color: "transparent" });

      const timeline = gsap.timeline({
        scrollTrigger: { trigger: target, start: "top 86%", once: true },
        onComplete: () => self.revert(),
      });
      self.lines.forEach((line, index) => {
        const block = blocks[index];
        const at = index * 0.14;
        timeline
          // The swatch swipes on from the left…
          .to(block ?? [], { scaleX: 1, duration: 0.5, ease: "power3.in" }, at)
          // …the words appear underneath it…
          .set(line, { clearProps: "color" }, at + 0.5)
          .set(block ?? [], { transformOrigin: "right center" }, at + 0.5)
          // …and it lifts off to the right.
          .to(
            block ?? [],
            { scaleX: 0, duration: 0.6, ease: "expo.out" },
            at + 0.5,
          );
      });
      return timeline;
    },
  });
}

/**
 * Reveals its child's text line by line the first time it scrolls into
 * view: a block in the picked shade's ink swipes across each line like a
 * lipstick swatch, and lifts off to show the words. Afterwards the split is
 * reverted, restoring the original markup.
 *
 * Wrap a single, left-aligned text element (a section title). Renders no
 * box of its own. Keep it off above-the-fold headings: hiding them would
 * delay LCP.
 */
export function SwatchReveal({ children }: { children: ReactNode }) {
  return <ScrollMotion animate={swatchReveal}>{children}</ScrollMotion>;
}
