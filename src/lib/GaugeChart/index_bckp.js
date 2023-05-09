import React, { useCallback, useEffect, useRef, useLayoutEffect } from "react";
import PropTypes from "prop-types";
import {
  arc,
  pie,
  select,
  easeElastic,
  scaleLinear,
  interpolateHsl,
  interpolateNumber,
} from "d3";
import useDeepCompareEffect from "./hooks/customHooks";
import CONSTANTS from './constants';
import * as arcHooks from "./hooks/arc";
import * as chartHooks from "./hooks/chart";
import * as labelsHooks from "./hooks/labels";
import * as needleHooks from "./hooks/needle";
/*
GaugeComponent creates a gauge chart using D3
The chart is responsive and will have the same width as the "container"
The radius of the gauge depends on the width and height of the container
It will use whichever is smallest of width or height
The svg element surrounding the gauge will always be square
"container" is the div where the chart should be placed
*/

const GaugeComponent = (props) => {
  const svg = useRef({});
  const g = useRef({});
  const width = useRef({});
  const height = useRef({});
  const doughnut = useRef({});
  const needle = useRef({});
  const outerRadius = useRef({});
  const innerRadius = useRef({});
  const margin = useRef({}); // = {top: 20, right: 50, bottom: 50, left: 50},
  const container = useRef({});
  const nbArcsToDisplay = useRef(0);
  const colorArray = useRef([]);
  const arcChart = useRef(arc());
  const arcData = useRef([]);
  const pieChart = useRef(pie());
  const valueInPercent = useRef(0);
  const prevProps = useRef({});
  let selectedRef = useRef({});

  const gauge = {
    props,
    prevProps,
    svg,
    g,
    width,
    height,
    doughnut,
    needle,
    outerRadius,
    innerRadius,
    margin,
    container,
    nbArcsToDisplay,
    colorArray,
    arcChart,
    arcData,
    pieChart,
    selectedRef,
    valueInPercent
  };
  const initChartCallback = useCallback(chartHooks.initChart, [props]);


  useLayoutEffect(() => {
    arcHooks.setArcData(gauge);
    container.current = select(selectedRef);
    //Initialize chart
    initChartCallback(false, gauge);
  }, [props, initChartCallback]);

  useDeepCompareEffect(() => {
    let arcsPropsChanged = props.nrOfLevels || (JSON.stringify(prevProps.current.arc) === JSON.stringify(props.arc));
    if (arcsPropsChanged) arcHooks.setArcData(gauge)
    // Always redraw the chart, but potentially do not animate it
    const resize = !CONSTANTS.animateNeedleProps.some((key) => prevProps.current[key] !== props[key]);
    if(gauge.prevProps.current.value != props.value) initChartCallback(true, gauge, resize);
    gauge.prevProps.current = props;
  }, [
    props.nrOfLevels,
    props.arcsLength,
    props.colors,
    props.percent,
    props.value,
    props.minValue,
    props.maxValue,
    props.arcs,
    props.needleColor,
    props.needleBaseColor,
  ]);

  useEffect(() => {
    const handleResize = () => {
      var resize = true;
      chartHooks.renderChart(resize, gauge);
    };
    //Set up resize event listener to re-render the chart everytime the window is resized
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [props]);

  const { id, style, className } = props;
  return (
    <div
      id={id}
      className={className}
      style={style}
      ref={(svg) => (selectedRef = svg)}
    />
  );
};

export default GaugeComponent;

GaugeComponent.defaultProps = {
  style: CONSTANTS.defaultStyle,
  marginInPercent: 0.05,
  value: 50,
  minValue: 0,
  maxValue: 100,
  needle: {
    color: '#464A4F',
    baseColor: '#464A4F',
    length: CONSTANTS.defaultNeedleLength,
    animate: true,
    elastic: false,
    animationDuration: 3000,
    animationDelay: 500,
  },
  arc: {
    padding: 0.02, //The padding between subArcs, in rad
    width: 0.15, //The width of the arc given in percent of the radius
    nbSubArcs: null, //The number of subArcs, this overrides "subArcs" limits
    colorArray: null, //The colors of the arcs, this overrides "subArcs" colors
    subArcs: [
      { limit: 33, color: '#EA4228', needleColorWhenWithinLimit: '#AA4128' },
      { limit: 66, color: '#F5CD19' },
      { color: '#5BE12C' }
    ]
  },
  labels: {
    value: {
      formatTextValue: null,
      fontSize: 40,
      color: '#464A4F'
    },
    mark: {
      hideMinMax: false,
      marks: [
        // {value: 0},
        // {
        //   value: 50,
        //   valueText: {fontSize: 5},
        //   marker: {charSize: 10}
        // }, 
        // {value: 100}
      ],
      defaultValueText: {
        formatTextValue: null,
        fontSize: 10,
        fontColor: '#464A4F',
      },
      defaultMarker: {
        char: '–',
        charSize: 15,
        charColor: '#464A4F',
        hide: false
      }
    }
  }
};

GaugeComponent.propTypes = {
  id: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.object,
  marginInPercent: PropTypes.number,
  value: PropTypes.number,
  minValue: PropTypes.number,
  maxValue: PropTypes.number,
  arc: PropTypes.object,
  marks: PropTypes.object,
  needleLength: PropTypes.number,
};
