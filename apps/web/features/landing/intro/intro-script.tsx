import { INTRO_SEEN_KEY } from "./intro-state";

/*
 * Decides before first paint whether the intro plays: on the first page
 * view of the browser session, whichever page it is, unless the visitor has asked
 * for reduced motion. Without this script (no JavaScript) the intro stays
 * hidden (see `data-intro` in globals.css). If the page's scripts never take
 * over, the intro is dropped after 8 seconds rather than left covering the
 * page; once they do, they cancel that timer (`__introFallback`).
 */
const decide = `(() => {
  const root = document.documentElement;
  try {
    if (sessionStorage.getItem("${INTRO_SEEN_KEY}") || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      root.dataset.intro = "skip";
      return;
    }
  } catch {}
  root.dataset.intro = "play";
  // The page's scripts cancel this once they take over (see IntroCase).
  window.__introFallback = setTimeout(() => {
    if (root.dataset.intro === "play") root.dataset.intro = "done";
  }, 8000);
})()`;

/**
 * Render at the top of the root layout's <body>, like the theme script: the
 * root layout never re-renders on client navigation, so the script runs once,
 * on the page that was loaded.
 */
export function IntroScript() {
  return (
    <script
      // biome-ignore lint/security/noDangerouslySetInnerHtml: static script, no user input
      dangerouslySetInnerHTML={{ __html: decide }}
      suppressHydrationWarning
    />
  );
}
