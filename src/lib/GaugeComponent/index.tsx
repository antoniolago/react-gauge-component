import React, { useEffect, useRef, useLayoutEffect, Suspense } from "react";
import { pie, select } from "d3";
import { defaultGaugeProps, GaugeComponentProps, GaugeType, getGaugeMarginByType } from "./types/GaugeComponentProps";
import { Gauge } from "./types/Gauge";
import * as chartHooks from "./hooks/chart";
import * as arcHooks from "./hooks/arc";
import { isEmptyObject, mergeObjects } from "./hooks/utils";
import { Dimensions, defaultDimensions } from "./types/Dimensions";
import { PointerRef, defaultPointerRef } from "./types/Pointer";
import { Arc, getArcWidthByType } from "./types/Arc";
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
  const doughnut = useRef<any>({});
  const isFirstRun = useRef<boolean>(true);
  const currentProgress = useRef<number>(0);
  const pointer = useRef<PointerRef>({ ...defaultPointerRef });
  const container = useRef<any>({});
  const arcData = useRef<any>([]);
  const parentNode = useRef<Element>();
  const pieChart = useRef<any>(pie());
  const dimensions = useRef<Dimensions>({ ...defaultDimensions });
  const mergedProps = useRef<GaugeComponentProps>(props as GaugeComponentProps);
  const prevProps = useRef<any>({});
  let svgRef = useRef<any>(null);

  var gauge: Gauge = {
    props: mergedProps.current,
    prevProps,
    svg,
    g,
    dimensions,
    doughnut,
    isFirstRun,
    currentProgress,
    pointer,
    container,
    arcData,
    pieChart,
    tooltip
  };
  //Merged properties will get the default props and overwrite by the user's defined props
  //To keep the original default props in the object
  const updateMergedProps = () => {
    let defaultValues = { ...defaultGaugeProps };
    gauge.props = mergedProps.current = mergeObjects(defaultValues, props);
    if (gauge.props.arc?.width == defaultGaugeProps.arc?.width) {
      let mergedArc = mergedProps.current.arc as Arc;
      mergedArc.width = getArcWidthByType(gauge.props.type as GaugeType);
    }
    if (gauge.props.marginInPercent == defaultGaugeProps.marginInPercent) mergedProps.current.marginInPercent = getGaugeMarginByType(gauge.props.type as GaugeType);
    arcHooks.validateArcs(gauge);
  }

  const shouldInitChart = () => {
    let arcsPropsChanged = (JSON.stringify(prevProps.current.arc) !== JSON.stringify(mergedProps.current.arc));
    let pointerPropsChanged = (JSON.stringify(prevProps.current.pointer) !== JSON.stringify(mergedProps.current.pointer));
    let valueChanged = (JSON.stringify(prevProps.current.value) !== JSON.stringify(mergedProps.current.value));
    let minValueChanged = (JSON.stringify(prevProps.current.minValue) !== JSON.stringify(mergedProps.current.minValue));
    let maxValueChanged = (JSON.stringify(prevProps.current.maxValue) !== JSON.stringify(mergedProps.current.maxValue));
    return arcsPropsChanged || pointerPropsChanged || valueChanged || minValueChanged || maxValueChanged;
  }
  useLayoutEffect(() => {
    updateMergedProps();
    isFirstRun.current = isEmptyObject(container.current)
    if (isFirstRun.current) container.current = select(svgRef.current);
    if (shouldInitChart()) chartHooks.initChart(gauge);
    gauge.prevProps.current = mergedProps.current;
  }, [props]);

  useEffect(() => {
    const observer = new MutationObserver(function () {
      setTimeout(() => window.dispatchEvent(new Event('resize')), 10);
      if (!svgRef.current?.offsetParent) return;

      chartHooks.renderChart(gauge, true);
      observer.disconnect()
    });
    observer.observe(svgRef.current?.parentNode, { attributes: true, subtree: false });
    return () => observer.disconnect();
  }, [svgRef.current?.parentNode?.offsetWidth, svgRef.current?.parentNode?.offsetHeight]);

  useEffect(() => {
    const handleResize = () => chartHooks.renderChart(gauge, true);
    //Set up resize event listener to re-render the chart everytime the window is resized
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [props]);

  // useEffect(() => {
  //   console.log(svgRef.current?.offsetWidth)
  //   // workaround to trigger recomputing of gauge size on first load (e.g. F5)
  //   setTimeout(() => window.dispatchEvent(new Event('resize')), 10);
  // }, [svgRef.current?.parentNode]);

  useEffect(() => {
    const element = svgRef.current;
    if (!element) return;

    const handleResize = () => {
      const parentNode = element.parentNode;
      if (parentNode) {
        chartHooks.renderChart(gauge, true);
        // console.log("Parent node width:", width);
      }
    };

    // Create a ResizeObserver to watch the parent node
    const observer = new ResizeObserver(handleResize);

    // Observe the parent node
    if (element.parentNode) {
      observer.observe(element.parentNode);
    }

    // Cleanup observer when component unmounts
    return () => {
      if (element.parentNode) {
        observer.unobserve(element.parentNode);
      }
    };
  }, []);

  const { id, style, className, type } = props;
  // add     height: -webkit-fill-available;
  //  width: -webkit-fill-available;
  // to the style prop to make the gauge responsive
  var styled = {
    ...style,
    height: "-webkit-fill-available",
    width: "-webkit-fill-available"
  };
  return (
    <div
      id={id}
      className={`${gauge.props.type}-gauge${className ? ' ' + className : ''}`}
      style={styled}
      ref={(svg) => (svgRef.current = svg)}
    />
  );
};
export { GaugeComponent };
export default GaugeComponent;