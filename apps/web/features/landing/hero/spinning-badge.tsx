"use client";

import { cn } from "@/lib/utils";
import { useId } from "react";

import { ShadeBullet } from "@/components/product/shade-bullet";

import { useSelectedShade } from "../shade/shade-store";

/** Circumference of the text circle (r = 38 in a 100-unit box). */
const CIRCUMFERENCE = 2 * Math.PI * 38;

/**
 * A round sticker: `text` set on a circle in the display italic, turning
 * slowly (a CSS animation, still with reduced motion) around a bullet in the
 * picked shade. It turns faster while hovered. Decorative: whatever it says
 * should also be said on the page.
 */
export function SpinningBadge({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const id = useId();
  const shade = useSelectedShade();

  return (
    <div
      aria-hidden="true"
      className={cn(
        "group relative grid size-32 place-items-center",
        className,
      )}
    >
      <svg
        aria-hidden="true"
        className="absolute inset-0 size-full motion-safe:animate-[spin_26s_linear_infinite] motion-safe:group-hover:[animation-duration:7s]"
        viewBox="0 0 100 100"
      >
        <path
          d="M 50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0"
          fill="none"
          id={id}
        />
        <text className="fill-current font-heading text-[10.5px] italic">
          <textPath
            href={`#${id}`}
            lengthAdjust="spacing"
            textLength={CIRCUMFERENCE - 2}
          >
            {text}
          </textPath>
        </text>
      </svg>
      <ShadeBullet
        className="h-10 w-4 brightness-125 transition-[background-color] duration-700"
        color={shade.color}
      />
    </div>
  );
}
