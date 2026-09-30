"use client";

import React, { useRef } from "react";
import {
  Camera,
  Upload,
  FlipHorizontal,
  Eye,
  EyeOff,
  Download,
  AlertCircle,
  Image as ImageIcon,
  Sparkles,
  Loader2,
  Check,
} from "lucide-react";
import { Shade } from "@/lib/shades/shadesStore";

export type TryOnMode = "CAMERA" | "PHOTO";

export interface TryOnCanvasProps {
  mode: TryOnMode;
  setMode: (mode: TryOnMode) => void;
  isMirror: boolean;
  setIsMirror: (mirror: boolean) => void;
  showOriginal: boolean;
  setShowOriginal: (show: boolean) => void;
  cameraError: string | null;
  isCameraActive: boolean;
  uploadedImageSrc: string | null;
  setUploadedImageSrc: (src: string | null) => void;
  isProcessingPhoto: boolean;
  photoDetectionStatus: string;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  cameraCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  photoCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  handleDownloadSnapshot: () => void;
  shades?: Shade[];
  selectedShadeId?: string;
  onSelectShade?: (shade: Shade) => void;
}

export function TryOnCanvas({
  mode,
  setMode,
  isMirror,
  setIsMirror,
  showOriginal,
  setShowOriginal,
  cameraError,
  isCameraActive,
  uploadedImageSrc,
  setUploadedImageSrc,
  isProcessingPhoto,
  photoDetectionStatus,
  videoRef,
  cameraCanvasRef,
  photoCanvasRef,
  handleDownloadSnapshot,
  shades = [],
  selectedShadeId,
  onSelectShade,
}: TryOnCanvasProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  /* ==========================================================
     FILE UPLOAD
  ========================================================== */
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === "string") {
        setUploadedImageSrc(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  /* ==========================================================
     DRAG & DROP
  ========================================================== */
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === "string") {
        setUploadedImageSrc(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Studio Viewport Card */}
      <div className="relative w-full aspect-[4/3] rounded-2xl sm:rounded-3xl border border-neutral-200/80 bg-neutral-950 overflow-hidden shadow-2xl transition-all duration-300 ring-1 ring-black/5">
        {/* ====================================================
            TOP CONTROLS BAR: STATUS & DUAL MODE TOGGLE
        ==================================================== */}
        <div className="absolute top-3.5 left-3.5 right-3.5 z-30 flex items-center justify-between pointer-events-none">
          {/* Status Indicator Badge */}
          <div className="pointer-events-auto flex items-center gap-2 bg-neutral-900/85 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
            <span className="text-[10px] tracking-[0.2em] uppercase font-medium text-neutral-200">
              {mode === "CAMERA" ? "Live Mirror" : "Portrait Studio"}
            </span>
          </div>

          {/* Sleek Dual Video/Photo Mode Switcher */}
          <div className="pointer-events-auto flex items-center bg-neutral-900/90 backdrop-blur-md p-1 rounded-full border border-white/10 shadow-xl">
            <button
              onClick={() => setMode("CAMERA")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all duration-200 ${
                mode === "CAMERA"
                  ? "bg-white text-neutral-900 shadow-md font-semibold"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Camera</span>
            </button>

            <button
              onClick={() => setMode("PHOTO")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all duration-200 ${
                mode === "PHOTO"
                  ? "bg-white text-neutral-900 shadow-md font-semibold"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Photo</span>
            </button>
          </div>
        </div>

        {/* ====================================================
            CAMERA MODE
        ==================================================== */}
        {mode === "CAMERA" && (
          <div className="relative w-full h-full flex items-center justify-center bg-neutral-950">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-contain"
              style={{
                transform: isMirror ? "scaleX(-1)" : "none",
              }}
            />

            {/* Rendered lipstick canvas overlay */}
            <canvas
              ref={cameraCanvasRef}
              className="absolute inset-0 w-full h-full object-contain pointer-events-none"
              style={{
                transform: isMirror ? "scaleX(-1)" : "none",
              }}
            />

            {/* Camera error state */}
            {cameraError && (
              <div className="absolute inset-0 z-40 bg-neutral-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
                <AlertCircle className="w-10 h-10 text-rose-400 mb-3" />
                <h3 className="text-base font-serif font-medium text-white tracking-wide mb-1.5 uppercase">
                  Camera Feed Inactive
                </h3>
                <p className="text-xs text-neutral-400 max-w-sm mb-5 leading-relaxed">
                  {cameraError}
                </p>
                <button
                  onClick={() => setMode("PHOTO")}
                  className="px-5 py-2 rounded-full bg-white text-black text-xs font-medium tracking-wider uppercase hover:bg-neutral-200 transition shadow"
                >
                  Switch to Photo Upload
                </button>
              </div>
            )}
          </div>
        )}

        {/* ====================================================
            PHOTO MODE
        ==================================================== */}
        {mode === "PHOTO" && (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="relative w-full h-full flex items-center justify-center bg-neutral-950 p-2 sm:p-4"
          >
            {uploadedImageSrc ? (
              <div className="relative w-full h-full flex items-center justify-center">
                <canvas
                  ref={photoCanvasRef}
                  className="max-w-full max-h-full object-contain rounded-xl shadow-inner"
                />

                {isProcessingPhoto && (
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center rounded-xl">
                    <div className="flex flex-col items-center gap-2.5">
                      <Loader2 className="w-7 h-7 text-white animate-spin" />
                      <span className="text-[11px] uppercase tracking-widest text-neutral-200 font-medium">
                        Simulating Couture Finish...
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-neutral-700/80 rounded-2xl max-w-sm bg-neutral-900/50 backdrop-blur">
                <ImageIcon className="w-10 h-10 text-neutral-500 mb-3 stroke-[1.5]" />
                <h3 className="text-sm font-serif uppercase tracking-widest text-white mb-1.5 font-medium">
                  Upload Atelier Portrait
                </h3>
                <p className="text-[11px] text-neutral-400 mb-4 font-light leading-relaxed">
                  Select a clear, well-lit photo (JPG, PNG, WebP) to analyze your skin tone and test shades.
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-5 py-2 rounded-full bg-white text-black text-xs uppercase tracking-wider font-semibold hover:bg-neutral-200 transition shadow"
                >
                  Choose File
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            )}
          </div>
        )}

        {/* ====================================================
            MINIMALIST SHADE SELECTOR OVERLAY & WORKSPACE DOCK
        ==================================================== */}
        <div className="absolute bottom-3 left-3 right-3 z-30 flex flex-col gap-2 pointer-events-none">
          {/* Quick-Access Minimalist Shade Selector Overlay */}
          {shades.length > 0 && onSelectShade && (
            <div className="pointer-events-auto flex items-center justify-center overflow-x-auto py-1 px-2.5 bg-black/60 backdrop-blur-md rounded-2xl border border-white/10 shadow-lg mx-auto max-w-full no-scrollbar">
              <div className="flex items-center gap-1.5 sm:gap-2">
                {shades.slice(0, 8).map((shade) => {
                  const isSelected = shade.id === selectedShadeId;
                  return (
                    <button
                      key={shade.id}
                      onClick={() => onSelectShade(shade)}
                      title={`${shade.name} (${shade.finish})`}
                      className={`group relative p-0.5 rounded-full transition-all duration-200 ${
                        isSelected
                          ? "ring-2 ring-white scale-110 shadow-md"
                          : "opacity-75 hover:opacity-100 hover:scale-105"
                      }`}
                    >
                      <div
                        className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-white/30 flex items-center justify-center shadow-inner"
                        style={{ backgroundColor: shade.hex }}
                      >
                        {isSelected && (
                          <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white stroke-[3] drop-shadow" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Bottom Viewport Action Bar */}
          <div className="pointer-events-auto flex items-center justify-between bg-neutral-900/80 backdrop-blur-md border border-white/10 rounded-2xl px-3 sm:px-4 py-2 shadow-xl">
            {mode === "CAMERA" ? (
              <button
                onClick={() => setIsMirror(!isMirror)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-medium transition ${
                  isMirror
                    ? "bg-white/90 text-neutral-950 font-semibold"
                    : "bg-white/10 text-neutral-300 hover:text-white"
                }`}
                title="Toggle Mirror Flip"
              >
                <FlipHorizontal className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mirror</span>
              </button>
            ) : (
              <label className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/10 text-neutral-300 hover:text-white text-[11px] font-medium cursor-pointer transition">
                <Upload className="w-3.5 h-3.5" />
                <span>Change</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            )}

            <div className="flex items-center gap-2">
              <button
                onMouseDown={() => setShowOriginal(true)}
                onMouseUp={() => setShowOriginal(false)}
                onMouseLeave={() => setShowOriginal(false)}
                onTouchStart={() => setShowOriginal(true)}
                onTouchEnd={() => setShowOriginal(false)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-medium transition ${
                  showOriginal
                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                    : "bg-white/10 text-neutral-300 hover:text-white"
                }`}
                title="Hold to see original lips without lipstick"
              >
                {showOriginal ? (
                  <EyeOff className="w-3.5 h-3.5 text-rose-300" />
                ) : (
                  <Eye className="w-3.5 h-3.5" />
                )}
                <span>Compare</span>
              </button>

              <button
                onClick={handleDownloadSnapshot}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-neutral-200 text-neutral-950 text-[11px] font-semibold tracking-wide transition shadow"
                title="Download high-resolution simulation portrait"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Detection status toast / pill below canvas */}
      {mode === "PHOTO" && photoDetectionStatus && (
        <div className="mt-2.5 px-4 py-1.5 rounded-full bg-neutral-100 border border-neutral-200 text-[11px] text-neutral-600 flex items-center gap-2 shadow-sm animate-fade-in">
          <Sparkles className="w-3.5 h-3.5 text-rose-600" />
          <span className="font-light">{photoDetectionStatus}</span>
        </div>
      )}
    </div>
  );
}
