import React, { useEffect, useRef, useLayoutEffect } from "react";
import { arc, pie, select } from "d3";
import { defaultGaugeProps, GaugeComponentProps, GaugeType } from "./types/GaugeComponentProps";
import { Gauge } from "./types/Gauge";
import * as chartHooks from "./hooks/chart";
import { isEmptyObject, mergeObjects } from "./hooks/utils";
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
  const tooltip = useRef<any>({});
  const g = useRef<any>({});
  const width = useRef<any>({});
  const height = useRef<any>({});
  const fixedHeight = useRef<any>(0);
  const doughnut = useRef<any>({});
  const pointer = useRef<any>({});
  const outerRadius = useRef<any>({});
  const innerRadius = useRef<any>({});
  const margin = useRef<any>({}); // = {top: 20, right: 50, bottom: 50, left: 50},
  const container = useRef<any>({});
  const nbArcsToDisplay = useRef<any>(0);
  const arcChart = useRef<any>(arc());
  const arcData = useRef<any>([]);
  const pieChart = useRef<any>(pie());
  const mergedProps = useRef<GaugeComponentProps>({ ...props } as GaugeComponentProps);
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
    pointer,
    outerRadius,
    innerRadius,
    margin,
    container,
    nbArcsToDisplay,
    arcChart,
    arcData,
    pieChart,
    tooltip
  };
  //Merged properties will get the default props and overwrite by the user's defined props
  //To keep the original default props in the object
  const updateMergedProps = () => gauge.props = mergedProps.current = mergeObjects(defaultGaugeProps, props);

  const shouldInitChart = () => {
    let arcsPropsChanged = (JSON.stringify(prevProps.current.arc) !== JSON.stringify(mergedProps.current.arc));
    let pointerPropsChanged = (JSON.stringify(prevProps.current.pointer) !== JSON.stringify(mergedProps.current.pointer));
    let valueChanged = (JSON.stringify(prevProps.current.value) !== JSON.stringify(mergedProps.current.value));
    return arcsPropsChanged || pointerPropsChanged || valueChanged;
  }
  useLayoutEffect(() => {
    updateMergedProps();
    if (isEmptyObject(container.current)) container.current = select(selectedRef.current);
    if (shouldInitChart()) chartHooks.initChart(gauge);
    gauge.prevProps.current = mergeObjects(defaultGaugeProps, props);
  }, [props]);

  useEffect(() => {
    const handleResize = () => chartHooks.renderChart(gauge, true);
    //Set up resize event listener to re-render the chart everytime the window is resized
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [props]);

  const { id, style, className, type } = props;
  return (
    <div
      id={id}
      className={`${className} ${type == GaugeType.Semicircle ? "semicircle-gauge" : "radial-gauge"}}`}
      style={style}
      ref={(svg) => (selectedRef.current = svg)}
    />
  );
};

GaugeComponent.defaultProps = defaultGaugeProps;
// GaugeComponent.propTypes = {...PropTypes.shape(GaugeComponentProps)};

export default GaugeComponent;