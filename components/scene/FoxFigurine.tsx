"use client";

import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";

type Vec3 = [number, number, number];

const FUR = "#bd7437";
const MUZZLE = "#eadfc8";
const JACKET = "#d8d2c2";
const PANTS = "#5b6b4a";
const BOOT = "#303337";
const GLOVE = "#434741";
const SCARF = "#a94336";

function Part({
  size,
  at = [0, 0, 0],
  color,
  radius = .04,
  roughness = .58,
  rotation,
}: {
  size: Vec3;
  at?: Vec3;
  color: string;
  radius?: number;
  roughness?: number;
  rotation?: Vec3;
}) {
  const safeRadius = Math.max(.002, Math.min(radius, ...size.map((value) => value / 2 - .002)));
  return <RoundedBox args={size} position={at} rotation={rotation} radius={safeRadius} smoothness={4} castShadow receiveShadow>
    <meshStandardMaterial color={color} roughness={roughness} />
  </RoundedBox>;
}

function TaperedLimb({ from, to, topRadius, bottomRadius, color }: {
  from: Vec3;
  to: Vec3;
  topRadius: number;
  bottomRadius: number;
  color: string;
}) {
  const start = new THREE.Vector3(...from);
  const end = new THREE.Vector3(...to);
  const center = start.clone().add(end).multiplyScalar(.5);
  const length = start.distanceTo(end);
  const orientation = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    end.clone().sub(start).normalize(),
  );

  return <mesh position={center} quaternion={orientation} castShadow receiveShadow>
    <cylinderGeometry args={[topRadius, bottomRadius, length, 24, 3]} />
    <meshStandardMaterial color={color} roughness={.64} />
  </mesh>;
}

function Headset() {
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(.12, 1.41, -.12),
    new THREE.Vector3(.245, 1.48, -.04),
    new THREE.Vector3(.27, 1.32, .12),
  ]);
  return <group>
    <mesh castShadow>
      <tubeGeometry args={[curve, 18, .014, 6, false]} />
      <meshStandardMaterial color="#59606a" roughness={.4} metalness={.26} />
    </mesh>
    <mesh position={[.27, 1.28, .13]} rotation={[0, Math.PI / 2, 0]} castShadow>
      <cylinderGeometry args={[.068, .068, .038, 12]} />
      <meshStandardMaterial color="#414852" roughness={.42} metalness={.3} />
    </mesh>
    <TaperedLimb from={[.30, 1.25, .16]} to={[.38, 1.16, .30]} topRadius={.012} bottomRadius={.012} color="#48505a" />
    <mesh position={[.39, 1.16, .30]} castShadow>
      <sphereGeometry args={[.025, 10, 8]} />
      <meshStandardMaterial color="#1e2229" roughness={.38} metalness={.18} />
    </mesh>
  </group>;
}

function GlovedHand({ at, rotation = [0, 0, 0] }: { at: Vec3; rotation?: Vec3 }) {
  return <group position={at} rotation={rotation}>
    <Part size={[.125, .105, .105]} color={GLOVE} radius={.04} />
    {[-.037, 0, .037].map((x) => <Part key={x} at={[x, .07, .045]} size={[.022, .065, .038]} color="#373b37" radius={.009} />)}
  </group>;
}

/**
 * A compact, high-readability Fox McCloud desk figurine. Its transform matches
 * the former FoxCollectible group in DeskModels, so it can replace that element
 * directly without changing the room composition.
 */
export default function FoxFigurine() {
  return <group position={[-2.55, 1.12, .82]} rotation={[0, .18, 0]} scale={.85}>
    <mesh position={[0, .045, 0]} receiveShadow castShadow>
      <cylinderGeometry args={[.34, .37, .09, 32]} />
      <meshStandardMaterial color="#232526" roughness={.42} />
    </mesh>
    <mesh position={[0, .098, 0]} receiveShadow castShadow>
      <cylinderGeometry args={[.29, .29, .02, 32]} />
      <meshStandardMaterial color="#b99f70" roughness={.56} />
    </mesh>

    {/* A braced stance gives the miniature a readable fighting silhouette. */}
    <TaperedLimb from={[-.12, .60, -.02]} to={[-.28, .34, .14]} topRadius={.105} bottomRadius={.085} color={PANTS} />
    <TaperedLimb from={[-.28, .34, .14]} to={[-.39, .16, .27]} topRadius={.085} bottomRadius={.07} color={PANTS} />
    <TaperedLimb from={[.12, .60, -.03]} to={[.25, .37, -.08]} topRadius={.105} bottomRadius={.085} color={PANTS} />
    <TaperedLimb from={[.25, .37, -.08]} to={[.16, .16, .13]} topRadius={.085} bottomRadius={.07} color={PANTS} />
    <Part at={[-.43, .145, .30]} size={[.27, .14, .40]} color={BOOT} radius={.055} rotation={[0, -.08, 0]} />
    <Part at={[.16, .145, .20]} size={[.25, .14, .37]} color={BOOT} radius={.055} rotation={[0, .10, 0]} />
    <Part at={[-.43, .078, .31]} size={[.28, .035, .41]} color="#181a1d" radius={.012} rotation={[0, -.08, 0]} />
    <Part at={[.16, .078, .20]} size={[.26, .035, .38]} color="#181a1d" radius={.012} rotation={[0, .10, 0]} />

    <group position={[0, .76, .00]} rotation={[0, -.10, -.06]}>
      <Part size={[.44, .40, .30]} color={JACKET} radius={.09} />
      <Part at={[0, .06, .158]} size={[.18, .29, .024]} color="#4a6e4e" radius={.008} />
      <Part at={[0, -.14, .17]} size={[.37, .048, .032]} color="#474842" radius={.01} />
      <Part at={[.04, -.14, .19]} size={[.07, .085, .018]} color="#bd9c5a" radius={.008} roughness={.38} />
      <Part at={[-.25, .07, 0]} size={[.09, .23, .25]} color="#a5a9a2" radius={.028} />
      <Part at={[.25, .07, 0]} size={[.09, .23, .25]} color="#a5a9a2" radius={.028} />
    </group>

    <TaperedLimb from={[-.20, .90, .02]} to={[-.38, .82, .19]} topRadius={.08} bottomRadius={.068} color={JACKET} />
    <TaperedLimb from={[-.38, .82, .19]} to={[-.31, 1.06, .30]} topRadius={.068} bottomRadius={.052} color={JACKET} />
    <GlovedHand at={[-.31, 1.08, .30]} rotation={[.12, .20, -.20]} />
    <TaperedLimb from={[.20, .90, -.01]} to={[.37, .79, .17]} topRadius={.08} bottomRadius={.068} color={JACKET} />
    <TaperedLimb from={[.37, .79, .17]} to={[.18, 1.04, .31]} topRadius={.068} bottomRadius={.052} color={JACKET} />
    <GlovedHand at={[.18, 1.06, .31]} rotation={[.14, -.20, .28]} />

    {/* The orange tail sits behind the jacket and ends in a cream tip. */}
    <TaperedLimb from={[-.13, .67, -.12]} to={[-.43, .53, -.40]} topRadius={.13} bottomRadius={.085} color={FUR} />
    <TaperedLimb from={[-.43, .53, -.40]} to={[-.53, .71, -.42]} topRadius={.085} bottomRadius={.05} color={MUZZLE} />

    <mesh position={[0, 1.19, .03]} scale={[1.0, 1.06, .87]} castShadow receiveShadow>
      <sphereGeometry args={[.235, 40, 28]} />
      <meshStandardMaterial color={FUR} roughness={.68} />
    </mesh>
    <mesh position={[0, 1.13, .205]} scale={[1.0, .60, .84]} castShadow>
      <sphereGeometry args={[.152, 32, 20]} />
      <meshStandardMaterial color={MUZZLE} roughness={.72} />
    </mesh>
    <mesh position={[0, 1.135, .335]} scale={[1.12, .72, .62]} castShadow>
      <sphereGeometry args={[.043, 14, 10]} />
      <meshStandardMaterial color="#292724" roughness={.45} />
    </mesh>
    {[-1, 1].map((side) => <group key={side}>
      <mesh position={[side * .158, 1.40, .028]} rotation={[0, 0, -side * .20]} castShadow>
        <coneGeometry args={[.108, .29, 5]} />
        <meshStandardMaterial color={FUR} roughness={.67} />
      </mesh>
      <mesh position={[side * .158, 1.41, .080]} rotation={[0, 0, -side * .20]}>
        <coneGeometry args={[.055, .18, 4]} />
        <meshStandardMaterial color="#e2c9ad" roughness={.72} />
      </mesh>
      <mesh position={[side * .105, 1.225, .235]} scale={[1, .44, .30]}>
        <sphereGeometry args={[.070, 16, 10]} />
        <meshStandardMaterial color="#f3e7cc" roughness={.58} />
      </mesh>
      <mesh position={[side * .105, 1.225, .258]} scale={[1, .62, .38]}>
        <sphereGeometry args={[.026, 12, 8]} />
        <meshStandardMaterial color="#315f51" roughness={.32} metalness={.08} />
      </mesh>
    </group>)}
    <Part at={[0, 1.025, .112]} size={[.25, .055, .096]} color={SCARF} radius={.015} />
    <mesh position={[.08, .97, .16]} rotation={[0, 0, -.12]} castShadow>
      <coneGeometry args={[.068, .19, 4]} />
      <meshStandardMaterial color={SCARF} roughness={.68} />
    </mesh>
    <Headset />
  </group>;
}
