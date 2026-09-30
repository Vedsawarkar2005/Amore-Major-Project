"use client";

import { useFrame } from "@react-three/fiber";

import { cameraRig, entrance } from "./lipstick-state";

/** How far the mouse can swing the camera: radians sideways, units up/down. */
const POINTER_ORBIT = 0.07;
const POINTER_HEIGHT = 0.18;

/**
 * Places the camera from `cameraRig` on every rendered frame. The DOM-side
 * scroll timeline tweens the rig (dolly in, swing around, drop low), and
 * pointer moves nudge it, so the camera never needs React state.
 */
export function CameraRig() {
  useFrame(({ camera }) => {
    const angle = cameraRig.orbit + cameraRig.pointerX * POINTER_ORBIT;
    const distance = cameraRig.distance + entrance.dolly;
    camera.position.set(
      Math.sin(angle) * distance,
      cameraRig.height - cameraRig.pointerY * POINTER_HEIGHT,
      Math.cos(angle) * distance,
    );
    camera.lookAt(0, cameraRig.lookY, 0);
  });

  return null;
}
