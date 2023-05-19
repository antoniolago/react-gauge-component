import * as utils from '../utils';
import {
  easeElastic,
  easeExpOut,
  interpolateNumber,
} from "d3";
import { Gauge } from "../../types/Gauge";


export const drawNeedle = (gauge: Gauge, resize: boolean = false) => {
  const { needle, value, minValue, maxValue } = gauge.props;
  var needleRadius = getNeedleRadius(gauge) 
  var centerPoint = [0, -needleRadius / 2];
  let currentPercent = utils.calculatePercentage(minValue, maxValue, value as number);
  var prevPercent = utils.calculatePercentage(minValue, maxValue, gauge.prevProps?.current.value || minValue);
  var pathLength = gauge.outerRadius.current * needle.length;
  var needleRadius = getNeedleRadius(gauge);
  let isFirstTime = gauge.prevProps?.current.value == undefined;
  if(isFirstTime || resize){
    var pathStr = calculateNeedlePath(prevPercent || utils.getCurrentGaugeValuePercentage(gauge.props), pathLength, needleRadius, centerPoint);
    gauge.pointer.current.append("path").attr("d", pathStr).attr("fill", needle.color);
    //Add a circle at the bottom of needle
    gauge.pointer.current
      .append("circle")
      .attr("cx", centerPoint[0])
      .attr("cy", centerPoint[1])
      .attr("r", needleRadius)
      .attr("fill", needle.color);
    //Translate the needle starting point to the middle of the arc
    gauge.pointer.current.attr(
      "transform",
      "translate(" + gauge.outerRadius.current + ", " + gauge.outerRadius.current + ")"
    );
  }
  //Rotate the needle
  let needlePath = gauge.container.current.select(`.needle path`);
  if ((!resize || isFirstTime) && needle.animate) {
    gauge.pointer.current
      .transition()
      .delay(needle.animationDelay)
      .ease(needle.elastic ? easeElastic : easeExpOut)
      .duration(needle.animationDuration)
      .tween("progress",  () => {
        const currentInterpolatedPercent = interpolateNumber(prevPercent, currentPercent);
        return function (percentOfPercent: number) {
          const progress = currentInterpolatedPercent(percentOfPercent);
          return needlePath.attr("d", calculateNeedlePath(progress, pathLength, needleRadius, centerPoint));
        };
      });
  } else {
    needlePath.attr("d", calculateNeedlePath(utils.getCurrentGaugeValuePercentage(gauge.props), pathLength, needleRadius, centerPoint));
  }
};

export const calculateNeedlePath = (percent: number, pathLength: number, needleRadius: number, centerPoint: any) => {
  var theta = utils.percentToRad(percent);
  var topPoint = [
    centerPoint[0] - pathLength * Math.cos(theta),
    centerPoint[1] - pathLength * Math.sin(theta),
  ];
  var thetaMinusHalfPi = theta - Math.PI / 2;
  var leftPoint = [
    centerPoint[0] - needleRadius * Math.cos(thetaMinusHalfPi),
    centerPoint[1] - needleRadius * Math.sin(thetaMinusHalfPi),
  ];
  var thetaPlusHalfPi = theta + Math.PI / 2;
  var rightPoint = [
    centerPoint[0] - needleRadius * Math.cos(thetaPlusHalfPi),
    centerPoint[1] - needleRadius * Math.sin(thetaPlusHalfPi),
  ];
    
  var pathStr = `M ${leftPoint[0]} ${leftPoint[1]} L ${topPoint[0]} ${topPoint[1]} L ${rightPoint[0]} ${rightPoint[1]}`;
  return pathStr;
};

export const getNeedleRadius = (gauge: Gauge) => {
  const { needle } = gauge.props;
  return needle.width * (gauge.width.current / 500);
}

export const addNeedleElement = (gauge: Gauge) => gauge.pointer.current = gauge.g.current.append("g").attr("class", "needle");
