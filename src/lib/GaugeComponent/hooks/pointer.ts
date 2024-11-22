import {
    easeElastic,
    easeExpOut,
    interpolateNumber,
} from "d3";
import { PointerContext, PointerProps, PointerType } from "../types/Pointer";
import { getCoordByValue } from "./arc";
import { Gauge } from "../types/Gauge";
import * as utils from "./utils";
import * as arcHooks from "./arc";
import { GaugeType } from "../types/GaugeComponentProps";

export const drawPointer = (gauge: Gauge, resize: boolean = false) => {
    gauge.pointer.current.context = setupContext(gauge);
    const { prevPercent, currentPercent, prevProgress } = gauge.pointer.current.context;
    let pointer = gauge.props.pointer as PointerProps;
    let isFirstTime = gauge.prevProps?.current.value == undefined;
    if ((isFirstTime || resize) && gauge.props.type != GaugeType.Grafana) 
        initPointer(gauge);
    let shouldAnimate = (!resize || isFirstTime) && pointer.animate;
    if (shouldAnimate) {
        gauge.doughnut.current
            .transition()
            .delay(pointer.animationDelay)
            .ease(pointer.elastic ? easeElastic : easeExpOut)
            .duration(pointer.animationDuration)
            .tween("progress", () => {
                const currentInterpolatedPercent = interpolateNumber(prevPercent, currentPercent);
                return function (percentOfPercent: number) {
                    const progress = currentInterpolatedPercent(percentOfPercent);
                    if (isProgressValid(progress, prevProgress, gauge)) {
                        if(gauge.props.type == GaugeType.Grafana){
                            arcHooks.clearArcs(gauge);
                            arcHooks.drawArc(gauge, progress);
                            //arcHooks.setupArcs(gauge);
                        } else {
                            updatePointer(progress, gauge);
                        }
                    }
                    gauge.pointer.current.context.prevProgress = progress;
                };
            });
    } else {
        updatePointer(currentPercent, gauge);
    }
};
const setupContext = (gauge: Gauge): PointerContext => {
    const { value } = gauge.props;
    let pointer = gauge.props.pointer as PointerProps;
    let pointerLength = pointer.length as number;
    let minValue = gauge.props.minValue as number;
    let maxValue = gauge.props.maxValue as number;
    const { pointerPath } = gauge.pointer.current.context;
    var pointerRadius = getPointerRadius(gauge)
    let length = pointer.type == PointerType.Needle ? pointerLength : 0.2;
    let typesWithPath = [PointerType.Needle, PointerType.Arrow];
    let pointerContext: PointerContext = {
        centerPoint: [0, -pointerRadius / 2],
        pointerRadius: getPointerRadius(gauge),
        pathLength: gauge.dimensions.current.outerRadius * length,
        currentPercent: utils.calculatePercentage(minValue, maxValue, value as number),
        prevPercent: utils.calculatePercentage(minValue, maxValue, gauge.prevProps?.current.value || minValue),
        prevProgress: 0,
        pathStr: "",
        shouldDrawPath: typesWithPath.includes(pointer.type as PointerType),
        prevColor: ""
    }
    return pointerContext;
}
const initPointer = (gauge: Gauge) => {
    let value = gauge.props.value as number;
    let pointer = gauge.props.pointer as PointerProps;
    const { shouldDrawPath, centerPoint, pointerRadius, pathStr, currentPercent, prevPercent } = gauge.pointer.current.context;
    if(shouldDrawPath){
        gauge.pointer.current.context.pathStr = calculatePointerPath(gauge, prevPercent || currentPercent);
        gauge.pointer.current.path = gauge.pointer.current.element.append("path").attr("d", gauge.pointer.current.context.pathStr).attr("fill", pointer.color);
    }
    //Add a circle at the bottom of pointer
    if (pointer.type == PointerType.Needle) {
        gauge.pointer.current.element
            .append("circle")
            .attr("cx", centerPoint[0])
            .attr("cy", centerPoint[1])
            .attr("r", pointerRadius)
            .attr("fill", pointer.color);
    } else if (pointer.type == PointerType.Blob) {
        gauge.pointer.current.element
            .append("circle")
            .attr("cx", centerPoint[0])
            .attr("cy", centerPoint[1])
            .attr("r", pointerRadius)
            .attr("fill", pointer.baseColor)
            .attr("stroke", pointer.color)
            .attr("stroke-width", pointer.strokeWidth! * pointerRadius / 10);
    }
    //Translate the pointer starting point of the arc
    setPointerPosition(pointerRadius, value, gauge);
}
const updatePointer = (percentage: number, gauge: Gauge) => {
    let pointer = gauge.props.pointer as PointerProps;
    const { pointerRadius, shouldDrawPath, prevColor } = gauge.pointer.current.context;
    setPointerPosition(pointerRadius, percentage, gauge);
    if(shouldDrawPath && gauge.props.type != GaugeType.Grafana) 
        gauge.pointer.current.path.attr("d", calculatePointerPath(gauge, percentage));
    if(pointer.type == PointerType.Blob) {
        let currentColor = arcHooks.getArcDataByPercentage(percentage, gauge)?.color as string;
        let shouldChangeColor = currentColor != prevColor;
        if(shouldChangeColor) gauge.pointer.current.element.select("circle").attr("stroke", currentColor)
        var strokeWidth = pointer.strokeWidth! * pointerRadius / 10;
        gauge.pointer.current.element.select("circle").attr("stroke-width", strokeWidth);
        gauge.pointer.current.context.prevColor = currentColor;
    }
}
const setPointerPosition = (pointerRadius: number, progress: number, gauge: Gauge) => {
    let pointer = gauge.props.pointer as PointerProps;
    let pointerType = pointer.type as string;
    const { dimensions } = gauge;
    let value = utils.getCurrentGaugeValueByPercentage(progress, gauge);
    let pointers: { [key: string]: () => void } = {
        [PointerType.Needle]: () => {
            // Set needle position to center
            translatePointer(dimensions.current.outerRadius,dimensions.current.outerRadius, gauge);
        },
        [PointerType.Arrow]: () => {
            let { x, y } = getCoordByValue(value, gauge, "inner", 0, 0.70);
            x -= 1;
            y += pointerRadius-3;
            translatePointer(x, y, gauge);
        },
        [PointerType.Blob]: () => {
            let { x, y } = getCoordByValue(value, gauge, "between", 0, 0.75);
            x -= 1;
            y += pointerRadius;
            translatePointer(x, y, gauge);
        },
    };
    return pointers[pointerType]();
}

const isProgressValid = (currentPercent: number, prevPercent: number, gauge: Gauge) => {
    //Avoid unnecessary re-rendering (when progress is too small) but allow the pointer to reach the final value
    let overFlow = currentPercent > 1 || currentPercent < 0;
    let tooSmallValue = Math.abs(currentPercent - prevPercent) < 0.0001;
    let sameValueAsBefore = currentPercent == prevPercent;
    return !tooSmallValue && !sameValueAsBefore && !overFlow;
}

const calculatePointerPath = (gauge: Gauge, percent: number) => {
    const { centerPoint, pointerRadius, pathLength } = gauge.pointer.current.context;
    let startAngle = utils.degToRad(gauge.props.type == GaugeType.Semicircle ? 0 : -42);
    let endAngle = utils.degToRad(gauge.props.type == GaugeType.Semicircle ? 180 : 223);
    const angle = startAngle + (percent) * (endAngle - startAngle);
    var topPoint = [
        centerPoint[0] - pathLength * Math.cos(angle),
        centerPoint[1] - pathLength * Math.sin(angle),
    ];
    var thetaMinusHalfPi = angle - Math.PI / 2;
    var leftPoint = [
        centerPoint[0] - pointerRadius * Math.cos(thetaMinusHalfPi),
        centerPoint[1] - pointerRadius * Math.sin(thetaMinusHalfPi),
    ];
    var thetaPlusHalfPi = angle + Math.PI / 2;
    var rightPoint = [
        centerPoint[0] - pointerRadius * Math.cos(thetaPlusHalfPi),
        centerPoint[1] - pointerRadius * Math.sin(thetaPlusHalfPi),
    ];

    var pathStr = `M ${leftPoint[0]} ${leftPoint[1]} L ${topPoint[0]} ${topPoint[1]} L ${rightPoint[0]} ${rightPoint[1]}`;
    return pathStr;
};

const getPointerRadius = (gauge: Gauge) => {
    let pointer = gauge.props.pointer as PointerProps;
    let pointerWidth = pointer.width as number;
    return pointerWidth * (gauge.dimensions.current.width / 500);
}

export const translatePointer = (x: number, y: number, gauge: Gauge) => gauge.pointer.current.element.attr("transform", "translate(" + x + ", " + y + ")");
export const addPointerElement = (gauge: Gauge) => gauge.pointer.current.element = gauge.g.current.append("g").attr("class", "pointer");
export const clearPointerElement = (gauge: Gauge) => gauge.pointer.current.element.selectAll("*").remove();
