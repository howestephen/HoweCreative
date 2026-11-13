// The portrait is a depth-mapped point cloud that erodes into a flow field.
// The left half of PORTRAIT_POINTS_SOURCE is the approved 2D likeness, cropped
// exactly as PORTRAIT_CROP describes it; the right half is a per-pixel depth
// estimate written by scripts/build-portrait-depth.mjs. Every point carries
// its own relief, so the head shows real parallax when the lens moves.
// The depth map is a monocular estimate from the 2D reference. It is
// art-directed relief, not measured geometry or a claim to reconstruct
// Stephen's actual facial geometry.
//
// Everything a point does is a closed-form function of scroll and time: there
// is no simulation state, so the journey runs backwards exactly as it ran
// forwards and the head re-forms from the same dust at the end of the page.

// The static portrait shown without WebGL, with reduced motion and while the
// renderer starts. Served from public/ like the plate below.
export const portraitSource = "/portrait/portrait-reference-2x.webp";
export const portraitSource1x = "/portrait/portrait-reference-1x.webp";
// This crop deliberately stops above the navigation baked into the concept.
// It is measured in the 1x reference; the plate holds it at PLATE_SCALE.
export const PORTRAIT_CROP = { x: 440, y: 8, width: 700, height: 650 };
export const PLATE_SCALE = 2;
// Packed colour + depth plate, 2800x1300: colour on the left, depth on the
// right. Served from public/ so the sampler fetches one image, not two.
export const PORTRAIT_POINTS_SOURCE = "/portrait/portrait-source.webp";
// The hero's physical scroll range and the share of it the release occupies.
// The work heading reaches the bottom of the viewport at
// (HERO_HEIGHT - 1) / RELEASE_LENGTH = 0.75 of the release, once the head has
// stopped reading as a head. There is never a screen of particles alone.
export const HERO_HEIGHT = 2.2;
export const RELEASE_LENGTH = 1.6;
// World height of the plate, and the opening lens distance and field of view.
export const PLATE_HEIGHT = 4.6;
export const LENS_DISTANCE = 6;
export const LENS_FOV = 40;
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

// Release begins with the first scroll and stays linear across the hero. The
// scroll follower in PortraitExperience already damps input. Drift is the
// page travel in viewport heights: the released field moves with the page
// for as long as the page moves.
export const scrollState = (y: number, height: number, workTop: number, endTop: number) => {
  const releaseEnd = Math.max(height * RELEASE_LENGTH, 1);
  const endingStart = Math.max(releaseEnd, endTop - height * 0.7);
  return {
    release: clamp(y / releaseEnd),
    travel: smooth(Math.max(releaseEnd, workTop - height * 0.4), Math.max(releaseEnd + height, endTop), y),
    drift: Math.max(0, y) / Math.max(1, height),
    ending: smooth(endingStart, Math.max(endingStart + 1, endTop + height * 0.12), y),
    intro: 1 - smooth(height * 0.06, height * 0.45, y),
  };
};

const random = (seed: number) => {
  const n = Math.sin(seed * 127.1 + 311.7) * 43758.5453123;
  return n - Math.floor(n);
};

// The depth estimator puts the face in roughly the top two fifths of its
// range, so the raw grey is re-stretched before it becomes relief. Anything
// at or behind 0.45 flattens to the back plane; 1.0 is the nearest point.
export const portraitRelief = (raw: number) => clamp((raw - 0.45) / 0.55);

// The lens orbits the head and closes on it over the release, so the relief
// and the dust lifting towards the lens read as parallax; it returns to the
// opening eye as the page ends and the head re-forms. `yaw` is the orbit
// angle about the head, `distance` the lens distance from it.
export const portraitCamera = (release: number, aspect: number, ending = 0) => {
  const advance = smooth(0.02, 1, release) * (1 - smooth(0, 1, ending));
  const wide = aspect > 1.1;
  const yaw = advance * (wide ? 0.34 : 0.2);
  const distance = LENS_DISTANCE - advance * 1.15;
  return {
    x: Math.sin(yaw) * distance,
    y: -advance * 0.1,
    z: Math.cos(yaw) * distance,
    yaw,
    distance,
  };
};

export const isPortraitSurface = (target: EventTarget | null) => target instanceof HTMLElement
  && Boolean(target.closest('.particle-hero'))
  && !target.closest('a, button, input, textarea, select, [role="dialog"], [contenteditable]');

export const acceptsPortraitPress = (pointerType: string, button: number, release: number, paused: boolean) =>
  pointerType === 'mouse' && button === 0 && release < 0.18 && !paused;

// Match the sRGB plate, including its shadow toe. A plain power of 2.2
// crushed the neck's dark tones before the output pass converted back.
export const portraitLinearColour = (value: number) => value <= 0.04045
  ? value / 12.92
  : Math.pow((value + 0.055) / 1.055, 2.4);

export const samplePortrait = (pixels: Uint8ClampedArray, depthPixels: Uint8ClampedArray, width: number, height: number) => {
  // Two passes: count, then fill fixed buffers. At desktop density this is
  // over 300,000 points, too many to grow as plain arrays.
  const keep = new Uint8Array(width * height);
  let count = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const p = y * width + x;
      const i = p * 4;
      const light = ((pixels[i] ?? 0) * 0.2126 + (pixels[i + 1] ?? 0) * 0.7152 + (pixels[i + 2] ?? 0) * 0.0722) / 255;
      const u = x / (width - 1);
      const v = y / (height - 1);
      const edge = smooth(0, 0.035, u) * (1 - smooth(0.965, 1, u)) * (1 - smooth(0.85, 1, v));
      if (light < 0.027 || edge < 0.005 || (pixels[i + 3] ?? 0) === 0) continue;
      keep[p] = 1;
      count++;
    }
  }
  const positions = new Float32Array(count * 3);
  const colours = new Float32Array(count * 3);
  const seeds = new Float32Array(count * 4);
  const depths = new Float32Array(count);
  let n = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const seed = y * width + x;
      if (!keep[seed]) continue;
      const i = seed * 4;
      const u = x / (width - 1);
      const v = y / (height - 1);
      const edge = smooth(0, 0.035, u) * (1 - smooth(0.965, 1, u)) * (1 - smooth(0.85, 1, v));
      const r = random(seed);
      // Jitter is less than half a source pixel; tonal detail stays resolved.
      positions[n * 3] = (u - 0.5 + (r - 0.5) / width * 0.65) * (700 / 650) * PLATE_HEIGHT;
      positions[n * 3 + 1] = (0.5 - v + (random(seed + 2) - 0.5) / height * 0.65) * PLATE_HEIGHT;
      colours[n * 3] = portraitLinearColour((pixels[i] ?? 0) / 255) * edge;
      colours[n * 3 + 1] = portraitLinearColour((pixels[i + 1] ?? 0) / 255) * edge;
      colours[n * 3 + 2] = portraitLinearColour((pixels[i + 2] ?? 0) / 255) * edge;
      seeds[n * 4] = r;
      seeds[n * 4 + 1] = random(seed + 17);
      seeds[n * 4 + 2] = random(seed + 71);
      seeds[n * 4 + 3] = u;
      // Depth is read from the matching pixel of the depth half, never from
      // the portrait's own brightness: a bright cheek and a bright collar are
      // not at the same distance.
      depths[n] = portraitRelief((depthPixels[i] ?? 0) / 255);
      n++;
    }
  }
  return { positions, colours, seeds, depths };
};

export type ParticleMotion = {
  release: number;
  travel: number;
  drift?: number;
  ending: number;
  pointerX: number;
  pointerY: number;
  velocity: number;
  paused: boolean;
  pressed?: boolean;
  pointerActive?: boolean;
  invalidate?: () => void;
};

// When a point lets go. The erosion front crosses the plate from the back of
// the head to the face (u runs 0 at the left edge to 1 at the right), led by
// the far relief, and a low-frequency grain keeps it ragged, so the head
// comes apart in strands and never along a straight edge. `age` is how long
// ago, in release units, the front passed this point; it is zero while the
// point is still part of the head. A slow breath lets the loosest fringe lift
// and settle at rest. The ending takes the release back to zero, which walks
// every point home along the path it left by. Scalar inputs: u, aDepth,
// grain (-1..1), r, uRelease, uEnding, uTime, press. The block is also
// executed as JS by the regression test, so it stays free of vector types.
export const portraitAgeShader = /* glsl */ `
    float order = u * 0.9 + aDepth * 0.14 + grain * 0.10 + r * 0.06;
    float breath = 0.17 + 0.05 * sin(uTime * 0.45 + grain * 3.0);
    float released = uRelease * (1.0 - uEnding);
    float age = max(0.0, released * 1.62 + breath * (1.0 - uEnding * 0.6) - order - 0.07) + press * 0.22;
`;

// Where the page has taken a released point since. `total` is its age plus
// the page travel after the release has finished, so the field goes on
// dispersing as the page moves on; `rise` is the page travel since this
// point's own release (drift is 1.6 viewports per unit of release), so a
// point starts to climb from where it let go and never jumps. Both vanish
// with `loose`, so the ending still walks every point home; the rise also
// needs the release itself, so the fringe that only breathes at rest, or at
// the end of a long page, is never carried off. Scalar inputs: age, loose,
// order, uDrift, uRelease, uEnding.
export const portraitJourneyShader = /* glsl */ `
    float onward = max(0.0, uDrift - 1.6) * 1.5 * (1.0 - uEnding);
    float total = age + onward * loose;
    float letGo = clamp((order + 0.07) / 1.62, 0.0, 1.0) * 1.6;
    float rise = max(0.0, uDrift - letGo) * loose * smoothstep(0.0, 0.08, uRelease * (1.0 - uEnding));
`;

// How far a released point has travelled, and how far it has left the head
// behind. `reach` drives the flow-field walk: slow at lift-off, then quick.
// `spread` is the share of its own place in the wide field a point has taken
// up; `loose` is how far it has stopped being part of the photograph. The
// walk saturates, so a point far down the page is carried by the page and
// the field's own turning, not thrown about by every pixel of scroll. Scalar
// inputs: total, s. `loose` comes from the age block's own age.
export const portraitTravelShader = /* glsl */ `
    float walk = 1.5 * (1.0 - exp(-total / 1.5));
    float reach = walk * (0.3 + walk) * (0.55 + s * 0.9);
    float spread = smoothstep(0.45, 1.6, total);
`;

export const vertexShader = /* glsl */ `
  attribute vec3 aColour;
  attribute vec4 aSeed;
  attribute float aDepth;
  uniform float uRelease;
  uniform float uDrift;
  uniform float uEnding;
  uniform float uTime;
  uniform float uDpr;
  uniform float uScale;
  uniform float uAspect;
  uniform float uProj;
  uniform float uCell;
  uniform float uFocus;
  uniform float uAperture;
  uniform vec2 uPointer;
  uniform float uPress;
  uniform vec3 uHome;
  uniform float uHomeDim;
  varying vec3 vColour;
  varying float vOpacity;
  varying float vBlur;
  varying float vAdd;
  const float TAU = 6.28318530718;
  const vec3 LUMA = vec3(0.2126, 0.7152, 0.0722);
  // The wide field is a box about the lens that points wrap around, so the
  // dust never runs out however far the page travels.
  const vec3 FIELD_CENTRE = vec3(0.0, 0.0, -1.2);
  const vec3 FIELD_HALF = vec3(12.0, 8.0, 7.2);
  // Two octaves of an Arnold-Beltrami-Childress flow. Each component is
  // independent of its own coordinate, so the field is divergence-free: dust
  // carried by it curls and folds like smoke and never bunches or thins.
  vec3 flow(vec3 p, float t) {
    vec3 a = vec3(
      sin(p.z + t) + cos(p.y - t * 0.7),
      sin(p.x + t * 0.8) + cos(p.z + t * 0.5),
      sin(p.y - t * 0.6) + cos(p.x + t * 0.9)
    );
    vec3 q = p * 2.3 + 1.7;
    vec3 b = vec3(
      sin(q.z - t) + cos(q.y + t * 0.6),
      sin(q.x + t * 0.7) + cos(q.z - t * 0.4),
      sin(q.y + t * 0.5) + cos(q.x - t * 0.8)
    );
    return a + b * 0.45;
  }
  void main() {
    float r = aSeed.x;
    float s = aSeed.y;
    float t = aSeed.z;
    float u = aSeed.w;
    float light = dot(aColour, LUMA);
    // The relief is unprojected, not extruded: each point is pushed along its
    // own view ray from the opening lens, so the cloud carries true depth and
    // still projects exactly as the flat plate did.
    float homeScale = uScale * uHome.z;
    vec3 plate = vec3(position.xy * homeScale + uHome.xy, 0.0);
    vec3 eye = vec3(0.0, 0.0, 6.0);
    float relief = (aDepth - 0.45) * 1.9 * homeScale;
    vec3 home = eye + (plate - eye) * ((6.0 - relief) / 6.0);
    // A held press loosens the surface under the pointer.
    vec2 plane = vec2(2.18382 * uAspect, 2.18382);
    vec2 away = home.xy - uPointer * plane;
    float press = (1.0 - smoothstep(0.0, 0.7 * uScale, length(away))) * uPress;
    float grain = sin(position.x * 1.9 + position.y * 2.7) * 0.5
      + sin(position.x * 4.3 - position.y * 3.1 + 1.3) * 0.3
      + sin(position.y * 8.7 + position.x * 7.1) * 0.2;
    ${portraitAgeShader}
    float loose = smoothstep(0.0, 0.28, age);
    ${portraitJourneyShader}
    ${portraitTravelShader}
    // Lift-off and flight: five steps through the flow field with a steady
    // wind off the back of the head, up and towards the lens. Neighbours
    // start together and are carried apart by the field, so the head leaves
    // as strands and veils. The field itself turns slowly, so released dust
    // keeps moving while the page is still.
    vec3 p = home;
    float sheet = 0.0;
    float lanes = 1.0;
    if (age > 0.0) {
      vec3 wind = vec3(-0.82, 0.34, 0.14);
      float h = reach * 0.44;
      for (int i = 0; i < 5; i++) {
        p += (flow(p * 0.62, uTime * 0.11) * 0.5 + wind) * h;
      }
      // Each strand thickens into a volume as it travels.
      p += (vec3(r, s, t) - 0.5) * reach * 0.8;
      // Its own place in the wide field, taken up gradually. The field is
      // two rolling sheets of dust, one above the other, with a thin scatter
      // of strays between them: surfaces that recede to a horizon, so the
      // page travels through layers and not through even static.
      vec2 across = vec2(fract(r * 61.7 + s * 13.3), fract(t * 83.3 + r * 17.9)) - 0.5;
      vec3 place = FIELD_CENTRE + vec3(across.x, 0.0, across.y) * FIELD_HALF * 2.0;
      float swell = sin(place.x * 0.33 + place.z * 0.21 + uTime * 0.07) * 1.1
        + sin(place.x * 0.12 - place.z * 0.37 + 2.0 - uTime * 0.05) * 0.8
        + sin(place.x * 0.9 + place.z * 0.7 + uTime * 0.11) * 0.18;
      float thick = fract(s * 47.9 + t * 29.1) - 0.5;
      float stray = step(0.9, fract(t * 19.7 + s * 3.1));
      float layer = step(0.5, fract(s * 7.31 + r * 3.7)) - 0.5;
      place.y = layer * FIELD_HALF.y * 2.0 * 0.5 + swell + thick * abs(thick) * mix(2.2, 30.0, stray);
      sheet = 1.0 - stray;
      // The sheets are not even: slow currents gather the dust into lanes
      // and leave dark water between them.
      float current = sin(place.x * 0.7 + sin(place.z * 0.55 + 1.3) * 1.6 + uTime * 0.03)
        * sin(place.z * 0.43 - place.x * 0.21 + 0.7);
      lanes = mix(1.0, 0.05 + 0.95 * smoothstep(-0.2, 0.5, current), sheet);
      p = mix(p, place, spread);
      // The released field travels with the page, and once it has dispersed
      // it drifts on its own. Only dispersed points drift: time has no bound,
      // so a point that is merely breathing must not be given it.
      p.y += rise * 2.6 + uTime * 0.05 * spread;
      p.x -= uTime * 0.025 * spread;
    }
    vec3 local = mod(p - FIELD_CENTRE + FIELD_HALF, FIELD_HALF * 2.0) - FIELD_HALF;
    vec3 rim = 1.0 - smoothstep(vec3(0.8), vec3(1.0), abs(local) / FIELD_HALF);
    float inside = rim.x * rim.z * mix(1.0, rim.y, 1.0 - sheet);
    p = FIELD_CENTRE + local;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float depth = max(0.05, -mv.z);
    // Optics. A point in the plane of focus is its true size; either side of
    // it the point opens into a disc that carries the same light over a wider
    // area. Dust near the lens is therefore large, soft and faint, far dust
    // fine and sharp: the size and softness are the depth.
    float cell = uCell * uHome.z * uProj / depth * 1.28;
    float mote = mix(0.005, 0.016, t * t * t) + step(0.988, r) * 0.03;
    float fine = mote * uProj / depth;
    float core = max(0.4, mix(cell, fine, loose));
    // Beyond the plane of focus the blur is held back, so the far field stays
    // a fine glitter and the soft discs belong to the foreground.
    float beyond = mix(1.0, 0.35, step(uFocus, depth));
    float coc = abs(depth - uFocus) / depth * uAperture * uProj * (0.12 + 0.88 * loose) * beyond;
    float size = min(core + coc, 72.0);
    float shown = max(size, 1.0);
    vBlur = clamp(coc / max(core, 1.0) * 0.5, 0.0, 1.0);
    float energy = pow(clamp(core / shown, 0.0, 1.0), 2.0);
    // Under a third of the points carry on into the wide field; the rest
    // go out gradually as they disperse, so text over the field stays clear.
    float carried = (1.0 - spread * smoothstep(0.24, 0.34, r)) * mix(1.0, lanes, spread);
    float fog = mix(1.0, 0.22, smoothstep(5.0, 15.0, depth));
    // Dust close to the lens goes out before it can fill the frame.
    float nearLens = smoothstep(0.5, 3.0, depth);
    // Just released, the dust is as dense as the photograph and its light
    // adds up, so each point carries little; it carries more as it thins.
    float share = mix(0.97, mix(0.09, 0.6, spread), loose);
    vOpacity = share * energy * carried * fog * nearLens * inside;
    vOpacity *= mix(1.0, uHomeDim, uEnding * (1.0 - loose));
    // Silver only: no warm or coloured tint anywhere in the released field.
    // The erosion front burns brightest, then the dust settles to the tone of
    // the pixel it came from and is lit again as it crosses a lane.
    vec3 silver = vec3(0.8, 0.83, 0.86);
    float front = smoothstep(0.0, 0.05, age) * (1.0 - smoothstep(0.05, 0.5, age));
    // The plate's feathered border stays feathered once it is dust.
    float v = 0.5 - position.y / 4.6;
    float border = smoothstep(0.0, 0.035, u) * (1.0 - smoothstep(0.965, 1.0, u)) * (1.0 - smoothstep(0.85, 1.0, v));
    float tone = pow(light, 0.4545);
    // Fresh dust keeps the tone of the pixel it came from, so the head's own
    // light smears into the strands; far down the page it is evenly lit.
    float lit = mix(tone, 0.5 + r * 0.3 + step(0.97, s) * 1.6, spread);
    vec3 dust = silver * (0.05 + lit * (1.05 + r * 0.3)) * mix(border, 1.0, spread);
    vColour = mix(aColour, dust, loose) + silver * front * (0.15 + tone) * 0.9 * border;
    // The photograph is opaque; released dust adds its light.
    vAdd = loose;
    gl_PointSize = shown * uDpr;
    gl_Position = projectionMatrix * mv;
  }
`;

export const fragmentShader = /* glsl */ `
  varying vec3 vColour;
  varying float vOpacity;
  varying float vBlur;
  varying float vAdd;
  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    if (d > 1.0) discard;
    float sharp = 1.0 - smoothstep(0.62, 1.0, d);
    // An out-of-focus point is a disc with a slightly brighter rim.
    float disc = (1.0 - smoothstep(0.86, 1.0, d)) * (0.72 + 0.28 * smoothstep(0.45, 0.92, d));
    float alpha = mix(sharp, disc, vBlur) * vOpacity;
    // Premultiplied: vAdd = 0 lays the point over what is behind it, vAdd = 1
    // adds its light to it.
    gl_FragColor = vec4(vColour * alpha, alpha * (1.0 - vAdd));
  }
`;
