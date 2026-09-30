import { type ReactNode, useRef } from "react";

import { gsap, useGSAP } from "@/lib/gsap";

type ScrollMotionProps = {
  /** Builds the animation for the wrapped element. */
  animate: (target: Element) => void;
  children: ReactNode;
};

/**
 * The plumbing shared by the scroll animations in this folder. Wraps a single
 * child without rendering a box of its own and runs `animate` on it, only for
 * visitors who haven't asked for reduced motion. Everything `animate` creates
 * is reverted on unmount.
 *
 * Takes a function prop, so it can't be a client boundary itself: use it from
 * the "use client" motion components.
 */
export function ScrollMotion({ animate, children }: ScrollMotionProps) {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const target = scope.current?.firstElementChild;
      if (!target) return;

      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        animate(target);
      });
    },
    { scope },
  );

  return (
    <div className="contents" ref={scope}>
      {children}
    </div>
  );
}
