import { cn } from "@/lib/utils";

import type { IngredientSlug } from "@/content/hydravelvet";
import type { gsap } from "@/lib/gsap";

import { ingredientArt } from "./ingredient-art";

/*
 * Layered ingredient cut-outs for the hero stage: the "transparent PNG +
 * parallax" depth trick. While each benefit card is on screen, its
 * ingredient floats up through the frame. Every piece has a `depth`:
 *
 *   depth < 1   far away — behind the lipstick, smaller, slower, softer;
 *   depth > 1   close up — in front of the lipstick, larger, faster, blurred
 *               (as if out of the camera's focus).
 *
 * Speed proportional to depth is what makes flat drawings read as 3D space.
 */

type Plane = "back" | "front";

type Piece = {
  /** Which Hydravelvet ingredient; its drawing is the piece's art. */
  ingredient: IngredientSlug;
  /** Horizontal position: CSS `left`, as a percentage of the stage. */
  left: string;
  /** Vertical resting position: CSS `top`, as a percentage of the stage. */
  top: string;
  /** Width; responsive so pieces scale with the screen. */
  width: string;
  /** Starting rotation in degrees; pieces turn a little as they drift. */
  rotate: number;
  depth: number;
  /** Hide on phones, where the stage is narrow and busy. */
  wideOnly?: boolean;
};

const pieces: Piece[] = [
  // Blueberry Butter: a scatter of berries at every depth.
  {
    ingredient: "blueberry-butter",
    left: "68%",
    top: "30%",
    width: "clamp(3rem,6vw,6rem)",
    rotate: 10,
    depth: 0.55,
  },
  {
    ingredient: "blueberry-butter",
    left: "22%",
    top: "62%",
    width: "clamp(2.5rem,4vw,4.5rem)",
    rotate: -30,
    depth: 0.45,
    wideOnly: true,
  },
  {
    ingredient: "blueberry-butter",
    left: "76%",
    top: "64%",
    width: "clamp(6rem,13vw,13rem)",
    rotate: 40,
    depth: 1.5,
  },
  {
    ingredient: "blueberry-butter",
    left: "8%",
    top: "40%",
    width: "clamp(4rem,8vw,8rem)",
    rotate: -12,
    depth: 1.2,
    wideOnly: true,
  },
  // Avocado Oil: one hero half up close, two further back.
  {
    ingredient: "avocado-oil",
    left: "14%",
    top: "56%",
    width: "clamp(7rem,14vw,15rem)",
    rotate: -24,
    depth: 1.45,
  },
  {
    ingredient: "avocado-oil",
    left: "70%",
    top: "34%",
    width: "clamp(3.5rem,7vw,7rem)",
    rotate: 28,
    depth: 0.6,
  },
  {
    ingredient: "avocado-oil",
    left: "34%",
    top: "22%",
    width: "clamp(2.5rem,4vw,4.5rem)",
    rotate: 70,
    depth: 0.4,
    wideOnly: true,
  },
  // Vitamin E: golden drops, some tiny and far, one large and near.
  {
    ingredient: "vitamin-e",
    left: "62%",
    top: "58%",
    width: "clamp(2.5rem,4.5vw,5rem)",
    rotate: 8,
    depth: 0.5,
  },
  {
    ingredient: "vitamin-e",
    left: "28%",
    top: "30%",
    width: "clamp(2rem,3vw,3.5rem)",
    rotate: -10,
    depth: 0.4,
  },
  {
    ingredient: "vitamin-e",
    left: "80%",
    top: "46%",
    width: "clamp(5rem,10vw,10rem)",
    rotate: 18,
    depth: 1.35,
  },
  {
    ingredient: "vitamin-e",
    left: "10%",
    top: "70%",
    width: "clamp(3.5rem,6vw,6rem)",
    rotate: -20,
    depth: 1.1,
    wideOnly: true,
  },
];

/** Pieces in front of the lipstick are the ones with depth above 1. */
const planeOf = (piece: Piece): Plane => (piece.depth > 1 ? "front" : "back");

/**
 * One depth plane of ingredient pieces. The hero renders the back plane
 * beneath the 3D canvas and the front plane above it, so the lipstick sits
 * between them. Pieces start hidden; `driftIngredient` animates them.
 */
export function IngredientDrift({ plane }: { plane: Plane }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 motion-reduce:hidden"
    >
      {pieces.map((piece, index) => {
        if (planeOf(piece) !== plane) return null;
        const Art = ingredientArt[piece.ingredient];
        return (
          <div
            className={cn(
              "invisible absolute will-change-transform",
              piece.wideOnly && "hidden md:landscape:block",
              // Out-of-focus foreground; softer, dimmer background. (Not
              // opacity: GSAP owns that for the fades.)
              piece.depth > 1.3 && "blur-[3px]",
              piece.depth < 0.5 && "blur-[1px] brightness-75",
            )}
            data-depth={piece.depth}
            data-ingredient={piece.ingredient}
            data-rotate={piece.rotate}
            // biome-ignore lint/suspicious/noArrayIndexKey: static list
            key={index}
            style={{ left: piece.left, top: piece.top, width: piece.width }}
          >
            <Art className="block w-full" />
          </div>
        );
      })}
    </div>
  );
}

/** How far a depth-1 piece travels, as a fraction of the viewport height. */
const TRAVEL = 0.75;

/**
 * Adds one ingredient's drift to the hero's scroll timeline: its pieces rise
 * from below their resting spot to above it (nearer pieces travel further),
 * turning slightly, fading in at the start and out at the end.
 *
 * @param timeline  the hero's scrubbed scroll timeline
 * @param scope     the hero section, to find the pieces in
 * @param slug      which ingredient to animate
 * @param at        timeline position where the drift starts
 * @param duration  how long (in timeline units) the pieces are on screen
 */
export function driftIngredient(
  timeline: gsap.core.Timeline,
  scope: HTMLElement,
  slug: IngredientSlug,
  at: number,
  duration: number,
) {
  const targets = scope.querySelectorAll<HTMLElement>(
    `[data-ingredient="${slug}"]`,
  );

  for (const piece of targets) {
    const depth = Number(piece.dataset.depth);
    const rotate = Number(piece.dataset.rotate);
    // Read at first render, so it matches the screen the page opened on.
    const distance = () => window.innerHeight * TRAVEL * depth;

    timeline
      .fromTo(
        piece,
        { y: distance, rotate },
        {
          y: () => -distance(),
          rotate: rotate + 25 * depth,
          duration,
        },
        at,
      )
      .fromTo(
        piece,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: duration * 0.2 },
        at,
      )
      .to(
        piece,
        { autoAlpha: 0, duration: duration * 0.2 },
        at + duration * 0.8,
      );
  }
}
