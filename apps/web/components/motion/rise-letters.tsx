"use client";

import type { ReactNode } from "react";

import { gsap } from "@/lib/gsap";

import { ScrollMotion } from "./scroll-motion";

function riseLetters(target: Element) {
  gsap.from(gsap.utils.toArray<HTMLElement>("[data-letter]", target), {
    yPercent: 100,
    ease: "none",
    stagger: 0.1,
    scrollTrigger: {
      trigger: target,
      start: "top bottom",
      // Done a little before the very end of the page, so rounding in the
      // last scroll position can never leave a letter short.
      end: "bottom bottom+=40",
      scrub: 0.6,
    },
  });
}

/**
 * Raises each `[data-letter]` descendant up into view, one after another,
 * as its child scrolls onto the screen: scrubbed, so the letters follow the
 * scroll both ways. Pair it with a clipping parent so the letters rise out
 * of an edge. Made for a wordmark at the foot of the page.
 */
export function RiseLetters({ children }: { children: ReactNode }) {
  return <ScrollMotion animate={riseLetters}>{children}</ScrollMotion>;
}
