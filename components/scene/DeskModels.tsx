"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { RoundedBox, useTexture } from "@react-three/drei";
import * as THREE from "three";

type Vec3 = [number, number, number];
const CREAM = "#ddd3bf";
const INDIGO = "#51457f";
const GREEN = "#427a5b";

function Box({ size, at = [0, 0, 0], color, radius = .06, roughness = .66, metalness = 0 }: {
  size: Vec3; at?: Vec3; color: string; radius?: number; roughness?: number; metalness?: number;
}) {
  // drei's RoundedBox produces invalid geometry when a corner radius exceeds half
  // of a thin dimension. Several detail strips are intentionally very thin.
  const safeRadius = Math.max(.001, Math.min(radius, ...size.map((dimension) => dimension / 2 - .001)));
  return <RoundedBox args={size} position={at} radius={safeRadius} smoothness={3} castShadow receiveShadow>
    <meshStandardMaterial color={color} roughness={roughness} metalness={metalness} />
  </RoundedBox>;
}

function Label({ text, at, width, height = .1, color = "#39352f", background, rotation = [0, 0, 0] }: {
  text: string; at: Vec3; width: number; height?: number; color?: string; background?: string; rotation?: Vec3;
}) {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = Math.max(64, Math.round(512 * height / width));
    const ctx = canvas.getContext("2d")!;
    if (background) { ctx.fillStyle = background; ctx.fillRect(0, 0, canvas.width, canvas.height); }
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `600 ${Math.round(canvas.height * .64)}px Arial, sans-serif`;
    ctx.fillText(text, canvas.width / 2, canvas.height / 2, canvas.width - 16);
    const map = new THREE.CanvasTexture(canvas);
    map.colorSpace = THREE.SRGBColorSpace;
    return map;
  }, [text, color, background, height, width]);
  useLayoutEffect(() => () => texture.dispose(), [texture]);
  return <mesh position={at} rotation={rotation}>
    <planeGeometry args={[width, height]} />
    <meshBasicMaterial map={texture} transparent depthWrite={false} toneMapped={false} />
  </mesh>;
}

function Disc({ at, radius, color, top = false, depth = .025 }: {
  at: Vec3; radius: number; color: string; top?: boolean; depth?: number;
}) {
  return <mesh position={at} rotation={top ? [0, 0, 0] : [Math.PI / 2, 0, 0]} castShadow>
    <cylinderGeometry args={[radius, radius, depth, 32]} />
    <meshStandardMaterial color={color} roughness={.6} />
  </mesh>;
}

function Cable({ points, radius = .024 }: { points: Vec3[]; radius?: number }) {
  const curve = useMemo(() => new THREE.CatmullRomCurve3(points.map((point) => new THREE.Vector3(...point))), [points]);
  return <mesh castShadow>
    <tubeGeometry args={[curve, 48, radius, 8, false]} />
    <meshStandardMaterial color="#272625" roughness={.86} />
  </mesh>;
}

// A single instanced draw call for every speaker perforation.
function Speaker({ at }: { at: Vec3 }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const points = useMemo(() => {
    const result: [number, number][] = [];
    for (let row = -5; row <= 5; row++) {
      for (let column = -8; column <= 8; column++) {
        const x = column * .035 + (row % 2 ? .017 : 0);
        const y = row * .033;
        if ((x * x) / .0784 + (y * y) / .027 < 1) result.push([x, y]);
      }
    }
    return result;
  }, []);
  useLayoutEffect(() => {
    const matrix = new THREE.Matrix4();
    points.forEach(([x, y], i) => mesh.current?.setMatrixAt(i, matrix.makeTranslation(x, y, 0)));
    if (mesh.current) mesh.current.instanceMatrix.needsUpdate = true;
  }, [points]);
  return <instancedMesh ref={mesh} args={[undefined, undefined, points.length]} position={at}>
    <circleGeometry args={[.009, 6]} />
    <meshStandardMaterial color="#4b4337" roughness={1} />
  </instancedMesh>;
}

export function Television() {
  return <group position={[-.58, 0, .02]}>
    {/* Layered warm-ivory housing gives the CRT a glossy, molded-plastic presence. */}
    <Box at={[0, 2.23, -.42]} size={[2.45, 2.33, 1.98]} color="#b7ab96" radius={.2} roughness={.5} />
    <Box at={[0, 2.23, .49]} size={[3.24, 2.98, .76]} color="#e1d6c2" radius={.2} roughness={.43} />
    <Box at={[0, 3.57, .34]} size={[2.92, .11, .46]} color="#eee5d4" radius={.055} roughness={.38} />
    <Box at={[0, 1.01, .12]} size={[2.73, .18, 1.5]} color="#c3b7a2" radius={.065} roughness={.52} />
    {/* The wide ivory inner surround deepens the screen without changing its projection opening. */}
    <Box at={[0, 2.49, .86]} size={[2.94, 2.31, .13]} color="#c5b8a4" radius={.16} roughness={.38} />
    <Box at={[0, 2.49, .884]} size={[2.72, 2.08, .1]} color="#27242a" radius={.14} roughness={.33} />
    <Box at={[0, 2.49, .928]} size={[2.56, 1.92, .028]} color="#0a0a11" radius={.095} roughness={.24} />
    <Label text="Panasonic" at={[0, 1.36, .86]} width={.56} height={.095} />
    <Speaker at={[-1.05, 1.14, .855]} />
    <Speaker at={[1.05, 1.14, .855]} />
    {[-.58, -.39, -.20, -.01].map((x, i) => <group key={x}>
      <Disc at={[x, 1.115, .866]} radius={.038} color="#887d6b" />
      <Disc at={[x, 1.115, .882]} radius={.029} color={CREAM} />
      <Label text={["MENU", "VOL −", "VOL +", "POWER"][i]} at={[x, 1.22, .86]} width={.16} height={.033} />
    </group>)}
    <mesh position={[.085, 1.115, .862]}><sphereGeometry args={[.013, 8, 8]} /><meshBasicMaterial color="#a9c18d" /></mesh>
    {["#d8b63e", "#eeede0", "#b33830"].map((color, i) => <group key={color}>
      <Disc at={[.29 + i * .16, 1.115, .867]} radius={.057} color="#514637" />
      <Disc at={[.29 + i * .16, 1.115, .925]} radius={.036} color={color} depth={.13} />
    </group>)}
    {/* Deep, narrow ventilation slots on the visible left side. */}
    {Array.from({ length: 12 }, (_, i) => <Box key={i} at={[-1.236, 2.23, -.92 + i * .092]} size={[.01, .45, .028]} color="#696253" radius={.004} />)}
  </group>;
}

export function GameCube() {
  return <group position={[2.02, 1.61, -.02]}>
    {/* A cream-and-green Slippi console, intentionally distinct from its classic controller. */}
    <Box size={[1.43, 1.35, 1.43]} color={GREEN} radius={.06} roughness={.48} />
    <Box at={[0, -.48, .719]} size={[1.34, .31, .024]} color="#2b533f" radius={.008} roughness={.54} />
    <Box at={[0, -.045, .735]} size={[1.29, .6, .03]} color="#e7dfce" radius={.015} roughness={.42} />
    {[-.45, -.15, .15, .45].map((x, index) => <group key={x}>
      <Disc at={[x, .03, .764]} radius={.094} color="#b7ad9a" />
      <Disc at={[x, .03, .78]} radius={.076} color="#161817" />
      <Label text={String(index + 1)} at={[x, .19, .765]} width={.05} height={.055} color="#5d5b55" />
    </group>)}
    {[-.3, .3].map((x) => <Box key={x} at={[x, -.24, .763]} size={[.46, .065, .028]} color="#c7bead" radius={.008} />)}
    <Disc top at={[0, .684, 0]} radius={.52} color="#699374" depth={.016} />
    <Disc top at={[0, .698, 0]} radius={.398} color="#222328" depth={.015} />
    <Label text="NINTENDO" at={[0, .71, -.07]} width={.36} height={.06} color="#dad6e2" rotation={[-Math.PI / 2, 0, 0]} />
    <Label text="GAMECUBE" at={[0, .71, .02]} width={.43} height={.08} color="#dad6e2" rotation={[-Math.PI / 2, 0, 0]} />
    <Disc top at={[-.55, .694, -.48]} radius={.095} color="#b5b0bd" depth={.024} />
    <Disc top at={[.55, .692, .48]} radius={.11} color="#315f49" depth={.02} />
    {Array.from({ length: 10 }, (_, i) => <Box key={i} at={[-.72, .02, -.51 + i * .11]} size={[.016, .63, .038]} color="#234733" radius={.005} />)}
    <Box at={[0, .11, -.84]} size={[1.05, .22, .18]} color="#3a6d51" radius={.055} />
    <Disc at={[-.45, .03, .87]} radius={.063} color="#d8d0be" depth={.21} />
  </group>;
}

function ControllerButton({ at, radius, color, letter }: { at: Vec3; radius: number; color: string; letter?: string }) {
  return <group>
    <Disc top at={at} radius={radius} color={color} depth={.06} />
    {letter && <Label text={letter} at={[at[0], at[1] + .032, at[2]]} width={radius} height={radius} color="#e3e8d8" rotation={[-Math.PI / 2, 0, 0]} />}
  </group>;
}

export function Controller() {
  const body = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-.7, .32);
    shape.bezierCurveTo(-.6, .6, -.3, .53, 0, .43);
    shape.bezierCurveTo(.3, .53, .6, .6, .7, .32);
    shape.bezierCurveTo(.88, .05, .85, -.42, .7, -.76);
    shape.bezierCurveTo(.59, -.91, .4, -.77, .33, -.5);
    shape.lineTo(.2, -.32);
    shape.quadraticCurveTo(0, -.2, -.2, -.32);
    shape.lineTo(-.33, -.5);
    shape.bezierCurveTo(-.4, -.77, -.59, -.91, -.7, -.76);
    shape.bezierCurveTo(-.85, -.42, -.88, .05, -.7, .32);
    return shape;
  }, []);
  return <group position={[.86, 1.1, 1.08]} rotation={[.02, -.18, 0]}>
    <mesh rotation={[-Math.PI / 2, 0, 0]} castShadow receiveShadow>
      <extrudeGeometry args={[body, { depth: .13, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: .07, bevelThickness: .07, curveSegments: 16 }]} />
      <meshStandardMaterial color={INDIGO} roughness={.46} />
    </mesh>
    {/* Center bridge and two shoulder caps give the classic GameCube silhouette its weight. */}
    <Box at={[0, .17, .02]} size={[.56, .11, .42]} color="#43376e" radius={.13} roughness={.43} />
    <Box at={[-.58, .18, .02]} size={[.17, .07, .32]} color="#3b3065" radius={.045} roughness={.38} />
    <Box at={[.58, .18, .02]} size={[.17, .07, .32]} color="#3b3065" radius={.045} roughness={.38} />
    <Disc top at={[-.4, .205, -.19]} radius={.2} color="#3f336d" />
    <Disc top at={[-.4, .24, -.19]} radius={.075} color="#a8a79b" depth={.08} />
    <Disc top at={[-.4, .30, -.19]} radius={.135} color="#e1d9c3" depth={.055} />
    <Disc top at={[-.4, .332, -.19]} radius={.085} color="#c9c4b3" depth={.009} />
    <Disc top at={[.24, .22, .33]} radius={.15} color="#3d3268" />
    <Disc top at={[.24, .27, .33]} radius={.095} color="#ded6bf" depth={.055} />
    <ControllerButton at={[.42, .23, -.16]} radius={.15} color="#4cba7b" letter="A" />
    <ControllerButton at={[.19, .23, .00]} radius={.085} color="#d55353" letter="B" />
    <ControllerButton at={[.20, .23, -.31]} radius={.064} color="#aab1bb" letter="X" />
    <ControllerButton at={[.56, .23, .00]} radius={.064} color="#aab1bb" letter="Y" />
    <group rotation={[0, -.35, 0]}>
      <Box at={[.64, .23, -.08]} size={[.10, .045, .20]} color="#ddd4bd" radius={.04} />
    </group>
    <Box at={[.42, .23, -.40]} size={[.22, .045, .085]} color="#ddd4bd" radius={.04} />
    <Box at={[-.3, .235, .34]} size={[.1, .055, .29]} color="#ded6bf" radius={.012} />
    <Box at={[-.3, .235, .34]} size={[.29, .055, .1]} color="#ded6bf" radius={.012} />
    <ControllerButton at={[0, .23, -.02]} radius={.043} color="#d9d0b7" />
    <Label text="NINTENDO GAMECUBE" at={[0, .245, -.36]} width={.48} height={.055} color="#e5dfce" rotation={[-Math.PI / 2, 0, 0]} />
    <group position={[0, .24, -.21]}>
      <mesh scale={[1.3, .3, .7]}><sphereGeometry args={[.055, 16, 8]} /><meshStandardMaterial color="#e3ddc8" /></mesh>
      {[-.04, .04].map((x) => <mesh key={x} position={[x, .01, -.033]}><sphereGeometry args={[.024, 12, 8]} /><meshStandardMaterial color="#e3ddc8" /></mesh>)}
    </group>
  </group>;
}

function Limb({ from, to, radius, color }: { from: Vec3; to: Vec3; radius: number; color: string }) {
  const start = new THREE.Vector3(...from);
  const end = new THREE.Vector3(...to);
  const middle = start.clone().add(end).multiplyScalar(.5);
  const rotation = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), end.clone().sub(start).normalize());
  return <mesh position={middle} quaternion={rotation} castShadow>
    <capsuleGeometry args={[radius, Math.max(.01, start.distanceTo(end) - radius * 2), 4, 10]} />
    <meshStandardMaterial color={color} roughness={.67} />
  </mesh>;
}

export function FoxCollectible() {
  return <group position={[-2.55, 1.12, .82]} rotation={[0, .18, 0]} scale={.85}>
    <Disc top at={[0, .04, 0]} radius={.32} color="#272829" depth={.09} />
    <Disc top at={[0, .095, 0]} radius={.28} color="#b2a173" depth={.02} />
    {/* Fox is crouched with one boot forward and both hands raised in his fighting guard. */}
    <Limb from={[-.10, .54, .01]} to={[-.27, .32, .13]} radius={.095} color="#607150" />
    <Limb from={[-.27, .32, .13]} to={[-.38, .15, .22]} radius={.08} color="#607150" />
    <Limb from={[.11, .54, -.02]} to={[.27, .34, -.11]} radius={.095} color="#607150" />
    <Limb from={[.27, .34, -.11]} to={[.18, .15, .10]} radius={.08} color="#607150" />
    <Box at={[-.42, .14, .24]} size={[.24, .13, .36]} color="#3f4347" radius={.055} roughness={.5} />
    <Box at={[.17, .14, .13]} size={[.23, .13, .34]} color="#3f4347" radius={.055} roughness={.5} />
    <group position={[0, .72, .02]} rotation={[0, 0, .13]}>
      <Box size={[.39, .40, .28]} color="#e0d9c6" radius={.08} roughness={.58} />
      <Box at={[0, .03, .156]} size={[.20, .25, .025]} color="#4c6f4f" radius={.009} />
      <Box at={[0, -.15, .16]} size={[.34, .055, .035]} color="#4b4b43" radius={.012} />
      <Box at={[.04, -.15, .185]} size={[.06, .09, .018]} color="#c6ac6e" radius={.009} metalness={.45} />
    </group>
    <Limb from={[-.18, .83, .02]} to={[-.36, .78, .18]} radius={.075} color="#e0d9c6" />
    <Limb from={[-.36, .78, .18]} to={[-.31, 1.03, .25]} radius={.064} color="#e0d9c6" />
    <Limb from={[.18, .84, -.01]} to={[.34, .75, .16]} radius={.075} color="#e0d9c6" />
    <Limb from={[.34, .75, .16]} to={[.20, .99, .27]} radius={.064} color="#e0d9c6" />
    {[["left", -.31, 1.04], ["right", .20, 1.00]].map(([key, x, y]) => <mesh key={key as string} position={[x as number, y as number, .25]} castShadow><sphereGeometry args={[.078, 12, 8]} /><meshStandardMaterial color="#41433c" roughness={.58} /></mesh>)}
    <mesh position={[.02, 1.17, .05]} scale={[1, 1.03, .86]} castShadow><sphereGeometry args={[.22, 18, 12]} /><meshStandardMaterial color="#bd8544" roughness={.78} /></mesh>
    <mesh position={[.02, 1.11, .235]} scale={[1, .62, 1]} castShadow><sphereGeometry args={[.14, 16, 10]} /><meshStandardMaterial color="#ede3c8" /></mesh>
    <mesh position={[.02, 1.133, .35]} scale={[1, .7, .6]}><sphereGeometry args={[.042, 12, 8]} /><meshStandardMaterial color="#302c28" /></mesh>
    {[-1, 1].map((side) => <group key={side}>
      <mesh position={[.02 + side * .155, 1.38, .025]} rotation={[0, 0, -side * .24]} castShadow><coneGeometry args={[.1, .26, 4]} /><meshStandardMaterial color="#bd8544" /></mesh>
      <mesh position={[.02 + side * .155, 1.40, .07]} rotation={[0, 0, -side * .24]}><coneGeometry args={[.055, .17, 3]} /><meshStandardMaterial color="#e6d7b7" /></mesh>
      <mesh position={[.02 + side * .106, 1.205, .23]} scale={[1, .45, .35]}><sphereGeometry args={[.066, 12, 8]} /><meshStandardMaterial color="#efe5cf" /></mesh>
      <mesh position={[.02 + side * .103, 1.205, .25]} scale={[1, .65, .45]}><sphereGeometry args={[.024, 10, 8]} /><meshStandardMaterial color="#3d6755" /></mesh>
    </group>)}
    <Box at={[.02, 1.025, .12]} size={[.23, .055, .085]} color="#a94536" radius={.015} />
    <mesh position={[.08, .97, .151]} rotation={[0, 0, -.1]}><coneGeometry args={[.064, .18, 3]} /><meshStandardMaterial color="#a94536" /></mesh>
    <Limb from={[-.08, .57, -.13]} to={[-.37, .48, -.42]} radius={.13} color="#bd8544" />
    <Limb from={[-.37, .48, -.42]} to={[-.49, .66, -.43]} radius={.09} color="#e5d9b9" />
  </group>;
}

function MeleeCover() {
  const source = useTexture("/scene/melee-case-cover.jpg");
  const texture = useMemo(() => {
    const cover = source.clone();
    cover.colorSpace = THREE.SRGBColorSpace;
    cover.anisotropy = 8;
    cover.needsUpdate = true;
    return cover;
  }, [source]);
  useLayoutEffect(() => () => texture.dispose(), [texture]);
  return <mesh position={[0, .066, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
    <planeGeometry args={[1.01, 1.37]} />
    <meshStandardMaterial map={texture} roughness={.42} metalness={.02} />
  </mesh>;
}

export function GameCase() {
  return <group position={[-2.53, 1.015, .74]} rotation={[0, .18, 0]}>
    {/* Matte black case, printed insert, and a thin clear sleeve read as a real boxed game. */}
    <Box size={[1.10, .105, 1.48]} color="#17171a" radius={.025} roughness={.36} />
    <Box at={[-.505, .025, 0]} size={[.065, .12, 1.40]} color="#09090b" radius={.008} roughness={.3} />
    <MeleeCover />
    <RoundedBox args={[1.025, .014, 1.39]} radius={.005} smoothness={3} position={[0, .076, 0]} castShadow>
      <meshPhysicalMaterial color="#ffffff" transparent opacity={.13} roughness={.12} metalness={.02} clearcoat={.55} />
    </RoundedBox>
  </group>;
}

export default function DeskModels() {
  return <group>
    <Box at={[0, .78, 0]} size={[7.2, .26, 3.65]} color="#c6bba8" radius={.14} />
    {[-3.05, 3.05].flatMap((x) => [-1.3, 1.3].map((z) => <mesh key={`${x}-${z}`} position={[x, .02, z]} castShadow receiveShadow><cylinderGeometry args={[.12, .14, 1.45, 20]} /><meshStandardMaterial color="#beb3a0" roughness={.7} /></mesh>))}
    <Television />
    <GameCube />
    <Controller />
    <GameCase />
    <FoxCollectible />
    {/* Controller lead: top center of controller to front port one. */}
    <Cable points={[[.95, 1.25, .65], [1.12, .98, .50], [2.92, .96, 1.22], [3.04, 1.0, 1.03], [1.57, 1.64, .98], [1.57, 1.64, .87]]} />
    {/* RCA inputs: short separate tails join a cable along the TV side to the rear of the console. */}
    {[0, 1, 2].map((i) => <Cable key={i} radius={.014} points={[[-.29 + i * .16, 1.115, 1.0], [-.25 + i * .16, 1.00, 1.15], [.28, .955, 1.06], [.99, .95, .95]]} />)}
    <Cable radius={.026} points={[[.99, .95, .95], [1.05, .95, .15], [1.14, .95, -.93], [1.90, 1.12, -.97], [2.02, 1.3, -.78]]} />
  </group>;
}
