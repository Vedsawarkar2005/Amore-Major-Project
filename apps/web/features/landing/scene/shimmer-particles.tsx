"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import {
  AdditiveBlending,
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  ShaderMaterial,
} from "three";

import { shimmer } from "./lipstick-state";

/*
 * Rose-gold dust drifting through the stage, like pigment shimmer caught in a
 * spotlight. All motion happens on the GPU: each particle stores a start
 * position and a few random traits, and the vertex shader works out where it
 * is from the shimmer clocks. One draw call, no per-frame JavaScript loops.
 */

/** The box the dust lives in (scene units), centred on the stage. */
const VOLUME = { width: 9, height: 5.2, near: 3, far: -3, centerY: 0.3 };

/** Fewer particles on small screens: they're smaller and cost battery. */
const COUNT = { wide: 260, narrow: 110 };

/** How far one unit of `shimmer.scroll` advances the dust (in seconds). */
const SCROLL_TO_TIME = 40;

/** Champagne and rose gold, the brand's two metallic tones. */
const TONES = [new Color("#f6dcca"), new Color("#e0a58d")];

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uHeight;
  uniform float uPixelRatio;
  uniform float uStrength;

  attribute float aSize;
  attribute float aSpeed;
  attribute float aPhase;
  attribute float aTone;

  varying float vAlpha;
  varying float vGlint;
  varying float vTone;

  void main() {
    vec3 p = position;

    // Rise slowly and wrap around, so the dust never runs out.
    p.y = mod(p.y + uTime * aSpeed, uHeight) - uHeight * 0.5;
    // A lazy side-to-side wander, different for every particle.
    p.x += sin(uTime * 0.35 + aPhase) * 0.12;
    p.z += cos(uTime * 0.3 + aPhase * 1.7) * 0.12;

    vec4 viewPosition = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * viewPosition;
    // Perspective size: nearer particles are drawn larger.
    gl_PointSize = aSize * uPixelRatio * 42.0 / -viewPosition.z;

    // Fade out near the top and bottom of the box so wrapping is invisible.
    float edge = abs(p.y) / (uHeight * 0.5);
    float fade = 1.0 - smoothstep(0.65, 1.0, edge);
    // A sharp twinkle: mostly dim, briefly bright.
    float twinkle = pow(0.5 + 0.5 * sin(uTime * (0.8 + aSpeed * 6.0) + aPhase * 6.2831), 3.0);

    vAlpha = uStrength * fade * (0.25 + 0.75 * twinkle);
    // Only the biggest particles get the four-point star glint.
    vGlint = smoothstep(1.4, 2.4, aSize);
    vTone = aTone;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uToneA;
  uniform vec3 uToneB;

  varying float vAlpha;
  varying float vGlint;
  varying float vTone;

  void main() {
    vec2 c = gl_PointCoord - 0.5;
    // A soft round glow...
    float glow = exp(-dot(c, c) * 38.0);
    // ...plus thin horizontal and vertical rays for the star glint.
    float rays = exp(-abs(c.x) * 70.0) * exp(-abs(c.y) * 9.0)
               + exp(-abs(c.y) * 70.0) * exp(-abs(c.x) * 9.0);
    float alpha = (glow + rays * 0.8 * vGlint) * vAlpha;
    if (alpha < 0.003) discard;

    gl_FragColor = vec4(mix(uToneA, uToneB, vTone), alpha);
  }
`;

/** A tiny seeded random generator, so the dust looks the same every visit. */
function seededRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function createDust(count: number) {
  const random = seededRandom(20_25);
  const positions: number[] = [];
  const sizes: number[] = [];
  const speeds: number[] = [];
  const phases: number[] = [];
  const tones: number[] = [];

  for (let i = 0; i < count; i++) {
    positions.push(
      (random() - 0.5) * VOLUME.width,
      // Stored as 0–height; the shader wraps and centres it.
      random() * VOLUME.height,
      VOLUME.far + random() * (VOLUME.near - VOLUME.far),
    );
    // Mostly fine dust with the occasional large sparkle.
    sizes.push(0.6 + random() ** 4 * 2.2);
    speeds.push(0.03 + random() * 0.07);
    phases.push(random() * Math.PI * 2);
    tones.push(random());
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setAttribute("aSize", new Float32BufferAttribute(sizes, 1));
  geometry.setAttribute("aSpeed", new Float32BufferAttribute(speeds, 1));
  geometry.setAttribute("aPhase", new Float32BufferAttribute(phases, 1));
  geometry.setAttribute("aTone", new Float32BufferAttribute(tones, 1));
  return geometry;
}

export function ShimmerParticles() {
  const wide = useThree((state) => state.size.width >= 768);
  const pixelRatio = useThree((state) => state.viewport.dpr);

  const geometry = useMemo(
    () => createDust(wide ? COUNT.wide : COUNT.narrow),
    [wide],
  );

  // Kept as a typed object so useFrame can write to it without lookups.
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uHeight: { value: VOLUME.height },
      uPixelRatio: { value: 1 },
      uStrength: { value: 1 },
      uToneA: { value: TONES[0] },
      uToneB: { value: TONES[1] },
    }),
    [],
  );

  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms,
        transparent: true,
        // Glows add light, and never hide what's behind them; the lipstick
        // still hides the dust behind it (depth test stays on).
        blending: AdditiveBlending,
        depthWrite: false,
      }),
    [uniforms],
  );

  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => material.dispose(), [material]);

  useFrame(() => {
    uniforms.uTime.value = shimmer.drift + shimmer.scroll * SCROLL_TO_TIME;
    uniforms.uStrength.value = shimmer.strength;
    uniforms.uPixelRatio.value = pixelRatio;
  });

  return (
    <points
      frustumCulled={false}
      geometry={geometry}
      material={material}
      position={[0, VOLUME.centerY, 0]}
    />
  );
}
