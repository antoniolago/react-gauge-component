import {
    easeElastic,
    easeExpOut,
    interpolateNumber,
    drag,
    select,
} from "d3";
import { PointerContext, PointerProps, PointerType } from "../types/Pointer";
import { getCoordByValue } from "./arc";
import { Gauge } from "../types/Gauge";
import * as utils from "./utils";
import * as arcHooks from "./arc";
import { GaugeType } from "../types/GaugeComponentProps";

export const drawPointer = (gauge: Gauge, resize: boolean = false) => {
    gauge.pointer.current.context = setupContext(gauge);
    const { prevPercent, currentPercent, prevProgress } = gauge.pointer.current.context;
    let pointer = gauge.props.pointer as PointerProps;
    let isFirstTime = gauge.prevProps?.current.value == undefined;
    if ((isFirstTime || resize) && gauge.props.type != GaugeType.Grafana) 
        initPointer(gauge);
    let shouldAnimate = (!resize || isFirstTime) && pointer.animate;
    if (shouldAnimate) {
        // For Grafana type, animate the doughnut (arc fill animation)
        // For other types, animate only the pointer element (not the whole doughnut)
        const animationTarget = gauge.props.type == GaugeType.Grafana 
            ? gauge.doughnut.current 
            : gauge.pointer.current.element;
        
        animationTarget
            .transition()
            .delay(pointer.animationDelay)
            .ease(pointer.elastic ? easeElastic : easeExpOut)
            .duration(pointer.animationDuration)
            .tween("progress", () => {
                const currentInterpolatedPercent = interpolateNumber(prevPercent, currentPercent);
                return function (percentOfPercent: number) {
                    const progress = currentInterpolatedPercent(percentOfPercent);
                    if (isProgressValid(progress, prevProgress, gauge)) {
                        if(gauge.props.type == GaugeType.Grafana){
                            // Use efficient arc update instead of clearing/recreating DOM elements
                            arcHooks.updateGrafanaArc(gauge, progress);
                        } else {
                            updatePointer(progress, gauge);
                        }
                    }
                    gauge.pointer.current.context.prevProgress = progress;
                };
            });
    } else {
        updatePointer(currentPercent, gauge);
    }
};
const setupContext = (gauge: Gauge): PointerContext => {
    const { value } = gauge.props;
    let pointer = gauge.props.pointer as PointerProps;
    let pointerLength = pointer.length as number;
    let minValue = gauge.props.minValue as number;
    let maxValue = gauge.props.maxValue as number;
    const { pointerPath } = gauge.pointer.current.context;
    var pointerRadius = getPointerRadius(gauge)
    let length = pointer.type == PointerType.Needle ? pointerLength : 0.2;
    let typesWithPath = [PointerType.Needle, PointerType.Arrow];
    let pointerContext: PointerContext = {
        centerPoint: [0, -pointerRadius / 2],
        pointerRadius: getPointerRadius(gauge),
        pathLength: gauge.dimensions.current.outerRadius * length,
        currentPercent: utils.calculatePercentage(minValue, maxValue, value as number),
        prevPercent: utils.calculatePercentage(minValue, maxValue, gauge.prevProps?.current.value || minValue),
        prevProgress: 0,
        pathStr: "",
        shouldDrawPath: typesWithPath.includes(pointer.type as PointerType),
        prevColor: ""
    }
    return pointerContext;
}
const initPointer = (gauge: Gauge) => {
    let value = gauge.props.value as number;
    let pointer = gauge.props.pointer as PointerProps;
    const { shouldDrawPath, centerPoint, pointerRadius, pathStr, currentPercent, prevPercent, pathLength } = gauge.pointer.current.context;
    
    // Get the initial color based on current value - this makes pointer color match arc by default
    const initialColor = pointer.color || arcHooks.getColorByPercentage(currentPercent, gauge);
    
    if(shouldDrawPath){
        gauge.pointer.current.context.pathStr = calculatePointerPath(gauge, prevPercent || currentPercent);
        gauge.pointer.current.path = gauge.pointer.current.element.append("path").attr("d", gauge.pointer.current.context.pathStr).attr("fill", initialColor);
        
        // Add grab handle at pointer tip if onValueChange is provided
        // Note: The handle will be raised to top after all elements are rendered in drawPointer
        if (gauge.props.onValueChange) {
            const tipPosition = calculatePointerTipPosition(gauge, prevPercent || currentPercent);
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
    //Add a circle at the bottom of pointer
    if (pointer.type == PointerType.Needle) {
        gauge.pointer.current.element
            .append("circle")
            .attr("cx", centerPoint[0])
            .attr("cy", centerPoint[1])
            .attr("r", pointerRadius)
            .attr("fill", pointer.baseColor || initialColor);
    } else if (pointer.type == PointerType.Blob) {
        // For blob, stroke color always matches arc color
        const strokeColor = arcHooks.getColorByPercentage(currentPercent, gauge);
        gauge.pointer.current.element
            .append("circle")
            .attr("cx", centerPoint[0])
            .attr("cy", centerPoint[1])
            .attr("r", pointerRadius)
            .attr("fill", pointer.baseColor)
            .attr("stroke", strokeColor)
            .attr("stroke-width", pointer.strokeWidth! * pointerRadius / 10);
        gauge.pointer.current.context.prevColor = strokeColor;
        
        // For blob, the blob itself is the grab handle - just add cursor style
        if (gauge.props.onValueChange) {
            gauge.pointer.current.element.select("circle").style("cursor", "grab");
        }
    }
    //Translate the pointer starting point of the arc
    setPointerPosition(pointerRadius, value, gauge);
}
const updatePointer = (percentage: number, gauge: Gauge) => {
    let pointer = gauge.props.pointer as PointerProps;
    const { pointerRadius, shouldDrawPath, prevColor } = gauge.pointer.current.context;
    setPointerPosition(pointerRadius, percentage, gauge);
    if(shouldDrawPath && gauge.props.type != GaugeType.Grafana) {
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
        let currentColor = arcHooks.getColorByPercentage(percentage, gauge);
        let shouldChangeColor = currentColor != prevColor;
        if(shouldChangeColor) gauge.pointer.current.element.select("circle").attr("stroke", currentColor)
        var strokeWidth = pointer.strokeWidth! * pointerRadius / 10;
        gauge.pointer.current.element.select("circle").attr("stroke-width", strokeWidth);
        gauge.pointer.current.context.prevColor = currentColor;
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
            let { x, y } = getCoordByValue(value, gauge, "inner", 0, 0.70);
            x -= 1;
            y += pointerRadius-3;
            translatePointer(x, y, gauge);
        },
        [PointerType.Blob]: () => {
            // Position blob at the center of the arc width
            let { x, y } = getCoordByValue(value, gauge, "between", 0, 1);
            // No offset needed - blob should be centered on the arc
            translatePointer(x, y, gauge);
        },
    };
    return pointers[pointerType]();
}

const isProgressValid = (currentPercent: number, prevPercent: number, gauge: Gauge) => {
    //Avoid unnecessary re-rendering (when progress is too small) but allow the pointer to reach the final value
    let overFlow = currentPercent > 1 || currentPercent < 0;
    let tooSmallValue = Math.abs(currentPercent - prevPercent) < 0.0001;
    let sameValueAsBefore = currentPercent == prevPercent;
    return !tooSmallValue && !sameValueAsBefore && !overFlow;
}

const calculatePointerPath = (gauge: Gauge, percent: number) => {
    const { centerPoint, pointerRadius, pathLength } = gauge.pointer.current.context;
    let startAngle = utils.degToRad(gauge.props.type == GaugeType.Semicircle ? 0 : -42);
    let endAngle = utils.degToRad(gauge.props.type == GaugeType.Semicircle ? 180 : 223);
    const angle = startAngle + (percent) * (endAngle - startAngle);
    var topPoint = [
        centerPoint[0] - pathLength * Math.cos(angle),
        centerPoint[1] - pathLength * Math.sin(angle),
    ];
    var thetaMinusHalfPi = angle - Math.PI / 2;
    var leftPoint = [
        centerPoint[0] - pointerRadius * Math.cos(thetaMinusHalfPi),
        centerPoint[1] - pointerRadius * Math.sin(thetaMinusHalfPi),
    ];
    var thetaPlusHalfPi = angle + Math.PI / 2;
    var rightPoint = [
        centerPoint[0] - pointerRadius * Math.cos(thetaPlusHalfPi),
        centerPoint[1] - pointerRadius * Math.sin(thetaPlusHalfPi),
    ];

    var pathStr = `M ${leftPoint[0]} ${leftPoint[1]} L ${topPoint[0]} ${topPoint[1]} L ${rightPoint[0]} ${rightPoint[1]}`;
    return pathStr;
};

/**
 * Calculate the position of the pointer tip for the grab handle
 */
const calculatePointerTipPosition = (gauge: Gauge, percent: number): { x: number, y: number } => {
    const pointer = gauge.props.pointer as PointerProps;
    const pointerType = pointer.type as PointerType;
    const { centerPoint, pathLength, pointerRadius } = gauge.pointer.current.context;
    
    let startAngle = utils.degToRad(gauge.props.type == GaugeType.Semicircle ? 0 : -42);
    let endAngle = utils.degToRad(gauge.props.type == GaugeType.Semicircle ? 180 : 223);
    const angle = startAngle + (percent) * (endAngle - startAngle);
    
    // For Arrow type, we need to add the translation offset to the local tip position
    if (pointerType === PointerType.Arrow) {
        const minValue = gauge.props.minValue as number;
        const maxValue = gauge.props.maxValue as number;
        const value = minValue + percent * (maxValue - minValue);
        // Get the translation position of the arrow element
        let { x: transX, y: transY } = getCoordByValue(value, gauge, "inner", 0, 0.70);
        transX -= 1;
        transY += pointerRadius - 3;
        // Calculate local tip position (topPoint from calculatePointerPath)
        const localTipX = centerPoint[0] - pathLength * Math.cos(angle);
        const localTipY = centerPoint[1] - pathLength * Math.sin(angle);
        // Return global position = translation + local tip
        return {
            x: transX + localTipX,
            y: transY + localTipY,
        };
    }
    
    // For Needle type, calculate from center using path length
    return {
        x: centerPoint[0] - pathLength * Math.cos(angle),
        y: centerPoint[1] - pathLength * Math.sin(angle),
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
    gauge.pointer.current.element.selectAll("*").remove();
    // Also remove grab handle which is on g.current
    gauge.g.current.select(".pointer-grab-handle").remove();
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
    
    // Get the actual gauge angles from dimensions
    const { startAngle, endAngle } = gauge.dimensions.current.angles;
    
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
