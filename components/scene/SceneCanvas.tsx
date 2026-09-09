"use client";

import { Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import DeskModels from "./DeskModels";
import type { CameraView } from "@/lib/scene-state";

// A small studio sweep replaces the clipped ground-plane horizon.
const studioBackdrop = (() => {
  const points: [number, number][] = [[-.72, -6]];
  for (let segment = 1; segment <= 16; segment++) {
    const angle = segment / 16 * Math.PI / 2;
    points.push([-.72 + 2 * (1 - Math.cos(angle)), -6 - 2 * Math.sin(angle)]);
  }
  points.push([25, -8]);
  const vertices: number[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const [y, z] = points[i];
    const [nextY, nextZ] = points[i + 1];
    vertices.push(-40, y, z, 40, y, z, 40, nextY, nextZ, -40, y, z, 40, nextY, nextZ, -40, nextY, nextZ);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  geometry.computeVertexNormals();
  return geometry;
})();

const cameraPositions: Record<CameraView, [number, number, number]> = {
  room: [8.5, 6.4, 12.5],
  desk: [3.5, 4.1, 8.3],
  focus: [.0, 2.9, 6.9],
  entered: [-.58, 2.49, 4.2],
};
const lookTargets: Record<CameraView, [number, number, number]> = {
  room: [0, 1.55, .15],
  desk: [-.2, 1.98, .25],
  focus: [-.58, 2.36, .89],
  entered: [-.58, 2.49, .92],
};

function CameraRig({ view, reducedMotion, resetKey }: { view: CameraView; reducedMotion: boolean; resetKey: number }) {
  const { camera, invalidate, size } = useThree();
  const controls = useRef<OrbitControlsImpl>(null);
  const transitioning = useRef(true);
  const targetPosition = useRef(new THREE.Vector3());
  const targetLook = useRef(new THREE.Vector3());

  useEffect(() => {
    targetPosition.current.set(...cameraPositions[view]);
    targetLook.current.set(...lookTargets[view]);
    const aspect = size.width / Math.max(size.height, 1);
    if (view === "entered") {
      const distance = Math.max(3.3, 1.34 / (Math.tan(37 * Math.PI / 360) * aspect));
      targetPosition.current.z = .92 + distance;
    } else {
      // Preserve the composition when the preview pane becomes narrow.
      targetPosition.current.sub(targetLook.current).multiplyScalar(Math.max(1, 1.35 / aspect)).add(targetLook.current);
    }
    transitioning.current = true;
    if (reducedMotion && controls.current) {
      camera.position.copy(targetPosition.current);
      controls.current.target.copy(targetLook.current);
      controls.current.update();
      transitioning.current = false;
    }
    invalidate();
  }, [view, resetKey, camera, invalidate, reducedMotion, size.width, size.height]);

  useFrame((_, delta) => {
    if (!transitioning.current || !controls.current) return;
    const factor = 1 - Math.exp(-Math.min(delta, .05) * (view === "room" ? 5 : 13));
    camera.position.lerp(targetPosition.current, factor);
    controls.current.target.lerp(targetLook.current, factor);
    controls.current.update();
    if (camera.position.distanceToSquared(targetPosition.current) < .000002 && controls.current.target.distanceToSquared(targetLook.current) < .000002) {
      transitioning.current = false;
    } else invalidate();
  });
  return <OrbitControls ref={controls} makeDefault enabled={view !== "entered"}
    enableDamping={!reducedMotion} dampingFactor={.12} minDistance={3} maxDistance={30}
    minPolarAngle={.15} maxPolarAngle={Math.PI / 2 - .04}
    rotateSpeed={.65} panSpeed={.7} zoomSpeed={.8}
    onStart={() => { transitioning.current = false; }} />;
}

function ScreenSurface({ children }: { children: ReactNode }) {
  const { gl } = useThree();
  const portal = useMemo(() => ({ current: gl.domElement.parentElement! }), [gl]);
  const [frontFacing, setFrontFacing] = useState(true);
  const wasFrontFacing = useRef(true);
  useFrame(({ camera }) => {
    // The glass faces +Z. Test its facing plane rather than raycasting against
    // every tiny bezel part, which can flicker at oblique viewing angles.
    const visible = camera.position.z > .985;
    if (visible !== wasFrontFacing.current) {
      wasFrontFacing.current = visible;
      setFrontFacing(visible);
    }
  });
  return <Html portal={portal} transform position={[-.58, 2.49, .985]} distanceFactor={1.05} zIndexRange={[10, 1]}
    style={{ width: 960, height: 720, visibility: frontFacing ? "visible" : "hidden", pointerEvents: frontFacing ? "auto" : "none" }}>
    {children}
  </Html>;
}

export default function SceneCanvas({ view, reducedMotion, screen, onReady, onApproach, onBack, resetKey }: {
  view: CameraView;
  resetKey: number;
  reducedMotion: boolean;
  screen: ReactNode;
  onReady: () => void;
  onApproach: () => void;
  onBack: () => void;
}) {
  return <Canvas
    shadows={{ type: THREE.PCFShadowMap }}
    onPointerMissed={(event) => { if (event.type === "click") onBack(); }}
    frameloop="demand"
    dpr={[1, 1.5]}
    camera={{ position: [9, 7.1, 13.3], fov: 37, near: .1, far: 60 }}
    gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
    onCreated={({ gl, events }) => {
      // Keep screen/app clicks out of the scene raycaster and orbit controls.
      events.connect?.(gl.domElement);
      gl.setClearColor("#e7dece");
      onReady();
    }}
  >
    <color attach="background" args={["#e7dece"]} />
    <fog attach="fog" args={["#e7dece", 23, 45]} />
    <hemisphereLight args={["#fff9ec", "#b6a58e", 2.3]} />
    <directionalLight position={[-3, 8, 6]} intensity={3.1} castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-8} shadow-camera-right={8} shadow-camera-top={8} shadow-camera-bottom={-8} shadow-normalBias={.035} shadow-bias={-.0001} shadow-radius={5} />
    <directionalLight position={[5, 4, -5]} intensity={1.2} color="#e8e5ff" />
    <Suspense fallback={null}>
      <group onClick={(event) => { event.stopPropagation(); if (event.delta < 5) onApproach(); }}><DeskModels /></group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -.72, 0]} receiveShadow
        onClick={(event) => { event.stopPropagation(); if (event.delta < 5) onBack(); }}>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#e7dece" roughness={1} />
      </mesh>
      <mesh geometry={studioBackdrop} receiveShadow onClick={(event) => { event.stopPropagation(); if (event.delta < 5) onBack(); }}>
        <meshStandardMaterial color="#e7dece" roughness={1} side={THREE.FrontSide} />
      </mesh>
      <ScreenSurface>{screen}</ScreenSurface>
    </Suspense>
    <CameraRig view={view} reducedMotion={reducedMotion} resetKey={resetKey} />
  </Canvas>;
}
