# Changelog

## v1.2.64 -> v2.0.20

> Note: This version is a full overhaul of the Gauge component, upgrade with care.


### New Features

  - Now grafana type supports pointers. #37
  - Added support for multiple pointers. #48


<img width="450" height="322" alt="image" src="https://github.com/user-attachments/assets/f527b7c8-6b23-4d90-b1b7-7f135226d0e2" />
<details>

  ```
  <GaugeComponent
  type="grafana"
  minValue={0}
  maxValue={100}
  value={50}
  pointers={[
      {
        value: 50,
        type: "needle",
        baseColor: "#ffffff",
        length: 0.87,
        width: 24,
        strokeWidth: 2,
        strokeColor: "#000000"
      },
      {
        value: 30,
        type: "needle",
        color: "#F5CD19",
        baseColor: "#ffffff",
        length: 0.87,
        width: 24,
        strokeWidth: 2,
        strokeColor: "#000000"
      }
    ]}
/>
  ```
  </details>

  - Pointers are now INPUTS too, just set `onValueChange` and try to grab the pointer through arcs.
  - DEMO editor with copy/paste function, very helpful to build gauges.
  - Added some CSS/SVG effects like glow, blur and shadows
  - Grafana second arc can be configured
  - Strokes can be configured for pointers.
  - You can remove padding of the initial/final arcs  via `arc.padEndpoints`. #75
  - Added support for live editor. #25
  - Added a lot of unit tests #24
  - Added support components in labels. #69 #74 
  - Added `distanceFromText` to `TickLineConfig` and default tick config.
  - Added `autoSpaceTickLabels` to automatically separate closely-spaced tick labels along the arc (e.g., 15 and 16 won't overlap anymore).
  - The most special one for me: proper resizing and placing, no elements are cut from the frame, the whole gauge painting gets compressed dynamically to keep all elements visible.

### Bug Fixes
  - Added pointer existence/count validation utilities to detect mismatches and recover.
  - Fixed several pointer rendering/animation edge cases (flicker, incorrect reuse, inconsistent redraw behavior).
  - Improved arc validation and subArc limit handling (clamping + auto-adjustment for invalid limits).
  - Because of the new coordinate system, tick label placement logic was updated to respect spacing and it's easily edited on the editor. #51

### Rendering architecture
- **Coordinate-system layout**
  - Introduced a dedicated coordinate system module for computing layout (center, viewBox, radii). #79 
  - Added focused unit tests around layout math (coordinate system, containment, svg sizing).

- **Resize + two-pass render behavior**
  - In order to correctly calculate all the container's available space, a double render was introduced so we can get the total <svg> viewBox given a gauge, then we use that viewBox to redraw <g> utilizing all the possible space (noice!), at the cost of performance obviously. This makes the component more reliable on resizing (which was a nightmare). #86 #84 #80 #63 #45 

- **Render entry point**
  - Added a `render.tsx` entry point to centralize rendering responsibilities.

### Dependency / build changes
- **Dependency updates**
  - Migration from `lodash` to `lodash-es`. #88

## Notes / Known behavior
- **Arc warnings**
  - If you see messages like “SubArc limit X is outside range …”, they are emitted by the new validation logic to prevent invalid configurations from producing broken rendering.
