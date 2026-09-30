"use client";

import { cn } from "@/lib/utils";
import { type CSSProperties, useEffect, useRef } from "react";

import { hydravelvet } from "@/content/hydravelvet";
import { formatIndex } from "@/lib/format";
import { gsap } from "@/lib/gsap";

import { materialAnchors, onMaterialAnchors } from "../scene/lipstick-state";

/** Frame corners: a small diamond at each. */
const corners = [
  "top-0 left-0 -translate-1/2",
  "top-0 right-0 translate-x-1/2 -translate-y-1/2",
  "right-0 bottom-0 translate-1/2",
  "bottom-0 left-0 -translate-x-1/2 translate-y-1/2",
];

/**
 * The open lipstick's materials, drawn over the stage: a hairline
 * rose-gold rectangle around the lipstick, and from it a leader line to
 * each part's material, alternating sides, bullet to base. It is placed
 * from the 3D model's projection each frame (`materialAnchors`), so it
 * hugs the lipstick at any screen size; the hero's scroll timeline draws
 * it (see `data-material-*`). Hidden with reduced motion, where the
 * materials are listed with the rest of the story instead.
 */
export function MaterialFrame({ className }: { className?: string }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(
    () =>
      onMaterialAnchors(() => {
        const element = root.current;
        if (!element) return;
        const { left, right, top, bottom, parts } = materialAnchors;
        element.style.setProperty("--fl", `${left.toFixed(1)}px`);
        element.style.setProperty("--fr", `${right.toFixed(1)}px`);
        element.style.setProperty("--ft", `${top.toFixed(1)}px`);
        element.style.setProperty("--fb", `${bottom.toFixed(1)}px`);
        parts.forEach((y, index) => {
          element.style.setProperty(`--y${index}`, `${y.toFixed(1)}px`);
        });
      }),
    [],
  );

  return (
    <div
      className={cn(
        "pointer-events-none invisible absolute inset-0 [--gap:clamp(0.75rem,3.5vw,3.5rem)] [--pad:clamp(0.6rem,1.4vw,1.25rem)] motion-reduce:hidden",
        className,
      )}
      data-materials
      ref={root}
    >
      {/* The frame, drawn edge by edge. */}
      <div
        className="absolute"
        style={{
          left: "calc(var(--fl) - var(--pad))",
          top: "calc(var(--ft) - var(--pad))",
          width: "calc(var(--fr) - var(--fl) + 2 * var(--pad))",
          height: "calc(var(--fb) - var(--ft) + 2 * var(--pad))",
        }}
      >
        <span
          className="absolute inset-x-0 top-0 h-px origin-left bg-rose-gold-light/80"
          data-material-edge="top"
        />
        <span
          className="absolute inset-y-0 right-0 w-px origin-top bg-rose-gold-light/80"
          data-material-edge="right"
        />
        <span
          className="absolute inset-x-0 bottom-0 h-px origin-right bg-rose-gold-light/80"
          data-material-edge="bottom"
        />
        <span
          className="absolute inset-y-0 left-0 w-px origin-bottom bg-rose-gold-light/80"
          data-material-edge="left"
        />
        {corners.map((corner) => (
          <span
            className={cn(
              "absolute size-1.5 rotate-45 bg-rose-gold-light",
              corner,
            )}
            data-material-corner
            key={corner}
          />
        ))}
        <p
          className="absolute top-full left-0 mt-2.5 whitespace-nowrap text-[0.625rem] text-porcelain/60 uppercase tracking-[0.32em] sm:top-auto sm:bottom-full sm:mt-0 sm:mb-2.5"
          data-material-corner
        >
          What it&apos;s made of
        </p>
      </div>

      <ul>
        {hydravelvet.materials.map((item, index) => {
          const onLeft = index % 2 === 0;
          return (
            <li
              className={cn(
                "absolute flex -translate-y-1/2 items-center",
                onLeft && "flex-row-reverse",
              )}
              data-material={onLeft ? "left" : "right"}
              key={item.part}
              style={
                {
                  top: `var(--y${index})`,
                  ...(onLeft
                    ? { right: "calc(100% - var(--fl) + var(--pad))" }
                    : { left: "calc(var(--fr) + var(--pad))" }),
                } as CSSProperties
              }
            >
              {/* The leader, from the frame out to the label. */}
              <span
                aria-hidden="true"
                className={cn(
                  "relative h-px w-(--gap) shrink-0 bg-rose-gold-light/70",
                  onLeft ? "origin-right" : "origin-left",
                )}
                data-material-leader
              >
                <span
                  className={cn(
                    "absolute top-1/2 size-1 -translate-y-1/2 rounded-full bg-rose-gold-light",
                    onLeft ? "-right-0.5" : "-left-0.5",
                  )}
                />
              </span>
              <div
                className={cn("px-2.5", onLeft ? "text-right" : "text-left")}
                data-material-text
                style={{
                  width: onLeft
                    ? "min(15rem, calc(var(--fl) - var(--pad) - var(--gap) - 0.75rem))"
                    : "min(15rem, calc(100vw - var(--fr) - var(--pad) - var(--gap) - 0.75rem))",
                }}
              >
                <p className="whitespace-nowrap text-[0.625rem] text-rose-gold-light uppercase tracking-[0.18em] sm:tracking-[0.24em]">
                  <span className="text-porcelain/45 tabular-nums">
                    {formatIndex(index + 1)}
                  </span>{" "}
                  {item.part}
                </p>
                <p className="mt-1 font-heading text-[clamp(0.95rem,0.6rem+1.1vw,1.45rem)] text-porcelain leading-tight">
                  {item.material}
                </p>
                <p className="mt-1 hidden text-[clamp(0.7rem,0.62rem+0.3vw,0.85rem)] text-porcelain/60 leading-snug sm:block">
                  {item.detail}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/**
 * Adds the frame to the hero's scroll timeline at `at`: its edges trace
 * round clockwise and the corners pop in, then a leader runs out to each
 * material and its label slides in, bullet to base; 1.3 later it clears.
 */
export function drawMaterialFrame(
  timeline: gsap.core.Timeline,
  frame: Element,
  at: number,
) {
  const q = (selector: string) =>
    gsap.utils.toArray<HTMLElement>(selector, frame);

  timeline.set(frame, { autoAlpha: 1 }, at);
  (["top", "right", "bottom", "left"] as const).forEach((side, index) => {
    const axis = side === "top" || side === "bottom" ? "scaleX" : "scaleY";
    timeline.fromTo(
      q(`[data-material-edge=${side}]`),
      { [axis]: 0 },
      { [axis]: 1, duration: 0.18 },
      at + index * 0.18,
    );
  });
  timeline.fromTo(
    q("[data-material-corner]"),
    { autoAlpha: 0, scale: 0 },
    { autoAlpha: 1, scale: 1, duration: 0.2, stagger: 0.04 },
    at + 0.6,
  );

  q("[data-material]").forEach((item, index) => {
    const start = at + 0.35 + index * 0.16;
    const fromLeft = item.dataset.material === "left";
    timeline
      .fromTo(
        item.querySelector("[data-material-leader]"),
        { scaleX: 0 },
        { scaleX: 1, duration: 0.2, ease: "power2.out" },
        start,
      )
      .fromTo(
        item.querySelector("[data-material-text]"),
        { autoAlpha: 0, x: fromLeft ? 14 : -14 },
        { autoAlpha: 1, x: 0, duration: 0.25, ease: "power2.out" },
        start + 0.12,
      );
  });

  timeline.to(frame, { autoAlpha: 0, duration: 0.3 }, at + 1.3);
}
