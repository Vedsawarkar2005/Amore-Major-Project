"use client";

import dynamic from "next/dynamic";

// Keep three.js out of the initial bundle and off the server; the page's text
// renders first and the canvas fades in once the chunk loads.
export const LazyLipstickCanvas = dynamic(() => import("./lipstick-canvas"), {
  ssr: false,
});
