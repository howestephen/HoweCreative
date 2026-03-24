import React, { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { AnimatePresence, motion } from "motion/react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import { heroContent, siteProfile } from "../data/portfolio";
import { isIOSLike } from "../lib/device";
import { useWebGLAvailability } from "../lib/webgl";

// ─── Error boundary for MorphingWireHero ────────────────────────────────────
// useLoader throws on GLTF failure; this catches it and surfaces the message.
interface MorphingErrorBoundaryProps {
  children: React.ReactNode;
  onError: (err: Error) => void;
}
interface MorphingErrorBoundaryState {
  error: Error | null;
}
class MorphingWireErrorBoundary extends React.Component<
  MorphingErrorBoundaryProps,
  MorphingErrorBoundaryState
> {
  state: MorphingErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): MorphingErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error): void {
    this.props.onError(error);
    console.error("[HeroDebug] MorphingWireHero error:", error);
  }

  render() {
    if (this.state.error) return null; // error shown in debug overlay
    return this.props.children;
  }
}

const LOOP_H = 18.0;
const BASE_SPEED = 1.5;
/** Horizontal spread of rain columns — unchanged so composition stays the same. */
const HERO_RAIN_SPREAD = 16.5;
const HOLD_HEAD = 6;
const HOLD_SKILL = 4.4;
const MORPH_DUR = 2.4;
const MORPH_SEGMENTS = 1200;
const TARGET_MODEL_HEIGHT = 2.56;
const WIRE_COLOR = new THREE.Color("#fff4f7");
const WIRE_MORPH_COLOR = new THREE.Color("#ff365e");
const HERO_MODEL_SEQUENCE = [
  { label: heroContent.skillLabels[0], src: "/models/hero-wire/headref.glb" },
  { label: heroContent.skillLabels[1], src: "/models/hero-wire/design.glb" },
  { label: heroContent.skillLabels[2], src: "/models/hero-wire/prototyping.glb" },
  { label: heroContent.skillLabels[3], src: "/models/hero-wire/video.glb" },
  { label: heroContent.skillLabels[4], src: "/models/hero-wire/generalist.glb" },
  { label: heroContent.skillLabels[5], src: "/models/hero-wire/laptop.glb" },
  { label: heroContent.skillLabels[6], src: "/models/hero-wire/headphones.glb" },
] as const;
const HERO_MODEL_TRANSFORMS = [
  { rotation: [-0.12, 0, 0] as [number, number, number] },             // head — faces forward
  { rotation: [0, Math.PI * 1.5, 0] as [number, number, number] },     // design — additional quarter turn toward camera
  { rotation: [0, Math.PI * 0.5, 0] as [number, number, number] },     // prototyping — front toward camera
  { rotation: [Math.PI * 0.5, 0, 0] as [number, number, number] },     // motion — VHS front faces camera
  { rotation: [0, -Math.PI * 0.5, 0] as [number, number, number] },    // 3D generalist — quarter turn toward camera
  { rotation: [0.22, Math.PI * 0.78, 0] as [number, number, number] }, // laptop — open lid angle
  { rotation: [0, -Math.PI * 0.5, 0] as [number, number, number] },    // headphones — turn toward camera
] as const;

function buildCharAtlas(): THREE.CanvasTexture {
  const grid = 8;
  const cell = 64;
  const size = grid * cell;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Failed to create matrix atlas context.");
  }

  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, size, size);

  const chars = [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z",
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "£",
    "%",
    "&",
    "@",
    "?",
    "!",
    "+",
    "-",
    "=",
    "/",
    "\\",
    "<",
    ">",
    "[",
    "]",
    "{",
    "}",
    "*",
    "ア",
    "イ",
    "ウ",
    "エ",
    "オ",
    "カ",
    "キ",
    "ク",
    "ケ",
    "コ",
  ];

  ctx.fillStyle = "#fff";
  ctx.font = `bold ${cell * 0.72}px monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  chars.forEach((char, index) => {
    const col = index % grid;
    const row = Math.floor(index / grid);
    ctx.fillText(char, col * cell + cell / 2, row * cell + cell / 2);
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

const fragmentShader = /* glsl */ `
  uniform sampler2D uCharAtlas;
  uniform float uTime;
  uniform float uCharCycleSpeed;

  varying float vCharIndex;
  varying float vBrightness;
  varying float vAlpha;
  varying float vTrailT;
  varying float vStick;
  varying float vWhiteFlash;

  void main() {
    float decodeSpeed = mix(8.5, 0.3, vTrailT);
    float decodeCycle = floor(uTime * (uCharCycleSpeed + decodeSpeed));
    float idx = mod(vCharIndex + mix(decodeCycle, 0.0, vStick), 64.0);
    float col = mod(idx, 8.0);
    float row = floor(idx / 8.0);

    vec2 uv = (gl_PointCoord + vec2(col, row)) / 8.0;
    float glyph = texture2D(uCharAtlas, uv).r;

    if (glyph < 0.1) discard;

    // Deep saturated red at head, dark red fading in tail, amber-red when settled/decoded.
    // A small fraction of decoded glyphs lock to white as their final resolved character.
    vec3 headColor   = vec3(1.0,  0.06, 0.18);
    vec3 tailColor   = vec3(0.45, 0.01, 0.06);
    vec3 settleColor = vec3(0.88, 0.26, 0.04);
    vec3 whiteColor  = vec3(1.0, 1.0, 1.0);
    vec3 color = mix(tailColor, headColor, pow(1.0 - vTrailT, 2.5));
    color = mix(color, settleColor, vStick * 0.75);
    color = mix(color, whiteColor, vWhiteFlash);
    color *= vBrightness;
    gl_FragColor = vec4(color, glyph * vAlpha);
  }
`;

const bgVertexShader = /* glsl */ `
  attribute float aColX;
  attribute float aColZ;
  attribute float aSpeedJitter;
  attribute float aCharIndex;
  attribute float aPhaseOffset;
  attribute float aDepthDrift;
  attribute float aRowIndex;
  attribute float aTrailLength;
  attribute float aGlowSeed;

  uniform float uTime;
  uniform float uBaseSpeed;
  uniform float uLoopH;
  uniform float uPixelRatio;

  varying float vCharIndex;
  varying float vBrightness;
  varying float vAlpha;
  varying float vTrailT;
  varying float vStick;
  varying float vWhiteFlash;

  void main() {
    float speed = uBaseSpeed * (0.78 + aSpeedJitter * 0.44);
    float rowSpacing = 0.44;
    float headY = mod(aPhaseOffset - uTime * speed, uLoopH + aTrailLength * rowSpacing) - aTrailLength * rowSpacing;
    float yRaw = mod(headY + aRowIndex * rowSpacing + uLoopH * 2.0, uLoopH) - uLoopH * 0.5;

    // No lateral swirl — clean vertical streams
    vec3 worldPos = vec3(aColX, yRaw, aDepthDrift);

    float trailMask = 1.0 - smoothstep(aTrailLength - 0.4, aTrailLength + 0.5, aRowIndex);
    float trailT = clamp(aRowIndex / max(aTrailLength, 1.0), 0.0, 1.0);
    float depthGlow = smoothstep(-7.0, 3.5, aDepthDrift);
    float liveFlicker = 0.88 + 0.12 * sin(uTime * 9.0 + aGlowSeed * 6.0 - aRowIndex * 0.42);

    // ~45% of mid-tail positions settle (decode) — lock onto a character
    float settleBand = smoothstep(0.08, 0.5, trailT) * (1.0 - smoothstep(0.82, 1.0, trailT));
    float settle = step(0.55, fract(sin(aGlowSeed * 31.7 + floor(uTime * 0.32 + aColX * 0.65)) * 43758.5453)) * settleBand;
    float whiteFlash = step(0.90, fract(sin(aGlowSeed * 71.3 + aCharIndex * 1.7 + floor(uTime * 0.22)) * 24634.6345)) * settle;

    // Exponential decay from head (bright) to tail (near-invisible)
    float decay = exp(-trailT * 4.5);
    float headBoost = pow(1.0 - trailT, 3.0) * 0.8;

    vBrightness = trailMask * (decay * liveFlicker * 0.85 + headBoost * (0.35 + depthGlow * 0.3) + settle * 0.52);

    float topFade = 1.0 - smoothstep(7.0, uLoopH * 0.5, yRaw);
    float botFade = smoothstep(-uLoopH * 0.5, -7.0, yRaw);
    vAlpha = trailMask * topFade * botFade * (decay * 0.85 + headBoost * 0.9 + settle * 0.32);

    vCharIndex = aCharIndex;
    vTrailT = trailT;
    vStick = settle;
    vWhiteFlash = whiteFlash;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(worldPos, 1.0);

    float dist = length((modelViewMatrix * vec4(worldPos, 1.0)).xyz);
    gl_PointSize = (112.0 / dist) * uPixelRatio * mix(0.72, 1.5, (1.0 - trailT) + settle * 0.12);
  }
`;

type HeroRainGridConfig = {
  gridColsX: number;
  gridDepthLayers: number;
  rainRows: number;
};

function useHeroRainGridConfig(useLiteHero: boolean): HeroRainGridConfig {
  const [config, setConfig] = useState<HeroRainGridConfig>({
    gridColsX: 14,
    gridDepthLayers: 13,
    rainRows: 16,
  });

  useEffect(() => {
    const readSaveData = () => {
      const nav = navigator as Navigator & {
        connection?: { saveData?: boolean };
        mozConnection?: { saveData?: boolean };
        webkitConnection?: { saveData?: boolean };
      };
      const c = nav.connection ?? nav.mozConnection ?? nav.webkitConnection;
      return Boolean(c?.saveData);
    };

    const compute = (): HeroRainGridConfig => {
      const narrow = window.matchMedia("(max-width: 767px)").matches;
      const coarse = window.matchMedia("(pointer: coarse)").matches;
      const saveData = readSaveData();
      const cores = typeof navigator.hardwareConcurrency === "number" ? navigator.hardwareConcurrency : 8;
      const light = saveData || cores <= 4;
      const iosLike = isIOSLike();

      if (useLiteHero || iosLike) {
        return narrow || coarse
          ? { gridColsX: 7, gridDepthLayers: 6, rainRows: 9 }
          : { gridColsX: 9, gridDepthLayers: 7, rainRows: 10 };
      }

      if (narrow || coarse) {
        return light
          ? { gridColsX: 9, gridDepthLayers: 8, rainRows: 12 }
          : { gridColsX: 11, gridDepthLayers: 10, rainRows: 14 };
      }
      if (light) {
        return { gridColsX: 12, gridDepthLayers: 11, rainRows: 15 };
      }
      return { gridColsX: 14, gridDepthLayers: 13, rainRows: 16 };
    };

    const apply = () => setConfig(compute());
    apply();
    const mqNarrow = window.matchMedia("(max-width: 767px)");
    const mqCoarse = window.matchMedia("(pointer: coarse)");
    mqNarrow.addEventListener("change", apply);
    mqCoarse.addEventListener("change", apply);
    return () => {
      mqNarrow.removeEventListener("change", apply);
      mqCoarse.removeEventListener("change", apply);
    };
  }, [useLiteHero]);

  return config;
}

const BackgroundRain = React.memo(function BackgroundRain({
  atlas,
  gridColsX,
  gridDepthLayers,
  rainRows,
}: {
  atlas: THREE.CanvasTexture;
  gridColsX: number;
  gridDepthLayers: number;
  rainRows: number;
}) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const attrs = useMemo(() => {
    const heroRainColumns = gridColsX * gridDepthLayers;
    const pointCount = heroRainColumns * rainRows;
    const position = new Float32Array(pointCount * 3);
    const colX = new Float32Array(pointCount);
    const colZ = new Float32Array(pointCount);
    const speedJitter = new Float32Array(pointCount);
    const charIndex = new Float32Array(pointCount);
    const phaseOffset = new Float32Array(pointCount);
    const depthDrift = new Float32Array(pointCount);
    const rowIndex = new Float32Array(pointCount);
    const trailLength = new Float32Array(pointCount);
    const glowSeed = new Float32Array(pointCount);

    for (let column = 0; column < heroRainColumns; column += 1) {
      const columnOffset = column * rainRows;
      // Regular 3D grid: evenly spaced X columns, layered Z depths
      const gx = column % gridColsX;
      const gz = Math.floor(column / gridColsX);
      const xNorm = gridColsX > 1 ? gx / (gridColsX - 1) : 0.5;
      const zNorm = gridDepthLayers > 1 ? gz / (gridDepthLayers - 1) : 0.5;
      const baseX = -HERO_RAIN_SPREAD * 0.5 + xNorm * HERO_RAIN_SPREAD + (Math.random() - 0.5) * 0.55;
      const columnDepth = -7.5 + zNorm * 10.5 + (Math.random() - 0.5) * 0.4;
      const columnSpeed = Math.random();
      const columnChar = Math.floor(Math.random() * 64);
      const columnPhase = Math.random() * (LOOP_H + 8.0);
      const columnTrail = 8 + Math.floor(Math.random() * 12);
      const columnGlow = Math.random() * 10.0;

      for (let row = 0; row < rainRows; row += 1) {
        const index = columnOffset + row;
        colX[index] = baseX;
        colZ[index] = 0;
        speedJitter[index] = columnSpeed;
        charIndex[index] = (columnChar + row * 7) % 64;
        phaseOffset[index] = columnPhase;
        depthDrift[index] = columnDepth;
        rowIndex[index] = row;
        trailLength[index] = columnTrail;
        glowSeed[index] = columnGlow;
      }
    }

    return {
      position,
      colX,
      colZ,
      speedJitter,
      charIndex,
      phaseOffset,
      depthDrift,
      rowIndex,
      trailLength,
      glowSeed,
    };
  }, [gridColsX, gridDepthLayers, rainRows]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uCharAtlas: { value: atlas },
      uBaseSpeed: { value: BASE_SPEED },
      uLoopH: { value: LOOP_H },
      uPixelRatio: { value: window.devicePixelRatio || 1 },
      uCharCycleSpeed: { value: 0.65 },
    }),
    [atlas],
  );

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
    }
  });

  return (
    <points renderOrder={0}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[attrs.position, 3]} />
        <bufferAttribute attach="attributes-aColX" args={[attrs.colX, 1]} />
        <bufferAttribute attach="attributes-aColZ" args={[attrs.colZ, 1]} />
        <bufferAttribute attach="attributes-aSpeedJitter" args={[attrs.speedJitter, 1]} />
        <bufferAttribute attach="attributes-aCharIndex" args={[attrs.charIndex, 1]} />
        <bufferAttribute attach="attributes-aPhaseOffset" args={[attrs.phaseOffset, 1]} />
        <bufferAttribute attach="attributes-aDepthDrift" args={[attrs.depthDrift, 1]} />
        <bufferAttribute attach="attributes-aRowIndex" args={[attrs.rowIndex, 1]} />
        <bufferAttribute attach="attributes-aTrailLength" args={[attrs.trailLength, 1]} />
        <bufferAttribute attach="attributes-aGlowSeed" args={[attrs.glowSeed, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={bgVertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
});

function normalizeLinePositions(source: Float32Array, targetHeight: number) {
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let minZ = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  let maxZ = Number.NEGATIVE_INFINITY;

  for (let index = 0; index < source.length; index += 3) {
    const x = source[index];
    const y = source[index + 1];
    const z = source[index + 2];
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    minZ = Math.min(minZ, z);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
    maxZ = Math.max(maxZ, z);
  }

  const centerX = (minX + maxX) * 0.5;
  const centerY = (minY + maxY) * 0.5;
  const centerZ = (minZ + maxZ) * 0.5;
  const maxDimension = Math.max(maxX - minX, maxY - minY, maxZ - minZ) || 1;
  const scale = targetHeight / maxDimension;
  const normalized = new Float32Array(source.length);

  for (let index = 0; index < source.length; index += 3) {
    normalized[index] = (source[index] - centerX) * scale;
    normalized[index + 1] = (source[index + 1] - centerY) * scale;
    normalized[index + 2] = (source[index + 2] - centerZ) * scale;
  }

  return normalized;
}

function resampleLineSegments(source: Float32Array, segmentCount: number) {
  const sourceSegments = Math.max(1, Math.floor(source.length / 6));
  const output = new Float32Array(segmentCount * 6);

  for (let index = 0; index < segmentCount; index += 1) {
    const sourceIndex = Math.floor((index / segmentCount) * sourceSegments);
    const sourceOffset = sourceIndex * 6;
    const outputOffset = index * 6;

    output[outputOffset] = source[sourceOffset];
    output[outputOffset + 1] = source[sourceOffset + 1];
    output[outputOffset + 2] = source[sourceOffset + 2];
    output[outputOffset + 3] = source[sourceOffset + 3];
    output[outputOffset + 4] = source[sourceOffset + 4];
    output[outputOffset + 5] = source[sourceOffset + 5];
  }

  return output;
}

function buildMorphTarget(scene: THREE.Object3D) {
  const positions: number[] = [];
  scene.updateWorldMatrix(true, true);

  scene.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) {
      return;
    }

    const sourceGeometry = child.geometry?.clone();
    if (!sourceGeometry) {
      return;
    }

    sourceGeometry.applyMatrix4(child.matrixWorld);
    const edgeGeometry = new THREE.EdgesGeometry(sourceGeometry, 22);
    sourceGeometry.dispose();

    const edgePositions = edgeGeometry.getAttribute("position");
    for (let index = 0; index < edgePositions.count; index += 1) {
      positions.push(
        edgePositions.getX(index),
        edgePositions.getY(index),
        edgePositions.getZ(index),
      );
    }

    edgeGeometry.dispose();
  });

  const normalized = normalizeLinePositions(new Float32Array(positions), TARGET_MODEL_HEIGHT);
  return resampleLineSegments(normalized, MORPH_SEGMENTS);
}

function buildOrientedMorphTarget(scene: THREE.Group, modelIndex: number) {
  const wrapper = new THREE.Group();
  const orientedScene = scene.clone(true);
  const transform = HERO_MODEL_TRANSFORMS[modelIndex];

  wrapper.rotation.set(...transform.rotation);
  wrapper.add(orientedScene);
  return buildMorphTarget(wrapper);
}

function buildLineColors(vertexCount: number, accentRatio = 0.4) {
  const colors = new Float32Array(vertexCount * 3);
  const accentModulo = 10;
  const accentThreshold = Math.max(1, Math.min(accentModulo - 1, Math.round(accentRatio * accentModulo)));

  for (let index = 0; index < vertexCount; index += 2) {
    const pairIndex = index / 2;
    const accentBand = pairIndex % accentModulo < accentThreshold;
    const color = accentBand ? WIRE_MORPH_COLOR : WIRE_COLOR;

    colors[index * 3] = color.r;
    colors[index * 3 + 1] = color.g;
    colors[index * 3 + 2] = color.b;

    if (index + 1 < vertexCount) {
      colors[(index + 1) * 3] = color.r;
      colors[(index + 1) * 3 + 1] = color.g;
      colors[(index + 1) * 3 + 2] = color.b;
    }
  }

  return colors;
}

// ─── Procedural wireframe scene builders ─────────────────────────────────────
// These replace the GLB files for paintbrush, cinema camera, and gizmo.
// buildMorphTarget extracts THREE.EdgesGeometry from any Mesh in the scene,
// so standard Three.js geometry works identically to loaded GLBs.


// ─────────────────────────────────────────────────────────────────────────────

const MorphingWireHero = React.memo(function MorphingWireHero({
  onSkillChange,
}: {
  onSkillChange: (label: string) => void;
}) {
  const rootRef = useRef<THREE.Group>(null);
  const lineRef = useRef<THREE.LineSegments>(null);
  const sequenceRef = useRef(0);
  const phaseRef = useRef<"hold" | "morph">("hold");
  const phaseTimerRef = useRef(0);

  const gltfs = useLoader(
    GLTFLoader,
    HERO_MODEL_SEQUENCE.map((model) => model.src),
  ) as Array<{ scene: THREE.Group }>;

  const targets = useMemo(
    () => gltfs.map((gltf, index) => buildOrientedMorphTarget(gltf.scene, index)),
    [gltfs],
  );
  const colorTargets = useMemo(
    () =>
      HERO_MODEL_SEQUENCE.map((_, index) =>
        buildLineColors(MORPH_SEGMENTS * 2, index === 1 ? 0.6 : 0.4),
      ),
    [],
  );

  const geometry = useMemo(() => {
    const initialPositions = targets[0] ? targets[0].slice() : new Float32Array(MORPH_SEGMENTS * 6);
    const initialColors = colorTargets[0]
      ? colorTargets[0].slice()
      : new Float32Array(MORPH_SEGMENTS * 2 * 3);
    const bufferGeometry = new THREE.BufferGeometry();
    bufferGeometry.setAttribute("position", new THREE.BufferAttribute(initialPositions, 3));
    bufferGeometry.setAttribute("color", new THREE.BufferAttribute(initialColors, 3));
    return bufferGeometry;
  }, [colorTargets, targets]);

  useEffect(() => {
    onSkillChange(HERO_MODEL_SEQUENCE[0].label);
  }, [onSkillChange]);

  useEffect(() => {
    return () => {
      geometry.dispose();
    };
  }, [geometry]);

  useFrame(({ clock }, delta) => {
    const root = rootRef.current;
    const geometryObject = lineRef.current?.geometry;
    const positionAttribute = geometryObject?.getAttribute("position") as
      | THREE.BufferAttribute
      | undefined;
    const colorAttribute = geometryObject?.getAttribute("color") as
      | THREE.BufferAttribute
      | undefined;

    if (!root || !positionAttribute || !colorAttribute || targets.length === 0) {
      return;
    }

    const elapsed = clock.getElapsedTime();
    const currentIndex = sequenceRef.current;
    const nextIndex = (currentIndex + 1) % targets.length;

    phaseTimerRef.current += delta;

    let morphT = 0;
    let completedMorph = false;
    if (phaseRef.current === "hold") {
      const holdFor = currentIndex === 0 ? HOLD_HEAD : HOLD_SKILL;
      if (phaseTimerRef.current >= holdFor) {
        phaseRef.current = "morph";
        phaseTimerRef.current = 0;
      }
    } else {
      morphT = Math.min(phaseTimerRef.current / MORPH_DUR, 1);
      if (phaseTimerRef.current >= MORPH_DUR) {
        completedMorph = true;
      }
    }

    const eased =
      morphT < 0.5 ? 4 * morphT * morphT * morphT : 1 - Math.pow(-2 * morphT + 2, 3) / 2;
    const sourcePositions = targets[currentIndex];
    const targetPositions = phaseRef.current === "hold" ? targets[currentIndex] : targets[nextIndex];
    const destination = positionAttribute.array as Float32Array;
    const sourceColors = colorTargets[currentIndex];
    const targetColors = phaseRef.current === "hold" ? colorTargets[currentIndex] : colorTargets[nextIndex];
    const colorDestination = colorAttribute.array as Float32Array;

    for (let index = 0; index < destination.length; index += 1) {
      destination[index] = THREE.MathUtils.lerp(sourcePositions[index], targetPositions[index], eased);
    }

    positionAttribute.needsUpdate = true;

    for (let index = 0; index < colorDestination.length; index += 1) {
      colorDestination[index] = THREE.MathUtils.lerp(sourceColors[index], targetColors[index], eased);
    }

    colorAttribute.needsUpdate = true;

    if (completedMorph) {
      sequenceRef.current = nextIndex;
      phaseRef.current = "hold";
      phaseTimerRef.current = 0;
      onSkillChange(HERO_MODEL_SEQUENCE[nextIndex].label);
    }

    root.rotation.y = Math.sin(elapsed * 0.32) * 0.28;
    root.rotation.x = -0.02 + Math.cos(elapsed * 0.24) * 0.025;
    root.rotation.z = Math.sin(elapsed * 0.18) * 0.035;
    root.position.y = Math.sin(elapsed * 0.74) * 0.06;
  });

  return (
    <group ref={rootRef} renderOrder={2}>
      <lineSegments geometry={geometry} ref={lineRef}>
        <lineBasicMaterial
          vertexColors
          transparent
          opacity={0.95}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </lineSegments>
    </group>
  );
});

const LiteWireHero = React.memo(function LiteWireHero({
  onSkillChange,
}: {
  onSkillChange: (label: string) => void;
}) {
  const rootRef = useRef<THREE.Group>(null);
  const ringsRef = useRef<THREE.Group>(null);
  const pulseRef = useRef<THREE.Mesh>(null);
  const [skillIndex, setSkillIndex] = useState(0);

  useEffect(() => {
    onSkillChange(heroContent.skillLabels[skillIndex] ?? heroContent.skillLabels[0] ?? "");
  }, [onSkillChange, skillIndex]);

  useEffect(() => {
    if (heroContent.skillLabels.length <= 1) {
      return;
    }

    const interval = window.setInterval(() => {
      setSkillIndex((current) => (current + 1) % heroContent.skillLabels.length);
    }, 2600);

    return () => window.clearInterval(interval);
  }, []);

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();
    const root = rootRef.current;
    const rings = ringsRef.current;
    const pulse = pulseRef.current;

    if (root) {
      root.rotation.y = Math.sin(elapsed * 0.45) * 0.3;
      root.rotation.x = -0.08 + Math.cos(elapsed * 0.28) * 0.05;
      root.position.y = Math.sin(elapsed * 0.8) * 0.05;
    }

    if (rings) {
      rings.rotation.z = elapsed * 0.18;
      rings.rotation.x = Math.sin(elapsed * 0.2) * 0.18;
    }

    if (pulse) {
      const scale = 1 + Math.sin(elapsed * 1.5) * 0.04;
      pulse.scale.setScalar(scale);
    }
  });

  return (
    <group ref={rootRef} renderOrder={2}>
      <mesh ref={pulseRef}>
        <icosahedronGeometry args={[1.1, 1]} />
        <meshBasicMaterial
          color="#ffe8ee"
          wireframe
          transparent
          opacity={0.92}
        />
      </mesh>
      <group ref={ringsRef}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.45, 0.018, 8, 90]} />
          <meshBasicMaterial color="#ff365e" wireframe />
        </mesh>
        <mesh rotation={[0.4, 0.9, 0]}>
          <torusGeometry args={[1.72, 0.014, 8, 72]} />
          <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.65} />
        </mesh>
      </group>
      <lineSegments rotation={[0.15, 0, 0]}>
        <edgesGeometry args={[new THREE.BoxGeometry(0.48, 1.7, 0.48)]} />
        <lineBasicMaterial color="#8f1731" transparent opacity={0.75} />
      </lineSegments>
    </group>
  );
});

export function MatrixRainHero() {
  const [activeSkill, setActiveSkill] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const hasWebGL = useWebGLAvailability();
  const atlas = useMemo(() => buildCharAtlas(), []);
  const iosLike = typeof document !== "undefined" && isIOSLike();
  const useLiteHero = iosLike;
  const rainGrid = useHeroRainGridConfig(useLiteHero);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    return () => {
      atlas.dispose();
    };
  }, [atlas]);

  return (
    <div
      id="hero"
      className="relative z-[5] flex min-h-[100svh] w-full items-end justify-center md:items-center overflow-hidden bg-black"
    >
<div className="absolute inset-0 z-0">
        {hasWebGL ? (
          <Canvas
            camera={{ position: [0, isMobile ? 0.15 : 0.18, isMobile ? 6.5 : 5.5], fov: isMobile ? 52 : 50 }}
            dpr={isMobile ? [1, 1.2] : [1, 1.5]}
            gl={{ antialias: false, powerPreference: "default" }}
            performance={{ min: 0.5 }}
          >
            <BackgroundRain
              atlas={atlas}
              gridColsX={rainGrid.gridColsX}
              gridDepthLayers={rainGrid.gridDepthLayers}
              rainRows={rainGrid.rainRows}
            />
            <group position={[0, isMobile ? 0.65 : 0.82, 0]}>
              {useLiteHero ? (
                <LiteWireHero onSkillChange={setActiveSkill} />
              ) : (
                <MorphingWireErrorBoundary onError={() => {}}>
                  <MorphingWireHero onSkillChange={setActiveSkill} />
                </MorphingWireErrorBoundary>
              )}
            </group>
          </Canvas>
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 50% 30%, rgba(255,0,60,0.14), transparent 26%), linear-gradient(180deg, rgba(10,0,3,0.55), rgba(0,0,0,0.9))",
            }}
          />
        )}
      </div>

      <div
        className="pointer-events-none absolute inset-0 z-10 opacity-[0.05]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,0,60,0.95) 2px, rgba(255,0,60,0.95) 4px)",
        }}
      />

      <div className="pointer-events-none relative z-20 flex w-full justify-center px-6 pb-10 md:pb-0 md:pt-[45vh] lg:pt-[47vh]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="max-w-5xl text-center"
        >
          <div className="mb-3 font-mono uppercase tracking-[0.3em] text-white">
            {siteProfile.role}
          </div>
          <h1 className="mb-4">
            <span className="mb-3 block text-5xl font-normal md:text-7xl lg:text-8xl">
              <span className="text-white">{siteProfile.brandPrefix}</span>
              <span className="text-[#ff003c]">{siteProfile.brandSuffix}</span>
            </span>
          </h1>
          <div className="mx-auto mb-6 max-w-2xl border border-[#ff003c]/30 bg-black/95 px-5 py-4 md:mb-8">
            <p className="font-mono text-base text-zinc-400 md:text-lg lg:text-xl">
              {siteProfile.headline}
            </p>
          </div>

          {/* Mobile-only scroll indicator — flows below text so spacing is even */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 2, repeat: Infinity, repeatType: "reverse" }}
            className="flex flex-col items-center md:hidden"
          >
            <div className="mb-2 font-mono text-xs uppercase tracking-widest text-[#ff003c]">
              {heroContent.scrollLabel}
            </div>
            <div className="h-8 w-px bg-gradient-to-b from-[#ff003c] to-transparent" />
          </motion.div>
        </motion.div>
      </div>

      <AnimatePresence>
        {activeSkill && activeSkill !== heroContent.skillLabels[0] ? (
          <motion.div
            key={activeSkill}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.45 }}
            className="pointer-events-none absolute left-1/2 top-4 z-[75] hidden -translate-x-1/2 border border-white/15 bg-black/55 px-3 py-3 font-mono text-[11px] uppercase tracking-[0.3em] text-white shadow-[0_12px_30px_rgba(0,0,0,0.2)] backdrop-blur-md md:block"
          >
            {activeSkill}
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Desktop-only scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 2, repeat: Infinity, repeatType: "reverse" }}
        className="pointer-events-none absolute bottom-8 left-1/2 z-20 hidden -translate-x-1/2 md:block"
      >
        <div className="mb-2 font-mono text-xs uppercase tracking-widest text-[#ff003c]">
          {heroContent.scrollLabel}
        </div>
        <div className="mx-auto h-12 w-px bg-gradient-to-b from-[#ff003c] to-transparent" />
      </motion.div>
    </div>
  );
}
