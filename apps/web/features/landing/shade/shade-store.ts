"use client";

import { useSyncExternalStore } from "react";

import { defaultShade, type Shade } from "@/content/hydravelvet";

/*
 * The shade a visitor has picked on the home page. Two pickers read and
 * write it (the swatch dock on the stage and the shade panel at the end of
 * the story), and the stage colour, the 3D bullet and the section headings
 * all follow it. It lives outside React so the scene and GSAP code can
 * subscribe without re-rendering anything.
 */

/** Where a pick came from, in viewport pixels, so the colour can flood out from it. */
export type PickOrigin = { x: number; y: number };

type Pick = { shade: Shade; origin: PickOrigin | undefined };

let current: Pick = { shade: defaultShade, origin: undefined };
const listeners = new Set<(pick: Pick) => void>();

export function selectShade(shade: Shade, origin?: PickOrigin) {
  if (shade.slug === current.shade.slug) return;
  current = { shade, origin };
  // Section headings print in the picked shade (see `--shade` in globals.css).
  document.documentElement.style.setProperty("--shade", shade.color);
  for (const listener of listeners) listener(current);
}

/**
 * Runs `onPick` after every new pick, with where it came from. For effects
 * (colour floods, repainting the bullet).
 */
export function onShadePick(onPick: (pick: Pick) => void): () => void {
  listeners.add(onPick);
  return () => {
    listeners.delete(onPick);
  };
}

/** The picked shade now, for event handlers (render with the hook). */
export const getSelectedShade = () => current.shade;

/** The picked shade, for rendering. */
export function useSelectedShade(): Shade {
  return useSyncExternalStore(
    onShadePick,
    getSelectedShade,
    () => defaultShade,
  );
}
