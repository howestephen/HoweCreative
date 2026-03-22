import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { motion } from 'motion/react'
import { siteProfile } from '../data/portfolio'
import { Figma, Palette, Film, Box, Code, Zap } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

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

  // 40 katakana + 8 digits + 16 symbols = 64 glyphs (8×8 atlas grid)
  const chars = [
    'ア','イ','ウ','エ','オ','カ','キ','ク','ケ','コ',
    'サ','シ','ス','セ','ソ','タ','チ','ツ','テ','ト',
    'ナ','ニ','ヌ','ネ','ノ','ハ','ヒ','フ','ヘ','ホ',
    'マ','ミ','ム','メ','モ','ヤ','ユ','ヨ','ラ','ル',
    '0','1','2','3','4','5','6','7',
    '!','@','#','$','%','<','>','{','}','|',
    '/','\\','+','-','*','&',
  ]

  ctx.fillStyle = '#fff'
  ctx.font = `bold ${CELL * 0.72}px monospace`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  chars.forEach((ch, i) => {
    const col = i % GRID
    const row = Math.floor(i / GRID)
    ctx.fillText(ch, col * CELL + CELL / 2, row * CELL + CELL / 2)
  })

  const tex = new THREE.CanvasTexture(canvas)
  return tex
}

// ── Skill metadata ───────────────────────────────────────────────
interface SkillEntry {
  label: string
  shapeId: number
  icon: LucideIcon | null
}

const SKILLS: SkillEntry[] = [
  { label: 'Head',             shapeId: 0, icon: null },
  { label: '3D Design',        shapeId: 1, icon: Box },
  { label: 'Figma',            shapeId: 2, icon: Figma },
  { label: 'Graphic Design',   shapeId: 3, icon: Palette },
  { label: 'Motion Graphics',  shapeId: 4, icon: Film },
  { label: 'AI Workflows',     shapeId: 5, icon: Zap },
  { label: 'Frontend Dev',     shapeId: 6, icon: Code },
]

const PARTICLE_COUNT = 4000
const SPREAD        = 4.5    // X/Z extent of the rain field
const LOOP_H        = 14.0   // fall loop height
const BASE_SPEED    = 1.4    // units/second baseline

const vertexShader = /* glsl */`
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

  // ── SDF primitives ─────────────────────────────────────────────

  float opSmoothUnion(float d1, float d2, float k) {
    float h = clamp(0.5 + 0.5 * (d2 - d1) / k, 0.0, 1.0);
    return mix(d2, d1, h) - k * h * (1.0 - h);
  }

  float sdCapsule(vec3 p, vec3 a, vec3 b, float r) {
    vec3 pa = p - a, ba = b - a;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    return length(pa - ba * h) - r;
  }

  float sdBox(vec3 p, vec3 b) {
    vec3 q = abs(p) - b;
    return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
  }

  float sdSphere(vec3 p, float r) {
    return length(p) - r;
  }

  float sdTorus(vec3 p, float R, float r) {
    vec2 q = vec2(length(p.xz) - R, p.y);
    return length(q) - r;
  }

  float sdCylinder(vec3 p, float r, float h) {
    vec2 d = abs(vec2(length(p.xz), p.y)) - vec2(r, h);
    return min(max(d.x, d.y), 0.0) + length(max(d, 0.0));
  }

  float sdEllipsoid(vec3 p, vec3 r) {
    float k0 = length(p / r);
    float k1 = length(p / (r * r));
    return k0 * (k0 - 1.0) / k1;
  }

  // ── Shape: Head ─────────────────────────────────────────────────
  float sdHead(vec3 p) {
    float s = 1.3;
    vec3 q = p / s;

    vec3 qC = q - vec3(0.0, 0.25, 0.0);
    float cranium = sdEllipsoid(qC, vec3(0.92, 1.05, 0.88));

    vec3 qJ = q - vec3(0.0, -0.58, 0.06);
    float jaw = sdEllipsoid(qJ, vec3(0.72, 0.58, 0.68));

    float neck = sdCylinder(q - vec3(0.0, -1.32, 0.0), 0.26, 0.32);

    float head = opSmoothUnion(cranium, jaw, 0.18);
    return opSmoothUnion(head, neck, 0.1) * s;
  }

  void main() {
    float speed = uBaseSpeed * (0.6 + aSpeedJitter * 0.8);
    float yRaw = mod(aPhaseOffset - uTime * speed, uLoopH) - uLoopH * 0.5;

    vec3 worldPos = vec3(aColX, yRaw, aColZ);

    // ── SDF surface projection ───────────────────────────────────
    float eps = 0.04;
    float d   = sdHead(worldPos);

    vec3 grad = normalize(vec3(
      sdHead(worldPos + vec3(eps, 0.0, 0.0)) - sdHead(worldPos - vec3(eps, 0.0, 0.0)),
      sdHead(worldPos + vec3(0.0, eps, 0.0)) - sdHead(worldPos - vec3(0.0, eps, 0.0)),
      sdHead(worldPos + vec3(0.0, 0.0, eps)) - sdHead(worldPos - vec3(0.0, 0.0, eps))
    ));

    float topFade = smoothstep(uLoopH * 0.5,  5.5, yRaw);
    float botFade = smoothstep(-uLoopH * 0.5, -5.5, yRaw);

    vCharIndex  = aCharIndex;

    // Default brightness for free-falling particles
    vBrightness = 0.35;

    float surfaceThreshold = 0.25;
    if (d < surfaceThreshold) {
      worldPos    = worldPos - grad * (d - 0.05);
      vBrightness = mix(0.35, 1.0, smoothstep(surfaceThreshold, 0.0, d));
    }

    vAlpha      = topFade * botFade;

    gl_Position  = projectionMatrix * modelViewMatrix * vec4(worldPos, 1.0);
    float dist = length((modelViewMatrix * vec4(worldPos, 1.0)).xyz);
    gl_PointSize = (380.0 / dist) * uPixelRatio;
  }
`

const fragmentShader = /* glsl */`
  uniform sampler2D uCharAtlas;
  uniform float     uTime;

  varying float vCharIndex;
  varying float vBrightness;
  varying float vAlpha;

  void main() {
    float idx = mod(vCharIndex + floor(uTime * 1.5), 64.0);
    float col = mod(idx, 8.0);
    float row = floor(idx / 8.0);

    vec2  uv    = (gl_PointCoord + vec2(col, row)) / 8.0;
    float glyph = texture2D(uCharAtlas, uv).r;

    if (glyph < 0.1) discard;

    vec3 color = vec3(1.0, 0.0, 0.235) * vBrightness;
    gl_FragColor = vec4(color, glyph * vAlpha);
  }
`

function RainParticles() {
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const atlas       = useMemo(() => buildCharAtlas(), [])

  const attrs = useMemo(() => {
    const N            = PARTICLE_COUNT
    const posArr       = new Float32Array(N * 3)  // all zero — shader drives position
    const colX         = new Float32Array(N)
    const colZ         = new Float32Array(N)
    const speedJitter  = new Float32Array(N)
    const charIndex    = new Float32Array(N)
    const phaseOffset  = new Float32Array(N)

    for (let i = 0; i < N; i++) {
      colX[i]        = (Math.random() - 0.5) * SPREAD * 2
      colZ[i]        = (Math.random() - 0.5) * SPREAD * 2
      speedJitter[i] = Math.random()
      charIndex[i]   = Math.floor(Math.random() * 64)
      phaseOffset[i] = Math.random() * LOOP_H
    }
    return { posArr, colX, colZ, speedJitter, charIndex, phaseOffset }
  }, [])

  const uniforms = useMemo(() => ({
    uTime:       { value: 0 },
    uCharAtlas:  { value: atlas },
    uBaseSpeed:  { value: BASE_SPEED },
    uLoopH:      { value: LOOP_H },
    uPixelRatio: { value: window.devicePixelRatio },
  }), [atlas])

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime()
    }
  })

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position"     args={[attrs.posArr,      3]} />
        <bufferAttribute attach="attributes-aColX"        args={[attrs.colX,        1]} />
        <bufferAttribute attach="attributes-aColZ"        args={[attrs.colZ,        1]} />
        <bufferAttribute attach="attributes-aSpeedJitter" args={[attrs.speedJitter, 1]} />
        <bufferAttribute attach="attributes-aCharIndex"   args={[attrs.charIndex,   1]} />
        <bufferAttribute attach="attributes-aPhaseOffset" args={[attrs.phaseOffset, 1]} />
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
