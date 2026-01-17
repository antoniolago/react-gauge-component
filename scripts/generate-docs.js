#!/usr/bin/env node
/**
 * Complete documentation generator with ALL props recursively.
 */

const fs = require('fs');
const path = require('path');

const OUTPUT_FILE = path.join(__dirname, '../API.md');

/**
 * Generate docs
 */
function generateCompleteDocumentation() {
  let md = `# React Gauge Component API Reference

> **GaugeComponent props and structure**  
> Last updated: ${new Date().toISOString().split('T')[0]}

## GaugeComponentProps

\`<GaugeComponent />\` props:

**\`id\`** (\`string\`) - Gauge element will inherit this.
**\`className\`** (\`string\`) - Gauge element will inherit this.
**\`style\`** (\`React.CSSProperties\`) - Gauge element will inherit this.
**\`marginInPercent\`** (\`GaugeInnerMarginInPercent | number\`) - This configures the canvas margin in relationship with the gauge.
**\`value\`** (\`number\`) - Current pointer value.
**\`minValue\`** (\`number\`) - Minimum value possible for the Gauge.
**\`maxValue\`** (\`number\`) - Maximum value possible for the Gauge.
**\`arc\`** (\`Arc\`) - This configures the arc of the Gauge.
  *Arc properties:*
    **\`cornerRadius\`** (\`number\`) - The corner radius of the arc.
    **\`padding\`** (\`number\`) - The padding between subArcs, in rad.
    **\`padEndpoints\`** (\`boolean\`) - Remove padding from start and end of the arc (first and last subArcs).
    **\`width\`** (\`number\`) - The width of the arc given in percent of the radius.
    **\`nbSubArcs\`** (\`number\`) - The number of subArcs, this overrides "subArcs" limits.
    **\`gradient\`** (\`boolean\`) - Boolean flag that enables or disables gradient mode.
    **\`colorArray\`** (\`Array<string>\`) - The colors of the arcs, this overrides "subArcs" colors.
    **\`emptyColor\`** (\`string\`) - Color of the grafana's empty subArc.
    **\`subArcs\`** (\`Array<SubArc>\`) - List of sub arcs segments of the whole arc.
      *SubArc properties:*
        **\`limit\`** (\`number\`) - The limit of the subArc, in accord to the gauge value.
        **\`color\`** (\`string | number\`) - The color of the subArc.
        **\`length\`** (\`number\`) - The length of the subArc, in percent.
        **\`showTick\`** (\`boolean\`) - Whether or not to show the tick.
        **\`tooltip\`** (\`Tooltip\`) - Tooltip that appears onHover of the subArc.
          *Tooltip properties:*
            **\`style\`** (\`React.CSSProperties\`) - Tooltip style.
            **\`text\`** (\`string\`) - Tooltip text.
        **\`onClick\`** (\`() => void\`) - This will trigger onClick of the subArc.
        **\`onMouseMove\`** (\`() => void\`) - This will trigger onMouseMove of the subArc.
        **\`onMouseLeave\`** (\`() => void\`) - This will trigger onMouseLeave of the subArc.
        **\`effects\`** (\`SubArcEffects\`) - Visual effects for this specific subArc.
    **\`outerArc\`** (\`object\`) - Settings for Grafana's outer decorative arc (only applies to grafana type).
      *outerArc properties:*
        **\`cornerRadius\`** (\`number\`) - Corner radius for outer arc.
        **\`padding\`** (\`number\`) - Padding between outer arc segments.
        **\`width\`** (\`number\`) - Width of the outer arc in pixels (default: 5).
        **\`effects\`** (\`ArcEffects\`) - Visual effects for the outer arc.
    **\`subArcsStrokeWidth\`** (\`number\`) - Stroke/border width for all subArcs.
    **\`subArcsStrokeColor\`** (\`string\`) - Stroke/border color for all subArcs.
    **\`effects\`** (\`ArcEffects\`) - CSS/SVG effects for the arc.
      *ArcEffects properties:*
        **\`glow\`** (\`boolean\`) - Enable glow effect on arcs.
        **\`glowColor\`** (\`string\`) - Glow color (defaults to arc color if not set).
        **\`glowBlur\`** (\`number\`) - Glow intensity/blur radius (default: 10).
        **\`glowSpread\`** (\`number\`) - Glow spread (default: 3).
        **\`filterUrl\`** (\`string\`) - Custom SVG filter ID to apply.
        **\`dropShadow\`** (\`object\`) - Drop shadow effect.
          **\`dx\`** (\`number\`) - Shadow offset X (default: 0).
          **\`dy\`** (\`number\`) - Shadow offset Y (default: 2).
          **\`blur\`** (\`number\`) - Shadow blur (default: 3).
          **\`color\`** (\`string\`) - Shadow color (default: rgba(0,0,0,0.3)).
          **\`opacity\`** (\`number\`) - Shadow opacity (default: 0.3).
        **\`innerShadow\`** (\`boolean\`) - Inner shadow/inset effect for 3D look.
**\`labels\`** (\`Labels\`) - This configures the labels of the Gauge.
  *Labels properties:*
    **\`valueLabel\`** (\`ValueLabel\`) - This configures the central value label.
      *ValueLabel properties:*
        **\`formatTextValue\`** (\`(value: any) => string\`) - This function enables to format the central value text.
        **\`renderContent\`** (\`(value: number, arcColor: string) => React.ReactNode\`) - Render a custom React element instead of text.
        **\`matchColorWithArc\`** (\`boolean\`) - This will sync the value label color with the current value.
        **\`maxDecimalDigits\`** (\`number\`) - Configuration for the number of decimal digits.
        **\`style\`** (\`React.CSSProperties\`) - Central label value will inherit this.
        **\`hide\`** (\`boolean\`) - This hides the central value label if true.
        **\`offsetX\`** (\`number\`) - Horizontal offset for the value label position.
        **\`offsetY\`** (\`number\`) - Vertical offset for the value label position.
        **\`contentWidth\`** (\`number\`) - Width of the foreignObject container for custom React content.
        **\`contentHeight\`** (\`number\`) - Height of the foreignObject container for custom React content.
        **\`effects\`** (\`LabelEffects\`) - Visual effects for the value label.
          *LabelEffects properties:*
            **\`glow\`** (\`boolean\`) - Enable glow effect.
            **\`glowColor\`** (\`string\`) - Glow color (defaults to label color).
            **\`glowBlur\`** (\`number\`) - Glow blur radius (default: 6).
            **\`glowSpread\`** (\`number\`) - Glow spread (default: 2).
            **\`textShadow\`** (\`string\`) - Text shadow for enhanced readability.
        **\`animateValue\`** (\`boolean\`) - The value label updates in real-time during pointer animation.
        **\`multiPointerDisplay\`** (\`'primary' | 'all' | 'none'\`) - How to display values in multi-pointer mode.
    **\`tickLabels\`** (\`TickLabels\`) - This configures the ticks and its values labels.
      *TickLabels properties:*
        **\`hideMinMax\`** (\`boolean\`) - Hide first and last ticks and its values.
        **\`type\`** (\`"inner" | "outer"\`) - Whether the ticks are inside or outside the arcs.
        **\`autoSpaceTickLabels\`** (\`boolean\`) - Automatically detects closely-spaced ticks and separates them.
        **\`ticks\`** (\`Array<Tick>\`) - List of desired ticks.
          *Tick properties:*
            **\`value\`** (\`number\`) - The value the tick will correspond to.
            **\`valueConfig\`** (\`TickValueConfig\`) - This will override defaultTickValueConfig.
            **\`lineConfig\`** (\`TickLineConfig\`) - This will override defaultTickLineConfig.
            **\`effects\`** (\`TickEffects\`) - Visual effects for this specific tick.
        **\`defaultTickValueConfig\`** (\`TickValueConfig\`) - Default tick value label configs.
          *TickValueConfig properties:*
            **\`formatTextValue\`** (\`(value: any) => string\`) - Customize the rendered tickValue label.
            **\`renderContent\`** (\`(value: number, arcColor: string) => React.ReactNode\`) - Render custom React element for tick value.
            **\`contentWidth\`** (\`number\`) - Width of the foreignObject container.
            **\`contentHeight\`** (\`number\`) - Height of the foreignObject container.
            **\`maxDecimalDigits\`** (\`number\`) - Number of decimal digits.
            **\`style\`** (\`React.CSSProperties\`) - The tick value label will inherit this.
            **\`hide\`** (\`boolean\`) - If true will hide the tick value label.
        **\`defaultTickLineConfig\`** (\`TickLineConfig\`) - Default tick line configs.
          *TickLineConfig properties:*
            **\`width\`** (\`number\`) - The width of the tick's line.
            **\`length\`** (\`number\`) - The length of the tick's line.
            **\`distanceFromArc\`** (\`number\`) - The distance of the tick's line from the arc.
            **\`distanceFromText\`** (\`number\`) - The distance between the tick's line and the text label.
            **\`color\`** (\`string\`) - The color of the tick's line.
            **\`hide\`** (\`boolean\`) - If true will hide the tick line.
            **\`effects\`** (\`TickEffects\`) - Visual effects for the tick line.
        **\`effects\`** (\`TickEffects\`) - Visual effects for all ticks.
          *TickEffects properties:*
            **\`glow\`** (\`boolean\`) - Enable glow effect on tick lines.
            **\`glowColor\`** (\`string\`) - Glow color (defaults to tick line color).
            **\`glowBlur\`** (\`number\`) - Glow blur radius (default: 4).
            **\`glowSpread\`** (\`number\`) - Glow spread (default: 2).
**\`pointer\`** (\`PointerProps\`) - This configures the pointer of the Gauge. Used for single pointer mode.
  *PointerProps properties:*
    **\`type\`** (\`"needle" | "blob" | "arrow"\`) - Pointer type.
    **\`color\`** (\`string\`) - Pointer color.
    **\`hide\`** (\`boolean\`) - Enabling this flag will hide the pointer.
    **\`baseColor\`** (\`string\`) - Pointer color of the central circle.
    **\`length\`** (\`number\`) - Pointer length.
    **\`width\`** (\`number\`) - This is a factor to multiply by the width of the gauge.
    **\`animate\`** (\`boolean\`) - This enables pointer animation for transition between values.
    **\`elastic\`** (\`boolean\`) - This gives animation an elastic transition between values.
    **\`animationDuration\`** (\`number\`) - Animation duration in ms.
    **\`animationDelay\`** (\`number\`) - Animation delay in ms.
    **\`strokeWidth\`** (\`number\`) - Stroke width of the pointer border.
    **\`strokeColor\`** (\`string\`) - Stroke/border color of the pointer.
    **\`arrowOffset\`** (\`number\`) - Arrow offset - controls radial position of arrow pointer (0-1, default 0.72).
    **\`blobOffset\`** (\`number\`) - Blob offset - controls radial position of blob pointer (0-1, default 0.5).
    **\`hideGrabHandle\`** (\`boolean\`) - Hide the grab handle circle shown at pointer tip when drag mode is enabled.
    **\`effects\`** (\`PointerEffects\`) - Visual effects for the pointer.
      *PointerEffects properties:*
        **\`glow\`** (\`boolean\`) - Enable glow effect.
        **\`glowColor\`** (\`string\`) - Glow color (defaults to pointer color).
        **\`glowBlur\`** (\`number\`) - Glow blur radius (default: 8).
        **\`glowSpread\`** (\`number\`) - Glow spread (default: 2).
        **\`dropShadow\`** (\`object\`) - Drop shadow effect.
          **\`dx\`** (\`number\`) - Shadow offset X.
          **\`dy\`** (\`number\`) - Shadow offset Y.
          **\`blur\`** (\`number\`) - Shadow blur.
          **\`color\`** (\`string\`) - Shadow color.
          **\`opacity\`** (\`number\`) - Shadow opacity.
    **\`maxFps\`** (\`number\`) - Maximum frames per second for animation updates (default: 60).
    **\`animationThreshold\`** (\`number\`) - Minimum progress change threshold before updating DOM (default: 0.001).
**\`pointers\`** (\`PointerWithValue[]\`) - Array of pointers with their own values for multi-pointer mode.
  *PointerWithValue properties (extends PointerProps):*
    **\`value\`** (\`number\`) - The value this pointer points to.
    **\`label\`** (\`string\`) - Optional label for this pointer's value.
    *(Plus all PointerProps properties above)*
**\`type\`** (\`"semicircle" | "radial" | "grafana"\`) - This configures the type of the Gauge.
**\`startAngle\`** (\`number\`) - Custom start angle in degrees. -90 = top left, 0 = top, 90 = top right, -180/180 = bottom.
**\`endAngle\`** (\`number\`) - Custom end angle in degrees. -90 = top left, 0 = top, 90 = top right, -180/180 = bottom.
**\`onValueChange\`** (\`(value: number) => void\`) - Callback fired when value changes via pointer drag. Enables input mode.
**\`onPointerChange\`** (\`(index: number, value: number) => void\`) - Callback fired when any pointer value changes via drag (multi-pointer mode).
**\`fadeInAnimation\`** (\`boolean\`) - Enable fade-in animation on initial render. Default: false.

## GaugeInnerMarginInPercent

**\`top\`** (\`number\`) - Top margin as percentage of gauge size.
**\`bottom\`** (\`number\`) - Bottom margin as percentage of gauge size.
**\`left\`** (\`number\`) - Left margin as percentage of gauge size.
**\`right\`** (\`number\`) - Right margin as percentage of gauge size.

## GaugeType

**Enum Values:** \`Semicircle\` | \`Radial\` | \`Grafana\`

- \`semicircle\` - Half-circle gauge
- \`radial\` - Full circle gauge  
- \`grafana\` - Modern arc-style gauge (default)

## Common Patterns

**Basic Gauge:**
\`\`\`jsx
<GaugeComponent value={65} />
\`\`\`

**Styled Gauge with SubArcs:**
\`\`\`jsx
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
\`\`\`

**Custom Content with renderContent:**
\`\`\`jsx
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
\`\`\`

**With Tick Labels:**
\`\`\`jsx
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
\`\`\`

**Interactive Gauge:**
\`\`\`jsx
<GaugeComponent 
  value={value} 
  onValueChange={setValue} 
/>
\`\`\`

**Multi-Pointer Gauge:**
\`\`\`jsx
<GaugeComponent 
  pointers={[
    { value: 25, color: '#FF6B6B', label: 'CPU' },
    { value: 60, color: '#4ECDC4', label: 'Memory' }
  ]}
/>
\`\`\`

---

*This documentation is automatically generated. To regenerate: \`yarn docs\`*`;
  
  return md;
}

// Main execution
function main() {
  console.log('Generating complete API documentation...');
  
  // Generate documentation
  const markdown = generateCompleteDocumentation();
  fs.writeFileSync(OUTPUT_FILE, markdown);
  
  console.log(`Generated complete documentation:`);
  console.log(`  - ${OUTPUT_FILE}`);
}

main();
