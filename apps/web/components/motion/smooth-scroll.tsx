"use client";

import "lenis/dist/lenis.css";

import Lenis from "lenis";

import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

/**
 * Eases mouse-wheel and trackpad scrolling so scroll-scrubbed scenes glide
 * instead of stepping. Lenis keeps the page's native scroll (it only smooths
 * the input), so CSS `position: sticky`, anchor links and the browser's
 * scrollbar all keep working. GSAP's ScrollSmoother was the alternative, but
 * it moves the page with transforms and would break the sticky header and the
 * sticky hero stage.
 *
 * Touch scrolling stays native (Lenis's default), and visitors who ask for
 * reduced motion get plain scrolling. Renders nothing.
 */
export function SmoothScroll() {
  useGSAP(() => {
    gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
      // Driven by GSAP's ticker (below) so Lenis and every ScrollTrigger read
      // the same scroll position on the same frame.
      const lenis = new Lenis({ autoRaf: false, lerp: 0.12 });
      lenis.on("scroll", ScrollTrigger.update);

      const tick = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(tick);

      return () => {
        gsap.ticker.remove(tick);
        lenis.destroy();
      };
    });
  });

  return null;
}
