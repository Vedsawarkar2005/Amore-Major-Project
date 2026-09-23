"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Shade } from "@/lib/shades/shadesStore";

interface InteractiveLipstickProps {
  activeShade: Shade | undefined;
  isSelected: boolean;
}

export function InteractiveLipstick({
  activeShade,
  isSelected,
}: InteractiveLipstickProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Render open lipstick with dynamic wax tinting
  useEffect(() => {
    if (!isSelected || !activeShade || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = "/products/lipstick/open.png";

    img.onload = () => {
      // Set canvas size to match image dimensions
      canvas.width = img.width;
      canvas.height = img.height;

      // 1. Clear & Draw base lipstick image (unpainted)
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      // 2. Create offscreen tint canvas for the wax bullet tip
      const tintCanvas = document.createElement("canvas");
      tintCanvas.width = canvas.width;
      tintCanvas.height = canvas.height;
      const tintCtx = tintCanvas.getContext("2d");
      if (!tintCtx) return;

      // Draw original lipstick into tint canvas
      tintCtx.drawImage(img, 0, 0);

      // Define wax bullet tip polygon/mask (top ~54% of the lipstick height)
      const w = canvas.width;
      const h = canvas.height;

      // Wax bullet region mask path
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(w * 0.28, h * 0.54); // Bottom left of wax bullet at swivel edge
      ctx.lineTo(w * 0.26, h * 0.25); // Mid left edge of bullet
      ctx.lineTo(w * 0.48, h * 0.04); // Top slanted tip peak
      ctx.lineTo(w * 0.72, h * 0.25); // Mid right slanted bevel edge
      ctx.lineTo(w * 0.74, h * 0.54); // Bottom right of wax bullet at swivel edge
      ctx.closePath();
      ctx.clip();

      // Apply shade tint layer using multiply & color blend modes
      // First pass: Multiply blend mode for rich color depth
      ctx.globalCompositeOperation = "multiply";
      ctx.fillStyle = activeShade.hex;
      ctx.fillRect(0, 0, w, h);

      // Second pass: Color blend mode to unify hue while preserving lightness
      ctx.globalCompositeOperation = "color";
      ctx.fillStyle = activeShade.hex;
      ctx.globalAlpha = 0.65;
      ctx.fillRect(0, 0, w, h);

      // Third pass: Soft highlight reflection along slanted tip edge
      ctx.globalCompositeOperation = "soft-light";
      const highlightGradient = ctx.createLinearGradient(
        w * 0.3,
        h * 0.1,
        w * 0.7,
        h * 0.4
      );
      highlightGradient.addColorStop(0, "rgba(255, 255, 255, 0.45)");
      highlightGradient.addColorStop(0.5, "rgba(255, 255, 255, 0.05)");
      highlightGradient.addColorStop(1, "rgba(0, 0, 0, 0.3)");
      ctx.fillStyle = highlightGradient;
      ctx.globalAlpha = 0.8;
      ctx.fillRect(0, 0, w, h);

      ctx.restore();
      setImageLoaded(true);
    };
  }, [activeShade, isSelected]);

  return (
    <div className="relative w-full h-full min-h-[380px] sm:min-h-[440px] flex items-center justify-center select-none overflow-hidden">
      {/* Neutral ambient shadow background */}
      <div className="absolute w-72 h-72 rounded-full blur-[90px] bg-zinc-300/40 opacity-40 transition-opacity duration-700 pointer-events-none" />

      {/* Closed Lipstick View (When no shade is active / selected) */}
      <div
        className={`absolute inset-0 flex items-center justify-center transition-all duration-500 transform ${
          !isSelected
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 -translate-y-4 pointer-events-none"
        }`}
      >
        <div className="relative w-44 sm:w-60 h-[340px] sm:h-[420px] drop-shadow-2xl">
          <Image
            src="/products/lipstick/closed.png"
            alt="Amore Luxury Closed Lipstick Casing"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>

      {/* Open Lipstick Canvas View (When shade is active / selected) */}
      <div
        className={`absolute inset-0 flex items-center justify-center transition-all duration-500 transform ${
          isSelected
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-4 pointer-events-none"
        }`}
      >
        <div className="relative w-44 sm:w-60 h-[340px] sm:h-[420px] drop-shadow-2xl flex items-center justify-center">
          <canvas
            ref={canvasRef}
            className="max-w-full max-h-full object-contain filter drop-shadow-xl"
          />
        </div>
      </div>
    </div>
  );
}
