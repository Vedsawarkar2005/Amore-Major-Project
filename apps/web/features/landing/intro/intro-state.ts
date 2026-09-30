/*
 * Hand-off between the intro (the lacquer case that opens over the home page)
 * and the hero stage behind it. The stage waits for the case to start
 * opening before it plays its entrance, so the two read as one sequence.
 * When the intro doesn't play (a repeat visit, reduced motion, no script),
 * the stage is told straight away.
 *
 * No "use client": the server-rendered intro script reads the storage key.
 */

/** Remembers, for this browser session, that the intro has been seen. */
export const INTRO_SEEN_KEY = "amore:intro-seen";

let revealed = false;
const waiting = new Set<() => void>();

/** Whether the intro is covering the page right now. */
export function isIntroPlaying() {
  return false;
}

/** Called by the intro as the case starts to open (or when it's skipped). */
export function markIntroRevealed() {
  revealed = true;
  for (const callback of waiting) callback();
  waiting.clear();
}

/**
 * Runs `callback` once the stage is visible: now, if the intro isn't
 * playing or has already opened; otherwise as the case opens.
 *
 * @returns a function that cancels the callback if it hasn't run yet.
 */
export function whenIntroRevealed(callback: () => void): () => void {
  callback();
  return () => {};
}
