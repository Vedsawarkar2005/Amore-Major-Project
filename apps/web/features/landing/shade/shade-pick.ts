"use client";

import { getShade } from "@/content/hydravelvet";

import { selectShade } from "./shade-store";

/** The parts of a Base UI change event (e.g. RadioGroup's) this reads. */
type ChangeDetails = {
  trigger?: Element | undefined;
  event?: Event | undefined;
};

/**
 * `onValueChange` for a shadcn RadioGroup of shades (values are slugs):
 * picks the shade, flooding the colour out from the item that was chosen.
 */
export function pickShade(slug: unknown, details?: ChangeDetails) {
  const shade = getShade(String(slug));
  if (!shade) return;
  const target = details?.event?.target;
  const element =
    details?.trigger ?? (target instanceof Element ? target : undefined);
  const box = element?.getBoundingClientRect();
  selectShade(
    shade,
    box
      ? { x: box.left + box.width / 2, y: box.top + box.height / 2 }
      : undefined,
  );
}
