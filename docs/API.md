# React Gauge Component API Reference

> **Auto-generated from TypeScript types**  
> Last updated: 2026-01-14

This document is automatically generated from the TypeScript type definitions.
To regenerate, run: `yarn docs`

## Table of Contents

- [GaugeInnerMarginInPercent](#gaugeinnermargininpercent)
- [GaugeComponentProps](#gaugecomponentprops)
- [GaugeType](#gaugetype)
- [Arc](#arc)
- [SubArcEffects](#subarceffects)
- [SubArc](#subarc)
- [PointerEffects](#pointereffects)
- [PointerProps](#pointerprops)
- [PointerRef](#pointerref)
- [PointerContext](#pointercontext)
- [PointerWithValue](#pointerwithvalue)
- [MultiPointerRef](#multipointerref)
- [PointerType](#pointertype)
- [LabelEffects](#labeleffects)
- [Labels](#labels)
- [ValueLabel](#valuelabel)
- [TickEffects](#tickeffects)
- [TickLabels](#ticklabels)
- [Tick](#tick)
- [TickValueConfig](#tickvalueconfig)
- [TickLineConfig](#ticklineconfig)
- [Tooltip](#tooltip)

---

## GaugeInnerMarginInPercent

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `top` | `number` | Yes | - |
| `bottom` | `number` | Yes | - |
| `left` | `number` | Yes | - |
| `right` | `number` | Yes | - |

---

## GaugeComponentProps

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | `string` | No | Gauge element will inherit this. |
| `className` | `string` | No | Gauge element will inherit this. |
| `style` | `React.CSSProperties` | No | Gauge element will inherit this. |

---

## GaugeType

Enum values: Semicircle, Radial, Grafana

**Enum Values:** `Semicircle` | `Radial` | `Grafana`

---

## Arc

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `cornerRadius` | `number` | No | The corner radius of the arc. |
| `padding` | `number` | No | The padding between subArcs, in rad. |
| `padEndpoints` | `boolean` | No | Remove padding from start and end of the arc (first and last subArcs) |
| `width` | `number` | No | The width of the arc given in percent of the radius. |
| `nbSubArcs` | `number` | No | The number of subArcs, this overrides "subArcs" limits. |
| `gradient` | `boolean` | No | Boolean flag that enables or disables gradient mode, which draws a single arc with provided colors. |
| `colorArray` | `Array&lt;string&gt;` | No | The colors of the arcs, this overrides "subArcs" colors. |
| `emptyColor` | `string` | No | Color of the grafana's empty subArc |
| `subArcs` | `Array&lt;SubArc&gt;` | No | list of sub arcs segments of the whole arc. |
| `outerArc` | `{` | No | Settings for Grafana's outer decorative arc (only applies to grafana type) |
| `cornerRadius` | `number` | No | Corner radius for outer arc (max effective value ~2 due to thin arc) |
| `padding` | `number` | No | Padding between outer arc segments |
| `width` | `number` | No | Width of the outer arc in pixels (default: 5) |
| `effects` | `ArcEffects` | No | Visual effects for the outer arc (inherits from arc.effects if not set) |

---

## SubArcEffects

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `inherit` | `boolean` | No | Override to disable inherited effects from arc.effects |

---

## SubArc

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `limit` | `number` | No | The limit of the subArc, in accord to the gauge value. |
| `color` | `string \| number` | No | The color of the subArc |
| `length` | `number` | No | The length of the subArc, in percent |
| `showTick` | `boolean` | No | Whether or not to show the tick |
| `tooltip` | `Tooltip` | No | Tooltip that appears onHover of the subArc |
| `onClick` | `() =&gt; void` | No | This will trigger onClick of the subArc |
| `onMouseMove` | `() =&gt; void` | No | This will trigger onMouseMove of the subArc |
| `onMouseLeave` | `() =&gt; void` | No | This will trigger onMouseMove of the subArc |
| `effects` | `SubArcEffects` | No | Visual effects for this specific subArc (inherits from arc.effects if not set) |

---

## PointerEffects

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `glow` | `boolean` | No | Enable glow effect |
| `glowColor` | `string` | No | Glow color (defaults to pointer color) |
| `glowBlur` | `number` | No | Glow blur radius (default: 8) |
| `glowSpread` | `number` | No | Glow spread (default: 2) |
| `dropShadow` | `{` | No | Drop shadow |
| `dx` | `number` | No | - |
| `dy` | `number` | No | - |
| `blur` | `number` | No | - |
| `color` | `string` | No | - |
| `opacity` | `number` | No | - |

---

## PointerProps

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `type` | `"needle" \| "blob" \| "arrow"` | No | Pointer type |
| `color` | `string` | No | Pointer color |
| `hide` | `boolean` | No | Enabling this flag will hide the pointer |
| `baseColor` | `string` | No | Pointer color of the central circle |
| `length` | `number` | No | Pointer length |
| `width` | `number` | No | This is a factor to multiply by the width of the gauge |
| `animate` | `boolean` | No | This enables pointer animation for transiction between values when enabled |
| `elastic` | `boolean` | No | This gives animation an elastic transiction between values |
| `animationDuration` | `number` | No | Animation duration in ms |
| `animationDelay` | `number` | No | Animation delay in ms |
| `strokeWidth` | `number` | No | Stroke width of the pointer border |
| `strokeColor` | `string` | No | Stroke/border color of the pointer. Defaults to a contrasting color |
| `arrowOffset` | `number` | No | Arrow offset - controls radial position of arrow pointer (0-1, default 0.72). Lower = closer to center, higher = closer to arc edge |
| `blobOffset` | `number` | No | Blob offset - controls radial position of blob pointer (0-1, default 0.5 = centered on arc). Lower = inner edge, higher = outer edge |
| `hideGrabHandle` | `boolean` | No | Hide the grab handle circle shown at pointer tip when drag mode is enabled |
| `effects` | `PointerEffects` | No | Visual effects for the pointer |
| `maxFps` | `number` | No | Maximum frames per second for animation updates (default: 60). Lower values reduce GPU/CPU load on mobile devices. Recommended: 60 (smooth), 30 (balanced), 15 (low-power) / |
| `animationThreshold` | `number` | No | Minimum progress change threshold before updating DOM (default: 0.001). Higher values skip more frames, reducing render load. Range: 0.0001 (smooth) to 0.01 (choppy but fast) / |

---

## PointerRef

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `element` | `any` | Yes | - |
| `path` | `any` | Yes | - |
| `context` | `PointerContext` | Yes | - |

---

## PointerContext

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `centerPoint` | `number[]` | Yes | - |
| `pointerRadius` | `number` | Yes | - |
| `pathLength` | `number` | Yes | - |
| `currentPercent` | `number` | Yes | - |
| `prevPercent` | `number` | Yes | - |
| `prevProgress` | `number` | Yes | - |
| `pathStr` | `string` | Yes | - |
| `shouldDrawPath` | `boolean` | Yes | - |
| `prevColor` | `string` | Yes | - |

---

## PointerWithValue

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `value` | `number` | Yes | The value this pointer points to |
| `label` | `string` | No | Optional label for this pointer's value (shown in value display) |

---

## MultiPointerRef

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `element` | `any` | Yes | - |
| `path` | `any` | Yes | - |
| `context` | `PointerContext` | Yes | - |
| `index` | `number` | Yes | Index of this pointer in the pointers array |
| `animationInProgress` | `boolean` | Yes | Whether animation is currently in progress for this pointer |

---

## PointerType

Enum values: Needle, Blob, Arrow

**Enum Values:** `Needle` | `Blob` | `Arrow`

---

## LabelEffects

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `glow` | `boolean` | No | Enable glow effect |
| `glowColor` | `string` | No | Glow color (defaults to label color) |
| `glowBlur` | `number` | No | Glow blur radius (default: 6) |
| `glowSpread` | `number` | No | Glow spread (default: 2) |
| `textShadow` | `string` | No | Text shadow for enhanced readability |

---

## Labels

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `valueLabel` | `ValueLabel` | No | This configures the central value label. |
| `tickLabels` | `TickLabels` | No | This configures the ticks and it's values labels. |

---

## ValueLabel

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `formatTextValue` | `(value: any) =&gt; string` | No | This function enables to format the central value text as you wish. |

---

## TickEffects

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `glow` | `boolean` | No | Enable glow effect on tick lines |
| `glowColor` | `string` | No | Glow color (defaults to tick line color) |
| `glowBlur` | `number` | No | Glow blur radius (default: 4) |
| `glowSpread` | `number` | No | Glow spread (default: 2) |

---

## TickLabels

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `hideMinMax` | `boolean` | No | Hide first and last ticks and it's values |
| `type` | `"inner" \| "outer"` | No | Wheter the ticks are inside or outside the arcs |
| `autoSpaceTickLabels` | `boolean` | No | When true, automatically detects closely-spaced ticks and separates them along the arc to prevent overlap. Useful when you have ticks like 15 and 16 that would otherwise render on top of each other. / |
| `ticks` | `Array&lt;Tick&gt;` | No | List of desired ticks |
| `defaultTickValueConfig` | `TickValueConfig` | No | Default tick value label configs, this will apply to all ticks but the individually configured |
| `defaultTickLineConfig` | `TickLineConfig` | No | Default tick line label configs, this will apply to all ticks but the individually configured |
| `effects` | `TickEffects` | No | Visual effects for all ticks (can be overridden per tick) |

---

## Tick

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `value` | `number` | No | The value the tick will correspond to |
| `valueConfig` | `TickValueConfig` | No | This will override defaultTickValueConfig |
| `lineConfig` | `TickLineConfig` | No | This will override defaultTickLineConfig |
| `effects` | `TickEffects` | No | Visual effects for this specific tick (overrides tickLabels.effects) |

---

## TickValueConfig

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `formatTextValue` | `(value: any) =&gt; string` | No | This function allows to customize the rendered tickValue label |
| `renderContent` | `(value: number, arcColor: string) =&gt; React.ReactNode` | No | Render a custom React element instead of text for the tick value label. Receives the current tick value and arc color as parameters. / |
| `contentWidth` | `number` | No | Width of the foreignObject container (only used when renderContent is provided). |
| `contentHeight` | `number` | No | Height of the foreignObject container (only used when renderContent is provided). |
| `maxDecimalDigits` | `number` | No | This enables configuration for the number of decimal digits of the central value label |
| `style` | `React.CSSProperties` | No | The tick value label will inherit this |
| `hide` | `boolean` | No | If true will hide the tick value label |

---

## TickLineConfig

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `width` | `number` | No | The width of the tick's line |
| `length` | `number` | No | The length of the tick's line |
| `distanceFromArc` | `number` | No | The distance of the tick's line from the arc |
| `distanceFromText` | `number` | No | The distance between the tick's line and the text label |
| `color` | `string` | No | The color of the tick's line |
| `hide` | `boolean` | No | If true will hide the tick line |
| `effects` | `TickEffects` | No | Visual effects for the tick line |

---

## Tooltip

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `style` | `React.CSSProperties` | No | - |
| `text` | `string` | No | - |

---

