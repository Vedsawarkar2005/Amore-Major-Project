"use client";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/primitives/card";
import { cn } from "@/lib/utils";
import type { ComponentType, PointerEvent } from "react";

import { ShadeBullet } from "@/components/product/shade-bullet";
import { formatIndex } from "@/lib/format";
import type { gsap } from "@/lib/gsap";

import { Avocado, Blueberry, OilDrop } from "../ingredients/ingredient-art";
import { useSelectedShade } from "../shade/shade-store";
import { riseCardTitle } from "./hero-text";

/** The art in each benefit's medallion, in benefit order. */
const medallionArt: (ComponentType<{ className?: string }> | "bullet")[] = [
  Blueberry,
  Avocado,
  OilDrop,
  "bullet",
];

/** Tilts the card toward the pointer and moves its glare (mouse only). */
function lean(event: PointerEvent<HTMLElement>) {
  if (event.pointerType !== "mouse") return;
  const card = event.currentTarget;
  const box = card.getBoundingClientRect();
  const x = (event.clientX - box.left) / box.width;
  const y = (event.clientY - box.top) / box.height;
  card.style.setProperty("--mx", `${(x * 100).toFixed(1)}%`);
  card.style.setProperty("--my", `${(y * 100).toFixed(1)}%`);
  card.style.setProperty("--ry", `${((x - 0.5) * 10).toFixed(2)}deg`);
  card.style.setProperty("--rx", `${((0.5 - y) * 8).toFixed(2)}deg`);
}

function settle(event: PointerEvent<HTMLElement>) {
  event.currentTarget.style.setProperty("--rx", "0deg");
  event.currentTarget.style.setProperty("--ry", "0deg");
}

type BenefitCardProps = {
  title: string;
  body: string;
  index: number;
  total: number;
};

/**
 * One benefit beside the 3D lipstick: frosted glass with a rose-gold light
 * running round its edge, the ingredient in a medallion that drops in as the
 * card arrives, its place in the story, and a glare
 * that follows the mouse as the card tilts toward it. The hero's scroll
 * timeline drives the entrance (see `data-benefit-*`).
 */
export function BenefitCard({ title, body, index, total }: BenefitCardProps) {
  const shade = useSelectedShade();
  const Art = medallionArt[index % medallionArt.length];

  return (
    <div className="relative">
      <Card
        className="benefit-card pointer-events-auto gap-4 rounded-2xl bg-transparent shadow-none ring-0 [--card-spacing:--spacing(5)]"
        onPointerLeave={settle}
        onPointerMove={lean}
      >
        <div className="flex items-center justify-between gap-4 px-(--card-spacing)">
          <div
            className="relative grid size-16 shrink-0 place-items-center rounded-full bg-[radial-gradient(circle_at_35%_30%,rgb(255_255_255/0.22),rgb(243_212_196/0.08)_55%,transparent_75%)] ring-1 ring-white/15"
            data-benefit-medallion
          >
            {Art === "bullet" ? (
              <ShadeBullet
                className="aspect-[5/12] w-4 brightness-125"
                color={shade.color}
              />
            ) : Art ? (
              <Art className="w-10 drop-shadow-[0_6px_10px_rgb(0_0_0/0.45)]" />
            ) : null}
          </div>
          <p className="font-heading text-porcelain/85 tabular-nums">
            <span className="text-4xl leading-none">
              {formatIndex(index + 1)}
            </span>
            <span className="ml-1 text-porcelain/45 text-sm">
              / {formatIndex(total)}
            </span>
          </p>
        </div>
        <CardHeader>
          <CardTitle className="font-normal text-2xl normal-case tracking-tight">
            <h2>{title}</h2>
          </CardTitle>
          <CardDescription className="text-base text-porcelain/70">
            {body}
          </CardDescription>
        </CardHeader>
        {/* The story's progress: this card's segment fills as it arrives. */}
        <div aria-hidden="true" className="flex gap-1.5 px-(--card-spacing)">
          {Array.from({ length: total }, (_, step) => (
            <span
              className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/12"
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed list
              key={step}
            >
              <span
                className={cn(
                  "block h-full origin-left bg-linear-to-r from-rose-gold to-rose-gold-light",
                  step > index && "scale-x-0",
                )}
                data-benefit-progress={step === index ? "" : undefined}
              />
            </span>
          ))}
        </div>
      </Card>
    </div>
  );
}

/**
 * Adds a card's own entrance details to the hero's scroll timeline at `at`
 * (when the card fades in): its title rises word by word, the medallion
 * drops in, and its segment of the progress line fills.
 */
export function revealBenefitCard(
  timeline: gsap.core.Timeline,
  card: Element,
  at: number,
) {
  const heading = card.querySelector("h2");
  if (heading) riseCardTitle(timeline, heading, at);
  timeline
    .from(
      card.querySelector("[data-benefit-medallion]"),
      { scale: 0.4, rotate: -25, duration: 0.5, ease: "back.out(2)" },
      at,
    )
    .fromTo(
      card.querySelector("[data-benefit-progress]"),
      { scaleX: 0 },
      { scaleX: 1, duration: 0.7, ease: "power2.out" },
      at + 0.1,
    );
}
