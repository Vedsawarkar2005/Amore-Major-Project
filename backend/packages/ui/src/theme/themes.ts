/** Public theme identifiers; product code should never use generic light/dark names. */
export const AMORE_THEMES = ["amore", "amore-dark"] as const;

export type AmoreTheme = (typeof AMORE_THEMES)[number];

export const DEFAULT_THEME: AmoreTheme = "amore";
