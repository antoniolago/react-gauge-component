import {
    easeElastic,
    easeExpOut,
    interpolateNumber,
} from "d3";
import { PointerType } from "../types/Pointer";
import { getCoordByValue } from "./arc";
import { Gauge } from "../types/Gauge";
import * as utils from "./utils";
import { GaugeType } from "../types/GaugeComponentProps";

export const drawPointer = (gauge: Gauge, resize: boolean = false) => {
    const { pointer, value, minValue, maxValue } = gauge.props;
    var pointerRadius = getPointerRadius(gauge)
    var centerPoint = [0, -pointerRadius / 2];
    let currentPercent = utils.calculatePercentage(minValue, maxValue, value as number);
    var prevPercent = utils.calculatePercentage(minValue, maxValue, gauge.prevProps?.current.value || minValue);
    let length = pointer.type == PointerType.Needle ? pointer.length : 0.2;
    var pathLength = gauge.dimensions.current.outerRadius * length;
    let isFirstTime = gauge.prevProps?.current.value == undefined;
    if (isFirstTime || resize) {
        var pathStr = calculatePointerPath(gauge, prevPercent || utils.getCurrentGaugeValuePercentage(gauge.props), pathLength, pointerRadius, centerPoint);
        gauge.pointer.current.append("path").attr("d", pathStr).attr("fill", pointer.color);
        //Add a circle at the bottom of pointer
        if (pointer.type == PointerType.Needle) {
            gauge.pointer.current
                .append("circle")
                .attr("cx", centerPoint[0])
                .attr("cy", centerPoint[1])
                .attr("r", pointerRadius)
                .attr("fill", pointer.color);
        }
        //Translate the pointer starting point of the arc
        setPointerPosition(pointerRadius, value, gauge);
    }
    //Rotate the pointer
    let pointerPath = gauge.container.current.select(`.pointer path`);
    let prevProgress = 0;
    let shouldAnimate = (!resize || isFirstTime) && pointer.animate
    if (shouldAnimate) {
        gauge.pointer.current
            .transition()
            .delay(pointer.animationDelay)
            .ease(pointer.elastic ? easeElastic : easeExpOut)
            .duration(pointer.animationDuration)
            .tween("progress", () => {
                const currentInterpolatedPercent = interpolateNumber(prevPercent, currentPercent);
                return function (percentOfPercent: number) {
                    const progress = currentInterpolatedPercent(percentOfPercent);
                    if (isProgressValid(progress, prevProgress, gauge)) {
                        setPointerPosition(pointerRadius, progress * 100, gauge);
                        pointerPath.attr("d", calculatePointerPath(gauge, progress, pathLength, pointerRadius, centerPoint));
                    }
                    prevProgress = progress;
                };
            });
    } else {
        pointerPath.attr("d", calculatePointerPath(gauge, utils.getCurrentGaugeValuePercentage(gauge.props), pathLength, pointerRadius, centerPoint));
    }
};
const setPointerPosition = (pointerRadius: number, value: number, gauge: Gauge) => {
    const { pointer } = gauge.props;
    const { dimensions } = gauge;
    if (pointer.type == PointerType.Needle) {
        //Set needle position to center
        gauge.pointer.current.attr("transform", "translate(" + dimensions.current.outerRadius + ", " + dimensions.current.outerRadius + ")");
        return
    }
    let { x, y } = getCoordByValue(value, gauge, "inner", 0, 0.75);
    x -= 1;
    y += pointerRadius;
    gauge.pointer.current.attr("transform", "translate(" + x + ", " + y + ")");
}

const isProgressValid = (currentPercent: number, prevPercent: number, gauge: Gauge) => {
    const { minValue, maxValue } = gauge.props;
    //Avoid unnecessary re-rendering (when progress is too small) but allow the pointer to reach the final value
    let overFlow = currentPercent * 100 > maxValue || currentPercent * 100 < minValue;
    let tooSmallValue = Math.abs(currentPercent - prevPercent) < 0.0001;
    let sameValueAsBefore = currentPercent == prevPercent;
    return !tooSmallValue && !sameValueAsBefore && !overFlow;
}

const calculatePointerPath = (gauge: Gauge, percent: number, pathLength: number, pointerRadius: number, centerPoint: any) => {
    let startAngle = utils.degToRad(gauge.props.type == GaugeType.Semicircle ? 0 : -41);
    let endAngle = utils.degToRad(gauge.props.type == GaugeType.Semicircle ? 180 : 222);
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
    const { pointer } = gauge.props;
    return pointer.width * (gauge.dimensions.current.width / 500);
}

export const addPointerElement = (gauge: Gauge) => gauge.pointer.current = gauge.g.current.append("g").attr("class", "pointer");
export const clearPointerElement = (gauge: Gauge) => gauge.pointer.current.selectAll("*").remove();
