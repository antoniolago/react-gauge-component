/**
 * Tests for parseJsxConfig and stringifyConfig utilities
 * These functions handle copy/paste of gauge configurations
 */

import { parseJsxConfig, stringifyConfig, getInitialValue } from './utils';

describe('parseJsxConfig', () => {
  describe('Basic JSX parsing', () => {
    it('should parse simple value prop', () => {
      const jsx = '<GaugeComponent value={50} />';
      const { config, value } = parseJsxConfig(jsx);
      
      expect(value).toBe(50);
      expect(config).toEqual({});
    });

    it('should parse string type prop', () => {
      const jsx = '<GaugeComponent value={50} type="semicircle" />';
      const { config, value } = parseJsxConfig(jsx);
      
      expect(value).toBe(50);
      expect(config.type).toBe('semicircle');
    });

    it('should parse numeric props', () => {
      const jsx = '<GaugeComponent value={75} minValue={0} maxValue={100} />';
      const { config, value } = parseJsxConfig(jsx);
      
      expect(value).toBe(75);
      expect(config.minValue).toBe(0);
      expect(config.maxValue).toBe(100);
    });

    it('should parse boolean props', () => {
      const jsx = '<GaugeComponent value={50} fadeInAnimation={true} />';
      const { config } = parseJsxConfig(jsx);
      
      expect(config.fadeInAnimation).toBe(true);
    });
  });

  describe('Object parsing', () => {
    it('should parse simple object prop', () => {
      const jsx = '<GaugeComponent value={50} pointer={{ type: "needle", length: 0.8 }} />';
      const { config } = parseJsxConfig(jsx);
      
      expect(config.pointer).toEqual({ type: 'needle', length: 0.8 });
    });

    it('should parse nested object props', () => {
      const jsx = `<GaugeComponent 
        value={50} 
        arc={{ width: 0.2, effects: { glow: true, glowBlur: 2 } }} 
      />`;
      const { config } = parseJsxConfig(jsx);
      
      expect(config.arc).toBeDefined();
      expect(config.arc.width).toBe(0.2);
      expect(config.arc.effects).toEqual({ glow: true, glowBlur: 2 });
    });

    it('should parse labels with nested valueLabel and tickLabels', () => {
      const jsx = `<GaugeComponent 
        value={50} 
        labels={{ 
          valueLabel: { matchColorWithArc: true, style: { fontSize: "24px" } },
          tickLabels: { hideMinMax: false }
        }} 
      />`;
      const { config } = parseJsxConfig(jsx);
      
      expect(config.labels).toBeDefined();
      expect(config.labels.valueLabel.matchColorWithArc).toBe(true);
      expect(config.labels.valueLabel.style.fontSize).toBe('24px');
      expect(config.labels.tickLabels.hideMinMax).toBe(false);
    });
  });

  describe('Array parsing', () => {
    it('should parse simple array of numbers', () => {
      const jsx = '<GaugeComponent value={50} arc={{ colorArray: ["#ff0000", "#00ff00", "#0000ff"] }} />';
      const { config } = parseJsxConfig(jsx);
      
      expect(config.arc.colorArray).toEqual(['#ff0000', '#00ff00', '#0000ff']);
    });

    it('should parse array of objects (subArcs)', () => {
      const jsx = `<GaugeComponent 
        value={50} 
        arc={{ 
          subArcs: [
            { limit: 40, color: "#5BE12C" },
            { limit: 70, color: "#F5CD19" },
            { color: "#EA4228" }
          ] 
        }} 
      />`;
      const { config } = parseJsxConfig(jsx);
      
      expect(config.arc.subArcs).toHaveLength(3);
      expect(config.arc.subArcs[0]).toEqual({ limit: 40, color: '#5BE12C' });
      expect(config.arc.subArcs[1]).toEqual({ limit: 70, color: '#F5CD19' });
      expect(config.arc.subArcs[2]).toEqual({ color: '#EA4228' });
    });

    it('should parse array of tick objects', () => {
      const jsx = `<GaugeComponent 
        value={50} 
        labels={{ 
          tickLabels: { 
            ticks: [{ value: 0 }, { value: 50 }, { value: 100 }] 
          } 
        }} 
      />`;
      const { config } = parseJsxConfig(jsx);
      
      expect(config.labels.tickLabels.ticks).toHaveLength(3);
      expect(config.labels.tickLabels.ticks[0].value).toBe(0);
      expect(config.labels.tickLabels.ticks[1].value).toBe(50);
      expect(config.labels.tickLabels.ticks[2].value).toBe(100);
    });

    it('should parse pointers array (multi-pointer mode)', () => {
      const jsx = `<GaugeComponent 
        value={50} 
        pointers={[
          { value: 25, color: "#ff0000" },
          { value: 50, color: "#00ff00" },
          { value: 75, color: "#0000ff" }
        ]} 
      />`;
      const { config } = parseJsxConfig(jsx);
      
      expect(config.pointers).toHaveLength(3);
      expect(config.pointers[0]).toEqual({ value: 25, color: '#ff0000' });
      expect(config.pointers[1]).toEqual({ value: 50, color: '#00ff00' });
      expect(config.pointers[2]).toEqual({ value: 75, color: '#0000ff' });
    });
  });

  describe('Complex real-world configs', () => {
    it('should parse GRAFANA_NEON style config', () => {
      const jsx = `<GaugeComponent
        value={54}
        type="grafana"
        minValue={0}
        maxValue={108}
        arc={{
          width: 0.55,
          cornerRadius: 0,
          nbSubArcs: 52,
          colorArray: ["#ff00ff", "#00ffff", "#ffff00", "#ff0080"],
          padding: 0,
          subArcsStrokeWidth: 1,
          subArcsStrokeColor: "#000000",
          effects: { glow: true, glowBlur: 1, glowSpread: 2 }
        }}
        pointer={{
          type: "needle",
          elastic: false,
          animationDelay: 200,
          animationDuration: 1000,
          length: 0.87,
          width: 24,
          baseColor: "#ffffff",
          strokeWidth: 2,
          strokeColor: "#000000"
        }}
        labels={{
          valueLabel: {
            matchColorWithArc: true,
            style: { fontSize: "29px", fontWeight: "bold" },
            offsetY: 25,
            animateValue: true
          },
          tickLabels: {
            type: "outer",
            hideMinMax: false,
            autoSpaceTickLabels: true,
            ticks: [
              { value: 0 },
              { value: 4 },
              { value: 8 },
              { value: 15 },
              { value: 16 },
              { value: 23 },
              { value: 42 },
              { value: 108 }
            ]
          }
        }}
      />`;
      
      const { config, value } = parseJsxConfig(jsx);
      
      expect(value).toBe(54);
      expect(config.type).toBe('grafana');
      expect(config.minValue).toBe(0);
      expect(config.maxValue).toBe(108);
      expect(config.arc.width).toBe(0.55);
      expect(config.arc.colorArray).toHaveLength(4);
      expect(config.arc.effects.glow).toBe(true);
      expect(config.pointer.type).toBe('needle');
      expect(config.pointer.length).toBe(0.87);
      expect(config.labels.valueLabel.matchColorWithArc).toBe(true);
      expect(config.labels.tickLabels.ticks).toHaveLength(8);
    });

    it('should parse semicircle with gradient config', () => {
      const jsx = `<GaugeComponent
        value={65}
        type="semicircle"
        arc={{
          gradient: true,
          subArcs: [
            { length: 0.25, color: "#5BE12C" },
            { length: 0.25, color: "#F5CD19" },
            { length: 0.25, color: "#F58B19" },
            { length: 0.25, color: "#EA4228" }
          ]
        }}
        pointer={{ hide: true }}
      />`;
      
      const { config, value } = parseJsxConfig(jsx);
      
      expect(value).toBe(65);
      expect(config.type).toBe('semicircle');
      expect(config.arc.gradient).toBe(true);
      expect(config.arc.subArcs).toHaveLength(4);
      expect(config.pointer.hide).toBe(true);
    });
  });

  describe('Edge cases', () => {
    it('should handle multiline JSX with varied whitespace', () => {
      const jsx = `<GaugeComponent
        value={50}
        type="radial"
        
        arc={  { width: 0.3 }  }
      />`;
      
      const { config, value } = parseJsxConfig(jsx);
      
      expect(value).toBe(50);
      expect(config.type).toBe('radial');
      expect(config.arc.width).toBe(0.3);
    });

    it('should handle JSX without closing slash', () => {
      const jsx = '<GaugeComponent value={50} type="semicircle">';
      const { config, value } = parseJsxConfig(jsx);
      
      expect(value).toBe(50);
      expect(config.type).toBe('semicircle');
    });

    it('should handle <Gauge shorthand', () => {
      const jsx = '<Gauge value={75} type="grafana" />';
      const { config, value } = parseJsxConfig(jsx);
      
      expect(value).toBe(75);
      expect(config.type).toBe('grafana');
    });

    it('should handle escaped quotes in strings', () => {
      const jsx = '<GaugeComponent value={50} className="gauge-\\"custom\\"" />';
      const { config } = parseJsxConfig(jsx);
      
      expect(config.className).toBe('gauge-"custom"');
    });

    it('should handle decimal numbers', () => {
      const jsx = '<GaugeComponent value={33.5} arc={{ width: 0.15 }} />';
      const { config, value } = parseJsxConfig(jsx);
      
      expect(value).toBe(33.5);
      expect(config.arc.width).toBe(0.15);
    });

    it('should handle negative numbers', () => {
      const jsx = '<GaugeComponent value={-10} minValue={-50} />';
      const { config, value } = parseJsxConfig(jsx);
      
      expect(value).toBe(-10);
      expect(config.minValue).toBe(-50);
    });

    it('should handle null values', () => {
      const jsx = '<GaugeComponent value={50} pointer={{ color: null }} />';
      const { config } = parseJsxConfig(jsx);
      
      expect(config.pointer.color).toBeNull();
    });

    it('should handle empty arrays', () => {
      const jsx = '<GaugeComponent value={50} arc={{ subArcs: [] }} />';
      const { config } = parseJsxConfig(jsx);
      
      expect(config.arc.subArcs).toEqual([]);
    });

    it('should handle empty objects', () => {
      const jsx = '<GaugeComponent value={50} arc={{}} />';
      const { config } = parseJsxConfig(jsx);
      
      expect(config.arc).toEqual({});
    });
  });

  describe('JSON fallback', () => {
    it('should parse plain JSON config', () => {
      const json = '{"value": 50, "type": "semicircle", "minValue": 0}';
      const { config, value } = parseJsxConfig(json);
      
      expect(value).toBe(50);
      expect(config.type).toBe('semicircle');
      expect(config.minValue).toBe(0);
    });

    it('should throw error for invalid format', () => {
      const invalid = 'not valid jsx or json';
      
      expect(() => parseJsxConfig(invalid)).toThrow();
    });
  });
});

describe('stringifyConfig', () => {
  it('should generate valid JSX for simple config', () => {
    const config = { type: 'semicircle', minValue: 0, maxValue: 100 };
    const value = 50;
    
    const jsx = stringifyConfig(config, value);
    
    expect(jsx).toContain('<GaugeComponent');
    expect(jsx).toContain('value={50}');
    expect(jsx).toContain('type="semicircle"');
    expect(jsx).toContain('minValue={0}');
    expect(jsx).toContain('maxValue={100}');
    expect(jsx).toContain('/>');
  });

  it('should handle nested objects', () => {
    const config = {
      arc: { width: 0.2, effects: { glow: true } }
    };
    const value = 50;
    
    const jsx = stringifyConfig(config, value);
    
    expect(jsx).toContain('arc={');
    expect(jsx).toContain('width: 0.2');
    expect(jsx).toContain('effects:');
    expect(jsx).toContain('glow: true');
  });

  it('should handle arrays', () => {
    const config = {
      arc: { colorArray: ['#ff0000', '#00ff00'] }
    };
    const value = 50;
    
    const jsx = stringifyConfig(config, value);
    
    expect(jsx).toContain('colorArray:');
    expect(jsx).toContain('"#ff0000"');
    expect(jsx).toContain('"#00ff00"');
  });
});

describe('Round-trip: stringify -> parse', () => {
  it('should preserve simple config through round-trip', () => {
    const originalConfig = { 
      type: 'semicircle', 
      minValue: 0, 
      maxValue: 100 
    };
    const originalValue = 50;
    
    const jsx = stringifyConfig(originalConfig, originalValue);
    const { config: parsedConfig, value: parsedValue } = parseJsxConfig(jsx);
    
    expect(parsedValue).toBe(originalValue);
    expect(parsedConfig.type).toBe(originalConfig.type);
    expect(parsedConfig.minValue).toBe(originalConfig.minValue);
    expect(parsedConfig.maxValue).toBe(originalConfig.maxValue);
  });

  it('should preserve complex config through round-trip', () => {
    const originalConfig = {
      type: 'grafana',
      minValue: 0,
      maxValue: 100,
      arc: {
        width: 0.55,
        colorArray: ['#ff00ff', '#00ffff'],
        effects: { glow: true, glowBlur: 2 }
      },
      pointer: {
        type: 'needle',
        length: 0.8,
        width: 20
      },
      labels: {
        valueLabel: { matchColorWithArc: true },
        tickLabels: { hideMinMax: false }
      }
    };
    const originalValue = 75;
    
    const jsx = stringifyConfig(originalConfig, originalValue);
    const { config: parsedConfig, value: parsedValue } = parseJsxConfig(jsx);
    
    expect(parsedValue).toBe(originalValue);
    expect(parsedConfig.type).toBe('grafana');
    expect(parsedConfig.arc.width).toBe(0.55);
    expect(parsedConfig.arc.colorArray).toEqual(['#ff00ff', '#00ffff']);
    expect(parsedConfig.arc.effects.glow).toBe(true);
    expect(parsedConfig.pointer.type).toBe('needle');
    expect(parsedConfig.labels.valueLabel.matchColorWithArc).toBe(true);
  });

  it('should preserve subArcs array through round-trip', () => {
    const originalConfig = {
      arc: {
        subArcs: [
          { limit: 40, color: '#5BE12C', showTick: true },
          { limit: 70, color: '#F5CD19' },
          { color: '#EA4228' }
        ]
      }
    };
    const originalValue = 50;
    
    const jsx = stringifyConfig(originalConfig, originalValue);
    const { config: parsedConfig } = parseJsxConfig(jsx);
    
    expect(parsedConfig.arc.subArcs).toHaveLength(3);
    expect(parsedConfig.arc.subArcs[0].limit).toBe(40);
    expect(parsedConfig.arc.subArcs[0].color).toBe('#5BE12C');
    expect(parsedConfig.arc.subArcs[0].showTick).toBe(true);
  });

  it('should preserve ticks array through round-trip', () => {
    const originalConfig = {
      labels: {
        tickLabels: {
          ticks: [
            { value: 0 },
            { value: 25 },
            { value: 50 },
            { value: 75 },
            { value: 100 }
          ]
        }
      }
    };
    const originalValue = 50;
    
    const jsx = stringifyConfig(originalConfig, originalValue);
    const { config: parsedConfig } = parseJsxConfig(jsx);
    
    expect(parsedConfig.labels.tickLabels.ticks).toHaveLength(5);
    expect(parsedConfig.labels.tickLabels.ticks.map((t: any) => t.value)).toEqual([0, 25, 50, 75, 100]);
  });

  it('should preserve multi-pointer config through round-trip', () => {
    const originalConfig = {
      pointers: [
        { value: 25, color: '#ff0000', type: 'needle' },
        { value: 50, color: '#00ff00', type: 'blob' },
        { value: 75, color: '#0000ff', type: 'arrow' }
      ]
    };
    const originalValue = 50;
    
    const jsx = stringifyConfig(originalConfig, originalValue);
    const { config: parsedConfig } = parseJsxConfig(jsx);
    
    expect(parsedConfig.pointers).toHaveLength(3);
    expect(parsedConfig.pointers[0].value).toBe(25);
    expect(parsedConfig.pointers[0].color).toBe('#ff0000');
    expect(parsedConfig.pointers[1].type).toBe('blob');
  });
});

describe('getInitialValue', () => {
  it('should return midpoint for default range', () => {
    const config = { minValue: 0, maxValue: 100 };
    expect(getInitialValue(config)).toBe(50);
  });

  it('should return midpoint for custom range', () => {
    const config = { minValue: -50, maxValue: 50 };
    expect(getInitialValue(config)).toBe(0);
  });

  it('should handle missing values with defaults', () => {
    expect(getInitialValue({})).toBe(50);
    expect(getInitialValue(null)).toBe(50);
    expect(getInitialValue(undefined)).toBe(50);
  });

  it('should handle partial config', () => {
    expect(getInitialValue({ minValue: 20 })).toBe(60); // 20 + (100-20)/2 = 60
    expect(getInitialValue({ maxValue: 200 })).toBe(100); // 0 + (200-0)/2 = 100
  });
});
