# Getting started

## Install

```sh
npm install three github:VJigouline/mc-stl-export
```

## Write a file

`exportStl(root, options)` writes the meshes under `root`, usually a scene, as `.stl`. It returns the result.

```ts
import { exportStl } from 'mc-stl-export';

const result = exportStl(scene, { name: 'model' });
for (const warning of result.warnings) console.warn(warning);
const file = result.file;

// In a browser, download it:
const link = document.createElement('a');
link.href = URL.createObjectURL(new Blob([file.data], { type: file.mimeType }));
link.download = file.name;
link.click();

// In Node, write it:
// fs.writeFileSync(file.name, file.data);
```

## Units and orientation

STL has no units. Coordinates are written in millimetres and Z up, as slicers and CAD expect, unless `unit` and `zUp` say otherwise.

## Options

- **`onlyVisible`** (default true): Leaves out hidden objects and those under hidden parents.
- **`filter`** (default —): A function that decides, for each object, whether it is exported, such as one leaving out an editor's helpers.
- **`binary`** (default true): Binary STL; `false` writes ASCII.
- **`unit`** (default 'millimeter'): The unit coordinates are written in.
- **`zUp`** (default true): Turns three.js's Y up into Z up.
- **`name`** (default 'scene'): The file's name, without extension.

See the [API](API.md) for the whole result.
