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
 * Gets or initializes the FaceLandmarker instance isolated for static IMAGE detection mode.
 */
export async function getFaceLandmarkerForImage(): Promise<FaceLandmarker> {
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

    imageLandmarker = landmarker;
    return landmarker;
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

    videoLandmarker = landmarker;
    return landmarker;
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
