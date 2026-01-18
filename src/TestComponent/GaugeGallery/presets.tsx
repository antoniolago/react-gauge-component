import React from "react";
import GaugeComponent from "../../lib";
import { LinearGaugeComponent } from "../../lib";
import { GaugePreset, SandboxPreset, ColorPreset, SizePreset, LinearGaugePreset } from "./types";

/**
 * Gallery presets for showcasing different gauge configurations
 * Each preset uses a JSX component function for easy copy/paste
 */
export const GAUGE_PRESETS: GaugePreset[] = [
  {
    name: "Server Temperature",
    description: "Datacenter monitoring with zones",
    component: (value) => (
      <GaugeComponent
        value={value}
        type="semicircle"
        minValue={10}
        maxValue={50}
        arc={{
          width: 0.2,
          padding: 0.015,
          cornerRadius: 2,
          subArcs: [
            {
              limit: 18,
              color: "#00bcd4",
              showTick: true,
              tooltip: { text: "Cold" },
            },
            {
              limit: 25,
              color: "#4caf50",
              showTick: true,
              tooltip: { text: "Optimal" },
            },
            {
              limit: 35,
              color: "#ff9800",
              showTick: true,
              tooltip: { text: "Warm" },
            },
            { color: "#f44336", tooltip: { text: "Critical!" } },
          ],
        }}
        pointer={{ type: "needle", color: "#e0e0e0", length: 0.7, width: 8, maxFps: 30 }}
        labels={{
          valueLabel: {
            formatTextValue: (v) => `${v.toFixed(1)}°C`,
            style: { fontSize: "20px", fill: "#e0e0e0", fontWeight: "bold" },
          },
          tickLabels: {
            type: "outer",
            defaultTickValueConfig: {
              formatTextValue: (v) => `${v}°`,
              style: { fontSize: "9px", fill: "#aaa" },
            },
            defaultTickLineConfig: { color: "#666", length: 4, width: 1 },
          },
        }}
      />
    ),
  },
  {
    name: "Network Speed",
    description: "Bandwidth meter with formatted values",
    component: (value) => {
      const kbitsToMbits = (v: number) => {
        if (v >= 1000) {
          v = v / 1000;
          if (Number.isInteger(v)) {
            return v.toFixed(0) + " mbit/s";
          } else {
            return v.toFixed(1) + " mbit/s";
          }
        } else {
          return v.toFixed(0) + " kbit/s";
        }
      };
      return (
        <GaugeComponent
          value={value}
          arc={{
            nbSubArcs: 150,
            colorArray: ["#5BE12C", "#F5CD19", "#EA4228"],
            width: 0.3,
            padding: 0.003,
            cornerRadius: 0,
          }}
          labels={{
            valueLabel: {
              style: { fontSize: 40 },
              formatTextValue: (v) => {
                if (v >= 1000) {
                  v = v / 1000;
                  if (Number.isInteger(v)) {
                    return v.toFixed(0) + " mbit/s";
                  } else {
                    return v.toFixed(1) + " mbit/s";
                  }
                } else {
                  return v.toFixed(0) + " kbit/s";
                }
              },
              offsetY: -20,
            },
            tickLabels: {
              type: "outer",
              ticks: [
                { value: 100 },
                { value: 200 },
                { value: 300 },
                { value: 400 },
                { value: 500 },
                { value: 600 },
                { value: 700 },
                { value: 800 },
                { value: 900 },
                { value: 1000 },
                { value: 1500 },
                { value: 2000 },
                { value: 2500 },
                { value: 3000 },
              ],
              defaultTickValueConfig: {
                formatTextValue: (v) => {
                  if (v >= 1000) {
                    v = v / 1000;
                    if (Number.isInteger(v)) {
                      return v.toFixed(0) + " mbit/s";
                    } else {
                      return v.toFixed(1) + " mbit/s";
                    }
                  } else {
                    return v.toFixed(0) + " kbit/s";
                  }
                },
                style: { fontSize: 10 },
              },
            },
          }}
          maxValue={3000}
        />
      );
    },
  },
  {
    name: "Grafana Neon",
    description: "Grafana with neon glow effect",
    component: (value) => (
      <GaugeComponent
        value={value}
        type="grafana"
        minValue={0}
        maxValue={1000}
        arc={{
          width: 0.55,
          cornerRadius: 0,
          nbSubArcs: 52,
          colorArray: ["#ff00ff", "#00ffff", "#ffff00", "#ff0080"],
          padding: 0,
          subArcsStrokeWidth: 1,
          subArcsStrokeColor: "#000000",
          effects: { glow: true, glowBlur: 1, glowSpread: 2 },
        }}
        pointer={{
          type: "needle",
          elastic: true,
          animationDelay: 50,
          animationDuration: 3000,
          length: 0.87,
          width: 24,
          baseColor: "#ffffff",
          strokeWidth: 2,
          strokeColor: "#000000",
          maxFps: 30,
        }}
        labels={{
          valueLabel: {
            // formatTextValue: (v) => `${(v / 1000).toFixed(1)}k`,
            matchColorWithArc: true,
            style: { fontSize: "29px", fontWeight: "bold" },
            offsetY: 25,
          },
          tickLabels: {
            type: "outer",
            hideMinMax: false,
            ticks: [
              { value: 0 },
              { value: 250 },
              { value: 500 },
              { value: 1000 },
            ],
          },
        }}
      />
    ),
  },
  {
    name: "Custom Angle",
    description: "Custom angle radial with neon colors",
    component: (value) => (
      <GaugeComponent
        value={value}
        type="radial"
        minValue={-300}
        maxValue={3000}
        startAngle={-145}
        endAngle={40}
        arc={{
          width: 0.55,
          cornerRadius: 0,
          nbSubArcs: 52,
          colorArray: ["#ff00ff", "#00ffff", "#ffff00", "#ff0080"],
          padding: 0,
          subArcsStrokeWidth: 1,
          subArcsStrokeColor: "#000000",
          effects: { glow: true, glowBlur: 13, glowSpread: 0.2 },
        }}
        pointer={{
          type: "needle",
          elastic: true,
          animationDelay: 200,
          animationDuration: 3000,
          length: 0.87,
          width: 24,
          baseColor: "#ffffff",
          strokeWidth: 2,
          strokeColor: "#000000",
          maxFps: 30,
        }}
        labels={{
          valueLabel: {
            formatTextValue: (v) => "".concat((v / 1000).toFixed(1), "k"),
            matchColorWithArc: true,
            style: { fontSize: "29px", fontWeight: "bold" },
            offsetY: -6,
          },
          tickLabels: {
            type: "outer",
            hideMinMax: false,
            ticks: [{ value: 0 }, { value: 3000 }, { value: 2000 }],
          },
        }}
      />
    ),
  },
  {
    name: "Green Speedometer",
    description: "",
    component: (value) => (
      <GaugeComponent
        value={value}
        type="semicircle"
        minValue={0}
        maxValue={180}
        arc={{
          width: 0.08,
          cornerRadius: 0,
          padding: 0,
          subArcs: [{ color: "#00ff41" }],
          effects: { glow: true, glowBlur: 15, glowSpread: 1 },
        }}
        pointer={{
          type: "needle",
          color: "#ff3300",
          length: 0.85,
          width: 4,
          baseColor: "#1a1a1a",
          maxFps: 30,
        }}
        labels={{
          valueLabel: {
            formatTextValue: (v) => `${Math.round(v)} km/h`,
            style: {
              fontSize: "18px",
              fill: "#00ff41",
              fontWeight: "bold",
              textShadow: "0 0 10px #00ff41",
            },
          },
          tickLabels: {
            type: "outer",
            ticks: [
              { value: 0 },
              { value: 20 },
              { value: 40 },
              { value: 60 },
              { value: 80 },
              { value: 100 },
              { value: 120 },
              { value: 140 },
              { value: 160 },
              { value: 180 },
            ],
            defaultTickValueConfig: {
              formatTextValue: (v) => `${v} km/h`,
              style: { fontSize: "8px", fill: "#00ff41" },
            },
            defaultTickLineConfig: { color: "#00ff41", length: 8, width: 2 },
          },
        }}
      />
    ),
  },
  {
    name: "Battery",
    description: "Battery level with color zones",
    component: (value) => (
      <GaugeComponent
        value={value}
        type="grafana"
        arc={{
          width: 0.25,
          padding: 0.02,
          subArcs: [
            { limit: 20, color: "#EA4228", showTick: true },
            { limit: 40, color: "#F58B19", showTick: true },
            { limit: 60, color: "#F5CD19", showTick: true },
            { limit: 100, color: "#5BE12C", showTick: true },
          ],
        }}
        pointer={{ type: "arrow", color: "#e0e0e0", width: 15, maxFps: 30 }}
        labels={{
          valueLabel: {
            formatTextValue: (v) => `${v}%`,
            matchColorWithArc: true,
            style: { fontWeight: "bold" },
          },
          tickLabels: {
            type: "outer",
            defaultTickValueConfig: {
              style: { fontSize: "9px", fill: "#aaa" },
            },
          },
        }}
      />
    ),
  },
  {
    name: "Fuel Gauge",
    description: "Classic E/F fuel indicator",
    component: (value) => (
      <GaugeComponent
        value={value}
        type="semicircle"
        arc={{
          width: 0.18,
          subArcs: [{ limit: 25, color: "#EA4228" }, { color: "#5BE12C" }],
        }}
        pointer={{ type: "arrow", color: "#e0e0e0", width: 20, maxFps: 30 }}
        labels={{
          valueLabel: {
            formatTextValue: (v) => (v <= 25 ? "LOW" : "OK"),
            style: { fontSize: "22px", fill: "#e0e0e0", fontWeight: "bold" },
          },
          tickLabels: {
            type: "outer",
            ticks: [
              {
                value: 0,
                valueConfig: {
                  formatTextValue: () => "E",
                  style: {
                    fontSize: "12px",
                    fill: "#EA4228",
                    fontWeight: "bold",
                  },
                },
              },
              {
                value: 50,
                valueConfig: {
                  formatTextValue: () => "½",
                  style: { fontSize: "10px", fill: "#aaa" },
                },
              },
              {
                value: 100,
                valueConfig: {
                  formatTextValue: () => "F",
                  style: {
                    fontSize: "12px",
                    fill: "#5BE12C",
                    fontWeight: "bold",
                  },
                },
              },
            ],
            defaultTickLineConfig: { color: "#666", length: 6, width: 2 },
          },
        }}
      />
    ),
  },
  {
    name: "Warm Glow",
    description: "Warm colors with glow effect",
    component: (value) => (
      <GaugeComponent
        value={value}
        type="semicircle"
        minValue={0}
        maxValue={1}
        arc={{
          width: 1,
          cornerRadius: 44,
          nbSubArcs: 12,
          colorArray: ["#ff6b35", "#f7931e", "#ffcc02", "#ff3d00"],
          padding: 0.02,
          subArcsStrokeWidth: 1,
          subArcsStrokeColor: "#5e5c64",
          effects: {
            glow: true,
            glowSpread: 0.3,
            glowBlur: 11,
            dropShadow: { dy: 2, blur: 9, opacity: 0.6 },
          },
        }}
        pointer={{
          type: "needle",
          baseColor: "#9a9996",
          strokeWidth: 1,
          strokeColor: "#5e5c64",
          maxFps: 30,
        }}
        labels={{
          valueLabel: {
            matchColorWithArc: true,
            style: { fontSize: "40px", fontWeight: "bold" },
          },
          tickLabels: {
            type: "outer",
            ticks: [{ value: 0 }, { value: 0.5 }, { value: 1 }],
          },
        }}
      />
    ),
  },
  {
    name: "Frost Crystal",
    description: "Icy winter theme",
    component: (value) => (
      <GaugeComponent
        value={value}
        type="grafana"
        arc={{
          width: 0.25,
          padding: 0.01,
          subArcs: [
            { limit: 33, color: "#e0f7fa" },
            { limit: 66, color: "#80deea" },
            { color: "#00bcd4" },
          ],
          effects: { glow: true, glowBlur: 15, glowSpread: 0.5 },
        }}
        pointer={{ type: "needle", color: "#fff", length: 0.8, width: 6, maxFps: 30 }}
        labels={{
          valueLabel: {
            style: { fontSize: "26px", fill: "#e0f7fa", fontWeight: "300" },
          },
          tickLabels: { hideMinMax: true },
        }}
      />
    ),
  },
  // ==================== MEASUREMENT GAUGES ====================
  {
    name: "UV Index",
    description: "Sun exposure with risk levels",
    component: (value) => (
      <GaugeComponent
        value={value}
        type="grafana"
        minValue={0}
        maxValue={11}
        arc={{
          width: 0.3,
          padding: 0.015,
          subArcs: [
            { limit: 3, color: "#4caf50", tooltip: { text: "Low - Safe" } },
            {
              limit: 6,
              color: "#ffeb3b",
              tooltip: { text: "Moderate - Caution" },
            },
            {
              limit: 8,
              color: "#ff9800",
              tooltip: { text: "High - Protection needed" },
            },
            {
              limit: 10,
              color: "#f44336",
              tooltip: { text: "Very High - Extra protection" },
            },
            { color: "#9c27b0", tooltip: { text: "Extreme - Avoid sun" } },
          ],
        }}
        pointer={{ type: "needle", color: "#fff", length: 0.75, width: 10, maxFps: 30 }}
        labels={{
          valueLabel: {
            formatTextValue: (v) => {
              const labels = [
                "Low",
                "Low",
                "Low",
                "Moderate",
                "Moderate",
                "Moderate",
                "High",
                "High",
                "Very High",
                "Very High",
                "Extreme",
                "Extreme",
              ];
              return labels[Math.min(Math.round(v), 11)];
            },
            matchColorWithArc: true,
            style: { fontSize: "20px", fontWeight: "bold" },
          },
          tickLabels: {
            type: "outer",
            ticks: [
              { value: 0 },
              { value: 3 },
              { value: 6 },
              { value: 8 },
              { value: 11 },
            ],
            defaultTickValueConfig: {
              style: { fontSize: "10px", fill: "#aaa" },
            },
            defaultTickLineConfig: { color: "#666", length: 5, width: 1 },
          },
        }}
      />
    ),
  },
  {
    name: "Sound Level",
    description: "Decibel meter with VU style",
    component: (value) => (
      <GaugeComponent
        value={value}
        type="semicircle"
        minValue={0}
        maxValue={120}
        arc={{
          width: 0.15,
          padding: 0.008,
          nbSubArcs: 24,
          colorArray: [
            "#00c853",
            "#00c853",
            "#76ff03",
            "#c6ff00",
            "#ffea00",
            "#ffc400",
            "#ff9100",
            "#ff3d00",
            "#dd2c00",
          ],
        }}
        pointer={{
          type: "needle",
          color: "#111",
          length: 0.8,
          width: 4,
          baseColor: "#333",
          maxFps: 30,
        }}
        labels={{
          valueLabel: {
            formatTextValue: (v) => `${Math.round(v)} dB`,
            style: { fontSize: "22px", fill: "#fff", fontWeight: "bold" },
          },
          tickLabels: {
            type: "outer",
            ticks: [
              {
                value: 0,
                valueConfig: {
                  formatTextValue: () => "0",
                  style: { fontSize: "9px", fill: "#00c853" },
                },
              },
              {
                value: 40,
                valueConfig: {
                  formatTextValue: () => "40",
                  style: { fontSize: "9px", fill: "#76ff03" },
                },
              },
              {
                value: 70,
                valueConfig: {
                  formatTextValue: () => "70",
                  style: { fontSize: "9px", fill: "#ffea00" },
                },
              },
              {
                value: 85,
                valueConfig: {
                  formatTextValue: () => "85",
                  style: { fontSize: "9px", fill: "#ff9100" },
                },
              },
              {
                value: 120,
                valueConfig: {
                  formatTextValue: () => "120",
                  style: { fontSize: "9px", fill: "#dd2c00" },
                },
              },
            ],
            defaultTickLineConfig: { color: "#444", length: 4, width: 1 },
          },
        }}
      />
    ),
  },
  {
    name: "Compass Bearing",
    description: "Navigation heading indicator",
    component: (value) => (
      <GaugeComponent
        value={value}
        type="radial"
        minValue={0}
        maxValue={360}
        startAngle={-180}
        endAngle={180}
        arc={{
          width: 0.08,
          cornerRadius: 0,
          subArcs: [{ color: "#3498db" }],
        }}
        pointer={{ type: "needle", color: "#e74c3c", length: 0.7, width: 6, maxFps: 30 }}
        labels={{
          valueLabel: {
            formatTextValue: (v) => {
              const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
              return `${Math.round(v)}° ${dirs[Math.round(v / 45) % 8]}`;
            },
            style: { fontSize: "18px", fill: "#fff", fontWeight: "bold" },
          },
          tickLabels: {
            type: "outer",
            hideMinMax: true,
            ticks: [
              {
                value: 0,
                valueConfig: {
                  formatTextValue: () => "N",
                  style: {
                    fontSize: "12px",
                    fill: "#e74c3c",
                    fontWeight: "bold",
                  },
                },
              },
              {
                value: 90,
                valueConfig: {
                  formatTextValue: () => "E",
                  style: { fontSize: "10px", fill: "#aaa" },
                },
              },
              {
                value: 180,
                valueConfig: {
                  formatTextValue: () => "S",
                  style: { fontSize: "10px", fill: "#aaa" },
                },
              },
              {
                value: 270,
                valueConfig: {
                  formatTextValue: () => "W",
                  style: { fontSize: "10px", fill: "#aaa" },
                },
              },
            ],
            defaultTickLineConfig: { color: "#555", length: 4, width: 1 },
          },
        }}
      />
    ),
  },
  {
    name: "Humidity Meter",
    description: "Moisture level indicator",
    component: (value) => (
      <GaugeComponent
        value={value}
        type="grafana"
        arc={{
          width: 0.25,
          subArcs: [
            { limit: 30, color: "#ffcc80" },
            { limit: 60, color: "#4fc3f7" },
            { color: "#0277bd" },
          ],
        }}
        pointer={{ type: "blob", color: "#4fc3f7", elastic: true, maxFps: 30 }}
        labels={{
          valueLabel: {
            formatTextValue: (v) => `${Math.round(v)}% RH`,
            style: { fontSize: "22px", fill: "#4fc3f7", fontWeight: "bold" },
          },
          tickLabels: {
            type: "outer",
            ticks: [{ value: 0 }, { value: 30 }, { value: 60 }, { value: 100 }],
            defaultTickValueConfig: {
              formatTextValue: (v) => `${v}%`,
              style: { fontSize: "9px", fill: "#aaa" },
            },
          },
        }}
      />
    ),
  },

  // ==================== SPECIAL EFFECTS ====================
  {
    name: "Gradient Arrow",
    description: "Smooth gradient with arrow pointer",
    component: (value) => (
      <GaugeComponent
        value={value}
        type="semicircle"
        arc={{
          gradient: true,
          width: 0.15,
          padding: 0,
          subArcs: [
            { limit: 5, color: "#EA4228" },
            { limit: 20, color: "#F5CD19" },
            { limit: 58, color: "#5BE12C" },
            { limit: 75, color: "#F5CD19" },
            { color: "#EA4228" },
          ],
        }}
        pointer={{ type: "arrow", color: "#dfa810", maxFps: 30 }}
        labels={{
          valueLabel: { style: { fontSize: "24px", fill: "#e0e0e0" } },
          tickLabels: {
            type: "outer",
            ticks: [
              { value: 0 },
              { value: 20 },
              { value: 40 },
              { value: 60 },
              { value: 80 },
            ],
            defaultTickValueConfig: {
              style: { fontSize: "9px", fill: "#aaa" },
            },
          },
        }}
      />
    ),
  },
  {
    name: "Radial Elastic",
    description: "Bouncy needle animation",
    component: (value) => (
      <GaugeComponent
      value={value}
      type="radial"
      arc={{
          colorArray: ["#5BE12C", "#EA4228"],
          subArcs: [
            { limit: 10 },
            { limit: 30 },
            {},
            {},
            {}
          ],
          padding: 0.02,
          width: 0.3
        }}
      pointer={{
          type: "needle",
          color: "#e0e0e0",
          elastic: true,
          animationDelay: 0,
          maxFps: 30
        }}
      labels={{
          valueLabel: {
            style: {
              fontSize: "36px",
              fill: "#e0e0e0",
              fontWeight: "bold"
            }
          },
          tickLabels: {
            type: "inner",
            ticks: [
              { value: 20 },
              { value: 40 },
              { value: 60 },
              { value: 80 },
              { value: 100 }
            ],
            defaultTickValueConfig: { style: { fontSize: "11px", fill: "#bbb" } },
            defaultTickLineConfig: { distanceFromArc: 3, distanceFromText: 12 }
          }
        }}
    />
    ),
  },
  {
    name: "Grafana Smooth",
    description: "Smooth color interpolation",
    component: (value) => (
      <GaugeComponent
        value={value}
        type="grafana"
        arc={{
          colorArray: ["#1EFF00", "#CE1F1F"],
          nbSubArcs: 80,
          padding: 0.02,
          width: 0.3,
        }}
        pointer={{ type: "needle", color: "#e0e0e0", animationDelay: 0, maxFps: 30 }}
        labels={{
          valueLabel: {
            matchColorWithArc: true,
            style: { fontSize: "28px", fontWeight: "bold" },
          },
          tickLabels: { hideMinMax: true },
        }}
      />
    ),
  },
];

/**
 * Color palette presets for SubArcs
 */
export const COLOR_PRESETS: ColorPreset[] = [
  { label: "Traffic", colors: ["#5BE12C", "#F5CD19", "#EA4228"] },
  { label: "Ocean", colors: ["#00bcd4", "#2196f3", "#3f51b5"] },
  { label: "Sunset", colors: ["#ff9800", "#ff5722", "#e91e63"] },
  { label: "Forest", colors: ["#8bc34a", "#4caf50", "#2e7d32"] },
];

/**
 * Size presets for sandbox container
 */
export const SIZE_PRESETS: SizePreset[] = [
  { name: "Mobile", width: "280px", height: "200px", icon: "SM" },
  { name: "Desktop", width: "400px", height: "300px", icon: "MD" },
  { name: "Large", width: "600px", height: "400px", icon: "LG" },
  { name: "Dashboard", width: "250px", height: "180px", icon: "XS" },
];

/**
 * Random value ranges for random config generation
 */
export const RANDOM_RANGES = [
  { minValue: 0, maxValue: 100, format: (v: number) => `${Math.round(v)}%` },
  {
    minValue: 0,
    maxValue: 200,
    format: (v: number) => `${Math.round(v)} km/h`,
  },
  { minValue: -40, maxValue: 60, format: (v: number) => `${Math.round(v)}°C` },
  {
    minValue: 0,
    maxValue: 10000,
    format: (v: number) => `${(v / 1000).toFixed(1)}k`,
  },
  {
    minValue: 0,
    maxValue: 1,
    format: (v: number) => `${(v * 100).toFixed(0)}%`,
  },
];

/**
 * Color themes for random config generation
 */
export const COLOR_THEMES = [
  { name: "fire", colors: ["#ff6b35", "#f7931e", "#ffcc02", "#ff3d00"] },
  { name: "ocean", colors: ["#0077b6", "#0096c7", "#00b4d8", "#48cae4"] },
  { name: "forest", colors: ["#2d5a27", "#4a7c44", "#6b9b37", "#8bc34a"] },
  { name: "neon", colors: ["#ff00ff", "#00ffff", "#ffff00", "#ff0080"] },
  { name: "sunset", colors: ["#ff4757", "#ff6b6b", "#ffa502", "#eccc68"] },
  { name: "arctic", colors: ["#74b9ff", "#81ecec", "#a29bfe", "#dfe6e9"] },
];

/**
 * Linear Gauge presets for showcasing the new linear gauge component
 */
export const LINEAR_GAUGE_PRESETS: LinearGaugePreset[] = [
  {
    name: "Progress Bar",
    description: "Simple horizontal progress indicator",
    component: (value) => (
      <LinearGaugeComponent
        value={value}
        minValue={0}
        maxValue={100}
        orientation="horizontal"
        track={{
          thickness: 16,
          backgroundColor: "#e0e0e0",
          borderRadius: 8,
          segments: [{ color: "#4caf50" }],
        }}
        pointer={{ type: "none" }}
        ticks={{ hideMinMax: true }}
        valueLabel={{
          hide: false,
          formatValue: (v) => `${Math.round(v)}%`,
          matchColorWithSegment: false,
          style: { fontSize: "12px", color: "#333" },
        }}
      />
    ),
  },
  {
    name: "Temperature Scale",
    description: "Vertical thermometer style with color zones",
    component: (value) => (
      <LinearGaugeComponent
        value={value}
        minValue={-20}
        maxValue={50}
        orientation="vertical"
        track={{
          thickness: 24,
          backgroundColor: "#f5f5f5",
          borderRadius: 12,
          segments: [
            { limit: 0, color: "#2196f3" },
            { limit: 20, color: "#4caf50" },
            { limit: 35, color: "#ff9800" },
            { color: "#f44336" },
          ],
        }}
        pointer={{ type: "line", color: "#333", size: 8 }}
        ticks={{
          count: 7,
          position: "left",
          formatLabel: (v) => `${v}°C`,
        }}
        valueLabel={{
          formatValue: (v) => `${v.toFixed(1)}°C`,
          matchColorWithSegment: true,
        }}
      />
    ),
  },
  {
    name: "Battery Indicator",
    description: "Battery level with warning zones",
    component: (value) => (
      <LinearGaugeComponent
        value={value}
        minValue={0}
        maxValue={100}
        orientation="horizontal"
        track={{
          thickness: 30,
          backgroundColor: "#2d2d2d",
          borderRadius: 4,
          segments: [
            { limit: 20, color: "#f44336" },
            { limit: 50, color: "#ff9800" },
            { color: "#4caf50" },
          ],
        }}
        pointer={{ type: "none" }}
        ticks={{ hideMinMax: true }}
        valueLabel={{
          formatValue: (v) => `${Math.round(v)}%`,
          matchColorWithSegment: true,
          style: { fontSize: "16px", fontWeight: "bold" },
        }}
      />
    ),
  },
  {
    name: "Signal Strength",
    description: "WiFi/cellular signal meter",
    component: (value) => (
      <LinearGaugeComponent
        value={value}
        minValue={0}
        maxValue={100}
        orientation="horizontal"
        track={{
          thickness: 12,
          backgroundColor: "#333",
          borderRadius: 6,
          segments: [
            { limit: 25, color: "#f44336" },
            { limit: 50, color: "#ff9800" },
            { limit: 75, color: "#ffeb3b" },
            { color: "#4caf50" },
          ],
        }}
        pointer={{ type: "marker", color: "#fff", size: 10 }}
        ticks={{
          count: 4,
          formatLabel: (v) => (v === 0 ? "Weak" : v === 100 ? "Strong" : ""),
        }}
        valueLabel={{ hide: true }}
      />
    ),
  },
];
