import * as utils from '../utils';
import {
  easeElastic,
  easeExpOut,
  interpolateNumber,
} from "d3";
import { Gauge } from "../../types/Gauge";


export const drawArrow = (gauge: Gauge, resize: boolean = false) => {
  const { pointer, value, minValue, maxValue } = gauge.props;
  var arrow = pointer.config;
  var arrowRadius = getArrowRadius(gauge) 
  var centerPoint = [0, -arrowRadius / 2];
  let currentPercent = utils.calculatePercentage(minValue, maxValue, value as number);
  var prevPercent = utils.calculatePercentage(minValue, maxValue, gauge.prevProps?.current.value || minValue);
  var pathLength = gauge.outerRadius.current * arrow.length;
  var arrowRadius = getArrowRadius(gauge);
  let isFirstTime = gauge.prevProps?.current.value == undefined;
  if(isFirstTime || resize){
    var pathStr = calculateArrowPath(gauge, prevPercent || utils.getCurrentGaugeValuePercentage(gauge.props), pathLength, arrowRadius, centerPoint);
    gauge.pointer.current.append("path").attr("d", pathStr).attr("fill", arrow.color);
    //Translate the arrow starting point to the middle of the arc
    gauge.pointer.current.attr(
      "transform",
      "translate(" + gauge.outerRadius.current + ", " + gauge.outerRadius.current + ")"
    );
  }
  //Rotate the arrow
  let arrowPath = gauge.container.current.select(`.arrow path`);
  let prevProgress = 0;
  if ((!resize || isFirstTime) && arrow.animate) {
    gauge.pointer.current
      .transition()
      .delay(arrow.animationDelay)
      .ease(arrow.elastic ? easeElastic : easeExpOut)
      .duration(arrow.animationDuration)
      .tween("progress",  () => {
        const currentInterpolatedPercent = interpolateNumber(prevPercent, currentPercent);
        return function (percentOfPercent: number) {
          const progress = currentInterpolatedPercent(percentOfPercent);
          //Avoid unnecessary re-rendering (when progress is too small) but allow the arrow to reach the final value
          if( Math.abs(progress - prevProgress) < 0.0001 && progress != currentPercent){
            prevProgress = progress;
            return; 
          }
          prevProgress = progress;
          return arrowPath.attr("d", calculateArrowPath(gauge, progress, pathLength, arrowRadius, centerPoint));
        };
      });
  } else {
    arrowPath.attr("d", calculateArrowPath(gauge, utils.getCurrentGaugeValuePercentage(gauge.props), pathLength, arrowRadius, centerPoint));
  }
};

export const calculateArrowPath = (gauge: Gauge, percent: number, pathLength: number, arrowRadius: number, centerPoint: any) => {
  let startAngle = utils.degToRad(gauge.props.type == "semicircle" ? 0 : -42);
  let endAngle = utils.degToRad(gauge.props.type == "semicircle" ? 180 : 222);
  const angle = startAngle + (percent) * (endAngle - startAngle);
  var topPoint = [
    centerPoint[0] - pathLength * Math.cos(angle),
    centerPoint[1] - pathLength * Math.sin(angle),
  ];
  var thetaMinusHalfPi = angle - Math.PI / 2;
  var leftPoint = [
    centerPoint[0] - arrowRadius * Math.cos(thetaMinusHalfPi),
    centerPoint[1] - arrowRadius * Math.sin(thetaMinusHalfPi),
  ];
  var thetaPlusHalfPi = angle + Math.PI / 2;
  var rightPoint = [
    centerPoint[0] - arrowRadius * Math.cos(thetaPlusHalfPi),
    centerPoint[1] - arrowRadius * Math.sin(thetaPlusHalfPi),
  ];
    
  var pathStr = `M ${leftPoint[0]} ${leftPoint[1]} L ${topPoint[0]} ${topPoint[1]} L ${rightPoint[0]} ${rightPoint[1]}`;
  return pathStr;
};

export const getArrowRadius = (gauge: Gauge) => {
  const { pointer } = gauge.props;
  return pointer.config.width * (gauge.width.current / 500);
}

export const addArrowElement = (gauge: Gauge) => gauge.pointer.current = gauge.g.current.append("g").attr("class", "arrow");
