"use client";

import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
} from "@/components/primitives/item";
import { useRef } from "react";

import { hydravelvet } from "@/content/hydravelvet";
import { gsap, useGSAP } from "@/lib/gsap";

import { Lips } from "./lips";

/**
 * The application steps beside a pair of lips that act them out as the
 * page scrolls: colour spreads from the centre outward (step 1), the lip
 * line is drawn on (step 2), then a gloss sweeps across for the top-up
 * (step 3), each step sliding into line as its part plays. Scrubbed, so it
 * follows the scroll both ways. With reduced motion everything shows
 * finished.
 */
export function RitualScene() {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        const steps = gsap.utils.toArray<HTMLElement>("[data-ritual-step]");

        // Each step slides into line (from the left: a shift to the right would
        // widen the page on phones) and takes the shade's ink on its border
        // as its part plays. The words are never dimmed: they must stay
        // readable at any scroll position.
        gsap.set(steps, { x: -12, borderColor: "var(--border)" });
        const timeline = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: scope.current,
            start: "top 70%",
            end: "bottom 55%",
            scrub: 0.6,
          },
        });

        timeline
          // 1. Centre out.
          .to(
            steps[0] ?? [],
            { x: 0, borderColor: "var(--shade-ink)", duration: 0.3 },
            0,
          )
          .fromTo(
            "[data-lips-fill]",
            { attr: { r: 0 } },
            { attr: { r: 200 }, duration: 1, ease: "power1.inOut" },
            0,
          )
          // 2. Define the line.
          .to(
            steps[1] ?? [],
            { x: 0, borderColor: "var(--shade-ink)", duration: 0.3 },
            1.1,
          )
          .fromTo(
            "[data-lips-outline]",
            { drawSVG: "50% 50%" },
            { drawSVG: "0% 100%", duration: 1 },
            1.1,
          )
          .fromTo(
            "[data-lips-mouth]",
            { drawSVG: "50% 50%" },
            { drawSVG: "0% 100%", duration: 0.7 },
            1.3,
          )
          // 3. Top up: a gloss sweeps across the lower lip.
          .to(
            steps[2] ?? [],
            { x: 0, borderColor: "var(--shade-ink)", duration: 0.3 },
            2.2,
          )
          .fromTo(
            "[data-lips-gloss]",
            { x: -120, opacity: 0 },
            {
              keyframes: [
                { x: 0, opacity: 0.45, duration: 0.5 },
                { x: 30, opacity: 0.3, duration: 0.4 },
              ],
            },
            2.2,
          );
      });
    },
    { scope },
  );

  return (
    <div
      className="grid grid-cols-1 gap-10 md:grid-cols-12 md:items-center md:gap-8"
      ref={scope}
    >
      <div className="relative flex aspect-16/10 items-center justify-center overflow-hidden rounded-2xl bg-[radial-gradient(120%_90%_at_30%_20%,#f0cdb1,#d5a07c_60%,#b98260)] text-ink md:col-span-7">
        <Lips className="w-[72%]" />
        <div aria-hidden="true" className="stage-grain absolute inset-0" />
      </div>

      <ol className="flex flex-col gap-3 md:col-span-5">
        {hydravelvet.steps.map((step, index) => (
          <Item
            className="items-start gap-6 rounded-xl py-5"
            key={step}
            render={<li data-ritual-step />}
            variant="outline"
          >
            <ItemMedia
              aria-hidden="true"
              className="font-heading text-5xl text-shade-ink tabular-nums leading-none"
            >
              {index + 1}
            </ItemMedia>
            <ItemContent>
              <ItemDescription className="max-w-sm text-foreground text-lg">
                {step}
              </ItemDescription>
            </ItemContent>
          </Item>
        ))}
      </ol>
    </div>
  );
}
