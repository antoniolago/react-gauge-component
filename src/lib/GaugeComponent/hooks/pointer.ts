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
        if (gauge.props.onValueChange) {
            const tipPosition = calculatePointerTipPosition(gauge, prevPercent || currentPercent);
            const handleRadius = Math.max(6, pointerRadius * 0.8);
            gauge.pointer.current.element
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
            .attr("fill", initialColor);
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
        
        // Update grab handle position if it exists
        const grabHandle = gauge.pointer.current.element.select(".pointer-grab-handle");
        if (!grabHandle.empty()) {
            const tipPosition = calculatePointerTipPosition(gauge, percentage);
            grabHandle.attr("cx", tipPosition.x).attr("cy", tipPosition.y);
        }
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
    const { centerPoint, pathLength } = gauge.pointer.current.context;
    let startAngle = utils.degToRad(gauge.props.type == GaugeType.Semicircle ? 0 : -42);
    let endAngle = utils.degToRad(gauge.props.type == GaugeType.Semicircle ? 180 : 223);
    const angle = startAngle + (percent) * (endAngle - startAngle);
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
export const clearPointerElement = (gauge: Gauge) => gauge.pointer.current.element.selectAll("*").remove();

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
    
    // The gauge pointer path uses: -pathLength * cos(angle), -pathLength * sin(angle)
    // This means:
    //   angle = 0    → pointer points LEFT  (x = -pathLength, y = 0)
    //   angle = 90°  → pointer points DOWN  (x = 0, y = -pathLength... wait, sin(90°)=1, so y = -pathLength)
    //   angle = 180° → pointer points RIGHT (x = pathLength, y = 0)
    //
    // So the gauge coordinate system has:
    //   0° = LEFT, 90° = UP (negative Y in SVG), 180° = RIGHT
    //
    // But wait, the path calculation is: topPoint = [centerX - pathLength * cos(angle), centerY - pathLength * sin(angle)]
    // At angle=0: [-pathLength, 0] = LEFT ✓
    // At angle=90° (PI/2): [0, -pathLength] = UP (negative Y) ✓
    // At angle=180° (PI): [pathLength, 0] = RIGHT ✓
    //
    // So to convert from mouse position to gauge angle:
    // We need to find the angle such that (-cos(angle), -sin(angle)) points from center to mouse
    // That means: -cos(angle) = dx/dist, -sin(angle) = dy/dist
    // So: cos(angle) = -dx/dist, sin(angle) = -dy/dist
    // angle = atan2(-dy, -dx) = atan2(dy, dx) + PI
    
    let angle = Math.atan2(-dy, -dx);
    
    // Normalize to 0 to 2*PI range for easier handling
    if (angle < 0) angle += 2 * Math.PI;
    
    // Define gauge angle ranges (in radians)
    let startAngle: number, endAngle: number;
    
    if (gauge.props.type === GaugeType.Semicircle) {
        // Semicircle: 0° to 180° (0 to PI radians)
        // 0° = left edge, 180° = right edge
        startAngle = 0;
        endAngle = Math.PI;
        
        // For semicircle, valid angles are 0 to PI
        // Angles > PI are in the bottom half - clamp to nearest edge
        if (angle > Math.PI) {
            // Bottom half - clamp to nearest edge
            if (angle < 1.5 * Math.PI) {
                angle = Math.PI; // Closer to right
            } else {
                angle = 0; // Closer to left
            }
        }
    } else {
        // Radial/Grafana: -42° to 223°
        // Convert to radians: -42° = -0.733 rad, 223° = 3.89 rad
        // In 0-2PI space: -42° = 2PI - 0.733 = 5.55 rad
        startAngle = utils.degToRad(-42);  // -0.733 rad
        endAngle = utils.degToRad(223);    // 3.89 rad
        
        // The arc spans 265° from upper-left through bottom to upper-right
        // Dead zone is from 223° to 318° (in 0-2PI: 3.89 to 5.55)
        
        // First, handle angles in the dead zone (top of gauge)
        const deadZoneStart = endAngle;  // 223° = 3.89 rad
        const deadZoneEnd = 2 * Math.PI + startAngle;  // 318° = 5.55 rad
        
        if (angle > deadZoneStart && angle < deadZoneEnd) {
            // In dead zone - snap to nearest valid edge
            const midDeadZone = (deadZoneStart + deadZoneEnd) / 2;
            angle = angle < midDeadZone ? deadZoneStart : deadZoneEnd;
        }
        
        // Convert angle to the -42° to 223° range for percentage calculation
        if (angle > Math.PI) {
            // Angle is in upper-left quadrant (e.g., 318° = 5.55 rad → -42° = -0.733 rad)
            angle = angle - 2 * Math.PI;
        }
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
