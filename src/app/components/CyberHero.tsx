import { motion } from "motion/react";
import { useRef, useEffect, useState } from "react";
import {
  Figma,
  Palette,
  Film,
  Box,
  Code,
  Zap,
} from "lucide-react";

// Skill icons data
const skills = [
  { icon: Figma, label: "Figma Design", color: "#ff003c" },
  { icon: Palette, label: "Graphic Design", color: "#ff4466" },
  { icon: Film, label: "Motion Graphics", color: "#ff6b88" },
  { icon: Box, label: "3D Design", color: "#8b0020" },
  { icon: Code, label: "React/TypeScript", color: "#ff003c" },
  { icon: Zap, label: "AI Workflows", color: "#ff4466" },
];

// Canvas-based 3D morphing head
function Canvas3DHead() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [currentShape, setCurrentShape] = useState(0);
  const shapeIndexRef = useRef(0); // Track shape index with ref instead of state

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const updateSize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(
        window.devicePixelRatio,
        window.devicePixelRatio,
      );
    };
    updateSize();
    window.addEventListener("resize", updateSize);

    let time = 0;
    let transitionProgress = 0;

    // Shape change interval - sequential transitions
    const shapeInterval = setInterval(() => {
      shapeIndexRef.current = (shapeIndexRef.current + 1) % 6;
      setCurrentShape(shapeIndexRef.current);
      transitionProgress = 0; // Reset transition
    }, 6000); // Slower shape changes

    const shapes = [
      // Head/Circle - removed pulsing effect
      (t: number, progress: number) => {
        const points: [number, number][] = [];
        for (let i = 0; i < 32; i++) {
          const angle = (i / 32) * Math.PI * 2;
          const radius = 150; // Static radius for calm effect
          points.push([
            Math.cos(angle) * radius,
            Math.sin(angle) * radius,
          ]);
        }
        return points;
      },
      // Cube
      (t: number, progress: number) => {
        const size = 140;
        return [
          [-size, -size],
          [size, -size],
          [size, size],
          [-size, size],
          [-size, -size],
          [-size + 40, -size + 40],
          [size - 40, -size + 40],
          [size - 40, size - 40],
          [-size + 40, size - 40],
          [-size + 40, -size + 40],
        ];
      },
      // Diamond
      (t: number, progress: number) => {
        const size = 160;
        return [
          [0, -size],
          [size * 0.7, 0],
          [0, size],
          [-size * 0.7, 0],
          [0, -size],
          [0, -size * 0.5],
          [size * 0.4, 0],
          [0, size * 0.5],
          [-size * 0.4, 0],
          [0, -size * 0.5],
        ];
      },
      // Star
      (t: number, progress: number) => {
        const points: [number, number][] = [];
        for (let i = 0; i < 10; i++) {
          const angle = (i / 10) * Math.PI * 2 - Math.PI / 2;
          const radius = i % 2 === 0 ? 140 : 70;
          points.push([
            Math.cos(angle) * radius,
            Math.sin(angle) * radius,
          ]);
        }
        return points;
      },
      // Hexagon
      (t: number, progress: number) => {
        const points: [number, number][] = [];
        for (let i = 0; i < 6; i++) {
          const angle = (i / 6) * Math.PI * 2;
          const radius = 140;
          points.push([
            Math.cos(angle) * radius,
            Math.sin(angle) * radius,
          ]);
        }
        return [...points, points[0]];
      },
      // Triangle
      (t: number, progress: number) => {
        const size = 160;
        return [
          [0, -size],
          [size, size * 0.7],
          [-size, size * 0.7],
          [0, -size],
          [0, -size * 0.3],
          [size * 0.5, size * 0.3],
          [-size * 0.5, size * 0.3],
          [0, -size * 0.3],
        ];
      },
    ];

    const animate = () => {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      ctx.clearRect(0, 0, width, height);

      time += 0.005; // Slower animation speed
      transitionProgress += 0.015; // Smoother morphing

      // Center point
      const cx = width / 2;
      const cy = height / 2;

      // Draw fewer, calmer particles
      ctx.fillStyle = "rgba(255, 0, 60, 0.2)";
      for (let i = 0; i < 20; i++) {
        // Reduced from 50 to 20
        const px =
          Math.sin(time * 0.3 + i * 0.5) * width * 0.35 + cx; // Slower movement
        const py =
          Math.cos(time * 0.2 + i * 0.5) * height * 0.35 + cy; // Slower movement
        const size = 1 + Math.sin(time + i) * 0.5; // Subtle pulsing
        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Get current and next shape
      const shapeIndex =
        Math.floor(transitionProgress) % shapes.length;
      const nextShapeIndex = (shapeIndex + 1) % shapes.length;
      const t =
        transitionProgress - Math.floor(transitionProgress);

      // Apply easing to the transition
      const easedT =
        t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

      const currentPoints = shapes[shapeIndex](time, easedT);
      const nextPoints = shapes[nextShapeIndex](time, easedT);

      // Interpolate between shapes
      const points: [number, number][] = [];
      for (
        let i = 0;
        i < Math.max(currentPoints.length, nextPoints.length);
        i++
      ) {
        const cp = currentPoints[i % currentPoints.length];
        const np = nextPoints[i % nextPoints.length];
        points.push([
          cp[0] + (np[0] - cp[0]) * easedT,
          cp[1] + (np[1] - cp[1]) * easedT,
        ]);
      }

      // Slower rotation
      const rotation = time * 0.08;

      // Draw main shape with softer glow
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rotation);

      // Outer glow - reduced intensity
      ctx.strokeStyle = "#ff003c";
      ctx.lineWidth = 2;
      ctx.shadowBlur = 15;
      ctx.shadowColor = "#ff003c";

      ctx.beginPath();
      points.forEach((point, i) => {
        if (i === 0) {
          ctx.moveTo(point[0], point[1]);
        } else {
          ctx.lineTo(point[0], point[1]);
        }
      });
      ctx.closePath();
      ctx.stroke();

      // Inner shape
      ctx.strokeStyle = "#ff4466";
      ctx.lineWidth = 1;
      ctx.shadowBlur = 8;
      ctx.stroke();

      // Minimal wireframe overlay - fewer connections
      ctx.strokeStyle = "rgba(255, 0, 60, 0.15)"; // More subtle
      ctx.lineWidth = 0.3;
      ctx.shadowBlur = 0;

      // Only connect every 5th point to reduce visual clutter
      for (let i = 0; i < points.length; i += 5) {
        for (let j = i + 5; j < points.length; j += 5) {
          ctx.beginPath();
          ctx.moveTo(points[i][0], points[i][1]);
          ctx.lineTo(points[j][0], points[j][1]);
          ctx.stroke();
        }
      }

      ctx.restore();

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      clearInterval(shapeInterval);
      window.removeEventListener("resize", updateSize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ width: "100%", height: "100%" }}
    />
  );
}

export function CyberHero() {
  return (
    <div className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-black">
      {/* Canvas Background - Make it more visible */}
      <div className="absolute inset-0 z-0 flex items-center justify-center">
        <div className="w-full h-full max-w-4xl">
          <Canvas3DHead />
        </div>
      </div>

      {/* Radial gradient for depth */}
      <div className="absolute inset-0 z-[5] bg-gradient-radial from-transparent via-black/20 to-black/60 pointer-events-none" />

      {/* Scan lines effect */}
      <div
        className="absolute inset-0 pointer-events-none z-10 opacity-10"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, #ff003c 2px, #ff003c 4px)",
        }}
      />

      {/* Content overlay */}
      <div className="relative z-20 text-center px-6 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <div className="mb-4 text-[#ff003c] uppercase tracking-[0.3em] opacity-70 font-mono">
            Systems / Product Designer
          </div>
          <h1 className="mb-6 tracking-tight">
            <span className="block text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-2">
              STEPHEN HOWE
            </span>
            <span className="block text-4xl md:text-6xl lg:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ff003c] via-[#ff4466] to-[#8b0020]">
              PORTFOLIO
            </span>
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-12 font-mono">
            Crafting engaging experiences in 3D, motion
            graphics, and AI-assisted development.
          </p>
        </motion.div>

        {/* Skills grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1 }}
          className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto"
        >
          {skills.map((skill, index) => (
            <motion.div
              key={skill.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.5,
                delay: 1.2 + index * 0.1,
              }}
              className="group relative"
            >
              <div className="bg-black/40 backdrop-blur-sm border border-[#ff003c]/30 p-4 rounded hover:border-[#ff003c] transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,0,60,0.3)]">
                <skill.icon
                  className="w-8 h-8 mx-auto mb-2 transition-transform group-hover:scale-110"
                  style={{ color: skill.color }}
                />
                <div className="text-xs uppercase tracking-wider text-zinc-400 group-hover:text-white transition-colors font-mono">
                  {skill.label}
                </div>
              </div>
              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-[#ff003c] opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-[#ff003c] opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-[#ff003c] opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-[#ff003c] opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          ))}
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 1,
            delay: 2,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <div className="text-[#ff003c] text-xs uppercase tracking-widest mb-2 font-mono">
            Scroll
          </div>
          <div className="w-px h-12 bg-gradient-to-b from-[#ff003c] to-transparent mx-auto" />
        </motion.div>
      </div>
    </div>
  );
}