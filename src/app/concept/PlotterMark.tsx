import { useCallback, useEffect, useRef, useState } from "react";
import { RefreshCw } from "lucide-react";

/**
 * A seeded, plotter-style line drawing that sketches itself on mount.
 * Eight structure families, each with wide internal variance, so repeat
 * figures are effectively never seen. Pure canvas 2D, draws once, then idles.
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

function ring(cx: number, cy: number, radius: number, segments = 14): Pt[] {
  const pts: Pt[] = [];
  for (let i = 0; i <= segments; i += 1) {
    const a = (i / segments) * Math.PI * 2;
    pts.push([cx + Math.cos(a) * radius, cy + Math.sin(a) * radius]);
  }
  return pts;
}

/** Isometric scaffold with seeded density, squash, and dropout. */
function genLattice(r: Rng): Path[] {
  const paths: Path[] = [];
  const n = 2 + Math.floor(r() * 3);
  const keep = 0.42 + r() * 0.32;
  const squash = 0.36 + r() * 0.34;
  const iso = (x: number, y: number, z: number): Pt => [
    (x - z) * 0.5,
    (x + z) * 0.25 - y * squash,
  ];
  const strut = (a: Pt, b: Pt) => paths.push({ points: [a, b], accent: r() < 0.12 });

  for (let x = 0; x <= n; x += 1)
    for (let y = 0; y <= n; y += 1)
      for (let z = 0; z <= n; z += 1) {
        if (x < n && r() < keep) strut(iso(x, y, z), iso(x + 1, y, z));
        if (y < n && r() < keep) strut(iso(x, y, z), iso(x, y + 1, z));
        if (z < n && r() < keep) strut(iso(x, y, z), iso(x, y, z + 1));
      }

  return fitToUnit(paths);
}

/** Node graph: spaced points linked to nearest peers, with node rings. */
function genNetwork(r: Rng): Path[] {
  const paths: Path[] = [];
  const nodes: Pt[] = [];
  const count = 8 + Math.floor(r() * 10);
  const minGap = 0.1 + r() * 0.08;
  const links = 2 + Math.floor(r() * 2);

  let guard = 0;
  while (nodes.length < count && guard < 600) {
    guard += 1;
    const candidate: Pt = [0.08 + r() * 0.84, 0.08 + r() * 0.84];
    if (nodes.every((p) => Math.hypot(p[0] - candidate[0], p[1] - candidate[1]) > minGap)) {
      nodes.push(candidate);
    }
  }

  const linked = new Set<string>();
  nodes.forEach((from, i) => {
    nodes
      .map((to, j) => ({ j, d: Math.hypot(from[0] - to[0], from[1] - to[1]) }))
      .filter((e) => e.j !== i)
      .sort((a, b) => a.d - b.d)
      .slice(0, links)
      .forEach(({ j }) => {
        const key = i < j ? `${i}-${j}` : `${j}-${i}`;
        if (linked.has(key)) return;
        linked.add(key);
        paths.push({ points: [from, nodes[j]], accent: r() < 0.14 });
      });
  });

  nodes.forEach(([cx, cy]) => {
    paths.push({ points: ring(cx, cy, 0.014 + r() * 0.02, 12), accent: r() < 0.18 });
  });

  return fitToUnit(paths);
}

/** Layered lissajous ribbon with variable frequency, phase, and echo count. */
function genSignal(r: Rng): Path[] {
  const paths: Path[] = [];
  const a = 1 + Math.floor(r() * 6);
  let b = 1 + Math.floor(r() * 6);
  if (b === a) b += 1;
  const phase = r() * Math.PI * 2;
  const echoes = 2 + Math.floor(r() * 4);
  const spread = 0.012 + r() * 0.03;

  for (let echo = 0; echo < echoes; echo += 1) {
    const offset = (echo - (echoes - 1) / 2) * spread;
    const points: Pt[] = [];
    for (let i = 0; i <= 420; i += 1) {
      const t = (i / 420) * Math.PI * 2;
      points.push([
        0.5 + Math.sin(a * t + phase) * 0.38 + offset,
        0.5 + Math.sin(b * t) * 0.38 + offset * 0.6,
      ]);
    }
    paths.push({ points, accent: echo === Math.floor(echoes / 2) });
  }

  return fitToUnit(paths, 0.08);
}

/** Topographic contours: nested closed loops warped by harmonic noise. */
function genContour(r: Rng): Path[] {
  const paths: Path[] = [];
  const rings = 5 + Math.floor(r() * 7);
  const w1 = 2 + Math.floor(r() * 4);
  const w2 = 3 + Math.floor(r() * 5);
  const amp1 = 0.04 + r() * 0.09;
  const amp2 = 0.02 + r() * 0.06;
  const phase = r() * Math.PI * 2;
  const accentRing = Math.floor(r() * rings);

  for (let k = 0; k < rings; k += 1) {
    const base = 0.08 + (k / rings) * 0.4;
    const points: Pt[] = [];
    for (let i = 0; i <= 120; i += 1) {
      const a = (i / 120) * Math.PI * 2;
      const wobble =
        Math.sin(a * w1 + phase + k * 0.35) * amp1 * (0.4 + k / rings) +
        Math.sin(a * w2 - phase * 0.7) * amp2;
      const radius = base + wobble;
      points.push([0.5 + Math.cos(a) * radius, 0.5 + Math.sin(a) * radius * 0.92]);
    }
    paths.push({ points, accent: k === accentRing });
  }

  return fitToUnit(paths, 0.07);
}

/** Woven strips: interleaved horizontal and vertical bands with gaps. */
function genWeave(r: Rng): Path[] {
  const paths: Path[] = [];
  const bands = 5 + Math.floor(r() * 7);
  const gap = 0.03 + r() * 0.05;
  const jitter = r() * 0.02;

  for (let i = 0; i < bands; i += 1) {
    const t = bands > 1 ? i / (bands - 1) : 0.5;
    const y = 0.08 + t * 0.84 + (r() - 0.5) * jitter;
    const segments = 2 + Math.floor(r() * 3);
    for (let s = 0; s < segments; s += 1) {
      const from = 0.08 + (s / segments) * 0.84 + gap * 0.5;
      const to = 0.08 + ((s + 1) / segments) * 0.84 - gap * 0.5;
      paths.push({ points: [[from, y], [to, y]], accent: r() < 0.1 });
    }
  }

  for (let i = 0; i < bands; i += 1) {
    const t = bands > 1 ? i / (bands - 1) : 0.5;
    const x = 0.08 + t * 0.84 + (r() - 0.5) * jitter;
    const segments = 2 + Math.floor(r() * 3);
    for (let s = 0; s < segments; s += 1) {
      const from = 0.08 + (s / segments) * 0.84 + gap * 0.5;
      const to = 0.08 + ((s + 1) / segments) * 0.84 - gap * 0.5;
      paths.push({ points: [[x, from], [x, to]], accent: r() < 0.1 });
    }
  }

  return fitToUnit(paths, 0.06);
}

/** Radial burst: spokes at varying lengths plus partial arcs. */
function genRadial(r: Rng): Path[] {
  const paths: Path[] = [];
  const spokes = 12 + Math.floor(r() * 26);
  const inner = 0.04 + r() * 0.1;
  const outer = 0.3 + r() * 0.15;
  const arcs = 2 + Math.floor(r() * 4);

  for (let i = 0; i < spokes; i += 1) {
    const a = (i / spokes) * Math.PI * 2;
    const len = inner + r() * (outer - inner);
    paths.push({
      points: [
        [0.5 + Math.cos(a) * inner, 0.5 + Math.sin(a) * inner],
        [0.5 + Math.cos(a) * (inner + len), 0.5 + Math.sin(a) * (inner + len)],
      ],
      accent: r() < 0.12,
    });
  }

  for (let k = 0; k < arcs; k += 1) {
    const radius = inner + (0.1 + r() * 0.32);
    const start = r() * Math.PI * 2;
    const sweep = (0.3 + r() * 1.4) * Math.PI;
    const points: Pt[] = [];
    for (let i = 0; i <= 60; i += 1) {
      const a = start + (i / 60) * sweep;
      points.push([0.5 + Math.cos(a) * radius, 0.5 + Math.sin(a) * radius]);
    }
    paths.push({ points, accent: r() < 0.3 });
  }

  return fitToUnit(paths, 0.07);
}

/** Flow field: streamlines advected through a seeded sine field. */
function genFlow(r: Rng): Path[] {
  const paths: Path[] = [];
  const lines = 10 + Math.floor(r() * 14);
  const fx = 1.5 + r() * 4;
  const fy = 1.5 + r() * 4;
  const phase = r() * Math.PI * 2;
  const step = 0.012 + r() * 0.008;
  const steps = 40 + Math.floor(r() * 50);

  for (let i = 0; i < lines; i += 1) {
    let x = 0.06 + r() * 0.88;
    let y = 0.06 + r() * 0.88;
    const points: Pt[] = [[x, y]];
    for (let s = 0; s < steps; s += 1) {
      const angle =
        Math.sin(x * fx + phase) * Math.PI + Math.cos(y * fy - phase * 0.5) * Math.PI;
      x += Math.cos(angle) * step;
      y += Math.sin(angle) * step;
      if (x < 0.02 || x > 0.98 || y < 0.02 || y > 0.98) break;
      points.push([x, y]);
    }
    if (points.length > 3) paths.push({ points, accent: r() < 0.12 });
  }

  return fitToUnit(paths, 0.06);
}

/** Orbit stack: concentric ellipses at varying tilt around a small core. */
function genOrbits(r: Rng): Path[] {
  const paths: Path[] = [];
  const count = 3 + Math.floor(r() * 6);
  const tiltSpread = 0.4 + r() * 1.6;

  paths.push({ points: ring(0.5, 0.5, 0.03 + r() * 0.04, 16), accent: true });

  for (let k = 0; k < count; k += 1) {
    const radius = 0.1 + ((k + 1) / count) * 0.32;
    const squash = 0.2 + r() * 0.75;
    const tilt = (r() - 0.5) * tiltSpread;
    const cos = Math.cos(tilt);
    const sin = Math.sin(tilt);
    const points: Pt[] = [];
    for (let i = 0; i <= 90; i += 1) {
      const a = (i / 90) * Math.PI * 2;
      const px = Math.cos(a) * radius;
      const py = Math.sin(a) * radius * squash;
      points.push([0.5 + px * cos - py * sin, 0.5 + px * sin + py * cos]);
    }
    paths.push({ points, accent: r() < 0.16 });
  }

  return fitToUnit(paths, 0.07);
}

const GENERATORS: Array<(r: Rng) => Path[]> = [
  genLattice,
  genNetwork,
  genSignal,
  genContour,
  genWeave,
  genRadial,
  genFlow,
  genOrbits,
];

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

type Drawing = { seed: number; family: number };

function nextDrawing(previousFamily?: number): Drawing {
  let family = Math.floor(Math.random() * GENERATORS.length);
  // never draw the same family twice in a row
  while (GENERATORS.length > 1 && family === previousFamily) {
    family = Math.floor(Math.random() * GENERATORS.length);
  }
  return { seed: randomSeed(), family };
}

export function PlotterMark() {
  const [drawing, setDrawing] = useState<Drawing>(() => nextDrawing());
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  const { seed, family } = drawing;

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
      const unitPaths = GENERATORS[family](rng);
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
    [family, seed],
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

  const seedLabel = seed.toString(16).toUpperCase().padStart(6, "0");

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
          aria-label={`Generative line drawing, seed ${seedLabel}`}
        />
      </div>
      <figcaption className="flex items-center justify-between gap-3 border-x border-b border-border bg-card px-3 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
        <span>Generative drawing / seed {seedLabel}</span>
        <button
          type="button"
          onClick={() => setDrawing((prev) => nextDrawing(prev.family))}
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
