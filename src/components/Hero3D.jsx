import { Suspense, useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';
import { useScroll } from './ScrollContext';

// Module-level reusable vectors eliminate per-frame heap allocations inside useFrame
// Start position hidden off the top-left corner at scrollY=0, gliding in smoothly on scroll
const MID_POS = new THREE.Vector3(0, 0, 0);
const END_POS = new THREE.Vector3(2.1, -1.1, -1.2);

const DRONE_BASE_SCALE = 0.01;
const DRONE_START_SCALE = new THREE.Vector3().setScalar(DRONE_BASE_SCALE * 0.35);
const DRONE_MID_SCALE = new THREE.Vector3().setScalar(DRONE_BASE_SCALE);
const DRONE_END_SCALE = new THREE.Vector3().setScalar(DRONE_BASE_SCALE * 0.85);

const PLACEHOLDER_BASE_SCALE = 1.2;
const PLACEHOLDER_START_SCALE = new THREE.Vector3().setScalar(PLACEHOLDER_BASE_SCALE * 0.35);
const PLACEHOLDER_MID_SCALE = new THREE.Vector3().setScalar(PLACEHOLDER_BASE_SCALE);
const PLACEHOLDER_END_SCALE = new THREE.Vector3().setScalar(PLACEHOLDER_BASE_SCALE * 0.85);

const SCRATCH_START_POS = new THREE.Vector3(-2.5, 1.68, -0.4);
const SCRATCH_POS = new THREE.Vector3();
const SCRATCH_SCALE = new THREE.Vector3();
const INITIAL_POS_TUPLE = [-2.5, 1.68, -0.4];
const INITIAL_ROT_TUPLE = [0, -Math.PI / 2, 0];

const updateFlightTransform = (
  group,
  scrollProgress,
  delta,
  viewportWidth,
  startScale,
  midScale,
  endScale,
  snap = false
) => {
  // Park completely off top-left corner at scrollY = 0 on both wide desktop and mobile
  SCRATCH_START_POS.set(-Math.max(1.5, viewportWidth * 0.60), 1.68, -0.4);

  if (scrollProgress < 0.5) {
    const t = scrollProgress * 2;
    SCRATCH_POS.lerpVectors(SCRATCH_START_POS, MID_POS, t);
    SCRATCH_SCALE.lerpVectors(startScale, midScale, t);
  } else {
    const t = (scrollProgress - 0.5) * 2;
    SCRATCH_POS.lerpVectors(MID_POS, END_POS, t);
    SCRATCH_SCALE.lerpVectors(midScale, endScale, t);
  }

  if (snap) {
    group.position.copy(SCRATCH_POS);
    group.scale.copy(SCRATCH_SCALE);
  } else {
    group.position.x = THREE.MathUtils.damp(group.position.x, SCRATCH_POS.x, 3.8, delta);
    group.position.y = THREE.MathUtils.damp(group.position.y, SCRATCH_POS.y, 3.8, delta);
    group.position.z = THREE.MathUtils.damp(group.position.z, SCRATCH_POS.z, 3.8, delta);

    group.scale.x = THREE.MathUtils.damp(group.scale.x, SCRATCH_SCALE.x, 3.8, delta);
    group.scale.y = THREE.MathUtils.damp(group.scale.y, SCRATCH_SCALE.y, 3.8, delta);
    group.scale.z = THREE.MathUtils.damp(group.scale.z, SCRATCH_SCALE.z, 3.8, delta);
  }

  group.rotation.set(0, -Math.PI / 2, 0);
};

const DroneModel = () => {
  const groupRef = useRef();
  const initializedRef = useRef(false);
  const { getScrollMetrics } = useScroll();
  const [modelError, setModelError] = useState(null);
  const [scene, setScene] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const loader = new GLTFLoader();

    loader.load(
      '/models/drone-frame.glb',
      (gltf) => {
        if (!isMounted) return;

        gltf.scene.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = false;
            child.receiveShadow = false;
            child.frustumCulled = false;

            if (child.material) {
              const mats = Array.isArray(child.material) ? child.material : [child.material];
              mats.forEach((mat) => {
                mat.metalness = 0.8;
                mat.roughness = 0.2;
                mat.transparent = true;
                mat.opacity = 1.0;
              });
            }

            if (child.geometry) {
              child.geometry.computeBoundingSphere();
              child.geometry.computeBoundingBox();

              const oldEdges = child.children.find((c) => c.isLineSegments);
              if (oldEdges) child.remove(oldEdges);

              const edgesGeometry = new THREE.EdgesGeometry(child.geometry, 40);
              const edgesMaterial = new THREE.LineBasicMaterial({
                color: new THREE.Color('#00E5FF'),
                transparent: true,
                opacity: 0.6,
              });
              const edgeLines = new THREE.LineSegments(edgesGeometry, edgesMaterial);
              child.add(edgeLines);
            }
          }
        });

        setScene(gltf.scene);
      },
      undefined,
      (error) => {
        if (!isMounted) return;
        console.warn('GLTF load failed:', error);
        setModelError(error);
      }
    );

    return () => {
      isMounted = false;
    };
  }, []);

  // Dispose GLB GPU resources cleanly on unmount
  useEffect(() => {
    return () => {
      if (!scene) return;
      scene.traverse((child) => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          const mats = Array.isArray(child.material) ? child.material : [child.material];
          mats.forEach((mat) => mat.dispose());
        }
      });
    };
  }, [scene]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const { scrollProgress } = getScrollMetrics();
    const shouldSnap = !initializedRef.current;
    initializedRef.current = true;
    updateFlightTransform(
      groupRef.current,
      scrollProgress,
      delta,
      state.viewport.width,
      DRONE_START_SCALE,
      DRONE_MID_SCALE,
      DRONE_END_SCALE,
      shouldSnap
    );
  });

  if (modelError || !scene) {
    return <DronePlaceholder />;
  }

  return (
    <group
      ref={groupRef}
      position={INITIAL_POS_TUPLE}
      rotation={INITIAL_ROT_TUPLE}
      scale={DRONE_BASE_SCALE * 0.35}
    >
      <primitive object={scene} dispose={null} />
    </group>
  );
};

const DronePlaceholder = () => {
  const groupRef = useRef();
  const initializedRef = useRef(false);
  const { getScrollMetrics } = useScroll();

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const { scrollProgress } = getScrollMetrics();
    const shouldSnap = !initializedRef.current;
    initializedRef.current = true;
    updateFlightTransform(
      groupRef.current,
      scrollProgress,
      delta,
      state.viewport.width,
      PLACEHOLDER_START_SCALE,
      PLACEHOLDER_MID_SCALE,
      PLACEHOLDER_END_SCALE,
      shouldSnap
    );
  });

  return (
    <group
      ref={groupRef}
      position={INITIAL_POS_TUPLE}
      rotation={INITIAL_ROT_TUPLE}
      scale={PLACEHOLDER_BASE_SCALE * 0.35}
    >
      <group rotation={[-Math.PI / 2, 0, 0]}>
        <mesh>
          <cylinderGeometry args={[0.08, 0.08, 1.2, 8]} />
          <meshStandardMaterial color="#ffffff" metalness={0.1} roughness={0.2} />
        </mesh>
      </group>
      <group rotation={[0, 0, Math.PI / 4]}>
        <mesh>
          <cylinderGeometry args={[0.06, 0.06, 1.2, 8]} />
          <meshStandardMaterial color="#222222" metalness={0.5} roughness={0.6} />
        </mesh>
      </group>
      <group rotation={[0, 0, -Math.PI / 4]}>
        <mesh>
          <cylinderGeometry args={[0.06, 0.06, 1.2, 8]} />
          <meshStandardMaterial color="#222222" metalness={0.5} roughness={0.6} />
        </mesh>
      </group>
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.15, 16]} />
        <meshStandardMaterial color="#dddddd" metalness={0.2} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.08, 0]}>
        <octahedronGeometry args={[0.12, 0]} />
        <meshStandardMaterial color="#050505" metalness={0.05} roughness={0.1} emissive="#00E5FF" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0, -0.08, 0]}>
        <octahedronGeometry args={[0.12, 0]} />
        <meshStandardMaterial color="#050505" metalness={0.05} roughness={0.1} emissive="#FF003C" emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
};

const createCircleTexture = () => {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const context = canvas.getContext('2d');
  const gradient = context.createRadialGradient(16, 16, 0, 16, 16, 16);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.2, 'rgba(255,255,255,0.8)');
  gradient.addColorStop(0.5, 'rgba(255,255,255,0.2)');
  gradient.addColorStop(1, 'rgba(0,0,0,0)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, 32, 32);
  return new THREE.CanvasTexture(canvas);
};

const generateStarfield = () => {
  const count = 2800;
  const arr = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const radius = 60 + Math.random() * 250;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    arr[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    arr[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    arr[i * 3 + 2] = radius * Math.cos(phi);

    const colorType = Math.random();
    if (colorType < 0.70) {
      colors[i * 3] = 0.9;
      colors[i * 3 + 1] = 0.95;
      colors[i * 3 + 2] = 1.0;
    } else if (colorType < 0.90) {
      colors[i * 3] = 0.5;
      colors[i * 3 + 1] = 0.7;
      colors[i * 3 + 2] = 1.0;
    } else {
      colors[i * 3] = 0.6;
      colors[i * 3 + 1] = 0.2;
      colors[i * 3 + 2] = 0.8;
    }
  }
  return { positions: arr, colors };
};

const INITIAL_STARFIELD = generateStarfield();

const Starfield = () => {
  const starsRef = useRef();
  const { isWarping } = useScroll();
  const warpSpeed = useRef(0);
  const texture = useMemo(() => createCircleTexture(), []);
  const positions = INITIAL_STARFIELD;

  useEffect(() => {
    return () => {
      if (texture) texture.dispose();
    };
  }, [texture]);

  useFrame((_, delta) => {
    const targetWarp = isWarping ? 1 : 0;
    warpSpeed.current = THREE.MathUtils.damp(warpSpeed.current, targetWarp, 4.5, delta);

    if (starsRef.current) {
      starsRef.current.rotation.y += 0.00002 + warpSpeed.current * 0.035;
      starsRef.current.rotation.x += 0.00001 + warpSpeed.current * 0.015;
      starsRef.current.rotation.z += warpSpeed.current * 0.01;
    }
  });

  return (
    <points ref={starsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions.positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[positions.colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={1}
        vertexColors
        transparent
        opacity={0.9}
        sizeAttenuation
        map={texture}
        alphaTest={0.01}
      />
    </points>
  );
};

const generateNebula = () => {
  const count = 650;
  const arr = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const radius = 25 + Math.random() * 65;
    const theta = Math.random() * Math.PI * 2;
    const phi = (Math.random() - 0.5) * Math.PI * 0.7;

    arr[i * 3] = radius * Math.cos(phi) * Math.sin(theta);
    arr[i * 3 + 1] = radius * Math.sin(phi);
    arr[i * 3 + 2] = radius * Math.cos(phi) * Math.cos(theta);

    const isCyan = Math.random() > 0.45;
    if (isCyan) {
      colors[i * 3] = 0.0;
      colors[i * 3 + 1] = 0.9;
      colors[i * 3 + 2] = 1.0;
    } else {
      colors[i * 3] = 1.0;
      colors[i * 3 + 1] = 0.0;
      colors[i * 3 + 2] = 0.24;
    }
  }
  return { positions: arr, colors };
};

const INITIAL_NEBULA = generateNebula();

const Nebula = () => {
  const nebulaRef = useRef();
  const { isWarping } = useScroll();
  const warpSpeed = useRef(0);
  const texture = useMemo(() => createCircleTexture(), []);
  const positions = INITIAL_NEBULA;

  useEffect(() => {
    return () => {
      if (texture) texture.dispose();
    };
  }, [texture]);

  useFrame((_, delta) => {
    const targetWarp = isWarping ? 1 : 0;
    warpSpeed.current = THREE.MathUtils.damp(warpSpeed.current, targetWarp, 4.5, delta);

    if (nebulaRef.current) {
      nebulaRef.current.rotation.y -= 0.00004 + warpSpeed.current * 0.025;
      nebulaRef.current.rotation.z += 0.00002 + warpSpeed.current * 0.01;
    }
  });

  return (
    <points ref={nebulaRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions.positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[positions.colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={3}
        vertexColors
        transparent
        opacity={0.35}
        sizeAttenuation
        depthWrite={false}
        map={texture}
        alphaTest={0.01}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

const generateAmbient = () => {
  const count = 350;
  const arr = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    arr[i * 3] = (Math.random() - 0.5) * 15;
    arr[i * 3 + 1] = (Math.random() - 0.5) * 15;
    arr[i * 3 + 2] = (Math.random() - 0.5) * 15;
  }
  return arr;
};

const INITIAL_AMBIENT = generateAmbient();

const AmbientParticles = () => {
  const pointsRef = useRef();
  const texture = useMemo(() => createCircleTexture(), []);
  const positions = INITIAL_AMBIENT;

  useEffect(() => {
    return () => {
      if (texture) texture.dispose();
    };
  }, [texture]);

  useFrame((_, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.006;
      pointsRef.current.rotation.x += delta * 0.003;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#ffffff"
        size={0.15}
        transparent
        opacity={0.6}
        sizeAttenuation
        depthWrite={false}
        map={texture}
        alphaTest={0.01}
      />
    </points>
  );
};

const generateAsteroids = (count) => {
  const temp = [];
  for (let i = 0; i < count; i++) {
    // Keep asteroids behind camera focal corridor so large chunks never clutter foreground text
    const radius = 16 + Math.random() * 44;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta);
    const z = radius * Math.cos(phi);

    temp.push({
      position: new THREE.Vector3(x, y, z),
      rotation: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI),
      scale: new THREE.Vector3(
        Math.random() * 0.5 + 0.15,
        Math.random() * 0.5 + 0.15,
        Math.random() * 0.5 + 0.15
      )
    });
  }
  return temp;
};

const INITIAL_ASTEROIDS = generateAsteroids(150);

const Asteroids = () => {
  const meshRef = useRef();
  const { isWarping } = useScroll();
  const warpSpeed = useRef(0);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const asteroids = INITIAL_ASTEROIDS;

  useEffect(() => {
    if (meshRef.current) {
      asteroids.forEach((asteroid, i) => {
        dummy.position.copy(asteroid.position);
        dummy.rotation.copy(asteroid.rotation);
        dummy.scale.copy(asteroid.scale);
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(i, dummy.matrix);
      });
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [asteroids, dummy]);

  useFrame((_, delta) => {
    const targetWarp = isWarping ? 1 : 0;
    warpSpeed.current = THREE.MathUtils.damp(warpSpeed.current, targetWarp, 4.5, delta);

    if (meshRef.current) {
      meshRef.current.rotation.y += 0.0003 + warpSpeed.current * 0.035;
      meshRef.current.rotation.x += 0.0001 + warpSpeed.current * 0.018;
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[null, null, INITIAL_ASTEROIDS.length]}>
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial
        color="#4b5563"
        roughness={0.85}
        metalness={0.2}
      />
    </instancedMesh>
  );
};

// Generates hyperspace warp lines with continuous independent streak cycles (zero global pop stutter)
const WARP_COUNT = 160;

const createWarpData = () => {
  const data = [];
  const positions = new Float32Array(WARP_COUNT * 6);
  for (let i = 0; i < WARP_COUNT; i++) {
    const radius = 1.2 + Math.random() * 12;
    const theta = Math.random() * Math.PI * 2;
    const x = radius * Math.cos(theta);
    const y = radius * Math.sin(theta);
    const z = -60 + Math.random() * 55;
    const length = 10 + Math.random() * 15;
    const speed = 70 + Math.random() * 50;

    data.push({ x, y, z, length, speed });

    positions[i * 6] = x;
    positions[i * 6 + 1] = y;
    positions[i * 6 + 2] = z;

    positions[i * 6 + 3] = x;
    positions[i * 6 + 4] = y;
    positions[i * 6 + 5] = z + length;
  }
  return { data, positions };
};

const INITIAL_WARP_DATA = createWarpData();

const WarpStreaks = () => {
  const linesRef = useRef();
  const geoRef = useRef();
  const { isWarping } = useScroll();
  const warpAlpha = useRef(0);

  useFrame((_, delta) => {
    const targetAlpha = isWarping ? 0.9 : 0;
    warpAlpha.current = THREE.MathUtils.damp(warpAlpha.current, targetAlpha, 5.0, delta);

    if (linesRef.current) {
      linesRef.current.material.opacity = warpAlpha.current;

      if (warpAlpha.current > 0.01 && geoRef.current) {
        const posAttr = geoRef.current.attributes.position;
        const array = posAttr.array;
        const data = INITIAL_WARP_DATA.data;

        for (let i = 0; i < WARP_COUNT; i++) {
          const item = data[i];
          item.z += delta * item.speed;

          if (item.z > 8) {
            item.z = -65 - Math.random() * 20;
          }

          array[i * 6 + 2] = item.z;
          array[i * 6 + 5] = item.z + item.length;
        }
        posAttr.needsUpdate = true;
      }
    }
  });

  return (
    <lineSegments ref={linesRef}>
      <bufferGeometry ref={geoRef}>
        <bufferAttribute attach="attributes-position" args={[INITIAL_WARP_DATA.positions, 3]} />
      </bufferGeometry>
      <lineBasicMaterial
        color="#00E5FF"
        transparent
        opacity={0}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </lineSegments>
  );
};

const CameraWarpController = () => {
  const { isWarping } = useScroll();
  const warpIntensity = useRef(0);
  const lastFov = useRef(35);
  const defaultFov = 35;

  useFrame((state, delta) => {
    const targetWarp = isWarping ? 1 : 0;
    warpIntensity.current = THREE.MathUtils.damp(warpIntensity.current, targetWarp, 4.0, delta);

    const nextFov = defaultFov + warpIntensity.current * 18;
    // Update projection matrix only when FOV actually changes (saves work when idle)
    if (Math.abs(nextFov - lastFov.current) > 0.005) {
      const cam = state.camera;
      if (cam && 'fov' in cam) {
        cam.fov = nextFov;
        cam.updateProjectionMatrix();
        lastFov.current = nextFov;
      }
    }
  });

  return null;
};

const Hero3DCanvas = () => {
  const onCreated = ({ gl }) => {
    gl.setClearColor(0x000000, 0);
    gl.domElement.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
      console.warn('WebGL context lost');
    });
    gl.domElement.addEventListener('webglcontextrestored', () => {
      console.log('WebGL context restored');
    });
  };

  return (
    <Canvas
      camera={{ position: [0, 1.5, 4], fov: 35 }}
      gl={{
        antialias: false,
        alpha: true,
        preserveDrawingBuffer: false,
        powerPreference: 'high-performance',
        stencil: false,
        depth: true
      }}
      style={{ touchAction: 'none' }}
      dpr={[1, 1.25]}
      onCreated={onCreated}
    >
      <fog attach="fog" args={['#000000', 50, 200]} />

      {/* Consolidated high-contrast aerospace rim & fill lighting */}
      <ambientLight color="#1a1a1a" intensity={0.45} />
      <directionalLight color="#ffffff" intensity={3.5} position={[15, 30, 15]} />
      <directionalLight color="#ffffff" intensity={2.2} position={[-15, 20, -15]} />
      <directionalLight color="#ffffff" intensity={1.8} position={[0, -25, -10]} />
      <hemisphereLight color="#00E5FF" groundColor="#FF003C" intensity={0.25} />

      <CameraWarpController />
      <Starfield />
      <Nebula />
      <AmbientParticles />
      <Asteroids />
      <WarpStreaks />
      <DroneModel />

      <OrbitControls
        enablePan={false}
        enableZoom={false}
        enableRotate={true}
        autoRotate={false}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 1.8}
      />
    </Canvas>
  );
};

export const Hero3D = () => (
  <div className="absolute inset-0 -z-10 w-full h-full pointer-events-none">
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        background: `
          radial-gradient(circle at 15% 50%, rgba(20, 5, 40, 0.45) 0%, transparent 50%),
          radial-gradient(circle at 85% 30%, rgba(5, 20, 40, 0.45) 0%, transparent 50%),
          linear-gradient(180deg, #010205 0%, #000000 100%)
        `
      }}
    />
    <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-sensor/30 font-mono">INITIALIZING HUD...</div>}>
      <Hero3DCanvas />
    </Suspense>
  </div>
);

export default Hero3D;
