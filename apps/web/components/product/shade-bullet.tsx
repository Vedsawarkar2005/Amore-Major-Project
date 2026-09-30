import { cn } from "@/lib/utils";
import type { CSSProperties } from "react";

type ShadeBulletProps = {
  color: string;
  className?: string;
  style?: CSSProperties;
};

/**
 * The bullet's look (slanted cut, lacquer highlight) for elements that must
 * be something else too, e.g. a radio item in the swatch tray. Set the
 * shade with `backgroundColor`.
 */
export const shadeBulletClass =
  "block rounded-b-[0.2em] bg-[linear-gradient(90deg,rgb(0_0_0/0.38),transparent_28%,rgb(255_255_255/0.32)_40%,transparent_56%,rgb(0_0_0/0.32))] [clip-path:polygon(0_24%,100%_0,100%_100%,0_100%)]";

/**
 * A lipstick bullet drawn in CSS: a column of the shade's colour with the
 * slanted cut at the top and a lacquer highlight running down one side.
 * Size it with `className`; it's decorative, so it's hidden from assistive
 * technology.
 */
export function ShadeBullet({ color, className, style }: ShadeBulletProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(shadeBulletClass, className)}
      style={{ backgroundColor: color, ...style }}
    />
  );
}
