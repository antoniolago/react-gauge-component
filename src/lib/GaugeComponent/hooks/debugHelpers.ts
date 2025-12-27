/**
 * Debug Helpers for Gauge Component
 * 
 * These utilities help visualize and debug the coordinate system,
 * making it easier to understand positioning and catch issues.
 */

import { Gauge } from '../types/Gauge';
import { GaugeLayout } from './coordinateSystem';

/**
 * Draws a debug overlay showing the coordinate system
 * Call this after renderChart to visualize layout
 */
export const drawDebugOverlay = (gauge: Gauge, layout: GaugeLayout) => {
  const debugGroup = gauge.g.current.append('g').attr('class', 'debug-overlay');
  
  // Draw origin point (0, 0)
  debugGroup.append('circle')
    .attr('cx', 0)
    .attr('cy', 0)
    .attr('r', 3)
    .attr('fill', 'red')
    .attr('stroke', 'white')
    .attr('stroke-width', 1);
  
  // Draw origin crosshair
  debugGroup.append('line')
    .attr('x1', -10)
    .attr('y1', 0)
    .attr('x2', 10)
    .attr('y2', 0)
    .attr('stroke', 'red')
    .attr('stroke-width', 1)
    .attr('stroke-dasharray', '2,2');
  
  debugGroup.append('line')
    .attr('x1', 0)
    .attr('y1', -10)
    .attr('x2', 0)
    .attr('y2', 10)
    .attr('stroke', 'red')
    .attr('stroke-width', 1)
    .attr('stroke-dasharray', '2,2');
  
  // Draw outer radius circle
  debugGroup.append('circle')
    .attr('cx', 0)
    .attr('cy', 0)
    .attr('r', layout.outerRadius)
    .attr('fill', 'none')
    .attr('stroke', 'blue')
    .attr('stroke-width', 1)
    .attr('stroke-dasharray', '5,5')
    .attr('opacity', 0.5);
  
  // Draw inner radius circle
  debugGroup.append('circle')
    .attr('cx', 0)
    .attr('cy', 0)
    .attr('r', layout.innerRadius)
    .attr('fill', 'none')
    .attr('stroke', 'green')
    .attr('stroke-width', 1)
    .attr('stroke-dasharray', '5,5')
    .attr('opacity', 0.5);
  
  // Add labels
  debugGroup.append('text')
    .attr('x', 5)
    .attr('y', -5)
    .attr('fill', 'red')
    .attr('font-size', '10px')
    .text('(0,0)');
  
  debugGroup.append('text')
    .attr('x', 5)
    .attr('y', -layout.outerRadius + 15)
    .attr('fill', 'blue')
    .attr('font-size', '10px')
    .text(`outer: ${layout.outerRadius.toFixed(1)}`);
  
  debugGroup.append('text')
    .attr('x', 5)
    .attr('y', -layout.innerRadius + 15)
    .attr('fill', 'green')
    .attr('font-size', '10px')
    .text(`inner: ${layout.innerRadius.toFixed(1)}`);
};

/**
 * Removes the debug overlay
 */
export const clearDebugOverlay = (gauge: Gauge) => {
  gauge.g.current.selectAll('.debug-overlay').remove();
};

/**
 * Draws the viewBox bounds in the SVG
 * Useful to see if elements are outside the viewBox
 */
export const drawViewBoxBounds = (gauge: Gauge, layout: GaugeLayout) => {
  const { viewBox } = layout;
  
  // Add to SVG (not g), since viewBox is in SVG coordinate space
  gauge.svg.current.append('rect')
    .attr('x', viewBox.x)
    .attr('y', viewBox.y)
    .attr('width', viewBox.width)
    .attr('height', viewBox.height)
    .attr('fill', 'none')
    .attr('stroke', 'purple')
    .attr('stroke-width', 2)
    .attr('stroke-dasharray', '10,5')
    .attr('opacity', 0.7)
    .attr('class', 'debug-viewbox');
};

/**
 * Removes viewBox bounds visualization
 */
export const clearViewBoxBounds = (gauge: Gauge) => {
  gauge.svg.current.selectAll('.debug-viewbox').remove();
};

/**
 * Logs detailed layout information to console
 */
export const logLayoutInfo = (gauge: Gauge, layout: GaugeLayout, parentWidth: number, parentHeight: number) => {
  console.group('🎯 Gauge Layout Information');
  
  // console.log('Parent Container:', {
  //   width: parentWidth,
  //   height: parentHeight,
  //   aspectRatio: (parentWidth / parentHeight).toFixed(2),
  // });
  
  // console.log('ViewBox:', {
  //   x: layout.viewBox.x,
  //   y: layout.viewBox.y,
  //   width: layout.viewBox.width,
  //   height: layout.viewBox.height,
  //   string: layout.viewBox.toString(),
  // });
  
  // console.log('Radii:', {
  //   outer: layout.outerRadius,
  //   inner: layout.innerRadius,
  //   arcWidth: layout.outerRadius - layout.innerRadius,
  //   arcWidthPercent: ((layout.outerRadius - layout.innerRadius) / layout.outerRadius * 100).toFixed(1) + '%',
  // });
  
  // console.log('Center Point:', {
  //   x: layout.gaugeCenter.x,
  //   y: layout.gaugeCenter.y,
  // });
  
  // console.log('Space Utilization:', {
  //   widthUsage: ((layout.outerRadius * 2 / parentWidth) * 100).toFixed(1) + '%',
  //   heightUsage: ((layout.outerRadius * 2 / parentHeight) * 100).toFixed(1) + '%',
  // });
  
  //console.debug('Gauge Type:', gauge.props.type);
  
  console.groupEnd();
};

/**
 * Tracks render count to detect infinite loops
 * Returns a function to call on each render
 */
export const createRenderCounter = (threshold: number = 10) => {
  let renderCount = 0;
  let lastResetTime = Date.now();
  
  return () => {
    renderCount++;
    const now = Date.now();
    const elapsed = now - lastResetTime;
    
    // Reset counter every second
    if (elapsed > 1000) {
      if (renderCount > threshold) {
        console.warn(`⚠️ High render count: ${renderCount} renders in ${elapsed}ms`);
        console.warn('This may indicate an infinite loop or excessive re-rendering');
      }
      renderCount = 0;
      lastResetTime = now;
    }
    
    return renderCount;
  };
};

/**
 * Validates that a layout is valid
 * Throws descriptive errors if something is wrong
 */
export const validateLayout = (layout: GaugeLayout, parentWidth: number, parentHeight: number) => {
  const errors: string[] = [];
  
  // Check for NaN values
  if (isNaN(layout.outerRadius)) errors.push('outerRadius is NaN');
  if (isNaN(layout.innerRadius)) errors.push('innerRadius is NaN');
  if (isNaN(layout.viewBox.width)) errors.push('viewBox.width is NaN');
  if (isNaN(layout.viewBox.height)) errors.push('viewBox.height is NaN');
  
  // Check for invalid values
  if (layout.outerRadius <= 0) errors.push('outerRadius must be positive');
  if (layout.innerRadius < 0) errors.push('innerRadius must be non-negative');
  if (layout.innerRadius > layout.outerRadius) errors.push('innerRadius cannot exceed outerRadius');
  if (layout.viewBox.width <= 0) errors.push('viewBox.width must be positive');
  if (layout.viewBox.height <= 0) errors.push('viewBox.height must be positive');
  
  // Check for unreasonable values
  if (layout.outerRadius > parentWidth * 2) {
    errors.push(`outerRadius (${layout.outerRadius}) is unreasonably large for parent width (${parentWidth})`);
  }
  if (layout.outerRadius > parentHeight * 2) {
    errors.push(`outerRadius (${layout.outerRadius}) is unreasonably large for parent height (${parentHeight})`);
  }
  
  if (errors.length > 0) {
    console.error('❌ Invalid Layout Detected:');
    errors.forEach(err => console.error('  -', err));
    console.error('Layout:', layout);
    throw new Error('Invalid gauge layout: ' + errors.join(', '));
  }
  
  return true;
};

/**
 * Creates a visual test pattern to verify positioning
 * Draws markers at key angles and radii
 */
export const drawTestPattern = (gauge: Gauge) => {
  const testGroup = gauge.g.current.append('g').attr('class', 'test-pattern');
  const { outerRadius, innerRadius } = gauge.dimensions.current;
  
  // Draw angle markers every 45 degrees
  const angles = [0, 45, 90, 135, 180, 225, 270, 315];
  
  angles.forEach(degrees => {
    const radians = (degrees - 90) * Math.PI / 180; // -90 to start from top
    const x = outerRadius * Math.cos(radians);
    const y = outerRadius * Math.sin(radians);
    
    // Marker at outer radius
    testGroup.append('circle')
      .attr('cx', x)
      .attr('cy', y)
      .attr('r', 3)
      .attr('fill', 'orange');
    
    // Label
    testGroup.append('text')
      .attr('x', x * 1.15)
      .attr('y', y * 1.15)
      .attr('text-anchor', 'middle')
      .attr('font-size', '8px')
      .attr('fill', 'orange')
      .text(degrees + '°');
  });
  
  // Draw radius markers
  const radii = [innerRadius, (innerRadius + outerRadius) / 2, outerRadius];
  const radiusLabels = ['inner', 'mid', 'outer'];
  
  radii.forEach((radius, i) => {
    testGroup.append('circle')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', radius)
      .attr('fill', 'none')
      .attr('stroke', 'orange')
      .attr('stroke-width', 0.5)
      .attr('stroke-dasharray', '2,2')
      .attr('opacity', 0.5);
    
    testGroup.append('text')
      .attr('x', 5)
      .attr('y', -radius + 3)
      .attr('font-size', '8px')
      .attr('fill', 'orange')
      .text(radiusLabels[i]);
  });
};

/**
 * Removes test pattern
 */
export const clearTestPattern = (gauge: Gauge) => {
  gauge.g.current.selectAll('.test-pattern').remove();
};

/**
 * Comprehensive debug mode - enables all visualizations
 */
export const enableDebugMode = (gauge: Gauge, layout: GaugeLayout, parentWidth: number, parentHeight: number) => {
  drawDebugOverlay(gauge, layout);
  drawViewBoxBounds(gauge, layout);
  drawTestPattern(gauge);
  logLayoutInfo(gauge, layout, parentWidth, parentHeight);
  validateLayout(layout, parentWidth, parentHeight);
};

/**
 * Disables debug mode - removes all visualizations
 */
export const disableDebugMode = (gauge: Gauge) => {
  clearDebugOverlay(gauge);
  clearViewBoxBounds(gauge);
  clearTestPattern(gauge);
};
