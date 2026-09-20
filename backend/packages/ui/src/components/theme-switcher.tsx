"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import { type ComponentProps, useEffect, useState } from "react";
import { useAmoreTheme } from "../theme/client.ts";
import { Button } from "./primitives/button.tsx";

export type ThemeSwitcherProps = Pick<
  ComponentProps<typeof Button>,
  "className" | "variant" | "disabled" | "id"
>;

/** Switch between Amore's light and dark themes inside an AmoreThemeProvider. */
export function ThemeSwitcher({
  variant = "outline",
  disabled = false,
  ...props
}: ThemeSwitcherProps) {
  const { resolvedTheme, setTheme } = useAmoreTheme();
  const [mounted, setMounted] = useState(false);

  // The server cannot read localStorage; keep the initial icon and label identical on hydration.
  useEffect(() => setMounted(true), []);

  const ready = mounted && resolvedTheme !== undefined;
  const isDark = ready && resolvedTheme === "amore-dark";
  const label = ready ? `Switch to ${isDark ? "light" : "dark"} theme` : "Change theme";
  const Icon = isDark ? SunIcon : MoonIcon;

  return (
    <Button
      {...props}
      type="button"
      variant={variant}
      size="icon"
      disabled={disabled || !ready}
      aria-label={label}
      title={label}
      onClick={() => setTheme(isDark ? "amore" : "amore-dark")}
    >
      <Icon aria-hidden="true" data-icon="inline-start" />
    </Button>
  );
}
