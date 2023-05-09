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
import * as chartHooks from './chart';
import CONSTANTS from '../constants';

export const setArcData = (gauge) => {
  const { arc, minValue, maxValue } = gauge.props;
  // Determine number of arcs to display
  gauge.nbArcsToDisplay.current = arc.subArcs.nbSubArcs || arc.subArcs?.length;

  gauge.colorArray.current = getColors(gauge);
  if (arc.subArcs && !gauge.props.nrOfLevels) {
    let lastSubArcLimit = 0;
    let lastSubArcLimitPercentageAcc = 0;
    let remainingPercentageEquallyDivided = null;
    let subArcsLength = [];
    let subArcsLabels = [];

    arc.subArcs?.forEach((subArc, i) => {
      // Set arc limit to 0 if undefined
      subArc.limit = subArc.limit === undefined ? 0 : subArc.limit;

      const subArcRange = subArc.limit - lastSubArcLimit;
      let subArcLength = 0;

      // Calculate arc length based on previous arc percentage
      if (i !== 0) {
        subArcLength = utils.calculatePercentage(minValue, maxValue, subArc.limit) - lastSubArcLimitPercentageAcc;
      } else {
        subArcLength = utils.calculatePercentage(minValue, maxValue, subArcRange);
      }

      // Divide remaining percentage equally among remaining arcs
      if (!subArc.limit) {
        const remainingSubArcs = arc.subArcs.slice(i);
        const remainingPercentage = (1 - utils.calculatePercentage(minValue, maxValue, lastSubArcLimit)) * 100;
        if (!remainingPercentageEquallyDivided) {
          remainingPercentageEquallyDivided = (remainingPercentage / Math.max(remainingSubArcs.length, 1)) / 100;
        }

        subArcLength = remainingPercentageEquallyDivided;
        subArc.limit = subArcLength;
      }

      subArcsLength.push(subArcLength);
      lastSubArcLimitPercentageAcc = subArcsLength.reduce((count, curr) => count + curr, 0);
      lastSubArcLimit = subArc.limit;
      subArcsLabels.push(subArc.label);
    });
    gauge.arcData.current = subArcsLength.map((length, i) => ({
      value: length,
      color: gauge.colorArray.current[i],
      label: subArcsLabels[i],
    }));
  } else {
    const arcValue = maxValue / gauge.nbArcsToDisplay.current;

    gauge.arcData.current = Array.from({ length: gauge.nbArcsToDisplay.current }, (_, i) => ({
      value: arcValue,
      color: gauge.colorArray.current[i],
      label: null,
    }));
  }
};

export const setupArcs = (gauge) => {
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
  .style("fill", (d) => d.data.color);
};
//Depending on the number of levels in the chart
//This function returns the same number of colors
export const getColors = (gauge) => {
  const { colors, arc } = gauge.props;
  let subArcColors = arc.subArcs?.map((subArc) => subArc.color);
  let colorsValue = subArcColors?.some((color) => color != undefined) ? subArcColors : CONSTANTS.defaultColors;
  //Check if the number of colors equals the number of levels
  //Otherwise make an interpolation
  let arcsEqualsColorsLength = gauge.nbArcsToDisplay.current === colorsValue.length;
  if (arcsEqualsColorsLength) return colorsValue;
  var colorScale = scaleLinear()
    .domain([1, gauge.nbArcsToDisplay.current])
    .range([colorsValue[0], colorsValue[colorsValue.length - 1]]) //Use the first and the last color as range
    .interpolate(interpolateHsl);
  var colorArray = [];
  for (var i = 1; i <= gauge.nbArcsToDisplay.current; i++) {
    colorArray.push(colorScale(i));
  }
  return colorArray;
};

export const clearArcs = (gauge) => gauge.doughnut.current.selectAll(".arc").remove();