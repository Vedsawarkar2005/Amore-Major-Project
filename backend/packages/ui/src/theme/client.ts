"use client";

import {
  type ResolvedTheme,
  type ThemeSelection,
  type ThemeValueMap,
  useTheme,
  useThemeEffect,
  useThemeValue,
} from "@wrksz/themes/client";
import type { DependencyList, EffectCallback } from "react";
import type { AmoreTheme } from "./themes.ts";

/**
 * Typed view of the context created by @wrksz/themes' Next-aware provider.
 * The generic hook shares that provider's context; factory helpers create an isolated one.
 */
export function useAmoreTheme() {
  return useTheme<AmoreTheme>();
}

/** Run an effect after the selected or resolved Amore theme changes. */
export function useAmoreThemeEffect(
  effect: (
    theme: ThemeSelection<AmoreTheme> | undefined,
    resolvedTheme: ResolvedTheme<AmoreTheme> | undefined,
  ) => ReturnType<EffectCallback>,
  dependencies?: DependencyList,
) {
  useThemeEffect<AmoreTheme>(effect, dependencies);
}

/** Select a typed value for the active Amore theme with optional fallback support. */
export function useAmoreThemeValue<Value>(map: ThemeValueMap<AmoreTheme, Value>) {
  return useThemeValue(map) as Value | undefined;
}
