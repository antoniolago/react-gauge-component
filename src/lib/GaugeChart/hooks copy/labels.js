import * as utils from './utils.js';
import CONSTANTS from '../constants.js';
export const setupLabels = (gauge) => {
  const { minValue, maxValue, labels, hideText, arcs } = gauge.props;
  //Add value label
  if (!hideText) addValueText(gauge)
  if (CONSTANTS.debugMarkersRadius) {
    console.log(maxValue)
    for (let index = 0; index < maxValue; index++) {
      addMark(index, gauge);
    }
  } else if (!labels.marks?.hideMinMax) {
    //Add min value mark
    addMark(minValue, gauge);
    // //Add max value mark
    addMark(maxValue, gauge);
  }
  if(labels.marks?.values?.length > 0){
    labels.marks?.values?.forEach((mark) => {
      addMark(mark, gauge);
    });
  }
  addArcMarks(gauge);
}

export const addArcMarks = (gauge) => {
  const { arc } = gauge.props;
  arc.subArcs?.map((arc) => {
    if(!arc.hideMark) return arc.limit;
  }).forEach((markValue) => {
    if(markValue) addMark(markValue, gauge);
  });
}
export const addMark = (value, gauge) => {
  const { minValue, maxValue, labels, arc } = gauge.props;
  let coords = getLabelCoordsByValue(value, gauge);
  let isValueLessThanHalf = value < maxValue / 2;
  let alignValue = 0;
  let markAnchor = '';
  let angle = (utils.calculatePercentage(minValue, maxValue, value)*100) * 180 / 100;
  if (isValueLessThanHalf) {
    alignValue = 45;
    markAnchor = "start";
  } else if (value === maxValue / 2) {
    alignValue = 0;
  } else {
    alignValue = -45;
    angle = angle - 180;
    markAnchor = "end";
  }
  let charSize = labels.mark.marker.charSize || labels.mark.defaultMarker.;
  addText('–', coords.x, coords.y, gauge, undefined, markAnchor, charSize, angle);
  if (!CONSTANTS.debugMarkersRadius) {
    let centerToArcLengthOverride = 30 - arc.width * 10;
    coords = getLabelCoordsByValue(value, gauge, centerToArcLengthOverride);
    let fontSize = labels.mark.valueText;
    addText(labels.mark?.formatTextValue ? labels.mark?.formatTextValue(value) : value, coords.x, coords.y, gauge, undefined,"middle", fontSize);
  }
}
export const getLabelCoordsByValue = (value, gauge, centerToArcLengthSubtract = 0) => {
  var centerToArcLength = gauge.innerRadius.current * 0.91 - centerToArcLengthSubtract;
  let percent = utils.calculatePercentage(gauge.props.minValue, gauge.props.maxValue, value);
  let theta = utils.percentToRad(percent);
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
  return { x, y }
}
export const addText = (text, x, y, gauge, color="#fff", align = "middle", fontSize = 30, rotate = 0) => {
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
export const addValueText = (gauge) => {
  const { labels, value, minValue, maxValue } = gauge.props;
  const { formatTextValue, fontSize } = labels;
  var textPadding = 20;
  var text = formatTextValue ? formatTextValue(utils.floatingNumber(value)) : utils.floatingNumber(value);
  var isPercentage = !formatTextValue ? minValue === 0 && maxValue === 100 : false;
  if (isPercentage) text += "%";
  const maxLengthBeforeComputation = 6;
  const textLength = text?.length || 0;
  const fontRatio = textLength > maxLengthBeforeComputation ? maxLengthBeforeComputation / textLength : 1; // Compute the font size ratio
  let valueFontSize = fontSize ? fontSize : gauge.width.current / 11; // Set the default font size
  valueFontSize = parseFloat(valueFontSize) * fontRatio;
  let x = gauge.outerRadius.current;
  let y = gauge.outerRadius.current / 1.5 + textPadding;
  addText(text, x, y, gauge, undefined, "middle", valueFontSize);
};

export const clearLabels = (gauge) => gauge.g.current.selectAll(".text-group").remove();