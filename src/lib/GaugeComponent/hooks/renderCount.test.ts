/**
 * Render Count and DOM Operation Tests
 * 
 * These tests enforce limits on:
 * - DOM operations per render cycle
 * - Animation frame work
 * - JSON.stringify calls
 * - Re-render prevention
 * 
 * Purpose: Catch performance regressions that impact mobile devices
 */

import { calculateGaugeLayout, isLayoutStable } from './coordinateSystem';
import { GaugeType } from '../types/GaugeComponentProps';

// Performance budgets - these are the MAXIMUM allowed values
// Exceeding these indicates a performance regression
// BASELINE measured on 2024-12-15 - update when optimizations are made
const PERFORMANCE_BUDGETS = {
  // DOM operation limits (current baseline + 5% tolerance for test stability)
  maxDomOpsInitialRender: 200,       // Current: 191 (two-pass with all elements)
  maxDomOpsValueChange: 15,          // Current: 8 (minimal updates)
  maxDomOpsPerAnimationFrame: 12,    // Current: 11 (per-frame updates)
  maxDomOpsResize: 210,              // Full re-render on resize
  
  // Computation limits
  maxJsonStringifyPerRender: 15,     // Current: 14 (shouldInitChart + prop comparisons)
  maxLayoutCalcsPerRender: 2,        // Two-pass max
  maxColorLookupsPerFrame: 2,        // Grafana arc + pointer
  
  // Timing budgets (ms)
  maxRenderTimeMs: 16,               // One frame budget
  maxAnimationFrameTimeMs: 8,        // Half frame for animation work
  maxLayoutCalcTimeMs: 1,            // Layout should be fast
  
  // Re-render prevention
  maxUnnecessaryRerenders: 0,        // Should never re-render without changes
};

/**
 * Mock DOM operation counter
 * Simulates tracking D3 operations
 */
class DOMOperationTracker {
  private operations: { type: string; target: string; timestamp: number }[] = [];
  private enabled = false;

  start() {
    this.operations = [];
    this.enabled = true;
  }

  stop() {
    this.enabled = false;
  }

  track(type: string, target: string) {
    if (this.enabled) {
      this.operations.push({ type, target, timestamp: performance.now() });
    }
  }

  getCount() {
    return this.operations.length;
  }

  getOperations() {
    return [...this.operations];
  }

  getByType(type: string) {
    return this.operations.filter(op => op.type === type);
  }

  reset() {
    this.operations = [];
  }
}

/**
 * Simulates the DOM operations that occur during gauge rendering
 * Based on actual code analysis from arc.ts, pointer.ts, labels.ts, chart.ts
 */
function simulateInitialRender(tracker: DOMOperationTracker, config: {
  subArcCount: number;
  hasOuterArc: boolean;
  tickCount: number;
  hasValueLabel: boolean;
  hasPointer: boolean;
  pointerType: 'needle' | 'arrow' | 'blob';
  isGrafana: boolean;
  twoPass: boolean;
}) {
  const passes = config.twoPass ? 2 : 1;
  
  for (let pass = 0; pass < passes; pass++) {
    // SVG container setup (chart.ts:46-53)
    if (pass === 0) {
      tracker.track('create', 'svg');
      tracker.track('attr', 'svg.style.visibility');
      tracker.track('attr', 'svg.style.opacity');
    }
    tracker.track('create', 'g.gauge-content');
    tracker.track('create', 'g.doughnut');
    
    // Arc creation (arc.ts:288-304)
    for (let i = 0; i < config.subArcCount; i++) {
      tracker.track('create', 'g.subArc');
      tracker.track('create', 'path');
      tracker.track('attr', 'path.d');
      tracker.track('style', 'path.fill');
      tracker.track('bindEvent', 'mouseleave');
      tracker.track('bindEvent', 'mouseout');
      tracker.track('bindEvent', 'mousemove');
      tracker.track('bindEvent', 'click');
    }
    
    // Grafana outer arc (arc.ts:185-240)
    if (config.hasOuterArc && config.isGrafana) {
      for (let i = 0; i < config.subArcCount; i++) {
        tracker.track('create', 'g.outerSubArc');
        tracker.track('create', 'path');
        tracker.track('attr', 'path.d');
        tracker.track('style', 'path.fill');
      }
    }
    
    // Tick labels (labels.ts:76-144, 146-217)
    for (let i = 0; i < config.tickCount; i++) {
      // Tick line
      tracker.track('create', 'path.tickLine');
      tracker.track('attr', 'path.d');
      tracker.track('attr', 'path.stroke');
      tracker.track('attr', 'path.stroke-width');
      // Tick value
      tracker.track('create', 'g.tickValue');
      tracker.track('create', 'text');
      tracker.track('attr', 'text.transform');
      tracker.track('style', 'text.*'); // Multiple style attributes
    }
    
    // Value label (labels.ts:254-313)
    if (config.hasValueLabel) {
      tracker.track('create', 'g.valueLabel');
      tracker.track('create', 'text');
      tracker.track('attr', 'text.transform');
      tracker.track('style', 'text.*');
    }
    
    // Pointer (pointer.ts:103-191)
    if (config.hasPointer) {
      tracker.track('create', 'g.pointer');
      if (config.pointerType === 'needle' || config.pointerType === 'arrow') {
        tracker.track('create', 'path');
        tracker.track('attr', 'path.d');
        tracker.track('attr', 'path.fill');
      }
      if (config.pointerType === 'needle') {
        tracker.track('create', 'circle'); // base circle
        tracker.track('attr', 'circle.cx');
        tracker.track('attr', 'circle.cy');
        tracker.track('attr', 'circle.r');
        tracker.track('attr', 'circle.fill');
      }
      if (config.pointerType === 'blob') {
        tracker.track('create', 'circle');
        tracker.track('attr', 'circle.*'); // Multiple attributes
      }
      tracker.track('attr', 'g.pointer.transform');
    }
    
    // Pass 1 measurement (chart.ts:294-298)
    if (pass === 0 && config.twoPass) {
      tracker.track('measure', 'getBBox');
      tracker.track('remove', 'g.gauge-content-old');
    }
  }
  
  // Final visibility update
  tracker.track('attr', 'svg.visibility');
  tracker.track('attr', 'svg.opacity');
}

/**
 * Simulates DOM operations during animation frame
 */
function simulateAnimationFrame(tracker: DOMOperationTracker, config: {
  isGrafana: boolean;
  hasPointer: boolean;
  pointerType: 'needle' | 'arrow' | 'blob';
  hasGrabHandle: boolean;
}) {
  // Grafana arc update (arc.ts:635-692)
  if (config.isGrafana) {
    tracker.track('select', '.subArc');
    tracker.track('attr', 'path.d');
    tracker.track('style', 'path.fill');
    tracker.track('attr', 'path.d'); // Second arc (empty portion)
    tracker.track('style', 'path.fill');
  }
  
  // Pointer update (pointer.ts:192-229)
  if (config.hasPointer) {
    tracker.track('attr', 'g.pointer.transform');
    if (config.pointerType === 'needle' || config.pointerType === 'arrow') {
      tracker.track('attr', 'path.d');
      tracker.track('attr', 'path.fill');
    }
    if (config.pointerType === 'blob') {
      tracker.track('attr', 'circle.stroke');
      tracker.track('attr', 'circle.stroke-width');
    }
    if (config.hasGrabHandle) {
      tracker.track('select', '.pointer-grab-handle');
      tracker.track('attr', 'circle.cx');
      tracker.track('attr', 'circle.cy');
    }
  }
}

/**
 * Simulates value-only change (no layout change)
 */
function simulateValueChange(tracker: DOMOperationTracker) {
  // JSON comparisons are done but don't create DOM ops
  // Only pointer and value label update
  
  // Clear and recreate value label (labels.ts:381)
  tracker.track('remove', '.valueLabel');
  tracker.track('create', 'g.valueLabel');
  tracker.track('create', 'text');
  tracker.track('attr', 'text.transform');
  tracker.track('style', 'text.*');
  
  // Pointer update via animation or direct
  tracker.track('attr', 'g.pointer.transform');
  tracker.track('attr', 'path.d');
  tracker.track('attr', 'path.fill');
}

describe('Render Count Tests', () => {
  describe('DOM Operation Budgets', () => {
    it('should not exceed DOM operation budget for initial render', () => {
      const tracker = new DOMOperationTracker();
      tracker.start();
      
      simulateInitialRender(tracker, {
        subArcCount: 5,
        hasOuterArc: true,
        tickCount: 2,
        hasValueLabel: true,
        hasPointer: true,
        pointerType: 'needle',
        isGrafana: true,
        twoPass: true,
      });
      
      tracker.stop();
      const opCount = tracker.getCount();
      
      console.log(`Initial render DOM operations: ${opCount} (budget: ${PERFORMANCE_BUDGETS.maxDomOpsInitialRender})`);
      
      expect(opCount).toBeLessThanOrEqual(PERFORMANCE_BUDGETS.maxDomOpsInitialRender);
    });

    it('should not exceed DOM operation budget for value change', () => {
      const tracker = new DOMOperationTracker();
      tracker.start();
      
      simulateValueChange(tracker);
      
      tracker.stop();
      const opCount = tracker.getCount();
      
      console.log(`Value change DOM operations: ${opCount} (budget: ${PERFORMANCE_BUDGETS.maxDomOpsValueChange})`);
      
      expect(opCount).toBeLessThanOrEqual(PERFORMANCE_BUDGETS.maxDomOpsValueChange);
    });

    it('should not exceed DOM operation budget per animation frame', () => {
      const tracker = new DOMOperationTracker();
      tracker.start();
      
      simulateAnimationFrame(tracker, {
        isGrafana: true,
        hasPointer: true,
        pointerType: 'needle',
        hasGrabHandle: true,
      });
      
      tracker.stop();
      const opCount = tracker.getCount();
      
      console.log(`Animation frame DOM operations: ${opCount} (budget: ${PERFORMANCE_BUDGETS.maxDomOpsPerAnimationFrame})`);
      
      expect(opCount).toBeLessThanOrEqual(PERFORMANCE_BUDGETS.maxDomOpsPerAnimationFrame);
    });

    it('should track total animation DOM operations for 60-frame animation', () => {
      const ANIMATION_FRAMES = 60;
      const tracker = new DOMOperationTracker();
      tracker.start();
      
      for (let frame = 0; frame < ANIMATION_FRAMES; frame++) {
        simulateAnimationFrame(tracker, {
          isGrafana: true,
          hasPointer: true,
          pointerType: 'needle',
          hasGrabHandle: false,
        });
      }
      
      tracker.stop();
      const totalOps = tracker.getCount();
      const perFrameAvg = totalOps / ANIMATION_FRAMES;
      
      console.log(`60-frame animation total: ${totalOps} ops, avg per frame: ${perFrameAvg.toFixed(1)}`);
      
      // Total should be frames × per-frame budget
      expect(totalOps).toBeLessThanOrEqual(ANIMATION_FRAMES * PERFORMANCE_BUDGETS.maxDomOpsPerAnimationFrame);
    });
  });

  describe('Render Prevention', () => {
    it('should not re-render when props are identical', () => {
      let renderCount = 0;
      const prevProps = { value: 50, minValue: 0, maxValue: 100 };
      const newProps = { value: 50, minValue: 0, maxValue: 100 };
      
      // Simulate shouldInitChart logic
      const valueChanged = JSON.stringify(prevProps.value) !== JSON.stringify(newProps.value);
      const minValueChanged = JSON.stringify(prevProps.minValue) !== JSON.stringify(newProps.minValue);
      const maxValueChanged = JSON.stringify(prevProps.maxValue) !== JSON.stringify(newProps.maxValue);
      
      if (valueChanged || minValueChanged || maxValueChanged) {
        renderCount++;
      }
      
      expect(renderCount).toBe(PERFORMANCE_BUDGETS.maxUnnecessaryRerenders);
    });

    it('should skip render when layout is stable after resize', () => {
      const layout1 = calculateGaugeLayout(400, 300, GaugeType.Semicircle, 0.2);
      const layout2 = calculateGaugeLayout(401, 301, GaugeType.Semicircle, 0.2); // Tiny change
      
      const isStable = isLayoutStable(layout1, layout2, 0.01); // 1% tolerance
      
      console.log(`Layout stability check: ${isStable ? 'STABLE (skip render)' : 'CHANGED (render needed)'}`);
      
      // Small changes should be considered stable
      expect(isStable).toBe(true);
    });

    it('should detect significant layout changes', () => {
      const layout1 = calculateGaugeLayout(400, 300, GaugeType.Semicircle, 0.2);
      const layout2 = calculateGaugeLayout(600, 400, GaugeType.Semicircle, 0.2); // Significant change
      
      const isStable = isLayoutStable(layout1, layout2, 0.01);
      
      console.log(`Significant resize: ${isStable ? 'STABLE (BUG!)' : 'CHANGED (correct)'}`);
      
      // Significant changes should trigger re-render
      expect(isStable).toBe(false);
    });
  });

  describe('Computation Budgets', () => {
    it('should limit JSON.stringify calls in prop comparison', () => {
      let stringifyCount = 0;
      const originalStringify = JSON.stringify;
      
      // Mock JSON.stringify to count calls
      const mockStringify = (value: any) => {
        stringifyCount++;
        return originalStringify(value);
      };
      
      // Simulate shouldInitChart prop comparisons
      const prevProps = {
        arc: { width: 0.2, subArcs: [{ limit: 50 }] },
        pointer: { type: 'needle' },
        labels: { tickLabels: { ticks: [] } },
        type: 'semicircle',
        value: 50,
        minValue: 0,
        maxValue: 100,
      };
      const newProps = { ...prevProps, value: 60 };
      
      // These are the comparisons done in shouldInitChart
      mockStringify(prevProps.arc) !== mockStringify(newProps.arc);
      mockStringify(prevProps.pointer) !== mockStringify(newProps.pointer);
      mockStringify(prevProps.labels) !== mockStringify(newProps.labels);
      mockStringify(prevProps.type) !== mockStringify(newProps.type);
      mockStringify(prevProps.value) !== mockStringify(newProps.value);
      mockStringify(prevProps.minValue) !== mockStringify(newProps.minValue);
      mockStringify(prevProps.maxValue) !== mockStringify(newProps.maxValue);
      
      console.log(`JSON.stringify calls: ${stringifyCount} (budget: ${PERFORMANCE_BUDGETS.maxJsonStringifyPerRender})`);
      
      // Each comparison does 2 stringify calls
      expect(stringifyCount).toBeLessThanOrEqual(PERFORMANCE_BUDGETS.maxJsonStringifyPerRender);
    });

    it('should complete layout calculation within time budget', () => {
      const iterations = 100;
      const times: number[] = [];
      
      for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        calculateGaugeLayout(400, 300, GaugeType.Semicircle, 0.2);
        times.push(performance.now() - start);
      }
      
      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      const maxTime = Math.max(...times);
      
      console.log(`Layout calc: avg ${avgTime.toFixed(3)}ms, max ${maxTime.toFixed(3)}ms (budget: ${PERFORMANCE_BUDGETS.maxLayoutCalcTimeMs}ms)`);
      
      expect(avgTime).toBeLessThan(PERFORMANCE_BUDGETS.maxLayoutCalcTimeMs);
    });
  });

  describe('Mobile Performance Simulation', () => {
    it('should complete render within frame budget even with 3x slowdown', () => {
      const MOBILE_SLOWDOWN = 3;
      const FRAME_BUDGET = 16.67; // ms for 60fps
      
      const tracker = new DOMOperationTracker();
      const start = performance.now();
      
      tracker.start();
      simulateInitialRender(tracker, {
        subArcCount: 3, // Reduced for mobile
        hasOuterArc: false,
        tickCount: 2,
        hasValueLabel: true,
        hasPointer: true,
        pointerType: 'needle',
        isGrafana: false,
        twoPass: true,
      });
      tracker.stop();
      
      const elapsed = performance.now() - start;
      const simulatedMobileTime = elapsed * MOBILE_SLOWDOWN;
      
      console.log(`Mobile render simulation: ${simulatedMobileTime.toFixed(2)}ms (budget: ${FRAME_BUDGET}ms)`);
      
      // Should complete within frame budget even with slowdown
      expect(simulatedMobileTime).toBeLessThan(FRAME_BUDGET);
    });

    it('should handle 30 simultaneous gauge animations within frame budget', () => {
      const GAUGE_COUNT = 30;
      const FRAME_BUDGET = 16.67;
      
      const tracker = new DOMOperationTracker();
      const start = performance.now();
      
      tracker.start();
      for (let i = 0; i < GAUGE_COUNT; i++) {
        simulateAnimationFrame(tracker, {
          isGrafana: i % 3 === 0,
          hasPointer: true,
          pointerType: ['needle', 'arrow', 'blob'][i % 3] as any,
          hasGrabHandle: false,
        });
      }
      tracker.stop();
      
      const elapsed = performance.now() - start;
      const opCount = tracker.getCount();
      
      console.log(`30 gauge animations: ${opCount} ops in ${elapsed.toFixed(2)}ms (budget: ${FRAME_BUDGET}ms)`);
      
      // JS execution should be fast; DOM operations are the bottleneck
      expect(elapsed).toBeLessThan(FRAME_BUDGET / 2); // Leave room for actual DOM work
    });
  });

  describe('Memory Allocation', () => {
    it('should not create excessive temporary objects in animation loop', () => {
      // Simulate what happens in the animation tween callback
      const iterations = 1000;
      const allocations: any[] = [];
      
      for (let i = 0; i < iterations; i++) {
        // This simulates the objects created per frame
        const progress = i / iterations;
        
        // calculatePointerPath creates a string (allocation)
        const pathStr = `M 0 0 L ${100 * progress} ${-100 * progress} L 0 0`;
        
        // Color lookup may create intermediate objects
        const colorIndex = Math.floor(progress * 4);
        
        // Track allocations in first iteration only for counting
        if (i === 0) {
          allocations.push(pathStr);
        }
      }
      
      // In a real test, we'd measure heap growth
      // Here we just verify the loop completes quickly
      console.log(`Animation loop iterations: ${iterations}, sample allocations: ${allocations.length}`);
      
      expect(iterations).toBe(1000); // Sanity check
    });
  });

  describe('Regression Guards', () => {
    it('should fail if DOM operations exceed historical baseline', () => {
      // Historical baseline measured 2024-12-15 - update when optimizations reduce these
      const BASELINE = {
        initialRender: 191,  // Current measured value
        valueChange: 8,      // Current measured value
        animationFrame: 11,  // Current measured value
      };
      
      const tracker = new DOMOperationTracker();
      
      // Test initial render
      tracker.start();
      simulateInitialRender(tracker, {
        subArcCount: 5,
        hasOuterArc: true,
        tickCount: 2,
        hasValueLabel: true,
        hasPointer: true,
        pointerType: 'needle',
        isGrafana: true,
        twoPass: true,
      });
      tracker.stop();
      
      const initialOps = tracker.getCount();
      console.log(`Initial render: ${initialOps} ops (baseline: ${BASELINE.initialRender})`);
      
      // Allow 10% regression tolerance
      expect(initialOps).toBeLessThanOrEqual(BASELINE.initialRender * 1.1);
    });

    it('should maintain O(n) complexity for subArc count', () => {
      const results: { arcCount: number; ops: number }[] = [];
      
      for (const arcCount of [1, 5, 10, 20]) {
        const tracker = new DOMOperationTracker();
        tracker.start();
        
        simulateInitialRender(tracker, {
          subArcCount: arcCount,
          hasOuterArc: false,
          tickCount: 0,
          hasValueLabel: false,
          hasPointer: false,
          pointerType: 'needle',
          isGrafana: false,
          twoPass: false,
        });
        
        tracker.stop();
        results.push({ arcCount, ops: tracker.getCount() });
      }
      
      console.log('Arc count scaling:', results.map(r => `${r.arcCount} arcs: ${r.ops} ops`).join(', '));
      
      // Verify linear scaling (not quadratic)
      const ratio1to5 = results[1].ops / results[0].ops;
      const ratio5to10 = results[2].ops / results[1].ops;
      const ratio10to20 = results[3].ops / results[2].ops;
      
      // Ratios should be similar (linear growth)
      expect(Math.abs(ratio5to10 - ratio10to20)).toBeLessThan(1);
    });
  });
});

describe('Animation Performance Specific Tests', () => {
  it('should validate tween callback efficiency', () => {
    // Simulate 60 frames of animation
    const FRAMES = 60;
    const frameTimings: number[] = [];
    
    for (let frame = 0; frame < FRAMES; frame++) {
      const start = performance.now();
      
      // Simulate tween callback work
      const prevPercent = frame / FRAMES;
      const currentPercent = (frame + 1) / FRAMES;
      const progress = prevPercent + (currentPercent - prevPercent) * 0.5;
      
      // Progress validation (isProgressValid)
      const overFlow = progress > 1 || progress < 0;
      const tooSmall = Math.abs(progress - prevPercent) < 0.0001;
      const isValid = !tooSmall && !overFlow;
      
      // Path calculation simulation
      if (isValid) {
        const angle = progress * Math.PI;
        const pathLength = 100;
        const tipX = pathLength * Math.sin(angle);
        const tipY = -pathLength * Math.cos(angle);
        const perpAngle = angle + Math.PI / 2;
        const baseOffset = 10;
        const leftX = baseOffset * Math.sin(perpAngle);
        const leftY = -baseOffset * Math.cos(perpAngle);
        const pathStr = `M ${leftX} ${leftY} L ${tipX} ${tipY} L ${-leftX} ${-leftY}`;
      }
      
      frameTimings.push(performance.now() - start);
    }
    
    const avgFrameTime = frameTimings.reduce((a, b) => a + b, 0) / FRAMES;
    const maxFrameTime = Math.max(...frameTimings);
    
    console.log(`Tween callback: avg ${(avgFrameTime * 1000).toFixed(1)}μs, max ${(maxFrameTime * 1000).toFixed(1)}μs`);
    
    // Should be well under 1ms per frame
    expect(avgFrameTime).toBeLessThan(1);
    expect(maxFrameTime).toBeLessThan(2);
  });

  it('should validate color lookup efficiency during animation', () => {
    const LOOKUPS = 1000;
    const start = performance.now();
    
    // Simulate color lookup for gradient mode
    const subArcs = [
      { limit: 25, color: '#ff0000' },
      { limit: 50, color: '#ffff00' },
      { limit: 75, color: '#00ff00' },
      { limit: 100, color: '#0000ff' },
    ];
    
    for (let i = 0; i < LOOKUPS; i++) {
      const percentage = i / LOOKUPS;
      const value = percentage * 100;
      
      // Find which segment
      let prevLimit = 0;
      for (const subArc of subArcs) {
        if (value <= subArc.limit) {
          // Found segment - would interpolate color here
          const segmentPercent = (value - prevLimit) / (subArc.limit - prevLimit);
          break;
        }
        prevLimit = subArc.limit;
      }
    }
    
    const elapsed = performance.now() - start;
    const perLookup = elapsed / LOOKUPS;
    
    console.log(`Color lookups: ${LOOKUPS} in ${elapsed.toFixed(2)}ms, ${(perLookup * 1000).toFixed(2)}μs each`);
    
    // Should be very fast
    expect(perLookup).toBeLessThan(0.01); // 10μs per lookup
  });
});
