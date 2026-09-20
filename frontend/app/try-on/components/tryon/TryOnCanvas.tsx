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
} from "lucide-react";

export type TryOnMode = "CAMERA" | "PHOTO";

interface TryOnCanvasProps {
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
}: TryOnCanvasProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === "string") {
        setUploadedImageSrc(event.target.result);
      }
    };
    reader.readAsDataURL(file);
    // Reset input value to allow re-uploading the same file
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (typeof event.target?.result === "string") {
          setUploadedImageSrc(event.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Hidden Global File Input for Photo Uploads */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Portrait Card Container (Figma Gray Try-On Canvas Placeholder) */}
      <div className="relative w-full max-w-md aspect-[3/4] rounded-3xl border border-zinc-300/80 bg-zinc-200/60 overflow-hidden shadow-xl flex items-center justify-center group">
        {/* Mode Switcher Pill Overlay Top Right */}
        <div className="absolute top-4 right-4 z-20 flex items-center bg-black/85 backdrop-blur-md p-1 rounded-2xl border border-white/15 shadow-xl">
          <button
            onClick={() => setMode("CAMERA")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              mode === "CAMERA"
                ? "bg-white text-black shadow"
                : "text-zinc-300 hover:text-white"
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Camera</span>
          </button>
          <button
            onClick={() => {
              if (mode === "PHOTO") {
                fileInputRef.current?.click();
              } else {
                setMode("PHOTO");
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              mode === "PHOTO"
                ? "bg-white text-black shadow"
                : "text-zinc-300 hover:text-white"
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Upload</span>
          </button>
        </div>

        {/* Status Tag Overlay Top Left */}
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-black/10 text-xs font-semibold text-black shadow-sm">
          <span className="w-2 h-2 rounded-full bg-black animate-pulse" />
          {mode === "CAMERA" ? "Live Studio" : "Photo Studio"}
        </div>

        {/* ----------------- CAMERA MODE ----------------- */}
        {mode === "CAMERA" && (
          <div className="relative w-full h-full flex items-center justify-center bg-zinc-200">
            <video
              ref={videoRef}
              playsInline
              muted
              onLoadedMetadata={(e) => {
                const v = e.currentTarget;
                if (cameraCanvasRef.current && v.videoWidth && v.videoHeight) {
                  cameraCanvasRef.current.width = v.videoWidth;
                  cameraCanvasRef.current.height = v.videoHeight;
                }
              }}
              className="w-full h-full object-cover transition-transform duration-300"
              style={{ transform: isMirror ? "scaleX(-1)" : "none" }}
            />

            {/* Canvas Overlay for Face Lip Mask */}
            <canvas
              ref={cameraCanvasRef}
              className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-transform duration-300"
              style={{ transform: isMirror ? "scaleX(-1)" : "none" }}
            />

            {/* Error view */}
            {cameraError && (
              <div className="absolute inset-0 bg-white/95 backdrop-blur flex flex-col items-center justify-center p-6 text-center z-30">
                <AlertCircle className="w-10 h-10 text-black mb-3" />
                <h3 className="text-base font-semibold text-black mb-1">
                  Camera Unavailable
                </h3>
                <p className="text-xs text-zinc-600 max-w-xs mb-4">
                  {cameraError}
                </p>
                <button
                  onClick={() => setMode("PHOTO")}
                  className="px-4 py-2 rounded-xl bg-black text-white text-xs font-semibold shadow hover:bg-zinc-800 transition"
                >
                  Switch to Photo Upload
                </button>
              </div>
            )}
          </div>
        )}

        {/* ----------------- PHOTO MODE ----------------- */}
        {mode === "PHOTO" && (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="relative w-full h-full flex flex-col items-center justify-center bg-zinc-200/50 p-2"
          >
            {uploadedImageSrc ? (
              <div className="relative w-full h-full flex items-center justify-center">
                <canvas
                  ref={photoCanvasRef}
                  className="w-full h-full object-cover rounded-2xl"
                />
                {isProcessingPhoto && (
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center rounded-2xl z-20">
                    <Loader2 className="w-8 h-8 text-black animate-spin" />
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-zinc-400 rounded-2xl max-w-xs bg-white/60">
                <ImageIcon className="w-10 h-10 text-zinc-500 mb-2" />
                <h3 className="text-sm font-semibold text-black mb-1">
                  Upload Portrait Image
                </h3>
                <p className="text-[11px] text-zinc-500 mb-4">
                  PNG, JPG or WebP up to 10MB
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-xl bg-black hover:bg-zinc-800 text-white text-xs font-semibold transition"
                >
                  Choose File
                </button>
              </div>
            )}
          </div>
        )}

        {/* Floating Controls Bar (Bottom Black Glassmorphism Overlay) */}
        <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between bg-black/85 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/15 shadow-2xl">
          <div className="flex items-center gap-1.5">
            {mode === "CAMERA" && (
              <button
                onClick={() => setIsMirror(!isMirror)}
                title="Toggle Mirror Feed"
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-medium transition ${
                  isMirror
                    ? "bg-white text-black font-semibold"
                    : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                }`}
              >
                <FlipHorizontal className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mirror</span>
              </button>
            )}

            {mode === "PHOTO" && (
              <button
                onClick={() => fileInputRef.current?.click()}
                title={uploadedImageSrc ? "Change Photo" : "Upload Photo"}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 text-[11px] font-medium transition"
              >
                <Upload className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">
                  {uploadedImageSrc ? "Change" : "Upload"}
                </span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Hold-to-Compare Button */}
            <button
              onMouseDown={() => setShowOriginal(true)}
              onMouseUp={() => setShowOriginal(false)}
              onTouchStart={() => setShowOriginal(true)}
              onTouchEnd={() => setShowOriginal(false)}
              title="Hold to view unpainted original"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold transition select-none ${
                showOriginal
                  ? "bg-white text-black font-bold"
                  : "bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
              }`}
            >
              {showOriginal ? (
                <EyeOff className="w-3.5 h-3.5 text-black" />
              ) : (
                <Eye className="w-3.5 h-3.5 text-zinc-400" />
              )}
              <span>{showOriginal ? "Original" : "Hold Compare"}</span>
            </button>

            {/* Download Snapshot Button */}
            <button
              onClick={handleDownloadSnapshot}
              title="Download Snapshot"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-[11px] font-bold transition shadow-md"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Save</span>
            </button>
          </div>
        </div>
      </div>

      {/* Status notification bar below canvas */}
      {mode === "PHOTO" && photoDetectionStatus && (
        <div className="mt-3 px-4 py-1.5 rounded-xl bg-white border border-zinc-200 text-xs text-zinc-600 flex items-center gap-2 max-w-md w-full shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-black flex-shrink-0" />
          <span className="truncate">{photoDetectionStatus}</span>
        </div>
      )}
    </div>
  );
}
