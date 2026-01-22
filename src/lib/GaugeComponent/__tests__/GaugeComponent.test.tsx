import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import GaugeComponent from '../index';
import { GaugeComponentProps } from '../types/GaugeComponentProps';

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

const waitForNextFrame = () => new Promise(resolve => setTimeout(resolve, 20));

const renderComponent = async (props: Partial<GaugeComponentProps> = {}, width = 400, height = 300): Promise<HTMLDivElement> => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    await act(async () => {
        ReactDOM.render(<GaugeComponent {...props} />, container);
    });
    triggerResize(container, width, height);
    // Wait for ResizeObserver setTimeout and requestAnimationFrame
    await act(async () => {
        await waitForNextFrame();
    });
    return container;
};

const unmountComponent = (container: HTMLDivElement) => {
    ReactDOM.unmountComponentAtNode(container);
    container.remove();
};

describe('GaugeComponent', () => {
    let container: HTMLDivElement;

    afterEach(() => {
        if (container) {
            unmountComponent(container);
        }
    });

    describe('Basic Rendering', () => {
        it('renders without crashing', async () => {
            container = await renderComponent();
            expect(container.querySelector('svg')).toBeTruthy();
        });

        it('renders semicircle type', async () => {
            container = await renderComponent({ type: 'semicircle', value: 50 });
            expect(container.querySelector('svg')).toBeTruthy();
        });

        it('renders radial type', async () => {
            container = await renderComponent({ type: 'radial', value: 50 });
            expect(container.querySelector('svg')).toBeTruthy();
        });
    });

    describe('Value Label with renderContent', () => {
        it('renders custom content via renderContent on initial render', async () => {
            const renderContent = jest.fn((value: number) => <p data-testid="custom-value">{value}</p>);
            
            container = await renderComponent({
                type: 'semicircle',
                value: 50,
                labels: {
                    valueLabel: {
                        renderContent,
                    },
                },
            });

            // The renderContent function should have been called
            expect(renderContent).toHaveBeenCalled();
            
            // The custom content should be rendered in the DOM
            const customContent = container.querySelector('[data-testid="custom-value"]');
            expect(customContent).toBeTruthy();
            expect(customContent?.textContent).toBe('50');
        });

        it('renders custom content with paragraph element on initial render', async () => {
            container = await renderComponent({
                type: 'semicircle',
                value: 75,
                labels: {
                    valueLabel: {
                        renderContent: (value) => <p className="custom-label">{value}%</p>,
                    },
                },
            });

            const customLabel = container.querySelector('.custom-label');
            expect(customLabel).toBeTruthy();
            expect(customLabel?.textContent).toBe('75%');
        });

        it('renders custom content with complex React elements', async () => {
            container = await renderComponent({
                type: 'semicircle',
                value: 60,
                labels: {
                    valueLabel: {
                        renderContent: (value, arcColor) => (
                            <div className="complex-content">
                                <span className="value">{value}</span>
                                <span className="unit">km/h</span>
                            </div>
                        ),
                    },
                },
            });

            const complexContent = container.querySelector('.complex-content');
            expect(complexContent).toBeTruthy();
            
            const valueSpan = container.querySelector('.value');
            expect(valueSpan?.textContent).toBe('60');
            
            const unitSpan = container.querySelector('.unit');
            expect(unitSpan?.textContent).toBe('km/h');
        });

        it('passes arcColor to renderContent function', async () => {
            const renderContent = jest.fn((value: number, arcColor: string) => (
                <span style={{ color: arcColor }}>{value}</span>
            ));
            
            container = await renderComponent({
                type: 'semicircle',
                value: 50,
                arc: {
                    subArcs: [
                        { limit: 50, color: '#5BE12C' },
                        { limit: 100, color: '#EA4228' },
                    ],
                },
                labels: {
                    valueLabel: {
                        renderContent,
                    },
                },
            });

            expect(renderContent).toHaveBeenCalledWith(expect.any(Number), expect.any(String));
        });

        it('updates custom content when value changes', async () => {
            const renderContent = jest.fn((value: number) => <span className="dynamic-value">{value}</span>);
            
            container = await renderComponent({
                type: 'semicircle',
                value: 30,
                labels: {
                    valueLabel: {
                        renderContent,
                    },
                },
            });

            // Initial render
            let valueElement = container.querySelector('.dynamic-value');
            expect(valueElement?.textContent).toBe('30');

            // Update value
            await act(async () => {
                ReactDOM.render(
                    <GaugeComponent
                        type="semicircle"
                        value={70}
                        labels={{
                            valueLabel: {
                                renderContent,
                            },
                        }}
                    />,
                    container
                );
            });
            
            await act(async () => {
                await waitForNextFrame();
            });

            valueElement = container.querySelector('.dynamic-value');
            expect(valueElement?.textContent).toBe('70');
        });

        it('renders renderContent on radial gauge type', async () => {
            container = await renderComponent({
                type: 'radial',
                value: 45,
                labels: {
                    valueLabel: {
                        renderContent: (value) => <div className="radial-content">{value}</div>,
                    },
                },
            });

            const content = container.querySelector('.radial-content');
            expect(content).toBeTruthy();
            expect(content?.textContent).toBe('45');
        });

        it('renders renderContent on grafana gauge type', async () => {
            container = await renderComponent({
                type: 'grafana',
                value: 85,
                labels: {
                    valueLabel: {
                        renderContent: (value) => <div className="grafana-content">{value}</div>,
                    },
                },
            });

            const content = container.querySelector('.grafana-content');
            expect(content).toBeTruthy();
            expect(content?.textContent).toBe('85');
        });

        it('does not render custom content when valueLabel is hidden', async () => {
            const renderContent = jest.fn((value: number) => <span>{value}</span>);
            
            container = await renderComponent({
                type: 'semicircle',
                value: 50,
                labels: {
                    valueLabel: {
                        hide: true,
                        renderContent,
                    },
                },
            });

            // renderContent should not be called when label is hidden
            expect(renderContent).not.toHaveBeenCalled();
        });
    });
});
