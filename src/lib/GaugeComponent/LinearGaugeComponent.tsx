import React, { useRef, useLayoutEffect, useState, useMemo, useCallback } from 'react';
import { select, drag } from 'd3';
import {
    LinearGaugeComponentProps,
    defaultLinearGaugeProps,
    defaultLinearTrack,
} from './types/LinearGauge';
import { mergeObjects } from './hooks/utils';

const LinearGaugeComponent: React.FC<Partial<LinearGaugeComponentProps>> = (props) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement | null>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    // Merge props with defaults
    const mergedProps = useMemo(() => 
        mergeObjects({ ...defaultLinearGaugeProps }, props) as LinearGaugeComponentProps,
        [props]
    );

    const {
        id, className, style,
        value = 50, minValue = 0, maxValue = 100,
        orientation = 'horizontal',
        track = defaultLinearTrack,
        pointer = { type: 'triangle' },
        ticks = { count: 5 },
        valueLabel = { hide: false },
    } = mergedProps;

    // Extract values with defaults
    const trackThickness = track?.thickness ?? 24;
    const trackBgColor = track?.backgroundColor ?? '#e0e0e0';
    const trackBorderRadius = track?.borderRadius ?? 0;
    const segments = track?.segments ?? [{ color: '#4caf50' }];
    const trackStrokeWidth = track?.strokeWidth ?? 0;
    const trackStrokeColor = track?.strokeColor ?? '#999';
    
    // SubLine configuration
    const subLine = track?.subLine;
    const showSubLine = subLine?.show ?? false;
    const subLineColor = subLine?.color ?? '#666';
    const subLineThickness = subLine?.thickness ?? 4;
    const subLineOffset = subLine?.offset ?? 0;
    const subLineOpacity = subLine?.opacity ?? 0.5;
    
    const pointerType = pointer?.type ?? 'triangle';
    const pointerColor = pointer?.color ?? '#333';
    const pointerSize = pointer?.size ?? 14;
    const pointerHeight = pointer?.height ?? pointerSize * 1.5;
    const pointerPosition = pointer?.position ?? 'top';
    const pointerStrokeWidth = pointer?.strokeWidth ?? 0;
    const pointerStrokeColor = pointer?.strokeColor ?? '#000';
    const showFill = pointer?.showFill ?? true;
    const pointerOffsetY = pointer?.offsetY ?? 0;
    
    const tickCount = ticks?.count ?? 5;
    const minorTickCount = ticks?.minorTicks ?? 4;
    const tickPosition = ticks?.position ?? 'inside-top';
    const majorTickLength = ticks?.majorLength ?? ticks?.length ?? 12;
    const minorTickLength = ticks?.minorLength ?? 6;
    const tickWidth = ticks?.width ?? 1;
    const tickColor = ticks?.color ?? '#333';
    const hideMinMax = ticks?.hideMinMax ?? false;
    const labelsOnMajorOnly = ticks?.labelsOnMajorOnly ?? true;
    const labelsInside = ticks?.labelsInside ?? false;
    
    const hideValueLabel = valueLabel?.hide ?? false;
    const matchColorWithSegment = valueLabel?.matchColorWithSegment ?? false;
    const valueLabelPosition = valueLabel?.position ?? 'right';
    const valueLabelOffsetX = valueLabel?.offsetX ?? 0;
    const valueLabelOffsetY = valueLabel?.offsetY ?? 0;

    const isHorizontal = orientation === 'horizontal';
    
    // Drag state
    const isDragging = useRef(false);
    const onValueChange = mergedProps.onValueChange;

    // Get color for a value based on segments
    const getColorForValue = (val: number): string => {
        for (const segment of segments) {
            const limit = segment.limit ?? maxValue;
            if (val <= limit) return segment.color ?? '#4caf50';
        }
        return segments[segments.length - 1]?.color ?? '#4caf50';
    };

    // Resize observer
    useLayoutEffect(() => {
        if (!containerRef.current) return;
        const observer = new ResizeObserver(entries => {
            const { width, height } = entries[0].contentRect;
            if (width > 0 && height > 0) setDimensions({ width, height });
        });
        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    // Main render effect
    useLayoutEffect(() => {
        if (!svgRef.current || dimensions.width === 0 || dimensions.height === 0) return;
        
        const svg = select(svgRef.current);
        svg.selectAll('*').remove();

        // Calculate layout with margins for labels and pointers
        const margin = { top: 25, right: 40, bottom: 30, left: 25 };
        
        // Tick position helpers
        const ticksInside = tickPosition.startsWith('inside');
        const ticksOnTop = tickPosition === 'top' || tickPosition === 'both';
        const ticksOnBottom = tickPosition === 'bottom' || tickPosition === 'both';
        const ticksOnLeft = tickPosition === 'left' || tickPosition === 'both';
        const ticksOnRight = tickPosition === 'right' || tickPosition === 'both';
        
        // Adjust margins based on tick position and pointer
        const needsTopSpace = pointerPosition === 'top' || pointerPosition === 'both';
        const needsBottomSpace = pointerPosition === 'bottom' || pointerPosition === 'both';
        
        if (isHorizontal) {
            // Pointer space
            if (needsTopSpace && pointerType !== 'none') margin.top = Math.max(margin.top, pointerHeight + 10);
            if (needsBottomSpace && pointerType !== 'none') margin.bottom = Math.max(margin.bottom, pointerHeight + 10);
            // Tick label space (outside ticks)
            if (ticksOnTop) margin.top = Math.max(margin.top, majorTickLength + 22);
            if (ticksOnBottom) margin.bottom = Math.max(margin.bottom, majorTickLength + 22);
            // Value label space
            if (valueLabelPosition === 'right') margin.right = Math.max(margin.right, 50);
            if (valueLabelPosition === 'left') margin.left = Math.max(margin.left, 50);
        } else {
            if (ticksOnLeft) margin.left = Math.max(margin.left, majorTickLength + 40);
            if (ticksOnRight) margin.right = Math.max(margin.right, majorTickLength + 40);
            if (valueLabelPosition === 'top') margin.top = Math.max(margin.top, 30);
            if (valueLabelPosition === 'bottom') margin.bottom = Math.max(margin.bottom, 30);
        }

        // Track dimensions
        const trackWidth = isHorizontal ? dimensions.width - margin.left - margin.right : trackThickness;
        const trackHeight = isHorizontal ? trackThickness : dimensions.height - margin.top - margin.bottom;
        const actualTrackX = isHorizontal ? margin.left : (dimensions.width - trackThickness) / 2;
        const actualTrackY = margin.top;

        // Value calculations
        const clampedValue = Math.max(minValue, Math.min(maxValue, value));
        const valuePercent = (clampedValue - minValue) / (maxValue - minValue);

        // Create clip path for rounded corners
        const clipId = `linear-gauge-clip-${id || Math.random().toString(36).substr(2, 9)}`;
        const defs = svg.append('defs');
        defs.append('clipPath')
            .attr('id', clipId)
            .append('rect')
            .attr('x', actualTrackX)
            .attr('y', actualTrackY)
            .attr('width', trackWidth)
            .attr('height', trackHeight)
            .attr('rx', trackBorderRadius);

        // Draw background track
        svg.append('rect')
            .attr('x', actualTrackX)
            .attr('y', actualTrackY)
            .attr('width', trackWidth)
            .attr('height', trackHeight)
            .attr('rx', trackBorderRadius)
            .attr('fill', trackBgColor)
            .attr('stroke', trackStrokeWidth > 0 ? trackStrokeColor : 'none')
            .attr('stroke-width', trackStrokeWidth);

        // Draw full segment colors on track (always visible)
        let prevLimitPercent = 0;
        segments.forEach((segment) => {
            const segmentLimit = segment.limit ?? maxValue;
            const segmentLimitPercent = (segmentLimit - minValue) / (maxValue - minValue);
            const segmentStart = prevLimitPercent;
            const segmentEnd = segmentLimitPercent;
            
            if (isHorizontal) {
                svg.append('rect')
                    .attr('x', actualTrackX + segmentStart * trackWidth)
                    .attr('y', actualTrackY)
                    .attr('width', (segmentEnd - segmentStart) * trackWidth)
                    .attr('height', trackHeight)
                    .attr('fill', segment.color ?? '#4caf50')
                    .attr('clip-path', `url(#${clipId})`);
            } else {
                const startY = actualTrackY + trackHeight * (1 - segmentEnd);
                const endY = actualTrackY + trackHeight * (1 - segmentStart);
                svg.append('rect')
                    .attr('x', actualTrackX)
                    .attr('y', startY)
                    .attr('width', trackWidth)
                    .attr('height', endY - startY)
                    .attr('fill', segment.color ?? '#4caf50')
                    .attr('clip-path', `url(#${clipId})`);
            }
            prevLimitPercent = segmentLimitPercent;
        });

        // Draw fill overlay (covers unfilled portion with background when showFill is true)
        if (showFill && valuePercent < 1) {
            if (isHorizontal) {
                svg.append('rect')
                    .attr('x', actualTrackX + valuePercent * trackWidth)
                    .attr('y', actualTrackY)
                    .attr('width', (1 - valuePercent) * trackWidth)
                    .attr('height', trackHeight)
                    .attr('fill', trackBgColor)
                    .attr('clip-path', `url(#${clipId})`);
            } else {
                svg.append('rect')
                    .attr('x', actualTrackX)
                    .attr('y', actualTrackY)
                    .attr('width', trackWidth)
                    .attr('height', (1 - valuePercent) * trackHeight)
                    .attr('fill', trackBgColor)
                    .attr('clip-path', `url(#${clipId})`);
            }
        }

        // Draw sub-line AFTER fill overlay (reference line with segment colors like Grafana subarc)
        if (showSubLine) {
            const subLineY = isHorizontal 
                ? actualTrackY + (trackHeight - subLineThickness) / 2 + subLineOffset
                : actualTrackY;
            const subLineX = isHorizontal 
                ? actualTrackX 
                : actualTrackX + (trackWidth - subLineThickness) / 2 + subLineOffset;
            
            // Draw sub-line with segment colors
            let subPrevLimitPercent = 0;
            segments.forEach((segment) => {
                const segmentLimit = segment.limit ?? maxValue;
                const segmentLimitPercent = (segmentLimit - minValue) / (maxValue - minValue);
                const segmentStart = subPrevLimitPercent;
                const segmentEnd = segmentLimitPercent;
                
                if (isHorizontal) {
                    svg.append('rect')
                        .attr('x', actualTrackX + segmentStart * trackWidth)
                        .attr('y', subLineY)
                        .attr('width', (segmentEnd - segmentStart) * trackWidth)
                        .attr('height', subLineThickness)
                        .attr('fill', segment.color ?? '#4caf50')
                        .attr('opacity', subLineOpacity)
                        .attr('clip-path', `url(#${clipId})`);
                } else {
                    const startY = actualTrackY + trackHeight * (1 - segmentEnd);
                    const endY = actualTrackY + trackHeight * (1 - segmentStart);
                    svg.append('rect')
                        .attr('x', subLineX)
                        .attr('y', startY)
                        .attr('width', subLineThickness)
                        .attr('height', endY - startY)
                        .attr('fill', segment.color ?? '#4caf50')
                        .attr('opacity', subLineOpacity)
                        .attr('clip-path', `url(#${clipId})`);
                }
                subPrevLimitPercent = segmentLimitPercent;
            });
        }

        // Draw ticks (major and minor)
        if (!hideMinMax && tickCount > 0) {
            const tickGroup = svg.append('g').attr('class', 'ticks');
            const totalTicks = tickCount * (minorTickCount + 1);
            
            for (let i = 0; i <= totalTicks; i++) {
                const isMajor = i % (minorTickCount + 1) === 0;
                const tickValue = minValue + (maxValue - minValue) * (i / totalTicks);
                const tickPercent = i / totalTicks;
                const tickLen = isMajor ? majorTickLength : minorTickLength;
                const tickW = isMajor ? tickWidth + 0.5 : tickWidth;
                
                if (isHorizontal) {
                    const x = actualTrackX + tickPercent * trackWidth;
                    
                    // Draw tick based on position
                    if (tickPosition === 'inside-top') {
                        // Ticks inside track from top edge going down
                        tickGroup.append('line')
                            .attr('x1', x).attr('y1', actualTrackY)
                            .attr('x2', x).attr('y2', actualTrackY + tickLen)
                            .attr('stroke', tickColor)
                            .attr('stroke-width', tickW);
                    } else if (tickPosition === 'inside-bottom') {
                        // Ticks inside track from bottom edge going up
                        tickGroup.append('line')
                            .attr('x1', x).attr('y1', actualTrackY + trackHeight)
                            .attr('x2', x).attr('y2', actualTrackY + trackHeight - tickLen)
                            .attr('stroke', tickColor)
                            .attr('stroke-width', tickW);
                    } else if (tickPosition === 'bottom' || tickPosition === 'both') {
                        // Ticks outside below track
                        tickGroup.append('line')
                            .attr('x1', x).attr('y1', actualTrackY + trackHeight + 2)
                            .attr('x2', x).attr('y2', actualTrackY + trackHeight + 2 + tickLen)
                            .attr('stroke', tickColor)
                            .attr('stroke-width', tickW);
                    }
                    if (tickPosition === 'top' || tickPosition === 'both') {
                        // Ticks outside above track
                        tickGroup.append('line')
                            .attr('x1', x).attr('y1', actualTrackY - 2)
                            .attr('x2', x).attr('y2', actualTrackY - 2 - tickLen)
                            .attr('stroke', tickColor)
                            .attr('stroke-width', tickW);
                    }
                    
                    // Draw labels for major ticks
                    if (isMajor || !labelsOnMajorOnly) {
                        const label = ticks?.formatLabel 
                            ? ticks.formatLabel(tickValue) 
                            : Math.round(tickValue).toString();
                        
                        // Position label based on tick position and labelsInside flag
                        let labelY: number;
                        if (tickPosition === 'top') {
                            labelY = actualTrackY - majorTickLength - 8;
                        } else if (tickPosition === 'inside-top') {
                            // labelsInside: true = labels inside (same side as ticks), false = labels outside (opposite side)
                            labelY = labelsInside 
                                ? actualTrackY + majorTickLength + 4 
                                : actualTrackY + trackHeight + 16;
                        } else if (tickPosition === 'inside-bottom') {
                            labelY = labelsInside 
                                ? actualTrackY + trackHeight - majorTickLength - 4 
                                : actualTrackY - 6;
                        } else {
                            labelY = actualTrackY + trackHeight + majorTickLength + 16;
                        }
                        
                        tickGroup.append('text')
                            .attr('x', x)
                            .attr('y', labelY)
                            .attr('text-anchor', 'middle')
                            .attr('dominant-baseline', labelsInside && tickPosition === 'inside-bottom' ? 'auto' : 'middle')
                            .attr('font-size', '11px')
                            .attr('fill', tickColor)
                            .text(label);
                    }
                } else {
                    // Vertical orientation
                    const y = actualTrackY + trackHeight * (1 - tickPercent);
                    
                    if (tickPosition === 'inside-left') {
                        tickGroup.append('line')
                            .attr('x1', actualTrackX).attr('y1', y)
                            .attr('x2', actualTrackX + tickLen).attr('y2', y)
                            .attr('stroke', tickColor)
                            .attr('stroke-width', tickW);
                    } else if (tickPosition === 'inside-right') {
                        tickGroup.append('line')
                            .attr('x1', actualTrackX + trackWidth).attr('y1', y)
                            .attr('x2', actualTrackX + trackWidth - tickLen).attr('y2', y)
                            .attr('stroke', tickColor)
                            .attr('stroke-width', tickW);
                    } else if (tickPosition === 'left' || tickPosition === 'both') {
                        tickGroup.append('line')
                            .attr('x1', actualTrackX - 2).attr('y1', y)
                            .attr('x2', actualTrackX - 2 - tickLen).attr('y2', y)
                            .attr('stroke', tickColor)
                            .attr('stroke-width', tickW);
                    }
                    if (tickPosition === 'right' || tickPosition === 'both') {
                        tickGroup.append('line')
                            .attr('x1', actualTrackX + trackWidth + 2).attr('y1', y)
                            .attr('x2', actualTrackX + trackWidth + 2 + tickLen).attr('y2', y)
                            .attr('stroke', tickColor)
                            .attr('stroke-width', tickW);
                    }
                    
                    if (isMajor || !labelsOnMajorOnly) {
                        const label = ticks?.formatLabel 
                            ? ticks.formatLabel(tickValue) 
                            : Math.round(tickValue).toString();
                        
                        let labelX: number;
                        let textAnchor: string;
                        if (tickPosition === 'right') {
                            labelX = actualTrackX + trackWidth + majorTickLength + 8;
                            textAnchor = 'start';
                        } else if (tickPosition === 'inside-right') {
                            // labelsInside: true = labels inside (same side as ticks), false = labels outside (opposite side)
                            labelX = labelsInside 
                                ? actualTrackX + trackWidth - majorTickLength - 4 
                                : actualTrackX - 8;
                            textAnchor = labelsInside ? 'end' : 'end';
                        } else if (tickPosition === 'inside-left') {
                            labelX = labelsInside 
                                ? actualTrackX + majorTickLength + 4 
                                : actualTrackX + trackWidth + 8;
                            textAnchor = labelsInside ? 'start' : 'start';
                        } else {
                            labelX = actualTrackX - majorTickLength - 8;
                            textAnchor = 'end';
                        }
                        
                        tickGroup.append('text')
                            .attr('x', labelX)
                            .attr('y', y)
                            .attr('text-anchor', textAnchor)
                            .attr('dominant-baseline', 'middle')
                            .attr('font-size', '11px')
                            .attr('fill', tickColor)
                            .text(label);
                    }
                }
            }
        }

        // Store layout info for drag behavior
        const layoutInfo = { actualTrackX, actualTrackY, trackWidth, trackHeight };

        // Draw pointer
        if (pointerType !== 'none') {
            const pointerGroup = svg.append('g').attr('class', 'pointer');
            
            const drawPointer = (x: number, y: number, direction: 'up' | 'down' | 'left' | 'right') => {
                const hw = pointerSize / 2; // half width
                const h = pointerHeight;
                let path = '';
                
                switch (pointerType) {
                    case 'arrow':
                        // Arrow with stem
                        if (direction === 'down') {
                            path = `M ${x} ${y} L ${x - hw} ${y - h * 0.6} L ${x - hw * 0.3} ${y - h * 0.6} L ${x - hw * 0.3} ${y - h} L ${x + hw * 0.3} ${y - h} L ${x + hw * 0.3} ${y - h * 0.6} L ${x + hw} ${y - h * 0.6} Z`;
                        } else if (direction === 'up') {
                            path = `M ${x} ${y} L ${x - hw} ${y + h * 0.6} L ${x - hw * 0.3} ${y + h * 0.6} L ${x - hw * 0.3} ${y + h} L ${x + hw * 0.3} ${y + h} L ${x + hw * 0.3} ${y + h * 0.6} L ${x + hw} ${y + h * 0.6} Z`;
                        } else if (direction === 'right') {
                            path = `M ${x} ${y} L ${x - h * 0.6} ${y - hw} L ${x - h * 0.6} ${y - hw * 0.3} L ${x - h} ${y - hw * 0.3} L ${x - h} ${y + hw * 0.3} L ${x - h * 0.6} ${y + hw * 0.3} L ${x - h * 0.6} ${y + hw} Z`;
                        } else {
                            path = `M ${x} ${y} L ${x + h * 0.6} ${y - hw} L ${x + h * 0.6} ${y - hw * 0.3} L ${x + h} ${y - hw * 0.3} L ${x + h} ${y + hw * 0.3} L ${x + h * 0.6} ${y + hw * 0.3} L ${x + h * 0.6} ${y + hw} Z`;
                        }
                        break;
                    case 'triangle':
                        // Simple triangle
                        if (direction === 'down') {
                            path = `M ${x} ${y} L ${x - hw} ${y - h} L ${x + hw} ${y - h} Z`;
                        } else if (direction === 'up') {
                            path = `M ${x} ${y} L ${x - hw} ${y + h} L ${x + hw} ${y + h} Z`;
                        } else if (direction === 'right') {
                            path = `M ${x} ${y} L ${x - h} ${y - hw} L ${x - h} ${y + hw} Z`;
                        } else {
                            path = `M ${x} ${y} L ${x + h} ${y - hw} L ${x + h} ${y + hw} Z`;
                        }
                        break;
                    case 'diamond':
                        // Diamond shape
                        if (direction === 'down' || direction === 'up') {
                            path = `M ${x} ${y} L ${x - hw} ${y - h/2} L ${x} ${y - h} L ${x + hw} ${y - h/2} Z`;
                        } else {
                            path = `M ${x} ${y} L ${x - h/2} ${y - hw} L ${x - h} ${y} L ${x - h/2} ${y + hw} Z`;
                        }
                        break;
                    case 'line':
                        // Line indicator
                        if (direction === 'down' || direction === 'up') {
                            pointerGroup.append('line')
                                .attr('x1', x).attr('y1', actualTrackY - 3)
                                .attr('x2', x).attr('y2', actualTrackY + trackHeight + 3)
                                .attr('stroke', pointerColor)
                                .attr('stroke-width', Math.max(2, pointerSize / 4))
                                .attr('stroke-linecap', 'round');
                        } else {
                            pointerGroup.append('line')
                                .attr('x1', actualTrackX - 3).attr('y1', y)
                                .attr('x2', actualTrackX + trackWidth + 3).attr('y2', y)
                                .attr('stroke', pointerColor)
                                .attr('stroke-width', Math.max(2, pointerSize / 4))
                                .attr('stroke-linecap', 'round');
                        }
                        return;
                    case 'pill':
                        // Pill/capsule shape
                        const pillH = h * 0.8;
                        const pillW = pointerSize * 0.5;
                        if (direction === 'down' || direction === 'up') {
                            pointerGroup.append('rect')
                                .attr('x', x - pillW / 2)
                                .attr('y', direction === 'down' ? y - pillH : y)
                                .attr('width', pillW)
                                .attr('height', pillH)
                                .attr('rx', pillW / 2)
                                .attr('fill', pointerColor)
                                .attr('stroke', pointerStrokeWidth > 0 ? pointerStrokeColor : 'none')
                                .attr('stroke-width', pointerStrokeWidth);
                        } else {
                            pointerGroup.append('rect')
                                .attr('x', direction === 'left' ? x : x - pillH)
                                .attr('y', y - pillW / 2)
                                .attr('width', pillH)
                                .attr('height', pillW)
                                .attr('rx', pillW / 2)
                                .attr('fill', pointerColor)
                                .attr('stroke', pointerStrokeWidth > 0 ? pointerStrokeColor : 'none')
                                .attr('stroke-width', pointerStrokeWidth);
                        }
                        return;
                }
                
                if (path) {
                    pointerGroup.append('path')
                        .attr('d', path)
                        .attr('fill', pointerColor)
                        .attr('stroke', pointerStrokeWidth > 0 ? pointerStrokeColor : 'none')
                        .attr('stroke-width', pointerStrokeWidth);
                }
            };
            
            if (isHorizontal) {
                const x = actualTrackX + valuePercent * trackWidth;
                
                if (pointerPosition === 'top' || pointerPosition === 'both') {
                    drawPointer(x, actualTrackY - 3 - pointerOffsetY, 'down');
                }
                if (pointerPosition === 'bottom' || pointerPosition === 'both') {
                    drawPointer(x, actualTrackY + trackHeight + 3 + pointerOffsetY, 'up');
                }
                if (pointerPosition === 'inside') {
                    // Draw line through track
                    pointerGroup.append('line')
                        .attr('x1', x).attr('y1', actualTrackY)
                        .attr('x2', x).attr('y2', actualTrackY + trackHeight)
                        .attr('stroke', pointerColor)
                        .attr('stroke-width', Math.max(2, pointerSize / 3));
                }
            } else {
                const y = actualTrackY + trackHeight * (1 - valuePercent);
                
                if (pointerPosition === 'left' || pointerPosition === 'both') {
                    drawPointer(actualTrackX - 3 - pointerOffsetY, y, 'right');
                }
                if (pointerPosition === 'right' || pointerPosition === 'both') {
                    drawPointer(actualTrackX + trackWidth + 3 + pointerOffsetY, y, 'left');
                }
                if (pointerPosition === 'inside') {
                    pointerGroup.append('line')
                        .attr('x1', actualTrackX).attr('y1', y)
                        .attr('x2', actualTrackX + trackWidth).attr('y2', y)
                        .attr('stroke', pointerColor)
                        .attr('stroke-width', Math.max(2, pointerSize / 3));
                }
            }
        }

        // Draw value label
        if (!hideValueLabel) {
            const displayValue = valueLabel?.formatValue 
                ? valueLabel.formatValue(clampedValue)
                : clampedValue.toFixed(valueLabel?.maxDecimalDigits ?? 0);
            const labelColor = matchColorWithSegment 
                ? getColorForValue(clampedValue) 
                : (valueLabel?.style?.color ?? '#333');
            const fontSize = valueLabel?.style?.fontSize ?? '14px';
            
            let labelX: number;
            let labelY: number;
            let textAnchor = 'middle';
            let dominantBaseline = 'middle';
            
            if (isHorizontal) {
                if (valueLabelPosition === 'center') {
                    labelX = actualTrackX + trackWidth / 2;
                    labelY = actualTrackY + trackHeight / 2;
                } else if (valueLabelPosition === 'left') {
                    labelX = actualTrackX - 10;
                    labelY = actualTrackY + trackHeight / 2;
                    textAnchor = 'end';
                } else if (valueLabelPosition === 'top') {
                    labelX = actualTrackX + trackWidth / 2;
                    labelY = actualTrackY - 8;
                    dominantBaseline = 'auto';
                } else if (valueLabelPosition === 'bottom') {
                    labelX = actualTrackX + trackWidth / 2;
                    labelY = actualTrackY + trackHeight + 16;
                    dominantBaseline = 'hanging';
                } else {
                    // right (default)
                    labelX = actualTrackX + trackWidth + 10;
                    labelY = actualTrackY + trackHeight / 2;
                    textAnchor = 'start';
                }
            } else {
                if (valueLabelPosition === 'center') {
                    labelX = actualTrackX + trackWidth / 2;
                    labelY = actualTrackY + trackHeight / 2;
                } else if (valueLabelPosition === 'top') {
                    labelX = actualTrackX + trackWidth / 2;
                    labelY = actualTrackY - 8;
                    dominantBaseline = 'auto';
                } else if (valueLabelPosition === 'left') {
                    labelX = actualTrackX - 10;
                    labelY = actualTrackY + trackHeight / 2;
                    textAnchor = 'end';
                } else if (valueLabelPosition === 'right') {
                    labelX = actualTrackX + trackWidth + 10;
                    labelY = actualTrackY + trackHeight / 2;
                    textAnchor = 'start';
                } else {
                    // bottom (default for vertical)
                    labelX = actualTrackX + trackWidth / 2;
                    labelY = actualTrackY + trackHeight + 16;
                    dominantBaseline = 'hanging';
                }
            }
            
            // Apply offsets
            labelX += valueLabelOffsetX;
            labelY += valueLabelOffsetY;
            
            svg.append('text')
                .attr('x', labelX)
                .attr('y', labelY)
                .attr('text-anchor', textAnchor)
                .attr('dominant-baseline', dominantBaseline)
                .attr('font-size', fontSize)
                .attr('font-weight', 'bold')
                .attr('fill', labelColor)
                .text(displayValue);
        }

        // Setup drag behavior if onValueChange is provided
        if (onValueChange) {
            const getValueFromPosition = (clientX: number, clientY: number): number => {
                const svgRect = svgRef.current?.getBoundingClientRect();
                if (!svgRect) return clampedValue;
                
                let percent: number;
                if (isHorizontal) {
                    const x = clientX - svgRect.left - layoutInfo.actualTrackX;
                    percent = Math.max(0, Math.min(1, x / layoutInfo.trackWidth));
                } else {
                    const y = clientY - svgRect.top - layoutInfo.actualTrackY;
                    percent = Math.max(0, Math.min(1, 1 - y / layoutInfo.trackHeight));
                }
                
                return minValue + percent * (maxValue - minValue);
            };

            const dragBehavior = drag<SVGSVGElement, unknown>()
                .on('start', function() {
                    isDragging.current = true;
                    select(this).style('cursor', 'grabbing');
                })
                .on('drag', function(event) {
                    const newValue = getValueFromPosition(event.sourceEvent.clientX, event.sourceEvent.clientY);
                    onValueChange(newValue);
                })
                .on('end', function() {
                    isDragging.current = false;
                    select(this).style('cursor', 'grab');
                });

            svg.call(dragBehavior);
            svg.style('cursor', 'grab');
        }
    }, [
        dimensions, value, minValue, maxValue, orientation, 
        trackThickness, trackBgColor, trackBorderRadius, segments, trackStrokeWidth, trackStrokeColor,
        showSubLine, subLineColor, subLineThickness, subLineOffset, subLineOpacity,
        pointerType, pointerColor, pointerSize, pointerHeight, pointerPosition, pointerStrokeWidth, pointerStrokeColor, showFill, pointerOffsetY,
        tickCount, minorTickCount, tickPosition, majorTickLength, minorTickLength, tickWidth, tickColor, hideMinMax, labelsOnMajorOnly, labelsInside, ticks,
        hideValueLabel, matchColorWithSegment, valueLabel, valueLabelPosition, valueLabelOffsetX, valueLabelOffsetY,
        id, isHorizontal, onValueChange
    ]);

    return (
        <div ref={containerRef} id={id} className={className} style={{ width: '100%', height: '100%', ...style }}>
            <svg ref={svgRef} width={dimensions.width} height={dimensions.height} style={{ display: 'block' }} />
        </div>
    );
};

export default LinearGaugeComponent;
