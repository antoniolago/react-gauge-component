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
 */
const GAUGE_TYPE_CONFIG = {
  [GaugeType.Semicircle]: {
    // Semicircle occupies approximately 50% of the circle height + some padding
    heightRatio: 0.55,
    // Padding around the gauge for labels and ticks
    paddingPercent: 0.15,
  },
  [GaugeType.Radial]: {
    // Radial needs more height (about 75% of full circle)
    heightRatio: 0.78,
    paddingPercent: 0.15,
  },
  [GaugeType.Grafana]: {
    // Grafana style is similar to radial
    heightRatio: 0.75,
    paddingPercent: 0.12,
  },
};

/**
 * Calculates optimal outer radius given available space and gauge type
 * This is the core function that determines how much space the gauge will use
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
  
  // Apply padding for labels and ticks
  const paddedWidth = availableWidth * (1 - config.paddingPercent);
  const paddedHeight = availableHeight * (1 - config.paddingPercent);
  
  // For semicircle and radial, height constraint is different
  // The gauge diameter should fit in available width, or available height / heightRatio
  const radiusFromWidth = paddedWidth / 2;
  const radiusFromHeight = paddedHeight / config.heightRatio / 2;
  
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
  
  // Minimal padding for labels and ticks (small fixed value)
  const minPadding = 10; // Small fixed padding in viewBox units
  
  let width = diameter + minPadding * 2;
  let height: number;
  let y = 0;
  
  // Adjust height based on gauge type - be tight to avoid wasted space
  if (gaugeType === GaugeType.Semicircle) {
    // Semicircle: minimal padding + outerRadius (center to top) + space below for arc & label
    // Top padding + radius above center + radius below center * 0.7 + bottom padding
    height = minPadding + outerRadius + outerRadius * 0.7 + minPadding;
  } else {
    // Radial and Grafana: just diameter + minimal padding
    height = diameter + minPadding * 2;
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
  const minPadding = 10; // Must match the padding used in calculateViewBox
  
  // Horizontal center is always in the middle
  const x = viewBox.width / 2;
  
  let y: number;
  if (gaugeType === GaugeType.Semicircle) {
    // For semicircle, position center so top of arc has minPadding from top
    // y = minPadding (top) + outerRadius (distance from top to center)
    y = minPadding + outerRadius;
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
