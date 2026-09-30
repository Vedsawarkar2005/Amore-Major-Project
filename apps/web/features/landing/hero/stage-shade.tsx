"use client";

import { cn } from "@/lib/utils";
import {
  type CSSProperties,
  type RefObject,
  useLayoutEffect,
  useRef,
} from "react";

import { CtaLink } from "@/components/page/cta-link";
import {
  defaultShade,
  hydravelvet,
  type Shade,
  shadePath,
  shades,
} from "@/content/hydravelvet";
import { formatInr } from "@/lib/format";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";

import {
  bulletColor,
  hexToRgb,
  invalidateScene,
} from "../scene/lipstick-state";
import {
  onShadePick,
  type PickOrigin,
  useSelectedShade,
} from "../shade/shade-store";

function paintBullet(shade: Shade, duration: number) {
  gsap.to(bulletColor, {
    ...hexToRgb(shade.color),
    duration,
    ease: "power2.out",
    onUpdate: invalidateScene,
    overwrite: true,
  });
}

/**
 * The stage's colour: the picked shade, lit from the centre. A new pick
 * floods across the stage as a growing circle from the swatch that was
 * clicked, and repaints the 3D bullet to match. With reduced motion the
 * colour simply changes.
 */
export function StageBackdrop() {
  const base = useRef<HTMLDivElement>(null);
  const flood = useRef<HTMLDivElement>(null);

  useGSAP((_context, contextSafe) => {
    const baseLayer = base.current;
    const floodLayer = flood.current;
    if (!(baseLayer && floodLayer && contextSafe)) return;

    paintBullet(defaultShade, 0);
    let running: gsap.core.Tween | undefined;

    const floodTo = (color: string, origin: PickOrigin | undefined) => {
      // A pick mid-flood: land the previous colour first.
      running?.progress(1);
      if (!origin || prefersReducedMotion()) {
        baseLayer.style.setProperty("--c", color);
        return;
      }

      const box = baseLayer.getBoundingClientRect();
      const x = origin.x - box.left;
      const y = origin.y - box.top;
      const radius = Math.hypot(
        Math.max(x, box.width - x),
        Math.max(y, box.height - y),
      );
      floodLayer.style.setProperty("--c", color);
      running = gsap.fromTo(
        floodLayer,
        { autoAlpha: 1, clipPath: `circle(0px at ${x}px ${y}px)` },
        {
          clipPath: `circle(${radius}px at ${x}px ${y}px)`,
          duration: 1.1,
          ease: "power3.inOut",
          onComplete: () => {
            baseLayer.style.setProperty("--c", color);
            gsap.set(floodLayer, { autoAlpha: 0, clearProps: "clipPath" });
            running = undefined;
          },
        },
      );
    };

    return onShadePick(
      contextSafe(({ shade, origin }) => {
        paintBullet(shade, prefersReducedMotion() ? 0 : 0.9);
        floodTo(shade.color, origin);
      }),
    );
  });

  const style = { "--c": defaultShade.color } as CSSProperties;
  return (
    <div aria-hidden="true" className="absolute inset-0">
      <div
        className="stage-backdrop absolute inset-0"
        ref={base}
        style={style}
      />
      <div
        className="stage-backdrop invisible absolute inset-0 will-change-[clip-path]"
        ref={flood}
        style={style}
      />
    </div>
  );
}

/**
 * Rough advance of a letter in the stage name, in ems (the brand heading
 * face's italic, letters as inline blocks with their masks' padding). Only
 * a first guess, for the server-rendered page: once fonts are in,
 * `useFitToStage` measures the real name and corrects the size.
 */
const LETTER_EM = 0.53;

/** How much of the stage's width the name spans. */
const SPAN_WIDE = 0.8;
const SPAN_NARROW = 0.84;

/**
 * Estimated font sizes that let a name span most of the stage: all of it on
 * one line on landscape screens, its longest word on portrait ones (one
 * word per line).
 */
function fitName(name: string) {
  const longestWord = Math.max(...name.split(" ").map((word) => word.length));
  return {
    "--fit-wide": `${((SPAN_WIDE * 100) / (name.length * LETTER_EM)).toFixed(2)}vw`,
    "--fit-narrow": `${((SPAN_NARROW * 100) / (longestWord * LETTER_EM)).toFixed(2)}vw`,
  } as CSSProperties;
}

/**
 * Scales the name (through `--fit-scale`, see `text-stage`) so it spans
 * SPAN_WIDE of the stage on landscape screens, or its longest word spans
 * SPAN_NARROW on portrait ones, whatever the face's real letter widths.
 * Re-measures when the name, the stage size or the fonts change.
 */
function useFitToStage(
  name: RefObject<HTMLParagraphElement | null>,
  key: string,
) {
  // biome-ignore lint/correctness/useExhaustiveDependencies: `key` (the shade) changes the text to measure
  useLayoutEffect(() => {
    const element = name.current;
    const stage = element?.parentElement;
    if (!(element && stage)) return;

    const fit = () => {
      const wide = window.matchMedia(
        "(min-width: 48rem) and (orientation: landscape)",
      ).matches;
      const target = stage.clientWidth * (wide ? SPAN_WIDE : SPAN_NARROW);
      const current =
        Number(element.style.getPropertyValue("--fit-scale")) || 1;
      const width = element.offsetWidth;
      if (!width) return;
      const next = current * (target / width);
      if (Math.abs(next - current) > 0.005) {
        element.style.setProperty("--fit-scale", next.toFixed(3));
      }
    };

    fit();
    const resize = new ResizeObserver(fit);
    resize.observe(stage);
    document.fonts.ready.then(fit);
    return () => resize.disconnect();
  }, [key]);
}

/**
 * The picked shade's name, poster-sized behind the lipstick. Each new pick
 * raises the new name letter by letter out of its word masks; the hero's
 * entrance does the same for the first name (see hero-text.ts). Decorative:
 * the pickers name the shade for assistive technology.
 */
export function StageName({ className }: { className?: string }) {
  const shade = useSelectedShade();
  const root = useRef<HTMLParagraphElement>(null);
  const shown = useRef(shade.slug);

  useFitToStage(root, shade.slug);

  useGSAP(
    () => {
      // Mounting (and React's development remount) shows the name as is.
      if (shown.current === shade.slug) return;
      shown.current = shade.slug;
      if (prefersReducedMotion()) return;
      gsap.from(gsap.utils.toArray("[data-char]", root.current), {
        yPercent: 115,
        duration: 1,
        ease: "expo.out",
        stagger: 0.028,
        delay: 0.15,
      });
    },
    { dependencies: [shade.slug], scope: root },
  );

  return (
    <p
      aria-hidden="true"
      className={cn(
        "flex w-max flex-col items-center text-stage md:landscape:flex-row md:landscape:gap-[0.2em]",
        className,
      )}
      data-stage-name
      ref={root}
      style={fitName(shade.name)}
    >
      {shade.name.split(" ").map((word) => (
        <span
          className="inline-block overflow-clip px-[0.08em] [overflow-clip-margin:0.22em]"
          key={`${shade.slug}-${word}`}
        >
          {Array.from(word, (letter, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: letters of a fixed word
            <span className="inline-block" data-char key={index}>
              {letter}
            </span>
          ))}
        </span>
      ))}
    </p>
  );
}

/**
 * The price and links for the picked shade. On phones it's one compact row
 * (the shade's link and its price); on wide screens the price sits above
 * both links.
 */
export function StageDetails({ className }: { className?: string }) {
  const shade = useSelectedShade();

  return (
    <div
      className={cn(
        "flex items-center gap-4 md:landscape:flex-col md:landscape:items-start",
        className,
      )}
    >
      <p className="order-last flex items-baseline gap-3 md:landscape:order-0">
        <span className="font-heading text-3xl leading-none md:landscape:text-4xl">
          {formatInr(hydravelvet.priceInr)}
        </span>
        <span className="hidden text-porcelain/70 text-sm md:landscape:inline">
          inclusive of all taxes
        </span>
      </p>
      <div className="flex gap-2">
        <CtaLink
          className="bg-porcelain text-ink hover:bg-white"
          href={shadePath(shade.slug)}
        >
          Shop {shade.name}
        </CtaLink>
        <CtaLink
          className="hidden border-white/25 bg-transparent text-porcelain hover:bg-white/10 md:landscape:inline-flex"
          href="#shades"
          variant="outline"
        >
          All {shades.length} shades
        </CtaLink>
      </div>
    </div>
  );
}
