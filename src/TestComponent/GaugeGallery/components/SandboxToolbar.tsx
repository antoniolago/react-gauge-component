import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import GaugeComponent from '../../../lib';
import { styles } from '../styles';
import { COLOR_PRESETS } from '../presets';
import { GaugeComponentProps } from '../../../lib/GaugeComponent/types/GaugeComponentProps';
import { 
  Palette, Layers, Target, Tag, Ruler, Move, Sliders,
  Circle, Triangle, ArrowRight, EyeOff, GripHorizontal, Paintbrush,
  Eye, Rainbow, Plus, Minus, AlignLeft, AlignCenter, AlignRight,
  Gauge, Play, Pause, Shuffle, Hand, Hash, ArrowUpRight, ArrowDownLeft,
  ToggleLeft, ToggleRight, ClipboardPaste, Copy, Code
} from 'lucide-react';

// Mini gauge configs for type selector buttons
const TYPE_GAUGE_CONFIGS: Record<string, Partial<GaugeComponentProps>> = {
  semicircle: {
    type: 'semicircle',
    arc: { width: 0.2, subArcs: [{ limit: 40, color: '#5BE12C' }, { limit: 70, color: '#F5CD19' }, { color: '#EA4228' }] },
    pointer: { type: 'needle', color: '#fff', length: 0.7, width: 8 },
    labels: { valueLabel: { hide: true }, tickLabels: { hideMinMax: true } },
  },
  radial: {
    type: 'radial',
    arc: { width: 0.2, subArcs: [{ limit: 40, color: '#5BE12C' }, { limit: 70, color: '#F5CD19' }, { color: '#EA4228' }] },
    pointer: { type: 'needle', color: '#fff', length: 0.7, width: 8 },
    labels: { valueLabel: { hide: true }, tickLabels: { hideMinMax: true } },
  },
  grafana: {
    type: 'grafana',
    arc: { width: 0.25, subArcs: [{ limit: 40, color: '#5BE12C' }, { limit: 70, color: '#F5CD19' }, { color: '#EA4228' }] },
    pointer: { type: 'needle', color: '#fff', length: 0.7, width: 8 },
    labels: { valueLabel: { hide: true }, tickLabels: { hideMinMax: true } },
  },
};

interface SandboxToolbarProps {
  config: Partial<GaugeComponentProps>;
  value: number;
  autoAnimate: boolean;
  sandboxWidth: string;
  sandboxHeight: string;
  gaugeAlign: 'left' | 'center' | 'right';
  interactionEnabled: boolean;
  onConfigChange: (config: Partial<GaugeComponentProps>) => void;
  onValueChange: (value: number) => void;
  onAutoAnimateChange: (autoAnimate: boolean) => void;
  onInteractionChange: (enabled: boolean) => void;
  onSizeChange: (width: string, height: string) => void;
  onAlignChange: (align: 'left' | 'center' | 'right') => void;
  onRandomize: () => void;
}

export const SandboxToolbar: React.FC<SandboxToolbarProps> = ({
  config,
  value,
  autoAnimate,
  sandboxWidth,
  sandboxHeight,
  gaugeAlign,
  onConfigChange,
  onValueChange,
  onAutoAnimateChange,
  onSizeChange,
  onAlignChange,
  onRandomize,
  interactionEnabled,
  onInteractionChange,
}) => {
  const cfg = config as any;

  return (
    <Container fluid style={styles.editorToolbar} className="p-0">
      <Row className="g-0">
        {/* Type - md-4, spans 2 rows visually with real gauge components */}
        <Col xs={8} md={3}>
          <div style={{ ...styles.toolbarGroup, height: '100%', minHeight: '140px' }}>
          <Row className="g-3"> 
            <Col md={12}>
            <span style={styles.groupLabel}><Palette size={14} /> Type</span>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {(['semicircle', 'radial', 'grafana'] as const).map((gaugeType) => (
                <button 
                  key={gaugeType}
                  onClick={() => onConfigChange({ ...config, type: gaugeType })} 
                  style={{ 
                    background: cfg?.type === gaugeType ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    border: cfg?.type === gaugeType ? '2px solid #3b82f6' : '2px solid transparent',
                    borderRadius: '8px',
                    padding: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    transition: 'all 0.15s ease',
                  }} 
                  title={gaugeType.charAt(0).toUpperCase() + gaugeType.slice(1)} 
                  type="button"
                >
                  <div style={{ width: '70px', height: '50px', pointerEvents: 'none' }}>
                    <GaugeComponent 
                      {...TYPE_GAUGE_CONFIGS[gaugeType]} 
                      value={50} 
                    />
                  </div>
                  <span style={{ 
                    fontSize: '0.65rem', 
                    fontWeight: cfg?.type === gaugeType ? 600 : 400,
                    color: cfg?.type === gaugeType ? '#60a5fa' : 'rgba(255,255,255,0.6)',
                    marginTop: '2px',
                  }}>
                    {gaugeType.charAt(0).toUpperCase() + gaugeType.slice(1)}
                  </span>
                </button>
              ))}
            </div>
            </Col>
            <Col md={12}>
            <span style={styles.groupLabel}><Palette size={14} /> Actions</span>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button 
                onClick={onRandomize} 
                style={{ ...styles.toolBtn, padding: '4px 8px' }} 
                title="Randomize gauge - generate random configuration" 
                type="button"
              >
                <Shuffle size={14} />
                <span>Random</span>
              </button>
              <button 
                onClick={() => {
                  navigator.clipboard.readText().then(text => {
                    try {
                      let parsed: any = {};
                      
                      // Check if it's JSX/hybrid format
                      if (text.includes('<GaugeComponent') || text.includes('<Gauge')) {
                        // Parse JSX props - match both prop={value} and prop="value"
                        // This regex handles nested braces for objects/arrays
                        const extractValue = (str: string, start: number): { value: string, end: number } => {
                          if (str[start] === '"' || str[start] === "'") {
                            const quote = str[start];
                            let end = start + 1;
                            while (end < str.length && str[end] !== quote) {
                              if (str[end] === '\\') end++;
                              end++;
                            }
                            return { value: str.slice(start + 1, end), end: end + 1 };
                          }
                          if (str[start] === '{') {
                            let depth = 1;
                            let end = start + 1;
                            while (end < str.length && depth > 0) {
                              if (str[end] === '{') depth++;
                              if (str[end] === '}') depth--;
                              if (str[end] === '"' || str[end] === "'") {
                                const quote = str[end];
                                end++;
                                while (end < str.length && str[end] !== quote) {
                                  if (str[end] === '\\') end++;
                                  end++;
                                }
                              }
                              end++;
                            }
                            return { value: str.slice(start + 1, end - 1), end };
                          }
                          return { value: '', end: start };
                        };
                        
                        // Find all prop assignments
                        const propPattern = /(\w+)=(?={|"|')/g;
                        let match;
                        while ((match = propPattern.exec(text)) !== null) {
                          const propName = match[1];
                          const startIdx = match.index + match[0].length; // Position of { or " or '
                          const { value: rawValue } = extractValue(text, startIdx);
                          
                          let propValue: any = rawValue;
                          
                          // Try to parse the value
                          if (text[startIdx] === '"' || text[startIdx] === "'") {
                            propValue = rawValue; // String value
                          } else {
                            // If value contains functions, use eval directly (don't try JSON)
                            const hasFunction = rawValue.includes('=>') || rawValue.includes('function');
                            
                            if (hasFunction) {
                              // Use eval for objects with functions
                              try {
                                propValue = eval(`(${rawValue})`);
                              } catch (e) {
                                console.warn('Could not eval:', rawValue, e);
                                propValue = rawValue; // Keep as string if eval fails
                              }
                            } else {
                              // Try JSON parse for simple objects
                              try {
                                let jsonStr = rawValue
                                  .replace(/(\w+)\s*:/g, '"$1":')
                                  .replace(/'/g, '"')
                                  .replace(/,(\s*[}\]])/g, '$1');
                                propValue = JSON.parse(jsonStr);
                              } catch {
                                // Try eval for numbers, booleans, simple objects
                                try {
                                  propValue = eval(`(${rawValue})`);
                                } catch {
                                  propValue = rawValue;
                                }
                              }
                            }
                          }
                          parsed[propName] = propValue;
                        }
                      } else {
                        // Try pure JSON
                        parsed = JSON.parse(text);
                      }
                      
                      // Apply parsed config
                      if (parsed.value !== undefined) {
                        onValueChange(Number(parsed.value));
                        delete parsed.value;
                      }
                      if (Object.keys(parsed).length > 0) {
                        onConfigChange(parsed);
                      }
                    } catch (e) {
                      console.error('Parse error:', e);
                      alert('Could not parse clipboard. Use <GaugeComponent .../> JSX format.');
                    }
                  }).catch(() => {
                    alert('Could not read clipboard. Please allow clipboard access.');
                  });
                }} 
                style={{ ...styles.toolBtn, padding: '4px 8px' }} 
                title="Paste gauge code from clipboard" 
                type="button"
              >
                <ClipboardPaste size={14} />
                <span>Paste</span>
              </button>
              <button 
                onClick={() => {
                  // Generate proper JSX
                  // Check if a string looks like JS code (object, array, function, number)
                  const looksLikeCode = (s: string): boolean => {
                    const trimmed = s.trim();
                    return trimmed.startsWith('{') || trimmed.startsWith('[') || 
                           trimmed.includes('=>') || trimmed.startsWith('function') ||
                           /^-?\d+\.?\d*$/.test(trimmed) || trimmed === 'true' || trimmed === 'false';
                  };
                  
                  const formatVal = (v: any, ind: string = ''): string => {
                    if (v === null || v === undefined) return String(v);
                    if (typeof v === 'function') return v.toString();
                    if (typeof v === 'string') {
                      // If string looks like code (object, array, function), don't quote it
                      if (looksLikeCode(v)) return v;
                      return `"${v.replace(/"/g, '\\"')}"`;
                    }
                    if (typeof v === 'number' || typeof v === 'boolean') return String(v);
                    if (Array.isArray(v)) {
                      if (v.length === 0) return '[]';
                      const items = v.map(x => formatVal(x, ind + '  '));
                      if (items.join(', ').length < 60) return `[${items.join(', ')}]`;
                      return `[\n${ind}    ${items.join(`,\n${ind}    `)}\n${ind}  ]`;
                    }
                    if (typeof v === 'object') {
                      const entries = Object.entries(v).filter(([_, x]) => x !== undefined);
                      if (entries.length === 0) return '{}';
                      const formatted = entries.map(([k, x]) => `${k}: ${formatVal(x, ind + '  ')}`);
                      if (formatted.join(', ').length < 50) return `{ ${formatted.join(', ')} }`;
                      return `{\n${ind}    ${formatted.join(`,\n${ind}    `)}\n${ind}  }`;
                    }
                    return String(v);
                  };
                  
                  const props: string[] = [`  value={${value}}`];
                  Object.entries(config).forEach(([k, v]) => {
                    if (v === undefined) return;
                    // For strings that look like code, use {} not ""
                    const isCodeString = typeof v === 'string' && looksLikeCode(v);
                    const isSimpleString = typeof v === 'string' && !isCodeString;
                    props.push(isSimpleString ? `  ${k}="${v}"` : `  ${k}={${formatVal(v, '  ')}}`);
                  });
                  
                  const jsx = `<GaugeComponent\n${props.join('\n')}\n/>`;
                  navigator.clipboard.writeText(jsx);
                  
                  // Visual feedback
                  const btn = document.activeElement as HTMLButtonElement;
                  if (btn?.querySelector('span')) {
                    btn.querySelector('span')!.textContent = 'Copied!';
                    setTimeout(() => {
                      if (btn?.querySelector('span')) btn.querySelector('span')!.textContent = 'Copy';
                    }, 1000);
                  }
                }} 
                style={{ ...styles.toolBtn, padding: '4px 8px' }} 
                title="Copy as JSX code" 
                type="button"
              >
                <Code size={14} />
                <span>Copy</span>
              </button>
              </div>
            </Col>
          </Row>
          </div>
        </Col>
        <Col xs={12} md={3}>
          <div style={{ ...styles.toolbarGroup, height: '100%' }}>
            <Row>
              <Col md={12}>
                <span style={styles.groupLabel}><Layers size={14} /> Arc & Colors</span>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                  {/* Color presets group */}
                  Color presets: 
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flexShrink: 0 }}>
                    {COLOR_PRESETS.map((preset) => (
                      <button 
                        key={preset.label} 
                        onClick={() => {
                          const nbArcs = cfg?.arc?.nbSubArcs || 3;
                          onConfigChange({ ...config, arc: { ...cfg?.arc, colorArray: preset.colors, nbSubArcs: nbArcs, subArcs: [] } });
                        }} 
                        style={styles.toolBtn} 
                        title={preset.label} 
                        type="button"
                      >
                        <span style={{ display: 'flex', gap: '1px' }}>
                          {preset.colors.map((c, i) => (
                            <span key={i} style={{ width: '8px', height: '8px', borderRadius: '1px', background: c }} />
                          ))}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </Col>
              <Col md={12}>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                  Number of arcs: 
                  {/* Count buttons group */}
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flexShrink: 0 }}>
                    {[3, 10, 50, 100].map((n) => (
                      <button 
                        key={n} 
                        onClick={() => {
                          const colors = cfg?.arc?.colorArray || ['#5BE12C', '#F5CD19', '#EA4228'];
                          onConfigChange({ ...config, arc: { ...cfg?.arc, nbSubArcs: n, colorArray: colors, subArcs: [] } });
                        }} 
                        style={{ ...styles.toolBtn, ...(cfg?.arc?.nbSubArcs === n ? styles.toolBtnActive : {}) }} 
                        type="button"
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              </Col>
              <Col md={12}>
                Colors: 
                {/* Gradient + color pickers group */}
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flexShrink: 0, flexWrap: 'wrap' }}>
                  <label style={styles.inlineLabel}>
                    <input 
                      type="checkbox" 
                      checked={cfg?.arc?.gradient || false} 
                      onChange={(e) => onConfigChange({ ...config, arc: { ...cfg?.arc, gradient: e.target.checked } })} 
                      style={styles.inlineCheckbox} 
                    />
                    Grad
                  </label>
                  {(cfg?.arc?.colorArray || ['#5BE12C', '#F5CD19', '#EA4228']).map((color: string, i: number) => {
                    const colors = cfg?.arc?.colorArray || ['#5BE12C', '#F5CD19', '#EA4228'];
                    return (
                      <div key={i} style={{ position: 'relative', display: 'inline-block' }}>
                        <input 
                          type="color" 
                          value={color || '#ffffff'} 
                          onChange={(e) => {
                            const newColors = [...colors];
                            newColors[i] = e.target.value;
                            onConfigChange({ ...config, arc: { ...cfg?.arc, colorArray: newColors, nbSubArcs: newColors.length, subArcs: [] } });
                          }}
                          style={styles.colorPicker}
                          title={`Color ${i + 1}`}
                        />
                        {colors.length > 2 && (
                          <button
                            onClick={() => {
                              const newColors = colors.filter((_: string, idx: number) => idx !== i);
                              onConfigChange({ ...config, arc: { ...cfg?.arc, colorArray: newColors, nbSubArcs: newColors.length, subArcs: [] } });
                            }}
                            style={{
                              position: 'absolute',
                              top: '-4px',
                              right: '-4px',
                              width: '14px',
                              height: '14px',
                              borderRadius: '50%',
                              border: 'none',
                              background: 'rgba(255, 80, 80, 0.9)',
                              color: '#fff',
                              fontSize: '10px',
                              lineHeight: '12px',
                              cursor: 'pointer',
                              padding: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                            title="Remove color"
                            type="button"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    );
                  })}
                  <button
                    onClick={() => {
                      const colors = cfg?.arc?.colorArray || ['#5BE12C', '#F5CD19', '#EA4228'];
                      const newColors = [...colors, '#888888'];
                      onConfigChange({ ...config, arc: { ...cfg?.arc, colorArray: newColors, nbSubArcs: newColors.length, subArcs: [] } });
                    }}
                    style={{
                      ...styles.toolBtn,
                      width: '24px',
                      height: '24px',
                      padding: 0,
                      fontSize: '16px',
                      lineHeight: '22px',
                    }}
                    title="Add color"
                    type="button"
                  >
                    +
                  </button>
                </div>
              </Col>
              <Col md={12}>
                  {/* Arc width, corner radius and padding sliders - each on own line */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
                    <span style={{ ...styles.sliderLabel, minWidth: '50px' }}>Width</span>
                    <input 
                      type="range" 
                      min="0.01" 
                      max="1" 
                      step="0.01" 
                      value={cfg?.arc?.width ?? 0.2} 
                      onChange={(e) => onConfigChange({ ...config, arc: { ...cfg?.arc, width: Number(e.target.value) } })} 
                      style={{ ...styles.slider, flex: 1 }} 
                      title="Arc width - thickness of the gauge arc (can exceed normal limits)"
                    />
                  </div>
                </div>
              </Col>
              <Col md={12}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
                  <span style={{ ...styles.sliderLabel, minWidth: '50px' }}>Corner</span>
                  <input 
                    type="range" 
                    min="0" 
                    max="50" 
                    step="1" 
                    value={cfg?.arc?.cornerRadius ?? 7} 
                    onChange={(e) => onConfigChange({ ...config, arc: { ...cfg?.arc, cornerRadius: Number(e.target.value) } })} 
                    style={{ ...styles.slider, flex: 1 }} 
                    title="Corner radius - roundness of arc segment edges"
                  />
                </div>
              </Col>
              <Col md={12}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
                  <span style={{ ...styles.sliderLabel, minWidth: '50px' }}>Pad</span>
                  <input 
                    type="range" 
                    min="0" 
                    max="0.5" 
                    step="0.005" 
                    value={cfg?.arc?.padding ?? 0.05} 
                    onChange={(e) => onConfigChange({ ...config, arc: { ...cfg?.arc, padding: Number(e.target.value) } })} 
                    style={{ ...styles.slider, flex: 1 }} 
                    title="Padding between subarcs"
                  />
                </div>
              </Col>
            </Row>
          </div>
        </Col>

        <Col xs={6} md={4}>
          <div style={{ ...styles.toolbarGroup, height: '100%' }}>
            <span style={styles.groupLabel}><Target size={14} /> Pointer</span>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Type buttons */}
              <div style={{ display: 'flex', gap: '3px', alignItems: 'center', flexShrink: 0 }}>
                <span>Pointer type:</span>
                <button 
                  onClick={() => onConfigChange({ ...config, pointer: { ...cfg?.pointer, type: 'needle', hide: false } })} 
                  style={{ ...styles.toolBtn, padding: '6px 10px', ...(cfg?.pointer?.type === 'needle' && !cfg?.pointer?.hide ? styles.toolBtnActive : {}) }} 
                  title="Needle pointer - classic gauge needle style"
                  type="button"
                >
                  <Triangle size={14} style={{ transform: 'rotate(180deg)' }} />
                  <span>Needle</span>
                </button>
                <button 
                  onClick={() => onConfigChange({ ...config, pointer: { ...cfg?.pointer, type: 'blob', hide: false } })} 
                  style={{ ...styles.toolBtn, padding: '6px 10px', ...(cfg?.pointer?.type === 'blob' && !cfg?.pointer?.hide ? styles.toolBtnActive : {}) }} 
                  title="Blob pointer - circular indicator on arc"
                  type="button"
                >
                  <Circle size={14} />
                  <span>Blob</span>
                </button>
                <button 
                  onClick={() => onConfigChange({ ...config, pointer: { ...cfg?.pointer, type: 'arrow', hide: false } })} 
                  style={{ ...styles.toolBtn, padding: '6px 10px', ...(cfg?.pointer?.type === 'arrow' && !cfg?.pointer?.hide ? styles.toolBtnActive : {}) }} 
                  title="Arrow pointer - directional arrow indicator"
                  type="button"
                >
                  <ArrowRight size={14} />
                  <span>Arrow</span>
                </button>
                <button 
                  onClick={() => onConfigChange({ ...config, pointer: { ...cfg?.pointer, hide: true } })} 
                  style={{ ...styles.toolBtn, padding: '6px 10px', ...(cfg?.pointer?.hide ? styles.toolBtnActive : {}) }} 
                  title="Hidden pointer - no pointer visible"
                  type="button"
                >
                  <EyeOff size={14} />
                  <span>Hide</span>
                </button>
              </div>
              {/* Options */}
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flexShrink: 0 }}>
                <span>Movement:</span>
                <button 
                  onClick={() => onInteractionChange(!interactionEnabled)} 
                  style={{ ...styles.toolBtn, padding: '6px 10px', ...(interactionEnabled ? styles.toolBtnActive : {}) }} 
                  title={interactionEnabled ? 'Drag interaction enabled - click to disable' : 'Drag interaction disabled - click to enable grabbing pointer'}
                  type="button"
                >
                  <Hand size={14} />
                  <span>Drag</span>
                </button>
                <button 
                  onClick={() => onConfigChange({ ...config, pointer: { ...cfg?.pointer, elastic: !cfg?.pointer?.elastic } })} 
                  style={{ ...styles.toolBtn, padding: '6px 10px', ...(cfg?.pointer?.elastic ? styles.toolBtnActive : {}) }} 
                  title="Elastic bounce animation - pointer bounces when reaching target value"
                  type="button"
                >
                  <Move size={14} />
                  <span>Elastic</span>
                </button>
                <button 
                  onClick={() => onConfigChange({ ...config, pointer: { ...cfg?.pointer, animationDelay: cfg?.pointer?.animationDelay === 0 ? 200 : 0 } })} 
                  style={{ ...styles.toolBtn, padding: '6px 10px', ...(cfg?.pointer?.animationDelay === 0 ? styles.toolBtnActive : {}) }} 
                  title="Instant animation - no delay before pointer starts moving"
                  type="button"
                >
                  <Play size={14} />
                  <span>Instant</span>
                </button>
              </div>
              {/* Color controls */}
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flexShrink: 0 }}>
                <span>Colors:</span>
                <button 
                  onClick={() => onConfigChange({ ...config, pointer: { ...cfg?.pointer, color: cfg?.pointer?.color ? undefined : '#464A4F' } })} 
                  style={{ ...styles.toolBtn, padding: '6px 10px', ...(!cfg?.pointer?.color ? styles.toolBtnActive : {}) }} 
                  title="Match pointer color with arc - pointer follows current value color"
                  type="button"
                >
                  <Rainbow size={14} />
                  <span>Arc</span>
                </button>
                {cfg?.pointer?.color && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={styles.sliderLabel}>Color</span>
                    <input 
                      type="color" 
                      value={cfg?.pointer?.color || '#464A4F'} 
                      onChange={(e) => onConfigChange({ ...config, pointer: { ...cfg?.pointer, color: e.target.value } })} 
                      style={styles.colorPicker} 
                      title="Pointer color" 
                    />
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={styles.sliderLabel}>Base</span>
                  <input 
                    type="color" 
                    value={cfg?.pointer?.baseColor || '#ffffff'} 
                    onChange={(e) => onConfigChange({ ...config, pointer: { ...cfg?.pointer, baseColor: e.target.value } })} 
                    style={styles.colorPicker} 
                    title="Pointer base/center color" 
                  />
                </div>
              </div>
              {/* Stroke/border controls */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginTop: '6px' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flex: 1 }}>
                  <span style={{ ...styles.sliderLabel, minWidth: '50px' }}>Border</span>
                  <input 
                    type="range" min="0" max="5" step="0.5" 
                    value={cfg?.pointer?.strokeWidth ?? 0} 
                    onChange={(e) => onConfigChange({ ...config, pointer: { ...cfg?.pointer, strokeWidth: Number(e.target.value) } })} 
                    style={{ ...styles.slider, flex: 1 }} 
                    title="Pointer border/stroke width" 
                  />
                </div>
                {(cfg?.pointer?.strokeWidth ?? 0) > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={styles.sliderLabel}>Stroke</span>
                    <input 
                      type="color" 
                      value={cfg?.pointer?.strokeColor || '#ffffff'} 
                      onChange={(e) => onConfigChange({ ...config, pointer: { ...cfg?.pointer, strokeColor: e.target.value } })} 
                      style={styles.colorPicker} 
                      title="Pointer stroke/border color" 
                    />
                  </div>
                )}
              </div>
              {/* Length and width sliders - each on own line */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
                  <span style={{ ...styles.sliderLabel, minWidth: '50px' }}>Length</span>
                  <input 
                    type="range" min="0.1" max="2" step="0.05" 
                    value={cfg?.pointer?.length ?? 0.8} 
                    onChange={(e) => onConfigChange({ ...config, pointer: { ...cfg?.pointer, length: Number(e.target.value) } })} 
                    style={{ ...styles.slider, flex: 1 }} 
                    title="Pointer length" 
                  />
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
                  <span style={{ ...styles.sliderLabel, minWidth: '50px' }}>Width</span>
                  <input 
                    type="range" min="1" max="60" step="1" 
                    value={cfg?.pointer?.width ?? 15} 
                    onChange={(e) => onConfigChange({ ...config, pointer: { ...cfg?.pointer, width: Number(e.target.value) } })} 
                    style={{ ...styles.slider, flex: 1 }} 
                    title="Pointer width" 
                  />
                </div>
                {/* Arrow offset slider - only show for arrow type */}
                {cfg?.pointer?.type === 'arrow' && (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
                    <span style={{ ...styles.sliderLabel, minWidth: '50px' }}>Offset</span>
                    <input 
                      type="range" min="0" max="1.5" step="0.02" 
                      value={cfg?.pointer?.arrowOffset ?? 0.72} 
                      onChange={(e) => onConfigChange({ ...config, pointer: { ...cfg?.pointer, arrowOffset: Number(e.target.value) } })} 
                      style={{ ...styles.slider, flex: 1 }} 
                      title="Arrow offset - radial position (lower = closer to center, higher = beyond arc)" 
                    />
                  </div>
                )}
                {/* Blob offset slider - only show for blob type */}
                {cfg?.pointer?.type === 'blob' && (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
                    <span style={{ ...styles.sliderLabel, minWidth: '50px' }}>Offset</span>
                    <input 
                      type="range" min="-0.5" max="1.5" step="0.02" 
                      value={cfg?.pointer?.blobOffset ?? 0.5} 
                      onChange={(e) => onConfigChange({ ...config, pointer: { ...cfg?.pointer, blobOffset: Number(e.target.value) } })} 
                      style={{ ...styles.slider, flex: 1 }} 
                      title="Blob offset - radial position (0 = inner edge, 0.5 = center, 1 = outer edge)" 
                    />
                  </div>
                )}
              </div>
              
            </div>
          </div>
        </Col>
        <Col xs={6} md={4}>
          <div style={{ ...styles.toolbarGroup, height: '100%' }}>
            <span style={styles.groupLabel}><Tag size={14} /> Label</span>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <button 
                onClick={() => onConfigChange({ 
                  ...config, 
                  labels: { ...cfg?.labels, valueLabel: { ...cfg?.labels?.valueLabel, hide: !cfg?.labels?.valueLabel?.hide } } 
                })} 
                style={{ ...styles.toolBtn, padding: '6px 10px', ...(!cfg?.labels?.valueLabel?.hide ? styles.toolBtnActive : {}) }} 
                title="Toggle value label visibility - show or hide the center number"
                type="button"
              >
                {cfg?.labels?.valueLabel?.hide ? <EyeOff size={14} /> : <Eye size={14} />}
                <span>Show</span>
              </button>
              <button 
                onClick={() => onConfigChange({ 
                  ...config, 
                  labels: { ...cfg?.labels, valueLabel: { ...cfg?.labels?.valueLabel, matchColorWithArc: !cfg?.labels?.valueLabel?.matchColorWithArc } } 
                })} 
                style={{ ...styles.toolBtn, padding: '6px 10px', ...(cfg?.labels?.valueLabel?.matchColorWithArc ? styles.toolBtnActive : {}) }} 
                title="Match label color with arc - label follows current value color"
                type="button"
              >
                <Rainbow size={14} />
                <span>Arc</span>
              </button>
              {/* Label sliders - each on own line */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
                  <span style={{ ...styles.sliderLabel, minWidth: '50px' }}>Size</span>
                  <input 
                    type="range" 
                    min="12" 
                    max="72" 
                    step="1" 
                    value={parseInt(cfg?.labels?.valueLabel?.style?.fontSize || '35')} 
                    onChange={(e) => onConfigChange({ 
                      ...config, 
                      labels: { ...cfg?.labels, valueLabel: { ...cfg?.labels?.valueLabel, hide: false, style: { ...cfg?.labels?.valueLabel?.style, fontSize: `${e.target.value}px` } } } 
                    })} 
                    style={{ ...styles.slider, flex: 1 }} 
                    title="Font size" 
                  />
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
                  <span style={{ ...styles.sliderLabel, minWidth: '50px' }}>X Offset</span>
                  <input 
                    type="range" 
                    min="-50" 
                    max="50" 
                    step="1" 
                    value={cfg?.labels?.valueLabel?.offsetX ?? 0} 
                    onChange={(e) => onConfigChange({ 
                      ...config, 
                      labels: { ...cfg?.labels, valueLabel: { ...cfg?.labels?.valueLabel, offsetX: Number(e.target.value) } } 
                    })} 
                    style={{ ...styles.slider, flex: 1 }} 
                    title="Horizontal offset" 
                  />
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
                  <span style={{ ...styles.sliderLabel, minWidth: '50px' }}>Y Offset</span>
                  <input 
                    type="range" 
                    min="-100" 
                    max="50" 
                    step="1" 
                    value={cfg?.labels?.valueLabel?.offsetY ?? 0} 
                    onChange={(e) => onConfigChange({ 
                      ...config, 
                      labels: { ...cfg?.labels, valueLabel: { ...cfg?.labels?.valueLabel, offsetY: Number(e.target.value) } } 
                    })} 
                    style={{ ...styles.slider, flex: 1 }} 
                    title="Vertical offset (negative = up)" 
                  />
                </div>
              </div>
            </div>
          </div>
        </Col>

        {/* Ticks - md-4 for more controls */}
        <Col xs={12} md={5}>
          <div style={{ ...styles.toolbarGroup, height: '100%' }}>
            <span style={styles.groupLabel}><Ruler size={14} /> Tick Marks</span>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Interval buttons */}
              <div style={{ display: 'flex', gap: '3px', alignItems: 'center', flexShrink: 0 }}>
                {[
                  { label: 'None', interval: 0 },
                  { label: '5', interval: 5 },
                  { label: '10', interval: 10 },
                  { label: '25', interval: 25 },
                ].map((t) => (
                  <button 
                    key={t.label} 
                    onClick={() => {
                      const min = cfg?.minValue ?? 0;
                      const max = cfg?.maxValue ?? 100;
                      const ticks = t.interval === 0 ? [] : Array.from(
                        { length: Math.floor((max - min) / t.interval) + 1 }, 
                        (_, i) => ({ value: min + i * t.interval })
                      );
                      onConfigChange({ 
                        ...config, 
                        labels: { ...cfg?.labels, tickLabels: { ...cfg?.labels?.tickLabels, type: cfg?.labels?.tickLabels?.type || 'outer', ticks, hideMinMax: t.interval === 0 } } 
                      });
                    }} 
                    style={{ ...styles.toolBtn, padding: '4px 8px' }} 
                    title={t.interval === 0 ? 'Hide all tick marks' : `Show tick marks every ${t.interval} units`}
                    type="button"
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              {/* Position buttons */}
              <div style={{ display: 'flex', gap: '3px', alignItems: 'center', flexShrink: 0 }}>
                <button 
                  onClick={() => onConfigChange({ 
                    ...config, 
                    labels: { ...cfg?.labels, tickLabels: { ...cfg?.labels?.tickLabels, type: 'outer' } } 
                  })} 
                  style={{ ...styles.toolBtn, padding: '4px 8px', ...(cfg?.labels?.tickLabels?.type === 'outer' || !cfg?.labels?.tickLabels?.type ? styles.toolBtnActive : {}) }} 
                  title="Position ticks outside the arc"
                  type="button"
                >
                  <ArrowUpRight size={12} />
                  <span>Out</span>
                </button>
                <button 
                  onClick={() => onConfigChange({ 
                    ...config, 
                    labels: { ...cfg?.labels, tickLabels: { ...cfg?.labels?.tickLabels, type: 'inner' } } 
                  })} 
                  style={{ ...styles.toolBtn, padding: '4px 8px', ...(cfg?.labels?.tickLabels?.type === 'inner' ? styles.toolBtnActive : {}) }} 
                  title="Position ticks inside the arc"
                  type="button"
                >
                  <ArrowDownLeft size={12} />
                  <span>In</span>
                </button>
                <button 
                  onClick={() => onConfigChange({ 
                    ...config, 
                    labels: { ...cfg?.labels, tickLabels: { ...cfg?.labels?.tickLabels, hideMinMax: !cfg?.labels?.tickLabels?.hideMinMax } } 
                  })} 
                  style={{ ...styles.toolBtn, padding: '4px 8px', ...(cfg?.labels?.tickLabels?.hideMinMax ? {} : styles.toolBtnActive) }} 
                  title={cfg?.labels?.tickLabels?.hideMinMax ? 'Show min/max values' : 'Hide min/max values'}
                  type="button"
                >
                  <Hash size={12} />
                </button>
              </div>
              {/* Toggle buttons for visibility */}
              <div style={{ display: 'flex', gap: '3px', alignItems: 'center', flexShrink: 0 }}>
                <button 
                  onClick={() => onConfigChange({ 
                    ...config, 
                    labels: { ...cfg?.labels, tickLabels: { ...cfg?.labels?.tickLabels, defaultTickLineConfig: { ...cfg?.labels?.tickLabels?.defaultTickLineConfig, hide: !cfg?.labels?.tickLabels?.defaultTickLineConfig?.hide } } } 
                  })} 
                  style={{ ...styles.toolBtn, padding: '4px 8px', ...(cfg?.labels?.tickLabels?.defaultTickLineConfig?.hide ? {} : styles.toolBtnActive) }} 
                  title={cfg?.labels?.tickLabels?.defaultTickLineConfig?.hide ? 'Show tick lines' : 'Hide tick lines'}
                  type="button"
                >
                  <Minus size={12} />
                  <span>Lines</span>
                </button>
                <button 
                  onClick={() => onConfigChange({ 
                    ...config, 
                    labels: { ...cfg?.labels, tickLabels: { ...cfg?.labels?.tickLabels, defaultTickValueConfig: { ...cfg?.labels?.tickLabels?.defaultTickValueConfig, hide: !cfg?.labels?.tickLabels?.defaultTickValueConfig?.hide } } } 
                  })} 
                  style={{ ...styles.toolBtn, padding: '4px 8px', ...(cfg?.labels?.tickLabels?.defaultTickValueConfig?.hide ? {} : styles.toolBtnActive) }} 
                  title={cfg?.labels?.tickLabels?.defaultTickValueConfig?.hide ? 'Show tick labels' : 'Hide tick labels'}
                  type="button"
                >
                  <Hash size={12} />
                  <span>Labels</span>
                </button>
              </div>
              {/* Colors */}
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flexShrink: 0 }}>
                <span style={styles.sliderLabel}>Line</span>
                <input 
                  type="color" 
                  value={cfg?.labels?.tickLabels?.defaultTickLineConfig?.color || '#ada9ab'} 
                  onChange={(e) => onConfigChange({ 
                    ...config, 
                    labels: { ...cfg?.labels, tickLabels: { ...cfg?.labels?.tickLabels, defaultTickLineConfig: { ...cfg?.labels?.tickLabels?.defaultTickLineConfig, color: e.target.value } } } 
                  })} 
                  style={styles.colorPicker} 
                  title="Tick line color" 
                />
                <span style={styles.sliderLabel}>Text</span>
                <input 
                  type="color" 
                  value={cfg?.labels?.tickLabels?.defaultTickValueConfig?.style?.fill as string || '#ada9ab'} 
                  onChange={(e) => onConfigChange({ 
                    ...config, 
                    labels: { ...cfg?.labels, tickLabels: { ...cfg?.labels?.tickLabels, defaultTickValueConfig: { ...cfg?.labels?.tickLabels?.defaultTickValueConfig, style: { ...cfg?.labels?.tickLabels?.defaultTickValueConfig?.style, fill: e.target.value } } } } 
                  })} 
                  style={styles.colorPicker} 
                  title="Tick label color" 
                />
              </div>
              {/* Sliders - each on own line */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
                  <span style={{ ...styles.sliderLabel, minWidth: '50px' }}>Line W</span>
                  <input 
                    type="range" 
                    min="1" 
                    max="5" 
                    step="1" 
                    value={cfg?.labels?.tickLabels?.defaultTickLineConfig?.width ?? 1} 
                    onChange={(e) => onConfigChange({ 
                      ...config, 
                      labels: { ...cfg?.labels, tickLabels: { ...cfg?.labels?.tickLabels, defaultTickLineConfig: { ...cfg?.labels?.tickLabels?.defaultTickLineConfig, width: Number(e.target.value) } } } 
                    })} 
                    style={{ ...styles.slider, flex: 1 }} 
                    title="Tick line width" 
                  />
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
                  <span style={{ ...styles.sliderLabel, minWidth: '50px' }}>Line L</span>
                  <input 
                    type="range" 
                    min="3" 
                    max="20" 
                    step="1" 
                    value={cfg?.labels?.tickLabels?.defaultTickLineConfig?.length ?? 7} 
                    onChange={(e) => onConfigChange({ 
                      ...config, 
                      labels: { ...cfg?.labels, tickLabels: { ...cfg?.labels?.tickLabels, defaultTickLineConfig: { ...cfg?.labels?.tickLabels?.defaultTickLineConfig, length: Number(e.target.value) } } } 
                    })} 
                    style={{ ...styles.slider, flex: 1 }} 
                    title="Tick line length" 
                  />
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
                  <span style={{ ...styles.sliderLabel, minWidth: '50px' }}>Text Size</span>
                  <input 
                    type="range" 
                    min="8" 
                    max="20" 
                    step="1" 
                    value={parseInt(cfg?.labels?.tickLabels?.defaultTickValueConfig?.style?.fontSize as string || '12')} 
                    onChange={(e) => onConfigChange({ 
                      ...config, 
                      labels: { ...cfg?.labels, tickLabels: { ...cfg?.labels?.tickLabels, defaultTickValueConfig: { ...cfg?.labels?.tickLabels?.defaultTickValueConfig, style: { ...cfg?.labels?.tickLabels?.defaultTickValueConfig?.style, fontSize: `${e.target.value}px` } } } } 
                    })} 
                    style={{ ...styles.slider, flex: 1 }} 
                    title="Tick label font size" 
                  />
                </div>
              </div>
            </div>
          </div>
        </Col>

        <Col xs={6} md={3}>
          <div style={{ ...styles.toolbarGroup, height: '100%' }}>
            <span style={styles.groupLabel}><Move size={14} /> Size & Align</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
                <span style={{ ...styles.sliderLabel, minWidth: '50px' }}>Width</span>
                <input 
                  type="range" 
                  min="150" 
                  max="600" 
                  step="10" 
                  value={parseInt(sandboxWidth)} 
                  onChange={(e) => onSizeChange(`${e.target.value}px`, sandboxHeight)} 
                  style={{ ...styles.slider, flex: 1 }} 
                  title={`Width: ${parseInt(sandboxWidth)}px`} 
                />
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
                <span style={{ ...styles.sliderLabel, minWidth: '50px' }}>Height</span>
                <input 
                  type="range" 
                  min="100" 
                  max="400" 
                  step="10" 
                  value={parseInt(sandboxHeight)} 
                  onChange={(e) => onSizeChange(sandboxWidth, `${e.target.value}px`)} 
                  style={{ ...styles.slider, flex: 1 }} 
                  title={`Height: ${parseInt(sandboxHeight)}px`} 
                />
              </div>
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <button 
                  onClick={() => onAlignChange('left')} 
                  style={{ ...styles.toolBtn, padding: '6px 10px', flex: 1, ...(gaugeAlign === 'left' ? styles.toolBtnActive : {}) }} 
                  title="Align gauge to left"
                  type="button"
                >
                  <AlignLeft size={14} />
                </button>
                <button 
                  onClick={() => onAlignChange('center')} 
                  style={{ ...styles.toolBtn, padding: '6px 10px', flex: 1, ...(gaugeAlign === 'center' ? styles.toolBtnActive : {}) }} 
                  title="Center gauge"
                  type="button"
                >
                  <AlignCenter size={14} />
                </button>
                <button 
                  onClick={() => onAlignChange('right')} 
                  style={{ ...styles.toolBtn, padding: '6px 10px', flex: 1, ...(gaugeAlign === 'right' ? styles.toolBtnActive : {}) }} 
                  title="Align gauge to right"
                  type="button"
                >
                  <AlignRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </Col>
        <Col xs={12}>
          <div style={{ ...styles.toolbarGroup, borderColor: '#3b82f6' }}>
            <span style={styles.groupLabel}><Sliders size={14} /> Value</span>
            <div style={styles.buttonRow}>
              <label style={styles.inlineLabel}>
                <input 
                  type="checkbox" 
                  checked={autoAnimate} 
                  onChange={(e) => onAutoAnimateChange(e.target.checked)} 
                  style={styles.inlineCheckbox} 
                />
                Auto
              </label>
              {[0, 25, 50, 75, 100].map((val) => {
                const min = cfg?.minValue ?? 0;
                const max = cfg?.maxValue ?? 100;
                const actualValue = min + (val / 100) * (max - min);
                return (
                  <button 
                    key={val} 
                    onClick={() => onValueChange(actualValue)} 
                    style={{ ...styles.toolBtn, ...(Math.abs(value - actualValue) < 0.01 ? styles.toolBtnActive : {}) }} 
                    type="button"
                  >
                    {val}
                  </button>
                );
              })}
              <input 
                type="range" 
                min={cfg?.minValue ?? 0} 
                max={cfg?.maxValue ?? 100} 
                value={value} 
                onChange={(e) => {
                  onValueChange(Number(e.target.value));
                  if (autoAnimate) onAutoAnimateChange(false);
                }} 
                style={{ ...styles.slider, flex: 1, minWidth: '150px' }} 
                step="0.1" 
              />
              <span style={{ ...styles.sliderValue, fontWeight: 700, color: '#60a5fa' }}>
                {value.toFixed(1)}
              </span>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};
