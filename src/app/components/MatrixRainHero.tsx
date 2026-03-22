import React, { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { AnimatePresence, motion } from "motion/react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import { heroContent, siteProfile } from "../data/portfolio";
import { useWebGLAvailability } from "../lib/webgl";

const LOOP_H = 18.0;
const BASE_SPEED = 1.5;
const HERO_RAIN_COLUMNS = 182;
const HERO_RAIN_ROWS = 16;
const HERO_RAIN_SPREAD = 16.5;
const GRID_COLS_X = 14;
const GRID_DEPTH_LAYERS = 13; // 14 × 13 = 182
const HOLD_HEAD = 6;
const HOLD_SKILL = 4.4;
const MORPH_DUR = 2.4;
const MORPH_SEGMENTS = 1200;
const TARGET_MODEL_HEIGHT = 3.2;
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
  { rotation: [0, 0, 0] as [number, number, number] },                 // design — straight on
  { rotation: [0, 0, 0] as [number, number, number] },                 // prototyping — straight on
  { rotation: [0, 0, 0] as [number, number, number] },                 // motion — straight on
  { rotation: [0, 0, 0] as [number, number, number] },                 // 3D generalist — straight on
  { rotation: [0.22, Math.PI * 0.78, 0] as [number, number, number] }, // laptop — open lid angle
  { rotation: [0, 0, 0] as [number, number, number] },                 // headphones — straight on
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
    "サ",
    "シ",
    "ス",
    "セ",
    "ソ",
    "タ",
    "チ",
    "ツ",
    "テ",
    "ト",
    "ナ",
    "ニ",
    "ヌ",
    "ネ",
    "ノ",
    "ハ",
    "ヒ",
    "フ",
    "ヘ",
    "ホ",
    "マ",
    "ミ",
    "ム",
    "メ",
    "モ",
    "ヤ",
    "ユ",
    "ヨ",
    "ラ",
    "ル",
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "!",
    "@",
    "#",
    "$",
    "%",
    "<",
    ">",
    "{",
    "}",
    "|",
    "/",
    "\\",
    "+",
    "-",
    "*",
    "&",
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

  void main() {
    float decodeSpeed = mix(8.5, 0.3, vTrailT);
    float decodeCycle = floor(uTime * (uCharCycleSpeed + decodeSpeed));
    float idx = mod(vCharIndex + mix(decodeCycle, 0.0, vStick), 64.0);
    float col = mod(idx, 8.0);
    float row = floor(idx / 8.0);

    vec2 uv = (gl_PointCoord + vec2(col, row)) / 8.0;
    float glyph = texture2D(uCharAtlas, uv).r;

    if (glyph < 0.1) discard;

    // Deep saturated red at head, dark red fading in tail, amber-red when settled/decoded
    vec3 headColor   = vec3(1.0,  0.06, 0.18);
    vec3 tailColor   = vec3(0.45, 0.01, 0.06);
    vec3 settleColor = vec3(0.88, 0.26, 0.04);
    vec3 color = mix(tailColor, headColor, pow(1.0 - vTrailT, 2.5));
    color = mix(color, settleColor, vStick * 0.75);
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
    gl_Position = projectionMatrix * modelViewMatrix * vec4(worldPos, 1.0);

    float dist = length((modelViewMatrix * vec4(worldPos, 1.0)).xyz);
    gl_PointSize = (112.0 / dist) * uPixelRatio * mix(0.72, 1.5, (1.0 - trailT) + settle * 0.12);
  }
`;

const BackgroundRain = React.memo(function BackgroundRain({
  atlas,
}: {
  atlas: THREE.CanvasTexture;
}) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const attrs = useMemo(() => {
    const pointCount = HERO_RAIN_COLUMNS * HERO_RAIN_ROWS;
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

    for (let column = 0; column < HERO_RAIN_COLUMNS; column += 1) {
      const columnOffset = column * HERO_RAIN_ROWS;
      // Regular 3D grid: evenly spaced X columns, layered Z depths
      const gx = column % GRID_COLS_X;
      const gz = Math.floor(column / GRID_COLS_X);
      const xNorm = GRID_COLS_X > 1 ? gx / (GRID_COLS_X - 1) : 0.5;
      const zNorm = GRID_DEPTH_LAYERS > 1 ? gz / (GRID_DEPTH_LAYERS - 1) : 0.5;
      const baseX = -HERO_RAIN_SPREAD * 0.5 + xNorm * HERO_RAIN_SPREAD + (Math.random() - 0.5) * 0.55;
      const columnDepth = -7.5 + zNorm * 10.5 + (Math.random() - 0.5) * 0.4;
      const columnSpeed = Math.random();
      const columnChar = Math.floor(Math.random() * 64);
      const columnPhase = Math.random() * (LOOP_H + 8.0);
      const columnTrail = 8 + Math.floor(Math.random() * 12);
      const columnGlow = Math.random() * 10.0;

      for (let row = 0; row < HERO_RAIN_ROWS; row += 1) {
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
  }, []);

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

function buildLineColors(vertexCount: number) {
  const colors = new Float32Array(vertexCount * 3);

  for (let index = 0; index < vertexCount; index += 2) {
    const color = Math.random() > 0.30 ? WIRE_COLOR : WIRE_MORPH_COLOR;

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

  const geometry = useMemo(() => {
    const initialPositions = targets[0] ? targets[0].slice() : new Float32Array(MORPH_SEGMENTS * 6);
    const bufferGeometry = new THREE.BufferGeometry();
    bufferGeometry.setAttribute("position", new THREE.BufferAttribute(initialPositions, 3));
    bufferGeometry.setAttribute(
      "color",
      new THREE.BufferAttribute(buildLineColors(MORPH_SEGMENTS * 2), 3),
    );
    return bufferGeometry;
  }, [targets]);

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

    if (!root || !positionAttribute || targets.length === 0) {
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

    for (let index = 0; index < destination.length; index += 1) {
      destination[index] = THREE.MathUtils.lerp(sourcePositions[index], targetPositions[index], eased);
    }

    positionAttribute.needsUpdate = true;

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

export function MatrixRainHero() {
  const [activeSkill, setActiveSkill] = useState("");
  const hasWebGL = useWebGLAvailability();
  const atlas = useMemo(() => buildCharAtlas(), []);

  useEffect(() => {
    return () => {
      atlas.dispose();
    };
  }, [atlas]);

  return (
    <div
      id="hero"
      className="relative flex min-h-[100svh] w-full items-center justify-center overflow-hidden bg-black"
    >
      <div className="absolute inset-0 z-0">
        {hasWebGL ? (
          <Canvas camera={{ position: [0, 0.3, 5.5], fov: 50 }} dpr={[1, 1.5]} performance={{ min: 0.5 }}>
            <BackgroundRain atlas={atlas} />
            <group position={[0, 0.75, 0]}>
              <MorphingWireHero onSkillChange={setActiveSkill} />
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

      <div className="pointer-events-none relative z-20 flex w-full justify-center px-6 pt-[41vh] md:pt-[43vh] lg:pt-[45vh]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="max-w-5xl text-center"
        >
          <div className="mb-3 font-mono uppercase tracking-[0.3em] text-[#ff003c] opacity-70">
            {siteProfile.role}
          </div>
          <h1 className="mb-4">
            <span className="mb-3 block text-5xl font-normal md:text-7xl lg:text-8xl">
              <span className="text-white">{siteProfile.brandPrefix}</span>
              <span className="text-[#ff003c]">{siteProfile.brandSuffix}</span>
            </span>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl font-mono text-base text-zinc-400 md:text-lg lg:text-xl">
            {siteProfile.headline}
          </p>
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
            className="pointer-events-none absolute left-1/2 top-4 z-[75] -translate-x-1/2 border border-white/15 bg-black/55 px-3 py-3 font-mono text-[11px] uppercase tracking-[0.3em] text-white shadow-[0_12px_30px_rgba(0,0,0,0.2)] backdrop-blur-md"
          >
            {activeSkill}
          </motion.div>
        ) : null}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 2, repeat: Infinity, repeatType: "reverse" }}
        className="pointer-events-none absolute bottom-8 left-1/2 z-20 -translate-x-1/2"
      >
        <div className="mb-2 font-mono text-xs uppercase tracking-widest text-[#ff003c]">
          {heroContent.scrollLabel}
        </div>
        <div className="mx-auto h-12 w-px bg-gradient-to-b from-[#ff003c] to-transparent" />
      </motion.div>
    </div>
  );
}
