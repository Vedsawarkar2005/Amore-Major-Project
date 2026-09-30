"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

// Register plugins once; import GSAP from here so registration is guaranteed.
gsap.registerPlugin(useGSAP, DrawSVGPlugin, ScrollTrigger, SplitText);

if (typeof document !== "undefined") {
  // Web fonts change text metrics after first layout; recompute every
  // trigger's start/end once they've loaded.
  document.fonts.ready.then(() => ScrollTrigger.refresh());
}

/** Whether the visitor has asked for reduced motion, read at call time. */
export const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export { gsap, ScrollTrigger, SplitText, useGSAP };
