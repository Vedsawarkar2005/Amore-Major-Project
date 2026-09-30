"use client";

import { AspectRatio } from "@/components/primitives/aspect-ratio";
import Link from "next/link";
import { useRef } from "react";

import { RollText } from "@/components/motion/roll-text";
import { CtaLink } from "@/components/page/cta-link";
import { SplitRow } from "@/components/page/split-row";
import { hydravelvet, shadePath, shades } from "@/content/hydravelvet";
import { formatInr } from "@/lib/format";
import { gsap, useGSAP } from "@/lib/gsap";

/**
 * Every shade as a tall colour card. On wide screens the section pins and
 * vertical scrolling slides the cards sideways; on phones (and with reduced
 * motion) it's a native, swipeable row with snap points.
 */
export function ShadeGallery() {
  const section = useRef<HTMLElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLUListElement>(null);

  useGSAP(
    () => {
      gsap
        .matchMedia()
        .add(
          "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
          () => {
            const list = track.current;
            if (!list) return;
            const distance = () => list.scrollWidth - list.clientWidth;

            gsap.to(list, {
              x: () => -distance(),
              ease: "none",
              scrollTrigger: {
                trigger: pin.current,
                pin: true,
                // Pin below the 4rem (64px) sticky header.
                start: "top top+=64",
                end: () => `+=${distance()}`,
                scrub: 0.8,
                invalidateOnRefresh: true,
              },
            });
          },
        );
    },
    { scope: section },
  );

  return (
    <section
      aria-labelledby="shades-title"
      className="overflow-hidden bg-background"
      id="shades"
      ref={section}
    >
      <div
        className="py-24 md:motion-safe:flex md:motion-safe:h-[calc(100svh-4rem)] md:motion-safe:flex-col md:motion-safe:justify-center md:motion-safe:py-0"
        ref={pin}
      >
        <SplitRow
          className="mx-auto mb-12 w-full max-w-7xl px-4"
          id="shades-title"
          title={`${shades.length} shades, one velvet finish`}
        >
          From soft nudes to deep wines. Pick a shade to see it up close.
        </SplitRow>

        <ul
          className="flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-4 [scrollbar-width:none] md:gap-6 md:px-[max(1rem,calc((100vw-80rem)/2+1rem))] md:motion-safe:snap-none md:motion-safe:overflow-visible"
          ref={track}
        >
          {shades.map((shade) => (
            <li
              className="w-[72vw] shrink-0 snap-start sm:w-[42vw] md:w-[min(19rem,32svh)]"
              key={shade.slug}
            >
              <Link
                className="group block"
                data-roll
                href={shadePath(shade.slug)}
              >
                <AspectRatio
                  className="overflow-hidden rounded-xl"
                  ratio={3 / 4}
                  style={{ backgroundColor: shade.color }}
                >
                  {/* Soft velvet sheen and pigment grain over the colour. */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-[radial-gradient(120%_80%_at_25%_15%,rgb(255_255_255/0.2),transparent_55%)]"
                  />
                  <div
                    aria-hidden="true"
                    className="stage-grain absolute inset-0"
                  />
                </AspectRatio>
                <div className="mt-4 flex items-baseline justify-between gap-3">
                  <div>
                    <p className="font-heading text-2xl tracking-tight">
                      <RollText>{shade.name}</RollText>
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {shade.family}
                    </p>
                  </div>
                  <p className="text-sm">{formatInr(hydravelvet.priceInr)}</p>
                </div>
              </Link>
            </li>
          ))}
          <li className="flex w-[72vw] shrink-0 snap-start flex-col justify-center gap-6 sm:w-[42vw] md:w-[min(19rem,32svh)]">
            <p className="font-heading text-3xl tracking-tight">
              See every shade up close, with its price and how to order.
            </p>
            <div>
              <CtaLink href="/hydravelvet">Shop all {shades.length}</CtaLink>
            </div>
          </li>
        </ul>
      </div>
    </section>
  );
}
