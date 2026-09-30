"use client";

import type { ReactNode } from "react";

import { gsap } from "@/lib/gsap";

import { ScrollMotion } from "./scroll-motion";

function riseIn(target: Element) {
  gsap.from(gsap.utils.toArray<HTMLElement>("[data-rise]", target), {
    scaleY: 0,
    transformOrigin: "50% 100%",
    ease: "power2.out",
    stagger: 0.06,
    scrollTrigger: {
      trigger: target,
      start: "top 92%",
      end: "top 35%",
      scrub: 0.6,
    },
  });
}

/**
 * Grows each `[data-rise]` descendant up from its bottom edge as the child
 * scrolls into view, one after another, like lipstick bullets twisting up.
 * Scrubbed, so it follows the scroll in both directions. Animates `scaleY`
 * only, which stays on the compositor.
 */
export function RiseIn({ children }: { children: ReactNode }) {
  return <ScrollMotion animate={riseIn}>{children}</ScrollMotion>;
}
