"use client";

import { type RefObject, useEffect } from "react";
import * as THREE from "three";

function hash2(x: number, z: number) {
  const n = Math.sin(x * 127.1 + z * 311.7) * 43758.5453;
  return n - Math.floor(n);
}

function noise2(x: number, z: number) {
  const xi = Math.floor(x);
  const zi = Math.floor(z);
  const xf = x - xi;
  const zf = z - zi;
  const u = xf * xf * (3 - 2 * xf);
  const v = zf * zf * (3 - 2 * zf);
  const a = hash2(xi, zi);
  const b = hash2(xi + 1, zi);
  const c = hash2(xi, zi + 1);
  const d = hash2(xi + 1, zi + 1);
  return a + (b - a) * u + (c - a) * v * (1 - u) + (d - b) * u * v;
}

function fbm(x: number, z: number) {
  let value = 0;
  let amp = 0.55;
  let freq = 0.045;
  for (let i = 0; i < 5; i++) {
    value += amp * noise2(x * freq, z * freq);
    freq *= 2.03;
    amp *= 0.5;
  }
  return value;
}

function heightAt(x: number, z: number) {
  const ridge = Math.abs(fbm(x * 0.55 + 40, z * 0.55) * 2 - 1);
  const rolling = fbm(x + 12, z - 7);
  const dunes = fbm(x * 1.8 - 30, z * 1.6) * 0.35;
  return rolling * 7.4 + ridge * 9.8 + dunes - 1.6;
}

const SKY_VERT = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vDir = world.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const SKY_FRAG = /* glsl */ `
  varying vec3 vDir;
  uniform vec3 uSunDir;

  void main() {
    vec3 dir = normalize(vDir);
    float h = dir.y;

    vec3 zenith = vec3(0.035, 0.03, 0.09);
    vec3 upper = vec3(0.18, 0.08, 0.16);
    vec3 belt = vec3(0.72, 0.28, 0.18);
    vec3 glow = vec3(0.98, 0.68, 0.32);
    vec3 nadir = vec3(0.04, 0.03, 0.05);

    vec3 col = mix(nadir, glow, smoothstep(-0.35, 0.02, h));
    col = mix(col, belt, smoothstep(-0.02, 0.12, h));
    col = mix(col, upper, smoothstep(0.08, 0.38, h));
    col = mix(col, zenith, smoothstep(0.28, 0.92, h));

    vec3 sunDir = normalize(uSunDir);
    float sun = pow(max(dot(dir, sunDir), 0.0), 220.0);
    float halo = pow(max(dot(dir, sunDir), 0.0), 8.0);
    float wash = pow(max(dot(dir, sunDir), 0.0), 2.2);

    col += vec3(1.0, 0.86, 0.55) * sun * 2.4;
    col += vec3(1.0, 0.45, 0.12) * halo * 0.55;
    col += vec3(0.85, 0.32, 0.08) * wash * 0.18 * (1.0 - smoothstep(0.15, 0.7, h));

    gl_FragColor = vec4(col, 1.0);
  }
`;

function buildTerrain(segments: number) {
  const geo = new THREE.PlaneGeometry(220, 220, segments, segments);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const low = new THREE.Color("#1a0e0a");
  const mid = new THREE.Color("#2a1812");
  const high = new THREE.Color("#3d2a22");
  const tmp = new THREE.Color();

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const y = heightAt(x, z);
    pos.setY(i, y);
    const t = THREE.MathUtils.clamp((y + 2) / 16, 0, 1);
    tmp.copy(low).lerp(mid, Math.min(t * 1.6, 1));
    tmp.lerp(high, Math.max(t - 0.45, 0) * 1.4);
    colors[i * 3] = tmp.r;
    colors[i * 3 + 1] = tmp.g;
    colors[i * 3 + 2] = tmp.b;
  }

  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  return geo;
}

function buildTrees(count: number) {
  const trunkGeo = new THREE.CylinderGeometry(0.08, 0.12, 0.7, 5);
  const crownGeo = new THREE.ConeGeometry(0.55, 1.8, 6);
  trunkGeo.translate(0, 0.35, 0);
  crownGeo.translate(0, 1.45, 0);

  const trunkMat = new THREE.MeshStandardMaterial({
    color: "#140c09",
    roughness: 1,
    flatShading: true,
  });
  const crownMat = new THREE.MeshStandardMaterial({
    color: "#0d0a08",
    roughness: 1,
    flatShading: true,
  });

  const trunk = new THREE.InstancedMesh(trunkGeo, trunkMat, count);
  const crown = new THREE.InstancedMesh(crownGeo, crownMat, count);
  const dummy = new THREE.Object3D();
  let placed = 0;
  let attempts = 0;

  while (placed < count && attempts < count * 8) {
    attempts += 1;
    const x = (hash2(placed + 3.1, attempts) - 0.5) * 150;
    const z = (hash2(attempts, placed + 9.7) - 0.5) * 150;
    const y = heightAt(x, z);
    if (y < 1.2 || y > 11.5) continue;
    if (z > 18 && Math.abs(x) < 18) continue;

    const s = 0.7 + hash2(x, z) * 1.6;
    dummy.position.set(x, y, z);
    dummy.rotation.set(0, hash2(z, x) * Math.PI * 2, 0);
    dummy.scale.set(s, s * (0.85 + hash2(x * 0.2, z) * 0.5), s);
    dummy.updateMatrix();
    trunk.setMatrixAt(placed, dummy.matrix);
    crown.setMatrixAt(placed, dummy.matrix);
    placed += 1;
  }

  trunk.count = placed;
  crown.count = placed;
  trunk.instanceMatrix.needsUpdate = true;
  crown.instanceMatrix.needsUpdate = true;
  return { trunk, crown };
}

function buildEmbers(count: number) {
  const geo = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const speeds = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (hash2(i, 1.2) - 0.5) * 60;
    positions[i * 3 + 1] = hash2(i, 4.4) * 18 + 1;
    positions[i * 3 + 2] = (hash2(i, 8.1) - 0.5) * 50;
    speeds[i] = 0.35 + hash2(i, 2.7) * 0.9;
  }

  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({
    color: "#ffb26a",
    size: 0.12,
    transparent: true,
    opacity: 0.7,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  });
  const points = new THREE.Points(geo, mat);
  return { points, speeds };
}

export function useHorizonScene(canvasRef: RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const mobile = window.matchMedia("(max-width: 768px)").matches;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: !mobile,
      alpha: false,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1.1 : 1.5));
    renderer.setSize(window.innerWidth, window.innerHeight, true);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.setClearColor(0x0c0908, 1);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x2a1510, 0.018);

    const camera = new THREE.PerspectiveCamera(
      48,
      window.innerWidth / window.innerHeight,
      0.1,
      400,
    );
    camera.position.set(0, 4.2, 16);

    const sunDir = new THREE.Vector3(0.42, 0.12, -1).normalize();

    const sky = new THREE.Mesh(
      new THREE.SphereGeometry(180, 32, 24),
      new THREE.ShaderMaterial({
        vertexShader: SKY_VERT,
        fragmentShader: SKY_FRAG,
        uniforms: { uSunDir: { value: sunDir.clone() } },
        side: THREE.BackSide,
        depthWrite: false,
      }),
    );
    scene.add(sky);

    const hemi = new THREE.HemisphereLight(0xffc9a1, 0x1a0c08, 0.55);
    scene.add(hemi);

    const sunLight = new THREE.DirectionalLight(0xffb066, 2.1);
    sunLight.position.copy(sunDir.clone().multiplyScalar(40));
    scene.add(sunLight);

    const fill = new THREE.DirectionalLight(0x6a4cff, 0.18);
    fill.position.set(-20, 8, 10);
    scene.add(fill);

    const sun = new THREE.Mesh(
      new THREE.SphereGeometry(2.4, 24, 24),
      new THREE.MeshBasicMaterial({ color: 0xffe2a8 }),
    );
    sun.position.copy(sunDir.clone().multiplyScalar(90));
    scene.add(sun);

    const glow = new THREE.Mesh(
      new THREE.SphereGeometry(7.5, 24, 24),
      new THREE.MeshBasicMaterial({
        color: 0xff7a2a,
        transparent: true,
        opacity: 0.18,
        depthWrite: false,
      }),
    );
    glow.position.copy(sun.position);
    scene.add(glow);

    const terrainGeo = buildTerrain(mobile ? 72 : 128);
    const terrain = new THREE.Mesh(
      terrainGeo,
      new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.96,
        metalness: 0.02,
        flatShading: true,
      }),
    );
    scene.add(terrain);

    const { trunk, crown } = buildTrees(mobile ? 90 : 180);
    scene.add(trunk, crown);

    const { points: embers, speeds } = buildEmbers(mobile ? 80 : 160);
    scene.add(embers);

    const look = new THREE.Vector3(6, 3.2, -28);
    const mouse = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };

    const onMove = (e: PointerEvent) => {
      target.x = (e.clientX / window.innerWidth - 0.5) * 2;
      target.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    const onResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, true);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("resize", onResize);

    let raf = 0;
    let t = 0;
    let visible = document.visibilityState === "visible";
    const emberPos = embers.geometry.getAttribute("position");

    const onVisibility = () => {
      visible = document.visibilityState === "visible";
    };
    document.addEventListener("visibilitychange", onVisibility);

    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!visible) return;
      t += reduceMotion ? 0 : 0.0032;
      mouse.x += (target.x - mouse.x) * 0.035;
      mouse.y += (target.y - mouse.y) * 0.035;

      const cx = Math.sin(t * 0.35) * 1.4 + mouse.x * 1.8;
      const cy = 4.15 + Math.sin(t * 0.5) * 0.18 - mouse.y * 0.55;
      const cz = 16.2 + Math.cos(t * 0.28) * 0.6;
      camera.position.set(cx, cy, cz);
      camera.lookAt(look.x + mouse.x * 1.2, look.y - mouse.y * 0.4, look.z);

      if (!reduceMotion) {
        for (let i = 0; i < emberPos.count; i++) {
          let y = emberPos.getY(i) + speeds[i] * 0.012;
          if (y > 20) y = 0.4;
          emberPos.setY(i, y);
        }
        emberPos.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", onResize);
      terrainGeo.dispose();
      trunk.geometry.dispose();
      crown.geometry.dispose();
      (trunk.material as THREE.Material).dispose();
      (crown.material as THREE.Material).dispose();
      embers.geometry.dispose();
      (embers.material as THREE.Material).dispose();
      sky.geometry.dispose();
      (sky.material as THREE.Material).dispose();
      sun.geometry.dispose();
      (sun.material as THREE.Material).dispose();
      glow.geometry.dispose();
      (glow.material as THREE.Material).dispose();
      renderer.dispose();
    };
  }, [canvasRef]);
}
