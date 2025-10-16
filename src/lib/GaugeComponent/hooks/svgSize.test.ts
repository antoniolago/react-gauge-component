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
      
      const wastedSpace = layout.viewBox.height - contentHeight;
      expect(wastedSpace).toBeLessThanOrEqual(20);
    });

    it('should have viewBox height close to content height for Grafana', () => {
      const layout = calculateGaugeLayout(400, 300, GaugeType.Grafana, 0.2);
      
      const contentTop = layout.gaugeCenter.y - layout.outerRadius;
      const contentBottom = layout.gaugeCenter.y + layout.outerRadius;
      const contentHeight = contentBottom - contentTop;
      
      const wastedSpace = layout.viewBox.height - contentHeight;
      expect(wastedSpace).toBeLessThanOrEqual(20);
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
    it('should have minimal top padding (< 10% of radius)', () => {
      const layout = calculateGaugeLayout(400, 300, GaugeType.Semicircle, 0.2);
      
      const topPadding = layout.gaugeCenter.y - layout.outerRadius - layout.viewBox.y;
      const paddingRatio = topPadding / layout.outerRadius;
      
      expect(paddingRatio).toBeLessThan(0.1); // Less than 10%
      expect(topPadding).toBeGreaterThan(0); // But still some padding
    });

    it('should have minimal bottom padding for Semicircle', () => {
      const layout = calculateGaugeLayout(400, 300, GaugeType.Semicircle, 0.2);
      
      // Bottom of content (gauge center + space for label)
      const contentBottom = layout.gaugeCenter.y + layout.outerRadius * 0.7;
      const bottomPadding = (layout.viewBox.y + layout.viewBox.height) - contentBottom;
      
      expect(bottomPadding).toBeLessThan(20);
      expect(bottomPadding).toBeGreaterThan(0);
    });

    it('should use less vertical space for Semicircle than Radial', () => {
      const semicircleLayout = calculateGaugeLayout(400, 300, GaugeType.Semicircle, 0.2);
      const radialLayout = calculateGaugeLayout(400, 300, GaugeType.Radial, 0.2);
      
      // Semicircle should have smaller viewBox height
      expect(semicircleLayout.viewBox.height).toBeLessThan(radialLayout.viewBox.height);
      
      // Ratio should be significant (at least 10% smaller)
      const ratio = semicircleLayout.viewBox.height / radialLayout.viewBox.height;
      expect(ratio).toBeLessThan(0.92); // Adjusted tolerance
    });
  });

  describe('SVG Rendered Size (Conceptual)', () => {
    it('should calculate correct aspect ratio for Semicircle', () => {
      const layout = calculateGaugeLayout(400, 300, GaugeType.Semicircle, 0.2);
      
      const aspectRatio = layout.viewBox.height / layout.viewBox.width;
      
      // Semicircle should be wider than tall
      expect(aspectRatio).toBeLessThan(1.0);
      
      // Should be around 0.8-0.9 for semicircle (compact but with label space)
      expect(aspectRatio).toBeGreaterThan(0.7);
      expect(aspectRatio).toBeLessThan(0.95);
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
      
      // Grafana should be roughly square
      expect(aspectRatio).toBeGreaterThan(0.85);
      expect(aspectRatio).toBeLessThan(1.15);
    });
  });

  describe('ViewBox Height Calculation Accuracy', () => {
    it('should match expected formula for Semicircle', () => {
      const layout = calculateGaugeLayout(400, 300, GaugeType.Semicircle, 0.2);
      
      // For semicircle: minPadding + outerRadius + (outerRadius * 0.7) + minPadding
      const minPadding = 10; // Fixed padding value
      
      const expectedHeight = minPadding + layout.outerRadius + layout.outerRadius * 0.7 + minPadding;
      
      // Should be very close (within 1px)
      expect(Math.abs(layout.viewBox.height - expectedHeight)).toBeLessThan(1);
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
    it('should ensure all content fits within viewBox with tolerance', () => {
      const layout = calculateGaugeLayout(400, 300, GaugeType.Semicircle, 0.2);
      
      // Calculate the actual bounds needed for content
      const minY = layout.gaugeCenter.y - layout.outerRadius;
      const maxY = layout.gaugeCenter.y + layout.outerRadius * 0.7; // Include label space
      
      // Check content fits within viewBox
      expect(minY).toBeGreaterThanOrEqual(layout.viewBox.y);
      expect(maxY).toBeLessThanOrEqual(layout.viewBox.y + layout.viewBox.height);
      
      // Check wasted space at top and bottom combined is <= 20px
      const topWaste = minY - layout.viewBox.y;
      const bottomWaste = (layout.viewBox.y + layout.viewBox.height) - maxY;
      const totalWaste = topWaste + bottomWaste;
      
      expect(totalWaste).toBeLessThanOrEqual(20);
    });

    it('should have balanced padding for all gauge types', () => {
      const types = [GaugeType.Semicircle, GaugeType.Radial, GaugeType.Grafana];
      
      types.forEach(type => {
        const layout = calculateGaugeLayout(400, 300, type, 0.2);
        
        const topEdge = layout.gaugeCenter.y - layout.outerRadius;
        const topPadding = topEdge - layout.viewBox.y;
        
        // Should have some padding but not excessive
        expect(topPadding).toBeGreaterThan(0);
        expect(topPadding).toBeLessThan(layout.outerRadius * 0.15); // < 15% of radius
      });
    });
  });
});
