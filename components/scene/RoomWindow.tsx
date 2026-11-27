"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import type { Phase } from "@/lib/time-of-day";

// A window on the back wall, up and to the left of the CRT in the room view. Its sky follows the time of day.
const WIDTH = 3.6;
const HEIGHT = 2.8;
const AT: [number, number, number] = [-3, 4.2, -7.92];

function paintSky(phase: Phase) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 400;
  const g = canvas.getContext("2d");
  if (!g) return canvas;
  const sky = g.createLinearGradient(0, 0, 0, canvas.height);
  const stops: Record<Phase, [string, string, string]> = {
    day: ["#a9cbe6", "#cfe1ee", "#eef1ee"],
    golden: ["#6f7fb3", "#f0a274", "#f8d6a0"],
    night: ["#070a1c", "#121a3a", "#1e2850"],
  };
  const [top, middle, bottom] = stops[phase];
  sky.addColorStop(0, top);
  sky.addColorStop(.6, middle);
  sky.addColorStop(1, bottom);
  g.fillStyle = sky;
  g.fillRect(0, 0, canvas.width, canvas.height);
  if (phase === "golden") {
    // A low sun sitting on the sill.
    const sun = g.createRadialGradient(330, 400, 10, 330, 400, 150);
    sun.addColorStop(0, "rgba(255,236,200,1)");
    sun.addColorStop(.25, "rgba(255,190,120,.9)");
    sun.addColorStop(1, "rgba(255,170,110,0)");
    g.fillStyle = sun;
    g.fillRect(0, 0, canvas.width, canvas.height);
  }
  if (phase === "night") {
    // Fixed star positions, so every visit draws the same sky.
    let seed = 7;
    const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 70; i++) {
      g.fillStyle = `rgba(230,236,255,${.35 + random() * .6})`;
      g.beginPath();
      g.arc(random() * canvas.width, random() * canvas.height * .8, .6 + random() * 1.3, 0, Math.PI * 2);
      g.fill();
    }
    g.fillStyle = "#f2eedf";
    g.beginPath();
    g.arc(140, 110, 34, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#121a3a";
    g.beginPath();
    g.arc(156, 100, 30, 0, Math.PI * 2);
    g.fill();
  }
  if (phase === "day") {
    g.fillStyle = "rgba(255,255,255,.55)";
    for (const [x, y, r] of [[120, 120, 34], [160, 112, 42], [205, 124, 30], [360, 200, 26], [392, 192, 34], [424, 204, 24]]) {
      g.beginPath();
      g.arc(x, y, r, 0, Math.PI * 2);
      g.fill();
    }
  }
  return canvas;
}

export default function RoomWindow({ phase, frame }: { phase: Phase; frame: string }) {
  const texture = useMemo(() => {
    const map = new THREE.CanvasTexture(paintSky(phase));
    map.colorSpace = THREE.SRGBColorSpace;
    return map;
  }, [phase]);
  useEffect(() => () => texture.dispose(), [texture]);
  const bar = <meshStandardMaterial color={frame} roughness={.7} />;
  return (
    <group position={AT}>
      <mesh position={[0, 0, .01]}>
        <planeGeometry args={[WIDTH, HEIGHT]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
      {/* Frame, cross bars and sill */}
      {[[0, HEIGHT / 2 + .07, WIDTH + .28, .14], [0, -HEIGHT / 2 - .07, WIDTH + .28, .14]].map(([x, y, w, h]) => (
        <mesh key={`h${y}`} position={[x, y, .06]} receiveShadow><boxGeometry args={[w, h, .12]} />{bar}</mesh>
      ))}
      {[-WIDTH / 2 - .07, WIDTH / 2 + .07].map((x) => (
        <mesh key={`v${x}`} position={[x, 0, .06]} receiveShadow><boxGeometry args={[.14, HEIGHT, .12]} />{bar}</mesh>
      ))}
      <mesh position={[0, 0, .05]}><boxGeometry args={[.06, HEIGHT, .06]} />{bar}</mesh>
      <mesh position={[0, 0, .05]}><boxGeometry args={[WIDTH, .06, .06]} />{bar}</mesh>
      <mesh position={[0, -HEIGHT / 2 - .2, .2]} castShadow receiveShadow><boxGeometry args={[WIDTH + .5, .1, .4]} />{bar}</mesh>
    </group>
  );
}
