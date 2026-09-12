"use client";

import { Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import DeskModels from "./DeskModels";
import StaticBatch from "./StaticBatch";
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
  const { camera, scene, invalidate, size } = useThree();
  const controls = useRef<OrbitControlsImpl>(null);
  const transitioning = useRef(true);
  const targetPosition = useRef(new THREE.Vector3());
  const targetLook = useRef(new THREE.Vector3());
  const startPosition = useRef(new THREE.Vector3());
  const startLook = useRef(new THREE.Vector3());
  const startedAt = useRef(0);

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
    // Fitting a portrait viewport may exceed the normal orbit distance.
    // Keep the target reachable, otherwise the demand loop can never settle.
    const distance = targetPosition.current.distanceTo(targetLook.current);
    if (controls.current) controls.current.maxDistance = Math.max(30, distance * 1.1);
    // Three.js cameras are mutable scene objects, not React state.
    /* eslint-disable react-hooks/immutability -- Camera and fog are mutable Three.js objects. */
    camera.far = Math.max(60, distance * 1.1 + 40);
    // Keep the fitted portrait view in front of the atmospheric fade.
    if (scene.fog instanceof THREE.Fog) {
      scene.fog.near = Math.max(23, distance + 7);
      scene.fog.far = Math.max(45, distance + 29);
    }
    /* eslint-enable react-hooks/immutability */
    camera.updateProjectionMatrix();
    startPosition.current.copy(camera.position);
    startLook.current.copy(controls.current?.target ?? targetLook.current);
    startedAt.current = performance.now();
    transitioning.current = true;
    if (reducedMotion && controls.current) {
      camera.position.copy(targetPosition.current);
      controls.current.target.copy(targetLook.current);
      controls.current.update();
      transitioning.current = false;
    }
    invalidate();
  }, [view, resetKey, camera, scene, invalidate, reducedMotion, size.width, size.height]);

  useFrame(() => {
    if (!transitioning.current || !controls.current) return;
    const progress = Math.min(1, (performance.now() - startedAt.current) / 600);
    const eased = progress * progress * (3 - 2 * progress);
    camera.position.lerpVectors(startPosition.current, targetPosition.current, eased);
    controls.current.target.lerpVectors(startLook.current, targetLook.current, eased);
    controls.current.update();
    if (progress === 1) {
      transitioning.current = false;
    } else invalidate();
  });
  return <OrbitControls ref={controls} makeDefault enabled={view !== "entered"}
    enableDamping={false} minDistance={3}
    minPolarAngle={.15} maxPolarAngle={view === "entered" ? Math.PI / 2 : Math.PI / 2 - .04}
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

// Signal readiness only after the model textures inside Suspense have loaded.
function SceneReady({ onReady }: { onReady: () => void }) {
  const { gl, invalidate } = useThree();
  useEffect(() => {
    // All static models and textures have mounted. Camera movement does not
    // change their shadows, so retain this map until the scene remounts.
    // Renderer flags are intentionally imperative.
    // eslint-disable-next-line react-hooks/immutability
    gl.shadowMap.needsUpdate = true;
    invalidate();
    onReady();
  }, [gl, invalidate, onReady]);
  return null;
}

// A lost WebGL context must not leave a black, unusable computer.
function ContextRecovery({ onFailure }: { onFailure: () => void }) {
  const { gl } = useThree();
  useEffect(() => {
    const canvas = gl.domElement;
    canvas.addEventListener("webglcontextlost", onFailure);
    return () => canvas.removeEventListener("webglcontextlost", onFailure);
  }, [gl, onFailure]);
  return null;
}

export default function SceneCanvas({ view, reducedMotion, screen, onReady, onApproach, onBack, onFailure, resetKey }: {
  view: CameraView;
  resetKey: number;
  reducedMotion: boolean;
  screen: ReactNode;
  onReady: () => void;
  onApproach: () => void;
  onBack: () => void;
  onFailure: () => void;
}) {
  const [pixelRatio, setPixelRatio] = useState(1);
  useEffect(() => {
    const update = () => setPixelRatio(Math.min(1, window.devicePixelRatio * (window.visualViewport?.scale ?? 1)));
    update();
    window.addEventListener("resize", update);
    window.visualViewport?.addEventListener("resize", update);
    return () => {
      window.removeEventListener("resize", update);
      window.visualViewport?.removeEventListener("resize", update);
    };
  }, []);
  return <Canvas
    shadows={{ type: THREE.PCFShadowMap }}
    onPointerMissed={(event) => { if (event.type === "click") onBack(); }}
    frameloop="demand"
    dpr={pixelRatio}
    camera={{ position: [9, 7.1, 13.3], fov: 37, near: .1, far: 60 }}
    gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
    onCreated={({ gl, events }) => {
      // Keep screen/app clicks out of the scene raycaster and orbit controls.
      events.connect?.(gl.domElement);
      gl.setClearColor("#e7dece");
      gl.shadowMap.autoUpdate = false;
    }}
  >
    <color attach="background" args={["#e7dece"]} />
    <fog attach="fog" args={["#e7dece", 23, 45]} />
    <hemisphereLight args={["#fff9ec", "#b6a58e", 2.3]} />
    <directionalLight position={[-3, 8, 6]} intensity={3.1} castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-8} shadow-camera-right={8} shadow-camera-top={8} shadow-camera-bottom={-8} shadow-normalBias={.035} shadow-bias={-.0001} shadow-radius={5} />
    <directionalLight position={[5, 4, -5]} intensity={1.2} color="#e8e5ff" />
    <Suspense fallback={null}>
      <group onClick={(event) => { event.stopPropagation(); if (event.delta < 5) onApproach(); }}><StaticBatch><DeskModels /></StaticBatch></group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -.72, 0]} receiveShadow
        onClick={(event) => { event.stopPropagation(); if (event.delta < 5) onBack(); }}>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#e7dece" roughness={1} />
      </mesh>
      <mesh geometry={studioBackdrop} receiveShadow onClick={(event) => { event.stopPropagation(); if (event.delta < 5) onBack(); }}>
        <meshStandardMaterial color="#e7dece" roughness={1} side={THREE.FrontSide} />
      </mesh>
      <ScreenSurface>{screen}</ScreenSurface>
      <SceneReady onReady={onReady} />
      <ContextRecovery onFailure={onFailure} />
    </Suspense>
    <CameraRig view={view} reducedMotion={reducedMotion} resetKey={resetKey} />
  </Canvas>;
}
