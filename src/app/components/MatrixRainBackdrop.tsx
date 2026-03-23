import React, { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

import { useWebGLAvailability } from "../lib/webgl";

const BACKDROP_CHAR_SET = [
  "A", "B", "C", "D", "E", "F", "G", "H",
  "I", "J", "K", "L", "M", "N", "O", "P",
  "Q", "R", "S", "T", "U", "V", "W", "X",
  "Y", "Z", "0", "1", "2", "3", "4", "5",
  "6", "7", "8", "9", "£", "%", "&", "@",
  "?", "!", "+", "-", "=", "/", "\\", "<",
  ">", "[", "]", "{", "}", "*", "ア", "イ",
  "ウ", "エ", "オ", "カ", "キ", "ク", "ケ", "コ",
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
    throw new Error("Failed to create backdrop matrix atlas.");
  }

  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = "#fff";
  ctx.font = `bold ${cell * 0.72}px monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  BACKDROP_CHAR_SET.forEach((char, index) => {
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
  uniform vec3 uTint;

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

    gl_FragColor = vec4(uTint * vBrightness, glyph * vAlpha);
  }
`;

const vertexShader = /* glsl */ `
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
  uniform float uSwirl;
  uniform float uPointScale;

  varying float vCharIndex;
  varying float vBrightness;
  varying float vAlpha;

  void main() {
    float speed = uBaseSpeed * (0.55 + aSpeedJitter * 1.08);
    float yRaw = mod(aPhaseOffset - uTime * speed, uLoopH) - uLoopH * 0.5;
    float swirl = sin((uTime * 0.2) + aColX * 0.35 + aColZ * 0.12) * uSwirl;
    vec3 worldPos = vec3(aColX + swirl, yRaw, aColZ + aDepthDrift);

    float depthGlow = smoothstep(-10.0, 1.5, aDepthDrift);
    float lead = smoothstep(0.9, 1.0, mod(aPhaseOffset - uTime * speed, uLoopH) / uLoopH);

    vBrightness = 0.22 + lead * 0.22 + depthGlow * 0.16;

    float topFade = 1.0 - smoothstep(9.0, uLoopH * 0.5, yRaw);
    float botFade = smoothstep(-uLoopH * 0.5, -9.0, yRaw);
    vAlpha = topFade * botFade * (0.18 + depthGlow * 0.3);

    vCharIndex = aCharIndex;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(worldPos, 1.0);

    float dist = length((modelViewMatrix * vec4(worldPos, 1.0)).xyz);
    gl_PointSize = (uPointScale / dist) * uPixelRatio * (0.72 + depthGlow * 0.58);
  }
`;

function RainLayer({
  atlas,
  count,
  spread,
  loopHeight,
  baseSpeed,
  pointScale,
  swirl,
  tint,
}: {
  atlas: THREE.CanvasTexture;
  count: number;
  spread: number;
  loopHeight: number;
  baseSpeed: number;
  pointScale: number;
  swirl: number;
  tint: THREE.Color;
}) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const attrs = useMemo(() => {
    const position = new Float32Array(count * 3);
    const colX = new Float32Array(count);
    const colZ = new Float32Array(count);
    const speedJitter = new Float32Array(count);
    const charIndex = new Float32Array(count);
    const phaseOffset = new Float32Array(count);
    const depthDrift = new Float32Array(count);
    const gridCols = Math.ceil(Math.sqrt(count));
    const spacing = (spread * 2) / gridCols;

    for (let index = 0; index < count; index += 1) {
      const gx = index % gridCols;
      const gz = Math.floor(index / gridCols) % gridCols;
      colX[index] = -spread + gx * spacing + (Math.random() - 0.5) * spacing * 0.9;
      colZ[index] = -spread + gz * spacing + (Math.random() - 0.5) * spacing * 0.75;
      speedJitter[index] = Math.random();
      charIndex[index] = Math.floor(Math.random() * 64);
      phaseOffset[index] = Math.random() * loopHeight;
      depthDrift[index] = -10 + Math.random() * 12;
    }

    return { position, colX, colZ, speedJitter, charIndex, phaseOffset, depthDrift };
  }, [count, spread, loopHeight]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uCharAtlas: { value: atlas },
      uBaseSpeed: { value: baseSpeed },
      uLoopH: { value: loopHeight },
      uPixelRatio: { value: window.devicePixelRatio || 1 },
      uCharCycleSpeed: { value: 0.55 },
      uSwirl: { value: swirl },
      uPointScale: { value: pointScale },
      uTint: { value: tint },
    }),
    [atlas, baseSpeed, loopHeight, pointScale, swirl, tint],
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
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export function MatrixRainBackdrop({
  className = "pointer-events-none fixed inset-0 z-[1] opacity-55",
  mode = "shell",
}: {
  className?: string;
  mode?: "shell" | "content";
}) {
  const hasWebGL = useWebGLAvailability();
  const atlas = useMemo(() => buildCharAtlas(), []);
  const [isMobile, setIsMobile] = useState(false);
  const [lowPower, setLowPower] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

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
    const sync = () => {
      const cores = typeof navigator.hardwareConcurrency === "number" ? navigator.hardwareConcurrency : 8;
      setLowPower(readSaveData() || cores <= 4);
    };
    sync();
    const nav = navigator as Navigator & { connection?: EventTarget };
    nav.connection?.addEventListener?.("change", sync);
    return () => nav.connection?.removeEventListener?.("change", sync);
  }, []);

  /** Scale particle counts down on constrained devices; motion + layering unchanged. */
  const density = lowPower ? 0.78 : 1;

  const roundCount = (n: number) => Math.max(32, Math.round(n * density));

  const config =
    mode === "content"
      ? {
          outer: isMobile
            ? { count: roundCount(420), spread: 13, loopHeight: 24, baseSpeed: 0.64, pointScale: 94, swirl: 0.12, tint: new THREE.Color("#8f1731") }
            : { count: roundCount(1120), spread: 15, loopHeight: 26, baseSpeed: 0.7, pointScale: 104, swirl: 0.14, tint: new THREE.Color("#8f1731") },
          inner: isMobile
            ? { count: roundCount(260), spread: 11.5, loopHeight: 21, baseSpeed: 0.86, pointScale: 108, swirl: 0.16, tint: new THREE.Color("#ffe6ec") }
            : { count: roundCount(720), spread: 13.5, loopHeight: 23, baseSpeed: 0.92, pointScale: 116, swirl: 0.18, tint: new THREE.Color("#ffe6ec") },
          cameraZ: 10.5,
        }
      : {
          outer: isMobile
            ? { count: roundCount(2200), spread: 15, loopHeight: 26, baseSpeed: 0.74, pointScale: 92, swirl: 0.14, tint: new THREE.Color("#6f001a") }
            : { count: roundCount(5200), spread: 17, loopHeight: 28, baseSpeed: 0.74, pointScale: 98, swirl: 0.16, tint: new THREE.Color("#6f001a") },
          inner: isMobile
            ? { count: roundCount(1340), spread: 13.5, loopHeight: 22, baseSpeed: 0.94, pointScale: 106, swirl: 0.18, tint: new THREE.Color("#ffcad5") }
            : { count: roundCount(3600), spread: 15, loopHeight: 24, baseSpeed: 0.98, pointScale: 114, swirl: 0.22, tint: new THREE.Color("#ffcad5") },
          cameraZ: 12,
        };

  return (
    <div className={className}>
      {hasWebGL ? (
        <>
          <Canvas camera={{ position: [0, 0, config.cameraZ], fov: 48 }} dpr={isMobile ? [1, 1.2] : [1, 1.5]}>
            <RainLayer atlas={atlas} {...config.outer} />
            <RainLayer atlas={atlas} {...config.inner} />
          </Canvas>
        </>
      ) : (
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "radial-gradient(circle at 50% 20%, rgba(255,0,60,0.16), transparent 42%), repeating-linear-gradient(0deg, transparent, transparent 9px, rgba(255,0,60,0.08) 9px, rgba(255,0,60,0.08) 10px)",
          }}
        />
      )}
    </div>
  );
}
