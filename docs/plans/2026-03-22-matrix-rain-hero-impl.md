# Matrix Rain Hero — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace `CyberHero.tsx` with a full-screen Three.js animation where red matrix-rain characters deflect around 3D shapes, revealing each form purely through surface-following rain flow.

**Architecture:** 4,000 `THREE.Points` driven by a custom GLSL ShaderMaterial. The vertex shader evaluates a blended SDF each frame and projects particles onto the surface when inside/near the shape. Shape transitions are driven by lerping two SDF functions via a `uMorphT` uniform updated in `useFrame`. Character glyphs are drawn from a canvas-generated 512×512 atlas.

**Tech Stack:** React 19, `@react-three/fiber` ^9, `@react-three/drei` ^10, `three` ^0.183, TypeScript, Tailwind CSS, Vite

---

## Context you need before starting

- Dev server: `npm run dev -- --host 127.0.0.1 --port 4100`
- The component to create is `src/app/components/MatrixRainHero.tsx`
- It replaces `CyberHero.tsx` — find the import in the page root and swap it
- `Hero3D.tsx` exists but is not used on the main page — leave it alone
- No tests directory exists; visual verification via dev server is the test suite here
- `@react-three/fiber` Canvas renders into a `<div>` — the component is a drop-in for the existing hero `<div className="relative w-full h-screen ...>`
- The text overlay (name, role, headline, skills grid) in `CyberHero.tsx` must be preserved exactly and rendered above the Three.js canvas using `z-index`

---

### Task 1: Create the component shell and character atlas

**Files:**
- Create: `src/app/components/MatrixRainHero.tsx`

**Step 1: Create the file with imports and the atlas generator**

```tsx
import { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { motion } from 'motion/react'
import { siteProfile } from '../data/portfolio'
import { Figma, Palette, Film, Box, Code, Zap } from 'lucide-react'

// ── Character atlas ──────────────────────────────────────────────
// 512×512 canvas, 8×8 grid of 64 cells (64px each)
// White glyphs on black — fragment shader uses red channel as alpha
function buildCharAtlas(): THREE.CanvasTexture {
  const GRID = 8
  const CELL = 64
  const SIZE = GRID * CELL // 512

  const canvas = document.createElement('canvas')
  canvas.width = SIZE
  canvas.height = SIZE
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, SIZE, SIZE)

  // 40 katakana + 24 ASCII
  const chars = [
    'ア','イ','ウ','エ','オ','カ','キ','ク','ケ','コ',
    'サ','シ','ス','セ','ソ','タ','チ','ツ','テ','ト',
    'ナ','ニ','ヌ','ネ','ノ','ハ','ヒ','フ','ヘ','ホ',
    'マ','ミ','ム','メ','モ','ヤ','ユ','ヨ','ラ','ル',
    '0','1','2','3','4','5','6','7',
    '!','@','#','$','%','<','>','{','}','|',
    '/','\\','+','-','*','&','^','~',
  ]

  ctx.fillStyle = '#fff'
  ctx.font = `bold ${CELL * 0.72}px monospace`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  chars.slice(0, 64).forEach((ch, i) => {
    const col = i % GRID
    const row = Math.floor(i / GRID)
    ctx.fillText(ch, col * CELL + CELL / 2, row * CELL + CELL / 2)
  })

  const tex = new THREE.CanvasTexture(canvas)
  tex.needsUpdate = true
  return tex
}

// ── Skill metadata ───────────────────────────────────────────────
const SKILLS = [
  { label: 'Head',             shapeId: 0, icon: null },
  { label: '3D Design',        shapeId: 1, icon: Box },
  { label: 'Figma',            shapeId: 2, icon: Figma },
  { label: 'Graphic Design',   shapeId: 3, icon: Palette },
  { label: 'Motion Graphics',  shapeId: 4, icon: Film },
  { label: 'AI Workflows',     shapeId: 5, icon: Zap },
  { label: 'Frontend Dev',     shapeId: 6, icon: Code },
]

// Placeholder — filled in Task 2
function RainParticles() {
  return null
}

// ── Main export ──────────────────────────────────────────────────
export function MatrixRainHero() {
  return (
    <div className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-black">
      {/* Three.js layer */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 6], fov: 50 }}>
          <RainParticles />
        </Canvas>
      </div>

      {/* Text overlay — copied verbatim from CyberHero */}
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

**Step 2: Verify it compiles**

Find the current hero import in the app (check `src/app/App.tsx` or `src/app/page.tsx` or wherever `CyberHero` is used):
```bash
grep -r "CyberHero" src/
```
Swap the import to `MatrixRainHero` temporarily with the placeholder `RainParticles` returning null — just to confirm the shell renders without errors.

```bash
npm run dev -- --host 127.0.0.1 --port 4100
```

Expected: black hero with text overlay, no console errors.

**Step 3: Commit**
```bash
git add src/app/components/MatrixRainHero.tsx
git commit -m "feat: add MatrixRainHero shell with atlas generator and text overlay"
```

---

### Task 2: Particle geometry and basic falling rain (no SDF)

**Files:**
- Modify: `src/app/components/MatrixRainHero.tsx` — replace `RainParticles` stub

**Step 1: Replace RainParticles with working particle geometry**

Replace the `RainParticles` placeholder with this. The positions buffer is kept at origin — the vertex shader handles all movement. We store per-particle data in custom attributes.

```tsx
// ── Constants ────────────────────────────────────────────────────
const PARTICLE_COUNT = 4000
const SPREAD = 4.5       // X/Z extent of the rain field (Three.js units)
const LOOP_H = 14.0      // How tall the fall loop is
const BASE_SPEED = 1.4   // Units/second, multiplied by per-particle jitter

// ── Shaders ─────────────────────────────────────────────────────
// Will grow in later tasks — start with pure falling rain

const vertexShader = /* glsl */`
  attribute float aColX;
  attribute float aColZ;
  attribute float aSpeedJitter;   // 0..1
  attribute float aCharIndex;     // 0..63
  attribute float aPhaseOffset;   // initial Y stagger

  uniform float uTime;
  uniform sampler2D uCharAtlas;

  varying float vCharIndex;
  varying float vBrightness;
  varying float vAlpha;

  void main() {
    float speed = ${BASE_SPEED.toFixed(1)} * (0.6 + aSpeedJitter * 0.8);
    float yRaw = mod(aPhaseOffset - uTime * speed, ${LOOP_H.toFixed(1)}) - ${(LOOP_H / 2).toFixed(1)};

    vec3 worldPos = vec3(aColX, yRaw, aColZ);

    // Fade at top and bottom
    float fadeEdge = 1.5;
    float topFade = smoothstep(${(LOOP_H / 2).toFixed(1)}, ${(LOOP_H / 2 - fadeEdge).toFixed(1)}, yRaw);
    float botFade = smoothstep(${(-LOOP_H / 2).toFixed(1)}, ${(-LOOP_H / 2 + fadeEdge).toFixed(1)}, yRaw);

    vCharIndex = aCharIndex;
    vBrightness = 0.35;             // dim for free-fall; surface particles set to 1.0 in Task 5
    vAlpha = topFade * botFade;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(worldPos, 1.0);
    gl_PointSize = 10.0;            // px — will be tuned
  }
`

const fragmentShader = /* glsl */`
  uniform sampler2D uCharAtlas;
  uniform float uTime;

  varying float vCharIndex;
  varying float vBrightness;
  varying float vAlpha;

  void main() {
    // Cycle through 3 chars over time per particle (slow drift)
    float idx = mod(vCharIndex + floor(uTime * 1.5), 64.0);
    float col = mod(idx, 8.0);
    float row = floor(idx / 8.0);

    // Map gl_PointCoord (0..1) into the atlas cell
    vec2 uv = (gl_PointCoord + vec2(col, row)) / 8.0;
    float glyph = texture2D(uCharAtlas, uv).r;

    if (glyph < 0.1) discard;   // transparent background pixels

    vec3 color = vec3(1.0, 0.0, 0.235) * vBrightness; // #ff003c
    gl_FragColor = vec4(color, glyph * vAlpha);
  }
`
```

**Step 2: Add the RainParticles component**

```tsx
function RainParticles() {
  const materialRef = useRef<THREE.ShaderMaterial>(null)

  // Build atlas once
  const atlas = useMemo(() => buildCharAtlas(), [])

  // Build geometry attributes once
  const { posArr, colX, colZ, speedJitter, charIndex, phaseOffset } = useMemo(() => {
    const N = PARTICLE_COUNT
    const posArr       = new Float32Array(N * 3)  // all zero — shader drives position
    const colX         = new Float32Array(N)
    const colZ         = new Float32Array(N)
    const speedJitter  = new Float32Array(N)
    const charIndex    = new Float32Array(N)
    const phaseOffset  = new Float32Array(N)

    for (let i = 0; i < N; i++) {
      posArr[i * 3]     = 0
      posArr[i * 3 + 1] = 0
      posArr[i * 3 + 2] = 0
      colX[i]        = (Math.random() - 0.5) * SPREAD * 2
      colZ[i]        = (Math.random() - 0.5) * SPREAD * 2
      speedJitter[i] = Math.random()
      charIndex[i]   = Math.floor(Math.random() * 64)
      phaseOffset[i] = Math.random() * LOOP_H
    }
    return { posArr, colX, colZ, speedJitter, charIndex, phaseOffset }
  }, [])

  const uniforms = useMemo(() => ({
    uTime:      { value: 0 },
    uCharAtlas: { value: atlas },
  }), [atlas])

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime()
    }
  })

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position"    args={[posArr,      3]} />
        <bufferAttribute attach="attributes-aColX"       args={[colX,        1]} />
        <bufferAttribute attach="attributes-aColZ"       args={[colZ,        1]} />
        <bufferAttribute attach="attributes-aSpeedJitter" args={[speedJitter, 1]} />
        <bufferAttribute attach="attributes-aCharIndex"  args={[charIndex,   1]} />
        <bufferAttribute attach="attributes-aPhaseOffset" args={[phaseOffset, 1]} />
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
  )
}
```

**Step 3: Visual check in dev server**

```bash
npm run dev -- --host 127.0.0.1 --port 4100
```

Expected: Dense red matrix characters raining continuously over the hero. Characters are small red glyphs. Text overlay renders on top. If point size looks too big or small, adjust `gl_PointSize` in the vertex shader (try 8–12px).

**Step 4: Commit**
```bash
git add src/app/components/MatrixRainHero.tsx
git commit -m "feat: particle rain system with character atlas and falling columns"
```

---

### Task 3: SDF helper functions and head shape

**Files:**
- Modify: `src/app/components/MatrixRainHero.tsx` — expand `vertexShader`

**Step 1: Add SDF helper GLSL functions to the top of vertexShader**

Replace `const vertexShader = /* glsl */\`` with this expanded version. Add the helpers and head shape before `void main()`:

```glsl
// ── SDF primitives ─────────────────────────────────────────────

// Smooth union (blends two surfaces together)
float opSmoothUnion(float d1, float d2, float k) {
  float h = clamp(0.5 + 0.5 * (d2 - d1) / k, 0.0, 1.0);
  return mix(d2, d1, h) - k * h * (1.0 - h);
}

// Capsule: rounded cylinder between points a and b
float sdCapsule(vec3 p, vec3 a, vec3 b, float r) {
  vec3 pa = p - a, ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h) - r;
}

// Box (axis-aligned)
float sdBox(vec3 p, vec3 b) {
  vec3 q = abs(p) - b;
  return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

// Sphere
float sdSphere(vec3 p, float r) {
  return length(p) - r;
}

// Torus
float sdTorus(vec3 p, float R, float r) {
  vec2 q = vec2(length(p.xz) - R, p.y);
  return length(q) - r;
}

// Cylinder (capped, on Y axis)
float sdCylinder(vec3 p, float r, float h) {
  vec2 d = abs(vec2(length(p.xz), p.y)) - vec2(r, h);
  return min(max(d.x, d.y), 0.0) + length(max(d, 0.0));
}

// Ellipsoid (approximate SDF — good enough for projection near surface)
float sdEllipsoid(vec3 p, vec3 r) {
  float k0 = length(p / r);
  float k1 = length(p / (r * r));
  return k0 * (k0 - 1.0) / k1;
}

// ── Shape: Head ─────────────────────────────────────────────────
// Two ellipsoids (cranium + jaw) + cylinder neck, smooth-unioned
float sdHead(vec3 p) {
  float s = 1.3;
  vec3 q = p / s;

  // Cranium: slightly wider than tall, centred slightly above origin
  vec3 qC = q - vec3(0.0, 0.25, 0.0);
  float cranium = sdEllipsoid(qC, vec3(0.92, 1.05, 0.88));

  // Jaw/cheeks: shorter ellipsoid, shifted down and slightly forward
  vec3 qJ = q - vec3(0.0, -0.58, 0.06);
  float jaw = sdEllipsoid(qJ, vec3(0.72, 0.58, 0.68));

  // Neck: short cylinder, centred below jaw
  float neck = sdCylinder(q - vec3(0.0, -1.32, 0.0), 0.26, 0.32);

  float head = opSmoothUnion(cranium, jaw, 0.18);
  return opSmoothUnion(head, neck, 0.1) * s;
}
```

**Step 2: Add SDF evaluation and gradient computation to main()**

Below the fall Y calculation in `main()`, add:

```glsl
  // ── SDF evaluation (only head for now) ──────────────────────
  float eps = 0.04;
  float d = sdHead(worldPos);

  // Numerical gradient (central differences)
  vec3 grad = normalize(vec3(
    sdHead(worldPos + vec3(eps, 0.0, 0.0)) - sdHead(worldPos - vec3(eps, 0.0, 0.0)),
    sdHead(worldPos + vec3(0.0, eps, 0.0)) - sdHead(worldPos - vec3(0.0, eps, 0.0)),
    sdHead(worldPos + vec3(0.0, 0.0, eps)) - sdHead(worldPos - vec3(0.0, 0.0, eps))
  ));

  float surfaceThreshold = 0.25;
  if (d < surfaceThreshold) {
    // Project onto surface: push by (d - small_offset) along gradient
    worldPos = worldPos - grad * (d - 0.04);
    vBrightness = 1.0;  // surface particles are bright
  }
```

**Step 3: Visual check**

```bash
npm run dev -- --host 127.0.0.1 --port 4100
```

Expected: A head-shaped concentration of bright red characters visible in the rain. Characters flow down the head contour and fall away. The silhouette is roughly head-shaped — cranium, cheeks, chin, neck stub. Tune `s` (scale) in `sdHead` and the camera `fov`/`position` if the head is too large or too small. Aim to fill roughly 60% of the viewport height.

**Step 4: Commit**
```bash
git add src/app/components/MatrixRainHero.tsx
git commit -m "feat: SDF primitives and head shape with surface projection"
```

---

### Task 4: All six skill shape SDFs

**Files:**
- Modify: `src/app/components/MatrixRainHero.tsx` — add shape functions before `sdHead`

**Step 1: Add the gizmo SDF**

The C4D-style transform handle: three perpendicular capsule shafts + three short thick capsule tips (approximating arrow cones). Centred at origin, roughly 1.8 units across.

```glsl
float sdGizmo(vec3 p) {
  float s = 1.1;
  vec3 q = p / s;
  float shaft = 0.07;
  float tipR  = 0.16;
  float tipH  = 0.28;
  // Shafts along X, Y, Z from origin to 1.0
  float ax = sdCapsule(q, vec3(0,0,0), vec3(1.0,0,0), shaft);
  float ay = sdCapsule(q, vec3(0,0,0), vec3(0,1.0,0), shaft);
  float az = sdCapsule(q, vec3(0,0,0), vec3(0,0,1.0), shaft);
  // Tips: short thick capsules at ends
  float tx = sdCapsule(q, vec3(1.0,0,0), vec3(1.0+tipH,0,0), tipR);
  float ty = sdCapsule(q, vec3(0,1.0,0), vec3(0,1.0+tipH,0), tipR);
  float tz = sdCapsule(q, vec3(0,0,1.0), vec3(0,0,1.0+tipH), tipR);
  // Small origin sphere where axes meet
  float orig = sdSphere(q, 0.13);
  float shafts = min(min(ax, ay), az);
  float tips   = min(min(tx, ty), tz);
  return min(min(shafts, tips), orig) * s;
}
```

**Step 2: Add the Figma logo SDF**

The Figma icon: two stacked circles left + one circle right + small circle (middle) + rounded square — extruded as flat slabs. We approximate with cylinders (flat discs) and a box, all in a rough Figma F-icon layout. Scale so it's ~2.4 units wide.

```glsl
float sdFigma(vec3 p) {
  float s  = 0.9;
  vec3 q   = p / s;
  float h  = 0.15; // extrusion half-depth
  float r  = 0.5;  // circle radius
  // Top-left circle
  float c1 = sdCylinder(q - vec3(-0.5,  0.85, 0), r, h);
  // Middle-left circle (also forms left side of the central shape)
  float c2 = sdCylinder(q - vec3(-0.5,  0.0,  0), r, h);
  // Bottom-left circle
  float c3 = sdCylinder(q - vec3(-0.5, -0.85, 0), r, h);
  // Right circle (centre-right)
  float c4 = sdCylinder(q - vec3( 0.5,  0.0,  0), r, h);
  // Bottom-right rounded square (approximated as a wide short box)
  float sq = sdBox(q - vec3(0.0, -0.85, 0), vec3(0.5, 0.42, h));
  return min(min(min(c1, c2), min(c3, c4)), sq) * s;
}
```

**Step 3: Add the paintbrush SDF**

Long thin shaft, short wider ferrule band, tapered conical tip. Aligned on the Y axis, tip at bottom.

```glsl
float sdPaintbrush(vec3 p) {
  float s = 0.85;
  vec3 q = p / s;
  // Shaft: long thin capsule from top to near-bottom
  float shaft   = sdCapsule(q, vec3(0, 1.8, 0), vec3(0, -0.4, 0), 0.12);
  // Ferrule: wider short cylinder where shaft meets bristles
  float ferrule = sdCylinder(q - vec3(0, -0.55, 0), 0.18, 0.2);
  // Bristle tip: narrow capsule tapering to a point (simulate with two capsules)
  float tip1    = sdCapsule(q, vec3(0, -0.75, 0), vec3(0, -1.5, 0), 0.13);
  float tip2    = sdCapsule(q, vec3(0, -1.3, 0),  vec3(0, -1.6, 0), 0.04);
  return min(min(shaft, ferrule), min(tip1, tip2)) * s;
}
```

**Step 4: Add the musical quaver note SDF**

Oval note head + vertical stem + diagonal flag. All approximated with primitives.

```glsl
float sdNote(vec3 p) {
  float s = 0.9;
  vec3 q = p / s;
  // Note head: flattened sphere (oval), tilted slightly, centred bottom-left
  vec3 qH = q - vec3(-0.3, -1.0, 0);
  // Rotate the oval ~20° in XY plane
  float a  = 0.35;
  vec3 qHr = vec3(qH.x*cos(a)+qH.y*sin(a), -qH.x*sin(a)+qH.y*cos(a), qH.z);
  float head = sdEllipsoid(qHr, vec3(0.42, 0.28, 0.22));
  // Stem: vertical capsule on right side of head
  float stem  = sdCapsule(q, vec3(0.12, -0.88, 0), vec3(0.12, 1.2, 0), 0.07);
  // Flag: diagonal slab from top of stem curving right-down
  float flag1 = sdCapsule(q, vec3(0.12, 1.2, 0), vec3(0.72, 0.7, 0), 0.07);
  float flag2 = sdCapsule(q, vec3(0.72, 0.7, 0), vec3(0.82, 0.3, 0), 0.06);
  return min(min(head, stem), min(flag1, flag2)) * s;
}
```

**Step 5: Add the brain SDF**

Hemisphere + sinusoidal displacement on the surface to suggest gyri (folds). The displacement is baked into the SDF evaluation.

```glsl
float sdBrain(vec3 p) {
  float s = 1.25;
  vec3 q = p / s;

  // Base hemisphere (top half of sphere, flattened slightly)
  float base = sdEllipsoid(q, vec3(1.0, 0.85, 0.92));

  // Cut off bottom half (cerebellum area) with a box
  float cut  = sdBox(q - vec3(0, -0.55, 0), vec3(1.5, 0.4, 1.5));
  float hemi = max(base, -cut); // subtract box top from sphere

  // Add gyri: sinusoidal surface displacement
  float freq  = 5.5;
  float amp   = 0.12;
  float gyri  = sin(freq * q.x) * sin(freq * q.y * 1.2) * sin(freq * q.z * 0.9) * amp;

  // Small cerebellum lobe at back-bottom
  float cere = sdEllipsoid(q - vec3(0.0, -0.7, -0.6), vec3(0.45, 0.32, 0.38));

  return (min(hemi + gyri, cere)) * s;
}
```

**Step 6: Add the `</>` brackets SDF**

Three 3D extrusions: `<`, `/`, `>`. Approximated as boxes. Total ~2.4 units wide.

```glsl
float sdBrackets(vec3 p) {
  float s   = 0.9;
  vec3 q    = p / s;
  float dep = 0.15; // extrusion depth (Z half-size)
  float w   = 0.08; // bar thickness

  // Left bracket '<': two angled bars meeting at a point on the left
  // Upper arm of <
  float la1 = sdBox(
    vec3(
      q.x + 1.0 - (q.y * 0.6),  // shear to make angled
      q.y - 0.5,
      q.z
    ),
    vec3(0.38, w, dep)
  );
  // Lower arm of <
  float la2 = sdBox(
    vec3(
      q.x + 1.0 + (q.y * 0.6),
      q.y + 0.5,
      q.z
    ),
    vec3(0.38, w, dep)
  );
  float lbr = min(la1, la2);

  // Slash '/'
  float slash = sdBox(
    vec3(
      q.x - (q.y * 0.35),
      q.y,
      q.z
    ),
    vec3(w * 1.2, 0.85, dep)
  );

  // Right bracket '>' (mirror of left)
  float ra1 = sdBox(
    vec3(
      q.x - 1.0 + (q.y * 0.6),
      q.y - 0.5,
      q.z
    ),
    vec3(0.38, w, dep)
  );
  float ra2 = sdBox(
    vec3(
      q.x - 1.0 - (q.y * 0.6),
      q.y + 0.5,
      q.z
    ),
    vec3(0.38, w, dep)
  );
  float rbr = min(ra1, ra2);

  return min(min(lbr, slash), rbr) * s;
}
```

**Step 7: Visual check — temporarily hard-code each shape**

In `main()`, replace `sdHead(worldPos)` with each new shape function in turn, save, confirm each shape produces a recognisable outline in the rain. Adjust scale constants (`s`) until each shape fills the viewport comfortably.

**Step 8: Commit**
```bash
git add src/app/components/MatrixRainHero.tsx
git commit -m "feat: add all six skill SDFs (gizmo, figma, paintbrush, note, brain, brackets)"
```

---

### Task 5: Unified SDF dispatcher and surface projection

**Files:**
- Modify: `src/app/components/MatrixRainHero.tsx` — add dispatcher + morph uniforms

**Step 1: Add the dispatcher function to the vertex shader**

Add after all shape functions, before `void main()`:

```glsl
// ── SDF dispatcher ───────────────────────────────────────────────
// shapeId: 0=Head 1=Gizmo 2=Figma 3=Brush 4=Note 5=Brain 6=Brackets

uniform int uShapeA;
uniform int uShapeB;
uniform float uMorphT;

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
  float a = evalShape(p, uShapeA);
  float b = evalShape(p, uShapeB);
  return mix(a, b, uMorphT);
}

// Numerical gradient of blended SDF
vec3 blendedGrad(vec3 p) {
  float e = 0.04;
  return normalize(vec3(
    blendedSDF(p + vec3(e,0,0)) - blendedSDF(p - vec3(e,0,0)),
    blendedSDF(p + vec3(0,e,0)) - blendedSDF(p - vec3(0,e,0)),
    blendedSDF(p + vec3(0,0,e)) - blendedSDF(p - vec3(0,0,e))
  ));
}
```

**Step 2: Update main() to use blendedSDF**

Replace the hard-coded `sdHead` calls in `main()`:

```glsl
  float d    = blendedSDF(worldPos);
  vec3  grad = blendedGrad(worldPos);

  float surfaceThreshold = 0.25;
  if (d < surfaceThreshold) {
    worldPos  = worldPos - grad * (d - 0.05);
    vBrightness = mix(0.35, 1.0, smoothstep(surfaceThreshold, 0.0, d));
  }
```

**Step 3: Add uShapeA, uShapeB, uMorphT to the JS uniforms object**

```ts
const uniforms = useMemo(() => ({
  uTime:       { value: 0 },
  uCharAtlas:  { value: atlas },
  uShapeA:     { value: 0 },
  uShapeB:     { value: 0 },
  uMorphT:     { value: 0 },
}), [atlas])
```

**Step 4: Verify compile**

```bash
npm run dev -- --host 127.0.0.1 --port 4100
```

Expected: Head still shows in rain (shapeA=0, shapeB=0, morphT=0). No console errors.

**Step 5: Commit**
```bash
git add src/app/components/MatrixRainHero.tsx
git commit -m "feat: unified SDF dispatcher with morph uniforms"
```

---

### Task 6: Animation loop — morph sequencer and skill label

**Files:**
- Modify: `src/app/components/MatrixRainHero.tsx`

**Step 1: Add shape sequence state and morph logic to RainParticles**

Add this inside `RainParticles`, before the `return`:

```tsx
// Shape cycle: 0=Head, 1=Gizmo, 2=Figma, 3=Brush, 4=Note, 5=Brain, 6=Brackets
// Then back to Head
const SEQUENCE = [0, 1, 2, 3, 4, 5, 6]

// Timing (seconds)
const HOLD_HEAD   = 8   // hold on head before first morph
const HOLD_SKILL  = 5   // hold on each skill shape
const MORPH_DUR   = 3   // transition duration

// Sequence index (which skill we are morphing TO)
const seqIndexRef = useRef(0)  // index into SEQUENCE after head
const phaseRef    = useRef<'hold' | 'morph'>('hold')
const phaseTimerRef = useRef(0)

useFrame((state, delta) => {
  const mat = materialRef.current
  if (!mat) return

  mat.uniforms.uTime.value = state.clock.getElapsedTime()

  phaseTimerRef.current += delta

  if (phaseRef.current === 'hold') {
    const holdTime = seqIndexRef.current === 0 ? HOLD_HEAD : HOLD_SKILL
    if (phaseTimerRef.current >= holdTime) {
      // Start morphing to next shape
      const nextIdx = (seqIndexRef.current + 1) % SEQUENCE.length
      mat.uniforms.uShapeA.value = SEQUENCE[seqIndexRef.current]
      mat.uniforms.uShapeB.value = SEQUENCE[nextIdx]
      mat.uniforms.uMorphT.value = 0
      phaseRef.current = 'morph'
      phaseTimerRef.current = 0
    }
  } else {
    // Morphing
    const t = Math.min(phaseTimerRef.current / MORPH_DUR, 1)
    // Ease in-out cubic
    const eased = t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2
    mat.uniforms.uMorphT.value = eased

    if (phaseTimerRef.current >= MORPH_DUR) {
      // Morph complete — settle on new shape
      seqIndexRef.current = (seqIndexRef.current + 1) % SEQUENCE.length
      mat.uniforms.uShapeA.value = SEQUENCE[seqIndexRef.current]
      mat.uniforms.uShapeB.value = SEQUENCE[seqIndexRef.current]
      mat.uniforms.uMorphT.value = 0
      phaseRef.current = 'hold'
      phaseTimerRef.current = 0
    }
  }
})
```

**Step 2: Add skill label display to MatrixRainHero**

The label sits at the bottom of the 3D canvas area and fades in/out with the morph cycle. Pass `activeSkill` as state up from `RainParticles` via a callback prop.

Lift the state to `MatrixRainHero`:

```tsx
const [activeSkill, setActiveSkill] = useState<string | null>(null)
```

Pass `onSkillChange={setActiveSkill}` to `<RainParticles>` and call it in `useFrame` when a morph completes.

In the overlay:
```tsx
{activeSkill && activeSkill !== 'Head' && (
  <motion.div
    key={activeSkill}
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.6 }}
    className="absolute bottom-32 left-1/2 -translate-x-1/2 z-20 font-mono text-xs uppercase tracking-[0.4em] text-[#ff003c] opacity-70"
  >
    {activeSkill}
  </motion.div>
)}
```

**Step 3: Visual check**

```bash
npm run dev -- --host 127.0.0.1 --port 4100
```

Expected: Rain flows over the head for 8 seconds, then rain smoothly transitions to gizmo shape over 3 seconds, holds 5 seconds, label "3D Design" appears, then morphs to next shape, etc. Full cycle completes and loops back to head.

**Step 4: Commit**
```bash
git add src/app/components/MatrixRainHero.tsx
git commit -m "feat: morph sequencer with hold/morph phases and skill label"
```

---

### Task 7: Wire up to app and final polish pass

**Files:**
- Modify: whichever file currently imports `CyberHero` (find with `grep -r "CyberHero" src/`)
- Modify: `src/app/components/MatrixRainHero.tsx` — colour and sizing tweaks

**Step 1: Replace CyberHero import**

```ts
// Before
import { CyberHero } from './components/CyberHero'
// After
import { MatrixRainHero } from './components/MatrixRainHero'
```

Replace the JSX usage `<CyberHero />` → `<MatrixRainHero />`.

**Step 2: Polish checklist — work through each item visually**

- [ ] **Point size**: in the vertex shader, replace the hardcoded `gl_PointSize = 10.0` with a distance-based calculation so characters look the same size regardless of perspective. For `Points` with a fixed perspective camera at z=6: `gl_PointSize = 380.0 / length((modelViewMatrix * vec4(worldPos, 1.0)).xyz);` — tune the constant (try 320–440).
- [ ] **Surface brightness**: surface characters at brightness=1.0, free-fall at 0.25. Ensure the transition is visible but not jarring.
- [ ] **Rain density**: if the rain looks sparse, increase `PARTICLE_COUNT` to 5000. If performance drops, reduce to 3000.
- [ ] **Column distribution**: currently random. Consider using a more even grid — replace `Math.random()` column X/Z with a jittered grid: `colX[i] = (col + Math.random()*0.6 - 0.3) * columnSpacing`.
- [ ] **Head scale**: tune the `s` scale constant in `sdHead` so the head fills about 55–65% of viewport height.
- [ ] **Gizmo orientation**: the gizmo axes point along +X, +Y, +Z which looks more interesting when slightly rotated. Add a static rotation to the `q` vector in `sdGizmo`: rotate 25° around Y: `q = vec3(q.x*cos(r)-q.z*sin(r), q.y, q.x*sin(r)+q.z*cos(r))` where `r = 0.44`.
- [ ] **Scan lines**: the existing scan-line div in the original `CyberHero` was `opacity-10` — optionally add it back in `MatrixRainHero` for consistency with the site's aesthetic.

**Step 3: Build check**
```bash
npm run build
```
Expected: Build succeeds with no TypeScript errors.

**Step 4: Final commit**
```bash
git add src/app/components/MatrixRainHero.tsx
git add src/ # any other modified files
git commit -m "feat: wire MatrixRainHero into app and polish pass"
```

---

## Tuning Reference

| Variable | Location | Effect |
|---|---|---|
| `PARTICLE_COUNT` | JS constant | Rain density — increase for denser rain, decrease for performance |
| `SPREAD` | JS constant | X/Z extent of rain field |
| `BASE_SPEED` | JS/shader | How fast characters fall |
| `surfaceThreshold` | vertex shader | How close a particle must be to the surface before it's projected. Wider = thicker surface skin |
| `0.05` in projection | vertex shader | Offset of projected particle above the surface (prevents z-fighting) |
| `s` in each sdXxx | vertex shader | Scale of each shape — tune until it fills the viewport well |
| `HOLD_HEAD` | JS constant | How long the head holds before first morph |
| `HOLD_SKILL` | JS constant | How long each skill shape holds |
| `MORPH_DUR` | JS constant | Duration of each transition |

## Known Limitations / Future Work

- **Bloom**: EffectComposer post-processing would make surface characters glow beautifully. Deferred to milestone 1.4.
- **Mobile particle count**: on small screens, reduce `PARTICLE_COUNT` based on `window.innerWidth`.
- **Bracket shape**: the shear-box approach for `</>` is an approximation. A cleaner result would use rotated boxes, but requires a rotation helper in GLSL.
- **Figma logo**: the cylinder arrangement is approximate. For a perfect Figma icon, use the exact circle geometry from the logo spec.
