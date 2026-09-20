import { ThemeProvider } from "@wrksz/themes/next";
import type { ComponentProps } from "react";
import { AMORE_THEME_PRESET } from "./preset.ts";

type ThemeProviderProps = Omit<
  ComponentProps<typeof ThemeProvider>,
  keyof typeof AMORE_THEME_PRESET
>;

/** Next-aware provider configured with Amore's only supported public themes. */
export function AmoreThemeProvider(props: ThemeProviderProps) {
  return <ThemeProvider {...AMORE_THEME_PRESET} {...props} />;
}
