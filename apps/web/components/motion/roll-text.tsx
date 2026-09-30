import { cn } from "@/lib/utils";
import type { CSSProperties } from "react";

/**
 * A label whose letters roll over, one after another, when the nearest
 * `[data-roll]` ancestor (a link or button) is hovered or focused: each
 * letter slides up and an identical one slides in from below. CSS only (see
 * `.roll-char` in globals.css), so it works in server components.
 *
 * The rolling letters are hidden from assistive technology; a visually
 * hidden copy of the text carries the label.
 */
export function RollText({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  return (
    // `relative` keeps the visually hidden copy (absolutely positioned) inside
    // this label; otherwise it can escape a scrolling row and widen the page.
    <span className={cn("relative inline-flex", className)}>
      <span className="sr-only">{children}</span>
      <span aria-hidden="true" className="roll-row">
        {Array.from(children, (letter, index) => (
          <span
            className="roll-char"
            data-char={letter}
            // biome-ignore lint/suspicious/noArrayIndexKey: letters of a fixed label
            key={index}
            style={{ "--i": index } as CSSProperties}
          >
            {letter}
          </span>
        ))}
      </span>
    </span>
  );
}

/**
 * The text of `children` when it's only strings and numbers (so a label
 * like `Shop {name}` can roll), or undefined when it holds elements.
 */
export function plainText(children: unknown): string | undefined {
  if (typeof children === "string" || typeof children === "number") {
    return String(children);
  }
  if (Array.isArray(children)) {
    const parts = children.map(plainText);
    return parts.every((part) => part !== undefined)
      ? parts.join("")
      : undefined;
  }
  return undefined;
}
