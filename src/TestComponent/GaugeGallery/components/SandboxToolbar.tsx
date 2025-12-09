import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import GaugeComponent from '../../../lib';
import { styles } from '../styles';
import { SANDBOX_PRESETS, COLOR_PRESETS } from '../presets';
import { GaugeComponentProps } from '../../../lib/GaugeComponent/types/GaugeComponentProps';

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
        <Col xs={4} md={2}>
          <div style={{ ...styles.toolbarGroup, height: '100%', minHeight: '140px' }}>
            <span style={styles.groupLabel}>🎨 Type</span>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {(['semicircle', 'radial', 'grafana'] as const).map((gaugeType) => (
                <button 
                  key={gaugeType}
                  onClick={() => onConfigChange({ ...config, type: gaugeType })} 
                  style={{ 
                    background: cfg?.type === gaugeType ? 'rgba(0, 217, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    border: cfg?.type === gaugeType ? '2px solid #00d9ff' : '2px solid transparent',
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
                    color: cfg?.type === gaugeType ? '#00d9ff' : 'rgba(255,255,255,0.6)',
                    marginTop: '2px',
                  }}>
                    {gaugeType.charAt(0).toUpperCase() + gaugeType.slice(1)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </Col>
        <Col xs={4} md={8}>
        <Row  className="g-0">

        <Col xs={12} md={3}>
          <div style={{ ...styles.toolbarGroup, height: '100%' }}>
            <span style={styles.groupLabel}>📦 Presets</span>
            <div style={styles.buttonRow}>
              <button 
                onClick={onRandomize} 
                style={{ ...styles.toolBtn, padding: '4px 8px', flexDirection: 'column' as const, fontSize: '0.65rem' }} 
                title="Randomize gauge - generate random configuration" 
                type="button"
              >
                <span>🎲</span>
                <span>Random</span>
              </button>
              {SANDBOX_PRESETS.map((p) => (
                <button 
                  key={p.icon} 
                  onClick={() => { onConfigChange(p.config as any); onValueChange(p.value); }} 
                  style={{ ...styles.toolBtn, padding: '4px 8px', flexDirection: 'column' as const, fontSize: '0.65rem' }} 
                  title={p.label} 
                  type="button"
                >
                  <span>{p.icon}</span>
                  <span>{p.label}</span>
                </button>
              ))}
            </div>
          </div>
        </Col>

        <Col xs={12} md={5}>
          <div style={{ ...styles.toolbarGroup, height: '100%' }}>
            <span style={styles.groupLabel}>🌈 Arc & Colors</span>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Color presets group */}
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
              {/* Arc width and corner radius sliders */}
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0 }}>
                <span style={styles.sliderLabel}>Width</span>
                <input 
                  type="range" 
                  min="0.02" 
                  max="0.8" 
                  step="0.01" 
                  value={cfg?.arc?.width ?? 0.2} 
                  onChange={(e) => onConfigChange({ ...config, arc: { ...cfg?.arc, width: Number(e.target.value) } })} 
                  style={{ ...styles.slider, width: '90px' }} 
                  title="Arc width - thickness of the gauge arc"
                />
                <span style={styles.sliderLabel}>Radius</span>
                <input 
                  type="range" 
                  min="0" 
                  max="20" 
                  step="1" 
                  value={cfg?.arc?.cornerRadius ?? 7} 
                  onChange={(e) => onConfigChange({ ...config, arc: { ...cfg?.arc, cornerRadius: Number(e.target.value) } })} 
                  style={{ ...styles.slider, width: '90px' }} 
                  title="Corner radius - roundness of arc segment edges"
                />
              </div>
            </div>
          </div>
        </Col>

        <Col xs={6} md={3}>
          <div style={{ ...styles.toolbarGroup, height: '100%' }}>
            <span style={styles.groupLabel}>🎯 Pointer</span>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Type buttons */}
              <div style={{ display: 'flex', gap: '3px', alignItems: 'center', flexShrink: 0 }}>
                {[
                  { icon: '📍', type: 'needle', hide: false, title: 'Needle pointer - classic gauge needle style', label: 'Needle' },
                  { icon: '⚫', type: 'blob', hide: false, title: 'Blob pointer - circular indicator on arc', label: 'Blob' },
                  { icon: '➤', type: 'arrow', hide: false, title: 'Arrow pointer - directional arrow indicator', label: 'Arrow' },
                  { icon: '👻', type: 'needle', hide: true, title: 'Hidden pointer - no pointer visible', label: 'Hide' },
                ].map((p) => (
                  <button 
                    key={p.icon} 
                    onClick={() => onConfigChange({ ...config, pointer: { ...cfg?.pointer, type: p.type, hide: p.hide } })} 
                    style={{ 
                      ...styles.toolBtn, 
                      padding: '4px 8px', 
                      flexDirection: 'column' as const,
                      fontSize: '0.65rem',
                      ...(cfg?.pointer?.type === p.type && cfg?.pointer?.hide === p.hide ? styles.toolBtnActive : {}) 
                    }} 
                    title={p.title}
                    type="button"
                  >
                    <span>{p.icon}</span>
                    <span>{p.label}</span>
                  </button>
                ))}
              </div>
              {/* Options */}
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flexShrink: 0 }}>
                <button 
                  onClick={() => onInteractionChange(!interactionEnabled)} 
                  style={{ ...styles.toolBtn, padding: '4px 8px', flexDirection: 'column' as const, fontSize: '0.65rem', ...(interactionEnabled ? styles.toolBtnActive : {}) }} 
                  title={interactionEnabled ? 'Drag interaction enabled - click to disable' : 'Drag interaction disabled - click to enable grabbing pointer'}
                  type="button"
                >
                  <span>{interactionEnabled ? '✋' : '🚫'}</span>
                  <span>Drag</span>
                </button>
                <button 
                  onClick={() => onConfigChange({ ...config, pointer: { ...cfg?.pointer, elastic: !cfg?.pointer?.elastic } })} 
                  style={{ ...styles.toolBtn, padding: '4px 8px', flexDirection: 'column' as const, fontSize: '0.65rem', ...(cfg?.pointer?.elastic ? styles.toolBtnActive : {}) }} 
                  title="Elastic bounce animation - pointer bounces when reaching target value"
                  type="button"
                >
                  <span>🎹</span>
                  <span>Elastic</span>
                </button>
                <button 
                  onClick={() => onConfigChange({ ...config, pointer: { ...cfg?.pointer, animationDelay: cfg?.pointer?.animationDelay === 0 ? 200 : 0 } })} 
                  style={{ ...styles.toolBtn, padding: '4px 8px', flexDirection: 'column' as const, fontSize: '0.65rem', ...(cfg?.pointer?.animationDelay === 0 ? styles.toolBtnActive : {}) }} 
                  title="Instant animation - no delay before pointer starts moving"
                  type="button"
                >
                  <span>⚡</span>
                  <span>Instant</span>
                </button>
              </div>
              {/* Sliders */}
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0 }}>
                <span style={styles.sliderLabel}>Length</span>
                <input 
                  type="range" min="0.4" max="1" step="0.05" 
                  value={cfg?.pointer?.length ?? 0.8} 
                  onChange={(e) => onConfigChange({ ...config, pointer: { ...cfg?.pointer, length: Number(e.target.value) } })} 
                  style={{ ...styles.slider, width: '90px' }} 
                  title="Pointer length" 
                />
                <span style={styles.sliderLabel}>Width</span>
                <input 
                  type="range" min="4" max="30" step="1" 
                  value={cfg?.pointer?.width ?? 15} 
                  onChange={(e) => onConfigChange({ ...config, pointer: { ...cfg?.pointer, width: Number(e.target.value) } })} 
                  style={{ ...styles.slider, width: '90px' }} 
                  title="Pointer width" 
                />
              </div>
              {/* Color controls */}
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flexShrink: 0 }}>
                <button 
                  onClick={() => onConfigChange({ ...config, pointer: { ...cfg?.pointer, color: cfg?.pointer?.color ? undefined : '#464A4F' } })} 
                  style={{ ...styles.toolBtn, padding: '4px 8px', flexDirection: 'column' as const, fontSize: '0.65rem', ...(!cfg?.pointer?.color ? styles.toolBtnActive : {}) }} 
                  title="Match pointer color with arc - pointer follows current value color"
                  type="button"
                >
                  <span>🌈</span>
                  <span>Arc</span>
                </button>
                {cfg?.pointer?.color && (
                  <input 
                    type="color" 
                    value={cfg?.pointer?.color || '#464A4F'} 
                    onChange={(e) => onConfigChange({ ...config, pointer: { ...cfg?.pointer, color: e.target.value } })} 
                    style={styles.colorPicker} 
                    title="Pointer color" 
                  />
                )}
                <input 
                  type="color" 
                  value={cfg?.pointer?.baseColor || '#ffffff'} 
                  onChange={(e) => onConfigChange({ ...config, pointer: { ...cfg?.pointer, baseColor: e.target.value } })} 
                  style={styles.colorPicker} 
                  title="Pointer base/center color" 
                />
              </div>
            </div>
          </div>
        </Col>
        <Col xs={6} md={3}>
          <div style={{ ...styles.toolbarGroup, height: '100%' }}>
            <span style={styles.groupLabel}>🏷️ Label</span>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <button 
                onClick={() => onConfigChange({ 
                  ...config, 
                  labels: { ...cfg?.labels, valueLabel: { ...cfg?.labels?.valueLabel, hide: !cfg?.labels?.valueLabel?.hide } } 
                })} 
                style={{ ...styles.toolBtn, padding: '4px 8px', flexDirection: 'column' as const, fontSize: '0.65rem', ...(!cfg?.labels?.valueLabel?.hide ? styles.toolBtnActive : {}) }} 
                title="Toggle value label visibility - show or hide the center number"
                type="button"
              >
                <span>{cfg?.labels?.valueLabel?.hide ? '🙈' : '👁️'}</span>
                <span>Show</span>
              </button>
              <button 
                onClick={() => onConfigChange({ 
                  ...config, 
                  labels: { ...cfg?.labels, valueLabel: { ...cfg?.labels?.valueLabel, matchColorWithArc: !cfg?.labels?.valueLabel?.matchColorWithArc } } 
                })} 
                style={{ ...styles.toolBtn, padding: '4px 8px', flexDirection: 'column' as const, fontSize: '0.65rem', ...(cfg?.labels?.valueLabel?.matchColorWithArc ? styles.toolBtnActive : {}) }} 
                title="Match label color with arc - label follows current value color"
                type="button"
              >
                <span>🌈</span>
                <span>Arc</span>
              </button>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <span style={styles.sliderLabel}>Font Size</span>
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
                  style={{ ...styles.slider, width: '120px' }} 
                  title="Font size" 
                />
              </div>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <span style={styles.sliderLabel}>Y Offset</span>
                <input 
                  type="range" 
                  min="-30" 
                  max="30" 
                  step="1" 
                  value={cfg?.labels?.valueLabel?.style?.textShadow ? 0 : (cfg?.labels?.valueLabel?.offsetY ?? 0)} 
                  onChange={(e) => onConfigChange({ 
                    ...config, 
                    labels: { ...cfg?.labels, valueLabel: { ...cfg?.labels?.valueLabel, offsetY: Number(e.target.value) } } 
                  })} 
                  style={{ ...styles.slider, width: '120px' }} 
                  title="Vertical offset" 
                />
              </div>
            </div>
          </div>
        </Col>

        {/* Ticks - md-3 */}
        <Col xs={6} md={3}>
          <div style={{ ...styles.toolbarGroup, height: '100%' }}>
            <span style={styles.groupLabel}>📏 Ticks</span>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Interval buttons */}
              <div style={{ display: 'flex', gap: '3px', alignItems: 'center', flexShrink: 0 }}>
                {[
                  { label: '∅', interval: 0 },
                  { label: '5', interval: 5 },
                  { label: '10', interval: 10 },
                  { label: '25', interval: 25 },
                  { label: '50', interval: 50 },
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
                    style={{ ...styles.toolBtn, padding: '3px 5px', fontSize: '0.7rem' }} 
                    title={t.interval === 0 ? 'No ticks' : `Every ${t.interval}`}
                    type="button"
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              {/* Position & options */}
              <div style={{ display: 'flex', gap: '3px', alignItems: 'center', flexShrink: 0 }}>
                <button 
                  onClick={() => onConfigChange({ 
                    ...config, 
                    labels: { ...cfg?.labels, tickLabels: { ...cfg?.labels?.tickLabels, type: 'outer' } } 
                  })} 
                  style={{ ...styles.toolBtn, padding: '3px 5px', ...(cfg?.labels?.tickLabels?.type === 'outer' ? styles.toolBtnActive : {}) }} 
                  title="Outer ticks"
                  type="button"
                >
                  ↗
                </button>
                <button 
                  onClick={() => onConfigChange({ 
                    ...config, 
                    labels: { ...cfg?.labels, tickLabels: { ...cfg?.labels?.tickLabels, type: 'inner' } } 
                  })} 
                  style={{ ...styles.toolBtn, padding: '3px 5px', ...(cfg?.labels?.tickLabels?.type === 'inner' ? styles.toolBtnActive : {}) }} 
                  title="Inner ticks"
                  type="button"
                >
                  ↙
                </button>
                <button 
                  onClick={() => onConfigChange({ 
                    ...config, 
                    labels: { ...cfg?.labels, tickLabels: { ...cfg?.labels?.tickLabels, hideMinMax: !cfg?.labels?.tickLabels?.hideMinMax } } 
                  })} 
                  style={{ ...styles.toolBtn, padding: '3px 5px', ...(cfg?.labels?.tickLabels?.hideMinMax ? {} : styles.toolBtnActive) }} 
                  title="Show min/max"
                  type="button"
                >
                  0↔100
                </button>
              </div>
            </div>
          </div>
        </Col>

        <Col xs={6} md={3}>
          <div style={{ ...styles.toolbarGroup, height: '100%' }}>
            <span style={styles.groupLabel}>📐 Size & Align</span>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <span style={styles.sliderLabel}>Width</span>
                <input 
                  type="range" 
                  min="150" 
                  max="600" 
                  step="10" 
                  value={parseInt(sandboxWidth)} 
                  onChange={(e) => onSizeChange(`${e.target.value}px`, sandboxHeight)} 
                  style={{ ...styles.slider, width: '120px' }} 
                  title={`Width: ${parseInt(sandboxWidth)}px`} 
                />
              </div>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <span style={styles.sliderLabel}>Height</span>
                <input 
                  type="range" 
                  min="100" 
                  max="400" 
                  step="10" 
                  value={parseInt(sandboxHeight)} 
                  onChange={(e) => onSizeChange(sandboxWidth, `${e.target.value}px`)} 
                  style={{ ...styles.slider, width: '120px' }} 
                  title={`Height: ${parseInt(sandboxHeight)}px`} 
                />
              </div>
              {[
                { icon: '⬅', v: 'left' as const, desc: 'Align gauge to left', label: 'Left' },
                { icon: '⬛', v: 'center' as const, desc: 'Center gauge', label: 'Center' },
              ].map((a) => (
                <button 
                  key={a.v} 
                  onClick={() => onAlignChange(a.v)} 
                  style={{ ...styles.toolBtn, padding: '4px 8px', flexDirection: 'column' as const, fontSize: '0.65rem', ...(gaugeAlign === a.v ? styles.toolBtnActive : {}) }} 
                  title={a.desc}
                  type="button"
                >
                  <span>{a.icon}</span>
                  <span>{a.label}</span>
                </button>
              ))}
            </div>
          </div>
        </Col>
        </Row>
        </Col>
        <Col xs={12}>
          <div style={{ ...styles.toolbarGroup, borderColor: '#2ecc71' }}>
            <span style={styles.groupLabel}>🎚️ Value</span>
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
              <span style={{ ...styles.sliderValue, fontWeight: 700, color: '#00d9ff' }}>
                {value.toFixed(1)}
              </span>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};
