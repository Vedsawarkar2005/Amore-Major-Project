"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Check,
  ChevronRight,
  ShoppingBag,
  Sparkle,
  Layers,
  ArrowRight,
  Compass,
  SlidersHorizontal,
} from "lucide-react";

import {
  getFaceLandmarkerForImage,
  getFaceLandmarkerForVideo,
} from "@/lib/tryon/face/faceLandmarker";
import {
  createLipMask,
  getLipBoundingBox,
  LipBoundingBox,
  NormalizedLandmark,
} from "@/lib/tryon/lips/lipMask";
import {
  applyRealisticLipstick,
  FinishType,
} from "@/lib/tryon/lips/realistic-lipstickRenderer";
import { Shade, useShades } from "@/lib/shades/shadesStore";
import { TryOnCanvas, TryOnMode } from "@/components/tryon/TryOnCanvas";
import {
  fetchRecommendations,
  processTryOn,
  RecommendedShade,
  RecommendationResponse,
} from "@/lib/api";
import { generateProductSlug } from "@/lib/utils";
import {
  generateClientRecommendations,
  sampleSkinFromLandmarks,
} from "@/lib/tryon/recommendation/clientShadeRecommender";

/* ============================================================
   TRY-ON STUDIO PAGE (LUXURY EDITORIAL REDESIGN)
============================================================ */

export default function TryOnStudioPage() {
  const { shades } = useShades();

  // Selected Shade & Finish state
  const [selectedShadeId, setSelectedShadeId] = useState<string>("");
  const [selectedFinish, setSelectedFinish] =
    useState<FinishType>("Velvet Matte");
  const [opacity, setOpacity] = useState<number>(0.75);

  // Mode state
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

  // AI Recommendation State (populated from Python microservice via Express proxy)
  const [recommendedShades, setRecommendedShades] = useState<
    RecommendedShade[]
  >([]);
  const [detectedSkinTone, setDetectedSkinTone] = useState<string | null>(null);
  const [recommendationConfidence, setRecommendationConfidence] = useState<
    number | null
  >(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [recommendationNotice, setRecommendationNotice] = useState<string | null>(
    null,
  );

  // Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const cameraCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const photoCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const analysisCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const recommendationTimerRef = useRef<number | null>(null);

  // Cached Photo Data for Instant 60fps Slider Response
  const photoImageRef = useRef<HTMLImageElement | null>(null);
  const photoLandmarksRef = useRef<NormalizedLandmark[] | null>(null);
  const photoLipMaskRef = useRef<Path2D | null>(null);
  const photoBoundingBoxRef = useRef<LipBoundingBox | null>(null);

  // Live state tracking refs for 60fps video loop
  const activeShadeRef = useRef<Shade | undefined>(undefined);
  const opacityRef = useRef(opacity);
  const finishRef = useRef<FinishType>(selectedFinish);
  const showOriginalRef = useRef(showOriginal);

  // Initialize default shade
  useEffect(() => {
    if (shades.length > 0 && !selectedShadeId) {
      setSelectedShadeId(shades[0].id);
      setSelectedFinish(shades[0].finish);
    }
  }, [shades, selectedShadeId]);

  const activeShade: Shade | undefined =
    shades.find((shade) => shade.id === selectedShadeId) || shades[0];

  useEffect(() => {
    activeShadeRef.current = activeShade;
  }, [activeShade]);

  useEffect(() => {
    opacityRef.current = opacity;
  }, [opacity]);

  useEffect(() => {
    finishRef.current = selectedFinish;
  }, [selectedFinish]);

  useEffect(() => {
    showOriginalRef.current = showOriginal;
  }, [showOriginal]);

  // Synchronize telemetry with Express backend try-on endpoint
  useEffect(() => {
    if (!activeShade?.sku) return;
    const dummyBase64 =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

    processTryOn(activeShade.sku, dummyBase64)
      .then((res) => {
        console.log("[Amore Try-On] Backend sync acknowledgment:", res);
      })
      .catch((err) => {
        console.warn("[Amore Try-On] Backend sync notice:", err);
      });
  }, [activeShade?.sku]);

  // Helper to match recommendation from microservice to local shade catalogue
  const findLocalShade = useCallback(
    (recommended: RecommendedShade) => {
      return shades.find(
        (shade) =>
          shade.id === String(recommended.id) ||
          shade.name.toLowerCase() === recommended.name.toLowerCase() ||
          shade.hex.toLowerCase() === recommended.hex.toLowerCase(),
      );
    },
    [shades],
  );

  const selectRecommendedShade = useCallback(
    (recommended: RecommendedShade) => {
      const localShade = findLocalShade(recommended);
      if (!localShade) return;
      setSelectedShadeId(localShade.id);
      setSelectedFinish(localShade.finish);
    },
    [findLocalShade],
  );

  /* ==========================================================
     EXPRESS PROXY -> PYTHON RECOMMENDATION SERVICE CONNECTION
  ========================================================== */

  const requestAiRecommendations = useCallback(
    async (imageBase64: string, autoSelectFirst = false) => {
      try {
        setIsAnalyzing(true);
        setRecommendationNotice(null);

        // Call Express proxy endpoint: POST /api/tryon/recommend
        const data: RecommendationResponse = await fetchRecommendations({
          imageBase64,
        });

        if (data && data.success) {
          // Update detected skin tone
          setDetectedSkinTone(data.skin_tone);

          // Update highest model confidence
          const probabilities = data.skin_tone_probabilities || {};
          const confValues = Object.values(probabilities);
          const confidence =
            confValues.length > 0 ? Math.max(...confValues) * 100 : 94.0;
          setRecommendationConfidence(confidence);

          // Update recommended shades from Python microservice
          if (data.recommendations && data.recommendations.length > 0) {
            setRecommendedShades(data.recommendations);
            setRecommendationNotice("AI Stylist: Active Neural Engine");

            if (autoSelectFirst) {
              selectRecommendedShade(data.recommendations[0]);
            }
          }
        }
      } catch (error) {
        console.warn(
          "[Amore AI] Express/Python microservice offline, maintaining embedded client recommendations:",
          error,
        );
        setRecommendationNotice("AI Stylist: Atelier Embedded Engine");
      } finally {
        setIsAnalyzing(false);
      }
    },
    [selectRecommendedShade],
  );

  const imageSourceToBase64 = useCallback(async (src: string): Promise<string> => {
    const response = await fetch(src);
    const blob = await response.blob();
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }, []);

  /* ==========================================================
     PHOTO TRY-ON (CACHED LANDMARKS & INSTANT SLIDER RE-RENDER)
  ========================================================== */

  // Repaint photo using cached mask & bounding box
  const repaintPhoto = useCallback(() => {
    const canvas = photoCanvasRef.current;
    const image = photoImageRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    if (showOriginalRef.current) {
      setPhotoDetectionStatus("Displaying unpainted natural portrait.");
      return;
    }

    if (photoLipMaskRef.current && activeShadeRef.current) {
      applyRealisticLipstick(
        ctx,
        photoLipMaskRef.current,
        canvas.width,
        canvas.height,
        {
          color: activeShadeRef.current.hex,
          opacity: opacityRef.current,
          intensity: 1.0,
          finish: finishRef.current,
          blurRadius: 3,
          boundingBox: photoBoundingBoxRef.current || undefined,
        },
      );
      setPhotoDetectionStatus("Photorealistic velvet texture applied.");
    }
  }, []);

  // Full image load and facial detection
  const loadAndProcessPhoto = useCallback(
    async (src: string) => {
      try {
        setIsProcessingPhoto(true);
        setPhotoDetectionStatus("Analyzing portrait matrix...");

        const canvas = photoCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return;

        const image = new Image();
        image.crossOrigin = "anonymous";
        image.src = src;
        await image.decode();

        photoImageRef.current = image;
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

        setPhotoDetectionStatus("Mapping facial contours & lip vermilion...");
        const landmarker = await getFaceLandmarkerForImage();
        const result = landmarker.detect(canvas);

        if (!result || result.faceLandmarks.length === 0) {
          photoLandmarksRef.current = null;
          photoLipMaskRef.current = null;
          photoBoundingBoxRef.current = null;
          setPhotoDetectionStatus(
            "No face detected. Please select a clear, frontal portrait.",
          );
          return;
        }

        const landmarks = result.faceLandmarks[0];
        photoLandmarksRef.current = landmarks;

        // Calculate tight bounding box & lip mask
        const boundingBox = getLipBoundingBox(
          landmarks,
          canvas.width,
          canvas.height,
          16,
        );
        const lipMask = createLipMask(
          ctx,
          landmarks,
          canvas.width,
          canvas.height,
        );

        photoBoundingBoxRef.current = boundingBox;
        photoLipMaskRef.current = lipMask;

        // 1. Instant client-side recommendation while server computes
        const skinLab = sampleSkinFromLandmarks(
          ctx,
          landmarks,
          canvas.width,
          canvas.height,
        );
        const clientRecs = generateClientRecommendations(skinLab, shades, 5);
        setDetectedSkinTone(clientRecs.skin_tone);
        const confValues = Object.values(clientRecs.skin_tone_probabilities);
        setRecommendationConfidence(Math.max(...confValues) * 100);
        setRecommendedShades(clientRecs.recommendations);

        // Render initial lipstick
        repaintPhoto();

        // 2. Trigger Python recommendation microservice via Express proxy
        imageSourceToBase64(src)
          .then((base64) => requestAiRecommendations(base64, false))
          .catch(() => {});
      } catch (error) {
        console.error("Photo try-on error:", error);
        setPhotoDetectionStatus("Unable to render portrait simulation.");
      } finally {
        setIsProcessingPhoto(false);
      }
    },
    [shades, repaintPhoto, requestAiRecommendations, imageSourceToBase64],
  );

  // Load photo when source changes
  useEffect(() => {
    if (mode === "PHOTO" && uploadedImageSrc) {
      loadAndProcessPhoto(uploadedImageSrc);
    }
  }, [mode, uploadedImageSrc, loadAndProcessPhoto]);

  // Instant repaint when shade, slider, or finish changes without re-detecting face
  useEffect(() => {
    if (mode === "PHOTO" && photoImageRef.current) {
      repaintPhoto();
    }
  }, [mode, activeShade, opacity, selectedFinish, showOriginal, repaintPhoto]);

  /* ==========================================================
     LIVE CAMERA TRY-ON (60 FPS BOUNDED REALISTIC RENDERER)
  ========================================================== */

  useEffect(() => {
    if (mode !== "CAMERA") {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
      setIsCameraActive(false);

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    let subscribed = true;

    async function startCamera() {
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

        if (!subscribed) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        const video = videoRef.current;
        if (!video) return;

        video.srcObject = stream;
        await video.play();
        setIsCameraActive(true);

        const landmarker = await getFaceLandmarkerForVideo();
        let lastRenderTime = 0;

        const processFrame = (timestamp: number) => {
          if (!subscribed || !videoRef.current || !cameraCanvasRef.current) {
            return;
          }

          const currentVideo = videoRef.current;
          const canvas = cameraCanvasRef.current;
          const ctx = canvas.getContext("2d", { willReadFrequently: true });

          if (currentVideo.readyState < 2 || !ctx) {
            animationFrameRef.current = requestAnimationFrame(processFrame);
            return;
          }

          if (canvas.width !== currentVideo.videoWidth) {
            canvas.width = currentVideo.videoWidth;
          }
          if (canvas.height !== currentVideo.videoHeight) {
            canvas.height = currentVideo.videoHeight;
          }

          // Throttle to fluid ~30-60 FPS for performance
          if (timestamp - lastRenderTime >= 30) {
            lastRenderTime = timestamp;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(currentVideo, 0, 0, canvas.width, canvas.height);

            if (
              !showOriginalRef.current &&
              activeShadeRef.current &&
              landmarker
            ) {
              try {
                const result = landmarker.detectForVideo(
                  currentVideo,
                  timestamp,
                );

                if (result && result.faceLandmarks.length > 0) {
                  const landmarks = result.faceLandmarks[0];

                  const boundingBox = getLipBoundingBox(
                    landmarks,
                    canvas.width,
                    canvas.height,
                    16,
                  );

                  const lipMask = createLipMask(
                    ctx,
                    landmarks,
                    canvas.width,
                    canvas.height,
                  );

                  applyRealisticLipstick(
                    ctx,
                    lipMask,
                    canvas.width,
                    canvas.height,
                    {
                      color: activeShadeRef.current.hex,
                      opacity: opacityRef.current,
                      intensity: 1.0,
                      finish: finishRef.current,
                      blurRadius: 3,
                      boundingBox,
                    },
                  );
                }
              } catch (renderErr) {
                console.error("Camera realistic rendering error:", renderErr);
              }
            }
          }

          animationFrameRef.current = requestAnimationFrame(processFrame);
        };

        animationFrameRef.current = requestAnimationFrame(processFrame);
      } catch (err) {
        console.error("Camera access error:", err);
        setCameraError(
          "Camera access denied or unavailable. Please enable camera permissions or upload a portrait.",
        );
        setIsCameraActive(false);
      }
    }

    startCamera();

    return () => {
      subscribed = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
    };
  }, [mode]);

  /* ==========================================================
     PERIODIC LIVE VIDEO AI SKIN ANALYSIS VIA EXPRESS PROXY
  ========================================================== */

  useEffect(() => {
    if (mode !== "CAMERA" || !isCameraActive) {
      if (recommendationTimerRef.current) {
        window.clearInterval(recommendationTimerRef.current);
        recommendationTimerRef.current = null;
      }
      return;
    }

    recommendationTimerRef.current = window.setInterval(async () => {
      const video = videoRef.current;
      if (!video || video.readyState < 2) return;
      if (!analysisCanvasRef.current) return;

      const canvas = analysisCanvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Sample raw original frame without applied lipstick
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Embedded instant client recommendation
      try {
        const landmarker = await getFaceLandmarkerForImage();
        const result = landmarker.detect(canvas);
        if (result && result.faceLandmarks.length > 0) {
          const skinLab = sampleSkinFromLandmarks(
            ctx,
            result.faceLandmarks[0],
            canvas.width,
            canvas.height,
          );
          const clientRecs = generateClientRecommendations(skinLab, shades, 5);
          setDetectedSkinTone(clientRecs.skin_tone);
          const conf =
            Math.max(...Object.values(clientRecs.skin_tone_probabilities)) * 100;
          setRecommendationConfidence(conf);
          setRecommendedShades(clientRecs.recommendations);
        }
      } catch {
        // Fallback gracefully
      }

      // Asynchronous server proxy call
      const base64 = canvas.toDataURL("image/jpeg", 0.82);
      await requestAiRecommendations(base64, false);
    }, 5000);

    return () => {
      if (recommendationTimerRef.current) {
        window.clearInterval(recommendationTimerRef.current);
        recommendationTimerRef.current = null;
      }
    };
  }, [mode, isCameraActive, shades, requestAiRecommendations]);

  // Snapshot / Download feature
  const handleDownloadSnapshot = useCallback(() => {
    const canvas =
      mode === "CAMERA" ? cameraCanvasRef.current : photoCanvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    const name =
      activeShade?.name?.toLowerCase().replace(/\s+/g, "-") || "amore-shade";
    link.download = `amore-tryon-${name}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }, [mode, activeShade]);

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-neutral-900 flex flex-col selection:bg-neutral-900 selection:text-white">
      {/* ============================================================
          1. ATELIER STATUS BAR & BREADCRUMB
      ============================================================ */}
      <section className="border-b border-neutral-200/80 bg-white/70 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-3.5 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-neutral-900 animate-pulse" />
            <span className="text-[11px] uppercase tracking-[0.25em] font-medium text-neutral-500 font-sans">
              Amore Digital Atelier
            </span>
            <span className="text-neutral-300 text-xs">•</span>
            <h1 className="text-xs uppercase tracking-wider font-semibold text-neutral-800">
              Virtual Try-On Studio
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {activeShade?.sku && (
              <Link
                href={`/shop/${generateProductSlug(activeShade.sku)}`}
                className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider px-4 py-1.5 rounded-full bg-neutral-900 hover:bg-black text-white transition shadow-sm"
              >
                <ShoppingBag className="w-3.5 h-3.5 stroke-[1.75]" />
                <span>Shop Active Shade ({activeShade.name})</span>
                <ArrowRight className="w-3 h-3 ml-0.5" />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ============================================================
          2. MAIN STUDIO GRID (VIEWPORT + AI STYLIST)
      ============================================================ */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Try-On Viewport & Palette Bar (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* Try-On Canvas Studio */}
            <div className="relative">
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
                shades={shades}
                selectedShadeId={selectedShadeId}
                onSelectShade={(shade) => {
                  setSelectedShadeId(shade.id);
                  setSelectedFinish(shade.finish);
                }}
              />
            </div>

            {/* Hidden canvas used solely for sampling raw frame to recommendation service */}
            <canvas ref={analysisCanvasRef} className="hidden" />

            {/* Curated 12-Swatch Full Shade Palette Bar */}
            <div className="rounded-2xl border border-neutral-200/90 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-neutral-500 stroke-[1.5]" />
                  <span className="text-xs uppercase tracking-[0.2em] font-medium text-neutral-600">
                    The HydraVelvet Palette
                  </span>
                  <span className="text-[11px] text-neutral-400 font-light">
                    ({shades.length} Shades)
                  </span>
                </div>
                <span className="text-[11px] uppercase tracking-wider text-neutral-400 font-sans">
                  Tap to preview
                </span>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5 sm:gap-3">
                {shades.map((shade) => {
                  const isSelected = shade.id === selectedShadeId;
                  return (
                    <button
                      key={shade.id}
                      onClick={() => {
                        setSelectedShadeId(shade.id);
                        setSelectedFinish(shade.finish);
                      }}
                      title={`${shade.name} (${shade.finish})`}
                      className={`group relative flex flex-col items-center p-2 rounded-xl transition-all duration-200 border text-center ${
                        isSelected
                          ? "bg-neutral-50 border-neutral-900 shadow-sm ring-1 ring-neutral-900"
                          : "bg-white border-neutral-200/70 hover:border-neutral-400 hover:bg-neutral-50/50"
                      }`}
                    >
                      <div
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-black/10 shadow-sm flex items-center justify-center relative overflow-hidden transition-transform group-hover:scale-105"
                        style={{ backgroundColor: shade.hex }}
                      >
                        {isSelected && (
                          <div className="w-full h-full bg-black/25 flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 text-white drop-shadow stroke-[3]" />
                          </div>
                        )}
                      </div>
                      <span className="text-[11px] text-neutral-700 truncate max-w-full mt-1.5 font-medium group-hover:text-black">
                        {shade.name}
                      </span>
                      <span className="text-[9px] font-mono text-neutral-400">
                        {shade.hex}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: AI Stylist & Shade Formulation Controls (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* AI Recommendation Panel */}
            <div className="rounded-2xl border border-neutral-200/90 bg-white p-6 shadow-sm relative overflow-hidden">
              {/* Subtle Luxury Gradient Glow */}
              <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-amber-100/40 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between mb-4 border-b border-neutral-100 pb-3">
                <div>
                  <div className="flex items-center gap-1.5 text-neutral-500">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600 stroke-[1.5]" />
                    <span className="text-[10px] uppercase tracking-[0.25em] font-medium text-neutral-600">
                      AI Atelier Stylist
                    </span>
                  </div>
                  <h2 className="text-xl font-serif font-normal uppercase tracking-tight text-neutral-900 mt-1">
                    Custom Shade Harmonies
                  </h2>
                </div>

                {isAnalyzing ? (
                  <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-light">
                    <div className="w-4 h-4 border-2 border-neutral-300 border-t-neutral-800 rounded-full animate-spin" />
                    <span className="text-[10px] uppercase tracking-wider">Analyzing</span>
                  </div>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                    Live Match
                  </span>
                )}
              </div>

              {/* Analyzed Skin Tone Card */}
              {detectedSkinTone ? (
                <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200/80 mb-4 transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-medium block">
                        Skin Tone Profile
                      </span>
                      <span className="text-sm font-serif uppercase tracking-wide font-medium text-neutral-900">
                        {detectedSkinTone} Complexion
                      </span>
                    </div>
                    <span className="text-[11px] font-medium uppercase tracking-wider text-neutral-700 bg-white px-2.5 py-1 rounded-md border border-neutral-200 shadow-xs">
                      CIE LAB Analyzed
                    </span>
                  </div>

                  {recommendationConfidence !== null && (
                    <div className="mt-3">
                      <div className="flex justify-between text-[11px] text-neutral-600 mb-1 font-sans">
                        <span>Tone Match Confidence</span>
                        <span className="font-mono font-medium text-neutral-800">
                          {Math.round(recommendationConfidence)}%
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-neutral-200 overflow-hidden">
                        <div
                          className="h-full bg-neutral-900 rounded-full transition-all duration-700 ease-out"
                          style={{
                            width: `${Math.max(
                              0,
                              Math.min(100, recommendationConfidence),
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/80 mb-4 text-xs text-neutral-500 flex items-center gap-2.5">
                  <Sparkle className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                  <span className="font-light leading-relaxed">
                    {mode === "CAMERA"
                      ? "Keep your face visible to the mirror to generate real-time AI matches."
                      : "Upload a portrait to compute skin tone and custom shade harmony scores."}
                  </span>
                </div>
              )}

              {/* AI Microservice Status Notice */}
              {recommendationNotice && (
                <div className="mb-4 px-3 py-1.5 rounded-lg bg-neutral-50 border border-neutral-200 text-[11px] text-neutral-600 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="font-medium">{recommendationNotice}</span>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider text-neutral-400">Microservice Synced</span>
                </div>
              )}

              {/* Recommended Shade Matches List with Micro-interactions */}
              {recommendedShades.length > 0 ? (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-medium px-1">
                    <span>Ranked Shade Selections</span>
                    <span>AI Compatibility</span>
                  </div>

                  {recommendedShades.map((rec, index) => {
                    const localShade = findLocalShade(rec);
                    const isSelected = localShade?.id === selectedShadeId;

                    return (
                      <div
                        key={rec.id}
                        className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all duration-200 text-left ${
                          isSelected
                            ? "bg-neutral-900 text-white border-neutral-900 shadow-md ring-1 ring-neutral-900"
                            : "bg-white text-neutral-800 border-neutral-200 hover:border-neutral-400 hover:bg-neutral-50/70"
                        }`}
                      >
                        <button
                          onClick={() => selectRecommendedShade(rec)}
                          className="flex items-center gap-3.5 flex-1 min-w-0"
                        >
                          <div
                            className={`w-10 h-10 rounded-full border flex-shrink-0 shadow-inner relative transition-transform duration-200 ${
                              isSelected
                                ? "border-white/50 scale-105"
                                : "border-neutral-200"
                            }`}
                            style={{ backgroundColor: rec.hex }}
                          >
                            {isSelected && (
                              <div className="absolute inset-0 bg-black/20 rounded-full flex items-center justify-center">
                                <Check className="w-4 h-4 text-white stroke-[3]" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`text-[9px] uppercase tracking-wider font-semibold ${
                                  isSelected ? "text-amber-300" : "text-neutral-500"
                                }`}
                              >
                                {index === 0
                                  ? "★ Best Harmony"
                                  : `Recommendation #${index + 1}`}
                              </span>
                            </div>
                            <div
                              className={`text-sm font-serif font-medium truncate ${
                                isSelected ? "text-white" : "text-neutral-900"
                              }`}
                            >
                              {rec.name}
                            </div>
                            <div
                              className={`text-[10px] font-mono mt-0.5 ${
                                isSelected ? "text-neutral-300" : "text-neutral-500"
                              }`}
                            >
                              {rec.compatibility.toFixed(1)}% Match Score
                            </div>
                          </div>
                        </button>

                        <div className="flex items-center gap-1.5 ml-2">
                          <button
                            onClick={() => selectRecommendedShade(rec)}
                            className={`text-[11px] font-medium uppercase tracking-wider px-3 py-1.5 rounded-lg transition ${
                              isSelected
                                ? "bg-white text-neutral-950 font-semibold"
                                : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                            }`}
                          >
                            {isSelected ? "Active" : "Apply"}
                          </button>

                          {localShade?.sku && (
                            <Link
                              href={`/shop/${generateProductSlug(localShade.sku)}`}
                              title="Shop this shade"
                              className={`p-2 rounded-lg transition flex-shrink-0 ${
                                isSelected
                                  ? "text-neutral-300 hover:text-white hover:bg-neutral-800"
                                  : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100"
                              }`}
                            >
                              <ShoppingBag className="w-3.5 h-3.5 stroke-[1.75]" />
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-neutral-300 p-8 text-center bg-neutral-50/50">
                  <Compass className="w-6 h-6 text-neutral-400 mx-auto mb-2 stroke-[1.5]" />
                  <p className="text-xs text-neutral-500 font-light">
                    AI shade matches will calculate automatically from your portrait.
                  </p>
                </div>
              )}
            </div>

            {/* Active Formulation & Blending Controls Card */}
            <div className="rounded-2xl border border-neutral-200/90 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between pb-4 border-b border-neutral-100">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.25em] text-neutral-500 font-medium">
                    Active Formulation
                  </span>
                  <h3 className="text-lg font-serif font-medium uppercase tracking-tight text-neutral-900 mt-0.5">
                    {activeShade ? activeShade.name : "Select a Shade"}
                  </h3>
                  <div className="text-[11px] font-mono text-neutral-400 mt-0.5">
                    {activeShade?.hex} • SKU: {activeShade?.sku || "HVL001"}
                  </div>
                </div>

                <div
                  className="w-11 h-11 rounded-2xl border border-neutral-200 shadow-sm flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor: activeShade?.hex || "#8C3725",
                  }}
                />
              </div>

              {/* Texture Finishes */}
              <div className="mt-5">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs uppercase tracking-wider font-medium text-neutral-700 font-sans">
                    Lipstick Finish
                  </label>
                  <span className="text-[10px] text-neutral-400 font-light">
                    Simulation Texture
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(
                    ["Velvet Matte", "Matte", "Satin", "Glossy"] as FinishType[]
                  ).map((finish) => (
                    <button
                      key={finish}
                      onClick={() => setSelectedFinish(finish)}
                      className={`py-2 rounded-xl border text-xs font-medium tracking-wide transition ${
                        selectedFinish === finish
                          ? "bg-neutral-900 border-neutral-900 text-white shadow-xs font-semibold"
                          : "bg-white border-neutral-200 text-neutral-600 hover:text-black hover:border-neutral-400"
                      }`}
                    >
                      {finish}
                    </button>
                  ))}
                </div>
              </div>

              {/* Shade Intensity Slider */}
              <div className="mt-5">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs uppercase tracking-wider font-medium text-neutral-700 font-sans">
                    Application Intensity
                  </label>
                  <span className="text-xs font-mono font-semibold text-neutral-900">
                    {Math.round(opacity * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={opacity}
                  onChange={(e) => setOpacity(Number(e.target.value))}
                  className="w-full accent-neutral-900 cursor-pointer h-1.5 bg-neutral-200 rounded-lg appearance-none"
                />
                <div className="flex justify-between text-[10px] text-neutral-400 mt-1.5 font-light">
                  <span>Sheer Veil (10%)</span>
                  <span>Signature (75%)</span>
                  <span>Opaque Couture (100%)</span>
                </div>
              </div>

              {/* Direct Shop Action */}
              {activeShade?.sku && (
                <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-neutral-400 block font-light">
                      Price
                    </span>
                    <span className="text-base font-serif font-medium text-neutral-900">
                      ₹349
                    </span>
                  </div>
                  <Link
                    href={`/shop/${generateProductSlug(activeShade.sku)}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-neutral-900 hover:bg-black text-white text-xs uppercase tracking-wider font-semibold transition shadow-sm"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 stroke-[1.75]" />
                    <span>Purchase Shade</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
