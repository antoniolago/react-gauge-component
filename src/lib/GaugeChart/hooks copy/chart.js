import CONSTANTS from "../constants";
import * as arcHooks from "./arc";
import * as chartHooks from "./chart";
import * as labelsHooks from "./labels";
import * as needleHooks from "./needle";
export const initChart = (update, gauge, resize = false) => {
    if (update) {
        renderChart(resize, gauge);
        return;
    }
    gauge.container.current.select("svg").remove();
    gauge.svg.current = gauge.container.current.append("svg");
    gauge.g.current = gauge.svg.current.append("g"); //Used for margins
    gauge.doughnut.current = gauge.g.current.append("g").attr("class", "doughnut");

    //Set up the pie generator
    //Each arc should be of equal length (or should they?)
    gauge.pieChart.current
        .value((d) => d.value)
        //.padAngle(arcPadding)
        .startAngle(CONSTANTS.startAngle)
        .endAngle(CONSTANTS.endAngle)
        .sort(null);
    needleHooks.addNeedleElement(gauge);
    renderChart(resize, gauge);
}
//Renders the chart, should be called every time the window is resized
export const renderChart = (resize, gauge) => {
    updateDimensions(gauge);
    //Set dimensions of svg element and translations
    gauge.svg.current
        .attr("width", gauge.width.current + gauge.margin.current.left + gauge.margin.current.right)
        .attr(
            "height",
            gauge.height.current + gauge.margin.current.top + gauge.margin.current.bottom
        );
    gauge.g.current.attr(
        "transform",
        "translate(" + gauge.margin.current.left + ", " + gauge.margin.current.top + ")"
    );
    //Set the radius to lesser of width or height and remove the margins
    //Calculate the new radius
    calculateRadius(gauge);
    gauge.doughnut.current.attr(
        "transform",
        "translate(" + gauge.outerRadius.current + ", " + gauge.outerRadius.current + ")"
    );
    gauge.innerRadius.current = gauge.outerRadius.current * (1 - gauge.props.arc.width);
    arcHooks.setupArcs(gauge);
    labelsHooks.setupLabels(gauge);
    needleHooks.drawNeedle(resize, gauge);
};
export const calculateRadius = (gauge) => {
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
            gauge.height.current - gauge.margin.current.top - gauge.margin.current.bottom;
    }
    centerGraph(gauge);
};

//Calculates new margins to make the graph centered
export const centerGraph = (gauge) => {
    gauge.margin.current.left =
        gauge.width.current / 2 - gauge.outerRadius.current + gauge.margin.current.right;
    gauge.g.current.attr(
        "transform",
        "translate(" + gauge.margin.current.left + ", " + gauge.margin.current.top + ")"
    );
};

export const updateDimensions = (gauge) => {
    //TODO: Fix so that the container is included in the component
    const { marginInPercent } = gauge.props;
    var divDimensions = gauge.container.current.node().getBoundingClientRect(),
        divWidth = divDimensions.width,
        divHeight = divDimensions.height;

    //Set the new width and horizontal margins
    gauge.margin.current.left = divWidth * marginInPercent;
    gauge.margin.current.right = divWidth * marginInPercent;
    gauge.width.current = divWidth - gauge.margin.current.left - gauge.margin.current.right;

    gauge.margin.current.top = divHeight * marginInPercent;
    gauge.margin.current.bottom = divHeight * marginInPercent;
    gauge.height.current =
        gauge.width.current / 2 - gauge.margin.current.top - gauge.margin.current.bottom;
    //gauge.height.current = divHeight - gauge.margin.current.top - gauge.margin.current.bottom;
};

export const clearChart = (gauge) => {
  //Remove the old stuff
  labelsHooks.clearLabels(gauge);
  needleHooks.clearNeedleElement(gauge);
  arcHooks.clearArcs(gauge);
};