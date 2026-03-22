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
const MORPH_DUR = 1.8;
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

type WireAsset = {
  group: THREE.Group;
  materials: THREE.LineBasicMaterial[];
  geometries: THREE.BufferGeometry[];
  baseScale: number;
};

function buildCharAtlas(): THREE.CanvasTexture {
  const grid = 8;
  const cell = 64;
  const size = grid * cell;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Failed to create 2D context for matrix atlas.");
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

function applyRandomLineColors(geometry: THREE.BufferGeometry) {
  const position = geometry.getAttribute("position");
  const colors = new Float32Array(position.count * 3);

  for (let index = 0; index < position.count; index += 2) {
    const chosen = Math.random() > 0.45 ? WIRE_COLOR : WIRE_MORPH_COLOR;

    colors[index * 3] = chosen.r;
    colors[index * 3 + 1] = chosen.g;
    colors[index * 3 + 2] = chosen.b;

    if (index + 1 < position.count) {
      colors[(index + 1) * 3] = chosen.r;
      colors[(index + 1) * 3 + 1] = chosen.g;
      colors[(index + 1) * 3 + 2] = chosen.b;
    }
  }

  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
}

function buildWireAsset(scene: THREE.Object3D): WireAsset {
  const root = new THREE.Group();
  const materials: THREE.LineBasicMaterial[] = [];
  const geometries: THREE.BufferGeometry[] = [];

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

    if (edgeGeometry.getAttribute("position").count === 0) {
      edgeGeometry.dispose();
      return;
    }

    applyRandomLineColors(edgeGeometry);

    const material = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    });

    const lineSegments = new THREE.LineSegments(edgeGeometry, material);
    root.add(lineSegments);
    materials.push(material);
    geometries.push(edgeGeometry);
  });

  const bounds = new THREE.Box3().setFromObject(root);
  const center = bounds.getCenter(new THREE.Vector3());
  const size = bounds.getSize(new THREE.Vector3());
  const maxDimension = Math.max(size.x, size.y, size.z) || 1;
  const targetHeight = 3.1;

  root.children.forEach((child) => {
    const lineSegments = child as THREE.LineSegments;
    lineSegments.geometry.translate(-center.x, -center.y, -center.z);
  });

  const baseScale = targetHeight / maxDimension;
  root.scale.setScalar(baseScale);
  return { group: root, materials, geometries, baseScale };
}

const ModelWireHero = React.memo(function ModelWireHero({
  onSkillChange,
}: {
  onSkillChange: (label: string) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const sequenceRef = useRef(0);
  const phaseRef = useRef<"hold" | "morph">("hold");
  const phaseTimerRef = useRef(0);

  const gltfs = useLoader(
    GLTFLoader,
    HERO_MODEL_SEQUENCE.map((model) => model.src),
  ) as Array<{ scene: THREE.Group }>;

  const assets = useMemo(
    () => gltfs.map((gltf) => buildWireAsset(gltf.scene.clone(true))),
    [gltfs],
  );

  useEffect(() => {
    onSkillChange(HERO_MODEL_SEQUENCE[0].label);
  }, [onSkillChange]);

  useEffect(() => {
    return () => {
      assets.forEach((asset) => {
        asset.geometries.forEach((geometry) => geometry.dispose());
        asset.materials.forEach((material) => material.dispose());
      });
    };
  }, [assets]);

  useFrame(({ clock }, delta) => {
    const root = groupRef.current;
    if (!root) {
      return;
    }

    const elapsed = clock.getElapsedTime();
    const currentIndex = sequenceRef.current;
    const nextIndex = (currentIndex + 1) % assets.length;

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
    const displayCurrentIndex = phaseRef.current === "hold" ? sequenceRef.current : currentIndex;
    const displayNextIndex =
      phaseRef.current === "hold" ? sequenceRef.current : (displayCurrentIndex + 1) % assets.length;

    root.rotation.y = Math.sin(elapsed * 0.32) * 0.35;
    root.rotation.x = -0.12 + Math.cos(elapsed * 0.24) * 0.06;
    root.rotation.z = Math.sin(elapsed * 0.18) * 0.04;
    root.position.y = Math.sin(elapsed * 0.74) * 0.1;

    assets.forEach((asset, index) => {
      let opacity = 0;
      let scale = 0.9;

      if (phaseRef.current === "hold") {
        if (index === displayCurrentIndex) {
          opacity = 0.96;
          scale = 1;
        }
      } else {
        if (index === displayCurrentIndex) {
          opacity = 1 - eased;
          scale = 1 + (1 - eased) * 0.08;
        }

        if (index === displayNextIndex) {
          opacity = Math.max(opacity, eased);
          scale = Math.max(scale, 0.88 + eased * 0.12);
        }
      }

      const flicker = 0.92 + Math.sin(elapsed * 12 + index * 1.1) * 0.05;
      asset.group.visible = opacity > 0.01;
      asset.group.scale.setScalar(asset.baseScale * scale);
      asset.group.children.forEach((child) => {
        const lineSegments = child as THREE.LineSegments;
        const material = lineSegments.material as THREE.LineBasicMaterial;
        material.opacity = opacity * flicker;
      });
    });
  });

  return (
    <group ref={groupRef} renderOrder={2}>
      {assets.map((asset, index) => (
        <primitive key={HERO_MODEL_SEQUENCE[index].src} object={asset.group} />
      ))}
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
    <div id="hero" className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-black">
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 6.4], fov: 48 }}>
          <BackgroundRain atlas={atlas} />
          <group position={[0, 1.85, 0]}>
            <ModelWireHero onSkillChange={setActiveSkill} />
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

      <div className="pointer-events-none relative z-20 flex w-full justify-center px-6 pt-[58vh] md:pt-[60vh] lg:pt-[62vh]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="max-w-5xl text-center"
        >
          <div className="mb-4 font-mono uppercase tracking-[0.3em] text-[#ff003c] opacity-70">
            {siteProfile.role}
          </div>
          <h1 className="mb-6 tracking-tight">
            <span className="mb-2 block text-5xl font-bold text-white md:text-7xl lg:text-8xl">
              {siteProfile.name.toUpperCase()}
            </span>
            <span className="block bg-gradient-to-r from-[#ff003c] via-[#ff4466] to-[#8b0020] bg-clip-text text-4xl font-bold text-transparent md:text-6xl lg:text-7xl">
              PORTFOLIO
            </span>
          </h1>
          <p className="mx-auto mb-12 max-w-2xl font-mono text-lg text-zinc-400 md:text-xl">
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
            className="pointer-events-none absolute bottom-32 left-1/2 z-20 -translate-x-1/2 font-mono text-xs uppercase tracking-[0.4em] text-[#ff003c] opacity-75"
          >
            {activeSkill}
          </motion.div>
        ) : null}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 2, repeat: Infinity, repeatType: "reverse" }}
        className="pointer-events-none absolute bottom-10 left-1/2 z-20 -translate-x-1/2"
      >
        <div className="mb-2 font-mono text-xs uppercase tracking-widest text-[#ff003c]">Scroll</div>
        <div className="mx-auto h-12 w-px bg-gradient-to-b from-[#ff003c] to-transparent" />
      </motion.div>
    </div>
  );
}
