# Using it in SceneEditor

[SceneEditor](https://github.com/VJigouline/SceneEditor) saves scenes with mc-stl-export from the **Scene** tab: choose the format under **Select output format**, then **Save Scene**. The **STL for 3D printing (stl, mm)** format writes the visible meshes in millimetres and Z up, as slicers expect.

The transform gizmo and light helpers are left out. Warnings, such as objects the format can't hold, go to the browser console, and a scene that can't be saved gives a **Failure** message.
