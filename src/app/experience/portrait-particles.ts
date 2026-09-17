import portraitSource from "../../../docs/reviews/2026-09-07-design-reset/portrait-reference.png";

export { portraitSource };
// This crop deliberately stops above the navigation baked into the concept.
// The source is an approved 2D likeness. Its shallow relief is art-directed,
// not a claim to reconstruct Stephen's actual facial geometry.
export const PORTRAIT_CROP = { x: 440, y: 8, width: 700, height: 650 };
export const clamp = (value: number) => Math.min(1, Math.max(0, value));
export const smooth = (start: number, end: number, value: number) => {
  const t = clamp((value - start) / (end - start));
  return t * t * (3 - 2 * t);
};

export const portraitFraming = (width: number, height: number) => {
  const aspect = width / Math.max(1, height);
  const viewHeight = Math.tan(Math.PI / 9) * 12;
  const scale = Math.min(viewHeight * (aspect < 0.8 ? 0.6 : 0.95) / 4.6, viewHeight * aspect * 0.91 / (4.6 * 700 / 650 * 0.7));
  return {
    scale,
    pixelHeight: scale * 4.6 / viewHeight * height,
    pixelOffset: (aspect > 1.1 ? 0.32 : -0.7 * scale) / viewHeight * height,
  };
};

// The portrait holds for the first stretch of scrolling so the visitor meets
// a whole face before anything moves. Release then spans the rest of the hero.
export const scrollState = (y: number, height: number, workTop: number, endTop: number) => ({
  // The window can never invert, so a layout that has not measured yet
  // (or a very short one) still reports an intact portrait at the top.
  release: smooth(height * 0.16, Math.max(workTop - height * 0.25, height * 0.17), y),
  travel: smooth(workTop - height * 0.55, endTop - height * 0.7, y),
  ending: smooth(endTop - height * 0.7, endTop + height * 0.12, y),
  intro: 1 - smooth(height * 0.06, height * 0.45, y),
});

const random = (seed: number) => {
  const n = Math.sin(seed * 127.1 + 311.7) * 43758.5453123;
  return n - Math.floor(n);
};

// Separation, surface atomisation and spatial drift overlap deliberately. This
// avoids a finished pillar animation handing off to a second abrupt effect.
// Disperse stays linear here; the shader eases each point's own flight so the
// field interpolation is spread through the middle and late passage.
export const portraitPhases = (progress: number) => ({
  separate: smooth(0.05, 0.82, progress),
  atomise: smooth(0.12, 1, progress),
  disperse: clamp((progress - 0.28) / 0.72),
});

export const isPortraitSurface = (target: EventTarget | null) => target instanceof HTMLElement
  && Boolean(target.closest('.particle-hero'))
  && !target.closest('a, button, input, textarea, select, [role="dialog"], [contenteditable]');

export const acceptsPortraitPress = (pointerType: string, button: number, release: number, paused: boolean) =>
  pointerType === 'mouse' && button === 0 && release < 0.18 && !paused;

export const PORTRAIT_PILLARS = 13;
// Width, in source u, of the feathered seam either side of a pillar boundary.
// Points inside it blend towards the neighbouring pillar's depth, so a seam
// stretches like a sheared surface instead of reading as a knife cut.
export const PILLAR_FEATHER = 0.012;

const pillarDepthAt = (pillar: number) =>
  0.5 + Math.sin((Math.min(PORTRAIT_PILLARS - 1, Math.max(0, pillar)) + 1) * 2.17) * 0.33;

// Every point in one vertical strip shares its structural depth. The strip
// moves as one pillar before individual points begin shedding from its surface.
export const portraitPillarDepth = (u: number) =>
  pillarDepthAt(Math.floor(clamp(u) * PORTRAIT_PILLARS));

// The rigid pillar depth, feathered across each boundary.
export const portraitSurfaceDepth = (u: number) => {
  const pillar = Math.min(PORTRAIT_PILLARS - 1, Math.max(0, Math.floor(clamp(u) * PORTRAIT_PILLARS)));
  const own = pillarDepthAt(pillar);
  const fromLeft = u - pillar / PORTRAIT_PILLARS;
  const fromRight = (pillar + 1) / PORTRAIT_PILLARS - u;
  if (pillar > 0 && fromLeft < PILLAR_FEATHER) {
    const weight = 0.5 - (fromLeft / PILLAR_FEATHER) * 0.5;
    return own + (pillarDepthAt(pillar - 1) - own) * weight;
  }
  if (pillar < PORTRAIT_PILLARS - 1 && fromRight < PILLAR_FEATHER) {
    const weight = 0.5 - (fromRight / PILLAR_FEATHER) * 0.5;
    return own + (pillarDepthAt(pillar + 1) - own) * weight;
  }
  return own;
};

export const samplePortrait = (pixels: Uint8ClampedArray, width: number, height: number) => {
  const positions: number[] = [];
  const colours: number[] = [];
  const seeds: number[] = [];
  const depths: number[] = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const light = (pixels[i] * 0.2126 + pixels[i + 1] * 0.7152 + pixels[i + 2] * 0.0722) / 255;
      const u = x / (width - 1);
      const v = y / (height - 1);
      const edge = smooth(0, 0.035, u) * (1 - smooth(0.965, 1, u)) * (1 - smooth(0.85, 1, v));
      if (light < 0.027 || edge < 0.005 || pixels[i + 3] === 0) continue;
      const seed = y * width + x;
      const r = random(seed);
      // Jitter is less than half a source pixel; tonal detail stays resolved.
      const px = (u - 0.5 + (r - 0.5) / width * 0.65) * (700 / 650) * 4.6;
      const py = (0.5 - v + (random(seed + 2) - 0.5) / height * 0.65) * 4.6;
      positions.push(px, py, 0);
      colours.push(
        Math.pow(pixels[i] / 255, 2.2) * edge,
        Math.pow(pixels[i + 1] / 255, 2.2) * edge,
        Math.pow(pixels[i + 2] / 255, 2.2) * edge,
      );
      seeds.push(r, random(seed + 17), random(seed + 71), u);
      depths.push(portraitSurfaceDepth(u));
    }
  }
  return { positions: new Float32Array(positions), colours: new Float32Array(colours), seeds: new Float32Array(seeds), depths: new Float32Array(depths) };
};

export type ParticleMotion = {
  release: number;
  travel: number;
  ending: number;
  pointerX: number;
  pointerY: number;
  velocity: number;
  paused: boolean;
  pressed?: boolean;
  pointerActive?: boolean;
  invalidate?: () => void;
};

export const vertexShader = /* glsl */ `
  attribute vec3 aColour;
  attribute vec4 aSeed;
  attribute float aDepth;
  uniform float uRelease;
  uniform float uSeparate;
  uniform float uAtomise;
  uniform float uDisperse;
  uniform float uTravel;
  uniform float uEnding;
  uniform float uTime;
  uniform float uDpr;
  uniform float uScale;
  uniform float uAspect;
  uniform float uPixel;
  uniform vec2 uPointer;
  uniform float uPress;
  uniform float uHover;
  varying vec3 vColour;
  varying float vOpacity;
  varying float vBlur;
  const float TAU = 6.28318530718;
  const vec3 LUMA = vec3(0.2126, 0.7152, 0.0722);
  float hash2(vec2 value) {
    return fract(sin(dot(value, vec2(12.9898, 78.233))) * 43758.5453);
  }
  vec3 rotateY(vec3 value, float angle) {
    float c = cos(angle);
    float s = sin(angle);
    return vec3(c * value.x + s * value.z, value.y, -s * value.x + c * value.z);
  }
  void main() {
    float r = aSeed.x;
    float s = aSeed.y;
    float t = aSeed.z;
    float u = aSeed.w;
    float angle = s * TAU;
    // The dissolve is a wave, not a lottery: the back of the head loosens
    // first, the crown before the neck, and the features hold longest. A
    // low-frequency ripple and per-point randomness keep the front from ever
    // travelling as one straight edge along a pillar boundary.
    float order = 0.02 + smoothstep(0.22, 1.0, u) * 0.42 + s * 0.2
      + (0.5 - position.y / 4.6) * 0.08
      + sin(position.y * 3.1 + u * 11.0) * 0.035
      + (1.0 - aDepth) * 0.04;
    float atomise = smoothstep(order, order + 0.26, uAtomise);
    float flight = atomise * smoothstep(0.0, 1.0, uDisperse);
    vec3 p = position * uScale;
    p.x += uAspect > 1.1 ? 0.32 : -0.7 * uScale;
    p.y += 0.06;
    float baseYaw = -0.13;
    vec3 original = rotateY(p, baseYaw);
    // The source is already a tilted object. Each broad vertical strip moves
    // along depth as one rigid column with a gentle continuous fan across the
    // head, so the seams open from the side without slicing the face.
    vec3 pillar = p;
    pillar.x += (u - 0.64) * 0.14 * uScale * uSeparate;
    pillar.z += (aDepth - 0.5) * 3.4 * uScale * uSeparate;
    vec3 layered = rotateY(pillar, baseYaw - uSeparate * 0.28);
    // Lift-off: a released point rises and eases off the surface, swaying
    // slowly, so the surface breathes apart instead of bursting.
    vec3 sway = vec3(
      sin(uTime * 0.5 + s * TAU),
      cos(uTime * 0.37 + r * TAU),
      sin(uTime * 0.43 + t * TAU)
    ) * 0.035;
    vec3 liftDirection = normalize(vec3((r - 0.5) * 0.5, 0.55 + s * 0.4, 0.35 + (t - 0.5) * 0.5));
    vec3 lifted = layered + (liftDirection * (0.04 + t * 0.24) + sway * atomise) * uScale * atomise;
    // A curved route carries each ember up and out before it reaches its
    // place in the field, so neighbouring detail stretches before it dissolves.
    vec3 control = lifted + vec3((r - 0.5) * 1.6, 0.9 + s * 0.8, 0.6 + (t - 0.5) * 0.8) * uScale;
    // The field is stratified: a few large soft points close to the lens, a
    // body of fine points in the middle distance and dust far behind.
    float near = 1.0 - smoothstep(0.0, 0.07, t);
    float far = smoothstep(0.3, 0.6, t);
    float scatter = hash2(vec2(r, s));
    vec3 field = vec3(
      (r - 0.5) * 14.0 - 0.6,
      (s - 0.5) * 5.0 + sin(scatter * TAU + far * 2.0) * 0.8,
      mix(mix(0.6, 2.9, near), -6.0, far) + (hash2(vec2(s, t)) - 0.5) * 1.5
    );
    field.y += sin(angle + uTime * 0.09) * 0.15;
    field.x += uTravel * (1.4 + t * 1.2);
    field.z += uTravel * 0.8;
    float retained = 1.0 - flight;
    p = retained * retained * lifted
      + 2.0 * retained * flight * control
      + flight * flight * field;
    // The closing form is a tilted, diffuse arc with space for readable type.
    float arc = r * TAU;
    float radius = 2.2 + pow(s, 2.0) * 1.4;
    vec3 ending = vec3(
      cos(arc) * radius * min(1.65, uAspect * 0.92),
      sin(arc) * radius * 0.56,
      sin(arc) * 1.3 + (t - 0.5) * 1.25 - 0.8
    );
    ending.y += sin(arc * 3.0 + uTime * 0.1) * 0.11;
    p = mix(p, ending, uEnding);
    // Only a held press parts the points. Passive hover changes colour only.
    p.x += uPointer.x * (p.z + 0.3) * 0.11 * flight;
    p.y += uPointer.y * (p.z + 0.3) * 0.08 * flight;
    vec2 plane = vec2(2.18382 * uAspect, 2.18382) * ((6.0 - original.z) / 6.0);
    float interactive = 1.0 - smoothstep(0.08, 0.4, uRelease);
    vec2 away = original.xy - uPointer * plane;
    float influence = 1.0 - smoothstep(0.0, 0.62 * uScale, length(away * vec2(0.82, 1.15)));
    float pressure = influence * uPress * interactive;
    p.xy += normalize(away + vec2(0.001)) * pressure * 0.055 * uScale;
    p.z -= pressure * 0.08 * uScale;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float depth = -mv.z;
    float focus = abs(depth - 6.0);
    // Most released points are vapour: they lift, soften and fade within the
    // first half of their flight. A minority survive as embers that carry the
    // portrait's light into the field and the closing arc.
    float survivor = smoothstep(0.86, 0.9, fract(r * 97.3 + s * 31.1));
    float vapour = (1.0 - survivor) * (1.0 - smoothstep(0.2, 0.9, atomise)) * (1.0 - smoothstep(0.03, 0.55, flight));
    float loosened = smoothstep(0.0, 0.6, atomise);
    float settled = flight * flight;
    float opticalSpread = loosened * 0.2 + settled * 0.8;
    vBlur = smoothstep(1.35, 4.4, focus) * max(opticalSpread, uSeparate * 0.16);
    vBlur = max(vBlur, (1.0 - survivor) * loosened * 0.55 + near * settled * 0.7);
    float emberAlpha = survivor * mix(0.72, 0.42, near) * (0.4 + r * 0.6) * mix(1.0, 0.55, far);
    float releasedAlpha = max(emberAlpha, vapour * (0.9 - loosened * 0.3));
    vOpacity = mix(0.97, releasedAlpha, loosened) * smoothstep(0.3, 1.5, depth);
    vOpacity *= mix(1.0, 0.46, uEnding);
    float light = dot(aColour, LUMA);
    vec3 silver = vec3(0.66, 0.69, 0.71);
    vec3 warm = vec3(0.86, 0.79, 0.68);
    vec3 ember = mix(silver, warm, near * 0.6) * (0.42 + light * 0.9 + r * 0.25);
    vColour = mix(aColour * 1.08, ember, smoothstep(0.1, 0.9, flight));
    float hover = exp(-pow(length(away * vec2(0.82, 1.15)) / (0.88 * uScale), 2.0) * 1.65) * uHover * interactive;
    vec3 warmRed = vec3(light * 1.08, light * 0.19, light * 0.13);
    vColour = mix(vColour, warmRed, hover * (0.3 + uPress * 0.18));
    float portraitSize = uPixel * 6.0 / max(1.0, depth) + vBlur * 3.0;
    float emberSize = mix(mix(0.022, 0.012, far), 0.11, near) * 520.0 / max(0.5, depth);
    float vapourSize = portraitSize * (1.0 + loosened * 0.7);
    float releasedSize = mix(vapourSize, emberSize + vBlur * 8.0, survivor);
    gl_PointSize = min(42.0, mix(portraitSize, releasedSize, smoothstep(0.0, 1.0, max(loosened * 0.5, flight)))) * uDpr;
    gl_Position = projectionMatrix * mv;
  }
`;

export const fragmentShader = /* glsl */ `
  varying vec3 vColour;
  varying float vOpacity;
  varying float vBlur;
  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    if (d > 1.0) discard;
    float sharp = 1.0 - smoothstep(0.65, 1.0, d);
    float soft = exp(-d * d * 5.0) * 0.5;
    float alpha = mix(sharp, soft, vBlur) * vOpacity;
    #ifdef CORE_PASS
      // Solid in-focus centres write depth; soft optical halos remain blended.
      if (alpha < 0.3 || d > 0.55 || vBlur > 0.35) discard;
      gl_FragColor = vec4(vColour, 1.0);
    #else
      gl_FragColor = vec4(vColour, alpha);
    #endif
    #include <colorspace_fragment>
  }
`;
