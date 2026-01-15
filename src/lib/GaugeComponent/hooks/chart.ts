import CONSTANTS from "../constants";
import { Arc } from "../types/Arc";
import { Gauge } from "../types/Gauge";
import { GaugeType, GaugeInnerMarginInPercent } from "../types/GaugeComponentProps";
import { Labels } from "../types/Labels";
import * as arcHooks from "./arc";
import * as labelsHooks from "./labels";
import * as pointerHooks from "./pointer";
import * as utilHooks from "./utils";
import { shallowEqual } from "./utils";
import * as coordinateSystem from "./coordinateSystem";
import { GaugeLayout } from "./coordinateSystem";
export const initChart = (gauge: Gauge, isFirstRender: boolean) => {
    const { angles } = gauge.dimensions.current;
    
    let updatedValue = gauge.prevProps.current.value !== gauge.props.value;
    
    // Check for multi-pointer value changes (values changed but structure/count is the same)
    const prevPointers = gauge.prevProps.current.pointers;
    const currPointers = gauge.props.pointers;
    const isMultiPointerMode = Array.isArray(currPointers) && currPointers.length > 0;
    let multiPointerValuesChanged = false;
    
    if (isMultiPointerMode && Array.isArray(prevPointers) && prevPointers.length === currPointers.length) {
        // Check if only values changed (not structure)
        multiPointerValuesChanged = currPointers.some((p, i) => p.value !== prevPointers[i]?.value);
        
        // Check if structure (non-value properties) changed
        const structureChanged = currPointers.some((p, i) => {
            const prev = prevPointers[i];
            if (!prev) return true;
            // Compare non-value properties
            return p.type !== prev.type ||
                   p.color !== prev.color ||
                   p.length !== prev.length ||
                   p.width !== prev.width ||
                   p.hide !== prev.hide;
        });
        
        // Only use fast path if values changed but structure didn't
        if (multiPointerValuesChanged && !structureChanged) {
            updatedValue = true;
        }
    }
    
    const existingSvg = gauge.container.current.select("svg");
    
    // Detect mode transition (single-pointer <-> multi-pointer)
    // Mode transitions require full re-init even during animation
    const wasMultiPointerMode = Array.isArray(prevPointers) && prevPointers.length > 0;
    const modeTransition = wasMultiPointerMode !== isMultiPointerMode;
    
    if (updatedValue && !isFirstRender && !modeTransition) {
        renderChart(gauge, false);
        return;
    }
    
    // CRITICAL: If animation is in progress and we need to reinit, interrupt it first
    // This ensures config changes are applied immediately instead of being queued
    if (gauge.animationInProgress?.current && !isFirstRender) {
        // Interrupt all running animations
        if (gauge.pointer.current?.element) {
            gauge.pointer.current.element.interrupt();
        }
        if (gauge.doughnut.current) {
            gauge.doughnut.current.interrupt();
        }
        if (gauge.multiPointers?.current) {
            gauge.multiPointers.current.forEach(mp => {
                if (mp?.element) mp.element.interrupt();
            });
        }
        // Clear animation flags
        gauge.animationInProgress.current = false;
        if (gauge.pendingConfigChange) {
            gauge.pendingConfigChange.current = false;
        }
    }
    
    // Invalidate measured bounds ONLY when truly layout-affecting props change
    // CRITICAL: Only clear on first render OR when arc/type/marginInPercent change
    // Labels and pointer changes don't affect the overall layout/viewBox
    // Value changes definitely don't - they only move the pointer
    const arcChanged = JSON.stringify(gauge.prevProps.current.arc) !== JSON.stringify(gauge.props.arc);
    const typeChanged = gauge.prevProps.current.type !== gauge.props.type;
    const marginChanged = JSON.stringify(gauge.prevProps.current.marginInPercent) !== JSON.stringify(gauge.props.marginInPercent);
    
    // Only these three actually affect layout calculations
    const layoutPropsChanged = isFirstRender || arcChanged || typeChanged || marginChanged;
    
    if (layoutPropsChanged && gauge.measuredBounds) {
        gauge.measuredBounds.current = null;
    }
    
    // For subsequent renders (not first), reuse the existing SVG and create new groups
    if (!existingSvg.empty() && !isFirstRender) {
        gauge.svg.current = existingSvg;
        
        // CRITICAL FIX: Remove old content IMMEDIATELY to prevent duplicate gauges
        gauge.svg.current.selectAll("g.gauge-content").remove();
        gauge.svg.current.selectAll("g.gauge-content-old").remove();
        // Create fresh groups
        gauge.g.current = gauge.svg.current.append("g").attr("class", "gauge-content");
        gauge.doughnut.current = gauge.g.current.append("g").attr("class", "doughnut");
        
        // Reset animation flags when pointer elements are being recreated
        // This is necessary because pointer refs are cleared below, so animation needs to replay
        if (gauge.initialAnimationTriggered) {
            gauge.initialAnimationTriggered.current = false;
        }
        if (gauge.multiPointerAnimationTriggered) {
            gauge.multiPointerAnimationTriggered.current = [];
        }
        // Reset pointer ref to prevent stale references
        if (gauge.pointer?.current) {
            gauge.pointer.current.element = null;
            gauge.pointer.current.path = null;
        }
        // Reset multi-pointer refs
        if (gauge.multiPointers) {
            gauge.multiPointers.current = [];
        }
        
        //console.debug('[initChart] After removal - will call addPointerElement');
    } else {
        // First render or no existing SVG - create new
        gauge.container.current.select("svg").remove();
        gauge.svg.current = gauge.container.current.append("svg")
            .style("visibility", "hidden")  // Start hidden to prevent pass 1 flash
            .style("opacity", "0");
        gauge.g.current = gauge.svg.current.append("g").attr("class", "gauge-content");
        gauge.doughnut.current = gauge.g.current.append("g").attr("class", "doughnut");
    }
    
    calculateAngles(gauge);
    gauge.pieChart.current
        .value((d: any) => d.value)
        //.padAngle(15)
        .startAngle(angles.startAngle)
        .endAngle(angles.endAngle)
        .sort(null);
    //Set up pointer element only for single-pointer mode with pointers to render
    //In multi-pointer mode, elements are created by drawMultiPointers in renderChart
    const isMultiPointer = pointerHooks.isMultiPointerMode(gauge);
    const hasPointers = pointerHooks.hasPointersToRender(gauge);
    if (!isMultiPointer && hasPointers) {
        pointerHooks.addPointerElement(gauge);
    }
    renderChart(gauge, true);
}
export const calculateAngles = (gauge: Gauge) => {
    const { angles } = gauge.dimensions.current;
    
    // Use custom angles if provided (convert degrees to radians)
    if (gauge.props.startAngle !== undefined && gauge.props.endAngle !== undefined) {
        angles.startAngle = (gauge.props.startAngle * Math.PI) / 180;
        angles.endAngle = (gauge.props.endAngle * Math.PI) / 180;
        return;
    }
    
    // Default angles by gauge type
    if (gauge.props.type == GaugeType.Semicircle) {
        angles.startAngle = -Math.PI / 2 + 0.02;
        angles.endAngle = Math.PI / 2 - 0.02;
    } else if (gauge.props.type == GaugeType.Radial) {
        angles.startAngle = -Math.PI / 1.37;
        angles.endAngle = Math.PI / 1.37;
    } else if (gauge.props.type == GaugeType.Grafana) {
        angles.startAngle = -Math.PI / 1.6;
        angles.endAngle = Math.PI / 1.6;
    }
}
//Renders the chart, should be called every time the window is resized
export const renderChart = (gauge: Gauge, resize: boolean = false) => {
    const { dimensions } = gauge;
    let arc = gauge.props.arc as Arc;
    let labels = gauge.props.labels as Labels;

    if (resize) {
        // Skip resize render if animation is currently in progress
        // This prevents the pointer/arc from being redrawn at wrong position
        // Mark that a resize is pending so we can render after animation completes
        if (gauge.animationInProgress?.current) {
            if (gauge.pendingResize) {
                gauge.pendingResize.current = true;
            }
            if (CONSTANTS.debugLogs) {
                //console.debug('[renderChart] Skipping resize - animation in progress, marked pending');
            }
            return;
        }
        
        var parentNode = gauge.container.current.node() as HTMLElement;
        if (!parentNode) return;
        
        var rect = parentNode.getBoundingClientRect();
        var parentWidth = rect.width;
        var parentHeight = rect.height;
        
        // Skip render if dimensions are not available yet
        if (parentWidth <= 0 || parentHeight <= 0) {
            if (CONSTANTS.debugLogs) {
                //console.debug('[renderChart] Skipping render - invalid dimensions:', { width: parentWidth, height: parentHeight });
            }
            // Ensure gauge is visible even if we skip (it may have been hidden before)
            gauge.svg.current?.style("visibility", "visible").style("opacity", "1");
            return;
        }
        
        // Initialize render pass tracking
        if (!gauge.renderPass) {
            gauge.renderPass = { current: 1 };
        }
        if (!gauge.measuredBounds) {
            gauge.measuredBounds = { current: null };
        }
        
        const currentPass = gauge.renderPass.current;
        const hasPreviousBounds = gauge.measuredBounds?.current != null;
        
        if (CONSTANTS.debugLogs) {
            //console.debug(`[renderChart] Pass ${currentPass} - Container:`, { width: parentWidth, height: parentHeight, hasPreviousBounds });
        }
        
        let layout: coordinateSystem.GaugeLayout;
        
        // On resize with existing bounds, skip pass 1 and go directly to optimized layout
        if (currentPass === 1 && hasPreviousBounds && gauge.measuredBounds!.current) {
            // We already have measured bounds - use them directly for a smooth resize
            // Scale the previous layout to the new container size
            const prevLayout = gauge.prevGSize.current;
            layout = coordinateSystem.calculateLayoutFromMeasuredBounds(
                parentWidth,
                parentHeight,
                gauge.measuredBounds!.current,
                gauge.props.type as GaugeType,
                arc.width as number,
                prevLayout
            );
            // Skip to showing the result directly (no need for pass 2)
            gauge.renderPass!.current = 2;
            // Remove old content immediately since we're going straight to final render
            gauge.svg.current.selectAll("g.gauge-content-old").remove();
        } else if (currentPass === 1) {
            // PASS 1: First render - use tight layout with minimal padding
            // This will likely clip some content, but we'll measure and fix it
            layout = coordinateSystem.calculateTightLayout(
                parentWidth,
                parentHeight,
                gauge.props.type as GaugeType,
                arc.width as number,
                typeof gauge.props.marginInPercent === 'number' 
                    ? gauge.props.marginInPercent 
                    : 0
            );
        } else if (currentPass === 2 && gauge.measuredBounds.current) {
            // PASS 2: Use measured bounds to calculate optimal layout
            const prevLayout = gauge.prevGSize.current;
            layout = coordinateSystem.calculateLayoutFromMeasuredBounds(
                parentWidth,
                parentHeight,
                gauge.measuredBounds.current,
                gauge.props.type as GaugeType,
                arc.width as number,
                prevLayout
            );
            
            if (CONSTANTS.debugLogs) {
                //console.debug('[renderChart] Pass 2 - Optimized layout from bounds:', {
                //     measuredBounds: gauge.measuredBounds.current,
                //     newRadius: layout.outerRadius,
                //     viewBox: layout.viewBox.toString()
                // });
            }
        } else {
            // Fallback to optimized layout calculation
            const paddingConfig = coordinateSystem.extractPaddingConfig(
                labels,
                gauge.props.pointer?.length
            );
            layout = coordinateSystem.calculateOptimizedLayout(
                parentWidth,
                parentHeight,
                gauge.props.type as GaugeType,
                arc.width as number,
                paddingConfig,
                typeof gauge.props.marginInPercent === 'number' 
                    ? gauge.props.marginInPercent 
                    : 0
            );
        }
        
        // if (CONSTANTS.debugLogs) {
        //         console.debug(`[renderChart] Pass ${currentPass} - Layout:`, {
        //         outerRadius: layout.outerRadius,
        //         viewBox: layout.viewBox.toString(),
        //         gaugeCenter: layout.gaugeCenter
        //     });
        // }
        
        // Check for layout stability to prevent infinite resize loops
        if (gauge.prevGSize.current && currentPass > 1) {
            const stable = coordinateSystem.isLayoutStable(
                gauge.prevGSize.current,
                layout,
                0.005 // 0.5% tolerance
            );
            if (stable) {
                // Layout hasn't changed significantly, skip re-render but ensure visibility
                if (CONSTANTS.debugLogs) {
                    //console.debug('[renderChart] Layout stable, skipping re-render');
                }
                // Still ensure gauge is visible
                const isHidden = gauge.svg.current?.style("visibility") === "hidden";
                const useFadeIn = gauge.props.fadeInAnimation === true;
                if (isHidden && useFadeIn) {
                    const animDelay = gauge.props.pointer?.animationDelay || 0;
                    gauge.svg.current
                        ?.style("visibility", "visible")
                        .style("opacity", "0")
                        .style("animation", `gaugeComponentFadeIn 200ms ease-out ${animDelay}ms forwards`);
                } else {
                    gauge.svg.current?.style("visibility", "visible").style("opacity", "1").style("animation", "none");
                }
                gauge.g.current
                    ?.style("visibility", "visible")
                    .style("opacity", "1");
                return;
            }
        }
        gauge.prevGSize.current = layout;
        
        // Update dimensions from the new layout
        coordinateSystem.updateDimensionsFromLayout(dimensions.current, layout);
        
        // Configure SVG with proper viewBox and dimensions
        // SVG is always visible - we hide/show the content groups instead
        const shouldHideNewContent = currentPass === 1 && gauge.renderPass!.current === 1;
        const hasOldContent = !gauge.svg.current.selectAll("g.gauge-content-old").empty();
        
        // Only show SVG if we have old content to display OR we're on pass 2
        // On first render pass 1, keep SVG hidden until pass 2
        const shouldShowSvg = hasOldContent || !shouldHideNewContent;
        
        gauge.svg.current
            .attr("width", "100%")
            .attr("height", "100%")
            .style("max-width", "100%")
            .style("max-height", "100%")
            .style("display", "block")
            .style("visibility", hasOldContent ? "visible" : "hidden")
            .style("opacity", hasOldContent ? "1" : "0")
            .attr('preserveAspectRatio', 'xMidYMid meet');
        
        // Only update viewBox when showing new content (pass 2) or if no old content exists
        // This prevents distortion of old content during pass 1 measurement
        if (!shouldHideNewContent || !hasOldContent) {
            gauge.svg.current.attr("viewBox", layout.viewBox.toString());
        }
        
        // Keep new content hidden until it's properly drawn at the starting position
        // This prevents flash at final value before animation
        gauge.g.current
            .style("visibility", "hidden")
            .style("opacity", "0");
        
        // Position the main gauge group at the calculated center
        gauge.g.current
            .attr("transform", `translate(${layout.gaugeCenter.x}, ${layout.gaugeCenter.y})`);

        // Position the doughnut (arcs) at the origin relative to g
        gauge.doughnut.current.attr(
            "transform",
            "translate(0, 0)"
        );

        gauge.doughnut.current
            .on("mouseleave", () => arcHooks.hideTooltip(gauge))
            .on("mouseout", () => arcHooks.hideTooltip(gauge));
        
        clearChart(gauge, currentPass);
        arcHooks.setArcData(gauge);
        
        // For Grafana type with animation, start the arc at prevPercent (or 0) 
        // so it animates from that position instead of flashing at final value
        // Use initialAnimationTriggered flag to handle ResizeObserver firing after prevProps is set
        let initialArcPercent: number | undefined = undefined;
        const isGrafana = gauge.props.type === GaugeType.Grafana;
        const shouldAnimate = gauge.props.pointer?.animate !== false;
        const isFirstAnimation = !gauge.initialAnimationTriggered?.current;
        
        // Always use 0 for first animation to prevent flash
        // For multi-pointer mode, use first pointer's value for Grafana arc
        const isMultiPointer = pointerHooks.isMultiPointerMode(gauge);
        if (isGrafana && shouldAnimate) {
            // Force 0% on first animation - this is the key fix
            if (isFirstAnimation) {
                initialArcPercent = 0;
            } else {
                const minValue = gauge.props.minValue as number;
                const maxValue = gauge.props.maxValue as number;
                // Use first pointer's value in multi-pointer mode, otherwise use main value
                const prevPointerValue = gauge.prevProps?.current?.pointers?.[0]?.value;
                const prevValue = isMultiPointer && prevPointerValue !== undefined 
                    ? prevPointerValue 
                    : (gauge.prevProps?.current.value ?? minValue);
                initialArcPercent = utilHooks.calculatePercentage(minValue, maxValue, prevValue);
            }
        }
        
        arcHooks.setupArcs(gauge, resize, initialArcPercent);
        
        // Setup ticks first (under pointers)
        labelsHooks.setupTicks(gauge);
        
        // Only draw pointer on pass 2 (visible pass) to avoid animation interference
        // On pass 1, content is hidden for measurement only - no need to animate
        const pointerCountBeforeDraw = gauge.g.current?.selectAll('.pointer').size() ?? 0;
        //console.debug('[renderChart] Before drawPointer - pass:', currentPass, 'resize:', resize, 'pointerCount:', pointerCountBeforeDraw);
        
        if (currentPass === 2) {
            // Check if we have pointers to render
            const isMultiPointer = pointerHooks.isMultiPointerMode(gauge);
            const hasPointers = pointerHooks.hasPointersToRender(gauge);
            
            if (isMultiPointer && hasPointers) {
                // Multi-pointer mode with pointers
                pointerHooks.drawMultiPointers(gauge, resize);
            } else if (!isMultiPointer && hasPointers) {
                // Single pointer mode
                pointerHooks.drawPointer(gauge, resize);
            }
            
            // For Grafana, always update arc fill (even with 0 pointers)
            if (gauge.props.type === GaugeType.Grafana) {
                const minValue = gauge.props.minValue as number;
                const maxValue = gauge.props.maxValue as number;
                const currentPercent = utilHooks.calculatePercentage(minValue, maxValue, gauge.props.value as number);
                arcHooks.updateGrafanaArc(gauge, currentPercent);
            }
            
            const pointerCountAfterDraw = gauge.g.current?.selectAll('.pointer').size() ?? 0;
            const viewBox = gauge.svg.current?.attr('viewBox') ?? 'none';
            const gTransform = gauge.g.current?.attr('transform') ?? 'none';
            const { outerRadius, innerRadius } = gauge.dimensions.current;
            //console.debug('[renderChart] After drawPointer - pointerCount:', pointerCountAfterDraw, 'viewBox:', viewBox, 'gTransform:', gTransform, 'outerRadius:', outerRadius);
        }
        
        // Setup value label AFTER pointers so it renders on top
        labelsHooks.setupValueLabel(gauge);
        
        // NOW make gauge visible - content is drawn at correct starting position
        if (currentPass === 2) {
            const animationDelay = gauge.props.pointer?.animationDelay || 0;
            const useFadeIn = gauge.props.fadeInAnimation === true;
            gauge.svg.current
                .style("visibility", "visible")
                .style("opacity", useFadeIn ? "0" : "1")
                .style("animation", useFadeIn ? `gaugeComponentFadeIn 200ms ease-out ${animationDelay}ms forwards` : "none");
            gauge.g.current
                .style("visibility", "visible")
                .style("opacity", "1");
            
            // CRITICAL FIX: Ensure pointer element itself has visibility set directly
            // Not just inherited from parent - this fixes pointer vanishing during resize
            gauge.g.current?.select('.pointer')
                .style("visibility", "visible")
                .style("opacity", "1");
            gauge.g.current?.selectAll('.multi-pointer')
                .style("visibility", "visible")
                .style("opacity", "1");
            
            // DEBUG: Verify visibility was set
            const gVisibility = gauge.g.current?.style('visibility');
            const pointerVisibility = gauge.g.current?.select('.pointer')?.style('visibility');
            //console.debug('[renderChart] After setting visibility - g:', gVisibility, 'pointer:', pointerVisibility);
        }
        
        // Set up pointer drag if onValueChange callback is provided
        // Only set up on second pass when layout is stable
        if (gauge.props.onValueChange && currentPass === 2) {
            pointerHooks.setupPointerDrag(gauge);
            pointerHooks.setupArcClick(gauge);
        }
        
        // After first pass, measure the actual bounds and trigger second pass
        if (currentPass === 1) {
            // Measure bounds synchronously - the element exists even if hidden
            const gElement = gauge.g.current?.node();
            if (gElement) {
                try {
                    // Force layout calculation to get accurate bbox
                    const bbox = gElement.getBBox();
                    gauge.measuredBounds!.current = {
                        width: bbox.width,
                        height: bbox.height,
                        x: bbox.x,
                        y: bbox.y
                    };
                    
                    if (CONSTANTS.debugLogs) {
                        //console.debug('[renderChart] Measured bounds:', gauge.measuredBounds!.current);
                    }
                    
                    // Hide old content before pass 2
                    gauge.svg.current.selectAll("g.gauge-content-old")
                        .style("visibility", "hidden")
                        .style("opacity", "0");
                    
                    // Trigger second pass synchronously - no rAF delay
                    gauge.renderPass!.current = 2;
                    renderChart(gauge, true);
                    
                    // Remove old content after new content is rendered
                    gauge.svg.current.selectAll("g.gauge-content-old").remove();
                    
                    // Reset for next resize
                    gauge.renderPass!.current = 1;
                } catch (e) {
                    // getBBox can fail if element is not rendered
                    if (CONSTANTS.debugLogs) {
                        //console.debug('[renderChart] Could not measure bounds:', e);
                    }
                    // Make visible anyway using rAF as fallback
                    requestAnimationFrame(() => {
                        const animDelay = gauge.props.pointer?.animationDelay || 0;
                        const useFadeIn = gauge.props.fadeInAnimation === true;
                        gauge.svg.current
                            ?.style("visibility", "visible")
                            .style("opacity", useFadeIn ? "0" : "1")
                            .style("animation", useFadeIn ? `gaugeComponentFadeIn 200ms ease-out ${animDelay}ms forwards` : "none");
                        gauge.g.current
                            ?.style("visibility", "visible")
                            .style("opacity", "1");
                        gauge.svg.current.selectAll("g.gauge-content-old").remove();
                        gauge.renderPass!.current = 1;
                    });
                }
            } else {
                // gElement not available - use rAF as fallback
                requestAnimationFrame(() => {
                    const animDelay = gauge.props.pointer?.animationDelay || 0;
                    const useFadeIn = gauge.props.fadeInAnimation === true;
                    gauge.svg.current
                        ?.style("visibility", "visible")
                        .style("opacity", useFadeIn ? "0" : "1")
                        .style("animation", useFadeIn ? `gaugeComponentFadeIn 200ms ease-out ${animDelay}ms forwards` : "none");
                    gauge.g.current
                        ?.style("visibility", "visible")
                        .style("opacity", "1");
                    gauge.svg.current.selectAll("g.gauge-content-old").remove();
                    gauge.renderPass!.current = 1;
                });
            }
        }
    } else {
        // Non-resize updates (only data/props changed)
        // Uses shallowEqual instead of JSON.stringify for better performance
        let arcsPropsChanged = !shallowEqual(gauge.prevProps.current.arc, gauge.props.arc);
        let pointerPropsChanged = !shallowEqual(gauge.prevProps.current.pointer, gauge.props.pointer);
        let valueChanged = gauge.prevProps.current.value !== gauge.props.value;
        let ticksChanged = !shallowEqual(gauge.prevProps.current.labels?.tickLabels, labels.tickLabels);
        let valueLabelChanged = !shallowEqual(gauge.prevProps.current.labels?.valueLabel, labels.valueLabel);
        
        // Check for multi-pointer value changes
        const isMultiPointer = pointerHooks.isMultiPointerMode(gauge);
        const prevPointers = gauge.prevProps.current.pointers;
        const currPointers = gauge.props.pointers;
        let multiPointerValuesChanged = false;
        if (isMultiPointer && Array.isArray(prevPointers)) {
            multiPointerValuesChanged = currPointers?.some((p, i) => p.value !== prevPointers[i]?.value) ?? false;
        }
        
        let shouldRedrawArcs = arcsPropsChanged;
        if (shouldRedrawArcs) {
            // Calculate initialArcPercent for Grafana gauges to prevent arc flicker
            let initialArcPercent: number | undefined = undefined;
            const isGrafana = gauge.props.type === GaugeType.Grafana;
            const shouldAnimate = gauge.props.pointer?.animate !== false;
            if (isGrafana && shouldAnimate) {
                const minValue = gauge.props.minValue as number;
                const maxValue = gauge.props.maxValue as number;
                const prevValue = gauge.prevProps?.current.value ?? minValue;
                initialArcPercent = utilHooks.calculatePercentage(minValue, maxValue, prevValue);
            }
            
            arcHooks.clearArcs(gauge);
            arcHooks.setArcData(gauge);
            arcHooks.setupArcs(gauge, resize, initialArcPercent);
        }
        
        // Handle pointer updates - either single or multi-pointer mode
        const hasPointers = pointerHooks.hasPointersToRender(gauge);
        const isGrafana = gauge.props.type === GaugeType.Grafana;
        
        if (isMultiPointer && hasPointers) {
            // In multi-pointer mode, redraw if pointer values changed
            if (multiPointerValuesChanged) {
                pointerHooks.drawMultiPointers(gauge, false);
            }
        } else if (!isMultiPointer && (hasPointers || isGrafana)) {
            // Single pointer mode OR Grafana without pointer (arc-only animation)
            // drawPointer handles both pointer animation AND Grafana arc animation
            var shouldRedrawPointer = pointerPropsChanged || valueChanged;
            if (shouldRedrawPointer) {
                pointerHooks.drawPointer(gauge);
            }
        }
        
        if (arcsPropsChanged || ticksChanged) {
            labelsHooks.clearTicks(gauge);
            labelsHooks.setupTicks(gauge);
        }
        if (valueChanged || valueLabelChanged || multiPointerValuesChanged) {
            labelsHooks.clearValueLabel(gauge);
            labelsHooks.setupValueLabel(gauge);
        }
    }
};
/**
 * Legacy function kept for backward compatibility during transition
 * This should eventually be removed as all code migrates to the new coordinate system
 * @deprecated Use coordinateSystem.calculateGaugeLayout instead
 */
export const calculateRadius = (gauge: Gauge) => {
    // This function is now handled by the coordinate system module
    // Kept for backward compatibility only
};

/**
 * Legacy function kept for backward compatibility during transition
 * @deprecated Centering is now handled by coordinateSystem.calculateGaugeCenter
 */
export const centerGraph = (gauge: Gauge) => {
    // This function is now handled by the coordinate system module
    // Kept for backward compatibility only
};

export const clearChart = (gauge: Gauge, currentPass: number = 2) => {
    //Remove the old stuff
    labelsHooks.clearTicks(gauge);
    labelsHooks.clearValueLabel(gauge);
    // CRITICAL FIX: Only clear pointer on pass 2 (when we're about to redraw it)
    // On pass 1, we measure but don't redraw pointer - clearing it would leave it empty
    // if resize stops before pass 2 completes
    if (currentPass === 2) {
        pointerHooks.clearPointerElement(gauge);
        pointerHooks.clearMultiPointers(gauge);
    }
    arcHooks.clearArcs(gauge);
};