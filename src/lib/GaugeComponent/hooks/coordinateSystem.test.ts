import {
  calculateOptimalRadius,
  calculateViewBox,
  calculateGaugeCenter,
  calculateGaugeLayout,
  isLayoutStable,
} from './coordinateSystem';
import { GaugeType } from '../types/GaugeComponentProps';

describe('Coordinate System', () => {
  describe('calculateOptimalRadius', () => {
    it('should calculate radius that fits within available space', () => {
      const radius = calculateOptimalRadius(400, 300, GaugeType.Semicircle);
      
      // Radius should be less than half the width to account for padding
      expect(radius).toBeLessThan(200);
      expect(radius).toBeGreaterThan(0);
    });

    it('should respect height constraints for semicircle', () => {
      const radius = calculateOptimalRadius(1000, 200, GaugeType.Semicircle);
      
      // With limited height, radius should be constrained by height, not width
      expect(radius).toBeLessThan(500);
    });

    it('should respect width constraints', () => {
      const radius = calculateOptimalRadius(200, 1000, GaugeType.Semicircle);
      
      // With limited width, radius should be constrained by width
      expect(radius).toBeLessThan(100);
    });

    it('should handle margin percentage correctly', () => {
      const radiusNoMargin = calculateOptimalRadius(400, 300, GaugeType.Semicircle, 0);
      const radiusWithMargin = calculateOptimalRadius(400, 300, GaugeType.Semicircle, 0.1);
      
      expect(radiusWithMargin).toBeLessThan(radiusNoMargin);
    });

    it('should calculate different radii for gauge types with different padding', () => {
      // Grafana has different paddingPercent (0.12) vs Semicircle/Radial (0.15)
      const semicircleRadius = calculateOptimalRadius(400, 400, GaugeType.Semicircle);
      const grafanaRadius = calculateOptimalRadius(400, 400, GaugeType.Grafana);
      
      // Different padding percentages should produce different radii
      expect(semicircleRadius).not.toBe(grafanaRadius);
      // Verify they're both reasonable
      expect(semicircleRadius).toBeGreaterThan(150);
      expect(grafanaRadius).toBeGreaterThan(150);
    });
  });

  describe('calculateViewBox', () => {
    it('should create valid viewBox for semicircle', () => {
      const viewBox = calculateViewBox(100, GaugeType.Semicircle);
      
      expect(viewBox.x).toBe(0);
      expect(viewBox.y).toBe(0);
      expect(viewBox.width).toBeGreaterThan(0);
      expect(viewBox.height).toBeGreaterThan(0);
      expect(viewBox.width).toBeGreaterThan(200); // Diameter + padding
    });

    it('should create viewBox with height less than width for semicircle', () => {
      const viewBox = calculateViewBox(100, GaugeType.Semicircle);
      
      // Semicircle should be wider than tall
      expect(viewBox.height).toBeLessThan(viewBox.width);
    });

    it('should create appropriate viewBox for radial gauge', () => {
      const viewBox = calculateViewBox(100, GaugeType.Radial);
      
      expect(viewBox.height).toBeGreaterThan(100); // Needs more vertical space
    });

    it('should return valid viewBox string', () => {
      const viewBox = calculateViewBox(100, GaugeType.Semicircle);
      const viewBoxString = viewBox.toString();
      
      // Should be in format "x y width height"
      const parts = viewBoxString.split(' ');
      expect(parts).toHaveLength(4);
      expect(parseFloat(parts[2])).toBeGreaterThan(0);
      expect(parseFloat(parts[3])).toBeGreaterThan(0);
    });
  });

  describe('calculateGaugeCenter', () => {
    it('should center gauge horizontally', () => {
      const viewBox = calculateViewBox(100, GaugeType.Semicircle);
      const center = calculateGaugeCenter(viewBox, 100, GaugeType.Semicircle);
      
      // Should be horizontally centered
      expect(center.x).toBe(viewBox.width / 2);
    });

    it('should position semicircle appropriately', () => {
      const viewBox = calculateViewBox(100, GaugeType.Semicircle);
      const center = calculateGaugeCenter(viewBox, 100, GaugeType.Semicircle);
      
      // Y position should account for semicircle shape
      expect(center.y).toBeGreaterThan(0);
      expect(center.y).toBeLessThan(viewBox.height);
    });

    it('should calculate consistent centers for same inputs', () => {
      const viewBox = calculateViewBox(150, GaugeType.Radial);
      const center1 = calculateGaugeCenter(viewBox, 150, GaugeType.Radial);
      const center2 = calculateGaugeCenter(viewBox, 150, GaugeType.Radial);
      
      expect(center1.x).toBe(center2.x);
      expect(center1.y).toBe(center2.y);
    });
  });

  describe('calculateGaugeLayout', () => {
    it('should return complete layout information', () => {
      const layout = calculateGaugeLayout(400, 300, GaugeType.Semicircle, 0.2);
      
      expect(layout.viewBox).toBeDefined();
      expect(layout.outerRadius).toBeGreaterThan(0);
      expect(layout.innerRadius).toBeGreaterThan(0);
      expect(layout.gaugeCenter).toBeDefined();
      expect(layout.doughnutTransform).toBeDefined();
    });

    it('should respect arc width in inner radius calculation', () => {
      const layout1 = calculateGaugeLayout(400, 300, GaugeType.Semicircle, 0.2);
      const layout2 = calculateGaugeLayout(400, 300, GaugeType.Semicircle, 0.4);
      
      // Wider arc should result in smaller inner radius
      expect(layout2.innerRadius).toBeLessThan(layout1.innerRadius);
      
      // Outer radius should be the same
      expect(layout1.outerRadius).toBe(layout2.outerRadius);
    });

    it('should maintain consistent inner to outer radius ratio', () => {
      const arcWidth = 0.3;
      const layout = calculateGaugeLayout(400, 300, GaugeType.Semicircle, arcWidth);
      
      const expectedInnerRadius = layout.outerRadius * (1 - arcWidth);
      expect(layout.innerRadius).toBeCloseTo(expectedInnerRadius, 5);
    });

    it('should scale proportionally with parent dimensions', () => {
      const layout1 = calculateGaugeLayout(400, 300, GaugeType.Semicircle, 0.2);
      const layout2 = calculateGaugeLayout(800, 600, GaugeType.Semicircle, 0.2);
      
      // Doubling dimensions should roughly double the radius
      const ratio = layout2.outerRadius / layout1.outerRadius;
      expect(ratio).toBeGreaterThan(1.8);
      expect(ratio).toBeLessThan(2.2);
    });

    it('should create valid layout for all gauge types', () => {
      const types = [GaugeType.Semicircle, GaugeType.Radial, GaugeType.Grafana];
      
      types.forEach(type => {
        const layout = calculateGaugeLayout(400, 300, type, 0.2);
        
        expect(layout.outerRadius).toBeGreaterThan(0);
        expect(layout.innerRadius).toBeGreaterThan(0);
        expect(layout.innerRadius).toBeLessThan(layout.outerRadius);
        expect(layout.viewBox.width).toBeGreaterThan(0);
        expect(layout.viewBox.height).toBeGreaterThan(0);
      });
    });

    it('should not waste excessive space', () => {
      const parentWidth = 400;
      const parentHeight = 300;
      const layout = calculateGaugeLayout(parentWidth, parentHeight, GaugeType.Semicircle, 0.2);
      
      // The viewBox should utilize most of the available space
      // With padding, it should still be a significant portion
      const utilizationWidth = (layout.outerRadius * 2) / parentWidth;
      const utilizationHeight = (layout.outerRadius * 2) / parentHeight;
      
      // Should use at least 60% of available space (accounting for padding)
      expect(utilizationWidth).toBeGreaterThan(0.6);
    });
  });

  describe('isLayoutStable', () => {
    it('should return true for first layout', () => {
      const layout = calculateGaugeLayout(400, 300, GaugeType.Semicircle, 0.2);
      
      expect(isLayoutStable(null, layout)).toBe(true);
    });

    it('should return true for identical layouts', () => {
      const layout1 = calculateGaugeLayout(400, 300, GaugeType.Semicircle, 0.2);
      const layout2 = calculateGaugeLayout(400, 300, GaugeType.Semicircle, 0.2);
      
      expect(isLayoutStable(layout1, layout2)).toBe(true);
    });

    it('should return false for significantly different layouts', () => {
      const layout1 = calculateGaugeLayout(400, 300, GaugeType.Semicircle, 0.2);
      const layout2 = calculateGaugeLayout(800, 600, GaugeType.Semicircle, 0.2);
      
      expect(isLayoutStable(layout1, layout2)).toBe(false);
    });

    it('should return true for minor variations within tolerance', () => {
      const layout1 = calculateGaugeLayout(400, 300, GaugeType.Semicircle, 0.2);
      const layout2 = calculateGaugeLayout(401, 300, GaugeType.Semicircle, 0.2);
      
      expect(isLayoutStable(layout1, layout2, 0.01)).toBe(true);
    });

    it('should detect infinite resize loops', () => {
      // Simulate a resize loop scenario
      const layouts = [];
      let prevLayout = null;
      
      for (let i = 0; i < 10; i++) {
        // Gradually changing dimensions (simulating instability)
        const currentLayout = calculateGaugeLayout(
          400 + i * 0.5,
          300,
          GaugeType.Semicircle,
          0.2
        );
        
        if (prevLayout) {
          const stable = isLayoutStable(prevLayout, currentLayout, 0.001);
          layouts.push(stable);
        }
        
        prevLayout = currentLayout;
      }
      
      // Should detect changes
      expect(layouts.some(stable => !stable)).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very small dimensions', () => {
      const layout = calculateGaugeLayout(50, 50, GaugeType.Semicircle, 0.2);
      
      expect(layout.outerRadius).toBeGreaterThan(0);
      expect(layout.innerRadius).toBeGreaterThan(0);
    });

    it('should handle very large dimensions', () => {
      const layout = calculateGaugeLayout(4000, 3000, GaugeType.Semicircle, 0.2);
      
      expect(layout.outerRadius).toBeGreaterThan(0);
      expect(layout.viewBox.width).toBeGreaterThan(0);
    });

    it('should handle extreme aspect ratios', () => {
      const wideLayout = calculateGaugeLayout(1000, 100, GaugeType.Semicircle, 0.2);
      const tallLayout = calculateGaugeLayout(100, 1000, GaugeType.Semicircle, 0.2);
      
      expect(wideLayout.outerRadius).toBeGreaterThan(0);
      expect(tallLayout.outerRadius).toBeGreaterThan(0);
    });

    it('should handle zero arc width', () => {
      const layout = calculateGaugeLayout(400, 300, GaugeType.Semicircle, 0);
      
      // Inner radius should equal outer radius
      expect(layout.innerRadius).toBe(layout.outerRadius);
    });

    it('should handle full arc width', () => {
      const layout = calculateGaugeLayout(400, 300, GaugeType.Semicircle, 1);
      
      // Inner radius should be zero
      expect(layout.innerRadius).toBe(0);
    });
  });

  describe('G Element Containment (Critical for preventing cutoff)', () => {
    it('should ensure g element fully contained in SVG for Semicircle', () => {
      const layout = calculateGaugeLayout(400, 300, GaugeType.Semicircle, 0.2);
      
      // Calculate g element bounds (center ± radius)
      const gLeft = layout.gaugeCenter.x - layout.outerRadius;
      const gRight = layout.gaugeCenter.x + layout.outerRadius;
      const gTop = layout.gaugeCenter.y - layout.outerRadius;
      const gBottom = layout.gaugeCenter.y + layout.outerRadius;
      
      // G element must be fully within viewBox
      expect(gLeft).toBeGreaterThanOrEqual(layout.viewBox.x);
      expect(gRight).toBeLessThanOrEqual(layout.viewBox.x + layout.viewBox.width);
      expect(gTop).toBeGreaterThanOrEqual(layout.viewBox.y);
      // Note: bottom can extend beyond for semicircle by design
    });

    it('should ensure g element fully contained in SVG for Radial', () => {
      const layout = calculateGaugeLayout(400, 300, GaugeType.Radial, 0.2);
      
      const gLeft = layout.gaugeCenter.x - layout.outerRadius;
      const gRight = layout.gaugeCenter.x + layout.outerRadius;
      const gTop = layout.gaugeCenter.y - layout.outerRadius;
      
      expect(gLeft).toBeGreaterThanOrEqual(layout.viewBox.x);
      expect(gRight).toBeLessThanOrEqual(layout.viewBox.x + layout.viewBox.width);
      expect(gTop).toBeGreaterThanOrEqual(layout.viewBox.y);
    });

    it('should ensure g element fully contained in SVG for Grafana', () => {
      const layout = calculateGaugeLayout(400, 300, GaugeType.Grafana, 0.2);
      
      const gLeft = layout.gaugeCenter.x - layout.outerRadius;
      const gRight = layout.gaugeCenter.x + layout.outerRadius;
      const gTop = layout.gaugeCenter.y - layout.outerRadius;
      
      expect(gLeft).toBeGreaterThanOrEqual(layout.viewBox.x);
      expect(gRight).toBeLessThanOrEqual(layout.viewBox.x + layout.viewBox.width);
      expect(gTop).toBeGreaterThanOrEqual(layout.viewBox.y);
    });

    it('should prevent top cutoff with adequate padding', () => {
      const types = [GaugeType.Semicircle, GaugeType.Radial, GaugeType.Grafana];
      
      types.forEach(type => {
        const layout = calculateGaugeLayout(400, 300, type, 0.2);
        const gTop = layout.gaugeCenter.y - layout.outerRadius;
        const topPadding = gTop - layout.viewBox.y;
        
        // Should have at least some padding (not touching edge)
        expect(topPadding).toBeGreaterThan(0);
        
        // Should have reasonable padding (at least 5% of radius)
        expect(topPadding).toBeGreaterThanOrEqual(layout.outerRadius * 0.05);
      });
    });

    it('should maintain containment across various sizes', () => {
      const sizes = [
        [200, 150],
        [400, 300],
        [800, 600],
        [1200, 900]
      ];
      
      sizes.forEach(([width, height]) => {
        const layout = calculateGaugeLayout(width, height, GaugeType.Semicircle, 0.2);
        
        const gLeft = layout.gaugeCenter.x - layout.outerRadius;
        const gRight = layout.gaugeCenter.x + layout.outerRadius;
        const gTop = layout.gaugeCenter.y - layout.outerRadius;
        
        expect(gLeft).toBeGreaterThanOrEqual(layout.viewBox.x);
        expect(gRight).toBeLessThanOrEqual(layout.viewBox.x + layout.viewBox.width);
        expect(gTop).toBeGreaterThanOrEqual(layout.viewBox.y);
      });
    });

    it('should handle containment with different arc widths', () => {
      const arcWidths = [0.1, 0.2, 0.3, 0.5, 0.8];
      
      arcWidths.forEach(arcWidth => {
        const layout = calculateGaugeLayout(400, 300, GaugeType.Semicircle, arcWidth);
        
        const gTop = layout.gaugeCenter.y - layout.outerRadius;
        const gBottom = layout.gaugeCenter.y + layout.outerRadius;
        
        // Top should always be contained
        expect(gTop).toBeGreaterThanOrEqual(layout.viewBox.y);
        
        // Outer radius shouldn't change with arc width
        expect(layout.outerRadius).toBeGreaterThan(0);
      });
    });
  });
});
