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
  Play, Hand, Hash, ArrowUpRight, ArrowDownLeft, ChevronDown,
  Timer, Settings2, Sparkles, Plus, Trash2, Users
} from 'lucide-react';
import { PointerWithValue } from '../../../lib/GaugeComponent/types/Pointer';

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

// Collapsible accordion for individual pointer configuration
const PointerAccordion: React.FC<{
  pointer: PointerWithValue;
  index: number;
  minValue: number;
  maxValue: number;
  onUpdate: (pointer: PointerWithValue) => void;
  onRemove: () => void;
  isOnlyPointer?: boolean;
}> = ({ pointer, index, minValue, maxValue, onUpdate, onRemove, isOnlyPointer }) => {
  const [isOpen, setIsOpen] = useState(index === 0); // First pointer open by default
  const pointerType = pointer.type || 'needle';
  
  return (
    <div style={{ 
      border: '1px solid rgba(255,255,255,0.15)', 
      borderRadius: '6px', 
      overflow: 'hidden',
      background: 'rgba(0,0,0,0.2)'
    }}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 10px',
          cursor: 'pointer',
          background: isOpen ? 'rgba(255,255,255,0.05)' : 'transparent',
        }}
      >
        <span style={{ 
          width: '12px', 
          height: '12px', 
          borderRadius: '2px', 
          background: pointer.color || '#888',
          border: '1px solid rgba(255,255,255,0.3)'
        }} />
        <span style={{ flex: 1, fontSize: '0.8rem', fontWeight: 500 }}>
          {pointer.label || `Pointer ${index + 1}`}
        </span>
        <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>{pointer.value.toFixed(1)}</span>
        <ChevronDown size={12} style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
      </div>
      
      {isOpen && (
        <div style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          {/* Label */}
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.7rem', opacity: 0.7, minWidth: '40px' }}>Label</span>
            <input 
              type="text" 
              value={pointer.label || ''} 
              onChange={(e) => onUpdate({ ...pointer, label: e.target.value })}
              placeholder={`Pointer ${index + 1}`}
              style={{ ...styles.toolBtn, flex: 1, padding: '4px 8px', fontSize: '0.75rem', border: '1px solid rgba(255,255,255,0.2)' }}
            />
          </div>
          {/* Value */}
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.7rem', opacity: 0.7, minWidth: '40px' }}>Value</span>
            <input 
              type="range" 
              min={minValue} 
              max={maxValue} 
              step="0.1"
              value={pointer.value} 
              onChange={(e) => onUpdate({ ...pointer, value: Number(e.target.value) })}
              style={{ ...styles.slider, flex: 1 }}
            />
            <span style={{ fontSize: '0.7rem', opacity: 0.6, minWidth: '35px' }}>{pointer.value.toFixed(1)}</span>
          </div>
          {/* Type */}
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.7rem', opacity: 0.7, minWidth: '40px' }}>Type</span>
            <div style={{ display: 'flex', gap: '3px' }}>
              {[
                { type: 'needle', icon: <Minus size={12} style={{ transform: 'rotate(-45deg)' }} /> },
                { type: 'arrow', icon: <Triangle size={12} /> },
                { type: 'blob', icon: <Circle size={12} /> },
              ].map(({ type, icon }) => (
                <button 
                  key={type}
                  onClick={() => onUpdate({ ...pointer, type: type as 'needle' | 'arrow' | 'blob' })}
                  style={{ ...styles.toolBtn, padding: '4px 8px', ...(pointerType === type ? styles.toolBtnActive : {}) }}
                  type="button"
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
          {/* Color */}
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.7rem', opacity: 0.7, minWidth: '40px' }}>Color</span>
            <input 
              type="color" 
              value={pointer.color || '#888888'} 
              onChange={(e) => onUpdate({ ...pointer, color: e.target.value })}
              style={styles.colorPicker}
            />
            <button
              onClick={() => onUpdate({ ...pointer, color: undefined })}
              style={{ ...styles.toolBtn, padding: '3px 8px', fontSize: '0.65rem', ...(!pointer.color ? styles.toolBtnActive : {}) }}
              type="button"
              title="Use arc color"
            >
              <Rainbow size={10} /> Arc
            </button>
            {pointerType === 'needle' && (
              <>
                <span style={{ fontSize: '0.65rem', opacity: 0.5 }}>Base</span>
                <input 
                  type="color" 
                  value={pointer.baseColor || '#ffffff'} 
                  onChange={(e) => onUpdate({ ...pointer, baseColor: e.target.value })}
                  style={styles.colorPicker}
                />
              </>
            )}
          </div>
          {/* Length (for needle) */}
          {pointerType === 'needle' && (
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <span style={{ fontSize: '0.7rem', opacity: 0.7, minWidth: '40px' }}>Length</span>
              <input 
                type="range" min="0.3" max="1.5" step="0.05"
                value={pointer.length ?? 0.7} 
                onChange={(e) => onUpdate({ ...pointer, length: Number(e.target.value) })}
                style={{ ...styles.slider, flex: 1 }}
              />
              <span style={{ fontSize: '0.65rem', opacity: 0.5, minWidth: '25px' }}>{(pointer.length ?? 0.7).toFixed(2)}</span>
            </div>
          )}
          {/* Width */}
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.7rem', opacity: 0.7, minWidth: '40px' }}>Width</span>
            <input 
              type="range" min="5" max="50" step="1"
              value={pointer.width ?? 20} 
              onChange={(e) => onUpdate({ ...pointer, width: Number(e.target.value) })}
              style={{ ...styles.slider, flex: 1 }}
            />
            <span style={{ fontSize: '0.65rem', opacity: 0.5, minWidth: '25px' }}>{pointer.width ?? 20}</span>
          </div>
          {/* Offset (for arrow/blob) */}
          {(pointerType === 'arrow' || pointerType === 'blob') && (
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <span style={{ fontSize: '0.7rem', opacity: 0.7, minWidth: '40px' }}>Offset</span>
              <input 
                type="range" min="0" max="1.2" step="0.05"
                value={pointerType === 'arrow' ? (pointer.arrowOffset ?? 0.72) : (pointer.blobOffset ?? 0.5)} 
                onChange={(e) => onUpdate({ 
                  ...pointer, 
                  ...(pointerType === 'arrow' ? { arrowOffset: Number(e.target.value) } : { blobOffset: Number(e.target.value) })
                })}
                style={{ ...styles.slider, flex: 1 }}
              />
              <span style={{ fontSize: '0.65rem', opacity: 0.5, minWidth: '25px' }}>
                {(pointerType === 'arrow' ? (pointer.arrowOffset ?? 0.72) : (pointer.blobOffset ?? 0.5)).toFixed(2)}
              </span>
            </div>
          )}
          {/* Border */}
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.7rem', opacity: 0.7, minWidth: '40px' }}>Border</span>
            <input 
              type="range" min="0" max="4" step="0.5"
              value={pointer.strokeWidth ?? 0} 
              onChange={(e) => onUpdate({ ...pointer, strokeWidth: Number(e.target.value) })}
              style={{ ...styles.slider, flex: 1 }}
            />
            {(pointer.strokeWidth ?? 0) > 0 && (
              <input 
                type="color" 
                value={pointer.strokeColor || '#ffffff'} 
                onChange={(e) => onUpdate({ ...pointer, strokeColor: e.target.value })}
                style={styles.colorPicker}
              />
            )}
          </div>
          {/* Remove button - only show if not the only pointer */}
          {!isOnlyPointer && (
            <button
              onClick={onRemove}
              style={{ ...styles.toolBtn, padding: '4px 8px', marginTop: '4px', color: '#ff6b6b', borderColor: 'rgba(255, 107, 107, 0.3)' }}
              type="button"
            >
              <Trash2 size={12} /> Remove
            </button>
          )}
        </div>
      )}
    </div>
  );
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
  onForceRemount?: () => void;
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
  onForceRemount,
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
        <Col xs={12} md={4}>
          <CollapsibleGroup title="Arc & Colors" icon={<Layers size={14} />} isMobile={isMobile}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>Color presets</span>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>Number of arcs</span>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>Colors</span>
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flexWrap: 'wrap' }}> 
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
                  style={{ ...styles.slider, flex: 1 }} title="Padding between arcs" />
                <label style={{ ...styles.inlineLabel, fontSize: '0.65rem' }} title="Add padding to start/end of arc">
                  <input type="checkbox" checked={cfg?.arc?.padEndpoints !== false} 
                    onChange={(e) => onConfigChange({ ...config, arc: { ...cfg?.arc, padEndpoints: e.target.checked } })} 
                    style={styles.inlineCheckbox} />
                  Ends
                </label>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
                <span style={{ ...styles.sliderLabel, minWidth: '50px' }}>Border</span>
                <input type="range" min="0" max="5" step="0.5" value={cfg?.arc?.subArcsStrokeWidth ?? 0} 
                  onChange={(e) => onConfigChange({ ...config, arc: { ...cfg?.arc, subArcsStrokeWidth: Number(e.target.value) } })} 
                  style={{ ...styles.slider, flex: 1 }} title="SubArc border width" />
                {(cfg?.arc?.subArcsStrokeWidth ?? 0) > 0 && (
                  <input type="color" value={cfg?.arc?.subArcsStrokeColor || '#ffffff'} 
                    onChange={(e) => onConfigChange({ ...config, arc: { ...cfg?.arc, subArcsStrokeColor: e.target.value } })} 
                    style={styles.colorPicker} title="SubArc border color" />
                )}
              </div>
              {/* Custom Angle Controls */}
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flexWrap: 'wrap', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '8px', marginTop: '4px' }}>
                <Settings2 size={12} style={{ opacity: 0.6 }} />
                <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>Angles</span>
                <button 
                  onClick={() => onConfigChange({ ...config, startAngle: undefined, endAngle: undefined })} 
                  style={{ ...styles.toolBtn, padding: '2px 6px', marginLeft: 'auto', fontSize: '0.65rem' }} 
                  title="Reset to type defaults"
                  type="button"
                >
                  Reset
                </button>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
                <span style={{ ...styles.sliderLabel, minWidth: '50px' }}>Start</span>
                <input type="range" min="-180" max="180" step="5" 
                  value={cfg?.startAngle ?? (cfg?.type === 'semicircle' ? -90 : cfg?.type === 'radial' ? -130 : -112)} 
                  onChange={(e) => {
                    const start = Number(e.target.value);
                    const currentEnd = cfg?.endAngle ?? (cfg?.type === 'semicircle' ? 90 : cfg?.type === 'radial' ? 130 : 112);
                    onConfigChange({ ...config, startAngle: start, endAngle: currentEnd });
                  }} 
                  style={{ ...styles.slider, flex: 1 }} title="Start angle (degrees)" />
                <span style={{ fontSize: '0.7rem', opacity: 0.6, minWidth: '30px' }}>{cfg?.startAngle ?? (cfg?.type === 'semicircle' ? -90 : cfg?.type === 'radial' ? -130 : -112)}°</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
                <span style={{ ...styles.sliderLabel, minWidth: '50px' }}>End</span>
                <input type="range" min="-180" max="180" step="5" 
                  value={cfg?.endAngle ?? (cfg?.type === 'semicircle' ? 90 : cfg?.type === 'radial' ? 130 : 112)} 
                  onChange={(e) => {
                    const end = Number(e.target.value);
                    const currentStart = cfg?.startAngle ?? (cfg?.type === 'semicircle' ? -90 : cfg?.type === 'radial' ? -130 : -112);
                    onConfigChange({ ...config, startAngle: currentStart, endAngle: end });
                  }} 
                  style={{ ...styles.slider, flex: 1 }} title="End angle (degrees)" />
                <span style={{ fontSize: '0.7rem', opacity: 0.6, minWidth: '30px' }}>{cfg?.endAngle ?? (cfg?.type === 'semicircle' ? 90 : cfg?.type === 'radial' ? 130 : 112)}°</span>
              </div>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                <button onClick={() => onConfigChange({ ...config, startAngle: -90, endAngle: 90 })} 
                  style={{ ...styles.toolBtn, padding: '3px 8px', fontSize: '0.7rem' }} type="button" title="Half circle (top)">
                  Half
                </button>
                <button onClick={() => onConfigChange({ ...config, startAngle: -135, endAngle: 135 })} 
                  style={{ ...styles.toolBtn, padding: '3px 8px', fontSize: '0.7rem' }} type="button" title="Three quarter circle">
                  ¾
                </button>
                <button onClick={() => onConfigChange({ ...config, startAngle: -179, endAngle: 179 })} 
                  style={{ ...styles.toolBtn, padding: '3px 8px', fontSize: '0.7rem' }} type="button" title="Full circle">
                  Full
                </button>
                {/* <button onClick={() => onConfigChange({ ...config, startAngle: 90, endAngle: -90 })} 
                  style={{ ...styles.toolBtn, padding: '3px 8px', fontSize: '0.7rem' }} type="button" title="Half circle (bottom)">
                  Bottom
                </button> */}
              </div>
              {/* Grafana-specific: outer arc & empty color */}
              {cfg?.type === 'grafana' && (
                <>
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flexWrap: 'wrap', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '8px', marginTop: '4px' }}>
                    <Settings2 size={12} style={{ opacity: 0.6 }} />
                    <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>Outer Arc (Grafana)</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
                    <span style={{ ...styles.sliderLabel, minWidth: '50px' }}>Corner</span>
                    <input type="range" min="0" max="2" step="0.1" value={cfg?.arc?.outerArc?.cornerRadius ?? (cfg?.arc?.cornerRadius ? Math.min(cfg.arc.cornerRadius, 2) : 0)} 
                      onChange={(e) => onConfigChange({ ...config, arc: { ...cfg?.arc, outerArc: { ...cfg?.arc?.outerArc, cornerRadius: Number(e.target.value) } } })} 
                      style={{ ...styles.slider, flex: 1 }} title="Outer arc corner radius" />
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
                    <span style={{ ...styles.sliderLabel, minWidth: '50px' }}>Pad</span>
                    <input type="range" min="0" max="0.5" step="0.005" value={cfg?.arc?.outerArc?.padding ?? 0} 
                      onChange={(e) => onConfigChange({ ...config, arc: { ...cfg?.arc, outerArc: { ...cfg?.arc?.outerArc, padding: Number(e.target.value) } } })} 
                      style={{ ...styles.slider, flex: 1 }} title="Outer arc padding" />
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
                    <span style={{ ...styles.sliderLabel, minWidth: '50px' }}>Width</span>
                    <input type="range" min="0" max="30" step="1" value={cfg?.arc?.outerArc?.width ?? 5} 
                      onChange={(e) => onConfigChange({ ...config, arc: { ...cfg?.arc, outerArc: { ...cfg?.arc?.outerArc, width: Number(e.target.value) } } })} 
                      style={{ ...styles.slider, flex: 1 }} title="Outer arc width" />
                  </div>
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={styles.sliderLabel}>Empty color</span>
                    <input type="color" value={cfg?.arc?.emptyColor || '#5C5C5C'} 
                      onChange={(e) => onConfigChange({ ...config, arc: { ...cfg?.arc, emptyColor: e.target.value } })} 
                      style={styles.colorPicker} title="Empty arc color" />
                  </div>
                </>
              )}
              
              {/* Arc Effects */}
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flexWrap: 'wrap', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '8px', marginTop: '4px' }}>
                <Sparkles size={12} style={{ opacity: 0.6 }} />
                <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>Effects</span>
              </div>
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flexWrap: 'wrap' }}>
                <label style={styles.inlineLabel} title="Add glow effect to arcs">
                  <input type="checkbox" checked={cfg?.arc?.effects?.glow || false} 
                    onChange={(e) => onConfigChange({ ...config, arc: { ...cfg?.arc, effects: { ...cfg?.arc?.effects, glow: e.target.checked } } })} 
                    style={styles.inlineCheckbox} />
                  Glow
                </label>
                <label style={styles.inlineLabel} title="Add drop shadow to arcs">
                  <input type="checkbox" checked={!!cfg?.arc?.effects?.dropShadow} 
                    onChange={(e) => onConfigChange({ ...config, arc: { ...cfg?.arc, effects: { ...cfg?.arc?.effects, dropShadow: e.target.checked ? { dy: 2, blur: 3, opacity: 0.3 } : undefined } } })} 
                    style={styles.inlineCheckbox} />
                  Shadow
                </label>
                <label style={styles.inlineLabel} title="Add inner shadow for 3D look">
                  <input type="checkbox" checked={cfg?.arc?.effects?.innerShadow || false} 
                    onChange={(e) => onConfigChange({ ...config, arc: { ...cfg?.arc, effects: { ...cfg?.arc?.effects, innerShadow: e.target.checked } } })} 
                    style={styles.inlineCheckbox} />
                  3D
                </label>
              </div>
              {cfg?.arc?.effects?.glow && (
                <>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
                    <span style={{ ...styles.sliderLabel, minWidth: '50px' }}>Blur</span>
                    <input type="range" min="1" max="30" step="1" value={cfg?.arc?.effects?.glowBlur ?? 10} 
                      onChange={(e) => onConfigChange({ ...config, arc: { ...cfg?.arc, effects: { ...cfg?.arc?.effects, glowBlur: Number(e.target.value) } } })} 
                      style={{ ...styles.slider, flex: 1 }} title="Glow blur intensity" />
                    <span style={{ fontSize: '0.7rem', opacity: 0.6, minWidth: '20px' }}>{cfg?.arc?.effects?.glowBlur ?? 10}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
                    <span style={{ ...styles.sliderLabel, minWidth: '50px' }}>Spread</span>
                    <input type="range" min="0" max="3" step="0.1" value={cfg?.arc?.effects?.glowSpread ?? 1} 
                      onChange={(e) => onConfigChange({ ...config, arc: { ...cfg?.arc, effects: { ...cfg?.arc?.effects, glowSpread: Number(e.target.value) } } })} 
                      style={{ ...styles.slider, flex: 1 }} title="Glow spread/intensity" />
                    <span style={{ fontSize: '0.7rem', opacity: 0.6, minWidth: '20px' }}>{cfg?.arc?.effects?.glowSpread ?? 1}</span>
                  </div>
                </>
              )}
              {cfg?.arc?.effects?.dropShadow && (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
                  <span style={{ ...styles.sliderLabel, minWidth: '50px' }}>Shadow</span>
                  <input type="range" min="0" max="10" step="1" value={cfg?.arc?.effects?.dropShadow?.blur ?? 3} 
                    onChange={(e) => onConfigChange({ ...config, arc: { ...cfg?.arc, effects: { ...cfg?.arc?.effects, dropShadow: { ...cfg?.arc?.effects?.dropShadow, blur: Number(e.target.value) } } } })} 
                    style={{ ...styles.slider, flex: 1 }} title="Shadow blur" />
                  <input type="range" min="0" max="1" step="0.1" value={cfg?.arc?.effects?.dropShadow?.opacity ?? 0.3} 
                    onChange={(e) => onConfigChange({ ...config, arc: { ...cfg?.arc, effects: { ...cfg?.arc?.effects, dropShadow: { ...cfg?.arc?.effects?.dropShadow, opacity: Number(e.target.value) } } } })} 
                    style={{ ...styles.slider, flex: 1 }} title="Shadow opacity" />
                </div>
              )}
            </div>
          </CollapsibleGroup>
        </Col>

        <Col xs={12} md={4}>
          <CollapsibleGroup title="Pointers" icon={<Target size={14} />} isMobile={isMobile}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {/* Pointers List Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>
                  {(cfg?.pointers?.length || 1)} pointer{(cfg?.pointers?.length || 1) > 1 ? 's' : ''}
                </span>
                <button
                  onClick={() => {
                    const currentPointers = cfg?.pointers || [{ 
                      value: value, 
                      type: cfg?.pointer?.type || 'needle',
                      color: cfg?.pointer?.color,
                      baseColor: cfg?.pointer?.baseColor || '#ffffff',
                      length: cfg?.pointer?.length ?? 0.7,
                      width: cfg?.pointer?.width ?? 15,
                      strokeWidth: cfg?.pointer?.strokeWidth ?? 0,
                      strokeColor: cfg?.pointer?.strokeColor,
                    }];
                    const min = cfg?.minValue ?? 0;
                    const max = cfg?.maxValue ?? 100;
                    // Copy last pointer's config but with new color and value
                    const lastPointer = currentPointers[currentPointers.length - 1];
                    const newPointers = [...currentPointers, { 
                      ...lastPointer,
                      value: min + (max - min) * (0.3 + currentPointers.length * 0.2), 
                      color: ['#5BE12C', '#F5CD19', '#EA4228', '#60a5fa', '#a855f7'][currentPointers.length % 5],
                      label: undefined, // Clear label so it auto-generates
                    }];
                    onConfigChange({ ...config, pointers: newPointers, pointer: undefined });
                  }}
                  style={{ ...styles.toolBtn, padding: '4px 8px', fontSize: '0.7rem' }}
                  type="button"
                  title="Add another pointer"
                >
                  <Plus size={12} /> Add Pointer
                </button>
              </div>
              
              {/* Value Display Mode (when multiple pointers) */}
              {(cfg?.pointers?.length ?? 0) > 1 && (
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>Show values:</span>
                  {['primary', 'all', 'none'].map((mode) => (
                    <button 
                      key={mode}
                      onClick={() => onConfigChange({ 
                        ...config, 
                        labels: { ...cfg?.labels, valueLabel: { ...cfg?.labels?.valueLabel, multiPointerDisplay: mode as 'primary' | 'all' | 'none' } }
                      })}
                      style={{ 
                        ...styles.toolBtn, 
                        padding: '2px 6px', 
                        fontSize: '0.65rem',
                        ...((cfg?.labels?.valueLabel?.multiPointerDisplay ?? 'primary') === mode ? styles.toolBtnActive : {})
                      }}
                      type="button"
                    >
                      {mode === 'primary' ? '1st' : mode === 'all' ? 'All' : 'None'}
                    </button>
                  ))}
                </div>
              )}
              
              {/* Pointer Accordions - use pointers array if exists, otherwise create from single pointer */}
              {(cfg?.pointers || [{ 
                value: value, 
                type: cfg?.pointer?.type || 'needle',
                color: cfg?.pointer?.color,
                baseColor: cfg?.pointer?.baseColor || '#ffffff',
                length: cfg?.pointer?.length ?? 0.7,
                width: cfg?.pointer?.width ?? 15,
                strokeWidth: cfg?.pointer?.strokeWidth ?? 0,
                strokeColor: cfg?.pointer?.strokeColor,
                arrowOffset: cfg?.pointer?.arrowOffset,
                blobOffset: cfg?.pointer?.blobOffset,
                // Don't inherit hide - pointers in array should always be visible
              }]).map((pointer: PointerWithValue, index: number) => (
                <PointerAccordion 
                  key={index}
                  pointer={pointer}
                  index={index}
                  minValue={cfg?.minValue ?? 0}
                  maxValue={cfg?.maxValue ?? 100}
                  isOnlyPointer={(cfg?.pointers?.length ?? 1) <= 1 && !cfg?.pointers}
                  onUpdate={(updated: PointerWithValue) => {
                    if (cfg?.pointers) {
                      // Already in multi-pointer mode - update the array
                      const pointers = [...cfg.pointers];
                      pointers[index] = updated;
                      onConfigChange({ ...config, pointers });
                      // Sync first pointer value to main value for compatibility
                      if (index === 0) onValueChange(updated.value);
                    } else {
                      // Convert single pointer to pointers array
                      // Update both config AND value together so gauge renders correctly
                      onConfigChange({ 
                        ...config, 
                        pointers: [updated],
                        pointer: { ...cfg?.pointer, hide: false } // Ensure pointer is visible
                      });
                      onValueChange(updated.value);
                    }
                  }}
                  onRemove={() => {
                    if (cfg?.pointers && cfg.pointers.length > 1) {
                      const pointers = cfg.pointers.filter((_: any, i: number) => i !== index);
                      onConfigChange({ ...config, pointers });
                    }
                  }}
                />
              ))}
              
              {/* Animation Settings (shared) */}
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flexWrap: 'wrap', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '8px', marginTop: '4px' }}>
                <Timer size={12} style={{ opacity: 0.6 }} />
                <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>Animation
                <label style={styles.inlineLabel} title="Disable animation completely (drag still works)">
                  <input type="checkbox" checked={cfg?.pointer?.animate === false} 
                    onChange={(e) => onConfigChange({ ...config, pointer: { ...cfg?.pointer, animate: !e.target.checked } })} 
                    style={styles.inlineCheckbox} />
                  Disable
                </label></span>
                <button 
                  onClick={() => {
                    const currentValue = value;
                    const minValue = cfg?.minValue ?? 0;
                    onValueChange(minValue);
                    if (onForceRemount) {
                      onForceRemount();
                      setTimeout(() => onValueChange(currentValue), 100);
                    } else {
                      setTimeout(() => onValueChange(currentValue), 50);
                    }
                  }} 
                  style={{ ...styles.toolBtn, padding: '4px 10px', marginLeft: 'auto', fontSize: '0.7rem' }} 
                  type="button" 
                  title="Replay animation"
                >
                  <Play size={12} /> Test
                </button>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
                <span style={{ ...styles.sliderLabel, minWidth: '50px' }}>Duration</span>
                <input type="range" min="100" max="5000" step="100" value={cfg?.pointer?.animationDuration ?? 3000} 
                  onChange={(e) => onConfigChange({ ...config, pointer: { ...cfg?.pointer, animationDuration: Number(e.target.value) } })} 
                  style={{ ...styles.slider, flex: 1 }} title="Animation duration (ms)" />
                <span style={{ fontSize: '0.7rem', opacity: 0.6, minWidth: '35px' }}>{((cfg?.pointer?.animationDuration ?? 3000) / 1000).toFixed(1)}s</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
                <span style={{ ...styles.sliderLabel, minWidth: '50px' }}>Delay</span>
                <input type="range" min="0" max="1000" step="50" value={cfg?.pointer?.animationDelay ?? 100} 
                  onChange={(e) => onConfigChange({ ...config, pointer: { ...cfg?.pointer, animationDelay: Number(e.target.value) } })} 
                  style={{ ...styles.slider, flex: 1 }} />
                <span style={{ fontSize: '0.7rem', opacity: 0.6, minWidth: '35px' }}>{cfg?.pointer?.animationDelay ?? 100}ms</span>
              </div>
               {/* Performance Controls */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
                <span style={{ ...styles.sliderLabel, minWidth: '50px' }}>Max FPS</span>
                <input type="range" min="10" max="60" step="5" value={cfg?.pointer?.maxFps ?? 60} 
                  onChange={(e) => onConfigChange({ ...config, pointer: { ...cfg?.pointer, maxFps: Number(e.target.value) } })} 
                  style={{ ...styles.slider, flex: 1 }} title="Maximum frames per second (lower = less GPU load)" />
                <span style={{ fontSize: '0.7rem', opacity: 0.6, minWidth: '30px' }}>{cfg?.pointer?.maxFps ?? 60}</span>
              </div>
              
              
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                <button onClick={() => onConfigChange({ ...config, pointer: { ...cfg?.pointer, maxFps: 60 } })} 
                  style={{ ...styles.toolBtn, padding: '3px 8px', fontSize: '0.7rem', ...(cfg?.pointer?.maxFps === 60 || cfg?.pointer?.maxFps === undefined ? styles.toolBtnActive : {}) }} 
                  type="button" title="60 FPS - Smooth (default)">
                  60fps
                </button>
                <button onClick={() => onConfigChange({ ...config, pointer: { ...cfg?.pointer, maxFps: 30 } })} 
                  style={{ ...styles.toolBtn, padding: '3px 8px', fontSize: '0.7rem', ...(cfg?.pointer?.maxFps === 30 ? styles.toolBtnActive : {}) }} 
                  type="button" title="30 FPS - Balanced performance">
                  30fps
                </button>
                <button onClick={() => onConfigChange({ ...config, pointer: { ...cfg?.pointer, maxFps: 15 } })} 
                  style={{ ...styles.toolBtn, padding: '3px 8px', fontSize: '0.7rem', ...(cfg?.pointer?.maxFps === 15 ? styles.toolBtnActive : {}) }} 
                  type="button" title="15 FPS - Low power mode for mobile">
                  15fps
                </button>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
                
                <button onClick={() => onInteractionChange(!interactionEnabled)} 
                  style={{ ...styles.toolBtn, padding: '6px 10px', ...(interactionEnabled ? styles.toolBtnActive : {}) }} 
                  title="Drag" type="button">
                  <Hand size={14} /><span>Drag and drop</span>
                </button>
                {interactionEnabled && (
                  <label style={styles.inlineLabel} title="Hide grab handle circle at pointer tip">
                    <input type="checkbox" checked={cfg?.pointer?.hideGrabHandle || false} 
                      onChange={(e) => onConfigChange({ ...config, pointer: { ...cfg?.pointer, hideGrabHandle: e.target.checked } })} 
                      style={styles.inlineCheckbox} />
                    No circle
                  </label>
                )}
                <button onClick={() => onConfigChange({ ...config, pointer: { ...cfg?.pointer, elastic: !cfg?.pointer?.elastic } })} 
                  style={{ ...styles.toolBtn, padding: '6px 10px', ...(cfg?.pointer?.elastic ? styles.toolBtnActive : {}) }} 
                  title="Elastic" type="button">
                  <Move size={14} /><span>Elastic movement</span>
                </button>
                <button onClick={() => onConfigChange({ ...config, pointer: { ...cfg?.pointer, animationDelay: cfg?.pointer?.animationDelay === 0 ? 200 : 0 } })} 
                  style={{ ...styles.toolBtn, padding: '6px 10px', ...(cfg?.pointer?.animationDelay === 0 ? styles.toolBtnActive : {}) }} 
                  title="Instant" type="button">
                  <Play size={14} /><span>Instant movement</span>
                </button>
              </div>
                </div>
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
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
                <span style={{ ...styles.sliderLabel, minWidth: '50px' }}>Distance</span>
                <input type="range" min="0" max="15" step="1" value={cfg?.labels?.tickLabels?.defaultTickLineConfig?.distanceFromArc ?? 3} 
                  onChange={(e) => onConfigChange({ ...config, labels: { ...cfg?.labels, tickLabels: { ...cfg?.labels?.tickLabels, defaultTickLineConfig: { ...cfg?.labels?.tickLabels?.defaultTickLineConfig, distanceFromArc: Number(e.target.value) } } } })} 
                  style={{ ...styles.slider, flex: 1 }} title="Distance from arc" />
              </div>
            </div>
          </CollapsibleGroup>
        </Col>

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
                <label style={styles.inlineLabel} title="Value label follows pointer during animation">
                  <input type="checkbox" checked={cfg?.labels?.valueLabel?.animateValue || false} 
                    onChange={(e) => onConfigChange({ ...config, labels: { ...cfg?.labels, valueLabel: { ...cfg?.labels?.valueLabel, animateValue: e.target.checked } } })} 
                    style={styles.inlineCheckbox} />
                  Live value
                </label>
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
                <input type="range" min="-150" max="150" step="1" value={cfg?.labels?.valueLabel?.offsetY ?? 0} 
                  onChange={(e) => onConfigChange({ ...config, labels: { ...cfg?.labels, valueLabel: { ...cfg?.labels?.valueLabel, offsetY: Number(e.target.value) } } })} 
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
          <CollapsibleGroup title="Value & Range" icon={<Sliders size={14} />} isMobile={isMobile} defaultOpen={true}>
            <div style={styles.buttonRow}>
              {[0, 25, 50, 75, 100].map((val) => {
                const min = cfg?.minValue ?? 0; const max = cfg?.maxValue ?? 100;
                const actualValue = min + (val / 100) * (max - min);
                return (
                  <button key={val} onClick={() => onValueChange(actualValue)} 
                    style={{ ...styles.toolBtn, padding: '4px 6px', ...(Math.abs(value - actualValue) < 0.01 ? styles.toolBtnActive : {}) }} type="button">
                    {val}%
                  </button>
                );
              })}
              <input type="range" min={cfg?.minValue ?? 0} max={cfg?.maxValue ?? 100} value={value} 
                onChange={(e) => { onValueChange(Number(e.target.value)); if (autoAnimate) onAutoAnimateChange(false); }} 
                style={{ ...styles.slider, flex: 1, minWidth: '120px' }} step="0.1" />
              <span style={{ ...styles.sliderValue, fontWeight: 700, color: '#60a5fa', minWidth: '45px' }}>{value.toFixed(1)}</span>
              <label style={styles.inlineLabel}>
                <input type="checkbox" checked={autoAnimate} onChange={(e) => onAutoAnimateChange(e.target.checked)} style={styles.inlineCheckbox} />
                Auto
              </label>
              <span style={{ marginLeft: '12px', borderLeft: '1px solid rgba(255,255,255,0.2)', paddingLeft: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>Min</span>
                <input 
                  type="number" 
                  value={cfg?.minValue ?? 0} 
                  onChange={(e) => {
                    const newMin = Number(e.target.value);
                    onConfigChange({ ...config, minValue: newMin });
                    if (value < newMin) onValueChange(newMin);
                  }}
                  style={{ ...styles.toolBtn, width: '60px', padding: '4px 6px', textAlign: 'center' as const, border: '1px solid rgba(255,255,255,0.2)' }}
                  title="Min value"
                />
                <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>Max</span>
                <input 
                  type="number" 
                  value={cfg?.maxValue ?? 100} 
                  onChange={(e) => {
                    const newMax = Number(e.target.value);
                    onConfigChange({ ...config, maxValue: newMax });
                    if (value > newMax) onValueChange(newMax);
                  }}
                  style={{ ...styles.toolBtn, width: '60px', padding: '4px 6px', textAlign: 'center' as const, border: '1px solid rgba(255,255,255,0.2)' }}
                  title="Max value"
                />
              </span>
            </div>
          </CollapsibleGroup>
        </Col>
      </Row>
    </Container>
  );
};
