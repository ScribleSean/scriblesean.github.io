"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

// These desk models never move independently. Draw matching opaque surfaces
// together, while leaving textured, transparent and instanced objects alone.
export default function StaticBatch({ children }: { children: ReactNode }) {
  const root = useRef<THREE.Group>(null);
  useLayoutEffect(() => {
    const group = root.current;
    if (!group) return;
    group.updateWorldMatrix(true, true);
    const inverse = group.matrixWorld.clone().invert();
    const batches = new Map<string, THREE.Mesh[]>();
    group.traverse(object => {
      if (!(object instanceof THREE.Mesh) || object instanceof THREE.InstancedMesh || !object.visible) return;
      const material = object.material;
      if (!(material instanceof THREE.MeshStandardMaterial) || material.type !== "MeshStandardMaterial" || material.transparent) return;
      if (Object.values(material).some(value => value instanceof THREE.Texture)) return;
      const json = JSON.parse(JSON.stringify(material.toJSON()));
      delete json.uuid;
      const key = JSON.stringify([json, object.castShadow, object.receiveShadow]);
      const batch = batches.get(key) ?? [];
      batch.push(object);
      batches.set(key, batch);
    });
    const merged: THREE.Mesh[] = [];
    const hidden = new Map<THREE.Mesh, THREE.Mesh["raycast"]>();
    for (const sources of batches.values()) {
      if (sources.length < 2) continue;
      const geometries = sources.map(source => {
        const geometry = source.geometry.index ? source.geometry.toNonIndexed() : source.geometry.clone();
        return geometry.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inverse, source.matrixWorld));
      });
      const geometry = mergeGeometries(geometries);
      geometries.forEach(part => part.dispose());
      if (!geometry) continue;
      const mesh = new THREE.Mesh(geometry, sources[0].material);
      mesh.castShadow = sources[0].castShadow;
      mesh.receiveShadow = sources[0].receiveShadow;
      group.add(mesh);
      merged.push(mesh);
      sources.forEach(source => {
        hidden.set(source, source.raycast);
        source.visible = false;
        source.raycast = () => {};
      });
    }
    return () => {
      hidden.forEach((raycast, source) => { source.visible = true; source.raycast = raycast; });
      merged.forEach(mesh => { group.remove(mesh); mesh.geometry.dispose(); });
    };
  }, []);
  return <group ref={root}>{children}</group>;
}
