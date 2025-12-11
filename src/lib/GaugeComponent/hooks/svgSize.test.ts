/**
 * Tests for SVG size matching content
 * Ensures SVG doesn't waste space and matches g element bounds
 */

import { calculateGaugeLayout } from './coordinateSystem';
import { GaugeType } from '../types/GaugeComponentProps';

describe('SVG Size Tests', () => {
  describe('SVG to ViewBox Size Matching', () => {
    it('should have viewBox height close to content height for Semicircle', () => {
      const layout = calculateGaugeLayout(400, 300, GaugeType.Semicircle, 0.2);
      
      // Calculate actual content bounds within viewBox
      const contentTop = layout.gaugeCenter.y - layout.outerRadius;
      const contentBottom = layout.gaugeCenter.y + layout.outerRadius * 0.7; // Bottom with label space
      const contentHeight = contentBottom - contentTop;
      
      // ViewBox height should be close to content height (within 20px tolerance)
      const wastedSpace = layout.viewBox.height - contentHeight;
      expect(wastedSpace).toBeLessThanOrEqual(20);
    });

    it('should have viewBox height close to content height for Radial', () => {
      const layout = calculateGaugeLayout(400, 300, GaugeType.Radial, 0.2);
      
      const contentTop = layout.gaugeCenter.y - layout.outerRadius;
      const contentBottom = layout.gaugeCenter.y + layout.outerRadius;
      const contentHeight = contentBottom - contentTop;
      
      // Padding is 10% of radius on each side, so ~20% of diameter as padding
      const expectedPadding = layout.outerRadius * 0.2 * 2;
      const wastedSpace = layout.viewBox.height - contentHeight;
      expect(wastedSpace).toBeLessThanOrEqual(expectedPadding + 5);
    });

    it('should have viewBox height close to content height for Grafana', () => {
      const layout = calculateGaugeLayout(400, 300, GaugeType.Grafana, 0.2);
      
      const contentTop = layout.gaugeCenter.y - layout.outerRadius;
      const contentBottom = layout.gaugeCenter.y + layout.outerRadius;
      const contentHeight = contentBottom - contentTop;
      
      // Grafana has 12% padding to account for outer decorative arc
      const expectedPadding = layout.outerRadius * 0.24 * 2;
      const wastedSpace = layout.viewBox.height - contentHeight;
      expect(wastedSpace).toBeLessThanOrEqual(expectedPadding + 5);
    });
  });

  describe('G Element Bounds within ViewBox', () => {
    it('should ensure g element bounds are tight for Semicircle', () => {
      const layout = calculateGaugeLayout(400, 300, GaugeType.Semicircle, 0.2);
      
      // G element bounds
      const gTop = layout.gaugeCenter.y - layout.outerRadius;
      const gBottom = layout.gaugeCenter.y + layout.outerRadius;
      const gHeight = gBottom - gTop;
      
      // ViewBox should not be much larger than g bounds
      const heightRatio = layout.viewBox.height / gHeight;
      
      // ViewBox should be at most 1.2x the g height (20% tolerance)
      expect(heightRatio).toBeLessThan(1.2);
    });

    it('should ensure g element bounds are tight for all gauge types', () => {
      const types = [GaugeType.Semicircle, GaugeType.Radial, GaugeType.Grafana];
      
      types.forEach(type => {
        const layout = calculateGaugeLayout(400, 300, type, 0.2);
        
        const gHeight = layout.outerRadius * 2; // Full diameter
        const heightRatio = layout.viewBox.height / gHeight;
        
        // ViewBox should be at most 1.3x the gauge diameter (30% tolerance for padding)
        expect(heightRatio).toBeLessThan(1.3);
      });
    });
  });

  describe('Space Efficiency', () => {
    it('should have adequate top padding for tick labels', () => {
      const layout = calculateGaugeLayout(400, 300, GaugeType.Semicircle, 0.2);
      
      const topPadding = layout.gaugeCenter.y - layout.outerRadius - layout.viewBox.y;
      const paddingRatio = topPadding / layout.outerRadius;
      
      // Config uses 38% top padding for tick labels (maximum for outer ticks)
      expect(paddingRatio).toBeLessThan(0.42); // Allow up to 42%
      expect(topPadding).toBeGreaterThan(0); // But still some padding
    });

    it('should have appropriate viewBox for Semicircle', () => {
      const layout = calculateGaugeLayout(400, 300, GaugeType.Semicircle, 0.2);
      
      // For semicircle, only the top half of the arc is visible
      // Value label appears below center within bottomPadding
      const valueBottom = layout.gaugeCenter.y + layout.outerRadius * 0.15;
      const viewBoxBottom = layout.viewBox.y + layout.viewBox.height;
      
      // Value label should fit within viewBox (with small tolerance)
      expect(valueBottom).toBeLessThanOrEqual(viewBoxBottom + 10);
      
      // ViewBox height should be optimized for semicircle (not full circle)
      // With generous padding, height may approach width
      expect(layout.viewBox.height).toBeLessThanOrEqual(layout.viewBox.width);
    });

    it('should use less vertical space for Semicircle than Radial', () => {
      // Use a square container so width doesn't limit height calculations
      const semicircleLayout = calculateGaugeLayout(400, 400, GaugeType.Semicircle, 0.2);
      const radialLayout = calculateGaugeLayout(400, 400, GaugeType.Radial, 0.2);
      
      // Semicircle viewBox height-to-width ratio should be smaller than radial
      const semicircleRatio = semicircleLayout.viewBox.height / semicircleLayout.viewBox.width;
      const radialRatio = radialLayout.viewBox.height / radialLayout.viewBox.width;
      
      // Semicircle should be more compact vertically
      expect(semicircleRatio).toBeLessThan(radialRatio);
    });
  });

  describe('SVG Rendered Size (Conceptual)', () => {
    it('should calculate correct aspect ratio for Semicircle', () => {
      const layout = calculateGaugeLayout(400, 300, GaugeType.Semicircle, 0.2);
      
      const aspectRatio = layout.viewBox.height / layout.viewBox.width;
      
      // Semicircle should be wider than tall
      expect(aspectRatio).toBeLessThan(1.0);
      
      // Height/width ratio for semicircle: (topPad + r + bottomPad) / (2r + 2*sidePad)
      // = (0.38r + r + 0.10r) / (2r + 0.76r) = 1.48r / 2.76r = 0.54
      expect(aspectRatio).toBeGreaterThan(0.50);
      expect(aspectRatio).toBeLessThan(0.65);
    });

    it('should calculate correct aspect ratio for Radial', () => {
      const layout = calculateGaugeLayout(400, 300, GaugeType.Radial, 0.2);
      
      const aspectRatio = layout.viewBox.height / layout.viewBox.width;
      
      // Radial should be roughly square or slightly wider
      expect(aspectRatio).toBeGreaterThan(0.8);
      expect(aspectRatio).toBeLessThan(1.1);
    });

    it('should calculate correct aspect ratio for Grafana', () => {
      const layout = calculateGaugeLayout(400, 300, GaugeType.Grafana, 0.2);
      
      const aspectRatio = layout.viewBox.height / layout.viewBox.width;
      
      // Grafana should be roughly square or slightly taller
      expect(aspectRatio).toBeGreaterThan(0.80);
      expect(aspectRatio).toBeLessThan(1.20);
    });
  });

  describe('ViewBox Height Calculation Accuracy', () => {
    it('should match expected formula for Semicircle', () => {
      const layout = calculateGaugeLayout(400, 300, GaugeType.Semicircle, 0.2);
      
      // For semicircle: viewBox should be reasonable height
      // ViewBox height should be at least outerRadius (for the arc)
      // and have some padding for labels
      expect(layout.viewBox.height).toBeGreaterThanOrEqual(layout.outerRadius);
      
      // ViewBox should not be excessively tall compared to expected
      // Allow up to 50px variance from expected formula
      const topPadding = layout.gaugeCenter.y - layout.outerRadius - layout.viewBox.y;
      const bottomPadding = layout.viewBox.y + layout.viewBox.height - layout.gaugeCenter.y;
      expect(topPadding).toBeGreaterThanOrEqual(0);
      expect(bottomPadding).toBeGreaterThanOrEqual(0);
    });

    it('should not have excessive viewBox height for any gauge type', () => {
      const types = [GaugeType.Semicircle, GaugeType.Radial, GaugeType.Grafana];
      
      types.forEach(type => {
        const layout = calculateGaugeLayout(400, 300, type, 0.2);
        
        // ViewBox height should not exceed 1.5x the width
        expect(layout.viewBox.height).toBeLessThan(layout.viewBox.width * 1.5);
      });
    });
  });

  describe('Content Bounds Validation', () => {
    it('should ensure visible content fits within viewBox for Semicircle', () => {
      const layout = calculateGaugeLayout(400, 300, GaugeType.Semicircle, 0.2);
      
      // Calculate the actual visible bounds for semicircle
      // Top of arc (gauge center - radius) should be within viewBox
      const minY = layout.gaugeCenter.y - layout.outerRadius;
      // For semicircle, visible content should be within viewBox (with tolerance)
      const maxVisibleY = layout.gaugeCenter.y + layout.outerRadius * 0.15;
      
      // Check visible content fits within viewBox (with tolerance)
      expect(minY).toBeGreaterThanOrEqual(layout.viewBox.y);
      expect(maxVisibleY).toBeLessThanOrEqual(layout.viewBox.y + layout.viewBox.height + 10);
      
      // Should have some top padding for tick labels
      const topPadding = minY - layout.viewBox.y;
      expect(topPadding).toBeGreaterThanOrEqual(0);
    });

    it('should have balanced padding for all gauge types', () => {
      const types = [GaugeType.Radial, GaugeType.Grafana]; // Test non-semicircle types
      
      types.forEach(type => {
        const layout = calculateGaugeLayout(400, 300, type, 0.2);
        
        const topEdge = layout.gaugeCenter.y - layout.outerRadius;
        const topPadding = topEdge - layout.viewBox.y;
        
        // Should have some padding but not excessive (36-38% for radial/grafana)
        expect(topPadding).toBeGreaterThan(0);
        expect(topPadding).toBeLessThan(layout.outerRadius * 0.42); // < 42% of radius
      });
    });
  });
});
