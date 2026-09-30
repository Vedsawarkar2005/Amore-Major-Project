"use client";

import { type CSSProperties, useRef } from "react";

import { ShadeBullet } from "@/components/product/shade-bullet";
import { defaultShade } from "@/content/hydravelvet";
import { gsap, useGSAP } from "@/lib/gsap";

import { sceneReady } from "../scene/lipstick-state";
import { INTRO_SEEN_KEY, markIntroRevealed } from "./intro-state";

/** The case stays shut at least this long, so the wordmark can be read. */
const MIN_SECONDS = 1.2;
/** …and opens after this long even if the lipstick hasn't loaded. */
const MAX_SECONDS = 2.6;

const wait = (seconds: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, seconds * 1000));

/** Keys that would scroll the page underneath. */
const SCROLL_KEYS = new Set([
  " ",
  "ArrowDown",
  "ArrowUp",
  "End",
  "Home",
  "PageDown",
  "PageUp",
]);

/**
 * Ending the intro on unmount is deferred a tick: React's development
 * double-mount unmounts and remounts straight away, and the remount cancels
 * this so the intro still plays.
 */
let pendingEnd: ReturnType<typeof setTimeout> | undefined;

/**
 * The lacquer case over the home page (the decision to play it is made by
 * IntroScript, before first paint). Loading is shown as the twelve shades
 * twisting up one by one: fonts, the page's own load and the 3D lipstick's
 * first frame each move it along. Then the wordmark drops away, a rose-gold
 * seam draws down the middle and the two halves slide apart. Clicking or
 * pressing a key hurries it along.
 */
export function IntroCase() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      clearTimeout(pendingEnd);
      const html = document.documentElement;
      // Scripts are running: the inline script's 8-second fallback isn't
      // needed, and must not cut the intro short on a slow device.
      clearTimeout(
        (window as Window & { __introFallback?: number }).__introFallback,
      );
      if (html.dataset.intro !== "play") {
        markIntroRevealed();
        return;
      }

      const q = gsap.utils.selector(root);
      const strip = q("[data-strip]")[0];
      const counter = q("[data-counter]")[0];
      const letters = q("[data-letter]");
      const [left, right] = q("[data-door]");
      const seam = q("[data-seam]");
      const edges = q("[data-edge]");
      let cancelled = false;
      let timeline: gsap.core.Timeline | undefined;

      // Nothing scrolls underneath while the case is shut. Capturing on the
      // window runs before the smooth scroller's own listeners.
      const block = (event: Event) => {
        event.preventDefault();
        event.stopPropagation();
      };
      const hurry = () => open(2.2);
      const onKey = (event: KeyboardEvent) => {
        if (SCROLL_KEYS.has(event.key)) block(event);
        hurry();
      };
      const options = { capture: true, passive: false } as const;
      window.addEventListener("wheel", block, options);
      window.addEventListener("touchmove", block, options);
      window.addEventListener("keydown", onKey, options);
      window.addEventListener("pointerdown", hurry, options);
      const release = () => {
        window.removeEventListener("wheel", block, options);
        window.removeEventListener("touchmove", block, options);
        window.removeEventListener("keydown", onKey, options);
        window.removeEventListener("pointerdown", hurry, options);
      };

      const finish = () => {
        release();
        html.dataset.intro = "done";
        try {
          sessionStorage.setItem(INTRO_SEEN_KEY, "1");
        } catch {
          // Private modes can refuse storage; the intro just plays again.
        }
      };

      // The wordmark rises letter by letter out of its masks.
      gsap.from(letters, {
        yPercent: 110,
        duration: 1,
        ease: "expo.out",
        stagger: 0.07,
        delay: 0.15,
      });

      // Progress (0–1) twists the bullet up out of its sleeve (see `--p`)
      // and counts the percentage. Each real milestone moves it along:
      // fonts, the page's own load, and the 3D lipstick's first frame on
      // pages that have one.
      const state = { p: 0 };
      const render = () => {
        strip?.style.setProperty("--p", state.p.toFixed(3));
        if (counter)
          counter.textContent = String(Math.round(state.p * 100)).padStart(
            3,
            "0",
          );
      };
      const progress = (to: number) =>
        gsap.to(state, {
          p: to,
          duration: 0.8,
          ease: "power2.out",
          overwrite: true,
          onUpdate: render,
        });
      progress(0.18);
      const hasScene = Boolean(document.querySelector("[data-stage-active]"));
      const steps = [
        document.fonts.ready.then(() => progress(0.5)),
        new Promise<void>((resolve) => {
          if (document.readyState === "complete") resolve();
          else window.addEventListener("load", () => resolve(), { once: true });
        }).then(() => progress(hasScene ? 0.75 : 0.9)),
        hasScene ? sceneReady : Promise.resolve(),
      ];
      Promise.race([
        Promise.all([Promise.all(steps), wait(MIN_SECONDS)]),
        wait(MAX_SECONDS),
      ]).then(() => open(1));

      function open(speed: number) {
        if (cancelled) return;
        if (timeline) {
          timeline.timeScale(Math.max(timeline.timeScale(), speed));
          return;
        }
        // The last shades finish twisting up before the case opens.
        progress(1);
        timeline = gsap
          .timeline({ delay: 0.4 })
          // The shades sink back into their case, the wordmark drops away…
          .to(q("[data-loader-mark]"), {
            yPercent: 40,
            autoAlpha: 0,
            duration: 0.45,
            ease: "power3.in",
            stagger: 0.06,
          })
          .to(
            letters,
            {
              yPercent: -110,
              duration: 0.45,
              ease: "power3.in",
              stagger: 0.035,
            },
            0.05,
          )
          // …while a rose-gold seam draws down the middle…
          .fromTo(
            seam,
            { scaleY: 0 },
            { scaleY: 1, duration: 0.45, ease: "power2.inOut" },
            0.25,
          )
          .set(edges, { autoAlpha: 1 })
          .set(seam, { autoAlpha: 0 })
          // …and the case splits open onto the stage.
          .add(markIntroRevealed)
          .to(left ?? [], {
            xPercent: -100,
            duration: 1,
            ease: "expo.inOut",
          })
          .to(
            right ?? [],
            { xPercent: 100, duration: 1, ease: "expo.inOut" },
            "<",
          )
          .timeScale(speed);
        // GSAP slows its clock when frames are slow (lag smoothing); on a
        // struggling device the opening could crawl. After 4 real seconds it
        // jumps to the end.
        const cap = setTimeout(() => timeline?.progress(1), 4000);
        timeline.eventCallback("onComplete", () => {
          clearTimeout(cap);
          finish();
        });
      }

      return () => {
        cancelled = true;
        release();
        pendingEnd = setTimeout(() => {
          if (html.dataset.intro === "play") html.dataset.intro = "done";
          markIntroRevealed();
        });
      };
    },
    { scope: root },
  );

  return (
    <div
      aria-hidden="true"
      className="dark fixed inset-0 z-70 in-data-[intro=play]:block hidden"
      ref={root}
    >
      {/* The two halves of the case: gloss black, each catching a soft
          vertical strip light, with rose-gold inner edges that show once
          the seam has drawn. */}
      {(["left", "right"] as const).map((side) => (
        <div
          className={
            side === "left"
              ? "absolute inset-y-0 left-0 w-1/2 bg-[linear-gradient(90deg,transparent_18%,rgb(255_255_255/0.045)_30%,transparent_44%)] bg-lacquer will-change-transform"
              : "absolute inset-y-0 right-0 w-1/2 bg-[linear-gradient(90deg,transparent_58%,rgb(255_255_255/0.035)_70%,transparent_82%)] bg-lacquer will-change-transform"
          }
          data-door={side}
          key={side}
        >
          <span
            className={
              side === "left"
                ? "invisible absolute inset-y-0 right-0 w-px bg-rose-gold/70"
                : "invisible absolute inset-y-0 left-0 w-px bg-rose-gold/70"
            }
            data-edge
          />
        </div>
      ))}
      <span
        className="absolute inset-y-0 left-1/2 w-px origin-top scale-y-0 bg-linear-to-b from-rose-gold-light via-rose-gold to-rose-gold-light"
        data-seam
      />

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-10 text-porcelain">
        <p className="flex font-heading text-[clamp(3.5rem,12vw,9.5rem)] leading-none tracking-[0.14em]">
          {Array.from("AMORE", (letter, index) => (
            <span
              className="inline-block overflow-clip [overflow-clip-margin:0.12em]"
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed word
              key={index}
            >
              <span className="inline-block" data-letter>
                {letter}
              </span>
            </span>
          ))}
        </p>
        {/* A lipstick twisting up out of its rose-gold sleeve as the page
            loads, beside the percentage. `--p` (0–1) drives the rise. */}
        <div
          className="flex items-end gap-6 sm:gap-8"
          data-strip
          style={{ "--p": 0 } as CSSProperties}
        >
          <div className="relative flex flex-col items-center" data-loader-mark>
            <div className="relative h-16 w-8 overflow-hidden sm:h-20 sm:w-10">
              <span className="transform-[translateY(calc((1-var(--p))*100%))] absolute inset-x-[12%] bottom-0 block h-full">
                <ShadeBullet
                  className="h-full w-full brightness-125"
                  color={defaultShade.color}
                />
              </span>
            </div>
            <span className="block h-14 w-8 rounded-t-[3px] bg-[linear-gradient(90deg,#8a5a48,#f3d4c4_38%,#d9a08a_55%,#6e4536)] sm:h-16 sm:w-10" />
            <span className="block h-4 w-11 bg-lacquer ring-1 ring-white/10 sm:w-14" />
          </div>
          <p
            className="font-heading text-[clamp(3rem,10vw,6rem)] text-porcelain/90 tabular-nums leading-none"
            data-loader-mark
          >
            <span data-counter>000</span>
            <span className="align-top text-[0.35em] text-rose-gold-light">
              %
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
