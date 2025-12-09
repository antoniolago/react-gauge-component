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
    name: 'Barista Brew',
    description: 'Coffee extraction timer',
    config: {
      type: 'grafana' as const,
      minValue: 0,
      maxValue: 40,
      arc: {
        width: 0.22,
        padding: 0.02,
        subArcs: [
          { limit: 15, color: '#4a2c2a' },
          { limit: 22, color: '#6f4e37' },
          { limit: 30, color: '#a67c52' },
          { color: '#d4a574' },
        ],
      },
      pointer: { type: 'needle' as const, color: '#f5deb3', length: 0.75, width: 12 },
      labels: {
        valueLabel: { formatTextValue: (v: number) => `${Math.round(v)}s`, style: { fontSize: '26px', fill: '#d4a574', fontWeight: 'bold' } },
        tickLabels: {
          type: 'outer' as const,
          ticks: [
            { value: 0, valueConfig: { formatTextValue: () => '☕', style: { fontSize: '14px', fill: '#6f4e37' } } },
            { value: 20, valueConfig: { formatTextValue: () => '✨', style: { fontSize: '14px', fill: '#c19a6b' } } },
            { value: 40, valueConfig: { formatTextValue: () => '🔥', style: { fontSize: '14px', fill: '#d4a574' } } },
          ],
          defaultTickLineConfig: { color: '#8b6914', length: 5, width: 2 },
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
    name: 'Altitude',
    description: 'Aircraft altimeter',
    config: {
      type: 'radial' as const,
      minValue: 0,
      maxValue: 45000,
      arc: {
        width: 0.18,
        padding: 0.01,
        subArcs: [
          { limit: 10000, color: '#2d5a27' },
          { limit: 20000, color: '#4a7c59' },
          { limit: 30000, color: '#3498db' },
          { limit: 38000, color: '#5d6d7e' },
          { color: '#2c3e50' },
        ],
      },
      pointer: { type: 'needle' as const, color: '#f39c12', length: 0.85, width: 10 },
      labels: {
        valueLabel: { formatTextValue: (v: number) => `${(v/1000).toFixed(1)}k ft`, style: { fontSize: '20px', fill: '#f39c12', fontWeight: 'bold' } },
        tickLabels: {
          type: 'outer' as const,
          ticks: [
            { value: 0, valueConfig: { formatTextValue: () => 'GND', style: { fontSize: '9px', fill: '#2d5a27' } } },
            { value: 15000, valueConfig: { formatTextValue: () => '15k', style: { fontSize: '9px', fill: '#3498db' } } },
            { value: 30000, valueConfig: { formatTextValue: () => '30k', style: { fontSize: '9px', fill: '#5d6d7e' } } },
            { value: 45000, valueConfig: { formatTextValue: () => 'FL450', style: { fontSize: '9px', fill: '#95a5a6' } } },
          ],
          defaultTickLineConfig: { color: '#7f8c8d', length: 5, width: 1 },
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
    description: 'PSI with inner ticks',
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
        valueLabel: { formatTextValue: (v: number) => `${Math.round(v)} PSI`, style: { fontSize: '20px', fill: '#e0e0e0', fontWeight: 'bold' } },
        tickLabels: {
          type: 'inner' as const,
          ticks: [
            { value: 0, valueConfig: { formatTextValue: () => '0', style: { fontSize: '9px', fill: '#2196f3' } } },
            { value: 50, valueConfig: { formatTextValue: () => '50 PSI', style: { fontSize: '9px', fill: '#4caf50' } } },
            { value: 100, valueConfig: { formatTextValue: () => '100 PSI', style: { fontSize: '9px', fill: '#4caf50' } } },
            { value: 150, valueConfig: { formatTextValue: () => '150 PSI', style: { fontSize: '9px', fill: '#ff9800' } } },
            { value: 200, valueConfig: { formatTextValue: () => 'MAX', style: { fontSize: '9px', fill: '#f44336', fontWeight: 'bold' } } },
          ],
          defaultTickLineConfig: { color: '#888', length: 5, width: 1 },
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
        padding: 0.01,
        subArcs: [
          { limit: 60, color: '#2196f3' },
          { limit: 100, color: '#4caf50' },
          { limit: 140, color: '#ff9800' },
          { color: '#f44336' },
        ],
      },
      pointer: { type: 'blob' as const, color: '#ff5252', strokeWidth: 8 },
      labels: {
        valueLabel: { formatTextValue: (v: number) => `${Math.round(v)} BPM`, style: { fontSize: '24px', fill: '#ff5252', fontWeight: 'bold' } },
        tickLabels: {
          type: 'inner' as const,
          ticks: [
            { value: 60, valueConfig: { formatTextValue: () => '60 bpm', style: { fontSize: '8px', fill: '#2196f3' } } },
            { value: 100, valueConfig: { formatTextValue: () => '100 bpm', style: { fontSize: '8px', fill: '#4caf50' } } },
            { value: 140, valueConfig: { formatTextValue: () => '140 bpm', style: { fontSize: '8px', fill: '#ff9800' } } },
          ],
          defaultTickLineConfig: { color: '#666', length: 4 },
        },
      },
    },
  },
  {
    name: 'Turbo Boost',
    description: 'Supercharger pressure',
    config: {
      type: 'semicircle' as const,
      minValue: -15,
      maxValue: 25,
      arc: {
        width: 0.2,
        padding: 0.01,
        subArcs: [
          { limit: -5, color: '#3498db' },
          { limit: 5, color: '#27ae60' },
          { limit: 15, color: '#f39c12' },
          { color: '#e74c3c' },
        ],
      },
      pointer: { type: 'needle' as const, color: '#ecf0f1', length: 0.82, width: 14 },
      labels: {
        valueLabel: { formatTextValue: (v: number) => `${v > 0 ? '+' : ''}${v} PSI`, style: { fontSize: '22px', fill: '#e74c3c', fontWeight: 'bold' } },
        tickLabels: {
          type: 'outer' as const,
          ticks: [
            { value: -15, valueConfig: { formatTextValue: () => 'VAC' } },
            { value: 0, valueConfig: { formatTextValue: () => 'ATM' } },
            { value: 15, valueConfig: { formatTextValue: () => '15' } },
            { value: 25, valueConfig: { formatTextValue: () => 'MAX' } },
          ],
          defaultTickValueConfig: { style: { fontSize: '8px', fill: '#bdc3c7' } },
          defaultTickLineConfig: { color: '#7f8c8d', length: 5, width: 1 },
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
        padding: 0.02,
        subArcs: [
          { limit: 2, color: '#bbdefb' },
          { limit: 4, color: '#64b5f6' },
          { limit: 6, color: '#2196f3' },
          { color: '#1565c0' },
        ],
      },
      pointer: { type: 'blob' as const, color: '#fff', strokeWidth: 6 },
      labels: {
        valueLabel: { formatTextValue: (v: number) => `${Math.round(v)} cups`, style: { fontSize: '24px', fill: '#2196f3', fontWeight: 'bold' } },
        tickLabels: {
          type: 'outer' as const,
          ticks: [
            { value: 0, valueConfig: { formatTextValue: () => '💧', style: { fontSize: '12px' } } },
            { value: 4, valueConfig: { formatTextValue: () => '4', style: { fontSize: '11px', fill: '#2196f3' } } },
            { value: 8, valueConfig: { formatTextValue: () => '8 🎯', style: { fontSize: '11px', fill: '#1565c0' } } },
          ],
          defaultTickLineConfig: { color: '#64b5f6', length: 5, width: 2 },
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
        padding: 0.01,
        subArcs: [
          { limit: 33, color: '#4527a0' },
          { limit: 66, color: '#7c4dff' },
          { color: '#b388ff' },
        ],
      },
      pointer: { type: 'blob' as const, color: '#fff', strokeWidth: 6, elastic: true },
      labels: {
        valueLabel: { formatTextValue: (v: number) => `LVL ${Math.floor(v/10) + 1}`, style: { fontSize: '26px', fill: '#fff', fontWeight: 'bold' } },
        tickLabels: {
          type: 'outer' as const,
          ticks: [
            { value: 0, valueConfig: { formatTextValue: () => '0%', style: { fontSize: '10px', fill: '#b388ff' } } },
            { value: 50, valueConfig: { formatTextValue: () => '50%', style: { fontSize: '10px', fill: '#b388ff' } } },
            { value: 100, valueConfig: { formatTextValue: () => '100%', style: { fontSize: '10px', fill: '#b388ff' } } },
          ],
          defaultTickLineConfig: { color: '#7c4dff', length: 4, width: 1 },
        },
      },
    },
  },
  {
    name: 'Mana Pool',
    description: 'Magic power meter',
    config: {
      type: 'grafana' as const,
      arc: {
        width: 0.22,
        nbSubArcs: 20,
        colorArray: ['#1a237e', '#3949ab', '#5c6bc0', '#7986cb'],
        padding: 0.01,
      },
      pointer: { type: 'blob' as const, color: '#e8eaf6', strokeWidth: 5 },
      labels: {
        valueLabel: { formatTextValue: (v: number) => `${Math.round(v)} MP`, style: { fontSize: '24px', fill: '#7986cb', fontWeight: 'bold' } },
        tickLabels: {
          type: 'outer' as const,
          ticks: [{ value: 0 }, { value: 50 }, { value: 100 }],
          defaultTickValueConfig: { style: { fontSize: '10px', fill: '#5c6bc0' } },
          defaultTickLineConfig: { color: '#3949ab', length: 5, width: 2 },
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

// Creative range presets for random generation
const RANDOM_RANGES = [
  { minValue: 0, maxValue: 100, format: (v: number) => `${Math.round(v)}%`, unit: 'percent' },
  { minValue: -40, maxValue: 120, format: (v: number) => `${Math.round(v)}°F`, unit: 'temp' },
  { minValue: 0, maxValue: 8000, format: (v: number) => `${(v/1000).toFixed(1)}k RPM`, unit: 'rpm' },
  { minValue: 0, maxValue: 300, format: (v: number) => `${Math.round(v)} km/h`, unit: 'speed' },
  { minValue: 0, maxValue: 500, format: (v: number) => `${Math.round(v)} W`, unit: 'power' },
  { minValue: -30, maxValue: 10, format: (v: number) => `${v > 0 ? '+' : ''}${Math.round(v)} dB`, unit: 'db' },
  { minValue: 0, maxValue: 1000, format: (v: number) => `${Math.round(v)} mb`, unit: 'pressure' },
  { minValue: 0, maxValue: 99999, format: (v: number) => `$${(v/1000).toFixed(1)}k`, unit: 'money' },
  { minValue: 40, maxValue: 200, format: (v: number) => `${Math.round(v)} BPM`, unit: 'bpm' },
  { minValue: 0, maxValue: 255, format: (v: number) => `0x${Math.round(v).toString(16).toUpperCase().padStart(2, '0')}`, unit: 'hex' },
  { minValue: 0, maxValue: 60, format: (v: number) => `${Math.floor(v)}:${String(Math.floor((v % 1) * 60)).padStart(2, '0')}`, unit: 'time' },
  { minValue: 1, maxValue: 10, format: (v: number) => `${v.toFixed(1)}x`, unit: 'multiplier' },
  { minValue: 0, maxValue: 1024, format: (v: number) => v < 1000 ? `${Math.round(v)} MB` : `${(v/1024).toFixed(1)} GB`, unit: 'storage' },
  { minValue: 0, maxValue: 5, format: (v: number) => '★'.repeat(Math.round(v)) + '☆'.repeat(5 - Math.round(v)), unit: 'rating' },
  { minValue: -20, maxValue: 30, format: (v: number) => `${v > 0 ? '+' : ''}${Math.round(v)} PSI`, unit: 'boost' },
];

// Generate random gauge config
const generateRandomConfig = () => {
  const types = ['semicircle', 'radial', 'grafana'] as const;
  const pointerTypes = ['needle', 'blob', 'arrow'] as const;
  
  const colorThemes = [
    { name: 'fire', colors: ['#ff6b35', '#f7931e', '#ffcc02', '#ff3d00'] },
    { name: 'ocean', colors: ['#0077b6', '#0096c7', '#00b4d8', '#48cae4'] },
    { name: 'forest', colors: ['#2d5a27', '#4a7c44', '#6b9b37', '#8bc34a'] },
    { name: 'neon', colors: ['#ff00ff', '#00ffff', '#ffff00', '#ff0080'] },
    { name: 'sunset', colors: ['#ff4757', '#ff6b6b', '#ffa502', '#eccc68'] },
    { name: 'arctic', colors: ['#74b9ff', '#81ecec', '#a29bfe', '#dfe6e9'] },
    { name: 'volcanic', colors: ['#2c3e50', '#e74c3c', '#f39c12', '#f1c40f'] },
    { name: 'toxic', colors: ['#1b5e20', '#388e3c', '#7cb342', '#c6ff00'] },
    { name: 'royal', colors: ['#4a148c', '#7b1fa2', '#ab47bc', '#e1bee7'] },
    { name: 'copper', colors: ['#5d4037', '#8d6e63', '#bcaaa4', '#d7ccc8'] },
    { name: 'electric', colors: ['#1a1a2e', '#16537e', '#0984e3', '#74b9ff'] },
    { name: 'candy', colors: ['#fd79a8', '#fdcb6e', '#81ecec', '#a29bfe'] },
  ];
  
  const randomType = types[Math.floor(Math.random() * types.length)];
  const randomPointer = pointerTypes[Math.floor(Math.random() * pointerTypes.length)];
  const randomTheme = colorThemes[Math.floor(Math.random() * colorThemes.length)];
  const randomRange = RANDOM_RANGES[Math.floor(Math.random() * RANDOM_RANGES.length)];
  const useGradient = Math.random() > 0.4;
  const arcWidth = 0.1 + Math.random() * 0.25;
  const hidePointer = Math.random() > 0.85;
  
  // Calculate limits based on the range - ensure limits are within valid bounds
  const range = randomRange.maxValue - randomRange.minValue;
  const numColors = randomTheme.colors.length;
  
  // For gradient mode: use subArcs WITHOUT explicit limits (just colors)
  // This avoids validation issues and lets the gradient distribute colors evenly
  const gradientSubArcs = randomTheme.colors.map((color, i) => {
    // Use percentage-based length instead of absolute limits
    // This is more robust and avoids minValue/maxValue validation issues
    return { 
      length: 1 / numColors, // Equal distribution
      color 
    };
  });
  
  // For non-gradient mode: use colorArray (no subArcs needed)
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
        subArcs: [], // IMPORTANT: Empty array overrides default subArcs to prevent limit validation errors
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
  // Initialize values to mid-range for each preset
  const [values, setValues] = useState<number[]>(() => 
    GAUGE_PRESETS.map(preset => {
      const min = (preset.config as any)?.minValue ?? 0;
      const max = (preset.config as any)?.maxValue ?? 100;
      return min + (max - min) * 0.5;
    })
  );
  const [randomConfig, setRandomConfig] = useState(() => generateRandomConfig());
  const [randomValue, setRandomValue] = useState(() => {
    const config = generateRandomConfig();
    const min = (config as any)?.minValue ?? 0;
    const max = (config as any)?.maxValue ?? 100;
    return min + (max - min) * 0.5;
  });
  const [autoAnimate, setAutoAnimate] = useState(true);
  const [copiedIndex, setCopiedIndex] = useState<number | 'random' | null>(null);
  const [randomKey, setRandomKey] = useState(0); // Key to force re-render
  const [editorValue, setEditorValue] = useState('');
  const [isLightTheme, setIsLightTheme] = useState(false); // Theme toggle
  const [columnCount, setColumnCount] = useState<1 | 2 | 3 | 4>(4); // Column count selector (default 4)
  const [sandboxOpen, setSandboxOpen] = useState(false); // Sandbox accordion state
  const [sandboxWidth, setSandboxWidth] = useState('400px'); // Sandbox gauge width
  const [sandboxHeight, setSandboxHeight] = useState('300px'); // Sandbox gauge height
  const [gaugeAlign, setGaugeAlign] = useState<'left' | 'center' | 'right'>('left'); // Gauge alignment

  // Grid size configurations based on column count
  const gridConfigs = {
    1: { columns: 'repeat(1, 1fr)', cardHeight: '350px' },
    2: { columns: 'repeat(2, 1fr)', cardHeight: '280px' },
    3: { columns: 'repeat(3, 1fr)', cardHeight: '220px' },
    4: { columns: 'repeat(4, 1fr)', cardHeight: '180px' },
  };

  // Sandbox size presets
  const sizePresets = [
    { name: '📱 Mobile', width: '280px', height: '200px', icon: '📱' },
    { name: '💻 Desktop', width: '400px', height: '300px', icon: '💻' },
    { name: '🖥️ Large', width: '600px', height: '400px', icon: '🖥️' },
    { name: '📊 Dashboard', width: '250px', height: '180px', icon: '📊' },
    { name: '🎯 Compact', width: '150px', height: '120px', icon: '🎯' },
    { name: '🖼️ Wide', width: '500px', height: '250px', icon: '🖼️' },
    { name: '📐 Square', width: '300px', height: '300px', icon: '📐' },
    { name: '🔲 Full Width', width: '100%', height: '350px', icon: '🔲' },
  ];

  // Auto-animate values with STAGGERED updates for better performance
  // Instead of updating all gauges at once (overwhelming), we update in waves
  useEffect(() => {
    if (!autoAnimate) return;
    
    const STAGGER_DELAY = 100; // ms between each gauge update
    const CYCLE_INTERVAL = 4000; // ms between full cycles
    const BATCH_SIZE = 4; // Update this many gauges per batch
    
    let timeouts: ReturnType<typeof setTimeout>[] = [];
    
    const runAnimationCycle = () => {
      // Clear any pending timeouts
      timeouts.forEach(clearTimeout);
      timeouts = [];
      
      // Stagger gallery gauge updates in batches
      const totalBatches = Math.ceil(GAUGE_PRESETS.length / BATCH_SIZE);
      
      for (let batch = 0; batch < totalBatches; batch++) {
        const timeout = setTimeout(() => {
          setValues(prev => {
            const next = [...prev];
            const startIdx = batch * BATCH_SIZE;
            const endIdx = Math.min(startIdx + BATCH_SIZE, GAUGE_PRESETS.length);
            
            for (let idx = startIdx; idx < endIdx; idx++) {
              const preset = GAUGE_PRESETS[idx]?.config;
              const min = (preset as any)?.minValue ?? 0;
              const max = (preset as any)?.maxValue ?? 100;
              next[idx] = min + Math.random() * (max - min);
            }
            return next;
          });
        }, batch * STAGGER_DELAY);
        
        timeouts.push(timeout);
      }
      
      // Update random gauge after gallery animations settle
      const randomTimeout = setTimeout(() => {
        const min = (randomConfig as any)?.minValue ?? 0;
        const max = (randomConfig as any)?.maxValue ?? 100;
        setRandomValue(min + Math.random() * (max - min));
      }, totalBatches * STAGGER_DELAY + 200);
      
      timeouts.push(randomTimeout);
    };
    
    // Initial animation
    runAnimationCycle();
    
    // Set up recurring cycle
    const interval = setInterval(runAnimationCycle, CYCLE_INTERVAL);
    
    return () => {
      timeouts.forEach(clearTimeout);
      clearInterval(interval);
    };
  }, [autoAnimate, randomConfig]);

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
      // Generate value within the new config's range
      const min = (newConfig as any)?.minValue ?? 0;
      const max = (newConfig as any)?.maxValue ?? 100;
      const newValue = min + Math.random() * (max - min);
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

  // Dynamic theme styles
  const themeStyles = {
    container: {
      ...styles.container,
      background: isLightTheme 
        ? 'linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 50%, #d1d8e0 100%)' 
        : styles.container.background,
      color: isLightTheme ? '#1a1a2e' : '#fff',
    },
    header: {
      ...styles.header,
      background: isLightTheme ? 'rgba(255, 255, 255, 0.8)' : styles.header.background,
    },
    gaugeCard: {
      ...styles.gaugeCard,
      background: isLightTheme ? 'rgba(255, 255, 255, 0.9)' : styles.gaugeCard.background,
      border: isLightTheme ? '1px solid rgba(0, 0, 0, 0.1)' : styles.gaugeCard.border,
    },
    randomizerCard: {
      ...styles.randomizerCard,
      background: isLightTheme ? 'rgba(255, 255, 255, 0.9)' : styles.randomizerCard.background,
      border: isLightTheme ? '1px solid rgba(0, 0, 0, 0.1)' : styles.randomizerCard.border,
    },
    editorPanel: {
      ...styles.editorPanel,
      background: isLightTheme ? 'rgba(240, 240, 245, 0.95)' : styles.editorPanel.background,
      border: isLightTheme ? '1px solid rgba(0, 0, 0, 0.1)' : styles.editorPanel.border,
    },
    editorTextarea: {
      ...styles.editorTextarea,
      background: isLightTheme ? 'rgba(255, 255, 255, 0.9)' : styles.editorTextarea.background,
      color: isLightTheme ? '#2d5a27' : styles.editorTextarea.color,
      border: isLightTheme ? '1px solid rgba(0, 0, 0, 0.15)' : styles.editorTextarea.border,
    },
    resizeDemo: {
      ...styles.resizeDemo,
      background: isLightTheme ? 'rgba(255, 255, 255, 0.9)' : styles.resizeDemo.background,
      border: isLightTheme ? '1px solid rgba(0, 0, 0, 0.1)' : styles.resizeDemo.border,
    },
    footer: {
      ...styles.footer,
      background: isLightTheme ? 'rgba(255, 255, 255, 0.5)' : styles.footer.background,
    },
    hint: {
      ...styles.hint,
      color: isLightTheme ? 'rgba(0, 0, 0, 0.5)' : styles.hint.color,
    },
    toggleLabel: {
      ...styles.toggleLabel,
      background: isLightTheme ? 'rgba(0, 0, 0, 0.05)' : styles.toggleLabel.background,
    },
    fixedHeader: {
      ...styles.fixedHeader,
      background: isLightTheme 
        ? 'rgba(255, 255, 255, 0.95)' 
        : 'rgba(26, 26, 46, 0.95)',
      borderBottom: isLightTheme 
        ? '1px solid rgba(0, 0, 0, 0.1)' 
        : '1px solid rgba(255, 255, 255, 0.1)',
    },
  };

  return (
    <div style={themeStyles.container}>
      {/* Fixed Header with Controls */}
      <header style={themeStyles.fixedHeader}>
        <div style={styles.headerRow}>
          {/* Logo & Title */}
          <div style={styles.headerBrand}>
            <span style={styles.headerLogo}>📊</span>
            <span style={styles.headerTitle}>React Gauge Component</span>
          </div>

          {/* Controls */}
          <div style={styles.headerControls}>
            {/* Auto-animate checkbox */}
            <label style={styles.headerCheckbox}>
              <input 
                type="checkbox" 
                checked={autoAnimate} 
                onChange={(e) => setAutoAnimate(e.target.checked)}
                style={styles.checkbox}
              />
              <span>Auto-animate</span>
            </label>

            {/* Column selector */}
            <div style={styles.headerColumnButtons}>
              {([1, 2, 3, 4] as const).map((cols) => (
                <button
                  key={cols}
                  onClick={() => setColumnCount(cols)}
                  style={{
                    ...styles.headerColButton,
                    background: columnCount === cols 
                      ? 'linear-gradient(90deg, #00d9ff, #00ff88)' 
                      : 'rgba(255, 255, 255, 0.1)',
                    color: columnCount === cols ? '#1a1a2e' : '#fff',
                  }}
                  type="button"
                  title={`${cols} column${cols > 1 ? 's' : ''}`}
                >
                  {cols}
                </button>
              ))}
            </div>

            {/* Theme toggle */}
            <button 
              onClick={() => setIsLightTheme(!isLightTheme)} 
              style={{
                ...styles.headerThemeToggle,
                background: isLightTheme ? '#1a1a2e' : '#fff',
                color: isLightTheme ? '#fff' : '#1a1a2e',
              }}
              type="button"
            >
              {isLightTheme ? '🌙' : '☀️'}
            </button>

            {/* GitHub link */}
            <a 
              href="https://github.com/antoniolago/react-gauge-component" 
              target="_blank" 
              rel="noopener noreferrer" 
              style={styles.headerGithubLink}
              title="View on GitHub"
            >
              <svg height="20" width="20" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
              </svg>
            </a>
          </div>
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div style={styles.headerSpacer} />

      {/* Sandbox Editor Accordion */}
      <section style={styles.sandboxSection}>
        <div 
          style={styles.accordionHeader}
          onClick={() => setSandboxOpen(!sandboxOpen)}
        >
          <h2 style={styles.sectionTitle}>
            🧪 Sandbox Editor
            <span style={styles.accordionArrow}>{sandboxOpen ? '▼' : '▶'}</span>
          </h2>
          <span style={styles.accordionHint}>
            {sandboxOpen ? 'Click to collapse' : 'Click to expand - Test & customize your gauge'}
          </span>
        </div>
        
        {sandboxOpen && (
          <div style={styles.sandboxContent}>
            {/* Enhanced Toolbar with CSS Grid Layout */}
            <div style={styles.editorToolbar}>
              {/* Presets - Full Width */}
              <div style={{ ...styles.toolbarGroupFull, borderColor: '#ff6b6b' }}>
                <span style={styles.groupLabel}>📦 Presets</span>
                <div style={styles.buttonRow}>
                  <button onClick={handleRandomize} style={styles.toolBtn} title="Random Config" type="button">🎲</button>
                  {[
                    { icon: '🌐', label: 'Bandwidth', config: { type: 'grafana', minValue: 0, maxValue: 3000, arc: { nbSubArcs: 150, colorArray: ['#5BE12C', '#F5CD19', '#EA4228'], width: 0.3, padding: 0.003 }, labels: { valueLabel: { style: { fontSize: 40 }, formatTextValue: (v: number) => v >= 1000 ? (Number.isInteger(v/1000) ? `${(v/1000).toFixed(0)} mbit/s` : `${(v/1000).toFixed(1)} mbit/s`) : `${v.toFixed(0)} kbit/s` }, tickLabels: { type: 'outer', ticks: [{ value: 100 }, { value: 200 }, { value: 300 }, { value: 400 }, { value: 500 }, { value: 600 }, { value: 700 }, { value: 800 }, { value: 900 }, { value: 1000 }, { value: 1500 }, { value: 2000 }, { value: 2500 }, { value: 3000 }], defaultTickValueConfig: { formatTextValue: (v: number) => v >= 1000 ? `${(v/1000).toFixed(0)}m` : `${v}k` } } }, pointer: { type: 'needle' } }, value: 900 },
                    { icon: '🌡️', label: 'Temp', config: { type: 'semicircle', minValue: -40, maxValue: 150, arc: { width: 0.2, subArcs: [{ limit: 0, color: '#00bcd4' }, { limit: 25, color: '#4caf50' }, { limit: 80, color: '#ff9800' }, { color: '#f44336' }] }, labels: { valueLabel: { formatTextValue: (v: number) => `${v}°C` }, tickLabels: { type: 'outer', ticks: [{ value: -40 }, { value: 0 }, { value: 50 }, { value: 100 }, { value: 150 }] } }, pointer: { type: 'blob' } }, value: 23 },
                    { icon: '🔊', label: 'Audio', config: { type: 'radial', minValue: -60, maxValue: 20, arc: { width: 0.15, gradient: true, subArcs: [{ limit: -20, color: '#2d5a27' }, { limit: 0, color: '#5BE12C' }, { limit: 10, color: '#F5CD19' }, { color: '#EA4228' }] }, labels: { valueLabel: { formatTextValue: (v: number) => `${v > 0 ? '+' : ''}${v} dB` }, tickLabels: { type: 'outer', ticks: [{ value: -60 }, { value: -40 }, { value: -20 }, { value: 0 }, { value: 20 }] } }, pointer: { type: 'needle', color: '#00ff88' } }, value: -12 },
                    { icon: '🔋', label: 'Battery', config: { type: 'grafana', minValue: 0, maxValue: 100, arc: { width: 0.25, subArcs: [{ limit: 20, color: '#EA4228' }, { limit: 40, color: '#F58B19' }, { limit: 60, color: '#F5CD19' }, { color: '#5BE12C' }] }, labels: { valueLabel: { formatTextValue: (v: number) => `${v.toFixed(1)}%`, matchColorWithArc: true }, tickLabels: { type: 'inner', ticks: [{ value: 0 }, { value: 25 }, { value: 50 }, { value: 75 }, { value: 100 }] } }, pointer: { type: 'arrow' } }, value: 73.5 },
                    { icon: '⚙️', label: 'RPM', config: { type: 'grafana', minValue: 0, maxValue: 8000, arc: { nbSubArcs: 30, colorArray: ['#5BE12C', '#5BE12C', '#F5CD19', '#F5CD19', '#EA4228'], width: 0.3, padding: 0.02 }, labels: { valueLabel: { formatTextValue: (v: number) => `${v.toFixed(0)} RPM` }, tickLabels: { type: 'outer', ticks: [{ value: 0 }, { value: 1000 }, { value: 2000 }, { value: 3000 }, { value: 4000 }, { value: 5000 }, { value: 6000 }, { value: 7000 }, { value: 8000 }], defaultTickValueConfig: { formatTextValue: (v: number) => `${v/1000}` } } }, pointer: { type: 'needle', color: '#EA4228' } }, value: 3500 },
                    { icon: '⚡', label: 'Voltage', config: { type: 'grafana', minValue: 0, maxValue: 16, arc: { width: 0.25, subArcs: [{ limit: 10, color: '#EA4228' }, { limit: 12, color: '#F5CD19' }, { limit: 14.5, color: '#5BE12C' }, { color: '#EA4228' }] }, labels: { valueLabel: { renderContent: (value: number) => React.createElement('div', { style: { textAlign: 'center', color: '#fff' } }, React.createElement('div', { style: { fontSize: '1.5rem' } }, '⚡'), React.createElement('div', { style: { fontSize: '1.2rem', fontWeight: 'bold' } }, `${value.toFixed(1)} V`)) }, tickLabels: { type: 'outer', ticks: [{ value: 0 }, { value: 4 }, { value: 8 }, { value: 10 }, { value: 12 }, { value: 14 }, { value: 16 }] } }, pointer: { type: 'arrow' } }, value: 12.6 },
                    { icon: '💻', label: 'CPU', config: { type: 'semicircle', minValue: 0, maxValue: 100, arc: { width: 0.3, gradient: true, subArcs: [{ limit: 40, color: '#5BE12C' }, { limit: 60, color: '#F5CD19' }, { limit: 80, color: '#F58B19' }, { color: '#EA4228' }] }, labels: { valueLabel: { formatTextValue: (v: number) => `${v.toFixed(0)}%` }, tickLabels: { hideMinMax: true } }, pointer: { type: 'blob' } }, value: 67 },
                    { icon: '⛽', label: 'Fuel', config: { type: 'semicircle', minValue: 0, maxValue: 100, arc: { width: 0.15, subArcs: [{ limit: 15, color: '#EA4228' }, { limit: 25, color: '#F58B19' }, { color: '#5BE12C' }] }, labels: { valueLabel: { hide: true }, tickLabels: { type: 'outer', ticks: [{ value: 0, valueConfig: { formatTextValue: () => 'E' } }, { value: 50, valueConfig: { formatTextValue: () => '½' } }, { value: 100, valueConfig: { formatTextValue: () => 'F' } }] } }, pointer: { type: 'needle', color: '#fff' } }, value: 35 },
                  ].map((p) => (
                    <button key={p.icon} onClick={() => { setRandomConfig(p.config as any); setRandomValue(p.value); setRandomKey(k => k + 1); }} style={styles.toolBtn} title={p.label} type="button">{p.icon}</button>
                  ))}
                </div>
              </div>

              {/* Gauge Type */}
              <div style={{ ...styles.toolbarGroup, borderColor: '#9b59b6' }}>
                <span style={styles.groupLabel}>🎨 Type</span>
                <div style={styles.buttonRow}>
                  {/* Semicircle - 180° arc */}
                  <button onClick={() => { setRandomConfig(prev => ({ ...prev, type: 'semicircle' })); setRandomKey(k => k + 1); }} style={{ ...styles.toolBtn, padding: '4px 8px', ...((randomConfig as any)?.type === 'semicircle' ? styles.toolBtnActive : {}) }} title="Semicircle" type="button">
                    <svg width="32" height="18" viewBox="0 0 32 18">
                      <path d="M 2 16 A 14 14 0 0 1 30 16" fill="none" stroke="#5BE12C" strokeWidth="3" strokeLinecap="round" />
                      <path d="M 2 16 A 14 14 0 0 1 16 2" fill="none" stroke="#F5CD19" strokeWidth="3" strokeLinecap="round" />
                      <line x1="16" y1="16" x2="10" y2="6" stroke={(randomConfig as any)?.type === 'semicircle' ? '#1a1a2e' : '#fff'} strokeWidth="2" strokeLinecap="round" />
                      <circle cx="16" cy="16" r="2" fill={(randomConfig as any)?.type === 'semicircle' ? '#1a1a2e' : '#fff'} />
                    </svg>
                  </button>
                  {/* Radial - ~270° arc */}
                  <button onClick={() => { setRandomConfig(prev => ({ ...prev, type: 'radial' })); setRandomKey(k => k + 1); }} style={{ ...styles.toolBtn, padding: '4px 8px', ...((randomConfig as any)?.type === 'radial' ? styles.toolBtnActive : {}) }} title="Radial" type="button">
                    <svg width="32" height="24" viewBox="0 0 32 24">
                      <path d="M 4 20 A 13 13 0 1 1 28 20" fill="none" stroke="#5BE12C" strokeWidth="3" strokeLinecap="round" />
                      <path d="M 4 20 A 13 13 0 0 1 16 4" fill="none" stroke="#F5CD19" strokeWidth="3" strokeLinecap="round" />
                      <line x1="16" y1="17" x2="10" y2="9" stroke={(randomConfig as any)?.type === 'radial' ? '#1a1a2e' : '#fff'} strokeWidth="2" strokeLinecap="round" />
                      <circle cx="16" cy="17" r="2" fill={(randomConfig as any)?.type === 'radial' ? '#1a1a2e' : '#fff'} />
                    </svg>
                  </button>
                  {/* Grafana - segmented arc with outer ring */}
                  <button onClick={() => { setRandomConfig(prev => ({ ...prev, type: 'grafana' })); setRandomKey(k => k + 1); }} style={{ ...styles.toolBtn, padding: '4px 8px', ...((randomConfig as any)?.type === 'grafana' ? styles.toolBtnActive : {}) }} title="Grafana" type="button">
                    <svg width="32" height="24" viewBox="0 0 32 24">
                      <path d="M 4 20 A 13 13 0 0 1 10 6" fill="none" stroke="#5BE12C" strokeWidth="4" strokeLinecap="round" />
                      <path d="M 11 5 A 13 13 0 0 1 21 5" fill="none" stroke="#F5CD19" strokeWidth="4" strokeLinecap="round" />
                      <path d="M 22 6 A 13 13 0 0 1 28 20" fill="none" stroke="#EA4228" strokeWidth="4" strokeLinecap="round" />
                      <path d="M 3 21 A 14 14 0 1 1 29 21" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
                      <line x1="16" y1="17" x2="10" y2="9" stroke={(randomConfig as any)?.type === 'grafana' ? '#1a1a2e' : '#fff'} strokeWidth="2" strokeLinecap="round" />
                      <circle cx="16" cy="17" r="2" fill={(randomConfig as any)?.type === 'grafana' ? '#1a1a2e' : '#fff'} />
                    </svg>
                  </button>
                </div>
              </div>

              {/* SubArcs - Full Width */}
              <div style={{ ...styles.toolbarGroupFull, borderColor: '#e74c3c' }}>
                <span style={styles.groupLabel}>🌈 SubArcs</span>
                <div style={styles.buttonRow}>
                  {/* Color Presets */}
                  {[
                    { label: 'Traffic', colors: ['#5BE12C', '#F5CD19', '#EA4228'] },
                    { label: 'Ocean', colors: ['#00bcd4', '#2196f3', '#3f51b5'] },
                    { label: 'Sunset', colors: ['#ff9800', '#ff5722', '#e91e63'] },
                    { label: 'Forest', colors: ['#8bc34a', '#4caf50', '#2e7d32'] },
                    { label: 'Purple', colors: ['#ce93d8', '#9c27b0', '#6a1b9a'] },
                    { label: 'Mono', colors: ['#bdbdbd', '#757575', '#424242'] },
                  ].map((preset) => (
                    <button key={preset.label} onClick={() => { 
                      const nbArcs = (randomConfig as any)?.arc?.nbSubArcs || 3;
                      setRandomConfig(prev => ({ ...prev, arc: { ...(prev as any).arc, colorArray: preset.colors, nbSubArcs: nbArcs, subArcs: [] } })); 
                      setRandomKey(k => k + 1); 
                    }} style={styles.toolBtn} title={preset.label} type="button">
                      <span style={{ display: 'flex', gap: '1px' }}>
                        {preset.colors.map((c, i) => <span key={i} style={{ width: '8px', height: '8px', borderRadius: '1px', background: c }} />)}
                      </span>
                    </button>
                  ))}
                  <span style={styles.toolbarDivider} />
                  {/* Number of SubArcs */}
                  <span style={styles.sliderLabel}>#</span>
                  {[3, 5, 10, 20, 50, 100].map((n) => (
                    <button key={n} onClick={() => { 
                      const colors = (randomConfig as any)?.arc?.colorArray || ['#5BE12C', '#F5CD19', '#EA4228'];
                      setRandomConfig(prev => ({ ...prev, arc: { ...(prev as any).arc, nbSubArcs: n, colorArray: colors, subArcs: [] } })); 
                      setRandomKey(k => k + 1); 
                    }} style={{ ...styles.toolBtn, ...((randomConfig as any)?.arc?.nbSubArcs === n ? styles.toolBtnActive : {}) }} type="button">{n}</button>
                  ))}
                  <span style={styles.toolbarDivider} />
                  {/* Gradient Toggle */}
                  <label style={styles.inlineLabel}>
                    <input type="checkbox" checked={(randomConfig as any)?.arc?.gradient || false} onChange={(e) => { setRandomConfig(prev => ({ ...prev, arc: { ...(prev as any).arc, gradient: e.target.checked } })); setRandomKey(k => k + 1); }} style={styles.inlineCheckbox} />
                    Gradient
                  </label>
                  <span style={styles.toolbarDivider} />
                  {/* Color Pickers */}
                  <span style={styles.sliderLabel}>Pick:</span>
                  {[0, 1, 2].map((i) => {
                    const colors = (randomConfig as any)?.arc?.colorArray || ['#5BE12C', '#F5CD19', '#EA4228'];
                    return (
                      <input 
                        key={i} 
                        type="color" 
                        value={colors[i] || '#ffffff'} 
                        onChange={(e) => {
                          const newColors = [...colors];
                          newColors[i] = e.target.value;
                          setRandomConfig(prev => ({ ...prev, arc: { ...(prev as any).arc, colorArray: newColors, nbSubArcs: (prev as any)?.arc?.nbSubArcs || 3, subArcs: [] } }));
                          setRandomKey(k => k + 1);
                        }}
                        style={styles.colorPicker}
                        title={`Color ${i + 1}`}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Arc Settings */}
              <div style={{ ...styles.toolbarGroup, borderColor: '#3498db' }}>
                <span style={styles.groupLabel}>📊 Arc</span>
                <div style={styles.buttonRow}>
                  <span style={styles.sliderLabel}>W</span>
                  <input type="range" min="0.05" max="0.5" step="0.01" value={(randomConfig as any)?.arc?.width ?? 0.2} onChange={(e) => { setRandomConfig(prev => ({ ...prev, arc: { ...(prev as any).arc, width: Number(e.target.value) } })); setRandomKey(k => k + 1); }} style={styles.slider} />
                  <span style={styles.sliderValue}>{((randomConfig as any)?.arc?.width ?? 0.2).toFixed(2)}</span>
                  <span style={styles.sliderLabel}>R</span>
                  <input type="range" min="0" max="20" step="1" value={(randomConfig as any)?.arc?.cornerRadius ?? 7} onChange={(e) => { setRandomConfig(prev => ({ ...prev, arc: { ...(prev as any).arc, cornerRadius: Number(e.target.value) } })); setRandomKey(k => k + 1); }} style={styles.slider} />
                  <span style={styles.sliderValue}>{(randomConfig as any)?.arc?.cornerRadius ?? 7}</span>
                </div>
              </div>

              {/* Pointer */}
              <div style={{ ...styles.toolbarGroup, borderColor: '#f39c12' }}>
                <span style={styles.groupLabel}>🎯 Pointer</span>
                <div style={styles.buttonRow}>
                  {[{ icon: '📍', type: 'needle', hide: false }, { icon: '⚫', type: 'blob', hide: false }, { icon: '➤', type: 'arrow', hide: false }, { icon: '👻', type: 'needle', hide: true }].map((p) => (
                    <button key={p.icon} onClick={() => { setRandomConfig(prev => ({ ...prev, pointer: { ...(prev as any).pointer, type: p.type, hide: p.hide } })); setRandomKey(k => k + 1); }} style={{ ...styles.toolBtn, ...((randomConfig as any)?.pointer?.type === p.type && (randomConfig as any)?.pointer?.hide === p.hide ? styles.toolBtnActive : {}) }} type="button">{p.icon}</button>
                  ))}
                  <input type="range" min="0.5" max="1" step="0.05" value={(randomConfig as any)?.pointer?.length ?? 0.7} onChange={(e) => { setRandomConfig(prev => ({ ...prev, pointer: { ...(prev as any).pointer, length: Number(e.target.value) } })); setRandomKey(k => k + 1); }} style={styles.slider} title={`Length: ${((randomConfig as any)?.pointer?.length ?? 0.7).toFixed(2)}`} />
                </div>
              </div>

              {/* Value Label */}
              <div style={{ ...styles.toolbarGroup, borderColor: '#1abc9c' }}>
                <span style={styles.groupLabel}>🏷️ Label</span>
                <div style={styles.buttonRow}>
                  <button onClick={() => { setRandomConfig(prev => ({ ...prev, labels: { ...(prev as any).labels, valueLabel: { ...(prev as any).labels?.valueLabel, hide: !(prev as any).labels?.valueLabel?.hide } } })); setRandomKey(k => k + 1); }} style={{ ...styles.toolBtn, ...(!(randomConfig as any)?.labels?.valueLabel?.hide ? styles.toolBtnActive : {}) }} type="button">👁️</button>
                  <button onClick={() => { setRandomConfig(prev => ({ ...prev, labels: { ...(prev as any).labels, valueLabel: { ...(prev as any).labels?.valueLabel, matchColorWithArc: !(prev as any).labels?.valueLabel?.matchColorWithArc } } })); setRandomKey(k => k + 1); }} style={{ ...styles.toolBtn, ...((randomConfig as any)?.labels?.valueLabel?.matchColorWithArc ? styles.toolBtnActive : {}) }} type="button">🌈</button>
                  <input type="range" min="12" max="72" step="1" value={parseInt((randomConfig as any)?.labels?.valueLabel?.style?.fontSize || '35')} onChange={(e) => { setRandomConfig(prev => ({ ...prev, labels: { ...(prev as any).labels, valueLabel: { ...(prev as any).labels?.valueLabel, hide: false, style: { ...(prev as any).labels?.valueLabel?.style, fontSize: `${e.target.value}px` } } } })); setRandomKey(k => k + 1); }} style={styles.slider} title={`Font: ${parseInt((randomConfig as any)?.labels?.valueLabel?.style?.fontSize || '35')}px`} />
                </div>
              </div>

              {/* Tick Labels */}
              <div style={{ ...styles.toolbarGroup, borderColor: '#e67e22' }}>
                <span style={styles.groupLabel}>📏 Ticks</span>
                <div style={styles.buttonRow}>
                  {[{ label: '∅', interval: 0 }, { label: '10', interval: 10 }, { label: '25', interval: 25 }].map((t) => (
                    <button key={t.label} onClick={() => { const min = (randomConfig as any)?.minValue ?? 0; const max = (randomConfig as any)?.maxValue ?? 100; const ticks = t.interval === 0 ? [] : Array.from({ length: Math.floor((max - min) / t.interval) + 1 }, (_, i) => ({ value: min + i * t.interval })); setRandomConfig(prev => ({ ...prev, labels: { ...(prev as any).labels, tickLabels: { ...(prev as any).labels?.tickLabels, type: 'outer', ticks, hideMinMax: t.interval === 0 } } })); setRandomKey(k => k + 1); }} style={styles.toolBtn} type="button">{t.label}</button>
                  ))}
                  <button onClick={() => { setRandomConfig(prev => ({ ...prev, labels: { ...(prev as any).labels, tickLabels: { ...(prev as any).labels?.tickLabels, type: 'outer' } } })); setRandomKey(k => k + 1); }} style={{ ...styles.toolBtn, ...((randomConfig as any)?.labels?.tickLabels?.type === 'outer' ? styles.toolBtnActive : {}) }} type="button">↗</button>
                  <button onClick={() => { setRandomConfig(prev => ({ ...prev, labels: { ...(prev as any).labels, tickLabels: { ...(prev as any).labels?.tickLabels, type: 'inner' } } })); setRandomKey(k => k + 1); }} style={{ ...styles.toolBtn, ...((randomConfig as any)?.labels?.tickLabels?.type === 'inner' ? styles.toolBtnActive : {}) }} type="button">↙</button>
                </div>
              </div>

              {/* Container Size - Small */}
              <div style={{ ...styles.toolbarGroupSmall, borderColor: '#95a5a6' }}>
                <span style={styles.groupLabel}>📐 Size</span>
                <div style={styles.buttonRow}>
                  <input type="range" min="150" max="600" step="10" value={parseInt(sandboxWidth)} onChange={(e) => setSandboxWidth(`${e.target.value}px`)} style={{ ...styles.slider, width: '50px' }} title={`W: ${parseInt(sandboxWidth)}px`} />
                  <input type="range" min="100" max="400" step="10" value={parseInt(sandboxHeight)} onChange={(e) => setSandboxHeight(`${e.target.value}px`)} style={{ ...styles.slider, width: '50px' }} title={`H: ${parseInt(sandboxHeight)}px`} />
                  {[{ icon: '⬅', v: 'left' as const }, { icon: '⬛', v: 'center' as const }, { icon: '➡', v: 'right' as const }].map((a) => (
                    <button key={a.v} onClick={() => setGaugeAlign(a.v)} style={{ ...styles.toolBtn, padding: '4px 6px', ...((gaugeAlign === a.v) ? styles.toolBtnActive : {}) }} type="button">{a.icon}</button>
                  ))}
                </div>
              </div>

              {/* Value Control - Full Width */}
              <div style={{ ...styles.toolbarGroupFull, borderColor: '#2ecc71' }}>
                <span style={styles.groupLabel}>🎚️ Value</span>
                <div style={styles.buttonRow}>
                  <label style={styles.inlineLabel}>
                    <input type="checkbox" checked={autoAnimate} onChange={(e) => setAutoAnimate(e.target.checked)} style={styles.inlineCheckbox} />
                    Auto
                  </label>
                  {[0, 25, 50, 75, 100].map((val) => {
                    const min = (randomConfig as any)?.minValue ?? 0;
                    const max = (randomConfig as any)?.maxValue ?? 100;
                    const actualValue = min + (val / 100) * (max - min);
                    return <button key={val} onClick={() => setRandomValue(actualValue)} style={{ ...styles.toolBtn, ...(Math.abs(randomValue - actualValue) < 0.01 ? styles.toolBtnActive : {}) }} type="button">{val}</button>;
                  })}
                  <input type="range" min={(randomConfig as any)?.minValue ?? 0} max={(randomConfig as any)?.maxValue ?? 100} value={randomValue} onChange={(e) => setRandomValue(Number(e.target.value))} style={{ ...styles.slider, flex: 1, minWidth: '100px' }} step="0.1" />
                  <span style={{ ...styles.sliderValue, fontWeight: 700, color: '#00d9ff' }}>{randomValue.toFixed(1)}</span>
                </div>
              </div>
            </div>

            {/* Gauge Preview - Aligned */}
            <div style={{
              ...styles.gaugePreviewContainer,
              justifyContent: gaugeAlign === 'left' ? 'flex-start' : gaugeAlign === 'right' ? 'flex-end' : 'center',
            }}>
              <div 
                style={{
                  ...themeStyles.randomizerCard,
                  width: sandboxWidth,
                  height: sandboxHeight,
                  minWidth: '150px',
                  minHeight: '100px',
                  maxWidth: '100%',
                  transition: 'all 0.3s ease',
                  resize: 'both',
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                {/* Copy button in top-right corner */}
                <button
                  onClick={() => copyToClipboard(randomConfig, randomValue, 'random')}
                  style={styles.copyCornerBtn}
                  title="Copy Code"
                  type="button"
                >
                  {copiedIndex === 'random' ? '✓' : '📋'}
                </button>
                <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                  <GaugeComponent 
                    key={randomKey} 
                    value={randomValue} 
                    {...randomConfig} 
                    onValueChange={(newValue) => setRandomValue(newValue)}
                  />
                </div>
                <div style={styles.dragHint}>
                  🎯 Drag the pointer or click the arc to set value
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Gallery Section */}
      <section style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>🎨 Preset Gallery</h2>
          <span style={themeStyles.hint}>Click any gauge to copy its code!</span>
        </div>
        <div style={{
          ...styles.gallery,
          gridTemplateColumns: gridConfigs[columnCount].columns,
        }}>
          {GAUGE_PRESETS.map((preset, index) => (
            <div 
              key={index} 
              style={{
                ...themeStyles.gaugeCard,
                ...(copiedIndex === index ? styles.copiedCard : {}),
              }}
              onClick={(e) => handleCardClick(e, preset.config, values[index], index)}
            >
              <div style={{
                ...styles.gaugeWrapper,
                height: gridConfigs[columnCount].cardHeight,
              }}>
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

      {/* Footer */}
      <footer style={themeStyles.footer}>
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
  // Fixed header styles
  fixedHeader: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backdropFilter: 'blur(12px)',
    padding: '12px 20px',
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: '1400px',
    margin: '0 auto',
    gap: '20px',
  },
  headerBrand: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  headerLogo: {
    fontSize: '1.5rem',
  },
  headerTitle: {
    fontSize: '1.2rem',
    fontWeight: 700,
    background: 'linear-gradient(90deg, #00d9ff, #00ff88)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  headerControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  headerToggle: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    borderRadius: '20px',
    fontWeight: 600,
    fontSize: '0.85rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: 'none',
  },
  headerColumnButtons: {
    display: 'flex',
    gap: '4px',
    background: 'rgba(255, 255, 255, 0.05)',
    padding: '4px',
    borderRadius: '16px',
  },
  headerColButton: {
    width: '32px',
    height: '32px',
    borderRadius: '12px',
    border: 'none',
    fontWeight: 600,
    fontSize: '0.85rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerThemeToggle: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    border: 'none',
    fontSize: '1.1rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerGithubLink: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.1)',
    color: '#fff',
    transition: 'all 0.2s ease',
  },
  headerCheckbox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 14px',
    borderRadius: '20px',
    background: 'rgba(255, 255, 255, 0.1)',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: 500,
  },
  headerSpacer: {
    height: '70px', // Match header height
  },
  // Legacy header styles (kept for reference)
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
  themeToggle: {
    padding: '10px 20px',
    borderRadius: '25px',
    border: 'none',
    fontWeight: 600,
    fontSize: '0.95rem',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  columnButtons: {
    display: 'flex',
    gap: '8px',
  },
  columnButton: {
    padding: '10px 16px',
    borderRadius: '20px',
    border: 'none',
    fontWeight: 600,
    fontSize: '0.9rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
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
  sandboxSection: {
    width: '90vw',
    maxWidth: '1800px',
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
  // Sandbox Editor Styles
  accordionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 25px',
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '16px',
    cursor: 'pointer',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    transition: 'all 0.3s ease',
    marginBottom: '0',
  },
  accordionArrow: {
    marginLeft: '12px',
    fontSize: '0.8em',
    opacity: 0.7,
  },
  accordionHint: {
    fontSize: '0.85rem',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  sandboxContent: {
    marginTop: '20px',
    animation: 'fadeIn 0.3s ease',
  },
  // Enhanced Editor Toolbar with Colored Groups - CSS Grid Layout
  editorToolbar: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '8px',
    marginBottom: '16px',
    background: 'rgba(0, 0, 0, 0.3)',
    borderRadius: '12px',
    padding: '12px',
  },
  toolbarRow: {
    display: 'contents', // Allow children to participate in parent grid
  },
  toolbarGroup: {
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '8px',
    padding: '10px 12px',
    borderLeft: '3px solid',
  },
  // Wide groups span 2 columns
  toolbarGroupWide: {
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '8px',
    padding: '10px 12px',
    borderLeft: '3px solid',
    gridColumn: 'span 2',
  },
  // Full width groups span all columns
  toolbarGroupFull: {
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '8px',
    padding: '10px 12px',
    borderLeft: '3px solid',
    gridColumn: '1 / -1',
  },
  // Small group for compact controls
  toolbarGroupSmall: {
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '8px',
    padding: '8px 10px',
    borderLeft: '3px solid',
    minWidth: 'auto',
    flex: '0 0 auto',
  },
  toolbarDivider: {
    width: '1px',
    height: '20px',
    background: 'rgba(255, 255, 255, 0.2)',
    margin: '0 4px',
  },
  colorPicker: {
    width: '28px',
    height: '28px',
    padding: '0',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '4px',
    cursor: 'pointer',
    background: 'transparent',
  },
  groupLabel: {
    display: 'block',
    fontSize: '0.75rem',
    fontWeight: 700,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: '8px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  buttonRow: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  toolBtn: {
    padding: '6px 10px',
    borderRadius: '6px',
    border: 'none',
    background: 'rgba(255, 255, 255, 0.1)',
    color: '#fff',
    fontSize: '0.8rem',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  toolBtnActive: {
    background: 'linear-gradient(90deg, #00d9ff, #00ff88)',
    color: '#1a1a2e',
  },
  slider: {
    width: '80px',
    height: '6px',
    borderRadius: '3px',
    cursor: 'pointer',
    accentColor: '#00d9ff',
  },
  sliderLabel: {
    fontSize: '0.75rem',
    fontWeight: 500,
    color: 'rgba(255, 255, 255, 0.6)',
    marginLeft: '8px',
  },
  sliderValue: {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#00d9ff',
    minWidth: '40px',
  },
  inlineLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.75rem',
    color: 'rgba(255, 255, 255, 0.7)',
    cursor: 'pointer',
  },
  inlineCheckbox: {
    width: '14px',
    height: '14px',
    accentColor: '#00d9ff',
  },
  gaugePreviewContainer: {
    display: 'flex',
    justifyContent: 'center',
    padding: '20px',
  },
  dragHint: {
    textAlign: 'center',
    fontSize: '0.75rem',
    color: 'rgba(255, 255, 255, 0.5)',
    padding: '8px',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    marginTop: '8px',
  },
  copyCornerBtn: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    width: '32px',
    height: '32px',
    borderRadius: '6px',
    border: 'none',
    background: 'rgba(0, 0, 0, 0.5)',
    color: '#fff',
    fontSize: '1rem',
    cursor: 'pointer',
    zIndex: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  },
  actionButton: {
    padding: '6px 12px',
    borderRadius: '12px',
    border: 'none',
    background: 'linear-gradient(90deg, #00d9ff, #00ff88)',
    color: '#1a1a2e',
    fontWeight: 600,
    fontSize: '0.75rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  sizePresetGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '8px',
  },
  sizePresetButton: {
    padding: '8px 12px',
    borderRadius: '12px',
    border: 'none',
    fontWeight: 500,
    fontSize: '0.75rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
  },
  quickValueButton: {
    padding: '8px 14px',
    borderRadius: '15px',
    border: 'none',
    fontWeight: 600,
    fontSize: '0.8rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  typeButton: {
    padding: '10px 16px',
    borderRadius: '20px',
    border: 'none',
    fontWeight: 600,
    fontSize: '0.85rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  presetButton: {
    padding: '5px 10px',
    borderRadius: '10px',
    border: 'none',
    fontWeight: 500,
    fontSize: '0.7rem',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    background: 'rgba(255, 255, 255, 0.1)',
    color: '#fff',
  },
  colorButton: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  sandboxContainer: {
    display: 'flex',
    gap: '25px',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
  },
  editorActions: {
    display: 'flex',
    gap: '8px',
  },
  copyButton: {
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    padding: '8px 16px',
    borderRadius: '20px',
    color: '#fff',
    fontWeight: 600,
    fontSize: '0.85rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  valueSlider: {
    flex: 1,
    minWidth: '100px',
    height: '6px',
    borderRadius: '3px',
    cursor: 'pointer',
  },
  sandboxToggleLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 18px',
    borderRadius: '20px',
    fontWeight: 600,
    fontSize: '0.85rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: 'none',
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
