# Format and limits

## What is written

- Every triangle of every mesh, in world coordinates, with its facet normal.
- Binary STL (the default), or ASCII.
- Faces under mirroring transforms are turned back to face outwards.

## Units and orientation

STL has no units. Coordinates are written in millimetres and Z up, as slicers and CAD expect, unless `unit` and `zUp` say otherwise.

## Limits

STL holds triangles only: lines and points are left out, with a warning, and so are colours, materials and units.
