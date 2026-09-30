"use client";

import {
  FaceLandmarker,
  FilesetResolver,
} from "@mediapipe/tasks-vision";

let imageLandmarker: FaceLandmarker | null = null;
let imageInitPromise: Promise<FaceLandmarker> | null = null;

let videoLandmarker: FaceLandmarker | null = null;
let videoInitPromise: Promise<FaceLandmarker> | null = null;

/**
 * Checks whether a console argument originates from benign TensorFlow Lite /
 * MediaPipe WebAssembly initialization logs (which Emscripten directs to stderr).
 */
function isBenignTfLiteLog(args: unknown[]): boolean {
  const first = typeof args[0] === "string" ? args[0] : "";
  return (
    first.includes("Created TensorFlow Lite") ||
    first.includes("XNNPACK delegate") ||
    first.includes("TensorFlow Lite") ||
    first.startsWith("INFO:")
  );
}

/**
 * Patch global console.error to redirect benign MediaPipe/TFLite WebAssembly INFO logs
 * away from triggering Next.js Turbopack development error overlays.
 */
export function patchTFLiteConsole(): void {
  if (typeof window === "undefined") return;

  const currentError = console.error;
  if (!(currentError as any)?.__amoreTfLitePatched) {
    const patchedError = function (...args: unknown[]) {
      if (isBenignTfLiteLog(args)) {
        console.info(...args);
        return;
      }
      return currentError.apply(console, args);
    };
    (patchedError as any).__amoreTfLitePatched = true;
    console.error = patchedError;
  }
}

// Auto-patch on client load
if (typeof window !== "undefined") {
  patchTFLiteConsole();
}

/**
 * Wraps detect and detectForVideo on FaceLandmarker instances so that synchronous
 * WASM stderr calls during inference are safely intercepted and routed to console.info.
 */
function wrapLandmarkerWithSilence(landmarker: FaceLandmarker): FaceLandmarker {
  const origDetect = landmarker.detect.bind(landmarker);
  const origDetectForVideo = landmarker.detectForVideo.bind(landmarker);

  landmarker.detect = function (...args: Parameters<typeof origDetect>) {
    patchTFLiteConsole();
    const prev = console.error;
    console.error = function (...cArgs: unknown[]) {
      if (isBenignTfLiteLog(cArgs)) {
        console.info(...cArgs);
        return;
      }
      return prev.apply(console, cArgs);
    };
    try {
      return origDetect(...args);
    } finally {
      console.error = prev;
    }
  };

  landmarker.detectForVideo = function (...args: Parameters<typeof origDetectForVideo>) {
    patchTFLiteConsole();
    const prev = console.error;
    console.error = function (...cArgs: unknown[]) {
      if (isBenignTfLiteLog(cArgs)) {
        console.info(...cArgs);
        return;
      }
      return prev.apply(console, cArgs);
    };
    try {
      return origDetectForVideo(...args);
    } finally {
      console.error = prev;
    }
  };

  return landmarker;
}

/**
 * Gets or initializes the FaceLandmarker instance isolated for static IMAGE detection mode.
 */
export async function getFaceLandmarkerForImage(): Promise<FaceLandmarker> {
  patchTFLiteConsole();
  if (imageLandmarker) {
    return imageLandmarker;
  }

  if (imageInitPromise) {
    return imageInitPromise;
  }

  imageInitPromise = (async () => {
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
    );

    const landmarker = await FaceLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: "/models/face_landmarker.task",
      },
      runningMode: "IMAGE",
      numFaces: 1,
      outputFaceBlendshapes: false,
      outputFacialTransformationMatrixes: false,
    });

    const wrapped = wrapLandmarkerWithSilence(landmarker);
    imageLandmarker = wrapped;
    return wrapped;
  })();

  try {
    return await imageInitPromise;
  } catch (error) {
    imageInitPromise = null;
    imageLandmarker = null;
    throw error;
  }
}

/**
 * Gets or initializes the FaceLandmarker instance isolated for live VIDEO detection mode.
 */
export async function getFaceLandmarkerForVideo(): Promise<FaceLandmarker> {
  patchTFLiteConsole();
  if (videoLandmarker) {
    return videoLandmarker;
  }

  if (videoInitPromise) {
    return videoInitPromise;
  }

  videoInitPromise = (async () => {
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
    );

    const landmarker = await FaceLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: "/models/face_landmarker.task",
      },
      runningMode: "VIDEO",
      numFaces: 1,
      outputFaceBlendshapes: false,
      outputFacialTransformationMatrixes: false,
    });

    const wrapped = wrapLandmarkerWithSilence(landmarker);
    videoLandmarker = wrapped;
    return wrapped;
  })();

  try {
    return await videoInitPromise;
  } catch (error) {
    videoInitPromise = null;
    videoLandmarker = null;
    throw error;
  }
}

/**
 * Default accessor for backward compatibility (defaults to IMAGE mode).
 */
export async function getFaceLandmarker(): Promise<FaceLandmarker> {
  return getFaceLandmarkerForImage();
}
