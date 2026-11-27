"use client";

import { Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import DeskModels from "./DeskModels";
import RoomWindow from "./RoomWindow";
import type { Phase } from "@/lib/time-of-day";
import type { CameraView } from "@/lib/scene-state";

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

// One room, three lighting moods that follow the visitor's clock.
type Look = {
  room: string; frame: string;
  sky: [string, string, number];
  key: { at: [number, number, number]; color: string; intensity: number };
  fill: { color: string; intensity: number };
  glow: number;
};
const looks: Record<Phase, Look> = {
  day: { room: "#e7dece", frame: "#f1ebe0", sky: ["#fff9ec", "#b6a58e", 2.3], key: { at: [-3, 8, 6], color: "#ffffff", intensity: 3.1 }, fill: { color: "#e8e5ff", intensity: 1.2 }, glow: 0 },
  // Low warm sun from the left, long shadows, a cool fill from the other side.
  golden: { room: "#e8cfb1", frame: "#f0e0c8", sky: ["#ffe1bd", "#a2806a", 1.7], key: { at: [-9, 3.4, 3], color: "#ffb36e", intensity: 3.6 }, fill: { color: "#b7a9ff", intensity: .55 }, glow: .8 },
  // Dark room: faint moonlight through the window, and the CRT is the brightest light.
  night: { room: "#1a1a21", frame: "#2b2a33", sky: ["#4a5578", "#16141c", 1.05], key: { at: [-5, 7, -6], color: "#9fb0e0", intensity: 1.4 }, fill: { color: "#ffb877", intensity: .15 }, glow: 9 },
};

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

  // eslint-disable-next-line react-hooks/immutability -- Three.js camera and fog are mutable.
  useEffect(() => {
    targetPosition.current.set(...cameraPositions[view]);
    targetLook.current.set(...lookTargets[view]);
    const aspect = size.width / Math.max(size.height, 1);
    if (view === "entered") {
      const distance = Math.max(3.3, 1.34 / (Math.tan(37 * Math.PI / 360) * aspect));
      targetPosition.current.z = .92 + distance;
    } else {
      // Narrow screens back the camera off so the desk still fits; the room view fits tighter so a phone isn't mostly floor.
      const fit = view === "room" ? .95 : 1.35;
      targetPosition.current.sub(targetLook.current).multiplyScalar(Math.max(1, fit / aspect)).add(targetLook.current);
    }
    const distance = targetPosition.current.distanceTo(targetLook.current);
    if (controls.current) controls.current.maxDistance = Math.max(30, distance * 1.1);
    /* eslint-disable react-hooks/immutability -- Three.js camera and fog are mutable. */
    camera.far = Math.max(60, distance * 1.1 + 40);
    if (scene.fog instanceof THREE.Fog) {
      scene.fog.near = Math.max(23, distance + 7);
      scene.fog.far = Math.max(45, distance + 29);
    }
    /* eslint-enable react-hooks/immutability */
    camera.updateProjectionMatrix();
    transitioning.current = true;
    if (reducedMotion && controls.current) {
      camera.position.copy(targetPosition.current);
      controls.current.target.copy(targetLook.current);
      controls.current.update();
      transitioning.current = false;
    }
    invalidate();
  }, [view, resetKey, camera, scene, invalidate, reducedMotion, size.width, size.height]);

  useFrame((_, delta) => {
    if (!transitioning.current || !controls.current) return;
    const factor = 1 - Math.exp(-Math.min(delta, .05) * (view === "room" ? 5 : 13));
    camera.position.lerp(targetPosition.current, factor);
    controls.current.target.lerp(targetLook.current, factor);
    controls.current.update();
    if (camera.position.distanceToSquared(targetPosition.current) < .000002 && controls.current.target.distanceToSquared(targetLook.current) < .000002) {
      camera.position.copy(targetPosition.current);
      controls.current.target.copy(targetLook.current);
      controls.current.update();
      transitioning.current = false;
    } else invalidate();
  }, -.5);
  return <OrbitControls ref={controls} makeDefault enabled={view !== "entered"}
    enableDamping={!reducedMotion} dampingFactor={.12} minDistance={3}
    minPolarAngle={.15} maxPolarAngle={view === "entered" ? Math.PI / 2 : Math.PI / 2 - .04}
    rotateSpeed={.65} panSpeed={.7} zoomSpeed={.8}
    onStart={() => { transitioning.current = false; }} />;
}

function ScreenSurface({ element }: { element: React.RefObject<HTMLDivElement | null> }) {
  const projection = useMemo(() => new THREE.Matrix4(), []);
  const origin = useMemo(() => new THREE.Vector4(), []);
  const dx = useMemo(() => new THREE.Vector4(), []);
  const dy = useMemo(() => new THREE.Vector4(), []);
  useFrame(({ camera, size }) => {
    const screen = element.current;
    if (!screen) return;
    camera.updateMatrixWorld();
    projection.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    origin.set(-.58 - 1.28, 2.49 + .96, .965, 1).applyMatrix4(projection);
    dx.set(2.56 / 960, 0, 0, 0).applyMatrix4(projection);
    dy.set(0, -1.92 / 720, 0, 0).applyMatrix4(projection);
    const visible = camera.position.z > .965 && origin.w > 0;
    /* eslint-disable react-hooks/immutability -- Project a DOM ref each frame without React rerenders. */
    screen.style.visibility = visible ? "visible" : "hidden";
    screen.style.pointerEvents = visible ? "auto" : "none";
    if (!visible) return;
    const x = size.width / (2 * origin.w), y = size.height / (2 * origin.w);
    const a = (dx.x + dx.w) * x, b = (-dx.y + dx.w) * y;
    const c = (dy.x + dy.w) * x, d = (-dy.y + dy.w) * y;
    const tx = (origin.x + origin.w) * x, ty = (-origin.y + origin.w) * y;
    const p = dx.w / origin.w, q = dy.w / origin.w;
    screen.style.transform = Math.abs(p * 960) + Math.abs(q * 720) < .0001
      ? `matrix(${a},${b},${c},${d},${tx},${ty})`
      : `matrix3d(${a},${b},0,${p},${c},${d},0,${q},0,0,1,0,${tx},${ty},0,1)`;
    /* eslint-enable react-hooks/immutability */
  });
  return null;
}

function SceneReady({ onReady }: { onReady: () => void }) {
  useEffect(() => { onReady(); }, [onReady]);
  return null;
}

function ContextRecovery({ onFailure }: { onFailure: () => void }) {
  const { gl } = useThree();
  useEffect(() => {
    const canvas = gl.domElement;
    canvas.addEventListener("webglcontextlost", onFailure);
    return () => canvas.removeEventListener("webglcontextlost", onFailure);
  }, [gl, onFailure]);
  return null;
}

export default function SceneCanvas({ view, reducedMotion, screen, onReady, onApproach, onFailure, resetKey, phase = "day" }: {
  view: CameraView;
  phase?: Phase;
  resetKey: number;
  reducedMotion: boolean;
  screen: ReactNode;
  onReady: () => void;
  onApproach: () => void;
  onFailure: () => void;
}) {
  const screenElement = useRef<HTMLDivElement>(null);
  const [pixelRatio, setPixelRatio] = useState(1);
  useEffect(() => {
    const update = () => setPixelRatio(Math.min(window.matchMedia("(pointer: coarse)").matches ? 2 : 1.5, window.devicePixelRatio * (window.visualViewport?.scale ?? 1)));
    update();
    window.addEventListener("resize", update);
    window.visualViewport?.addEventListener("resize", update);
    return () => {
      window.removeEventListener("resize", update);
      window.visualViewport?.removeEventListener("resize", update);
    };
  }, []);
  const look = looks[phase];
  return <><Canvas
    shadows={{ type: THREE.PCFShadowMap }}
    frameloop="demand"
    dpr={pixelRatio}
    camera={{ position: [9, 7.1, 13.3], fov: 37, near: .1, far: 60 }}
    gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
    onCreated={({ gl, events }) => {
      events.connect?.(gl.domElement);
    }}
  >
    <color attach="background" args={[look.room]} />
    {/* Fixed args so the camera rig keeps its fog distances; only the color follows the phase. */}
    <fog attach="fog" args={["#e7dece", 23, 45]} color={look.room} />
    <hemisphereLight args={look.sky} />
    <directionalLight position={look.key.at} color={look.key.color} intensity={look.key.intensity} castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-8} shadow-camera-right={8} shadow-camera-top={8} shadow-camera-bottom={-8} shadow-normalBias={.035} shadow-bias={-.0001} shadow-radius={5} />
    <directionalLight position={[5, 4, -5]} intensity={look.fill.intensity} color={look.fill.color} />
    {look.glow > 0 && <pointLight position={[-.58, 2.5, 2.3]} color="#a3b2ff" intensity={look.glow} distance={7} decay={1.6} />}
    <Suspense fallback={null}>
      <group onClick={(event) => { event.stopPropagation(); if (event.delta < 5) onApproach(); }}><DeskModels /></group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -.72, 0]} receiveShadow
        onClick={(event) => event.stopPropagation()}>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color={look.room} roughness={1} />
      </mesh>
      <mesh geometry={studioBackdrop} receiveShadow onClick={(event) => event.stopPropagation()}>
        <meshStandardMaterial color={look.room} roughness={1} side={THREE.FrontSide} />
      </mesh>
      <RoomWindow phase={phase} frame={look.frame} />
      <ScreenSurface element={screenElement} />
      <SceneReady onReady={onReady} />
    </Suspense>
    <ContextRecovery onFailure={onFailure} />
    <CameraRig view={view} reducedMotion={reducedMotion} resetKey={resetKey} />
  </Canvas><div ref={screenElement} data-crt-surface style={{ position: "absolute", left: 0, top: 0, width: 960, height: 720, transformOrigin: "0 0", visibility: "hidden", zIndex: 10 }}>{screen}</div></>;
}
