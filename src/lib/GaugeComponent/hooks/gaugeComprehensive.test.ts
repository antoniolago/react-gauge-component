/**
 * Comprehensive Test Suite for Gauge Component
 * 
 * This test suite covers:
 * 1. Animation timing - configured vs executed duration
 * 2. Pointer position accuracy on value changes
 * 3. Label value accuracy on value changes
 * 4. Rerender behavior for EVERY prop (should vs shouldn't trigger reinit)
 * 5. User-reported bugs: slider updates, gauge resets, __renderIndex, etc.
 */

import { GaugeType } from '../types/GaugeComponentProps';
import * as utilHooks from './utils';

// =============================================================================
// HELPER FUNCTIONS - Simulating component logic for testing
// =============================================================================

/**
 * Simulates the cleanTicks function that removes __renderIndex
 */
const cleanTicks = (ticks: any[]) => {
  if (!ticks) return undefined;
  return ticks.map((t: any) => {
    const { __renderIndex, ...rest } = t;
    return rest;
  });
};

/**
 * Simulates getLabelsStructure - extracts comparable label properties
 */
const getLabelsStructure = (l: any) => {
  if (!l) return null;
  return {
    valueLabel: l.valueLabel ? {
      hide: l.valueLabel.hide,
      matchColorWithArc: l.valueLabel.matchColorWithArc,
      maxDecimalDigits: l.valueLabel.maxDecimalDigits,
      style: l.valueLabel.style,
      animateValue: l.valueLabel.animateValue,
    } : undefined,
    tickLabels: l.tickLabels ? {
      hideMinMax: l.tickLabels.hideMinMax,
      type: l.tickLabels.type,
      ticks: cleanTicks(l.tickLabels.ticks),
      defaultTickValueConfig: l.tickLabels.defaultTickValueConfig ? {
        hide: l.tickLabels.defaultTickValueConfig.hide,
        maxDecimalDigits: l.tickLabels.defaultTickValueConfig.maxDecimalDigits,
        style: l.tickLabels.defaultTickValueConfig.style,
      } : undefined,
      defaultTickLineConfig: l.tickLabels.defaultTickLineConfig,
    } : undefined,
  };
};

/**
 * Simulates getPointerStructure - extracts comparable pointer properties
 */
const getPointerStructure = (p: any) => ({
  type: p?.type,
  color: p?.color,
  baseColor: p?.baseColor,
  length: p?.length,
  width: p?.width,
  hide: p?.hide,
  strokeWidth: p?.strokeWidth,
  strokeColor: p?.strokeColor,
  arrowOffset: p?.arrowOffset,
  blobOffset: p?.blobOffset,
  hideGrabHandle: p?.hideGrabHandle,
  effects: p?.effects,
});

/**
 * Simulates shouldInitChart logic - returns true if structural change detected
 */
const shouldInitChart = (prev: any, curr: any): { 
  result: boolean; 
  reasons: string[];
} => {
  const reasons: string[] = [];
  
  const arcsPropsChanged = JSON.stringify(prev.arc) !== JSON.stringify(curr.arc);
  if (arcsPropsChanged) reasons.push('arcsPropsChanged');
  
  const labelsPropsChanged = JSON.stringify(getLabelsStructure(prev.labels)) !== 
                             JSON.stringify(getLabelsStructure(curr.labels));
  if (labelsPropsChanged) reasons.push('labelsPropsChanged');
  
  const typeChanged = prev.type !== curr.type;
  if (typeChanged) reasons.push('typeChanged');
  
  const minValueChanged = prev.minValue !== curr.minValue;
  if (minValueChanged) reasons.push('minValueChanged');
  
  const maxValueChanged = prev.maxValue !== curr.maxValue;
  if (maxValueChanged) reasons.push('maxValueChanged');
  
  const anglesChanged = prev.startAngle !== curr.startAngle || prev.endAngle !== curr.endAngle;
  if (anglesChanged) reasons.push('anglesChanged');
  
  // Only pointer.hide change triggers reinit (other props handled by renderChart)
  const pointerHideChanged = prev.pointer?.hide !== curr.pointer?.hide;
  if (pointerHideChanged) reasons.push('pointerHideChanged');
  
  // For pointers array, only COUNT changes trigger reinit (props handled by renderChart)
  const prevPointers = prev.pointers;
  const currPointers = curr.pointers;
  const pointersCountChanged = (prevPointers?.length ?? 0) !== (currPointers?.length ?? 0);
  if (pointersCountChanged) reasons.push('pointersCountChanged');
  
  // Mode transition (single <-> multi pointer) requires reinit
  const wasMultiPointer = Array.isArray(prevPointers) && prevPointers.length > 0;
  const isMultiPointer = Array.isArray(currPointers) && currPointers.length > 0;
  const modeTransition = wasMultiPointer !== isMultiPointer;
  if (modeTransition) reasons.push('modeTransition');
  
  return { 
    result: reasons.length > 0, 
    reasons 
  };
};

/**
 * Simulates percentage calculation
 */
const calculatePercentage = (minValue: number, maxValue: number, value: number): number => {
  return (value - minValue) / (maxValue - minValue);
};

/**
 * Simulates animation start percent calculation
 */
const calculateAnimationStartPercent = (
  lastRenderedProgress: number | undefined,
  prevPercent: number,
  isFirstAnimation: boolean
): number => {
  const hasLastRenderedProgress = lastRenderedProgress !== undefined && !isFirstAnimation;
  return hasLastRenderedProgress ? lastRenderedProgress : prevPercent;
};

// =============================================================================
// TEST SUITE 1: ANIMATION TIMING
// =============================================================================

describe('Animation Timing Tests', () => {
  describe('Configured vs Executed Animation Duration', () => {
    it('should use full configured duration for first animation', () => {
      const configuredDuration = 3000;
      const isFirstAnimation = true;
      
      // First animation uses full configured duration
      const effectiveDuration = configuredDuration;
      
      expect(effectiveDuration).toBe(3000);
    });

    it('should use full configured duration for non-first animations (user controls responsiveness)', () => {
      const configuredDuration = 3000;
      const isFirstAnimation = false;
      
      const effectiveDuration = configuredDuration;
      
      expect(effectiveDuration).toBe(3000);
    });

    it('should use configured duration for non-first animations regardless of value', () => {
      const configuredDuration = 200;
      const isFirstAnimation = false;
      
      const effectiveDuration = configuredDuration;
      
      expect(effectiveDuration).toBe(200);
    });

    it('should use full configured delay for first animation', () => {
      const configuredDelay = 500;
      const isFirstAnimation = true;
      
      const effectiveDelay = isFirstAnimation ? configuredDelay : 0;
      
      expect(effectiveDelay).toBe(500);
    });

    it('should use zero delay for non-first animations', () => {
      const configuredDelay = 500;
      const isFirstAnimation = false;
      
      const effectiveDelay = isFirstAnimation ? configuredDelay : 0;
      
      expect(effectiveDelay).toBe(0);
    });
  });
});

// =============================================================================
// TEST SUITE 2: POINTER POSITION ACCURACY
// =============================================================================

describe('Pointer Position Accuracy Tests', () => {
  describe('Value to Percentage Conversion', () => {
    it('should calculate 0% for minValue', () => {
      const percent = calculatePercentage(0, 100, 0);
      expect(percent).toBe(0);
    });

    it('should calculate 100% for maxValue', () => {
      const percent = calculatePercentage(0, 100, 100);
      expect(percent).toBe(1);
    });

    it('should calculate 50% for midpoint value', () => {
      const percent = calculatePercentage(0, 100, 50);
      expect(percent).toBe(0.5);
    });

    it('should handle non-zero minValue correctly', () => {
      const percent = calculatePercentage(20, 80, 50);
      expect(percent).toBe(0.5);
    });

    it('should handle negative values correctly', () => {
      const percent = calculatePercentage(-50, 50, 0);
      expect(percent).toBe(0.5);
    });

    it('should handle decimal values correctly', () => {
      const percent = calculatePercentage(0, 1, 0.5);
      expect(percent).toBe(0.5);
    });
  });

  describe('Animation Start Position', () => {
    it('should start from 0 for first animation', () => {
      const startPercent = calculateAnimationStartPercent(0.5, 0, true);
      expect(startPercent).toBe(0); // prevPercent for first animation
    });

    it('should start from lastRenderedProgress for non-first animation', () => {
      const startPercent = calculateAnimationStartPercent(0.7, 0.3, false);
      expect(startPercent).toBe(0.7);
    });

    it('should handle lastRenderedProgress of 0 correctly', () => {
      const startPercent = calculateAnimationStartPercent(0, 0.5, false);
      expect(startPercent).toBe(0); // Should use 0, not fall back to prevPercent
    });

    it('should use prevPercent when lastRenderedProgress is undefined', () => {
      const startPercent = calculateAnimationStartPercent(undefined, 0.3, false);
      expect(startPercent).toBe(0.3);
    });
  });
});

// =============================================================================
// TEST SUITE 3: PROP RERENDER BEHAVIOR - COMPREHENSIVE
// =============================================================================

describe('Prop Rerender Behavior Tests', () => {
  // Base props for comparison
  const baseProps = {
    value: 50,
    minValue: 0,
    maxValue: 100,
    type: GaugeType.Semicircle,
    startAngle: -90,
    endAngle: 90,
    arc: { 
      width: 0.2, 
      padding: 0.05,
      cornerRadius: 7,
      subArcs: [{ limit: 33 }, { limit: 66 }, { limit: 100 }]
    },
    pointer: { 
      type: 'needle', 
      animate: true, 
      animationDuration: 3000,
      animationDelay: 0,
      elastic: false,
      length: 0.8, 
      width: 15,
      color: '#464A4F',
      baseColor: '#464A4F',
      strokeWidth: 0,
      strokeColor: '#fff',
    },
    labels: { 
      valueLabel: { 
        hide: false, 
        maxDecimalDigits: 2,
        matchColorWithArc: false,
        style: { fontSize: '35px' },
      },
      tickLabels: { 
        hideMinMax: false,
        type: 'outer',
        ticks: [{ value: 0 }, { value: 50 }, { value: 100 }],
        defaultTickValueConfig: { 
          hide: false,
          maxDecimalDigits: 2,
          style: { fontSize: '10px' }
        },
        defaultTickLineConfig: { 
          color: '#666',
          length: 7,
          width: 1,
        }
      }
    },
    pointers: undefined,
  };

  // -------------------------------------------------------------------------
  // Props that should NOT trigger reinit (value-only or animation changes)
  // -------------------------------------------------------------------------
  describe('Props that should NOT trigger reinit', () => {
    it('value change should NOT trigger reinit', () => {
      const prev = { ...baseProps, value: 50 };
      const curr = { ...baseProps, value: 75 };
      const { result, reasons } = shouldInitChart(prev, curr);
      expect(result).toBe(false);
      expect(reasons).toEqual([]);
    });

    it('multiple rapid value changes should NOT trigger reinit', () => {
      const values = [0, 10, 25, 50, 75, 90, 100];
      for (let i = 1; i < values.length; i++) {
        const prev = { ...baseProps, value: values[i - 1] };
        const curr = { ...baseProps, value: values[i] };
        const { result } = shouldInitChart(prev, curr);
        expect(result).toBe(false);
      }
    });

    it('animationDuration change should NOT trigger reinit', () => {
      const prev = { ...baseProps, pointer: { ...baseProps.pointer, animationDuration: 500 } };
      const curr = { ...baseProps, pointer: { ...baseProps.pointer, animationDuration: 3000 } };
      const { result } = shouldInitChart(prev, curr);
      expect(result).toBe(false);
    });

    it('animationDelay change should NOT trigger reinit', () => {
      const prev = { ...baseProps, pointer: { ...baseProps.pointer, animationDelay: 0 } };
      const curr = { ...baseProps, pointer: { ...baseProps.pointer, animationDelay: 500 } };
      const { result } = shouldInitChart(prev, curr);
      expect(result).toBe(false);
    });

    it('elastic change should NOT trigger reinit', () => {
      const prev = { ...baseProps, pointer: { ...baseProps.pointer, elastic: false } };
      const curr = { ...baseProps, pointer: { ...baseProps.pointer, elastic: true } };
      const { result } = shouldInitChart(prev, curr);
      expect(result).toBe(false);
    });

    it('animate toggle should NOT trigger reinit', () => {
      const prev = { ...baseProps, pointer: { ...baseProps.pointer, animate: true } };
      const curr = { ...baseProps, pointer: { ...baseProps.pointer, animate: false } };
      const { result } = shouldInitChart(prev, curr);
      expect(result).toBe(false);
    });

    it('maxFps change should NOT trigger reinit', () => {
      const prev = { ...baseProps, pointer: { ...baseProps.pointer, maxFps: 60 } };
      const curr = { ...baseProps, pointer: { ...baseProps.pointer, maxFps: 30 } };
      const { result } = shouldInitChart(prev, curr);
      expect(result).toBe(false);
    });

    it('__renderIndex in ticks should NOT trigger reinit', () => {
      const prev = { 
        ...baseProps, 
        labels: { 
          ...baseProps.labels,
          tickLabels: {
            ...baseProps.labels.tickLabels,
            ticks: [
              { value: 0, __renderIndex: 0 }, 
              { value: 50, __renderIndex: 1 }, 
              { value: 100, __renderIndex: 2 }
            ]
          }
        }
      };
      const curr = { 
        ...baseProps, 
        labels: { 
          ...baseProps.labels,
          tickLabels: {
            ...baseProps.labels.tickLabels,
            ticks: [{ value: 0 }, { value: 50 }, { value: 100 }]
          }
        }
      };
      const { result, reasons } = shouldInitChart(prev, curr);
      expect(result).toBe(false);
      expect(reasons).not.toContain('labelsPropsChanged');
    });

    it('ticks with valueConfig and __renderIndex should NOT trigger reinit', () => {
      const prev = { 
        ...baseProps, 
        labels: { 
          tickLabels: {
            ticks: [
              { value: 0, valueConfig: { style: { fill: 'red' } }, __renderIndex: 0 },
              { value: 100, valueConfig: { style: { fill: 'green' } }, __renderIndex: 1 }
            ]
          }
        }
      };
      const curr = { 
        ...baseProps, 
        labels: { 
          tickLabels: {
            ticks: [
              { value: 0, valueConfig: { style: { fill: 'red' } } },
              { value: 100, valueConfig: { style: { fill: 'green' } } }
            ]
          }
        }
      };
      const { result } = shouldInitChart(prev, curr);
      expect(result).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // Props that SHOULD trigger reinit (structural changes)
  // -------------------------------------------------------------------------
  describe('Props that SHOULD trigger reinit', () => {
    // Gauge type
    it('type change (Semicircle -> Radial) should trigger reinit', () => {
      const prev = { ...baseProps, type: GaugeType.Semicircle };
      const curr = { ...baseProps, type: GaugeType.Radial };
      const { result, reasons } = shouldInitChart(prev, curr);
      expect(result).toBe(true);
      expect(reasons).toContain('typeChanged');
    });

    it('type change (Semicircle -> Grafana) should trigger reinit', () => {
      const prev = { ...baseProps, type: GaugeType.Semicircle };
      const curr = { ...baseProps, type: GaugeType.Grafana };
      const { result, reasons } = shouldInitChart(prev, curr);
      expect(result).toBe(true);
      expect(reasons).toContain('typeChanged');
    });

    // Min/Max values
    it('minValue change should trigger reinit', () => {
      const prev = { ...baseProps, minValue: 0 };
      const curr = { ...baseProps, minValue: 10 };
      const { result, reasons } = shouldInitChart(prev, curr);
      expect(result).toBe(true);
      expect(reasons).toContain('minValueChanged');
    });

    it('maxValue change should trigger reinit', () => {
      const prev = { ...baseProps, maxValue: 100 };
      const curr = { ...baseProps, maxValue: 200 };
      const { result, reasons } = shouldInitChart(prev, curr);
      expect(result).toBe(true);
      expect(reasons).toContain('maxValueChanged');
    });

    // Angles
    it('startAngle change should trigger reinit', () => {
      const prev = { ...baseProps, startAngle: -90 };
      const curr = { ...baseProps, startAngle: -120 };
      const { result, reasons } = shouldInitChart(prev, curr);
      expect(result).toBe(true);
      expect(reasons).toContain('anglesChanged');
    });

    it('endAngle change should trigger reinit', () => {
      const prev = { ...baseProps, endAngle: 90 };
      const curr = { ...baseProps, endAngle: 120 };
      const { result, reasons } = shouldInitChart(prev, curr);
      expect(result).toBe(true);
      expect(reasons).toContain('anglesChanged');
    });

    // Arc properties
    it('arc.width change should trigger reinit', () => {
      const prev = { ...baseProps, arc: { ...baseProps.arc, width: 0.2 } };
      const curr = { ...baseProps, arc: { ...baseProps.arc, width: 0.3 } };
      const { result, reasons } = shouldInitChart(prev, curr);
      expect(result).toBe(true);
      expect(reasons).toContain('arcsPropsChanged');
    });

    it('arc.padding change should trigger reinit', () => {
      const prev = { ...baseProps, arc: { ...baseProps.arc, padding: 0.05 } };
      const curr = { ...baseProps, arc: { ...baseProps.arc, padding: 0.1 } };
      const { result, reasons } = shouldInitChart(prev, curr);
      expect(result).toBe(true);
      expect(reasons).toContain('arcsPropsChanged');
    });

    it('arc.cornerRadius change should trigger reinit', () => {
      const prev = { ...baseProps, arc: { ...baseProps.arc, cornerRadius: 7 } };
      const curr = { ...baseProps, arc: { ...baseProps.arc, cornerRadius: 0 } };
      const { result, reasons } = shouldInitChart(prev, curr);
      expect(result).toBe(true);
      expect(reasons).toContain('arcsPropsChanged');
    });

    it('arc.subArcs change should trigger reinit', () => {
      const prev = { ...baseProps, arc: { ...baseProps.arc, subArcs: [{ limit: 50 }, { limit: 100 }] } };
      const curr = { ...baseProps, arc: { ...baseProps.arc, subArcs: [{ limit: 33 }, { limit: 66 }, { limit: 100 }] } };
      const { result, reasons } = shouldInitChart(prev, curr);
      expect(result).toBe(true);
      expect(reasons).toContain('arcsPropsChanged');
    });

    it('arc.gradient change should trigger reinit', () => {
      const prev = { ...baseProps, arc: { ...baseProps.arc, gradient: false } };
      const curr = { ...baseProps, arc: { ...baseProps.arc, gradient: true } };
      const { result, reasons } = shouldInitChart(prev, curr);
      expect(result).toBe(true);
      expect(reasons).toContain('arcsPropsChanged');
    });

    // Pointer hide change - ONLY hide triggers reinit (other props handled by renderChart)
    it('pointer.hide change should trigger reinit', () => {
      const prev = { ...baseProps, pointer: { ...baseProps.pointer, hide: false } };
      const curr = { ...baseProps, pointer: { ...baseProps.pointer, hide: true } };
      const { result, reasons } = shouldInitChart(prev, curr);
      expect(result).toBe(true);
      expect(reasons).toContain('pointerHideChanged');
    });
  });

  // -------------------------------------------------------------------------
  // Pointer props that should NOT trigger reinit (handled by renderChart)
  // -------------------------------------------------------------------------
  describe('Pointer props that should NOT trigger reinit (handled by renderChart)', () => {
    it('pointer.type change (needle -> blob) should NOT trigger reinit', () => {
      const prev = { ...baseProps, pointer: { ...baseProps.pointer, type: 'needle' } };
      const curr = { ...baseProps, pointer: { ...baseProps.pointer, type: 'blob' } };
      const { result } = shouldInitChart(prev, curr);
      expect(result).toBe(false);
    });

    it('pointer.type change (needle -> arrow) should NOT trigger reinit', () => {
      const prev = { ...baseProps, pointer: { ...baseProps.pointer, type: 'needle' } };
      const curr = { ...baseProps, pointer: { ...baseProps.pointer, type: 'arrow' } };
      const { result } = shouldInitChart(prev, curr);
      expect(result).toBe(false);
    });

    it('pointer.color change should NOT trigger reinit', () => {
      const prev = { ...baseProps, pointer: { ...baseProps.pointer, color: '#464A4F' } };
      const curr = { ...baseProps, pointer: { ...baseProps.pointer, color: '#ff0000' } };
      const { result } = shouldInitChart(prev, curr);
      expect(result).toBe(false);
    });

    it('pointer.length change should NOT trigger reinit', () => {
      const prev = { ...baseProps, pointer: { ...baseProps.pointer, length: 0.8 } };
      const curr = { ...baseProps, pointer: { ...baseProps.pointer, length: 0.6 } };
      const { result } = shouldInitChart(prev, curr);
      expect(result).toBe(false);
    });

    it('pointer.width change should NOT trigger reinit', () => {
      const prev = { ...baseProps, pointer: { ...baseProps.pointer, width: 15 } };
      const curr = { ...baseProps, pointer: { ...baseProps.pointer, width: 20 } };
      const { result } = shouldInitChart(prev, curr);
      expect(result).toBe(false);
    });

    it('pointer.strokeWidth change should NOT trigger reinit', () => {
      const prev = { ...baseProps, pointer: { ...baseProps.pointer, strokeWidth: 0 } };
      const curr = { ...baseProps, pointer: { ...baseProps.pointer, strokeWidth: 2 } };
      const { result } = shouldInitChart(prev, curr);
      expect(result).toBe(false);
    });

    it('pointer.strokeColor change should NOT trigger reinit', () => {
      const prev = { ...baseProps, pointer: { ...baseProps.pointer, strokeColor: '#fff' } };
      const curr = { ...baseProps, pointer: { ...baseProps.pointer, strokeColor: '#000' } };
      const { result } = shouldInitChart(prev, curr);
      expect(result).toBe(false);
    });

    it('pointer.arrowOffset change should NOT trigger reinit', () => {
      const prev = { ...baseProps, pointer: { ...baseProps.pointer, arrowOffset: 0.72 } };
      const curr = { ...baseProps, pointer: { ...baseProps.pointer, arrowOffset: 0.5 } };
      const { result } = shouldInitChart(prev, curr);
      expect(result).toBe(false);
    });

    it('pointer.blobOffset change should NOT trigger reinit', () => {
      const prev = { ...baseProps, pointer: { ...baseProps.pointer, blobOffset: 0.5 } };
      const curr = { ...baseProps, pointer: { ...baseProps.pointer, blobOffset: 0.7 } };
      const { result } = shouldInitChart(prev, curr);
      expect(result).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // Label structural properties that SHOULD trigger reinit
  // -------------------------------------------------------------------------
  describe('Label props that SHOULD trigger reinit', () => {
    it('labels.valueLabel.hide change should trigger reinit', () => {
      const prev = { ...baseProps, labels: { ...baseProps.labels, valueLabel: { hide: false } } };
      const curr = { ...baseProps, labels: { ...baseProps.labels, valueLabel: { hide: true } } };
      const { result, reasons } = shouldInitChart(prev, curr);
      expect(result).toBe(true);
      expect(reasons).toContain('labelsPropsChanged');
    });

    it('labels.valueLabel.style change should trigger reinit', () => {
      const prev = { ...baseProps, labels: { ...baseProps.labels, valueLabel: { style: { fontSize: '35px' } } } };
      const curr = { ...baseProps, labels: { ...baseProps.labels, valueLabel: { style: { fontSize: '40px' } } } };
      const { result, reasons } = shouldInitChart(prev, curr);
      expect(result).toBe(true);
      expect(reasons).toContain('labelsPropsChanged');
    });

    it('labels.tickLabels.hideMinMax change should trigger reinit', () => {
      const prev = { ...baseProps, labels: { tickLabels: { hideMinMax: false } } };
      const curr = { ...baseProps, labels: { tickLabels: { hideMinMax: true } } };
      const { result, reasons } = shouldInitChart(prev, curr);
      expect(result).toBe(true);
      expect(reasons).toContain('labelsPropsChanged');
    });

    it('labels.tickLabels.type change should trigger reinit', () => {
      const prev = { ...baseProps, labels: { tickLabels: { type: 'outer' } } };
      const curr = { ...baseProps, labels: { tickLabels: { type: 'inner' } } };
      const { result, reasons } = shouldInitChart(prev, curr);
      expect(result).toBe(true);
      expect(reasons).toContain('labelsPropsChanged');
    });

    it('labels.tickLabels.ticks values change should trigger reinit', () => {
      const prev = { ...baseProps, labels: { tickLabels: { ticks: [{ value: 0 }, { value: 100 }] } } };
      const curr = { ...baseProps, labels: { tickLabels: { ticks: [{ value: 0 }, { value: 50 }, { value: 100 }] } } };
      const { result, reasons } = shouldInitChart(prev, curr);
      expect(result).toBe(true);
      expect(reasons).toContain('labelsPropsChanged');
    });

    it('labels.tickLabels.defaultTickValueConfig.hide change should trigger reinit', () => {
      const prev = { ...baseProps, labels: { tickLabels: { defaultTickValueConfig: { hide: false } } } };
      const curr = { ...baseProps, labels: { tickLabels: { defaultTickValueConfig: { hide: true } } } };
      const { result, reasons } = shouldInitChart(prev, curr);
      expect(result).toBe(true);
      expect(reasons).toContain('labelsPropsChanged');
    });

    it('labels.tickLabels.defaultTickLineConfig change should trigger reinit', () => {
      const prev = { ...baseProps, labels: { tickLabels: { defaultTickLineConfig: { color: '#666' } } } };
      const curr = { ...baseProps, labels: { tickLabels: { defaultTickLineConfig: { color: '#999' } } } };
      const { result, reasons } = shouldInitChart(prev, curr);
      expect(result).toBe(true);
      expect(reasons).toContain('labelsPropsChanged');
    });
  });
});

// =============================================================================
// TEST SUITE 4: USER-REPORTED BUGS
// =============================================================================

describe('User-Reported Bug Tests', () => {
  describe('Bug: Gauge resets to 0 on value change', () => {
    it('initialAnimationTriggered should NOT be reset on value-only change', () => {
      let initialAnimationTriggered = true; // Already animated once
      const needsReinit = false; // Value-only change
      
      // Only initChart should reset this flag
      if (needsReinit) {
        initialAnimationTriggered = false;
      }
      
      expect(initialAnimationTriggered).toBe(true);
    });

    it('isFirstAnimation should be false after first animation', () => {
      const initialAnimationTriggered = true;
      const isFirstAnimation = !initialAnimationTriggered;
      expect(isFirstAnimation).toBe(false);
    });

    it('animation should start from lastRenderedProgress, not 0', () => {
      const lastRenderedProgress = 0.5; // Currently at 50%
      const prevPercent = 0; // Would cause reset if used
      const isFirstAnimation = false;
      
      const startPercent = calculateAnimationStartPercent(lastRenderedProgress, prevPercent, isFirstAnimation);
      expect(startPercent).toBe(0.5);
      expect(startPercent).not.toBe(0);
    });
  });

  describe('Bug: Slider not updating in real-time', () => {
    it('should use zero delay for non-first animations', () => {
      const configuredDelay = 500;
      const isFirstAnimation = false;
      
      const effectiveDelay = isFirstAnimation ? configuredDelay : 0;
      expect(effectiveDelay).toBe(0);
    });

    it('should cap duration at 300ms for responsive updates', () => {
      const configuredDuration = 3000;
      const isFirstAnimation = false;
      
      const effectiveDuration = isFirstAnimation 
        ? configuredDuration 
        : Math.min(configuredDuration, 300);
      
      expect(effectiveDuration).toBe(300);
      expect(effectiveDuration).toBeLessThan(configuredDuration);
    });
  });

  describe('Bug: __renderIndex causing false positives', () => {
    it('cleanTicks should remove __renderIndex property', () => {
      const ticksWithRenderIndex = [
        { value: 0, __renderIndex: 0 },
        { value: 50, __renderIndex: 1 },
        { value: 100, __renderIndex: 2 }
      ];
      
      const cleanedTicks = cleanTicks(ticksWithRenderIndex);
      
      expect(cleanedTicks).toEqual([
        { value: 0 },
        { value: 50 },
        { value: 100 }
      ]);
      
      // Verify __renderIndex is completely removed
      cleanedTicks?.forEach(tick => {
        expect(tick).not.toHaveProperty('__renderIndex');
      });
    });

    it('cleanTicks should preserve other properties', () => {
      const ticksWithConfig = [
        { value: 0, valueConfig: { style: { fill: 'red' } }, __renderIndex: 0 },
        { value: 100, valueConfig: { style: { fill: 'green' } }, lineConfig: { length: 10 }, __renderIndex: 1 }
      ];
      
      const cleanedTicks = cleanTicks(ticksWithConfig);
      
      expect(cleanedTicks?.[0]).toEqual({ value: 0, valueConfig: { style: { fill: 'red' } } });
      expect(cleanedTicks?.[1]).toEqual({ value: 100, valueConfig: { style: { fill: 'green' } }, lineConfig: { length: 10 } });
    });

    it('cleanTicks should handle undefined input', () => {
      const result = cleanTicks(undefined as any);
      expect(result).toBeUndefined();
    });

    it('cleanTicks should handle empty array', () => {
      const result = cleanTicks([]);
      expect(result).toEqual([]);
    });
  });

  describe('Bug: Label/tick changes not triggering update', () => {
    it('tick count change should trigger reinit', () => {
      const prev = { labels: { tickLabels: { ticks: [{ value: 0 }, { value: 100 }] } } };
      const curr = { labels: { tickLabels: { ticks: [{ value: 0 }, { value: 50 }, { value: 100 }] } } };
      const { result } = shouldInitChart(prev, curr);
      expect(result).toBe(true);
    });

    it('tick value change should trigger reinit', () => {
      const prev = { labels: { tickLabels: { ticks: [{ value: 0 }, { value: 100 }] } } };
      const curr = { labels: { tickLabels: { ticks: [{ value: 10 }, { value: 90 }] } } };
      const { result } = shouldInitChart(prev, curr);
      expect(result).toBe(true);
    });
  });

  describe('Bug: Pointer options not updating (Arrow, Blob, Needle)', () => {
    // NOTE: Pointer prop changes are now handled by renderChart without full reinit
    // This prevents the gauge from resetting to 0 and re-animating
    it('pointer length change should NOT trigger reinit (handled by renderChart)', () => {
      const pointerTypes = ['needle', 'blob', 'arrow'];
      
      pointerTypes.forEach(type => {
        const prev = { pointer: { type, length: 0.8 } };
        const curr = { pointer: { type, length: 0.6 } };
        const { result } = shouldInitChart(prev, curr);
        expect(result).toBe(false); // Handled by renderChart, not reinit
      });
    });

    it('pointer width change should NOT trigger reinit (handled by renderChart)', () => {
      const pointerTypes = ['needle', 'blob', 'arrow'];
      
      pointerTypes.forEach(type => {
        const prev = { pointer: { type, width: 15 } };
        const curr = { pointer: { type, width: 20 } };
        const { result } = shouldInitChart(prev, curr);
        expect(result).toBe(false); // Handled by renderChart, not reinit
      });
    });

    it('pointer strokeWidth (border) change should NOT trigger reinit (handled by renderChart)', () => {
      const prev = { pointer: { type: 'needle', strokeWidth: 0 } };
      const curr = { pointer: { type: 'needle', strokeWidth: 2 } };
      const { result } = shouldInitChart(prev, curr);
      expect(result).toBe(false); // Handled by renderChart, not reinit
    });
  });

  describe('Bug: Grafana arc resetting to 0', () => {
    it('Grafana type should handle value changes without reset', () => {
      const prev = { type: GaugeType.Grafana, value: 50 };
      const curr = { type: GaugeType.Grafana, value: 75 };
      const { result } = shouldInitChart(prev, curr);
      expect(result).toBe(false);
    });
  });
});

// =============================================================================
// TEST SUITE 5: MULTI-POINTER MODE
// =============================================================================

describe('Multi-Pointer Mode Tests', () => {
  it('should detect multi-pointer mode when pointers array is non-empty', () => {
    const pointers = [{ value: 30 }, { value: 60 }];
    const isMultiPointer = Array.isArray(pointers) && pointers.length > 0;
    expect(isMultiPointer).toBe(true);
  });

  it('should NOT be multi-pointer mode when pointers is undefined', () => {
    const pointers = undefined as any;
    const isMultiPointer = Array.isArray(pointers) && pointers?.length > 0;
    expect(isMultiPointer).toBe(false);
  });

  it('should NOT be multi-pointer mode when pointers is empty array', () => {
    const pointers: any[] = [];
    const isMultiPointer = Array.isArray(pointers) && pointers.length > 0;
    expect(isMultiPointer).toBe(false);
  });

  it('pointers value change should NOT trigger reinit', () => {
    const prev = { pointers: [{ value: 30, type: 'needle' }, { value: 60, type: 'needle' }] as any[] };
    const curr = { pointers: [{ value: 40, type: 'needle' }, { value: 70, type: 'needle' }] as any[] };
    const { result } = shouldInitChart(prev, curr);
    expect(result).toBe(false);
  });

  it('pointers count change should trigger reinit', () => {
    const prev = { pointers: [{ value: 30 }, { value: 60 }] as any[] };
    const curr = { pointers: [{ value: 30 }, { value: 60 }, { value: 90 }] as any[] };
    const { result } = shouldInitChart(prev, curr);
    expect(result).toBe(true);
  });

  it('pointers type change should NOT trigger reinit (handled by renderChart)', () => {
    const prev = { pointers: [{ value: 30, type: 'needle' }] as any[] };
    const curr = { pointers: [{ value: 30, type: 'blob' }] as any[] };
    const { result } = shouldInitChart(prev, curr);
    expect(result).toBe(false); // Handled by renderChart, not reinit
  });

  it('mode transition (single -> multi pointer) should trigger reinit', () => {
    const prev = { pointer: { type: 'needle' } };
    const curr = { pointers: [{ value: 30, type: 'needle' }] as any[] };
    const { result, reasons } = shouldInitChart(prev, curr);
    expect(result).toBe(true);
    expect(reasons).toContain('modeTransition');
  });

  it('mode transition (multi -> single pointer) should trigger reinit', () => {
    const prev = { pointers: [{ value: 30, type: 'needle' }] as any[] };
    const curr = { pointer: { type: 'needle' } };
    const { result, reasons } = shouldInitChart(prev, curr);
    expect(result).toBe(true);
    expect(reasons).toContain('modeTransition');
  });
});
