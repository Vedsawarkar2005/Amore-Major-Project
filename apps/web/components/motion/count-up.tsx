"use client";

import { useRef } from "react";

import { gsap, useGSAP } from "@/lib/gsap";

/**
 * A whole number that counts up from zero the first time it scrolls into
 * view. The real value is server-rendered, so it's right without scripts
 * and with reduced motion. Decorative: say the number in text nearby too.
 */
export function CountUp({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const number = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(number.current, {
          textContent: 0,
          snap: { textContent: 1 },
          duration: 1.4,
          ease: "power2.out",
          scrollTrigger: {
            trigger: number.current,
            start: "top 88%",
            once: true,
          },
        });
      });
    },
    { scope: number },
  );

  return (
    <span aria-hidden="true" className={className} ref={number}>
      {value}
    </span>
  );
}
