import * as utils from './utils';
import CONSTANTS from '../constants';
import { Gauge } from '../types/Gauge';
import { Mark } from '../types/Mark';
import React from 'react';
import { GaugeType } from '../types/GaugeComponentProps';
import { getArcDataByValue, getCoordByValue } from './arc';
import { PointerType } from '../types/Pointer';
import { Labels, ValueLabel } from '../types/Labels';
import { Arc, SubArc } from '../types/Arc';
export const setupLabels = (gauge: Gauge) => {
  setupValueLabel(gauge);
  setupMarks(gauge);
}
export const setupValueLabel = (gauge: Gauge) => {
  const { labels } = gauge.props;
  if (!labels?.valueLabel?.hide) addValueText(gauge)
}
export const setupMarks = (gauge: Gauge) => {
  let labels = gauge.props.labels as Labels;
  let minValue = gauge.props.minValue as number;
  let maxValue = gauge.props.maxValue as number;
  if (CONSTANTS.debugMarkersRadius) {
    for (let index = 0; index < maxValue; index++) {
      let indexMark = mapMark(index, gauge);
      addMark(indexMark, gauge);
    }
  } else if (!labels.markLabel?.hideMinMax) {
    let alreadyHaveMinValueMark = labels.markLabel?.marks?.some((mark: Mark) => mark.value == minValue);
    if(!alreadyHaveMinValueMark) {
      //Add min value mark
      let minValueMark = mapMark(minValue, gauge);
      addMark(minValueMark, gauge);
    }
    let alreadyHaveMaxValueMark = labels.markLabel?.marks?.some((mark: Mark) => mark.value == maxValue);
    if(!alreadyHaveMaxValueMark){
      // //Add max value mark
      let maxValueMark = mapMark(maxValue, gauge);
      addMark(maxValueMark, gauge);
    }
  }
  if (labels.markLabel?.marks?.length as number > 0) {
    labels.markLabel?.marks?.forEach((mark: Mark) => {
      addMark(mark, gauge);
    });
  }
  addArcMarks(gauge);
}

export const addArcMarks = (gauge: Gauge) => {
  const { arc } = gauge.props;
  gauge.arcData.current?.map((subArc: SubArc) => {
    if (subArc.showMark) return subArc.limit;
  }).forEach((markValue: any) => {
    if (markValue) addMark(mapMark(markValue, gauge), gauge);
  });
}
export const mapMark = (value: number, gauge: Gauge): Mark => {
  const { markLabel } = gauge.props.labels as Labels;
  return {
    value: value,
    valueConfig: markLabel?.valueConfig,
    markerConfig: markLabel?.markerConfig
  } as Mark;
}
export const addMarker = (mark: Mark, gauge: Gauge) => {
  const { labels } = gauge.props;
  const { markAnchor, angle } = calculateAnchorAndAngleByValue(mark?.value as number, gauge);
  let coords = getLabelCoordsByValue(mark?.value as number, gauge, undefined);
  let char = mark.markerConfig?.char || labels?.markLabel?.markerConfig?.char;
  let charStyle = mark.markerConfig?.style || (labels?.markLabel?.markerConfig?.style || {})
  charStyle = {...charStyle};
  charStyle.textAnchor = markAnchor as any;
  addText(char, coords.x, coords.y, gauge, charStyle, CONSTANTS.markerClassname, angle);
}

export const addMarkValue = (mark: Mark, gauge: Gauge) => {
  const { labels, value } = gauge.props;
  let arc = gauge.props.arc as Arc;
  let arcWidth = arc.width as number;
  let markValue = mark?.value as number;
  let { markAnchor, angle } = calculateAnchorAndAngleByValue(markValue, gauge);
  let centerToArcLengthSubtract = 27 - arcWidth * 10;
  let isInner = labels?.markLabel?.type == "inner";
  if(!isInner) centerToArcLengthSubtract = arcWidth * 10 - 20
  let coords = getLabelCoordsByValue(markValue, gauge, centerToArcLengthSubtract);
  let markValueStyle = mark.valueConfig?.style || (labels?.markLabel?.valueConfig?.style || {});
  markValueStyle = {...markValueStyle};
  let text = '';
  let maxDecimalDigits = gauge.props.labels?.markLabel?.valueConfig?.maxDecimalDigits;
  if(labels?.markLabel?.valueConfig?.formatTextValue){
    text = labels.markLabel.valueConfig.formatTextValue(utils.floatingNumber(markValue, maxDecimalDigits));
  } else if(gauge.props.minValue === 0 && gauge.props.maxValue === 100){
    text = utils.floatingNumber(markValue, maxDecimalDigits).toString();
    text += "%";
  } else {
    text = utils.floatingNumber(markValue, maxDecimalDigits).toString();
  }
  //This is a position correction for the text being too far away from the marker
  if(labels?.markLabel?.type == "inner"){
    if(markAnchor === "end") coords.x += 10;
    if(markAnchor === "start") coords.x -= 10;
    if(markAnchor === "middle") coords.y -= 15;
  } else {
    // if(markAnchor === "end") coords.x -= 10;
    // if(markAnchor === "start") coords.x += 10;
  }
  if(markAnchor === "middle"){
    coords.y += 8;
  } else{
    coords.y += 3;
  }
  markValueStyle.textAnchor = markAnchor as any;
  addText(text, coords.x, coords.y, gauge, markValueStyle, CONSTANTS.markValueClassname);
}

export const addMark = (mark: Mark, gauge: Gauge) => {
  const { minValue, maxValue, labels, arc } = gauge.props;
  addMarker(mark, gauge);
  if (!CONSTANTS.debugMarkersRadius) {
    addMarkValue(mark, gauge);
  }
}
export const getLabelCoordsByValue = (value: number, gauge: Gauge, centerToArcLengthSubtract = 0) => {
  let labels = gauge.props.labels as Labels;
  let minValue = gauge.props.minValue as number;
  let maxValue = gauge.props.maxValue as number;
  let type = labels.markLabel?.type;
  let { x, y } = getCoordByValue(value, gauge, type, centerToArcLengthSubtract, 0.93);
  let percent = utils.calculatePercentage(minValue, maxValue, value);
  //This corrects labels in the cener being too close from the arc
  let isValueBetweenCenter = percent > CONSTANTS.rangeBetweenCenteredMarkValueLabel[0] && 
                                percent < CONSTANTS.rangeBetweenCenteredMarkValueLabel[1];
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
  if(valueLabel.formatTextValue){
    text = valueLabel.formatTextValue(utils.floatingNumber(value, maxDecimalDigits));
  } else if(gauge.props.minValue === 0 && gauge.props.maxValue === 100){
    text = utils.floatingNumber(value, maxDecimalDigits).toString();
    text += "%";
  } else {
    text = utils.floatingNumber(value, maxDecimalDigits).toString();
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
export const clearMarks = (gauge: Gauge) => {
  gauge.g.current.selectAll(`.${CONSTANTS.markerClassname}`).remove();
  gauge.g.current.selectAll(`.${CONSTANTS.markValueClassname}`).remove();
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
  let isValueBetweenTolerance = valuePercentage > CONSTANTS.rangeBetweenCenteredMarkValueLabel[0] && 
                                valuePercentage < CONSTANTS.rangeBetweenCenteredMarkValueLabel[1];
  let markAnchor = '';
  let isInner = gauge.props.labels?.markLabel?.type == "inner";
  if (isValueBetweenTolerance) {
    markAnchor = "middle";
  } else if (isValueLessThanHalf) {
    markAnchor = isInner ? "start" : "end";
  } else {
    markAnchor = isInner ? "end" : "start";
  }
  if(valuePercentage > 0.50) angle = angle - 180;
  return { markAnchor, angle };
}