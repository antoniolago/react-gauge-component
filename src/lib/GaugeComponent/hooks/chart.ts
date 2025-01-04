import CONSTANTS from "../constants";
import { Arc } from "../types/Arc";
import { Gauge } from "../types/Gauge";
import { GaugeType, GaugeInnerMarginInPercent } from "../types/GaugeComponentProps";
import { Labels } from "../types/Labels";
import * as arcHooks from "./arc";
import * as labelsHooks from "./labels";
import * as pointerHooks from "./pointer";
import * as utilHooks from "./utils";
export const initChart = (gauge: Gauge) => {
    const { angles } = gauge.dimensions.current;
    let updatedValue = (JSON.stringify(gauge.prevProps.current.value) !== JSON.stringify(gauge.props.value));
    let isFirstTime = utilHooks.isEmptyObject(gauge.svg.current);
    if (updatedValue && !isFirstTime) {
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
    let gaugeTypeHeightCorrection: Record<string, number> = {
        [GaugeType.Semicircle]: 50,
        [GaugeType.Radial]: 55,
        [GaugeType.Grafana]: 55
    }
    let arc = gauge.props.arc as Arc;
    let labels = gauge.props.labels as Labels;

    if (resize) {
        calculateRadius(gauge);
        var parentNode = gauge.container.current.node().parentNode as HTMLElement;
        var parentWidth = parentNode.getBoundingClientRect().width;
        var parentHeight = parentNode.getBoundingClientRect().height;

        gauge.svg.current
            .attr("width", parentWidth)
            .attr("height", parentHeight)
            .attr('preserveAspectRatio', 'xMaxYMax')
            // .attr("viewBox", `0 0 100 100`);

        // gauge.g.current.attr('transform', `translate(${parentWidth}, ${parentHeight})`);

        var outerRadius = dimensions.current.outerRadius;
        // Adjust outerRadius to fit within the parent node's height
        if (outerRadius > parentHeight) {
            // outerRadius = parentHeight
            outerRadius = dimensions.current.outerRadius;
        }
        else {
            outerRadius = dimensions.current.outerRadius;
        }


        // var xGauge = ((parentWidth / 2) - outerRadius)
        //     + (dimensions.current.margin.left) - dimensions.current.margin.right;
        // var yGauge = ((parentHeight / 2) - outerRadius)
        //     + (dimensions.current.margin.top);
        //Center the gauge horizontally
        var xGauge = (parentWidth / 2) - outerRadius// - dimensions.current.margin.left;
        //Fix the position of the gauge vertically at the top of the frame
        var yGauge = dimensions.current.margin.top+10;

        gauge.g.current
            .data([
                {
                    x: xGauge,
                    y: yGauge
                }
            ])
            .attr("transform", (d: any) => `translate(${d.x}, ${d.y})`);

        gauge.doughnut.current.attr(
            "transform",
            "translate(" + (dimensions.current.outerRadius) + ", " + (dimensions.current.outerRadius) + ")"
        );

        gauge.doughnut.current
            .on("mouseleave", () => arcHooks.hideTooltip(gauge))
            .on("mouseout", () => arcHooks.hideTooltip(gauge));

        let arcWidth = arc.width as number;
        dimensions.current.innerRadius = dimensions.current.outerRadius * (1 - arcWidth);
        clearChart(gauge);
        arcHooks.setArcData(gauge);
        arcHooks.setupArcs(gauge, resize);
        labelsHooks.setupLabels(gauge);
        if (!gauge.props?.pointer?.hide)
            pointerHooks.drawPointer(gauge, resize);
    } else {
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
// export const updateDimensions = (gauge: Gauge) => {
//     const { marginInPercent } = gauge.props;
//     const { dimensions } = gauge;
//     var parentNode = gauge.container.current.node().parentNode;
//     var divDimensions = gauge.container.current.node().getBoundingClientRect(),
//         divWidth = parentNode.getBoundingClientRect().width,
//         divHeight = parentNode.getBoundingClientRect().height;
//     // if (dimensions.current.fixedHeight == 0) dimensions.current.fixedHeight = divHeight + 200;
//     //Set the new width and horizontal margins
//     let isMarginBox = typeof marginInPercent == 'number';
//     let marginLeft: number = isMarginBox ? marginInPercent as number : 
//     (marginInPercent as GaugeInnerMarginInPercent).left;
//     let marginRight: number = isMarginBox ? marginInPercent as number : 
//     (marginInPercent as GaugeInnerMarginInPercent).right;
//     let marginTop: number = isMarginBox ? marginInPercent as number : 
//     (marginInPercent as GaugeInnerMarginInPercent).top;
//     let marginBottom: number = isMarginBox ? marginInPercent as number : 
//     (marginInPercent as GaugeInnerMarginInPercent).bottom;
//     // dimensions.current.margin.left = gauge.dimensions.current.margin.left;
//     // dimensions.current.margin.right = divWidth * marginRight;
//     // dimensions.current.margin.top = divHeight - marginTop;
//     // dimensions.current.margin.bottom = divHeight * marginBottom;
//     console.log("divHeight", divHeight);
//     console.log("divWidth", divWidth);
//     // (dimensions.current.margin.left - dimensions.current.margin.right);

//     // dimensions.current.margin.top = gauge.dimensions.current.margin.top;
//     // dimensions.current.margin.bottom = dimensions.current.fixedHeight * marginBottom;
//     // dimensions.current.margin.left = gauge.dimensions.current.margin.left;
//     // // dimensions.current.margin.right = divWidth * marginRight;
//     // dimensions.current.height = parentNode.getBoundingClientRect().height;
//     // dimensions.current.width = parentNode.getBoundingClientRect().width;
//     // dimensions.current.width / 2 - dimensions.current.margin.top - dimensions.current.margin.bottom;
//     //gauge.height.current = divHeight - dimensions.current.margin.top - dimensions.current.margin.bottom;
// };
export const calculateRadius = (gauge: Gauge) => {
    const { dimensions } = gauge;
    const parentNode = gauge.container.current.node().parentNode as HTMLElement;
    const parentNodeOfTheParentNode = parentNode.parentNode as HTMLElement;
    const parentWidth = parentNode.getBoundingClientRect().width;
    const parentHeight = gauge.container.current.node().getBoundingClientRect().height ?? 0;
    const availableWidth = parentWidth - dimensions.current.margin.left - dimensions.current.margin.right;
    const availableHeight = parentHeight - dimensions.current.margin.top - dimensions.current.margin.bottom;

    // if (gauge.props.type === GaugeType.Semicircle) {
    //     dimensions.current.outerRadius = Math.min(availableWidth / 2, availableHeight / 2);
    // } else {
    //     dimensions.current.outerRadius = Math.min(availableWidth / 2, availableHeight);
    // }
    // if(availableHeight < availableWidth) {
    dimensions.current.outerRadius = Math.min(availableWidth - 100, availableHeight) / 2;
    // }
    // else {
    // dimensions.current.outerRadius = Math.min(parentHeight, availableWidth);
    // dimensions.current.outerRadius = availableHeight;
    // }
    console.log(dimensions.current.outerRadius > availableHeight)
    // if (dimensions.current.outerRadius > parentHeight)
    console.log("outerRadius", dimensions.current.outerRadius)
    console.log("parentHeight", parentHeight)
    centerGraph(gauge);
};

//Calculates new margins to make the graph centered
// export const centerGraph = (gauge: Gauge) => {
//     const { dimensions } = gauge;
//     dimensions.current.margin.left =
//         dimensions.current.width / 2 - dimensions.current.outerRadius + dimensions.current.margin.right;
//     gauge.g.current.attr(
//         "transform",
//         "translate(" + dimensions.current.margin.left + ", " + (dimensions.current.margin.top) + ")"
//     );
// };

export const centerGraph = (gauge: Gauge) => {
    const { dimensions } = gauge;
    const xOffset = dimensions.current.width / 2;
    const yOffset =
        gauge.props.type === GaugeType.Semicircle
            ? dimensions.current.height
            : dimensions.current.height / 2;
    var marginTop = dimensions.current.margin.top;
    var marginBottom = dimensions.current.margin.bottom;
    var marginLeft = dimensions.current.margin.left;
    var marginRight = dimensions.current.margin.right;
    // gauge.g.current.attr("transform", `translate(${marginLeft}, ${marginTop})`);
};

export const clearChart = (gauge: Gauge) => {
    //Remove the old stuff
    labelsHooks.clearTicks(gauge);
    labelsHooks.clearValueLabel(gauge);
    pointerHooks.clearPointerElement(gauge);
    arcHooks.clearArcs(gauge);
};