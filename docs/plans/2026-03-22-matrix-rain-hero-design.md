# Matrix Rain Hero — Design Document
_2026-03-22 (revised: two-layer approach)_

## Overview

Replace `CyberHero.tsx` with a full-screen Three.js animation using **two independent particle layers**:

1. **BackgroundRain** — sparse, cheap, classic Matrix-style red rain covering the full screen with no SDF evaluation.
2. **ForegroundShape** — dense, SDF-driven particles scoped to the shape bounding box that reveal a morphing 3D form purely through surface-following rain flow.

Text overlay (name, role, headline, skills grid) remains on top via CSS z-index, unchanged.

## Core Mechanic

Both layers share the same fall mechanic: each particle belongs to an (X, Z) column and advances downward at a constant Y velocity, looping back to the top when it exits the bottom.

The foreground layer additionally evaluates a blended SDF each frame in the vertex shader. Particles whose column passes through the SDF surface are projected outward onto it — the 3D form becomes readable through the deflection pattern. Particles outside the shape have `gl_PointSize = 0` and are invisible.

## Shape Sequence

One full cycle, then repeat:

| Order | Shape | Skill represented |
|---|---|---|
| 0 | Procedural low-poly head (cranium + jaw ellipsoids + neck cylinder) | Opening / reset state |
| 1 | C4D-style transform gizmo (three axis capsules + cone tips) | 3D Design |
| 2 | Figma logo icon extruded (overlapping circles + square slab) | Figma |
| 3 | Paintbrush (cylinder shaft + ferrule band + tapered tip) | Graphic Design |
| 4 | Musical quaver note (oval body + stem + flag) | Motion Graphics |
| 5 | Brain (low-poly hemisphere with groove displacement) | AI Workflows |
| 6 | `</>` code brackets (extruded flat slab) | Frontend Web Dev |

## Animation Timing

| Phase | Duration | Notes |
|---|---|---|
| Rain settling into head | 8s | Foreground particles fill in as deflection builds |
| Hold on head | 4s | Full head readable in rain |
| SDF morph to next shape | 3s | Lerp between SDF functions; rain adapts continuously |
| Hold on skill shape | 5s | Skill label fades in below shape |
| SDF morph to next | 3s | — |
| After all 6 skills: morph back to head | 3s | — |
| Repeat | — | Total ~55s per cycle |

## Technical Architecture

### Component Structure

Single file `src/app/components/MatrixRainHero.tsx`. Contains:
- `buildCharAtlas()` — generates 512×512 canvas texture (8×8 grid, 64 glyphs)
- `<BackgroundRain />` — Three.js Points, background layer
- `<ForegroundShape />` — Three.js Points, foreground SDF layer
- `<MatrixRainHero />` — root component, Canvas + HTML overlay

### Background Layer — BackgroundRain

**~2,000 particles** on a coarse column grid spanning the full viewport.

**Vertex shader responsibilities:**
1. Advance Y downward at per-column speed (time uniform)
2. Loop Y back to top when past `uLoopH`
3. Output world position — no SDF evaluation
4. Speed-head effect: leading char brighter (compare Y phase to column front)

**Visual properties:**
- Colour: `#ff003c` at ~40% brightness
- Point size: 8px base
- Character cycle: slow (~2s per glyph change)
- Grid: coarse (~50×50 columns over 18×18 unit field)

### Foreground Layer — ForegroundShape

**~8,000 particles** in a dense column grid scoped to ±3 units (X and Z) around the shape centre.

**Vertex shader responsibilities:**
1. Advance Y downward at per-column speed
2. Loop Y within shape bounding height
3. Evaluate blended SDF: `mix(sdfA(p), sdfB(p), uMorphT)` where A/B are shape indices
4. Surface branch (sdf ≤ 0): project particle outward using normalised SDF gradient, render at 100% brightness
5. Shell branch (sdf ≤ 0.15): render at 60% brightness (halo)
6. Outside branch: `gl_PointSize = 0` — invisible, zero GPU fragment cost

**Visual properties:**
- Colour: `#ff003c` at full brightness on surface
- Point size: 11px on surface
- Character cycle: fast (~0.4s per glyph change)
- Grid: dense (~90×90 columns over 6×6 unit field)

### SDF Library (GLSL, in foreground vertex shader)

All 7 shape functions carried over from current implementation:
- `sdHead(p)` — cranium + jaw ellipsoids + neck cylinder, smooth union
- `sdGizmo(p)` — three capsule axes + cone tips, hard union
- `sdFigma(p)` — three circles + square, extruded cylinders + box
- `sdPaintbrush(p)` — shaft capsule + ferrule cylinder + tapered tip
- `sdNote(p)` — tilted ellipsoid head + thin box stem + flag capsule
- `sdBrain(p)` — hemisphere + sinusoidal groove displacement
- `sdBrackets(p)` — flat box slab + two angle-bracket extrusions

Dispatch via `uShapeA` / `uShapeB` int uniforms; `uMorphT` (0→1) drives the blend.

### Character Atlas

Generated once at mount via offscreen `<canvas>`:
- 512×512px, 8×8 grid → 64 cells of 64×64px each
- 40 katakana + 24 ASCII symbols
- White on black; fragment shader uses red channel as alpha mask
- Exported as `THREE.CanvasTexture`
- Shared between both layers

### Visual Differentiation Summary

| Property | BackgroundRain | ForegroundShape |
|---|---|---|
| Particle count | ~2,000 | ~8,000 |
| Grid extent | 18×18 units (full screen) | 6×6 units (shape region) |
| SDF evaluation | None | Full blend of sdfA/sdfB |
| On-surface brightness | N/A (always ~40%) | 100% |
| Off-surface | Always visible (dim) | Invisible (size = 0) |
| Point size | 8px | 11px |
| Char cycle | ~2s | ~0.4s |

### Performance

- Background shader: trivial — no SDF, one texture sample per fragment
- Foreground shader: SDF evaluated only for foreground particles; off-surface particles exit at `gl_PointSize = 0` before fragment stage
- Both layers: typed `Float32Array` geometry attributes, zero JS per-frame raycasting
- Target: 60fps on mid-range hardware; particle counts tunable via constants

## Files Changed

| File | Action |
|---|---|
| `src/app/components/MatrixRainHero.tsx` | Full rewrite — two-layer architecture |
| `docs/plans/2026-03-22-matrix-rain-hero-design.md` | This file — updated design |

## Out of Scope

- Mobile particle count reduction (add later)
- Post-processing bloom via EffectComposer (deferred)
- Audio sync
