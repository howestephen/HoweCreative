import portraitSource from "../../../docs/reviews/2026-09-07-design-reset/portrait-reference.png";

export { portraitSource };
// The opening is a depth-mapped point cloud, not a stack of flat cards.
// The left half of PORTRAIT_POINTS_SOURCE is the approved 2D likeness, cropped
// exactly as PORTRAIT_CROP describes it; the right half is a per-pixel depth
// estimate written by scripts/build-portrait-depth.mjs. Every point therefore
// carries its own relief, so the head shows real parallax when it turns and
// the camera can travel into the cloud.
// The depth map is a monocular estimate from the 2D reference. It is
// art-directed relief, not measured geometry or a claim to reconstruct
// Stephen's actual facial geometry.
// This crop deliberately stops above the navigation baked into the concept.
export const PORTRAIT_CROP = { x: 440, y: 8, width: 700, height: 650 };
// Packed colour + depth plate, 1400x650: colour on the left, depth on the
// right. Served from public/ so the sampler fetches one image, not two.
export const PORTRAIT_POINTS_SOURCE = "/portrait/portrait-source.png";
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
// scroll follower in PortraitExperience already damps input, so easing here as
// well held the face together for too long before the separation became visible.
export const scrollState = (y: number, height: number, workTop: number, endTop: number) => {
  // The window can never invert, so a layout that has not measured yet
  // (or a very short one) still reports an intact portrait at the top.
  const releaseEnd = Math.max(workTop - height * 0.25, height * 0.17, 1);
  return {
    release: clamp(y / releaseEnd),
    // The turn shares the first scroll response, but retains its shorter eased
    // window so the portrait does not snap to an angle.
    approach: smooth(0, height * 0.6, y),
    travel: smooth(workTop - height * 0.55, endTop - height * 0.7, y),
    ending: smooth(endTop - height * 0.7, endTop + height * 0.12, y),
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

// Three overlapping movements, all driven by one scroll position. Approach
// dollies the lens into the cloud and turns the head, so the relief reads as
// parallax rather than as a flat image sliding. Loosen releases each point in
// its own time, ordered by depth, so hair and the back of the head go first
// and the features hold longest; it is also what reduces the image to its
// stipple. It starts on the first scroll and runs through almost the whole
// passage, so the head is pulling apart continuously rather than holding
// whole until the lens arrives. Disperse then carries the survivors into the
// field. Disperse stays
// linear here; the shader eases each point's own flight so the field
// interpolation spreads through the middle and late passage.
export const portraitPhases = (progress: number) => ({
  approach: smooth(0, 0.8, progress),
  // Linear, not eased: progress is already eased across the hero, and easing
  // it again held the whole head still through the first third of the scroll.
  loosen: clamp((progress - 0.01) / 0.75),
  disperse: clamp((progress - 0.42) / 0.58),
});

export const isPortraitSurface = (target: EventTarget | null) => target instanceof HTMLElement
  && Boolean(target.closest('.particle-hero'))
  && !target.closest('a, button, input, textarea, select, [role="dialog"], [contenteditable]');

export const acceptsPortraitPress = (pointerType: string, button: number, release: number, paused: boolean) =>
  pointerType === 'mouse' && button === 0 && release < 0.18 && !paused;

export const samplePortrait = (pixels: Uint8ClampedArray, depthPixels: Uint8ClampedArray, width: number, height: number) => {
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
      // Depth is read from the matching pixel of the depth half, never from
      // the portrait's own brightness: a bright cheek and a bright collar are
      // not at the same distance.
      depths.push(portraitRelief(depthPixels[i] / 255));
    }
  }
  return { positions: new Float32Array(positions), colours: new Float32Array(colours), seeds: new Float32Array(seeds), depths: new Float32Array(depths) };
};

export type ParticleMotion = {
  release: number;
  approach: number;
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
  uniform float uTurn;
  uniform float uLoosen;
  uniform float uDisperse;
  uniform float uTravel;
  uniform float uEnding;
  uniform float uTime;
  uniform float uDpr;
  uniform float uScale;
  uniform float uAspect;
  uniform float uPixel;
  uniform vec2 uPointer;
  uniform vec3 uCamera;
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
    float angle = s * TAU;
    float light = dot(aColour, LUMA);
    // The image reduces to a stipple. About a fifth of the points survive the
    // loosening (the band runs 0.12 to 0.52, weighted towards the bright
    // ones) and the rest fade out as they let go. The survivors grow to hold the coverage
    // the others gave up, and they are the points that fly into the field.
    // The weighting reads perceptual tone, not linear light: aColour is stored
    // linear and this portrait is dark, so nine points in ten sit below 0.1
    // there and weighting on it keeps a flat tenth of the image everywhere.
    float tone = pow(light, 0.4545);
    float keep = step(r, 0.12 + tone * 0.40);
    // When a point lets go is keyed to its own relief. aDepth is 1 at the
    // nearest surface, so the features hold longest and hair and the back of
    // the head release first. Randomness and a low ripple keep the front from
    // travelling as one straight edge. The spread is narrow and the window is
    // wide, so every part of the head is moving from early in the passage and
    // the order decides how far along each one is, not whether it has begun.
    // The window is wider than the spread of orders on purpose: each point
    // takes most of the passage to leave, so the head comes apart steadily
    // instead of tipping over between one scroll position and the next.
    float order = 0.02 + aDepth * 0.10 + s * 0.10 + sin(position.y * 3.1 + aSeed.w * 4.0) * 0.03;
    float loose = smoothstep(order, order + 0.6, uLoosen);
    float flight = loose * smoothstep(0.0, 1.0, uDisperse);
    // The relief is unprojected, not extruded: each point is pushed along its
    // own view ray from the opening lens, so the cloud carries true depth and
    // still projects exactly as the flat plate did.
    vec3 plate = position * uScale;
    vec2 framing = vec2(uAspect > 1.1 ? 0.32 : -0.7 * uScale, 0.06);
    plate.xy += framing;
    float baseYaw = -0.13;
    vec3 original = rotateY(plate, baseYaw);
    vec3 eye = vec3(0.0, 0.0, 6.0);
    float reach = 6.0 - original.z;
    float relief = (aDepth - 0.5) * 1.8 * uScale;
    float rest = reach - relief;
    vec3 surface = eye + (original - eye) * (rest / reach);
    // Lift-off: a released point rises and eases off the surface, swaying
    // slowly, so the surface breathes apart instead of bursting.
    vec3 sway = vec3(
      sin(uTime * 0.5 + s * TAU),
      cos(uTime * 0.37 + r * TAU),
      sin(uTime * 0.43 + t * TAU)
    ) * 0.16;
    // Hair splays into wisps: the drift is outward from the head's centre and
    // slightly upward, carried on two slow waves rather than a radial burst.
    // The yaw pivots about the face, not the head's centre. Pivoting at the
    // centre swings the face forward by most of a unit, so the lens passes it
    // while it is still the subject and is left looking at the dark back of
    // the head. Pivoting at the face holds it at its own depth and swings the
    // back of the head away instead, which is what opens a depth range for
    // near blobs to read against finer points behind them.
    vec3 centre = vec3(0.7 * uScale + framing.x, framing.y, 0.0);
    vec3 pivot = vec3(1.75 * uScale + framing.x, 0.0, 0.0);
    vec3 outward = normalize(surface - centre + vec3(0.001, 0.0, 0.0));
    // The lens travels right and in, so the points stream the other way. The
    // bias dominates and the outward term is halved: at full weight it points
    // the cheek back out to the right, cancelling the bias on exactly the
    // points that should be leaving towards the viewer.
    vec3 liftDirection = normalize(outward * 0.5
      + vec3(-0.55, 0.2, 0.45)
      + vec3((r - 0.5) * 0.4, 0.8 + s * 0.35, 0.2 + (t - 0.5) * 0.5));
    vec3 drift = vec3(
      sin(position.y * 1.6 + uTime * 0.23 + s * TAU) * 0.6 + cos(position.x * 1.05 - uTime * 0.17 + t * TAU) * 0.4,
      cos(position.x * 1.3 + uTime * 0.19 + r * TAU) * 0.5 + sin(position.y * 0.85 + uTime * 0.13) * 0.35,
      sin(position.x * 0.9 + position.y * 1.15 + uTime * 0.21 + s * TAU) * 0.55
    );
    // A point that has not loosened sits exactly on the relief surface. Hair
    // and the back of the head travel furthest, the features a little less,
    // but the face does travel: the whole head has to come apart as it turns,
    // not shed an outline while its middle stays put. Amplitude follows loose
    // directly, so the pull is continuous across the passage.
    float splay = mix(1.0, 0.75, aDepth);
    vec3 wander = (liftDirection * (0.35 + t * 0.55) + drift * 0.42 + sway) * 1.1 * uScale * loose * splay;
    // The head turns about its own centre, so nothing slides out of a narrow
    // viewport and the total angle stays short of showing the relief edge-on.
    vec3 lifted = rotateY(surface + wander - pivot, -uTurn) + pivot;
    // A curved route carries each ember up and out before it reaches its
    // place in the field, so neighbouring detail stretches before it dissolves.
    vec3 control = lifted + vec3((r - 0.5) * 1.6, 0.9 + s * 0.8, 0.6 + (t - 0.5) * 0.8) * uScale;
    // The field is stratified: a few large soft points close to the lens, a
    // body of fine points in the middle distance and dust far behind.
    float near = 1.0 - smoothstep(0.0, 0.07, t);
    float far = smoothstep(0.3, 0.6, t);
    float scatter = hash2(vec2(r, s));
    // The field and the closing arc were authored for a lens at z = 6, which
    // now travels, so both are carried with it.
    vec3 lens = uCamera - vec3(0.0, 0.0, 6.0);
    vec3 field = vec3(
      (r - 0.5) * 14.0 - 0.6,
      (s - 0.5) * 5.0 + sin(scatter * TAU + far * 2.0) * 0.8,
      mix(mix(0.6, 2.9, near), -6.0, far) + (hash2(vec2(s, t)) - 0.5) * 1.5
    ) + lens;
    field.y += sin(angle + uTime * 0.09) * 0.15;
    field.x += uTravel * (1.4 + t * 1.2);
    field.z += uTravel * 0.8;
    float retained = 1.0 - flight;
    vec3 p = retained * retained * lifted
      + 2.0 * retained * flight * control
      + flight * flight * field;
    // The closing form is a tilted, diffuse arc with space for readable type.
    float arc = r * TAU;
    float radius = 2.2 + pow(s, 2.0) * 1.4;
    vec3 ending = vec3(
      cos(arc) * radius * min(1.65, uAspect * 0.92),
      sin(arc) * radius * 0.56,
      sin(arc) * 1.3 + (t - 0.5) * 1.25 - 0.8
    ) + lens;
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
    // Geometric growth alone is not enough: uPixel is about 2px on a 1280x800
    // desktop. A real lens turns a near point into a soft disc well beyond its
    // geometric size, so the last stretch in front of the camera adds a swell.
    // It is inert beyond 2.4 units, so the opening frame is untouched.
    float grow = rest / max(0.3, depth);
    float swell = 1.0 + (1.0 - smoothstep(0.3, 2.4, depth)) * 1.6;
    float settled = flight * flight;
    float opticalSpread = flight * 0.2 + settled * 0.8;
    vBlur = smoothstep(1.35, 4.4, focus) * opticalSpread;
    vBlur = max(vBlur, near * settled * 0.7);
    // Close to the lens a point is past the focal plane: it grows, softens and
    // goes out rather than popping as it passes the camera.
    vBlur = max(vBlur, 1.0 - smoothstep(0.4, 1.6, depth));
    // A point the stipple drops fades out as it loosens; a kept point holds
    // full opacity through the loosening and leaves as an ember.
    float held = mix(1.0 - smoothstep(0.05, 0.6, loose), 1.0, keep);
    float emberAlpha = keep * mix(0.72, 0.42, near) * (0.4 + r * 0.6) * mix(1.0, 0.55, far);
    vOpacity = mix(0.97 * held, emberAlpha, smoothstep(0.0, 0.45, flight)) * smoothstep(0.12, 0.7, depth);
    vOpacity *= mix(1.0, 0.46, uEnding);
    vec3 silver = vec3(0.66, 0.69, 0.71);
    vec3 warm = vec3(0.86, 0.79, 0.68);
    vec3 ember = mix(silver, warm, near * 0.6) * (0.42 + light * 0.9 + r * 0.25);
    vColour = mix(aColour * 1.08, ember, smoothstep(0.1, 0.9, flight));
    float hover = exp(-pow(length(away * vec2(0.82, 1.15)) / (0.88 * uScale), 2.0) * 1.65) * uHover * interactive;
    vec3 warmRed = vec3(light * 1.08, light * 0.19, light * 0.13);
    vColour = mix(vColour, warmRed, hover * (0.3 + uPress * 0.18));
    // The sampler lays points out on a screen-space grid, so their spacing on
    // screen is fixed at the opening whatever their relief. Each point keeps
    // its opening size and grows as the lens closes on it; a kept point grows
    // again as the stipple thins, to hold the coverage the dropped ones gave up.
    float portraitSize = uPixel * 6.0 / (6.0 - original.z) * grow * swell + vBlur * 3.0;
    portraitSize *= mix(1.0, 2.4, loose * keep);
    // The field carries only the kept points, so each one is scaled up to hold
    // the coverage the stipple gave up, exactly as portraitSize is.
    float emberSize = mix(mix(0.022, 0.012, far), 0.11, near) * 1250.0 / max(0.5, depth);
    // A dropped point that has fully faded still costs fill at up to 72px in
    // the blended pass, so once it is gone it is drawn at no size at all.
    float dropped = (1.0 - keep) * smoothstep(0.55, 0.62, loose);
    gl_PointSize = min(72.0, mix(portraitSize, emberSize + vBlur * 8.0, smoothstep(0.0, 1.0, flight))) * uDpr * (1.0 - dropped);
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
