import * as utils from './utils';
import CONSTANTS from '../constants';
import { Gauge } from '../types/Gauge';
import { Tick, defaultTickLabels } from '../types/Tick';
import * as d3 from 'd3';
import React from 'react';
import { GaugeType } from '../types/GaugeComponentProps';
import { getArcDataByValue, getCoordByValue, getEffectiveAngles } from './arc';
import { Labels, ValueLabel } from '../types/Labels';
import { Arc, SubArc } from '../types/Arc';

const registerCustomContentItem = (
  gauge: Gauge,
  domNode: HTMLElement,
  renderContent: (value: number, arcColor: string) => React.ReactNode,
  value: number,
  arcColor: string
) => {
  if (!gauge.customContent) {
    gauge.customContent = { current: {} };
  }

  const current: any = gauge.customContent.current as any;
  if (!Array.isArray(current.items)) {
    current.items = [];
  }

  current.items.push({ domNode, renderContent, value, arcColor });

  // Backward compatibility: keep single-node fields in sync with the most recent item
  current.domNode = domNode;
  current.renderContent = renderContent;
  current.value = value;
  current.arcColor = arcColor;
};
export const setupLabels = (gauge: Gauge) => {
  // Reset custom content items for this render pass (value label + tick labels)
  if (gauge.customContent?.current) {
    const cc: any = gauge.customContent.current as any;
    cc.items = [];
  }
  setupValueLabel(gauge);
  setupTicks(gauge);
}
export const setupValueLabel = (gauge: Gauge) => {
  const { labels } = gauge.props;
  if (!labels?.valueLabel?.hide) addValueText(gauge)
}
export const setupTicks = (gauge: Gauge) => {
  let labels = gauge.props.labels as Labels;
  let minValue = gauge.props.minValue as number;
  let maxValue = gauge.props.maxValue as number;

  // Pre-compute radial offsets for auto-spacing closely-spaced ticks
  const autoSpaceOffsets = computeAutoSpaceOffsets(gauge);

  let tickRenderIndex = 0;
  if (CONSTANTS.debugTicksRadius) {
    for (let index = 0; index < maxValue; index++) {
      let indexTick = mapTick(index, gauge);
      addTick(indexTick, gauge, tickRenderIndex++);
    }
  } else if (!labels.tickLabels?.hideMinMax) {
    let alreadyHaveMinValueTick = labels.tickLabels?.ticks?.some((tick: Tick) => tick.value == minValue);
    if (!alreadyHaveMinValueTick) {
      //Add min value tick
      let minValueTick = mapTick(minValue, gauge);
      addTick(minValueTick, gauge, tickRenderIndex++);
    }
    let alreadyHaveMaxValueTick = labels.tickLabels?.ticks?.some((tick: Tick) => tick.value == maxValue);
    if (!alreadyHaveMaxValueTick) {
      // //Add max value tick
      let maxValueTick = mapTick(maxValue, gauge);
      addTick(maxValueTick, gauge, tickRenderIndex++);
    }
  }
  if (labels.tickLabels?.ticks?.length as number > 0) {
    labels.tickLabels?.ticks?.forEach((tick: Tick) => {
      // Attach auto-space offset if computed
      const tickValue = tick.value as number;
      if (autoSpaceOffsets.has(tickValue)) {
        (tick as any).__autoSpaceOffset = autoSpaceOffsets.get(tickValue);
      }
      addTick(tick, gauge, tickRenderIndex++);
    });
  }
  addArcTicks(gauge, () => tickRenderIndex++);
}

export const addArcTicks = (gauge: Gauge, nextIndex?: () => number) => {
  gauge.arcData.current?.map((subArc: SubArc) => {
    if (subArc.showTick) return subArc.limit;
  }).forEach((tickValue: any) => {
    if (tickValue) addTick(mapTick(tickValue, gauge), gauge, nextIndex ? nextIndex() : undefined);
  });
}

/**
 * Compute radial offsets for closely-spaced tick labels to prevent overlap.
 * Returns a Map of tickValue -> offset direction (+1 = outward, -1 = inward).
 */
const computeAutoSpaceOffsets = (gauge: Gauge): Map<number, number> => {
  const offsets = new Map<number, number>();
  const labels = gauge.props.labels as Labels;
  
  // Only compute if autoSpaceTickLabels is enabled
  if (!labels?.tickLabels?.autoSpaceTickLabels) {
    return offsets;
  }
  
  const minValue = gauge.props.minValue as number;
  const maxValue = gauge.props.maxValue as number;
  const range = maxValue - minValue;
  if (range <= 0) return offsets;
  
  // Collect all tick values (from ticks array + min/max if not hidden)
  const tickValues: number[] = [];
  
  if (!labels.tickLabels?.hideMinMax) {
    const hasTicks = labels.tickLabels?.ticks || [];
    if (!hasTicks.some(t => t.value === minValue)) tickValues.push(minValue);
    if (!hasTicks.some(t => t.value === maxValue)) tickValues.push(maxValue);
  }
  
  labels.tickLabels?.ticks?.forEach(tick => {
    if (tick.value !== undefined) tickValues.push(tick.value);
  });
  
  // Sort by value
  tickValues.sort((a, b) => a - b);
  
  // Threshold: if two ticks are closer than 3% of range, they need spacing
  const proximityThreshold = range * 0.03;
  
  // Detect clusters of close ticks and assign alternating offsets
  for (let i = 0; i < tickValues.length - 1; i++) {
    const current = tickValues[i];
    const next = tickValues[i + 1];
    const distance = next - current;
    
    if (distance < proximityThreshold) {
      // These two are too close - assign angular offsets to shift them along the arc
      // First tick: shift slightly counter-clockwise (-1)
      // Second tick: shift slightly clockwise (+1)
      if (!offsets.has(current)) {
        offsets.set(current, -1);
      }
      if (!offsets.has(next)) {
        offsets.set(next, 1);
      }
    }
  }
  
  return offsets;
};

export const mapTick = (value: number, gauge: Gauge): Tick => {
  const { tickLabels } = gauge.props.labels as Labels;
  return {
    value: value,
    valueConfig: tickLabels?.defaultTickValueConfig,
    lineConfig: tickLabels?.defaultTickLineConfig
  } as Tick;
}
/**
 * Calculate scale factor based on gauge radius to make ticks proportional
 * Reference radius is 100px (default behavior preserved at this size)
 */
const getTickScaleFactor = (gauge: Gauge): number => {
  const referenceRadius = 100;
  const outerRadius = gauge.dimensions.current.outerRadius;
  // Scale proportionally but clamp between 0.5 and 1.5 to avoid extremes
  return Math.max(0.5, Math.min(1.5, outerRadius / referenceRadius));
};

export const addTickLine = (tick: Tick, gauge: Gauge) => {
  const { labels } = gauge.props;
  const { tickAnchor, angle } = calculateAnchorAndAngleByValue(tick?.value as number, gauge);
  
  // Get scale factor for proportional sizing
  const scaleFactor = getTickScaleFactor(gauge);
  
  var tickDistanceFromArc = tick.lineConfig?.distanceFromArc || labels?.tickLabels?.defaultTickLineConfig?.distanceFromArc || 0;
  // Scale distance from arc
  tickDistanceFromArc = tickDistanceFromArc * scaleFactor;
  
  // For outer ticks: tick starts at outer arc edge + distance, line goes outward
  // For inner ticks: tick starts at inner arc edge - distance, line goes inward toward center
  // Both use negative offset to push START position away from center (toward arc edge)
  if (gauge.props.labels?.tickLabels?.type == "outer") {
    tickDistanceFromArc = -tickDistanceFromArc;
  } else {
    // Inner ticks: start at arc edge (small gap), not deep inside
    tickDistanceFromArc = tickDistanceFromArc; // Keep positive to offset slightly from arc
  }
  let coords = getLabelCoordsByValue(tick?.value as number, gauge, tickDistanceFromArc);

  var tickColor = tick.lineConfig?.color || labels?.tickLabels?.defaultTickLineConfig?.color || defaultTickLabels.defaultTickLineConfig?.color;
  var tickWidth = tick.lineConfig?.width || labels?.tickLabels?.defaultTickLineConfig?.width || defaultTickLabels.defaultTickLineConfig?.width;
  var tickLength = tick.lineConfig?.length || labels?.tickLabels?.defaultTickLineConfig?.length || defaultTickLabels.defaultTickLineConfig?.length as number;
  
  // Scale tick dimensions proportionally with gauge size
  tickLength = tickLength * scaleFactor;
  tickWidth = Math.max(0.5, (tickWidth as number) * scaleFactor);
  
  // Calculate the end coordinates based on tick type
  // coords is positioned at the arc edge
  // angle points OUTWARD from center (away from arc center)
  var endX;
  var endY;
  const angleRad = (angle * Math.PI) / 180;
  
  // For outer ticks: line goes OUTWARD from arc (in direction of angle)
  // For inner ticks: line goes INWARD toward center (opposite of angle)
  if (labels?.tickLabels?.type == "inner") {
    // Inner ticks: start at inner arc edge, draw toward center (opposite direction)
    endX = coords.x - tickLength * Math.cos(angleRad);
    endY = coords.y - tickLength * Math.sin(angleRad);
  } else {
    // Outer ticks: start at outer arc edge, draw away from center (same direction as angle)
    endX = coords.x + tickLength * Math.cos(angleRad);
    endY = coords.y + tickLength * Math.sin(angleRad);
  }

  // (gauge.dimensions.current.outerRadius - gauge.dimensions.current.innerRadius)
  // Create a D3 line generator
  var lineGenerator = d3.line();

  var lineCoordinates;
  // Define the line coordinates
  lineCoordinates = [[coords.x, coords.y], [endX, endY]];
  // Append a path element for the line
  gauge.g.current
    .append("path")
    .datum(lineCoordinates)
    .attr("class", CONSTANTS.tickLineClassname)
    .attr("d", lineGenerator)
    // .attr("transform", `translate(${0}, ${0})`)
    .attr("stroke", tickColor)
    .attr("stroke-width", tickWidth)
    .attr("fill", "none")
  // .attr("stroke-linecap", "round")
  // .attr("stroke-linejoin", "round")
  // .attr("transform", `rotate(${angle})`);
};
export const addTickValue = (tick: Tick, gauge: Gauge) => {
  const { labels } = gauge.props;
  let tickValue = tick?.value as number;
  let { tickAnchor, angle } = calculateAnchorAndAngleByValue(tickValue, gauge);
  
  // Get scale factor for proportional sizing
  const scaleFactor = getTickScaleFactor(gauge);
  
  let isInner = labels?.tickLabels?.type == "inner";
  var tickDistanceFromArc = tick.lineConfig?.distanceFromArc || labels?.tickLabels?.defaultTickLineConfig?.distanceFromArc || 0;
  var tickLength = tick.lineConfig?.length || labels?.tickLabels?.defaultTickLineConfig?.length || 0;
  
  // Scale distance and length
  tickDistanceFromArc = tickDistanceFromArc * scaleFactor;
  tickLength = tickLength * scaleFactor;
  
  // Calculate label position: at the end of the tick line + padding for text
  var _shouldHideTickLine = shouldHideTickLine(tick, gauge);
  
  // For outer ticks, centerToArcLengthSubtract is negative to push outward
  // For inner ticks, it's positive to push inward
  let tickLineOffset = _shouldHideTickLine ? 0 : (tickDistanceFromArc + tickLength);
  // Get distance from text prop, with defaults based on tick type
  var distanceFromText = tick.lineConfig?.distanceFromText ?? labels?.tickLabels?.defaultTickLineConfig?.distanceFromText;
  // Inner ticks need more padding because text is inside and can overlap more easily
  let defaultTextPadding = isInner ? 15 : 5;
  let textPadding = (distanceFromText ?? defaultTextPadding) * scaleFactor;
  
  let centerToArcLengthSubtract: number;
  if (isInner) {
    // Inner: push position inward (toward center) past tick line
    centerToArcLengthSubtract = tickLineOffset + textPadding;
  } else {
    // Outer: push position outward (away from center) past tick line
    centerToArcLengthSubtract = -(tickLineOffset + textPadding);
  }
  
  let coords = getLabelCoordsByValue(tickValue, gauge, centerToArcLengthSubtract);
  
  // Apply auto-space angular offset for closely-spaced ticks
  // This shifts the label position along the arc curve (not radially)
  const autoSpaceOffset = (tick as any).__autoSpaceOffset as number | undefined;
  if (typeof autoSpaceOffset === 'number') {
    // Angular offset in degrees - shift along the arc
    const angularOffsetDegrees = 4 * autoSpaceOffset;  // ~4 degrees per direction
    const angleRad = (angle * Math.PI) / 180;
    const offsetAngleRad = ((angle + angularOffsetDegrees) * Math.PI) / 180;
    
    // Calculate tangent direction and apply offset along the arc
    const tangentX = -Math.sin(angleRad);
    const tangentY = Math.cos(angleRad);
    const offsetAmount = angularOffsetDegrees * 0.5 * scaleFactor;  // Scale with gauge size
    
    coords.x += tangentX * offsetAmount;
    coords.y += tangentY * offsetAmount;
  }
  const defaultTickValueConfig = labels?.tickLabels?.defaultTickValueConfig || defaultTickLabels.defaultTickValueConfig;
  const tickValueConfig = tick.valueConfig || defaultTickValueConfig;
  // IMPORTANT: Merge styles so per-tick style overrides don't wipe defaults (e.g. empty {} -> black text)
  const defaultStyle = defaultTickValueConfig?.style || {};
  const tickOverrideStyle = tick.valueConfig?.style || {};
  let tickValueStyle = { ...defaultStyle, ...tickOverrideStyle };

  // If configured, allow tick labels to be rendered as custom React content
  const arcColor = getArcDataByValue(tickValue, gauge)?.color as string || "white";
  if (tickValueConfig?.renderContent) {
    addCustomTickContent(gauge, tickValueConfig, tickValue, arcColor, coords.x, coords.y);
    return;
  }
  let text = '';
  let maxDecimalDigits = tick.valueConfig?.maxDecimalDigits || defaultTickValueConfig?.maxDecimalDigits;
  if (tick.valueConfig?.formatTextValue) {
    text = tick.valueConfig.formatTextValue(utils.floatingNumber(tickValue, maxDecimalDigits));
  } else if (defaultTickValueConfig?.formatTextValue) {
    text = defaultTickValueConfig.formatTextValue(utils.floatingNumber(tickValue, maxDecimalDigits));
  } else if (gauge.props.minValue === 0 && gauge.props.maxValue === 100) {
    text = utils.floatingNumber(tickValue, maxDecimalDigits).toString();
    text += "%";
  } else {
    text = utils.floatingNumber(tickValue, maxDecimalDigits).toString();
  }
  
  // Scale position offsets
  const positionOffset = 10 * scaleFactor;
  if (labels?.tickLabels?.type == "inner") {
    if (tickAnchor === "end") coords.x += positionOffset;
    if (tickAnchor === "start") coords.x -= positionOffset;
  } else {
    if (tickAnchor === "middle") coords.y += 2 * scaleFactor;
  }
  if (tickAnchor === "middle") {
    coords.y += 0;
  } else {
    coords.y += 3 * scaleFactor;
  }
  
  // Scale font size based on gauge size
  const baseFontSize = parseFloat(String(tickValueStyle.fontSize || '12px')) || 12;
  const scaledFontSize = Math.max(6, baseFontSize * scaleFactor);
  tickValueStyle.fontSize = `${scaledFontSize}px`;
  
  tickValueStyle.textAnchor = tickAnchor as any;
  addText(text, coords.x, coords.y, gauge, tickValueStyle, CONSTANTS.tickValueClassname);
}
export const addTick = (tick: Tick, gauge: Gauge, renderIndex?: number) => {
  const { labels } = gauge.props;
  // Attach render index for staggering calculations without changing public API
  (tick as any).__renderIndex = renderIndex;
  //Make validation for sequence of values respecting DEFAULT -> DEFAULT FROM USER -> SPECIFIC TICK VALUE
  var _shouldHideTickLine = shouldHideTickLine(tick, gauge);
  var _shouldHideTickValue = shouldHideTickValue(tick, gauge);
  if (!_shouldHideTickLine)
    addTickLine(tick, gauge);
  if (!CONSTANTS.debugTicksRadius && !_shouldHideTickValue) {
    addTickValue(tick, gauge);
  }
}
export const getLabelCoordsByValue = (value: number, gauge: Gauge, centerToArcLengthSubtract = 0) => {
  let labels = gauge.props.labels as Labels;
  let type = labels.tickLabels?.type;
  let { x, y } = getCoordByValue(value, gauge, type, centerToArcLengthSubtract);
  return { x, y }
}
export const addText = (html: any, x: number, y: number, gauge: Gauge, style: React.CSSProperties, className: string, rotate = 0) => {
  let div = gauge.g.current
    .append("g")
    .attr("class", className)
    .attr("transform", `translate(${x}, ${y})`)
    .append("text")
    .text(html) // use html() instead of text()
  applyTextStyles(div, style)
  div.attr("transform", `rotate(${rotate})`);
}

const applyTextStyles = (div: any, style: React.CSSProperties) => {
  //Apply default styles
  Object.entries(style).forEach(([key, value]: any) => div.style(utils.camelCaseToKebabCase(key), value))
  //Apply custom styles
  if (style != undefined) Object.entries(style).forEach(([key, value]: any) => div.style(utils.camelCaseToKebabCase(key), value))
}

//Adds text undeneath the graft to display which percentage is the current one
export const addValueText = (gauge: Gauge) => {
  const { labels, pointers } = gauge.props;
  let valueLabel = (labels?.valueLabel || {}) as ValueLabel;
  
  // Check for multi-pointer mode
  const isMultiPointer = Array.isArray(pointers) && pointers.length > 0;
  const multiPointerDisplay = valueLabel.multiPointerDisplay ?? 'primary';
  
  if (isMultiPointer && multiPointerDisplay === 'none') {
    return; // Hide value label in multi-pointer mode if configured
  }
  
  // Position label in the CENTER of the gauge arc
  const innerRadius = gauge.dimensions.current.innerRadius;
  let x = 0;
  let y = 0;
  
  // Default positioning - moved lower to avoid overlapping with needle
  if (gauge.props.type == GaugeType.Semicircle) {
    y = innerRadius * -0.15;
  } else if (gauge.props.type == GaugeType.Radial) {
    y = innerRadius * 0.4;
  } else if (gauge.props.type == GaugeType.Grafana) {
    y = innerRadius * 0.35;
  }
  
  // Apply user offsets
  x += valueLabel.offsetX ?? 0;
  y += valueLabel.offsetY ?? 0;
  
  // Check if animateValue is enabled and animation will occur
  // If so, show the starting value (prevValue) instead of target value to prevent flicker
  const shouldAnimate = gauge.props.pointer?.animate !== false;
  const animateValue = valueLabel.animateValue === true;
  const minValue = gauge.props.minValue as number;
  
  // Handle multi-pointer mode
  if (isMultiPointer) {
    if (multiPointerDisplay === 'all') {
      addMultiPointerValueText(gauge, valueLabel, x, y, animateValue && shouldAnimate);
    } else {
      // 'primary' - show first pointer value
      let primaryValue = pointers[0].value;
      // Use previous value if animateValue is enabled to prevent flicker
      if (animateValue && shouldAnimate) {
        const prevPointerValue = gauge.prevProps?.current?.pointers?.[0]?.value;
        primaryValue = prevPointerValue ?? minValue;
      }
      addSingleValueText(gauge, valueLabel, primaryValue, x, y);
    }
    return;
  }
  
  // Single pointer mode
  let value = gauge.props.value as number;
  // Use previous value if animateValue is enabled to prevent flicker
  if (animateValue && shouldAnimate) {
    const prevValue = gauge.prevProps?.current?.value;
    value = prevValue ?? minValue;
  }
  addSingleValueText(gauge, valueLabel, value, x, y);
};

/**
 * Add a single value text to the gauge
 */
const addSingleValueText = (
  gauge: Gauge,
  valueLabel: ValueLabel,
  value: number,
  x: number,
  y: number
) => {
  const maxDecimalDigits = valueLabel?.maxDecimalDigits;
  const floatValue = utils.floatingNumber(value, maxDecimalDigits);
  const arcColor = getArcDataByValue(value, gauge)?.color as string || "white";
  
  // Check if user wants to render custom React content
  if (valueLabel.renderContent) {
    addCustomValueContent(gauge, valueLabel, floatValue, arcColor, x, y);
    return;
  }
  
  // Standard text rendering
  let text = '';
  if (valueLabel.formatTextValue) {
    text = valueLabel.formatTextValue(floatValue);
  } else if (gauge.props.minValue === 0 && gauge.props.maxValue === 100) {
    text = floatValue.toString() + "%";
  } else {
    text = floatValue.toString();
  }
  
  const maxLengthBeforeComputation = 4;
  const textLength = text?.length || 0;
  let fontRatio = textLength > maxLengthBeforeComputation ? maxLengthBeforeComputation / textLength * 1.5 : 1;
  let valueFontSize = (valueLabel?.style?.fontSize || '35px') as string;
  let valueTextStyle = { ...(valueLabel.style || {}) };
  valueTextStyle.textAnchor = "middle";
  
  let widthFactor = gauge.props.type == GaugeType.Radial ? 0.003 : 0.003;
  fontRatio = gauge.dimensions.current.width * widthFactor * fontRatio;
  let fontSizeNumber = parseInt(valueFontSize, 10) * fontRatio;
  valueTextStyle.fontSize = fontSizeNumber + "px";
  if (valueLabel.matchColorWithArc) valueTextStyle.fill = arcColor;
  addText(text, x, y, gauge, valueTextStyle, CONSTANTS.valueLabelClassname);
};

/**
 * Add multiple pointer values stacked vertically
 */
const addMultiPointerValueText = (
  gauge: Gauge,
  valueLabel: ValueLabel,
  baseX: number,
  baseY: number,
  useStartValue: boolean = false
) => {
  const pointers = gauge.props.pointers;
  if (!pointers || pointers.length === 0) return;
  
  const maxDecimalDigits = valueLabel?.maxDecimalDigits;
  let valueFontSize = (valueLabel?.style?.fontSize || '35px') as string;
  const minValue = gauge.props.minValue as number;
  
  // Calculate font size based on gauge dimensions
  let widthFactor = gauge.props.type == GaugeType.Radial ? 0.003 : 0.003;
  let fontRatio = gauge.dimensions.current.width * widthFactor;
  let baseFontSizeNumber = parseInt(valueFontSize, 10) * fontRatio;
  
  // Reduce font size for multiple values to fit better
  const fontSizeReduction = Math.max(0.5, 1 - (pointers.length - 1) * 0.15);
  const fontSize = baseFontSizeNumber * fontSizeReduction;
  const lineHeight = fontSize * 1.3;
  
  // Center the stack vertically
  const totalHeight = lineHeight * pointers.length;
  let currentY = baseY - totalHeight / 2 + lineHeight / 2;
  
  pointers.forEach((pointer, index) => {
    // Use previous value if useStartValue is true (for animateValue feature)
    let displayValue = pointer.value;
    if (useStartValue) {
      const prevPointerValue = gauge.prevProps?.current?.pointers?.[index]?.value;
      displayValue = prevPointerValue ?? minValue;
    }
    const floatValue = utils.floatingNumber(displayValue, maxDecimalDigits);
    const arcColor = pointer.color || getArcDataByValue(pointer.value, gauge)?.color as string || "white";
    
    let text = '';
    if (valueLabel.formatTextValue) {
      text = valueLabel.formatTextValue(floatValue);
    } else if (gauge.props.minValue === 0 && gauge.props.maxValue === 100) {
      text = floatValue.toString() + "%";
    } else {
      text = floatValue.toString();
    }
    
    // Add label if provided
    if (pointer.label) {
      text = `${pointer.label}: ${text}`;
    }
    
    let valueTextStyle = { ...(valueLabel.style || {}) };
    valueTextStyle.textAnchor = "middle";
    valueTextStyle.fontSize = fontSize + "px";
    if (valueLabel.matchColorWithArc) {
      valueTextStyle.fill = arcColor;
    }
    
    addText(text, baseX, currentY, gauge, valueTextStyle, `${CONSTANTS.valueLabelClassname} multi-value-${index}`);
    currentY += lineHeight;
  });
};

/**
 * Adds custom React content to the gauge using foreignObject.
 * This allows users to render any React element as the value label.
 * 
 * Note: The actual React content is rendered by the main GaugeComponent
 * using the customContent ref. This function just sets up the foreignObject
 * container and stores the render configuration.
 */
const addCustomValueContent = (
  gauge: Gauge, 
  valueLabel: ValueLabel, 
  value: number, 
  arcColor: string,
  x: number,
  y: number
) => {
  const contentWidth = valueLabel.contentWidth || 120;
  const contentHeight = valueLabel.contentHeight || 60;
  
  // Create foreignObject to embed HTML content in SVG
  const foreignObject = gauge.g.current
    .append("foreignObject")
    .attr("class", CONSTANTS.valueLabelClassname)
    .attr("x", x - contentWidth / 2)
    .attr("y", y - contentHeight / 2)
    .attr("width", contentWidth)
    .attr("height", contentHeight)
    .style("overflow", "visible");
  
  // Create a container div - React will render into this via innerHTML
  // We use a simple approach: render the React element to string
  const container = foreignObject
    .append("xhtml:div")
    .attr("class", "gauge-custom-value-content")
    .style("width", "100%")
    .style("height", "100%")
    .style("display", "flex")
    .style("align-items", "center")
    .style("justify-content", "center")
    .style("overflow", "visible")
    .style("pointer-events", "none");
  
  // For simple cases, we can render the content directly
  // The renderContent function returns a React element, but we need to handle it
  // Since we're in D3 context, we'll use a workaround: render to string for static content
  // or store the config for the React component to handle
  
  // Store the render function and position info on the gauge for React to use
  if (!gauge.customContent) {
    gauge.customContent = { current: {} };
  }
  gauge.customContent.current = {
    containerId: 'gauge-custom-value-content',
    renderContent: valueLabel.renderContent,
    value,
    arcColor,
  };
  
  // Get the DOM node and store it for React to render into
  const domNode = container.node();
  if (domNode) {
    registerCustomContentItem(gauge, domNode as any, valueLabel.renderContent!, value, arcColor);
  }
};

const addCustomTickContent = (
  gauge: Gauge,
  tickValueConfig: any,
  value: number,
  arcColor: string,
  x: number,
  y: number
) => {
  const contentWidth = tickValueConfig.contentWidth || 60;
  const contentHeight = tickValueConfig.contentHeight || 30;

  const foreignObject = gauge.g.current
    .append("foreignObject")
    .attr("class", CONSTANTS.tickValueClassname)
    .attr("x", x - contentWidth / 2)
    .attr("y", y - contentHeight / 2)
    .attr("width", contentWidth)
    .attr("height", contentHeight)
    .style("overflow", "visible");

  const container = foreignObject
    .append("xhtml:div")
    .attr("class", "gauge-custom-tick-content")
    .style("width", "100%")
    .style("height", "100%")
    .style("display", "flex")
    .style("align-items", "center")
    .style("justify-content", "center")
    .style("overflow", "visible")
    .style("pointer-events", "none");

  const domNode = container.node();
  if (domNode) {
    registerCustomContentItem(gauge, domNode as any, tickValueConfig.renderContent, value, arcColor);
  }
};

export const clearValueLabel = (gauge: Gauge) => gauge.g.current.selectAll(`.${CONSTANTS.valueLabelClassname}`).remove();

/**
 * Updates the value label text during animation.
 * Called from pointer animation when animateValue is true.
 */
export const updateValueLabelText = (gauge: Gauge, currentValue: number) => {
  const { labels } = gauge.props;
  const valueLabel = labels?.valueLabel;
  if (!valueLabel || valueLabel.hide) return;
  
  const maxDecimalDigits = valueLabel.maxDecimalDigits ?? 2;
  const floatValue = utils.floatingNumber(currentValue, maxDecimalDigits);
  
  let text = '';
  if (valueLabel.formatTextValue) {
    text = valueLabel.formatTextValue(floatValue);
  } else if (gauge.props.minValue === 0 && gauge.props.maxValue === 100) {
    text = floatValue.toString() + "%";
  } else {
    text = floatValue.toString();
  }
  
  // Update the text element
  const textElement = gauge.g.current.select(`.${CONSTANTS.valueLabelClassname} text`);
  if (!textElement.empty()) {
    textElement.text(text);
    
    // Update color if matchColorWithArc is enabled
    if (valueLabel.matchColorWithArc) {
      const arcColor = getArcDataByValue(currentValue, gauge)?.color as string || "white";
      textElement.style("fill", arcColor);
    }
  }
};
export const clearTicks = (gauge: Gauge) => {
  // Safety check - g might not be initialized on mobile during deferred render
  if (!gauge.g.current?.selectAll) return;
  gauge.g.current.selectAll(`.${CONSTANTS.tickLineClassname}`).remove();
  gauge.g.current.selectAll(`.${CONSTANTS.tickValueClassname}`).remove();
}

export const calculateAnchorAndAngleByValue = (value: number, gauge: Gauge) => {
  const { labels } = gauge.props;
  let minValue = gauge.props.minValue as number;
  let maxValue = gauge.props.maxValue as number;
  let valuePercentage = utils.calculatePercentage(minValue, maxValue, value)
  
  // Use actual angles from gauge dimensions (supports custom angles)
  // D3 angles: 0 = top (12 o'clock), positive = clockwise
  // Convert to degrees for tick line rotation
  const { startAngle: d3Start, endAngle: d3End } = getEffectiveAngles(gauge);
  const d3Angle = d3Start + valuePercentage * (d3End - d3Start);
  
  // Convert D3 radians to degrees and subtract 90° to get outward-pointing angle
  // D3 angle 0 (top) -> tick angle -90°/270° (pointing up in screen coords, outward from top)
  // D3 angle π/2 (right) -> tick angle 0° (pointing right, outward)
  // D3 angle -π/2 (left) -> tick angle 180° (pointing left, outward)
  let angle = utils.radToDeg(d3Angle) - 90;
  let isValueLessThanHalf = valuePercentage < 0.5;
  //Values between 40% and 60% are aligned in the middle
  let isValueBetweenTolerance = valuePercentage > CONSTANTS.rangeBetweenCenteredTickValueLabel[0] &&
    valuePercentage < CONSTANTS.rangeBetweenCenteredTickValueLabel[1];
  let tickAnchor = '';
  let isInner = labels?.tickLabels?.type == "inner";
  if (isValueBetweenTolerance) {
    tickAnchor = "middle";
  } else if (isValueLessThanHalf) {
    tickAnchor = isInner ? "start" : "end";
  } else {
    tickAnchor = isInner ? "end" : "start";
  }
  // if(valuePercentage > 0.50) angle = angle - 180;
  return { tickAnchor, angle };
}
const shouldHideTickLine = (tick: Tick, gauge: Gauge): boolean => {
  const { labels } = gauge.props;
  var defaultHideValue = defaultTickLabels.defaultTickLineConfig?.hide;
  var shouldHide = defaultHideValue;
  var defaultHideLineFromUser = labels?.tickLabels?.defaultTickLineConfig?.hide;
  if (defaultHideLineFromUser != undefined) {
    shouldHide = defaultHideLineFromUser;
  }
  var specificHideValueFromUser = tick.lineConfig?.hide;
  if (specificHideValueFromUser != undefined) {
    shouldHide = specificHideValueFromUser;
  }
  return shouldHide as boolean;
}
const shouldHideTickValue = (tick: Tick, gauge: Gauge): boolean => {
  const { labels } = gauge.props;
  var defaultHideValue = defaultTickLabels.defaultTickValueConfig?.hide;
  var shouldHide = defaultHideValue;
  var defaultHideValueFromUser = labels?.tickLabels?.defaultTickValueConfig?.hide;
  if (defaultHideValueFromUser != undefined) {
    shouldHide = defaultHideValueFromUser;
  }
  var specificHideValueFromUser = tick.valueConfig?.hide;
  if (specificHideValueFromUser != undefined) {
    shouldHide = specificHideValueFromUser;
  }
  return shouldHide as boolean;
}