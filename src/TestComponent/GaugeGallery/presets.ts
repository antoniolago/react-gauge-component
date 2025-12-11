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
  {
    name: 'Synthwave',
    description: 'Retro 80s neon style',
    config: {
      type: 'semicircle' as const,
      arc: {
        width: 0.15,
        gradient: true,
        subArcs: [
          { limit: 25, color: '#ff006e' },
          { limit: 50, color: '#8338ec' },
          { limit: 75, color: '#3a86ff' },
          { color: '#06d6a0' },
        ],
      },
      pointer: { type: 'needle' as const, color: '#fff', length: 0.85, width: 12 },
      labels: {
        valueLabel: { style: { fontSize: '24px', fill: '#fff', fontWeight: 'bold' } },
        tickLabels: {
          type: 'outer' as const,
          ticks: [{ value: 0 }, { value: 25 }, { value: 50 }, { value: 75 }, { value: 100 }],
          defaultTickValueConfig: { style: { fontSize: '9px', fill: '#ff006e' } },
          defaultTickLineConfig: { color: '#ff006e', length: 4, width: 1 },
        },
      },
    },
  },
  {
    name: 'Datacenter Temperature',
    description: 'Server room monitoring with tooltips',
    config: {
      type: 'semicircle' as const,
      minValue: 10,
      maxValue: 35,
      arc: {
        width: 0.2,
        padding: 0.005,
        cornerRadius: 1,
        subArcs: [
          { limit: 15, color: '#EA4228', showTick: true, tooltip: { text: 'Too low temperature!' } },
          { limit: 17, color: '#F5CD19', showTick: true, tooltip: { text: 'Low temperature!' } },
          { limit: 28, color: '#5BE12C', showTick: true, tooltip: { text: 'OK temperature!' } },
          { limit: 30, color: '#F5CD19', showTick: true, tooltip: { text: 'High temperature!' } },
          { color: '#EA4228', tooltip: { text: 'Too high temperature!' } },
        ],
      },
      pointer: { type: 'needle' as const, color: '#345243', length: 0.8, width: 15, animationDelay: 200 },
      labels: {
        valueLabel: { formatTextValue: (v: number) => `${v}°C`, style: { fontSize: '28px', fill: '#e0e0e0', fontWeight: 'bold' } },
        tickLabels: {
          type: 'outer' as const,
          defaultTickValueConfig: { formatTextValue: (v: number) => `${v}°C`, style: { fontSize: '9px', fill: '#ccc' } },
          ticks: [{ value: 13 }, { value: 22.5 }, { value: 32 }],
        },
      },
    },
  },
  {
    name: 'Network Speed',
    description: 'Bandwidth with min/max values and formatted text',
    config: {
      type: 'semicircle' as const,
      minValue: 0,
      maxValue: 3000,
      arc: {
        nbSubArcs: 150,
        colorArray: ['#EA4228', '#F5CD19', '#5BE12C'],
        width: 0.2,
        padding: 0.003,
      },
      pointer: { type: 'needle' as const, color: '#e0e0e0' },
      labels: {
        valueLabel: { 
          formatTextValue: (v: number) => {
            if (v >= 1000) {
              const mbits = v / 1000;
              return Number.isInteger(mbits) ? `${mbits.toFixed(0)} mbit/s` : `${mbits.toFixed(1)} mbit/s`;
            }
            return `${v.toFixed(0)} kbit/s`;
          }
        },
        tickLabels: {
          type: 'outer' as const,
          ticks: [
            { value: 100 }, { value: 200 }, { value: 300 }, { value: 400 }, { value: 500 },
            { value: 600 }, { value: 700 }, { value: 800 }, { value: 900 }, { value: 1000 },
            { value: 1500 }, { value: 2000 }, { value: 2500 }, { value: 3000 },
          ],
          defaultTickValueConfig: { 
            formatTextValue: (v: number) => {
              if (v >= 1000) {
                const mbits = v / 1000;
                return Number.isInteger(mbits) ? `${mbits.toFixed(0)} mbit/s` : `${mbits.toFixed(1)} mbit/s`;
              }
              return `${v.toFixed(0)} kbit/s`;
            },
            style: { fontSize: '8px', fill: '#aaa' } 
          },
        },
      },
    },
  },
  {
    name: 'Gradient Arrow',
    description: 'Smooth gradient with arrow pointer',
    config: {
      type: 'semicircle' as const,
      arc: {
        gradient: true,
        width: 0.15,
        padding: 0,
        subArcs: [
          { limit: 5, color: '#EA4228' },
          { limit: 20, color: '#F5CD19' },
          { limit: 58, color: '#5BE12C' },
          { limit: 75, color: '#F5CD19' },
          { color: '#EA4228' },
        ],
      },
      pointer: { type: 'arrow' as const, color: '#dfa810' },
      labels: {
        valueLabel: { style: { fontSize: '24px', fill: '#e0e0e0' } },
        tickLabels: {
          type: 'outer' as const,
          ticks: [{ value: 0 }, { value: 20 }, { value: 40 }, { value: 60 }, { value: 80 }],
          defaultTickValueConfig: { style: { fontSize: '9px', fill: '#aaa' } },
        },
      },
    },
  },
  {
    name: 'Radial Wide',
    description: 'Wide radial arc with gradient',
    config: {
      type: 'radial' as const,
      arc: {
        colorArray: ['#00FF15', '#CE1F1F'],
        nbSubArcs: 90,
        padding: 0.01,
        width: 0.4,
      },
      pointer: { type: 'needle' as const, color: '#e0e0e0', animationDelay: 0 },
      labels: {
        valueLabel: { style: { fontSize: '24px', fill: '#e0e0e0', fontWeight: 'bold' } },
        tickLabels: {
          type: 'inner' as const,
          ticks: [{ value: 20 }, { value: 50 }, { value: 80 }, { value: 100 }],
          defaultTickValueConfig: { style: { fontSize: '9px', fill: '#bbb' } },
        },
      },
    },
  },
  {
    name: 'Radial Elastic',
    description: 'Elastic needle with inner ticks',
    config: {
      type: 'radial' as const,
      arc: {
        colorArray: ['#5BE12C', '#EA4228'],
        subArcs: [{ limit: 10 }, { limit: 30 }, {}, {}, {}],
        padding: 0.02,
        width: 0.3,
      },
      pointer: { type: 'needle' as const, color: '#e0e0e0', elastic: true, animationDelay: 0 },
      labels: {
        valueLabel: { style: { fontSize: '26px', fill: '#e0e0e0', fontWeight: 'bold' } },
        tickLabels: {
          type: 'inner' as const,
          ticks: [{ value: 20 }, { value: 40 }, { value: 60 }, { value: 80 }, { value: 100 }],
          defaultTickValueConfig: { style: { fontSize: '9px', fill: '#bbb' } },
        },
      },
    },
  },
  {
    name: 'Grafana Interpolated',
    description: 'Smooth color interpolation',
    config: {
      type: 'grafana' as const,
      arc: {
        colorArray: ['#1EFF00', '#CE1F1F'],
        nbSubArcs: 80,
        padding: 0.02,
        width: 0.3,
      },
      pointer: { type: 'needle' as const, color: '#e0e0e0', animationDelay: 0 },
      labels: {
        valueLabel: { matchColorWithArc: true, style: { fontSize: '28px', fontWeight: 'bold' } },
        tickLabels: { hideMinMax: true },
      },
    },
  },
  {
    name: 'Pressure Gauge',
    description: 'Industrial PSI meter',
    config: {
      type: 'radial' as const,
      minValue: 0,
      maxValue: 200,
      arc: {
        width: 0.15,
        padding: 0.01,
        subArcs: [
          { limit: 50, color: '#2ecc71' },
          { limit: 100, color: '#f1c40f' },
          { limit: 150, color: '#e67e22' },
          { color: '#e74c3c' },
        ],
      },
      pointer: { type: 'needle' as const, color: '#ecf0f1', length: 0.85, width: 12 },
      labels: {
        valueLabel: { formatTextValue: (v: number) => `${Math.round(v)} PSI`, style: { fontSize: '20px', fill: '#ecf0f1', fontWeight: 'bold' } },
        tickLabels: {
          type: 'outer' as const,
          ticks: [{ value: 0 }, { value: 50 }, { value: 100 }, { value: 150 }, { value: 200 }],
          defaultTickValueConfig: { style: { fontSize: '9px', fill: '#bdc3c7' } },
          defaultTickLineConfig: { color: '#7f8c8d', length: 4, width: 1 },
        },
      },
    },
  },
  {
    name: 'UV Index',
    description: 'Sun exposure meter',
    config: {
      type: 'semicircle' as const,
      minValue: 0,
      maxValue: 11,
      arc: {
        width: 0.2,
        padding: 0.01,
        subArcs: [
          { limit: 3, color: '#4caf50' },
          { limit: 6, color: '#ffeb3b' },
          { limit: 8, color: '#ff9800' },
          { limit: 10, color: '#f44336' },
          { color: '#9c27b0' },
        ],
      },
      pointer: { type: 'blob' as const, elastic: true },
      labels: {
        valueLabel: { formatTextValue: (v: number) => v <= 2 ? 'Low' : v <= 5 ? 'Moderate' : v <= 7 ? 'High' : v <= 10 ? 'Very High' : 'Extreme', style: { fontSize: '22px', fill: '#e0e0e0', fontWeight: 'bold' } },
        tickLabels: {
          type: 'outer' as const,
          ticks: [{ value: 0 }, { value: 3 }, { value: 6 }, { value: 8 }, { value: 11 }],
          defaultTickValueConfig: { style: { fontSize: '10px', fill: '#aaa' } },
        },
      },
    },
  },
  {
    name: 'Decibel Meter',
    description: 'Audio level indicator',
    config: {
      type: 'grafana' as const,
      minValue: 0,
      maxValue: 120,
      arc: {
        width: 0.2,
        padding: 0.01,
        subArcs: [
          { limit: 40, color: '#00e676' },
          { limit: 70, color: '#76ff03' },
          { limit: 85, color: '#ffea00' },
          { limit: 100, color: '#ff9100' },
          { color: '#ff1744' },
        ],
      },
      pointer: { type: 'arrow' as const, color: '#fff', width: 18 },
      labels: {
        valueLabel: { formatTextValue: (v: number) => `${Math.round(v)} dB`, matchColorWithArc: true, style: { fontWeight: 'bold' } },
        tickLabels: {
          type: 'outer' as const,
          ticks: [
            { value: 0, valueConfig: { formatTextValue: () => '🔇', style: { fontSize: '12px' } } },
            { value: 60, valueConfig: { formatTextValue: () => '🔊', style: { fontSize: '12px' } } },
            { value: 120, valueConfig: { formatTextValue: () => '🔥', style: { fontSize: '12px' } } },
          ],
        },
      },
    },
  },
  {
    name: 'Neon Sweep',
    description: 'Custom angle radial with neon gradient',
    config: {
      type: 'radial' as const,
      minValue: 0,
      maxValue: 10000,
      startAngle: -50,
      endAngle: 180,
      arc: {
        width: 0.55,
        cornerRadius: 0,
        gradient: false,
        subArcs: [],
        nbSubArcs: 52,
        colorArray: ['#ff00ff', '#00ffff', '#ffff00', '#ff0080'],
        padding: 0,
        subArcsStrokeWidth: 1,
        subArcsStrokeColor: '#000000',
      },
      pointer: {
        type: 'needle' as const,
        elastic: true,
        animationDelay: 150,
        length: 0.87,
        width: 24,
        baseColor: '#ffffff',
        strokeWidth: 5,
        strokeColor: '#000000',
      },
      labels: {
        valueLabel: {
          formatTextValue: (v: number) => `${(v / 1000).toFixed(1)}k`,
          matchColorWithArc: true,
          style: { fontSize: '29px', fontWeight: 'bold' },
          offsetY: -6,
        },
        tickLabels: {
          type: 'outer' as const,
          hideMinMax: false,
          ticks: [{ value: 0 }, { value: 5000 }, { value: 10000 }],
        },
      },
    },
  },
  {
    name: 'Grafana Neon',
    description: 'Grafana with needle and neon colors',
    config: {
      type: 'grafana' as const,
      minValue: 0,
      maxValue: 10000,
      arc: {
        width: 0.55,
        cornerRadius: 0,
        gradient: false,
        subArcs: [],
        nbSubArcs: 52,
        colorArray: ['#ff00ff', '#00ffff', '#ffff00', '#ff0080'],
        padding: 0,
        subArcsStrokeWidth: 1,
        subArcsStrokeColor: '#000000',
      },
      pointer: {
        type: 'needle' as const,
        elastic: true,
        animationDelay: 50,
        animationDuration: 1200,
        length: 0.87,
        width: 24,
        baseColor: '#ffffff',
        strokeWidth: 5,
        strokeColor: '#000000',
      },
      labels: {
        valueLabel: {
          formatTextValue: (v: number) => `${(v / 1000).toFixed(1)}k`,
          matchColorWithArc: true,
          style: { fontSize: '29px', fontWeight: 'bold' },
          offsetY: 66,
        },
        tickLabels: {
          type: 'outer' as const,
          hideMinMax: false,
          ticks: [{ value: 0 }, { value: 5000 }, { value: 10000 }],
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
    icon: 'NET', 
    label: 'Network', 
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
    icon: 'TMP', 
    label: 'Temperature', 
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
    icon: 'BAT', 
    label: 'Battery', 
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
    icon: 'RPM', 
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
    icon: 'GAS', 
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
  { name: 'Mobile', width: '280px', height: '200px', icon: 'SM' },
  { name: 'Desktop', width: '400px', height: '300px', icon: 'MD' },
  { name: 'Large', width: '600px', height: '400px', icon: 'LG' },
  { name: 'Dashboard', width: '250px', height: '180px', icon: 'XS' },
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
