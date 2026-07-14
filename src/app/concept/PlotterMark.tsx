import { useCallback, useEffect, useRef, useState } from "react";
import { RefreshCw } from "lucide-react";

/**
 * A seeded, plotter-style line drawing that sketches itself on mount.
 * Three structure families; every seed produces a different figure.
 * Pure canvas 2D — no WebGL, draws once, then idles.
 */

function mulberry32(seed: number) {
  let state = seed >>> 0;
  return function next() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Rng = () => number;
type Pt = [number, number];
type Path = { points: Pt[]; accent: boolean };

const STRUCTURE_NAMES = ["LATTICE", "NETWORK", "SIGNAL"] as const;

function fitToUnit(paths: Path[], margin = 0.1): Path[] {
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  paths.forEach((p) =>
    p.points.forEach(([x, y]) => {
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }),
  );
  const spanX = maxX - minX || 1;
  const spanY = maxY - minY || 1;
  const scale = (1 - margin * 2) / Math.max(spanX, spanY);
  const offX = (1 - spanX * scale) / 2;
  const offY = (1 - spanY * scale) / 2;
  return paths.map((p) => ({
    ...p,
    points: p.points.map(([x, y]): Pt => [(x - minX) * scale + offX, (y - minY) * scale + offY]),
  }));
}

/** Isometric scaffold with seeded dropout. */
function genLattice(r: Rng): Path[] {
  const paths: Path[] = [];
  const n = 2 + Math.floor(r() * 2); // 2–3 cells per axis
  const iso = (x: number, y: number, z: number): Pt => [
    (x - z) * 0.5,
    (x + z) * 0.25 - y * 0.52,
  ];
  const strut = (a: Pt, b: Pt) => paths.push({ points: [a, b], accent: r() < 0.12 });

  for (let x = 0; x <= n; x += 1)
    for (let y = 0; y <= n; y += 1)
      for (let z = 0; z <= n; z += 1) {
        if (x < n && r() > 0.44) strut(iso(x, y, z), iso(x + 1, y, z));
        if (y < n && r() > 0.44) strut(iso(x, y, z), iso(x, y + 1, z));
        if (z < n && r() > 0.44) strut(iso(x, y, z), iso(x, y, z + 1));
      }

  return fitToUnit(paths);
}

/** Node graph: min-distance points, each linked to its two nearest peers. */
function genNetwork(r: Rng): Path[] {
  const paths: Path[] = [];
  const nodes: Pt[] = [];
  const count = 10 + Math.floor(r() * 6);

  let guard = 0;
  while (nodes.length < count && guard < 400) {
    guard += 1;
    const candidate: Pt = [0.1 + r() * 0.8, 0.1 + r() * 0.8];
    if (nodes.every((p) => Math.hypot(p[0] - candidate[0], p[1] - candidate[1]) > 0.14)) {
      nodes.push(candidate);
    }
  }

  const linked = new Set<string>();
  nodes.forEach((from, i) => {
    nodes
      .map((to, j) => ({ j, d: Math.hypot(from[0] - to[0], from[1] - to[1]) }))
      .filter((e) => e.j !== i)
      .sort((a, b) => a.d - b.d)
      .slice(0, 2)
      .forEach(({ j }) => {
        const key = i < j ? `${i}-${j}` : `${j}-${i}`;
        if (linked.has(key)) return;
        linked.add(key);
        paths.push({ points: [from, nodes[j]], accent: r() < 0.14 });
      });
  });

  nodes.forEach(([cx, cy]) => {
    const radius = 0.016 + r() * 0.016;
    const ring: Pt[] = [];
    for (let step = 0; step <= 12; step += 1) {
      const angle = (step / 12) * Math.PI * 2;
      ring.push([cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius]);
    }
    paths.push({ points: ring, accent: r() < 0.18 });
  });

  return fitToUnit(paths);
}

/** Layered lissajous ribbon — three echoed strokes. */
function genSignal(r: Rng): Path[] {
  const paths: Path[] = [];
  const a = 2 + Math.floor(r() * 4);
  let b = 2 + Math.floor(r() * 4);
  if (b === a) b += 1;
  const phase = r() * Math.PI;
  const echoes = 3;

  for (let echo = 0; echo < echoes; echo += 1) {
    const offset = (echo - (echoes - 1) / 2) * 0.02;
    const points: Pt[] = [];
    for (let i = 0; i <= 420; i += 1) {
      const t = (i / 420) * Math.PI * 2;
      points.push([
        0.5 + Math.sin(a * t + phase) * 0.38 + offset,
        0.5 + Math.sin(b * t) * 0.38 + offset * 0.6,
      ]);
    }
    paths.push({ points, accent: echo === 1 });
  }

  return fitToUnit(paths, 0.08);
}

const GENERATORS = [genLattice, genNetwork, genSignal] as const;

type PixelPath = { points: Pt[]; accent: boolean; length: number };

function toPixelPaths(paths: Path[], width: number, height: number, rng: Rng): PixelPath[] {
  const side = Math.min(width, height);
  const padX = (width - side) / 2;
  const padY = (height - side) / 2;

  return paths.map((path) => {
    const phase = rng() * 10;
    const out: Pt[] = [];
    let cumulative = 0;

    for (let i = 0; i < path.points.length - 1; i += 1) {
      const [x1, y1] = path.points[i];
      const [x2, y2] = path.points[i + 1];
      const ax = padX + x1 * side;
      const ay = padY + y1 * side;
      const bx = padX + x2 * side;
      const by = padY + y2 * side;
      const dist = Math.hypot(bx - ax, by - ay);
      const steps = Math.max(1, Math.floor(dist / 16));
      const nx = dist === 0 ? 0 : -(by - ay) / dist;
      const ny = dist === 0 ? 0 : (bx - ax) / dist;

      for (let s = i === 0 ? 0 : 1; s <= steps; s += 1) {
        const t = s / steps;
        cumulative += dist / steps;
        // plotter wobble: two sine bands along the stroke
        const wobble =
          Math.sin(cumulative * 0.09 + phase) * 0.9 + Math.sin(cumulative * 0.031 + phase * 1.7) * 0.5;
        out.push([ax + (bx - ax) * t + nx * wobble, ay + (by - ay) * t + ny * wobble]);
      }
    }

    let length = 0;
    for (let i = 0; i < out.length - 1; i += 1) {
      length += Math.hypot(out[i + 1][0] - out[i][0], out[i + 1][1] - out[i][1]);
    }
    return { points: out, accent: path.accent, length };
  });
}

function randomSeed() {
  return Math.floor(Math.random() * 0x1000000) >>> 0;
}

export function PlotterMark() {
  const [seed, setSeed] = useState(randomSeed);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  const structureIndex = seed % GENERATORS.length;

  const draw = useCallback(
    (animate: boolean) => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const { width, height } = container.getBoundingClientRect();
      if (width === 0 || height === 0) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.scale(dpr, dpr);

      const styles = getComputedStyle(document.documentElement);
      const ink = styles.getPropertyValue("--foreground").trim() || "#191714";
      const accent = styles.getPropertyValue("--accent").trim() || "#d5002f";

      const rng = mulberry32(seed);
      const unitPaths = GENERATORS[structureIndex](rng);
      const pixelPaths = toPixelPaths(unitPaths, width, height, rng);
      const totalLength = pixelPaths.reduce((sum, p) => sum + p.length, 0);

      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const duration = Math.min(1600, Math.max(900, totalLength / 1.6));

      const render = (revealLength: number) => {
        ctx.clearRect(0, 0, width, height);
        ctx.lineWidth = 1.4;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        let budget = revealLength;
        for (const path of pixelPaths) {
          if (budget <= 0) break;
          ctx.strokeStyle = path.accent ? accent : ink;
          ctx.globalAlpha = path.accent ? 0.95 : 0.88;
          ctx.beginPath();
          ctx.moveTo(path.points[0][0], path.points[0][1]);

          if (budget >= path.length) {
            for (let i = 1; i < path.points.length; i += 1) {
              ctx.lineTo(path.points[i][0], path.points[i][1]);
            }
            budget -= path.length;
          } else {
            let remaining = budget;
            for (let i = 1; i < path.points.length && remaining > 0; i += 1) {
              const [x1, y1] = path.points[i - 1];
              const [x2, y2] = path.points[i];
              const segment = Math.hypot(x2 - x1, y2 - y1);
              if (segment <= remaining) {
                ctx.lineTo(x2, y2);
                remaining -= segment;
              } else {
                const t = remaining / segment;
                ctx.lineTo(x1 + (x2 - x1) * t, y1 + (y2 - y1) * t);
                remaining = 0;
              }
            }
            budget = 0;
          }
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      };

      cancelAnimationFrame(rafRef.current);
      if (!animate || reducedMotion) {
        render(totalLength);
        return;
      }

      const start = performance.now();
      const tick = (now: number) => {
        const progress = Math.min(1, (now - start) / duration);
        // plotter easing: fast start, settled finish
        const eased = 1 - Math.pow(1 - progress, 2.2);
        render(totalLength * eased);
        if (progress < 1) rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    },
    [seed, structureIndex],
  );

  useEffect(() => {
    draw(true);
    const onResize = () => draw(false);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(rafRef.current);
    };
  }, [draw]);

  return (
    <figure className="flex h-full flex-col">
      <div
        ref={containerRef}
        className="relative min-h-0 flex-1 border border-border bg-card"
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full"
          role="img"
          aria-label={`Generative ${STRUCTURE_NAMES[structureIndex].toLowerCase()} drawing, seed ${seed.toString(16)}`}
        />
      </div>
      <figcaption className="flex items-center justify-between gap-3 border-x border-b border-border bg-card px-3 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
        <span>
          Fig. {String(structureIndex + 1).padStart(2, "0")} — {STRUCTURE_NAMES[structureIndex]} ·
          seed {seed.toString(16).toUpperCase().padStart(6, "0")}
        </span>
        <button
          type="button"
          onClick={() => setSeed(randomSeed())}
          className="inline-flex shrink-0 items-center gap-1.5 text-foreground transition-colors hover:text-accent"
          title="Draw a new structure"
        >
          <RefreshCw className="h-3 w-3" />
          Redraw
        </button>
      </figcaption>
    </figure>
  );
}
