import * as utils from './utils';
import CONSTANTS from '../constants';
import { Gauge } from '../types/Gauge';
import { Tick } from '../types/Tick';
import React from 'react';
import { GaugeType } from '../types/GaugeComponentProps';
import { getArcDataByValue, getCoordByValue } from './arc';
import { PointerType } from '../types/Pointer';
import { Labels, ValueLabel } from '../types/Labels';
import { Arc, SubArc } from '../types/Arc';
export const setupLabels = (gauge: Gauge) => {
  setupValueLabel(gauge);
  setupTicks(gauge);
}
export const setupValueLabel = (gauge: Gauge) => {
  const { labels } = gauge.props;
  if (!labels?.valueLabel?.hide) addValueText(gauge)
}
export const setupTicks = (gauge: Gauge) => {
  let labels = gauge.props.labels as Labels;
  let minValue = gauge.props.minValue as number;
  let maxValue = gauge.props.maxValue as number;
  if (CONSTANTS.debugTicksRadius) {
    for (let index = 0; index < maxValue; index++) {
      let indexTick = mapTick(index, gauge);
      addTick(indexTick, gauge);
    }
  } else if (!labels.tickLabels?.hideMinMax) {
    let alreadyHaveMinValueTick = labels.tickLabels?.ticks?.some((tick: Tick) => tick.value == minValue);
    if(!alreadyHaveMinValueTick) {
      //Add min value tick
      let minValueTick = mapTick(minValue, gauge);
      addTick(minValueTick, gauge);
    }
    let alreadyHaveMaxValueTick = labels.tickLabels?.ticks?.some((tick: Tick) => tick.value == maxValue);
    if(!alreadyHaveMaxValueTick){
      // //Add max value tick
      let maxValueTick = mapTick(maxValue, gauge);
      addTick(maxValueTick, gauge);
    }
  }
  if (labels.tickLabels?.ticks?.length as number > 0) {
    labels.tickLabels?.ticks?.forEach((tick: Tick) => {
      addTick(tick, gauge);
    });
  }
  addArcTicks(gauge);
}

export const addArcTicks = (gauge: Gauge) => {
  const { arc } = gauge.props;
  gauge.arcData.current?.map((subArc: SubArc) => {
    if (subArc.showTick) return subArc.limit;
  }).forEach((tickValue: any) => {
    if (tickValue) addTick(mapTick(tickValue, gauge), gauge);
  });
}
export const mapTick = (value: number, gauge: Gauge): Tick => {
  const { tickLabels } = gauge.props.labels as Labels;
  return {
    value: value,
    valueConfig: tickLabels?.defaultTickValueConfig,
    lineConfig: tickLabels?.defaultTickLineConfig
  } as Tick;
}
export const addTickLine = (tick: Tick, gauge: Gauge) => {
  const { labels } = gauge.props;
  const { tickAnchor, angle } = calculateAnchorAndAngleByValue(tick?.value as number, gauge);
  let coords = getLabelCoordsByValue(tick?.value as number, gauge, undefined);
  let char = tick.lineConfig?.char || labels?.tickLabels?.defaultTickLineConfig?.char;
  let charStyle = tick.lineConfig?.style || (labels?.tickLabels?.defaultTickLineConfig?.style || {})
  charStyle = {...charStyle};
  charStyle.textAnchor = tickAnchor as any;
  addText(char, coords.x, coords.y, gauge, charStyle, CONSTANTS.tickLineClassname, angle);
}

export const addTickValue = (tick: Tick, gauge: Gauge) => {
  const { labels, value } = gauge.props;
  let arc = gauge.props.arc as Arc;
  let arcWidth = arc.width as number;
  let tickValue = tick?.value as number;
  let { tickAnchor, angle } = calculateAnchorAndAngleByValue(tickValue, gauge);
  let centerToArcLengthSubtract = 27 - arcWidth * 10;
  let isInner = labels?.tickLabels?.type == "inner";
  if(!isInner) centerToArcLengthSubtract = arcWidth * 10 - 20
  let coords = getLabelCoordsByValue(tickValue, gauge, centerToArcLengthSubtract);
  let tickValueStyle = tick.valueConfig?.style || (labels?.tickLabels?.defaultTickValueConfig?.style || {});
  tickValueStyle = {...tickValueStyle};
  let text = '';
  let maxDecimalDigits = gauge.props.labels?.tickLabels?.defaultTickValueConfig?.maxDecimalDigits;
  if (tick.valueConfig?.formatTextValue){
    text = tick.valueConfig.formatTextValue(utils.floatingNumber(tickValue, maxDecimalDigits));
  } else if(labels?.tickLabels?.defaultTickValueConfig?.formatTextValue){
    text = labels.tickLabels.defaultTickValueConfig.formatTextValue(utils.floatingNumber(tickValue, maxDecimalDigits));
  } else if(gauge.props.minValue === 0 && gauge.props.maxValue === 100){
    text = utils.floatingNumber(tickValue, maxDecimalDigits).toString();
    text += "%";
  } else {
    text = utils.floatingNumber(tickValue, maxDecimalDigits).toString();
  }
  //This is a position correction for the text being too far away from the ticks
  if(labels?.tickLabels?.type == "inner"){
    if(tickAnchor === "end") coords.x += 10;
    if(tickAnchor === "start") coords.x -= 10;
    if(tickAnchor === "middle") coords.y -= 15;
  } else {
    // if(tickAnchor === "end") coords.x -= 10;
    // if(tickAnchor === "start") coords.x += 10;
  }
  if(tickAnchor === "middle"){
    coords.y += 8;
  } else{
    coords.y += 3;
  }
  tickValueStyle.textAnchor = tickAnchor as any;
  addText(text, coords.x, coords.y, gauge, tickValueStyle, CONSTANTS.tickValueClassname);
}

export const addTick = (tick: Tick, gauge: Gauge) => {
  const { minValue, maxValue, labels, arc } = gauge.props;
  if(!labels?.tickLabels?.defaultTickLineConfig?.hide)
    addTickLine(tick, gauge);
  if (!CONSTANTS.debugTicksRadius && !labels?.tickLabels?.defaultTickValueConfig?.hide) {
    addTickValue(tick, gauge);
  }
}
export const getLabelCoordsByValue = (value: number, gauge: Gauge, centerToArcLengthSubtract = 0) => {
  let labels = gauge.props.labels as Labels;
  let minValue = gauge.props.minValue as number;
  let maxValue = gauge.props.maxValue as number;
  let type = labels.tickLabels?.type;
  let { x, y } = getCoordByValue(value, gauge, type, centerToArcLengthSubtract, 0.93);
  let percent = utils.calculatePercentage(minValue, maxValue, value);
  //This corrects labels in the cener being too close from the arc
  let isValueBetweenCenter = percent > CONSTANTS.rangeBetweenCenteredTickValueLabel[0] && 
                                percent < CONSTANTS.rangeBetweenCenteredTickValueLabel[1];
  if (isValueBetweenCenter){
    let isInner = type == "inner";
    y+= isInner ? 8 : -1;
  }
  if(gauge.props.type == GaugeType.Radial){
    y += 3;
  }
  return { x, y }
}
export const addText = (html: any, x: number, y: number, gauge: Gauge, style: React.CSSProperties, className: string, rotate = 0) => {
  let div = gauge.g.current
    .append("g")
    .attr("class", className)
    .attr("transform", `translate(${x}, ${y})`)
    .append("text")
    .text(html) // use html() instead of text()
  applyTextStyles(div, style)
  div.attr("transform", `rotate(${rotate})`);
}

const applyTextStyles = (div: any, style: React.CSSProperties) => {
  //Apply default styles
  Object.entries(style).forEach(([key, value]: any) => div.style(utils.camelCaseToKebabCase(key), value))
  //Apply custom styles
  if(style != undefined) Object.entries(style).forEach(([key, value]: any) => div.style(utils.camelCaseToKebabCase(key), value))
}

//Adds text undeneath the graft to display which percentage is the current one
export const addValueText = (gauge: Gauge) => {
  let value = gauge.props.value as number;
  let valueLabel = gauge.props.labels?.valueLabel as ValueLabel;
  var textPadding = 20;
  let text = '';
  let maxDecimalDigits = gauge.props.labels?.valueLabel?.maxDecimalDigits;
  let floatValue = utils.floatingNumber(value, maxDecimalDigits);
  if(valueLabel.formatTextValue){
    text = valueLabel.formatTextValue(floatValue);
  } else if(gauge.props.minValue === 0 && gauge.props.maxValue === 100){
    text = floatValue.toString();
    text += "%";
  } else {
    text = floatValue.toString();
  }
  const maxLengthBeforeComputation = 4;
  const textLength = text?.length || 0;
  let fontRatio = textLength > maxLengthBeforeComputation ? maxLengthBeforeComputation / textLength * 1.5 : 1; // Compute the font size ratio
  let valueFontSize = valueLabel?.style?.fontSize as string;
  let valueTextStyle = {... valueLabel.style};
  let x = gauge.dimensions.current.outerRadius;
  let y = 0;
  valueTextStyle.textAnchor = "middle";
  if (gauge.props.type == GaugeType.Semicircle){
    y = gauge.dimensions.current.outerRadius / 1.5 + textPadding;
  } else if(gauge.props.type == GaugeType.Radial){
    y = gauge.dimensions.current.outerRadius * 1.45 + textPadding;
  } else if(gauge.props.type == GaugeType.Grafana){
    y = gauge.dimensions.current.outerRadius * 1.0 + textPadding;
  }
  //if(gauge.props.pointer.type == PointerType.Arrow){
  //  y = gauge.dimensions.current.outerRadius * 0.79 + textPadding;
  //}
  let widthFactor = gauge.props.type == GaugeType.Radial ? 0.003 : 0.003;
  fontRatio = gauge.dimensions.current.width * widthFactor * fontRatio;
  let fontSizeNumber = parseInt(valueFontSize, 10) * fontRatio;
  valueTextStyle.fontSize = fontSizeNumber + "px";
  if(valueLabel.matchColorWithArc) valueTextStyle.fill = getArcDataByValue(value, gauge)?.color as string || "white";
  addText(text, x, y, gauge, valueTextStyle, CONSTANTS.valueLabelClassname);
};

export const clearValueLabel = (gauge: Gauge) => gauge.g.current.selectAll(`.${CONSTANTS.valueLabelClassname}`).remove();
export const clearTicks = (gauge: Gauge) => {
  gauge.g.current.selectAll(`.${CONSTANTS.tickLineClassname}`).remove();
  gauge.g.current.selectAll(`.${CONSTANTS.tickValueClassname}`).remove();
}

export const calculateAnchorAndAngleByValue = (value: number, gauge: Gauge) => {
  let minValue = gauge.props.minValue as number;
  let maxValue = gauge.props.maxValue as number;
  let valuePercentage = utils.calculatePercentage(minValue, maxValue, value)
  let gaugeTypesAngles: Record<string, { startAngle: number; endAngle: number; }> = {
    [GaugeType.Grafana]: {
      startAngle: -20,
      endAngle: 220
    },
    [GaugeType.Semicircle]: {
      startAngle: 0,
      endAngle: 180
    },
    [GaugeType.Radial]: {
      startAngle: -42,
      endAngle: 266
    },
  };
  let { startAngle, endAngle } = gaugeTypesAngles[gauge.props.type as string];
  
  let angle = startAngle + (valuePercentage * 100) * endAngle / 100;
  let halfInPercentage = utils.calculatePercentage(minValue, maxValue, (maxValue / 2));
  let halfPercentage = halfInPercentage;
  let isValueLessThanHalf = valuePercentage < halfPercentage;
  //Values between 40% and 60% are aligned in the middle
  let isValueBetweenTolerance = valuePercentage > CONSTANTS.rangeBetweenCenteredTickValueLabel[0] && 
                                valuePercentage < CONSTANTS.rangeBetweenCenteredTickValueLabel[1];
  let tickAnchor = '';
  let isInner = gauge.props.labels?.tickLabels?.type == "inner";
  if (isValueBetweenTolerance) {
    tickAnchor = "middle";
  } else if (isValueLessThanHalf) {
    tickAnchor = isInner ? "start" : "end";
  } else {
    tickAnchor = isInner ? "end" : "start";
  }
  if(valuePercentage > 0.50) angle = angle - 180;
  return { tickAnchor, angle };
}