import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { styles } from '../styles';
import { SANDBOX_PRESETS, COLOR_PRESETS } from '../presets';
import { GaugeComponentProps } from '../../../lib/GaugeComponent/types/GaugeComponentProps';

interface SandboxToolbarProps {
  config: Partial<GaugeComponentProps>;
  value: number;
  autoAnimate: boolean;
  sandboxWidth: string;
  sandboxHeight: string;
  gaugeAlign: 'left' | 'center' | 'right';
  onConfigChange: (config: Partial<GaugeComponentProps>) => void;
  onValueChange: (value: number) => void;
  onAutoAnimateChange: (autoAnimate: boolean) => void;
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
}) => {
  const cfg = config as any;

  return (
    <Container fluid style={styles.editorToolbar}>
      <Row className="g-2">
        {/* Presets - md-3 */}
        <Col xs={12} md={3}>
          <div style={{ ...styles.toolbarGroup, borderColor: '#ff6b6b', height: '100%' }}>
            <span style={styles.groupLabel}>📦 Presets</span>
            <div style={styles.buttonRow}>
              <button onClick={onRandomize} style={styles.toolBtn} title="Random" type="button">🎲</button>
              {SANDBOX_PRESETS.map((p) => (
                <button 
                  key={p.icon} 
                  onClick={() => { onConfigChange(p.config as any); onValueChange(p.value); }} 
                  style={styles.toolBtn} 
                  title={p.label} 
                  type="button"
                >
                  {p.icon}
                </button>
              ))}
            </div>
          </div>
        </Col>

        {/* Type - md-4 */}
        <Col xs={12} md={4}>
          <div style={{ ...styles.toolbarGroup, borderColor: '#9b59b6', height: '100%' }}>
            <span style={styles.groupLabel}>🎨 Type</span>
            <div style={{ ...styles.buttonRow, justifyContent: 'center' }}>
              {[
                { type: 'semicircle', label: 'Semi', height: 22 },
                { type: 'radial', label: 'Radial', height: 28 },
                { type: 'grafana', label: 'Grafana', height: 28 },
              ].map((t) => (
                <button 
                  key={t.type}
                  onClick={() => onConfigChange({ ...config, type: t.type as any })} 
                  style={{ 
                    ...styles.toolBtn, 
                    padding: '8px 12px', 
                    flexDirection: 'column',
                    ...(cfg?.type === t.type ? styles.toolBtnActive : {}) 
                  }} 
                  title={t.label} 
                  type="button"
                >
                  <GaugeTypeIcon type={t.type as any} isActive={cfg?.type === t.type} />
                  <span style={{ fontSize: '0.65rem', marginTop: '2px' }}>{t.label}</span>
                </button>
              ))}
            </div>
          </div>
        </Col>

        {/* SubArcs - md-5 */}
        <Col xs={12} md={5}>
          <div style={{ ...styles.toolbarGroup, borderColor: '#e74c3c', height: '100%' }}>
            <span style={styles.groupLabel}>🌈 SubArcs</span>
            <div style={styles.buttonRow}>
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
              <span style={styles.toolbarDivider} />
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
              <span style={styles.toolbarDivider} />
              <label style={styles.inlineLabel}>
                <input 
                  type="checkbox" 
                  checked={cfg?.arc?.gradient || false} 
                  onChange={(e) => onConfigChange({ ...config, arc: { ...cfg?.arc, gradient: e.target.checked } })} 
                  style={styles.inlineCheckbox} 
                />
                Grad
              </label>
              {[0, 1, 2].map((i) => {
                const colors = cfg?.arc?.colorArray || ['#5BE12C', '#F5CD19', '#EA4228'];
                return (
                  <input 
                    key={i} 
                    type="color" 
                    value={colors[i] || '#ffffff'} 
                    onChange={(e) => {
                      const newColors = [...colors];
                      newColors[i] = e.target.value;
                      onConfigChange({ ...config, arc: { ...cfg?.arc, colorArray: newColors, nbSubArcs: cfg?.arc?.nbSubArcs || 3, subArcs: [] } });
                    }}
                    style={styles.colorPicker}
                    title={`Color ${i + 1}`}
                  />
                );
              })}
            </div>
          </div>
        </Col>

        {/* Arc - md-2 */}
        <Col xs={6} md={2}>
          <div style={{ ...styles.toolbarGroup, borderColor: '#3498db', height: '100%' }}>
            <span style={styles.groupLabel}>📊 Arc</span>
            <div style={styles.buttonRow}>
              <span style={styles.sliderLabel}>W</span>
              <input 
                type="range" 
                min="0.05" 
                max="0.5" 
                step="0.01" 
                value={cfg?.arc?.width ?? 0.2} 
                onChange={(e) => onConfigChange({ ...config, arc: { ...cfg?.arc, width: Number(e.target.value) } })} 
                style={{ ...styles.slider, width: '50px' }} 
              />
              <span style={styles.sliderLabel}>R</span>
              <input 
                type="range" 
                min="0" 
                max="20" 
                step="1" 
                value={cfg?.arc?.cornerRadius ?? 7} 
                onChange={(e) => onConfigChange({ ...config, arc: { ...cfg?.arc, cornerRadius: Number(e.target.value) } })} 
                style={{ ...styles.slider, width: '50px' }} 
              />
            </div>
          </div>
        </Col>

        {/* Pointer - md-2 */}
        <Col xs={6} md={2}>
          <div style={{ ...styles.toolbarGroup, borderColor: '#f39c12', height: '100%' }}>
            <span style={styles.groupLabel}>🎯 Pointer</span>
            <div style={styles.buttonRow}>
              {[
                { icon: '📍', type: 'needle', hide: false },
                { icon: '⚫', type: 'blob', hide: false },
                { icon: '➤', type: 'arrow', hide: false },
                { icon: '👻', type: 'needle', hide: true },
              ].map((p) => (
                <button 
                  key={p.icon} 
                  onClick={() => onConfigChange({ ...config, pointer: { ...cfg?.pointer, type: p.type, hide: p.hide } })} 
                  style={{ 
                    ...styles.toolBtn, 
                    padding: '4px 6px', 
                    ...(cfg?.pointer?.type === p.type && cfg?.pointer?.hide === p.hide ? styles.toolBtnActive : {}) 
                  }} 
                  type="button"
                >
                  {p.icon}
                </button>
              ))}
            </div>
          </div>
        </Col>

        {/* Label - md-2 */}
        <Col xs={6} md={2}>
          <div style={{ ...styles.toolbarGroup, borderColor: '#1abc9c', height: '100%' }}>
            <span style={styles.groupLabel}>🏷️ Label</span>
            <div style={styles.buttonRow}>
              <button 
                onClick={() => onConfigChange({ 
                  ...config, 
                  labels: { ...cfg?.labels, valueLabel: { ...cfg?.labels?.valueLabel, hide: !cfg?.labels?.valueLabel?.hide } } 
                })} 
                style={{ ...styles.toolBtn, ...(!cfg?.labels?.valueLabel?.hide ? styles.toolBtnActive : {}) }} 
                type="button"
              >
                👁️
              </button>
              <button 
                onClick={() => onConfigChange({ 
                  ...config, 
                  labels: { ...cfg?.labels, valueLabel: { ...cfg?.labels?.valueLabel, matchColorWithArc: !cfg?.labels?.valueLabel?.matchColorWithArc } } 
                })} 
                style={{ ...styles.toolBtn, ...(cfg?.labels?.valueLabel?.matchColorWithArc ? styles.toolBtnActive : {}) }} 
                type="button"
              >
                🌈
              </button>
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
                style={{ ...styles.slider, width: '40px' }} 
                title="Font size" 
              />
            </div>
          </div>
        </Col>

        {/* Ticks - md-2 */}
        <Col xs={6} md={2}>
          <div style={{ ...styles.toolbarGroup, borderColor: '#e67e22', height: '100%' }}>
            <span style={styles.groupLabel}>📏 Ticks</span>
            <div style={styles.buttonRow}>
              {[
                { label: '∅', interval: 0 },
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
                      labels: { ...cfg?.labels, tickLabels: { ...cfg?.labels?.tickLabels, type: 'outer', ticks, hideMinMax: t.interval === 0 } } 
                    });
                  }} 
                  style={{ ...styles.toolBtn, padding: '4px 6px' }} 
                  type="button"
                >
                  {t.label}
                </button>
              ))}
              <button 
                onClick={() => onConfigChange({ 
                  ...config, 
                  labels: { ...cfg?.labels, tickLabels: { ...cfg?.labels?.tickLabels, type: cfg?.labels?.tickLabels?.type === 'outer' ? 'inner' : 'outer' } } 
                })} 
                style={{ ...styles.toolBtn, padding: '4px 6px' }} 
                type="button"
              >
                {cfg?.labels?.tickLabels?.type === 'inner' ? '↙' : '↗'}
              </button>
            </div>
          </div>
        </Col>

        {/* Size - md-2 */}
        <Col xs={6} md={2}>
          <div style={{ ...styles.toolbarGroup, borderColor: '#95a5a6', height: '100%' }}>
            <span style={styles.groupLabel}>📐 Size</span>
            <div style={styles.buttonRow}>
              <input 
                type="range" 
                min="150" 
                max="600" 
                step="10" 
                value={parseInt(sandboxWidth)} 
                onChange={(e) => onSizeChange(`${e.target.value}px`, sandboxHeight)} 
                style={{ ...styles.slider, width: '40px' }} 
                title={`W: ${parseInt(sandboxWidth)}px`} 
              />
              <input 
                type="range" 
                min="100" 
                max="400" 
                step="10" 
                value={parseInt(sandboxHeight)} 
                onChange={(e) => onSizeChange(sandboxWidth, `${e.target.value}px`)} 
                style={{ ...styles.slider, width: '40px' }} 
                title={`H: ${parseInt(sandboxHeight)}px`} 
              />
              {[
                { icon: '⬅', v: 'left' as const },
                { icon: '⬛', v: 'center' as const },
              ].map((a) => (
                <button 
                  key={a.v} 
                  onClick={() => onAlignChange(a.v)} 
                  style={{ ...styles.toolBtn, padding: '3px 5px', ...(gaugeAlign === a.v ? styles.toolBtnActive : {}) }} 
                  type="button"
                >
                  {a.icon}
                </button>
              ))}
            </div>
          </div>
        </Col>

        {/* Value - md-12 */}
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
                onChange={(e) => onValueChange(Number(e.target.value))} 
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

// Mini SVG gauge icons for type selector
const GaugeTypeIcon: React.FC<{ type: 'semicircle' | 'radial' | 'grafana'; isActive: boolean }> = ({ type, isActive }) => {
  const strokeColor = isActive ? '#1a1a2e' : '#fff';
  
  if (type === 'semicircle') {
    return (
      <svg width="40" height="22" viewBox="0 0 32 18">
        <path d="M 2 16 A 14 14 0 0 1 30 16" fill="none" stroke="#5BE12C" strokeWidth="3" strokeLinecap="round" />
        <path d="M 2 16 A 14 14 0 0 1 16 2" fill="none" stroke="#F5CD19" strokeWidth="3" strokeLinecap="round" />
        <line x1="16" y1="16" x2="10" y2="6" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />
        <circle cx="16" cy="16" r="2" fill={strokeColor} />
      </svg>
    );
  }
  
  if (type === 'radial') {
    return (
      <svg width="40" height="28" viewBox="0 0 32 24">
        <path d="M 4 20 A 13 13 0 1 1 28 20" fill="none" stroke="#5BE12C" strokeWidth="3" strokeLinecap="round" />
        <path d="M 4 20 A 13 13 0 0 1 16 4" fill="none" stroke="#F5CD19" strokeWidth="3" strokeLinecap="round" />
        <line x1="16" y1="17" x2="10" y2="9" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />
        <circle cx="16" cy="17" r="2" fill={strokeColor} />
      </svg>
    );
  }
  
  return (
    <svg width="40" height="28" viewBox="0 0 32 24">
      <path d="M 4 20 A 13 13 0 0 1 10 6" fill="none" stroke="#5BE12C" strokeWidth="4" strokeLinecap="round" />
      <path d="M 11 5 A 13 13 0 0 1 21 5" fill="none" stroke="#F5CD19" strokeWidth="4" strokeLinecap="round" />
      <path d="M 22 6 A 13 13 0 0 1 28 20" fill="none" stroke="#EA4228" strokeWidth="4" strokeLinecap="round" />
      <path d="M 3 21 A 14 14 0 1 1 29 21" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
      <line x1="16" y1="17" x2="10" y2="9" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />
      <circle cx="16" cy="17" r="2" fill={strokeColor} />
    </svg>
  );
};
