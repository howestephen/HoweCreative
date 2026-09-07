import {
  Component,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  CanvasTexture,
  Color,
  ExtrudeGeometry,
  Group,
  LinearFilter,
  MathUtils,
  OrthographicCamera,
  PlaneGeometry,
  PCFShadowMap,
  Shape,
  SRGBColorSpace,
  Texture,
  TextureLoader,
  VideoTexture,
} from "three";

export type FolioItem = { id: string; image: string; video?: string };
export type FolioSceneProps = {
  items: FolioItem[];
  activeIndex: number;
  onSelect: (index: number) => void;
  reducedMotion: boolean;
  paused: boolean;
  onReady?: (id: string) => void;
  onUnavailable?: () => void;
};

const WIDTH = 5.6;
const HEIGHT = (WIDTH * 9) / 16;
const FOLD = MathUtils.degToRad(79);
const INSET = 0.045;

function leafAngle(index: number, active: number) {
  const distance = index - active;
  if (distance === 0) return 0;
  return Math.sign(distance) * (Math.abs(distance) % 2 ? 1 : -1) * FOLD;
}

function cropTexture(texture: Texture, width: number, height: number) {
  const ratio = width / height;
  const target = 16 / 9;
  texture.repeat.set(Math.min(1, target / ratio), Math.min(1, ratio / target));
  texture.offset.set((1 - texture.repeat.x) / 2, 1 - texture.repeat.y);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  texture.needsUpdate = true;
}

function useImageTexture(src: string, onLoaded?: () => void) {
  const [loadedImage, setLoadedImage] = useState<{
    src: string;
    texture: Texture;
  } | null>(null);
  const texture = loadedImage?.src === src ? loadedImage.texture : null;
  const invalidate = useThree((state) => state.invalidate);
  // Also signals readiness when an already loaded neighbouring leaf is selected.
  useEffect(() => {
    if (texture) onLoaded?.();
  }, [texture, onLoaded]);

  useEffect(() => {
    let disposed = false;
    const result = new TextureLoader().load(
      src,
      (loaded) => {
        if (disposed) {
          loaded.dispose();
          return;
        }
        cropTexture(loaded, loaded.image.width, loaded.image.height);
        setLoadedImage({ src, texture: loaded });
        invalidate();
      },
      undefined,
      () => {
        if (!disposed) {
          // Keep the HTML poster visible until the active leaf has real artwork.
          invalidate();
        }
      },
    );
    return () => {
      disposed = true;
      result.dispose();
    };
  }, [src, invalidate]);
  return texture;
}

function useFilmTexture(
  src: string | undefined,
  enabled: boolean,
  paused: boolean,
) {
  const [loadedFilm, setLoadedFilm] = useState<{
    src: string;
    video: HTMLVideoElement;
    texture: VideoTexture;
  } | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    if (!src || !enabled) return;
    const video = document.createElement("video");
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = "auto";
    video.src = src;
    videoRef.current = video;
    let disposed = false;
    let film: VideoTexture | null = null;
    const ready = () => {
      if (disposed) return;
      film = new VideoTexture(video);
      film.minFilter = LinearFilter;
      film.magFilter = LinearFilter;
      cropTexture(film, video.videoWidth, video.videoHeight);
      setLoadedFilm({ src, video, texture: film });
      invalidate();
    };
    const fail = () => {
      if (disposed) return;
      setLoadedFilm(null);
      video.pause();
      film?.dispose();
      film = null;
      invalidate();
    };
    video.addEventListener("loadeddata", ready, { once: true });
    video.addEventListener("error", fail);
    video.load();
    return () => {
      disposed = true;
      video.removeEventListener("loadeddata", ready);
      video.removeEventListener("error", fail);
      video.pause();
      video.removeAttribute("src");
      video.load();
      if (videoRef.current === video) videoRef.current = null;
      film?.dispose();
    };
  }, [src, enabled, invalidate]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !enabled || paused) {
      video?.pause();
      return;
    }
    let cancelled = false;
    let frame = 0;
    let fallbackFrame = 0;
    const nextFrame = () => {
      if (cancelled || video.paused || video.ended) return;
      invalidate();
      if ("requestVideoFrameCallback" in video) {
        frame = video.requestVideoFrameCallback(nextFrame);
      } else {
        fallbackFrame = requestAnimationFrame(nextFrame);
      }
    };
    void video
      .play()
      .then(nextFrame)
      .catch(() => {
        // Autoplay is optional. The still texture and HTML controls remain usable.
      });
    return () => {
      cancelled = true;
      video.pause();
      if (frame) video.cancelVideoFrameCallback(frame);
      if (fallbackFrame) cancelAnimationFrame(fallbackFrame);
    };
  }, [src, enabled, paused, invalidate]);
  return enabled &&
    loadedFilm?.src === src &&
    loadedFilm?.video === videoRef.current
    ? loadedFilm.texture
    : null;
}

function makePaper() {
  const radius = 0.035;
  const left = -WIDTH / 2;
  const right = WIDTH / 2;
  const bottom = -HEIGHT / 2;
  const top = HEIGHT / 2;
  const shape = new Shape();
  shape.moveTo(left + radius, bottom);
  shape.lineTo(right - radius, bottom);
  shape.quadraticCurveTo(right, bottom, right, bottom + radius);
  shape.lineTo(right, top - radius);
  shape.quadraticCurveTo(right, top, right - radius, top);
  shape.lineTo(left + radius, top);
  shape.quadraticCurveTo(left, top, left, top - radius);
  shape.lineTo(left, bottom + radius);
  shape.quadraticCurveTo(left, bottom, left + radius, bottom);
  const geometry = new ExtrudeGeometry(shape, {
    depth: 0.024,
    bevelEnabled: true,
    bevelSize: 0.008,
    bevelThickness: 0.006,
    bevelSegments: 2,
    curveSegments: 5,
    steps: 1,
  });
  geometry.translate(0, 0, -0.012);
  return geometry;
}

function makeReverse(index: number) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 576;
  const context = canvas.getContext("2d");
  if (context) {
    context.fillStyle = "#eeede8";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#252621";
    context.font = "400 290px Helvetica, Arial, sans-serif";
    context.fillText(String(index + 1).padStart(2, "0"), 52, 332);
    context.fillStyle = "#a4a59d";
    context.fillRect(56, 414, 912, 2);
    context.fillStyle = "#5c5f56";
    context.font = "500 19px monospace";
    context.fillText("STEPHEN HOWE", 58, 463);
    context.fillText("CREATIVE TECHNOLOGIST", 58, 496);
    context.fillStyle = "#e2492f";
    context.fillRect(926, 462, 40, 40);
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function LeafSurface({
  item,
  active,
  paused,
  index,
  onReady,
}: {
  item: FolioItem;
  active: boolean;
  paused: boolean;
  index: number;
  onReady?: (id: string) => void;
}) {
  const reportReady = useCallback(() => onReady?.(item.id), [item.id, onReady]);
  const image = useImageTexture(item.image, active ? reportReady : undefined);
  const film = useFilmTexture(item.video, active, paused);
  const reverse = useMemo(() => makeReverse(index), [index]);
  const paper = useMemo(makePaper, []);
  const face = useMemo(
    () => new PlaneGeometry(WIDTH - INSET * 2, ((WIDTH - INSET * 2) * 9) / 16),
    [],
  );
  useEffect(
    () => () => {
      paper.dispose();
      face.dispose();
      reverse.dispose();
    },
    [paper, face, reverse],
  );
  return (
    <>
      <mesh geometry={paper} castShadow receiveShadow>
        <meshStandardMaterial
          color="#e4e3dd"
          roughness={0.73}
          metalness={0.12}
        />
      </mesh>
      <mesh geometry={face} position={[0, 0, 0.023]}>
        <meshBasicMaterial
          key={(film ?? image)?.uuid ?? "unloaded"}
          map={film ?? image}
          color={film || image ? "#ffffff" : "#d3d4cc"}
          toneMapped={false}
        />
      </mesh>
      <mesh
        geometry={face}
        position={[0, 0, -0.023]}
        rotation={[0, Math.PI, 0]}
      >
        <meshBasicMaterial map={reverse} toneMapped={false} />
      </mesh>
    </>
  );
}

type GestureState = {
  pointerX: number;
  pointerY: number;
  dragOffset: number;
  dragging: boolean;
  suppressClick: boolean;
};

function Concertina({
  items,
  activeIndex,
  onSelect,
  paused,
  onReady,
  gesture,
}: Omit<FolioSceneProps, "reducedMotion"> & {
  gesture: React.RefObject<GestureState>;
}) {
  const assembly = useRef<Group>(null);
  const leaves = useRef<Array<Group | null>>([]);
  const joints = useRef<Array<Group | null>>([]);
  const angles = useRef(items.map((_, index) => leafAngle(index, activeIndex)));
  const { camera, size, invalidate } = useThree();
  const firstFrame = useRef(true);

  useEffect(() => {
    invalidate();
  }, [activeIndex, paused, size, invalidate]);
  useFrame((_, rawDelta) => {
    const body = assembly.current;
    if (!body || !(camera instanceof OrthographicCamera)) return;
    const delta = Math.min(rawDelta, 0.04);
    const input = gesture.current;
    let x = 0;
    let z = 0;
    let moving = false;
    const drag = MathUtils.clamp(
      -input.dragOffset / Math.max(150, size.width * 0.3),
      -1,
      1,
    );
    const neighbour =
      (activeIndex + (drag < 0 ? -1 : 1) + items.length) % items.length;
    for (let index = 0; index < items.length; index += 1) {
      const target = MathUtils.lerp(
        leafAngle(index, activeIndex),
        leafAngle(index, neighbour),
        Math.abs(drag),
      );
      const current = angles.current[index] ?? target;
      const angle = firstFrame.current
        ? target
        : MathUtils.damp(current, target, 5.8, delta);
      angles.current[index] = angle;
      if (Math.abs(angle - target) > 0.0002) moving = true;
      const dx = Math.cos(angle) * WIDTH;
      const dz = -Math.sin(angle) * WIDTH;
      const leaf = leaves.current[index];
      if (leaf) {
        leaf.position.set(x + dx / 2, 0, z + dz / 2);
        leaf.rotation.y = angle;
      }
      const joint = joints.current[index];
      if (joint) joint.position.set(x, 0, z);
      x += dx;
      z += dz;
    }

    // Every leaf ends at the next hinge. Framing follows the complete connected
    // object as the accordion opens, so a turn never clips a temporary spread.
    const extent = Math.max(WIDTH + 0.8, x + 1.4);
    const targetZoom = Math.min(
      size.width / extent,
      size.height / (HEIGHT + 1.38),
    );
    const nextZoom = firstFrame.current
      ? targetZoom
      : MathUtils.damp(camera.zoom, targetZoom, 7, delta);
    if (Math.abs(camera.zoom - nextZoom) > 0.005) moving = true;
    camera.zoom = nextZoom;
    camera.updateProjectionMatrix();
    body.position.x = -x / 2;
    body.position.y = 0.13;
    const targetY = -0.13 + (paused ? 0 : input.pointerX * 0.05);
    const targetX = 0.1 + (paused ? 0 : input.pointerY * 0.03);
    const nextY = MathUtils.damp(body.rotation.y, targetY, 5, delta);
    const nextX = MathUtils.damp(body.rotation.x, targetX, 5, delta);
    if (
      Math.abs(nextY - targetY) > 0.0001 ||
      Math.abs(nextX - targetX) > 0.0001
    )
      moving = true;
    body.rotation.set(nextX, nextY, -0.012);
    firstFrame.current = false;
    // Pausing stops video and pointer ambience, not a deliberate navigation.
    // A finite run of demand frames lets the selected leaf fully settle.
    if (moving) invalidate();
  });

  return (
    <>
      <ambientLight intensity={1.3} />
      <directionalLight
        position={[-3, 12, 7]}
        intensity={2.3}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-radius={4}
        shadow-camera-left={-11}
        shadow-camera-right={11}
        shadow-camera-top={9}
        shadow-camera-bottom={-9}
        shadow-bias={-0.001}
      />
      <directionalLight position={[6, 2, -4]} intensity={1.1} color="#e2e7ee" />
      <group ref={assembly}>
        {items.map((item, index) => (
          <group
            key={item.id}
            ref={(node) => {
              leaves.current[index] = node;
            }}
            onClick={(event) => {
              event.stopPropagation();
              if (!gesture.current.suppressClick && event.delta < 8)
                onSelect(index);
            }}
          >
            <LeafSurface
              item={item}
              active={index === activeIndex}
              paused={paused}
              index={index}
              onReady={onReady}
            />
          </group>
        ))}
        {items.map((item, index) =>
          index > 0 ? (
            <group
              key={`hinge-${item.id}`}
              ref={(node) => {
                joints.current[index] = node;
              }}
            >
              <mesh castShadow>
                <cylinderGeometry args={[0.018, 0.018, HEIGHT - 0.06, 8]} />
                <meshStandardMaterial
                  color="#bcbfb6"
                  metalness={0.55}
                  roughness={0.38}
                />
              </mesh>
            </group>
          ) : null,
        )}
      </group>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -HEIGHT / 2 - 0.02, -2]}
        receiveShadow
      >
        <planeGeometry args={[35, 24]} />
        <shadowMaterial transparent opacity={0.065} />
      </mesh>
      <WakeOnPointer gesture={gesture} />
    </>
  );
}

// Demand rendering otherwise sleeps after the physical folds have settled.
function WakeOnPointer({
  gesture,
}: {
  gesture: React.RefObject<GestureState>;
}) {
  const { gl, invalidate } = useThree();
  useEffect(() => {
    const parent = gl.domElement.parentElement?.parentElement;
    if (!parent) return;
    const wake = () => invalidate();
    parent.addEventListener("pointermove", wake, { passive: true });
    parent.addEventListener("pointerleave", wake, { passive: true });
    parent.addEventListener("pointerup", wake, { passive: true });
    return () => {
      parent.removeEventListener("pointermove", wake);
      parent.removeEventListener("pointerleave", wake);
      parent.removeEventListener("pointerup", wake);
    };
  }, [gl, invalidate, gesture]);
  return null;
}

function ContextMonitor({ onUnavailable }: { onUnavailable?: () => void }) {
  const gl = useThree((state) => state.gl);
  useEffect(() => {
    const lost = (event: Event) => {
      event.preventDefault();
      onUnavailable?.();
    };
    gl.domElement.addEventListener("webglcontextlost", lost);
    return () => gl.domElement.removeEventListener("webglcontextlost", lost);
  }, [gl, onUnavailable]);
  return null;
}

class SceneBoundary extends Component<
  { children: ReactNode; onUnavailable?: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: Error) {
    console.warn("Portfolio 3D scene unavailable:", error.message);
    this.props.onUnavailable?.();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export default function FolioScene({
  items,
  activeIndex,
  onSelect,
  reducedMotion,
  paused,
  onReady,
  onUnavailable,
}: FolioSceneProps) {
  const gesture = useRef<GestureState>({
    pointerX: 0,
    pointerY: 0,
    dragOffset: 0,
    dragging: false,
    suppressClick: false,
  });
  const down = useRef<{ x: number; y: number; pointerId: number } | null>(null);
  const finish = (event: ReactPointerEvent<HTMLDivElement>, cancel = false) => {
    const start = down.current;
    if (!start || start.pointerId !== event.pointerId) return;
    if (
      !cancel &&
      gesture.current.dragging &&
      Math.abs(gesture.current.dragOffset) > 42
    ) {
      const direction = gesture.current.dragOffset < 0 ? 1 : -1;
      onSelect((activeIndex + direction + items.length) % items.length);
    }
    gesture.current.suppressClick = gesture.current.dragging;
    gesture.current.dragging = false;
    gesture.current.dragOffset = 0;
    down.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
  };
  if (!items.length || reducedMotion) return null;

  return (
    <div
      data-folio-renderer="webgl"
      data-active-discipline={items[activeIndex]?.id}
      style={{
        width: "100%",
        height: "100%",
        touchAction: "pan-y",
        cursor: "grab",
      }}
      onPointerDown={(event) => {
        if (event.button !== 0 || !event.isPrimary) return;
        down.current = {
          x: event.clientX,
          y: event.clientY,
          pointerId: event.pointerId,
        };
        gesture.current.suppressClick = false;
      }}
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        gesture.current.pointerX = MathUtils.clamp(
          ((event.clientX - rect.left) / rect.width) * 2 - 1,
          -1,
          1,
        );
        gesture.current.pointerY = MathUtils.clamp(
          ((event.clientY - rect.top) / rect.height) * 2 - 1,
          -1,
          1,
        );
        const start = down.current;
        if (!start || start.pointerId !== event.pointerId) return;
        const dx = event.clientX - start.x;
        const dy = event.clientY - start.y;
        if (
          !gesture.current.dragging &&
          Math.abs(dx) > 8 &&
          Math.abs(dx) > Math.abs(dy) * 1.25
        ) {
          gesture.current.dragging = true;
          event.currentTarget.setPointerCapture(event.pointerId);
        }
        if (gesture.current.dragging) gesture.current.dragOffset = dx;
      }}
      onPointerUp={(event) => finish(event)}
      onPointerCancel={(event) => finish(event, true)}
      onPointerLeave={() => {
        gesture.current.pointerX = 0;
        gesture.current.pointerY = 0;
      }}
    >
      <SceneBoundary onUnavailable={onUnavailable}>
        <Canvas
          orthographic
          shadows={{ type: PCFShadowMap }}
          dpr={[1, 1.6]}
          frameloop="demand"
          camera={{ position: [0, 0.6, 18], zoom: 80, near: 0.1, far: 70 }}
          gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
          fallback="Use the discipline buttons to explore the work."
          onCreated={({ gl, camera }) => {
            gl.setClearColor(new Color("#ffffff"), 0);
            camera.lookAt(0, 0.05, -1.5);
          }}
        >
          <ContextMonitor onUnavailable={onUnavailable} />
          <Concertina
            items={items}
            activeIndex={activeIndex}
            onSelect={onSelect}
            paused={paused}
            onReady={onReady}
            gesture={gesture}
          />
        </Canvas>
      </SceneBoundary>
    </div>
  );
}
