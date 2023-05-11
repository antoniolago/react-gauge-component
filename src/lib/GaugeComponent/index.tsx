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
  BaseType
} from "d3";
import { defaultGaugeProps, GaugeComponentProps } from "./types/GaugeComponentProps";
import { Gauge } from "./types/Gauge";
import useDeepCompareEffect from "./hooks/customHooks";
import CONSTANTS from './constants';
import * as arcHooks from "./hooks/arc";
import * as chartHooks from "./hooks/chart";
import * as labelsHooks from "./hooks/labels";
import * as needleHooks from "./hooks/needle";
import { mergeObjects } from "./hooks/utils";
/*
GaugeComponent creates a gauge chart using D3
The chart is responsive and will have the same width as the "container"
The radius of the gauge depends on the width and height of the container
It will use whichever is smallest of width or height
The svg element surrounding the gauge will always be square
"container" is the div where the chart should be placed
*/
const GaugeComponent = (props: Partial<GaugeComponentProps>) => {
  const svg = useRef<any>({});
  const g = useRef<any>({});
  const width = useRef<any>({});
  const height = useRef<any>({});
  const fixedHeight = useRef<any>(0);
  const doughnut = useRef<any>({});
  const needle = useRef<any>({});
  const outerRadius = useRef<any>({});
  const innerRadius = useRef<any>({});
  const margin = useRef<any>({}); // = {top: 20, right: 50, bottom: 50, left: 50},
  const container = useRef<any>({});
  const nbArcsToDisplay = useRef<any>(0);
  const arcChart = useRef<any>(arc());
  const arcData = useRef<any>([]);
  const pieChart = useRef<any>(pie());
  const mergedProps = useRef<GaugeComponentProps>(props as GaugeComponentProps);
  const prevProps = useRef<any>({});
  let selectedRef = useRef<any>(null);

  var gauge: Gauge = {
    props: mergedProps.current,
    prevProps,
    svg,
    g,
    width,
    fixedHeight,
    height,
    doughnut,
    needle,
    outerRadius,
    innerRadius,
    margin,
    container,
    nbArcsToDisplay,
    arcChart,
    arcData,
    pieChart,
  };
  const initChartCallback = useCallback(chartHooks.initChart, [mergedProps.current]);
  const updateMergedProps = () => gauge.props = mergedProps.current = mergeObjects(defaultGaugeProps, props);
  useLayoutEffect(() => {
    //Merged properties will get the default props and overwrite by the user's defined props
    //To keep the original default props in the object
    updateMergedProps();
    arcHooks.setArcData(gauge);
    container.current = select(selectedRef.current);
    //Initialize chart
    initChartCallback(false, gauge);
  }, [props, initChartCallback]);
  useDeepCompareEffect(() => {
    let arcsPropsChanged = (JSON.stringify(prevProps.current.arc) === JSON.stringify(props.arc));
    if (arcsPropsChanged) arcHooks.setArcData(gauge)
    const resize = (JSON.stringify(prevProps.current.needle) !== JSON.stringify(props.needle));
    initChartCallback(true, gauge, resize);
    gauge.prevProps.current = mergeObjects(defaultGaugeProps, props);
  }, [
    props.needle,
    props.arc,
    props.value,
    props.minValue,
    props.maxValue,
  ]);

  useEffect(() => {
    const handleResize = () => chartHooks.renderChart(true, gauge);
    //Set up resize event listener to re-render the chart everytime the window is resized
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [props]);

  const { id, style, className } = props;
  return (
    <div
      id={id}
      className={className}
      style={style}
      ref={(svg) => (selectedRef.current = svg)}
    />
  );
};

GaugeComponent.defaultProps = defaultGaugeProps;
// GaugeComponent.propTypes = {...PropTypes.shape(GaugeComponentProps)};

export default GaugeComponent;