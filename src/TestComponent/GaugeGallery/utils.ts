import React from 'react';
import { ReactElement } from 'react';
import { RANDOM_RANGES, COLOR_THEMES } from './presets';
import { GaugeComponentProps } from '../../lib/GaugeComponent/types/GaugeComponentProps';
import { PointerType } from '../../lib';

const generateFibonacciTicks = (min: number, max: number): { value: number }[] => {
  const range = max - min;
  const ticks: { value: number }[] = [];
  if (range <= 0) {
    return [{ value: min }];
  }

  let a = 1;
  let b = 1;
  const seen = new Set<number>();
  const push = (v: number) => {
    const rounded = Number(v);
    if (!seen.has(rounded)) {
      seen.add(rounded);
      ticks.push({ value: rounded });
    }
  };

  push(min);
  while (true) {
    const next = min + b;
    if (next >= max) break;
    push(next);
    const c = a + b;
    a = b;
    b = c;
  }
  push(max);

  return ticks;
};

/**
 * Default Grafana Neon configuration for the editor
 */
export const GRAFANA_NEON_CONFIG: Partial<GaugeComponentProps> = {
  type: 'grafana',
  minValue: 0,
  maxValue: 108,
  arc: {
    width: 0.55,
    cornerRadius: 0,
    nbSubArcs: 52,
    colorArray: ['#ff00ff', '#00ffff', '#ffff00', '#ff0080'],
    padding: 0,
    subArcsStrokeWidth: 1,
    subArcsStrokeColor: '#000000',
    effects: { glow: true, glowBlur: 1, glowSpread: 2 },
  },
  pointer: {
    type: 'needle',
    elastic: false,
    animationDelay: 200,
    animationDuration: 1000,
    length: 0.87,
    width: 24,
    baseColor: '#ffffff',
    strokeWidth: 2,
    strokeColor: '#000000',
    maxFps: 60,
    animationThreshold: 0.0096,
  },
  labels: {
    valueLabel: {
      matchColorWithArc: true,
      style: { fontSize: '29px', fontWeight: 'bold' },
      offsetY: 25,
      animateValue: true
    },
    tickLabels: {
      type: 'outer',
      hideMinMax: false,
      autoSpaceTickLabels: true,
      ticks: [
        { value: 0 },
        { value: 4 },
        { value: 8 },
        { value: 15},
        { value: 16 },
        { value: 23 },
        { value: 42 },
        { value: 108 },
      ],
    },
  },
};

/**
 * Generate a random gauge configuration
 */
export const generateRandomConfig = (): Partial<GaugeComponentProps> => {
  const types = ['semicircle', 'radial', 'grafana'] as const;
  const pointerTypes = ['needle', 'blob', 'arrow'] as const;
  
  const randomType = types[Math.floor(Math.random() * types.length)];
  const randomPointer = pointerTypes[Math.floor(Math.random() * pointerTypes.length)];
  const randomTheme = COLOR_THEMES[Math.floor(Math.random() * COLOR_THEMES.length)];
  const randomRange = RANDOM_RANGES[Math.floor(Math.random() * RANDOM_RANGES.length)];
  const useGradient = Math.random() > 0.93; // 7% chance of gradient
  const hidePointer = Math.random() > 0.92; // 8% chance to hide pointer
  const useMultiPointer = Math.random() > 0.85; // 15% chance of multi-pointer
  const useGlow = Math.random() > 0.7; // 30% chance of glow effect
  const useArcStroke = Math.random() > 0.75; // 25% chance of arc stroke
  const useCustomAngles = Math.random() > 0.85; // 15% chance of custom angles
  
  // Arc width: variety from very thin to thick
  const arcWidthRand = Math.random();
  const arcWidth = arcWidthRand < 0.15
    ? 0.05 + Math.random() * 0.05  // Very thin (5-10%) - 15% chance
    : arcWidthRand < 0.4
      ? 0.1 + Math.random() * 0.1  // Thin (10-20%) - 25% chance
      : arcWidthRand < 0.75
        ? 0.15 + Math.random() * 0.15  // Medium (15-30%) - 35% chance
        : 0.3 + Math.random() * 0.25;   // Thick (30-55%) - 25% chance
  
  // Corner radius: sometimes add rounded corners
  const cornerRadius = Math.random() > 0.6 ? Math.floor(Math.random() * 10) : 0;
  
  const numColors = randomTheme.colors.length;
  
  // For gradient mode: use subArcs with length distribution
  const gradientSubArcs = randomTheme.colors.map((color) => ({
    length: 1 / numColors,
    color,
  }));
  
  // Generate random tick intervals
  const generateTicks = (): { value: number }[] => {
    const { minValue, maxValue } = randomRange;
    const range = maxValue - minValue;
    const numTicks = Math.floor(Math.random() * 4) + 3;
    const tickOptions: { value: number }[][] = [
      [], // No ticks
      [{ value: minValue }, { value: maxValue }], // Min/Max only
      [{ value: minValue }, { value: minValue + range * 0.5 }, { value: maxValue }], // Min/Mid/Max
      // Custom intervals
      Array.from({ length: numTicks }, (_: unknown, i: number) => ({
        value: minValue + (range * i) / (numTicks - 1)
      })),
      // Random positions
      Array.from({ length: Math.floor(Math.random() * 5) + 2 }, () => ({
        value: Math.round(minValue + Math.random() * range)
      })).sort((a, b) => a.value - b.value),
    ];
    return tickOptions[Math.floor(Math.random() * tickOptions.length)];
  };
  
  // Arc mode: subArcs with limits (like fuel gauge) vs colorArray with nbSubArcs
  const useSubArcsWithLimits = Math.random() > 0.6; // 40% chance of custom subArc limits
  
  // Generate subArcs with custom limits (unequal segments)
  const generateSubArcsWithLimits = () => {
    const { minValue, maxValue } = randomRange;
    const range = maxValue - minValue;
    const colors = randomTheme.colors;
    
    // Different limit patterns
    const patterns = [
      // Warning zone at start (like fuel gauge - red when low)
      () => {
        const warningLimit = minValue + range * (0.15 + Math.random() * 0.15); // 15-30%
        return [
          { limit: warningLimit, color: colors[0], showTick: true },
          { color: colors[colors.length - 1] }
        ];
      },
      // Warning zone at end (like speed - red when high)
      () => {
        const safeLimit = minValue + range * (0.7 + Math.random() * 0.15); // 70-85%
        return [
          { limit: safeLimit, color: colors[colors.length - 1], showTick: true },
          { color: colors[0] }
        ];
      },
      // Three zones (low/mid/high)
      () => {
        const lowLimit = minValue + range * (0.25 + Math.random() * 0.1);
        const midLimit = minValue + range * (0.6 + Math.random() * 0.15);
        return [
          { limit: lowLimit, color: colors[0], showTick: true },
          { limit: midLimit, color: colors[Math.floor(colors.length / 2)] || colors[1], showTick: true },
          { color: colors[colors.length - 1] }
        ];
      },
      // Performance zones (green/yellow/red)
      () => {
        const goodLimit = minValue + range * (0.4 + Math.random() * 0.2);
        const warnLimit = minValue + range * (0.75 + Math.random() * 0.1);
        return [
          { limit: goodLimit, color: '#5BE12C', showTick: true },
          { limit: warnLimit, color: '#F5CD19', showTick: true },
          { color: '#EA4228' }
        ];
      },
      // Inverse performance (red/yellow/green)
      () => {
        const badLimit = minValue + range * (0.2 + Math.random() * 0.1);
        const warnLimit = minValue + range * (0.5 + Math.random() * 0.15);
        return [
          { limit: badLimit, color: '#EA4228', showTick: true },
          { limit: warnLimit, color: '#F5CD19', showTick: true },
          { color: '#5BE12C' }
        ];
      },
    ];
    
    return patterns[Math.floor(Math.random() * patterns.length)]();
  };
  
  // SubArc count variation (for colorArray mode)
  // When using exact color count, colors will be distinct
  // When using multiples or large numbers, colors interpolate smoothly
  const nbSubArcs = Math.random() > 0.5 
    ? numColors  // Exact color count - each segment gets one color (50% chance)
    : Math.random() > 0.5 
      ? numColors * (2 + Math.floor(Math.random() * 3)) // Multiples of colors (2x-4x)
      : 30 + Math.floor(Math.random() * 120); // Many segments - smooth gradient effect
  
  // Padding variation
  const padding = Math.random() > 0.7 
    ? 0  // No padding
    : Math.random() > 0.5 
      ? 0.002 + Math.random() * 0.008  // Small padding
      : 0.01 + Math.random() * 0.03;    // Large padding
  
  // Pointer customization
  const pointerLength = 0.5 + Math.random() * 0.4; // 0.5 to 0.9
  const pointerWidth = 8 + Math.floor(Math.random() * 20); // 8 to 28
  const pointerBaseColor = Math.random() > 0.5 
    ? '#ffffff' 
    : randomTheme.colors[Math.floor(Math.random() * randomTheme.colors.length)];
  
  // Value label font size variation
  const fontSize = 18 + Math.floor(Math.random() * 30); // 18 to 48
  
  // Ticks configuration
  const ticks = generateTicks();
  const ticksConfig = Math.random() > 0.4 ? {
    type: Math.random() > 0.5 ? ('outer' as const) : ('inner' as const),
    hideMinMax: Math.random() > 0.5,
    ...(ticks.length > 0 ? { ticks } : {}),
  } : { hideMinMax: true };
  
  // Determine arc configuration mode
  const getArcConfig = () => {
    if (useGradient) {
      // Gradient mode - smooth color transition
      return {
        gradient: true,
        subArcs: gradientSubArcs,
        nbSubArcs: undefined,
        colorArray: undefined,
        padding: undefined,
      };
    } else if (useSubArcsWithLimits) {
      // SubArcs with limits - like fuel gauge, performance zones
      return {
        gradient: false,
        subArcs: generateSubArcsWithLimits(),
        nbSubArcs: undefined,
        colorArray: undefined,
        padding: padding > 0.015 ? padding * 0.5 : padding, // Less padding for few segments
      };
    } else {
      // ColorArray with nbSubArcs - many segments with interpolated colors
      return {
        gradient: false,
        subArcs: [],
        nbSubArcs: nbSubArcs,
        colorArray: [...randomTheme.colors],
        padding: padding,
      };
    }
  };
  
  const arcConfig = getArcConfig();
  
  // Generate glow effect configuration
  const glowConfig = useGlow ? {
    effects: {
      glow: true,
      glowBlur: 1 + Math.floor(Math.random() * 4), // 1-4
      glowSpread: 1 + Math.floor(Math.random() * 5), // 1-5
    }
  } : {};
  
  // Generate arc stroke configuration
  const strokeConfig = useArcStroke ? {
    subArcsStrokeWidth: 1 + Math.floor(Math.random() * 3), // 1-3
    subArcsStrokeColor: Math.random() > 0.5 ? '#000000' : 'rgba(255,255,255,0.3)',
  } : {};
  
  // Generate custom angles (for non-standard gauge shapes)
  const anglesConfig = useCustomAngles ? (() => {
    const angleStyles = [
      { startAngle: -90, endAngle: 90 }, // Top half
      { startAngle: 0, endAngle: 180 }, // Right half
      { startAngle: -120, endAngle: 120 }, // Wide arc
      { startAngle: -60, endAngle: 60 }, // Narrow arc
      { startAngle: -135, endAngle: 135 }, // Very wide arc
      { startAngle: -45, endAngle: 225 }, // Three quarters
    ];
    return angleStyles[Math.floor(Math.random() * angleStyles.length)];
  })() : {};
  
  // Generate multi-pointer configuration
  const generateMultiPointers = () => {
    const { minValue, maxValue } = randomRange;
    const range = maxValue - minValue;
    const numPointers = 2 + Math.floor(Math.random() * 2); // 2-3 pointers
    const pointerColors = ['#5BE12C', '#F5CD19', '#EA4228', '#60a5fa', '#a855f7'];
    
    return Array.from({ length: numPointers }, (_, i) => ({
      value: minValue + (range * (0.2 + i * 0.3)) + (Math.random() * range * 0.2),
      type: pointerTypes[Math.floor(Math.random() * pointerTypes.length)],
      color: pointerColors[i % pointerColors.length],
      length: 0.5 + Math.random() * 0.3,
      width: 10 + Math.floor(Math.random() * 15),
    }));
  };
  
  // Animation duration variation
  const animationDuration = 500 + Math.floor(Math.random() * 2500); // 500-3000ms
  
  // Build pointer/pointers config
  const pointerConfig = hidePointer 
    ? { pointer: { hide: true } }
    : useMultiPointer 
      ? { pointers: generateMultiPointers() }
      : {
          pointer: {
            type: randomPointer,
            elastic: Math.random() > 0.5,
            animationDelay: Math.random() > 0.5 ? 0 : 150,
            animationDuration,
            length: pointerLength,
            width: pointerWidth,
            color: Math.random() > 0.6 ? undefined : (Math.random() > 0.5 ? '#fff' : randomTheme.colors[randomTheme.colors.length - 1]),
            baseColor: pointerBaseColor,
            strokeWidth: Math.random() > 0.7 ? Math.floor(Math.random() * 3) : 0,
            strokeColor: Math.random() > 0.5 ? '#000' : 'rgba(255,255,255,0.5)',
            maxFps: 30 + Math.floor(Math.random() * 31), // 30-60 fps
          }
        };
  
  return {
    type: randomType,
    minValue: randomRange.minValue,
    maxValue: randomRange.maxValue,
    ...anglesConfig,
    arc: {
      width: arcWidth,
      cornerRadius,
      ...arcConfig,
      ...glowConfig,
      ...strokeConfig,
    },
    ...pointerConfig,
    labels: {
      valueLabel: {
        formatTextValue: randomRange.format,
        matchColorWithArc: Math.random() > 0.4,
        style: { fontSize: `${fontSize}px`, fontWeight: Math.random() > 0.3 ? 'bold' : 'normal' },
        hide: Math.random() > 0.9, // 10% chance to hide value label
        animateValue: Math.random() > 0.5, // 50% chance of animated value
      },
      tickLabels: ticksConfig,
    },
  };
};

/**
 * Generate a random LinearGaugeComponent configuration
 */
export const generateRandomLinearConfig = (): Partial<any> => {
  const orientations = ['horizontal', 'vertical'] as const;
  const pointerTypes = ['triangle', 'arrow', 'diamond', 'line', 'pill', 'none'] as const;
  const tickPositions = {
    horizontal: ['top', 'bottom', 'inside-top', 'inside-bottom'] as const,
    vertical: ['left', 'right', 'inside-left', 'inside-right'] as const,
  };
  const valueLabelPositions = ['center', 'right', 'left', 'top', 'bottom'] as const;
  const pointerPositions = {
    horizontal: ['top', 'bottom', 'both'] as const,
    vertical: ['left', 'right', 'both'] as const,
  };
  
  const orientation = orientations[Math.floor(Math.random() * orientations.length)];
  const isHorizontal = orientation === 'horizontal';
  
  // Random ranges
  const ranges = [
    { min: 0, max: 100 },
    { min: 0, max: 1 },
    { min: -50, max: 50 },
    { min: 0, max: 255 },
    { min: 20, max: 80 },
    { min: 0, max: 1000 },
  ];
  const randomRange = ranges[Math.floor(Math.random() * ranges.length)];
  
  // Color themes for segments
  const colorThemes = [
    ['#5BE12C', '#F5CD19', '#EA4228'], // Traffic light
    ['#00bcd4', '#4caf50', '#ff9800', '#f44336'], // Cool to hot
    ['#3f51b5', '#9c27b0', '#e91e63'], // Purple gradient
    ['#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ff9800'], // Nature
    ['#2196f3', '#03a9f4', '#00bcd4', '#009688'], // Blues
    ['#f44336', '#ff5722', '#ff9800', '#ffc107'], // Warm
    ['#607d8b', '#9e9e9e', '#bdbdbd'], // Grayscale
    ['#e91e63', '#9c27b0', '#673ab7', '#3f51b5'], // Vibrant
  ];
  const randomTheme = colorThemes[Math.floor(Math.random() * colorThemes.length)];
  
  // Generate segments with random limits
  const numSegments = randomTheme.length;
  const segments = randomTheme.map((color, i) => {
    if (i === numSegments - 1) {
      return { color };
    }
    const segmentEnd = randomRange.min + ((randomRange.max - randomRange.min) * (i + 1)) / numSegments;
    return { limit: Math.round(segmentEnd * 100) / 100, color };
  });
  
  // Track configuration
  const thickness = 12 + Math.floor(Math.random() * 40); // 12-52
  const borderRadius = Math.random() > 0.4 ? Math.floor(Math.random() * (thickness / 2)) : 0;
  const useGradient = Math.random() > 0.85;
  const showSubLine = Math.random() > 0.6;
  
  // Background colors
  const bgColors = ['#e0e0e0', '#f5f5f5', '#263238', '#37474f', '#eceff1', '#cfd8dc'];
  const bgColor = bgColors[Math.floor(Math.random() * bgColors.length)];
  
  // Pointer configuration
  const pointerType = pointerTypes[Math.floor(Math.random() * pointerTypes.length)];
  const pointerPos = isHorizontal 
    ? pointerPositions.horizontal[Math.floor(Math.random() * pointerPositions.horizontal.length)]
    : pointerPositions.vertical[Math.floor(Math.random() * pointerPositions.vertical.length)];
  const showFill = Math.random() > 0.3; // 70% chance of fill
  const pointerColors = ['#333', '#666', '#000', '#1976d2', '#d32f2f', '#388e3c'];
  
  // Ticks configuration
  const tickPos = isHorizontal
    ? tickPositions.horizontal[Math.floor(Math.random() * tickPositions.horizontal.length)]
    : tickPositions.vertical[Math.floor(Math.random() * tickPositions.vertical.length)];
  const tickCount = 3 + Math.floor(Math.random() * 8); // 3-10
  const minorTicks = Math.floor(Math.random() * 5); // 0-4
  const hideMinMax = Math.random() > 0.8;
  const labelsInside = tickPos.startsWith('inside-') && Math.random() > 0.5;
  
  // Value label configuration
  const hideValueLabel = Math.random() > 0.85;
  const valueLabelPos = valueLabelPositions[Math.floor(Math.random() * valueLabelPositions.length)];
  const matchColorWithSegment = Math.random() > 0.5;
  const fontSizes = ['12px', '14px', '16px', '18px', '20px', '24px'];
  const fontSize = fontSizes[Math.floor(Math.random() * fontSizes.length)];
  
  // Random value within range
  const value = randomRange.min + Math.random() * (randomRange.max - randomRange.min);
  
  return {
    orientation,
    minValue: randomRange.min,
    maxValue: randomRange.max,
    track: {
      thickness,
      backgroundColor: bgColor,
      borderRadius,
      segments,
      gradient: useGradient,
      ...(showSubLine ? {
        subLine: {
          show: true,
          thickness: 2 + Math.floor(Math.random() * 6),
          offset: Math.floor(Math.random() * 10) - 5,
          opacity: 0.3 + Math.random() * 0.5,
        }
      } : {}),
    },
    pointer: pointerType !== 'none' ? {
      type: pointerType,
      color: pointerColors[Math.floor(Math.random() * pointerColors.length)],
      size: 8 + Math.floor(Math.random() * 16),
      position: pointerPos,
      showFill,
      ...(Math.random() > 0.7 ? { offsetY: Math.floor(Math.random() * 10) } : {}),
    } : { type: 'none' },
    ticks: {
      count: tickCount,
      minorTicks,
      position: tickPos,
      hideMinMax,
      labelsInside,
      majorTickLength: 8 + Math.floor(Math.random() * 12),
      minorTickLength: 4 + Math.floor(Math.random() * 6),
    },
    valueLabel: {
      hide: hideValueLabel,
      position: valueLabelPos,
      matchColorWithSegment,
      style: {
        fontSize,
        fontWeight: Math.random() > 0.5 ? 'bold' : 'normal',
      },
      ...(Math.random() > 0.7 ? { 
        offsetX: Math.floor(Math.random() * 20) - 10,
        offsetY: Math.floor(Math.random() * 20) - 10,
      } : {}),
    },
    __initialValue: Math.round(value * 100) / 100,
  };
};

/**
 * Format a value for JSX output
 */
const formatJsxValue = (val: any, indent: string = ''): string => {
  if (val === null) return 'null';
  if (val === undefined) return 'undefined';
  if (typeof val === 'function') {
    // Keep function as-is
    return val.toString();
  }
  if (typeof val === 'string') return `"${val.replace(/"/g, '\\"')}"`;
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  if (Array.isArray(val)) {
    if (val.length === 0) return '[]';
    const items = val.map(v => formatJsxValue(v, indent + '  '));
    // Keep arrays compact if they're simple
    const isSimple = val.every(v => typeof v !== 'object' || v === null);
    if (isSimple && items.join(', ').length < 60) {
      return `[${items.join(', ')}]`;
    }
    return `[\n${indent}    ${items.join(`,\n${indent}    `)}\n${indent}  ]`;
  }
  if (typeof val === 'object') {
    const entries = Object.entries(val).filter(([_, v]) => v !== undefined);
    // Filter out internal properties that start with __
    const filteredEntries = entries.filter(([k]) => !k.startsWith('__'));
    if (filteredEntries.length === 0) return '{}';
    const formatted = filteredEntries.map(([k, v]) => `${k}: ${formatJsxValue(v, indent + '  ')}`);
    // Keep objects compact if they're simple
    if (formatted.join(', ').length < 50) {
      return `{ ${formatted.join(', ')} }`;
    }
    return `{\n${indent}    ${formatted.join(`,\n${indent}    `)}\n${indent}  }`;
  }
  return String(val);
};

/**
 * Stringify config for clipboard copy - outputs proper JSX
 */
export const stringifyConfig = (config: any, value: number, componentName: string = 'GaugeComponent'): string => {
  const props: string[] = [];
  props.push(`  value={${value}}`);
  
  Object.entries(config).forEach(([key, val]) => {
    if (val === undefined) return;
    if (key === 'value') return; // Skip value - already added above
    if (typeof val === 'string') {
      props.push(`  ${key}="${val}"`);
    } else {
      props.push(`  ${key}={${formatJsxValue(val, '  ')}}`);
    }
  });
  
  return `<${componentName}\n${props.join('\n')}\n/>`;
};

/**
 * Copy text to clipboard with visual feedback
 */
export const copyToClipboard = async (
  config: any, 
  value: number, 
  onSuccess: () => void
): Promise<void> => {
  const code = stringifyConfig(config, value);
  try {
    await navigator.clipboard.writeText(code);
    onSuccess();
  } catch (err) {
    console.error('Failed to copy:', err);
  }
};

/**
 * Copy JSX element to clipboard - extracts props from the element
 */
export const copyToClipboardFromJsx = async (
  element: ReactElement,
  onSuccess: () => void
): Promise<void> => {
  const { value, ...config } = element.props;
  const code = stringifyConfig(config, value);
  try {
    await navigator.clipboard.writeText(code);
    onSuccess();
  } catch (err) {
    console.error('Failed to copy:', err);
  }
};

/**
 * Get initial value for a preset config
 */
export const getInitialValue = (config: any): number => {
  const min = config?.minValue ?? 0;
  const max = config?.maxValue ?? 100;
  return min + (max - min) * 0.5;
};

/**
 * Parse a JSX-formatted GaugeComponent string back into config object.
 * This is the inverse of stringifyConfig.
 * 
 * @param jsxString - The JSX string to parse (e.g., "<GaugeComponent value={50} ... />")
 * @returns Parsed config object with extracted properties
 */
export const parseJsxConfig = (jsxString: string): { config: Partial<GaugeComponentProps>; value?: number; strippedFunctions: string[] } => {
  const result: any = {};
  
  // Clean up the string - remove newlines and normalize whitespace
  const cleanedString = jsxString.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
  
  // Check if it's a JSX GaugeComponent
  if (!cleanedString.includes('<GaugeComponent') && !cleanedString.includes('<Gauge')) {
    // Try to parse as plain JSON
    try {
      const parsed = JSON.parse(jsxString);
      const { value, ...config } = parsed;
      const strippedFunctions: string[] = [];
      const cleanedConfig = removeFunctionStrings(config, strippedFunctions);
      return { config: cleanedConfig, value, strippedFunctions };
    } catch {
      throw new Error('Not a valid JSX or JSON format');
    }
  }
  
  // Extract all props from JSX
  let i = 0;
  const str = cleanedString;
  
  // Find the start of props (after component name)
  const componentStart = str.indexOf('<GaugeComponent') !== -1 
    ? str.indexOf('<GaugeComponent') + '<GaugeComponent'.length
    : str.indexOf('<Gauge') + '<Gauge'.length;
  
  i = componentStart;
  
  while (i < str.length) {
    // Skip whitespace
    while (i < str.length && /\s/.test(str[i])) i++;
    
    // Check for end of component
    if (str[i] === '/' || str[i] === '>') break;
    
    // Extract prop name
    const propNameMatch = str.slice(i).match(/^(\w+)\s*=/);
    if (!propNameMatch) {
      i++;
      continue;
    }
    
    const propName = propNameMatch[1];
    i += propNameMatch[0].length;
    
    // Skip whitespace after =
    while (i < str.length && /\s/.test(str[i])) i++;
    
    // Extract prop value
    const { value: propValue, endIndex } = extractPropValue(str, i);
    i = endIndex;
    
    result[propName] = propValue;
  }
  
  // Separate value from config and clean up function strings
  const { value, ...config } = result;
  const strippedFunctions: string[] = [];
  const cleanedConfig = removeFunctionStrings(config, strippedFunctions);
  return { config: cleanedConfig, value, strippedFunctions };
};

/**
 * Recursively remove properties that look like function strings.
 * Functions cannot be safely serialized/deserialized, so we remove them.
 */
function removeFunctionStrings(obj: any, strippedFunctions: string[] = [], path: string = ''): any {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) {
    return obj.map((item, idx) => removeFunctionStrings(item, strippedFunctions, `${path}[${idx}]`));
  }
  if (typeof obj === 'object') {
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      const currentPath = path ? `${path}.${key}` : key;
      // Skip properties that are function strings or known function property names
      const isFunctionString = typeof value === 'string' && (
        value.includes('=>') || 
        value.startsWith('function')
      );
      const isFunctionKey = ['renderContent', 'formatTextValue', 'onValueChange', 'onPointerChange', 'onClick', 'onMouseMove', 'onMouseLeave'].includes(key);
      
      if (isFunctionString || (isFunctionKey && value !== undefined)) {
        // Store function as string for later evaluation
        result[key] = value;
        strippedFunctions.push(currentPath);
        continue;
      }
      result[key] = removeFunctionStrings(value, strippedFunctions, currentPath);
    }
    return result;
  }
  // For primitive values that are function strings, return undefined
  if (typeof obj === 'string' && (obj.includes('=>') || obj.startsWith('function'))) {
    return undefined;
  }
  return obj;
}

/**
 * Safely evaluate function strings in a config object.
 * Uses Function constructor with limited scope to avoid eval.
 */
export const evaluateFunctions = (config: any): any => {
  if (config === null || config === undefined) return config;
  if (Array.isArray(config)) {
    return config.map(item => evaluateFunctions(item));
  }
  if (typeof config === 'object') {
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(config)) {
      if (typeof value === 'string' && (
        value.includes('=>') || 
        value.startsWith('function')
      )) {
        try {
          // Use Function constructor instead of eval for better security
          // Create a function that returns the actual function with React bound
          const funcFactory = new Function('React', `
            "use strict";
            return ${value};
          `);
          result[key] = funcFactory(React);
        } catch (e) {
          console.warn(`Failed to evaluate function for ${key}:`, e);
          // Keep as string if evaluation fails
          result[key] = value;
        }
      } else {
        result[key] = evaluateFunctions(value);
      }
    }
    return result;
  }
  return config;
};

/**
 * Extract a prop value from a JSX string starting at given index.
 * Handles strings, numbers, booleans, objects, arrays, and functions.
 */
function extractPropValue(str: string, start: number): { value: any; endIndex: number } {
  const char = str[start];
  
  // String value with quotes: prop="value" or prop='value'
  if (char === '"' || char === "'") {
    const quote = char;
    let end = start + 1;
    while (end < str.length && str[end] !== quote) {
      if (str[end] === '\\') end++; // Skip escaped chars
      end++;
    }
    return {
      value: str.slice(start + 1, end).replace(/\\(.)/g, '$1'),
      endIndex: end + 1
    };
  }
  
  // JSX expression: prop={...}
  if (char === '{') {
    const { content, endIndex } = extractBracedContent(str, start);
    const parsedValue = parseJsxExpression(content.trim());
    return { value: parsedValue, endIndex };
  }
  
  // Fallback - read until whitespace
  let end = start;
  while (end < str.length && !/[\s/>]/.test(str[end])) end++;
  return { value: str.slice(start, end), endIndex: end };
}

/**
 * Extract content between matching braces, handling nested braces and strings.
 */
function extractBracedContent(str: string, start: number): { content: string; endIndex: number } {
  if (str[start] !== '{') {
    return { content: '', endIndex: start };
  }
  
  let depth = 1;
  let end = start + 1;
  let inString: string | null = null;
  
  while (end < str.length && depth > 0) {
    const char = str[end];
    
    // Handle string literals
    if (!inString && (char === '"' || char === "'" || char === '`')) {
      inString = char;
    } else if (inString === char && str[end - 1] !== '\\') {
      inString = null;
    } else if (!inString) {
      if (char === '{') depth++;
      if (char === '}') depth--;
    }
    
    if (depth > 0) end++;
  }
  
  return {
    content: str.slice(start + 1, end),
    endIndex: end + 1
  };
}

/**
 * Parse a JSX expression (content inside {...}).
 * Converts JavaScript-like syntax to actual values.
 */
function parseJsxExpression(expr: string): any {
  const trimmed = expr.trim();
  
  // Empty
  if (!trimmed) return undefined;
  
  // Boolean
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  
  // Null/undefined
  if (trimmed === 'null') return null;
  if (trimmed === 'undefined') return undefined;
  
  // Number
  if (/^-?\d+\.?\d*$/.test(trimmed)) {
    return Number(trimmed);
  }
  
  // String (already quoted)
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1).replace(/\\(.)/g, '$1');
  }
  
  // Array
  if (trimmed.startsWith('[')) {
    return parseJsxArray(trimmed);
  }
  
  // Object
  if (trimmed.startsWith('{')) {
    return parseJsxObject(trimmed);
  }
  
  // Arrow function or function
  if (trimmed.includes('=>') || trimmed.startsWith('function')) {
    // Return the function as a string - can't safely evaluate
    // But for formatTextValue type functions, try to preserve them
    return trimmed;
  }
  
  // Fallback - return as string
  return trimmed;
}

/**
 * Parse a JSX-style array: [item1, item2, ...]
 */
function parseJsxArray(str: string): any[] {
  const trimmed = str.trim();
  if (!trimmed.startsWith('[') || !trimmed.endsWith(']')) {
    return [];
  }
  
  const content = trimmed.slice(1, -1).trim();
  if (!content) return [];
  
  const items: any[] = [];
  let i = 0;
  
  while (i < content.length) {
    // Skip whitespace and commas
    while (i < content.length && /[\s,]/.test(content[i])) i++;
    if (i >= content.length) break;
    
    // Extract item
    const { value, endIndex } = extractArrayItem(content, i);
    items.push(value);
    i = endIndex;
  }
  
  return items;
}

/**
 * Extract a single item from an array string.
 */
function extractArrayItem(str: string, start: number): { value: any; endIndex: number } {
  const char = str[start];
  
  // Object
  if (char === '{') {
    const { content, endIndex } = extractBracedContentSimple(str, start, '{', '}');
    return { value: parseJsxObject('{' + content + '}'), endIndex };
  }
  
  // Array
  if (char === '[') {
    const { content, endIndex } = extractBracedContentSimple(str, start, '[', ']');
    return { value: parseJsxArray('[' + content + ']'), endIndex };
  }
  
  // String
  if (char === '"' || char === "'") {
    const quote = char;
    let end = start + 1;
    while (end < str.length && str[end] !== quote) {
      if (str[end] === '\\') end++;
      end++;
    }
    return {
      value: str.slice(start + 1, end).replace(/\\(.)/g, '$1'),
      endIndex: end + 1
    };
  }
  
  // Number, boolean, or identifier
  let end = start;
  while (end < str.length && !/[,\]\s]/.test(str[end])) end++;
  const token = str.slice(start, end).trim();
  
  if (token === 'true') return { value: true, endIndex: end };
  if (token === 'false') return { value: false, endIndex: end };
  if (token === 'null') return { value: null, endIndex: end };
  if (/^-?\d+\.?\d*$/.test(token)) return { value: Number(token), endIndex: end };
  
  return { value: token, endIndex: end };
}

/**
 * Parse a JSX-style object: { key: value, ... }
 */
function parseJsxObject(str: string): Record<string, any> {
  const trimmed = str.trim();
  if (!trimmed.startsWith('{') || !trimmed.endsWith('}')) {
    return {};
  }
  
  const content = trimmed.slice(1, -1).trim();
  if (!content) return {};
  
  const result: Record<string, any> = {};
  let i = 0;
  
  while (i < content.length) {
    // Skip whitespace and commas
    while (i < content.length && /[\s,]/.test(content[i])) i++;
    if (i >= content.length) break;
    
    // Extract key
    const keyMatch = content.slice(i).match(/^(['"]?)(\w+)\1\s*:/);
    if (!keyMatch) {
      i++;
      continue;
    }
    
    const key = keyMatch[2];
    i += keyMatch[0].length;
    
    // Skip whitespace after colon
    while (i < content.length && /\s/.test(content[i])) i++;
    
    // Extract value
    const { value, endIndex } = extractObjectValue(content, i);
    result[key] = value;
    i = endIndex;
  }
  
  return result;
}

/**
 * Extract a value from an object string.
 */
function extractObjectValue(str: string, start: number): { value: any; endIndex: number } {
  const char = str[start];
  
  // Check for arrow function: (params) => ... or identifier => ...
  // This must come BEFORE other checks to avoid parsing function innards
  if (char === '(') {
    // Could be arrow function params or just a parenthesized expression
    // Look ahead to see if there's a => after the closing paren
    const parenResult = extractBalancedParens(str, start);
    const afterParen = str.slice(parenResult.endIndex).trimStart();
    if (afterParen.startsWith('=>')) {
      // It's an arrow function - extract the entire function including body
      const funcResult = extractArrowFunction(str, start);
      return { value: funcResult.content, endIndex: funcResult.endIndex };
    }
    // Otherwise treat as parenthesized expression (fall through to default handling)
  }
  
  // Check for function keyword
  if (str.slice(start, start + 8) === 'function') {
    const funcResult = extractFunctionBody(str, start);
    return { value: funcResult.content, endIndex: funcResult.endIndex };
  }
  
  // Nested object
  if (char === '{') {
    const { content, endIndex } = extractBracedContentSimple(str, start, '{', '}');
    return { value: parseJsxObject('{' + content + '}'), endIndex };
  }
  
  // Array
  if (char === '[') {
    const { content, endIndex } = extractBracedContentSimple(str, start, '[', ']');
    return { value: parseJsxArray('[' + content + ']'), endIndex };
  }
  
  // String
  if (char === '"' || char === "'") {
    const quote = char;
    let end = start + 1;
    while (end < str.length && str[end] !== quote) {
      if (str[end] === '\\') end++;
      end++;
    }
    return {
      value: str.slice(start + 1, end).replace(/\\(.)/g, '$1'),
      endIndex: end + 1
    };
  }
  
  // Check for identifier followed by => (single param arrow function without parens)
  const identArrowMatch = str.slice(start).match(/^(\w+)\s*=>/);
  if (identArrowMatch) {
    const funcResult = extractArrowFunction(str, start);
    return { value: funcResult.content, endIndex: funcResult.endIndex };
  }
  
  // Number, boolean, null, or identifier (read until comma or closing brace)
  let end = start;
  let depth = 0;
  let inString: string | null = null;
  while (end < str.length) {
    const c = str[end];
    
    // Handle strings
    if (!inString && (c === '"' || c === "'")) {
      inString = c;
    } else if (inString === c && str[end - 1] !== '\\') {
      inString = null;
    } else if (!inString) {
      if (c === '{' || c === '[' || c === '(') depth++;
      if (c === '}' || c === ']' || c === ')') {
        if (depth === 0) break;
        depth--;
      }
      if (c === ',' && depth === 0) break;
    }
    end++;
  }
  
  const token = str.slice(start, end).trim();
  
  if (token === 'true') return { value: true, endIndex: end };
  if (token === 'false') return { value: false, endIndex: end };
  if (token === 'null') return { value: null, endIndex: end };
  if (token === 'undefined') return { value: undefined, endIndex: end };
  if (/^-?\d+\.?\d*$/.test(token)) return { value: Number(token), endIndex: end };
  
  // Check if it's a function
  if (token.includes('=>') || token.startsWith('function')) {
    return { value: token, endIndex: end };
  }
  
  return { value: token, endIndex: end };
}

/**
 * Extract balanced parentheses content
 */
function extractBalancedParens(str: string, start: number): { content: string; endIndex: number } {
  if (str[start] !== '(') {
    return { content: '', endIndex: start };
  }
  
  let depth = 1;
  let end = start + 1;
  let inString: string | null = null;
  
  while (end < str.length && depth > 0) {
    const char = str[end];
    
    if (!inString && (char === '"' || char === "'" || char === '`')) {
      inString = char;
    } else if (inString === char && str[end - 1] !== '\\') {
      inString = null;
    } else if (!inString) {
      if (char === '(') depth++;
      if (char === ')') depth--;
    }
    
    if (depth > 0) end++;
  }
  
  return {
    content: str.slice(start + 1, end),
    endIndex: end + 1
  };
}

/**
 * Extract an arrow function including its body
 */
function extractArrowFunction(str: string, start: number): { content: string; endIndex: number } {
  let end = start;
  let inString: string | null = null;
  let depth = { paren: 0, brace: 0, bracket: 0, angle: 0 };
  let foundArrow = false;
  let bodyStart = -1;
  
  while (end < str.length) {
    const char = str[end];
    const nextChar = str[end + 1];
    
    // Handle strings
    if (!inString && (char === '"' || char === "'" || char === '`')) {
      inString = char;
    } else if (inString === char && str[end - 1] !== '\\') {
      inString = null;
    } else if (!inString) {
      // Track brackets
      if (char === '(') depth.paren++;
      if (char === ')') depth.paren--;
      if (char === '{') depth.brace++;
      if (char === '}') depth.brace--;
      if (char === '[') depth.bracket++;
      if (char === ']') depth.bracket--;
      if (char === '<') depth.angle++;
      if (char === '>') depth.angle--;
      
      // Found arrow
      if (char === '=' && nextChar === '>' && !foundArrow) {
        foundArrow = true;
        end += 2;
        // Skip whitespace after arrow
        while (end < str.length && /\s/.test(str[end])) end++;
        bodyStart = end;
        continue;
      }
      
      // After finding arrow, check for end of function
      if (foundArrow && bodyStart >= 0) {
        const totalDepth = depth.paren + depth.brace + depth.bracket + depth.angle;
        
        // If we're at depth 0 and hit a comma or end brace, we're done
        if (totalDepth <= 0 && (char === ',' || (char === '}' && depth.brace < 0))) {
          break;
        }
      }
    }
    
    end++;
  }
  
  return {
    content: str.slice(start, end).trim(),
    endIndex: end
  };
}

/**
 * Extract a function body (function keyword style)
 */
function extractFunctionBody(str: string, start: number): { content: string; endIndex: number } {
  let end = start;
  let inString: string | null = null;
  let braceDepth = 0;
  let foundOpenBrace = false;
  
  while (end < str.length) {
    const char = str[end];
    
    if (!inString && (char === '"' || char === "'" || char === '`')) {
      inString = char;
    } else if (inString === char && str[end - 1] !== '\\') {
      inString = null;
    } else if (!inString) {
      if (char === '{') {
        braceDepth++;
        foundOpenBrace = true;
      }
      if (char === '}') {
        braceDepth--;
        if (foundOpenBrace && braceDepth === 0) {
          end++;
          break;
        }
      }
    }
    
    end++;
  }
  
  return {
    content: str.slice(start, end).trim(),
    endIndex: end
  };
}

/**
 * Simple brace content extraction for nested structures.
 */
function extractBracedContentSimple(
  str: string, 
  start: number, 
  openBrace: string, 
  closeBrace: string
): { content: string; endIndex: number } {
  if (str[start] !== openBrace) {
    return { content: '', endIndex: start };
  }
  
  let depth = 1;
  let end = start + 1;
  let inString: string | null = null;
  
  while (end < str.length && depth > 0) {
    const char = str[end];
    
    if (!inString && (char === '"' || char === "'")) {
      inString = char;
    } else if (inString === char && str[end - 1] !== '\\') {
      inString = null;
    } else if (!inString) {
      if (char === openBrace) depth++;
      if (char === closeBrace) depth--;
    }
    
    if (depth > 0) end++;
  }
  
  return {
    content: str.slice(start + 1, end),
    endIndex: end + 1
  };
}
