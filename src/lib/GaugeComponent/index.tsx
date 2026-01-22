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
  const pendingConfigChange = useRef<boolean>(false); // Track if config changed during animation
  const multiPointers = useRef<MultiPointerRef[]>([]);
  const multiPointerAnimationTriggered = useRef<boolean[]>([]);
  const isDragging = useRef<boolean>(false); // Track if user is dragging pointer
  const hasBeenInitialized = useRef<boolean>(false); // Track if component has ever been initialized
  const measuredBoundsRef = useRef<{ width: number; height: number; x: number; y: number } | null>(null); // Persist measured bounds across renders
  const renderPassRef = useRef<number>(1); // Persist render pass state
  const initialRenderDeferred = useRef<boolean>(false); // Track if we're deferring initial render to ResizeObserver
  const lastContainerSize = useRef<{ width: number; height: number } | null>(null); // Track last container dimensions to prevent infinite recalculation
  
  // State to trigger re-render when custom content needs to be rendered
  const [customContentItems, setCustomContentItems] = useState<any[]>([]);

  // Helper function to sync custom content state after chart render
  // This needs to be called after initChart/renderChart to update React state
  // with any custom content that was registered during the D3 render pass
  const syncCustomContentState = () => {
    const customContentConfig = customContent.current as any;
    if (Array.isArray(customContentConfig?.items) && customContentConfig.items.length > 0) {
      // Always update with the new items since DOM nodes change on each render
      // We can't use JSON.stringify because items contain functions and DOM nodes
      setCustomContentItems([...customContentConfig.items]);
    } else if (customContentConfig?.domNode && customContentConfig?.renderContent) {
      // Backward compatible single-item config
      setCustomContentItems([{
        domNode: customContentConfig.domNode,
        renderContent: customContentConfig.renderContent,
        value: customContentConfig.value,
        arcColor: customContentConfig.arcColor,
      }]);
    } else {
      setCustomContentItems(prev => prev.length > 0 ? [] : prev);
    }
  };
  
  // Store sync function in a ref so ResizeObserver callback always has access to latest version
  const syncCustomContentStateRef = useRef(syncCustomContentState);
  syncCustomContentStateRef.current = syncCustomContentState;

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
    pendingConfigChange,
    multiPointers,
    multiPointerAnimationTriggered,
    isDragging,
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
  // IMPORTANT: Only trigger reinit for STRUCTURAL changes
  // Value changes should NOT trigger reinit - they just animate the pointer
  const shouldInitChart = () => {
    const prev = prevProps.current;
    const curr = mergedProps.current;
    
    // Structural changes that require full reinit
    const arcsPropsChanged = JSON.stringify(prev.arc) !== JSON.stringify(curr.arc);
    
    // For labels, exclude functions and internal properties from comparison
    // __renderIndex is added internally and should not trigger reinit
    const getLabelsStructure = (l: any) => {
      if (!l) return null;
      // Clean ticks array - remove internal __renderIndex property
      const cleanTicks = (ticks: any[]) => {
        if (!ticks) return undefined;
        return ticks.map((t: any) => {
          const { __renderIndex, ...rest } = t;
          return rest;
        });
      };
      return {
        valueLabel: l.valueLabel ? {
          hide: l.valueLabel.hide,
          matchColorWithArc: l.valueLabel.matchColorWithArc,
          maxDecimalDigits: l.valueLabel.maxDecimalDigits,
          style: l.valueLabel.style,
          animateValue: l.valueLabel.animateValue,
        } : undefined,
        tickLabels: l.tickLabels ? {
          hideMinMax: l.tickLabels.hideMinMax,
          type: l.tickLabels.type,
          ticks: cleanTicks(l.tickLabels.ticks),
          defaultTickValueConfig: l.tickLabels.defaultTickValueConfig ? {
            hide: l.tickLabels.defaultTickValueConfig.hide,
            maxDecimalDigits: l.tickLabels.defaultTickValueConfig.maxDecimalDigits,
            style: l.tickLabels.defaultTickValueConfig.style,
          } : undefined,
          defaultTickLineConfig: l.tickLabels.defaultTickLineConfig,
        } : undefined,
      };
    };
    const labelsPropsChanged = JSON.stringify(getLabelsStructure(prev.labels)) !== JSON.stringify(getLabelsStructure(curr.labels));
    const typeChanged = prev.type !== curr.type;
    const minValueChanged = prev.minValue !== curr.minValue;
    const maxValueChanged = prev.maxValue !== curr.maxValue;
    const anglesChanged = prev.startAngle !== curr.startAngle || prev.endAngle !== curr.endAngle;
    
    // For single pointer, only check if hide changed (show/hide requires reinit)
    // Other prop changes (type, color, length, width, etc.) are handled by renderChart
    const prevPointer = prev.pointer || {};
    const currPointer = curr.pointer || {};
    const pointerHideChanged = prevPointer.hide !== currPointer.hide;
    
    // For pointers array, only check COUNT changes (structure/prop changes handled by renderChart)
    // This prevents full reinit when just changing pointer type/color/etc.
    const prevPointers = prev.pointers;
    const currPointers = curr.pointers;
    const pointersCountChanged = (prevPointers?.length ?? 0) !== (currPointers?.length ?? 0);
    
    // Mode transition (single <-> multi pointer) requires reinit
    const wasMultiPointer = Array.isArray(prevPointers) && prevPointers.length > 0;
    const isMultiPointer = Array.isArray(currPointers) && currPointers.length > 0;
    const modeTransition = wasMultiPointer !== isMultiPointer;
    
    return arcsPropsChanged || labelsPropsChanged || pointerHideChanged || pointersCountChanged || 
           modeTransition || typeChanged || minValueChanged || maxValueChanged || anglesChanged;
  };
  
  // Check if only value changed (for animation without reinit)
  const onlyValueChanged = () => {
    const prev = prevProps.current;
    const curr = mergedProps.current;
    return prev.value !== curr.value || 
           prev.pointers?.some((p: any, i: number) => p.value !== curr.pointers?.[i]?.value);
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
      
      // MOBILE FIX: Defer initial render to ResizeObserver callback
      // On mobile devices, getBoundingClientRect() can return incorrect dimensions
      // during the initial render because the browser hasn't finished layout.
      // By deferring to ResizeObserver, we ensure dimensions are accurate.
      // ResizeObserver fires immediately when observing an element with stable dimensions.
      initialRenderDeferred.current = true;
      gauge.prevProps.current = mergedProps.current;
      return; // Skip initial chart render - let ResizeObserver handle it
    }
    
    // Check if structural changes require full reinit
    const needsReinit = shouldInitChart();
    const valueOnlyChange = onlyValueChanged();
    
    if (needsReinit) {
      chartHooks.initChart(gauge, isFirstRender);
    } else {
      // Any non-structural change (value, animation settings, etc.) - just re-render
      chartHooks.renderChart(gauge, false);
    }
    
    gauge.prevProps.current = mergedProps.current;
    
    // Sync custom content state after chart render
    syncCustomContentState();
  }, [props]);

  // Set up ResizeObserver for responsive resizing
  useEffect(() => {
    const element = svgRef.current;
    if (!element) return;

    let resizeTimeout: ReturnType<typeof setTimeout>;
    let fallbackTimeout: ReturnType<typeof setTimeout>;
    
    const handleResize = (entries: ResizeObserverEntry[]) => {
      // Cancel any pending resize to debounce rapid changes
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
      
      const entry = entries[0];
      if (!entry) return;
      
      const newWidth = entry.contentRect.width;
      const newHeight = entry.contentRect.height;
      
      // Skip if dimensions are invalid (but don't skip deferred initial render fallback)
      if (newWidth <= 0 || newHeight <= 0) {
        // If initial render is deferred and we got zero dimensions,
        // the fallback timeout will handle it
        return;
      }
      
      // Clear fallback timeout since we got valid dimensions
      if (fallbackTimeout) {
        clearTimeout(fallbackTimeout);
      }
      
      // INFINITE LOOP FIX: Skip if container dimensions haven't actually changed
      // This prevents oscillation caused by internal viewBox recalculations
      // triggering ResizeObserver which triggers more recalculations
      const lastSize = lastContainerSize.current;
      if (lastSize && !initialRenderDeferred.current) {
        const widthChange = Math.abs(newWidth - lastSize.width);
        const heightChange = Math.abs(newHeight - lastSize.height);
        // Use 1px threshold to ignore sub-pixel changes
        if (widthChange < 1 && heightChange < 1) {
          return;
        }
      }
      
      // Update last known container size
      lastContainerSize.current = { width: newWidth, height: newHeight };
      
      // Log resize event for debugging
      if (CONSTANTS.debugLogs) {
        // console.log('[ResizeObserver] Element resized:', {
        //   width: newWidth,
        //   height: newHeight
        // });
      }
      
      // Use a small delay to ensure layout is stable
      resizeTimeout = setTimeout(() => {
        requestAnimationFrame(() => {
          // Use gaugeRef.current to always get the latest gauge with current props
          if (gaugeRef.current) {
            // MOBILE FIX: Handle deferred initial render
            // If this is the first resize after mount, perform the initial chart render
            // This ensures we render with accurate dimensions from ResizeObserver
            if (initialRenderDeferred.current) {
              initialRenderDeferred.current = false;
              chartHooks.initChart(gaugeRef.current, true);
              // CRITICAL: Sync custom content state after deferred initial render
              // This ensures renderContent labels are displayed on first render
              syncCustomContentStateRef.current();
            } else {
              chartHooks.renderChart(gaugeRef.current, true);
              // Sync custom content state after resize render
              syncCustomContentStateRef.current();
            }
          }
        });
      }, 16); // ~1 frame
    };

    const observer = new ResizeObserver(handleResize);
    
    // Observe the gauge container itself, not its parent
    // This ensures we get accurate dimensions when we resize
    observer.observe(element);
    
    // FALLBACK: If ResizeObserver doesn't provide valid dimensions within 100ms,
    // render anyway using getBoundingClientRect as fallback
    // This handles cases where container has height:100% but parent has no explicit height
    if (initialRenderDeferred.current) {
      fallbackTimeout = setTimeout(() => {
        if (initialRenderDeferred.current && gaugeRef.current) {
          initialRenderDeferred.current = false;
          chartHooks.initChart(gaugeRef.current, true);
          // CRITICAL: Sync custom content state after fallback initial render
          syncCustomContentStateRef.current();
        }
      }, 100);
    }

    return () => {
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
      if (fallbackTimeout) {
        clearTimeout(fallbackTimeout);
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
