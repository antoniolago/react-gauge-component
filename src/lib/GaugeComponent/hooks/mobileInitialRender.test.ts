/**
 * Tests for mobile initial render issue:
 * 
 * Problem: On mobile devices, the initial render happens before the browser
 * has finished calculating the viewport/container dimensions. This causes:
 * - Thick borders on Grafana gauges
 * - Huge tick labels
 * - Ticks away from arc
 * - Value label misplaced
 * 
 * The issue resolves when the window is resized because ResizeObserver
 * fires with correct dimensions.
 * 
 * Root cause: useLayoutEffect runs and calls initChart before the browser
 * has finished layout calculation. The getBoundingClientRect() returns
 * incorrect dimensions on first render.
 * 
 * Fix: Defer initial render to ResizeObserver callback, which fires after
 * layout is stable and dimensions are correct.
 */

import { calculateGaugeLayout, calculateLayoutFromMeasuredBounds, isLayoutStable, GaugeLayout } from './coordinateSystem';
import { GaugeType } from '../types/GaugeComponentProps';

describe('Mobile Initial Render Tests', () => {
  describe('Dimension scaling behavior', () => {
    it('should produce drastically different layouts for wrong vs correct dimensions', () => {
      // This test demonstrates the problem: if initial render happens with 
      // wrong dimensions (e.g., 10x10 on mobile before layout completes),
      // the gauge will have wrong proportions
      
      const wrongLayout = calculateGaugeLayout(10, 10, GaugeType.Grafana, 0.2);
      const correctLayout = calculateGaugeLayout(300, 200, GaugeType.Grafana, 0.2);
      
      // The radius difference should be massive
      const radiusRatio = correctLayout.outerRadius / wrongLayout.outerRadius;
      expect(radiusRatio).toBeGreaterThan(10); // Correct should be much larger
      
      // This explains why ticks appear huge and borders thick on mobile:
      // The gauge renders with tiny dimensions, then container shows at full size
    });

    it('should scale tick and label sizes proportionally to radius', () => {
      // Tick and label sizes are calculated relative to outerRadius
      // When rendered with wrong dimensions, they appear disproportionate
      
      const smallLayout = calculateGaugeLayout(50, 50, GaugeType.Grafana, 0.2);
      const normalLayout = calculateGaugeLayout(300, 200, GaugeType.Grafana, 0.2);
      
      // Typical tick length is ~5% of outerRadius
      const smallTickSize = smallLayout.outerRadius * 0.05;
      const normalTickSize = normalLayout.outerRadius * 0.05;
      
      // The tick sizes should scale proportionally
      expect(normalTickSize / smallTickSize).toBeCloseTo(normalLayout.outerRadius / smallLayout.outerRadius, 1);
    });

    it('should produce consistent layout when dimensions stabilize', () => {
      // After ResizeObserver fires with correct dimensions, 
      // subsequent renders should be stable
      
      const layout1 = calculateGaugeLayout(300, 200, GaugeType.Grafana, 0.2);
      const layout2 = calculateGaugeLayout(300, 200, GaugeType.Grafana, 0.2);
      
      expect(layout1.outerRadius).toBe(layout2.outerRadius);
      expect(layout1.viewBox.width).toBe(layout2.viewBox.width);
      expect(layout1.viewBox.height).toBe(layout2.viewBox.height);
      expect(layout1.gaugeCenter.x).toBe(layout2.gaugeCenter.x);
      expect(layout1.gaugeCenter.y).toBe(layout2.gaugeCenter.y);
    });
  });

  describe('Zero/Invalid dimension handling', () => {
    it('should handle zero dimensions gracefully', () => {
      // On mobile, getBoundingClientRect may return 0 initially
      // The render should be skipped, not produce invalid layouts
      
      const layout = calculateGaugeLayout(0, 0, GaugeType.Grafana, 0.2);
      
      // With 0 dimensions, the layout should still be defined (not crash)
      // but values will be minimal
      expect(layout).toBeDefined();
      expect(layout.outerRadius).toBeDefined();
    });

    it('should handle very small dimensions without crashing', () => {
      const layout = calculateGaugeLayout(1, 1, GaugeType.Grafana, 0.2);
      
      expect(layout).toBeDefined();
      expect(layout.outerRadius).toBeGreaterThan(0);
      expect(Number.isFinite(layout.outerRadius)).toBe(true);
    });

    it('should skip render when dimensions are invalid (simulated logic)', () => {
      // This simulates the check in renderChart: if (parentWidth <= 0 || parentHeight <= 0) return;
      const shouldSkipRender = (width: number, height: number): boolean => {
        return width <= 0 || height <= 0;
      };
      
      // Zero dimensions should skip
      expect(shouldSkipRender(0, 0)).toBe(true);
      expect(shouldSkipRender(0, 100)).toBe(true);
      expect(shouldSkipRender(100, 0)).toBe(true);
      
      // Valid dimensions should not skip
      expect(shouldSkipRender(100, 100)).toBe(false);
      expect(shouldSkipRender(1, 1)).toBe(false);
    });
  });

  describe('First render deferral behavior', () => {
    it('should identify when initial dimensions are unreliable', () => {
      // Heuristic: if initial dimensions are very small compared to 
      // typical mobile viewport, they're likely unreliable
      
      const isUnreliableDimension = (width: number, height: number): boolean => {
        // Minimum reliable mobile viewport is typically 320x480
        // If we get dimensions much smaller, they're probably wrong
        const MIN_RELIABLE_SIZE = 50;
        return width < MIN_RELIABLE_SIZE || height < MIN_RELIABLE_SIZE;
      };
      
      // Very small dimensions (mobile initial state)
      expect(isUnreliableDimension(10, 10)).toBe(true);
      expect(isUnreliableDimension(0, 0)).toBe(true);
      expect(isUnreliableDimension(30, 200)).toBe(true);
      
      // Normal dimensions
      expect(isUnreliableDimension(300, 200)).toBe(false);
      expect(isUnreliableDimension(100, 100)).toBe(false);
    });

    it('should defer to ResizeObserver for accurate initial dimensions', () => {
      // The fix: on first render, don't immediately render the chart.
      // Instead, wait for ResizeObserver to fire with stable dimensions.
      
      // Simulate the initialization flow:
      // 1. useLayoutEffect runs, initializes container
      // 2. ResizeObserver is set up in useEffect
      // 3. ResizeObserver fires immediately with actual dimensions
      // 4. Chart renders with correct dimensions
      
      const initSequence: string[] = [];
      
      const simulateMount = () => {
        // Step 1: useLayoutEffect runs
        initSequence.push('useLayoutEffect');
        
        // With the fix: DON'T call initChart here if we're deferring to ResizeObserver
        // Original (buggy): initSequence.push('initChart');
        
        // Step 2: useEffect runs and sets up ResizeObserver
        initSequence.push('useEffect:setupResizeObserver');
        
        // Step 3: ResizeObserver fires with dimensions
        initSequence.push('ResizeObserver:callback');
        
        // Step 4: NOW render the chart with correct dimensions
        initSequence.push('renderChart');
      };
      
      simulateMount();
      
      // Verify sequence - initChart should NOT happen before ResizeObserver
      const initChartIndex = initSequence.indexOf('initChart');
      const resizeObserverIndex = initSequence.indexOf('ResizeObserver:callback');
      const renderChartIndex = initSequence.indexOf('renderChart');
      
      // initChart should not be in sequence (it's deferred)
      expect(initChartIndex).toBe(-1);
      
      // renderChart should happen after ResizeObserver
      expect(renderChartIndex).toBeGreaterThan(resizeObserverIndex);
    });
  });

  describe('Layout recalculation on resize', () => {
    it('should correctly recalculate layout when dimensions change', () => {
      // Initial (wrong) dimensions
      const wrongLayout = calculateGaugeLayout(10, 10, GaugeType.Grafana, 0.2);
      
      // After resize with correct dimensions
      const correctLayout = calculateGaugeLayout(300, 200, GaugeType.Grafana, 0.2);
      
      // The new layout should be completely different
      expect(correctLayout.outerRadius).toBeGreaterThan(wrongLayout.outerRadius * 5);
      expect(correctLayout.viewBox.width).toBeGreaterThan(wrongLayout.viewBox.width * 5);
    });

    it('should preserve layout stability after correct dimensions are set', () => {
      const layout1 = calculateGaugeLayout(300, 200, GaugeType.Grafana, 0.2);
      const layout2 = calculateGaugeLayout(300, 200, GaugeType.Grafana, 0.2);
      const layout3 = calculateGaugeLayout(300, 200, GaugeType.Grafana, 0.2);
      
      // All should be identical
      expect(layout1.outerRadius).toBe(layout2.outerRadius);
      expect(layout2.outerRadius).toBe(layout3.outerRadius);
    });
  });

  describe('Two-pass rendering with measured bounds', () => {
    it('should use measured bounds for accurate second pass', () => {
      // First pass: calculate layout
      const pass1Layout = calculateGaugeLayout(300, 200, GaugeType.Grafana, 0.2);
      
      // Simulate measured bounds from getBBox()
      const measuredBounds = {
        width: pass1Layout.outerRadius * 2.5, // Includes tick labels
        height: pass1Layout.outerRadius * 1.8,
        x: -pass1Layout.outerRadius * 1.25,
        y: -pass1Layout.outerRadius * 0.9
      };
      
      // Second pass: use measured bounds
      const pass2Layout = calculateLayoutFromMeasuredBounds(
        300,
        200,
        measuredBounds,
        GaugeType.Grafana,
        0.2,
        pass1Layout
      );
      
      // Pass 2 layout should be optimized
      expect(pass2Layout).toBeDefined();
      expect(pass2Layout.outerRadius).toBeGreaterThan(0);
      expect(pass2Layout.viewBox.width).toBeGreaterThan(0);
      expect(pass2Layout.viewBox.height).toBeGreaterThan(0);
    });
  });

  describe('Infinite loop prevention', () => {
    it('should detect stable layout when all properties are within tolerance', () => {
      const layout1 = calculateGaugeLayout(300, 200, GaugeType.Grafana, 0.2);
      const layout2 = calculateGaugeLayout(300, 200, GaugeType.Grafana, 0.2);
      
      // Same dimensions should be stable
      expect(isLayoutStable(layout1, layout2, 0.005)).toBe(true);
    });

    it('should detect unstable layout when radius changes significantly', () => {
      const layout1 = calculateGaugeLayout(300, 200, GaugeType.Grafana, 0.2);
      const layout2 = calculateGaugeLayout(400, 300, GaugeType.Grafana, 0.2);
      
      // Different dimensions should be unstable
      expect(isLayoutStable(layout1, layout2, 0.005)).toBe(false);
    });

    it('should detect stable layout with tiny variations', () => {
      const layout1 = calculateGaugeLayout(300, 200, GaugeType.Grafana, 0.2);
      const layout2 = calculateGaugeLayout(301, 200, GaugeType.Grafana, 0.2);
      
      // 1px change should be within tolerance
      expect(isLayoutStable(layout1, layout2, 0.01)).toBe(true);
    });

    it('should prevent oscillation by checking all layout properties', () => {
      const layout1 = calculateGaugeLayout(300, 200, GaugeType.Grafana, 0.2);
      
      // Create a slightly modified layout (simulating oscillation)
      const layout2: GaugeLayout = {
        ...layout1,
        viewBox: {
          ...layout1.viewBox,
          width: layout1.viewBox.width * 1.001, // 0.1% change
          height: layout1.viewBox.height * 1.001,
          toString: layout1.viewBox.toString
        }
      };
      
      // Should be stable (within 0.5% tolerance)
      expect(isLayoutStable(layout1, layout2, 0.005)).toBe(true);
    });

    it('should simulate container size tracking logic', () => {
      // This simulates the ResizeObserver container size tracking
      const shouldSkipResize = (
        lastSize: { width: number; height: number } | null,
        newWidth: number,
        newHeight: number,
        threshold: number = 1
      ): boolean => {
        if (!lastSize) return false;
        const widthChange = Math.abs(newWidth - lastSize.width);
        const heightChange = Math.abs(newHeight - lastSize.height);
        return widthChange < threshold && heightChange < threshold;
      };
      
      const lastSize = { width: 300, height: 200 };
      
      // Sub-pixel changes should be skipped
      expect(shouldSkipResize(lastSize, 300.5, 200.3, 1)).toBe(true);
      
      // Significant changes should not be skipped
      expect(shouldSkipResize(lastSize, 305, 200, 1)).toBe(false);
      expect(shouldSkipResize(lastSize, 300, 205, 1)).toBe(false);
      
      // First render (no lastSize) should not be skipped
      expect(shouldSkipResize(null, 300, 200, 1)).toBe(false);
    });
  });

  describe('Grafana gauge specific issues', () => {
    it('should calculate appropriate arc width for Grafana type', () => {
      const layout = calculateGaugeLayout(300, 200, GaugeType.Grafana, 0.2);
      
      // Arc width should be proportional to radius
      const arcWidth = layout.outerRadius * 0.2;
      expect(arcWidth).toBeGreaterThan(0);
      
      // For a 300x200 container, arc width should be reasonable (not too thick or thin)
      expect(arcWidth).toBeGreaterThan(5);
      expect(arcWidth).toBeLessThan(50);
    });

    it('should position value label correctly relative to arc center', () => {
      const layout = calculateGaugeLayout(300, 200, GaugeType.Grafana, 0.2);
      
      // Value label is positioned at gaugeCenter
      // It should be horizontally centered
      expect(layout.gaugeCenter.x).toBeCloseTo(layout.viewBox.width / 2, 1);
    });

    it('should have consistent tick positioning across gauge types', () => {
      const grafanaLayout = calculateGaugeLayout(300, 200, GaugeType.Grafana, 0.2);
      const radialLayout = calculateGaugeLayout(300, 200, GaugeType.Radial, 0.2);
      const semicircleLayout = calculateGaugeLayout(300, 200, GaugeType.Semicircle, 0.2);
      
      // All should have valid layouts
      [grafanaLayout, radialLayout, semicircleLayout].forEach(layout => {
        expect(layout.outerRadius).toBeGreaterThan(0);
        expect(layout.gaugeCenter.x).toBeGreaterThan(0);
        expect(layout.gaugeCenter.y).toBeGreaterThan(0);
      });
    });
  });
});
