import { GaugeType } from "../types/GaugeComponentProps";
import { Dimensions } from "../types/Dimensions";

/**
 * Coordinate System Manager for Gauge Component
 * 
 * This module centralizes all coordinate, dimension, and viewBox calculations
 * to ensure consistent positioning and optimal space utilization.
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
 * Configuration for gauge type specific dimensions
 * 
 * Padding accounts for:
 * - Tick labels and value labels
 * - Pointer elements that might extend beyond the arc
 * - For Grafana: the outer decorative arc extends +7px beyond outerRadius
 */
const GAUGE_TYPE_CONFIG = {
  [GaugeType.Semicircle]: {
    // Semicircle: only the top half of the circle is visible
    // Top padding needs extra space for tick labels above the arc
    topPaddingPercent: 0.18,  // 18% for tick labels at top
    // Bottom padding just needs space for value label
    bottomPaddingPercent: 0.25, // 25% for value label below center
    // Side padding for horizontal ticks
    sidePaddingPercent: 0.10,
  },
  [GaugeType.Radial]: {
    // Radial needs more height (about 75% of full circle)
    paddingPercent: 0.10,
  },
  [GaugeType.Grafana]: {
    // Grafana style is similar to radial
    // Extra padding because Grafana has an outer arc that extends +7px beyond outerRadius
    paddingPercent: 0.12,
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
  
  if (gaugeType === GaugeType.Semicircle) {
    // Semicircle uses separate top/bottom/side padding
    const semiConfig = config as typeof GAUGE_TYPE_CONFIG[GaugeType.Semicircle];
    // width = diameter + 2*sidePadding
    widthMultiplier = 2 + 2 * semiConfig.sidePaddingPercent;
    // height = topPadding + radius + bottomPadding (semicircle only shows top half)
    heightMultiplier = semiConfig.topPaddingPercent + 1 + semiConfig.bottomPaddingPercent;
  } else {
    // Radial and Grafana use uniform padding
    const uniformConfig = config as { paddingPercent: number };
    // width = diameter + 2*padding
    widthMultiplier = 2 + 2 * uniformConfig.paddingPercent;
    // height = diameter + 2*padding
    heightMultiplier = 2 + 2 * uniformConfig.paddingPercent;
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
  
  let width: number;
  let height: number;
  let y = 0;
  
  if (gaugeType === GaugeType.Semicircle) {
    // Semicircle uses separate padding values
    const semiConfig = config as typeof GAUGE_TYPE_CONFIG[GaugeType.Semicircle];
    const topPadding = outerRadius * semiConfig.topPaddingPercent;
    const bottomPadding = outerRadius * semiConfig.bottomPaddingPercent;
    const sidePadding = outerRadius * semiConfig.sidePaddingPercent;
    
    width = diameter + sidePadding * 2;
    // Height = topPadding + radius (arc from top to center) + bottomPadding (for value label)
    height = topPadding + outerRadius + bottomPadding;
  } else {
    // Radial and Grafana use uniform padding
    const uniformConfig = config as { paddingPercent: number };
    const padding = outerRadius * uniformConfig.paddingPercent;
    
    width = diameter + padding * 2;
    height = diameter + padding * 2;
  }
  
  return {
    x: 0,
    y: y,
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
  
  // Horizontal center is always in the middle
  const x = viewBox.width / 2;
  
  let y: number;
  if (gaugeType === GaugeType.Semicircle) {
    // For semicircle, center is at topPadding + radius from the top
    const semiConfig = config as typeof GAUGE_TYPE_CONFIG[GaugeType.Semicircle];
    const topPadding = outerRadius * semiConfig.topPaddingPercent;
    y = topPadding + outerRadius;
  } else {
    // For radial and grafana, center vertically
    y = viewBox.height / 2;
  }
  
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
 */
export const isLayoutStable = (
  previousLayout: GaugeLayout | null,
  currentLayout: GaugeLayout,
  tolerance: number = 0.01
): boolean => {
  if (!previousLayout) return true;
  
  const radiusDiff = Math.abs(
    currentLayout.outerRadius - previousLayout.outerRadius
  );
  const radiusChange = radiusDiff / previousLayout.outerRadius;
  
  return radiusChange < tolerance;
};
