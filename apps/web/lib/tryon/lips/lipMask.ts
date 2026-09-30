"use client";

export type NormalizedLandmark = {
  x: number;
  y: number;
  z?: number;
};

export type LipBoundingBox = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  boxWidth: number;
  boxHeight: number;
};

/**
 * Calculates a tight bounding box around the lip landmarks with optional padding.
 * Restricting rendering to this bounding box boosts performance up to 50x compared
 * to full-frame processing.
 */
export function getLipBoundingBox(
  landmarks: NormalizedLandmark[],
  width: number,
  height: number,
  padding: number = 16
): LipBoundingBox {
  const outerIndices = [
    61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291,
    146, 91, 181, 84, 17, 314, 405, 321, 375
  ];
  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;

  for (const idx of outerIndices) {
    const pt = landmarks[idx];
    if (!pt) continue;
    const px = pt.x * width;
    const py = pt.y * height;
    if (px < minX) minX = px;
    if (px > maxX) maxX = px;
    if (py < minY) minY = py;
    if (py > maxY) maxY = py;
  }

  const clampedMinX = Math.max(0, Math.floor(minX - padding));
  const clampedMinY = Math.max(0, Math.floor(minY - padding));
  const clampedMaxX = Math.min(width, Math.ceil(maxX + padding));
  const clampedMaxY = Math.min(height, Math.ceil(maxY + padding));

  return {
    minX: clampedMinX,
    minY: clampedMinY,
    maxX: clampedMaxX,
    maxY: clampedMaxY,
    boxWidth: Math.max(1, clampedMaxX - clampedMinX),
    boxHeight: Math.max(1, clampedMaxY - clampedMinY),
  };
}

/**
 * Creates a Path2D mask tracing only the upper and lower lip flesh regions,
 * leaving the inner mouth cavity (teeth, tongue, mouth aperture) hollow.
 */
export function createLipMask(
  ctx: CanvasRenderingContext2D,
  landmarks: NormalizedLandmark[],
  width: number,
  height: number,
) {
  const mask = new Path2D();

  // Official MediaPipe face landmarker lip contours
  const upperOuter = [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291];
  const upperInner = [78, 191, 80, 81, 82, 13, 312, 311, 310, 415, 308];

  const lowerOuter = [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291];
  const lowerInner = [78, 95, 88, 178, 87, 14, 317, 402, 318, 324, 308];

  const getPt = (idx: number) => {
    const pt = landmarks[idx];
    return {
      x: pt ? pt.x * width : 0,
      y: pt ? pt.y * height : 0,
    };
  };

  /*
   * 1. Trace Upper Lip Ribbon (Outer forward + Inner backward)
   */
  const uFirst = getPt(upperOuter[0]);
  mask.moveTo(uFirst.x, uFirst.y);

  for (let i = 1; i < upperOuter.length; i++) {
    const pt = getPt(upperOuter[i]);
    mask.lineTo(pt.x, pt.y);
  }

  for (let i = upperInner.length - 1; i >= 0; i--) {
    const pt = getPt(upperInner[i]);
    mask.lineTo(pt.x, pt.y);
  }

  mask.closePath();

  /*
   * 2. Trace Lower Lip Ribbon (Outer forward + Inner backward)
   */
  const lFirst = getPt(lowerOuter[0]);
  mask.moveTo(lFirst.x, lFirst.y);

  for (let i = 1; i < lowerOuter.length; i++) {
    const pt = getPt(lowerOuter[i]);
    mask.lineTo(pt.x, pt.y);
  }

  for (let i = lowerInner.length - 1; i >= 0; i--) {
    const pt = getPt(lowerInner[i]);
    mask.lineTo(pt.x, pt.y);
  }

  mask.closePath();

  return mask;
}
