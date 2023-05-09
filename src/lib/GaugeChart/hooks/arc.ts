import * as utils from './utils';
import {
  arc,
  pie,
  select,
  easeElastic,
  scaleLinear,
  interpolateHsl,
  interpolateNumber,
} from "d3";
import { Gauge } from '../types/Gauge';
import * as chartHooks from './chart';
import CONSTANTS from '../constants';

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
    let subArcsLabels: Array<string> = [];
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
      // subArcsLabels.push(subArc.label);
    });
    gauge.arcData.current = subArcsLength.map((length, i) => ({
      value: length,
      color: colorArray[i],
      label: subArcsLabels[i],
    }));
  } else {
    const arcValue = maxValue / gauge.nbArcsToDisplay.current;

    gauge.arcData.current = Array.from({ length: gauge.nbArcsToDisplay.current }, (_, i) => ({
      value: arcValue,
      color: colorArray[i],
      label: null,
    }));
  }
};

export const setupArcs = (gauge: Gauge) => {
  const { arc } = gauge.props;
  //Setup the arc
  gauge.arcChart.current
    .outerRadius(gauge.outerRadius.current)
    .innerRadius(gauge.innerRadius.current)
    .cornerRadius(arc.cornerRadius)
    .padAngle(arc.padding);
  chartHooks.clearChart(gauge);
  //Draw the arc
  var arcPaths = gauge.doughnut.current
    .selectAll(".arc")
    .data(gauge.pieChart.current(gauge.arcData.current))
    .enter()
    .append("g")
    .attr("class", "arc");
  arcPaths
    .append("path")
    .attr("d", gauge.arcChart.current)
    // .style("fill", (d) => `linear-gradient(to right, red 0%, green 100%)`);
    .style("fill", (d: any) => d.data.color);
};
//Depending on the number of levels in the chart
//This function returns the same number of colors
export const getColors = (gauge: Gauge) => {
  const { arc } = gauge.props;
  let colorsValue: string[] = [];
  if(!arc.colorArray){
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
  console.log(colorArray);
  return colorArray;
};

export const clearArcs = (gauge: Gauge) => gauge.doughnut.current.selectAll(".arc").remove();