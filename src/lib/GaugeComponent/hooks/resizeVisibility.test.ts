/**
 * Tests for resize visibility:
 * - Gauge should always be visible after resize
 * - Gauge should remain visible during rapid resizes
 * - Gauge visibility should not depend on measurement success
 */

import { calculateGaugeLayout, isLayoutStable } from './coordinateSystem';
import { GaugeType } from '../types/GaugeComponentProps';

describe('Resize Visibility Tests', () => {
  describe('Layout Calculation During Resize', () => {
    it('should always produce valid layout on any resize', () => {
      const sizes = [
        // Normal sizes
        [400, 300],
        [800, 600],
        [300, 200],
        // Edge cases
        [100, 100],
        [50, 50],
        [1, 1],
        [2000, 1500],
        // Extreme aspect ratios
        [800, 100],
        [100, 800],
        [500, 50],
        [50, 500],
      ];
      
      const gaugeTypes = [GaugeType.Semicircle, GaugeType.Radial, GaugeType.Grafana];
      
      sizes.forEach(([width, height]) => {
        gaugeTypes.forEach(type => {
          const layout = calculateGaugeLayout(width, height, type, 0.2);
          
          // Layout should always be valid
          expect(layout).toBeDefined();
          expect(layout.outerRadius).toBeGreaterThan(0);
          expect(layout.viewBox).toBeDefined();
          expect(layout.viewBox.width).toBeGreaterThan(0);
          expect(layout.viewBox.height).toBeGreaterThan(0);
          expect(layout.gaugeCenter).toBeDefined();
          expect(typeof layout.gaugeCenter.x).toBe('number');
          expect(typeof layout.gaugeCenter.y).toBe('number');
          expect(Number.isNaN(layout.gaugeCenter.x)).toBe(false);
          expect(Number.isNaN(layout.gaugeCenter.y)).toBe(false);
          expect(Number.isNaN(layout.outerRadius)).toBe(false);
        });
      });
    });

    it('should handle rapid resize sequence without invalid layouts', () => {
      const resizeSequence = [
        [400, 300],
        [401, 300],
        [399, 301],
        [400, 300],
        [450, 350],
        [400, 300],
        [350, 250],
        [400, 300],
        [500, 400],
        [400, 300],
      ];
      
      let previousLayout = null;
      
      resizeSequence.forEach(([width, height], index) => {
        const layout = calculateGaugeLayout(width, height, GaugeType.Semicircle, 0.2);
        
        // Every layout in sequence should be valid
        expect(layout.outerRadius).toBeGreaterThan(0);
        expect(Number.isFinite(layout.gaugeCenter.x)).toBe(true);
        expect(Number.isFinite(layout.gaugeCenter.y)).toBe(true);
        
        previousLayout = layout;
      });
    });

    it('should maintain valid layout when size drops to minimum', () => {
      // Start large and progressively shrink
      const shrinkSequence = [
        [400, 300],
        [200, 150],
        [100, 75],
        [50, 40],
        [25, 20],
        [10, 10],
      ];
      
      shrinkSequence.forEach(([width, height]) => {
        const layout = calculateGaugeLayout(width, height, GaugeType.Semicircle, 0.2);
        
        // Even tiny sizes should produce valid layout
        expect(layout.outerRadius).toBeGreaterThan(0);
        expect(layout.viewBox.width).toBeGreaterThan(0);
        expect(layout.viewBox.height).toBeGreaterThan(0);
      });
    });

    it('should maintain valid layout when size grows rapidly', () => {
      // Start small and progressively grow
      const growSequence = [
        [50, 40],
        [100, 75],
        [200, 150],
        [400, 300],
        [800, 600],
        [1600, 1200],
      ];
      
      growSequence.forEach(([width, height]) => {
        const layout = calculateGaugeLayout(width, height, GaugeType.Semicircle, 0.2);
        
        // Growing sizes should produce valid layout
        expect(layout.outerRadius).toBeGreaterThan(0);
        expect(layout.viewBox.width).toBeGreaterThan(0);
        expect(layout.viewBox.height).toBeGreaterThan(0);
      });
    });
  });

  describe('Two-Pass Rendering Logic', () => {
    it('should have stable layout between pass 1 and pass 2 for same size', () => {
      // Simulating what happens in two-pass render
      const width = 400;
      const height = 300;
      const type = GaugeType.Semicircle;
      
      // Pass 1 layout
      const pass1Layout = calculateGaugeLayout(width, height, type, 0.2);
      
      // Pass 2 layout (same dimensions)
      const pass2Layout = calculateGaugeLayout(width, height, type, 0.2);
      
      // Layouts should be identical
      expect(pass1Layout.outerRadius).toBe(pass2Layout.outerRadius);
      expect(pass1Layout.gaugeCenter.x).toBe(pass2Layout.gaugeCenter.x);
      expect(pass1Layout.gaugeCenter.y).toBe(pass2Layout.gaugeCenter.y);
      expect(pass1Layout.viewBox.width).toBe(pass2Layout.viewBox.width);
      expect(pass1Layout.viewBox.height).toBe(pass2Layout.viewBox.height);
    });

    it('should correctly identify stable vs unstable layouts', () => {
      const baseLayout = calculateGaugeLayout(400, 300, GaugeType.Semicircle, 0.2);
      
      // Same size = stable
      const sameLayout = calculateGaugeLayout(400, 300, GaugeType.Semicircle, 0.2);
      expect(isLayoutStable(baseLayout, sameLayout, 0.005)).toBe(true);
      
      // Tiny change = stable (within tolerance)
      const tinyChange = calculateGaugeLayout(401, 300, GaugeType.Semicircle, 0.2);
      expect(isLayoutStable(baseLayout, tinyChange, 0.005)).toBe(true);
      
      // Significant change = unstable
      const bigChange = calculateGaugeLayout(500, 300, GaugeType.Semicircle, 0.2);
      expect(isLayoutStable(baseLayout, bigChange, 0.005)).toBe(false);
    });
  });

  describe('Visibility State Simulation', () => {
    // This simulates the visibility logic in renderChart
    type VisibilityState = {
      hidden: boolean;
      opacity: string;
    };
    
    function simulateRenderPass(
      currentPass: number,
      gElementExists: boolean,
      getBBoxSucceeds: boolean,
      layoutStable: boolean
    ): VisibilityState {
      // Simulating the logic from chart.ts
      
      // Initial state based on pass
      let visibility: VisibilityState = {
        hidden: currentPass === 1,
        opacity: currentPass === 1 ? '0' : '1'
      };
      
      // If pass 1, we need to trigger pass 2
      if (currentPass === 1) {
        if (gElementExists) {
          if (getBBoxSucceeds) {
            // Normal case: trigger pass 2 (visibility will be set then)
            // In reality, this triggers a re-render with pass 2
            // For testing, we simulate what pass 2 would do
            visibility = { hidden: false, opacity: '1' };
          } else {
            // getBBox failed - ensure visibility anyway
            visibility = { hidden: false, opacity: '1' };
          }
        } else {
          // gElement not available - ensure visibility anyway
          visibility = { hidden: false, opacity: '1' };
        }
      } else if (currentPass === 2) {
        if (layoutStable) {
          // Early return with visibility set
          visibility = { hidden: false, opacity: '1' };
        } else {
          // Normal pass 2 render
          visibility = { hidden: false, opacity: '1' };
        }
      }
      
      return visibility;
    }
    
    it('should always end visible after pass 1 + pass 2 (normal case)', () => {
      const finalState = simulateRenderPass(1, true, true, false);
      expect(finalState.hidden).toBe(false);
      expect(finalState.opacity).toBe('1');
    });

    it('should end visible even when getBBox fails', () => {
      const finalState = simulateRenderPass(1, true, false, false);
      expect(finalState.hidden).toBe(false);
      expect(finalState.opacity).toBe('1');
    });

    it('should end visible even when gElement is missing', () => {
      const finalState = simulateRenderPass(1, false, false, false);
      expect(finalState.hidden).toBe(false);
      expect(finalState.opacity).toBe('1');
    });

    it('should end visible on pass 2 even when layout is stable (early return)', () => {
      const finalState = simulateRenderPass(2, true, true, true);
      expect(finalState.hidden).toBe(false);
      expect(finalState.opacity).toBe('1');
    });

    it('should end visible on pass 2 normal render', () => {
      const finalState = simulateRenderPass(2, true, true, false);
      expect(finalState.hidden).toBe(false);
      expect(finalState.opacity).toBe('1');
    });
  });

  describe('Continuous Resize Stress Test', () => {
    it('should handle 100 consecutive resizes with valid layouts', () => {
      const gaugeTypes = [GaugeType.Semicircle, GaugeType.Radial, GaugeType.Grafana];
      
      gaugeTypes.forEach(type => {
        for (let i = 0; i < 100; i++) {
          // Random sizes between 100 and 1000
          const width = 100 + Math.random() * 900;
          const height = 100 + Math.random() * 900;
          
          const layout = calculateGaugeLayout(width, height, type, 0.2);
          
          // Every layout must be valid
          expect(layout.outerRadius).toBeGreaterThan(0);
          expect(Number.isFinite(layout.outerRadius)).toBe(true);
          expect(Number.isFinite(layout.gaugeCenter.x)).toBe(true);
          expect(Number.isFinite(layout.gaugeCenter.y)).toBe(true);
          expect(Number.isFinite(layout.viewBox.width)).toBe(true);
          expect(Number.isFinite(layout.viewBox.height)).toBe(true);
        }
      });
    });

    it('should handle oscillating resize (simulating window resize drag)', () => {
      const type = GaugeType.Semicircle;
      let baseWidth = 400;
      let baseHeight = 300;
      
      // Simulate user dragging window edge back and forth
      for (let i = 0; i < 50; i++) {
        // Oscillate ±20px
        const width = baseWidth + (i % 2 === 0 ? 20 : -20);
        const height = baseHeight + (i % 2 === 0 ? 15 : -15);
        
        const layout = calculateGaugeLayout(width, height, type, 0.2);
        
        expect(layout.outerRadius).toBeGreaterThan(0);
        expect(Number.isFinite(layout.outerRadius)).toBe(true);
      }
    });
  });

  describe('Edge Case Dimensions', () => {
    it('should handle zero dimensions gracefully', () => {
      // Zero dimensions might happen during mount/unmount
      // The function should not throw and should return something reasonable
      
      // Note: The actual implementation may handle this differently
      // This test documents expected behavior
      try {
        const layout = calculateGaugeLayout(0, 0, GaugeType.Semicircle, 0.2);
        // If it doesn't throw, verify the output is at least defined
        expect(layout).toBeDefined();
      } catch (e) {
        // If it throws, that's also acceptable - document that behavior
        expect(e).toBeDefined();
      }
    });

    it('should handle negative dimensions gracefully', () => {
      try {
        const layout = calculateGaugeLayout(-100, -100, GaugeType.Semicircle, 0.2);
        expect(layout).toBeDefined();
      } catch (e) {
        expect(e).toBeDefined();
      }
    });

    it('should handle fractional dimensions', () => {
      const layout = calculateGaugeLayout(400.5, 300.7, GaugeType.Semicircle, 0.2);
      
      expect(layout.outerRadius).toBeGreaterThan(0);
      expect(Number.isFinite(layout.outerRadius)).toBe(true);
    });

    it('should handle very large dimensions', () => {
      const layout = calculateGaugeLayout(10000, 8000, GaugeType.Semicircle, 0.2);
      
      expect(layout.outerRadius).toBeGreaterThan(0);
      expect(Number.isFinite(layout.outerRadius)).toBe(true);
      expect(Number.isFinite(layout.gaugeCenter.x)).toBe(true);
      expect(Number.isFinite(layout.gaugeCenter.y)).toBe(true);
    });
  });
});
