import React, { useEffect, useRef, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import { pie, select } from "d3";
import { defaultGaugeProps, GaugeComponentProps, GaugeType, getGaugeMarginByType } from "./types/GaugeComponentProps";
import { Gauge, CustomContentConfig } from "./types/Gauge";
import * as chartHooks from "./hooks/chart";
import * as arcHooks from "./hooks/arc";
import { isEmptyObject, mergeObjects } from "./hooks/utils";
import { Dimensions, defaultDimensions } from "./types/Dimensions";
import { PointerRef, defaultPointerRef } from "./types/Pointer";
import { Arc, getArcWidthByType } from "./types/Arc";
import CONSTANTS from "./constants";

/**
 * GaugeComponent - A responsive gauge chart component built with D3
 * 
 * Features:
 * - Responsive design that adapts to container size
 * - Multiple gauge types: semicircle, radial, grafana
 * - Customizable arcs, pointers, labels, and tooltips
 * - Smooth animations with configurable timing
 * - ResizeObserver for automatic resize handling
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
  const dimensions = useRef<Dimensions>({ 
    ...defaultDimensions,
    margin: { ...defaultDimensions.margin },
    angles: { ...defaultDimensions.angles }
  });
  const mergedProps = useRef<GaugeComponentProps>(props as GaugeComponentProps);
  const prevProps = useRef<any>({});
  const prevGSize = useRef<any>(null);
  const maxGHeight = useRef<any>(null);
  const svgRef = useRef<any>(null);
  const customContent = useRef<CustomContentConfig | {}>({});
  
  // State to trigger re-render when custom content needs to be rendered
  const [customContentNode, setCustomContentNode] = useState<HTMLElement | null>(null);

  // Use a ref for gauge so the ResizeObserver always has access to current props
  const gaugeRef = useRef<Gauge | null>(null);
  
  const gauge: Gauge = {
    props: mergedProps.current,
    originalProps: props,
    prevProps,
    resizeObserver: useRef<any>(),
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
    tooltip,
    prevGSize,
    maxGHeight,
    customContent,
  };
  
  // Keep gaugeRef updated with current gauge (including current props)
  gaugeRef.current = gauge;

  // Merge default props with user-provided props
  const updateMergedProps = () => {
    const defaultValues = { ...defaultGaugeProps };
    gauge.props = mergedProps.current = mergeObjects(defaultValues, props);
    
    // Apply type-specific defaults
    if (gauge.props.arc?.width === defaultGaugeProps.arc?.width) {
      const mergedArc = mergedProps.current.arc as Arc;
      mergedArc.width = getArcWidthByType(gauge.props.type as GaugeType);
    }
    if (gauge.props.marginInPercent === defaultGaugeProps.marginInPercent) {
      mergedProps.current.marginInPercent = getGaugeMarginByType(gauge.props.type as GaugeType);
    }
    
    arcHooks.validateArcs(gauge);
  };

  // Determine if chart should be re-initialized based on prop changes
  const shouldInitChart = () => {
    const arcsPropsChanged = JSON.stringify(prevProps.current.arc) !== JSON.stringify(mergedProps.current.arc);
    const pointerPropsChanged = JSON.stringify(prevProps.current.pointer) !== JSON.stringify(mergedProps.current.pointer);
    const labelsPropsChanged = JSON.stringify(prevProps.current.labels) !== JSON.stringify(mergedProps.current.labels);
    const typeChanged = prevProps.current.type !== mergedProps.current.type;
    const valueChanged = JSON.stringify(prevProps.current.value) !== JSON.stringify(mergedProps.current.value);
    const minValueChanged = JSON.stringify(prevProps.current.minValue) !== JSON.stringify(mergedProps.current.minValue);
    const maxValueChanged = JSON.stringify(prevProps.current.maxValue) !== JSON.stringify(mergedProps.current.maxValue);
    // Check if onValueChange callback changed (for drag interaction toggle)
    const interactionChanged = (prevProps.current.onValueChange !== undefined) !== (mergedProps.current.onValueChange !== undefined);
    // Check if custom angles changed
    const anglesChanged = prevProps.current.startAngle !== mergedProps.current.startAngle || 
                          prevProps.current.endAngle !== mergedProps.current.endAngle;
    
    return arcsPropsChanged || pointerPropsChanged || labelsPropsChanged || typeChanged || valueChanged || minValueChanged || maxValueChanged || interactionChanged || anglesChanged;
  };

  const isHeightProvidedByUser = () => mergedProps.current.style?.height !== undefined;
  const isHeightPresentInParentNode = () => parentNode.current?.clientHeight !== 0;

  // Initialize and update chart on prop changes
  useLayoutEffect(() => {
    updateMergedProps();
    isFirstRun.current = isEmptyObject(container.current);
    
    if (CONSTANTS.debugLogs) {
      console.log("isHeightProvidedByUser:", isHeightProvidedByUser());
      console.log("isHeightPresentInParentNode:", isHeightPresentInParentNode());
    }
    
    if (isFirstRun.current) {
      container.current = select(svgRef.current);
    }
    
    if (shouldInitChart()) {
      chartHooks.initChart(gauge, isFirstRun.current);
    }
    
    gauge.prevProps.current = mergedProps.current;
    
    // Check if custom content needs to be rendered via React portal
    const customContentConfig = customContent.current as any;
    if (customContentConfig?.domNode) {
      setCustomContentNode(customContentConfig.domNode);
    } else {
      setCustomContentNode(null);
    }
  }, [props]);

  // Set up ResizeObserver for responsive resizing
  useEffect(() => {
    const element = svgRef.current;
    if (!element) return;

    let resizeTimeout: ReturnType<typeof setTimeout>;
    
    const handleResize = (entries: ResizeObserverEntry[]) => {
      // Cancel any pending resize to debounce rapid changes
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
      
      // Log resize event for debugging
      if (CONSTANTS.debugLogs && entries[0]) {
        const entry = entries[0];
        console.log('[ResizeObserver] Element resized:', {
          width: entry.contentRect.width,
          height: entry.contentRect.height
        });
      }
      
      // Use a small delay to ensure layout is stable
      resizeTimeout = setTimeout(() => {
        requestAnimationFrame(() => {
          // Use gaugeRef.current to always get the latest gauge with current props
          if (gaugeRef.current) {
            chartHooks.renderChart(gaugeRef.current, true);
          }
        });
      }, 16); // ~1 frame
    };

    const observer = new ResizeObserver(handleResize);
    
    // Observe the gauge container itself, not its parent
    // This ensures we get accurate dimensions when we resize
    observer.observe(element);

    return () => {
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
      observer.disconnect();
    };
  }, []);

  const { id, style, className } = props;
  
  // Container must properly fill its parent and not overflow
  const containerStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    maxWidth: '100%',
    maxHeight: '100%',
    overflow: 'hidden',
    ...style,
  };

  // Render custom content via React portal if configured
  const renderCustomContent = () => {
    if (!customContentNode) return null;
    
    const config = customContent.current as CustomContentConfig;
    if (!config?.renderContent) return null;
    
    return createPortal(
      config.renderContent(config.value, config.arcColor),
      customContentNode
    );
  };

  return (
    <>
      <div
        id={id}
        className={`gauge${className ? ' ' + className : ''}`}
        style={containerStyle}
        ref={(ref) => (svgRef.current = ref)}
      />
      {renderCustomContent()}
    </>
  );
};

export default GaugeComponent;
