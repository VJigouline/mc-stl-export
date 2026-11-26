// Writes three.js meshes as STL, binary or ASCII, for 3D printing and CAD: every visible mesh in
// world coordinates, turned Z up and scaled to the unit asked for (millimetres by default).

import * as THREE from 'three';
import { collectWorld, fileName, toZUp, triangles, UNITS, type CollectOptions, type ExportFile, type Unit } from './common.js';

export { collectWorld, type CollectOptions, type ExportFile, type Unit, UNITS } from './common.js';

export interface StlOptions extends CollectOptions {
  /** Binary (the default) is about five times smaller than ASCII. */
  binary?: boolean;
  /** The unit coordinates are written in. Default 'millimeter', as slicers assume. */
  unit?: Unit;
  /** Turns three.js's Y up into Z up, as printers and CAD expect. Default true. */
  zUp?: boolean;
  /** The file's name, without extension. Default 'scene'. */
  name?: string;
}

export interface StlExportResult {
  file: ExportFile;
  warnings: string[];
  stats: { meshes: number; triangles: number };
}

/** Writes the meshes under `root` as an STL file. Lines and points are left out. */
export function exportStl(root: THREE.Object3D, options: StlOptions = {}): StlExportResult {
  const unit = options.unit ?? 'millimeter';
  const transform = options.zUp === false ? new THREE.Matrix4().makeScale(1 / UNITS[unit], 1 / UNITS[unit], 1 / UNITS[unit]) : toZUp(1 / UNITS[unit]);
  const objects = collectWorld(root, options);
  const warnings: string[] = [];
  const skipped = objects.filter((o) => o.kind !== 'mesh').length;
  if (skipped) warnings.push(`${skipped} lines and point clouds were left out: STL holds only triangles`);
  const tris: number[] = [];
  let meshes = 0;
  for (const o of objects) {
    if (o.kind !== 'mesh') continue;
    meshes++;
    o.geometry.applyMatrix4(transform);
    const p = o.geometry.getAttribute('position');
    for (const t of triangles(o.geometry)) {
      for (const v of [t.a, t.b, t.c]) tris.push(p.getX(v), p.getY(v), p.getZ(v));
    }
  }
  const count = tris.length / 9;
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const c = new THREE.Vector3();
  const n = new THREE.Vector3();
  const normal = (i: number) => {
    a.fromArray(tris, i * 9);
    b.fromArray(tris, i * 9 + 3);
    c.fromArray(tris, i * 9 + 6);
    // Counter-clockwise triangles face along (b - a) x (c - a).
    return n.subVectors(b, a).cross(c.sub(a)).normalize();
  };
  const name = options.name ?? 'scene';
  let data: Uint8Array;
  if (options.binary === false) {
    const f = (x: number) => (Number.isFinite(x) ? x.toExponential(6) : '0');
    const lines = [`solid ${name}`];
    for (let i = 0; i < count; i++) {
      const v = normal(i);
      lines.push(` facet normal ${f(v.x)} ${f(v.y)} ${f(v.z)}`, '  outer loop');
      for (let k = 0; k < 3; k++) lines.push(`   vertex ${f(tris[i * 9 + k * 3]!)} ${f(tris[i * 9 + k * 3 + 1]!)} ${f(tris[i * 9 + k * 3 + 2]!)}`);
      lines.push('  endloop', ' endfacet');
    }
    lines.push(`endsolid ${name}`, '');
    data = new TextEncoder().encode(lines.join('\n'));
  } else {
    // An 80-byte header, the triangle count, then 50 bytes per triangle.
    data = new Uint8Array(84 + count * 50);
    const view = new DataView(data.buffer);
    data.set(new TextEncoder().encode(`Exported by mc-stl-export, ${unit}`.slice(0, 80)));
    view.setUint32(80, count, true);
    for (let i = 0; i < count; i++) {
      const o = 84 + i * 50;
      const v = normal(i);
      view.setFloat32(o, v.x || 0, true);
      view.setFloat32(o + 4, v.y || 0, true);
      view.setFloat32(o + 8, v.z || 0, true);
      for (let k = 0; k < 9; k++) view.setFloat32(o + 12 + k * 4, tris[i * 9 + k]!, true);
    }
  }
  if (!count) warnings.push('There are no triangles to write');
  for (const o of objects) o.geometry.dispose();
  return { file: { name: fileName(options.name, 'stl'), data, mimeType: 'model/stl' }, warnings, stats: { meshes, triangles: count } };
}
