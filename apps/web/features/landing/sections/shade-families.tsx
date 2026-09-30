"use client";

import Link from "next/link";
import { type PointerEvent, useRef, useState } from "react";

import { RollText } from "@/components/motion/roll-text";
import { SwatchReveal } from "@/components/motion/swatch-reveal";
import { ShadeBullet } from "@/components/product/shade-bullet";
import {
  type ShadeFamily,
  shadeFamilies,
  shadePath,
  shades,
} from "@/content/hydravelvet";
import { gsap, useGSAP } from "@/lib/gsap";

/** Degrees between neighbouring cards in the fan. */
const FAN_STEP = 8;

/**
 * The shades as an index of their four families: each family name set
 * large with its count, and its shades listed as links beneath. On pointer
 * devices a fan of the family's colour cards follows the cursor down the
 * list; everywhere, each row also shows its shades as a row of bullets.
 */
export function ShadeFamilies() {
  const area = useRef<HTMLDivElement>(null);
  const fan = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<ShadeFamily | undefined>();
  const follow = useRef<{
    x: gsap.QuickToFunc;
    y: gsap.QuickToFunc;
  } | null>(null);

  const { contextSafe } = useGSAP(
    () => {
      follow.current = {
        x: gsap.quickTo(fan.current, "x", { duration: 0.6, ease: "power3" }),
        y: gsap.quickTo(fan.current, "y", { duration: 0.6, ease: "power3" }),
      };
    },
    { scope: area },
  );

  const move = contextSafe((event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || !area.current) return;
    const box = area.current.getBoundingClientRect();
    follow.current?.x(event.clientX - box.left);
    follow.current?.y(event.clientY - box.top);
  });

  const show = contextSafe((family: ShadeFamily | undefined) => {
    setActive(family);
    gsap.to(fan.current, {
      autoAlpha: family ? 1 : 0,
      scale: family ? 1 : 0.85,
      duration: 0.35,
      ease: "power2.out",
      overwrite: "auto",
    });
  });

  const cards =
    shadeFamilies.find((family) => family.name === active)?.shades ?? [];

  return (
    <section aria-labelledby="families-title" className="bg-background">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 py-28 md:grid-cols-12 md:gap-8">
        <p className="max-w-xs text-lead text-muted-foreground md:col-span-4 md:pt-4">
          {shades.length} shades in {shadeFamilies.length} families, all in the
          same velvet finish. Start with the family you usually wear.
        </p>

        <div className="md:col-span-8">
          <SwatchReveal>
            <h2 className="text-shade-ink text-title" id="families-title">
              Shop by family
            </h2>
          </SwatchReveal>

          <div
            className="relative mt-12"
            onPointerLeave={() => show(undefined)}
            onPointerMove={move}
            ref={area}
          >
            <ul className="border-border border-t">
              {shadeFamilies.map((family) => (
                <li
                  className="flex flex-col gap-4 border-border border-b py-7 md:flex-row md:items-end md:justify-between md:gap-8"
                  // Hovering a row rolls its family name (see RollText).
                  data-roll
                  key={family.name}
                  onPointerEnter={(event) => {
                    if (event.pointerType === "mouse") show(family.name);
                  }}
                >
                  <div className="flex flex-col gap-3">
                    <h3 className="font-heading text-[clamp(2rem,6vw,5.75rem)] text-shade-ink leading-[0.9]">
                      <RollText className="-my-[0.15em] leading-[1.2]">
                        {family.name}
                      </RollText>
                      <sup className="ml-2 align-super font-sans text-base text-muted-foreground">
                        {family.shades.length}
                      </sup>
                    </h3>
                    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground">
                      {family.shades.map((shade) => (
                        <li key={shade.slug}>
                          <Link
                            className="underline-offset-4 hover:text-foreground hover:underline"
                            href={shadePath(shade.slug)}
                          >
                            {shade.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div aria-hidden="true" className="flex items-end gap-1.5">
                    {family.shades.map((shade) => (
                      <ShadeBullet
                        className="h-9 w-4"
                        color={shade.color}
                        key={shade.slug}
                      />
                    ))}
                  </div>
                </li>
              ))}
            </ul>

            {/* The fan of colour cards that follows the cursor; the cards
                stand on the cursor point and lean out from their base. */}
            <div
              aria-hidden="true"
              className="pointer-events-none invisible absolute top-0 left-0 z-10 hidden md:motion-safe:block"
              ref={fan}
            >
              {cards.map((shade, index) => (
                <div
                  className="absolute bottom-4 left-0 h-44 w-32 origin-bottom -translate-x-1/2 overflow-hidden rounded-md shadow-[0_18px_40px_-12px_rgb(0_0_0/0.45)] ring-1 ring-black/10"
                  key={shade.slug}
                  style={{
                    backgroundColor: shade.color,
                    rotate: `${(index - (cards.length - 1) / 2) * FAN_STEP}deg`,
                  }}
                >
                  <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_25%_15%,rgb(255_255_255/0.22),transparent_55%)]" />
                  <p className="absolute inset-x-3 bottom-3 font-heading text-lg text-porcelain leading-tight">
                    {shade.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
