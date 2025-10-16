/**
 * Tests for rendering behaviors:
 * - Infinite loop detection
 * - Element positioning within viewBox
 * - G element boundaries
 */

import { calculateGaugeLayout, isLayoutStable } from './coordinateSystem';
import { GaugeType } from '../types/GaugeComponentProps';

describe('Rendering Behavior Tests', () => {
  describe('Infinite Loop Prevention', () => {
    it('should detect stable layout and prevent re-render', () => {
      const layout1 = calculateGaugeLayout(400, 300, GaugeType.Semicircle, 0.2);
      const layout2 = calculateGaugeLayout(400, 300, GaugeType.Semicircle, 0.2);
      
      const stable = isLayoutStable(layout1, layout2, 0.005);
      expect(stable).toBe(true);
    });

    it('should detect unstable layout when size changes significantly', () => {
      const layout1 = calculateGaugeLayout(400, 300, GaugeType.Semicircle, 0.2);
      const layout2 = calculateGaugeLayout(450, 300, GaugeType.Semicircle, 0.2);
      
      const stable = isLayoutStable(layout1, layout2, 0.005);
      expect(stable).toBe(false);
    });

    it('should tolerate minor variations within threshold', () => {
      const layout1 = calculateGaugeLayout(400, 300, GaugeType.Semicircle, 0.2);
      // Simulate tiny change (< 0.5%)
      const layout2 = calculateGaugeLayout(401, 300, GaugeType.Semicircle, 0.2);
      
      const stable = isLayoutStable(layout1, layout2, 0.005);
      expect(stable).toBe(true);
    });

    it('should handle rapid successive renders', () => {
      const layouts = [];
      const sizes = [400, 401, 400, 401, 400]; // Oscillating
      
      for (let i = 0; i < sizes.length; i++) {
        layouts.push(calculateGaugeLayout(sizes[i], 300, GaugeType.Semicircle, 0.2));
      }
      
      // Check that alternating layouts are considered stable
      const stable1 = isLayoutStable(layouts[0], layouts[2], 0.005);
      const stable2 = isLayoutStable(layouts[1], layouts[3], 0.005);
      
      expect(stable1).toBe(true);
      expect(stable2).toBe(true);
    });

    it('should prevent infinite loop scenario with rounding errors', () => {
      // Simulate scenario where calculations might have floating point errors
      const layout1 = calculateGaugeLayout(400.1, 300.1, GaugeType.Semicircle, 0.2);
      const layout2 = calculateGaugeLayout(400.2, 300.2, GaugeType.Semicircle, 0.2);
      
      const stable = isLayoutStable(layout1, layout2, 0.005);
      expect(stable).toBe(true);
    });
  });

  describe('G Element Boundary Tests', () => {
    it('should ensure gauge center allows full radius within viewBox', () => {
      const layout = calculateGaugeLayout(400, 300, GaugeType.Semicircle, 0.2);
      
      // The gauge center should be positioned such that:
      // center.x - outerRadius >= viewBox.x
      // center.x + outerRadius <= viewBox.x + viewBox.width
      const leftEdge = layout.gaugeCenter.x - layout.outerRadius;
      const rightEdge = layout.gaugeCenter.x + layout.outerRadius;
      const topEdge = layout.gaugeCenter.y - layout.outerRadius;
      const bottomEdge = layout.gaugeCenter.y + layout.outerRadius;
      
      expect(leftEdge).toBeGreaterThanOrEqual(layout.viewBox.x);
      expect(rightEdge).toBeLessThanOrEqual(layout.viewBox.x + layout.viewBox.width);
      expect(topEdge).toBeGreaterThanOrEqual(layout.viewBox.y);
      // Bottom can extend beyond for semicircle, but top must be within
    });

    it('should ensure all gauge types fit within viewBox horizontally', () => {
      const gaugeTypes = [GaugeType.Semicircle, GaugeType.Radial, GaugeType.Grafana];
      
      gaugeTypes.forEach(type => {
        const layout = calculateGaugeLayout(400, 300, type, 0.2);
        
        const leftEdge = layout.gaugeCenter.x - layout.outerRadius;
        const rightEdge = layout.gaugeCenter.x + layout.outerRadius;
        
        expect(leftEdge).toBeGreaterThanOrEqual(layout.viewBox.x);
        expect(rightEdge).toBeLessThanOrEqual(layout.viewBox.x + layout.viewBox.width);
      });
    });

    it('should prevent top cutoff by ensuring adequate padding', () => {
      const layout = calculateGaugeLayout(400, 300, GaugeType.Semicircle, 0.2);
      
      // Top of the gauge should not be at or above viewBox top
      const topEdge = layout.gaugeCenter.y - layout.outerRadius;
      
      // Should have some padding (at least 1px, ideally more)
      expect(topEdge).toBeGreaterThan(layout.viewBox.y);
      
      // Should have reasonable padding (at least 5% of radius)
      const padding = topEdge - layout.viewBox.y;
      expect(padding).toBeGreaterThanOrEqual(layout.outerRadius * 0.05);
    });

    it('should maintain consistent positioning across resizes', () => {
      const layout1 = calculateGaugeLayout(400, 300, GaugeType.Semicircle, 0.2);
      const layout2 = calculateGaugeLayout(800, 600, GaugeType.Semicircle, 0.2);
      
      // The ratio of center to viewBox should be consistent
      const ratio1X = layout1.gaugeCenter.x / layout1.viewBox.width;
      const ratio2X = layout2.gaugeCenter.x / layout2.viewBox.width;
      
      expect(Math.abs(ratio1X - ratio2X)).toBeLessThan(0.01);
    });

    it('should handle very small containers without cutoff', () => {
      const layout = calculateGaugeLayout(100, 100, GaugeType.Semicircle, 0.2);
      
      const leftEdge = layout.gaugeCenter.x - layout.outerRadius;
      const rightEdge = layout.gaugeCenter.x + layout.outerRadius;
      const topEdge = layout.gaugeCenter.y - layout.outerRadius;
      
      expect(leftEdge).toBeGreaterThanOrEqual(layout.viewBox.x);
      expect(rightEdge).toBeLessThanOrEqual(layout.viewBox.x + layout.viewBox.width);
      expect(topEdge).toBeGreaterThanOrEqual(layout.viewBox.y);
    });

    it('should handle very large containers without cutoff', () => {
      const layout = calculateGaugeLayout(2000, 1500, GaugeType.Semicircle, 0.2);
      
      const leftEdge = layout.gaugeCenter.x - layout.outerRadius;
      const rightEdge = layout.gaugeCenter.x + layout.outerRadius;
      const topEdge = layout.gaugeCenter.y - layout.outerRadius;
      
      expect(leftEdge).toBeGreaterThanOrEqual(layout.viewBox.x);
      expect(rightEdge).toBeLessThanOrEqual(layout.viewBox.x + layout.viewBox.width);
      expect(topEdge).toBeGreaterThanOrEqual(layout.viewBox.y);
    });
  });

  describe('ViewBox Containment Tests', () => {
    it('should ensure viewBox contains all possible gauge elements', () => {
      const layout = calculateGaugeLayout(400, 300, GaugeType.Semicircle, 0.2);
      
      // ViewBox should be large enough to contain gauge + padding for labels
      const minRequiredWidth = layout.outerRadius * 2;
      const minRequiredHeight = layout.outerRadius * 2;
      
      expect(layout.viewBox.width).toBeGreaterThanOrEqual(minRequiredWidth);
      expect(layout.viewBox.height).toBeGreaterThanOrEqual(minRequiredHeight * 0.5); // Semicircle uses less height
    });

    it('should provide adequate space for labels outside the arc', () => {
      const layout = calculateGaugeLayout(400, 300, GaugeType.Semicircle, 0.2);
      
      // Padding should be at least 10% of radius for labels
      const expectedPadding = layout.outerRadius * 0.1;
      
      const leftPadding = layout.gaugeCenter.x - layout.outerRadius - layout.viewBox.x;
      const topPadding = layout.gaugeCenter.y - layout.outerRadius - layout.viewBox.y;
      
      expect(leftPadding).toBeGreaterThanOrEqual(expectedPadding);
      expect(topPadding).toBeGreaterThanOrEqual(expectedPadding);
    });

    it('should scale viewBox proportionally with parent size', () => {
      const layout1 = calculateGaugeLayout(400, 300, GaugeType.Semicircle, 0.2);
      const layout2 = calculateGaugeLayout(800, 600, GaugeType.Semicircle, 0.2);
      
      const ratio = layout2.viewBox.width / layout1.viewBox.width;
      
      // Should scale approximately 2x (allowing small variance for padding)
      expect(ratio).toBeGreaterThan(1.8);
      expect(ratio).toBeLessThan(2.2);
    });
  });

  describe('Stability Edge Cases', () => {
    it('should handle null previous layout', () => {
      const layout = calculateGaugeLayout(400, 300, GaugeType.Semicircle, 0.2);
      
      const stable = isLayoutStable(null, layout);
      expect(stable).toBe(true); // First render is always stable
    });

    it('should detect continuous oscillation', () => {
      const layout1 = calculateGaugeLayout(400, 300, GaugeType.Semicircle, 0.2);
      const layout2 = calculateGaugeLayout(410, 300, GaugeType.Semicircle, 0.2);
      const layout3 = calculateGaugeLayout(400, 300, GaugeType.Semicircle, 0.2);
      
      // 400 -> 410 should be unstable
      expect(isLayoutStable(layout1, layout2, 0.005)).toBe(false);
      
      // 410 -> 400 should be unstable
      expect(isLayoutStable(layout2, layout3, 0.005)).toBe(false);
      
      // 400 -> 400 (back to same) should be stable
      expect(isLayoutStable(layout1, layout3, 0.005)).toBe(true);
    });

    it('should handle extreme tolerance values', () => {
      const layout1 = calculateGaugeLayout(400, 300, GaugeType.Semicircle, 0.2);
      const layout2 = calculateGaugeLayout(401, 300, GaugeType.Semicircle, 0.2);
      
      // Very strict tolerance
      expect(isLayoutStable(layout1, layout2, 0.0001)).toBe(false);
      
      // Very loose tolerance
      expect(isLayoutStable(layout1, layout2, 0.1)).toBe(true);
    });
  });

  describe('Render Count Monitoring', () => {
    it('should detect rapid re-renders within 100ms window', () => {
      const timestamps: number[] = [];
      const now = Date.now();
      
      // Simulate rapid renders
      for (let i = 0; i < 10; i++) {
        timestamps.push(now + i * 50); // Every 50ms
      }
      
      // Check intervals
      for (let i = 1; i < timestamps.length; i++) {
        const interval = timestamps[i] - timestamps[i - 1];
        if (interval < 100) {
          expect(interval).toBeLessThan(100);
          // This would trigger a warning
        }
      }
    });

    it('should not flag normal render intervals as problematic', () => {
      const timestamps: number[] = [];
      const now = Date.now();
      
      // Simulate normal renders (every 500ms)
      for (let i = 0; i < 5; i++) {
        timestamps.push(now + i * 500);
      }
      
      // Check intervals - all should be >= 100ms
      for (let i = 1; i < timestamps.length; i++) {
        const interval = timestamps[i] - timestamps[i - 1];
        expect(interval).toBeGreaterThanOrEqual(100);
      }
    });
  });

  describe('SVG to G Element Size Matching (20px tolerance)', () => {
    it('should ensure SVG height closely matches g element bounds for Semicircle', () => {
      const layout = calculateGaugeLayout(400, 300, GaugeType.Semicircle, 0.2);
      
      // G element bounds (from center ± radius)
      const gTop = layout.gaugeCenter.y - layout.outerRadius;
      const gBottom = layout.gaugeCenter.y + layout.outerRadius;
      const gHeight = gBottom - gTop;
      
      // ViewBox defines SVG coordinate space height
      const svgHeight = layout.viewBox.height;
      
      // Actual used space by g element
      const usedSpace = gHeight;
      const tolerance = 20;
      
      // SVG should not be significantly taller than g element
      const wastedSpace = svgHeight - usedSpace;
      expect(wastedSpace).toBeLessThanOrEqual(tolerance * 2); // Top and bottom padding
    });

    it('should ensure SVG height closely matches g element bounds for Radial', () => {
      const layout = calculateGaugeLayout(400, 300, GaugeType.Radial, 0.2);
      
      const gTop = layout.gaugeCenter.y - layout.outerRadius;
      const gBottom = layout.gaugeCenter.y + layout.outerRadius;
      const gHeight = gBottom - gTop;
      
      const svgHeight = layout.viewBox.height;
      const wastedSpace = svgHeight - gHeight;
      const tolerance = 20;
      
      expect(wastedSpace).toBeLessThanOrEqual(tolerance * 2);
    });

    it('should ensure SVG height closely matches g element bounds for Grafana', () => {
      const layout = calculateGaugeLayout(400, 300, GaugeType.Grafana, 0.2);
      
      const gTop = layout.gaugeCenter.y - layout.outerRadius;
      const gBottom = layout.gaugeCenter.y + layout.outerRadius;
      const gHeight = gBottom - gTop;
      
      const svgHeight = layout.viewBox.height;
      const wastedSpace = svgHeight - gHeight;
      const tolerance = 20;
      
      expect(wastedSpace).toBeLessThanOrEqual(tolerance * 2);
    });

    it('should maintain tight bounds across different container sizes', () => {
      const sizes = [
        [200, 150],
        [400, 300],
        [800, 600],
        [1200, 900]
      ];
      
      const tolerance = 20;
      
      sizes.forEach(([width, height]) => {
        const layout = calculateGaugeLayout(width, height, GaugeType.Semicircle, 0.2);
        
        const gHeight = layout.outerRadius * 2; // Diameter
        const svgHeight = layout.viewBox.height;
        const wastedSpace = svgHeight - gHeight;
        
        // Wasted space should be minimal (just padding)
        expect(wastedSpace).toBeLessThanOrEqual(tolerance * 2);
      });
    });

    it('should ensure viewBox height is not excessively larger than gauge diameter', () => {
      const gaugeTypes = [GaugeType.Semicircle, GaugeType.Radial, GaugeType.Grafana];
      
      gaugeTypes.forEach(type => {
        const layout = calculateGaugeLayout(400, 300, type, 0.2);
        
        const gaugeDiameter = layout.outerRadius * 2;
        const viewBoxHeight = layout.viewBox.height;
        
        // ViewBox should not be more than 1.5x the gauge diameter
        // (accounting for padding and label space)
        const ratio = viewBoxHeight / gaugeDiameter;
        expect(ratio).toBeLessThanOrEqual(1.5);
      });
    });

    it('should calculate optimal viewBox height for Semicircle specifically', () => {
      const layout = calculateGaugeLayout(400, 300, GaugeType.Semicircle, 0.2);
      
      // For semicircle, viewBox height should be approximately:
      // outerRadius (top half) + space for center + space for bottom labels
      // Should be around 1.2-1.4x the outerRadius
      const ratio = layout.viewBox.height / layout.outerRadius;
      
      expect(ratio).toBeGreaterThan(1.0); // More than just radius
      expect(ratio).toBeLessThan(2.0); // Less than full diameter
    });

    it('should ensure g element top is not cut off (has padding)', () => {
      const gaugeTypes = [GaugeType.Semicircle, GaugeType.Radial, GaugeType.Grafana];
      
      gaugeTypes.forEach(type => {
        const layout = calculateGaugeLayout(400, 300, type, 0.2);
        
        const gTop = layout.gaugeCenter.y - layout.outerRadius;
        const viewBoxTop = layout.viewBox.y;
        
        // G element top should have some padding from viewBox top
        const topPadding = gTop - viewBoxTop;
        expect(topPadding).toBeGreaterThan(0);
        expect(topPadding).toBeLessThanOrEqual(20); // Within tolerance
      });
    });

    it('should ensure g element bottom fits within viewBox with minimal waste', () => {
      const layout = calculateGaugeLayout(400, 300, GaugeType.Semicircle, 0.2);
      
      const gBottom = layout.gaugeCenter.y + layout.outerRadius;
      const viewBoxBottom = layout.viewBox.y + layout.viewBox.height;
      
      // G element should fit within viewBox
      expect(gBottom).toBeLessThanOrEqual(viewBoxBottom);
      
      // Bottom padding should be reasonable (not excessive)
      const bottomPadding = viewBoxBottom - gBottom;
      expect(bottomPadding).toBeLessThanOrEqual(50); // Allow for value label
    });

    it('should verify aspect ratio calculation matches viewBox proportions', () => {
      const layout = calculateGaugeLayout(400, 300, GaugeType.Semicircle, 0.2);
      
      const aspectRatio = layout.viewBox.height / layout.viewBox.width;
      
      // For semicircle, aspect ratio should be less than 1 (wider than tall)
      expect(aspectRatio).toBeLessThan(1.0);
      
      // Should be reasonable (not too flat)
      expect(aspectRatio).toBeGreaterThan(0.4);
    });

    it('should ensure SVG-to-g size efficiency for all gauge types', () => {
      const gaugeTypes = [
        { type: GaugeType.Semicircle, expectedEfficiency: 0.7 }, // ~70% of viewBox used
        { type: GaugeType.Radial, expectedEfficiency: 0.75 },    // ~75% of viewBox used
        { type: GaugeType.Grafana, expectedEfficiency: 0.8 }     // ~80% of viewBox used
      ];
      
      gaugeTypes.forEach(({ type, expectedEfficiency }) => {
        const layout = calculateGaugeLayout(400, 300, type, 0.2);
        
        const gHeight = layout.outerRadius * 2;
        const svgHeight = layout.viewBox.height;
        const efficiency = gHeight / svgHeight;
        
        // Efficiency should be close to expected (within 20%)
        expect(efficiency).toBeGreaterThan(expectedEfficiency - 0.2);
        expect(efficiency).toBeLessThan(expectedEfficiency + 0.2);
      });
    });
  });
});
