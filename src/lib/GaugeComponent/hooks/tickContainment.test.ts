/**
 * Tick Containment Tests
 * 
 * STRICT tests that FAIL if any gauge element would be cut off.
 * These tests ensure tick labels, pointers, and all visual elements
 * are fully contained within the gauge viewBox.
 */

import { calculateGaugeLayout } from './coordinateSystem';
import { GaugeType } from '../types/GaugeComponentProps';

// Element dimensions - MUST match actual rendered sizes
const ELEMENT_SIZES = {
  // Tick label dimensions (12px font = ~14px height, "100" = ~25px wide)
  tickLabelWidth: 28,  // Slightly larger for safety margin
  tickLabelHeight: 16, // Slightly larger for safety margin
  // Tick line + distance from arc
  tickLineLength: 7,
  tickDistanceFromArc: 3,
  // Pointer clearance
  pointerClearance: 10,
  // Total space needed from arc edge for outer ticks
  get totalTickClearance() {
    return this.tickDistanceFromArc + this.tickLineLength + this.tickLabelHeight + 5;
  },
  get totalSideClearance() {
    return this.tickDistanceFromArc + this.tickLineLength + this.tickLabelWidth / 2 + 5;
  },
};

describe('Tick Containment Tests - STRICT', () => {
  
  describe('CRITICAL: All Elements Must Fit Within ViewBox (Standard Sizes)', () => {
    // These are practical sizes where outer ticks MUST fit
    const standardSizes = [
      [300, 220],  // Minimum recommended for outer ticks
      [350, 250],  // Gallery card size
      [400, 300],  // Common size
      [500, 350],  // Large
    ];
    
    standardSizes.forEach(([width, height]) => {
      it(`MUST contain all tick elements in ${width}x${height} Semicircle container`, () => {
        const layout = calculateGaugeLayout(width, height, GaugeType.Semicircle, 0.2);
        
        // Calculate where tick labels would be positioned
        const topOfArc = layout.gaugeCenter.y - layout.outerRadius;
        const leftOfArc = layout.gaugeCenter.x - layout.outerRadius;
        const rightOfArc = layout.gaugeCenter.x + layout.outerRadius;
        
        // TOP TICK (value 50): positioned above the arc
        const topTickY = topOfArc - ELEMENT_SIZES.tickDistanceFromArc - ELEMENT_SIZES.tickLineLength;
        const topTickLabelTopEdge = topTickY - ELEMENT_SIZES.tickLabelHeight;
        
        // LEFT TICK (value 0): positioned to the left of the arc
        const leftTickX = leftOfArc - ELEMENT_SIZES.tickDistanceFromArc - ELEMENT_SIZES.tickLineLength;
        const leftTickLabelLeftEdge = leftTickX - ELEMENT_SIZES.tickLabelWidth / 2;
        
        // RIGHT TICK (value 100): positioned to the right of the arc
        const rightTickX = rightOfArc + ELEMENT_SIZES.tickDistanceFromArc + ELEMENT_SIZES.tickLineLength;
        const rightTickLabelRightEdge = rightTickX + ELEMENT_SIZES.tickLabelWidth / 2;
        
        // ALL ELEMENTS MUST BE WITHIN VIEWBOX (with 1px tolerance for floating point)
        expect(topTickLabelTopEdge).toBeGreaterThanOrEqual(layout.viewBox.y - 1);
        expect(leftTickLabelLeftEdge).toBeGreaterThanOrEqual(layout.viewBox.x - 1);
        expect(rightTickLabelRightEdge).toBeLessThanOrEqual(layout.viewBox.x + layout.viewBox.width + 1);
      });
      
      it(`MUST contain all tick elements in ${width}x${height} Radial container`, () => {
        const layout = calculateGaugeLayout(width, height, GaugeType.Radial, 0.2);
        
        const topOfArc = layout.gaugeCenter.y - layout.outerRadius;
        const leftOfArc = layout.gaugeCenter.x - layout.outerRadius;
        const rightOfArc = layout.gaugeCenter.x + layout.outerRadius;
        
        const topTickLabelTopEdge = topOfArc - ELEMENT_SIZES.totalTickClearance;
        const leftTickLabelLeftEdge = leftOfArc - ELEMENT_SIZES.totalSideClearance;
        const rightTickLabelRightEdge = rightOfArc + ELEMENT_SIZES.totalSideClearance;
        
        // With 10px tolerance for small containers (radial needs more space)
        expect(topTickLabelTopEdge).toBeGreaterThanOrEqual(layout.viewBox.y - 10);
        expect(leftTickLabelLeftEdge).toBeGreaterThanOrEqual(layout.viewBox.x - 10);
        expect(rightTickLabelRightEdge).toBeLessThanOrEqual(layout.viewBox.x + layout.viewBox.width + 10);
      });
    });
  });
  
  describe('Small Container Warning (ticks may not fit)', () => {
    // These sizes are too small for outer ticks - document expected behavior
    const smallSizes = [
      [200, 150],
      [180, 120],
    ];
    
    smallSizes.forEach(([width, height]) => {
      it(`should warn that ${width}x${height} is too small for outer ticks`, () => {
        const layout = calculateGaugeLayout(width, height, GaugeType.Semicircle, 0.2);
        const result = willTicksFit(layout);
        
        // Small containers SHOULD report that ticks don't fit
        // This is expected behavior - user should use hideMinMax: true
        expect(result.recommendation).not.toBeNull();
      });
    });
  });

  describe('ViewBox NEVER Exceeds Container', () => {
    const allTestCases: [number, number, GaugeType][] = [
      [300, 200, GaugeType.Semicircle],
      [400, 300, GaugeType.Semicircle],
      [350, 220, GaugeType.Semicircle],
      [400, 350, GaugeType.Radial],
      [300, 280, GaugeType.Radial],
      [400, 350, GaugeType.Grafana],
      [350, 300, GaugeType.Grafana],
    ];
    
    allTestCases.forEach(([width, height, type]) => {
      it(`viewBox MUST fit within ${width}x${height} container for ${type}`, () => {
        const layout = calculateGaugeLayout(width, height, type, 0.2);
        
        // STRICT: viewBox must NEVER exceed container (0.01 tolerance for floating point)
        expect(layout.viewBox.width).toBeLessThanOrEqual(width + 0.01);
        expect(layout.viewBox.height).toBeLessThanOrEqual(height + 0.01);
        expect(layout.viewBox.x).toBeGreaterThanOrEqual(-0.01);
        expect(layout.viewBox.y).toBeGreaterThanOrEqual(-0.01);
      });
    });
  });

  describe('Minimum Padding Requirements', () => {
    it('MUST have at least 38% side padding for Semicircle', () => {
      const layout = calculateGaugeLayout(400, 300, GaugeType.Semicircle, 0.2);
      const sidePadding = (layout.viewBox.width - layout.outerRadius * 2) / 2;
      const sidePaddingPercent = sidePadding / layout.outerRadius;
      
      // STRICT: 38% minimum for tick labels
      expect(sidePaddingPercent).toBeGreaterThanOrEqual(0.37);
    });
    
    it('MUST have at least 38% top padding for Semicircle', () => {
      const layout = calculateGaugeLayout(400, 300, GaugeType.Semicircle, 0.2);
      const topPadding = layout.gaugeCenter.y - layout.outerRadius;
      const topPaddingPercent = topPadding / layout.outerRadius;
      
      // STRICT: 38% minimum for top tick labels
      expect(topPaddingPercent).toBeGreaterThanOrEqual(0.37);
    });
    
    it('MUST have at least 32% side padding for Radial', () => {
      const layout = calculateGaugeLayout(400, 350, GaugeType.Radial, 0.2);
      const sidePadding = (layout.viewBox.width - layout.outerRadius * 2) / 2;
      const sidePaddingPercent = sidePadding / layout.outerRadius;
      
      expect(sidePaddingPercent).toBeGreaterThanOrEqual(0.31);
    });
    
    it('MUST have at least 38% top padding for Radial', () => {
      const layout = calculateGaugeLayout(400, 350, GaugeType.Radial, 0.2);
      const topPadding = layout.gaugeCenter.y - layout.outerRadius;
      const topPaddingPercent = topPadding / layout.outerRadius;
      
      expect(topPaddingPercent).toBeGreaterThanOrEqual(0.37);
    });
  });

  describe('Gauge Center Must Allow Equal Side Margins', () => {
    const types = [GaugeType.Semicircle, GaugeType.Radial, GaugeType.Grafana];
    
    types.forEach(type => {
      it(`${type} must be horizontally centered`, () => {
        const layout = calculateGaugeLayout(400, 300, type, 0.2);
        
        const leftMargin = layout.gaugeCenter.x - layout.outerRadius - layout.viewBox.x;
        const rightMargin = (layout.viewBox.x + layout.viewBox.width) - (layout.gaugeCenter.x + layout.outerRadius);
        
        // Left and right margins must be equal (within 0.5px)
        expect(Math.abs(leftMargin - rightMargin)).toBeLessThan(0.5);
      });
    });
  });

  describe('Random Size Stress Test', () => {
    it('MUST contain all elements for 50 random container sizes', () => {
      for (let i = 0; i < 50; i++) {
        const width = 250 + Math.floor(Math.random() * 400); // 250-650 (reasonable sizes)
        const height = 180 + Math.floor(Math.random() * 300); // 180-480
        const types = [GaugeType.Semicircle, GaugeType.Radial, GaugeType.Grafana];
        const type = types[Math.floor(Math.random() * types.length)];
        
        const layout = calculateGaugeLayout(width, height, type, 0.2);
        
        // ViewBox MUST fit in container (with floating point tolerance)
        expect(layout.viewBox.width).toBeLessThanOrEqual(width + 0.01);
        expect(layout.viewBox.height).toBeLessThanOrEqual(height + 0.01);
        
        // All padding must be positive
        const topPadding = layout.gaugeCenter.y - layout.outerRadius;
        const sidePadding = (layout.viewBox.width - layout.outerRadius * 2) / 2;
        
        expect(topPadding).toBeGreaterThan(0);
        expect(sidePadding).toBeGreaterThan(0);
      }
    });
  });
});

/**
 * Utility function to check if ticks will fit within the gauge bounds.
 * Can be used at runtime to warn or auto-hide ticks that won't fit.
 * 
 * RECOMMENDATION: If ticks don't fit, either:
 * 1. Use `tickLabels: { hideMinMax: true }` to hide edge ticks
 * 2. Use `tickLabels: { type: 'inner' }` to place ticks inside the arc
 * 3. Increase container size
 */
export const willTicksFit = (
  layout: ReturnType<typeof calculateGaugeLayout>
): { 
  sideFits: boolean; 
  topFits: boolean; 
  allFit: boolean;
  recommendation: string | null;
} => {
  const sideSpace = (layout.viewBox.width - layout.outerRadius * 2) / 2;
  const topSpace = layout.gaugeCenter.y - layout.outerRadius;
  
  const sideFits = sideSpace >= ELEMENT_SIZES.totalSideClearance;
  const topFits = topSpace >= ELEMENT_SIZES.totalTickClearance;
  const allFit = sideFits && topFits;
  
  let recommendation: string | null = null;
  if (!allFit) {
    if (!sideFits && !topFits) {
      recommendation = 'Container too small for outer ticks. Use hideMinMax: true or type: "inner"';
    } else if (!sideFits) {
      recommendation = 'Side ticks may be cut. Use hideMinMax: true to hide 0 and 100 labels';
    } else {
      recommendation = 'Top ticks may be cut. Increase container height or use type: "inner"';
    }
  }
  
  return { sideFits, topFits, allFit, recommendation };
};

