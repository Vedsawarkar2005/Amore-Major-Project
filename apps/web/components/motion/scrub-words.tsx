"use client";

import type { ReactNode } from "react";

import { gsap, SplitText } from "@/lib/gsap";

import { ScrollMotion } from "./scroll-motion";

function scrubWords(target: Element) {
  // Text already in view when the page opens (e.g. near the top of a page)
  // is shown as it is: the reader never scrolls through it, so it would
  // stay dimmed.
  if (target.getBoundingClientRect().top < window.innerHeight * 0.82) return;

  const split = SplitText.create(target, {
    type: "words",
    tag: "span",
    aria: "none",
    // Leave inline drawings (e.g. DrawUnderline) whole.
    ignore: "svg",
  });

  gsap.from(split.words, {
    // Dim, but never below large-text contrast (3:1) on its background.
    opacity: 0.45,
    ease: "none",
    stagger: 0.1,
    scrollTrigger: {
      trigger: target,
      start: "top 82%",
      end: "bottom 45%",
      scrub: 0.5,
    },
  });
}

/**
 * Fills its child's text word by word as it scrolls through the viewport, so
 * the reader's pace sets the reveal. Suited to a single quote or statement
 * below the fold; text already on screen when the page opens is left as is.
 *
 * Words are split into plain inline spans with ARIA left untouched, so the
 * text still reads normally to assistive technology.
 */
export function ScrubWords({ children }: { children: ReactNode }) {
  return <ScrollMotion animate={scrubWords}>{children}</ScrollMotion>;
}
