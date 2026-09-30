"use client";

import type { ReactNode } from "react";

import { gsap, SplitText } from "@/lib/gsap";

import { ScrollMotion } from "./scroll-motion";

function focusText(target: Element) {
  SplitText.create(target, {
    type: "words, chars",
    autoSplit: true,
    onSplit: (self) =>
      gsap.from(self.chars, {
        autoAlpha: 0,
        filter: "blur(14px)",
        scale: 1.35,
        yPercent: 12,
        duration: 1.3,
        ease: "expo.out",
        stagger: 0.028,
        scrollTrigger: { trigger: target, start: "top 82%", once: true },
        onComplete: () => self.revert(),
      }),
  });
}

/**
 * Pulls its child's text into focus letter by letter the first time it
 * scrolls into view, like a lens racking focus onto the words: each letter
 * arrives blurred and slightly large, then settles sharp. Afterwards the
 * split is reverted. Wrap a single short statement; keep it off
 * above-the-fold text.
 */
export function FocusText({ children }: { children: ReactNode }) {
  return <ScrollMotion animate={focusText}>{children}</ScrollMotion>;
}
