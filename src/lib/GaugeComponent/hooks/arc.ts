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
  // Restore configured stroke instead of removing it
  const strokeWidth = gauge.props?.arc?.subArcsStrokeWidth || 0;
  if (strokeWidth > 0) {
    const strokeColor = gauge.props?.arc?.subArcsStrokeColor || '#ffffff';
    event.target.style.stroke = strokeColor;
    event.target.style.strokeWidth = strokeWidth;
  } else {
    event.target.style.stroke = "none";
  }
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
        let remainingSubArcs = arc?.subArcs?.slice(i);
        let remainingPercentage = 1 - utils.calculatePercentage(minValue, maxValue, lastSubArcLimit);
        let remainingPercentageEquallyDivided = remainingPercentage / Math.max(remainingSubArcs?.length || 1, 1);
        // Convert from percentage space to value space correctly
        limit = utils.getCurrentGaugeValueByPercentage(lastSubArcLimitPercentageAcc + remainingPercentageEquallyDivided, gauge);
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
    // Calculate arc value based on the RANGE, not maxValue
    const range = maxValue - minValue;
    const arcValue = range / nbArcsToDisplay;

    gauge.arcData.current = Array.from({ length: nbArcsToDisplay }, (_, i) => ({
      value: arcValue,
      limit: minValue + (i + 1) * arcValue,  // Start from minValue
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
    color: gauge.props.arc?.emptyColor || '#3a3a3a',
  }
  return [firstSubArc, secondSubArc];
}
const drawGrafanaOuterArc = (gauge: Gauge, resize: boolean = false) => {
  const { outerRadius } = gauge.dimensions.current;
  const { padding, cornerRadius, outerArc: outerArcConfig } = gauge.props.arc as Arc;
  //Grafana's outer arc will be populated as the standard arc data would
  if (gauge.props.type == GaugeType.Grafana && resize) {
    gauge.doughnut.current.selectAll(".outerSubArc").remove();
    // Use outerArc config if provided, otherwise fall back to main arc settings
    // Get outer arc width (default 5px)
    const outerArcWidth = outerArcConfig?.width ?? 5;
    // Scale corner radius for the thin outer arc (max 2px since arc is only 5px thick)
    const maxCornerRadius = Math.min(outerArcWidth / 2, 2);
    const outerCornerRadius = outerArcConfig?.cornerRadius !== undefined 
      ? Math.min(outerArcConfig.cornerRadius, maxCornerRadius) 
      : (cornerRadius ? Math.min(cornerRadius, maxCornerRadius) : 0);
    const outerPadding = outerArcConfig?.padding !== undefined 
      ? outerArcConfig.padding 
      : (padding || 0);
    // Gap between main arc and outer arc is 2px
    const gap = 2;
    let outerArc = arc()
      .outerRadius(outerRadius + gap + outerArcWidth)
      .innerRadius(outerRadius + gap)
      .cornerRadius(outerCornerRadius)
      .padAngle(outerPadding);
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

  let data: any = {}
  //When gradient enabled, it'll have only 1 arc
  if (gauge.props?.arc?.gradient) {
    data = [{ value: 1 }];
  } else {
    data = gauge.arcData.current
  }
  if (gauge.props.type == GaugeType.Grafana) {
    data = getGrafanaMainArcData(gauge, percent);
  }
  let arcPadding = padding || 0;
  let arcCornerRadius = cornerRadius || 0;
  let arcObj = arc()
    .outerRadius(outerRadius)
    .innerRadius(innerRadius)
    .cornerRadius(arcCornerRadius as number)
    .padAngle(arcPadding);
    
  var arcPaths = gauge.doughnut.current
    .selectAll("anyString")
    .data(gauge.pieChart.current(data as any))
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
  
  // Apply stroke/border to subArcs if configured
  const strokeWidth = gauge.props?.arc?.subArcsStrokeWidth || 0;
  if (strokeWidth > 0) {
    const strokeColor = gauge.props?.arc?.subArcsStrokeColor || '#ffffff';
    subArcsPath
      .attr("stroke", strokeColor)
      .attr("stroke-width", strokeWidth);
  }
}

export const getArcDataByValue = (value: number, gauge: Gauge): SubArc =>
  gauge.arcData.current.find(subArcData => value <= (subArcData.limit as number)) as SubArc;

export const getArcDataByPercentage = (percentage: number, gauge: Gauge): SubArc =>
  getArcDataByValue(utils.getCurrentGaugeValueByPercentage(percentage, gauge), gauge) as SubArc;

/**
 * Get the interpolated color for a given percentage when using gradient mode.
 * This is needed because gradient mode doesn't store colors in arcData.current.
 * Falls back to getArcDataByPercentage for non-gradient mode.
 */
export const getColorByPercentage = (percentage: number, gauge: Gauge): string => {
  // For non-gradient mode, use the existing arc data lookup
  if (!gauge.props?.arc?.gradient) {
    const arcData = getArcDataByPercentage(percentage, gauge);
    return arcData?.color as string || '#fff';
  }
  
  // For gradient mode, interpolate color from subArcs
  const subArcs = gauge.props.arc?.subArcs;
  if (!subArcs || subArcs.length === 0) {
    return '#fff';
  }
  
  const minValue = gauge.props.minValue as number;
  const maxValue = gauge.props.maxValue as number;
  const value = utils.getCurrentGaugeValueByPercentage(percentage, gauge);
  
  // Find which subArc segment the value falls into
  let prevLimit = minValue;
  for (let i = 0; i < subArcs.length; i++) {
    const subArc = subArcs[i];
    const limit = subArc.limit ?? maxValue;
    
    if (value <= limit) {
      // Value is in this segment
      if (i === 0) {
        return subArc.color as string || '#fff';
      }
      
      // Interpolate between previous and current color
      const prevColor = subArcs[i - 1]?.color as string || '#fff';
      const currentColor = subArc.color as string || '#fff';
      const segmentPercentage = (value - prevLimit) / (limit - prevLimit);
      
      // Use d3 color interpolation
      const colorInterpolator = interpolateHsl(prevColor, currentColor);
      return colorInterpolator(segmentPercentage);
    }
    prevLimit = limit;
  }
  
  // Value exceeds all limits, return last color
  return subArcs[subArcs.length - 1]?.color as string || '#fff';
}

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
  
  // Create multi-stop color scale that interpolates through ALL colors
  const numColors = colorsValue.length;
  // Create domain points for each color (evenly distributed from 1 to nbArcsToDisplay)
  const domainPoints = colorsValue.map((_, i) => 
    1 + (i * (nbArcsToDisplay - 1)) / (numColors - 1)
  );
  
  var colorScale = scaleLinear<string>()
    .domain(domainPoints)
    //@ts-ignore
    .range(colorsValue) // Use ALL colors in the range
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

export const getCoordByValue = (value: number, gauge: Gauge, position = "inner", centerToArcLengthSubtract = 0) => {
  const { outerRadius, innerRadius } = gauge.dimensions.current;
  const isGrafana = gauge.props.type === GaugeType.Grafana;
  
  // Grafana has an outer decorative arc - get width from config (default 5px) + 2px gap
  const outerArcWidth = gauge.props.arc?.outerArc?.width ?? 5;
  const grafanaOuterArcEdge = outerRadius + 2 + outerArcWidth;
  
  let positionCenterToArcLength: { [key: string]: () => number } = {
    "outer": () => {
      // For outer ticks: start at the outer edge of the arc
      // Grafana: outer decorative arc edge (outerRadius + 7)
      // Others: main arc outer edge (outerRadius)
      const arcEdge = isGrafana ? grafanaOuterArcEdge : outerRadius;
      return arcEdge - centerToArcLengthSubtract;
    },
    "inner": () => {
      // For inner ticks: start at the inner edge of the arc
      // centerToArcLengthSubtract is positive to push inward (toward center)
      return innerRadius - centerToArcLengthSubtract;
    },
    "between": () => {
      let lengthBetweenOuterAndInner = (outerRadius - innerRadius);
      let middlePosition = innerRadius + lengthBetweenOuterAndInner / 2;
      return middlePosition;
    }
  };
  let centerToArcLength = positionCenterToArcLength[position]();
  
  let percent = utils.calculatePercentage(gauge.props.minValue as number, gauge.props.maxValue as number, value);
  
  // Use actual angles from gauge dimensions (supports custom angles)
  // D3 angles: 0 = top (12 o'clock), positive = clockwise
  // Math angles for tick positioning: 0 = right (3 o'clock), 90 = down
  // Conversion: mathAngle = d3Angle + π/2
  const { startAngle: d3Start, endAngle: d3End } = gauge.dimensions.current.angles;
  const d3Angle = d3Start + percent * (d3End - d3Start);
  const angle = d3Angle + Math.PI / 2;

  // Calculate position relative to center (0, 0)
  // Since g is now centered at gaugeCenter, coordinates are relative to origin
  let x = -centerToArcLength * Math.cos(angle);
  let y = -centerToArcLength * Math.sin(angle);
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

/**
 * Efficiently update Grafana arc for animation frames.
 * Instead of clearing and recreating DOM elements on every frame,
 * this updates the existing arc paths' data, which is MUCH faster.
 */
export const updateGrafanaArc = (gauge: Gauge, percent: number) => {
  const { innerRadius, outerRadius } = gauge.dimensions.current;
  const { padding, cornerRadius } = gauge.props.arc as Arc;
  
  // Get the new arc data (returns [filledArc, emptyArc])
  const data = getGrafanaMainArcData(gauge, percent);
  
  // Create the arc generator with config values for corner and padding
  const arcObj = arc()
    .outerRadius(outerRadius)
    .innerRadius(innerRadius)
    .cornerRadius(cornerRadius || 0)
    .padAngle(padding || 0);
  
  // Get existing arc groups
  const existingArcGroups = gauge.doughnut.current.selectAll(".subArc");
  
  // If arcs don't exist yet, create them (first render)
  if (existingArcGroups.empty()) {
    drawArc(gauge, percent);
    return;
  }
  
  // Generate pie data from our arc data
  const pieData = gauge.pieChart.current(data);
  
  // Update each arc group's path with the corresponding pie data
  // We need to iterate and update each path individually since D3 data binding
  // doesn't work well with nested selections
  existingArcGroups.each(function(this: any, _d: any, i: number) {
    if (i < pieData.length) {
      const pathEl = select(this).select("path")
        .datum(pieData[i])
        .attr("d", arcObj as any)
        .style("fill", pieData[i].data.color);
      
      // Apply stroke if configured
      const strokeWidth = gauge.props?.arc?.subArcsStrokeWidth || 0;
      if (strokeWidth > 0) {
        const strokeColor = gauge.props?.arc?.subArcsStrokeColor || '#ffffff';
        pathEl.attr("stroke", strokeColor).attr("stroke-width", strokeWidth);
      }
    }
  });
}
export const clearOuterArcs = (gauge: Gauge) => {
  gauge.doughnut.current.selectAll(".outerSubArc").remove();
}

export const validateArcs = (gauge: Gauge) => {
  // Debug: log when validation is triggered
  if (typeof window !== 'undefined' && (window as any).__GAUGE_DEBUG__) {
    console.log('[GaugeComponent] validateArcs called:', {
      minValue: gauge.props.minValue,
      maxValue: gauge.props.maxValue,
      gradient: gauge.props.arc?.gradient,
      subArcsCount: gauge.props.arc?.subArcs?.length,
      subArcLimits: gauge.props.arc?.subArcs?.map(s => s.limit)
    });
  }
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
  
  // Skip validation if using gradient mode (limits don't apply)
  if (gauge.props.arc?.gradient) return;
  
  // Helper to create debug info string
  const getDebugInfo = () => {
    try {
      return JSON.stringify({
        minValue,
        maxValue,
        value: gauge.props.value,
        gradient: gauge.props.arc?.gradient,
        type: gauge.props.type,
        subArcs: gauge.props.arc?.subArcs?.map(s => ({ 
          limit: s.limit, 
          length: (s as any).length,
          color: typeof s.color === 'string' ? s.color.substring(0, 10) : s.color
        }))
      }, null, 2);
    } catch (e) {
      return 'Unable to stringify gauge props';
    }
  };
  
  for (const subArc of gauge.props.arc?.subArcs || []) {
    const limit = subArc.limit;
    // Only validate if limit is explicitly defined (skip length-based subArcs)
    if (typeof limit !== 'undefined') {
      // Check if the limit is within the valid range
      if (limit < minValue || limit > maxValue) {
        const debugInfo = getDebugInfo();
        console.error('[GaugeComponent] SubArc limit validation failed:', debugInfo);
        throw new Error(
          `SubArc limit ${limit} is outside range [${minValue}, ${maxValue}]. ` +
          `Type: ${gauge.props.type}, Gradient: ${gauge.props.arc?.gradient}. ` +
          `Check console for full debug info.`
        );
      }
      // Check if the limit is greater than the previous limit
      if (typeof prevLimit !== 'undefined') {
        if (limit <= prevLimit) {
          const debugInfo = getDebugInfo();
          console.error('[GaugeComponent] SubArc order validation failed:', debugInfo);
          throw new Error(
            `SubArc limit ${limit} must be > previous limit ${prevLimit}. ` +
            `Use "length" property for percentage-based sizing. ` +
            `See: https://github.com/antoniolago/react-gauge-component`
          );
        }
      }
      prevLimit = limit;
    }
  }
  // If the user has defined subArcs with limits, make sure the last one covers maxValue
  // Only apply to subArcs using limit (not length)
  if (subArcs && subArcs.length > 0) {
    let lastSubArc = subArcs[subArcs.length - 1];
    // Only set limit if this subArc uses limits (not length-based)
    if (typeof lastSubArc.limit !== 'undefined' && lastSubArc.limit < maxValue) {
      lastSubArc.limit = maxValue;
    }
  }
}