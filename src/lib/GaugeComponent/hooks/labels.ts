import * as utils from './utils';
import CONSTANTS from '../constants';
import { Gauge } from '../types/Gauge';
import { Mark } from '../types/Mark';
import React from 'react';
export const setupLabels = (gauge: Gauge) => {
  setupValueLabel(gauge);
  setupMarks(gauge);
}
export const setupValueLabel = (gauge: Gauge) => {
  const { labels } = gauge.props;
  if (!labels.valueLabel.hide) addValueText(gauge)
}
export const setupMarks = (gauge: Gauge) => {
  const { minValue, maxValue, labels } = gauge.props;
  if (CONSTANTS.debugMarkersRadius) {
    for (let index = 0; index < maxValue; index++) {
      let indexMark = mapMark(index, gauge);
      addMark(indexMark, gauge);
    }
  } else if (!labels.markLabel?.hideMinMax) {
    let alreadyHaveMinValueMark = labels.markLabel.marks.some((mark) => mark.value == minValue);
    if(!alreadyHaveMinValueMark) {
      //Add min value mark
      let minValueMark = mapMark(minValue, gauge);
      addMark(minValueMark, gauge);
    }
    let alreadyHaveMaxValueMark = labels.markLabel.marks.some((mark) => mark.value == maxValue);
    if(!alreadyHaveMaxValueMark){
      // //Add max value mark
      let maxValueMark = mapMark(maxValue, gauge);
      addMark(maxValueMark, gauge);
    }
  }
  if (labels.markLabel.marks.length > 0) {
    labels.markLabel.marks.forEach((mark) => {
      addMark(mark, gauge);
    });
  }
  addArcMarks(gauge);
}

export const addArcMarks = (gauge: Gauge) => {
  const { arc } = gauge.props;
  arc.subArcs?.map((arc) => {
    if (arc.showMark) return arc.limit;
  }).forEach((markValue) => {
    if (markValue) addMark(mapMark(markValue, gauge), gauge);
  });
}
export const mapMark = (value: number, gauge: Gauge): Mark => {
  const { markLabel } = gauge.props.labels;
  return {
    value: value,
    valueConfig: markLabel.valueConfig,
    markerConfig: markLabel.markerConfig
  } as Mark;
}
export const addMarker = (mark: Mark, gauge: Gauge) => {
  const { labels } = gauge.props;
  const { markAnchor, angle } = calculateAnchorAndAngleByValue(mark.value, gauge);
  let coords = getLabelCoordsByValue(mark.value, gauge);
  // let charSize = mark.markerConfig?.style.fontSize || labels.markLabel.markerConfig.style.fontSize;
  let char = mark.markerConfig?.char || labels.markLabel.markerConfig.char;
  // let charColor = mark.markerConfig?.style.color || labels.markLabel.markerConfig.style.color;
  let charStyle = mark.markerConfig?.style || labels.markLabel.markerConfig.style
  charStyle.textAnchor = markAnchor as any;
  addText(char, coords.x, coords.y, gauge, charStyle, CONSTANTS.markerClassname, angle);
}

export const addMarkValue = (mark: Mark, gauge: Gauge) => {
  const { labels, arc, value } = gauge.props;
  let { markAnchor, angle } = calculateAnchorAndAngleByValue(mark.value, gauge);
  let centerToArcLengthSubtract = 27 - arc.width * 10;
  let isInner = gauge.props.labels.markLabel.type == "inner";
  if(!isInner) centerToArcLengthSubtract = arc.width * 10 - 20
  let coords = getLabelCoordsByValue(mark.value, gauge, centerToArcLengthSubtract);
  let markValueStyle = mark.valueConfig?.style || labels.markLabel.valueConfig.style;
  let text = '';
  if(labels.markLabel.valueConfig.formatTextValue){
    text = labels.markLabel.valueConfig.formatTextValue(utils.floatingNumber(mark.value));
  } else if(gauge.props.minValue === 0 && gauge.props.maxValue === 100){
    text = utils.floatingNumber(mark.value).toString();
    text += "%";
  } else {
    text = utils.floatingNumber(mark.value).toString();
  }
  //This is a position correction for the text being too far away from the marker
  if(gauge.props.labels.markLabel.type == "inner"){
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
  var centerToArcLength = gauge.innerRadius.current * 0.93 - centerToArcLengthSubtract;
  if(gauge.props.labels.markLabel.type == "outer") centerToArcLength = gauge.outerRadius.current - centerToArcLengthSubtract + 2;
  let percent = utils.calculatePercentage(gauge.props.minValue, gauge.props.maxValue, value);
  const startAngle = utils.degToRad(0);
  const endAngle = utils.degToRad(180);
  const angle = startAngle + (percent) * (endAngle - startAngle);
  let marksRadius = 15 * (gauge.width.current / 500);
  let coord = [0, -marksRadius / 2];
  let labelCoordMinusCenter = [
    coord[0] - centerToArcLength * Math.cos(angle),
    coord[1] - centerToArcLength * Math.sin(angle),
  ];
  let centerCoords = [gauge.outerRadius.current, gauge.outerRadius.current];
  let x = (centerCoords[0] + labelCoordMinusCenter[0]);
  let y = (centerCoords[1] + labelCoordMinusCenter[1]);
  //This corrects labels in the cener being too close from the arc
  let isValueBetweenCenter = percent > CONSTANTS.rangeBetweenCenteredMarkValueLabel[0] && 
                                percent < CONSTANTS.rangeBetweenCenteredMarkValueLabel[1];
  if (isValueBetweenCenter){
    let isInner = gauge.props.labels.markLabel.type == "inner";
    y+= isInner ? 8 : -1;
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
  Object.entries(style).forEach(([key, value]) => div.style(utils.camelCaseToKebabCase(key), value))
  //Apply custom styles
  if(style != undefined) Object.entries(style).forEach(([key, value]) => div.style(utils.camelCaseToKebabCase(key), value))
}

//Adds text undeneath the graft to display which percentage is the current one
export const addValueText = (gauge: Gauge) => {
  const { labels, value, minValue, maxValue } = gauge.props;
  var textPadding = 20;
  let text = '';
  if(labels.valueLabel.formatTextValue){
    text = labels.valueLabel.formatTextValue(utils.floatingNumber(value));
  } else if(gauge.props.minValue === 0 && gauge.props.maxValue === 100){
    text = utils.floatingNumber(value).toString();
    text += "%";
  } else {
    text = utils.floatingNumber(value).toString();
  }
  const maxLengthBeforeComputation = 3;
  const textLength = text?.length || 0;
  let fontRatio = textLength > maxLengthBeforeComputation ? maxLengthBeforeComputation / textLength * 1.5 : 1; // Compute the font size ratio
  fontRatio = gauge.width.current * 0.003 * fontRatio;
  let valueFontSize = labels.valueLabel.style.fontSize as string;
  // let valueFontColor = labels.valueLabel.style.color;
  let valueTextStyle = {... labels.valueLabel.style};
  valueTextStyle.fontSize = parseInt(valueFontSize, 10) * fontRatio + "px";
  let x = gauge.outerRadius.current;
  let y = gauge.outerRadius.current / 1.5 + textPadding;
  valueTextStyle.textAnchor = "middle";
  addText(text, x, y, gauge, valueTextStyle, CONSTANTS.valueLabelClassname);
};

export const clearValueLabel = (gauge: Gauge) => gauge.g.current.selectAll(`.${CONSTANTS.valueLabelClassname}`).remove();
export const clearMarks = (gauge: Gauge) => gauge.g.current.selectAll(`.${CONSTANTS.markerClassname} .${CONSTANTS.markValueClassname}`).remove();

export const calculateAnchorAndAngleByValue = (value: number, gauge: Gauge) => {
  const { minValue, maxValue } = gauge.props;
  let valuePercentage = utils.calculatePercentage(minValue, maxValue, value)
  let angle = (valuePercentage * 100) * 180 / 100;
  let centerToleranceInPercentage = 0.05;
  let halfInPercentage = utils.calculatePercentage(minValue, maxValue, (maxValue / 2));
  let halfPercentage = halfInPercentage;
  let isValueLessThanHalf = valuePercentage < halfPercentage;
  //Values between 40% and 60% are aligned in the middle
  let isValueBetweenTolerance = valuePercentage > CONSTANTS.rangeBetweenCenteredMarkValueLabel[0] && 
                                valuePercentage < CONSTANTS.rangeBetweenCenteredMarkValueLabel[1];
  let markAnchor = '';
  let isInner = gauge.props.labels.markLabel.type == "inner";
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