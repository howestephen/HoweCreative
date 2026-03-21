import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text3D, Center } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'motion/react';

// Simple 3D Head that morphs into skill icons
function MorphingHead() {
  const meshRef = useRef<THREE.Mesh>(null);
  const [morphStage, setMorphStage] = useState(0);
  const [time, setTime] = useState(0);

  useFrame((state, delta) => {
    if (meshRef.current) {
      setTime((t) => t + delta);
      
      // Rotate slowly
      meshRef.current.rotation.y = Math.sin(time * 0.3) * 0.5;
      meshRef.current.rotation.x = Math.sin(time * 0.2) * 0.2;
      
      // Pulse effect
      const scale = 1 + Math.sin(time * 1.5) * 0.05;
      meshRef.current.scale.set(scale, scale, scale);
    }
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setMorphStage((prev) => (prev + 1) % 6);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Different geometries for different skills
  const getGeometry = () => {
    switch (morphStage) {
      case 0: // Head (sphere)
        return <sphereGeometry args={[1, 32, 32]} />;
      case 1: // Figma (rounded box)
        return <boxGeometry args={[1.5, 1.5, 0.3]} />;
      case 2: // Motion Graphics (torus)
        return <torusGeometry args={[1, 0.4, 16, 100]} />;
      case 3: // 3D Design (octahedron)
        return <octahedronGeometry args={[1.2, 0]} />;
      case 4: // React (icosahedron)
        return <icosahedronGeometry args={[1.2, 0]} />;
      case 5: // Code (torus knot)
        return <torusKnotGeometry args={[0.8, 0.3, 100, 16]} />;
      default:
        return <sphereGeometry args={[1, 32, 32]} />;
    }
  };

  return (
    <mesh ref={meshRef} castShadow>
      {getGeometry()}
      <meshStandardMaterial
        color="#dc143c"
        metalness={0.8}
        roughness={0.2}
        emissive="#8b0a1a"
        emissiveIntensity={0.3}
      />
    </mesh>
  );
}

// Floating skill labels
function SkillLabel({ position, text, delay }: { position: [number, number, number]; text: string; delay: number }) {
  const textRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (textRef.current) {
      const time = state.clock.getElapsedTime();
      textRef.current.position.y = position[1] + Math.sin(time * 0.5 + delay) * 0.2;
    }
  });

  return (
    <group ref={textRef} position={position}>
      <Center>
        <Text3D
          font="/fonts/helvetiker_regular.typeface.json"
          size={0.2}
          height={0.05}
          curveSegments={12}
        >
          {text}
          <meshStandardMaterial color="#ff1744" emissive="#ff1744" emissiveIntensity={0.5} />
        </Text3D>
      </Center>
    </group>
  );
}

// Grid floor
function GridFloor() {
  return (
    <gridHelper args={[20, 20, '#dc143c', '#8b0a1a']} position={[0, -2, 0]} />
  );
}

export function Hero3D() {
  const skills = [
    'FIGMA',
    'MOTION',
    '3D',
    'REACT',
    'TYPESCRIPT',
    'AI WORKFLOWS'
  ];

  const [currentSkill, setCurrentSkill] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSkill((prev) => (prev + 1) % skills.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [skills.length]);

  return (
    <div className="relative w-full h-screen bg-[#0a0a0f]">
      {/* Graph paper background */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(220, 20, 60, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(220, 20, 60, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px'
        }}
      />
      
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        shadows
        className="absolute inset-0"
      >
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#dc143c" castShadow />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ff1744" />
        
        <MorphingHead />
        <GridFloor />
        
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 3}
        />
      </Canvas>

      {/* Text overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center z-10 mb-8"
        >
          <h1 className="text-6xl md:text-8xl font-bold mb-4 tracking-tighter">
            <span className="text-[#e8e8f0]">SYSTEMS</span>
            <br />
            <span className="text-[#dc143c]">DESIGNER</span>
          </h1>
          <div className="h-12 flex items-center justify-center">
            <motion.p
              key={currentSkill}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-xl md:text-2xl text-[#ff1744] font-mono tracking-wider"
            >
              {skills[currentSkill]}
            </motion.p>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-6 h-10 border-2 border-[#dc143c] rounded-full flex items-start justify-center p-2"
          >
            <div className="w-1 h-2 bg-[#dc143c] rounded-full" />
          </motion.div>
        </motion.div>
      </div>

      {/* Corner technical details */}
      <div className="absolute top-4 left-4 font-mono text-xs text-[#dc143c] opacity-60">
        <p>[PROTOTYPE_DESIGN]</p>
        <p>[3D_MOTION_GRAPHICS]</p>
        <p>[AI_WORKFLOWS]</p>
      </div>
      
      <div className="absolute top-4 right-4 font-mono text-xs text-[#dc143c] opacity-60 text-right">
        <p>[SYSTEMS_V2.0]</p>
        <p>[PORTFOLIO_2026]</p>
        <p>[CYBERPUNK_MODE]</p>
      </div>
    </div>
  );
}
