/**
 * Performance Tests for GaugeComponent
 * 
 * These tests measure:
 * - Layout calculation performance
 * - Animation frame budget adherence
 * - Memory efficiency
 * - Batch rendering performance
 */

import { calculateGaugeLayout, isLayoutStable } from './coordinateSystem';
import { GaugeType } from '../types/GaugeComponentProps';

// Performance thresholds
const THRESHOLDS = {
  layoutCalculation: 1, // Max ms for a single layout calculation
  layoutBatch100: 16, // Max ms for 100 layout calculations (one frame)
  stabilityCheck: 0.1, // Max ms for stability check
  memoryPerGauge: 50 * 1024, // Max 50KB per gauge estimate
};

describe('Performance Tests', () => {
  describe('Layout Calculation Performance', () => {
    it('should calculate single layout under 1ms', () => {
      const iterations = 100;
      const times: number[] = [];
      
      for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        calculateGaugeLayout(400, 300, GaugeType.Semicircle, 0.2);
        times.push(performance.now() - start);
      }
      
      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      const maxTime = Math.max(...times);
      
      //console.debug(`Layout calc - Avg: ${avgTime.toFixed(3)}ms, Max: ${maxTime.toFixed(3)}ms`);
      
      expect(avgTime).toBeLessThan(THRESHOLDS.layoutCalculation);
    });

    it('should calculate 100 layouts within one frame (16ms)', () => {
      const start = performance.now();
      
      for (let i = 0; i < 100; i++) {
        const width = 200 + (i % 5) * 100;
        const height = 150 + (i % 4) * 75;
        const type = [GaugeType.Semicircle, GaugeType.Radial, GaugeType.Grafana][i % 3];
        calculateGaugeLayout(width, height, type, 0.15 + (i % 3) * 0.05);
      }
      
      const elapsed = performance.now() - start;
      //console.debug(`100 layout calculations: ${elapsed.toFixed(2)}ms`);
      
      expect(elapsed).toBeLessThan(THRESHOLDS.layoutBatch100);
    });

    it('should handle rapid successive calculations without degradation', () => {
      const batches = 10;
      const perBatch = 50;
      const batchTimes: number[] = [];
      
      for (let batch = 0; batch < batches; batch++) {
        const start = performance.now();
        for (let i = 0; i < perBatch; i++) {
          calculateGaugeLayout(400, 300, GaugeType.Semicircle, 0.2);
        }
        batchTimes.push(performance.now() - start);
      }
      
      // Check that later batches aren't significantly slower (no memory leak pattern)
      const firstHalf = batchTimes.slice(0, 5).reduce((a, b) => a + b, 0) / 5;
      const secondHalf = batchTimes.slice(5).reduce((a, b) => a + b, 0) / 5;
      
      //console.debug(`First 5 batches avg: ${firstHalf.toFixed(2)}ms, Last 5: ${secondHalf.toFixed(2)}ms`);
      
      // Second half should not be more than 100% slower (2x)
      // Increased tolerance to account for CI environment variance (GC, system load)
      expect(secondHalf).toBeLessThan(firstHalf * 2);
    });
  });

  describe('Stability Check Performance', () => {
    it('should perform stability check under 0.1ms', () => {
      const layout1 = calculateGaugeLayout(400, 300, GaugeType.Semicircle, 0.2);
      const layout2 = calculateGaugeLayout(401, 300, GaugeType.Semicircle, 0.2);
      
      const iterations = 1000;
      const start = performance.now();
      
      for (let i = 0; i < iterations; i++) {
        isLayoutStable(layout1, layout2, 0.005);
      }
      
      const avgTime = (performance.now() - start) / iterations;
      //console.debug(`Stability check avg: ${(avgTime * 1000).toFixed(3)}μs`);
      
      expect(avgTime).toBeLessThan(THRESHOLDS.stabilityCheck);
    });
  });

  describe('Animation Frame Budget', () => {
    it('should simulate animation progress updates within frame budget', () => {
      // Simulate 30 gauges updating simultaneously
      const gaugeCount = 30;
      const framesPerAnimation = 60;
      const frameBudget = 16; // 60fps target
      
      const layouts = Array.from({ length: gaugeCount }, (_, i) => ({
        layout: calculateGaugeLayout(250, 180, GaugeType.Semicircle, 0.2),
        prevProgress: 0,
        targetProgress: Math.random(),
      }));
      
      // Simulate one animation frame's worth of work
      const frameStart = performance.now();
      
      for (const gauge of layouts) {
        // Simulate progress interpolation (what happens in tween callback)
        const progress = gauge.prevProgress + (gauge.targetProgress - gauge.prevProgress) / framesPerAnimation;
        
        // Simulate pointer path calculation (simplified)
        const angle = progress * Math.PI;
        const x = Math.cos(angle) * gauge.layout.outerRadius;
        const y = Math.sin(angle) * gauge.layout.outerRadius;
        
        // Simulate color lookup
        const colorIndex = Math.floor(progress * 4);
        
        gauge.prevProgress = progress;
      }
      
      const frameTime = performance.now() - frameStart;
      //console.debug(`Frame time for ${gaugeCount} gauge updates: ${frameTime.toFixed(2)}ms`);
      
      // Should complete well under frame budget (leaving time for rendering)
      expect(frameTime).toBeLessThan(frameBudget * 0.5);
    });

    it('should calculate pointer paths efficiently', () => {
      const iterations = 1000;
      const start = performance.now();
      
      // Simulate pointer path calculation
      for (let i = 0; i < iterations; i++) {
        const percent = i / iterations;
        const startAngle = 0;
        const endAngle = Math.PI;
        const angle = startAngle + percent * (endAngle - startAngle);
        const pathLength = 100;
        const pointerRadius = 10;
        const centerPoint = [0, -pointerRadius / 2];
        
        const topPoint = [
          centerPoint[0] - pathLength * Math.cos(angle),
          centerPoint[1] - pathLength * Math.sin(angle),
        ];
        const thetaMinusHalfPi = angle - Math.PI / 2;
        const leftPoint = [
          centerPoint[0] - pointerRadius * Math.cos(thetaMinusHalfPi),
          centerPoint[1] - pointerRadius * Math.sin(thetaMinusHalfPi),
        ];
        const thetaPlusHalfPi = angle + Math.PI / 2;
        const rightPoint = [
          centerPoint[0] - pointerRadius * Math.cos(thetaPlusHalfPi),
          centerPoint[1] - pointerRadius * Math.sin(thetaPlusHalfPi),
        ];
        
        const pathStr = `M ${leftPoint[0]} ${leftPoint[1]} L ${topPoint[0]} ${topPoint[1]} L ${rightPoint[0]} ${rightPoint[1]}`;
      }
      
      const elapsed = performance.now() - start;
      const perPath = elapsed / iterations;
      //console.debug(`Pointer path calc: ${(perPath * 1000).toFixed(3)}μs per path`);
      
      // Should be very fast
      expect(perPath).toBeLessThan(0.1);
    });
  });

  describe('Memory Efficiency', () => {
    it('should not leak memory with repeated layout calculations', () => {
      // Force GC if available (for accurate measurement)
      if (global.gc) global.gc();
      
      const initialMemory = process.memoryUsage?.().heapUsed ?? 0;
      
      // Simulate many layout calculations
      const results: any[] = [];
      for (let i = 0; i < 1000; i++) {
        results.push(calculateGaugeLayout(400, 300, GaugeType.Semicircle, 0.2));
      }
      results.length = 0; // Clear references
      
      if (global.gc) global.gc();
      
      const finalMemory = process.memoryUsage?.().heapUsed ?? 0;
      const memoryGrowth = finalMemory - initialMemory;
      
      //console.debug(`Memory growth after 1000 calcs: ${(memoryGrowth / 1024).toFixed(2)}KB`);
      
      // Allow up to 2MB growth (accounting for test overhead and GC timing)
      if (initialMemory > 0) {
        expect(memoryGrowth).toBeLessThan(2 * 1024 * 1024);
      }
    });
  });

  describe('Multi-Gauge Scenario Simulation', () => {
    it('should handle gallery scenario (30+ gauges) efficiently', () => {
      const gaugeCount = 35; // Similar to gallery
      const updateCycles = 10;
      const cycleTimes: number[] = [];
      
      // Pre-calculate layouts (happens once on mount)
      const layouts = Array.from({ length: gaugeCount }, (_, i) => 
        calculateGaugeLayout(
          250 + (i % 3) * 20,
          180 + (i % 2) * 20,
          [GaugeType.Semicircle, GaugeType.Radial, GaugeType.Grafana][i % 3],
          0.15 + (i % 4) * 0.03
        )
      );
      
      // Simulate update cycles (value changes)
      for (let cycle = 0; cycle < updateCycles; cycle++) {
        const cycleStart = performance.now();
        
        for (let i = 0; i < gaugeCount; i++) {
          // Simulate stability check
          const stable = isLayoutStable(layouts[i], layouts[i], 0.005);
          
          // Simulate value calculation
          const newValue = Math.random() * 100;
          const min = 0;
          const max = 100;
          const percentage = (newValue - min) / (max - min);
        }
        
        cycleTimes.push(performance.now() - cycleStart);
      }
      
      const avgCycle = cycleTimes.reduce((a, b) => a + b, 0) / cycleTimes.length;
      const maxCycle = Math.max(...cycleTimes);
      
      //console.debug(`Gallery update cycle - Avg: ${avgCycle.toFixed(2)}ms, Max: ${maxCycle.toFixed(2)}ms`);
      
      // Each update cycle should be fast
      expect(avgCycle).toBeLessThan(5);
    });

    it('should maintain performance with staggered animations', () => {
      // Simulate staggered animation starts (what gallery does)
      const gaugeCount = 30;
      const animationDuration = 500; // ms
      const staggerDelay = 50; // ms between gauge starts
      
      interface AnimatingGauge {
        startTime: number;
        progress: number;
        target: number;
      }
      
      const gauges: AnimatingGauge[] = Array.from({ length: gaugeCount }, (_, i) => ({
        startTime: i * staggerDelay,
        progress: 0,
        target: Math.random(),
      }));
      
      // Simulate 10 frames
      const frameResults: { time: number; activeGauges: number }[] = [];
      
      for (let frame = 0; frame < 10; frame++) {
        const currentTime = frame * 16 + 100; // Start after stagger begins
        const frameStart = performance.now();
        let activeCount = 0;
        
        for (const gauge of gauges) {
          if (currentTime >= gauge.startTime && gauge.progress < 1) {
            // This gauge is animating
            const elapsed = currentTime - gauge.startTime;
            const t = Math.min(elapsed / animationDuration, 1);
            gauge.progress = t * gauge.target;
            activeCount++;
          }
        }
        
        frameResults.push({
          time: performance.now() - frameStart,
          activeGauges: activeCount,
        });
      }
      
      const maxFrameTime = Math.max(...frameResults.map(r => r.time));
      // console.log('Staggered animation frame times:', frameResults.map(r => 
      //   `${r.activeGauges} active: ${r.time.toFixed(2)}ms`
      // ).join(', '));
      
      expect(maxFrameTime).toBeLessThan(8); // Half frame budget
    });
  });

  describe('Optimization Verification', () => {
    it('should skip redundant renders when layout is stable', () => {
      let renderCount = 0;
      let prevLayout = null as any;
      
      // Simulate resize events with small variations
      const sizes = [
        [400, 300],
        [401, 300], // Tiny change
        [400, 301], // Tiny change
        [450, 350], // Significant change
        [450, 351], // Tiny change
      ];
      
      for (const [w, h] of sizes) {
        const layout = calculateGaugeLayout(w, h, GaugeType.Semicircle, 0.2);
        
        if (!prevLayout || !isLayoutStable(prevLayout, layout, 0.005)) {
          renderCount++;
        }
        
        prevLayout = layout;
      }
      
      //console.debug(`Renders: ${renderCount} out of ${sizes.length} size changes`);
      
      // Should only render for significant changes
      expect(renderCount).toBeLessThan(sizes.length);
      expect(renderCount).toBe(2); // Initial + one significant change
    });

    it('should efficiently batch stability checks', () => {
      const layout = calculateGaugeLayout(400, 300, GaugeType.Semicircle, 0.2);
      const variations = Array.from({ length: 100 }, (_, i) => 
        calculateGaugeLayout(400 + (i % 5) - 2, 300 + (i % 5) - 2, GaugeType.Semicircle, 0.2)
      );
      
      const start = performance.now();
      let stableCount = 0;
      
      for (const variation of variations) {
        if (isLayoutStable(layout, variation, 0.005)) {
          stableCount++;
        }
      }
      
      const elapsed = performance.now() - start;
      //console.debug(`100 stability checks: ${elapsed.toFixed(2)}ms, ${stableCount} stable`);
      
      expect(elapsed).toBeLessThan(1);
    });
  });
});

// Utility for running perf tests with warm-up
function benchmark(name: string, fn: () => void, iterations = 100, warmup = 10): { avg: number; min: number; max: number } {
  // Warm up
  for (let i = 0; i < warmup; i++) fn();
  
  const times: number[] = [];
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    fn();
    times.push(performance.now() - start);
  }
  
  return {
    avg: times.reduce((a, b) => a + b, 0) / times.length,
    min: Math.min(...times),
    max: Math.max(...times),
  };
}

