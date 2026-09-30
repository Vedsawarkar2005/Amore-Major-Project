"use client";

import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  AdditiveBlending,
  Box3,
  type Camera,
  CanvasTexture,
  Color,
  type Group,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  type MeshStandardMaterial,
  type Object3D,
  PlaneGeometry,
  SRGBColorSpace,
  Vector3,
  type WebGLProgramParametersWithUniforms,
} from "three";

import {
  bulletColor,
  emitMaterialAnchors,
  entrance,
  hasMaterialListener,
  idle,
  lipstickPose,
  materialAnchors,
} from "./lipstick-state";

/*
 * The Hydravelvet lipstick is modelled in Blender and loaded as glTF:
 * scripts/blender/lipstick.blend is the source, and `bun run model:export`
 * writes public/models/lipstick.glb (see scripts/blender/). The file brings
 * the shapes and their materials (gloss lacquer, polished rose gold, the
 * foil wordmark); this component adds what only the page knows: the pose
 * from the scroll story, the picked shade on the bullet (with the velvet
 * shader below), a warm glow on the floor, and where the parts sit on
 * screen for the material callouts.
 *
 * The site relies on the Blender file's object names: `CapRig` and
 * `BulletRig` (moved for the cap lift and the bullet's rise), `Bullet`,
 * `Sleeve`, `Collar` and `Plinth`.
 */
const LIPSTICK_MODEL_URL = "/models/lipstick.glb";

/** Reflection strength per material (glTF has no field for it). */
const envMapIntensity: Record<string, number> = {
  Lacquer: 1.3,
  RoseGold: 1.7,
  Foil: 1.8,
};

const WHITE = new Color(1, 1, 1);

/* ---------------------------------------------------------------------------
 * Velvet shader. Extends MeshPhysicalMaterial (which already provides
 * physically based "Charlie" sheen) with two traits of a pressed, velvet-
 * finish bullet:
 *   1. pigment grain — tiny per-cell roughness variation that breaks up the
 *      specular highlight the way a pressed pigment surface does;
 *   2. a fibre rim — light caught at grazing angles, tinted by the shade.
 * ------------------------------------------------------------------------- */
const velvetUniforms = {
  uRimColor: { value: new Color() },
  uRimStrength: { value: 0.45 },
  uGrain: { value: 0.14 },
};

function applyVelvetShader(shader: WebGLProgramParametersWithUniforms) {
  Object.assign(shader.uniforms, velvetUniforms);

  shader.vertexShader = shader.vertexShader
    .replace(
      "#include <common>",
      "#include <common>\nvarying vec3 vObjectPosition;",
    )
    .replace(
      "#include <begin_vertex>",
      "#include <begin_vertex>\nvObjectPosition = position;",
    );

  shader.fragmentShader = shader.fragmentShader
    .replace(
      "#include <common>",
      /* glsl */ `#include <common>
uniform vec3 uRimColor;
uniform float uRimStrength;
uniform float uGrain;
varying vec3 vObjectPosition;

float velvetHash(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}`,
    )
    .replace(
      "#include <roughnessmap_fragment>",
      /* glsl */ `#include <roughnessmap_fragment>
roughnessFactor = clamp(
  roughnessFactor + (velvetHash(floor(vObjectPosition * 260.0)) - 0.5) * uGrain,
  0.05,
  1.0
);`,
    )
    .replace(
      "#include <opaque_fragment>",
      /* glsl */ `float velvetRim = pow(1.0 - saturate(dot(normal, geometryViewDir)), 2.6);
outgoingLight += uRimColor * velvetRim * uRimStrength;
#include <opaque_fragment>`,
    );
}

function createVelvetMaterial() {
  const material = new MeshPhysicalMaterial({
    envMapIntensity: 0.75,
    roughness: 0.6,
    sheen: 0.85,
    sheenRoughness: 0.45,
  });
  material.onBeforeCompile = applyVelvetShader;
  material.customProgramCacheKey = () => "amore-velvet";
  return material;
}

/** A soft warm pool of light on the floor beneath the lipstick. */
function drawFloorGlow() {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  if (!context) return null;
  const center = size / 2;
  const gradient = context.createRadialGradient(
    center,
    center,
    0,
    center,
    center,
    center,
  );
  gradient.addColorStop(0, "rgba(243, 204, 186, 0.55)");
  gradient.addColorStop(0.35, "rgba(214, 149, 123, 0.2)");
  gradient.addColorStop(1, "rgba(214, 149, 123, 0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, size, size);

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

/** The parts' extents in the model's own space, measured once on load. */
type Measures = {
  floor: number;
  halfWidth: number;
  sleeveBottom: number;
  sleeveTop: number;
  /** The retracted bullet's highest point. */
  bulletTop: number;
  collarMiddle: number;
  plinthMiddle: number;
};

function measure(scene: Object3D): Measures {
  scene.updateMatrixWorld(true);
  const box = (name: string) => {
    const part = scene.getObjectByName(name);
    return part ? new Box3().setFromObject(part) : new Box3();
  };
  const plinth = box("Plinth");
  const sleeve = box("Sleeve");
  const collar = box("Collar");
  const bullet = box("Bullet");
  return {
    floor: plinth.min.y,
    halfWidth: plinth.max.x,
    sleeveBottom: sleeve.min.y,
    sleeveTop: sleeve.max.y,
    bulletTop: bullet.max.y,
    collarMiddle: (collar.min.y + collar.max.y) / 2,
    plinthMiddle: (plinth.min.y + plinth.max.y) / 2,
  };
}

const scratch = new Vector3();

/**
 * Projects the open lipstick onto the screen (see `materialAnchors`): the
 * corners of its box, from the floor to the risen bullet's tip, and the
 * middle of each part.
 */
function projectAnchors(
  root: Group,
  sizes: Measures,
  { camera, size }: { camera: Camera; size: { width: number; height: number } },
) {
  root.updateMatrixWorld();
  const toScreen = (x: number, y: number, z: number) => {
    scratch.set(x, y, z);
    root.localToWorld(scratch).project(camera);
    return [
      ((scratch.x + 1) / 2) * size.width,
      ((1 - scratch.y) / 2) * size.height,
    ] as const;
  };

  const half = sizes.halfWidth;
  const tip = sizes.bulletTop + lipstickPose.bulletRise;
  let left = Number.POSITIVE_INFINITY;
  let right = Number.NEGATIVE_INFINITY;
  let top = Number.POSITIVE_INFINITY;
  let bottom = Number.NEGATIVE_INFINITY;
  for (const y of [sizes.floor, tip]) {
    for (const x of [-half, half]) {
      for (const z of [-half, half]) {
        const [sx, sy] = toScreen(x, y, z);
        left = Math.min(left, sx);
        right = Math.max(right, sx);
        top = Math.min(top, sy);
        bottom = Math.max(bottom, sy);
      }
    }
  }
  Object.assign(materialAnchors, { left, right, top, bottom });

  const middles = [
    (sizes.sleeveTop + tip) / 2,
    (sizes.sleeveBottom + sizes.sleeveTop) / 2,
    sizes.collarMiddle,
    sizes.plinthMiddle,
  ];
  middles.forEach((y, index) => {
    materialAnchors.parts[index] = toScreen(0, y, 0)[1];
  });
  emitMaterialAnchors();
}

/** The Hydravelvet lipstick from the Blender export, posed by the story. */
export function LipstickModel() {
  const root = useRef<Group>(null);
  const { scene } = useGLTF(LIPSTICK_MODEL_URL, false, true);

  const velvet = useMemo(createVelvetMaterial, []);
  const glow = useMemo(
    () =>
      new MeshBasicMaterial({
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
        toneMapped: false,
      }),
    [],
  );
  const plane = useMemo(() => new PlaneGeometry(1, 1), []);

  // Dress the file's materials for the page, and find the moving parts.
  const parts = useMemo(() => {
    scene.traverse((object) => {
      if (!(object instanceof Mesh)) return;
      if (object.name === "Bullet") {
        object.material = velvet;
        return;
      }
      const material = object.material as MeshStandardMaterial;
      material.envMapIntensity = envMapIntensity[material.name] ?? 1;
    });
    return {
      cap: scene.getObjectByName("CapRig"),
      bullet: scene.getObjectByName("BulletRig"),
      sizes: measure(scene),
    };
  }, [scene, velvet]);

  useEffect(() => {
    const texture = drawFloorGlow();
    glow.map = texture;
    glow.needsUpdate = true;
    return () => {
      texture?.dispose();
      glow.dispose();
      plane.dispose();
      velvet.dispose();
    };
  }, [glow, plane, velvet]);

  useFrame((state) => {
    if (!root.current) return;

    // offsetX is a fraction of the visible half-width; cap it on ultra-wide
    // screens so the lipstick never drifts too far from the copy.
    const halfWidth = state.viewport.width / 2;
    const x =
      Math.sign(lipstickPose.offsetX) *
      Math.min(Math.abs(lipstickPose.offsetX) * halfWidth, 1.8);

    const sway = Math.sin(idle.phase * Math.PI * 2) * 0.22 * idle.weight;
    const float = Math.sin(idle.phase * Math.PI * 4) * 0.03 * idle.weight;

    root.current.position.set(
      x,
      lipstickPose.offsetY + entrance.lift + float,
      0,
    );
    root.current.rotation.set(
      lipstickPose.tilt,
      lipstickPose.rotation + sway,
      0,
    );
    root.current.scale.setScalar(lipstickPose.scale);
    if (parts.cap) parts.cap.position.y = lipstickPose.capLift;
    if (parts.bullet) parts.bullet.position.y = lipstickPose.bulletRise;

    if (hasMaterialListener()) projectAnchors(root.current, parts.sizes, state);

    velvet.color.setRGB(
      bulletColor.r,
      bulletColor.g,
      bulletColor.b,
      SRGBColorSpace,
    );
    // Sheen and rim use lifted tints of the same hue, so the velvet
    // catches the light without drifting toward pink.
    velvet.sheenColor.copy(velvet.color).lerp(WHITE, 0.3);
    velvetUniforms.uRimColor.value.copy(velvet.color).lerp(WHITE, 0.45);
  });

  return (
    <group ref={root}>
      <mesh
        geometry={plane}
        material={glow}
        position={[0, parts.sizes.floor, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={2.8}
      />
      <primitive object={scene} />
    </group>
  );
}

useGLTF.preload(LIPSTICK_MODEL_URL, false, true);
