import CONSTANTS from "../constants";
import { Arc } from "../types/Arc";
import { Gauge } from "../types/Gauge";
import { GaugeType, GaugeInnerMarginInPercent } from "../types/GaugeComponentProps";
import { Labels } from "../types/Labels";
import * as arcHooks from "./arc";
import * as labelsHooks from "./labels";
import * as pointerHooks from "./pointer";
import * as utilHooks from "./utils";
import * as coordinateSystem from "./coordinateSystem";
import { GaugeLayout } from "./coordinateSystem";
export const initChart = (gauge: Gauge, isFirstRender: boolean) => {
    const { angles } = gauge.dimensions.current;
    // if (gauge.resizeObserver?.current?.disconnect) {
    //     gauge.resizeObserver?.current?.disconnect();
    // }
    let updatedValue = (JSON.stringify(gauge.prevProps.current.value) !== JSON.stringify(gauge.props.value));
    if (updatedValue && !isFirstRender) {
        renderChart(gauge, false);
        return;
    }
    gauge.container.current.select("svg").remove();
    gauge.svg.current = gauge.container.current.append("svg");
    gauge.g.current = gauge.svg.current.append("g"); //Used for margins
    gauge.doughnut.current = gauge.g.current.append("g").attr("class", "doughnut");
    //gauge.outerDougnut.current = gauge.g.current.append("g").attr("class", "doughnut");
    calculateAngles(gauge);
    gauge.pieChart.current
        .value((d: any) => d.value)
        //.padAngle(15)
        .startAngle(angles.startAngle)
        .endAngle(angles.endAngle)
        .sort(null);
    //Set up pointer
    pointerHooks.addPointerElement(gauge);
    renderChart(gauge, true);
}
export const calculateAngles = (gauge: Gauge) => {
    const { angles } = gauge.dimensions.current;
    if (gauge.props.type == GaugeType.Semicircle) {
        angles.startAngle = -Math.PI / 2 + 0.02;
        angles.endAngle = Math.PI / 2 - 0.02;
    } else if (gauge.props.type == GaugeType.Radial) {
        angles.startAngle = -Math.PI / 1.37;
        angles.endAngle = Math.PI / 1.37;
    } else if (gauge.props.type == GaugeType.Grafana) {
        angles.startAngle = -Math.PI / 1.6;
        angles.endAngle = Math.PI / 1.6;
    }
}
//Renders the chart, should be called every time the window is resized
export const renderChart = (gauge: Gauge, resize: boolean = false) => {
    const { dimensions } = gauge;
    let arc = gauge.props.arc as Arc;
    let labels = gauge.props.labels as Labels;

    if (resize) {
        var parentNode = gauge.container.current.node() as HTMLElement;
        if (!parentNode) return;
        
        var rect = parentNode.getBoundingClientRect();
        var parentWidth = rect.width;
        var parentHeight = rect.height;
        
        // Skip render if dimensions are not available yet
        if (parentWidth <= 0 || parentHeight <= 0) {
            if (CONSTANTS.debugLogs) {
                console.log('[renderChart] Skipping render - invalid dimensions:', { width: parentWidth, height: parentHeight });
            }
            return;
        }
        
        // Initialize render pass tracking
        if (!gauge.renderPass) {
            gauge.renderPass = { current: 1 };
        }
        if (!gauge.measuredBounds) {
            gauge.measuredBounds = { current: null };
        }
        
        const currentPass = gauge.renderPass.current;
        
        if (CONSTANTS.debugLogs) {
            console.log(`[renderChart] Pass ${currentPass} - Container:`, { width: parentWidth, height: parentHeight });
        }
        
        let layout: coordinateSystem.GaugeLayout;
        
        if (currentPass === 1) {
            // PASS 1: Use tight layout with minimal padding
            // This will likely clip some content, but we'll measure and fix it
            layout = coordinateSystem.calculateTightLayout(
                parentWidth,
                parentHeight,
                gauge.props.type as GaugeType,
                arc.width as number,
                typeof gauge.props.marginInPercent === 'number' 
                    ? gauge.props.marginInPercent 
                    : 0
            );
        } else if (currentPass === 2 && gauge.measuredBounds.current) {
            // PASS 2: Use measured bounds to calculate optimal layout
            const prevLayout = gauge.prevGSize.current;
            layout = coordinateSystem.calculateLayoutFromMeasuredBounds(
                parentWidth,
                parentHeight,
                gauge.measuredBounds.current,
                gauge.props.type as GaugeType,
                arc.width as number,
                prevLayout
            );
            
            if (CONSTANTS.debugLogs) {
                console.log('[renderChart] Pass 2 - Optimized layout from bounds:', {
                    measuredBounds: gauge.measuredBounds.current,
                    newRadius: layout.outerRadius,
                    viewBox: layout.viewBox.toString()
                });
            }
        } else {
            // Fallback to optimized layout calculation
            const paddingConfig = coordinateSystem.extractPaddingConfig(
                labels,
                gauge.props.pointer?.length
            );
            layout = coordinateSystem.calculateOptimizedLayout(
                parentWidth,
                parentHeight,
                gauge.props.type as GaugeType,
                arc.width as number,
                paddingConfig,
                typeof gauge.props.marginInPercent === 'number' 
                    ? gauge.props.marginInPercent 
                    : 0
            );
        }
        
        if (CONSTANTS.debugLogs) {
            console.log(`[renderChart] Pass ${currentPass} - Layout:`, {
                outerRadius: layout.outerRadius,
                viewBox: layout.viewBox.toString(),
                gaugeCenter: layout.gaugeCenter
            });
        }
        
        // Check for layout stability to prevent infinite resize loops
        if (gauge.prevGSize.current && currentPass > 1) {
            const stable = coordinateSystem.isLayoutStable(
                gauge.prevGSize.current,
                layout,
                0.005 // 0.5% tolerance
            );
            if (stable) {
                // Layout hasn't changed significantly, skip re-render
                if (CONSTANTS.debugLogs) {
                    console.log('[renderChart] Layout stable, skipping re-render');
                }
                return;
            }
        }
        gauge.prevGSize.current = layout;
        
        // Update dimensions from the new layout
        coordinateSystem.updateDimensionsFromLayout(dimensions.current, layout);
        
        // Configure SVG with proper viewBox and dimensions
        // Hide during first pass to avoid visual flicker
        gauge.svg.current
            .attr("width", "100%")
            .attr("height", "100%")
            .style("max-width", "100%")
            .style("max-height", "100%")
            .style("display", "block")
            .style("visibility", currentPass === 1 ? "hidden" : "visible")
            .style("opacity", currentPass === 1 ? "0" : "1")
            .attr("viewBox", layout.viewBox.toString())
            .attr('preserveAspectRatio', 'xMidYMid meet');
        
        // Position the main gauge group at the calculated center
        gauge.g.current
            .attr("transform", `translate(${layout.gaugeCenter.x}, ${layout.gaugeCenter.y})`);

        // Position the doughnut (arcs) at the origin relative to g
        gauge.doughnut.current.attr(
            "transform",
            "translate(0, 0)"
        );

        gauge.doughnut.current
            .on("mouseleave", () => arcHooks.hideTooltip(gauge))
            .on("mouseout", () => arcHooks.hideTooltip(gauge));
        
        clearChart(gauge);
        arcHooks.setArcData(gauge);
        arcHooks.setupArcs(gauge, resize);
        labelsHooks.setupLabels(gauge);
        if (!gauge.props?.pointer?.hide)
            pointerHooks.drawPointer(gauge, resize);
        
        // After first pass, measure the actual bounds and trigger second pass
        if (currentPass === 1) {
            // Use requestAnimationFrame to ensure DOM is updated before measuring
            requestAnimationFrame(() => {
                const gElement = gauge.g.current.node();
                if (gElement) {
                    try {
                        const bbox = gElement.getBBox();
                        gauge.measuredBounds!.current = {
                            width: bbox.width,
                            height: bbox.height,
                            x: bbox.x,
                            y: bbox.y
                        };
                        
                        if (CONSTANTS.debugLogs) {
                            console.log('[renderChart] Measured bounds:', gauge.measuredBounds!.current);
                        }
                        
                        // Trigger second pass
                        gauge.renderPass!.current = 2;
                        renderChart(gauge, true);
                        
                        // Reset for next resize
                        gauge.renderPass!.current = 1;
                    } catch (e) {
                        // getBBox can fail if element is not rendered
                        if (CONSTANTS.debugLogs) {
                            console.log('[renderChart] Could not measure bounds:', e);
                        }
                    }
                }
            });
        }
    } else {
        // Non-resize updates (only data/props changed)
        let arcsPropsChanged = (JSON.stringify(gauge.prevProps.current.arc) !== JSON.stringify(gauge.props.arc));
        let pointerPropsChanged = (JSON.stringify(gauge.prevProps.current.pointer) !== JSON.stringify(gauge.props.pointer));
        let valueChanged = (JSON.stringify(gauge.prevProps.current.value) !== JSON.stringify(gauge.props.value));
        let ticksChanged = (JSON.stringify(gauge.prevProps.current.labels?.tickLabels) !== JSON.stringify(labels.tickLabels));
        let shouldRedrawArcs = arcsPropsChanged;
        if (shouldRedrawArcs) {
            arcHooks.clearArcs(gauge);
            arcHooks.setArcData(gauge);
            arcHooks.setupArcs(gauge, resize);
        }
        var shouldRedrawPointer = pointerPropsChanged || (valueChanged && !gauge.props?.pointer?.hide);
        if (shouldRedrawPointer) {
            pointerHooks.drawPointer(gauge);
        }
        if (arcsPropsChanged || ticksChanged) {
            labelsHooks.clearTicks(gauge);
            labelsHooks.setupTicks(gauge);
        }
        if (valueChanged) {
            labelsHooks.clearValueLabel(gauge);
            labelsHooks.setupValueLabel(gauge);
        }
    }
};
/**
 * Legacy function kept for backward compatibility during transition
 * This should eventually be removed as all code migrates to the new coordinate system
 * @deprecated Use coordinateSystem.calculateGaugeLayout instead
 */
export const calculateRadius = (gauge: Gauge) => {
    // This function is now handled by the coordinate system module
    // Kept for backward compatibility only
};

/**
 * Legacy function kept for backward compatibility during transition
 * @deprecated Centering is now handled by coordinateSystem.calculateGaugeCenter
 */
export const centerGraph = (gauge: Gauge) => {
    // This function is now handled by the coordinate system module
    // Kept for backward compatibility only
};

export const clearChart = (gauge: Gauge) => {
    //Remove the old stuff
    labelsHooks.clearTicks(gauge);
    labelsHooks.clearValueLabel(gauge);
    pointerHooks.clearPointerElement(gauge);
    arcHooks.clearArcs(gauge);
};