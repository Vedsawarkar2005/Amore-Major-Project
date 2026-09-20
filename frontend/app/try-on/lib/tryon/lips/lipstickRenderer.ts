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
      ? clean
        .split("")
        .map((char) => char + char)
        .join("")
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
    opacity = 0.65,
    finish = "Velvet Matte",
  } = options;

  const lipstick = hexToRgb(color);

  /*
   * Create a temporary canvas containing only
   * the lip mask.
   */
  const maskCanvas = document.createElement("canvas");
  maskCanvas.width = width;
  maskCanvas.height = height;

  const maskCtx = maskCanvas.getContext("2d");

  if (!maskCtx) {
    throw new Error("Could not create mask canvas.");
  }

  /*
   * White = lip region
   * Transparent = everything else
   */
  maskCtx.fillStyle = "white";
  maskCtx.fill(mask);

  const maskData = maskCtx.getImageData(0, 0, width, height);

  /*
   * Get the original photograph.
   */
  const imageData = ctx.getImageData(0, 0, width, height);

  const pixels = imageData.data;
  const maskPixels = maskData.data;

  for (let i = 0; i < pixels.length; i += 4) {
    /*
     * If the mask pixel is transparent,
     * don't modify the original image.
     */
    const maskAlpha = maskPixels[i + 3];

    if (maskAlpha === 0) {
      continue;
    }

    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];

    /*
     * Calculate original brightness.
     */
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
    const brightness = luminance / 255;

    /*
     * Adjust color modulation based on Finish texture.
     */
    let targetR: number;
    let targetG: number;
    let targetB: number;

    if (finish === "Matte" || finish === "Velvet Matte") {
      // Velvet Matte / Matte finish: velvety appearance with soft natural highlights
      const matteFactor = 0.75 + 0.25 * brightness;
      targetR = lipstick.r * matteFactor;
      targetG = lipstick.g * matteFactor;
      targetB = lipstick.b * matteFactor;
    } else if (finish === "Glossy") {
      // Glossy finish: vivid color with enhanced specular shine on bright lip highlights
      const glossFactor = 0.6 + 0.4 * brightness;
      const specularShine = Math.pow(brightness, 2.5) * 75;
      targetR = Math.min(255, lipstick.r * glossFactor + specularShine);
      targetG = Math.min(255, lipstick.g * glossFactor + specularShine);
      targetB = Math.min(255, lipstick.b * glossFactor + specularShine);
    } else {
      // Satin finish (default): standard natural brightness preservation
      targetR = lipstick.r * brightness;
      targetG = lipstick.g * brightness;
      targetB = lipstick.b * brightness;
    }

    /*
     * Blend with original pixel.
     */
    pixels[i] = r * (1 - opacity) + targetR * opacity;
    pixels[i + 1] = g * (1 - opacity) + targetG * opacity;
    pixels[i + 2] = b * (1 - opacity) + targetB * opacity;
  }

  ctx.putImageData(imageData, 0, 0);
}