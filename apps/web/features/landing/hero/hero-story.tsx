"use client";

import { Card, CardContent } from "@/components/primitives/card";
import { cn } from "@/lib/utils";
import { useRef } from "react";

import { hydravelvet, shades } from "@/content/hydravelvet";
import { formatInr } from "@/lib/format";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

import { type Floater, FloatField } from "../float/float-field";
import {
  driftIngredient,
  IngredientDrift,
} from "../ingredients/ingredient-drift";
import { isIntroPlaying, whenIntroRevealed } from "../intro/intro-state";
import { LazyLipstickCanvas } from "../scene/lazy-lipstick-canvas";
import {
  cameraRig,
  closedPose,
  entrance,
  idle,
  invalidateScene,
  type LipstickPose,
  lipstickPose,
  openPose,
  restingCamera,
  shimmer,
} from "../scene/lipstick-state";
import { BenefitCard, revealBenefitCard } from "./benefit-card";
import { animateHeadline, introStage } from "./hero-text";
import { drawMaterialFrame, MaterialFrame } from "./material-frame";
import { ShadeDock } from "./shade-dock";
import { ShadePanel } from "./shade-panel";
import { SpinningBadge } from "./spinning-badge";
import { StageBackdrop, StageDetails, StageName } from "./stage-shade";

/** Landscape screens from tablet up: copy either side of the lipstick. */
const WIDE = "(min-width: 768px) and (orientation: landscape)";

/**
 * Short phones (iPhone SE and the like, or any screen under 740px tall):
 * the same stacking as other phones, with the lipstick smaller and higher so
 * its base clears the swatch tray.
 */
const SHORT = "(max-height: 740px)";

type Layout = {
  /** Lipstick placement for each act of the story. */
  hero: Partial<LipstickPose>;
  story: Partial<LipstickPose>;
  panel: Partial<LipstickPose>;
  /** Spotlight offset (xPercent of the stage) for the hero and panel acts. */
  spot: { hero: number; panel: number };
};

// Vertical values are scene units; the stage shows y −2.04 to 2.04. The
// closed lipstick spans −0.87 to 2.2 at scale 1; opened (cap out of frame),
// −0.87 to 1.6. In the hero it stands centred, in front of the shade's name.
const wideLayout: Layout = {
  hero: { offsetX: 0, offsetY: -0.42, scale: 0.74 },
  story: { offsetX: 0, offsetY: -0.36, scale: 1 },
  panel: { offsetX: -0.34, offsetY: -0.36, scale: 1 },
  spot: { hero: 0, panel: -17 },
};

// Phones and portrait tablets: headline on top, lipstick in the middle,
// swatches below; later the benefit cards and shade panel take the bottom
// of the screen.
const narrowLayout: Layout = {
  hero: { offsetX: 0, offsetY: -0.32, scale: 0.52 },
  story: { offsetX: 0, offsetY: 0.24, scale: 0.8 },
  panel: { offsetX: 0, offsetY: 0.39, scale: 0.8 },
  spot: { hero: 0, panel: 0 },
};

const shortNarrowLayout: Layout = {
  ...narrowLayout,
  hero: { offsetX: 0, offsetY: -0.06, scale: 0.44 },
};

/** How far below its hero spot the lipstick starts its entrance. */
const ENTRANCE_DROP = 2.6;

/*
 * Pieces floating around the lipstick in the hero, placed clear of the
 * headline, the copy and the tray. Far pieces (depth below 1) sit behind
 * the lipstick, near ones in front of it, out of focus. Bullets without a
 * shade wear the picked one.
 */
const heroFloaters: Floater[] = [
  {
    kind: "blueberry",
    left: "-3%",
    top: "30%",
    width: "clamp(5rem,11vw,11rem)",
    depth: 1.6,
    tilt: -10,
  },
  {
    kind: "drop",
    left: "87%",
    top: "13%",
    width: "clamp(2.75rem,5.5vw,5.5rem)",
    depth: 1.3,
    tilt: 14,
  },
  {
    kind: "bullet",
    left: "25%",
    top: "44%",
    width: "clamp(1.5rem,2.6vw,2.75rem)",
    depth: 1.25,
    tilt: -32,
  },
  {
    kind: "avocado",
    left: "93%",
    top: "52%",
    width: "clamp(5rem,10vw,10rem)",
    depth: 1.5,
    tilt: 22,
    wideOnly: true,
  },
  {
    kind: "avocado",
    left: "17%",
    top: "17%",
    width: "clamp(2.5rem,5vw,5rem)",
    depth: 0.6,
    tilt: -24,
    wideOnly: true,
  },
  {
    kind: "bullet",
    left: "71%",
    top: "22%",
    width: "clamp(0.9rem,1.5vw,1.5rem)",
    depth: 0.85,
    tilt: 28,
  },
  {
    kind: "blueberry",
    left: "77%",
    top: "55%",
    width: "clamp(1.75rem,3vw,3rem)",
    depth: 0.5,
    tilt: 30,
    wideOnly: true,
  },
  {
    kind: "drop",
    left: "33%",
    top: "63%",
    width: "clamp(1.25rem,2vw,2rem)",
    depth: 0.45,
    tilt: -8,
    wideOnly: true,
  },
  {
    kind: "bullet",
    left: "60%",
    top: "61%",
    width: "clamp(0.8rem,1.2vw,1.25rem)",
    depth: 0.55,
    tilt: 12,
    shade: 8,
    wideOnly: true,
  },
  {
    kind: "bullet",
    left: "8%",
    top: "14%",
    width: "clamp(0.75rem,1vw,1rem)",
    depth: 0.4,
    tilt: -18,
    shade: 2,
    wideOnly: true,
  },
];

/** When the materials frame draws, and when the benefits follow it. */
const MATERIALS_AT = 2.2;
const BENEFITS_AT = MATERIALS_AT + 1.6;

/** Camera framing while the lipstick opens: closer and lower, looking up. */
const storyCamera = { distance: 8.8, height: 0.1 };
/** How far the camera swings around the lipstick for each benefit. */
const BENEFIT_ORBIT = 0.16;

// Where each benefit card sits around the lipstick on wide screens.
const cardPlacement = [
  "md:landscape:top-[20%] md:landscape:left-[7%]",
  "md:landscape:top-[32%] md:landscape:right-[7%]",
  "md:landscape:bottom-[24%] md:landscape:left-[9%]",
  "md:landscape:right-[9%] md:landscape:bottom-[14%]",
];

/**
 * Hero and pinned product story on a stage that wears the picked shade: its
 * backdrop is the shade's colour, its name stands poster-sized behind the
 * lipstick, and a tray of swatches below repaints all three (see
 * stage-shade.tsx). The stage runs under the header, which floats over it while
 * it's on screen. As the intro's case opens, the lipstick rises into place
 * and the copy around it enters; then, on wide screens, it drifts and a key
 * light sweeps its lacquer. Scrolling, the hero copy and name give way, then
 * one scrubbed timeline lifts the cap, raises the bullet, turns it through
 * each benefit and hands over to the shade panel. The camera moves with it
 * (dolly in, drop low, swing around each benefit), each ingredient floats
 * past its card, and rose-gold shimmer drifts throughout. Text motion
 * (entrance, headline light wave, card titles) lives in hero-text.ts.
 * With reduced motion the lipstick is shown open and the benefits and panel
 * render as ordinary content below the stage.
 */
export function HeroStory() {
  const section = useRef<HTMLElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const meta = useRef<HTMLDivElement>(null);
  const name = useRef<HTMLDivElement>(null);
  const lead = useRef<HTMLParagraphElement>(null);
  const badge = useRef<HTMLDivElement>(null);
  const actions = useRef<HTMLDivElement>(null);
  const dock = useRef<HTMLDivElement>(null);
  const cue = useRef<HTMLDivElement>(null);
  const cueContent = useRef<HTMLDivElement>(null);
  const spot = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // With a conditions object the callback runs when ANY query matches, so
      // include both motion states: one of them always matches.
      mm.add(
        {
          wide: WIDE,
          short: SHORT,
          motion: "(prefers-reduced-motion: no-preference)",
          reduceMotion: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const {
            wide = false,
            short = false,
            reduceMotion = false,
          } = context.conditions ?? {};
          const layout = wide
            ? wideLayout
            : short
              ? shortNarrowLayout
              : narrowLayout;
          gsap.set(spot.current, { xPercent: layout.spot.hero });

          // The header floats over the stage while it's pinned, and turns
          // solid as it scrolls away (see `data-stage-active` in globals.css).
          // The attribute is server-rendered for the top of the page, so it
          // is also synced once positions are known: a reload further down
          // never toggles the trigger.
          const markStage = (self: ScrollTrigger) =>
            section.current?.toggleAttribute(
              "data-stage-active",
              self.isActive,
            );
          ScrollTrigger.create({
            trigger: section.current,
            start: "top bottom",
            end: "bottom bottom",
            onToggle: markStage,
            onRefresh: markStage,
          });

          // The camera and shimmer always start from rest too.
          Object.assign(cameraRig, restingCamera);
          Object.assign(shimmer, { scroll: 0, strength: 1 });

          if (reduceMotion) {
            Object.assign(lipstickPose, openPose, layout.hero);
            idle.weight = 0;
            invalidateScene();
            return;
          }

          // Start from a known pose; tweens record their start values from it.
          Object.assign(lipstickPose, closedPose, layout.hero);
          invalidateScene();

          // Advances the shimmer with real time (see `shimmer` in the state).
          // Steps are capped, so returning to a background tab doesn't make
          // the dust jump.
          let lastTick: number | null = null;
          const tickShimmer = (time: number) => {
            if (lastTick !== null) {
              shimmer.drift += Math.min(time - lastTick, 0.1);
            }
            lastTick = time;
            invalidateScene();
          };
          // The camera leans gently toward the mouse.
          const followPointer = (event: PointerEvent) => {
            pointerX((event.clientX / window.innerWidth) * 2 - 1);
            pointerY((event.clientY / window.innerHeight) * 2 - 1);
          };
          const pointerX = gsap.quickTo(cameraRig, "pointerX", {
            duration: 1.2,
            ease: "power3",
            onUpdate: invalidateScene,
          });
          const pointerY = gsap.quickTo(cameraRig, "pointerY", {
            duration: 1.2,
            ease: "power3",
            onUpdate: invalidateScene,
          });

          // Idle drift, light sweep, live shimmer and pointer tilt, on wide
          // screens only (they render every frame, which phones pay for in
          // battery). The idle drift pauses once the story takes over and
          // resumes on the way back; the shimmer runs while the stage is on
          // screen.
          if (wide) {
            ScrollTrigger.create({
              trigger: section.current,
              start: "top bottom",
              end: "bottom top",
              onToggle: (self) => {
                lastTick = null;
                if (self.isActive) gsap.ticker.add(tickShimmer);
                else gsap.ticker.remove(tickShimmer);
              },
            });
            if (window.matchMedia("(pointer: fine)").matches) {
              section.current?.addEventListener("pointermove", followPointer);
            }

            idle.weight = 1;
            const drift = gsap.to(idle, {
              phase: 1,
              duration: 10,
              ease: "none",
              repeat: -1,
              onUpdate: invalidateScene,
            });
            ScrollTrigger.create({
              trigger: section.current,
              start: "top top",
              end: "+=15%",
              onLeave: () => drift.pause(),
              onEnterBack: () => drift.resume(),
            });
          } else {
            idle.weight = 0;
          }

          // The entrance waits for the intro's case to open. The lipstick
          // rises into its hero spot as the camera eases in; the text (see
          // hero-text.ts) follows: the name's letters (only if the intro hid
          // it), a wave of light through the headline and its line-by-line
          // exit on scroll, then the supporting copy and the swatch tray.
          let stopHeadline: (() => void) | undefined;
          const riseName = isIntroPlaying();
          const cancelEntrance = whenIntroRevealed(() =>
            context.add(() => {
              gsap.fromTo(
                entrance,
                { lift: -ENTRANCE_DROP },
                {
                  lift: 0,
                  duration: 2,
                  ease: "expo.out",
                  onUpdate: invalidateScene,
                },
              );
              gsap.fromTo(
                entrance,
                { dolly: 2.4 },
                {
                  dolly: 0,
                  duration: 2.4,
                  ease: "power3.out",
                  onUpdate: invalidateScene,
                },
              );
              // The floating pieces swell into place, in no particular order
              // (their planes were hidden by CSS until now; see
              // `data-hero-intro`).
              gsap.set(gsap.utils.toArray("[data-hero-floats]"), {
                opacity: 1,
              });
              gsap.from(gsap.utils.toArray("[data-hero-floats] .float-lean"), {
                autoAlpha: 0,
                scale: 0.4,
                duration: 1.6,
                ease: "expo.out",
                stagger: { each: 0.07, from: "random" },
                delay: 0.4,
              });
              if (title.current) {
                stopHeadline = animateHeadline(title.current);
              }
              if (
                name.current &&
                lead.current &&
                actions.current &&
                dock.current &&
                cueContent.current
              ) {
                introStage({
                  name: name.current,
                  riseName,
                  badge: badge.current,
                  lead: lead.current,
                  actions: actions.current,
                  dock: dock.current,
                  cue: cueContent.current,
                });
              }
            }),
          );

          const cards = gsap.utils.toArray<HTMLElement>("[data-benefit]");
          gsap.set(cards, { autoAlpha: 0, y: 24 });
          gsap.set(panel.current, {
            autoAlpha: 0,
            ...(wide ? { x: 48 } : { y: 48 }),
          });

          const timeline = gsap.timeline({
            defaults: { ease: "none" },
            onUpdate: invalidateScene,
            scrollTrigger: {
              end: "bottom bottom",
              scrub: 0.6,
              start: "top top",
              trigger: section.current,
            },
          });

          timeline
            .to(idle, { weight: 0, duration: 0.6 }, 0)
            .to(
              title.current,
              {
                autoAlpha: 0,
                y: -140,
                scale: 0.92,
                duration: 0.8,
                ease: "power2.out",
              },
              0,
            )
            .to(
              [meta.current, cue.current],
              {
                autoAlpha: 0,
                y: -60,
                duration: 0.6,
                ease: "power2.out",
              },
              0,
            )
            // The camera pushes through the name as the lipstick opens, and
            // the floating pieces part around it, nearer ones faster.
            .to(name.current, { autoAlpha: 0, scale: 1.15, duration: 0.9 }, 0)
            .to(
              gsap.utils.toArray<HTMLElement>(
                "[data-hero-floats] [data-floater]",
              ),
              {
                autoAlpha: 0,
                x: (_index, piece: HTMLElement) =>
                  (Number.parseFloat(piece.style.left) < 50 ? -1 : 1) *
                  Number(piece.dataset.depth) *
                  180,
                y: (_index, piece: HTMLElement) =>
                  Number(piece.dataset.depth) * -140,
                duration: 1,
              },
              0,
            )
            .to(
              lipstickPose,
              {
                ...layout.story,
                rotation: openPose.rotation,
                tilt: openPose.tilt,
                duration: 1.2,
              },
              0,
            )
            .to(spot.current, { xPercent: 0, duration: 1.2 }, 0)
            .to(cameraRig, { distance: storyCamera.distance, duration: 1.2 }, 0)
            .to(cameraRig, { height: storyCamera.height, duration: 0.8 }, 1.4)
            .to(lipstickPose, { capLift: openPose.capLift, duration: 1 }, 0.6)
            .to(
              lipstickPose,
              { bulletRise: openPose.bulletRise, duration: 0.8 },
              1.4,
            );

          // With the bullet up, the materials frame draws round the
          // lipstick, then clears for the benefits (see material-frame.tsx).
          const materials = section.current?.querySelector("[data-materials]");
          if (materials) drawMaterialFrame(timeline, materials, MATERIALS_AT);

          // Each benefit fades in while the lipstick turns a quarter and the
          // camera swings to alternate sides, then yields. Ingredient benefits
          // bring their ingredient drifting past; the finish gets a burst of
          // shimmer instead.
          cards.forEach((card, index) => {
            const at = BENEFITS_AT + index * 1.2;
            timeline
              .to(card, { autoAlpha: 1, duration: 0.4, y: 0 }, at)
              .to(
                lipstickPose,
                { duration: 1.2, rotation: `+=${Math.PI / 2}` },
                at,
              )
              .to(
                cameraRig,
                {
                  orbit: index % 2 ? -BENEFIT_ORBIT : BENEFIT_ORBIT,
                  duration: 1.2,
                },
                at,
              )
              .to(card, { autoAlpha: 0, duration: 0.4, y: -24 }, at + 0.9);

            revealBenefitCard(timeline, card, at);

            const ingredient = hydravelvet.ingredients.find(
              (item) => item.name === hydravelvet.benefits[index]?.title,
            );
            if (ingredient && section.current) {
              driftIngredient(
                timeline,
                section.current,
                ingredient.slug,
                at - 0.2,
                1.6,
              );
            } else {
              timeline
                .to(shimmer, { strength: 1.6, duration: 0.6 }, at)
                .to(shimmer, { strength: 1, duration: 0.6 }, at + 0.9);
            }
          });

          // The lipstick steps aside for the shade panel; the trailing pause
          // keeps the panel usable before the stage unpins.
          timeline
            .addLabel("panel", "+=0.1")
            .to(lipstickPose, { ...layout.panel, duration: 0.9 }, "panel")
            // Back to the resting framing, which the panel layout assumes.
            .to(
              cameraRig,
              {
                orbit: restingCamera.orbit,
                distance: restingCamera.distance,
                height: restingCamera.height,
                duration: 0.9,
              },
              "panel",
            )
            .to(
              spot.current,
              { xPercent: layout.spot.panel, duration: 0.9 },
              "panel",
            )
            .to(
              panel.current,
              { autoAlpha: 1, x: 0, y: 0, duration: 0.6 },
              "panel+=0.3",
            )
            .to({}, { duration: 1.4 });

          // Scrolling also carries the shimmer, over the whole story.
          timeline.to(shimmer, { scroll: 1, duration: timeline.duration() }, 0);

          return () => {
            cancelEntrance();
            stopHeadline?.();
            gsap.ticker.remove(tickShimmer);
            section.current?.removeEventListener("pointermove", followPointer);
          };
        },
      );
    },
    { scope: section },
  );

  return (
    <section
      aria-labelledby="hero-title"
      className="dark relative -mt-16 bg-noir text-foreground motion-safe:h-[640svh]"
      data-stage-active=""
      ref={section}
    >
      {/* The stage fills the screen and runs under the 4rem sticky header
          (the section is pulled up by the header's height), which floats
          over it while it's on screen. */}
      <div className="relative h-svh overflow-hidden motion-safe:sticky motion-safe:top-0">
        <StageBackdrop />
        {/* A warm spotlight that follows the lipstick (moved by transform). */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(closest-side_at_50%_55%,rgb(243_212_196/0.16),rgb(243_212_196/0.04)_55%,transparent)] will-change-transform"
          ref={spot}
        />
        {/* The shade's name, behind everything else on the stage. */}
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center pb-[6svh] text-porcelain/90 will-change-transform"
          ref={name}
        >
          <StageName />
        </div>
        {/* Pieces floating further away than the lipstick… */}
        <div className="absolute inset-0" data-hero-floats data-hero-intro>
          <FloatField
            pieces={heroFloaters.filter((piece) => piece.depth <= 1)}
          />
        </div>
        {/* …and the story's ingredients further away than it. */}
        <IngredientDrift plane="back" />
        <div className="absolute inset-0">
          <LazyLipstickCanvas />
        </div>
        <div
          aria-hidden="true"
          className="stage-vignette pointer-events-none absolute inset-0"
        />
        <div
          aria-hidden="true"
          className="stage-grain pointer-events-none absolute inset-0"
        />
        {/* The materials, framed round the open lipstick. */}
        <MaterialFrame />
        {/* …and ingredients and pieces closer than it. */}
        <IngredientDrift plane="front" />
        <div className="absolute inset-0" data-hero-floats data-hero-intro>
          <FloatField
            pieces={heroFloaters.filter((piece) => piece.depth > 1)}
          />
        </div>

        {/* Headline on top; on wide screens the lead and details stand
            either side of the lipstick above the swatch tray, on phones the
            tray comes first and the shop link sits under the thumb. */}
        <div className="pointer-events-none relative z-10 mx-auto flex h-full max-w-7xl flex-col px-4 pt-22 pb-5 md:landscape:pt-28 md:landscape:pb-7">
          <h1
            className="mx-auto max-w-[14ch] text-center font-heading text-[clamp(2.25rem,2.4vw+1.25rem,4.25rem)] leading-[0.98] md:landscape:max-w-none will-change-transform"
            id="hero-title"
            ref={title}
          >
            A veil of care, a touch of colour.
          </h1>
          <div
            className="mt-auto flex flex-col gap-5 md:landscape:gap-6 will-change-transform"
            ref={meta}
          >
            <div className="order-last flex flex-col items-center gap-6 md:landscape:order-0 md:landscape:flex-row md:landscape:items-end md:landscape:justify-between">
              <div className="hidden items-end gap-5 md:landscape:flex">
                <div
                  className="pointer-events-auto"
                  data-hero-intro
                  ref={badge}
                >
                  <SpinningBadge
                    className="size-24 text-porcelain/85"
                    text={`${hydravelvet.finish} finish, ${shades.length} shades, one touch of colour.`}
                  />
                </div>
                <p
                  className="max-w-[20rem] text-pretty text-porcelain/80"
                  data-hero-intro
                  ref={lead}
                >
                  Hydravelvet is a velvet-finish lipstick made with Blueberry
                  Butter, Avocado Oil and Vitamin E. {shades.length} shades,{" "}
                  {formatInr(hydravelvet.priceInr)} each.
                </p>
              </div>
              <div
                className="pointer-events-auto"
                data-hero-intro
                ref={actions}
              >
                <StageDetails className="items-center md:landscape:items-start" />
              </div>
            </div>
            <div className="pointer-events-auto" data-hero-intro ref={dock}>
              <ShadeDock />
            </div>
          </div>
        </div>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-[max(1rem,calc((100vw-80rem)/2+1rem))] bottom-8 z-10 hidden flex-col items-center gap-3 text-porcelain/70 text-xs motion-reduce:hidden md:landscape:flex"
          ref={cue}
        >
          <div
            className="flex flex-col items-center gap-3"
            data-hero-intro
            ref={cueContent}
          >
            <span>Scroll to open</span>
            <span className="h-10 w-px bg-linear-to-b from-rose-gold to-transparent motion-safe:animate-pulse" />
          </div>
        </div>

        <ul className="pointer-events-none absolute inset-x-4 bottom-6 z-10 grid motion-reduce:hidden md:landscape:inset-0">
          {hydravelvet.benefits.map((benefit, index) => (
            <li
              className={cn(
                // A definite width on wide screens: the card's header is a
                // CSS container, so it can't size itself from its text and
                // would collapse to a sliver in a shrink-to-fit box.
                "col-start-1 row-start-1 will-change-transform md:landscape:absolute md:landscape:w-[min(19rem,28vw)]",
                cardPlacement[index],
              )}
              data-benefit
              key={benefit.title}
            >
              <BenefitCard
                body={benefit.body}
                index={index}
                title={benefit.title}
                total={hydravelvet.benefits.length}
              />
            </li>
          ))}
        </ul>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 motion-reduce:hidden md:landscape:inset-x-auto md:landscape:top-1/2 md:landscape:right-[6%] md:landscape:bottom-auto md:landscape:w-[min(26rem,40vw)] md:landscape:-translate-y-1/2">
          <div
            className="pointer-events-auto will-change-transform"
            ref={panel}
          >
            <Card className="rounded-none bg-noir-deep/95 shadow-none ring-white/10 [--card-spacing:--spacing(4)] md:landscape:rounded-xl md:landscape:[--card-spacing:--spacing(8)]">
              <CardContent>
                <ShadePanel />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Reduced motion: the same content, as a static layout. */}
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 motion-safe:hidden">
        <ul className="grid gap-px border border-white/10 bg-white/10 sm:grid-cols-2">
          {hydravelvet.benefits.map((benefit) => (
            <li className="bg-noir p-6" key={benefit.title}>
              <h2 className="font-heading text-2xl">{benefit.title}</h2>
              <p className="mt-2 text-muted-foreground">{benefit.body}</p>
            </li>
          ))}
        </ul>
        <ul className="grid gap-px border border-white/10 bg-white/10 sm:grid-cols-2">
          {hydravelvet.materials.map((item) => (
            <li className="bg-noir p-6" key={item.part}>
              <p className="text-rose-gold-light text-xs uppercase tracking-[0.24em]">
                {item.part}
              </p>
              <p className="mt-1 font-heading text-xl">{item.material}</p>
              <p className="mt-1 text-muted-foreground">{item.detail}</p>
            </li>
          ))}
        </ul>
        <ShadePanel />
      </div>
    </section>
  );
}
