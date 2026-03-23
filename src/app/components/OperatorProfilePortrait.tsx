import React, { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import { operatorProfileContent } from "../data/portfolio";
import { useWebGLAvailability } from "../lib/webgl";

const vertexShader = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vWorldPos;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPosition.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec3 uBase;
  uniform vec3 uAccent;
  uniform vec3 uGlow;

  varying vec3 vNormal;
  varying vec3 vWorldPos;

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 lightDirA = normalize(vec3(0.45, 0.85, 0.35));
    vec3 lightDirB = normalize(vec3(-0.7, 0.25, 0.55));

    float diffuseA = max(dot(normal, lightDirA), 0.0);
    float diffuseB = max(dot(normal, lightDirB), 0.0) * 0.55;
    float shade = diffuseA + diffuseB;
    float banded = floor(shade * 4.0) / 4.0;

    vec3 viewDir = normalize(cameraPosition - vWorldPos);
    float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 2.8);
    float scan = 0.92 + 0.08 * sin(vWorldPos.y * 36.0 + uTime * 3.8);
    float pulse = 0.5 + 0.5 * sin(uTime * 0.9 + vWorldPos.y * 2.2);
    float edgeGrid = step(0.92, fract(vWorldPos.y * 1.2 + uTime * 0.08)) * 0.06;

    vec3 base = mix(uBase, uAccent, banded);
    base += uGlow * fresnel * (0.75 + pulse * 0.25);
    base *= scan;
    base += edgeGrid;

    gl_FragColor = vec4(base, 1.0);
  }
`;

function createPortraitMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uBase: { value: new THREE.Color("#180105") },
      uAccent: { value: new THREE.Color("#c81d43") },
      uGlow: { value: new THREE.Color("#fff1f4") },
    },
    vertexShader,
    fragmentShader,
  });
}

function createWhiteMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uBase: { value: new THREE.Color("#c8c8c8") },
      uAccent: { value: new THREE.Color("#ffffff") },
      uGlow: { value: new THREE.Color("#ffffff") },
    },
    vertexShader,
    fragmentShader,
  });
}

function createBlackMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uBase: { value: new THREE.Color("#080808") },
      uAccent: { value: new THREE.Color("#1a1a1a") },
      uGlow: { value: new THREE.Color("#333333") },
    },
    vertexShader,
    fragmentShader,
  });
}

const WHITE_MESH_RE = /White_Plastic/i;
const BLACK_MESH_RE = /Tech.Glass|Camera.Paint/i;

type PortraitCameraConfig = {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
  near: number;
  far: number;
};

type LoadedPortrait = {
  scene: THREE.Group;
};

type PortraitBundle = {
  scene: THREE.Group;
  shaderMaterials: THREE.ShaderMaterial[];
  camera: PortraitCameraConfig;
};

function getPortraitSubjectRoot(root: THREE.Group) {
  return root.getObjectByName("Me") ?? root;
}

function buildPortraitBundle(gltfScene: THREE.Group): PortraitBundle {
  const root = gltfScene.clone(true);
  const wrapper = new THREE.Group();
  const shaderMaterials: THREE.ShaderMaterial[] = [];
  const subjectRoot = getPortraitSubjectRoot(root);

  subjectRoot.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) {
      return;
    }

    let ancestor: THREE.Object3D | null = child;
    let isWhitePart = false;
    let isBlackPart = false;
    while (ancestor) {
      if (WHITE_MESH_RE.test(ancestor.name)) { isWhitePart = true; break; }
      if (BLACK_MESH_RE.test(ancestor.name)) { isBlackPart = true; break; }
      ancestor = ancestor.parent;
    }
    const mat = isWhitePart ? createWhiteMaterial() : isBlackPart ? createBlackMaterial() : createPortraitMaterial();
    child.material = mat;
    shaderMaterials.push(mat);
    child.castShadow = false;
    child.receiveShadow = false;
  });

  root.updateWorldMatrix(true, true);
  subjectRoot.updateWorldMatrix(true, true);

  const subjectClone = subjectRoot.clone(true);
  const bounds = new THREE.Box3().setFromObject(subjectClone);
  const center = bounds.getCenter(new THREE.Vector3());
  const size = bounds.getSize(new THREE.Vector3());
  // Scale: model normalised to 2.8 units tall.
  // Camera pulls back enough to show head + full shoulders, with torso cropping at bottom.
  const scale = 3.4 / (size.y || 1);
  const normalizedSize = size.clone().multiplyScalar(scale);
  const portraitFov = 48;

  subjectClone.position.sub(center);
  subjectClone.scale.setScalar(scale);
  subjectClone.rotation.y = -0.2;
  wrapper.add(subjectClone);

  // Model centred at 0 → top of head ≈ +1.7, waist ≈ 0, feet ≈ -1.7
  // Camera near waist aiming at chin — pushes head/cap into upper half of frame
  const targetY = normalizedSize.y * 0.08;  // aim at neck/upper chest
  const camY    = normalizedSize.y * 0.03;  // camera just below neck
  const camZ    = normalizedSize.y * 0.92;  // pulled back to show chest text

  return {
    scene: wrapper,
    shaderMaterials,
    camera: {
      position: [0.14, camY, camZ],
      target: [0.04, targetY, 0.0],
      fov: portraitFov,
      near: 0.1,
      far: 100,
    },
  };
}

function PortraitCameraRig({ config }: { config: PortraitCameraConfig }) {
  const { camera, size } = useThree();

  useEffect(() => {
    if (!(camera instanceof THREE.PerspectiveCamera)) {
      return;
    }

    camera.position.set(...config.position);
    camera.fov = config.fov;
    camera.near = config.near;
    camera.far = config.far;
    camera.aspect = size.width / Math.max(size.height, 1);
    camera.lookAt(...config.target);
    camera.updateProjectionMatrix();
  }, [camera, config, size.height, size.width]);

  return null;
}

function ModelPortrait() {
  const groupRef = useRef<THREE.Group>(null);
  const gltf = useLoader(GLTFLoader, "/models/profile/2022-01-15-edit.gltf") as LoadedPortrait;
  const portraitBundle = useMemo(() => buildPortraitBundle(gltf.scene), [gltf]);

  useEffect(() => {
    return () => {
      portraitBundle.shaderMaterials.forEach((material) => material.dispose());
    };
  }, [portraitBundle]);

  useFrame(({ clock }) => {
    const root = groupRef.current;
    if (!root) {
      return;
    }

    root.rotation.y = Math.sin(clock.getElapsedTime() * 0.2) * 0.02;
    root.rotation.x = Math.cos(clock.getElapsedTime() * 0.18) * 0.008;
    root.position.y = Math.sin(clock.getElapsedTime() * 0.55) * 0.015 - 0.03;

    portraitBundle.shaderMaterials.forEach((material) => {
      material.uniforms.uTime.value = clock.getElapsedTime();
    });
  });

  return (
    <>
      <PortraitCameraRig config={portraitBundle.camera} />
      <primitive ref={groupRef} object={portraitBundle.scene} />
    </>
  );
}

export function OperatorProfilePortrait() {
  const hasWebGL = useWebGLAvailability();

  return (
    <div className="relative overflow-hidden border border-[#ff003c]/22 bg-black/95">
      <div
        className="pointer-events-none absolute inset-0 z-10 opacity-[0.08]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,0,60,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(255,0,60,0.16) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />
      <div className="relative aspect-[10/8] w-full">
        {hasWebGL ? (
          <Canvas camera={{ position: [0, 0.2, 4.6], fov: 28 }} dpr={[1, 1.5]}>
            <color attach="background" args={["#050505"]} />
            <ambientLight intensity={0.2} />
            <directionalLight position={[2, 3, 3]} intensity={0.4} />
            <ModelPortrait />
          </Canvas>
        ) : (
          <div
            className="absolute inset-0 bg-center bg-cover"
            style={{ backgroundImage: "url('/profile-preview.jpg')" }}
          />
        )}
      </div>
      <div className="relative z-20 border-t border-[#ff003c]/18 bg-black/95 px-4 py-3">
        <div className="flex items-center justify-between gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
          <span>{operatorProfileContent.portraitFooterLeft}</span>
          <span className="text-[#ff003c]">{operatorProfileContent.portraitFooterRight}</span>
        </div>
      </div>
    </div>
  );
}
