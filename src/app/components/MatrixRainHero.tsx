import React, { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { AnimatePresence, motion } from "motion/react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import { siteProfile } from "../data/portfolio";

const LOOP_H = 18.0;
const BASE_SPEED = 1.5;
const COUNT_BG = 8200;
const SPREAD_BG = 13.5;
const HOLD_HEAD = 6;
const HOLD_SKILL = 4.4;
const MORPH_DUR = 2.4;
const MORPH_SEGMENTS = 1800;
const TARGET_MODEL_HEIGHT = 2.55;
const WIRE_COLOR = new THREE.Color("#fff4f7");
const WIRE_MORPH_COLOR = new THREE.Color("#ff365e");
const HERO_MODEL_SEQUENCE = [
  { label: "Head", src: "/models/hero-wire/headref.glb" },
  { label: "Prototypes", src: "/models/hero-wire/laptop.glb" },
  { label: "Design", src: "/models/hero-wire/paintbrush.glb" },
  { label: "Video Editing", src: "/models/hero-wire/camera.glb" },
  { label: "Audio Production", src: "/models/hero-wire/headphones.glb" },
  { label: "3D Modelling", src: "/models/hero-wire/light-cube.glb" },
] as const;
const HERO_MODEL_TRANSFORMS = [
  { rotation: [-0.12, 0, 0] as [number, number, number] },
  { rotation: [0, Math.PI, 0] as [number, number, number] },
  { rotation: [0, Math.PI / 2, 0] as [number, number, number] },
  { rotation: [0, Math.PI / 2, 0] as [number, number, number] },
  { rotation: [0, Math.PI / 2, 0] as [number, number, number] },
  { rotation: [0, 0, 0] as [number, number, number] },
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

  void main() {
    float idx = mod(vCharIndex + floor(uTime * uCharCycleSpeed), 64.0);
    float col = mod(idx, 8.0);
    float row = floor(idx / 8.0);

    vec2 uv = (gl_PointCoord + vec2(col, row)) / 8.0;
    float glyph = texture2D(uCharAtlas, uv).r;

    if (glyph < 0.1) discard;

    vec3 color = vec3(1.0, 0.0, 0.235) * vBrightness;
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

  uniform float uTime;
  uniform float uBaseSpeed;
  uniform float uLoopH;
  uniform float uPixelRatio;

  varying float vCharIndex;
  varying float vBrightness;
  varying float vAlpha;

  void main() {
    float speed = uBaseSpeed * (0.48 + aSpeedJitter * 1.05);
    float yRaw = mod(aPhaseOffset - uTime * speed, uLoopH) - uLoopH * 0.5;
    float swirl = sin((uTime * 0.28) + aColX * 0.45 + aColZ * 0.18) * 0.26;

    vec3 worldPos = vec3(aColX + swirl, yRaw, aColZ + aDepthDrift);

    float phase = mod(aPhaseOffset - uTime * speed, uLoopH) / uLoopH;
    float lead = smoothstep(0.9, 1.0, phase);
    float depthGlow = smoothstep(-7.0, 3.5, aDepthDrift);

    vBrightness = 0.18 + lead * 0.28 + depthGlow * 0.18;

    float topFade = 1.0 - smoothstep(6.0, uLoopH * 0.5, yRaw);
    float botFade = smoothstep(-uLoopH * 0.5, -6.0, yRaw);
    vAlpha = topFade * botFade * (0.4 + depthGlow * 0.6);

    vCharIndex = aCharIndex;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(worldPos, 1.0);

    float dist = length((modelViewMatrix * vec4(worldPos, 1.0)).xyz);
    gl_PointSize = (86.0 / dist) * uPixelRatio * (0.75 + depthGlow * 0.65);
  }
`;

const BackgroundRain = React.memo(function BackgroundRain({
  atlas,
}: {
  atlas: THREE.CanvasTexture;
}) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const attrs = useMemo(() => {
    const position = new Float32Array(COUNT_BG * 3);
    const colX = new Float32Array(COUNT_BG);
    const colZ = new Float32Array(COUNT_BG);
    const speedJitter = new Float32Array(COUNT_BG);
    const charIndex = new Float32Array(COUNT_BG);
    const phaseOffset = new Float32Array(COUNT_BG);
    const depthDrift = new Float32Array(COUNT_BG);
    const gridCols = Math.ceil(Math.sqrt(COUNT_BG));
    const spacing = (SPREAD_BG * 2) / gridCols;

    for (let index = 0; index < COUNT_BG; index += 1) {
      const gx = index % gridCols;
      const gz = Math.floor(index / gridCols) % gridCols;
      colX[index] = -SPREAD_BG + gx * spacing + (Math.random() - 0.5) * spacing * 0.9;
      colZ[index] = -SPREAD_BG + gz * spacing + (Math.random() - 0.5) * spacing * 0.65;
      speedJitter[index] = Math.random();
      charIndex[index] = Math.floor(Math.random() * 64);
      phaseOffset[index] = Math.random() * LOOP_H;
      depthDrift[index] = -7 + Math.random() * 10;
    }

    return { position, colX, colZ, speedJitter, charIndex, phaseOffset, depthDrift };
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
    const color = Math.random() > 0.45 ? WIRE_COLOR : WIRE_MORPH_COLOR;

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
    if (phaseRef.current === "hold") {
      const holdFor = currentIndex === 0 ? HOLD_HEAD : HOLD_SKILL;
      if (phaseTimerRef.current >= holdFor) {
        phaseRef.current = "morph";
        phaseTimerRef.current = 0;
      }
    } else {
      morphT = Math.min(phaseTimerRef.current / MORPH_DUR, 1);
      if (phaseTimerRef.current >= MORPH_DUR) {
        sequenceRef.current = nextIndex;
        phaseRef.current = "hold";
        phaseTimerRef.current = 0;
        onSkillChange(HERO_MODEL_SEQUENCE[nextIndex].label);
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

    root.rotation.y = Math.sin(elapsed * 0.32) * 0.35;
    root.rotation.x = -0.1 + Math.cos(elapsed * 0.24) * 0.05;
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
        <Canvas camera={{ position: [0, 0, 7.2], fov: 46 }}>
          <BackgroundRain atlas={atlas} />
          <group position={[0, 1.38, 0]}>
            <MorphingWireHero onSkillChange={setActiveSkill} />
          </group>
        </Canvas>
      </div>

      <div
        className="pointer-events-none absolute inset-0 z-10 opacity-[0.05]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,0,60,0.95) 2px, rgba(255,0,60,0.95) 4px)",
        }}
      />

      <div className="pointer-events-none relative z-20 flex w-full justify-center px-6 pt-[48vh] md:pt-[50vh] lg:pt-[52vh]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="max-w-5xl text-center"
        >
          <div className="mb-3 font-mono uppercase tracking-[0.3em] text-[#ff003c] opacity-70">
            {siteProfile.role}
          </div>
          <h1 className="mb-4 tracking-tight">
            <span className="mb-2 block text-5xl font-bold text-white md:text-7xl lg:text-8xl">
              {siteProfile.name.toUpperCase()}
            </span>
            <span className="block bg-gradient-to-r from-[#ff003c] via-[#ff4466] to-[#8b0020] bg-clip-text text-4xl font-bold text-transparent md:text-6xl lg:text-7xl">
              PORTFOLIO
            </span>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl font-mono text-base text-zinc-400 md:text-lg lg:text-xl">
            {siteProfile.headline}
          </p>
        </motion.div>
      </div>

      <AnimatePresence>
        {activeSkill && activeSkill !== "Head" ? (
          <motion.div
            key={activeSkill}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.45 }}
            className="pointer-events-none absolute bottom-28 left-1/2 z-20 -translate-x-1/2 font-mono text-xs uppercase tracking-[0.4em] text-[#ff003c] opacity-75"
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
        <div className="mb-2 font-mono text-xs uppercase tracking-widest text-[#ff003c]">Scroll</div>
        <div className="mx-auto h-12 w-px bg-gradient-to-b from-[#ff003c] to-transparent" />
      </motion.div>
    </div>
  );
}
