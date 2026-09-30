"use client";

import { Button } from "@/components/primitives/button";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/primitives/radio-group";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/primitives/tooltip";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/icons";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";

import { shadeBulletClass } from "@/components/product/shade-bullet";
import { shades } from "@/content/hydravelvet";
import { prefersReducedMotion } from "@/lib/gsap";

import { pickShade } from "../shade/shade-pick";
import { useSelectedShade } from "../shade/shade-store";

/**
 * Every shade as a lipstick bullet standing in a row, like a tester tray;
 * the picked one is twisted all the way up. A shadcn RadioGroup (Base UI)
 * gives the radio semantics and arrow-key navigation; each item is skinned
 * as a bullet. Hovering one shows its name (pointer devices); on phones the
 * tray scrolls sideways.
 */
export function ShadeDock({ className }: { className?: string }) {
  const selected = useSelectedShade();
  const tray = useRef<HTMLElement>(null);
  const index = shades.findIndex((shade) => shade.slug === selected.slug);

  // Keep the picked bullet centred when the tray is scrolling (phones).
  // Only the tray scrolls: scrollIntoView would also scroll the stage
  // around it, which clips its overflow, and shift the whole hero sideways.
  useEffect(() => {
    const scroller = tray.current;
    const item = scroller?.querySelector<HTMLElement>(
      `[data-dock-item="${selected.slug}"]`,
    );
    if (!(scroller && item)) return;
    const box = scroller.getBoundingClientRect();
    const target = item.getBoundingClientRect();
    scroller.scrollTo({
      left:
        scroller.scrollLeft +
        (target.left - box.left) -
        (box.width - target.width) / 2,
      behavior: prefersReducedMotion() ? "instant" : "smooth",
    });
  }, [selected.slug]);

  /** Steps to the previous or next shade, wrapping round. */
  const step = (by: number, button: HTMLElement) => {
    const next = shades.at((index + by) % shades.length) ?? selected;
    pickShade(next.slug, { trigger: button });
  };

  const arrow =
    "shrink-0 rounded-full text-porcelain hover:bg-white/10 hover:text-porcelain md:hidden";

  return (
    <div className={cn("flex min-w-0 items-center gap-1", className)}>
      {/* On phones the tray scrolls sideways between two arrows that step
          through the shades; the region itself also takes focus so it can
          be scrolled from the keyboard. */}
      <Button
        aria-label="Previous shade"
        className={arrow}
        onClick={(event) => step(-1, event.currentTarget)}
        size="icon"
        variant="ghost"
      >
        <ChevronLeftIcon aria-hidden="true" className="size-5" />
      </Button>
      <section
        aria-label="Shades"
        className="min-w-0 flex-1 overflow-x-auto rounded-full [scrollbar-width:none] md:overflow-visible"
        ref={tray}
        // biome-ignore lint/a11y/noNoninteractiveTabindex: a scrolling region must be reachable by keyboard
        tabIndex={0}
      >
        <RadioGroup
          aria-label="Pick a shade"
          className="mx-auto flex w-max items-end gap-3 rounded-full bg-black/30 px-7 pt-5 pb-3.5 ring-1 ring-white/15 sm:gap-4"
          onValueChange={pickShade}
          value={selected.slug}
        >
          {shades.map((shade) => {
            const isSelected = shade.slug === selected.slug;
            return (
              <div
                className="group relative flex flex-col items-center gap-2"
                data-dock-item={shade.slug}
                key={shade.slug}
              >
                {/* The focus outline sits on a wrapper: the bullet's
                    clip-path would cut it off. */}
                <span className="block rounded-[3px] outline-offset-4 group-has-focus-visible:outline-2 group-has-focus-visible:outline-rose-gold-light group-has-focus-visible:outline-solid">
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <RadioGroupItem
                          aria-label={shade.name}
                          className={cn(
                            shadeBulletClass,
                            "aspect-auto h-10 w-4 origin-bottom rounded-t-none border-0 brightness-125 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] after:hidden focus-visible:ring-0 sm:h-11 sm:w-[1.15rem] [&_[data-slot=radio-group-indicator]]:hidden",
                            // The picked shade is twisted all the way up.
                            isSelected
                              ? "scale-y-100"
                              : "scale-y-[0.62] group-hover:scale-y-[0.8]",
                          )}
                          style={{ backgroundColor: shade.color }}
                          value={shade.slug}
                        />
                      }
                    />
                    <TooltipContent sideOffset={10}>
                      {shade.name}
                    </TooltipContent>
                  </Tooltip>
                </span>
                <span
                  aria-hidden="true"
                  className={cn(
                    "h-px w-3 bg-rose-gold-light transition-opacity",
                    !isSelected && "opacity-0",
                  )}
                />
              </div>
            );
          })}
        </RadioGroup>
      </section>
      <Button
        aria-label="Next shade"
        className={arrow}
        onClick={(event) => step(1, event.currentTarget)}
        size="icon"
        variant="ghost"
      >
        <ChevronRightIcon aria-hidden="true" className="size-5" />
      </Button>
    </div>
  );
}
