import Link from "next/link";

import { RiseIn } from "@/components/motion/rise-in";
import { type ShadeSlug, shadePath, shades } from "@/content/hydravelvet";

/**
 * A full-bleed band of every shade's colour. Each column links to its shade
 * page; the name appears on hover or keyboard focus. On scroll the colours
 * rise into place one after another.
 */
export function ShadeBand({ current }: { current?: ShadeSlug }) {
  return (
    <RiseIn>
      <ul className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-12">
        {shades.map((shade) => (
          <li className="relative" key={shade.slug}>
            <span
              aria-hidden="true"
              className="absolute inset-0 motion-safe:will-change-transform"
              data-rise
              style={{ backgroundColor: shade.color }}
            />
            <Link
              aria-current={shade.slug === current ? "page" : undefined}
              className="group relative flex h-40 items-end p-3 text-white outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-inset sm:h-56 lg:h-80"
              href={shadePath(shade.slug)}
            >
              <span className="font-heading text-lg leading-tight transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100 group-aria-[current=page]:opacity-100 lg:opacity-0">
                {shade.name}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </RiseIn>
  );
}
