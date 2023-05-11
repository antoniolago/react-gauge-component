import * as utils from './utils';
import {
  select,
  scaleLinear,
  interpolateHsl,
} from "d3";
import * as d3 from "d3";
import { Gauge } from '../types/Gauge';
import * as chartHooks from './chart';
import CONSTANTS from '../constants';
import { Tooltip, defaultTooltipStyle } from '../types/Tooltip';

const onArcMouseMove = (event: any, d: any) => {
  let div = select(`.${CONSTANTS.arcTooltipClassname}`)
  div.style("display", "none");
  if(d.data.tooltip != undefined){
    div.html(d.data.tooltip.text)
      .style("left", (event.pageX + 15) + "px")
      .style("top", (event.pageY - 10) + "px")
      .style("opacity", 1)
      .style("position", "absolute")
      .style("display", "block");
    applyTooltipStyles(d.data.tooltip, d.data.color);
  }
}
const applyTooltipStyles = (tooltip: Tooltip, arcColor: string) => {
  let div = select(`.${CONSTANTS.arcTooltipClassname}`);
  //Apply default styles
  Object.entries(defaultTooltipStyle).forEach(([key, value]) => div.style(utils.camelCaseToKebabCase(key), value))
  div.style("background-color", arcColor);
  //Apply custom styles
  if(tooltip.style != undefined) Object.entries(tooltip.style).forEach(([key, value]) => div.style(utils.camelCaseToKebabCase(key), value))
}
const onArcMouseOut = () => { select(`.${CONSTANTS.arcTooltipClassname}`).html(" ").style("display", "none"); }

export const setArcData = (gauge: Gauge) => {
  const { arc, minValue, maxValue } = gauge.props;
  // Determine number of arcs to display
  gauge.nbArcsToDisplay.current = arc.nbSubArcs || arc.subArcs?.length;

  let colorArray = getColors(gauge);
  if (arc.subArcs && !arc.nbSubArcs) {
    let lastSubArcLimit = 0;
    let lastSubArcLimitPercentageAcc = 0;
    let remainingPercentageEquallyDivided: number | undefined = undefined;
    let subArcsLength: Array<number> = [];
    let subArcsTooltip: Array<Tooltip> = [];
    arc.subArcs?.forEach((subArc, i) => {
      let subArcLength = 0;
      //map limit for non defined subArcs limits
      let subArcRange = 0;
      if (subArc.limit == undefined) {
        subArcRange = lastSubArcLimit;
        let remainingSubArcs = arc.subArcs.slice(i);
        let remainingPercentage = (1 - utils.calculatePercentage(minValue, maxValue, lastSubArcLimit)) * 100;
        if (!remainingPercentageEquallyDivided) {
          remainingPercentageEquallyDivided = (remainingPercentage / Math.max(remainingSubArcs.length, 1)) / 100;
        }
        subArcLength = remainingPercentageEquallyDivided;
        subArc.limit = lastSubArcLimit + (remainingPercentageEquallyDivided * 100);
      } else {
        subArcRange = subArc.limit - lastSubArcLimit;
        // Calculate arc length based on previous arc percentage
        if (i !== 0) {
          subArcLength = utils.calculatePercentage(minValue, maxValue, subArc.limit) - lastSubArcLimitPercentageAcc;
        } else {
          subArcLength = utils.calculatePercentage(minValue, maxValue, subArcRange);
        }
      }
      subArcsLength.push(subArcLength);
      lastSubArcLimitPercentageAcc = subArcsLength.reduce((count, curr) => count + curr, 0);
      lastSubArcLimit = subArc.limit;
      if(subArc.tooltip != undefined) subArcsTooltip.push(subArc.tooltip);
    });
    gauge.arcData.current = subArcsLength.map((length, i) => ({
      value: length,
      color: colorArray[i],
      tooltip: subArcsTooltip[i],
    }));
  } else {
    const arcValue = maxValue / gauge.nbArcsToDisplay.current;

    gauge.arcData.current = Array.from({ length: gauge.nbArcsToDisplay.current }, (_, i) => ({
      value: arcValue,
      color: colorArray[i],
      tooltip: undefined,
    }));
  }
};

// var mouseclick = function (d: any) {
//   if (d3.select(d).attr("transform") == null) {
//     d3.select(d).attr("transform", "translate(42,0)");
//   } else {
//     d3.select(d).attr("transform", null);
//   }
// };

export const setupArcs = (gauge: Gauge) => {
  const { arc } = gauge.props;
  //Add tooltip
  let isTooltipInTheDom = document.getElementsByClassName(CONSTANTS.arcTooltipClassname).length != 0;
  if (!isTooltipInTheDom) select("body").append("div").attr("class", CONSTANTS.arcTooltipClassname);

  //Setup the arc
  gauge.arcChart.current
    .outerRadius(gauge.outerRadius.current)
    .innerRadius(gauge.innerRadius.current)
    .cornerRadius(arc.cornerRadius)
    .padAngle(arc.padding);

  chartHooks.clearChart(gauge);

  var arcPaths = gauge.doughnut.current
    .selectAll(".arc")
    .data(gauge.pieChart.current(gauge.arcData.current))
    .enter()
    .append("g");

  arcPaths
    .append("path")
    .attr("d", gauge.arcChart.current)
    // .style("fill", (d) => `linear-gradient(to right, red 0%, green 100%)`);
    .style("fill", (d: any) => d.data.color);

  arcPaths
    .on("mouseout", onArcMouseOut)
    .on("mousemove", (event:any, d:any) => onArcMouseMove(event, d))
};
//Depending on the number of levels in the chart
//This function returns the same number of colors
export const getColors = (gauge: Gauge) => {
  const { arc } = gauge.props;
  let colorsValue: string[] = [];
  if (!arc.colorArray) {
    let subArcColors = arc.subArcs?.map((subArc) => subArc.color);
    colorsValue = subArcColors?.some((color) => color != undefined) ? subArcColors : CONSTANTS.defaultColors;
  } else {
    colorsValue = arc.colorArray;
  }
  //Check if the number of colors equals the number of levels
  //Otherwise make an interpolation
  let arcsEqualsColorsLength = gauge.nbArcsToDisplay.current === colorsValue.length;
  if (arcsEqualsColorsLength) return colorsValue;
  var colorScale = scaleLinear()
    .domain([1, gauge.nbArcsToDisplay.current])
    //@ts-ignore
    .range([colorsValue[0], colorsValue[colorsValue.length - 1]]) //Use the first and the last color as range
    //@ts-ignore
    .interpolate(interpolateHsl);
  var colorArray = [];
  for (var i = 1; i <= gauge.nbArcsToDisplay.current; i++) {
    colorArray.push(colorScale(i));
  }
  return colorArray;
};

export const clearArcs = (gauge: Gauge) => gauge.doughnut.current.selectAll("g").remove();