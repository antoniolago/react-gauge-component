import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import GaugeComponent from '../../../lib';
import { styles } from '../styles';
import { COLOR_PRESETS } from '../presets';
import { GaugeComponentProps } from '../../../lib/GaugeComponent/types/GaugeComponentProps';
import { 
  Palette, Layers, Target, Tag, Ruler, Move, Sliders,
  Circle, Triangle, ArrowRight, EyeOff,
  Eye, Rainbow, Minus, AlignLeft, AlignCenter, AlignRight,
  Play, Hand, Hash, ArrowUpRight, ArrowDownLeft, ChevronDown
} from 'lucide-react';

// Collapsible wrapper for mobile
const CollapsibleGroup: React.FC<{
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isMobile: boolean;
  defaultOpen?: boolean;
}> = ({ title, icon, children, isMobile, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(!isMobile || defaultOpen);
  
  useEffect(() => {
    if (!isMobile) setIsOpen(true);
  }, [isMobile]);

  return (
    <div style={{ ...styles.toolbarGroup, height: isMobile ? 'auto' : '100%' }}>
      <div 
        onClick={() => isMobile && setIsOpen(!isOpen)}
        style={{
          ...styles.groupLabel,
          cursor: isMobile ? 'pointer' : 'default',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: isOpen ? '8px' : '0',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>{icon} {title}</span>
        {isMobile && <ChevronDown size={14} style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />}
      </div>
      {isOpen && children}
    </div>
  );
};

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
  interactionEnabled,
  onInteractionChange,
}) => {
  const cfg = config as any;
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Container fluid style={styles.editorToolbar} className="p-0">
      <Row className="g-0">
        {/* Type */}
        <Col xs={12} md={4}>
          <CollapsibleGroup title="Type" icon={<Palette size={14} />} isMobile={isMobile} defaultOpen={true}>
            <div style={{ display: 'flex', justifyContent: 'stretch', gap: '8px', width: '100%' }}>
              {(['semicircle', 'radial', 'grafana'] as const).map((gaugeType) => (
                <button 
                  key={gaugeType}
                  onClick={() => onConfigChange({ ...config, type: gaugeType })} 
                  style={{ 
                    flex: 1,
                    background: cfg?.type === gaugeType ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    border: cfg?.type === gaugeType ? '2px solid #3b82f6' : '2px solid transparent',
                    borderRadius: '8px',
                    padding: '8px 6px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    transition: 'all 0.15s ease',
                    minWidth: 0,
                  }} 
                  title={gaugeType.charAt(0).toUpperCase() + gaugeType.slice(1)} 
                  type="button"
                >
                  <div style={{ width: '100%', height: '60px', pointerEvents: 'none' }}>
                    <GaugeComponent 
                      {...TYPE_GAUGE_CONFIGS[gaugeType]} 
                      value={50} 
                    />
                  </div>
                  <span style={{ 
                    fontSize: '0.7rem', 
                    fontWeight: cfg?.type === gaugeType ? 600 : 400,
                    color: cfg?.type === gaugeType ? '#60a5fa' : 'rgba(255,255,255,0.6)',
                    marginTop: '4px',
                  }}>
                    {gaugeType.charAt(0).toUpperCase() + gaugeType.slice(1)}
                  </span>
                </button>
              ))}
            </div>
          </CollapsibleGroup>
        </Col>
        <Col xs={12} md={4}>
          <CollapsibleGroup title="Arc & Colors" icon={<Layers size={14} />} isMobile={isMobile}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
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
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                Number of arcs: 
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
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flexWrap: 'wrap' }}>
                Colors: 
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
                  style={{ ...styles.toolBtn, width: '24px', height: '24px', padding: 0, fontSize: '16px', lineHeight: '22px' }}
                  title="Add color"
                  type="button"
                >
                  +
                </button>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
                <span style={{ ...styles.sliderLabel, minWidth: '50px' }}>Width</span>
                <input type="range" min="0.01" max="1" step="0.01" value={cfg?.arc?.width ?? 0.2} 
                  onChange={(e) => onConfigChange({ ...config, arc: { ...cfg?.arc, width: Number(e.target.value) } })} 
                  style={{ ...styles.slider, flex: 1 }} title="Arc width" />
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
                <span style={{ ...styles.sliderLabel, minWidth: '50px' }}>Corner</span>
                <input type="range" min="0" max="50" step="1" value={cfg?.arc?.cornerRadius ?? 7} 
                  onChange={(e) => onConfigChange({ ...config, arc: { ...cfg?.arc, cornerRadius: Number(e.target.value) } })} 
                  style={{ ...styles.slider, flex: 1 }} title="Corner radius" />
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
                <span style={{ ...styles.sliderLabel, minWidth: '50px' }}>Pad</span>
                <input type="range" min="0" max="0.5" step="0.005" value={cfg?.arc?.padding ?? 0.05} 
                  onChange={(e) => onConfigChange({ ...config, arc: { ...cfg?.arc, padding: Number(e.target.value) } })} 
                  style={{ ...styles.slider, flex: 1 }} title="Padding" />
              </div>
            </div>
          </CollapsibleGroup>
        </Col>

        <Col xs={12} md={4}>
          <CollapsibleGroup title="Pointer" icon={<Target size={14} />} isMobile={isMobile}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '3px', alignItems: 'center', flexWrap: 'wrap' }}>
                <span>Type:</span>
                <button onClick={() => onConfigChange({ ...config, pointer: { ...cfg?.pointer, type: 'needle', hide: false } })} 
                  style={{ ...styles.toolBtn, padding: '6px 10px', ...(cfg?.pointer?.type === 'needle' && !cfg?.pointer?.hide ? styles.toolBtnActive : {}) }} 
                  title="Needle" type="button">
                  <Triangle size={14} style={{ transform: 'rotate(180deg)' }} /><span>Needle</span>
                </button>
                <button onClick={() => onConfigChange({ ...config, pointer: { ...cfg?.pointer, type: 'blob', hide: false } })} 
                  style={{ ...styles.toolBtn, padding: '6px 10px', ...(cfg?.pointer?.type === 'blob' && !cfg?.pointer?.hide ? styles.toolBtnActive : {}) }} 
                  title="Blob" type="button">
                  <Circle size={14} /><span>Blob</span>
                </button>
                <button onClick={() => onConfigChange({ ...config, pointer: { ...cfg?.pointer, type: 'arrow', hide: false } })} 
                  style={{ ...styles.toolBtn, padding: '6px 10px', ...(cfg?.pointer?.type === 'arrow' && !cfg?.pointer?.hide ? styles.toolBtnActive : {}) }} 
                  title="Arrow" type="button">
                  <ArrowRight size={14} /><span>Arrow</span>
                </button>
                <button onClick={() => onConfigChange({ ...config, pointer: { ...cfg?.pointer, hide: true } })} 
                  style={{ ...styles.toolBtn, padding: '6px 10px', ...(cfg?.pointer?.hide ? styles.toolBtnActive : {}) }} 
                  title="Hide" type="button">
                  <EyeOff size={14} /><span>Hide</span>
                </button>
              </div>
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flexWrap: 'wrap' }}>
                <span>Movement:</span>
                <button onClick={() => onInteractionChange(!interactionEnabled)} 
                  style={{ ...styles.toolBtn, padding: '6px 10px', ...(interactionEnabled ? styles.toolBtnActive : {}) }} 
                  title="Drag" type="button">
                  <Hand size={14} /><span>Drag pointer</span>
                </button>
                <button onClick={() => onConfigChange({ ...config, pointer: { ...cfg?.pointer, elastic: !cfg?.pointer?.elastic } })} 
                  style={{ ...styles.toolBtn, padding: '6px 10px', ...(cfg?.pointer?.elastic ? styles.toolBtnActive : {}) }} 
                  title="Elastic" type="button">
                  <Move size={14} /><span>Elastic</span>
                </button>
                <button onClick={() => onConfigChange({ ...config, pointer: { ...cfg?.pointer, animationDelay: cfg?.pointer?.animationDelay === 0 ? 200 : 0 } })} 
                  style={{ ...styles.toolBtn, padding: '6px 10px', ...(cfg?.pointer?.animationDelay === 0 ? styles.toolBtnActive : {}) }} 
                  title="Instant" type="button">
                  <Play size={14} /><span>Instant</span>
                </button>
              </div>
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flexWrap: 'wrap' }}>
                <span>Colors:</span>
                <button onClick={() => onConfigChange({ ...config, pointer: { ...cfg?.pointer, color: cfg?.pointer?.color ? undefined : '#464A4F' } })} 
                  style={{ ...styles.toolBtn, padding: '6px 10px', ...(!cfg?.pointer?.color ? styles.toolBtnActive : {}) }} 
                  title="Arc color" type="button">
                  <Rainbow size={14} /><span>Arc</span>
                </button>
                {cfg?.pointer?.color && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={styles.sliderLabel}>Color</span>
                    <input type="color" value={cfg?.pointer?.color || '#464A4F'} 
                      onChange={(e) => onConfigChange({ ...config, pointer: { ...cfg?.pointer, color: e.target.value } })} 
                      style={styles.colorPicker} />
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={styles.sliderLabel}>Base</span>
                  <input type="color" value={cfg?.pointer?.baseColor || '#ffffff'} 
                    onChange={(e) => onConfigChange({ ...config, pointer: { ...cfg?.pointer, baseColor: e.target.value } })} 
                    style={styles.colorPicker} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
                <span style={{ ...styles.sliderLabel, minWidth: '50px' }}>Border</span>
                <input type="range" min="0" max="5" step="0.5" value={cfg?.pointer?.strokeWidth ?? 0} 
                  onChange={(e) => onConfigChange({ ...config, pointer: { ...cfg?.pointer, strokeWidth: Number(e.target.value) } })} 
                  style={{ ...styles.slider, flex: 1 }} />
                {(cfg?.pointer?.strokeWidth ?? 0) > 0 && (
                  <input type="color" value={cfg?.pointer?.strokeColor || '#ffffff'} 
                    onChange={(e) => onConfigChange({ ...config, pointer: { ...cfg?.pointer, strokeColor: e.target.value } })} 
                    style={styles.colorPicker} />
                )}
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
                <span style={{ ...styles.sliderLabel, minWidth: '50px' }}>Length</span>
                <input type="range" min="0.1" max="2" step="0.05" value={cfg?.pointer?.length ?? 0.8} 
                  onChange={(e) => onConfigChange({ ...config, pointer: { ...cfg?.pointer, length: Number(e.target.value) } })} 
                  style={{ ...styles.slider, flex: 1 }} />
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
                <span style={{ ...styles.sliderLabel, minWidth: '50px' }}>Width</span>
                <input type="range" min="1" max="60" step="1" value={cfg?.pointer?.width ?? 15} 
                  onChange={(e) => onConfigChange({ ...config, pointer: { ...cfg?.pointer, width: Number(e.target.value) } })} 
                  style={{ ...styles.slider, flex: 1 }} />
              </div>
              {cfg?.pointer?.type === 'arrow' && (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
                  <span style={{ ...styles.sliderLabel, minWidth: '50px' }}>Offset</span>
                  <input type="range" min="0" max="1.5" step="0.02" value={cfg?.pointer?.arrowOffset ?? 0.72} 
                    onChange={(e) => onConfigChange({ ...config, pointer: { ...cfg?.pointer, arrowOffset: Number(e.target.value) } })} 
                    style={{ ...styles.slider, flex: 1 }} />
                </div>
              )}
              {cfg?.pointer?.type === 'blob' && (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
                  <span style={{ ...styles.sliderLabel, minWidth: '50px' }}>Offset</span>
                  <input type="range" min="-0.5" max="1.5" step="0.02" value={cfg?.pointer?.blobOffset ?? 0.5} 
                    onChange={(e) => onConfigChange({ ...config, pointer: { ...cfg?.pointer, blobOffset: Number(e.target.value) } })} 
                    style={{ ...styles.slider, flex: 1 }} />
                </div>
              )}
            </div>
          </CollapsibleGroup>
        </Col>
        <Col xs={12} md={4}>
          <CollapsibleGroup title="Label" icon={<Tag size={14} />} isMobile={isMobile}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flexWrap: 'wrap' }}>
                <button onClick={() => onConfigChange({ ...config, labels: { ...cfg?.labels, valueLabel: { ...cfg?.labels?.valueLabel, hide: !cfg?.labels?.valueLabel?.hide } } })} 
                  style={{ ...styles.toolBtn, padding: '6px 10px', ...(!cfg?.labels?.valueLabel?.hide ? styles.toolBtnActive : {}) }} type="button">
                  {cfg?.labels?.valueLabel?.hide ? <EyeOff size={14} /> : <Eye size={14} />}<span>Show</span>
                </button>
                <button onClick={() => onConfigChange({ ...config, labels: { ...cfg?.labels, valueLabel: { ...cfg?.labels?.valueLabel, matchColorWithArc: !cfg?.labels?.valueLabel?.matchColorWithArc } } })} 
                  style={{ ...styles.toolBtn, padding: '6px 10px', ...(cfg?.labels?.valueLabel?.matchColorWithArc ? styles.toolBtnActive : {}) }} type="button">
                  <Rainbow size={14} /><span>Arc</span>
                </button>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
                <span style={{ ...styles.sliderLabel, minWidth: '50px' }}>Size</span>
                <input type="range" min="12" max="72" step="1" value={parseInt(cfg?.labels?.valueLabel?.style?.fontSize || '35')} 
                  onChange={(e) => onConfigChange({ ...config, labels: { ...cfg?.labels, valueLabel: { ...cfg?.labels?.valueLabel, hide: false, style: { ...cfg?.labels?.valueLabel?.style, fontSize: `${e.target.value}px` } } } })} 
                  style={{ ...styles.slider, flex: 1 }} />
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
                <span style={{ ...styles.sliderLabel, minWidth: '50px' }}>X Offset</span>
                <input type="range" min="-50" max="50" step="1" value={cfg?.labels?.valueLabel?.offsetX ?? 0} 
                  onChange={(e) => onConfigChange({ ...config, labels: { ...cfg?.labels, valueLabel: { ...cfg?.labels?.valueLabel, offsetX: Number(e.target.value) } } })} 
                  style={{ ...styles.slider, flex: 1 }} />
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
                <span style={{ ...styles.sliderLabel, minWidth: '50px' }}>Y Offset</span>
                <input type="range" min="-100" max="50" step="1" value={cfg?.labels?.valueLabel?.offsetY ?? 0} 
                  onChange={(e) => onConfigChange({ ...config, labels: { ...cfg?.labels, valueLabel: { ...cfg?.labels?.valueLabel, offsetY: Number(e.target.value) } } })} 
                  style={{ ...styles.slider, flex: 1 }} />
              </div>
            </div>
          </CollapsibleGroup>
        </Col>

        {/* Tick Marks */}
        <Col xs={12} md={4}>
          <CollapsibleGroup title="Tick Marks" icon={<Ruler size={14} />} isMobile={isMobile}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '3px', alignItems: 'center', flexWrap: 'wrap' }}>
                {[
                  { label: 'None', interval: 0 }, 
                  { label: '5', interval: 5 }, 
                  { label: '10', interval: 10 }, 
                  { label: '25', interval: 25 },
                  { label: '100', interval: 100 },
                  { label: '250', interval: 250 },
                  { label: '500', interval: 500 },
                  { label: '1k', interval: 1000 },
                  { label: '2.5k', interval: 2500 },
                  { label: '5k', interval: 5000 },
                  { label: '10k', interval: 10000 },
                ].map((t) => (
                  <button key={t.label} onClick={() => {
                    const min = cfg?.minValue ?? 0; const max = cfg?.maxValue ?? 100;
                    const ticks = t.interval === 0 ? [] : Array.from({ length: Math.floor((max - min) / t.interval) + 1 }, (_, i) => ({ value: min + i * t.interval }));
                    onConfigChange({ ...config, labels: { ...cfg?.labels, tickLabels: { ...cfg?.labels?.tickLabels, type: cfg?.labels?.tickLabels?.type || 'outer', ticks, hideMinMax: t.interval === 0 } } });
                  }} style={{ ...styles.toolBtn, padding: '4px 8px' }} type="button">{t.label}</button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '3px', alignItems: 'center', flexWrap: 'wrap' }}>
                <button onClick={() => onConfigChange({ ...config, labels: { ...cfg?.labels, tickLabels: { ...cfg?.labels?.tickLabels, type: 'outer' } } })} 
                  style={{ ...styles.toolBtn, padding: '4px 8px', ...(cfg?.labels?.tickLabels?.type === 'outer' || !cfg?.labels?.tickLabels?.type ? styles.toolBtnActive : {}) }} type="button">
                  <ArrowUpRight size={12} /><span>Out</span>
                </button>
                <button onClick={() => onConfigChange({ ...config, labels: { ...cfg?.labels, tickLabels: { ...cfg?.labels?.tickLabels, type: 'inner' } } })} 
                  style={{ ...styles.toolBtn, padding: '4px 8px', ...(cfg?.labels?.tickLabels?.type === 'inner' ? styles.toolBtnActive : {}) }} type="button">
                  <ArrowDownLeft size={12} /><span>In</span>
                </button>
                <button onClick={() => onConfigChange({ ...config, labels: { ...cfg?.labels, tickLabels: { ...cfg?.labels?.tickLabels, hideMinMax: !cfg?.labels?.tickLabels?.hideMinMax } } })} 
                  style={{ ...styles.toolBtn, padding: '4px 8px', ...(cfg?.labels?.tickLabels?.hideMinMax ? {} : styles.toolBtnActive) }} type="button">
                  <Hash size={12} />
                </button>
                <button onClick={() => onConfigChange({ ...config, labels: { ...cfg?.labels, tickLabels: { ...cfg?.labels?.tickLabels, defaultTickLineConfig: { ...cfg?.labels?.tickLabels?.defaultTickLineConfig, hide: !cfg?.labels?.tickLabels?.defaultTickLineConfig?.hide } } } })} 
                  style={{ ...styles.toolBtn, padding: '4px 8px', ...(cfg?.labels?.tickLabels?.defaultTickLineConfig?.hide ? {} : styles.toolBtnActive) }} type="button">
                  <Minus size={12} /><span>Lines</span>
                </button>
                <button onClick={() => onConfigChange({ ...config, labels: { ...cfg?.labels, tickLabels: { ...cfg?.labels?.tickLabels, defaultTickValueConfig: { ...cfg?.labels?.tickLabels?.defaultTickValueConfig, hide: !cfg?.labels?.tickLabels?.defaultTickValueConfig?.hide } } } })} 
                  style={{ ...styles.toolBtn, padding: '4px 8px', ...(cfg?.labels?.tickLabels?.defaultTickValueConfig?.hide ? {} : styles.toolBtnActive) }} type="button">
                  <Hash size={12} /><span>Labels</span>
                </button>
              </div>
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={styles.sliderLabel}>Line</span>
                <input type="color" value={cfg?.labels?.tickLabels?.defaultTickLineConfig?.color || '#ada9ab'} 
                  onChange={(e) => onConfigChange({ ...config, labels: { ...cfg?.labels, tickLabels: { ...cfg?.labels?.tickLabels, defaultTickLineConfig: { ...cfg?.labels?.tickLabels?.defaultTickLineConfig, color: e.target.value } } } })} 
                  style={styles.colorPicker} />
                <span style={styles.sliderLabel}>Text</span>
                <input type="color" value={cfg?.labels?.tickLabels?.defaultTickValueConfig?.style?.fill as string || '#ada9ab'} 
                  onChange={(e) => onConfigChange({ ...config, labels: { ...cfg?.labels, tickLabels: { ...cfg?.labels?.tickLabels, defaultTickValueConfig: { ...cfg?.labels?.tickLabels?.defaultTickValueConfig, style: { ...cfg?.labels?.tickLabels?.defaultTickValueConfig?.style, fill: e.target.value } } } } })} 
                  style={styles.colorPicker} />
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
                <span style={{ ...styles.sliderLabel, minWidth: '50px' }}>Line W</span>
                <input type="range" min="1" max="5" step="1" value={cfg?.labels?.tickLabels?.defaultTickLineConfig?.width ?? 1} 
                  onChange={(e) => onConfigChange({ ...config, labels: { ...cfg?.labels, tickLabels: { ...cfg?.labels?.tickLabels, defaultTickLineConfig: { ...cfg?.labels?.tickLabels?.defaultTickLineConfig, width: Number(e.target.value) } } } })} 
                  style={{ ...styles.slider, flex: 1 }} />
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
                <span style={{ ...styles.sliderLabel, minWidth: '50px' }}>Line L</span>
                <input type="range" min="3" max="20" step="1" value={cfg?.labels?.tickLabels?.defaultTickLineConfig?.length ?? 7} 
                  onChange={(e) => onConfigChange({ ...config, labels: { ...cfg?.labels, tickLabels: { ...cfg?.labels?.tickLabels, defaultTickLineConfig: { ...cfg?.labels?.tickLabels?.defaultTickLineConfig, length: Number(e.target.value) } } } })} 
                  style={{ ...styles.slider, flex: 1 }} />
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
                <span style={{ ...styles.sliderLabel, minWidth: '50px' }}>Text Size</span>
                <input type="range" min="8" max="20" step="1" value={parseInt(cfg?.labels?.tickLabels?.defaultTickValueConfig?.style?.fontSize as string || '12')} 
                  onChange={(e) => onConfigChange({ ...config, labels: { ...cfg?.labels, tickLabels: { ...cfg?.labels?.tickLabels, defaultTickValueConfig: { ...cfg?.labels?.tickLabels?.defaultTickValueConfig, style: { ...cfg?.labels?.tickLabels?.defaultTickValueConfig?.style, fontSize: `${e.target.value}px` } } } } })} 
                  style={{ ...styles.slider, flex: 1 }} />
              </div>
            </div>
          </CollapsibleGroup>
        </Col>

        <Col xs={12} md={4}>
          <CollapsibleGroup title="Size & Align" icon={<Move size={14} />} isMobile={isMobile}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
                <span style={{ ...styles.sliderLabel, minWidth: '50px' }}>Width</span>
                <input type="range" min="150" max="600" step="10" value={parseInt(sandboxWidth)} 
                  onChange={(e) => onSizeChange(`${e.target.value}px`, sandboxHeight)} 
                  style={{ ...styles.slider, flex: 1 }} />
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
                <span style={{ ...styles.sliderLabel, minWidth: '50px' }}>Height</span>
                <input type="range" min="100" max="400" step="10" value={parseInt(sandboxHeight)} 
                  onChange={(e) => onSizeChange(sandboxWidth, `${e.target.value}px`)} 
                  style={{ ...styles.slider, flex: 1 }} />
              </div>
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <button onClick={() => onAlignChange('left')} 
                  style={{ ...styles.toolBtn, padding: '6px 10px', flex: 1, ...(gaugeAlign === 'left' ? styles.toolBtnActive : {}) }} type="button">
                  <AlignLeft size={14} />
                </button>
                <button onClick={() => onAlignChange('center')} 
                  style={{ ...styles.toolBtn, padding: '6px 10px', flex: 1, ...(gaugeAlign === 'center' ? styles.toolBtnActive : {}) }} type="button">
                  <AlignCenter size={14} />
                </button>
                <button onClick={() => onAlignChange('right')} 
                  style={{ ...styles.toolBtn, padding: '6px 10px', flex: 1, ...(gaugeAlign === 'right' ? styles.toolBtnActive : {}) }} type="button">
                  <AlignRight size={14} />
                </button>
              </div>
            </div>
          </CollapsibleGroup>
        </Col>
        <Col xs={12}>
          <CollapsibleGroup title="Value" icon={<Sliders size={14} />} isMobile={isMobile} defaultOpen={true}>
            <div style={styles.buttonRow}>
              <label style={styles.inlineLabel}>
                <input type="checkbox" checked={autoAnimate} onChange={(e) => onAutoAnimateChange(e.target.checked)} style={styles.inlineCheckbox} />
                Auto
              </label>
              {[0, 25, 50, 75, 100].map((val) => {
                const min = cfg?.minValue ?? 0; const max = cfg?.maxValue ?? 100;
                const actualValue = min + (val / 100) * (max - min);
                return (
                  <button key={val} onClick={() => onValueChange(actualValue)} 
                    style={{ ...styles.toolBtn, ...(Math.abs(value - actualValue) < 0.01 ? styles.toolBtnActive : {}) }} type="button">
                    {val}
                  </button>
                );
              })}
              <input type="range" min={cfg?.minValue ?? 0} max={cfg?.maxValue ?? 100} value={value} 
                onChange={(e) => { onValueChange(Number(e.target.value)); if (autoAnimate) onAutoAnimateChange(false); }} 
                style={{ ...styles.slider, flex: 1, minWidth: '150px' }} step="0.1" />
              <span style={{ ...styles.sliderValue, fontWeight: 700, color: '#60a5fa' }}>{value.toFixed(1)}</span>
            </div>
          </CollapsibleGroup>
        </Col>
      </Row>
    </Container>
  );
};
