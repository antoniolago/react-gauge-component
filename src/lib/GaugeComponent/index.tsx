import React, { useEffect, useRef, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import { pie, select } from "d3";
import { defaultGaugeProps, GaugeComponentProps, GaugeType, getGaugeMarginByType } from "./types/GaugeComponentProps";
import { Gauge, CustomContentConfig } from "./types/Gauge";
import * as chartHooks from "./hooks/chart";
import * as arcHooks from "./hooks/arc";
import { isEmptyObject, mergeObjects, shallowEqual } from "./hooks/utils";
import { Dimensions, defaultDimensions } from "./types/Dimensions";
import { PointerRef, defaultPointerRef, MultiPointerRef } from "./types/Pointer";
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
// CSS keyframes for fade-in animation to prevent initial render flash
const fadeInKeyframes = `
@keyframes gaugeComponentFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
`;

// Inject keyframes once
if (typeof document !== 'undefined' && !document.getElementById('gauge-fade-in-style')) {
  const style = document.createElement('style');
  style.id = 'gauge-fade-in-style';
  style.textContent = fadeInKeyframes;
  document.head.appendChild(style);
}

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
  const initialAnimationTriggered = useRef<boolean>(false);
  const animationInProgress = useRef<boolean>(false);
  const pendingResize = useRef<boolean>(false);
  const multiPointers = useRef<MultiPointerRef[]>([]);
  const multiPointerAnimationTriggered = useRef<boolean[]>([]);
  const hasBeenInitialized = useRef<boolean>(false); // Track if component has ever been initialized
  const lastContainerSize = useRef<{ width: number; height: number } | null>(null); // Track container size to prevent resize loops
  const measuredBoundsRef = useRef<{ width: number; height: number; x: number; y: number } | null>(null); // Persist measured bounds across renders
  const renderPassRef = useRef<number>(1); // Persist render pass state
  
  // State to trigger re-render when custom content needs to be rendered
  const [customContentItems, setCustomContentItems] = useState<any[]>([]);

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
    initialAnimationTriggered,
    animationInProgress,
    pendingResize,
    multiPointers,
    multiPointerAnimationTriggered,
    // Persisted refs for two-pass rendering stability
    measuredBounds: measuredBoundsRef,
    renderPass: renderPassRef,
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
  // IMPORTANT: Use JSON.stringify for deep comparison of objects to detect ACTUAL changes
  // shallowEqual gives false positives when parent creates new object references each render
  const shouldInitChart = () => {
    // Use JSON.stringify for deep comparison of complex objects
    const arcsPropsChanged = JSON.stringify(prevProps.current.arc) !== JSON.stringify(mergedProps.current.arc);
    const pointerPropsChanged = JSON.stringify(prevProps.current.pointer) !== JSON.stringify(mergedProps.current.pointer);
    const pointersArrayChanged = JSON.stringify(prevProps.current.pointers) !== JSON.stringify(mergedProps.current.pointers);
    const labelsPropsChanged = JSON.stringify(prevProps.current.labels) !== JSON.stringify(mergedProps.current.labels);
    
    // Primitive value comparisons
    const typeChanged = prevProps.current.type !== mergedProps.current.type;
    const valueChanged = prevProps.current.value !== mergedProps.current.value;
    const minValueChanged = prevProps.current.minValue !== mergedProps.current.minValue;
    const maxValueChanged = prevProps.current.maxValue !== mergedProps.current.maxValue;
    const interactionChanged = (prevProps.current.onValueChange !== undefined) !== (mergedProps.current.onValueChange !== undefined);
    const anglesChanged = prevProps.current.startAngle !== mergedProps.current.startAngle || 
                          prevProps.current.endAngle !== mergedProps.current.endAngle;
    
    return arcsPropsChanged || pointerPropsChanged || pointersArrayChanged || labelsPropsChanged || typeChanged || valueChanged || minValueChanged || maxValueChanged || interactionChanged || anglesChanged;
  };

  const isHeightProvidedByUser = () => mergedProps.current.style?.height !== undefined;
  const isHeightPresentInParentNode = () => parentNode.current?.clientHeight !== 0;

  // Initialize and update chart on prop changes
  useLayoutEffect(() => {
    updateMergedProps();
    
    // Use dedicated flag instead of checking container content
    // Container can appear "empty" after removing old content, but it's not first render
    const isFirstRender = !hasBeenInitialized.current;
    isFirstRun.current = isFirstRender;
    
    if (CONSTANTS.debugLogs) {
      //console.debug("isHeightProvidedByUser:", isHeightProvidedByUser());
      //console.debug("isHeightPresentInParentNode:", isHeightPresentInParentNode());
    }
    
    if (isFirstRender) {
      container.current = select(svgRef.current);
      hasBeenInitialized.current = true;
    }
    
    if (shouldInitChart()) {
      chartHooks.initChart(gauge, isFirstRender);
    }
    
    gauge.prevProps.current = mergedProps.current;
    
    // Check if custom content needs to be rendered via React portal
    const customContentConfig = customContent.current as any;
    if (Array.isArray(customContentConfig?.items) && customContentConfig.items.length > 0) {
      setCustomContentItems(customContentConfig.items);
    } else if (customContentConfig?.domNode && customContentConfig?.renderContent) {
      // Backward compatible single-item config
      setCustomContentItems([
        {
          domNode: customContentConfig.domNode,
          renderContent: customContentConfig.renderContent,
          value: customContentConfig.value,
          arcColor: customContentConfig.arcColor,
        },
      ]);
    } else {
      setCustomContentItems([]);
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
      
      const entry = entries[0];
      if (!entry) return;
      
      const newWidth = entry.contentRect.width;
      const newHeight = entry.contentRect.height;
      
      // CRITICAL FIX: Skip if dimensions haven't actually changed (within tolerance)
      // This prevents the feedback loop: viewBox change → ResizeObserver → renderChart → viewBox change
      const TOLERANCE = 0.5; // 0.5px tolerance to account for floating point variations
      if (lastContainerSize.current) {
        const widthDiff = Math.abs(newWidth - lastContainerSize.current.width);
        const heightDiff = Math.abs(newHeight - lastContainerSize.current.height);
        if (widthDiff < TOLERANCE && heightDiff < TOLERANCE) {
          return; // Skip - dimensions haven't meaningfully changed
        }
      }
      
      // Update the last known size
      lastContainerSize.current = { width: newWidth, height: newHeight };
      
      // Log resize event for debugging
      if (CONSTANTS.debugLogs && entries[0]) {
        const entry2 = entries[0];
        // console.log('[ResizeObserver] Element resized:', {
        //   width: entry2.contentRect.width,
        //   height: entry2.contentRect.height
        // });
      }
      
      // Use a small delay to ensure layout is stable
      resizeTimeout = setTimeout(() => {
        requestAnimationFrame(() => {
          // Use gaugeRef.current to always get the latest gauge with current props
          // CRITICAL: Also check that essential elements exist before calling renderChart
          const gauge = gaugeRef.current;
          if (gauge && gauge.svg?.current && gauge.g?.current && gauge.doughnut?.current) {
            chartHooks.renderChart(gauge, true);
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
    if (!customContentItems || customContentItems.length === 0) return null;

    return (
      <>
        {customContentItems
          .filter((it) => it?.domNode && it?.renderContent)
          .map((it, idx) =>
            createPortal(
              it.renderContent(it.value, it.arcColor),
              it.domNode,
              `gauge-custom-content-${idx}`
            )
          )}
      </>
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
