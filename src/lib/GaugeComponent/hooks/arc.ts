import * as utils from './utils';
import {
  select,
  scaleLinear,
  interpolateHsl,
  arc,
} from "d3";
import { Gauge } from '../types/Gauge';
import * as arcHooks from './arc';
import CONSTANTS from '../constants';
import { Tooltip, defaultTooltipStyle } from '../types/Tooltip';
import { GaugeType } from '../types/GaugeComponentProps';
import { throttle } from 'lodash';
import { Arc, SubArc } from '../types/Arc';

const onArcMouseMove = (event: any, d: any, gauge: Gauge) => {
  //event.target.style.stroke = "#ffffff5e";
  if (d.data.tooltip != undefined) {
    let shouldChangeText = d.data.tooltip.text != gauge.tooltip.current.text();
    if (shouldChangeText) {
      gauge.tooltip.current.html(d.data.tooltip.text)
        .style("position", "absolute")
        .style("display", "block")
        .style("opacity", 1);
      applyTooltipStyles(d.data.tooltip, d.data.color, gauge);
    }
    gauge.tooltip.current.style("left", (event.pageX + 15) + "px")
      .style("top", (event.pageY - 10) + "px");
  }
  if (d.data.onMouseMove != undefined) d.data.onMouseMove(event);
}
const applyTooltipStyles = (tooltip: Tooltip, arcColor: string, gauge: Gauge) => {
  //Apply default styles
  Object.entries(defaultTooltipStyle).forEach(([key, value]) => gauge.tooltip.current.style(utils.camelCaseToKebabCase(key), value))
  gauge.tooltip.current.style("background-color", arcColor);
  //Apply custom styles
  if (tooltip.style != undefined) Object.entries(tooltip.style).forEach(([key, value]) => gauge.tooltip.current.style(utils.camelCaseToKebabCase(key), value))
}
const onArcMouseLeave = (event: any, d: any, gauge: Gauge, mousemoveCbThrottled: any) => {
  mousemoveCbThrottled.cancel();
  hideTooltip(gauge);
  if (d.data.onMouseLeave != undefined) d.data.onMouseLeave(event);
}
export const hideTooltip = (gauge: Gauge) => {
  gauge.tooltip.current.html(" ").style("display", "none");
}
const onArcMouseOut = (event: any, d: any, gauge: Gauge) => {
  event.target.style.stroke = "none";
}
const onArcMouseClick = (event: any, d: any) => {
  if (d.data.onMouseClick != undefined) d.data.onMouseClick(event);
}

export const setArcData = (gauge: Gauge) => {
  let arc = gauge.props.arc as Arc;
  let minValue = gauge.props.minValue as number;
  let maxValue = gauge.props.maxValue as number;
  // Determine number of arcs to display
  let nbArcsToDisplay: number = arc?.nbSubArcs || (arc?.subArcs?.length || 1);

  let colorArray = getColors(nbArcsToDisplay, gauge);
  if (arc?.subArcs && !arc?.nbSubArcs) {
    let lastSubArcLimit = 0;
    let lastSubArcLimitPercentageAcc = 0;
    let subArcsLength: Array<number> = [];
    let subArcsLimits: Array<number> = [];
    let subArcsTooltip: Array<Tooltip> = [];
    arc?.subArcs?.forEach((subArc, i) => {
      let subArcLength = 0;
      //map limit for non defined subArcs limits
      let subArcRange = 0;
      let limit = subArc.limit as number;
      if (subArc.length != undefined) {
        subArcLength = subArc.length;
        limit = utils.getCurrentGaugeValueByPercentage(subArcLength + lastSubArcLimitPercentageAcc, gauge);
      } else if (subArc.limit == undefined) {
        subArcRange = lastSubArcLimit;
        let remainingPercentageEquallyDivided: number | undefined = undefined;
        let remainingSubArcs = arc?.subArcs?.slice(i);
        let remainingPercentage = (1 - utils.calculatePercentage(minValue, maxValue, lastSubArcLimit)) * 100;
        if (!remainingPercentageEquallyDivided) {
          remainingPercentageEquallyDivided = (remainingPercentage / Math.max(remainingSubArcs?.length || 1, 1)) / 100;
        }
        limit = lastSubArcLimit + (remainingPercentageEquallyDivided * 100);
        subArcLength = remainingPercentageEquallyDivided;
      } else {
        subArcRange = limit - lastSubArcLimit;
        // Calculate arc length based on previous arc percentage
        if (i !== 0) {
          subArcLength = utils.calculatePercentage(minValue, maxValue, limit) - lastSubArcLimitPercentageAcc;
        } else {
          subArcLength = utils.calculatePercentage(minValue, maxValue, subArcRange);
        }
      }
      subArcsLength.push(subArcLength);
      subArcsLimits.push(limit);
      lastSubArcLimitPercentageAcc = subArcsLength.reduce((count, curr) => count + curr, 0);
      lastSubArcLimit = limit;
      if (subArc.tooltip != undefined) subArcsTooltip.push(subArc.tooltip);
    });
    let subArcs = arc.subArcs as SubArc[];
    gauge.arcData.current = subArcsLength.map((length, i) => ({
      value: length,
      limit: subArcsLimits[i],
      color: colorArray[i],
      showTick: subArcs[i].showTick || false,
      tooltip: subArcs[i].tooltip || undefined,
      onMouseMove: subArcs[i].onMouseMove,
      onMouseLeave: subArcs[i].onMouseLeave,
      onMouseClick: subArcs[i].onClick
    }));
  } else {
    const arcValue = maxValue / nbArcsToDisplay;

    gauge.arcData.current = Array.from({ length: nbArcsToDisplay }, (_, i) => ({
      value: arcValue,
      limit: (i + 1) * arcValue,
      color: colorArray[i],
      tooltip: undefined,
    }));
  }
};

const getGrafanaMainArcData = (gauge: Gauge, percent: number | undefined = undefined) => {
  let currentPercentage = percent != undefined ? percent : utils.calculatePercentage(gauge.props.minValue as number,
    gauge.props.maxValue as number,
    gauge.props.value as number);
  let curArcData = getArcDataByPercentage(currentPercentage, gauge);
  let firstSubArc = {
    value: currentPercentage,
    //White indicate that no arc was found and work as an alert for debug
    color: curArcData?.color || "white",
    //disabled for now because onMouseOut is not working properly with the
    //high amount of renderings of this arc
    //tooltip: curArcData?.tooltip
  }
  //This is the grey arc that will be displayed when the gauge is not full
  let secondSubArc = {
    value: 1 - currentPercentage,
    color: gauge.props.arc?.emptyColor,
  }
  return [firstSubArc, secondSubArc];
}
const drawGrafanaOuterArc = (gauge: Gauge, resize: boolean = false) => {
  const { outerRadius } = gauge.dimensions.current;
  //Grafana's outer arc will be populates as the standard arc data would
  if (gauge.props.type == GaugeType.Grafana && resize) {
    gauge.doughnut.current.selectAll(".outerSubArc").remove();
    let outerArc = arc()
      .outerRadius(outerRadius + 7)
      .innerRadius(outerRadius + 2)
      .cornerRadius(0)
      .padAngle(0);
    var arcPaths = gauge.doughnut.current
      .selectAll("anyString")
      .data(gauge.pieChart.current(gauge.arcData.current))
      .enter()
      .append("g")
      .attr("class", "outerSubArc");
    let outerArcSubarcs = arcPaths
      .append("path")
      .attr("d", outerArc);
    applyColors(outerArcSubarcs, gauge);
    const mousemoveCbThrottled = throttle((event: any, d: any) => onArcMouseMove(event, d, gauge), 20);
    arcPaths
      .on("mouseleave", (event: any, d: any) => onArcMouseLeave(event, d, gauge, mousemoveCbThrottled))
      .on("mouseout", (event: any, d: any) => onArcMouseOut(event, d, gauge))
      .on("mousemove", mousemoveCbThrottled)
      .on("click", (event: any, d: any) => onArcMouseClick(event, d))
  }
}
export const drawArc = (gauge: Gauge, percent: number | undefined = undefined) => {
  const { padding, cornerRadius } = gauge.props.arc as Arc;
  const { innerRadius, outerRadius } = gauge.dimensions.current;
  // chartHooks.clearChart(gauge);
  let data = {}
  //When gradient enabled, it'll have only 1 arc
  if (gauge.props?.arc?.gradient) {
    data = [{ value: 1 }];
  } else {
    data = gauge.arcData.current
  }
  if (gauge.props.type == GaugeType.Grafana) {
    data = getGrafanaMainArcData(gauge, percent);
  }
  let arcPadding = gauge.props.type == GaugeType.Grafana ? 0 : padding;
  let arcCornerRadius = gauge.props.type == GaugeType.Grafana ? 0 : cornerRadius;
  let arcObj = arc()
    .outerRadius(outerRadius)
    .innerRadius(innerRadius)
    .cornerRadius(arcCornerRadius as number)
    .padAngle(arcPadding);
  var arcPaths = gauge.doughnut.current
    .selectAll("anyString")
    .data(gauge.pieChart.current(data))
    .enter()
    .append("g")
    .attr("class", "subArc");
  let subArcs = arcPaths
    .append("path")
    .attr("d", arcObj);
  applyColors(subArcs, gauge);
  const mousemoveCbThrottled = throttle((event: any, d: any) => onArcMouseMove(event, d, gauge), 20);
  arcPaths
    .on("mouseleave", (event: any, d: any) => onArcMouseLeave(event, d, gauge, mousemoveCbThrottled))
    .on("mouseout", (event: any, d: any) => onArcMouseOut(event, d, gauge))
    .on("mousemove", mousemoveCbThrottled)
    .on("click", (event: any, d: any) => onArcMouseClick(event, d))

}
export const setupArcs = (gauge: Gauge, resize: boolean = false) => {
  //Setup the arc
  setupTooltip(gauge);
  drawGrafanaOuterArc(gauge, resize);
  drawArc(gauge);
};

export const setupTooltip = (gauge: Gauge) => {
  //Add tooltip
  let isTooltipInTheDom = document.getElementsByClassName(CONSTANTS.arcTooltipClassname).length != 0;
  if (!isTooltipInTheDom) select("body").append("div").attr("class", CONSTANTS.arcTooltipClassname);
  gauge.tooltip.current = select(`.${CONSTANTS.arcTooltipClassname}`);
  gauge.tooltip.current
    .on("mouseleave", () => arcHooks.hideTooltip(gauge))
    .on("mouseout", () => arcHooks.hideTooltip(gauge))
}

export const applyColors = (subArcsPath: any, gauge: Gauge) => {
  if (gauge.props?.arc?.gradient) {
    let uniqueId = `subArc-linear-gradient-${Math.random()}`
    let gradEl = createGradientElement(gauge.doughnut.current, uniqueId);
    applyGradientColors(gradEl, gauge)
    subArcsPath.style("fill", (d: any) => `url(#${uniqueId})`);
  } else {
    subArcsPath.style("fill", (d: any) => d.data.color);
  }
}

export const getArcDataByValue = (value: number, gauge: Gauge): SubArc =>
  gauge.arcData.current.find(subArcData => value <= (subArcData.limit as number)) as SubArc;

export const getArcDataByPercentage = (percentage: number, gauge: Gauge): SubArc =>
  getArcDataByValue(utils.getCurrentGaugeValueByPercentage(percentage, gauge), gauge) as SubArc;

export const applyGradientColors = (gradEl: any, gauge: Gauge) => {

  gauge.arcData.current.forEach((subArcData: SubArc) => {
    const normalizedOffset = utils.normalize(subArcData?.limit!, gauge?.props?.minValue ?? 0, gauge?.props?.maxValue ?? 100);
    gradEl.append("stop")
      .attr("offset", `${normalizedOffset}%`)
      .style("stop-color", subArcData.color)//end in red
      .style("stop-opacity", 1)
  }
  )
}

//Depending on the number of levels in the chart
//This function returns the same number of colors
export const getColors = (nbArcsToDisplay: number, gauge: Gauge) => {
  let arc = gauge.props.arc as Arc;
  let colorsValue: string[] = [];
  if (!arc.colorArray) {
    let subArcColors = arc.subArcs?.map((subArc) => subArc.color);
    colorsValue = subArcColors?.some((color) => color != undefined) ? subArcColors : CONSTANTS.defaultColors;
  } else {
    colorsValue = arc.colorArray;
  }
  //defaults colorsValue to white in order to avoid compilation error
  if (!colorsValue) colorsValue = ["#fff"];
  //Check if the number of colors equals the number of levels
  //Otherwise make an interpolation
  let arcsEqualsColorsLength = nbArcsToDisplay === colorsValue?.length;
  if (arcsEqualsColorsLength) return colorsValue;
  var colorScale = scaleLinear()
    .domain([1, nbArcsToDisplay])
    //@ts-ignore
    .range([colorsValue[0], colorsValue[colorsValue.length - 1]]) //Use the first and the last color as range
    //@ts-ignore
    .interpolate(interpolateHsl);
  var colorArray = [];
  for (var i = 1; i <= nbArcsToDisplay; i++) {
    colorArray.push(colorScale(i));
  }
  return colorArray;
};
export const createGradientElement = (div: any, uniqueId: string) => {
  //make defs and add the linear gradient
  var lg = div.append("defs").append("linearGradient")
    .attr("id", uniqueId)//id of the gradient
    .attr("x1", "0%")
    .attr("x2", "100%")
    .attr("y1", "0%")
    .attr("y2", "0%")
    ;
  return lg
}

export const getCoordByValue = (value: number, gauge: Gauge, position = "inner", centerToArcLengthSubtract = 0, radiusFactor = 1) => {
  let positionCenterToArcLength: { [key: string]: () => number } = {
    "outer": () => gauge.dimensions.current.outerRadius - centerToArcLengthSubtract + 2,
    "inner": () => gauge.dimensions.current.innerRadius * radiusFactor - centerToArcLengthSubtract + 9,
    "between": () => {
      let lengthBetweenOuterAndInner = (gauge.dimensions.current.outerRadius - gauge.dimensions.current.innerRadius);
      let middlePosition = gauge.dimensions.current.innerRadius + lengthBetweenOuterAndInner - 5;
      return middlePosition;
    }
  };
  let centerToArcLength = positionCenterToArcLength[position]();
  // This normalizes the labels when distanceFromArc = 0 to be just touching the arcs 
  if (gauge.props.type === GaugeType.Grafana) {
    centerToArcLength += 5;
  } else if (gauge.props.type === GaugeType.Semicircle) {
    centerToArcLength += -2;
  }
  let percent = utils.calculatePercentage(gauge.props.minValue as number, gauge.props.maxValue as number, value);
  let gaugeTypesAngles: Record<GaugeType, { startAngle: number; endAngle: number; }> = {
    [GaugeType.Grafana]: {
      startAngle: utils.degToRad(-23),
      endAngle: utils.degToRad(203)
    },
    [GaugeType.Semicircle]: {
      startAngle: utils.degToRad(0.9),
      endAngle: utils.degToRad(179.1)
    },
    [GaugeType.Radial]: {
      startAngle: utils.degToRad(-39),
      endAngle: utils.degToRad(219)
    },
  };

  let { startAngle, endAngle } = gaugeTypesAngles[gauge.props.type as GaugeType];
  const angle = startAngle + (percent) * (endAngle - startAngle);

  let coordsRadius = 1 * (gauge.dimensions.current.width / 500);
  let coord = [0, -coordsRadius / 2];
  let coordMinusCenter = [
    coord[0] - centerToArcLength * Math.cos(angle),
    coord[1] - centerToArcLength * Math.sin(angle),
  ];
  let centerCoords = [gauge.dimensions.current.outerRadius, gauge.dimensions.current.outerRadius];
  let x = (centerCoords[0] + coordMinusCenter[0]);
  let y = (centerCoords[1] + coordMinusCenter[1]);
  return { x, y }
}
export const redrawArcs = (gauge: Gauge) => {
  clearArcs(gauge);
  setArcData(gauge);
  setupArcs(gauge);
}
export const clearArcs = (gauge: Gauge) => {
  gauge.doughnut.current.selectAll(".subArc").remove();
}
export const clearOuterArcs = (gauge: Gauge) => {
  gauge.doughnut.current.selectAll(".outerSubArc").remove();
}

export const validateArcs = (gauge: Gauge) => {
  verifySubArcsLimits(gauge);
}
/**
 * Reorders the subArcs within the gauge's arc property based on the limit property.
 * SubArcs with undefined limits are sorted last.
*/
const reOrderSubArcs = (gauge: Gauge): void => {
  let subArcs = gauge.props.arc?.subArcs as SubArc[];
  subArcs.sort((a, b) => {
    if (typeof a.limit === 'undefined' && typeof b.limit === 'undefined') {
      return 0;
    }
    if (typeof a.limit === 'undefined') {
      return 1;
    }
    if (typeof b.limit === 'undefined') {
      return -1;
    }
    return a.limit - b.limit;
  });
}
const verifySubArcsLimits = (gauge: Gauge) => {
  // disabled when length implemented.
  // reOrderSubArcs(gauge);
  let minValue = gauge.props.minValue as number;
  let maxValue = gauge.props.maxValue as number;
  let arc = gauge.props.arc as Arc;
  let subArcs = arc.subArcs as SubArc[];
  let prevLimit: number | undefined = undefined;
  for (const subArc of gauge.props.arc?.subArcs || []) {
    const limit = subArc.limit;
    if (typeof limit !== 'undefined') {
      // Check if the limit is within the valid range
      if (limit < minValue || limit > maxValue)
        throw new Error(`The limit of a subArc must be between the minValue and maxValue. The limit of the subArc is ${limit}`);
      // Check if the limit is greater than the previous limit
      if (typeof prevLimit !== 'undefined') {
        if (limit <= prevLimit)
          throw new Error(`The limit of a subArc must be greater than the limit of the previous subArc. The limit of the subArc is ${limit}. If you're trying to specify length in percent of the arc, use property "length". refer to: https://github.com/antoniolago/react-gauge-component`);
      }
      prevLimit = limit;
    }
  }
  // If the user has defined subArcs, make sure the last subArc has a limit equal to the maxValue
  if (subArcs.length > 0) {
    let lastSubArc = subArcs[subArcs.length - 1];
    if (lastSubArc.limit as number < maxValue) lastSubArc.limit = maxValue;
  }
}