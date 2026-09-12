"use client";

import { useMemo } from "react";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";

type Vec3 = [number, number, number];
const FUR = "#d89435";
const CREAM = "#f0e4c1";
const JACKET = "#e0e3cc";
const GREEN = "#516333";
const METAL = "#b1b7b8";

// Reuse unit spheres; small highlights need fewer segments than the silhouette.
const bodySphere = new THREE.SphereGeometry(1, 16, 12);
const detailSphere = new THREE.SphereGeometry(1, 8, 6);
const sculptMaterials = new Map<string, THREE.MeshStandardMaterial>();
function sculptMaterial(color: string, metal: boolean) {
  const key = `${color}:${metal}`;
  let material = sculptMaterials.get(key);
  if (!material) {
    material = new THREE.MeshStandardMaterial({ color, roughness: metal ? .43 : .69, metalness: metal ? .32 : 0 });
    sculptMaterials.set(key, material);
  }
  return material;
}

function Sculpt({ at, size, color, rotation, metal = false }: {
  at: Vec3; size: Vec3; color: string; rotation?: Vec3; metal?: boolean;
}) {
  return <mesh position={at} scale={size} rotation={rotation} geometry={Math.max(...size) < .06 ? detailSphere : bodySphere} dispose={null} material={sculptMaterial(color, metal)} castShadow receiveShadow />;
}

function Plate({ at, size, color, rotation, radius = .025 }: {
  at: Vec3; size: Vec3; color: string; rotation?: Vec3; radius?: number;
}) {
  return <RoundedBox position={at} args={size} rotation={rotation} radius={Math.min(radius, ...size.map(n => n * .45))} smoothness={2} bevelSegments={1} castShadow receiveShadow>
    <meshStandardMaterial color={color} roughness={.51} />
  </RoundedBox>;
}

function Limb({ from, to, radius, color, width = 1 }: { from: Vec3; to: Vec3; radius: number; color: string; width?: number }) {
  const a = new THREE.Vector3(...from), b = new THREE.Vector3(...to);
  const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
  return <mesh position={a.clone().add(b).multiplyScalar(.5)} quaternion={quaternion} scale={[width, 1, 1]} castShadow receiveShadow>
    <capsuleGeometry args={[radius, Math.max(.001, a.distanceTo(b) - radius * 2), 4, 12]} />
    <meshStandardMaterial color={color} roughness={.62} />
  </mesh>;
}

function Line({ points, radius, color }: { points: Vec3[]; radius: number; color: string }) {
  const curve = useMemo(() => new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p))), [points]);
  return <mesh castShadow>
    <tubeGeometry args={[curve, 12, radius, 6, false]} />
    <meshStandardMaterial color={color} roughness={.54} />
  </mesh>;
}

// Curved outlines and beveled depth keep ears and lapels pointed without
// the faceted, five-sided cones used by the previous miniature.
function Ear({ inner = false }: { inner?: boolean }) {
  const shape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-.095, 0);
    shape.quadraticCurveTo(-.105, .13, -.035, .30);
    shape.quadraticCurveTo(-.025, .322, -.012, .298);
    shape.quadraticCurveTo(.066, .17, .09, .015);
    shape.quadraticCurveTo(0, -.025, -.095, 0);
    return shape;
  }, []);
  const options = useMemo(() => ({ depth: .035, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: .012, bevelThickness: .014, curveSegments: 6 }), []);
  return <mesh scale={inner ? [.62, .73, .45] : [1, 1, 1]} position={inner ? [0, .035, .049] : [0, 0, 0]} castShadow>
    <extrudeGeometry args={[shape, options]} />
    <meshStandardMaterial color={inner ? CREAM : FUR} roughness={.72} />
  </mesh>;
}

const tailGeometry = (() => {
  const path = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-.08, .79, -.12), new THREE.Vector3(-.32, .72, -.23),
    new THREE.Vector3(-.55, .82, -.24), new THREE.Vector3(-.65, 1.03, -.19),
    new THREE.Vector3(-.67, 1.18, -.13),
  ]);
  const rings = 24, sides = 12, frames = path.computeFrenetFrames(rings, false);
  const positions: number[] = [], colors: number[] = [], indices: number[] = [];
  const orange = new THREE.Color(FUR), cream = new THREE.Color(CREAM);
  for (let i = 0; i <= rings; i++) {
    const t = i / rings, center = path.getPointAt(t);
    const radius = .003 + .145 * Math.pow(Math.sin(Math.PI * (.13 + t * .87)), .85);
    const color = orange.clone().lerp(cream, THREE.MathUtils.smoothstep(t, .66, .76));
    for (let j = 0; j <= sides; j++) {
      const angle = j / sides * Math.PI * 2;
      const point = center.clone().addScaledVector(frames.normals[i], Math.cos(angle) * radius).addScaledVector(frames.binormals[i], Math.sin(angle) * radius * .78);
      positions.push(point.x, point.y, point.z); colors.push(color.r, color.g, color.b);
      if (i < rings && j < sides) {
        const a = i * (sides + 1) + j, b = a + sides + 1;
        indices.push(a, b, a + 1, a + 1, b, b + 1);
      }
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices); geometry.computeVertexNormals();
  return geometry;
})();

function Glove({ at, rotation }: { at: Vec3; rotation: Vec3 }) {
  return <group position={at} rotation={rotation}>
    <Sculpt at={[0, .075, 0]} size={[.084, .038, .055]} color={METAL} metal />
    <Sculpt at={[0, 0, 0]} size={[.075, .087, .046]} color={METAL} metal />
    {[-.047, -.016, .017, .047].map((x, i) => {
      const length = [.071, .09, .086, .067][i];
      return <group key={x}>
        <Line points={[[x, -.034, .003], [x, -.075, .007], [x, -.034 - length, .03], [x, -.035 - length, .054]]} radius={.016} color={METAL} />
        <Sculpt at={[x, -.035 - length, .054]} size={[.016, .017, .017]} color={METAL} metal />
        <Sculpt at={[x, -.01, .043]} size={[.012, .011, .008]} color="#e0e2dc" metal />
      </group>;
    })}
    <Line points={[[-.066, .032, .011], [-.099, -.006, .029], [-.088, -.052, .063], [-.062, -.060, .069]]} radius={.022} color={METAL} />
    <Sculpt at={[-.062, -.06, .069]} size={[.023, .02, .023]} color={METAL} metal />
  </group>;
}

function Boot({ x, z, turn }: { x: number; z: number; turn: number }) {
  return <group position={[x, 0, z]} rotation={[0, turn, 0]}>
    <Plate at={[0, .128, .066]} size={[.25, .056, .36]} color="#707778" radius={.025} />
    <Sculpt at={[0, .181, .089]} size={[.124, .085, .193]} color={METAL} metal />
    <Limb from={[0, .205, -.034]} to={[0, .48, -.068]} radius={.085} width={1.12} color={METAL} />
    <Sculpt at={[0, .466, -.063]} size={[.099, .075, .092]} color={METAL} metal />
    <Plate at={[0, .354, .019]} size={[.115, .205, .029]} rotation={[-.13, 0, 0]} color="#c6cbca" />
    <Sculpt at={[.087, .217, -.018]} size={[.033, .034, .033]} color="#e0e3de" metal />
  </group>;
}

function Head() {
  return <group position={[0, 1.37, .015]} rotation={[.035, -.30, -.025]}>
    <Sculpt at={[0, .005, 0]} size={[.22, .221, .184]} color={FUR} />
    <Sculpt at={[0, -.121, .104]} size={[.161, .080, .142]} color={CREAM} />
    {[-1, 1].map(side => <group key={side}>
      <group position={[side * .145, .164, -.027]} scale={[1, .65, 1]} rotation={[0, side * -.12, side * -.20]}><Ear /><Ear inner /></group>
      <Sculpt at={[side * .139, -.079, .092]} size={[.108, .074, .12]} rotation={[0, side * -.25, side * -.20]} color={CREAM} />
      <Sculpt at={[side * .19, -.018, -.001]} size={[.074, .11, .105]} rotation={[0, 0, side * -.3]} color={FUR} />
      <Sculpt at={[side * .094, .018, .173]} size={[.078, .042, .025]} rotation={[0, side * .22, side * .22]} color="#f3f0dc" />
      <Sculpt at={[side * .091 - .01, .016, .198]} size={[.025, .029, .009]} color="#57777c" />
      <Sculpt at={[side * .091 - .012, .014, .205]} size={[.012, .019, .006]} color="#171e20" />
      <Sculpt at={[side * .091 - .018, .027, .21]} size={[.006, .007, .003]} color="#f8f7ea" />
      <Sculpt at={[side * .094, .055, .175]} size={[.093, .027, .045]} rotation={[0, side * .17, side * .23]} color="#c88c35" />
    </group>)}
    <Sculpt at={[0, -.046, .185]} size={[.084, .087, .132]} color={FUR} />
    <Sculpt at={[0, -.101, .229]} size={[.115, .069, .166]} color={CREAM} />
    <Sculpt at={[0, -.083, .375]} size={[.057, .039, .037]} color="#252826" />
    <Sculpt at={[-.016, -.066, .402]} size={[.018, .008, .006]} color="#666960" />
    <Line points={[[-.112, -.128, .225], [-.072, -.151, .298], [0, -.158, .333], [.083, -.148, .276]]} radius={.004} color="#756444" />
    {/* Silver headset and a microphone that follows the cheek. */}
    <Line points={[[.216, -.012, -.01], [.226, .174, -.045], [0, .231, -.051], [-.20, .161, -.048]]} radius={.027} color="#adb3b2" />
    <Plate at={[.219, .012, .014]} size={[.075, .172, .134]} color="#adb3b2" />
    <Plate at={[.264, .011, .021]} size={[.018, .112, .09]} color="#606865" radius={.006} />
    <Plate at={[-.207, .021, .008]} size={[.056, .134, .106]} color="#9ba4a2" />
    <Plate at={[0, .208, .086]} size={[.123, .054, .078]} color="#b6bab3" />
    <Line points={[[.255, -.049, .059], [.247, -.128, .142], [.167, -.151, .246], [.099, -.15, .298]]} radius={.013} color="#727b79" />
    <Sculpt at={[.09, -.15, .307]} size={[.047, .022, .024]} color="#3b4240" />
  </group>;
}

/** Smooth resin-style miniature, posed from Sean's hand-on-hip reference. */
export default function FoxFigurine() {
  return <group position={[-2.55, 1.12, .82]} rotation={[0, .18, 0]} scale={.78}>
    <mesh position={[0, .045, .01]} receiveShadow castShadow><cylinderGeometry args={[.44, .46, .09, 32]} /><meshStandardMaterial color="#303436" roughness={.42} /></mesh>
    <mesh position={[0, .096, .01]} receiveShadow><cylinderGeometry args={[.416, .416, .016, 32]} /><meshStandardMaterial color="#bba57b" roughness={.58} /></mesh>
    <mesh geometry={tailGeometry} castShadow receiveShadow><meshStandardMaterial vertexColors roughness={.76} /></mesh>
    <Boot x={-.218} z={.04} turn={-.25} /><Boot x={.20} z={-.015} turn={.18} />
    <Limb from={[-.122, .797, -.015]} to={[-.217, .473, .006]} radius={.132} color={GREEN} />
    <Limb from={[.125, .797, -.01]} to={[.201, .476, -.043]} radius={.13} color={GREEN} />
    <Sculpt at={[0, .783, -.018]} size={[.237, .14, .154]} color={GREEN} />
    <Sculpt at={[0, 1.014, -.017]} size={[.203, .233, .146]} color="#40562b" />
    <Plate at={[0, .805, .126]} size={[.369, .057, .042]} color="#31382b" radius={.012} />
    <Plate at={[.023, .807, .153]} size={[.055, .073, .025]} color="#a7a087" radius={.009} />
    {[-1, 1].map(side => <group key={side}>
      <Sculpt at={[side * .161, 1.024, -.01]} size={[.104, .218, .164]} rotation={[0, 0, side * .10]} color={JACKET} />
      <Plate at={[side * .092, 1.145, .121]} size={[.072, .18, .046]} rotation={[.08, side * -.18, side * -.24]} color="#eef0dc" />
      <Line points={[[side * .111, 1.05, .144], [side * .105, .949, .15], [side * .115, .835, .125]]} radius={.006} color="#b5b9a3" />
      <Plate at={[side * .176, .846, .09]} size={[.132, .025, .064]} color="#d0d6be" radius={.01} />
    </group>)}
    <Plate at={[.097, 1.086, .162]} size={[.049, .026, .012]} color="#c7bc8c" radius={.003} />
    {/* Relaxed left arm; right elbow projects outward with the glove on the hip. */}
    <Limb from={[-.218, 1.121, -.006]} to={[-.325, .972, .006]} radius={.087} color={JACKET} />
    <Sculpt at={[-.327, .946, .011]} size={[.087, .05, .083]} color="#c4ccca" />
    <Limb from={[-.331, .927, .009]} to={[-.344, .762, .097]} radius={.054} color={FUR} />
    <Glove at={[-.347, .686, .123]} rotation={[-.12, -.16, -.05]} />
    <Limb from={[.217, 1.126, -.018]} to={[.438, 1.012, -.008]} radius={.093} color={JACKET} />
    <Sculpt at={[.437, .983, .008]} size={[.094, .053, .085]} rotation={[0, 0, -.48]} color="#c4ccca" />
    <Limb from={[.429, .958, .014]} to={[.324, .822, .102]} radius={.057} color={FUR} />
    <Glove at={[.275, .795, .142]} rotation={[-.08, -.20, -.70]} />
    <mesh position={[0, 1.233, .017]} rotation={[Math.PI / 2, 0, 0]} castShadow><torusGeometry args={[.106, .038, 8, 24]} /><meshStandardMaterial color="#ac3433" roughness={.76} /></mesh>
    <Sculpt at={[.004, 1.174, .151]} size={[.111, .068, .047]} rotation={[0, 0, -.12]} color="#b43c36" />
    <Sculpt at={[.025, 1.126, .16]} size={[.073, .039, .025]} rotation={[0, 0, -.22]} color="#ac3433" />
    <Head />
  </group>;
}
