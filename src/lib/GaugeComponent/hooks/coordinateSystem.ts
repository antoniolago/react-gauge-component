import { GaugeType } from "../types/GaugeComponentProps";
import { Dimensions } from "../types/Dimensions";
import { TickLabels } from "../types/Tick";
import { Labels } from "../types/Labels";

/**
 * Coordinate System Manager for Gauge Component
 * 
 * This module centralizes all coordinate, dimension, and viewBox calculations
 * to ensure consistent positioning and optimal space utilization.
 * 
 * KEY INSIGHT: Padding should be calculated based on ACTUAL gauge configuration,
 * not worst-case assumptions. This maximizes the usable space for the gauge.
 */

export interface ViewBox {
  x: number;
  y: number;
  width: number;
  height: number;
  toString(): string;
}

export interface GaugeLayout {
  viewBox: ViewBox;
  outerRadius: number;
  innerRadius: number;
  gaugeCenter: { x: number; y: number };
  doughnutTransform: { x: number; y: number };
}

/**
 * Configuration options that affect padding calculations
 */
export interface PaddingConfig {
  hasOuterTicks: boolean;      // Ticks outside the arc need more padding
  hasInnerTicks: boolean;      // Ticks inside the arc need less padding
  hasTickLabels: boolean;      // Whether tick labels are shown
  tickLabelFontSize: number;   // Font size affects padding needed
  hasValueLabel: boolean;      // Value label at center
  valueLabelFontSize: number;  // Value label font size
  pointerLength: number;       // Pointer might extend beyond arc (0-1)
}

/**
 * Default padding config for when no labels config is provided
 */
const DEFAULT_PADDING_CONFIG: PaddingConfig = {
  hasOuterTicks: false,
  hasInnerTicks: false,
  hasTickLabels: false,
  tickLabelFontSize: 12,
  hasValueLabel: true,
  valueLabelFontSize: 35,
  pointerLength: 0.8,
};

/**
 * Extract padding configuration from gauge props
 */
export const extractPaddingConfig = (
  labels?: Labels,
  pointerLength?: number
): PaddingConfig => {
  const tickLabels = labels?.tickLabels;
  const valueLabel = labels?.valueLabel;
  
  // Determine if we have ticks and their type
  const hasTicks = tickLabels && 
    (tickLabels.ticks?.length || 0) > 0 && 
    !tickLabels.hideMinMax;
  const tickType = tickLabels?.type || 'outer';
  
  // Get font sizes from styles
  const tickFontSize = parseFloat(
    String(tickLabels?.defaultTickValueConfig?.style?.fontSize || '12px')
  ) || 12;
  const valueFontSize = parseFloat(
    String(valueLabel?.style?.fontSize || '35px')
  ) || 35;
  
  return {
    hasOuterTicks: !!(hasTicks && tickType === 'outer'),
    hasInnerTicks: !!(hasTicks && tickType === 'inner'),
    hasTickLabels: !!(hasTicks && !tickLabels?.defaultTickValueConfig?.hide),
    tickLabelFontSize: tickFontSize,
    hasValueLabel: !valueLabel?.hide,
    valueLabelFontSize: valueFontSize,
    pointerLength: pointerLength || 0.8,
  };
};

/**
 * Calculate dynamic padding based on actual gauge configuration
 * This is the key to efficient space usage!
 * 
 * IMPORTANT: Tick labels at the edges (0° and 180°) extend HORIZONTALLY,
 * so side padding needs to account for text WIDTH, not just height.
 * Similarly, tick labels at top (90°) extend vertically.
 */
const calculateDynamicPadding = (
  gaugeType: GaugeType,
  config: PaddingConfig,
  outerRadius: number
): { top: number; bottom: number; side: number } => {
  // Calculate scale factor for tick elements (same as in labels.ts)
  // Reference radius is 100px - ticks scale proportionally
  const tickScaleFactor = Math.max(0.5, Math.min(1.5, outerRadius / 100));
  
  // Base padding - minimal padding for the arc itself
  // This accounts for stroke width and small visual margins
  // Scale base padding with radius for small gauges
  const basePadding = Math.max(4, outerRadius * 0.03);
  
  // Tick line extends outward: length (~7px) + distance from arc (~3px)
  // These are scaled proportionally with tick scale factor
  const tickLineExtension = 10 * tickScaleFactor;
  
  // Tick label dimensions - scale font size with gauge size
  // Text height is approximately 1.2x font size
  // Text width for numbers like "100" is approximately 2.5x font size
  const scaledFontSize = config.tickLabelFontSize * tickScaleFactor;
  const tickTextHeight = scaledFontSize * 1.3;
  const tickTextWidth = scaledFontSize * 3; // Account for "100%" type labels
  
  // Calculate tick padding for different directions
  let tickTopPadding = 0;
  let tickSidePadding = 0;
  
  if (config.hasOuterTicks) {
    if (config.hasTickLabels) {
      // Top: tick line + text height (labels at top are horizontal)
      tickTopPadding = tickLineExtension + tickTextHeight + 3 * tickScaleFactor;
      // Sides: tick line + text width (labels at 0° and 180° extend horizontally)
      tickSidePadding = tickLineExtension + tickTextWidth + 3 * tickScaleFactor;
    } else {
      // Just tick lines, no labels
      tickTopPadding = tickLineExtension + 2 * tickScaleFactor;
      tickSidePadding = tickLineExtension + 2 * tickScaleFactor;
    }
  }
  
  // Pointer padding - needles can extend beyond the arc
  const pointerPadding = config.pointerLength > 0.85 
    ? outerRadius * (config.pointerLength - 0.85) * 0.5 
    : 0;
  
  // Calculate per-direction padding
  let topPadding = basePadding + tickTopPadding + pointerPadding;
  let sidePadding = basePadding + tickSidePadding;
  let bottomPadding = basePadding;
  
  // Value label affects bottom padding for semicircle
  // Scale value label impact proportionally
  if (config.hasValueLabel && gaugeType === GaugeType.Semicircle) {
    // Value label sits below center, need space for it
    bottomPadding += config.valueLabelFontSize * 0.5 * tickScaleFactor;
  }
  
  // Grafana has an outer decorative arc that extends outward
  // Scale this padding with the gauge size
  if (gaugeType === GaugeType.Grafana) {
    topPadding += 8 * tickScaleFactor;
    sidePadding += 8 * tickScaleFactor;
  }
  
  // Ensure minimum padding for safety - elements should NEVER be cut off
  // Use smaller minimums for smaller gauges
  const minTopPercent = config.hasOuterTicks ? 0.15 : 0.05;
  const minSidePercent = config.hasOuterTicks ? 0.18 : 0.05; // More side padding for horizontal labels
  const minBottomPercent = 0.05;
  
  return {
    top: Math.max(topPadding, outerRadius * minTopPercent),
    side: Math.max(sidePadding, outerRadius * minSidePercent),
    bottom: Math.max(bottomPadding, outerRadius * minBottomPercent),
  };
};

/**
 * LEGACY: Fixed padding configuration for backward compatibility
 * Used when no labels config is available
 */
const GAUGE_TYPE_CONFIG = {
  [GaugeType.Semicircle]: {
    topPaddingPercent: 0.20,   // Reduced from 0.38
    bottomPaddingPercent: 0.08, // Reduced from 0.10
    sidePaddingPercent: 0.20,   // Reduced from 0.38
  },
  [GaugeType.Radial]: {
    topPaddingPercent: 0.20,   // Reduced from 0.38
    bottomPaddingPercent: 0.06, // Reduced from 0.08
    sidePaddingPercent: 0.18,   // Reduced from 0.32
    arcBottomExtent: 0.72,
  },
  [GaugeType.Grafana]: {
    topPaddingPercent: 0.18,   // Reduced from 0.36
    bottomPaddingPercent: 0.08, // Reduced from 0.10
    sidePaddingPercent: 0.16,   // Reduced from 0.30
    arcBottomExtent: 0.70,
  },
};

/**
 * Calculates optimal outer radius given available space and gauge type
 * This is the core function that determines how much space the gauge will use
 * 
 * CRITICAL: The resulting viewBox must fit within parentWidth x parentHeight
 */
export const calculateOptimalRadius = (
  parentWidth: number,
  parentHeight: number,
  gaugeType: GaugeType,
  marginPercent: number = 0
): number => {
  const config = GAUGE_TYPE_CONFIG[gaugeType];
  
  // Apply margin (as percentage of dimensions)
  const availableWidth = parentWidth * (1 - marginPercent);
  const availableHeight = parentHeight * (1 - marginPercent);
  
  let widthMultiplier: number;
  let heightMultiplier: number;
  
  // All gauge types now use separate padding values
  const typedConfig = config as {
    topPaddingPercent: number;
    bottomPaddingPercent: number;
    sidePaddingPercent: number;
    arcBottomExtent?: number;
  };
  
  // width = diameter + 2*sidePadding
  widthMultiplier = 2 + 2 * typedConfig.sidePaddingPercent;
  
  if (gaugeType === GaugeType.Semicircle) {
    // Semicircle: topPadding + radius (to center) + bottomPadding
    heightMultiplier = typedConfig.topPaddingPercent + 1 + typedConfig.bottomPaddingPercent;
  } else {
    // Radial/Grafana: topPadding + radius + arcBottomExtent*radius + bottomPadding
    const arcBottom = typedConfig.arcBottomExtent || 0.72;
    heightMultiplier = typedConfig.topPaddingPercent + 1 + arcBottom + typedConfig.bottomPaddingPercent;
  }
  
  const radiusFromWidth = availableWidth / widthMultiplier;
  const radiusFromHeight = availableHeight / heightMultiplier;
  
  // Use the smaller radius to ensure gauge fits in both dimensions
  return Math.min(radiusFromWidth, radiusFromHeight);
};

/**
 * Calculates the viewBox dimensions based on gauge type and radius
 * ViewBox defines the coordinate system for the SVG
 */
export const calculateViewBox = (
  outerRadius: number,
  gaugeType: GaugeType
): ViewBox => {
  const config = GAUGE_TYPE_CONFIG[gaugeType];
  const diameter = outerRadius * 2;
  
  // All gauge types now use separate padding values
  const typedConfig = config as {
    topPaddingPercent: number;
    bottomPaddingPercent: number;
    sidePaddingPercent: number;
    arcBottomExtent?: number;
  };
  
  const topPadding = outerRadius * typedConfig.topPaddingPercent;
  const bottomPadding = outerRadius * typedConfig.bottomPaddingPercent;
  const sidePadding = outerRadius * typedConfig.sidePaddingPercent;
  
  const width = diameter + sidePadding * 2;
  let height: number;
  
  if (gaugeType === GaugeType.Semicircle) {
    // Semicircle: topPadding + radius (to center) + bottomPadding
    height = topPadding + outerRadius + bottomPadding;
  } else {
    // Radial/Grafana: topPadding + radius + arcBottomExtent*radius + bottomPadding
    const arcBottom = typedConfig.arcBottomExtent || 0.72;
    height = topPadding + outerRadius + (outerRadius * arcBottom) + bottomPadding;
  }
  
  return {
    x: 0,
    y: 0,
    width: width,
    height: height,
    toString() {
      return `${this.x} ${this.y} ${this.width} ${this.height}`;
    },
  };
};

/**
 * Calculates the center point of the gauge within the viewBox
 * This is where the doughnut element should be positioned
 */
export const calculateGaugeCenter = (
  viewBox: ViewBox,
  outerRadius: number,
  gaugeType: GaugeType
): { x: number; y: number } => {
  const config = GAUGE_TYPE_CONFIG[gaugeType];
  
  // All gauge types now use separate padding values
  const typedConfig = config as {
    topPaddingPercent: number;
    bottomPaddingPercent: number;
    sidePaddingPercent: number;
    arcBottomExtent?: number;
  };
  
  // Horizontal center is always in the middle
  const x = viewBox.width / 2;
  
  // Vertical center: topPadding + radius from the top
  const topPadding = outerRadius * typedConfig.topPaddingPercent;
  const y = topPadding + outerRadius;
  
  return { x, y };
};

/**
 * Calculates complete layout information for the gauge
 * This is the main function used by the rendering code
 */
export const calculateGaugeLayout = (
  parentWidth: number,
  parentHeight: number,
  gaugeType: GaugeType,
  arcWidth: number,
  marginPercent: number = 0
): GaugeLayout => {
  // Calculate optimal outer radius
  const outerRadius = calculateOptimalRadius(
    parentWidth,
    parentHeight,
    gaugeType,
    marginPercent
  );
  
  // Calculate inner radius based on arc width
  const innerRadius = outerRadius * (1 - arcWidth);
  
  // Calculate viewBox
  const viewBox = calculateViewBox(outerRadius, gaugeType);
  
  // Calculate gauge center position
  const gaugeCenter = calculateGaugeCenter(viewBox, outerRadius, gaugeType);
  
  // The doughnut transform is the same as gauge center
  // because doughnut is positioned relative to its parent
  const doughnutTransform = { x: outerRadius, y: outerRadius };
  
  return {
    viewBox,
    outerRadius,
    innerRadius,
    gaugeCenter,
    doughnutTransform,
  };
};

/**
 * NEW: Calculates optimized layout using dynamic padding based on actual config
 * This maximizes gauge size by only reserving space that's actually needed
 */
export const calculateOptimizedLayout = (
  parentWidth: number,
  parentHeight: number,
  gaugeType: GaugeType,
  arcWidth: number,
  paddingConfig: PaddingConfig,
  marginPercent: number = 0
): GaugeLayout => {
  // Apply margin
  const availableWidth = parentWidth * (1 - marginPercent);
  const availableHeight = parentHeight * (1 - marginPercent);
  
  // Arc bottom extent for radial/grafana types
  const arcBottomExtent = gaugeType === GaugeType.Semicircle ? 0 : 
    (gaugeType === GaugeType.Grafana ? 0.70 : 0.72);
  
  // First pass: estimate radius to calculate dynamic padding
  // Use a conservative estimate (50% of min dimension)
  const estimatedRadius = Math.min(availableWidth, availableHeight) * 0.4;
  const padding = calculateDynamicPadding(gaugeType, paddingConfig, estimatedRadius);
  
  // Calculate radius that fits with the dynamic padding
  // width = diameter + 2*sidePadding => radius = (width - 2*sidePadding) / 2
  // height = topPadding + radius + (arcBottomExtent * radius) + bottomPadding
  //        = topPadding + radius * (1 + arcBottomExtent) + bottomPadding
  // => radius = (height - topPadding - bottomPadding) / (1 + arcBottomExtent)
  
  const radiusFromWidth = (availableWidth - 2 * padding.side) / 2;
  
  let radiusFromHeight: number;
  if (gaugeType === GaugeType.Semicircle) {
    // Semicircle: height = topPadding + radius + bottomPadding
    radiusFromHeight = availableHeight - padding.top - padding.bottom;
  } else {
    // Radial/Grafana: height = topPadding + radius * (1 + arcBottomExtent) + bottomPadding
    radiusFromHeight = (availableHeight - padding.top - padding.bottom) / (1 + arcBottomExtent);
  }
  
  const outerRadius = Math.max(10, Math.min(radiusFromWidth, radiusFromHeight));
  const innerRadius = outerRadius * (1 - arcWidth);
  
  // Recalculate padding with actual radius for precision
  const finalPadding = calculateDynamicPadding(gaugeType, paddingConfig, outerRadius);
  
  // Calculate viewBox with actual padding
  const diameter = outerRadius * 2;
  const viewBoxWidth = diameter + finalPadding.side * 2;
  let viewBoxHeight: number;
  
  if (gaugeType === GaugeType.Semicircle) {
    viewBoxHeight = finalPadding.top + outerRadius + finalPadding.bottom;
  } else {
    viewBoxHeight = finalPadding.top + outerRadius + (outerRadius * arcBottomExtent) + finalPadding.bottom;
  }
  
  const viewBox: ViewBox = {
    x: 0,
    y: 0,
    width: viewBoxWidth,
    height: viewBoxHeight,
    toString() {
      return `${this.x} ${this.y} ${this.width} ${this.height}`;
    },
  };
  
  // Calculate gauge center
  const gaugeCenter = {
    x: viewBoxWidth / 2,
    y: finalPadding.top + outerRadius,
  };
  
  return {
    viewBox,
    outerRadius,
    innerRadius,
    gaugeCenter,
    doughnutTransform: { x: outerRadius, y: outerRadius },
  };
};

/**
 * Updates the dimensions object with new layout calculations
 * This maintains backward compatibility with existing code
 */
export const updateDimensionsFromLayout = (
  dimensions: Dimensions,
  layout: GaugeLayout
): void => {
  dimensions.outerRadius = layout.outerRadius;
  dimensions.innerRadius = layout.innerRadius;
  dimensions.width = layout.viewBox.width;
  dimensions.height = layout.viewBox.height;
  
  // Keep margin values as they might be used elsewhere
  // But they should be derived from the layout in the future
};

/**
 * Validates that a gauge won't cause infinite resizing
 * Returns true if the layout is stable
 * 
 * Compares radius, viewBox dimensions, and center position to detect oscillation
 */
export const isLayoutStable = (
  previousLayout: GaugeLayout | null,
  currentLayout: GaugeLayout,
  tolerance: number = 0.01
): boolean => {
  if (!previousLayout) return true;
  
  // Check radius stability
  const radiusDiff = Math.abs(
    currentLayout.outerRadius - previousLayout.outerRadius
  );
  const radiusChange = previousLayout.outerRadius > 0 
    ? radiusDiff / previousLayout.outerRadius 
    : radiusDiff;
  
  // Check viewBox stability
  const viewBoxWidthDiff = Math.abs(
    currentLayout.viewBox.width - previousLayout.viewBox.width
  );
  const viewBoxHeightDiff = Math.abs(
    currentLayout.viewBox.height - previousLayout.viewBox.height
  );
  const viewBoxWidthChange = previousLayout.viewBox.width > 0
    ? viewBoxWidthDiff / previousLayout.viewBox.width
    : viewBoxWidthDiff;
  const viewBoxHeightChange = previousLayout.viewBox.height > 0
    ? viewBoxHeightDiff / previousLayout.viewBox.height
    : viewBoxHeightDiff;
  
  // Check center position stability
  const centerXDiff = Math.abs(
    currentLayout.gaugeCenter.x - previousLayout.gaugeCenter.x
  );
  const centerYDiff = Math.abs(
    currentLayout.gaugeCenter.y - previousLayout.gaugeCenter.y
  );
  const centerXChange = previousLayout.gaugeCenter.x > 0
    ? centerXDiff / previousLayout.gaugeCenter.x
    : centerXDiff;
  const centerYChange = previousLayout.gaugeCenter.y > 0
    ? centerYDiff / previousLayout.gaugeCenter.y
    : centerYDiff;
  
  // All properties must be within tolerance for layout to be stable
  return radiusChange < tolerance && 
         viewBoxWidthChange < tolerance && 
         viewBoxHeightChange < tolerance &&
         centerXChange < tolerance &&
         centerYChange < tolerance;
};

/**
 * TWO-PASS RENDERING: Calculate optimized layout from measured bounds
 * 
 * After the first render, we measure the actual bounding box of the <g> element.
 * This tells us exactly how much space the gauge content uses.
 * We then recalculate the viewBox to fit the content with minimal padding.
 * 
 * The measured bounds are relative to the <g> element's transform origin (gauge center).
 * So bounds.x and bounds.y can be negative (content extends left/up from center).
 */
export const calculateLayoutFromMeasuredBounds = (
  parentWidth: number,
  parentHeight: number,
  measuredBounds: { width: number; height: number; x: number; y: number },
  gaugeType: GaugeType,
  arcWidth: number,
  currentLayout: GaugeLayout
): GaugeLayout => {
  // Add safety margin around the measured bounds
  // For small containers, use smaller margins to maximize gauge size
  const minDimension = Math.min(parentWidth, parentHeight);
  
  // Scale margin factor: 3% for small containers (<150px), up to 5% for larger ones
  const marginFactor = minDimension < 150 ? 0.02 : 
                        minDimension < 250 ? 0.03 : 0.05;
  
  // Scale minimum margin with container size: 2-5px
  const minMargin = Math.max(2, Math.min(5, minDimension * 0.02));
  const marginX = Math.max(minMargin, measuredBounds.width * marginFactor);
  const marginY = Math.max(minMargin, measuredBounds.height * marginFactor);
  
  // The measured bounds are relative to the gauge center (0,0 in <g> space)
  // bounds.x is the left edge, bounds.y is the top edge (can be negative)
  // We need to calculate the full extent from center
  const leftExtent = Math.abs(measuredBounds.x) + marginX;
  const rightExtent = measuredBounds.x + measuredBounds.width + marginX;
  const topExtent = Math.abs(measuredBounds.y) + marginY;
  const bottomExtent = measuredBounds.y + measuredBounds.height + marginY;
  
  // Use SYMMETRIC side padding to keep gauge visually centered
  // This handles asymmetric content (like a tick on only one side) by 
  // using the maximum extent on both sides
  const maxSideExtent = Math.max(leftExtent, rightExtent);
  const contentWidth = maxSideExtent * 2; // Symmetric width
  const contentHeight = topExtent + bottomExtent;
  
  // Calculate the scale factor to fit the content in the parent
  const scaleX = parentWidth / contentWidth;
  const scaleY = parentHeight / contentHeight;
  const scale = Math.min(scaleX, scaleY);
  
  // Calculate new outer radius based on the scale
  const newOuterRadius = currentLayout.outerRadius * scale;
  const newInnerRadius = newOuterRadius * (1 - arcWidth);
  
  // Calculate new viewBox dimensions
  const newViewBoxWidth = contentWidth * scale;
  const newViewBoxHeight = contentHeight * scale;
  
  // Calculate new center position
  // With symmetric side padding, center is always in the horizontal middle
  const newCenterX = newViewBoxWidth / 2;
  const newCenterY = topExtent * scale;
  
  const viewBox: ViewBox = {
    x: 0,
    y: 0,
    width: newViewBoxWidth,
    height: newViewBoxHeight,
    toString() {
      return `${this.x} ${this.y} ${this.width} ${this.height}`;
    },
  };
  
  return {
    viewBox,
    outerRadius: newOuterRadius,
    innerRadius: newInnerRadius,
    gaugeCenter: { x: newCenterX, y: newCenterY },
    doughnutTransform: { x: newOuterRadius, y: newOuterRadius },
  };
};

/**
 * TWO-PASS RENDERING: Optimized approach using actual measured bounds
 * 
 * Pass 1: Render with generous initial padding to ensure all content is visible
 *         for accurate measurement. This pass is hidden from the user.
 * Pass 2: Recalculate viewBox to maximize gauge size while fitting content
 * 
 * This approach:
 * 1. Uses generous padding for first pass (hidden) to capture all content
 * 2. Renders all elements (arcs, labels, pointer)
 * 3. Measures the actual bounding box of the rendered content
 * 4. Adjusts the viewBox to tightly fit the content with proper margins
 */
export const calculateTightLayout = (
  parentWidth: number,
  parentHeight: number,
  gaugeType: GaugeType,
  arcWidth: number,
  marginPercent: number = 0
): GaugeLayout => {
  // Apply margin
  const availableWidth = parentWidth * (1 - marginPercent);
  const availableHeight = parentHeight * (1 - marginPercent);
  
  // Arc bottom extent for radial/grafana types
  // Semicircle needs extra bottom space for needle/value label
  const arcBottomExtent = gaugeType === GaugeType.Semicircle ? 0.15 : 
    (gaugeType === GaugeType.Grafana ? 0.70 : 0.72);
  
  // Use PROPORTIONAL padding for first pass
  // This ensures gauges stay usable at all sizes
  // For small containers (<200px), use 8% padding; for larger, cap at reasonable pixel values
  const minDimension = Math.min(availableWidth, availableHeight);
  
  // Proportional padding: 10% of min dimension, capped between 8-40px
  const topPadding = Math.max(8, Math.min(30, minDimension * 0.10));
  const sidePadding = Math.max(10, Math.min(40, minDimension * 0.12));
  const bottomPadding = Math.max(6, Math.min(25, minDimension * 0.08));
  
  // Calculate radius with proportional padding
  const radiusFromWidth = (availableWidth - 2 * sidePadding) / 2;
  
  let radiusFromHeight: number;
  if (gaugeType === GaugeType.Semicircle) {
    // Semicircle: top padding + radius + bottom padding (for value label/needle)
    radiusFromHeight = (availableHeight - topPadding - bottomPadding);
  } else {
    // Radial/Grafana: top padding + radius + arc bottom extent + bottom padding
    radiusFromHeight = (availableHeight - topPadding - bottomPadding) / (1 + arcBottomExtent);
  }
  
  const outerRadius = Math.max(10, Math.min(radiusFromWidth, radiusFromHeight));
  const innerRadius = outerRadius * (1 - arcWidth);
  
  // Calculate viewBox with generous padding
  const diameter = outerRadius * 2;
  const viewBoxWidth = diameter + sidePadding * 2;
  let viewBoxHeight: number;
  
  if (gaugeType === GaugeType.Semicircle) {
    // Semicircle: top padding + radius + bottom padding
    viewBoxHeight = topPadding + outerRadius + bottomPadding;
  } else {
    // Radial/Grafana: top padding + radius + arc extent + bottom padding
    viewBoxHeight = topPadding + outerRadius + (outerRadius * arcBottomExtent) + bottomPadding;
  }
  
  const viewBox: ViewBox = {
    x: 0,
    y: 0,
    width: viewBoxWidth,
    height: viewBoxHeight,
    toString() {
      return `${this.x} ${this.y} ${this.width} ${this.height}`;
    },
  };
  
  // Calculate gauge center
  const gaugeCenter = {
    x: viewBoxWidth / 2,
    y: topPadding + outerRadius,
  };
  
  return {
    viewBox,
    outerRadius,
    innerRadius,
    gaugeCenter,
    doughnutTransform: { x: outerRadius, y: outerRadius },
  };
};
