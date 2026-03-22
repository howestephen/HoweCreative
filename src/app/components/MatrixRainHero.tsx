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

  varying float vCharIndex;
  varying float vBrightness;
  varying float vAlpha;

  void main() {
    float speed = 1.4 * (0.6 + aSpeedJitter * 0.8);
    float yRaw = mod(aPhaseOffset - uTime * speed, 14.0) - 7.0;

    vec3 worldPos = vec3(aColX, yRaw, aColZ);

    float fadeEdge = 1.5;
    float topFade = smoothstep(7.0,  5.5, yRaw);
    float botFade = smoothstep(-7.0, -5.5, yRaw);

    vCharIndex  = aCharIndex;
    vBrightness = 0.35;
    vAlpha      = topFade * botFade;

    gl_Position  = projectionMatrix * modelViewMatrix * vec4(worldPos, 1.0);
    gl_PointSize = 10.0;
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
