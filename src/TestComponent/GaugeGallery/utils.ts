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
  const useGradient = Math.random() > 0.4;
  const arcWidth = 0.1 + Math.random() * 0.25;
  const hidePointer = Math.random() > 0.85;
  
  const numColors = randomTheme.colors.length;
  
  // For gradient mode: use subArcs with length distribution
  const gradientSubArcs = randomTheme.colors.map((color) => ({
    length: 1 / numColors,
    color,
  }));
  
  return {
    type: randomType,
    minValue: randomRange.minValue,
    maxValue: randomRange.maxValue,
    arc: {
      width: arcWidth,
      ...(useGradient ? {
        gradient: true,
        subArcs: gradientSubArcs,
      } : {
        gradient: false,
        nbSubArcs: 12 + Math.floor(Math.random() * 30),
        colorArray: randomTheme.colors,
        padding: 0.008 + Math.random() * 0.015,
        subArcs: [],
      }),
    },
    pointer: hidePointer ? { hide: true } : {
      type: randomPointer,
      elastic: Math.random() > 0.5,
      animationDelay: Math.random() > 0.5 ? 0 : 150,
      color: Math.random() > 0.5 ? '#fff' : randomTheme.colors[randomTheme.colors.length - 1],
    },
    labels: {
      valueLabel: {
        formatTextValue: randomRange.format,
        matchColorWithArc: Math.random() > 0.4,
        style: { fontSize: '22px', fontWeight: 'bold' },
      },
      tickLabels: Math.random() > 0.5 ? {
        type: Math.random() > 0.5 ? ('outer' as const) : ('inner' as const),
        hideMinMax: Math.random() > 0.6,
      } : { hideMinMax: true },
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
