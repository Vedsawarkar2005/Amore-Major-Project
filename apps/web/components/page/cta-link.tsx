import {
  type Button,
  buttonVariants,
} from "@/components/primitives/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

import { plainText, RollText } from "@/components/motion/roll-text";

type CtaLinkProps = {
  /** An app route, an in-page `#hash` or an external `https:`/`mailto:` URL. */
  href: string;
  children: ReactNode;
  variant?: ComponentProps<typeof Button>["variant"];
  className?: string | undefined;
};

/**
 * A pill-shaped link styled as a button — the site's call-to-action shape.
 * It keeps link semantics (no `role="button"`) because it navigates. A
 * plain-text label rolls over, letter by letter, on hover and focus.
 */
export function CtaLink({
  href,
  children,
  variant = "default",
  className,
}: CtaLinkProps) {
  const pill = cn(
    buttonVariants({ variant }),
    "h-12 rounded-full px-7 text-sm normal-case tracking-normal",
    className,
  );
  const text = plainText(children);
  const label = text === undefined ? children : <RollText>{text}</RollText>;

  // App routes get client navigation and prefetching; hashes and external
  // URLs keep native anchor behaviour.
  if (href.startsWith("/")) {
    return (
      <Link className={pill} data-roll href={href}>
        {label}
      </Link>
    );
  }

  return (
    <a className={pill} data-roll href={href}>
      {label}
    </a>
  );
}
