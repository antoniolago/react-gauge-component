# React Gauge Component API Reference

> **GaugeComponent props and structure**  
> Last updated: 2026-01-17

## GaugeComponentProps

`<GaugeComponent />` accepts the following props:

- **`id`** (`string`) - Gauge element will inherit this.

- **`className`** (`string`) - Gauge element will inherit this.

- **`style`** (`React.CSSProperties`) - Gauge element will inherit this.

- **`marginInPercent`** (`GaugeInnerMarginInPercent | number`) - Configures the canvas margin relative to the gauge. Can be a single number or per-side object.

- **`value`** (`number`) - Current pointer value.

- **`minValue`** (`number`) - Minimum value possible for the Gauge.

- **`maxValue`** (`number`) - Maximum value possible for the Gauge.

- **`arc`** (`Arc`) - This configures the arc of the Gauge.
  - `cornerRadius` (`number`) - The corner radius of the arc.
  - `padding` (`number`) - The padding between subArcs, in rad.
  - `padEndpoints` (`boolean`) - Remove padding from start and end of the arc (first and last subArcs)
  - `width` (`number`) - The width of the arc given in percent of the radius.
  - `nbSubArcs` (`number`) - The number of subArcs, this overrides "subArcs" limits.
  - `gradient` (`boolean`) - Enables gradient mode, drawing a single arc with smooth color transitions.
  - `colorArray` (`Array<string>`) - The colors of the arcs, this overrides "subArcs" colors.
  - `emptyColor` (`string`) - Color of the grafana's empty subArc
  - `subArcs` (`Array<SubArc>`) - List of sub arcs segments of the whole arc.
  - `outerArc` (`OuterArcConfig`) - Settings for Grafana's outer decorative arc (only applies to grafana type)
    - `cornerRadius` (`number`) - Corner radius for outer arc (max effective value ~2 due to thin arc)
    - `padding` (`number`) - Padding between outer arc segments
    - `width` (`number`) - Width of the outer arc in pixels (default: 5)
    - `effects` (`ArcEffects`) - Visual effects for the outer arc (inherits from arc.effects if not set)
      - `glow` (`boolean`) - Enable glow effect on arcs
      - `glowColor` (`string`) - Glow color (defaults to arc color if not set)
      - `glowBlur` (`number`) - Glow intensity/blur radius (default: 10)
      - `glowSpread` (`number`) - Glow spread (default: 3)
      - `filterUrl` (`string`) - Custom SVG filter ID to apply
      - `dropShadow` (`DropShadowConfig`) - Drop shadow effect
        - `dx` (`number`) - Shadow offset X (default: 0)
        - `dy` (`number`) - Shadow offset Y (default: 2)
        - `blur` (`number`) - Shadow blur (default: 3)
        - `color` (`string`) - Shadow color (default: rgba(0,0,0,0.3))
        - `opacity` (`number`) - Shadow opacity (default: 0.3)
      - `innerShadow` (`boolean`) - Inner shadow/inset effect for 3D look
  - `subArcsStrokeWidth` (`number`) - Stroke/border width for all subArcs
  - `subArcsStrokeColor` (`string`) - Stroke/border color for all subArcs
  - `effects` (`ArcEffects`) - CSS/SVG effects for the arc
    - `glow` (`boolean`) - Enable glow effect on arcs
    - `glowColor` (`string`) - Glow color (defaults to arc color if not set)
    - `glowBlur` (`number`) - Glow intensity/blur radius (default: 10)
    - `glowSpread` (`number`) - Glow spread (default: 3)
    - `filterUrl` (`string`) - Custom SVG filter ID to apply
    - `dropShadow` (`DropShadowConfig`) - Drop shadow effect
      - `dx` (`number`) - Shadow offset X (default: 0)
      - `dy` (`number`) - Shadow offset Y (default: 2)
      - `blur` (`number`) - Shadow blur (default: 3)
      - `color` (`string`) - Shadow color (default: rgba(0,0,0,0.3))
      - `opacity` (`number`) - Shadow opacity (default: 0.3)
    - `innerShadow` (`boolean`) - Inner shadow/inset effect for 3D look

- **`labels`** (`Labels`) - This configures the labels of the Gauge.
  - `valueLabel` (`ValueLabel`) - This configures the central value label.
    - `formatTextValue` (`(value: any) => string`) - This function enables to format the central value text as you wish.
    - `renderContent` (`(value: number, arcColor: string) => React.ReactNode`) - Render a custom React element instead of text for the value label. Receives the current value and arc color as parameters. When provided, this takes precedence over formatTextValue.  renderContent: (value, color) => ( <div style={{ textAlign: 'center' }}> <span style={{ fontSize: '2rem', color }}>{value}</span> <span style={{ fontSize: '0.8rem' }}>km/h</span> </div> )
    - `matchColorWithArc` (`boolean`) - This will sync the value label color with the current value of the Gauge.
    - `maxDecimalDigits` (`number`) - Maximum number of decimal digits to display in the value label.
    - `style` (`React.CSSProperties`) - Central label value will inherit this
    - `hide` (`boolean`) - This hides the central value label if true
    - `offsetX` (`number`) - Horizontal offset for the value label position. Positive moves right.
    - `offsetY` (`number`) - Vertical offset for the value label position. Positive moves down.
    - `contentWidth` (`number`) - Width of the foreignObject container for custom React content. Only used when renderContent is provided. Defaults to 100.
    - `contentHeight` (`number`) - Height of the foreignObject container for custom React content. Only used when renderContent is provided. Defaults to 50.
    - `effects` (`LabelEffects`) - Visual effects for the value label
      - `glow` (`boolean`) - Enable glow effect
      - `glowColor` (`string`) - Glow color (defaults to label color)
      - `glowBlur` (`number`) - Glow blur radius (default: 6)
      - `glowSpread` (`number`) - Glow spread (default: 2)
      - `textShadow` (`string`) - Text shadow for enhanced readability
    - `animateValue` (`boolean`) - When true, the value label updates in real-time during pointer animation to show the current animated value instead of the target value. Default: false
    - `multiPointerDisplay` (`'primary' | 'all' | 'none'`) - How to display values in multi-pointer mode. - 'primary': Show only the first pointer's value (default) - 'all': Show all pointer values stacked vertically - 'none': Hide value label entirely in multi-pointer mode
  - `tickLabels` (`TickLabels`) - This configures the ticks and it's values labels.
    - `hideMinMax` (`boolean`) - Hide first and last ticks and it's values
    - `type` (`"inner" | "outer"`) - Wheter the ticks are inside or outside the arcs
    - `autoSpaceTickLabels` (`boolean`) - When true, automatically detects closely-spaced ticks and separates them along the arc to prevent overlap. Useful when you have ticks like 15 and 16 that would otherwise render on top of each other.
    - `ticks` (`Array<Tick>`) - List of desired ticks
    - `defaultTickValueConfig` (`TickValueConfig`) - The defaultTickValueConfig property.
      - `formatTextValue` (`(value: any) => string`) - This function allows to customize the rendered tickValue label
      - `renderContent` (`(value: number, arcColor: string) => React.ReactNode`) - Render a custom React element instead of text for the tick value label. Receives the current tick value and arc color as parameters.
      - `contentWidth` (`number`) - Width of the foreignObject container (only used when renderContent is provided).
      - `contentHeight` (`number`) - Height of the foreignObject container (only used when renderContent is provided).
      - `maxDecimalDigits` (`number`) - Maximum number of decimal digits to display.
      - `style` (`React.CSSProperties`) - The tick value label will inherit this
      - `hide` (`boolean`) - If true will hide the tick value label
    - `defaultTickLineConfig` (`TickLineConfig`) - The defaultTickLineConfig property.
      - `width` (`number`) - The width of the tick's line
      - `length` (`number`) - The length of the tick's line
      - `distanceFromArc` (`number`) - The distance of the tick's line from the arc
      - `distanceFromText` (`number`) - The distance between the tick's line and the text label
      - `color` (`string`) - The color of the tick's line
      - `hide` (`boolean`) - If true will hide the tick line
      - `effects` (`TickEffects`) - Visual effects for the tick line
        - `glow` (`boolean`) - Enable glow effect on tick lines
        - `glowColor` (`string`) - Glow color (defaults to tick line color)
        - `glowBlur` (`number`) - Glow blur radius (default: 4)
        - `glowSpread` (`number`) - Glow spread (default: 2)
    - `effects` (`TickEffects`) - Visual effects for all ticks (can be overridden per tick)
      - `glow` (`boolean`) - Enable glow effect on tick lines
      - `glowColor` (`string`) - Glow color (defaults to tick line color)
      - `glowBlur` (`number`) - Glow blur radius (default: 4)
      - `glowSpread` (`number`) - Glow spread (default: 2)

- **`pointer`** (`PointerProps`) - This configures the pointer of the Gauge. Used for single pointer mode.
  - `type` (`"needle" | "blob" | "arrow"`) - Pointer type
  - `color` (`string`) - Pointer color
  - `hide` (`boolean`) - Enabling this flag will hide the pointer
  - `baseColor` (`string`) - Pointer color of the central circle
  - `length` (`number`) - Pointer length
  - `width` (`number`) - This is a factor to multiply by the width of the gauge
  - `animate` (`boolean`) - This enables pointer animation for transiction between values when enabled
  - `elastic` (`boolean`) - This gives animation an elastic transiction between values
  - `animationDuration` (`number`) - Animation duration in ms
  - `animationDelay` (`number`) - Animation delay in ms
  - `strokeWidth` (`number`) - Stroke width of the pointer border
  - `strokeColor` (`string`) - Stroke/border color of the pointer. Defaults to a contrasting color
  - `arrowOffset` (`number`) - Arrow offset - controls radial position of arrow pointer (0-1, default 0.72). Lower = closer to center, higher = closer to arc edge
  - `blobOffset` (`number`) - Blob offset - controls radial position of blob pointer (0-1, default 0.5 = centered on arc). Lower = inner edge, higher = outer edge
  - `hideGrabHandle` (`boolean`) - Hide the grab handle circle shown at pointer tip when drag mode is enabled
  - `effects` (`PointerEffects`) - Visual effects for the pointer
    - `glow` (`boolean`) - Enable glow effect
    - `glowColor` (`string`) - Glow color (defaults to pointer color)
    - `glowBlur` (`number`) - Glow blur radius (default: 8)
    - `glowSpread` (`number`) - Glow spread (default: 2)
    - `dropShadow` (`{`) - Drop shadow
    - `dx` (`number`) - The dx property.
    - `dy` (`number`) - The dy property.
    - `blur` (`number`) - The blur property.
    - `color` (`string`) - The color property.
    - `opacity` (`number`) - The opacity property.
  - `maxFps` (`number`) - Maximum frames per second for animation updates (default: 60). Lower values reduce GPU/CPU load on mobile devices. Recommended: 60 (smooth), 30 (balanced), 15 (low-power)
  - `animationThreshold` (`number`) - Minimum progress change threshold before updating DOM (default: 0.001). Higher values skip more frames, reducing render load. Range: 0.0001 (smooth) to 0.01 (choppy but fast)

- **`pointers`** (`PointerWithValue[]`) - Array of pointers with their own values for multi-pointer mode. Each pointer can have its own value, color, and configuration. When provided, this takes precedence over the single `value` and `pointer` props.  // Compound turbo gauge with multiple pressure readings pointers={[ { value: 15, color: '#ff0000', label: 'Back Pressure' }, { value: 25, color: '#00ff00', label: 'Turbo 1' }, { value: 35, color: '#0000ff', label: 'Turbo 2' }, ]}

- **`type`** (`"semicircle" | "radial" | "grafana"`) - This configures the type of the Gauge.

- **`startAngle`** (`number`) - Custom start angle in degrees. -90 = top left, 0 = top, 90 = top right, -180/180 = bottom

- **`endAngle`** (`number`) - Custom end angle in degrees. -90 = top left, 0 = top, 90 = top right, -180/180 = bottom

- **`onValueChange`** (`(value: number) => void`) - Callback fired when value changes via pointer drag (single pointer mode). Enables input mode.

- **`onPointerChange`** (`(index: number, value: number) => void`) - Callback fired when any pointer value changes via drag (multi-pointer mode). Receives the index of the pointer and the new value. Enables input mode for all pointers.

- **`fadeInAnimation`** (`boolean`) - Enable fade-in animation on initial render. Default: false

---

## SubArc

SubArc configuration for arc segments:

- `limit` (`number`) - The limit of the subArc, in accord to the gauge value.
- `color` (`string | number`) - The color of the subArc
- `length` (`number`) - The length of the subArc, in percent
- `showTick` (`boolean`) - Whether or not to show the tick
- `tooltip` (`Tooltip`) - Tooltip that appears onHover of the subArc
  - `style` (`React.CSSProperties`) - The style property.
  - `text` (`string`) - The text property.
- `onClick` (`() => void`) - This will trigger onClick of the subArc
- `onMouseMove` (`() => void`) - This will trigger onMouseMove of the subArc
- `onMouseLeave` (`() => void`) - This will trigger onMouseMove of the subArc
- `effects` (`SubArcEffects`) - Visual effects for this specific subArc (inherits from arc.effects if not set)

---

## PointerWithValue

Extended pointer configuration with embedded value (for multi-pointer mode):

- `value` (`number`) - The value this pointer points to
- `label` (`string`) - Optional label for this pointer's value (shown in value display)

---

## Effects

### ArcEffects

- `glow` (`boolean`) - Enable glow effect on arcs
- `glowColor` (`string`) - Glow color (defaults to arc color if not set)
- `glowBlur` (`number`) - Glow intensity/blur radius (default: 10)
- `glowSpread` (`number`) - Glow spread (default: 3)
- `filterUrl` (`string`) - Custom SVG filter ID to apply
- `dropShadow` (`DropShadowConfig`) - Drop shadow effect
  - `dx` (`number`) - Shadow offset X (default: 0)
  - `dy` (`number`) - Shadow offset Y (default: 2)
  - `blur` (`number`) - Shadow blur (default: 3)
  - `color` (`string`) - Shadow color (default: rgba(0,0,0,0.3))
  - `opacity` (`number`) - Shadow opacity (default: 0.3)
- `innerShadow` (`boolean`) - Inner shadow/inset effect for 3D look

### PointerEffects

- `glow` (`boolean`) - Enable glow effect
- `glowColor` (`string`) - Glow color (defaults to pointer color)
- `glowBlur` (`number`) - Glow blur radius (default: 8)
- `glowSpread` (`number`) - Glow spread (default: 2)
- `dropShadow` (`{`) - Drop shadow
- `dx` (`number`) - The dx property.
- `dy` (`number`) - The dy property.
- `blur` (`number`) - The blur property.
- `color` (`string`) - The color property.
- `opacity` (`number`) - The opacity property.

### LabelEffects

- `glow` (`boolean`) - Enable glow effect
- `glowColor` (`string`) - Glow color (defaults to label color)
- `glowBlur` (`number`) - Glow blur radius (default: 6)
- `glowSpread` (`number`) - Glow spread (default: 2)
- `textShadow` (`string`) - Text shadow for enhanced readability

### TickEffects

- `glow` (`boolean`) - Enable glow effect on tick lines
- `glowColor` (`string`) - Glow color (defaults to tick line color)
- `glowBlur` (`number`) - Glow blur radius (default: 4)
- `glowSpread` (`number`) - Glow spread (default: 2)

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

### Interactive Gauge (Input Mode)

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


### Colors for the chart

The 'colorArray' prop can be specified as an array of hex color values, such as '["#FF0000", "#00FF00", "#0000FF"]' where
each arc would get a color in the array (colors are assigned from left to right). 

If the **length of the array matches** the **number of levels** in the arc, each segment gets its exact color.

If the number of colors does not match the number of levels, the colors will be **interpolated through ALL colors** in the array sequentially. For example, with colors '["#FF0000", "#FFFF00", "#00FF00"]' and 9 segments, the gauge will smoothly transition from red → yellow → green. The interpolation is done using [d3.interpolateHsl](https://github.com/d3/d3-interpolate#interpolateHsl).



---

*This documentation is auto-generated from TypeScript source comments. To regenerate: `yarn docs`*
