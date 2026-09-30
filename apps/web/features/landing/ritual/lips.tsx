import { cn } from "@/lib/utils";
import { useId } from "react";

/*
 * Lips in a 400 × 220 box, split at the mouth line so the upper lip can sit
 * a little darker than the lower one, the way light falls on them. The
 * outline and mouth line are separate strokes so they can be drawn on.
 */
const UPPER =
  "M20 110 C60 90 110 48 160 50 C180 51 190 66 200 68 C210 66 220 51 240 50 C290 48 340 90 380 110 C320 114 260 122 200 120 C140 122 80 114 20 110 Z";
const LOWER =
  "M20 110 C80 114 140 122 200 120 C260 122 320 114 380 110 C330 160 260 188 200 188 C140 188 70 160 20 110 Z";
const OUTLINE =
  "M20 110 C60 90 110 48 160 50 C180 51 190 66 200 68 C210 66 220 51 240 50 C290 48 340 90 380 110 C330 160 260 188 200 188 C140 188 70 160 20 110";
const MOUTH = "M20 110 C80 114 140 122 200 120 C260 122 320 114 380 110";

/** Radius that covers the lips from their centre. */
const LIPS_FILL_RADIUS = 200;

/**
 * Lips in the picked shade (`--shade`), with a soft gloss on the lower lip.
 * Parts carry data attributes for animation: `data-lips-fill` (the circle
 * that clips the colour; grow its `r` from 0 to spread it from the centre),
 * `data-lips-outline` and `data-lips-mouth` (strokes to draw on) and
 * `data-lips-gloss` (the highlight). As rendered, the lips are complete.
 * Decorative: hidden from assistive technology.
 */
export function Lips({ className }: { className?: string }) {
  const id = useId();
  const clip = `${id}-clip`;
  const shine = `${id}-shine`;
  const soft = `${id}-soft`;

  return (
    <svg
      aria-hidden="true"
      className={cn("overflow-visible", className)}
      fill="none"
      viewBox="0 0 400 220"
    >
      <defs>
        <clipPath id={clip}>
          <circle cx="200" cy="118" data-lips-fill r={LIPS_FILL_RADIUS} />
        </clipPath>
        <linearGradient id={shine} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="white" stopOpacity="0" />
          <stop offset="0.45" stopColor="white" stopOpacity="0.28" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <filter height="200%" id={soft} width="200%" x="-50%" y="-50%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>

      {/* A faint guide of the lip line, as bare lips before colour. */}
      <path
        className="stroke-current opacity-25"
        d={OUTLINE}
        strokeDasharray="3 7"
        strokeWidth="1.5"
      />

      <g clipPath={`url(#${clip})`}>
        <path className="fill-shade transition-[fill] duration-700" d={LOWER} />
        <path className="fill-shade transition-[fill] duration-700" d={UPPER} />
        {/* Shade the upper lip; light the lower one. */}
        <path className="fill-black/15" d={UPPER} />
        <path d={LOWER} fill={`url(#${shine})`} />
      </g>

      <path
        className="stroke-[color-mix(in_oklab,var(--shade)_62%,black)] transition-[stroke] duration-700"
        d={OUTLINE}
        data-lips-outline
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3"
      />
      <path
        className="stroke-[color-mix(in_oklab,var(--shade)_45%,black)] transition-[stroke] duration-700"
        d={MOUTH}
        data-lips-mouth
        strokeLinecap="round"
        strokeWidth="2.5"
      />
      <ellipse
        cx="186"
        cy="150"
        data-lips-gloss
        fill="white"
        filter={`url(#${soft})`}
        opacity="0.3"
        rx="54"
        ry="9"
      />
    </svg>
  );
}
