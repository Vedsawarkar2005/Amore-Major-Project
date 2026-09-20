import { AMORE_THEMES, DEFAULT_THEME } from "./themes.ts";

/** Shared provider policy used by both applications and future React surfaces. */
export const AMORE_THEME_PRESET = {
  attribute: "class",
  defaultTheme: DEFAULT_THEME,
  disableTransitionOnChange: true,
  enableSystem: false,
  // Origin-local persistence works on localhost, Vercel previews, and production domains.
  storage: "localStorage",
  storageKey: "amore-theme",
  themes: AMORE_THEMES,
} as const;
