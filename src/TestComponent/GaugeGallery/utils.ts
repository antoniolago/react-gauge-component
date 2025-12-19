import { ReactElement } from 'react';
import { RANDOM_RANGES, COLOR_THEMES } from './presets';
import { GaugeComponentProps } from '../../lib/GaugeComponent/types/GaugeComponentProps';

/**
 * Default Grafana Neon configuration for the editor
 */
export const GRAFANA_NEON_CONFIG: Partial<GaugeComponentProps> = {
  type: 'grafana',
  minValue: 0,
  maxValue: 1000,
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
    animationDuration: 4000,
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
      ticks: [
        { value: 0 },
        { value: 250 },
        { value: 500 },
        { value: 1000 },
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
  const useGradient = Math.random() > 0.97; // 3% chance of gradient
  const hidePointer = Math.random() > 0.85;
  
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
  
  return {
    type: randomType,
    minValue: randomRange.minValue,
    maxValue: randomRange.maxValue,
    arc: {
      width: arcWidth,
      cornerRadius,
      ...arcConfig,
    },
    pointer: hidePointer ? { hide: true } : {
      type: randomPointer,
      elastic: Math.random() > 0.5,
      animationDelay: Math.random() > 0.5 ? 0 : 150,
      length: pointerLength,
      width: pointerWidth,
      color: Math.random() > 0.6 ? undefined : (Math.random() > 0.5 ? '#fff' : randomTheme.colors[randomTheme.colors.length - 1]),
      baseColor: pointerBaseColor,
      maxFps: 30,
    },
    labels: {
      valueLabel: {
        formatTextValue: randomRange.format,
        matchColorWithArc: Math.random() > 0.4,
        style: { fontSize: `${fontSize}px`, fontWeight: 'bold' },
        hide: Math.random() > 0.9, // 10% chance to hide value label
      },
      tickLabels: ticksConfig,
    },
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
    if (entries.length === 0) return '{}';
    const formatted = entries.map(([k, v]) => `${k}: ${formatJsxValue(v, indent + '  ')}`);
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
export const stringifyConfig = (config: any, value: number): string => {
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
  
  return `<GaugeComponent\n${props.join('\n')}\n/>`;
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
