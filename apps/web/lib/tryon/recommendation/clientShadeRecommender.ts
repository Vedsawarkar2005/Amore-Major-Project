"use client";

import { DEFAULT_SHADES, Shade } from "@/lib/shades/shadesStore";
import { NormalizedLandmark } from "@/lib/tryon/lips/lipMask";

export type RecommendedShadeResult = {
  id: string;
  name: string;
  hex: string;
  finish: string;
  compatibility: number;
  lab: {
    L: number;
    a: number;
    b: number;
  };
};

export type ClientRecommendationOutput = {
  success: boolean;
  skin_tone: string;
  skin_tone_probabilities: Record<string, number>;
  skin_lab: {
    L: number;
    a: number;
    b: number;
  };
  recommendations: RecommendedShadeResult[];
};

/* ============================================================
   CIE LAB COLOR CONVERSIONS
============================================================ */

function srgbToLinear(val: number): number {
  const v = val / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace("#", "").trim();
  const normalized =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  const value = parseInt(normalized, 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

export function rgbToLab(r: number, g: number, b: number): { L: number; a: number; b: number } {
  const R = srgbToLinear(r);
  const G = srgbToLinear(g);
  const B = srgbToLinear(b);

  const x = (R * 0.4124564 + G * 0.3575761 + B * 0.1804375) / 0.95047;
  const y = (R * 0.2126729 + G * 0.7151522 + B * 0.072175) / 1.0;
  const z = (R * 0.0193339 + G * 0.119192 + B * 0.9503041) / 1.08883;

  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);

  const fx = f(x);
  const fy = f(y);
  const fz = f(z);

  const L = 116 * fy - 16;
  const labA = 500 * (fx - fy);
  const labB = 200 * (fy - fz);

  return { L, a: labA, b: labB };
}

function labToHue(lab: { L: number; a: number; b: number }): number {
  const deg = (Math.atan2(lab.b, lab.a) * 180) / Math.PI;
  return (deg + 360) % 360;
}

function labToChroma(lab: { L: number; a: number; b: number }): number {
  return Math.sqrt(lab.a * lab.a + lab.b * lab.b);
}

function hueDifference(h1: number, h2: number): number {
  const diff = Math.abs(h1 - h2);
  return Math.min(diff, 360 - diff);
}

function normalize(value: number, min: number, max: number): number {
  if (max === min) return 0;
  const v = (value - min) / (max - min);
  return Math.max(0, Math.min(1, v));
}

/* ============================================================
   SKIN TONE CLASSIFICATION & COMPATIBILITY
============================================================ */

export function calculateCompatibility(
  skinLab: { L: number; a: number; b: number },
  shadeLab: { L: number; a: number; b: number }
): number {
  const skinHue = labToHue(skinLab);
  const skinChroma = labToChroma(skinLab);
  const shadeHue = labToHue(shadeLab);
  const shadeChroma = labToChroma(shadeLab);

  // 1. Hue compatibility
  const hueDiff = hueDifference(skinHue, shadeHue);
  const hueScore = 1 - normalize(hueDiff, 0, 180);

  // 2. Chroma compatibility
  const chromaDiff = Math.abs(skinChroma - shadeChroma);
  const chromaScore = 1 - normalize(chromaDiff, 0, 80);

  // 3. Lightness contrast (ideal ~25 for flattering depth)
  const lightnessDiff = Math.abs(skinLab.L - shadeLab.L);
  const contrastDiff = Math.abs(lightnessDiff - 25);
  const contrastScore = 1 - normalize(contrastDiff, 0, 50);

  // 4. Color richness
  const richnessScore = normalize(shadeChroma, 10, 70);

  const score =
    hueScore * 0.35 +
    chromaScore * 0.2 +
    contrastScore * 0.3 +
    richnessScore * 0.15;

  return Math.round(Math.max(0, Math.min(1, score)) * 1000) / 10;
}

export function classifySkinTone(skinLab: { L: number; a: number; b: number }): {
  skin_tone: string;
  probabilities: Record<string, number>;
} {
  const L = skinLab.L;

  if (L >= 64) {
    return {
      skin_tone: "light",
      probabilities: { light: 0.85, fair: 0.11, dark: 0.04 },
    };
  } else if (L >= 50) {
    return {
      skin_tone: "fair",
      probabilities: { fair: 0.81, light: 0.12, dark: 0.07 },
    };
  } else if (L >= 38) {
    return {
      skin_tone: "medium",
      probabilities: { fair: 0.28, dark: 0.65, light: 0.07 },
    };
  } else {
    return {
      skin_tone: "dark",
      probabilities: { dark: 0.88, fair: 0.09, light: 0.03 },
    };
  }
}

/**
 * Samples pure cheek & forehead skin pixels using facial landmarks
 * to avoid lips, teeth, eyes, and hair.
 */
export function sampleSkinFromLandmarks(
  ctx: CanvasRenderingContext2D,
  landmarks: NormalizedLandmark[],
  width: number,
  height: number
): { L: number; a: number; b: number } {
  // Landmarks for cheeks & forehead:
  // Left cheek: 117, 123, 187, 234
  // Right cheek: 346, 352, 411, 454
  // Forehead: 10, 67, 109, 297, 338
  const sampleIndices = [117, 123, 187, 346, 352, 411, 10, 67, 109];
  let totalR = 0;
  let totalG = 0;
  let totalB = 0;
  let sampleCount = 0;

  for (const idx of sampleIndices) {
    const pt = landmarks[idx];
    if (!pt) continue;

    const px = Math.floor(pt.x * width);
    const py = Math.floor(pt.y * height);

    if (px < 1 || px >= width - 1 || py < 1 || py >= height - 1) continue;

    try {
      const data = ctx.getImageData(px - 1, py - 1, 3, 3).data;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        // Filter out extreme glare or dark shadows
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        if (lum > 25 && lum < 245) {
          totalR += r;
          totalG += g;
          totalB += b;
          sampleCount++;
        }
      }
    } catch {
      // Fallback ignore if boundary issue
    }
  }

  if (sampleCount === 0) {
    // Fallback: center 20% patch
    const cx = Math.floor(width * 0.5);
    const cy = Math.floor(height * 0.35); // forehead / upper nose
    const data = ctx.getImageData(cx - 10, cy - 10, 20, 20).data;
    for (let i = 0; i < data.length; i += 4) {
      totalR += data[i];
      totalG += data[i + 1];
      totalB += data[i + 2];
      sampleCount++;
    }
  }

  const avgR = sampleCount > 0 ? totalR / sampleCount : 180;
  const avgG = sampleCount > 0 ? totalG / sampleCount : 140;
  const avgB = sampleCount > 0 ? totalB / sampleCount : 120;

  return rgbToLab(avgR, avgG, avgB);
}

/**
 * Generate full recommendation output matching the Python FastAPI API structure.
 */
export function generateClientRecommendations(
  skinLab: { L: number; a: number; b: number },
  catalogue: Shade[] = DEFAULT_SHADES,
  maxResults: number = 5
): ClientRecommendationOutput {
  const { skin_tone, probabilities } = classifySkinTone(skinLab);

  const results: RecommendedShadeResult[] = catalogue.map((shade) => {
    const rgb = hexToRgb(shade.hex);
    const shadeLab = rgbToLab(rgb.r, rgb.g, rgb.b);
    const score = calculateCompatibility(skinLab, shadeLab);

    return {
      id: shade.id,
      name: shade.name,
      hex: shade.hex,
      finish: shade.finish,
      compatibility: score,
      lab: {
        L: Math.round(shadeLab.L * 100) / 100,
        a: Math.round(shadeLab.a * 100) / 100,
        b: Math.round(shadeLab.b * 100) / 100,
      },
    };
  });

  results.sort((a, b) => b.compatibility - a.compatibility);

  return {
    success: true,
    skin_tone,
    skin_tone_probabilities: probabilities,
    skin_lab: {
      L: Math.round(skinLab.L * 100) / 100,
      a: Math.round(skinLab.a * 100) / 100,
      b: Math.round(skinLab.b * 100) / 100,
    },
    recommendations: results.slice(0, maxResults),
  };
}
