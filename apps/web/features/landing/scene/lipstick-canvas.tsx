"use client";

// Must run before <Canvas> mounts, when R3F creates its (deprecated) Clock.
import "./three-console";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useRef } from "react";
import {
  Color,
  type DirectionalLight,
  DoubleSide,
  Mesh,
  MeshBasicMaterial,
  NeutralToneMapping,
  PlaneGeometry,
  PMREMGenerator,
  Scene,
} from "three";

import { CameraRig } from "./camera-rig";
import { LipstickModel } from "./lipstick-model";
import { idle, markSceneReady, setRenderRequester } from "./lipstick-state";
import { ShimmerParticles } from "./shimmer-particles";

type Softbox = {
  color: string;
  intensity: number;
  size: [number, number];
  position: [number, number, number];
};

/*
 * A virtual photo studio, rendered once into the reflection map. Glossy
 * lacquer and polished metal show their environment, so these panels are what
 * the viewer actually sees on the product: long vertical strip lights on
 * either side (the classic cosmetics-shoot highlights), a soft overhead box,
 * a faint front fill and a warm low kicker from behind.
 */
const softboxes: Softbox[] = [
  { color: "#ffffff", intensity: 3, size: [5, 1.4], position: [0, 5, 0.5] },
  {
    color: "#fff3ea",
    intensity: 7,
    size: [0.45, 6],
    position: [-3.6, 0.6, 2.2],
  },
  {
    color: "#ffd8c6",
    intensity: 4.5,
    size: [0.35, 6],
    position: [3.4, 0.4, 1.4],
  },
  { color: "#ffffff", intensity: 2, size: [3, 3], position: [0, 0.8, 6] },
  {
    color: "#f3cdb9",
    intensity: 1.6,
    size: [6, 0.35],
    position: [0, -1.6, -3.5],
  },
];

/** Studio reflections generated locally from light panels — no HDR files. */
function StudioEnvironment() {
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    const studio = new Scene();
    studio.background = new Color("#050303");
    const panel = new PlaneGeometry(1, 1);
    const materials: MeshBasicMaterial[] = [];

    for (const box of softboxes) {
      const material = new MeshBasicMaterial({
        color: new Color(box.color).multiplyScalar(box.intensity),
        side: DoubleSide,
      });
      materials.push(material);
      const mesh = new Mesh(panel, material);
      mesh.scale.set(box.size[0], box.size[1], 1);
      mesh.position.set(...box.position);
      mesh.lookAt(0, 0.4, 0);
      studio.add(mesh);
    }

    const pmrem = new PMREMGenerator(gl);
    const environment = pmrem.fromScene(studio, 0.02).texture;
    scene.environment = environment;
    invalidate();

    panel.dispose();
    for (const material of materials) material.dispose();
    pmrem.dispose();

    return () => {
      scene.environment = null;
      environment.dispose();
    };
  }, [gl, scene, invalidate]);

  return null;
}

/**
 * Three-point lighting: a warm key that sweeps slowly across the lacquer
 * while the hero idles, a rose-gold rim from behind right, and a cool rim
 * from behind left to separate the black cap from the dark stage.
 */
function StudioLights() {
  const key = useRef<DirectionalLight>(null);

  useFrame(() => {
    if (!key.current) return;
    key.current.position.x =
      -2.6 + Math.sin(idle.phase * Math.PI * 2) * 2.2 * idle.weight;
  });

  return (
    <>
      <directionalLight
        color="#fff1e6"
        intensity={1.3}
        position={[-2.6, 4, 5]}
        ref={key}
      />
      <directionalLight
        color="#f2b89f"
        intensity={3.2}
        position={[4, 2.5, -4]}
      />
      <directionalLight
        color="#d9e1ff"
        intensity={1.1}
        position={[-4, 1.5, -3]}
      />
    </>
  );
}

/** Hands the canvas's invalidate() to DOM-side timelines. */
function RenderBridge() {
  const invalidate = useThree((state) => state.invalidate);
  const width = useThree((state) => state.size.width);
  const height = useThree((state) => state.size.height);

  useEffect(() => {
    setRenderRequester(() => invalidate());
    // The pose may have been set before the canvas finished loading.
    invalidate();
    // The demanded frame draws on the next animation frame; the one after
    // that, it's on screen.
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(markSceneReady);
    });
    return () => {
      cancelAnimationFrame(frame);
      setRenderRequester(() => {});
    };
  }, [invalidate]);

  // Resizing a canvas clears it; draw again once the new size has applied.
  useEffect(() => {
    if (width === 0 || height === 0) return;
    const frame = requestAnimationFrame(() => invalidate());
    return () => cancelAnimationFrame(frame);
  }, [width, height, invalidate]);

  return null;
}

export default function LipstickCanvas() {
  return (
    <Canvas
      aria-hidden="true"
      // A long lens (narrow field of view) flattens perspective the way
      // product photography does.
      camera={{ fov: 24, position: [0, 0.35, 9.6] }}
      // Fades in when the lazily loaded chunk mounts (tw-animate-css).
      className="fade-in animate-in duration-1000"
      // Up to 2× on high-density screens for crisp edges and highlights.
      dpr={[1, 2]}
      // Render only when something changes (scroll, idle drift, shade pick).
      frameloop="demand"
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      // Khronos PBR Neutral keeps base colours true, so each bullet matches
      // its shade swatch (the default ACES curve shifts reds toward pink).
      onCreated={({ gl }) => {
        gl.toneMapping = NeutralToneMapping;
        gl.toneMappingExposure = 1.05;
      }}
    >
      <StudioEnvironment />
      <StudioLights />
      <CameraRig />
      <ShimmerParticles />
      {/* The model downloads (public/models/lipstick.glb); the bridge mounts
          with it, so the scene reports ready only once the lipstick is
          drawn and the intro's case opens onto it. */}
      <Suspense fallback={null}>
        <LipstickModel />
        <RenderBridge />
      </Suspense>
    </Canvas>
  );
}
