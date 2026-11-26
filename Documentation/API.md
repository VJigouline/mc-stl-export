# API

## `exportStl(root, options?)`

Writes `.stl` and returns a `StlExportResult`.

### Options

| Option | Default | Meaning |
| --- | --- | --- |
| `onlyVisible` | true | Leaves out hidden objects and those under hidden parents. |
| `filter` | — | A function that decides, for each object, whether it is exported, such as one leaving out an editor's helpers. |
| `binary` | true | Binary STL; `false` writes ASCII. |
| `unit` | 'millimeter' | The unit coordinates are written in. |
| `zUp` | true | Turns three.js's Y up into Z up. |
| `name` | 'scene' | The file's name, without extension. |

### `StlExportResult`

| Field | Type | Meaning |
| --- | --- | --- |
| `file` | `ExportFile` | The STL file. |
| `stats` | object | Meshes and triangles. |
| `warnings` | `string[]` | What was left out, and why. |

`ExportFile` is `{ name, data, mimeType }`, with `data` a `Uint8Array`.

See the package's `index.d.ts` for every exported type and helper.
