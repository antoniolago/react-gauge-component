/**
 * Containment Tests - Verify gauges NEVER exceed their container bounds
 * 
 * These tests verify that for ANY given container size, the calculated
 * viewBox dimensions will fit within that container.
 * 
 * THE KEY INVARIANT:
 * viewBox.width <= parentWidth AND viewBox.height <= parentHeight
 */

import { calculateGaugeLayout, calculateOptimalRadius, calculateViewBox } from './coordinateSystem';
import { GaugeType } from '../types/GaugeComponentProps';

describe('Gauge Containment Tests', () => {
  // Test a wide variety of container sizes
  const testSizes = [
    [100, 100],
    [200, 100],  // wide
    [100, 200],  // tall
    [300, 200],
    [400, 300],
    [160, 180],  // typical card size
    [260, 160],  // gallery card size
    [350, 220],  // resize demo size
    [500, 400],
    [800, 600],
    [1200, 800],
  ];

  const gaugeTypes = [GaugeType.Semicircle, GaugeType.Radial, GaugeType.Grafana];

  describe('ViewBox must fit within parent container', () => {
    testSizes.forEach(([width, height]) => {
      gaugeTypes.forEach(type => {
        it(`${type} viewBox fits in ${width}x${height} container`, () => {
          const layout = calculateGaugeLayout(width, height, type, 0.2);
          
          // THE CRITICAL ASSERTION: viewBox must fit in container
          // Using small tolerance for floating point precision
          expect(layout.viewBox.width).toBeLessThanOrEqual(width + 0.01);
          expect(layout.viewBox.height).toBeLessThanOrEqual(height + 0.01);
          
          // Also verify the gauge content fits in the viewBox
          const gTop = layout.gaugeCenter.y - layout.outerRadius;
          const gBottom = layout.gaugeCenter.y + layout.outerRadius;
          const gLeft = layout.gaugeCenter.x - layout.outerRadius;
          const gRight = layout.gaugeCenter.x + layout.outerRadius;
          
          expect(gLeft).toBeGreaterThanOrEqual(0);
          expect(gTop).toBeGreaterThanOrEqual(0);
          expect(gRight).toBeLessThanOrEqual(layout.viewBox.width);
          // Note: For semicircle, bottom can exceed viewBox (only top half visible)
          if (type !== GaugeType.Semicircle) {
            expect(gBottom).toBeLessThanOrEqual(layout.viewBox.height);
          }
        });
      });
    });
  });

  describe('Radius calculations respect both dimensions', () => {
    it('should use height constraint when height is limiting (wide container)', () => {
      // In a 400x150 container, height should limit the radius
      const layout = calculateGaugeLayout(400, 150, GaugeType.Semicircle, 0.2);
      
      // ViewBox height must not exceed 150
      expect(layout.viewBox.height).toBeLessThanOrEqual(150 + 0.01);
      
      // For semicircle: height = (0.18 + 1 + 0.25) * radius = 1.43r
      // So radius <= 150/1.43 ≈ 105
      expect(layout.outerRadius).toBeLessThanOrEqual(106);
    });

    it('should use width constraint when width is limiting (tall container)', () => {
      // In a 150x400 container, width should limit the radius
      const layout = calculateGaugeLayout(150, 400, GaugeType.Semicircle, 0.2);
      
      // ViewBox width must not exceed 150
      expect(layout.viewBox.width).toBeLessThanOrEqual(150 + 0.01);
      
      // For semicircle: width = 2.2 * radius, so radius <= 150/2.2 ≈ 68
      expect(layout.outerRadius).toBeLessThanOrEqual(69);
    });

    it('should shrink radius when height decreases (even if width stays same)', () => {
      // Start with a 300x200 container
      const layout1 = calculateGaugeLayout(300, 200, GaugeType.Semicircle, 0.2);
      
      // Shrink height to 100 (width stays 300)
      const layout2 = calculateGaugeLayout(300, 100, GaugeType.Semicircle, 0.2);
      
      // The radius should decrease because height became more limiting
      expect(layout2.outerRadius).toBeLessThan(layout1.outerRadius);
      // Allow tiny floating point tolerance
      expect(layout2.viewBox.height).toBeLessThanOrEqual(100 + 0.01);
      expect(layout2.viewBox.width).toBeLessThanOrEqual(300 + 0.01);
    });

    it('should correctly identify which dimension is limiting', () => {
      // Wide container - height limits
      const wideLayout = calculateGaugeLayout(400, 100, GaugeType.Semicircle, 0.2);
      // ViewBox should fit within container
      expect(wideLayout.viewBox.height).toBeLessThanOrEqual(100 + 0.01);
      expect(wideLayout.viewBox.width).toBeLessThanOrEqual(400);
      
      // Tall container - width limits  
      const tallLayout = calculateGaugeLayout(100, 400, GaugeType.Semicircle, 0.2);
      // ViewBox should fit within container
      expect(tallLayout.viewBox.width).toBeLessThanOrEqual(100 + 0.01);
      expect(tallLayout.viewBox.height).toBeLessThanOrEqual(400);
    });

    it('should work correctly for radial in tight height containers', () => {
      const layout = calculateGaugeLayout(400, 200, GaugeType.Radial, 0.2);
      
      // ViewBox must fit
      expect(layout.viewBox.width).toBeLessThanOrEqual(400);
      expect(layout.viewBox.height).toBeLessThanOrEqual(200);
    });

    it('should work correctly for grafana in tight width containers', () => {
      const layout = calculateGaugeLayout(180, 300, GaugeType.Grafana, 0.2);
      
      // ViewBox must fit
      expect(layout.viewBox.width).toBeLessThanOrEqual(180);
      expect(layout.viewBox.height).toBeLessThanOrEqual(300);
    });
  });

  describe('Gallery card containment (specific sizes from UI)', () => {
    // These are the actual sizes used in the gallery
    it('should fit in 260x160 gallery card', () => {
      const layout = calculateGaugeLayout(260, 160, GaugeType.Semicircle, 0.2);
      
      // Allow tiny floating point tolerance
      expect(layout.viewBox.width).toBeLessThanOrEqual(260 + 0.01);
      expect(layout.viewBox.height).toBeLessThanOrEqual(160 + 0.01);
    });

    it('should fit in 220px height randomizer container', () => {
      const layout = calculateGaugeLayout(400, 220, GaugeType.Semicircle, 0.2);
      
      expect(layout.viewBox.width).toBeLessThanOrEqual(400);
      expect(layout.viewBox.height).toBeLessThanOrEqual(220);
    });

    it('should fit in resize demo initial size 350x220', () => {
      const layout = calculateGaugeLayout(350, 220, GaugeType.Semicircle, 0.2);
      
      expect(layout.viewBox.width).toBeLessThanOrEqual(350);
      expect(layout.viewBox.height).toBeLessThanOrEqual(220);
    });

    it('should fit in resize demo minimum size 180x120', () => {
      const layout = calculateGaugeLayout(180, 120, GaugeType.Semicircle, 0.2);
      
      // Allow tiny floating point tolerance
      expect(layout.viewBox.width).toBeLessThanOrEqual(180 + 0.01);
      expect(layout.viewBox.height).toBeLessThanOrEqual(120 + 0.01);
    });
  });

  describe('No dimension should ever exceed parent', () => {
    // Random stress test with many sizes
    it('should pass for 100 random container sizes', () => {
      for (let i = 0; i < 100; i++) {
        const width = 50 + Math.random() * 1000;
        const height = 50 + Math.random() * 800;
        
        gaugeTypes.forEach(type => {
          const layout = calculateGaugeLayout(width, height, type, 0.2);
          
          expect(layout.viewBox.width).toBeLessThanOrEqual(width + 0.001); // tiny tolerance for floating point
          expect(layout.viewBox.height).toBeLessThanOrEqual(height + 0.001);
        });
      }
    });
  });
});

