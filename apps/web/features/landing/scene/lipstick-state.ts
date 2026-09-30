/**
 * Mutable scene state shared between DOM-side timelines and the 3D scene.
 * GSAP tweens these values; the scene reads them on each rendered frame.
 * Living outside React means scrolling never triggers a re-render.
 */
export type LipstickPose = {
  /**
   * Horizontal offset as a fraction of the visible half-width (−1 left edge,
   * 1 right edge), so placement holds at any aspect ratio.
   */
  offsetX: number;
  /** Vertical offset (scene units). */
  offsetY: number;
  /** Uniform scale; phones show the lipstick smaller beside the copy. */
  scale: number;
  /** Y rotation in radians. */
  rotation: number;
  /** Tilt toward the camera in radians. */
  tilt: number;
  /** How far the cap has lifted off (scene units). */
  capLift: number;
  /** How far the bullet has risen out of the sleeve (scene units). */
  bulletRise: number;
};

/** Capped and turned slightly toward the viewer. */
export const closedPose: Readonly<LipstickPose> = {
  offsetX: 0,
  offsetY: -0.45,
  scale: 1,
  rotation: -0.55,
  tilt: 0.06,
  capLift: 0,
  bulletRise: 0,
};

/** Cap off, bullet up, facing the viewer; also the reduced-motion pose. */
export const openPose: Readonly<LipstickPose> = {
  offsetX: 0,
  offsetY: -0.15,
  scale: 1,
  rotation: 0.4,
  tilt: 0.05,
  capLift: 3.2,
  bulletRise: 0.45,
};

export const lipstickPose: LipstickPose = { ...closedPose };

/**
 * The hero's entrance, layered on top of the pose and the camera: `lift`
 * (scene units) raises the lipstick into place and `dolly` (scene units)
 * eases the camera in. They rest at 0. Kept apart from the pose and rig so
 * the entrance never fights the scroll timeline, which tweens those.
 */
export const entrance = { lift: 0, dolly: 0 };

/**
 * Idle "breathing" layered on top of the pose while the hero is on screen:
 * a slow sway and a key light sweeping across the lacquer. `weight` fades it
 * out as the scroll story takes over.
 */
export const idle = { phase: 0, weight: 0 };

/**
 * Where the camera stands. It sits on a circle around the lipstick's axis:
 * `orbit` swings it sideways, `distance` dollies it in and out, `height`
 * raises or lowers it, and it always looks at (0, lookY, 0). `pointerX` and
 * `pointerY` (−1 to 1) add a small tilt that follows the mouse.
 */
export type CameraRig = {
  /** Angle around the lipstick in radians (0 = straight on). */
  orbit: number;
  /** Distance from the lipstick's axis (scene units). */
  distance: number;
  /** Camera height (scene units). */
  height: number;
  /** Height of the point the camera looks at (scene units). */
  lookY: number;
  pointerX: number;
  pointerY: number;
};

/**
 * The framing the stage layouts were designed for; every camera move starts
 * and ends here, so the lipstick lands where the layouts expect it.
 */
export const restingCamera: Readonly<CameraRig> = {
  orbit: 0,
  distance: 9.6,
  height: 0.35,
  lookY: 0.35,
  pointerX: 0,
  pointerY: 0,
};

export const cameraRig: CameraRig = { ...restingCamera };

/**
 * Rose-gold shimmer drifting through the stage. The particles' motion is the
 * sum of two clocks: `drift` ticks with real time while the stage is on
 * screen (wide screens only), and `scroll` is scrubbed by the story's scroll
 * position, so the shimmer still moves on phones, where nothing renders
 * unless the page scrolls. `strength` (0–1.5) scales its brightness.
 */
export const shimmer = { drift: 0, scroll: 0, strength: 1 };

/** Bullet colour as sRGB channels in 0–1, tweened when a shade is picked. */
export const bulletColor = { r: 0.45, g: 0.14, b: 0.15 };

export function hexToRgb(hex: string) {
  const value = Number.parseInt(hex.slice(1), 16);
  return {
    r: ((value >> 16) & 255) / 255,
    g: ((value >> 8) & 255) / 255,
    b: (value & 255) / 255,
  };
}

let markReady: () => void;

/**
 * Resolves once the 3D scene has drawn its first frame. The intro waits on
 * it (with a time limit), so the case opens onto a lipstick, not an empty
 * stage.
 */
export const sceneReady = new Promise<void>((resolve) => {
  markReady = resolve;
});

/** Called by the canvas after its first frame. */
export function markSceneReady() {
  markReady();
}

let requestRender = () => {};

/** Called by the canvas once mounted, so timelines can request a frame. */
export function setRenderRequester(fn: () => void) {
  requestRender = fn;
}

export function invalidateScene() {
  requestRender();
}

/**
 * Where the open lipstick sits on screen, in CSS px from the stage's top
 * left, projected from the 3D model each frame (see LipstickModel): its
 * bounding box and the middle of each part, bullet to base. The material
 * callouts (MaterialFrame) draw around it, so they hug the lipstick at any
 * screen size and follow the camera.
 */
export const materialAnchors = {
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  parts: [0, 0, 0, 0],
};

let anchorListener: (() => void) | null = null;

/** Subscribes to anchor updates; returns the unsubscribe. */
export function onMaterialAnchors(listener: () => void) {
  anchorListener = listener;
  return () => {
    if (anchorListener === listener) anchorListener = null;
  };
}

export function hasMaterialListener() {
  return anchorListener !== null;
}

export function emitMaterialAnchors() {
  anchorListener?.();
}
