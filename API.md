# React Gauge Component API Reference

> **GaugeComponent props and structure**  
> Last updated: 2026-01-17

## GaugeComponentProps

`<GaugeComponent />` props:

- **`id`** (`string`) - Gauge element will inherit this.

- **`className`** (`string`) - Gauge element will inherit this.

- **`style`** (`React.CSSProperties`) - Gauge element will inherit this.

- **`marginInPercent`** (`GaugeInnerMarginInPercent | number`) - This configures the canvas margin in relationship with the gauge.

- **`value`** (`number`) - Current pointer value.

- **`minValue`** (`number`) - Minimum value possible for the Gauge.

- **`maxValue`** (`number`) - Maximum value possible for the Gauge.

- **`arc`** (`Arc`) - This configures the arc of the Gauge.
  - `cornerRadius` (`number`) - The corner radius of the arc.
  - `padding` (`number`) - The padding between subArcs, in rad.
  - `padEndpoints` (`boolean`) - Remove padding from start and end of the arc.
  - `width` (`number`) - The width of the arc given in percent of the radius.
  - `nbSubArcs` (`number`) - The number of subArcs, this overrides "subArcs" limits.
  - `gradient` (`boolean`) - Boolean flag that enables or disables gradient mode.
  - `colorArray` (`Array<string>`) - The colors of the arcs, this overrides "subArcs" colors.
  - `emptyColor` (`string`) - Color of the grafana's empty subArc.
  - `subArcs` (`Array<SubArc>`) - List of sub arcs segments of the whole arc.
    - `limit` (`number`) - The limit of the subArc, in accord to the gauge value.
    - `color` (`string | number`) - The color of the subArc.
    - `length` (`number`) - The length of the subArc, in percent.
    - `showTick` (`boolean`) - Whether or not to show the tick.
    - `tooltip` (`Tooltip`) - Tooltip that appears onHover of the subArc.
    - `onClick` (`() => void`) - This will trigger onClick of the subArc.
    - `onMouseMove` (`() => void`) - This will trigger onMouseMove of the subArc.
    - `onMouseLeave` (`() => void`) - This will trigger onMouseLeave of the subArc.
    - `effects` (`SubArcEffects`) - Visual effects for this specific subArc.
  - `outerArc` (`object`) - Settings for Grafana's outer decorative arc.
    - `cornerRadius` (`number`) - Corner radius for outer arc.
    - `padding` (`number`) - Padding between outer arc segments.
    - `width` (`number`) - Width of the outer arc in pixels (default: 5).
    - `effects` (`ArcEffects`) - Visual effects for the outer arc.
  - `subArcsStrokeWidth` (`number`) - Stroke/border width for all subArcs.
  - `subArcsStrokeColor` (`string`) - Stroke/border color for all subArcs.
  - `effects` (`ArcEffects`) - CSS/SVG effects for the arc.
    - `glow` (`boolean`) - Enable glow effect on arcs.
    - `glowColor` (`string`) - Glow color (defaults to arc color if not set).
    - `glowBlur` (`number`) - Glow intensity/blur radius (default: 10).
    - `glowSpread` (`number`) - Glow spread (default: 3).
    - `filterUrl` (`string`) - Custom SVG filter ID to apply.
    - `dropShadow` (`object`) - Drop shadow effect.
    - `innerShadow` (`boolean`) - Inner shadow/inset effect for 3D look.

- **`labels`** (`Labels`) - This configures the labels of the Gauge.
  - `valueLabel` (`ValueLabel`) - This configures the central value label.
    - `formatTextValue` (`(value: any) => string`) - Format the central value text.
    - `renderContent` (`(value: number, arcColor: string) => React.ReactNode`) - Render a custom React element instead of text.
    - `matchColorWithArc` (`boolean`) - Sync the value label color with the current value.
    - `maxDecimalDigits` (`number`) - Number of decimal digits.
    - `style` (`React.CSSProperties`) - Central label value will inherit this.
    - `hide` (`boolean`) - Hides the central value label if true.
    - `offsetX` (`number`) - Horizontal offset for the value label position.
    - `offsetY` (`number`) - Vertical offset for the value label position.
    - `contentWidth` (`number`) - Width of the foreignObject container for custom React content.
    - `contentHeight` (`number`) - Height of the foreignObject container for custom React content.
    - `effects` (`LabelEffects`) - Visual effects for the value label.
    - `animateValue` (`boolean`) - The value label updates in real-time during pointer animation.
    - `multiPointerDisplay` (`'primary' | 'all' | 'none'`) - How to display values in multi-pointer mode.
  - `tickLabels` (`TickLabels`) - This configures the ticks and its values labels.
    - `hideMinMax` (`boolean`) - Hide first and last ticks and its values.
    - `type` (`"inner" | "outer"`) - Whether the ticks are inside or outside the arcs.
    - `autoSpaceTickLabels` (`boolean`) - Automatically detects closely-spaced ticks and separates them.
    - `ticks` (`Array<Tick>`) - List of desired ticks.
    - `defaultTickValueConfig` (`TickValueConfig`) - Default tick value label configs.
    - `defaultTickLineConfig` (`TickLineConfig`) - Default tick line configs.
    - `effects` (`TickEffects`) - Visual effects for all ticks.

- **`pointer`** (`PointerProps`) - This configures the pointer of the Gauge. Used for single pointer mode.
  - `type` (`"needle" | "blob" | "arrow"`) - Pointer type.
  - `color` (`string`) - Pointer color.
  - `hide` (`boolean`) - Enabling this flag will hide the pointer.
  - `baseColor` (`string`) - Pointer color of the central circle.
  - `length` (`number`) - Pointer length.
  - `width` (`number`) - This is a factor to multiply by the width of the gauge.
  - `animate` (`boolean`) - This enables pointer animation for transition between values.
  - `elastic` (`boolean`) - This gives animation an elastic transition between values.
  - `animationDuration` (`number`) - Animation duration in ms.
  - `animationDelay` (`number`) - Animation delay in ms.
  - `strokeWidth` (`number`) - Stroke width of the pointer border.
  - `strokeColor` (`string`) - Stroke/border color of the pointer.
  - `arrowOffset` (`number`) - Arrow offset - controls radial position of arrow pointer (0-1, default 0.72).
  - `blobOffset` (`number`) - Blob offset - controls radial position of blob pointer (0-1, default 0.5).
  - `hideGrabHandle` (`boolean`) - Hide the grab handle circle shown at pointer tip when drag mode is enabled.
  - `effects` (`PointerEffects`) - Visual effects for the pointer.
  - `maxFps` (`number`) - Maximum frames per second for animation updates (default: 60).
  - `animationThreshold` (`number`) - Minimum progress change threshold before updating DOM (default: 0.001).

- **`pointers`** (`PointerWithValue[]`) - Array of pointers with their own values for multi-pointer mode.
  - `value` (`number`) - The value this pointer points to.
  - `label` (`string`) - Optional label for this pointer's value.
  - *(Plus all PointerProps properties above)*

- **`type`** (`"semicircle" | "radial" | "grafana"`) - This configures the type of the Gauge.

- **`startAngle`** (`number`) - Custom start angle in degrees. -90 = top left, 0 = top, 90 = top right, -180/180 = bottom.

- **`endAngle`** (`number`) - Custom end angle in degrees. -90 = top left, 0 = top, 90 = top right, -180/180 = bottom.

- **`onValueChange`** (`(value: number) => void`) - Callback fired when value changes via pointer drag. Enables input mode.

- **`onPointerChange`** (`(index: number, value: number) => void`) - Callback fired when any pointer value changes via drag (multi-pointer mode).

- **`fadeInAnimation`** (`boolean`) - Enable fade-in animation on initial render. Default: false.

---

## GaugeInnerMarginInPercent

- **`top`** (`number`) - Top margin as percentage of gauge size.

- **`bottom`** (`number`) - Bottom margin as percentage of gauge size.

- **`left`** (`number`) - Left margin as percentage of gauge size.

- **`right`** (`number`) - Right margin as percentage of gauge size.

---

## GaugeType

**Enum Values:** `Semicircle` | `Radial` | `Grafana`

- `semicircle` - Half-circle gauge
- `radial` - Full circle gauge
- `grafana` - Modern arc-style gauge (default)

---

## Common Patterns

### Basic Gauge

```jsx
<GaugeComponent value={65} />
```

### Styled Gauge with SubArcs

```jsx
<GaugeComponent
  value={75}
  arc={{
    subArcs: [
      { limit: 30, color: '#EA4228' },
      { limit: 70, color: '#F5CD19' },
      { color: '#5BE12C' }
    ]
  }}
  pointer={{ type: "needle", elastic: true }}
/>
```

### Custom Content with renderContent

```jsx
<GaugeComponent
  value={42}
  labels={{
    valueLabel: {
      renderContent: (value, color) => (
        <div style={{ textAlign: 'center', color }}>
          <span style={{ fontSize: '2rem' }}>{value}</span>
          <span style={{ fontSize: '0.8rem' }}>km/h</span>
        </div>
      )
    }
  }}
/>
```

### With Tick Labels

```jsx
<GaugeComponent
  value={50}
  labels={{
    tickLabels: {
      type: 'outer',
      ticks: [
        { value: 0 },
        { value: 25 },
        { value: 50 },
        { value: 75 },
        { value: 100 }
      ]
    }
  }}
/>
```

### Interactive Gauge

```jsx
<GaugeComponent
  value={value}
  onValueChange={setValue}
/>
```

### Multi-Pointer Gauge

```jsx
<GaugeComponent
  pointers={[
    { value: 25, color: '#FF6B6B', label: 'CPU' },
    { value: 60, color: '#4ECDC4', label: 'Memory' }
  ]}
/>
```

---

*This documentation is automatically generated. To regenerate: `yarn docs`*