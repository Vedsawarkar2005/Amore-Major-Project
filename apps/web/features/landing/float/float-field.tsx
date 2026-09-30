"use client";

import { cn } from "@/lib/utils";
import { type ComponentType, type CSSProperties, useRef } from "react";

import { ShadeBullet } from "@/components/product/shade-bullet";
import { shades } from "@/content/hydravelvet";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";

import { Avocado, Blueberry, OilDrop } from "../ingredients/ingredient-art";
import { useSelectedShade } from "../shade/shade-store";

const art: Record<
  Exclude<Floater["kind"], "bullet">,
  ComponentType<{ className?: string }>
> = {
  blueberry: Blueberry,
  avocado: Avocado,
  drop: OilDrop,
};

export type Floater = {
  /** An ingredient, or a lipstick bullet. */
  kind: "blueberry" | "avocado" | "drop" | "bullet";
  /** CSS `left` and `top`, usually percentages of the field. */
  left: string;
  top: string;
  /** CSS width; use clamp() or vw so pieces scale with the screen. */
  width: string;
  /**
   * How near the piece is: below 1 it's far (small, soft, slow), above 1
   * near (large, out of focus, fast). Everything that moves scales by it.
   */
  depth: number;
  /** Resting rotation in degrees. */
  tilt: number;
  /** Bullets: a fixed shade by index; without one, the picked shade. */
  shade?: number;
  /** Hide on phones and portrait tablets, where there's less room. */
  wideOnly?: boolean;
};

/** Depth of field: near pieces blur, far pieces soften and dim. */
function focus(depth: number) {
  if (depth >= 1.4) return "blur-[6px]";
  if (depth >= 1.15) return "blur-[2.5px]";
  if (depth <= 0.55) return "blur-[1.5px] opacity-75";
  return undefined;
}

type FloatFieldProps = {
  pieces: readonly Floater[];
  /** Pieces drift by their depth as the field scrolls through the screen. */
  parallax?: boolean;
  className?: string;
};

/**
 * Ingredients and lipstick bullets floating at different depths, the
 * "cut-outs in space" look of product photography. Every piece bobs on its
 * own slow loop and leans away from the pointer by its depth (pointer
 * devices), and with `parallax` drifts as the page scrolls; bullets without
 * a fixed shade wear the picked shade and pop when it changes. Decorative
 * and hidden from assistive technology; with reduced motion the pieces
 * hold still. Place it in a positioned container; it fills it.
 */
export function FloatField({
  pieces,
  parallax = false,
  className,
}: FloatFieldProps) {
  const field = useRef<HTMLDivElement>(null);
  const picked = useSelectedShade();
  const shown = useRef(picked.slug);

  useGSAP(
    () => {
      const element = field.current;
      if (!element) return;

      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        if (parallax) {
          for (const piece of gsap.utils.toArray<HTMLElement>(
            "[data-floater]",
            element,
          )) {
            const depth = Number(piece.dataset.depth);
            gsap.fromTo(
              piece,
              { y: depth * 80 },
              {
                y: depth * -80,
                ease: "none",
                scrollTrigger: {
                  trigger: element,
                  start: "top bottom",
                  end: "bottom top",
                  scrub: 0.8,
                },
              },
            );
          }
        }

        // The lean follows the pointer anywhere over the surrounding section.
        const area = element.closest("section") ?? element.parentElement;
        if (!(area && window.matchMedia("(pointer: fine)").matches)) return;
        const lean = { x: 0, y: 0 };
        const apply = () => {
          element.style.setProperty("--px", lean.x.toFixed(3));
          element.style.setProperty("--py", lean.y.toFixed(3));
        };
        const toX = gsap.quickTo(lean, "x", {
          duration: 1.4,
          ease: "power3",
          onUpdate: apply,
        });
        const toY = gsap.quickTo(lean, "y", {
          duration: 1.4,
          ease: "power3",
          onUpdate: apply,
        });
        const follow = (event: PointerEvent) => {
          toX((event.clientX / window.innerWidth) * 2 - 1);
          toY((event.clientY / window.innerHeight) * 2 - 1);
        };
        area.addEventListener("pointermove", follow);
        return () => area.removeEventListener("pointermove", follow);
      });
    },
    { scope: field },
  );

  // A new pick makes the picked-shade bullets pop. Mounting (and React's
  // development remount) leaves them be.
  useGSAP(
    () => {
      if (shown.current === picked.slug) return;
      shown.current = picked.slug;
      if (prefersReducedMotion()) return;
      // Fields with only fixed-shade pieces have nothing to pop (and GSAP
      // warns about an empty target).
      const bullets = gsap.utils.toArray("[data-picked]", field.current);
      if (bullets.length === 0) return;
      gsap.fromTo(
        bullets,
        { scale: 0.4 },
        {
          scale: 1,
          duration: 1.1,
          ease: "elastic.out(1, 0.45)",
          stagger: 0.07,
          overwrite: "auto",
        },
      );
    },
    { dependencies: [picked.slug], scope: field },
  );

  return (
    <div
      aria-hidden="true"
      // Clipped, so pieces placed over an edge never widen the page.
      className={cn(
        "pointer-events-none absolute inset-0 overflow-clip",
        className,
      )}
      ref={field}
    >
      {pieces.map((piece, index) => {
        const Art = piece.kind === "bullet" ? undefined : art[piece.kind];
        const color =
          piece.shade === undefined
            ? picked.color
            : (shades[piece.shade % shades.length]?.color ?? picked.color);
        return (
          <div
            className={cn(
              "absolute will-change-transform",
              piece.wideOnly && "hidden md:landscape:block",
            )}
            data-depth={piece.depth}
            data-floater
            // biome-ignore lint/suspicious/noArrayIndexKey: static list
            key={index}
            style={
              {
                left: piece.left,
                top: piece.top,
                width: piece.width,
                "--depth": piece.depth,
              } as CSSProperties
            }
          >
            <div className="float-lean">
              <div
                className="float-bob"
                data-picked={
                  piece.kind === "bullet" && piece.shade === undefined
                    ? ""
                    : undefined
                }
                style={
                  {
                    "--tilt": `${piece.tilt}deg`,
                    "--bob-duration": `${6 + (index % 4) * 1.4}s`,
                    "--bob-delay": `${index * -1.7}s`,
                  } as CSSProperties
                }
              >
                <div className={focus(piece.depth)}>
                  {Art ? (
                    <Art className="block w-full" />
                  ) : (
                    <ShadeBullet
                      className="aspect-[5/12] w-full transition-[background-color] duration-700"
                      color={color}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
