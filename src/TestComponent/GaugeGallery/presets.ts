import { GaugePreset, SandboxPreset, ColorPreset, SizePreset } from './types';

/**
 * Gallery presets for showcasing different gauge configurations
 */
export const GAUGE_PRESETS: GaugePreset[] = [
  {
    name: 'Speedometer',
    description: 'Classic speedometer with outer ticks',
    config: {
      type: 'semicircle' as const,
      arc: {
        gradient: true,
        width: 0.15,
        subArcs: [
          { limit: 30, color: '#5BE12C' },
          { limit: 70, color: '#F5CD19' },
          { color: '#EA4228' },
        ],
      },
      pointer: { type: 'needle' as const, color: '#e0e0e0', length: 0.8, width: 15 },
      labels: {
        valueLabel: { formatTextValue: (v: number) => `${v} km/h`, style: { fontSize: '24px', fill: '#e0e0e0', fontWeight: 'bold' } },
        tickLabels: {
          type: 'outer' as const,
          ticks: [{ value: 0 }, { value: 25 }, { value: 50 }, { value: 75 }, { value: 100 }],
          defaultTickValueConfig: { style: { fontSize: '10px', fill: '#aaa' } },
          defaultTickLineConfig: { color: '#666', length: 5, width: 1 },
        },
      },
    },
  },
  {
    name: 'Temperature',
    description: 'Temperature with inner ticks',
    config: {
      type: 'semicircle' as const,
      minValue: -20,
      maxValue: 50,
      arc: {
        width: 0.2,
        padding: 0.005,
        cornerRadius: 1,
        subArcs: [
          { limit: 0, color: '#00bcd4' },
          { limit: 15, color: '#4caf50' },
          { limit: 25, color: '#8bc34a' },
          { limit: 35, color: '#ff9800' },
          { color: '#f44336' },
        ],
      },
      pointer: { type: 'blob' as const, animationDelay: 0 },
      labels: {
        valueLabel: { formatTextValue: (v: number) => `${v}°C`, style: { fontSize: '28px', fill: '#e0e0e0', fontWeight: 'bold' } },
        tickLabels: {
          type: 'inner' as const,
          ticks: [{ value: -20 }, { value: 0 }, { value: 25 }, { value: 50 }],
          defaultTickValueConfig: { formatTextValue: (v: number) => `${v}°`, style: { fontSize: '9px', fill: '#ccc' } },
          defaultTickLineConfig: { color: '#888', length: 4, width: 1 },
        },
      },
    },
  },
  {
    name: 'Battery',
    description: 'Battery with segment ticks',
    config: {
      type: 'grafana' as const,
      arc: {
        width: 0.25,
        padding: 0.02,
        subArcs: [
          { limit: 20, color: '#EA4228', showTick: true },
          { limit: 40, color: '#F58B19', showTick: true },
          { limit: 60, color: '#F5CD19', showTick: true },
          { limit: 100, color: '#5BE12C', showTick: true },
        ],
      },
      pointer: { type: 'arrow' as const, color: '#e0e0e0', width: 15 },
      labels: {
        valueLabel: { formatTextValue: (v: number) => `${v}%`, matchColorWithArc: true, style: { fontWeight: 'bold' } },
        tickLabels: {
          type: 'outer' as const,
          defaultTickValueConfig: { style: { fontSize: '9px', fill: '#aaa' } },
        },
      },
    },
  },
  {
    name: 'CPU Usage',
    description: 'CPU with inner percentage ticks',
    config: {
      type: 'radial' as const,
      arc: {
        width: 0.2,
        nbSubArcs: 30,
        colorArray: ['#00c853', '#ffeb3b', '#ff5722'],
        padding: 0.01,
      },
      pointer: { type: 'needle' as const, color: '#e0e0e0', elastic: true, animationDelay: 0, width: 12 },
      labels: {
        valueLabel: { formatTextValue: (v: number) => `${v}%`, style: { fontSize: '24px', fill: '#e0e0e0', fontWeight: 'bold' } },
        tickLabels: {
          type: 'inner' as const,
          ticks: [{ value: 0 }, { value: 50 }, { value: 100 }],
          defaultTickValueConfig: { style: { fontSize: '10px', fill: '#bbb' } },
          defaultTickLineConfig: { color: '#777', length: 5 },
        },
      },
    },
  },
  {
    name: 'Fuel Gauge',
    description: 'Fuel with E/F ticks',
    config: {
      type: 'semicircle' as const,
      arc: {
        width: 0.18,
        subArcs: [
          { limit: 25, color: '#EA4228' },
          { color: '#5BE12C' },
        ],
      },
      pointer: { type: 'arrow' as const, color: '#e0e0e0', width: 20 },
      labels: {
        valueLabel: { formatTextValue: (v: number) => v <= 25 ? 'LOW' : 'OK', style: { fontSize: '22px', fill: '#e0e0e0', fontWeight: 'bold' } },
        tickLabels: {
          type: 'outer' as const,
          ticks: [
            { value: 0, valueConfig: { formatTextValue: () => 'E', style: { fontSize: '12px', fill: '#EA4228', fontWeight: 'bold' } } },
            { value: 50, valueConfig: { formatTextValue: () => '½', style: { fontSize: '10px', fill: '#aaa' } } },
            { value: 100, valueConfig: { formatTextValue: () => 'F', style: { fontSize: '12px', fill: '#5BE12C', fontWeight: 'bold' } } },
          ],
          defaultTickLineConfig: { color: '#666', length: 6, width: 2 },
        },
      },
    },
  },
  {
    name: 'Cyberpunk Neon',
    description: 'Neon with glowing ticks',
    config: {
      type: 'semicircle' as const,
      arc: {
        width: 0.12,
        padding: 0.02,
        subArcs: [
          { limit: 33, color: '#ff00ff' },
          { limit: 66, color: '#00ffff' },
          { color: '#ffff00' },
        ],
      },
      pointer: { type: 'blob' as const, color: '#fff', strokeWidth: 8, elastic: true },
      labels: {
        valueLabel: { style: { fontSize: '28px', fill: '#00ffff', fontWeight: 'bold' } },
        tickLabels: {
          type: 'outer' as const,
          ticks: [{ value: 0 }, { value: 33 }, { value: 66 }, { value: 100 }],
          defaultTickValueConfig: { style: { fontSize: '9px', fill: '#00ffff' } },
          defaultTickLineConfig: { color: '#00ffff', length: 5, width: 2 },
        },
      },
    },
  },
];

/**
 * Sandbox toolbar presets for quick gauge configuration
 */
export const SANDBOX_PRESETS: SandboxPreset[] = [
  { 
    icon: '🌐', 
    label: 'Net', 
    config: { 
      type: 'grafana', 
      minValue: 0, 
      maxValue: 3000, 
      arc: { nbSubArcs: 150, colorArray: ['#5BE12C', '#F5CD19', '#EA4228'], width: 0.3, padding: 0.003 }, 
      labels: { 
        valueLabel: { style: { fontSize: 40 }, formatTextValue: (v: number) => v >= 1000 ? `${(v/1000).toFixed(1)} mb/s` : `${v.toFixed(0)} kb/s` }, 
        tickLabels: { type: 'outer', ticks: [{ value: 0 }, { value: 1000 }, { value: 2000 }, { value: 3000 }] } 
      }, 
      pointer: { type: 'needle' } 
    }, 
    value: 900 
  },
  { 
    icon: '🌡️', 
    label: 'Temp', 
    config: { 
      type: 'semicircle', 
      minValue: -40, 
      maxValue: 150, 
      arc: { width: 0.2, subArcs: [{ limit: 0, color: '#00bcd4' }, { limit: 25, color: '#4caf50' }, { limit: 80, color: '#ff9800' }, { color: '#f44336' }] }, 
      labels: { valueLabel: { formatTextValue: (v: number) => `${v}°C` }, tickLabels: { type: 'outer', ticks: [{ value: -40 }, { value: 0 }, { value: 50 }, { value: 100 }, { value: 150 }] } }, 
      pointer: { type: 'blob' } 
    }, 
    value: 23 
  },
  { 
    icon: '🔋', 
    label: 'Batt', 
    config: { 
      type: 'grafana', 
      minValue: 0, 
      maxValue: 100, 
      arc: { width: 0.25, subArcs: [{ limit: 20, color: '#EA4228' }, { limit: 40, color: '#F58B19' }, { limit: 60, color: '#F5CD19' }, { color: '#5BE12C' }] }, 
      labels: { valueLabel: { formatTextValue: (v: number) => `${v.toFixed(0)}%`, matchColorWithArc: true }, tickLabels: { type: 'inner', ticks: [{ value: 0 }, { value: 50 }, { value: 100 }] } }, 
      pointer: { type: 'arrow' } 
    }, 
    value: 73 
  },
  { 
    icon: '⚙️', 
    label: 'RPM', 
    config: { 
      type: 'grafana', 
      minValue: 0, 
      maxValue: 8000, 
      arc: { nbSubArcs: 30, colorArray: ['#5BE12C', '#5BE12C', '#F5CD19', '#F5CD19', '#EA4228'], width: 0.3, padding: 0.02 }, 
      labels: { valueLabel: { formatTextValue: (v: number) => `${(v/1000).toFixed(1)}k` }, tickLabels: { type: 'outer', ticks: [{ value: 0 }, { value: 4000 }, { value: 8000 }] } }, 
      pointer: { type: 'needle', color: '#EA4228' } 
    }, 
    value: 3500 
  },
  { 
    icon: '💻', 
    label: 'CPU', 
    config: { 
      type: 'semicircle', 
      minValue: 0, 
      maxValue: 100, 
      arc: { width: 0.3, gradient: true, subArcs: [{ limit: 40, color: '#5BE12C' }, { limit: 60, color: '#F5CD19' }, { limit: 80, color: '#F58B19' }, { color: '#EA4228' }] }, 
      labels: { valueLabel: { formatTextValue: (v: number) => `${v.toFixed(0)}%` }, tickLabels: { hideMinMax: true } }, 
      pointer: { type: 'blob' } 
    }, 
    value: 67 
  },
  { 
    icon: '⛽', 
    label: 'Fuel', 
    config: { 
      type: 'semicircle', 
      minValue: 0, 
      maxValue: 100, 
      arc: { width: 0.15, subArcs: [{ limit: 15, color: '#EA4228' }, { limit: 25, color: '#F58B19' }, { color: '#5BE12C' }] }, 
      labels: { valueLabel: { hide: true }, tickLabels: { type: 'outer', ticks: [{ value: 0, valueConfig: { formatTextValue: () => 'E' } }, { value: 50, valueConfig: { formatTextValue: () => '½' } }, { value: 100, valueConfig: { formatTextValue: () => 'F' } }] } }, 
      pointer: { type: 'needle', color: '#fff' } 
    }, 
    value: 35 
  },
];

/**
 * Color palette presets for SubArcs
 */
export const COLOR_PRESETS: ColorPreset[] = [
  { label: 'Traffic', colors: ['#5BE12C', '#F5CD19', '#EA4228'] },
  { label: 'Ocean', colors: ['#00bcd4', '#2196f3', '#3f51b5'] },
  { label: 'Sunset', colors: ['#ff9800', '#ff5722', '#e91e63'] },
  { label: 'Forest', colors: ['#8bc34a', '#4caf50', '#2e7d32'] },
];

/**
 * Size presets for sandbox container
 */
export const SIZE_PRESETS: SizePreset[] = [
  { name: '📱 Mobile', width: '280px', height: '200px', icon: '📱' },
  { name: '💻 Desktop', width: '400px', height: '300px', icon: '💻' },
  { name: '🖥️ Large', width: '600px', height: '400px', icon: '🖥️' },
  { name: '📊 Dashboard', width: '250px', height: '180px', icon: '📊' },
];

/**
 * Random value ranges for random config generation
 */
export const RANDOM_RANGES = [
  { minValue: 0, maxValue: 100, format: (v: number) => `${Math.round(v)}%` },
  { minValue: 0, maxValue: 200, format: (v: number) => `${Math.round(v)} km/h` },
  { minValue: -40, maxValue: 60, format: (v: number) => `${Math.round(v)}°C` },
  { minValue: 0, maxValue: 10000, format: (v: number) => `${(v/1000).toFixed(1)}k` },
  { minValue: 0, maxValue: 1, format: (v: number) => `${(v * 100).toFixed(0)}%` },
];

/**
 * Color themes for random config generation
 */
export const COLOR_THEMES = [
  { name: 'fire', colors: ['#ff6b35', '#f7931e', '#ffcc02', '#ff3d00'] },
  { name: 'ocean', colors: ['#0077b6', '#0096c7', '#00b4d8', '#48cae4'] },
  { name: 'forest', colors: ['#2d5a27', '#4a7c44', '#6b9b37', '#8bc34a'] },
  { name: 'neon', colors: ['#ff00ff', '#00ffff', '#ffff00', '#ff0080'] },
  { name: 'sunset', colors: ['#ff4757', '#ff6b6b', '#ffa502', '#eccc68'] },
  { name: 'arctic', colors: ['#74b9ff', '#81ecec', '#a29bfe', '#dfe6e9'] },
];
