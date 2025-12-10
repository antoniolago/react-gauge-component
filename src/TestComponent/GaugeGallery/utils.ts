import { RANDOM_RANGES, COLOR_THEMES } from './presets';
import { GaugeComponentProps } from '../../lib/GaugeComponent/types/GaugeComponentProps';

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
  
  // Arc width: allow full range from thin to thick
  const arcWidth = Math.random() > 0.3 
    ? 0.1 + Math.random() * 0.25  // Normal range
    : 0.3 + Math.random() * 0.2;   // Thick arcs (30% chance)
  
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
  
  // SubArc count variation
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
  
  return {
    type: randomType,
    minValue: randomRange.minValue,
    maxValue: randomRange.maxValue,
    arc: {
      width: arcWidth,
      cornerRadius,
      // Clear ALL arc-related props and set fresh ones to avoid conflicts
      gradient: useGradient,
      subArcs: useGradient ? gradientSubArcs : [],
      nbSubArcs: useGradient ? undefined : nbSubArcs,
      colorArray: useGradient ? undefined : [...randomTheme.colors],
      padding: useGradient ? undefined : padding,
    },
    pointer: hidePointer ? { hide: true } : {
      type: randomPointer,
      elastic: Math.random() > 0.5,
      animationDelay: Math.random() > 0.5 ? 0 : 150,
      length: pointerLength,
      width: pointerWidth,
      color: Math.random() > 0.6 ? undefined : (Math.random() > 0.5 ? '#fff' : randomTheme.colors[randomTheme.colors.length - 1]),
      baseColor: pointerBaseColor,
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
 * Stringify config for clipboard copy
 */
export const stringifyConfig = (config: any, value: number): string => {
  const replacer = (_key: string, val: any) => {
    if (typeof val === 'function') {
      const fnStr = val.toString();
      return fnStr.includes('=>') ? fnStr : `function ${fnStr}`;
    }
    return val;
  };
  
  try {
    const cleanConfig = JSON.parse(JSON.stringify(config, replacer));
    return `<GaugeComponent
  value={${value}}
  ${JSON.stringify(cleanConfig, null, 2).slice(1, -1).trim().replace(/\n/g, '\n  ')}
/>`;
  } catch {
    return `<GaugeComponent value={${value}} {...config} />`;
  }
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
 * Get initial value for a preset config
 */
export const getInitialValue = (config: any): number => {
  const min = config?.minValue ?? 0;
  const max = config?.maxValue ?? 100;
  return min + (max - min) * 0.5;
};
