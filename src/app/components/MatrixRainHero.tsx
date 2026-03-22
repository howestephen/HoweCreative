import { Canvas } from '@react-three/fiber'
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
