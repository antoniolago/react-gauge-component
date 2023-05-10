import * as utils from './utils';
import CONSTANTS from '../constants';
import { Gauge } from '../types/Gauge';
import { Mark } from '../types/Mark';
export const setupLabels = (gauge: Gauge) => {
  const { minValue, maxValue, labels, arc } = gauge.props;
  //Add value label
  if (!labels.valueLabel.hide) addValueText(gauge)
  if (CONSTANTS.debugMarkersRadius) {
    for (let index = 0; index < maxValue; index++) {
      let indexMark = mapMark(index, gauge);
      addMark(indexMark, gauge);
    }
  } else if (!labels.markLabel?.hideMinMax) {
    //Add min value mark
    let minValueMark = mapMark(minValue, gauge);
    addMark(minValueMark, gauge);
    // //Add max value mark
    let maxValueMark = mapMark(maxValue, gauge);
    addMark(maxValueMark, gauge);
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
  let charSize = mark.markerConfig?.charSize || labels.markLabel.markerConfig.charSize;
  let char = mark.markerConfig?.char || labels.markLabel.markerConfig.char;
  let charColor = mark.markerConfig?.charColor || labels.markLabel.markerConfig.charColor;
  addText(char, coords.x, coords.y, gauge, charColor, markAnchor, charSize, angle);
}

export const addMarkValue = (mark: Mark, gauge: Gauge) => {
  const { labels, arc, value } = gauge.props;
  let { markAnchor, angle } = calculateAnchorAndAngleByValue(mark.value, gauge);
  let centerToArcLengthSubtract = 27 - arc.width * 10;
  let isInner = gauge.props.labels.markLabel.type == "inner";
  if(!isInner) centerToArcLengthSubtract = arc.width * 10 - 20
  let coords = getLabelCoordsByValue(mark.value, gauge, centerToArcLengthSubtract);
  let fontSize = mark.valueConfig?.fontSize || labels.markLabel.valueConfig.fontSize;
  let fontColor = mark.valueConfig?.fontColor || labels.markLabel.valueConfig.fontColor;

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
  addText(text, coords.x, coords.y, gauge, fontColor, markAnchor, fontSize);
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
export const addText = (text: string, x: number, y: number, gauge: Gauge, color = "#fff", align = "middle", fontSize = 30, rotate = 0) => {
  gauge.g.current
    .append("g")
    .attr("class", "text-group")
    .attr("transform", `translate(${x}, ${y})`)
    .append("text")
    .text(text)
    .style("font-size", `${fontSize}px`)
    .style("fill", color)
    .style("text-anchor", align)
    .attr("transform", `rotate(${rotate})`);
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
  let valueFontSize = labels.valueLabel.fontSize;
  let valueFontColor = labels.valueLabel.fontColor;
  valueFontSize = valueFontSize * fontRatio;
  let x = gauge.outerRadius.current;
  let y = gauge.outerRadius.current / 1.5 + textPadding;
  addText(text, x, y, gauge, valueFontColor, "middle", valueFontSize);
};

export const clearLabels = (gauge: Gauge) => gauge.g.current.selectAll(".text-group").remove();

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