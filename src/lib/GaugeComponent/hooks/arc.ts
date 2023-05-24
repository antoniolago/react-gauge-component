import * as utils from './utils';
import {
  select,
  scaleLinear,
  interpolateHsl,
} from "d3";
import { Gauge } from '../types/Gauge';
import * as chartHooks from './chart';
import CONSTANTS from '../constants';
import { Tooltip, defaultTooltipStyle } from '../types/Tooltip';

const onArcMouseMove = (event: any, d: any, gauge: Gauge) => {
  if (d.data.tooltip != undefined) {
    let shouldChangeText = d.data.tooltip.text != gauge.tooltip.current.text();
    if(shouldChangeText){
      event.target.style.stroke = "powderblue";
      gauge.tooltip.current.html(d.data.tooltip.text)
      .style("position", "absolute")
      .style("display", "block")
      .style("opacity", 1);
      applyTooltipStyles(d.data.tooltip, d.data.color, gauge);
    }
    gauge.tooltip.current.style("left", (event.pageX + 15) + "px")
      .style("top", (event.pageY - 10) + "px");
  }
  if(d.data.onMouseMove != undefined) d.data.onMouseMove(event);
}
const applyTooltipStyles = (tooltip: Tooltip, arcColor: string, gauge: Gauge) => {
  //Apply default styles
  Object.entries(defaultTooltipStyle).forEach(([key, value]) => gauge.tooltip.current.style(utils.camelCaseToKebabCase(key), value))
  gauge.tooltip.current.style("background-color", arcColor);
  //Apply custom styles
  if (tooltip.style != undefined) Object.entries(tooltip.style).forEach(([key, value]) => gauge.tooltip.current.style(utils.camelCaseToKebabCase(key), value))
}
const onArcMouseOut = (event: any, d: any) => { 
  select(`.${CONSTANTS.arcTooltipClassname}`).html(" ").style("display", "none"); 
  event.target.style.stroke = "none";
  if(d.data.onMouseLeave != undefined) d.data.onMouseLeave(event);
}
const onArcMouseClick = (event: any, d: any) => { 
  if(d.data.onMouseClick != undefined) d.data.onMouseClick(event);
}

export const getRemainingArcLengthLimit = (gauge: Gauge) => {
}

export const setArcData = (gauge: Gauge) => {
  const { arc, minValue, maxValue } = gauge.props;
  // Determine number of arcs to display
  let nbArcsToDisplay = arc.nbSubArcs || arc.subArcs?.length;

  let colorArray = getColors(nbArcsToDisplay, gauge);
  if (arc.subArcs && !arc.nbSubArcs) {
    let lastSubArcLimit = 0;
    let lastSubArcLimitPercentageAcc = 0;
    let subArcsLength: Array<number> = [];
    let subArcsLimits: Array<number> = [];
    let subArcsTooltip: Array<Tooltip> = [];
    arc.subArcs?.forEach((subArc, i) => {
      let subArcLength = 0;
      //map limit for non defined subArcs limits
      let subArcRange = 0;
      let limit = subArc.limit as number;
      if (subArc.limit == undefined) {
        subArcRange = lastSubArcLimit;
        let remainingPercentageEquallyDivided: number | undefined = undefined;
        let remainingSubArcs = arc.subArcs.slice(i);
        let remainingPercentage = (1 - utils.calculatePercentage(minValue, maxValue, lastSubArcLimit)) * 100;
        if (!remainingPercentageEquallyDivided) {
          remainingPercentageEquallyDivided = (remainingPercentage / Math.max(remainingSubArcs.length, 1)) / 100;
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
      //subArc.limit = limit;
      if (subArc.tooltip != undefined) subArcsTooltip.push(subArc.tooltip);
    });
    gauge.arcData.current = subArcsLength.map((length, i) => ({
      value: length,
      limit: subArcsLimits[i],
      color: colorArray[i],
      showMark: arc.subArcs[i].showMark,
      tooltip: arc.subArcs[i].tooltip || undefined,
      onMouseMove: arc.subArcs[i].onMouseMove,
      onMouseLeave: arc.subArcs[i].onMouseLeave,
      onMouseClick: arc.subArcs[i].onClick
    }));
  } else {
    const arcValue = maxValue / nbArcsToDisplay;

    gauge.arcData.current = Array.from({ length: nbArcsToDisplay }, (_, i) => ({
      value: arcValue,
      color: colorArray[i],
      tooltip: undefined,
    }));
  }
};

export const setupArcs = (gauge: Gauge) => {
  const { arc } = gauge.props;
  //Add tooltip
  let isTooltipInTheDom = document.getElementsByClassName(CONSTANTS.arcTooltipClassname).length != 0;
  if (!isTooltipInTheDom) select("body").append("div").attr("class", CONSTANTS.arcTooltipClassname);
  gauge.tooltip.current = select(`.${CONSTANTS.arcTooltipClassname}`);
  //Setup the arc
  gauge.arcChart.current
    .outerRadius(gauge.outerRadius.current)
    .innerRadius(gauge.innerRadius.current)
    .cornerRadius(arc.cornerRadius)
    .padAngle(arc.padding);

  chartHooks.clearChart(gauge);
  let data = {}
  //When gradient enabled, it'll have only 1 arc
  if(gauge.props.arc.gradient){
    data = [{value: 1}];
  } else {
    data = gauge.arcData.current
  }
  var arcPaths = gauge.doughnut.current
    .selectAll(".arc")
    .data(gauge.pieChart.current(data))
    .enter()
    .append("g");
  let subArcs = arcPaths
    .append("path")
    .attr("d", gauge.arcChart.current)
  applyColors(subArcs, gauge);

  arcPaths
    .on("mouseout", (event: any, d: any) => onArcMouseOut(event, d))
    .on("mousemove", (event: any, d: any) => onArcMouseMove(event, d, gauge))
    .on("click", (event: any, d: any) => onArcMouseClick(event, d))
};

export const applyColors = (subArcsPath: any, gauge: Gauge) => {
  if(gauge.props.arc.gradient){
    let uniqueId = `subArc-linear-gradient-${Math.random()}`
    let gradEl = createGradientElement(gauge.doughnut.current, uniqueId);
    applyGradientColors(gradEl, gauge)
    subArcsPath.style("fill", (d: any) => `url(#${uniqueId})`);
  }else{
    subArcsPath.style("fill", (d: any) => d.data.color);
  }

}
export const applyGradientColors = (gradEl: any, gauge: Gauge) => {
  const { arc } = gauge.props;
  gauge.arcData.current.forEach((subArcData) => 
    gradEl.append("stop")
        .attr("offset", `${subArcData.limit}%`)
        .style("stop-color", subArcData.color)//end in red
        .style("stop-opacity", 1)
  )
}

//Depending on the number of levels in the chart
//This function returns the same number of colors
export const getColors = (nbArcsToDisplay: number, gauge: Gauge) => {
  const { arc } = gauge.props;
  let colorsValue: string[] = [];
  if (!arc.colorArray) {
    let subArcColors = arc.subArcs?.map((subArc) => subArc.color);
    colorsValue = subArcColors?.some((color) => color != undefined) ? subArcColors : CONSTANTS.defaultColors;
  } else {
    colorsValue = arc.colorArray;
  }
  //defaults colorsValue to white in order to avoid compilation error
  if(!colorsValue) colorsValue = ["#fff"];
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
export const clearArcs = (gauge: Gauge) => gauge.doughnut.current.selectAll("g").remove();