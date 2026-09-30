"use client";

import dynamic from "next/dynamic";

export const SwatchStudioClient = dynamic(
  () =>
    import("@/features/landing/sections/swatch-studio").then(
      (mod) => mod.SwatchStudio,
    ),
  {
    ssr: false,
  },
);
