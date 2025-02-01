import CONSTANTS from "../constants";
import { Arc } from "../types/Arc";
import { Gauge } from "../types/Gauge";
import { GaugeType, GaugeInnerMarginInPercent } from "../types/GaugeComponentProps";
import { Labels } from "../types/Labels";
import * as arcHooks from "./arc";
import * as labelsHooks from "./labels";
import * as pointerHooks from "./pointer";
import * as utilHooks from "./utils";
export const initChart = (gauge: Gauge, isFirstRender: boolean) => {
    const { angles } = gauge.dimensions.current;
    if (gauge.resizeObserver?.current?.disconnect) {
        gauge.resizeObserver?.current?.disconnect();
    }
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
    //if resize recalculate dimensions, clear chart and redraw
    //if not resize, treat each prop separately
    if (resize) {
        updateDimensions(gauge);
        //Set dimensions of svg element and translations
        gauge.g.current.attr(
            "transform",
            "translate(" + dimensions.current.margin.left + ", " + 35 + ")"
        );
        //Set the radius to lesser of width or height and remove the margins
        //Calculate the new radius
        calculateRadius(gauge);
        gauge.doughnut.current.attr(
            "transform",
            "translate(" + dimensions.current.outerRadius + ", " + dimensions.current.outerRadius + ")"
        );
        //Hide tooltip failsafe (sometimes subarcs events are not fired)
        gauge.doughnut.current
            .on("mouseleave", () => arcHooks.hideTooltip(gauge))
            .on("mouseout", () => arcHooks.hideTooltip(gauge))
        let arcWidth = arc.width as number;
        dimensions.current.innerRadius = dimensions.current.outerRadius * (1 - arcWidth);
        clearChart(gauge);
        arcHooks.setArcData(gauge);
        arcHooks.setupArcs(gauge, resize);
        labelsHooks.setupLabels(gauge);
        if (!gauge.props?.pointer?.hide)
            pointerHooks.drawPointer(gauge, resize);
        let gaugeTypeHeightCorrection: Record<string, number> = {
            [GaugeType.Semicircle]: 50,
            [GaugeType.Radial]: 55,
            [GaugeType.Grafana]: 55
        }
        let boundHeight = gauge.doughnut.current.node().getBoundingClientRect().height;
        let boundWidth = gauge.container.current.node().getBoundingClientRect().width;
        let gaugeType = gauge.props.type as string;
        gauge.svg.current
            .attr("width", boundWidth)
            .attr("height", boundHeight + gaugeTypeHeightCorrection[gaugeType]);
    } else {
        let arcsPropsChanged = (JSON.stringify(gauge.prevProps.current.arc) !== JSON.stringify(gauge.props.arc));
        let pointerPropsChanged = (JSON.stringify(gauge.prevProps.current.pointer) !== JSON.stringify(gauge.props.pointer));
        let valueChanged = (JSON.stringify(gauge.prevProps.current.value) !== JSON.stringify(gauge.props.value));
        let ticksChanged = (JSON.stringify(gauge.prevProps.current.labels?.tickLabels) !== JSON.stringify(labels.tickLabels));
        let shouldRedrawArcs = arcsPropsChanged
        if (shouldRedrawArcs) {
            arcHooks.clearArcs(gauge);
            arcHooks.setArcData(gauge);
            arcHooks.setupArcs(gauge, resize);
        }
        //If pointer is hidden there's no need to redraw it when only value changes
        var shouldRedrawPointer = pointerPropsChanged || (valueChanged && !gauge.props?.pointer?.hide);
        if ((shouldRedrawPointer)) {
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
export const updateDimensions = (gauge: Gauge) => {
    const { marginInPercent } = gauge.props;
    const { dimensions } = gauge;
    var divDimensions = gauge.container.current.node().getBoundingClientRect(),
        divWidth = divDimensions.width,
        divHeight = divDimensions.height;
    if (dimensions.current.fixedHeight == 0) dimensions.current.fixedHeight = divHeight + 200;
    //Set the new width and horizontal margins
    let isMarginBox = typeof marginInPercent == 'number';
    let marginLeft: number = isMarginBox ? marginInPercent as number : (marginInPercent as GaugeInnerMarginInPercent).left;
    let marginRight: number = isMarginBox ? marginInPercent as number : (marginInPercent as GaugeInnerMarginInPercent).right;
    let marginTop: number = isMarginBox ? marginInPercent as number : (marginInPercent as GaugeInnerMarginInPercent).top;
    let marginBottom: number = isMarginBox ? marginInPercent as number : (marginInPercent as GaugeInnerMarginInPercent).bottom;
    dimensions.current.margin.left = divWidth * marginLeft;
    dimensions.current.margin.right = divWidth * marginRight;
    dimensions.current.width = divWidth - dimensions.current.margin.left - dimensions.current.margin.right;

    dimensions.current.margin.top = dimensions.current.fixedHeight * marginTop;
    dimensions.current.margin.bottom = dimensions.current.fixedHeight * marginBottom;
    dimensions.current.height = dimensions.current.width / 2 - dimensions.current.margin.top - dimensions.current.margin.bottom;
    //gauge.height.current = divHeight - dimensions.current.margin.top - dimensions.current.margin.bottom;
};
export const calculateRadius = (gauge: Gauge) => {
    const { dimensions } = gauge;
    //The radius needs to be constrained by the containing div
    //Since it is a half circle we are dealing with the height of the div
    //Only needs to be half of the width, because the width needs to be 2 * radius
    //For the whole arc to fit

    //First check if it is the width or the height that is the "limiting" dimension
    if (dimensions.current.width < 2 * dimensions.current.height) {
        //Then the width limits the size of the chart
        //Set the radius to the width - the horizontal margins
        dimensions.current.outerRadius = (dimensions.current.width - dimensions.current.margin.left - dimensions.current.margin.right) / 2;
    } else {
        dimensions.current.outerRadius =
            dimensions.current.height - dimensions.current.margin.top - dimensions.current.margin.bottom + 35;
    }
    centerGraph(gauge);
};

//Calculates new margins to make the graph centered
export const centerGraph = (gauge: Gauge) => {
    const { dimensions } = gauge;
    dimensions.current.margin.left =
        dimensions.current.width / 2 - dimensions.current.outerRadius + dimensions.current.margin.right;
    gauge.g.current.attr(
        "transform",
        "translate(" + dimensions.current.margin.left + ", " + (dimensions.current.margin.top) + ")"
    );
};


export const clearChart = (gauge: Gauge) => {
    //Remove the old stuff
    labelsHooks.clearTicks(gauge);
    labelsHooks.clearValueLabel(gauge);
    pointerHooks.clearPointerElement(gauge);
    arcHooks.clearArcs(gauge);
};