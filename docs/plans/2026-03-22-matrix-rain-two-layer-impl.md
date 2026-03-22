# Matrix Rain Hero — Two-Layer Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rewrite `MatrixRainHero.tsx` with two independent `THREE.Points` layers — a sparse classic background rain and a dense SDF-driven foreground shape layer — for better visual clarity and independent density/brightness control.

**Architecture:** `BackgroundRain` (~2,000 particles, no SDF, full-screen grid, always dim) and `ForegroundShape` (~8,000 particles, full SDF morph, tight ±3 unit grid, invisible off-surface) share one `THREE.CanvasTexture` atlas created in the root component. The morph sequencer and HTML overlay live in `MatrixRainHero` exactly as before.

**Tech Stack:** React 19, `@react-three/fiber` ^9, `three` ^0.183, TypeScript, Tailwind CSS, Vite

---

## Context you need before starting

- Dev server: `npm run dev -- --host 127.0.0.1 --port 4100`
- The only file being changed is `src/app/components/MatrixRainHero.tsx` — full rewrite
- `CyberHero.tsx` is already replaced by `MatrixRainHero`; no import changes needed
- No test suite; visual verification via dev server is the only check
- Camera: `position={[0, 0, 6]}`, `fov={50}`. At this distance ±9 units X covers the full viewport
- Current `MatrixRainHero.tsx` has 511 lines — read it once before starting for orientation

---

## Task 1: Constants, atlas, and shared fragment shader

**Files:**
- Modify: `src/app/components/MatrixRainHero.tsx` (full rewrite — start fresh)

**Step 1: Write the file header, imports, and constants**

```tsx
import React, { useState, useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { AnimatePresence, motion } from 'motion/react'
import { siteProfile } from '../data/portfolio'

// ── Shared constants ──────────────────────────────────────────────
const LOOP_H       = 14.0   // fall loop height (world units)
const BASE_SPEED   = 1.4    // units/second baseline

// Background layer
const COUNT_BG     = 2000
const SPREAD_BG    = 9.0    // ±9 units covers full viewport at fov50 z=6

// Foreground layer
const COUNT_FG     = 8000
const SPREAD_FG    = 3.0    // ±3 units tight around shape

// Morph sequencer
const HOLD_HEAD    = 8
const HOLD_SKILL   = 5
const MORPH_DUR    = 3
const SEQUENCE     = [0, 1, 2, 3, 4, 5, 6]

interface SkillEntry { label: string; shapeId: number }
const SKILLS: SkillEntry[] = [
  { label: 'Head',            shapeId: 0 },
  { label: '3D Design',       shapeId: 1 },
  { label: 'Figma',           shapeId: 2 },
  { label: 'Graphic Design',  shapeId: 3 },
  { label: 'Motion Graphics', shapeId: 4 },
  { label: 'AI Workflows',    shapeId: 5 },
  { label: 'Frontend Dev',    shapeId: 6 },
]
```

**Step 2: Write `buildCharAtlas()`**

Copy verbatim from the existing file (lines 10–47). The atlas is unchanged.

**Step 3: Write the shared fragment shader**

Both layers use an identical fragment shader. The only input that varies is `vBrightness`, which the vertex shader sets per-layer.

```glsl
const fragmentShader = /* glsl */`
  uniform sampler2D uCharAtlas;
  uniform float     uTime;
  uniform float     uCharCycleSpeed;

  varying float vCharIndex;
  varying float vBrightness;
  varying float vAlpha;

  void main() {
    float idx = mod(vCharIndex + floor(uTime * uCharCycleSpeed), 64.0);
    float col = mod(idx, 8.0);
    float row = floor(idx / 8.0);

    vec2  uv    = (gl_PointCoord + vec2(col, row)) / 8.0;
    float glyph = texture2D(uCharAtlas, uv).r;

    if (glyph < 0.1) discard;

    vec3 color = vec3(1.0, 0.0, 0.235) * vBrightness;
    gl_FragColor = vec4(color, glyph * vAlpha);
  }
`
```

Note: `uCharCycleSpeed` is a new uniform (background=0.5, foreground=2.5) replacing the hardcoded `1.5`.

**Step 4: Verify the file compiles with no TypeScript errors**

Run: `npm run build 2>&1 | head -40`
Expected: no errors (or only pre-existing unrelated warnings)

**Step 5: Commit**

```bash
git add src/app/components/MatrixRainHero.tsx
git commit -m "feat: two-layer matrix rain — constants, atlas, shared frag shader"
```

---

## Task 2: BackgroundRain — vertex shader + component

**Files:**
- Modify: `src/app/components/MatrixRainHero.tsx`

**Step 1: Write the background vertex shader**

This shader does zero SDF evaluation. It just falls, loops, and emits dim brightness.

```glsl
const bgVertexShader = /* glsl */`
  attribute float aColX;
  attribute float aColZ;
  attribute float aSpeedJitter;
  attribute float aCharIndex;
  attribute float aPhaseOffset;

  uniform float uTime;
  uniform float uBaseSpeed;
  uniform float uLoopH;
  uniform float uPixelRatio;

  varying float vCharIndex;
  varying float vBrightness;
  varying float vAlpha;

  void main() {
    float speed = uBaseSpeed * (0.5 + aSpeedJitter * 0.9);
    float yRaw  = mod(aPhaseOffset - uTime * speed, uLoopH) - uLoopH * 0.5;

    vec3 worldPos = vec3(aColX, yRaw, aColZ);

    // Speed-head effect: particle near the front of its column is slightly brighter
    float phase = mod(aPhaseOffset - uTime * speed, uLoopH) / uLoopH;
    float lead  = smoothstep(0.92, 1.0, phase);
    vBrightness = 0.28 + lead * 0.3;

    float topFade = smoothstep(uLoopH * 0.5,  5.0, yRaw);
    float botFade = smoothstep(-uLoopH * 0.5, -5.0, yRaw);
    vAlpha        = topFade * botFade;

    vCharIndex   = aCharIndex;
    gl_Position  = projectionMatrix * modelViewMatrix * vec4(worldPos, 1.0);
    float dist   = length((modelViewMatrix * vec4(worldPos, 1.0)).xyz);
    gl_PointSize = (60.0 / dist) * uPixelRatio;
  }
`
```

**Step 2: Write the `BackgroundRain` component**

```tsx
const BackgroundRain = React.memo(function BackgroundRain({
  atlas,
}: {
  atlas: THREE.CanvasTexture
}) {
  const matRef = useRef<THREE.ShaderMaterial>(null)

  const attrs = useMemo(() => {
    const N          = COUNT_BG
    const pos        = new Float32Array(N * 3)
    const colX       = new Float32Array(N)
    const colZ       = new Float32Array(N)
    const speedJitter = new Float32Array(N)
    const charIndex  = new Float32Array(N)
    const phaseOffset = new Float32Array(N)

    const gridCols   = Math.ceil(Math.sqrt(N))
    const spacing    = (SPREAD_BG * 2) / gridCols
    for (let i = 0; i < N; i++) {
      const gx = i % gridCols
      const gz = Math.floor(i / gridCols) % gridCols
      colX[i]        = -SPREAD_BG + gx * spacing + (Math.random() - 0.5) * spacing * 0.6
      colZ[i]        = -SPREAD_BG + gz * spacing + (Math.random() - 0.5) * spacing * 0.6
      speedJitter[i] = Math.random()
      charIndex[i]   = Math.floor(Math.random() * 64)
      phaseOffset[i] = Math.random() * LOOP_H
    }
    return { pos, colX, colZ, speedJitter, charIndex, phaseOffset }
  }, [])

  const uniforms = useMemo(() => ({
    uTime:           { value: 0 },
    uCharAtlas:      { value: atlas },
    uBaseSpeed:      { value: BASE_SPEED * 0.75 },  // slightly slower than foreground
    uLoopH:          { value: LOOP_H },
    uPixelRatio:     { value: window.devicePixelRatio },
    uCharCycleSpeed: { value: 0.5 },
  }), [atlas])

  useFrame(({ clock }) => {
    if (matRef.current) matRef.current.uniforms.uTime.value = clock.getElapsedTime()
  })

  return (
    <points renderOrder={0}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position"     args={[attrs.pos,         3]} />
        <bufferAttribute attach="attributes-aColX"        args={[attrs.colX,        1]} />
        <bufferAttribute attach="attributes-aColZ"        args={[attrs.colZ,        1]} />
        <bufferAttribute attach="attributes-aSpeedJitter" args={[attrs.speedJitter, 1]} />
        <bufferAttribute attach="attributes-aCharIndex"   args={[attrs.charIndex,   1]} />
        <bufferAttribute attach="attributes-aPhaseOffset" args={[attrs.phaseOffset, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={matRef}
        vertexShader={bgVertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
})
```

**Step 3: Visual check — background only**

Temporarily render `<BackgroundRain atlas={atlas} />` alone in the Canvas. Start dev server:
`npm run dev -- --host 127.0.0.1 --port 4100`

Expected: sparse red katakana rain covering the whole viewport, dimmer than the old single-layer.

**Step 4: Commit**

```bash
git add src/app/components/MatrixRainHero.tsx
git commit -m "feat: add BackgroundRain layer — sparse column rain, no SDF"
```

---

## Task 3: ForegroundShape — SDF vertex shader

**Files:**
- Modify: `src/app/components/MatrixRainHero.tsx`

**Step 1: Write the foreground vertex shader**

The SDF functions are copied verbatim from the current `MatrixRainHero.tsx` vertex shader (lines 97–259 of the current file). The key change from the old shader: particles outside the surface set `gl_PointSize = 0.0` and exit early — they are invisible but still advance Y for future frames.

```glsl
const fgVertexShader = /* glsl */`
  attribute float aColX;
  attribute float aColZ;
  attribute float aSpeedJitter;
  attribute float aCharIndex;
  attribute float aPhaseOffset;

  uniform float uTime;
  uniform float uBaseSpeed;
  uniform float uLoopH;
  uniform float uPixelRatio;
  uniform int   uShapeA;
  uniform int   uShapeB;
  uniform float uMorphT;

  varying float vCharIndex;
  varying float vBrightness;
  varying float vAlpha;

  // ── SDF primitives ──────────────────────────────────────────────
  // [COPY ALL SDF PRIMITIVE FUNCTIONS VERBATIM FROM CURRENT FILE]
  // opSmoothUnion, sdCapsule, sdBox, sdSphere, sdCylinder, sdEllipsoid

  // ── Shape functions ─────────────────────────────────────────────
  // [COPY ALL SHAPE FUNCTIONS VERBATIM FROM CURRENT FILE]
  // sdHead, sdGizmo, sdFigma, sdPaintbrush, sdNote, sdBrain, sdBrackets

  // ── Dispatcher + morph ──────────────────────────────────────────
  float evalShape(vec3 p, int id) {
    if (id == 0) return sdHead(p);
    if (id == 1) return sdGizmo(p);
    if (id == 2) return sdFigma(p);
    if (id == 3) return sdPaintbrush(p);
    if (id == 4) return sdNote(p);
    if (id == 5) return sdBrain(p);
    if (id == 6) return sdBrackets(p);
    return 1000.0;
  }

  float blendedSDF(vec3 p) {
    return mix(evalShape(p, uShapeA), evalShape(p, uShapeB), uMorphT);
  }

  vec3 blendedGrad(vec3 p) {
    float e = 0.04;
    return normalize(vec3(
      blendedSDF(p + vec3(e,0,0)) - blendedSDF(p - vec3(e,0,0)),
      blendedSDF(p + vec3(0,e,0)) - blendedSDF(p - vec3(0,e,0)),
      blendedSDF(p + vec3(0,0,e)) - blendedSDF(p - vec3(0,0,e))
    ));
  }

  void main() {
    float speed = uBaseSpeed * (0.6 + aSpeedJitter * 0.8);
    float yRaw  = mod(aPhaseOffset - uTime * speed, uLoopH) - uLoopH * 0.5;
    vec3  worldPos = vec3(aColX, yRaw, aColZ);

    float d = blendedSDF(worldPos);

    // Off-surface: invisible — no fragment cost
    float surfaceThreshold = 0.25;
    if (d >= surfaceThreshold) {
      gl_PointSize = 0.0;
      vAlpha = 0.0;
      vBrightness = 0.0;
      vCharIndex  = aCharIndex;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(worldPos, 1.0);
      return;
    }

    // On or near surface: project outward, set brightness
    vec3 grad  = blendedGrad(worldPos);
    worldPos   = worldPos - grad * (d - 0.05);
    vBrightness = mix(0.6, 1.0, smoothstep(surfaceThreshold, 0.0, d));

    float topFade = smoothstep(uLoopH * 0.5,  5.5, yRaw);
    float botFade = smoothstep(-uLoopH * 0.5, -5.5, yRaw);
    vAlpha = topFade * botFade;

    vCharIndex  = aCharIndex;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(worldPos, 1.0);
    float dist  = length((modelViewMatrix * vec4(worldPos, 1.0)).xyz);
    gl_PointSize = (90.0 / dist) * uPixelRatio;
  }
`
```

**Important:** Replace the `// [COPY ... VERBATIM]` placeholders by literally copying the GLSL functions from the current file. Do not retype them — copy-paste to avoid transcription errors.

**Step 2: Verify shader compiles**

Run: `npm run build 2>&1 | head -40`
Expected: no new errors

**Step 3: Commit**

```bash
git add src/app/components/MatrixRainHero.tsx
git commit -m "feat: write foreground SDF vertex shader — off-surface particles invisible"
```

---

## Task 4: ForegroundShape component + morph sequencer

**Files:**
- Modify: `src/app/components/MatrixRainHero.tsx`

**Step 1: Write the `ForegroundShape` component**

The morph sequencer logic is ported verbatim from `RainParticles.useFrame` in the current file (lines 373–411). The only change is the grid uses `SPREAD_FG` and `COUNT_FG`.

```tsx
const ForegroundShape = React.memo(function ForegroundShape({
  atlas,
  onSkillChange,
}: {
  atlas: THREE.CanvasTexture
  onSkillChange: (label: string) => void
}) {
  const matRef        = useRef<THREE.ShaderMaterial>(null)
  const seqIndexRef   = useRef(0)
  const phaseRef      = useRef<'hold' | 'morph'>('hold')
  const phaseTimerRef = useRef(0)

  const attrs = useMemo(() => {
    const N           = COUNT_FG
    const pos         = new Float32Array(N * 3)
    const colX        = new Float32Array(N)
    const colZ        = new Float32Array(N)
    const speedJitter = new Float32Array(N)
    const charIndex   = new Float32Array(N)
    const phaseOffset = new Float32Array(N)

    const gridCols  = Math.ceil(Math.sqrt(N))
    const spacing   = (SPREAD_FG * 2) / gridCols
    for (let i = 0; i < N; i++) {
      const gx = i % gridCols
      const gz = Math.floor(i / gridCols) % gridCols
      colX[i]        = -SPREAD_FG + gx * spacing + (Math.random() - 0.5) * spacing * 0.5
      colZ[i]        = -SPREAD_FG + gz * spacing + (Math.random() - 0.5) * spacing * 0.5
      speedJitter[i] = Math.random()
      charIndex[i]   = Math.floor(Math.random() * 64)
      phaseOffset[i] = Math.random() * LOOP_H
    }
    return { pos, colX, colZ, speedJitter, charIndex, phaseOffset }
  }, [])

  const uniforms = useMemo(() => ({
    uTime:           { value: 0 },
    uCharAtlas:      { value: atlas },
    uBaseSpeed:      { value: BASE_SPEED },
    uLoopH:          { value: LOOP_H },
    uPixelRatio:     { value: window.devicePixelRatio },
    uShapeA:         { value: 0 },
    uShapeB:         { value: 0 },
    uMorphT:         { value: 0.0 },
    uCharCycleSpeed: { value: 2.5 },
  }), [atlas])

  useFrame(({ clock }, delta) => {
    const mat = matRef.current
    if (!mat) return

    mat.uniforms.uTime.value = clock.getElapsedTime()
    phaseTimerRef.current += delta

    if (phaseRef.current === 'hold') {
      const holdTime = seqIndexRef.current === 0 ? HOLD_HEAD : HOLD_SKILL
      if (phaseTimerRef.current >= holdTime) {
        const nextIdx = (seqIndexRef.current + 1) % SEQUENCE.length
        mat.uniforms.uShapeA.value = SEQUENCE[seqIndexRef.current]
        mat.uniforms.uShapeB.value = SEQUENCE[nextIdx]
        mat.uniforms.uMorphT.value = 0
        phaseRef.current      = 'morph'
        phaseTimerRef.current = 0
      }
    } else {
      const t = Math.min(phaseTimerRef.current / MORPH_DUR, 1)
      const eased = t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3) / 2
      mat.uniforms.uMorphT.value = eased

      if (phaseTimerRef.current >= MORPH_DUR) {
        seqIndexRef.current = (seqIndexRef.current + 1) % SEQUENCE.length
        const currentId = SEQUENCE[seqIndexRef.current]
        mat.uniforms.uShapeA.value = currentId
        mat.uniforms.uShapeB.value = currentId
        mat.uniforms.uMorphT.value = 0
        phaseRef.current      = 'hold'
        phaseTimerRef.current = 0
        const skill = SKILLS[currentId]
        if (skill) onSkillChange(skill.label)
      }
    }
  })

  return (
    <points renderOrder={1}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position"     args={[attrs.pos,          3]} />
        <bufferAttribute attach="attributes-aColX"        args={[attrs.colX,         1]} />
        <bufferAttribute attach="attributes-aColZ"        args={[attrs.colZ,         1]} />
        <bufferAttribute attach="attributes-aSpeedJitter" args={[attrs.speedJitter,  1]} />
        <bufferAttribute attach="attributes-aCharIndex"   args={[attrs.charIndex,    1]} />
        <bufferAttribute attach="attributes-aPhaseOffset" args={[attrs.phaseOffset,  1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={matRef}
        vertexShader={fgVertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
})
```

**Step 2: Verify build**

Run: `npm run build 2>&1 | head -40`
Expected: no errors

**Step 3: Commit**

```bash
git add src/app/components/MatrixRainHero.tsx
git commit -m "feat: add ForegroundShape — dense SDF particles, morph sequencer"
```

---

## Task 5: Root component + full visual verification

**Files:**
- Modify: `src/app/components/MatrixRainHero.tsx`

**Step 1: Write the root `MatrixRainHero` component**

The atlas is created once here and passed to both layers. The HTML overlay is copied verbatim from the current file (lines 438–510).

```tsx
export function MatrixRainHero() {
  const [activeSkill, setActiveSkill] = useState<string>('')
  const atlas = useMemo(() => buildCharAtlas(), [])

  useEffect(() => {
    return () => { atlas.dispose() }
  }, [atlas])

  return (
    <div className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-black">
      {/* Three.js layer */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 6], fov: 50 }}>
          <BackgroundRain atlas={atlas} />
          <ForegroundShape atlas={atlas} onSkillChange={setActiveSkill} />
        </Canvas>
      </div>

      {/* Scan lines */}
      <div
        className="absolute inset-0 pointer-events-none z-10 opacity-[0.04]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #ff003c 2px, #ff003c 4px)',
        }}
      />

      {/* Text overlay — unchanged from CyberHero */}
      <div className="relative z-20 text-center px-6 max-w-5xl pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <div className="mb-4 text-[#ff003c] uppercase tracking-[0.3em] opacity-70 font-mono">
            {siteProfile.role}
          </div>
          <h1 className="mb-6 tracking-tight">
            <span className="block text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-2">
              {siteProfile.name.toUpperCase()}
            </span>
            <span className="block text-4xl md:text-6xl lg:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ff003c] via-[#ff4466] to-[#8b0020]">
              PORTFOLIO
            </span>
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-12 font-mono">
            {siteProfile.headline}
          </p>
        </motion.div>
      </div>

      {/* Skill label */}
      <AnimatePresence>
        {activeSkill && activeSkill !== 'Head' && (
          <motion.div
            key={activeSkill}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.6 }}
            className="absolute bottom-32 left-1/2 -translate-x-1/2 z-20 pointer-events-none font-mono text-xs uppercase tracking-[0.4em] text-[#ff003c] opacity-70"
          >
            {activeSkill}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 2, repeat: Infinity, repeatType: 'reverse' }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
      >
        <div className="text-[#ff003c] text-xs uppercase tracking-widest mb-2 font-mono">Scroll</div>
        <div className="w-px h-12 bg-gradient-to-b from-[#ff003c] to-transparent mx-auto" />
      </motion.div>
    </div>
  )
}
```

**Step 2: Full build check**

Run: `npm run build 2>&1 | head -60`
Expected: clean build, no TypeScript errors

**Step 3: Visual verification — start dev server**

Run: `npm run dev -- --host 127.0.0.1 --port 4100`

Check the following:
- Background: sparse red katakana rain falling across the full viewport, dim (~28–40% brightness)
- Foreground: head shape visible as a dense cluster of brighter red characters
- No background particles appear inside/over the foreground shape area (they will — that's fine and intentional for the layered look)
- After 8s on head: morph begins to gizmo shape
- Skill label text appears below shape after morph completes
- Text overlay (name, role, headline) is fully readable above both layers
- 60fps maintained (Chrome DevTools → Performance)

**Step 4: Final commit**

```bash
git add src/app/components/MatrixRainHero.tsx
git commit -m "feat: complete two-layer matrix rain hero — background + SDF foreground"
```

---

## Tuning Reference

If the foreground shape is too faint, increase `COUNT_FG` (try 10,000–12,000) or widen `surfaceThreshold` from `0.25` to `0.35` in the foreground vertex shader.

If background feels too busy, reduce `COUNT_BG` from 2,000 to 1,200 or drop `vBrightness` from `0.28` to `0.18`.

If off-surface foreground particles bleed through (visible dim specks outside the shape), confirm `gl_PointSize = 0.0` is reached before the `gl_Position` assignment in the early-return branch — some drivers require position to be set even for size-0 points.
