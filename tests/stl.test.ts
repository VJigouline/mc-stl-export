import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { describe, expect, it } from 'vitest';
import { exportStl } from '../src/index.js';

function scene() {
  const s = new THREE.Scene();
  const box = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.2, 0.3), new THREE.MeshStandardMaterial());
  box.position.set(1, 0, 0);
  s.add(box);
  const hidden = new THREE.Mesh(new THREE.SphereGeometry(1), new THREE.MeshStandardMaterial());
  hidden.visible = false;
  s.add(hidden);
  s.add(new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0], 3))));
  return s;
}

const read = (data: Uint8Array) => new STLLoader().parse(data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer);

describe('STL', () => {
  it('writes binary STL in millimetres, Z up, leaving out hidden objects and points', () => {
    const r = exportStl(scene(), { name: 'part' });
    expect(r.file.name).toBe('part.stl');
    expect(r.stats).toEqual({ meshes: 1, triangles: 12 });
    expect(r.file.data.length).toBe(84 + 12 * 50);
    expect(r.warnings[0]).toContain('1 lines and point clouds');
    const g = read(r.file.data);
    g.computeBoundingBox();
    const size = g.boundingBox!.getSize(new THREE.Vector3());
    // 0.1 x 0.2 x 0.3 m, with Y up turned to Z up: 100 x 300 x 200 mm.
    expect([size.x, size.y, size.z].map((v) => Math.round(v))).toEqual([100, 300, 200]);
    expect(g.boundingBox!.min.x).toBeCloseTo(950);
  });

  it('writes normals that face outwards', () => {
    const g = read(exportStl(scene()).file.data);
    const p = g.getAttribute('position');
    const n = g.getAttribute('normal');
    const centre = new THREE.Vector3(1000, 0, 0);
    for (let i = 0; i < p.count; i += 3) {
      const out = new THREE.Vector3().fromBufferAttribute(p, i).sub(centre);
      expect(out.dot(new THREE.Vector3().fromBufferAttribute(n, i))).toBeGreaterThan(0);
    }
  });

  it('writes ASCII STL, in other units and Y up', () => {
    const r = exportStl(scene(), { binary: false, unit: 'meter', zUp: false });
    const text = new TextDecoder().decode(r.file.data);
    expect(text.startsWith('solid scene')).toBe(true);
    expect(text.match(/facet normal/g)).toHaveLength(12);
    const g = read(r.file.data);
    g.computeBoundingBox();
    expect(g.boundingBox!.getSize(new THREE.Vector3()).y).toBeCloseTo(0.2);
  });

  it('keeps faces facing out under mirroring transforms', () => {
    const s = new THREE.Scene();
    const box = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1));
    box.scale.x = -1;
    s.add(box);
    const g = read(exportStl(s, { unit: 'meter' }).file.data);
    const p = g.getAttribute('position');
    const n = g.getAttribute('normal');
    for (let i = 0; i < p.count; i += 3) expect(new THREE.Vector3().fromBufferAttribute(p, i).dot(new THREE.Vector3().fromBufferAttribute(n, i))).toBeGreaterThan(0);
  });
});
