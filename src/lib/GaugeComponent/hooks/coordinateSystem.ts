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
 * 
 * All gauge types now use separate top/bottom/side padding for optimal space usage
 */
const GAUGE_TYPE_CONFIG = {
  [GaugeType.Semicircle]: {
    // Semicircle: only the top half of the circle is visible
    topPaddingPercent: 0.18,  // 18% for tick labels at top
    bottomPaddingPercent: 0.25, // 25% for value label below center
    sidePaddingPercent: 0.10,
  },
  [GaugeType.Radial]: {
    // Radial: shows about 75% of circle (-130° to +130°)
    // Top has tick labels, bottom has more arc visible
    topPaddingPercent: 0.15,  // 15% for tick labels at top
    bottomPaddingPercent: 0.08, // 8% - less needed at bottom since arc is smaller there
    sidePaddingPercent: 0.10,
    // Radial arc extends about 73% down from center (cos(50°) ≈ 0.64, so ~64% + some margin)
    arcBottomExtent: 0.72, // How far below center the arc extends (as fraction of radius)
  },
  [GaugeType.Grafana]: {
    // Grafana: similar to radial but with outer decorative arc (+7px)
    topPaddingPercent: 0.16,  // 16% for tick labels
    bottomPaddingPercent: 0.10, // 10% - slightly more for outer arc
    sidePaddingPercent: 0.12,  // 12% - extra for outer decorative arc
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
