"use client";

import type { ReactNode } from "react";

import { gsap } from "@/lib/gsap";

import { ScrollMotion } from "./scroll-motion";

function sequenceProgress(target: Element) {
  const bar = target.querySelector("[data-progress]");
  const steps = gsap.utils.toArray<HTMLElement>("[data-step]", target);

  const timeline = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: target,
      start: "top 75%",
      end: "bottom 55%",
      scrub: 0.6,
    },
  });

  if (bar) {
    timeline.from(
      bar,
      { scaleX: 0, transformOrigin: "0% 50%", duration: steps.length },
      0,
    );
  }
  steps.forEach((step, index) => {
    timeline.from(step, { opacity: 0.2, duration: 0.4 }, index + 0.2);
  });
}

/**
 * Scroll-linked progress through a sequence: the `[data-progress]` rule fills
 * from left to right and each `[data-step]` marker lights up as the rule
 * reaches its share of the scroll. Without motion, both show their end state.
 */
export function SequenceProgress({ children }: { children: ReactNode }) {
  return <ScrollMotion animate={sequenceProgress}>{children}</ScrollMotion>;
}
