"use client";

import { Fragment, useRef } from "react";

import { ShadeBullet } from "@/components/product/shade-bullet";
import { hydravelvet, shades } from "@/content/hydravelvet";
import { formatInr } from "@/lib/format";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

const phrases = [
  ...hydravelvet.ingredients.map((ingredient) => ingredient.name),
  `${hydravelvet.finish} finish`,
  `${shades.length} shades`,
  `${formatInr(hydravelvet.priceInr)} each`,
];

/**
 * A band of what's in the lipstick, set large in the picked shade's ink,
 * between the story and the rest of the page. It moves only as the page
 * scrolls past (never on its own), sliding half its length, and the italic
 * leans harder into a fast scroll, then straightens as the page settles.
 * The phrases are repeated so the line never runs out. Every phrase is also
 * said elsewhere on the page, so the band is hidden from assistive
 * technology.
 */
export function IngredientTicker() {
  const band = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          track.current,
          { xPercent: 0 },
          {
            xPercent: -50,
            ease: "none",
            scrollTrigger: {
              trigger: band.current,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.6,
            },
          },
        );

        // Lean with the scroll's speed (px/s), capped; ease back upright
        // once scrolling stops.
        const lean = gsap.quickTo(track.current, "skewX", {
          duration: 0.6,
          ease: "power3",
        });
        let settle: gsap.core.Tween | undefined;
        ScrollTrigger.create({
          trigger: band.current,
          start: "top bottom",
          end: "bottom top",
          onUpdate: (self) => {
            lean(gsap.utils.clamp(-14, 14, self.getVelocity() / -220));
            settle?.kill();
            settle = gsap.delayedCall(0.12, () => lean(0));
          },
        });
      });
    },
    { scope: band },
  );

  return (
    <div
      aria-hidden="true"
      className="overflow-hidden border-border border-b bg-background py-8 md:py-12"
      ref={band}
    >
      <div
        className="flex w-max items-center font-heading text-[clamp(3rem,7.5vw,7.5rem)] text-shade-ink italic leading-none will-change-transform"
        ref={track}
      >
        {[0, 1].map((copy) =>
          phrases.map((phrase, index) => (
            <Fragment key={`${copy}-${phrase}`}>
              <span className="whitespace-nowrap px-[0.35em]">{phrase}</span>
              <ShadeBullet
                className="h-[0.55em] w-[0.2em]"
                color={
                  shades[(copy * phrases.length + index) % shades.length]
                    ?.color ?? "currentColor"
                }
              />
            </Fragment>
          )),
        )}
      </div>
    </div>
  );
}
