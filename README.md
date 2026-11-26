# mc-stl-export

An STL exporter for [three.js](https://threejs.org/), written in TypeScript. It writes three.js meshes as STL for 3D printing and CAD: every visible mesh in world coordinates, binary or ASCII, turned Z up and in millimetres, as slicers expect. It was made for [SceneEditor](https://github.com/VJigouline/SceneEditor), and works in any three.js application.

```ts
import { exportStl } from 'mc-stl-export';

const { file } = exportStl(scene);
// file.data is a Uint8Array: download it, or write it to disk.
const url = URL.createObjectURL(new Blob([file.data], { type: file.mimeType }));
```

## What it writes

- Every triangle of every mesh, in world coordinates, with its facet normal.
- Binary STL (the default), or ASCII.
- Faces under mirroring transforms are turned back to face outwards.

STL holds triangles only: lines and points are left out, with a warning, and so are colours, materials and units. See [Format and limits](Documentation/Support.md) for the details.

## Install

The package is not on the npm registry. Install it from GitHub:

```sh
npm install github:VJigouline/mc-stl-export
```

`three` (r160 or later) is a peer dependency. The package builds itself on install.

## Documentation

- [Getting started](Documentation/GettingStarted.md)
- [API](Documentation/API.md)
- [Format and limits](Documentation/Support.md)
- [Using it in SceneEditor](Documentation/SceneEditor.md)

## Development

```sh
npm install
npm test           # unit tests, with Vitest
npm run typecheck
npm run build      # dist/
```

The tests write files and read them back with three.js's loaders. It needs Node.js 22 or later.

## Licence

[MIT](LICENSE)
