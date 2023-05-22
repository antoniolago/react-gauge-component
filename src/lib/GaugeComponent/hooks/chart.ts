import CONSTANTS from "../constants";
import { Gauge } from "../types/Gauge";
import { GaugeType } from "../types/GaugeComponentProps";
import * as arcHooks from "./arc";
import * as labelsHooks from "./labels";
import * as pointerHooks from "./pointer";
import * as utilHooks from "./utils";
export const initChart = (gauge: Gauge) => {
    let updatedValue = (JSON.stringify(gauge.prevProps.current.value) !== JSON.stringify(gauge.props.value));
    let isFirstTime = utilHooks.isEmptyObject(gauge.svg.current);
    if (updatedValue && !isFirstTime) {
        renderChart(gauge);
        return;
    }
    gauge.container.current.select("svg").remove();
    gauge.svg.current = gauge.container.current.append("svg");
    gauge.g.current = gauge.svg.current.append("g"); //Used for margins
    gauge.doughnut.current = gauge.g.current.append("g").attr("class", "doughnut");
    let startAngle = undefined;
    let endAngle = undefined;
    if(gauge.props.type == GaugeType.Semicircle){
        startAngle = -Math.PI / 2 + 0.02;
        endAngle = Math.PI / 2 - 0.02;
    } else if(gauge.props.type == GaugeType.Radial) {
        startAngle = -Math.PI / 1.37; //Negative x-axis
        endAngle = Math.PI / 1.37; //Positive x-axis
    }
    //Set up the pie generator
    //Each arc should be of equal length (or should they?)
    gauge.pieChart.current
        .value((d: any) => d.value)
        //.padAngle(arcPadding)
        .startAngle(startAngle)
        .endAngle(endAngle)
        .sort(null);
    //Set up pointer
    pointerHooks.addPointerElement(gauge);
    renderChart(gauge, true);
}
//Renders the chart, should be called every time the window is resized
export const renderChart = (gauge: Gauge, resize: boolean = false) => {
    //if resize recalculate dimensions, clear chart and redraw
    //if not resize, treat each prop separately
    if(resize){
        updateDimensions(gauge);
        //Adds height to svg element when radial for better fitting
        let addHeight = gauge.props.type == GaugeType.Radial ? 95 : 0;
        //Set dimensions of svg element and translations
        gauge.g.current.attr(
            "transform",
            "translate(" + gauge.margin.current.left + ", " + 35 + ")"
        );
        //Set the radius to lesser of width or height and remove the margins
        //Calculate the new radius
        calculateRadius(gauge);
        gauge.doughnut.current.attr(
            "transform",
            "translate(" + gauge.outerRadius.current + ", " + gauge.outerRadius.current + ")"
        );
        gauge.innerRadius.current = gauge.outerRadius.current * (1 - gauge.props.arc.width);
        clearChart(gauge);
        arcHooks.setArcData(gauge);
        arcHooks.setupArcs(gauge);
        labelsHooks.setupLabels(gauge);
        pointerHooks.drawPointer(gauge, resize);
        let boundHeight = gauge.doughnut.current.node().getBoundingClientRect().height + 50;
        let boundWidth = gauge.container.current.node().getBoundingClientRect().width;
        gauge.svg.current
            .attr("width", boundWidth)
            .attr("height", boundHeight);
    } else {
        let arcsPropsChanged = (JSON.stringify(gauge.prevProps.current.arc) !== JSON.stringify(gauge.props.arc));
        let pointerPropsChanged = (JSON.stringify(gauge.prevProps.current.pointer) !== JSON.stringify(gauge.props.pointer));
        let valueChanged = (JSON.stringify(gauge.prevProps.current.value) !== JSON.stringify(gauge.props.value));
        let marksChanged = (JSON.stringify(gauge.prevProps.current.labels.markLabel) !== JSON.stringify(gauge.props.labels.markLabel));
        if(arcsPropsChanged) {
            arcHooks.clearArcs(gauge);
            arcHooks.setArcData(gauge);
            arcHooks.setupArcs(gauge);
        }
        if(pointerPropsChanged || valueChanged) {
            pointerHooks.drawPointer(gauge);
        }
        if(arcsPropsChanged || marksChanged) {
            labelsHooks.clearMarks(gauge);
            labelsHooks.setupMarks(gauge);
        }
        if(valueChanged) {
            labelsHooks.clearValueLabel(gauge);
            labelsHooks.setupValueLabel(gauge);
        }
    }
};
export const calculateRadius = (gauge: Gauge) => {
    //The radius needs to be constrained by the containing div
    //Since it is a half circle we are dealing with the height of the div
    //Only needs to be half of the width, because the width needs to be 2 * radius
    //For the whole arc to fit

    //First check if it is the width or the height that is the "limiting" dimension
    if (gauge.width.current < 2 * gauge.height.current) {
        //Then the width limits the size of the chart
        //Set the radius to the width - the horizontal margins
        gauge.outerRadius.current =
            (gauge.width.current - gauge.margin.current.left - gauge.margin.current.right) / 2;
    } else {
        gauge.outerRadius.current =
            gauge.height.current - gauge.margin.current.top - gauge.margin.current.bottom + 15;
    }
    centerGraph(gauge);
};

//Calculates new margins to make the graph centered
export const centerGraph = (gauge: Gauge) => {
    gauge.margin.current.left =
        gauge.width.current / 2 - gauge.outerRadius.current + gauge.margin.current.right;
    gauge.g.current.attr(
        "transform",
        "translate(" + gauge.margin.current.left + ", " + (gauge.margin.current.top+15) + ")"
    );
};

export const updateDimensions = (gauge: Gauge) => {
    //TODO: Fix so that the container is included in the component
    const { marginInPercent } = gauge.props;
    var divDimensions = gauge.container.current.node().getBoundingClientRect(),
        divWidth = divDimensions.width,
        divHeight = divDimensions.height;
    if(gauge.fixedHeight.current == 0) gauge.fixedHeight.current = divHeight + 200;
    //Set the new width and horizontal margins
    gauge.margin.current.left = divWidth * marginInPercent;
    gauge.margin.current.right = divWidth * marginInPercent;
    gauge.width.current = divWidth - gauge.margin.current.left - gauge.margin.current.right;

    gauge.margin.current.top = gauge.fixedHeight.current * marginInPercent;
    gauge.margin.current.bottom = gauge.fixedHeight.current * marginInPercent;
    gauge.height.current =
        gauge.width.current / 2 - gauge.margin.current.top - gauge.margin.current.bottom;
    //gauge.height.current = divHeight - gauge.margin.current.top - gauge.margin.current.bottom;
};

export const clearChart = (gauge: Gauge) => {
    //Remove the old stuff
    labelsHooks.clearMarks(gauge);
    labelsHooks.clearValueLabel(gauge);
    pointerHooks.clearPointerElement(gauge);
    arcHooks.clearArcs(gauge);
};