import {
    easeElastic,
    easeExpOut,
    interpolateNumber,
    drag,
    select,
} from "d3";
import { PointerContext, PointerProps, PointerType, PointerWithValue, MultiPointerRef, defaultPointerContext } from "../types/Pointer";
import { getCoordByValue, getEffectiveAngles } from "./arc";
import { Gauge } from "../types/Gauge";
import * as utils from "./utils";
import * as arcHooks from "./arc";
import * as labelsHooks from "./labels";
import { GaugeType } from "../types/GaugeComponentProps";

// ============================================================================
// DIAGNOSTICS: Track unwanted behaviors during rendering
// ============================================================================
export interface PointerDiagnostics {
    pointerVanishCount: number;
    pointerMismatchCount: number;
    stalePointerCleanups: number;
    resizeInterruptions: number;
    animationInterruptions: number;
    lastVanishTimestamp: number | null;
    lastMismatchDetails: { expected: number; actual: number } | null;
}

// Global diagnostics tracker (reset per gauge instance in production)
const diagnostics: PointerDiagnostics = {
    pointerVanishCount: 0,
    pointerMismatchCount: 0,
    stalePointerCleanups: 0,
    resizeInterruptions: 0,
    animationInterruptions: 0,
    lastVanishTimestamp: null,
    lastMismatchDetails: null,
};

export const getDiagnostics = (): PointerDiagnostics => ({ ...diagnostics });
export const resetDiagnostics = (): void => {
    diagnostics.pointerVanishCount = 0;
    diagnostics.pointerMismatchCount = 0;
    diagnostics.stalePointerCleanups = 0;
    diagnostics.resizeInterruptions = 0;
    diagnostics.animationInterruptions = 0;
    diagnostics.lastVanishTimestamp = null;
    diagnostics.lastMismatchDetails = null;
};

/**
 * Ensure pointer element exists, recreate if missing
 * Tracks vanish events for diagnostics
 */
export const ensurePointerExists = (gauge: Gauge): boolean => {
    const isMultiPointer = isMultiPointerMode(gauge);
    
    if (isMultiPointer) {
        const expectedCount = gauge.props.pointers?.length ?? 0;
        const actualCount = gauge.g.current?.selectAll('.multi-pointer').size() ?? 0;
        
        if (actualCount < expectedCount) {
            diagnostics.pointerVanishCount++;
            diagnostics.lastVanishTimestamp = Date.now();
            console.warn(`[GaugeComponent] Pointer vanished during resize! Expected: ${expectedCount}, Found: ${actualCount}. Recreating...`);
            return false;
        }
    } else {
        const pointerExists = gauge.pointer.current?.element && 
                              !gauge.g.current?.select('.pointer').empty();
        
        if (!pointerExists && !gauge.props.pointer?.hide) {
            diagnostics.pointerVanishCount++;
            diagnostics.lastVanishTimestamp = Date.now();
            console.warn(`[GaugeComponent] Single pointer vanished during resize! Recreating...`);
            return false;
        }
    }
    
    return true;
};

export const drawPointer = (gauge: Gauge, resize: boolean = false) => {
    const pointerElementExists = gauge.pointer.current?.element != null;
    const pointerInDOM = gauge.g.current?.select('.pointer').empty() === false;
    const pointerElement = gauge.g.current?.select('.pointer');
    const transform = pointerElement?.attr?.('transform') ?? 'none';
    const visibility = pointerElement?.style?.('visibility') ?? 'unknown';
    const opacity = pointerElement?.style?.('opacity') ?? 'unknown';
    //console.debug('[drawPointer] Entry - resize:', resize, 'elementRef:', pointerElementExists, 'inDOM:', pointerInDOM, 'transform:', transform, 'visibility:', visibility, 'opacity:', opacity);
    
    // CRITICAL: Check if pointer exists before drawing, recreate if vanished
    // FIX: Check regardless of resize flag - pointer can vanish during value changes too
    if (!ensurePointerExists(gauge)) {
        addPointerElement(gauge);
    }
    
    let pointer = gauge.props.pointer as PointerProps;
    
    // Use initialAnimationTriggered flag to handle ResizeObserver firing after prevProps is set
    const isFirstAnimation = !gauge.initialAnimationTriggered?.current;
    
    gauge.pointer.current.context = setupContext(gauge, isFirstAnimation);
    const { prevPercent, currentPercent, prevProgress } = gauge.pointer.current.context;
    
    // When resize=true (config change, not value change), draw directly at currentPercent
    // to avoid the pointer jumping from prevPercent to currentPercent
    // EXCEPT on first animation - always start at 0 to avoid flash
    const useCurrentPercent = resize && !isFirstAnimation;
    
    // Initialize pointer for all types except Grafana (which uses arc fill by default)
    // For Grafana, only show pointer if user explicitly configured pointer props
    const isGrafana = gauge.props.type == GaugeType.Grafana;
    // Check if user explicitly provided pointer config (not just defaults)
    const userExplicitlyConfiguredPointer = gauge.originalProps?.pointer !== undefined;
    const showPointerForGrafana = isGrafana && userExplicitlyConfiguredPointer && !pointer.hide;
    
    // Only init pointer on first animation OR on resize when animation is enabled
    // When animation is disabled and not first render, skip init and just update position
    const shouldInitPointer = isFirstAnimation || (resize && pointer.animate !== false);
    
    // DEBUG: Log initPointer decision
    const pointerChildCount = gauge.pointer.current?.element?.selectAll('*').size() ?? 0;
    //console.debug('[drawPointer] shouldInitPointer:', shouldInitPointer, 'isFirstAnimation:', isFirstAnimation, 'resize:', resize, 'isGrafana:', isGrafana, 'showPointerForGrafana:', showPointerForGrafana, 'pointerChildCount:', pointerChildCount);
    
    if (shouldInitPointer && (!isGrafana || showPointerForGrafana)) {
        //console.debug('[drawPointer] Calling initPointer...');
        initPointer(gauge, useCurrentPercent);
        const afterInitCount = gauge.pointer.current?.element?.selectAll('*').size() ?? 0;
        //console.debug('[drawPointer] After initPointer - childCount:', afterInitCount);
    }
    
    let shouldAnimate = (!resize || isFirstAnimation) && pointer.animate;
    if (shouldAnimate) {
        // Mark that initial animation has been triggered to prevent ResizeObserver from restarting
        if (gauge.initialAnimationTriggered) {
            gauge.initialAnimationTriggered.current = true;
        }
        // Mark animation as in progress
        if (gauge.animationInProgress) {
            gauge.animationInProgress.current = true;
        }
        
        // For Grafana type without pointer, animate the doughnut (arc fill animation)
        // For other types or Grafana with pointer, animate the pointer element
        const animationTarget = (isGrafana && !showPointerForGrafana)
            ? gauge.doughnut.current 
            : gauge.pointer.current.element;
        
        // FPS limiting - calculate minimum time between frames
        const maxFps = pointer.maxFps ?? 60;
        const minFrameTime = maxFps > 0 ? 1000 / maxFps : 0;
        let lastFrameTime = 0;
        
        animationTarget
            .transition()
            .delay(pointer.animationDelay)
            .ease(pointer.elastic ? easeElastic : easeExpOut)
            .duration(pointer.animationDuration)
            .tween("progress", () => {
                const currentInterpolatedPercent = interpolateNumber(prevPercent, currentPercent);
                return function (percentOfPercent: number) {
                    // FPS limiting - skip frame if not enough time has passed
                    const now = performance.now();
                    if (minFrameTime > 0 && (now - lastFrameTime) < minFrameTime) {
                        // Skip this frame, but still update on final frame
                        if (percentOfPercent < 0.99) return;
                    }
                    lastFrameTime = now;
                    
                    const progress = currentInterpolatedPercent(percentOfPercent);
                    if (isProgressValid(progress, prevProgress, gauge)) {
                        // Always update Grafana arc fill
                        if (isGrafana) {
                            arcHooks.updateGrafanaArc(gauge, progress);
                        }
                        // Update pointer if not Grafana, or if Grafana with pointer shown
                        if (!isGrafana || showPointerForGrafana) {
                            updatePointer(progress, gauge);
                        }
                        // Update value label in real-time if animateValue is enabled
                        if (gauge.props.labels?.valueLabel?.animateValue) {
                            const minValue = gauge.props.minValue as number;
                            const maxValue = gauge.props.maxValue as number;
                            const currentValue = minValue + progress * (maxValue - minValue);
                            labelsHooks.updateValueLabelText(gauge, currentValue);
                        }
                    }
                    gauge.pointer.current.context.prevProgress = progress;
                };
            })
            .on("end", () => {
                // Mark animation as complete
                if (gauge.animationInProgress) {
                    gauge.animationInProgress.current = false;
                }
                // DISABLED: Don't trigger resize after animation - ResizeObserver handles real resizes
                // This prevents flicker when animation completes
                // if (gauge.pendingResize?.current) {
                //     gauge.pendingResize.current = false;
                //     // Use requestAnimationFrame to avoid blocking
                //     requestAnimationFrame(() => {
                //         // Import dynamically to avoid circular dependency
                //         const chartHooks = require('./chart');
                //         chartHooks.renderChart(gauge, true);
                //     });
                // }
            });
    } else {
        // Mark initial animation as triggered even when animation is disabled
        // so subsequent updates know it's not the first render
        if (isFirstAnimation && gauge.initialAnimationTriggered) {
            gauge.initialAnimationTriggered.current = true;
        }
        // For Grafana, always update the arc fill
        if (isGrafana) {
            arcHooks.updateGrafanaArc(gauge, currentPercent);
        }
        // Update pointer if not Grafana, or if Grafana with pointer shown
        if (!isGrafana || showPointerForGrafana) {
            updatePointer(currentPercent, gauge);
        }
    }
};
export const setupContext = (gauge: Gauge, isFirstAnimation: boolean = false): PointerContext => {
    const { value } = gauge.props;
    let pointer = gauge.props.pointer as PointerProps;
    let pointerLength = pointer.length as number;
    let minValue = gauge.props.minValue as number;
    let maxValue = gauge.props.maxValue as number;
    const { pointerPath } = gauge.pointer.current.context;
    var pointerRadius = getPointerRadius(gauge)
    let length = pointer.type == PointerType.Needle ? pointerLength : 0.2;
    let typesWithPath = [PointerType.Needle, PointerType.Arrow];
    
    // Handle prevValue properly - use nullish coalescing to allow 0 values
    // CRITICAL: On first animation, always use minValue so pointer animates from start
    // This fixes the issue where prevProps.current.value is already set to current value
    // before the ResizeObserver fires, causing no animation on first load
    const prevValue = isFirstAnimation ? minValue : (gauge.prevProps?.current.value ?? minValue);
    
    let pointerContext: PointerContext = {
        centerPoint: [0, -pointerRadius / 2],
        pointerRadius: getPointerRadius(gauge),
        pathLength: gauge.dimensions.current.outerRadius * length,
        currentPercent: utils.calculatePercentage(minValue, maxValue, value as number),
        prevPercent: utils.calculatePercentage(minValue, maxValue, prevValue),
        prevProgress: 0,
        pathStr: "",
        shouldDrawPath: typesWithPath.includes(pointer.type as PointerType),
        prevColor: ""
    }
    return pointerContext;
}
const initPointer = (gauge: Gauge, useCurrentPercent: boolean = false) => {
    let value = gauge.props.value as number;
    let pointer = gauge.props.pointer as PointerProps;
    const { shouldDrawPath, centerPoint, pointerRadius, pathStr, currentPercent, prevPercent, pathLength } = gauge.pointer.current.context;
    
    // Get the initial color based on current value - this makes pointer color match arc by default
    const initialColor = pointer.color || arcHooks.getColorByPercentage(currentPercent, gauge);
    
    // Use currentPercent when reinitializing due to config changes (not value changes)
    // This prevents the pointer from jumping from old value to new value
    // Note: Use nullish coalescing (??) instead of || to handle prevPercent=0 correctly
    const startPercent = useCurrentPercent ? currentPercent : (prevPercent ?? 0);
    
    if(shouldDrawPath){
        gauge.pointer.current.context.pathStr = calculatePointerPath(gauge, startPercent);
        const pathElement = gauge.pointer.current.element.append("path")
            .attr("d", gauge.pointer.current.context.pathStr)
            .attr("fill", initialColor);
        
        // Add stroke/border if configured
        const strokeWidth = pointer.strokeWidth || 0;
        if (strokeWidth > 0) {
            const strokeColor = pointer.strokeColor || 'rgba(255, 255, 255, 0.8)';
            pathElement
                .attr("stroke", strokeColor)
                .attr("stroke-width", strokeWidth)
                .attr("stroke-linejoin", "round");
        }
        
        gauge.pointer.current.path = pathElement;
        
        // Add grab handle at pointer tip if onValueChange is provided and not hidden
        // Note: The handle will be raised to top after all elements are rendered in drawPointer
        if (gauge.props.onValueChange && !pointer.hideGrabHandle) {
            const tipPosition = calculatePointerTipPosition(gauge, startPercent);
            const handleRadius = Math.max(6, pointerRadius * 0.8);
            // Append to the main g element (not pointer element) so it renders on top of everything
            gauge.g.current
                .append("circle")
                .attr("class", "pointer-grab-handle")
                .attr("cx", tipPosition.x)
                .attr("cy", tipPosition.y)
                .attr("r", handleRadius)
                .attr("fill", "rgba(255, 255, 255, 0.3)")
                .attr("stroke", "#fff")
                .attr("stroke-width", 2)
                .style("cursor", "grab");
        }
    }
    //Add a circle at the center (base of pointer)
    if (pointer.type == PointerType.Needle) {
        const needleBaseCircle = gauge.pointer.current.element
            .append("circle")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", pointerRadius)
            .attr("fill", pointer.baseColor || initialColor);
        
        // Add stroke to needle base circle if configured
        const strokeWidth = pointer.strokeWidth || 0;
        if (strokeWidth > 0) {
            const strokeColor = pointer.strokeColor || 'rgba(255, 255, 255, 0.8)';
            needleBaseCircle
                .attr("stroke", strokeColor)
                .attr("stroke-width", strokeWidth);
        }
    } else if (pointer.type == PointerType.Blob) {
        // For blob, stroke color matches arc color by default, or use custom strokeColor
        const arcColor = arcHooks.getColorByPercentage(currentPercent, gauge);
        const strokeColor = pointer.strokeColor || arcColor;
        const strokeWidth = pointer.strokeWidth !== undefined ? pointer.strokeWidth : 8;
        // Blob circle centered at (0,0) so translation places it exactly on target
        gauge.pointer.current.element
            .append("circle")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", pointerRadius)
            .attr("fill", pointer.baseColor)
            .attr("stroke", strokeColor)
            .attr("stroke-width", strokeWidth * pointerRadius / 10);
        gauge.pointer.current.context.prevColor = arcColor;
        
        // For blob, the blob itself is the grab handle - just add cursor style
        if (gauge.props.onValueChange) {
            gauge.pointer.current.element.select("circle").style("cursor", "grab");
        }
    }
    //Translate the pointer starting point of the arc
    setPointerPosition(pointerRadius, startPercent, gauge);
}
const updatePointer = (percentage: number, gauge: Gauge) => {
    let pointer = gauge.props.pointer as PointerProps;
    const { pointerRadius, shouldDrawPath, prevColor } = gauge.pointer.current.context;
    setPointerPosition(pointerRadius, percentage, gauge);
    if(shouldDrawPath) {
        gauge.pointer.current.path.attr("d", calculatePointerPath(gauge, percentage));
        
        // Update grab handle position if it exists (grab handle is on g.current, not pointer element)
        const grabHandle = gauge.g.current.select(".pointer-grab-handle");
        if (!grabHandle.empty()) {
            const tipPosition = calculatePointerTipPosition(gauge, percentage);
            grabHandle.attr("cx", tipPosition.x).attr("cy", tipPosition.y);
        }
    }
    // Update arrow color - use fixed color if set, otherwise match arc color
    if(pointer.type == PointerType.Arrow && gauge.pointer.current.path) {
        let currentColor = pointer.color || arcHooks.getColorByPercentage(percentage, gauge);
        gauge.pointer.current.path.attr("fill", currentColor);
    }
    // Update needle color as well
    if(pointer.type == PointerType.Needle && shouldDrawPath && gauge.pointer.current.path) {
        let currentColor = pointer.color || arcHooks.getColorByPercentage(percentage, gauge);
        gauge.pointer.current.path.attr("fill", currentColor);
    }
    if(pointer.type == PointerType.Blob) {
        // Use getColorByPercentage which handles both gradient and non-gradient modes
        let arcColor = arcHooks.getColorByPercentage(percentage, gauge);
        // Use custom strokeColor if provided, otherwise match arc color
        let currentColor = pointer.strokeColor || arcColor;
        let shouldChangeColor = arcColor != prevColor;
        if(shouldChangeColor && !pointer.strokeColor) {
            gauge.pointer.current.element.select("circle").attr("stroke", currentColor);
        }
        const strokeWidth = pointer.strokeWidth !== undefined ? pointer.strokeWidth : 8;
        gauge.pointer.current.element.select("circle").attr("stroke-width", strokeWidth * pointerRadius / 10);
        gauge.pointer.current.context.prevColor = arcColor;
    }
}
const setPointerPosition = (pointerRadius: number, progress: number, gauge: Gauge) => {
    let pointer = gauge.props.pointer as PointerProps;
    let pointerType = pointer.type as string;
    const { dimensions } = gauge;
    let value = utils.getCurrentGaugeValueByPercentage(progress, gauge);
    let pointers: { [key: string]: () => void } = {
        [PointerType.Needle]: () => {
            // Set needle position to center (origin, since g is already centered)
            translatePointer(0, 0, gauge);
        },
        [PointerType.Arrow]: () => {
            // Position arrow based on arrowOffset (0 = center, 1 = outer edge of arc)
            const arrowOffset = pointer.arrowOffset ?? 0.72;
            const innerR = gauge.dimensions.current.innerRadius;
            const outerR = gauge.dimensions.current.outerRadius;
            // Arrow offset is relative to inner radius toward outer
            const targetRadius = innerR * arrowOffset;
            
            // Use the SAME angles as the arc drawing
            const { startAngle, endAngle } = getEffectiveAngles(gauge);
            const angle = startAngle + progress * (endAngle - startAngle);
            
            // Convert d3 angle to x,y coordinates
            const x = targetRadius * Math.sin(angle);
            const y = -targetRadius * Math.cos(angle);
            
            translatePointer(x, y, gauge);
        },
        [PointerType.Blob]: () => {
            // Position blob based on blobOffset (0 = inner edge, 0.5 = center, 1 = outer edge)
            const blobOffset = pointer.blobOffset ?? 0.5;
            const innerR = gauge.dimensions.current.innerRadius;
            const outerR = gauge.dimensions.current.outerRadius;
            // Interpolate between inner and outer radius based on offset
            const targetRadius = innerR + (outerR - innerR) * blobOffset;
            
            // Use the SAME angles as the arc drawing
            // These are d3 angles: 0 at top, positive clockwise
            const { startAngle, endAngle } = getEffectiveAngles(gauge);
            const angle = startAngle + progress * (endAngle - startAngle);
            
            // Convert d3 angle to x,y coordinates
            // In d3 convention: 0 is at top, angles go clockwise
            // x = radius * sin(angle), y = -radius * cos(angle)
            const x = targetRadius * Math.sin(angle);
            const y = -targetRadius * Math.cos(angle);
            
            translatePointer(x, y, gauge);
        },
    };
    return pointers[pointerType]();
}

/**
 * Validates if progress update should trigger a DOM update.
 * Uses animationThreshold from pointer props to control update frequency.
 */
const isProgressValid = (currentPercent: number, prevPercent: number, gauge: Gauge) => {
    const pointer = gauge.props.pointer as PointerProps;
    // Use configurable threshold (default 0.001 for backward compatibility)
    const threshold = pointer.animationThreshold ?? 0.001;
    
    //Avoid unnecessary re-rendering (when progress is too small) but allow the pointer to reach the final value
    let overFlow = currentPercent > 1 || currentPercent < 0;
    let tooSmallValue = Math.abs(currentPercent - prevPercent) < threshold;
    let sameValueAsBefore = currentPercent == prevPercent;
    return !tooSmallValue && !sameValueAsBefore && !overFlow;
}

const calculatePointerPath = (gauge: Gauge, percent: number) => {
    const { pointerRadius, pathLength } = gauge.pointer.current.context;
    // Use actual angles from gauge dimensions (supports custom angles)
    // D3 angle convention: 0 = top (12 o'clock), positive = clockwise
    const { startAngle, endAngle } = getEffectiveAngles(gauge);
    const d3Angle = startAngle + percent * (endAngle - startAngle);
    
    // Calculate needle tip position using D3 angle convention (same as arc)
    // x = radius * sin(angle), y = -radius * cos(angle)
    const tipX = pathLength * Math.sin(d3Angle);
    const tipY = -pathLength * Math.cos(d3Angle);
    
    // Calculate base points perpendicular to the needle direction
    // The base is at the center (0, 0), with points spread perpendicular to the needle
    const perpAngle = d3Angle + Math.PI / 2; // perpendicular angle
    const baseOffset = pointerRadius;
    
    const leftX = baseOffset * Math.sin(perpAngle);
    const leftY = -baseOffset * Math.cos(perpAngle);
    
    const rightX = -baseOffset * Math.sin(perpAngle);
    const rightY = baseOffset * Math.cos(perpAngle);

    var pathStr = `M ${leftX} ${leftY} L ${tipX} ${tipY} L ${rightX} ${rightY}`;
    return pathStr;
};

/**
 * Calculate the position of the pointer tip for the grab handle
 */
const calculatePointerTipPosition = (gauge: Gauge, percent: number): { x: number, y: number } => {
    const pointer = gauge.props.pointer as PointerProps;
    const pointerType = pointer.type as PointerType;
    const { pathLength } = gauge.pointer.current.context;
    const innerR = gauge.dimensions.current.innerRadius;
    
    // Use the SAME angles as the arc drawing (D3 convention)
    const { startAngle, endAngle } = getEffectiveAngles(gauge);
    const d3Angle = startAngle + percent * (endAngle - startAngle);
    
    // For Arrow type, calculate position based on arrow offset + local tip
    if (pointerType === PointerType.Arrow) {
        const arrowOffset = pointer.arrowOffset ?? 0.72;
        const targetRadius = innerR * arrowOffset;
        
        // Arrow translation position
        const transX = targetRadius * Math.sin(d3Angle);
        const transY = -targetRadius * Math.cos(d3Angle);
        
        // Local tip position (arrow path tip)
        const localTipX = pathLength * Math.sin(d3Angle);
        const localTipY = -pathLength * Math.cos(d3Angle);
        
        return {
            x: transX + localTipX,
            y: transY + localTipY,
        };
    }
    
    // For Needle type, tip is at pathLength from center along the angle
    return {
        x: pathLength * Math.sin(d3Angle),
        y: -pathLength * Math.cos(d3Angle),
    };
};

const getPointerRadius = (gauge: Gauge) => {
    let pointer = gauge.props.pointer as PointerProps;
    let pointerWidth = pointer.width as number;
    return pointerWidth * (gauge.dimensions.current.width / 500);
}

export const translatePointer = (x: number, y: number, gauge: Gauge) => gauge.pointer.current.element.attr("transform", "translate(" + x + ", " + y + ")");
export const addPointerElement = (gauge: Gauge) => gauge.pointer.current.element = gauge.g.current.append("g").attr("class", "pointer");
export const clearPointerElement = (gauge: Gauge) => {
    // Safety check - element might not exist in multi-pointer mode
    if (gauge.pointer.current?.element) {
        gauge.pointer.current.element.selectAll("*").remove();
    }
    // Also remove grab handle which is on g.current
    gauge.g.current?.select(".pointer-grab-handle").remove();
};

/**
 * Calculate value from mouse/touch position on the gauge arc
 * @param gauge The gauge instance
 * @param clientX Mouse/touch X coordinate
 * @param clientY Mouse/touch Y coordinate
 * @returns The calculated value based on position
 */
export const getValueFromPosition = (gauge: Gauge, clientX: number, clientY: number): number => {
    const svgElement = gauge.svg.current.node();
    if (!svgElement) return gauge.props.value as number;
    
    const rect = svgElement.getBoundingClientRect();
    const viewBoxAttr = gauge.svg.current.attr("viewBox");
    if (!viewBoxAttr) return gauge.props.value as number;
    
    const viewBox = viewBoxAttr.split(" ").map(Number);
    // viewBox = [x, y, width, height]
    
    // Convert client coordinates to SVG viewBox coordinates
    const scaleX = viewBox[2] / rect.width;
    const scaleY = viewBox[3] / rect.height;
    
    const svgX = (clientX - rect.left) * scaleX + viewBox[0];
    const svgY = (clientY - rect.top) * scaleY + viewBox[1];
    
    // Get gauge center from the current layout
    // The g element is translated to gaugeCenter, so that's our pivot point
    const layout = gauge.prevGSize.current;
    if (!layout?.gaugeCenter) return gauge.props.value as number;
    
    const centerX = layout.gaugeCenter.x;
    const centerY = layout.gaugeCenter.y;
    
    // Calculate vector from center to mouse position
    const dx = svgX - centerX;
    const dy = svgY - centerY;
    
    // D3 arc uses angles where:
    //   0 = TOP (12 o'clock), positive angles go CLOCKWISE
    //   -PI/2 = LEFT (9 o'clock)
    //   PI/2 = RIGHT (3 o'clock)
    //   PI or -PI = BOTTOM (6 o'clock)
    //
    // To convert from mouse (dx, dy) to D3 arc angle:
    // atan2(dx, -dy) gives angle from top, clockwise positive
    
    let angle = Math.atan2(dx, -dy);
    
    // Get the actual gauge angles
    const { startAngle, endAngle } = getEffectiveAngles(gauge);
    
    // Calculate the dead zone (where there's no arc)
    // The arc goes from startAngle to endAngle
    // The dead zone is from endAngle to startAngle (going the long way around)
    const arcSpan = endAngle - startAngle;
    const deadZoneSpan = 2 * Math.PI - arcSpan;
    const deadZoneCenter = endAngle + deadZoneSpan / 2;
    
    // Normalize angle to be relative to deadZoneCenter for easier comparison
    let relativeAngle = angle - deadZoneCenter;
    // Normalize to -PI to PI range
    while (relativeAngle > Math.PI) relativeAngle -= 2 * Math.PI;
    while (relativeAngle < -Math.PI) relativeAngle += 2 * Math.PI;
    
    // If in dead zone (within deadZoneSpan/2 of deadZoneCenter), snap to nearest edge
    if (Math.abs(relativeAngle) < deadZoneSpan / 2) {
        // Snap to nearest valid edge
        angle = relativeAngle < 0 ? endAngle : startAngle;
    }
    
    // Clamp angle to valid range
    angle = Math.max(startAngle, Math.min(endAngle, angle));
    
    // Calculate percentage (0 to 1)
    const percentage = (angle - startAngle) / (endAngle - startAngle);
    
    // Convert percentage to value
    const minValue = gauge.props.minValue as number;
    const maxValue = gauge.props.maxValue as number;
    const value = minValue + percentage * (maxValue - minValue);
    
    // Clamp value to min/max
    return Math.max(minValue, Math.min(maxValue, value));
};

/**
 * Set up drag behavior for the pointer element
 * This allows users to grab and drag the pointer to set values
 */
export const setupPointerDrag = (gauge: Gauge) => {
    const onValueChange = gauge.props.onValueChange;
    if (!onValueChange) return; // Only enable drag if callback is provided
    
    const pointerElement = gauge.pointer.current.element;
    if (!pointerElement) return;
    
    // Also make the arc draggable for easier interaction
    const arcElement = gauge.doughnut.current;
    
    // Track if we've actually moved during drag (to distinguish from click)
    let hasMoved = false;
    let startX = 0;
    let startY = 0;
    const moveThreshold = 3; // Minimum pixels to move before considering it a drag
    
    const handleDragStart = (event: any) => {
        // Stop any ongoing animations
        pointerElement.interrupt();
        if (arcElement) arcElement.interrupt();
        
        // Record start position
        hasMoved = false;
        startX = event.sourceEvent.clientX;
        startY = event.sourceEvent.clientY;
    };
    
    const handleDrag = (event: any) => {
        const clientX = event.sourceEvent.clientX;
        const clientY = event.sourceEvent.clientY;
        
        // Check if we've moved enough to consider it a drag
        const dx = Math.abs(clientX - startX);
        const dy = Math.abs(clientY - startY);
        
        if (dx > moveThreshold || dy > moveThreshold) {
            hasMoved = true;
        }
        
        // Only update value if we've actually moved
        if (hasMoved) {
            const value = getValueFromPosition(gauge, clientX, clientY);
            onValueChange(value);
        }
    };
    
    const dragBehavior = drag()
        .on("start", handleDragStart)
        .on("drag", handleDrag);
    
    // Apply drag to pointer
    pointerElement.call(dragBehavior);
    pointerElement.style("cursor", "grab");
    
    // Apply drag to grab handle (which is on g.current)
    const grabHandle = gauge.g.current.select(".pointer-grab-handle");
    if (!grabHandle.empty()) {
        grabHandle.call(dragBehavior);
    }
    
    // Also apply drag to the arc for easier interaction
    if (arcElement) {
        arcElement.call(dragBehavior);
        arcElement.style("cursor", "pointer");
    }
};

/**
 * Set up click-to-set behavior on the arc
 * Allows users to click anywhere on the arc to set the value
 */
export const setupArcClick = (gauge: Gauge) => {
    // Note: Click behavior is now handled separately from drag
    // The arc click will set value on single click (no drag)
    const onValueChange = gauge.props.onValueChange;
    if (!onValueChange) return;
    
    const arcElement = gauge.doughnut.current;
    if (!arcElement) return;
    
    // Use mouseup instead of click to avoid conflict with drag
    // Only fire if it was a quick click (not a drag)
    let mouseDownTime = 0;
    const clickThreshold = 200; // ms - if mouseup happens within this time, treat as click
    
    arcElement.on("mousedown.click", () => {
        mouseDownTime = Date.now();
    });
    
    arcElement.on("mouseup.click", (event: any) => {
        const elapsed = Date.now() - mouseDownTime;
        if (elapsed < clickThreshold) {
            const value = getValueFromPosition(gauge, event.clientX, event.clientY);
            onValueChange(value);
        }
    });
};

// ============================================================================
// MULTI-POINTER SUPPORT
// ============================================================================

/**
 * Check if gauge is in multi-pointer mode
 */
export const isMultiPointerMode = (gauge: Gauge): boolean => {
    return Array.isArray(gauge.props.pointers) && gauge.props.pointers.length > 0;
};

/**
 * Validate that rendered pointer count matches expected count from props
 * Logs warning and corrects if mismatch detected
 */
export const validatePointerCount = (gauge: Gauge): { valid: boolean; expected: number; actual: number } => {
    const expectedCount = gauge.props.pointers?.length ?? (gauge.props.pointer?.hide ? 0 : 1);
    const renderedMultiPointers = gauge.g.current?.selectAll('.multi-pointer').size() ?? 0;
    const renderedSinglePointer = gauge.g.current?.selectAll('.pointer').size() ?? 0;
    const actualCount = gauge.props.pointers?.length ? renderedMultiPointers : renderedSinglePointer;
    
    if (actualCount !== expectedCount) {
        console.warn(`[GaugeComponent] Pointer count mismatch detected! Expected: ${expectedCount}, Rendered: ${actualCount}. Auto-correcting...`);
        return { valid: false, expected: expectedCount, actual: actualCount };
    }
    return { valid: true, expected: expectedCount, actual: actualCount };
};

/**
 * Draw all pointers in multi-pointer mode
 */
export const drawMultiPointers = (gauge: Gauge, resize: boolean = false) => {
    const pointers = gauge.props.pointers;
    if (!pointers || pointers.length === 0) return;
    
    const isGrafana = gauge.props.type === GaugeType.Grafana;
    const minValue = gauge.props.minValue as number;
    const maxValue = gauge.props.maxValue as number;
    
    // Initialize multiPointers array if needed
    if (!gauge.multiPointers?.current) {
        gauge.multiPointers!.current = [];
    }
    if (!gauge.multiPointerAnimationTriggered?.current) {
        gauge.multiPointerAnimationTriggered!.current = [];
    }
    
    // VALIDATION: Check for stale pointers and clean up
    const currentRenderedCount = gauge.g.current?.selectAll('.multi-pointer').size() ?? 0;
    if (currentRenderedCount > pointers.length) {
        console.warn(`[GaugeComponent] Stale multi-pointers detected! Rendered: ${currentRenderedCount}, Expected: ${pointers.length}. Cleaning up...`);
        // Remove excess pointer elements
        gauge.g.current?.selectAll('.multi-pointer').each(function(this: any, d: any, i: number) {
            if (i >= pointers.length) {
                select(this).remove();
            }
        });
        // Trim the multiPointers array
        if (gauge.multiPointers?.current) {
            gauge.multiPointers.current = gauge.multiPointers.current.slice(0, pointers.length);
        }
    }
    
    // Ensure we have the right number of animation triggered flags
    while (gauge.multiPointerAnimationTriggered!.current.length < pointers.length) {
        gauge.multiPointerAnimationTriggered!.current.push(false);
    }
    // Trim excess flags
    if (gauge.multiPointerAnimationTriggered!.current.length > pointers.length) {
        gauge.multiPointerAnimationTriggered!.current = gauge.multiPointerAnimationTriggered!.current.slice(0, pointers.length);
    }
    
    // Draw each pointer
    pointers.forEach((pointerConfig, index) => {
        drawSingleMultiPointer(gauge, pointerConfig, index, resize, minValue, maxValue, isGrafana);
    });
    
    // For Grafana, use primary (first) pointer value for arc fill
    if (isGrafana && pointers.length > 0) {
        const primaryPercent = utils.calculatePercentage(minValue, maxValue, pointers[0].value);
        arcHooks.updateGrafanaArc(gauge, primaryPercent);
    }
};

/**
 * Draw a single pointer in multi-pointer mode
 */
const drawSingleMultiPointer = (
    gauge: Gauge,
    pointerConfig: PointerWithValue,
    index: number,
    resize: boolean,
    minValue: number,
    maxValue: number,
    isGrafana: boolean
) => {
    const { defaultPointer } = require("../types/Pointer");
    
    // Merge with defaults
    const pointer: PointerWithValue = { ...defaultPointer, ...pointerConfig };
    if (pointer.hide) return;
    
    const currentPercent = utils.calculatePercentage(minValue, maxValue, pointer.value);
    const isFirstAnimation = !gauge.multiPointerAnimationTriggered?.current[index];
    
    // Get or create pointer ref
    let pointerRef = gauge.multiPointers!.current[index];
    if (!pointerRef) {
        pointerRef = {
            element: null,
            path: null,
            context: { ...defaultPointerContext },
            index,
            animationInProgress: false
        };
        gauge.multiPointers!.current[index] = pointerRef;
    }
    
    // Check if element actually exists in DOM (might have been orphaned)
    const elementExistsInDOM = pointerRef.element && !gauge.g.current?.select(`.multi-pointer-${index}`).empty();
    
    // Setup context for this pointer
    const pointerRadius = getPointerRadiusForConfig(gauge, pointer);
    const length = pointer.type === PointerType.Needle ? (pointer.length as number) : 0.2;
    const typesWithPath = [PointerType.Needle, PointerType.Arrow];
    
    // Get previous value from prevProps if available
    const prevPointers = gauge.prevProps?.current?.pointers;
    const prevValue = prevPointers?.[index]?.value ?? minValue;
    const prevPercent = utils.calculatePercentage(minValue, maxValue, prevValue);
    
    pointerRef.context = {
        centerPoint: [0, -pointerRadius / 2],
        pointerRadius,
        pathLength: gauge.dimensions.current.outerRadius * length,
        currentPercent,
        prevPercent,
        prevProgress: 0,
        pathStr: "",
        shouldDrawPath: typesWithPath.includes(pointer.type as PointerType),
        prevColor: pointerRef.context?.prevColor || ""
    };
    
    const useCurrentPercent = resize && !isFirstAnimation;
    // Only init pointer if it's first animation OR resize with animation enabled
    // BUT skip if element already exists in DOM (prevents duplicates on value-only changes)
    const shouldInitPointer = (isFirstAnimation || (resize && pointer.animate !== false)) && !elementExistsInDOM;
    
    // Create or update pointer element
    if (shouldInitPointer) {
        initMultiPointer(gauge, pointerRef, pointer, useCurrentPercent, index);
    }
    
    const shouldAnimate = (!resize || isFirstAnimation) && pointer.animate !== false;
    
    if (shouldAnimate) {
        // Mark animation triggered
        if (gauge.multiPointerAnimationTriggered) {
            gauge.multiPointerAnimationTriggered.current[index] = true;
        }
        pointerRef.animationInProgress = true;
        
        animateMultiPointer(gauge, pointerRef, pointer, index);
    } else {
        // Mark animation triggered even when animation is disabled
        if (isFirstAnimation && gauge.multiPointerAnimationTriggered) {
            gauge.multiPointerAnimationTriggered.current[index] = true;
        }
        // Just update position without animation
        updateMultiPointer(pointerRef, pointer, currentPercent, gauge, index);
    }
};

/**
 * Initialize a single pointer element in multi-pointer mode
 */
const initMultiPointer = (
    gauge: Gauge,
    pointerRef: MultiPointerRef,
    pointer: PointerWithValue,
    useCurrentPercent: boolean,
    index: number
) => {
    const { shouldDrawPath, centerPoint, pointerRadius, pathLength, currentPercent, prevPercent } = pointerRef.context;
    const startPercent = useCurrentPercent ? currentPercent : (prevPercent ?? 0);
    
    // Get color - use pointer color or arc color
    const initialColor = pointer.color || arcHooks.getColorByPercentage(currentPercent, gauge);
    
    // Remove existing element if any (from ref)
    if (pointerRef.element) {
        pointerRef.element.remove();
    }
    
    // CRITICAL: Also remove any orphaned DOM elements with same class to prevent duplicates
    // This handles cases where ref was lost but DOM element still exists
    gauge.g.current?.selectAll(`.multi-pointer-${index}`).remove();
    
    // Create new pointer group
    pointerRef.element = gauge.g.current
        .append("g")
        .attr("class", `multi-pointer multi-pointer-${index}`);
    
    if (shouldDrawPath) {
        pointerRef.context.pathStr = calculatePointerPathForConfig(gauge, pointerRef, pointer, startPercent);
        const pathElement = pointerRef.element.append("path")
            .attr("d", pointerRef.context.pathStr)
            .attr("fill", initialColor);
        
        // Add stroke if configured
        const strokeWidth = pointer.strokeWidth || 0;
        if (strokeWidth > 0) {
            const strokeColor = pointer.strokeColor || 'rgba(255, 255, 255, 0.8)';
            pathElement
                .attr("stroke", strokeColor)
                .attr("stroke-width", strokeWidth)
                .attr("stroke-linejoin", "round");
        }
        
        pointerRef.path = pathElement;
        
        // Add grab handle if drag is enabled
        if (gauge.props.onPointerChange && !pointer.hideGrabHandle) {
            const tipPosition = calculatePointerTipPositionForConfig(gauge, pointerRef, pointer, startPercent);
            const handleRadius = Math.max(6, pointerRadius * 0.8);
            pointerRef.element
                .append("circle")
                .attr("class", `pointer-grab-handle pointer-grab-handle-${index}`)
                .attr("cx", tipPosition.x)
                .attr("cy", tipPosition.y)
                .attr("r", handleRadius)
                .attr("fill", "rgba(255, 255, 255, 0.3)")
                .attr("stroke", initialColor)
                .attr("stroke-width", 2)
                .style("cursor", "grab");
        }
    }
    
    // Add base circle for needle type
    if (pointer.type === PointerType.Needle) {
        const needleBaseCircle = pointerRef.element
            .append("circle")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", pointerRadius)
            .attr("fill", pointer.baseColor || initialColor);
        
        const strokeWidth = pointer.strokeWidth || 0;
        if (strokeWidth > 0) {
            const strokeColor = pointer.strokeColor || 'rgba(255, 255, 255, 0.8)';
            needleBaseCircle
                .attr("stroke", strokeColor)
                .attr("stroke-width", strokeWidth);
        }
    } else if (pointer.type === PointerType.Blob) {
        const arcColor = arcHooks.getColorByPercentage(currentPercent, gauge);
        const strokeColor = pointer.strokeColor || arcColor;
        const strokeWidth = pointer.strokeWidth !== undefined ? pointer.strokeWidth : 8;
        
        pointerRef.element
            .append("circle")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", pointerRadius)
            .attr("fill", pointer.baseColor || initialColor)
            .attr("stroke", strokeColor)
            .attr("stroke-width", strokeWidth * pointerRadius / 10);
        
        pointerRef.context.prevColor = arcColor;
        
        if (gauge.props.onPointerChange) {
            pointerRef.element.select("circle").style("cursor", "grab");
        }
    }
    
    // Set initial position
    setMultiPointerPosition(pointerRef, pointer, pointerRadius, startPercent, gauge);
    
    // Setup drag if enabled
    if (gauge.props.onPointerChange) {
        setupMultiPointerDrag(gauge, pointerRef, pointer, index);
    }
};

/**
 * Animate a single pointer in multi-pointer mode
 */
const animateMultiPointer = (
    gauge: Gauge,
    pointerRef: MultiPointerRef,
    pointer: PointerWithValue,
    index: number
) => {
    const { prevPercent, currentPercent, prevProgress } = pointerRef.context;
    
    const maxFps = pointer.maxFps ?? 60;
    const minFrameTime = maxFps > 0 ? 1000 / maxFps : 0;
    let lastFrameTime = 0;
    
    pointerRef.element
        .transition()
        .delay(pointer.animationDelay || 100)
        .ease(pointer.elastic ? easeElastic : easeExpOut)
        .duration(pointer.animationDuration || 3000)
        .tween("progress", () => {
            const currentInterpolatedPercent = interpolateNumber(prevPercent, currentPercent);
            return (percentOfPercent: number) => {
                const now = performance.now();
                if (now - lastFrameTime < minFrameTime) return;
                lastFrameTime = now;
                
                const progress = currentInterpolatedPercent(percentOfPercent);
                const threshold = pointer.animationThreshold ?? 0.001;
                
                if (Math.abs(progress - pointerRef.context.prevProgress) >= threshold || percentOfPercent >= 1) {
                    updateMultiPointer(pointerRef, pointer, progress, gauge, index);
                    pointerRef.context.prevProgress = progress;
                }
            };
        })
        .on("end", () => {
            pointerRef.animationInProgress = false;
            
            // Check if all animations are done
            const allDone = gauge.multiPointers?.current.every(p => !p?.animationInProgress) ?? true;
            // DISABLED: Don't trigger resize after multi-pointer animation completes
            // This prevents flicker when all animations finish
            // if (allDone && gauge.pendingResize?.current) {
            //     gauge.pendingResize.current = false;
            //     requestAnimationFrame(() => {
            //         const chartHooks = require('./chart');
            //         chartHooks.renderChart(gauge, true);
            //     });
            // }
        });
};

/**
 * Update a single pointer position in multi-pointer mode
 */
const updateMultiPointer = (
    pointerRef: MultiPointerRef,
    pointer: PointerWithValue,
    percentage: number,
    gauge: Gauge,
    index: number
) => {
    const { pointerRadius, shouldDrawPath, prevColor } = pointerRef.context;
    
    setMultiPointerPosition(pointerRef, pointer, pointerRadius, percentage, gauge);
    
    if (shouldDrawPath) {
        pointerRef.context.pathStr = calculatePointerPathForConfig(gauge, pointerRef, pointer, percentage);
        pointerRef.path?.attr("d", pointerRef.context.pathStr);
        
        // Update grab handle position
        const grabHandle = pointerRef.element?.select(`.pointer-grab-handle-${index}`);
        if (grabHandle && !grabHandle.empty()) {
            const tipPosition = calculatePointerTipPositionForConfig(gauge, pointerRef, pointer, percentage);
            grabHandle.attr("cx", tipPosition.x).attr("cy", tipPosition.y);
        }
        
        // Update color if not fixed
        if (!pointer.color) {
            const newColor = arcHooks.getColorByPercentage(percentage, gauge);
            pointerRef.path?.attr("fill", newColor);
            grabHandle?.attr("stroke", newColor);
        }
    }
    
    // Update blob stroke color
    if (pointer.type === PointerType.Blob && !pointer.strokeColor) {
        const newColor = arcHooks.getColorByPercentage(percentage, gauge);
        if (newColor !== prevColor) {
            pointerRef.element?.select("circle").attr("stroke", newColor);
            pointerRef.context.prevColor = newColor;
        }
    }
};

/**
 * Set position for a multi-pointer element
 * Uses the EXACT same positioning logic as single-pointer mode
 */
const setMultiPointerPosition = (
    pointerRef: MultiPointerRef,
    pointer: PointerWithValue,
    pointerRadius: number,
    percent: number,
    gauge: Gauge
) => {
    const { startAngle, endAngle } = getEffectiveAngles(gauge);
    const angle = startAngle + percent * (endAngle - startAngle);
    const innerR = gauge.dimensions.current.innerRadius;
    const outerR = gauge.dimensions.current.outerRadius;
    
    if (pointer.type === PointerType.Blob) {
        // SAME as single pointer: Position blob based on blobOffset (0 = inner edge, 0.5 = center, 1 = outer edge)
        const blobOffset = pointer.blobOffset ?? 0.5;
        const targetRadius = innerR + (outerR - innerR) * blobOffset;
        const x = targetRadius * Math.sin(angle);
        const y = -targetRadius * Math.cos(angle);
        pointerRef.element?.attr("transform", `translate(${x}, ${y})`);
    } else if (pointer.type === PointerType.Arrow) {
        // SAME as single pointer: Arrow offset is relative to inner radius (not interpolated)
        const arrowOffset = pointer.arrowOffset ?? 0.72;
        const targetRadius = innerR * arrowOffset;
        const x = targetRadius * Math.sin(angle);
        const y = -targetRadius * Math.cos(angle);
        pointerRef.element?.attr("transform", `translate(${x}, ${y})`);
    } else {
        // Needle - positioned at center (0, 0)
        pointerRef.element?.attr("transform", `translate(0, 0)`);
    }
};

/**
 * Get pointer radius for a specific pointer config
 * Uses the EXACT same formula as single-pointer mode
 */
const getPointerRadiusForConfig = (gauge: Gauge, pointer: PointerWithValue): number => {
    const pointerWidth = pointer.width ?? 15;
    return pointerWidth * (gauge.dimensions.current.width / 500);
};

/**
 * Calculate pointer path for a specific pointer config
 * Uses the EXACT same logic as single-pointer calculatePointerPath
 */
const calculatePointerPathForConfig = (
    gauge: Gauge,
    pointerRef: MultiPointerRef,
    pointer: PointerWithValue,
    percent: number
): string => {
    const { pointerRadius, pathLength } = pointerRef.context;
    const { startAngle, endAngle } = getEffectiveAngles(gauge);
    const d3Angle = startAngle + percent * (endAngle - startAngle);
    
    // SAME as single pointer calculatePointerPath
    // Calculate needle tip position using D3 angle convention (same as arc)
    const tipX = pathLength * Math.sin(d3Angle);
    const tipY = -pathLength * Math.cos(d3Angle);
    
    // Calculate base points perpendicular to the needle direction
    const perpAngle = d3Angle + Math.PI / 2;
    const baseOffset = pointerRadius;
    
    const leftX = baseOffset * Math.sin(perpAngle);
    const leftY = -baseOffset * Math.cos(perpAngle);
    
    const rightX = -baseOffset * Math.sin(perpAngle);
    const rightY = baseOffset * Math.cos(perpAngle);

    return `M ${leftX} ${leftY} L ${tipX} ${tipY} L ${rightX} ${rightY}`;
};

/**
 * Calculate pointer tip position for a specific pointer config
 * Uses the EXACT same logic as single-pointer calculatePointerTipPosition
 */
const calculatePointerTipPositionForConfig = (
    gauge: Gauge,
    pointerRef: MultiPointerRef,
    pointer: PointerWithValue,
    percent: number
): { x: number; y: number } => {
    const { pathLength } = pointerRef.context;
    const innerR = gauge.dimensions.current.innerRadius;
    const { startAngle, endAngle } = getEffectiveAngles(gauge);
    const d3Angle = startAngle + percent * (endAngle - startAngle);
    
    // For Arrow type, calculate position based on arrow offset + local tip
    if (pointer.type === PointerType.Arrow) {
        const arrowOffset = pointer.arrowOffset ?? 0.72;
        const targetRadius = innerR * arrowOffset;
        
        // Arrow translation position
        const transX = targetRadius * Math.sin(d3Angle);
        const transY = -targetRadius * Math.cos(d3Angle);
        
        // Local tip position (arrow path tip)
        const localTipX = pathLength * Math.sin(d3Angle);
        const localTipY = -pathLength * Math.cos(d3Angle);
        
        return {
            x: transX + localTipX,
            y: transY + localTipY,
        };
    }
    
    // For Needle type, tip is at pathLength from center along the angle
    return {
        x: pathLength * Math.sin(d3Angle),
        y: -pathLength * Math.cos(d3Angle),
    };
};

/**
 * Setup drag behavior for a multi-pointer
 */
const setupMultiPointerDrag = (
    gauge: Gauge,
    pointerRef: MultiPointerRef,
    pointer: PointerWithValue,
    index: number
) => {
    const onPointerChange = gauge.props.onPointerChange;
    if (!onPointerChange) return;
    
    const dragBehavior = drag()
        .on("start", function() {
            select(this).style("cursor", "grabbing");
        })
        .on("drag", (event: any) => {
            const value = getValueFromPosition(gauge, event.sourceEvent.clientX, event.sourceEvent.clientY);
            onPointerChange(index, value);
        })
        .on("end", function() {
            select(this).style("cursor", "grab");
        });
    
    // Apply drag to the pointer element
    pointerRef.element?.call(dragBehavior);
    
    // Apply drag to grab handle
    const grabHandle = pointerRef.element?.select(`.pointer-grab-handle-${index}`);
    if (grabHandle && !grabHandle.empty()) {
        grabHandle.call(dragBehavior);
    }
};

/**
 * Clear all multi-pointer elements
 */
export const clearMultiPointers = (gauge: Gauge) => {
    gauge.g.current?.selectAll(".multi-pointer").remove();
    if (gauge.multiPointers?.current) {
        gauge.multiPointers.current = [];
    }
    if (gauge.multiPointerAnimationTriggered?.current) {
        gauge.multiPointerAnimationTriggered.current = [];
    }
};
