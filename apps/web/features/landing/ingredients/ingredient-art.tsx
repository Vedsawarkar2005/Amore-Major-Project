import { type ComponentType, useId } from "react";

import type { IngredientSlug } from "@/content/hydravelvet";

/*
 * Stand-in artwork for the three Hydravelvet ingredients, drawn as inline SVG
 * (no downloads, crisp at any size). They play the role of the transparent
 * PNG cut-outs a photographer would supply. To switch to real photography,
 * replace a component's body with a transparent WebP/AVIF, e.g.
 *   <Image src="/landing/blueberry.webp" alt="" width={400} height={400} />
 * and keep the export name, so nothing else has to change.
 *
 * Every drawing uses a 100 × 100 view box and fills its container's width.
 * Gradient ids come from useId() so several copies can share a page.
 */

type ArtProps = { className?: string };

/** A ripe blueberry: deep indigo skin, dusty bloom and a star-shaped crown. */
export function Blueberry({ className }: ArtProps) {
  const id = useId();
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 100 100">
      <defs>
        <radialGradient cx="36%" cy="32%" id={`${id}skin`} r="70%">
          <stop offset="0" stopColor="#7382c2" />
          <stop offset="0.45" stopColor="#343f73" />
          <stop offset="1" stopColor="#0f1428" />
        </radialGradient>
        {/* The pale, waxy "bloom" real blueberries have. */}
        <radialGradient cx="40%" cy="30%" id={`${id}bloom`} r="60%">
          <stop offset="0" stopColor="#fff" stopOpacity="0.22" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="52" fill={`url(#${id}skin)`} r="40" />
      <circle cx="50" cy="52" fill={`url(#${id}bloom)`} r="40" />
      {/* Crown, seen at three-quarters: five short lobes around a dimple. */}
      <path
        d="M60 20 l3.5 5.5 6.5 -1 -3.5 5.5 4 5 -6.5 .5 -2.5 6 -2.5 -6 -6.5 -.5 4 -5 -3.5 -5.5 6.5 1 Z"
        fill="#161b33"
        stroke="#56608f"
        strokeWidth="0.8"
      />
      <ellipse cx="34" cy="36" fill="#fff" opacity="0.28" rx="7" ry="4.5" />
    </svg>
  );
}

/** A halved avocado: dark skin, butter-yellow flesh and a glossy stone. */
export function Avocado({ className }: ArtProps) {
  const id = useId();
  // One pear outline, reused (scaled) for the skin and the flesh inside it.
  const pear =
    "M50 6 C66 6 72 24 74 38 C84 52 86 70 78 84 C70 96 30 96 22 84 C14 70 16 52 26 38 C28 24 34 6 50 6 Z";
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 100 100">
      <defs>
        <radialGradient cx="50%" cy="62%" id={`${id}flesh`} r="60%">
          <stop offset="0" stopColor="#efe4b4" />
          <stop offset="0.55" stopColor="#cfc98c" />
          <stop offset="1" stopColor="#7f9446" />
        </radialGradient>
        <radialGradient cx="38%" cy="34%" id={`${id}stone`} r="70%">
          <stop offset="0" stopColor="#b77a4d" />
          <stop offset="0.5" stopColor="#6e3d20" />
          <stop offset="1" stopColor="#3a1d0e" />
        </radialGradient>
      </defs>
      <path d={pear} fill="#1d2c14" />
      <path
        d={pear}
        fill={`url(#${id}flesh)`}
        transform="translate(50 58) scale(0.88) translate(-50 -58)"
      />
      <circle cx="50" cy="64" fill={`url(#${id}stone)`} r="15" />
      <ellipse cx="45" cy="58" fill="#fff" opacity="0.3" rx="4.5" ry="3" />
    </svg>
  );
}

/** A drop of golden Vitamin E oil, lit from the top left. */
export function OilDrop({ className }: ArtProps) {
  const id = useId();
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 100 100">
      <defs>
        <radialGradient cx="42%" cy="62%" id={`${id}oil`} r="62%">
          <stop offset="0" stopColor="#ffeab0" />
          <stop offset="0.5" stopColor="#f0b24a" />
          <stop offset="1" stopColor="#a8601a" />
        </radialGradient>
      </defs>
      <path
        d="M50 6 C50 6 80 44 80 64 A30 30 0 0 1 20 64 C20 44 50 6 50 6 Z"
        fill={`url(#${id}oil)`}
        opacity="0.92"
      />
      <ellipse
        cx="38"
        cy="58"
        fill="#fff"
        opacity="0.55"
        rx="5"
        ry="9"
        transform="rotate(20 38 58)"
      />
      {/* A thin rim of light along the lower edge, like light through oil. */}
      <path
        d="M26 72 A26 26 0 0 0 74 72"
        fill="none"
        stroke="#fff3cf"
        strokeLinecap="round"
        strokeOpacity="0.45"
        strokeWidth="1.5"
      />
    </svg>
  );
}

/** Each Hydravelvet ingredient's drawing. */
export const ingredientArt: Record<IngredientSlug, ComponentType<ArtProps>> = {
  "blueberry-butter": Blueberry,
  "avocado-oil": Avocado,
  "vitamin-e": OilDrop,
};
