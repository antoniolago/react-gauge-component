import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import LinearGaugeComponent from '../LinearGaugeComponent';
import { LinearGaugeComponentProps } from '../types/LinearGauge';

// Mock ResizeObserver
class MockResizeObserver {
    observe = jest.fn();
    unobserve = jest.fn();
    disconnect = jest.fn();
    callback: ResizeObserverCallback;
    
    constructor(callback: ResizeObserverCallback) {
        this.callback = callback;
    }
    
    trigger(entries: Partial<ResizeObserverEntry>[]) {
        this.callback(entries as ResizeObserverEntry[], this as unknown as ResizeObserver);
    }
}

let resizeObserverInstance: MockResizeObserver;

beforeAll(() => {
    global.ResizeObserver = jest.fn((callback) => {
        resizeObserverInstance = new MockResizeObserver(callback);
        return resizeObserverInstance;
    }) as unknown as typeof ResizeObserver;
});

const triggerResize = (container: HTMLElement, width: number, height: number) => {
    if (resizeObserverInstance) {
        act(() => {
            resizeObserverInstance.trigger([{
                contentRect: { width, height, top: 0, left: 0, bottom: height, right: width, x: 0, y: 0, toJSON: () => ({}) }
            }]);
        });
    }
};

const renderComponent = (props: Partial<LinearGaugeComponentProps> = {}, width = 300, height = 100): HTMLDivElement => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    act(() => {
        ReactDOM.render(<LinearGaugeComponent {...props} />, container);
    });
    triggerResize(container, width, height);
    return container;
};

const unmountComponent = (container: HTMLDivElement) => {
    ReactDOM.unmountComponentAtNode(container);
    container.remove();
};

describe('LinearGaugeComponent', () => {
    let container: HTMLDivElement;

    afterEach(() => {
        if (container) {
            unmountComponent(container);
        }
    });

    describe('Basic Rendering', () => {
        it('renders without crashing', () => {
            container = renderComponent();
            expect(container.querySelector('svg')).toBeTruthy();
        });

        it('renders with custom value', () => {
            container = renderComponent({ value: 75 });
            expect(container.querySelector('svg')).toBeTruthy();
        });

        it('renders with custom min/max values', () => {
            container = renderComponent({ value: 50, minValue: 0, maxValue: 200 });
            expect(container.querySelector('svg')).toBeTruthy();
        });

        it('renders with id and className', () => {
            container = renderComponent({ id: 'test-gauge', className: 'custom-class' });
            const wrapper = container.firstChild as HTMLElement;
            expect(wrapper.getAttribute('id')).toBe('test-gauge');
            expect(wrapper.className).toContain('custom-class');
        });
    });

    describe('Orientation', () => {
        it('renders horizontal orientation (default)', () => {
            container = renderComponent({ orientation: 'horizontal' });
            expect(container.querySelector('svg')).toBeTruthy();
        });

        it('renders vertical orientation', () => {
            container = renderComponent({ orientation: 'vertical' }, 100, 300);
            expect(container.querySelector('svg')).toBeTruthy();
        });
    });

    describe('Track Options', () => {
        it('renders with custom track thickness', () => {
            container = renderComponent({ track: { thickness: 30 } });
            expect(container.querySelector('rect')).toBeTruthy();
        });

        it('renders with custom background color', () => {
            container = renderComponent({ track: { backgroundColor: '#ff0000' } });
            const rect = container.querySelector('rect');
            expect(rect?.getAttribute('fill')).toBe('#ff0000');
        });

        it('renders with border radius', () => {
            container = renderComponent({ track: { borderRadius: 10 } });
            const rect = container.querySelector('rect');
            expect(rect?.getAttribute('rx')).toBe('10');
        });

        it('renders with stroke', () => {
            container = renderComponent({ track: { strokeWidth: 2, strokeColor: '#000' } });
            const rect = container.querySelector('rect');
            expect(rect?.getAttribute('stroke')).toBe('#000');
            expect(rect?.getAttribute('stroke-width')).toBe('2');
        });

        it('renders with segments', () => {
            container = renderComponent({ 
                value: 50,
                track: { 
                    segments: [
                        { limit: 33, color: '#5BE12C' },
                        { limit: 66, color: '#F5CD19' },
                        { color: '#EA4228' }
                    ]
                } 
            });
            const rects = container.querySelectorAll('rect');
            expect(rects.length).toBeGreaterThan(1);
        });
    });

    describe('Pointer Types', () => {
        const pointerTypes: Array<'triangle' | 'arrow' | 'diamond' | 'line' | 'pill' | 'none'> = 
            ['triangle', 'arrow', 'diamond', 'line', 'pill', 'none'];

        pointerTypes.forEach(type => {
            it(`renders ${type} pointer type`, () => {
                container = renderComponent({ pointer: { type } });
                expect(container.querySelector('svg')).toBeTruthy();
                
                if (type !== 'none') {
                    expect(container.querySelector('.pointer')).toBeTruthy();
                }
            });
        });

        it('renders pointer with custom color', () => {
            container = renderComponent({ pointer: { type: 'triangle', color: '#ff0000' } });
            const path = container.querySelector('.pointer path');
            if (path) {
                expect(path.getAttribute('fill')).toBe('#ff0000');
            }
        });

        it('renders pointer with custom size', () => {
            container = renderComponent({ pointer: { type: 'triangle', size: 20 } });
            expect(container.querySelector('.pointer')).toBeTruthy();
        });

        it('renders pointer with custom height', () => {
            container = renderComponent({ pointer: { type: 'arrow', size: 14, height: 25 } });
            expect(container.querySelector('.pointer')).toBeTruthy();
        });
    });

    describe('Pointer Positions', () => {
        const horizontalPositions: Array<'top' | 'bottom' | 'both' | 'inside'> = ['top', 'bottom', 'both', 'inside'];
        const verticalPositions: Array<'left' | 'right' | 'both' | 'inside'> = ['left', 'right', 'both', 'inside'];

        horizontalPositions.forEach(position => {
            it(`renders pointer at ${position} position (horizontal)`, () => {
                container = renderComponent({ 
                    orientation: 'horizontal',
                    pointer: { type: 'triangle', position } 
                });
                expect(container.querySelector('.pointer')).toBeTruthy();
            });
        });

        verticalPositions.forEach(position => {
            it(`renders pointer at ${position} position (vertical)`, () => {
                container = renderComponent({ 
                    orientation: 'vertical',
                    pointer: { type: 'triangle', position } 
                }, 100, 300);
                expect(container.querySelector('.pointer')).toBeTruthy();
            });
        });
    });

    describe('Tick Positions', () => {
        const horizontalTickPositions: Array<'inside-top' | 'inside-bottom' | 'top' | 'bottom' | 'both'> = 
            ['inside-top', 'inside-bottom', 'top', 'bottom', 'both'];
        const verticalTickPositions: Array<'inside-left' | 'inside-right' | 'left' | 'right' | 'both'> = 
            ['inside-left', 'inside-right', 'left', 'right', 'both'];

        horizontalTickPositions.forEach(position => {
            it(`renders ticks at ${position} position (horizontal)`, () => {
                container = renderComponent({ 
                    orientation: 'horizontal',
                    ticks: { count: 5, position } 
                });
                expect(container.querySelector('.ticks')).toBeTruthy();
            });
        });

        verticalTickPositions.forEach(position => {
            it(`renders ticks at ${position} position (vertical)`, () => {
                container = renderComponent({ 
                    orientation: 'vertical',
                    ticks: { count: 5, position } 
                }, 100, 300);
                expect(container.querySelector('.ticks')).toBeTruthy();
            });
        });
    });

    describe('Tick Options', () => {
        it('renders with custom tick count', () => {
            container = renderComponent({ ticks: { count: 10 } });
            expect(container.querySelector('.ticks')).toBeTruthy();
        });

        it('renders with minor ticks', () => {
            container = renderComponent({ ticks: { count: 5, minorTicks: 4 } });
            const tickGroup = container.querySelector('.ticks');
            const lines = tickGroup?.querySelectorAll('line');
            expect(lines?.length).toBeGreaterThan(5);
        });

        it('renders with custom major tick length', () => {
            container = renderComponent({ ticks: { count: 5, majorLength: 20 } });
            expect(container.querySelector('.ticks')).toBeTruthy();
        });

        it('renders with custom minor tick length', () => {
            container = renderComponent({ ticks: { count: 5, minorTicks: 2, minorLength: 8 } });
            expect(container.querySelector('.ticks')).toBeTruthy();
        });

        it('renders with custom tick color', () => {
            container = renderComponent({ ticks: { count: 5, color: '#ff0000' } });
            const line = container.querySelector('.ticks line');
            expect(line?.getAttribute('stroke')).toBe('#ff0000');
        });

        it('hides ticks when count is 0', () => {
            container = renderComponent({ ticks: { count: 0 } });
            const tickGroup = container.querySelector('.ticks');
            expect(tickGroup).toBeFalsy();
        });

        it('renders labels on major ticks only', () => {
            container = renderComponent({ ticks: { count: 5, minorTicks: 2, labelsOnMajorOnly: true } });
            const tickGroup = container.querySelector('.ticks');
            const texts = tickGroup?.querySelectorAll('text');
            expect(texts?.length).toBe(6); // 5 intervals = 6 major ticks
        });
    });

    describe('Value Label', () => {
        it('renders value label by default', () => {
            container = renderComponent({ value: 50 });
            const texts = container.querySelectorAll('svg text');
            const valueText = Array.from(texts).find(t => t.textContent === '50');
            expect(valueText).toBeTruthy();
        });

        it('hides value label when hide is true', () => {
            container = renderComponent({ value: 50, valueLabel: { hide: true } });
            const svg = container.querySelector('svg');
            const allTexts = svg?.querySelectorAll('text');
            const tickTexts = container.querySelectorAll('.ticks text');
            expect(allTexts?.length).toBe(tickTexts.length);
        });

        it('renders value label with decimal digits', () => {
            container = renderComponent({ value: 50.567, valueLabel: { maxDecimalDigits: 2 } });
            const texts = container.querySelectorAll('svg text');
            const valueText = Array.from(texts).find(t => t.textContent === '50.57');
            expect(valueText).toBeTruthy();
        });

        it('renders value label with custom format', () => {
            container = renderComponent({ value: 50, valueLabel: { formatValue: (v: number) => `${v}%` } });
            const texts = container.querySelectorAll('svg text');
            const valueText = Array.from(texts).find(t => t.textContent === '50%');
            expect(valueText).toBeTruthy();
        });

        it('matches color with segment', () => {
            container = renderComponent({ 
                value: 20,
                track: {
                    segments: [
                        { limit: 33, color: '#5BE12C' },
                        { limit: 66, color: '#F5CD19' },
                        { color: '#EA4228' }
                    ]
                },
                valueLabel: { matchColorWithSegment: true } 
            });
            const texts = container.querySelectorAll('svg text');
            const valueText = Array.from(texts).find(t => t.textContent === '20');
            expect(valueText?.getAttribute('fill')).toBe('#5BE12C');
        });
    });

    describe('Value Label Positions', () => {
        const positions: Array<'center' | 'right' | 'left' | 'top' | 'bottom'> = 
            ['center', 'right', 'left', 'top', 'bottom'];

        positions.forEach(position => {
            it(`renders value label at ${position} position`, () => {
                container = renderComponent({ value: 50, valueLabel: { position } });
                const texts = container.querySelectorAll('svg text');
                const valueText = Array.from(texts).find(t => t.textContent === '50');
                expect(valueText).toBeTruthy();
            });
        });
    });

    describe('Reactivity', () => {
        it('updates when value changes', () => {
            container = renderComponent({ value: 25 });
            let texts = container.querySelectorAll('svg text');
            let valueText = Array.from(texts).find(t => t.textContent === '25');
            expect(valueText).toBeTruthy();
            
            act(() => {
                ReactDOM.render(<LinearGaugeComponent value={75} />, container);
            });
            triggerResize(container, 300, 100);
            
            texts = container.querySelectorAll('svg text');
            valueText = Array.from(texts).find(t => t.textContent === '75');
            expect(valueText).toBeTruthy();
        });

        it('updates when pointer type changes', () => {
            container = renderComponent({ pointer: { type: 'triangle' } });
            expect(container.querySelector('.pointer path')).toBeTruthy();
            
            act(() => {
                ReactDOM.render(<LinearGaugeComponent pointer={{ type: 'line' }} />, container);
            });
            triggerResize(container, 300, 100);
            
            expect(container.querySelector('.pointer line')).toBeTruthy();
        });

        it('updates when orientation changes', () => {
            container = renderComponent({ orientation: 'horizontal' });
            expect(container.querySelector('svg')).toBeTruthy();
            
            act(() => {
                ReactDOM.render(<LinearGaugeComponent orientation="vertical" />, container);
            });
            triggerResize(container, 100, 300);
            
            expect(container.querySelector('svg')).toBeTruthy();
        });
    });

    describe('Edge Cases', () => {
        it('clamps value to min', () => {
            container = renderComponent({ value: -10, minValue: 0, maxValue: 100 });
            const texts = container.querySelectorAll('svg text');
            const valueText = Array.from(texts).find(t => t.textContent === '0');
            expect(valueText).toBeTruthy();
        });

        it('clamps value to max', () => {
            container = renderComponent({ value: 150, minValue: 0, maxValue: 100 });
            const texts = container.querySelectorAll('svg text');
            const valueText = Array.from(texts).find(t => t.textContent === '100');
            expect(valueText).toBeTruthy();
        });

        it('handles zero range gracefully', () => {
            container = renderComponent({ value: 50, minValue: 50, maxValue: 50 });
            expect(container.querySelector('svg')).toBeTruthy();
        });

        it('handles negative range', () => {
            container = renderComponent({ value: -25, minValue: -100, maxValue: 0 });
            expect(container.querySelector('svg')).toBeTruthy();
        });
    });
});
