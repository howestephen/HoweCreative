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
// The hero's physical scroll range and the share of it the release occupies.
// The work heading reaches the bottom of the viewport at
// (HERO_HEIGHT - 1) / RELEASE_LENGTH = 0.75 of the release, once the head has
// stopped reading as a head, and the release completes with the heading in the
// middle of the screen. There is never a screen of particles alone.
export const HERO_HEIGHT = 2.2;
export const RELEASE_LENGTH = 1.6;
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
  const releaseEnd = Math.max(height * RELEASE_LENGTH, 1);
  const endingStart = Math.max(releaseEnd, endTop - height * 0.7);
  return {
    release: clamp(y / releaseEnd),
    travel: smooth(Math.max(releaseEnd, workTop - height * 0.4), Math.max(releaseEnd + height, endTop), y),
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

// Four overlapping movements, all driven by one scroll position.
// Separate pushes the plate's vertical slices apart along depth and deepens
// the relief; it is invisible from the opening lens and is revealed by the
// turn and the dolly, which is what makes it read as a solid object rather
// than as an image sliding. Loosen and disperse are linear: each point's own
// release order (hair and the back of the head first, the features last)
// shapes them in the shader, so the head comes apart steadily and the last
// features are still sweeping into the ring as the release ends.
export const portraitPhases = (progress: number) => ({
  separate: smooth(0, 0.7, progress),
  turn: smooth(0, 0.95, progress),
  loosen: clamp(progress),
  disperse: clamp(progress),
});

// The lens tracks across and dollies in over the whole release. Near points
// cross in front of it and swell, far ones stay fine: the size change and the
// parallax against the separated slices are the depth cues.
export const portraitCamera = (release: number, aspect: number) => {
  const advance = smooth(0.02, 1, release);
  return {
    x: advance * (aspect > 1.1 ? 0.55 : 0.2),
    y: -advance * 0.12,
    z: 6 - advance * 1.1,
  };
};

export const isPortraitSurface = (target: EventTarget | null) => target instanceof HTMLElement
  && Boolean(target.closest('.particle-hero'))
  && !target.closest('a, button, input, textarea, select, [role="dialog"], [contenteditable]');

export const acceptsPortraitPress = (pointerType: string, button: number, release: number, paused: boolean) =>
  pointerType === 'mouse' && button === 0 && release < 0.18 && !paused;

// Match the sRGB plate, including its shadow toe. A plain power of 2.2
// crushed the neck's dark tones before the shader converted back to sRGB.
export const portraitLinearColour = (value: number) => value <= 0.04045
  ? value / 12.92
  : Math.pow((value + 0.055) / 1.055, 2.4);

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
        portraitLinearColour(pixels[i] / 255) * edge,
        portraitLinearColour(pixels[i + 1] / 255) * edge,
        portraitLinearColour(pixels[i + 2] / 255) * edge,
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

// The plate as a solid: thirteen vertical slices at their own depths, feathered
// into one corrugated sheet so nothing tears open between neighbours, with the
// per-point relief on top. Both offsets run along each point's own view ray
// from the opening lens, so the opening frame is unchanged by construction and
// the depth only appears as the head turns and the lens moves. Scalar inputs:
// column (0..13), aDepth, uSeparate, uScale. The block is also executed as JS
// by the regression test, so it stays free of vector types.
export const portraitSliceShader = /* glsl */ `
    float index = floor(column);
    float within = column - index;
    float sliceNear = sin(index * 1.9 + 0.6) * 0.55 + sin(index * 0.7 + 2.0) * 0.45;
    float sliceNext = sin((index + 1.0) * 1.9 + 0.6) * 0.55 + sin((index + 1.0) * 0.7 + 2.0) * 0.45;
    float slice = mix(sliceNear, sliceNext, smoothstep(0.7, 1.0, within));
    float relief = (aDepth - 0.5) * 1.8 * uScale * (1.0 + uSeparate * 0.5)
      + slice * uSeparate * 1.25 * uScale;
`;

// When a point lets go and when it flies are keyed to its own relief: aDepth is
// 1 at the nearest surface, so hair and the back of the head release first and
// the features hold longest. A per-point seed and a low ripple keep the front
// from travelling as one straight edge. Scalar inputs: aDepth, s, ripple,
// uLoosen, uDisperse.
export const portraitOrderShader = /* glsl */ `
    float order = aDepth * 0.55 + s * 0.3 + ripple * 0.15;
    float loose = smoothstep(0.0, 0.5, uLoosen * 1.15 - order * 0.55);
    float flight = smoothstep(0.0, 0.45, uDisperse * 1.3 - 0.35 - order * 0.5);
`;

// The inverse of the basis at the end of particleFlowShader: a world point
// (liftedX, liftedY, liftedZ) expressed in the ring's own frame as a radius,
// an angle and a height, so the route in can spiral about the ring's axis.
// Scalar inputs: liftedX, liftedY, liftedZ, uAspect, uEnding. The regression
// test round-trips this through the flow block at e = 0.
export const particleFrameShader = /* glsl */ `
    float relX = (liftedX - (uAspect > 1.1 ? 0.48 : 0.2)) / min(1.0, uAspect * 0.75);
    float relY = (liftedY - mix(-0.05, -0.4, uEnding)) / mix(0.62, 1.0, smoothstep(0.55, 1.1, uAspect));
    float untiltX = cos(-0.24) * relX - sin(-0.24) * liftedZ;
    float untiltZ = sin(-0.24) * relX + cos(-0.24) * liftedZ;
    float liftedLocalY = cos(0.66) * relY + sin(0.66) * untiltZ;
    float rL = sqrt(untiltX * untiltX + liftedLocalY * liftedLocalY);
    float aL = atan(liftedLocalY, untiltX);
    float zL = -sin(0.66) * relY + cos(0.66) * untiltZ;
`;

// One angular coordinate and one fixed basis for the whole released cloud.
// Each point's angle is where it left the head, spread by its seed, so the
// ring is swept out of the head rather than assembled from random positions.
// Scroll gathers the cross-section and lowers the centre to the closing text;
// it never changes particle correspondence or rotates the basis. Scalar
// inputs: angle, s, t, e (flight), rL, aL, zL, uTime, uEnding, uAspect. Keep
// this block shared with the numerical regression test of the actual shader.
export const particleFlowShader = /* glsl */ `
    float orbit = angle * TAU + uTime * 0.075;
    float crossSection = fract(s * 73.13 + t * 29.7) * TAU;
    float radius = 1.55 + t * 0.38 + sin(orbit * 3.0) * 0.14;
    float tube = mix(0.36, 0.12, uEnding);
    float radial = radius + cos(crossSection) * tube;
    float settleZ = sin(crossSection) * tube + (t - 0.5) * 0.8 * (1.0 - uEnding);
    // The route in is a spiral about the ring's axis: from where the point
    // left the head (rL, aL, zL in the ring's own frame) its radius and height
    // ease onto the ring while its angle turns the short way round to its own
    // place. At e = 1 this is exactly the ring; at e = 0 it is the lifted
    // point, so mid-flight the cloud is already a visible vortex.
    float turnTo = mod(orbit - aL + PI, TAU) - PI;
    float pathAngle = aL + turnTo * e;
    float pathRadial = mix(rL, radial, e);
    float localX = cos(pathAngle) * pathRadial;
    float localY = sin(pathAngle) * pathRadial;
    float localZ = mix(zL, settleZ, e);
    float tiltedY = cos(0.66) * localY - sin(0.66) * localZ;
    float tiltedZ = sin(0.66) * localY + cos(0.66) * localZ;
    float flowX = (cos(-0.24) * localX + sin(-0.24) * tiltedZ)
      * min(1.0, uAspect * 0.75) + (uAspect > 1.1 ? 0.48 : 0.2);
    float flowY = tiltedY * mix(0.62, 1.0, smoothstep(0.55, 1.1, uAspect))
      + mix(-0.05, -0.4, uEnding);
    float flowZ = -sin(-0.24) * localX + cos(-0.24) * tiltedZ;
`;

export const vertexShader = /* glsl */ `
  attribute vec3 aColour;
  attribute vec4 aSeed;
  attribute float aDepth;
  uniform float uRelease;
  uniform float uTurn;
  uniform float uSeparate;
  uniform float uLoosen;
  uniform float uDisperse;
  uniform float uEnding;
  uniform float uTime;
  uniform float uDpr;
  uniform float uScale;
  uniform float uAspect;
  uniform float uPixel;
  uniform float uFocus;
  uniform vec2 uPointer;
  uniform float uPress;
  varying vec3 vColour;
  varying float vOpacity;
  varying float vBlur;
  const float TAU = 6.28318530718;
  const float PI = 3.14159265359;
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
    float light = dot(aColour, LUMA);
    // The image reduces to a stipple. About a fifth of the points survive the
    // flight (the band runs 0.12 to 0.52, weighted towards the bright ones)
    // and the rest fade out as they let go. The survivors grow to hold the
    // coverage the others gave up, and they are the points that reach the ring.
    // The weighting reads perceptual tone, not linear light: aColour is stored
    // linear and this portrait is dark, so nine points in ten sit below 0.1
    // there and weighting on it keeps a flat tenth of the image everywhere.
    float tone = pow(light, 0.4545);
    float keep = step(r, 0.12 + tone * 0.40);
    float ripple = (sin(position.y * 2.6 + aSeed.w * 5.0) + 1.0) * 0.5;
    ${portraitOrderShader}
    // The relief and the slices are unprojected, not extruded: each point is
    // pushed along its own view ray from the opening lens, so the cloud
    // carries true depth and still projects exactly as the flat plate did.
    vec3 plate = position * uScale;
    vec2 framing = vec2(uAspect > 1.1 ? 0.32 : -0.7 * uScale, 0.06);
    plate.xy += framing;
    float baseYaw = -0.13;
    vec3 original = rotateY(plate, baseYaw);
    vec3 eye = vec3(0.0, 0.0, 6.0);
    float reach = 6.0 - original.z;
    float column = aSeed.w * 13.0;
    ${portraitSliceShader}
    float rest = reach - relief;
    vec3 surface = eye + (original - eye) * (rest / reach);
    // Lift-off: a released point eases off the surface towards the lens and
    // up to the left, against the lens's own travel, along one low-frequency
    // field that varies with where the point sits on the plate. Neighbours
    // therefore leave together, so the head smears into sheets that keep
    // their parallax rather than into an even cloud. The per-point reach
    // thickens each sheet into a volume; a slow sway keeps it alive at rest.
    vec3 lift = normalize(vec3(-0.3, 0.22, 0.9));
    vec3 wave = vec3(
      sin(position.y * 1.1 + aSeed.w * 2.0) * 0.35,
      cos(position.x * 0.9 + 1.0) * 0.25,
      sin(position.x * 0.7 + position.y * 0.8) * 0.35
    );
    vec3 sway = vec3(
      sin(uTime * 0.5 + s * TAU),
      cos(uTime * 0.37 + r * TAU),
      sin(uTime * 0.43 + t * TAU)
    ) * 0.07;
    // How far a point lifts varies smoothly across the plate, with only a
    // little per-point randomness: a random reach along one shared direction
    // extruded neighbouring points into perspective streaks that read as a
    // web of lines in the fine-toned hair.
    float reachField = 0.5 + 0.5 * sin(position.x * 6.3 + position.y * 4.7 + aSeed.w * 3.0);
    float reachOut = (0.35 + mix(reachField, t, 0.3) * 0.75) * mix(1.0, 0.7, aDepth);
    vec3 wander = ((lift + wave) * reachOut * uScale + sway) * loose;
    // The yaw pivots about the face, not the head's centre. Pivoting at the
    // centre swings the face forward by most of a unit, so the lens passes it
    // while it is still the subject and is left looking at the dark back of
    // the head. Pivoting at the face holds it at its own depth and swings the
    // back of the head away instead, which opens the slices and the relief to
    // the lens.
    vec3 pivot = vec3(1.75 * uScale + framing.x, 0.0, 0.0);
    vec3 lifted = rotateY(surface + wander - pivot, -uTurn) + pivot;
    // The released particles follow the same circle behind work and around
    // the closing text. Each takes the ring angle nearest to where it left the
    // head, spread by its seed so no sector is empty. There is no second
    // destination. The lifted point is expressed in the ring's own frame
    // (the inverse of the basis at the end of the flow block) so the route in
    // can be a spiral about the ring's axis.
    vec2 fromCentre = original.xy - vec2(uAspect > 1.1 ? 0.48 : 0.2, -0.05);
    float angle = atan(fromCentre.y, fromCentre.x) / TAU + (s - 0.5) * 0.7;
    float near = 1.0 - smoothstep(0.0, 0.07, t);
    float far = smoothstep(0.3, 0.6, t);
    float scatter = hash2(vec2(r, s));
    // One point in seven carries the gold of the constellation on the back
    // of the head in the source image, from deep amber to pale gold. It is
    // latent in the photographic opening and shown once the point is in
    // flight, so the field lower down the page is made of the same material
    // the head was.
    float accent = step(hash2(vec2(t, r) + 0.37), 0.14);
    float hue = hash2(vec2(s, t) + 0.71);
    vec3 accentColour = mix(vec3(0.98, 0.62, 0.22), vec3(1.0, 0.9, 0.62), hue);
    float liftedX = lifted.x;
    float liftedY = lifted.y;
    float liftedZ = lifted.z;
    ${particleFrameShader}
    float e = flight;
    ${particleFlowShader}
    vec3 p = vec3(flowX, flowY, flowZ);
    // Only a held press parts the points. Pointer movement does nothing.
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
    // The focal plane follows the lens to the face, so the separated slices
    // and the lifted sheets go soft in front of and behind it.
    float focus = abs(depth - uFocus);
    // Geometric growth alone is not enough: uPixel is about 2px on a 1280x800
    // desktop. A real lens turns a near point into a soft disc well beyond its
    // geometric size, so the last stretch in front of the camera adds a swell.
    // It is inert beyond 2.4 units, so the opening frame is untouched.
    float grow = rest / max(0.3, depth);
    float swell = 1.0 + (1.0 - smoothstep(0.3, 2.4, depth)) * 1.6;
    float settled = flight * flight;
    float opticalSpread = loose * 0.35 + settled * 0.65;
    vBlur = smoothstep(0.9, 3.6, focus) * opticalSpread;
    vBlur = max(vBlur, near * settled * 0.7);
    // Close to the lens a point is past the focal plane: it grows, softens and
    // goes out rather than popping as it passes the camera.
    vBlur = max(vBlur, 1.0 - smoothstep(0.4, 1.6, depth));
    // Thin early in the flight, so the vortex is drawn by the survivors and
    // the frame never fills with photographic sampling density in transit.
    // The intact opening is unaffected.
    float thinning = smoothstep(0.1, 0.6, flight);
    float cloudAlpha = mix(0.97, 0.48 + r * 0.42, smoothstep(0.08, 0.82, flight));
    float emberAlpha = keep * mix(0.88, 0.55, near) * (0.55 + r * 0.45) * mix(1.0, 0.72, far) * (1.0 + accent * 0.15);
    vOpacity = mix(cloudAlpha, emberAlpha, thinning) * smoothstep(0.12, 0.7, depth);
    vOpacity *= mix(1.0, 0.62, uEnding);
    // The released field keeps its light: a point's brightness no longer
    // depends on how dark its source pixel was, and the nearer it is to the
    // lens the brighter it is, in step with its size and softness.
    vec3 silver = vec3(0.76, 0.79, 0.82);
    vec3 warm = vec3(0.92, 0.84, 0.72);
    float lensNear = 1.0 - smoothstep(2.0, 6.0, depth);
    vec3 ember = mix(silver, warm, near * 0.6) * (0.78 + light * 0.5 + r * 0.3) * (0.9 + lensNear * 0.35);
    vColour = mix(aColour, ember, smoothstep(0.1, 0.9, flight));
    float revealed = accent * smoothstep(0.15, 0.7, flight);
    vColour = mix(vColour, accentColour * (0.95 + light * 0.3 + r * 0.25) * (0.9 + lensNear * 0.35), revealed);
    // Preserve the photographic opening, then introduce a broad, biased size
    // range as the surface separates. Most points become fine dust, a smaller
    // group stays mid-sized and only a few become large near-lens particles.
    // Deliberate small, medium and large populations make the depth layers
    // legible without enlarging the whole cloud together.
    float sizeVariation = scatter < 0.72
      ? mix(0.24, 0.62, scatter / 0.72)
      : (scatter < 0.95
        ? mix(0.85, 1.55, (scatter - 0.72) / 0.23)
        : mix(2.0, 3.1, (scatter - 0.95) / 0.05));
    sizeVariation *= 1.0 + accent * 0.35;
    float separatedSize = mix(1.0, sizeVariation, smoothstep(0.08, 0.78, flight));
    float portraitSize = uPixel * 6.0 / (6.0 - original.z) * grow * swell + vBlur * 3.0;
    portraitSize *= separatedSize;
    float emberSize = mix(mix(0.008, 0.004, far), 0.036, near)
      * 1250.0 / max(0.5, depth) * sizeVariation;
    float dropped = (1.0 - keep) * thinning;
    gl_PointSize = min(48.0, mix(portraitSize, emberSize + vBlur * 3.5, smoothstep(0.0, 1.0, flight))) * uDpr * (1.0 - dropped);
    // The same optical treatment follows the released points all the way
    // down the page. It never switches at work or at the closing section.
    float volume = smoothstep(0.3, 0.95, flight);
    if (volume > 0.0) {
      float opticalSize = (1.9 + lensNear * 2.2) * sizeVariation * 5.5 / max(0.7, depth);
      float opticalBlur = smoothstep(0.8, 3.8, abs(depth - 5.0));
      vBlur = mix(vBlur, opticalBlur, volume);
      gl_PointSize = mix(gl_PointSize, min(30.0, opticalSize + opticalBlur * 4.0) * uDpr * (1.0 - dropped), volume);
    }
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
    gl_FragColor = vec4(vColour, alpha);
    #include <colorspace_fragment>
  }
`;
