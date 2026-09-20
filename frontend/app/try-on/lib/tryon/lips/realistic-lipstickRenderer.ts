"use client";

export type FinishType = "Matte" | "Velvet Matte" | "Satin" | "Glossy";

export type LipstickOptions = {
  color: string;
  opacity?: number;
  finish?: FinishType;
};

function hexToRgb(hex: string) {
  const clean = hex.replace("#", "");
  const value =
    clean.length === 3
      ? clean.split("").map((char) => char + char).join("")
      : clean;
  const number = Number.parseInt(value, 16);
  return {
    r: (number >> 16) & 255,
    g: (number >> 8) & 255,
    b: number & 255,
  };
}

export function applyLipstick(
  ctx: CanvasRenderingContext2D,
  mask: Path2D,
  width: number,
  height: number,
  options: LipstickOptions,
) {
  const {
    color,
    opacity = 0.5,
    finish = "Velvet Matte",
  } = options;

  const lipstick = hexToRgb(color);

  // 1. Create a temporary canvas for the mask
  const maskCanvas = document.createElement("canvas");
  maskCanvas.width = width;
  maskCanvas.height = height;
  const maskCtx = maskCanvas.getContext("2d");
  if (!maskCtx) return;

  // 2. EDGE SMOOTHING: Apply a blur filter to feather the mask edges
  maskCtx.filter = "blur(4px)";
  maskCtx.fillStyle = "white";
  maskCtx.fill(mask);

  const maskData = maskCtx.getImageData(0, 0, width, height);
  const imageData = ctx.getImageData(0, 0, width, height);
  const pixels = imageData.data;
  const maskPixels = maskData.data;

  for (let i = 0; i < pixels.length; i += 4) {
    const alpha = maskPixels[i + 3]; // 0 to 255 from the blurred mask
    if (alpha === 0) continue;

    const normalizationFactor = (alpha / 255) * opacity;

    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];

    // Preserve natural brightness/texture (Luminance calculation)
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
    const brightness = luminance / 255;

    let targetR: number, targetG: number, targetB: number;

    if (finish === "Glossy") {
      const gloss = Math.pow(brightness, 2) * 50;
      targetR = Math.min(255, lipstick.r * 0.7 + gloss);
      targetG = Math.min(255, lipstick.g * 0.7 + gloss);
      targetB = Math.min(255, lipstick.b * 0.7 + gloss);
    } else {
      // Matte / Velvet texture scaling based on original lighting
      const textureFactor = 0.7 + 0.3 * brightness;
      targetR = lipstick.r * textureFactor;
      targetG = lipstick.g * textureFactor;
      targetB = lipstick.b * textureFactor;
    }

    // Smooth float alpha blending
    pixels[i]     = r * (1 - normalizationFactor)     + targetR * normalizationFactor;
    pixels[i + 1] = g * (1 - normalizationFactor) + targetG * normalizationFactor;
    pixels[i + 2] = b * (1 - normalizationFactor) + targetB * normalizationFactor;
  }

  ctx.putImageData(imageData, 0, 0);
}