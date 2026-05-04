# React Gauge Component API Reference

> **GaugeComponent props and structure**  
> Last updated: 2026-01-18

## GaugeComponentProps

`<GaugeComponent />` accepts the following props:

- **`id`** (`string`) - Gauge element will inherit this.

- **`className`** (`string`) - Gauge element will inherit this.

- **`style`** (`React.CSSProperties`) - Gauge element will inherit this.

- **`marginInPercent`** (`GaugeInnerMarginInPercent | number`) - Configures the canvas margin relative to the gauge. Can be a single number or per-side object. Unit: ratio (0-1, e.g., 0.07 = 7%).

- **`value`** (`number`) - Current pointer value.

- **`minValue`** (`number`) - Minimum value possible for the Gauge.

- **`maxValue`** (`number`) - Maximum value possible for the Gauge.

- **`arc`** (`Arc`) - This configures the arc of the Gauge.
  - `cornerRadius` (`number`) - The corner radius of the arc. Unit: SVG units.
  - `padding` (`number`) - The padding between subArcs. Unit: radians (default: 0.01).
  - `padEndpoints` (`boolean`) - Remove padding from start and end of the arc (first and last subArcs).
  - `width` (`number`) - The width of the arc. Unit: ratio of radius (0-1, e.g., 0.25 = 25% of radius).
  - `nbSubArcs` (`number`) - The number of subArcs, this overrides "subArcs" limits.
  - `gradient` (`boolean`) - Enables gradient mode, drawing a single arc with smooth color transitions.
  - `colorArray` (`Array<string>`) - The colors of the arcs, this overrides "subArcs" colors.
  - `emptyColor` (`string`) - Color of the grafana's empty subArc
  - `subArcs` (`Array<SubArc>`) - List of sub arcs segments of the whole arc.
  - `outerArc` (`OuterArcConfig`) - Settings for Grafana's outer decorative arc (only applies to grafana type)
    - `cornerRadius` (`number`) - Corner radius for outer arc (max effective value ~2 due to thin arc). Unit: SVG units.
    - `padding` (`number`) - Padding between outer arc segments. Unit: radians.
    - `width` (`number`) - Width of the outer arc. Unit: pixels (default: 5).
    - `effects` (`ArcEffects`) - Visual effects for the outer arc (inherits from arc.effects if not set)
      - `glow` (`boolean`) - Enable glow effect on arcs
      - `glowColor` (`string`) - Glow color (defaults to arc color if not set)
      - `glowBlur` (`number`) - Glow intensity/blur radius. Unit: pixels (default: 10).
      - `glowSpread` (`number`) - Glow spread. Unit: pixels (default: 3).
      - `filterUrl` (`string`) - Custom SVG filter ID to apply
      - `dropShadow` (`DropShadowConfig`) - Drop shadow effect
        - `dx` (`number`) - Shadow offset X. Unit: pixels (default: 0).
        - `dy` (`number`) - Shadow offset Y. Unit: pixels (default: 2).
        - `blur` (`number`) - Shadow blur. Unit: pixels (default: 3).
        - `color` (`string`) - Shadow color (default: rgba(0,0,0,0.3)).
        - `opacity` (`number`) - Shadow opacity. Unit: ratio 0-1 (default: 0.3).
      - `innerShadow` (`boolean`) - Inner shadow/inset effect for 3D look
  - `subArcsStrokeWidth` (`number`) - Stroke/border width for all subArcs. Unit: pixels.
  - `subArcsStrokeColor` (`string`) - Stroke/border color for all subArcs
  - `effects` (`ArcEffects`) - CSS/SVG effects for the arc
    - `glow` (`boolean`) - Enable glow effect on arcs
    - `glowColor` (`string`) - Glow color (defaults to arc color if not set)
    - `glowBlur` (`number`) - Glow intensity/blur radius. Unit: pixels (default: 10).
    - `glowSpread` (`number`) - Glow spread. Unit: pixels (default: 3).
    - `filterUrl` (`string`) - Custom SVG filter ID to apply
    - `dropShadow` (`DropShadowConfig`) - Drop shadow effect
      - `dx` (`number`) - Shadow offset X. Unit: pixels (default: 0).
      - `dy` (`number`) - Shadow offset Y. Unit: pixels (default: 2).
      - `blur` (`number`) - Shadow blur. Unit: pixels (default: 3).
      - `color` (`string`) - Shadow color (default: rgba(0,0,0,0.3)).
      - `opacity` (`number`) - Shadow opacity. Unit: ratio 0-1 (default: 0.3).
    - `innerShadow` (`boolean`) - Inner shadow/inset effect for 3D look

- **`labels`** (`Labels`) - This configures the labels of the Gauge.
  - `valueLabel` (`ValueLabel`) - This configures the central value label.
    - `formatTextValue` (`(value: any) => string`) - This function enables to format the central value text as you wish.
    - `renderContent` (`(value: number, arcColor: string) => React.ReactNode`) - Render a custom React element instead of text for the value label. Receives the current value and arc color as parameters. When provided, this takes precedence over formatTextValue.  renderContent: (value, color) => ( <div style={{ textAlign: 'center' }}> <span style={{ fontSize: '2rem', color }}>{value}</span> <span style={{ fontSize: '0.8rem' }}>km/h</span> </div> )
    - `matchColorWithArc` (`boolean`) - This will sync the value label color with the current value of the Gauge.
    - `maxDecimalDigits` (`number`) - Maximum number of decimal digits to display in the value label.
    - `style` (`React.CSSProperties`) - Central label value will inherit this
    - `hide` (`boolean`) - This hides the central value label if true
    - `offsetX` (`number`) - Horizontal offset for the value label position. Unit: pixels. Positive moves right.
    - `offsetY` (`number`) - Vertical offset for the value label position. Unit: pixels. Positive moves down.
    - `contentWidth` (`number`) - Width of the foreignObject container for custom React content. Unit: pixels. Only used when renderContent is provided. Defaults to 100.
    - `contentHeight` (`number`) - Height of the foreignObject container for custom React content. Unit: pixels. Only used when renderContent is provided. Defaults to 50.
    - `effects` (`LabelEffects`) - Visual effects for the value label
      - `glow` (`boolean`) - Enable glow effect
      - `glowColor` (`string`) - Glow color (defaults to label color)
      - `glowBlur` (`number`) - Glow blur radius. Unit: pixels (default: 6).
      - `glowSpread` (`number`) - Glow spread. Unit: pixels (default: 2).
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
      - `contentWidth` (`number`) - Width of the foreignObject container. Unit: pixels (only used when renderContent is provided).
      - `contentHeight` (`number`) - Height of the foreignObject container. Unit: pixels (only used when renderContent is provided).
      - `maxDecimalDigits` (`number`) - Maximum number of decimal digits to display.
      - `style` (`React.CSSProperties`) - The tick value label will inherit this
      - `hide` (`boolean`) - If true will hide the tick value label
    - `defaultTickLineConfig` (`TickLineConfig`) - The defaultTickLineConfig property.
      - `width` (`number`) - The width of the tick's line. Unit: pixels (default: 1).
      - `length` (`number`) - The length of the tick's line. Unit: pixels (default: 7).
      - `distanceFromArc` (`number`) - The distance of the tick's line from the arc. Unit: pixels (default: 3).
      - `distanceFromText` (`number`) - The distance between the tick's line and the text label. Unit: pixels (default: 2).
      - `color` (`string`) - The color of the tick's line
      - `hide` (`boolean`) - If true will hide the tick line
      - `effects` (`TickEffects`) - Visual effects for the tick line
        - `glow` (`boolean`) - Enable glow effect on tick lines.
        - `glowColor` (`string`) - Glow color (defaults to tick line color).
        - `glowBlur` (`number`) - Glow blur radius. Unit: pixels (default: 4).
        - `glowSpread` (`number`) - Glow spread. Unit: pixels (default: 2).
    - `effects` (`TickEffects`) - Visual effects for all ticks (can be overridden per tick)
      - `glow` (`boolean`) - Enable glow effect on tick lines.
      - `glowColor` (`string`) - Glow color (defaults to tick line color).
      - `glowBlur` (`number`) - Glow blur radius. Unit: pixels (default: 4).
      - `glowSpread` (`number`) - Glow spread. Unit: pixels (default: 2).

- **`pointer`** (`PointerProps`) - This configures the pointer of the Gauge. Used for single pointer mode.
  - `type` (`"needle" | "blob" | "arrow"`) - Pointer type
  - `color` (`string`) - Pointer color
  - `hide` (`boolean`) - Enabling this flag will hide the pointer
  - `baseColor` (`string`) - Pointer color of the central circle
  - `length` (`number`) - Pointer length. Unit: ratio of radius (0-1, e.g., 0.70 = 70% of radius).
  - `width` (`number`) - Pointer width multiplier. Unit: factor (multiplied by gauge width, default: 20).
  - `animate` (`boolean`) - This enables pointer animation for transiction between values when enabled
  - `elastic` (`boolean`) - This gives animation an elastic transiction between values
  - `animationDuration` (`number`) - Animation duration. Unit: milliseconds (default: 3000).
  - `animationDelay` (`number`) - Animation delay. Unit: milliseconds (default: 100).
  - `strokeWidth` (`number`) - Stroke width of the pointer border. Unit: pixels.
  - `strokeColor` (`string`) - Stroke/border color of the pointer. Defaults to a contrasting color
  - `arrowOffset` (`number`) - Arrow offset - controls radial position of arrow pointer. Unit: ratio (0-1, default: 0.72). Lower = closer to center, higher = closer to arc edge.
  - `blobOffset` (`number`) - Blob offset - controls radial position of blob pointer. Unit: ratio (0-1, default: 0.5 = centered on arc). Lower = inner edge, higher = outer edge.
  - `hideGrabHandle` (`boolean`) - Hide the grab handle circle shown at pointer tip when drag mode is enabled
  - `effects` (`PointerEffects`) - Visual effects for the pointer
    - `glow` (`boolean`) - Enable glow effect
    - `glowColor` (`string`) - Glow color (defaults to pointer color)
    - `glowBlur` (`number`) - Glow blur radius. Unit: pixels (default: 8).
    - `glowSpread` (`number`) - Glow spread. Unit: pixels (default: 2).
    - `dropShadow` (`{`) - Drop shadow effect.
    - `dx` (`number`) - Shadow offset X. Unit: pixels.
    - `dy` (`number`) - Shadow offset Y. Unit: pixels.
    - `blur` (`number`) - Shadow blur. Unit: pixels.
    - `color` (`string`) - Shadow color.
    - `opacity` (`number`) - Shadow opacity. Unit: ratio 0-1.
  - `maxFps` (`number`) - Maximum frames per second for animation updates. Unit: fps (default: 60). Lower values reduce GPU/CPU load on mobile devices. Recommended: 60 (smooth), 30 (balanced), 15 (low-power)
  - `animationThreshold` (`number`) - Minimum progress change threshold before updating DOM. Unit: ratio (default: 0.001). Higher values skip more frames, reducing render load. Range: 0.0001 (smooth) to 0.01 (choppy but fast)

- **`pointers`** (`PointerWithValue[]`) - Array of pointers with their own values for multi-pointer mode. Each pointer can have its own value, color, and configuration. When provided, this takes precedence over the single `value` and `pointer` props.  // Compound turbo gauge with multiple pressure readings pointers={[ { value: 15, color: '#ff0000', label: 'Back Pressure' }, { value: 25, color: '#00ff00', label: 'Turbo 1' }, { value: 35, color: '#0000ff', label: 'Turbo 2' }, ]}

- **`type`** (`"semicircle" | "radial" | "grafana"`) - This configures the type of the Gauge.

- **`startAngle`** (`number`) - Custom start angle. Unit: degrees. -90 = top left, 0 = top, 90 = top right, -180/180 = bottom

- **`endAngle`** (`number`) - Custom end angle. Unit: degrees. -90 = top left, 0 = top, 90 = top right, -180/180 = bottom

- **`onValueChange`** (`(value: number) => void`) - Callback fired when value changes via pointer drag (single pointer mode). Enables input mode.

- **`onPointerChange`** (`(index: number, value: number) => void`) - Callback fired when any pointer value changes via drag (multi-pointer mode). Receives the index of the pointer and the new value. Enables input mode for all pointers.

- **`fadeInAnimation`** (`boolean`) - Enable fade-in animation on initial render. Default: false

---

## SubArc

SubArc configuration for arc segments:

- `limit` (`number`) - The limit of the subArc, in accord to the gauge value. Unit: gauge value units.
- `color` (`string | number`) - The color of the subArc.
- `length` (`number`) - The length of the subArc. Unit: ratio (0-1, e.g., 0.5 = 50% of arc).
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
- `glowBlur` (`number`) - Glow intensity/blur radius. Unit: pixels (default: 10).
- `glowSpread` (`number`) - Glow spread. Unit: pixels (default: 3).
- `filterUrl` (`string`) - Custom SVG filter ID to apply
- `dropShadow` (`DropShadowConfig`) - Drop shadow effect
  - `dx` (`number`) - Shadow offset X. Unit: pixels (default: 0).
  - `dy` (`number`) - Shadow offset Y. Unit: pixels (default: 2).
  - `blur` (`number`) - Shadow blur. Unit: pixels (default: 3).
  - `color` (`string`) - Shadow color (default: rgba(0,0,0,0.3)).
  - `opacity` (`number`) - Shadow opacity. Unit: ratio 0-1 (default: 0.3).
- `innerShadow` (`boolean`) - Inner shadow/inset effect for 3D look

### PointerEffects

- `glow` (`boolean`) - Enable glow effect
- `glowColor` (`string`) - Glow color (defaults to pointer color)
- `glowBlur` (`number`) - Glow blur radius. Unit: pixels (default: 8).
- `glowSpread` (`number`) - Glow spread. Unit: pixels (default: 2).
- `dropShadow` (`{`) - Drop shadow effect.
- `dx` (`number`) - Shadow offset X. Unit: pixels.
- `dy` (`number`) - Shadow offset Y. Unit: pixels.
- `blur` (`number`) - Shadow blur. Unit: pixels.
- `color` (`string`) - Shadow color.
- `opacity` (`number`) - Shadow opacity. Unit: ratio 0-1.

### LabelEffects

- `glow` (`boolean`) - Enable glow effect
- `glowColor` (`string`) - Glow color (defaults to label color)
- `glowBlur` (`number`) - Glow blur radius. Unit: pixels (default: 6).
- `glowSpread` (`number`) - Glow spread. Unit: pixels (default: 2).
- `textShadow` (`string`) - Text shadow for enhanced readability

### TickEffects

- `glow` (`boolean`) - Enable glow effect on tick lines.
- `glowColor` (`string`) - Glow color (defaults to tick line color).
- `glowBlur` (`number`) - Glow blur radius. Unit: pixels (default: 4).
- `glowSpread` (`number`) - Glow spread. Unit: pixels (default: 2).

---

## LinearGaugeComponentProps

`<LinearGaugeComponent />` accepts the following props:

- **`id`** (`string`) - Unique identifier for the gauge.

- **`className`** (`string`) - CSS class name.

- **`style`** (`React.CSSProperties`) - Inline styles.

- **`value`** (`number`) - Current value of the gauge. Unit: gauge value units.

- **`minValue`** (`number`) - Minimum value. Unit: gauge value units (default: 0).

- **`maxValue`** (`number`) - Maximum value. Unit: gauge value units (default: 100).

- **`orientation`** (`LinearGaugeOrientation`) - Gauge orientation: 'horizontal' or 'vertical'.

- **`track`** (`LinearGaugeTrack`) - Track configuration.
  - `thickness` (`number`) - Height/width of the track. Unit: pixels (default: 20).
  - `backgroundColor` (`string`) - Background color for empty/unfilled portion.
  - `borderRadius` (`number`) - Border radius for the track. Unit: pixels (default: 0, or half of thickness if rounded).
  - `strokeWidth` (`number`) - Stroke width for track border. Unit: pixels.
  - `strokeColor` (`string`) - Stroke color for track border.
  - `effects` (`LinearGaugeEffects`) - Visual effects for the track.
  - `segments` (`LinearGaugeSegment[]`) - List of segments (colored sections of the track).
  - `colorArray` (`string[]`) - Colors array for gradient or segment coloring (overrides segments).
  - `gradient` (`boolean`) - Enable gradient mode for smooth color transitions.
  - `subLine` (`LinearGaugeSubLine`) - Sub-line configuration (secondary reference line like Grafana subarc).
    - `show` (`boolean`) - Show the sub-line.
    - `color` (`string`) - Sub-line color.
    - `thickness` (`number`) - Sub-line thickness. Unit: pixels (default: 4).
    - `offset` (`number`) - Sub-line position offset from main track. Unit: pixels (default: 0 = inside track).
    - `opacity` (`number`) - Opacity of the sub-line. Unit: 0-1 (default: 0.5).

- **`pointer`** (`LinearGaugePointer`) - Pointer/marker configuration.
  - `type` (`'arrow' | 'triangle' | 'diamond' | 'line' | 'pill' | 'none'`) - Pointer type: 'arrow' (triangle arrow), 'triangle' (simple triangle), 'diamond', 'line' (line indicator), 'pill' (rounded capsule), or 'none'.
  - `color` (`string`) - Pointer color.
  - `size` (`number`) - Pointer size (width). Unit: pixels (default: 12).
  - `height` (`number`) - Pointer height (for arrow/triangle). Unit: pixels (default: size * 1.5).
  - `strokeWidth` (`number`) - Stroke width for the pointer. Unit: pixels.
  - `strokeColor` (`string`) - Stroke color for the pointer.
  - `animate` (`boolean`) - Whether to animate pointer movement.
  - `animationDuration` (`number`) - Animation duration. Unit: milliseconds (default: 500).
  - `position` (`'top' | 'bottom' | 'left' | 'right' | 'inside' | 'both'`) - Position: 'top', 'bottom', 'inside', 'both' for horizontal; 'left', 'right', 'inside', 'both' for vertical.
  - `effects` (`LinearGaugeEffects`) - Visual effects for the pointer.
  - `showFill` (`boolean`) - Show the fill/paint from min to current value (Grafana-style). Default: true.
  - `offsetY` (`number`) - Y offset for pointer position. Unit: pixels (default: 0). Positive = away from track.

- **`ticks`** (`LinearGaugeTicks`) - Tick marks configuration.
  - `ticks` (`LinearGaugeTick[]`) - Array of tick configurations.
  - `hideMinMax` (`boolean`) - Hide min/max ticks.
  - `count` (`number`) - Number of auto-generated major ticks (if ticks array not provided).
  - `minorTicks` (`number`) - Number of minor ticks between major ticks.
  - `position` (`'top' | 'bottom' | 'left' | 'right' | 'inside-top' | 'inside-bottom' | 'inside-left' | 'inside-right' | 'both'`) - Tick position: 'top', 'bottom', 'inside-top', 'inside-bottom', or 'both' for horizontal; 'left', 'right', 'inside-left', 'inside-right', or 'both' for vertical.
  - `labelsInside` (`boolean`) - For inside positions: place labels on same side as tick lines (default: false, labels on opposite side).
  - `majorLength` (`number`) - Major tick line length. Unit: pixels (default: 12).
  - `minorLength` (`number`) - Minor tick line length. Unit: pixels (default: 6).
  - `length` (`number`) - Default tick line length (deprecated, use majorLength). Unit: pixels (default: 8).
  - `width` (`number`) - Default tick line width. Unit: pixels (default: 1).
  - `color` (`string`) - Default tick line color.
  - `distanceFromTrack` (`number`) - Distance from track (for outside ticks). Unit: pixels (default: 2).
  - `labelsOnMajorOnly` (`boolean`) - Show labels only for major ticks.
  - `labelStyle` (`React.CSSProperties`) - Label style.
  - `formatLabel` (`(value: number) => string`) - Function to format tick labels.

- **`valueLabel`** (`LinearGaugeValueLabel`) - Value label configuration.
  - `hide` (`boolean`) - Hide the value label.
  - `position` (`'center' | 'right' | 'left' | 'top' | 'bottom'`) - Position of the value label: 'center' (inside track), 'right', 'left', 'top', 'bottom'.
  - `formatValue` (`(value: number) => string`) - Custom format function for the value.
  - `style` (`React.CSSProperties`) - Style for the value label.
  - `maxDecimalDigits` (`number`) - Maximum decimal digits.
  - `matchColorWithSegment` (`boolean`) - Match color with the current segment.
  - `offsetX` (`number`) - X offset for value label position. Unit: pixels (default: 0).
  - `offsetY` (`number`) - Y offset for value label position. Unit: pixels (default: 0).

- **`onValueChange`** (`(value: number) => void`) - Callback when value changes (for interactive mode).

- **`fadeInAnimation`** (`boolean`) - Enable fade-in animation.

- **`margin`** (`number | { top?: number; bottom?: number; left?: number; right?: number }`) - Margin around the gauge. Unit: pixels or ratio.


### LinearGaugeSubLine

Sub-line configuration for secondary reference line (like Grafana subarc):

- `show` (`boolean`) - Show the sub-line.
- `color` (`string`) - Sub-line color.
- `thickness` (`number`) - Sub-line thickness. Unit: pixels (default: 4).
- `offset` (`number`) - Sub-line position offset from main track. Unit: pixels (default: 0 = inside track).
- `opacity` (`number`) - Opacity of the sub-line. Unit: 0-1 (default: 0.5).

### LinearGaugeSegment

Segment configuration for track coloring:

- `limit` (`number`) - The limit value for this segment. Unit: gauge value units.
- `color` (`string`) - The color of this segment.
- `length` (`number`) - The length of the segment. Unit: ratio (0-1, e.g., 0.5 = 50% of track).
- `tooltip` (`string`) - Tooltip text shown on hover.
- `onClick` (`() => void`) - Click handler for this segment.

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

### Basic Linear Gauge

```jsx
<LinearGaugeComponent
  value={65}
  orientation="horizontal"
  track={{
    thickness: 24,
    segments: [
      { limit: 30, color: '#5BE12C' },
      { limit: 70, color: '#F5CD19' },
      { color: '#EA4228' }
    ]
  }}
/>
```

### Linear Gauge with SubLine

```jsx
<LinearGaugeComponent
  value={45}
  orientation="horizontal"
  track={{
    thickness: 30,
    subLine: { show: true, thickness: 4, opacity: 0.5 },
    segments: [
      { limit: 33, color: '#4caf50' },
      { limit: 66, color: '#ff9800' },
      { color: '#f44336' }
    ]
  }}
  pointer={{ type: 'triangle', showFill: true }}
/>
```

### Interactive Linear Gauge (Input Mode)

```jsx
<LinearGaugeComponent
  value={value}
  onValueChange={setValue}
  orientation="horizontal"
/>
```


### Colors for the chart

The 'colorArray' prop can be specified as an array of hex color values, such as '["#FF0000", "#00FF00", "#0000FF"]' where
each arc would get a color in the array (colors are assigned from left to right). 

If the **length of the array matches** the **number of levels** in the arc, each segment gets its exact color.

If the number of colors does not match the number of levels, the colors will be **interpolated through ALL colors** in the array sequentially. For example, with colors '["#FF0000", "#FFFF00", "#00FF00"]' and 9 segments, the gauge will smoothly transition from red → yellow → green. The interpolation is done using [d3.interpolateHsl](https://github.com/d3/d3-interpolate#interpolateHsl).



---

*This documentation is auto-generated from TypeScript source comments. To regenerate: `yarn docs`*
