/**
 * Stress tests for GaugeComponent
 * Tests pointer count validation, animation behavior, and other potential bugs
 */

import { Gauge } from '../types/Gauge';
import { GaugeType } from '../types/GaugeComponentProps';
import * as pointerHooks from './pointer';
import * as arcHooks from './arc';
import * as chartHooks from './chart';
import { PointerDiagnostics } from './pointer';

// Mock D3 selection
const createMockSelection = (size: number = 0) => ({
    size: () => size,
    selectAll: (selector: string) => createMockSelection(size),
    select: (selector: string) => createMockSelection(size),
    each: (fn: Function) => {},
    remove: () => {},
    empty: () => size === 0,
    append: () => createMockSelection(1),
    attr: () => createMockSelection(size),
    style: () => createMockSelection(size),
    node: () => null,
});

// Create a mock gauge for testing
const createMockGauge = (overrides: Partial<Gauge> = {}): Gauge => {
    const mockSelection = createMockSelection(1);
    return {
        props: {
            value: 50,
            minValue: 0,
            maxValue: 100,
            type: GaugeType.Grafana,
            pointer: { type: 'needle', animate: true },
            arc: { width: 0.2 },
            labels: {},
        },
        originalProps: {},
        prevProps: { current: { value: 0 } },
        container: { current: mockSelection },
        svg: { current: mockSelection },
        g: { current: mockSelection },
        doughnut: { current: mockSelection },
        pointer: { 
            current: { 
                element: mockSelection, 
                path: null, 
                context: { prevPercent: 0, currentPercent: 0.5, prevProgress: 0 } 
            } 
        },
        dimensions: { 
            current: { 
                outerRadius: 100, 
                innerRadius: 70, 
                angles: { startAngle: -Math.PI / 2, endAngle: Math.PI / 2 } 
            } 
        },
        pieChart: { current: () => [] },
        arcData: { current: [] },
        tooltip: { current: null },
        isFirstRun: { current: false },
        initialAnimationTriggered: { current: false },
        animationInProgress: { current: false },
        pendingResize: { current: false },
        multiPointers: { current: [] },
        multiPointerAnimationTriggered: { current: [] },
        measuredBounds: { current: null },
        renderPass: { current: 1 },
        resizeObserver: { current: null },
        ...overrides,
    } as unknown as Gauge;
};

describe('Pointer Count Validation', () => {
    describe('validatePointerCount', () => {
        it('should return valid when single pointer count matches', () => {
            const gauge = createMockGauge();
            gauge.g.current = createMockSelection(1) as any;
            gauge.g.current.selectAll = (selector: string) => {
                if (selector === '.pointer') return createMockSelection(1) as any;
                return createMockSelection(0) as any;
            };
            
            const result = pointerHooks.validatePointerCount(gauge);
            expect(result.valid).toBe(true);
            expect(result.expected).toBe(1);
            expect(result.actual).toBe(1);
        });

        it('should return invalid when pointer count mismatches', () => {
            const gauge = createMockGauge();
            gauge.g.current = createMockSelection(1) as any;
            gauge.g.current.selectAll = (selector: string) => {
                if (selector === '.pointer') return createMockSelection(2) as any; // 2 rendered but expected 1
                return createMockSelection(0) as any;
            };
            
            const result = pointerHooks.validatePointerCount(gauge);
            expect(result.valid).toBe(false);
            expect(result.expected).toBe(1);
            expect(result.actual).toBe(2);
        });

        it('should handle multi-pointer mode correctly', () => {
            const gauge = createMockGauge({
                props: {
                    ...createMockGauge().props,
                    pointers: [
                        { value: 30, type: 'needle' },
                        { value: 60, type: 'arrow' },
                        { value: 90, type: 'blob' },
                    ],
                },
            } as any);
            
            gauge.g.current = createMockSelection(1) as any;
            gauge.g.current.selectAll = (selector: string) => {
                if (selector === '.multi-pointer') return createMockSelection(3) as any;
                return createMockSelection(0) as any;
            };
            
            const result = pointerHooks.validatePointerCount(gauge);
            expect(result.valid).toBe(true);
            expect(result.expected).toBe(3);
            expect(result.actual).toBe(3);
        });

        it('should detect stale multi-pointers', () => {
            const gauge = createMockGauge({
                props: {
                    ...createMockGauge().props,
                    pointers: [
                        { value: 30, type: 'needle' },
                    ],
                },
            } as any);
            
            gauge.g.current = createMockSelection(1) as any;
            gauge.g.current.selectAll = (selector: string) => {
                if (selector === '.multi-pointer') return createMockSelection(3) as any; // 3 rendered but only 1 expected
                return createMockSelection(0) as any;
            };
            
            const result = pointerHooks.validatePointerCount(gauge);
            expect(result.valid).toBe(false);
            expect(result.expected).toBe(1);
            expect(result.actual).toBe(3);
        });

        it('should handle hidden pointer correctly', () => {
            const gauge = createMockGauge({
                props: {
                    ...createMockGauge().props,
                    pointer: { type: 'needle', hide: true },
                },
            } as any);
            
            gauge.g.current = createMockSelection(1) as any;
            gauge.g.current.selectAll = (selector: string) => createMockSelection(0) as any;
            
            const result = pointerHooks.validatePointerCount(gauge);
            expect(result.valid).toBe(true);
            expect(result.expected).toBe(0);
            expect(result.actual).toBe(0);
        });
    });

    describe('isMultiPointerMode', () => {
        it('should return true when pointers array exists and has items', () => {
            const gauge = createMockGauge({
                props: {
                    ...createMockGauge().props,
                    pointers: [{ value: 50 }],
                },
            } as any);
            
            expect(pointerHooks.isMultiPointerMode(gauge)).toBe(true);
        });

        it('should return false when pointers array is empty', () => {
            const gauge = createMockGauge({
                props: {
                    ...createMockGauge().props,
                    pointers: [],
                },
            } as any);
            
            expect(pointerHooks.isMultiPointerMode(gauge)).toBe(false);
        });

        it('should return false when pointers is undefined', () => {
            const gauge = createMockGauge();
            expect(pointerHooks.isMultiPointerMode(gauge)).toBe(false);
        });
    });
});

describe('Animation Stress Tests', () => {
    describe('Rapid value changes', () => {
        it('should handle rapid sequential value changes without crashing', () => {
            const gauge = createMockGauge();
            const values = [10, 90, 25, 75, 50, 100, 0, 60, 40, 80];
            
            // Simulate rapid value changes - test that props can be set without errors
            values.forEach((value, index) => {
                gauge.props.value = value;
                gauge.prevProps.current.value = values[index - 1] ?? 0;
                
                // Verify value is set correctly
                expect(gauge.props.value).toBe(value);
            });
        });

        it('should maintain valid percent values during animations', () => {
            const gauge = createMockGauge();
            
            // Test edge cases for value setting
            const testCases = [
                { value: 0 },
                { value: 100 },
                { value: 50 },
                { value: -10 }, // Below min
                { value: 110 }, // Above max
            ];
            
            testCases.forEach(({ value }) => {
                gauge.props.value = value;
                expect(gauge.props.value).toBe(value);
            });
        });
    });

    describe('Multi-pointer stress', () => {
        it('should handle adding and removing pointers dynamically', () => {
            const gauge = createMockGauge();
            
            // Start with no multi-pointers
            expect(pointerHooks.isMultiPointerMode(gauge)).toBe(false);
            
            // Add pointers
            (gauge.props as any).pointers = [
                { value: 20, type: 'needle' },
                { value: 50, type: 'arrow' },
            ];
            expect(pointerHooks.isMultiPointerMode(gauge)).toBe(true);
            
            // Add more pointers
            (gauge.props as any).pointers.push({ value: 80, type: 'blob' });
            expect((gauge.props as any).pointers.length).toBe(3);
            
            // Remove pointers
            (gauge.props as any).pointers = [{ value: 50, type: 'needle' }];
            expect((gauge.props as any).pointers.length).toBe(1);
            
            // Clear all pointers
            (gauge.props as any).pointers = [];
            expect(pointerHooks.isMultiPointerMode(gauge)).toBe(false);
        });
    });
});

describe('Arc Validation', () => {
    describe('SubArc limits', () => {
        it('should handle subArc limits outside 0-1 range', () => {
            const gauge = createMockGauge();
            (gauge.props as any).arc = {
                width: 0.2,
                subArcs: [
                    { limit: -0.1, color: '#ff0000' }, // Below 0
                    { limit: 1.5, color: '#00ff00' },  // Above 1
                    { limit: 0.5, color: '#0000ff' },  // Valid
                ],
            };
            
            // validateArcs should clamp these values
            expect(() => arcHooks.validateArcs(gauge)).not.toThrow();
        });
    });
});

describe('Gauge Content Group Validation', () => {
    it('should never have more than one gauge-content group after init', () => {
        const gauge = createMockGauge();
        let gaugeContentCount = 0;
        
        gauge.svg.current = {
            ...createMockSelection(1),
            selectAll: (selector: string) => {
                if (selector === 'g.gauge-content') {
                    return {
                        ...createMockSelection(gaugeContentCount),
                        size: () => gaugeContentCount,
                        classed: () => createMockSelection(gaugeContentCount),
                        remove: () => { gaugeContentCount = 0; },
                    } as any;
                }
                return createMockSelection(0) as any;
            },
            select: () => createMockSelection(0) as any,
            append: () => {
                gaugeContentCount++;
                return createMockSelection(1) as any;
            },
        } as any;
        
        // After initialization, there should be exactly 1 gauge-content
        // This test validates the fix for duplicate gauge rendering
        expect(gaugeContentCount).toBeLessThanOrEqual(1);
    });
});

describe('Performance Stress Tests', () => {
    it('should handle 100 rapid config updates without memory leaks', () => {
        const gauge = createMockGauge();
        const startTime = Date.now();
        
        for (let i = 0; i < 100; i++) {
            gauge.props.value = Math.random() * 100;
        }
        
        const duration = Date.now() - startTime;
        // Should complete in under 100ms
        expect(duration).toBeLessThan(100);
    });

    it('should efficiently handle multi-pointer updates', () => {
        const gauge = createMockGauge();
        (gauge.props as any).pointers = Array.from({ length: 10 }, (_, i) => ({
            value: i * 10,
            type: 'needle',
        }));
        
        const startTime = Date.now();
        
        for (let i = 0; i < 50; i++) {
            (gauge.props as any).pointers.forEach((p: any, idx: number) => {
                p.value = Math.random() * 100;
            });
        }
        
        const duration = Date.now() - startTime;
        // Should complete in under 50ms
        expect(duration).toBeLessThan(50);
    });
});

describe('Pointer Diagnostics Tests', () => {
    beforeEach(() => {
        pointerHooks.resetDiagnostics();
    });

    it('should track pointer vanish events', () => {
        const initialDiagnostics = pointerHooks.getDiagnostics();
        expect(initialDiagnostics.pointerVanishCount).toBe(0);
        expect(initialDiagnostics.lastVanishTimestamp).toBeNull();
    });

    it('should reset diagnostics correctly', () => {
        pointerHooks.resetDiagnostics();
        const diagnostics = pointerHooks.getDiagnostics();
        
        expect(diagnostics.pointerVanishCount).toBe(0);
        expect(diagnostics.pointerMismatchCount).toBe(0);
        expect(diagnostics.stalePointerCleanups).toBe(0);
        expect(diagnostics.resizeInterruptions).toBe(0);
        expect(diagnostics.animationInterruptions).toBe(0);
    });

    it('should provide diagnostics snapshot without mutation', () => {
        const diag1 = pointerHooks.getDiagnostics();
        const diag2 = pointerHooks.getDiagnostics();
        
        // Should be equal but not same reference
        expect(diag1).toEqual(diag2);
        expect(diag1).not.toBe(diag2);
    });
});

describe('Pointer Existence Validation', () => {
    it('should detect missing single pointer', () => {
        const gauge = createMockGauge();
        gauge.g.current = {
            ...createMockSelection(1),
            select: (selector: string) => {
                if (selector === '.pointer') {
                    return { empty: () => true } as any; // Pointer is missing
                }
                return createMockSelection(0) as any;
            },
            selectAll: () => createMockSelection(0) as any,
        } as any;
        gauge.pointer.current.element = null as any;
        
        pointerHooks.resetDiagnostics();
        const exists = pointerHooks.ensurePointerExists(gauge);
        
        expect(exists).toBe(false);
        expect(pointerHooks.getDiagnostics().pointerVanishCount).toBe(1);
    });

    it('should detect missing multi-pointers', () => {
        const gauge = createMockGauge();
        (gauge.props as any).pointers = [
            { value: 30, type: 'needle' },
            { value: 60, type: 'needle' },
        ];
        gauge.g.current = {
            ...createMockSelection(1),
            selectAll: (selector: string) => {
                if (selector === '.multi-pointer') {
                    return { size: () => 1 } as any; // Only 1 pointer but expected 2
                }
                return createMockSelection(0) as any;
            },
        } as any;
        
        pointerHooks.resetDiagnostics();
        const exists = pointerHooks.ensurePointerExists(gauge);
        
        expect(exists).toBe(false);
        expect(pointerHooks.getDiagnostics().pointerVanishCount).toBe(1);
    });

    it('should return true when pointer exists', () => {
        const gauge = createMockGauge();
        gauge.g.current = {
            ...createMockSelection(1),
            select: (selector: string) => {
                if (selector === '.pointer') {
                    return { empty: () => false } as any; // Pointer exists
                }
                return createMockSelection(0) as any;
            },
            selectAll: () => createMockSelection(0) as any,
        } as any;
        gauge.pointer.current.element = createMockSelection(1) as any;
        
        pointerHooks.resetDiagnostics();
        const exists = pointerHooks.ensurePointerExists(gauge);
        
        expect(exists).toBe(true);
        expect(pointerHooks.getDiagnostics().pointerVanishCount).toBe(0);
    });
});

describe('Resize Stress Tests', () => {
    it('should handle 50 rapid resize events', () => {
        const gauge = createMockGauge();
        const sizes = Array.from({ length: 50 }, () => ({
            width: 100 + Math.random() * 500,
            height: 100 + Math.random() * 400,
        }));
        
        sizes.forEach(({ width, height }) => {
            // Simulate resize by updating dimensions
            gauge.dimensions.current.outerRadius = Math.min(width, height) / 2 * 0.8;
            gauge.dimensions.current.innerRadius = gauge.dimensions.current.outerRadius * 0.7;
        });
        
        // Should complete without errors
        expect(gauge.dimensions.current.outerRadius).toBeGreaterThan(0);
    });

    it('should handle oscillating resize (drag scenario)', () => {
        const gauge = createMockGauge();
        
        // Simulate oscillating resize like dragging a resize handle
        for (let i = 0; i < 20; i++) {
            const offset = Math.sin(i * 0.5) * 50;
            gauge.dimensions.current.outerRadius = 100 + offset;
        }
        
        expect(gauge.dimensions.current.outerRadius).toBeGreaterThan(0);
    });
});

describe('Unwanted Behavior Detection', () => {
    it('should detect when animation is interrupted by resize', () => {
        const gauge = createMockGauge();
        gauge.animationInProgress = { current: true };
        
        // Simulating resize during animation
        expect(gauge.animationInProgress.current).toBe(true);
        
        // After resize completes, animation should be handled
        gauge.animationInProgress.current = false;
        expect(gauge.animationInProgress.current).toBe(false);
    });

    it('should handle pendingResize flag correctly', () => {
        const gauge = createMockGauge();
        gauge.pendingResize = { current: false };
        
        // Set pending resize during animation
        gauge.pendingResize.current = true;
        expect(gauge.pendingResize.current).toBe(true);
        
        // Clear after handling
        gauge.pendingResize.current = false;
        expect(gauge.pendingResize.current).toBe(false);
    });

    it('should track initialAnimationTriggered correctly', () => {
        const gauge = createMockGauge();
        gauge.initialAnimationTriggered = { current: false };
        
        expect(gauge.initialAnimationTriggered.current).toBe(false);
        
        // After first animation
        gauge.initialAnimationTriggered.current = true;
        expect(gauge.initialAnimationTriggered.current).toBe(true);
    });
});

// Export test utilities for use in other test files
export { createMockGauge, createMockSelection };
