import { gsap, SplitText } from "@/lib/gsap";

/*
 * Text choreography for the hero (used by HeroStory, motion-allowed only).
 *
 *   On reveal  (as the intro's case opens, or on load when it doesn't play)
 *              the shade's name rises letter by letter behind the lipstick
 *              (only under the intro, see `introStage`), a wave of rose-gold
 *              light runs through the headline word by word, like a key
 *              light passing over foil, the lead paragraph rises line by
 *              line out of masks, the details lift in, the swatch tray pops
 *              up from the middle outward, and the scroll cue draws itself.
 *   On scroll  the headline leaves line by line, and each benefit card's
 *              title rises word by word as the card appears.
 *
 * The headline and the shade's name are painted before any script runs:
 * they're the page's largest paints (LCP), and hiding them would delay
 * that. The supporting copy does start hidden, marked with `data-hero-intro`
 * (see globals.css, which also has a no-JavaScript fallback).
 */

/**
 * Splits the headline into lines and words: words carry the light wave,
 * lines carry the scroll exit. `autoSplit` re-splits when fonts load or the
 * width changes; both animations are rebuilt on the new elements, and the
 * wave picks up where it was, so it never replays.
 *
 * @returns cleanup that stops the wave.
 */
export function animateHeadline(title: HTMLElement) {
  let wave: gsap.core.Timeline | undefined;

  SplitText.create(title, {
    type: "words",
    autoSplit: true,
    onSplit: (self) => {
      const progress = wave?.progress() ?? 0;
      wave?.kill();
      wave = progress < 1 ? lightWave(self.words, title) : undefined;
      wave?.progress(progress);
    },
  });

  return () => wave?.kill();
}

/**
 * Each word brightens to the brand's light rose gold with a soft glow, then
 * settles back; the stagger makes it read as one sweep from left to right.
 * Only colour and text-shadow change, so the layout never moves.
 */
function lightWave(words: Element[], title: HTMLElement) {
  const styles = getComputedStyle(title);
  const base = toRgb(styles.color);
  const light = toRgb(
    styles.getPropertyValue("--brand-rose-gold-light").trim() || "#f3d4c4",
  );
  const [r, g, b] = gsap.utils.splitColor(light);
  const glow = (alpha: number, size: number) =>
    `0 0 ${size}em rgba(${r}, ${g}, ${b}, ${alpha})`;

  return (
    gsap
      .timeline({
        delay: 0.35,
        // Hand colour back to the stylesheet (and the theme) when done.
        onComplete: () => gsap.set(words, { clearProps: "color,textShadow" }),
      })
      // Explicit start values GSAP can tween from: the same colour as the
      // stylesheet's, and an invisible glow.
      .set(words, { color: base, textShadow: glow(0, 0) })
      .to(words, {
        keyframes: [
          {
            color: light,
            textShadow: glow(0.45, 0.3),
            duration: 0.4,
            ease: "sine.out",
          },
          {
            color: base,
            textShadow: glow(0, 0),
            duration: 1,
            ease: "sine.inOut",
          },
        ],
        stagger: 0.09,
      })
  );
}

/**
 * Any CSS colour as `rgb(r, g, b)`. The theme defines colours in oklch(),
 * which GSAP can't interpolate; painting one canvas pixel lets the browser
 * do the conversion.
 */
function toRgb(color: string) {
  const context = document
    .createElement("canvas")
    .getContext("2d", { willReadFrequently: true });
  if (!context) return color;
  context.fillStyle = color;
  context.fillRect(0, 0, 1, 1);
  const [r, g, b] = context.getImageData(0, 0, 1, 1).data;
  return `rgb(${r}, ${g}, ${b})`;
}

type StageIntro = {
  /** The shade's name behind the lipstick (StageName). */
  name: HTMLElement;
  /**
   * Raise the name's letters from their masks. Only while the intro covers
   * the page: otherwise the name has already been seen, and hiding it to
   * raise it again would flash.
   */
  riseName: boolean;
  /** The spinning sticker above the lead (SpinningBadge). */
  badge: HTMLElement | null;
  /** The lead paragraph beside the lipstick. */
  lead: HTMLElement;
  /** The price and call-to-action links. */
  actions: HTMLElement;
  /** The swatch tray (ShadeDock). */
  dock: HTMLElement;
  /** The "Scroll to open" cue's content: a label and a line. */
  cue: HTMLElement;
};

/**
 * The stage's entrance, timed around the headline's light wave. The
 * supporting blocks were hidden by CSS (`data-hero-intro`); each is shown
 * here in the same frame its parts are moved to their starting positions,
 * so nothing flashes.
 */
export function introStage({
  name,
  riseName,
  badge,
  lead,
  actions,
  dock,
  cue,
}: StageIntro) {
  gsap.set([badge, lead, actions, dock, cue], { opacity: 1 });

  // The sticker spins in from nothing, like it's been slapped on.
  if (badge) {
    gsap.from(badge, {
      scale: 0,
      rotate: -140,
      duration: 1.4,
      ease: "back.out(1.5)",
      delay: 0.8,
    });
  }

  if (riseName) {
    gsap.from(gsap.utils.toArray("[data-char]", name), {
      yPercent: 115,
      duration: 1.3,
      ease: "expo.out",
      stagger: 0.035,
      delay: 0.3,
    });
  }

  // The tray pops up from the middle outward, one bullet after another.
  gsap.from(gsap.utils.toArray("[data-dock-item]", dock), {
    autoAlpha: 0,
    yPercent: 70,
    duration: 0.8,
    ease: "back.out(1.7)",
    stagger: { each: 0.05, from: "center" },
    delay: 0.9,
  });

  // Lines rise out of masks (the same reveal RevealLines uses elsewhere),
  // then the split is undone so the paragraph is plain text again.
  SplitText.create(lead, {
    type: "lines",
    mask: "lines",
    // The words stay readable as plain text; an aria-label isn't allowed on
    // a paragraph.
    aria: "none",
    linesClass: "split-line",
    autoSplit: true,
    onSplit: (self) =>
      gsap.from(self.lines, {
        yPercent: 110,
        duration: 1.1,
        ease: "expo.out",
        stagger: 0.08,
        delay: 0.3,
        onComplete: () => self.revert(),
      }),
  });

  gsap.from(actions.children, {
    autoAlpha: 0,
    y: 18,
    duration: 0.9,
    ease: "power3.out",
    stagger: 0.08,
    delay: 0.65,
  });

  // The label fades up, then the line draws downward from it.
  const [label, line] = Array.from(cue.children);
  gsap
    .timeline({ delay: 1.1 })
    .from(label ?? [], {
      autoAlpha: 0,
      y: 8,
      duration: 0.7,
      ease: "power2.out",
    })
    .from(
      line ?? [],
      { scaleY: 0, transformOrigin: "top", duration: 0.8, ease: "expo.out" },
      "-=0.3",
    );
}

/**
 * Adds a word-by-word rise for a benefit card's title to the hero's scroll
 * timeline, starting at `at` (when the card fades in). Titles are split into
 * words only, which doesn't depend on width, so they never need re-splitting.
 */
export function riseCardTitle(
  timeline: gsap.core.Timeline,
  heading: HTMLElement,
  at: number,
) {
  const { words } = SplitText.create(heading, { type: "words", mask: "words" });
  timeline.from(
    words,
    { yPercent: 110, duration: 0.45, ease: "power3.out", stagger: 0.06 },
    at,
  );
}
