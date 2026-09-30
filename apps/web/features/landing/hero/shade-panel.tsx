"use client";

import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/primitives/radio-group";
import { cn } from "@/lib/utils";
import Link from "next/link";

import { BuyLink } from "@/components/product/buy-link";
import { hydravelvet, shadePath, shades } from "@/content/hydravelvet";
import { formatInr } from "@/lib/format";

import { pickShade } from "../shade/shade-pick";
import { useSelectedShade } from "../shade/shade-store";

/**
 * Pick a shade, see it on the 3D bullet, and order it. It shares the picked
 * shade with the stage's swatch tray, so both always agree. A shadcn
 * RadioGroup of colour swatches; on phones they scroll sideways in one row.
 */
export function ShadePanel({ className }: { className?: string }) {
  const selected = useSelectedShade();

  return (
    <div className={cn("min-w-0", className)}>
      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="text-rose-gold-light text-sm">{selected.family}</p>
          <p className="truncate font-heading text-4xl md:text-5xl">
            {selected.name}
          </p>
        </div>
        <p className="shrink-0 font-heading text-3xl">
          {formatInr(hydravelvet.priceInr)}
        </p>
      </div>

      <RadioGroup
        aria-label="Pick a shade"
        className="-mx-4 mt-5 flex snap-x scroll-px-4 gap-2.5 overflow-x-auto px-4 pt-1 pb-2 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-6 md:overflow-visible md:px-0"
        onValueChange={pickShade}
        value={selected.slug}
      >
        {shades.map((shade) => (
          <RadioGroupItem
            aria-label={shade.name}
            className="size-11 snap-start border-0 ring-1 ring-white/15 ring-offset-2 ring-offset-noir-deep transition-shadow after:hidden focus-visible:ring-2 focus-visible:ring-rose-gold data-checked:ring-2 data-checked:ring-rose-gold-light md:size-10 [&_[data-slot=radio-group-indicator]]:size-full [&_[data-slot=radio-group-indicator]_span]:bg-porcelain"
            key={shade.slug}
            style={{ backgroundColor: shade.color }}
            value={shade.slug}
          />
        ))}
      </RadioGroup>

      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
        <BuyLink shade={selected} />
        <Link
          className="text-muted-foreground text-sm underline underline-offset-4 hover:text-foreground"
          href={shadePath(selected.slug)}
        >
          About {selected.name}
        </Link>
      </div>
    </div>
  );
}
