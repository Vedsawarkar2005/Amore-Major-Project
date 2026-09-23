"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  getFaceLandmarkerForImage,
  getFaceLandmarkerForVideo,
} from "@/lib/tryon/face/faceLandmarker";
import { createLipMask } from "@/lib/tryon/lips/lipMask";
import {
  applyLipstick,
  FinishType,
} from "@/lib/tryon/lips/realistic-lipstickRenderer";
import { useShades, Shade } from "@/lib/shades/shadesStore";

import { TryOnCanvas, TryOnMode } from "@/components/tryon/TryOnCanvas";
import { InteractiveLipstick } from "@/components/tryon/InteractiveLipstick";
import { ShadeDock } from "@/components/tryon/ShadeDock";

export default function TryOnStudioPage() {
  const { shades, loaded: shadesLoaded } = useShades();

  // Selected Shade & Finish state
  const [selectedShadeId, setSelectedShadeId] = useState<string>("");
  const [selectedFinish, setSelectedFinish] =
    useState<FinishType>("Velvet Matte");
  const [opacity, setOpacity] = useState<number>(0.75);

  // Try-On Mode state
  const [mode, setMode] = useState<TryOnMode>("CAMERA");

  // Camera settings & status
  const [isMirror, setIsMirror] = useState<boolean>(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);

  // Photo settings & status
  const [uploadedImageSrc, setUploadedImageSrc] = useState<string | null>(
    "/test-images/test-face.jpg",
  );
  const [isProcessingPhoto, setIsProcessingPhoto] = useState<boolean>(false);
  const [photoDetectionStatus, setPhotoDetectionStatus] = useState<string>("");

  // Compare & Overlay Toggle
  const [showOriginal, setShowOriginal] = useState<boolean>(false);

  // Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const photoCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const cameraCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const imageElementRef = useRef<HTMLImageElement | null>(null);

  // Default shade selection
  useEffect(() => {
    if (shades.length > 0 && !selectedShadeId) {
      setSelectedShadeId(shades[0].id);
      setSelectedFinish(shades[0].finish);
    }
  }, [shades, selectedShadeId]);

  const activeShade: Shade | undefined =
    shades.find((s) => s.id === selectedShadeId) || shades[0];

  // ----------------------------------------------------
  // PHOTO TRY-ON LOGIC (STATIC IMAGE MODE)
  // ----------------------------------------------------
  const renderPhotoTryOn = useCallback(async () => {
    if (!uploadedImageSrc || !photoCanvasRef.current || !activeShade) return;

    try {
      setIsProcessingPhoto(true);
      setPhotoDetectionStatus("Detecting facial landmarks...");

      const canvas = photoCanvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = uploadedImageSrc;
      await img.decode();
      imageElementRef.current = img;

      // Sync canvas dimensions with image natural size
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      // Draw base photo
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      if (showOriginal) {
        setPhotoDetectionStatus("Showing unpainted original photo.");
        setIsProcessingPhoto(false);
        return;
      }

      // Detect face landmarker
      const landmarker = await getFaceLandmarkerForImage();
      const result = landmarker.detect(img);

      if (!result.faceLandmarks || result.faceLandmarks.length === 0) {
        setPhotoDetectionStatus("No face detected in uploaded photo.");
        setIsProcessingPhoto(false);
        return;
      }

      setPhotoDetectionStatus("Face detected. Rendering lipstick tint...");
      const landmarks = result.faceLandmarks[0];

      // Create lip mask Path2D
      const lipMask = createLipMask(
        ctx,
        landmarks,
        canvas.width,
        canvas.height,
      );

      // Apply lipstick tint
      applyLipstick(ctx, lipMask, canvas.width, canvas.height, {
        color: activeShade.hex,
        finish: selectedFinish,
        opacity: opacity,
      });

      setPhotoDetectionStatus(`Try-On Active: ${activeShade.name}`);
    } catch (err) {
      console.error("Photo try-on error:", err);
      setPhotoDetectionStatus("Failed to render face try-on.");
    } finally {
      setIsProcessingPhoto(false);
    }
  }, [uploadedImageSrc, activeShade, opacity, selectedFinish, showOriginal]);

  useEffect(() => {
    if (mode === "PHOTO") {
      renderPhotoTryOn();
    }
  }, [mode, renderPhotoTryOn]);

  // ----------------------------------------------------
  // LIVE CAMERA TRY-ON LOGIC (60 FPS VIDEO MODE)
  // ----------------------------------------------------
  useEffect(() => {
    if (mode !== "CAMERA") {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
      setIsCameraActive(false);
      return;
    }

    let isSubscribed = true;

    async function startCameraStream() {
      try {
        setCameraError(null);
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user",
          },
          audio: false,
        });

        if (!isSubscribed) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setIsCameraActive(true);
        }

        const landmarker = await getFaceLandmarkerForVideo();

        function processVideoFrame() {
          if (!isSubscribed || !videoRef.current || !cameraCanvasRef.current)
            return;

          const video = videoRef.current;
          const canvas = cameraCanvasRef.current;
          const ctx = canvas.getContext("2d");

          if (
            video.readyState >= 2 &&
            video.videoWidth > 0 &&
            video.videoHeight > 0 &&
            ctx
          ) {
            if (
              canvas.width !== video.videoWidth ||
              canvas.height !== video.videoHeight
            ) {
              canvas.width = video.videoWidth;
              canvas.height = video.videoHeight;
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (!showOriginal && activeShade) {
              const now = performance.now();
              const result = landmarker.detectForVideo(video, now);

              if (result.faceLandmarks && result.faceLandmarks.length > 0) {
                const landmarks = result.faceLandmarks[0];
                const lipMask = createLipMask(
                  ctx,
                  landmarks,
                  canvas.width,
                  canvas.height,
                );

                applyLipstick(ctx, lipMask, canvas.width, canvas.height, {
                  color: activeShade.hex,
                  finish: selectedFinish,
                  opacity: opacity,
                });
              }
            }
          }

          animFrameIdRef.current = requestAnimationFrame(processVideoFrame);
        }

        processVideoFrame();
      } catch (err: unknown) {
        console.error("Camera access error:", err);
        if (isSubscribed) {
          setCameraError(
            "Camera access denied or unavailable. Try photo upload mode.",
          );
          setIsCameraActive(false);
        }
      }
    }

    startCameraStream();

    return () => {
      isSubscribed = false;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [mode, activeShade, selectedFinish, opacity, showOriginal]);

  // Snapshot / Download feature
  const handleDownloadSnapshot = () => {
    const targetCanvas =
      mode === "CAMERA" ? cameraCanvasRef.current : photoCanvasRef.current;
    if (!targetCanvas) return;

    const link = document.createElement("a");
    link.download = `amore-tryon-${activeShade?.name.toLowerCase().replace(/\s+/g, "-") || "shade"}.png`;
    link.href = targetCanvas.toDataURL("image/png");
    link.click();
  };

  const handleSelectShade = (shadeId: string) => {
    setSelectedShadeId(shadeId);
    const targetShade = shades.find((s) => s.id === shadeId);
    if (targetShade) {
      setSelectedFinish(targetShade.finish);
    }
  };

  const handleClearShade = () => {
    setSelectedShadeId("");
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans flex flex-col selection:bg-black selection:text-white">
      

      {/* 2. Main Studio Workspace - Responsive Split-Screen Layout */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left Column: Try-On Canvas (Camera / Photo Stream) */}
        <section
          aria-label="Try-On Canvas Viewport"
          className="w-full flex justify-center"
        >
          <TryOnCanvas
            mode={mode}
            setMode={setMode}
            isMirror={isMirror}
            setIsMirror={setIsMirror}
            showOriginal={showOriginal}
            setShowOriginal={setShowOriginal}
            cameraError={cameraError}
            isCameraActive={isCameraActive}
            uploadedImageSrc={uploadedImageSrc}
            setUploadedImageSrc={setUploadedImageSrc}
            isProcessingPhoto={isProcessingPhoto}
            photoDetectionStatus={photoDetectionStatus}
            videoRef={videoRef}
            cameraCanvasRef={cameraCanvasRef}
            photoCanvasRef={photoCanvasRef}
            handleDownloadSnapshot={handleDownloadSnapshot}
          />
        </section>

        {/* Right Column: Interactive Lipstick Visual & Floating 2x6 Shade Dock */}
        <section
          aria-label="Interactive Product & Shade Selection"
          className="w-full flex flex-col items-center relative"
        >
          <div className="relative w-full max-w-lg flex flex-col items-center">
            {/* Interactive Lipstick Display */}
            <div className="w-full pb-16">
              <InteractiveLipstick
                activeShade={activeShade}
                isSelected={!!selectedShadeId}
              />
            </div>

            {/* Floating 2x6 Shade Dock Overlaid across lower portion */}
            <div className="w-full -mt-24 sm:-mt-32 z-30 relative">
              <ShadeDock
                shades={shades}
                selectedShadeId={selectedShadeId}
                onSelectShade={handleSelectShade}
                selectedFinish={selectedFinish}
                setSelectedFinish={setSelectedFinish}
                opacity={opacity}
                setOpacity={setOpacity}
                activeShade={activeShade}
                onClearShade={handleClearShade}
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
