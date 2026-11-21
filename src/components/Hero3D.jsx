import { Suspense, useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';
import { useScroll } from './ScrollContext';

const sectionConfigs = {
  hero: {
    cameraPos: [0, 1.8, 4.5],
    fov: 45,
    target: [0, 0, 0],
    rotation: [0, 0, 0],
    highlight: null,
  },
  about: {
    cameraPos: [2, 1.5, 2],
    fov: 35,
    target: [0, 0.3, 0],
    rotation: [0, -Math.PI / 6, 0],
    highlight: 'body',
  },
  skills: {
    cameraPos: [0, 2, 2.5],
    fov: 32,
    target: [0, 0.5, 0],
    rotation: [-Math.PI / 8, 0, 0],
    highlight: 'motor',
  },
  projects: {
    cameraPos: [-2, 1, 2],
    fov: 35,
    target: [0, -0.2, 0],
    rotation: [0, Math.PI / 6, 0],
    highlight: 'prop',
  },
  contact: {
    cameraPos: [0, 1, 3],
    fov: 40,
    target: [0, 0, 0],
    rotation: [0, 0, 0],
    highlight: null,
  },
};

const DroneModel = () => {
  const groupRef = useRef();
  const { activeSection, sectionProgress, scrollProgress } = useScroll();
  const [modelError, setModelError] = useState(null);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [scene, setScene] = useState(null);
  const targetConfig = sectionConfigs[activeSection] || sectionConfigs.hero;

  useEffect(() => {
    const loader = new GLTFLoader();
    loader.load(
      '/models/drone-frame.glb',
      (gltf) => {
        setScene(gltf.scene);
        setModelLoaded(true);
      },
      undefined,
      (error) => {
        console.warn('GLTF load failed:', error);
        setModelError(error);
      }
    );
  }, []);

  const meshes = useMemo(() => {
    if (!scene) return [];
    const meshList = [];
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = false;
        child.receiveShadow = false;
        child.frustumCulled = false;
        meshList.push(child);
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

          const oldEdges = child.children.find(c => c.isLineSegments);
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
    return meshList;
  }, [scene]);

  useFrame((state, delta) => {
    if (groupRef.current) {
      const startPos = new THREE.Vector3(-1.5, 1.5, 0); 
      const midPos = new THREE.Vector3(0, 0, 0);    
      const endPos = new THREE.Vector3(2.0, -1.8, 1.5);   

      const baseScale = 0.01;
      const startScale = new THREE.Vector3().setScalar(baseScale * 0.4); 
      const midScale = new THREE.Vector3().setScalar(baseScale);          
      const endScale = new THREE.Vector3().setScalar(baseScale * 1.6);    

      let targetPos = new THREE.Vector3();
      let targetScale = new THREE.Vector3();

      if (scrollProgress < 0.5) {
        const t = scrollProgress * 2;
        targetPos.lerpVectors(startPos, midPos, t);
        targetScale.lerpVectors(startScale, midScale, t);
      } else {
        const t = (scrollProgress - 0.5) * 2;
        targetPos.lerpVectors(midPos, endPos, t);
        targetScale.lerpVectors(midScale, endScale, t);
      }

      // Delta-based liquid smoothing (independent of monitor refresh rate)
      groupRef.current.position.x = THREE.MathUtils.damp(groupRef.current.position.x, targetPos.x, 3.8, delta);
      groupRef.current.position.y = THREE.MathUtils.damp(groupRef.current.position.y, targetPos.y, 3.8, delta);
      groupRef.current.position.z = THREE.MathUtils.damp(groupRef.current.position.z, targetPos.z, 3.8, delta);

      groupRef.current.scale.x = THREE.MathUtils.damp(groupRef.current.scale.x, targetScale.x, 3.8, delta);
      groupRef.current.scale.y = THREE.MathUtils.damp(groupRef.current.scale.y, targetScale.y, 3.8, delta);
      groupRef.current.scale.z = THREE.MathUtils.damp(groupRef.current.scale.z, targetScale.z, 3.8, delta);

      groupRef.current.rotation.set(0, -Math.PI / 2, 0);
    }

    const highlightType = targetConfig.highlight;
    if (highlightType && meshes.length > 0) {
      const highlightProgress = sectionProgress[activeSection] || 0;
      meshes.forEach((mesh) => {
        const name = (mesh.name || '').toLowerCase();
        const isTarget = name.includes(highlightType);
        if (mesh.material) {
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          mats.forEach((mat) => {
            if (isTarget) {
              mat.emissiveIntensity = THREE.MathUtils.lerp(
                mat.emissiveIntensity || 0,
                1.2,
                highlightProgress * 0.5
              );
              mat.opacity = 1;
            } else {
              mat.opacity = THREE.MathUtils.lerp(1, 0.3, highlightProgress * 0.5);
            }
          });
        }
      });
    }
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!modelLoaded && !modelError) {
        setModelError(new Error('Loading timeout'));
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [modelLoaded, modelError]);

  if (modelError || !modelLoaded) {
    return <DronePlaceholder />;
  }

  return (
    <group ref={groupRef} scale={0.01}>
      <primitive object={scene} dispose={null} />
    </group>
  );
};

const DronePlaceholder = () => {
  const groupRef = useRef();
  const { scrollProgress } = useScroll();

  useFrame((state, delta) => {
    if (groupRef.current) {
      const startPos = new THREE.Vector3(-1.5, 1.5, 0);
      const midPos = new THREE.Vector3(0, 0, 0);
      const endPos = new THREE.Vector3(2.0, -1.8, 1.5);

      const baseScale = 1.2;
      const startScale = new THREE.Vector3().setScalar(baseScale * 0.4);
      const midScale = new THREE.Vector3().setScalar(baseScale);
      const endScale = new THREE.Vector3().setScalar(baseScale * 1.6);

      let targetPos = new THREE.Vector3();
      let targetScale = new THREE.Vector3();
      
      if (scrollProgress < 0.5) {
        const t = scrollProgress * 2;
        targetPos.lerpVectors(startPos, midPos, t);
        targetScale.lerpVectors(startScale, midScale, t);
      } else {
        const t = (scrollProgress - 0.5) * 2;
        targetPos.lerpVectors(midPos, endPos, t);
        targetScale.lerpVectors(midScale, endScale, t);
      }

      groupRef.current.position.x = THREE.MathUtils.damp(groupRef.current.position.x, targetPos.x, 3.8, delta);
      groupRef.current.position.y = THREE.MathUtils.damp(groupRef.current.position.y, targetPos.y, 3.8, delta);
      groupRef.current.position.z = THREE.MathUtils.damp(groupRef.current.position.z, targetPos.z, 3.8, delta);

      groupRef.current.scale.x = THREE.MathUtils.damp(groupRef.current.scale.x, targetScale.x, 3.8, delta);
      groupRef.current.scale.y = THREE.MathUtils.damp(groupRef.current.scale.y, targetScale.y, 3.8, delta);
      groupRef.current.scale.z = THREE.MathUtils.damp(groupRef.current.scale.z, targetScale.z, 3.8, delta);

      groupRef.current.rotation.set(0, -Math.PI / 2, 0);
    }
  });

  return (
    <group ref={groupRef} scale={1.2}>
      <group rotation={[-Math.PI / 2, 0, 0]}>
        <mesh>
          <cylinderGeometry args={[0.08, 0.08, 1.2, 8]} />
          <meshStandardMaterial color="#ffffff" metalness={0.1} roughness={0.2} emissive="#000000" emissiveIntensity={0.0} clearcoat={1.0} clearcoatRoughness={0.05} />
        </mesh>
      </group>
      <group rotation={[0, 0, Math.PI / 4]}>
        <mesh>
          <cylinderGeometry args={[0.06, 0.06, 1.2, 8]} />
          <meshStandardMaterial color="#222222" metalness={0.5} roughness={0.6} emissive="#000000" emissiveIntensity={0.0} clearcoat={0.2} clearcoatRoughness={0.4} />
        </mesh>
      </group>
      <group rotation={[0, 0, -Math.PI / 4]}>
        <mesh>
          <cylinderGeometry args={[0.06, 0.06, 1.2, 8]} />
          <meshStandardMaterial color="#222222" metalness={0.5} roughness={0.6} emissive="#000000" emissiveIntensity={0.0} clearcoat={0.2} clearcoatRoughness={0.4} />
        </mesh>
      </group>
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.15, 16]} />
        <meshStandardMaterial color="#dddddd" metalness={0.2} roughness={0.3} emissive="#000000" emissiveIntensity={0.0} clearcoat={0.5} clearcoatRoughness={0.2} />
      </mesh>
      <mesh position={[0, 0.08, 0]}>
        <octahedronGeometry args={[0.12, 0]} />
        <meshStandardMaterial color="#050505" metalness={0.05} roughness={0.1} emissive="#00E5FF" emissiveIntensity={0.3} clearcoat={0.2} clearcoatRoughness={0.3} />
      </mesh>
      <mesh position={[0, -0.08, 0]}>
        <octahedronGeometry args={[0.12, 0]} />
        <meshStandardMaterial color="#050505" metalness={0.05} roughness={0.1} emissive="#FF003C" emissiveIntensity={0.3} clearcoat={0.2} clearcoatRoughness={0.3} />
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
  const count = 12000;
  const arr = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);

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

    sizes[i] = Math.random() > 0.95 ? Math.random() * 3 + 1 : Math.random() * 1 + 0.2;
  }
  return { positions: arr, colors, sizes };
};

const INITIAL_STARFIELD = generateStarfield();

const Starfield = () => {
  const starsRef = useRef();
  const { isWarping } = useScroll();
  const warpSpeed = useRef(0);
  const texture = useMemo(() => createCircleTexture(), []);
  const positions = INITIAL_STARFIELD;

  useFrame((state, delta) => {
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
        <bufferAttribute attach="attributes-size" args={[positions.sizes, 1]} />
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
  const count = 3000;
  const arr = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);

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

    sizes[i] = Math.random() * 8 + 3;
  }
  return { positions: arr, colors, sizes };
};

const INITIAL_NEBULA = generateNebula();

const Nebula = () => {
  const nebulaRef = useRef();
  const { isWarping } = useScroll();
  const warpSpeed = useRef(0);
  const texture = useMemo(() => createCircleTexture(), []);
  const positions = INITIAL_NEBULA;

  useFrame((state, delta) => {
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
        <bufferAttribute attach="attributes-size" args={[positions.sizes, 1]} />
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
  const count = 400;
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

  useFrame(() => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.0001;
      pointsRef.current.rotation.x += 0.00005;
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
    const radius = 8 + Math.random() * 40; 
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
      ),
      speedRotation: new THREE.Euler(
        (Math.random() - 0.5) * 0.01,
        (Math.random() - 0.5) * 0.01,
        (Math.random() - 0.5) * 0.01
      )
    });
  }
  return temp;
};

const INITIAL_ASTEROIDS = generateAsteroids(300);

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

  useFrame((state, delta) => {
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
        color="#888888" 
        roughness={0.8} 
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

  useFrame((state, delta) => {
    const targetAlpha = isWarping ? 0.9 : 0;
    warpAlpha.current = THREE.MathUtils.damp(warpAlpha.current, targetAlpha, 5.0, delta);

    if (linesRef.current) {
      linesRef.current.material.opacity = warpAlpha.current;

      if (warpAlpha.current > 0.01 && geoRef.current) {
        const posAttr = geoRef.current.attributes.position;
        const array = posAttr.array;
        const data = INITIAL_WARP_DATA.data;

        // Animate each streak individually forward along Z without any jarring global modulo wrap
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
  const defaultFov = 35;

  useFrame((state, delta) => {
    const targetWarp = isWarping ? 1 : 0;
    // Smoother dampening curve for organic camera expansion and recovery
    warpIntensity.current = THREE.MathUtils.damp(warpIntensity.current, targetWarp, 4.0, delta);

    const cam = state.camera;
    if (cam && 'fov' in cam) {
      cam.fov = defaultFov + warpIntensity.current * 18;
      cam.updateProjectionMatrix();
    }
  });

  return null;
};

const Hero3DCanvas = () => {
  const pixelRatio = 1;

  const onCreated = ({ gl }) => {
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
      dpr={[1, pixelRatio]}
      onCreated={onCreated}
    >
      <color attach="background" args={['#000000', 0]} />
      <fog attach="fog" args={['#000000', 50, 200]} />

      <ambientLight color="#1a1a1a" intensity={0.4} />
      <directionalLight color="#ffffff" intensity={3.5} position={[15, 30, 15]} />
      <directionalLight color="#ffffff" intensity={2.5} position={[-15, 25, -15]} />
      <directionalLight color="#ffffff" intensity={2.0} position={[0, -25, 0]} />
      <directionalLight color="#ffffff" intensity={1.5} position={[-15, -20, -15]} />
      <hemisphereLight color="#ffffff" groundColor="#FF003C" intensity={0.1} />
      <pointLight color="#ffffff" intensity={1.0} position={[12, 12, 12]} distance={60} decay={2} />
      <pointLight color="#ffffff" intensity={0.8} position={[-12, 12, -12]} distance={60} decay={2} />
      <pointLight color="#1a00ff" intensity={0.3} position={[0, 0, 20]} distance={50} decay={2} />
      <pointLight color="#2a00ff" intensity={0.3} position={[0, 0, -20]} distance={50} decay={2} />
      <directionalLight color="#ffffff" intensity={2.0} position={[0, 0, -30]} />

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
          radial-gradient(circle at 15% 50%, rgba(20, 5, 40, 0.4) 0%, transparent 50%),
          radial-gradient(circle at 85% 30%, rgba(5, 20, 40, 0.4) 0%, transparent 50%),
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
