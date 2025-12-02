import React, { useState, useEffect, useCallback } from 'react';
import GaugeComponent from '../lib';

// Gauge presets with different tick styles - light grey (#e0e0e0) text for dark background
const GAUGE_PRESETS = [
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
      pointer: { type: 'blob' as const, color: '#e0e0e0', animationDelay: 0 },
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
    name: 'Performance',
    description: 'Performance with outer ticks',
    config: {
      type: 'semicircle' as const,
      arc: {
        width: 0.12,
        padding: 0.02,
        subArcs: [
          { limit: 15, color: '#e91e63' },
          { limit: 35, color: '#9c27b0' },
          { limit: 55, color: '#673ab7' },
          { limit: 75, color: '#3f51b5' },
          { color: '#2196f3' },
        ],
      },
      pointer: { type: 'blob' as const, color: '#e0e0e0', elastic: true, strokeWidth: 5 },
      labels: {
        valueLabel: { style: { fontSize: '26px', fill: '#e0e0e0', fontWeight: 'bold' } },
        tickLabels: {
          type: 'outer' as const,
          ticks: [{ value: 0 }, { value: 25 }, { value: 50 }, { value: 75 }, { value: 100 }],
          defaultTickValueConfig: { style: { fontSize: '9px', fill: '#bbb' } },
          defaultTickLineConfig: { color: '#888', length: 4, width: 1 },
        },
      },
    },
  },
  {
    name: 'Minimalist',
    description: 'Minimal with subtle ticks',
    config: {
      type: 'semicircle' as const,
      arc: {
        width: 0.08,
        padding: 0,
        subArcs: [{ color: '#555' }],
      },
      pointer: { type: 'needle' as const, color: '#ff6b6b', length: 0.7, width: 10 },
      labels: {
        valueLabel: { style: { fontSize: '32px', fill: '#e0e0e0', fontWeight: 'bold' } },
        tickLabels: {
          type: 'outer' as const,
          ticks: [{ value: 0 }, { value: 50 }, { value: 100 }],
          defaultTickValueConfig: { style: { fontSize: '10px', fill: '#666' } },
          defaultTickLineConfig: { color: '#444', length: 3, width: 1 },
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
    name: 'Progress Ring',
    description: 'Clean progress with quarter ticks',
    config: {
      type: 'radial' as const,
      arc: {
        width: 0.35,
        nbSubArcs: 1,
        colorArray: ['#00c853'],
        padding: 0,
        cornerRadius: 0,
      },
      pointer: { hide: true },
      labels: {
        valueLabel: { 
          formatTextValue: (v: number) => `${v}%`, 
          style: { fontSize: '36px', fill: '#00c853', fontWeight: 'bold' },
        },
        tickLabels: {
          type: 'inner' as const,
          ticks: [{ value: 0 }, { value: 25 }, { value: 50 }, { value: 75 }, { value: 100 }],
          defaultTickValueConfig: { style: { fontSize: '8px', fill: '#00c853' } },
          defaultTickLineConfig: { hide: true },
        },
      },
    },
  },
  // === CYBERPUNK / NEON STYLES ===
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
    description: 'Retro 80s with neon ticks',
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
    name: 'Hacker Terminal',
    description: 'Matrix hex ticks',
    config: {
      type: 'radial' as const,
      arc: {
        width: 0.08,
        nbSubArcs: 40,
        colorArray: ['#003300', '#00ff00'],
        padding: 0.01,
      },
      pointer: { type: 'needle' as const, color: '#00ff00', length: 0.9, width: 6 },
      labels: {
        valueLabel: { formatTextValue: (v: number) => `0x${Math.round(v).toString(16).toUpperCase()}`, style: { fontSize: '20px', fill: '#00ff00', fontWeight: 'bold' } },
        tickLabels: {
          type: 'inner' as const,
          ticks: [{ value: 0 }, { value: 32 }, { value: 64 }, { value: 100 }],
          defaultTickValueConfig: { formatTextValue: (v: number) => `0x${v.toString(16).toUpperCase()}`, style: { fontSize: '7px', fill: '#00ff00' } },
          defaultTickLineConfig: { color: '#00ff00', length: 3, width: 1 },
        },
      },
    },
  },
  {
    name: 'Blade Runner',
    description: 'Dystopian with glow ticks',
    config: {
      type: 'grafana' as const,
      arc: {
        width: 0.18,
        gradient: true,
        subArcs: [
          { limit: 30, color: '#ff4081' },
          { limit: 60, color: '#7c4dff' },
          { color: '#18ffff' },
        ],
      },
      pointer: { type: 'arrow' as const, color: '#18ffff', elastic: true, width: 14 },
      labels: {
        valueLabel: { style: { fontSize: '22px', fill: '#18ffff', fontWeight: 'bold' } },
        tickLabels: {
          type: 'outer' as const,
          ticks: [{ value: 0 }, { value: 30 }, { value: 60 }, { value: 100 }],
          defaultTickValueConfig: { style: { fontSize: '8px', fill: '#18ffff' } },
          defaultTickLineConfig: { color: '#7c4dff', length: 5, width: 2 },
        },
      },
    },
  },
  // === INDUSTRIAL / MECHANICAL ===
  {
    name: 'VU Meter',
    description: 'Audio dB ticks',
    config: {
      type: 'semicircle' as const,
      minValue: -20,
      maxValue: 3,
      arc: {
        width: 0.15,
        padding: 0.005,
        subArcs: [
          { limit: -10, color: '#4caf50' },
          { limit: -3, color: '#8bc34a' },
          { limit: 0, color: '#ffeb3b' },
          { color: '#f44336' },
        ],
      },
      pointer: { type: 'needle' as const, color: '#e0e0e0', length: 0.9, width: 8 },
      labels: {
        valueLabel: { formatTextValue: (v: number) => `${v} dB`, style: { fontSize: '20px', fill: '#e0e0e0', fontWeight: 'bold' } },
        tickLabels: {
          type: 'outer' as const,
          ticks: [{ value: -20 }, { value: -10 }, { value: -3 }, { value: 0 }, { value: 3 }],
          defaultTickValueConfig: { style: { fontSize: '8px', fill: '#aaa' } },
          defaultTickLineConfig: { color: '#888', length: 5, width: 1 },
        },
      },
    },
  },
  {
    name: 'Pressure Gauge',
    description: 'PSI with industrial ticks',
    config: {
      type: 'radial' as const,
      minValue: 0,
      maxValue: 200,
      arc: {
        width: 0.2,
        padding: 0.01,
        subArcs: [
          { limit: 50, color: '#2196f3' },
          { limit: 100, color: '#4caf50' },
          { limit: 150, color: '#ff9800' },
          { color: '#f44336' },
        ],
      },
      pointer: { type: 'needle' as const, color: '#e0e0e0', length: 0.75, width: 14 },
      labels: {
        valueLabel: { formatTextValue: (v: number) => `${v} PSI`, style: { fontSize: '18px', fill: '#e0e0e0', fontWeight: 'bold' } },
        tickLabels: {
          type: 'outer' as const,
          ticks: [{ value: 0 }, { value: 50 }, { value: 100 }, { value: 150 }, { value: 200 }],
          defaultTickValueConfig: { style: { fontSize: '8px', fill: '#bbb' } },
          defaultTickLineConfig: { color: '#888', length: 6, width: 1 },
        },
      },
    },
  },
  {
    name: 'Steam Punk',
    description: 'Vintage brass ticks',
    config: {
      type: 'radial' as const,
      arc: {
        width: 0.22,
        padding: 0.01,
        subArcs: [
          { limit: 30, color: '#8B4513' },
          { limit: 60, color: '#CD853F' },
          { limit: 90, color: '#DAA520' },
          { color: '#B8860B' },
        ],
      },
      pointer: { type: 'needle' as const, color: '#FFD700', length: 0.8, width: 16 },
      labels: {
        valueLabel: { style: { fontSize: '22px', fill: '#FFD700', fontWeight: 'bold' } },
        tickLabels: {
          type: 'outer' as const,
          ticks: [{ value: 0 }, { value: 25 }, { value: 50 }, { value: 75 }, { value: 100 }],
          defaultTickValueConfig: { style: { fontSize: '8px', fill: '#DAA520' } },
          defaultTickLineConfig: { color: '#B8860B', length: 5, width: 2 },
        },
      },
    },
  },
  {
    name: 'Engine RPM',
    description: 'Tachometer with redline',
    config: {
      type: 'semicircle' as const,
      minValue: 0,
      maxValue: 8,
      arc: {
        width: 0.12,
        padding: 0.01,
        subArcs: [
          { limit: 2, color: '#607d8b' },
          { limit: 5, color: '#4caf50' },
          { limit: 6.5, color: '#ff9800' },
          { color: '#f44336' },
        ],
      },
      pointer: { type: 'needle' as const, color: '#ff5252', length: 0.85, width: 10 },
      labels: {
        valueLabel: { formatTextValue: (v: number) => `${v}k`, style: { fontSize: '20px', fill: '#e0e0e0', fontWeight: 'bold' } },
        tickLabels: {
          type: 'outer' as const,
          ticks: [{ value: 0 }, { value: 2 }, { value: 4 }, { value: 6 }, { value: 8 }],
          defaultTickValueConfig: { style: { fontSize: '9px', fill: '#aaa' } },
          defaultTickLineConfig: { color: '#666', length: 5, width: 1 },
        },
      },
    },
  },
  // === HEALTH / SPORTS ===
  {
    name: 'Heart Rate',
    description: 'BPM with zone ticks',
    config: {
      type: 'semicircle' as const,
      minValue: 40,
      maxValue: 180,
      arc: {
        width: 0.18,
        gradient: true,
        subArcs: [
          { limit: 60, color: '#2196f3' },
          { limit: 100, color: '#4caf50' },
          { limit: 140, color: '#ff9800' },
          { color: '#f44336' },
        ],
      },
      pointer: { type: 'blob' as const, color: '#ff5252', strokeWidth: 8 },
      labels: {
        valueLabel: { formatTextValue: (v: number) => `${v} BPM`, style: { fontSize: '22px', fill: '#ff5252', fontWeight: 'bold' } },
        tickLabels: {
          type: 'inner' as const,
          ticks: [{ value: 60 }, { value: 100 }, { value: 140 }],
          defaultTickValueConfig: { style: { fontSize: '8px', fill: '#aaa' } },
          defaultTickLineConfig: { color: '#666', length: 4 },
        },
      },
    },
  },
  {
    name: 'Fitness Ring',
    description: 'Clean progress ring',
    config: {
      type: 'radial' as const,
      arc: {
        width: 0.28,
        nbSubArcs: 1,
        colorArray: ['#ff2d55'],
        padding: 0,
        cornerRadius: 7,
      },
      pointer: { hide: true },
      labels: {
        valueLabel: { formatTextValue: (v: number) => `${v}%`, style: { fontSize: '32px', fill: '#ff2d55', fontWeight: 'bold' } },
        tickLabels: {
          type: 'inner' as const,
          ticks: [{ value: 0 }, { value: 50 }, { value: 100 }],
          defaultTickValueConfig: { style: { fontSize: '8px', fill: '#ff2d55' } },
          defaultTickLineConfig: { hide: true },
        },
      },
    },
  },
  {
    name: 'Hydration',
    description: 'Water cups tracker',
    config: {
      type: 'grafana' as const,
      minValue: 0,
      maxValue: 8,
      arc: {
        width: 0.25,
        gradient: true,
        subArcs: [
          { limit: 2, color: '#e3f2fd' },
          { limit: 5, color: '#64b5f6' },
          { color: '#1976d2' },
        ],
      },
      pointer: { type: 'blob' as const, color: '#fff', strokeWidth: 6 },
      labels: {
        valueLabel: { formatTextValue: (v: number) => `${v} cups`, style: { fontSize: '20px', fill: '#64b5f6', fontWeight: 'bold' } },
        tickLabels: {
          type: 'outer' as const,
          ticks: [{ value: 0 }, { value: 4 }, { value: 8 }],
          defaultTickValueConfig: { style: { fontSize: '9px', fill: '#64b5f6' } },
          defaultTickLineConfig: { color: '#64b5f6', length: 4, width: 1 },
        },
      },
    },
  },
  // === GAMING ===
  {
    name: 'Score Meter',
    description: 'Grade rank ticks',
    config: {
      type: 'grafana' as const,
      arc: {
        width: 0.3,
        nbSubArcs: 50,
        colorArray: ['#ff1744', '#ff9100', '#ffc400', '#76ff03', '#00e676'],
        padding: 0.005,
      },
      pointer: { type: 'arrow' as const, color: '#e0e0e0', elastic: true, width: 18 },
      labels: {
        valueLabel: { 
          formatTextValue: (v: number) => v >= 90 ? 'S' : v >= 70 ? 'A' : v >= 50 ? 'B' : v >= 30 ? 'C' : 'D',
          matchColorWithArc: true,
          style: { fontSize: '40px', fontWeight: 'bold' },
        },
        tickLabels: {
          type: 'outer' as const,
          ticks: [
            { value: 30, valueConfig: { formatTextValue: () => 'D' } },
            { value: 50, valueConfig: { formatTextValue: () => 'C' } },
            { value: 70, valueConfig: { formatTextValue: () => 'B' } },
            { value: 90, valueConfig: { formatTextValue: () => 'A' } },
          ],
          defaultTickValueConfig: { style: { fontSize: '8px', fill: '#aaa' } },
          defaultTickLineConfig: { color: '#666', length: 4 },
        },
      },
    },
  },
  {
    name: 'XP Bar',
    description: 'Level up progress',
    config: {
      type: 'semicircle' as const,
      arc: {
        width: 0.25,
        gradient: true,
        subArcs: [
          { limit: 50, color: '#7c4dff' },
          { limit: 75, color: '#536dfe' },
          { color: '#448aff' },
        ],
      },
      pointer: { type: 'blob' as const, color: '#fff', strokeWidth: 6, elastic: true },
      labels: {
        valueLabel: { formatTextValue: (v: number) => `LVL ${Math.floor(v/10) + 1}`, style: { fontSize: '20px', fill: '#fff', fontWeight: 'bold' } },
        tickLabels: {
          type: 'inner' as const,
          ticks: [{ value: 0 }, { value: 50 }, { value: 100 }],
          defaultTickValueConfig: { formatTextValue: (v: number) => `${v}%`, style: { fontSize: '8px', fill: '#b388ff' } },
          defaultTickLineConfig: { hide: true },
        },
      },
    },
  },
  {
    name: 'Mana Pool',
    description: 'Magic with rune ticks',
    config: {
      type: 'grafana' as const,
      arc: {
        width: 0.2,
        nbSubArcs: 30,
        colorArray: ['#1a237e', '#3949ab', '#5c6bc0', '#7986cb'],
        padding: 0.008,
      },
      pointer: { type: 'blob' as const, color: '#e8eaf6', strokeWidth: 4 },
      labels: {
        valueLabel: { formatTextValue: (v: number) => `${v} MP`, style: { fontSize: '18px', fill: '#7986cb', fontWeight: 'bold' } },
        tickLabels: {
          type: 'outer' as const,
          ticks: [{ value: 0 }, { value: 25 }, { value: 50 }, { value: 75 }, { value: 100 }],
          defaultTickValueConfig: { style: { fontSize: '7px', fill: '#5c6bc0' } },
          defaultTickLineConfig: { color: '#3949ab', length: 4, width: 1 },
        },
      },
    },
  },
  {
    name: 'Health Bar',
    description: 'HP with danger zones',
    config: {
      type: 'semicircle' as const,
      arc: {
        width: 0.2,
        gradient: true,
        subArcs: [
          { limit: 25, color: '#b71c1c' },
          { limit: 50, color: '#f44336' },
          { limit: 75, color: '#ff9800' },
          { color: '#4caf50' },
        ],
      },
      pointer: { type: 'blob' as const, color: '#fff', strokeWidth: 6 },
      labels: {
        valueLabel: { formatTextValue: (v: number) => `${v} HP`, style: { fontSize: '22px', fill: '#4caf50', fontWeight: 'bold' } },
        tickLabels: {
          type: 'inner' as const,
          ticks: [{ value: 25 }, { value: 50 }, { value: 75 }],
          defaultTickValueConfig: { style: { fontSize: '8px', fill: '#ccc' } },
          defaultTickLineConfig: { color: '#888', length: 4 },
        },
      },
    },
  },
  {
    name: 'Stamina',
    description: 'Energy with drain ticks',
    config: {
      type: 'radial' as const,
      arc: {
        width: 0.15,
        nbSubArcs: 20,
        colorArray: ['#ffeb3b', '#ffc107', '#ff9800'],
        padding: 0.01,
      },
      pointer: { type: 'needle' as const, color: '#fff', length: 0.8, width: 8 },
      labels: {
        valueLabel: { formatTextValue: (v: number) => `${v}%`, style: { fontSize: '28px', fill: '#ffc107', fontWeight: 'bold' } },
        tickLabels: { hideMinMax: true },
      },
    },
  },
  // === UNIQUE STYLES ===
  {
    name: 'Sunset',
    description: 'Warm gradient tones',
    config: {
      type: 'semicircle' as const,
      arc: {
        width: 0.18,
        gradient: true,
        subArcs: [
          { limit: 25, color: '#ff6b6b' },
          { limit: 50, color: '#ffa502' },
          { limit: 75, color: '#ff7f50' },
          { color: '#ff4757' },
        ],
      },
      pointer: { type: 'arrow' as const, color: '#e0e0e0', width: 16 },
      labels: {
        valueLabel: { style: { fontSize: '32px', fill: '#e0e0e0', fontWeight: 'bold' } },
        tickLabels: { hideMinMax: true },
      },
    },
  },
  {
    name: 'Ocean Wave',
    description: 'Cool blue tones',
    config: {
      type: 'radial' as const,
      arc: {
        width: 0.22,
        gradient: true,
        subArcs: [
          { limit: 33, color: '#0077b6' },
          { limit: 66, color: '#00b4d8' },
          { color: '#90e0ef' },
        ],
      },
      pointer: { type: 'needle' as const, color: '#caf0f8', length: 0.8, width: 14 },
      labels: {
        valueLabel: { style: { fontSize: '28px', fill: '#caf0f8', fontWeight: 'bold' } },
        tickLabels: { hideMinMax: true },
      },
    },
  },
  {
    name: 'Carbon Fiber',
    description: 'Dark racing style',
    config: {
      type: 'semicircle' as const,
      arc: {
        width: 0.12,
        padding: 0.02,
        subArcs: [
          { limit: 40, color: '#333' },
          { limit: 70, color: '#555' },
          { limit: 90, color: '#888' },
          { color: '#c0392b' },
        ],
      },
      pointer: { type: 'needle' as const, color: '#ff6b6b', length: 0.85, width: 10 },
      labels: {
        valueLabel: { style: { fontSize: '30px', fill: '#e0e0e0', fontWeight: 'bold' } },
        tickLabels: { hideMinMax: true },
      },
    },
  },
  // === MORE UNIQUE STYLES ===
  {
    name: 'Aurora',
    description: 'Northern lights gradient',
    config: {
      type: 'semicircle' as const,
      arc: {
        width: 0.16,
        gradient: true,
        subArcs: [
          { limit: 20, color: '#00ff87' },
          { limit: 40, color: '#60efff' },
          { limit: 60, color: '#8b5cf6' },
          { limit: 80, color: '#ec4899' },
          { color: '#f43f5e' },
        ],
      },
      pointer: { type: 'blob' as const, color: '#fff', strokeWidth: 6, elastic: true },
      labels: {
        valueLabel: { style: { fontSize: '28px', fill: '#60efff', fontWeight: 'bold' } },
        tickLabels: { hideMinMax: true },
      },
    },
  },
  {
    name: 'Lava Flow',
    description: 'Hot volcanic gradient',
    config: {
      type: 'radial' as const,
      arc: {
        width: 0.2,
        gradient: true,
        subArcs: [
          { limit: 33, color: '#ff4500' },
          { limit: 66, color: '#ff6347' },
          { color: '#ffcc00' },
        ],
      },
      pointer: { type: 'needle' as const, color: '#ffcc00', length: 0.85, width: 12 },
      labels: {
        valueLabel: { style: { fontSize: '26px', fill: '#ffcc00', fontWeight: 'bold' } },
        tickLabels: { hideMinMax: true },
      },
    },
  },
  {
    name: 'Ice Crystal',
    description: 'Frozen blue tones',
    config: {
      type: 'grafana' as const,
      arc: {
        width: 0.18,
        nbSubArcs: 25,
        colorArray: ['#e0f7fa', '#80deea', '#26c6da', '#00acc1'],
        padding: 0.01,
      },
      pointer: { type: 'arrow' as const, color: '#fff', width: 14 },
      labels: {
        valueLabel: { style: { fontSize: '24px', fill: '#80deea', fontWeight: 'bold' } },
        tickLabels: { hideMinMax: true },
      },
    },
  },
  {
    name: 'Toxic',
    description: 'Radioactive green glow',
    config: {
      type: 'semicircle' as const,
      arc: {
        width: 0.14,
        gradient: true,
        subArcs: [
          { limit: 30, color: '#1b5e20' },
          { limit: 60, color: '#4caf50' },
          { color: '#76ff03' },
        ],
      },
      pointer: { type: 'needle' as const, color: '#76ff03', length: 0.85, width: 10 },
      labels: {
        valueLabel: { style: { fontSize: '28px', fill: '#76ff03', fontWeight: 'bold' } },
        tickLabels: { hideMinMax: true },
      },
    },
  },
  {
    name: 'Galaxy',
    description: 'Deep space purple',
    config: {
      type: 'radial' as const,
      arc: {
        width: 0.2,
        gradient: true,
        subArcs: [
          { limit: 25, color: '#0d0221' },
          { limit: 50, color: '#3d1a78' },
          { limit: 75, color: '#6c3b9e' },
          { color: '#b388eb' },
        ],
      },
      pointer: { type: 'blob' as const, color: '#fff', strokeWidth: 6 },
      labels: {
        valueLabel: { style: { fontSize: '26px', fill: '#b388eb', fontWeight: 'bold' } },
        tickLabels: { hideMinMax: true },
      },
    },
  },
  {
    name: 'Voltage',
    description: 'Electric yellow surge',
    config: {
      type: 'grafana' as const,
      arc: {
        width: 0.15,
        nbSubArcs: 35,
        colorArray: ['#212121', '#424242', '#ffeb3b', '#ffff00'],
        padding: 0.008,
      },
      pointer: { type: 'needle' as const, color: '#ffff00', length: 0.9, width: 8 },
      labels: {
        valueLabel: { formatTextValue: (v: number) => `${v}V`, style: { fontSize: '24px', fill: '#ffeb3b', fontWeight: 'bold' } },
        tickLabels: { hideMinMax: true },
      },
    },
  },
];

// Generate random gauge config
const generateRandomConfig = () => {
  const types = ['semicircle', 'radial', 'grafana'] as const;
  const pointerTypes = ['needle', 'blob', 'arrow'] as const;
  
  const colors = [
    ['#5BE12C', '#F5CD19', '#EA4228'],
    ['#00bcd4', '#4caf50', '#ff5722'],
    ['#e91e63', '#9c27b0', '#2196f3'],
    ['#ff6f00', '#ff8f00', '#ffc107'],
    ['#00c853', '#69f0ae', '#b9f6ca'],
    ['#d500f9', '#651fff', '#3d5afe'],
    ['#1de9b6', '#00e5ff', '#00b0ff'],
    ['#ff1744', '#ff5252', '#ff8a80'],
  ];
  
  const randomType = types[Math.floor(Math.random() * types.length)];
  const randomPointer = pointerTypes[Math.floor(Math.random() * pointerTypes.length)];
  const randomColors = colors[Math.floor(Math.random() * colors.length)];
  const useGradient = Math.random() > 0.5;
  const arcWidth = 0.1 + Math.random() * 0.25;
  
  return {
    type: randomType,
    arc: {
      width: arcWidth,
      ...(useGradient ? {
        gradient: true,
        subArcs: randomColors.map((color, i) => ({ 
          limit: ((i + 1) / randomColors.length) * 100, 
          color 
        })),
      } : {
        nbSubArcs: 15 + Math.floor(Math.random() * 40),
        colorArray: randomColors,
        padding: 0.01 + Math.random() * 0.02,
      }),
    },
    pointer: {
      type: randomPointer,
      elastic: Math.random() > 0.5,
      animationDelay: Math.random() > 0.5 ? 0 : 200,
    },
    labels: {
      valueLabel: {
        formatTextValue: (v: number) => `${v}`,
        matchColorWithArc: Math.random() > 0.5,
      },
    },
  };
};

// Helper to stringify config for copy
const stringifyConfig = (config: any, value: number): string => {
  const replacer = (key: string, val: any) => {
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

const GaugeGallery: React.FC = () => {
  const [values, setValues] = useState<number[]>(GAUGE_PRESETS.map(() => 50));
  const [randomConfig, setRandomConfig] = useState(() => generateRandomConfig());
  const [randomValue, setRandomValue] = useState(50);
  const [autoAnimate, setAutoAnimate] = useState(true);
  const [copiedIndex, setCopiedIndex] = useState<number | 'random' | null>(null);
  const [randomKey, setRandomKey] = useState(0); // Key to force re-render
  const [showEditor, setShowEditor] = useState(true); // Start with editor open
  const [editorValue, setEditorValue] = useState('');

  // Auto-animate values
  useEffect(() => {
    if (!autoAnimate) return;
    
    const interval = setInterval(() => {
      setValues(prev => prev.map(() => Math.floor(Math.random() * 100)));
      setRandomValue(Math.floor(Math.random() * 100));
    }, 3000);
    
    return () => clearInterval(interval);
  }, [autoAnimate]);

  // Generate the full component code string
  const generateComponentCode = useCallback((config: any, value: number) => {
    const configStr = JSON.stringify(config, null, 2)
      .replace(/"([^"]+)":/g, '$1:')  // Remove quotes from keys
      .replace(/"/g, "'");  // Use single quotes for strings
    
    return `<GaugeComponent
  value={${value}}
  ${configStr.slice(1, -1).trim().split('\n').join('\n  ')}
/>`;
  }, []);

  const handleRandomize = useCallback(() => {
    try {
      const newConfig = generateRandomConfig();
      const newValue = Math.floor(Math.random() * 100);
      setRandomConfig(newConfig);
      setRandomValue(newValue);
      setRandomKey(prev => prev + 1); // Force complete re-render
      setEditorValue(generateComponentCode(newConfig, newValue));
    } catch (error) {
      console.error('Error generating config:', error);
    }
  }, [generateComponentCode]);

  // Initialize editor value
  useEffect(() => {
    setEditorValue(generateComponentCode(randomConfig, randomValue));
  }, []);

  // Update editor when value changes via slider
  useEffect(() => {
    setEditorValue(generateComponentCode(randomConfig, randomValue));
  }, [randomValue, randomConfig, generateComponentCode]);

  // Handle config changes from editor
  const handleEditorChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditorValue(e.target.value);
  }, []);

  const applyEditorConfig = useCallback(() => {
    try {
      // Parse the component code to extract value and config
      const code = editorValue;
      
      // Extract value
      const valueMatch = code.match(/value=\{(\d+)\}/);
      if (valueMatch) {
        setRandomValue(parseInt(valueMatch[1], 10));
      }
      
      // Extract config by finding content between first { after props and matching }
      // This is a simplified parser - extracts the object literal
      const configStart = code.indexOf('{', code.indexOf('value='));
      if (configStart === -1) {
        // Try to parse the whole thing as JSX-like config
        const propsMatch = code.match(/value=\{(\d+)\}\s*([\s\S]*?)\s*\/>/);
        if (propsMatch) {
          const propsStr = propsMatch[2].trim();
          // Convert JSX-like props to JSON
          const jsonStr = '{' + propsStr
            .replace(/(\w+):/g, '"$1":')
            .replace(/'/g, '"')
            .replace(/,\s*\}/g, '}')
            .replace(/,\s*\]/g, ']') + '}';
          const parsed = JSON.parse(jsonStr);
          setRandomConfig(parsed);
          setRandomKey(prev => prev + 1);
        }
      }
    } catch (error) {
      console.error('Invalid configuration:', error);
      alert('Could not parse configuration. Please check the syntax.');
    }
  }, [editorValue]);

  const copyToClipboard = useCallback(async (config: any, value: number, index: number | 'random') => {
    try {
      const code = stringifyConfig(config, value);
      
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(code);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = code;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  }, []);

  const handleCardClick = useCallback((e: React.MouseEvent, config: any, value: number, index: number | 'random') => {
    e.stopPropagation();
    copyToClipboard(config, value, index);
  }, [copyToClipboard]);

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.title}>
            <span style={styles.titleIcon}>📊</span>
            React Gauge Component
          </h1>
          <p style={styles.subtitle}>
            Beautiful, customizable gauge charts for React applications
          </p>
          <div style={styles.badges}>
            <a href="https://github.com/antoniolago/react-gauge-component" target="_blank" rel="noopener noreferrer" style={styles.badge}>
              ⭐ GitHub
            </a>
            <a href="https://www.npmjs.com/package/react-gauge-component" target="_blank" rel="noopener noreferrer" style={styles.badge}>
              📦 npm
            </a>
          </div>
        </div>
      </header>

      {/* Controls */}
      <div style={styles.controls}>
        <label style={styles.toggleLabel}>
          <input 
            type="checkbox" 
            checked={autoAnimate} 
            onChange={(e) => setAutoAnimate(e.target.checked)}
            style={styles.checkbox}
          />
          <span style={styles.toggleText}>Auto-animate values</span>
        </label>
        <span style={styles.hint}>Click any gauge to copy its code!</span>
      </div>

      {/* Randomizer Section */}
      <section style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>🎲 Playground</h2>
          <div style={styles.headerButtons}>
            <button 
              onClick={() => setShowEditor(!showEditor)} 
              style={styles.editorToggle}
              type="button"
            >
              {showEditor ? '📊 Hide Editor' : '⚙️ Edit Config'}
            </button>
            <button 
              onClick={handleRandomize} 
              style={styles.randomButton}
              type="button"
            >
              🎲 Randomize
            </button>
          </div>
        </div>
        <div style={styles.playgroundContainer}>
          {/* Gauge Display */}
          <div 
            style={{
              ...styles.randomizerCard,
              ...(copiedIndex === 'random' ? styles.copiedCard : {}),
              flex: showEditor ? '1' : 'none',
              maxWidth: showEditor ? '50%' : '100%',
            }}
            onClick={(e) => handleCardClick(e, randomConfig, randomValue, 'random')}
          >
            <div style={styles.randomGaugeContainer}>
              <GaugeComponent key={randomKey} value={randomValue} {...randomConfig} />
            </div>
            <div style={styles.copyOverlay}>
              {copiedIndex === 'random' ? (
                <span style={styles.copiedText}>✓ Copied!</span>
              ) : (
                <span style={styles.copyHint}>Click to copy code</span>
              )}
            </div>
          </div>
          
          {/* Config Editor */}
          {showEditor && (
            <div style={styles.editorPanel}>
              <div style={styles.editorHeader}>
                <span style={styles.editorTitle}>Configuration (JSON)</span>
                <button onClick={applyEditorConfig} style={styles.applyButton} type="button">
                  Apply Changes
                </button>
              </div>
              <div style={styles.editorInputRow}>
                <label style={styles.valueLabel}>Value:</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={randomValue}
                  onChange={(e) => setRandomValue(Number(e.target.value))}
                  style={styles.valueInput}
                />
              </div>
              <textarea
                value={editorValue}
                onChange={handleEditorChange}
                style={styles.editorTextarea}
                spellCheck={false}
              />
            </div>
          )}
        </div>
      </section>

      {/* Gallery Section */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>🎨 Preset Gallery</h2>
        <div style={styles.gallery}>
          {GAUGE_PRESETS.map((preset, index) => (
            <div 
              key={index} 
              style={{
                ...styles.gaugeCard,
                ...(copiedIndex === index ? styles.copiedCard : {}),
              }}
              onClick={(e) => handleCardClick(e, preset.config, values[index], index)}
            >
              <div style={styles.gaugeWrapper}>
                <GaugeComponent value={values[index]} {...preset.config} />
              </div>
              <div style={styles.cardInfo}>
                <h3 style={styles.cardTitle}>{preset.name}</h3>
                <p style={styles.cardDescription}>{preset.description}</p>
                {copiedIndex === index ? (
                  <span style={styles.copiedBadge}>✓ Copied!</span>
                ) : (
                  <span style={styles.clickToCopy}>Click to copy</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Resize Demo */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>📐 Responsive Resize</h2>
        <p style={styles.sectionDescription}>
          Drag the corner to resize the container and see the gauge adapt smoothly.
        </p>
        <div style={styles.resizeDemo}>
          <GaugeComponent 
            value={values[0]} 
            type="semicircle"
            arc={{
              width: 0.2,
              gradient: true,
              subArcs: [
                { limit: 33, color: '#5BE12C' },
                { limit: 66, color: '#F5CD19' },
                { color: '#EA4228' },
              ],
            }}
            labels={{
              valueLabel: { formatTextValue: (v: number) => `${v}%` },
              tickLabels: {
                type: 'outer',
                ticks: [
                  { value: 0 },
                  { value: 25 },
                  { value: 50 },
                  { value: 75 },
                  { value: 100 },
                ],
              },
            }}
          />
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <p>Made with ❤️ by <a href="https://github.com/antoniolago" style={styles.footerLink}>Antonio Lago</a></p>
        <p style={styles.footerSmall}>MIT License • Open Source</p>
      </footer>
    </div>
  );
};

// Styles
const styles: Record<string, React.CSSProperties> = {
  container: {
    fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', sans-serif",
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    minHeight: '100vh',
    color: '#fff',
  },
  header: {
    background: 'rgba(0, 0, 0, 0.3)',
    backdropFilter: 'blur(10px)',
    padding: '40px 20px',
    textAlign: 'center',
  },
  headerContent: {
    maxWidth: '800px',
    margin: '0 auto',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 700,
    margin: '0 0 10px 0',
    background: 'linear-gradient(90deg, #00d9ff, #00ff88)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  titleIcon: {
    marginRight: '10px',
  },
  subtitle: {
    fontSize: '1.1rem',
    color: 'rgba(255, 255, 255, 0.7)',
    margin: '0 0 20px 0',
  },
  badges: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center',
  },
  badge: {
    background: 'rgba(255, 255, 255, 0.1)',
    padding: '8px 16px',
    borderRadius: '20px',
    color: '#fff',
    textDecoration: 'none',
    fontSize: '0.9rem',
    transition: 'all 0.3s ease',
  },
  controls: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '20px',
    padding: '20px',
    flexWrap: 'wrap',
  },
  toggleLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer',
    background: 'rgba(255, 255, 255, 0.1)',
    padding: '10px 20px',
    borderRadius: '25px',
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
  },
  toggleText: {
    fontSize: '0.95rem',
  },
  hint: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: '0.9rem',
  },
  section: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '30px 20px',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '15px',
  },
  sectionTitle: {
    fontSize: '1.8rem',
    fontWeight: 600,
    margin: 0,
  },
  sectionDescription: {
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: '20px',
  },
  randomButton: {
    background: 'linear-gradient(90deg, #00d9ff, #00ff88)',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '25px',
    color: '#1a1a2e',
    fontWeight: 600,
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    boxShadow: '0 4px 15px rgba(0, 217, 255, 0.3)',
  },
  headerButtons: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  editorToggle: {
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    padding: '12px 24px',
    borderRadius: '25px',
    color: '#fff',
    fontWeight: 600,
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  playgroundContainer: {
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap',
  },
  editorPanel: {
    flex: '1',
    minWidth: '300px',
    background: 'rgba(0, 0, 0, 0.3)',
    borderRadius: '16px',
    padding: '20px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  editorHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
    flexWrap: 'wrap',
    gap: '10px',
  },
  editorTitle: {
    fontSize: '1rem',
    fontWeight: 600,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  applyButton: {
    background: 'linear-gradient(90deg, #00ff88, #00d9ff)',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '20px',
    color: '#1a1a2e',
    fontWeight: 600,
    fontSize: '0.9rem',
    cursor: 'pointer',
  },
  editorInputRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '15px',
  },
  valueLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '0.9rem',
  },
  valueInput: {
    width: '80px',
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    background: 'rgba(255, 255, 255, 0.1)',
    color: '#fff',
    fontSize: '1rem',
  },
  editorTextarea: {
    width: '100%',
    height: '300px',
    padding: '15px',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    background: 'rgba(0, 0, 0, 0.4)',
    color: '#00ff88',
    fontSize: '0.85rem',
    fontFamily: 'Monaco, Consolas, "Courier New", monospace',
    lineHeight: '1.5',
    resize: 'vertical',
    boxSizing: 'border-box' as const,
  },
  randomizerCard: {
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '20px',
    padding: '20px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  randomGaugeContainer: {
    height: '220px',
    width: '100%',
    maxWidth: '400px',
    margin: '0 auto',
    overflow: 'hidden',
    position: 'relative',
  },
  copyOverlay: {
    textAlign: 'center',
    marginTop: '15px',
  },
  copyHint: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: '0.9rem',
  },
  copiedText: {
    color: '#00ff88',
    fontSize: '1.1rem',
    fontWeight: 600,
  },
  copiedCard: {
    borderColor: '#00ff88',
    boxShadow: '0 0 25px rgba(0, 255, 136, 0.4)',
  },
  gallery: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '20px',
  },
  gaugeCard: {
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '16px',
    padding: '15px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  gaugeWrapper: {
    height: '160px',
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
  },
  cardInfo: {
    textAlign: 'center',
    marginTop: '10px',
  },
  cardTitle: {
    fontSize: '1rem',
    fontWeight: 600,
    margin: '0 0 4px 0',
  },
  cardDescription: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: '0.8rem',
    margin: '0 0 8px 0',
  },
  clickToCopy: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: '0.75rem',
  },
  copiedBadge: {
    color: '#00ff88',
    fontSize: '0.85rem',
    fontWeight: 600,
  },
  resizeDemo: {
    width: '350px',
    height: '220px',
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '16px',
    padding: '15px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    resize: 'both',
    overflow: 'hidden',
    minWidth: '180px',
    minHeight: '120px',
    maxWidth: '100%',
  },
  footer: {
    textAlign: 'center',
    padding: '40px 20px',
    background: 'rgba(0, 0, 0, 0.2)',
    marginTop: '50px',
  },
  footerLink: {
    color: '#00d9ff',
    textDecoration: 'none',
  },
  footerSmall: {
    fontSize: '0.85rem',
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: '10px',
  },
};

export default GaugeGallery;
