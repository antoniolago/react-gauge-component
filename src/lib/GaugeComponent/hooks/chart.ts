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
        
        var parentWidth = parentNode.getBoundingClientRect().width;
        var parentHeight = parentNode.getBoundingClientRect().height;
        
        // Use the new coordinate system to calculate layout
        const layout = coordinateSystem.calculateGaugeLayout(
            parentWidth,
            parentHeight,
            gauge.props.type as GaugeType,
            arc.width as number,
            typeof gauge.props.marginInPercent === 'number' 
                ? gauge.props.marginInPercent 
                : 0
        );
        
        // Check for layout stability to prevent infinite resize loops
        if (gauge.prevGSize.current) {
            const stable = coordinateSystem.isLayoutStable(
                gauge.prevGSize.current,
                layout,
                0.005 // 0.5% tolerance
            );
            if (stable) {
                // Layout hasn't changed significantly, skip re-render
                return;
            }
        }
        gauge.prevGSize.current = layout;
        
        // Update dimensions from the new layout
        coordinateSystem.updateDimensionsFromLayout(dimensions.current, layout);
        
        // Configure SVG with proper viewBox and dimensions
        // Calculate aspect ratio from viewBox to set proper height
        const aspectRatio = layout.viewBox.height / layout.viewBox.width;
        
        gauge.svg.current
            .attr("width", "100%")
            .attr("height", "auto")
            .style("aspect-ratio", `${layout.viewBox.width} / ${layout.viewBox.height}`)
            .attr("viewBox", layout.viewBox.toString())
            .attr('preserveAspectRatio', 'xMidYMid meet');
        
        // Position the main gauge group at the calculated center
        gauge.g.current
            .attr("transform", `translate(${layout.gaugeCenter.x}, ${layout.gaugeCenter.y})`);

        // Position the doughnut (arcs) at the origin relative to g
        // Since g is already centered, doughnut just needs to be at origin
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