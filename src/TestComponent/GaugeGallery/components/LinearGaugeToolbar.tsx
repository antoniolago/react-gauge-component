import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { styles } from '../styles';
import { COLOR_PRESETS } from '../presets';
import { LinearGaugeComponentProps } from '../../../lib/GaugeComponent/types/LinearGauge';
import { 
  Palette, Layers, Target, Tag, Ruler,
  Circle, Minus, Eye, EyeOff, Rainbow,
  ChevronDown, Plus, Trash2, ArrowRight, ArrowDown,
  Triangle, Diamond, Grip, ArrowUp
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
    <div style={{ ...styles.toolbarGroup }}>
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

interface LinearGaugeToolbarProps {
  config: Partial<LinearGaugeComponentProps>;
  onConfigChange: (config: Partial<LinearGaugeComponentProps>) => void;
}

export const LinearGaugeToolbar: React.FC<LinearGaugeToolbarProps> = ({
  config,
  onConfigChange,
}) => {
  const cfg = config as any;
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const segments = cfg?.track?.segments || [{ color: '#4caf50' }];

  return (
    <Container fluid style={styles.editorToolbar} className="p-0">
      <Row className="g-0">
        <Col xs={12} md={4}>
          <CollapsibleGroup title="Track & Segments" icon={<Layers size={14} />} isMobile={isMobile} defaultOpen>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {/* Orientation */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>Orientation</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button 
                    onClick={() => onConfigChange({ ...config, orientation: 'horizontal' })}
                    style={{ ...styles.toolBtn, padding: '4px 10px', ...(cfg?.orientation !== 'vertical' ? styles.toolBtnActive : {}) }}
                    type="button"
                  >
                    <ArrowRight size={14} /> Horizontal
                  </button>
                  <button 
                    onClick={() => onConfigChange({ ...config, orientation: 'vertical' })}
                    style={{ ...styles.toolBtn, padding: '4px 10px', ...(cfg?.orientation === 'vertical' ? styles.toolBtnActive : {}) }}
                    type="button"
                  >
                    <ArrowDown size={14} /> Vertical
                  </button>
                </div>
              </div>

              {/* Track Thickness */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
                <span style={{ ...styles.sliderLabel, minWidth: '60px' }}>Thickness</span>
                <input type="range" min="8" max="60" step="2" value={cfg?.track?.thickness ?? 20} 
                  onChange={(e) => onConfigChange({ ...config, track: { ...cfg?.track, thickness: Number(e.target.value) } })} 
                  style={{ ...styles.slider, flex: 1 }} />
                <span style={{ fontSize: '0.7rem', opacity: 0.6, minWidth: '25px' }}>{cfg?.track?.thickness ?? 20}px</span>
              </div>

              {/* Border Radius */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
                <span style={{ ...styles.sliderLabel, minWidth: '60px' }}>Radius</span>
                <input type="range" min="0" max="30" step="1" value={cfg?.track?.borderRadius ?? 0} 
                  onChange={(e) => onConfigChange({ ...config, track: { ...cfg?.track, borderRadius: Number(e.target.value) } })} 
                  style={{ ...styles.slider, flex: 1 }} />
                <span style={{ fontSize: '0.7rem', opacity: 0.6, minWidth: '25px' }}>{cfg?.track?.borderRadius ?? 0}px</span>
              </div>

              {/* Background Color */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
                <span style={{ ...styles.sliderLabel, minWidth: '60px' }}>Background</span>
                <input type="color" value={cfg?.track?.backgroundColor || '#e0e0e0'} 
                  onChange={(e) => onConfigChange({ ...config, track: { ...cfg?.track, backgroundColor: e.target.value } })} 
                  style={styles.colorPicker} />
              </div>

              {/* Color Presets */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '8px', marginTop: '4px' }}>
                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>Color presets</span>
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flexShrink: 0 }}>
                  {COLOR_PRESETS.map((preset) => (
                    <button 
                      key={preset.label} 
                      onClick={() => {
                        const min = cfg?.minValue ?? 0;
                        const max = cfg?.maxValue ?? 100;
                        const range = max - min;
                        const step = range / preset.colors.length;
                        const newSegments = preset.colors.map((color, i) => ({
                          limit: i < preset.colors.length - 1 ? min + (i + 1) * step : undefined,
                          color,
                        }));
                        onConfigChange({ ...config, track: { ...cfg?.track, segments: newSegments } });
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

              {/* Segments */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>Segments ({segments.length})</span>
                <button
                  onClick={() => {
                    const colors = ['#4caf50', '#ff9800', '#f44336', '#2196f3', '#9c27b0'];
                    const newSegments = [...segments, { color: colors[segments.length % colors.length] }];
                    onConfigChange({ ...config, track: { ...cfg?.track, segments: newSegments } });
                  }}
                  style={{ ...styles.toolBtn, padding: '3px 8px', fontSize: '0.7rem' }}
                  type="button"
                >
                  <Plus size={12} /> Add
                </button>
              </div>

              {/* Sub-Line (Grafana subarc - uses segment colors) */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '8px', marginTop: '4px' }}>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={styles.inlineLabel}>
                    <input type="checkbox" checked={cfg?.track?.subLine?.show || false} 
                      onChange={(e) => onConfigChange({ ...config, track: { ...cfg?.track, subLine: { ...cfg?.track?.subLine, show: e.target.checked } } })} 
                      style={styles.inlineCheckbox} />
                    Sub-Line (uses segment colors)
                  </label>
                </div>
                {cfg?.track?.subLine?.show && (
                  <>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%', marginBottom: '4px' }}>
                      <span style={{ ...styles.sliderLabel, minWidth: '50px', fontSize: '0.65rem' }}>Thick</span>
                      <input type="range" min="1" max="20" step="1" value={cfg?.track?.subLine?.thickness ?? 4} 
                        onChange={(e) => onConfigChange({ ...config, track: { ...cfg?.track, subLine: { ...cfg?.track?.subLine, thickness: Number(e.target.value) } } })} 
                        style={{ ...styles.slider, flex: 1 }} />
                      <span style={{ fontSize: '0.65rem', opacity: 0.6, minWidth: '20px' }}>{cfg?.track?.subLine?.thickness ?? 4}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%', marginBottom: '4px' }}>
                      <span style={{ ...styles.sliderLabel, minWidth: '50px', fontSize: '0.65rem' }}>Offset</span>
                      <input type="range" min="-20" max="20" step="1" value={cfg?.track?.subLine?.offset ?? 0} 
                        onChange={(e) => onConfigChange({ ...config, track: { ...cfg?.track, subLine: { ...cfg?.track?.subLine, offset: Number(e.target.value) } } })} 
                        style={{ ...styles.slider, flex: 1 }} />
                      <span style={{ fontSize: '0.65rem', opacity: 0.6, minWidth: '20px' }}>{cfg?.track?.subLine?.offset ?? 0}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
                      <span style={{ ...styles.sliderLabel, minWidth: '50px', fontSize: '0.65rem' }}>Opacity</span>
                      <input type="range" min="0.1" max="1" step="0.1" value={cfg?.track?.subLine?.opacity ?? 0.5} 
                        onChange={(e) => onConfigChange({ ...config, track: { ...cfg?.track, subLine: { ...cfg?.track?.subLine, opacity: Number(e.target.value) } } })} 
                        style={{ ...styles.slider, flex: 1 }} />
                      <span style={{ fontSize: '0.65rem', opacity: 0.6, minWidth: '20px' }}>{cfg?.track?.subLine?.opacity ?? 0.5}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Segment List */}
              {segments.map((segment: any, index: number) => (
                <div key={index} style={{ 
                  display: 'flex', 
                  gap: '6px', 
                  alignItems: 'center', 
                  padding: '6px', 
                  background: 'rgba(0,0,0,0.2)', 
                  borderRadius: '4px' 
                }}>
                  <input type="color" value={segment.color || '#4caf50'} 
                    onChange={(e) => {
                      const newSegments = [...segments];
                      newSegments[index] = { ...segment, color: e.target.value };
                      onConfigChange({ ...config, track: { ...cfg?.track, segments: newSegments } });
                    }}
                    style={styles.colorPicker} />
                  {index < segments.length - 1 && (
                    <>
                      <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>Limit:</span>
                      <input type="number" 
                        value={segment.limit ?? ''} 
                        placeholder="auto"
                        onChange={(e) => {
                          const newSegments = [...segments];
                          newSegments[index] = { ...segment, limit: e.target.value ? Number(e.target.value) : undefined };
                          onConfigChange({ ...config, track: { ...cfg?.track, segments: newSegments } });
                        }}
                        style={{ ...styles.toolBtn, width: '60px', padding: '3px 5px', fontSize: '0.7rem', border: '1px solid rgba(255,255,255,0.2)' }}
                      />
                    </>
                  )}
                  {segments.length > 1 && (
                    <button
                      onClick={() => {
                        const newSegments = segments.filter((_: any, i: number) => i !== index);
                        onConfigChange({ ...config, track: { ...cfg?.track, segments: newSegments } });
                      }}
                      style={{ ...styles.toolBtn, padding: '3px', marginLeft: 'auto' }}
                      type="button"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </CollapsibleGroup>
        </Col>

        <Col xs={12} md={4}>
          <CollapsibleGroup title="Pointer" icon={<Target size={14} />} isMobile={isMobile}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {/* Pointer Type */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>Type</span>
                <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap' }}>
                  {[
                    { type: 'triangle', icon: <Triangle size={10} />, label: '▼' },
                    { type: 'arrow', icon: <ArrowDown size={10} />, label: '↓' },
                    { type: 'diamond', icon: <Diamond size={10} />, label: '◆' },
                    { type: 'line', icon: <Minus size={10} />, label: '|' },
                    { type: 'pill', icon: <Grip size={10} />, label: '●' },
                    { type: 'none', icon: <EyeOff size={10} />, label: '∅' },
                  ].map(({ type, icon, label }) => (
                    <button 
                      key={type}
                      onClick={() => onConfigChange({ ...config, pointer: { ...cfg?.pointer, type: type as any } })}
                      style={{ ...styles.toolBtn, padding: '4px 6px', fontSize: '0.7rem', ...((cfg?.pointer?.type || 'triangle') === type ? styles.toolBtnActive : {}) }}
                      type="button"
                      title={type.charAt(0).toUpperCase() + type.slice(1)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {cfg?.pointer?.type !== 'none' && (
                <>
                  {/* Pointer Position */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>Position</span>
                    <div style={{ display: 'flex', gap: '3px' }}>
                      {(cfg?.orientation === 'vertical' 
                        ? [{ pos: 'left', label: 'L' }, { pos: 'right', label: 'R' }, { pos: 'inside', label: 'In' }, { pos: 'both', label: 'Both' }]
                        : [{ pos: 'top', label: 'T' }, { pos: 'bottom', label: 'B' }, { pos: 'inside', label: 'In' }, { pos: 'both', label: 'Both' }]
                      ).map(({ pos, label }) => (
                        <button 
                          key={pos}
                          onClick={() => onConfigChange({ ...config, pointer: { ...cfg?.pointer, position: pos as any } })}
                          style={{ ...styles.toolBtn, padding: '3px 6px', fontSize: '0.65rem', ...((cfg?.pointer?.position || 'top') === pos ? styles.toolBtnActive : {}) }}
                          type="button"
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Show Fill toggle */}
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <label style={styles.inlineLabel}>
                      <input type="checkbox" checked={cfg?.pointer?.showFill !== false} 
                        onChange={(e) => onConfigChange({ ...config, pointer: { ...cfg?.pointer, showFill: e.target.checked } })} 
                        style={styles.inlineCheckbox} />
                      Show Fill (Grafana-style)
                    </label>
                  </div>

                  {/* Pointer Color */}
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
                    <span style={{ ...styles.sliderLabel, minWidth: '50px' }}>Color</span>
                    <input type="color" value={cfg?.pointer?.color || '#333333'} 
                      onChange={(e) => onConfigChange({ ...config, pointer: { ...cfg?.pointer, color: e.target.value } })} 
                      style={styles.colorPicker} />
                  </div>

                  {/* Pointer Size */}
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
                    <span style={{ ...styles.sliderLabel, minWidth: '50px' }}>Size</span>
                    <input type="range" min="6" max="30" step="1" value={cfg?.pointer?.size ?? 14} 
                      onChange={(e) => onConfigChange({ ...config, pointer: { ...cfg?.pointer, size: Number(e.target.value) } })} 
                      style={{ ...styles.slider, flex: 1 }} />
                    <span style={{ fontSize: '0.7rem', opacity: 0.6, minWidth: '25px' }}>{cfg?.pointer?.size ?? 14}px</span>
                  </div>

                  {/* Pointer Height (for arrow/triangle) */}
                  {(cfg?.pointer?.type === 'arrow' || cfg?.pointer?.type === 'triangle' || cfg?.pointer?.type === 'diamond') && (
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
                      <span style={{ ...styles.sliderLabel, minWidth: '50px' }}>Height</span>
                      <input type="range" min="8" max="40" step="1" value={cfg?.pointer?.height ?? (cfg?.pointer?.size ?? 14) * 1.2} 
                        onChange={(e) => onConfigChange({ ...config, pointer: { ...cfg?.pointer, height: Number(e.target.value) } })} 
                        style={{ ...styles.slider, flex: 1 }} />
                      <span style={{ fontSize: '0.7rem', opacity: 0.6, minWidth: '25px' }}>{cfg?.pointer?.height ?? Math.round((cfg?.pointer?.size ?? 14) * 1.2)}px</span>
                    </div>
                  )}

                  {/* Pointer Y Offset */}
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
                    <span style={{ ...styles.sliderLabel, minWidth: '50px' }}>Offset Y</span>
                    <input type="range" min="-30" max="30" step="1" value={cfg?.pointer?.offsetY ?? 0} 
                      onChange={(e) => onConfigChange({ ...config, pointer: { ...cfg?.pointer, offsetY: Number(e.target.value) } })} 
                      style={{ ...styles.slider, flex: 1 }} />
                    <span style={{ fontSize: '0.7rem', opacity: 0.6, minWidth: '25px' }}>{cfg?.pointer?.offsetY ?? 0}px</span>
                  </div>
                </>
              )}
            </div>
          </CollapsibleGroup>

          <CollapsibleGroup title="Ticks" icon={<Ruler size={14} />} isMobile={isMobile}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {/* Tick Position */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>Position</span>
                <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap' }}>
                  {(cfg?.orientation === 'vertical' 
                    ? [
                        { pos: 'inside-left', label: 'In-L' }, 
                        { pos: 'inside-right', label: 'In-R' }, 
                        { pos: 'left', label: 'Left' }, 
                        { pos: 'right', label: 'Right' }
                      ]
                    : [
                        { pos: 'inside-top', label: 'In-T' }, 
                        { pos: 'inside-bottom', label: 'In-B' }, 
                        { pos: 'top', label: 'Top' }, 
                        { pos: 'bottom', label: 'Bot' }
                      ]
                  ).map(({ pos, label }) => (
                    <button 
                      key={pos}
                      onClick={() => onConfigChange({ ...config, ticks: { ...cfg?.ticks, position: pos as any } })}
                      style={{ ...styles.toolBtn, padding: '3px 5px', fontSize: '0.6rem', ...((cfg?.ticks?.position || 'inside-top') === pos ? styles.toolBtnActive : {}) }}
                      type="button"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Major Tick Count */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
                <span style={{ ...styles.sliderLabel, minWidth: '60px' }}>Major</span>
                <input type="range" min="0" max="20" step="1" value={cfg?.ticks?.count ?? 5} 
                  onChange={(e) => onConfigChange({ ...config, ticks: { ...cfg?.ticks, count: Number(e.target.value) } })} 
                  style={{ ...styles.slider, flex: 1 }} />
                <span style={{ fontSize: '0.7rem', opacity: 0.6, minWidth: '20px' }}>{cfg?.ticks?.count ?? 5}</span>
              </div>

              {/* Minor Tick Count */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
                <span style={{ ...styles.sliderLabel, minWidth: '60px' }}>Minor</span>
                <input type="range" min="0" max="10" step="1" value={cfg?.ticks?.minorTicks ?? 4} 
                  onChange={(e) => onConfigChange({ ...config, ticks: { ...cfg?.ticks, minorTicks: Number(e.target.value) } })} 
                  style={{ ...styles.slider, flex: 1 }} />
                <span style={{ fontSize: '0.7rem', opacity: 0.6, minWidth: '20px' }}>{cfg?.ticks?.minorTicks ?? 4}</span>
              </div>

              {/* Major Tick Length */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
                <span style={{ ...styles.sliderLabel, minWidth: '60px' }}>Maj Len</span>
                <input type="range" min="4" max="30" step="1" value={cfg?.ticks?.majorLength ?? 12} 
                  onChange={(e) => onConfigChange({ ...config, ticks: { ...cfg?.ticks, majorLength: Number(e.target.value) } })} 
                  style={{ ...styles.slider, flex: 1 }} />
                <span style={{ fontSize: '0.7rem', opacity: 0.6, minWidth: '20px' }}>{cfg?.ticks?.majorLength ?? 12}px</span>
              </div>

              {/* Minor Tick Length */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
                <span style={{ ...styles.sliderLabel, minWidth: '60px' }}>Min Len</span>
                <input type="range" min="2" max="20" step="1" value={cfg?.ticks?.minorLength ?? 6} 
                  onChange={(e) => onConfigChange({ ...config, ticks: { ...cfg?.ticks, minorLength: Number(e.target.value) } })} 
                  style={{ ...styles.slider, flex: 1 }} />
                <span style={{ fontSize: '0.7rem', opacity: 0.6, minWidth: '20px' }}>{cfg?.ticks?.minorLength ?? 6}px</span>
              </div>

              {/* Tick Color */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
                <span style={{ ...styles.sliderLabel, minWidth: '60px' }}>Color</span>
                <input type="color" value={cfg?.ticks?.color || '#333333'} 
                  onChange={(e) => onConfigChange({ ...config, ticks: { ...cfg?.ticks, color: e.target.value } })} 
                  style={styles.colorPicker} />
              </div>

              {/* Options */}
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                <label style={styles.inlineLabel}>
                  <input type="checkbox" checked={cfg?.ticks?.hideMinMax || false} 
                    onChange={(e) => onConfigChange({ ...config, ticks: { ...cfg?.ticks, hideMinMax: e.target.checked } })} 
                    style={styles.inlineCheckbox} />
                  Hide
                </label>
                <label style={styles.inlineLabel}>
                  <input type="checkbox" checked={cfg?.ticks?.labelsOnMajorOnly !== false} 
                    onChange={(e) => onConfigChange({ ...config, ticks: { ...cfg?.ticks, labelsOnMajorOnly: e.target.checked } })} 
                    style={styles.inlineCheckbox} />
                  Labels on Major
                </label>
                {(cfg?.ticks?.position?.startsWith('inside')) && (
                  <label style={styles.inlineLabel}>
                    <input type="checkbox" checked={cfg?.ticks?.labelsInside || false} 
                      onChange={(e) => onConfigChange({ ...config, ticks: { ...cfg?.ticks, labelsInside: e.target.checked } })} 
                      style={styles.inlineCheckbox} />
                    Labels Inside
                  </label>
                )}
              </div>
            </div>
          </CollapsibleGroup>
        </Col>

        <Col xs={12} md={4}>
          <CollapsibleGroup title="Value Label" icon={<Tag size={14} />} isMobile={isMobile}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {/* Show/Hide */}
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flexWrap: 'wrap' }}>
                <button onClick={() => onConfigChange({ ...config, valueLabel: { ...cfg?.valueLabel, hide: !cfg?.valueLabel?.hide } })} 
                  style={{ ...styles.toolBtn, padding: '6px 10px', ...(!cfg?.valueLabel?.hide ? styles.toolBtnActive : {}) }} type="button">
                  {cfg?.valueLabel?.hide ? <EyeOff size={14} /> : <Eye size={14} />}<span>Show</span>
                </button>
                <button onClick={() => onConfigChange({ ...config, valueLabel: { ...cfg?.valueLabel, matchColorWithSegment: !cfg?.valueLabel?.matchColorWithSegment } })} 
                  style={{ ...styles.toolBtn, padding: '6px 10px', ...(cfg?.valueLabel?.matchColorWithSegment ? styles.toolBtnActive : {}) }} type="button">
                  <Rainbow size={14} /><span>Match Color</span>
                </button>
              </div>

              {/* Font Size */}
              {!cfg?.valueLabel?.hide && (
                <>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
                    <span style={{ ...styles.sliderLabel, minWidth: '50px' }}>Size</span>
                    <input type="range" min="10" max="48" step="1" 
                      value={parseInt(cfg?.valueLabel?.style?.fontSize || '14')} 
                      onChange={(e) => onConfigChange({ ...config, valueLabel: { ...cfg?.valueLabel, style: { ...cfg?.valueLabel?.style, fontSize: `${e.target.value}px` } } })} 
                      style={{ ...styles.slider, flex: 1 }} />
                    <span style={{ fontSize: '0.7rem', opacity: 0.6, minWidth: '25px' }}>{parseInt(cfg?.valueLabel?.style?.fontSize || '14')}px</span>
                  </div>

                  {/* Text Color */}
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
                    <span style={{ ...styles.sliderLabel, minWidth: '50px' }}>Color</span>
                    <input type="color" value={cfg?.valueLabel?.style?.color || '#333333'} 
                      onChange={(e) => onConfigChange({ ...config, valueLabel: { ...cfg?.valueLabel, style: { ...cfg?.valueLabel?.style, color: e.target.value } } })} 
                      style={styles.colorPicker} />
                  </div>

                  {/* Position */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>Position</span>
                    <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap' }}>
                      {[
                        { pos: 'center', label: 'Center' },
                        { pos: 'right', label: 'Right' },
                        { pos: 'left', label: 'Left' },
                        { pos: 'top', label: 'Top' },
                        { pos: 'bottom', label: 'Bot' },
                      ].map(({ pos, label }) => (
                        <button 
                          key={pos}
                          onClick={() => onConfigChange({ ...config, valueLabel: { ...cfg?.valueLabel, position: pos as any } })}
                          style={{ ...styles.toolBtn, padding: '3px 6px', fontSize: '0.65rem', ...((cfg?.valueLabel?.position || 'right') === pos ? styles.toolBtnActive : {}) }}
                          type="button"
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* X Offset */}
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
                    <span style={{ ...styles.sliderLabel, minWidth: '50px' }}>Offset X</span>
                    <input type="range" min="-100" max="100" step="1" value={cfg?.valueLabel?.offsetX ?? 0} 
                      onChange={(e) => onConfigChange({ ...config, valueLabel: { ...cfg?.valueLabel, offsetX: Number(e.target.value) } })} 
                      style={{ ...styles.slider, flex: 1 }} />
                    <span style={{ fontSize: '0.7rem', opacity: 0.6, minWidth: '25px' }}>{cfg?.valueLabel?.offsetX ?? 0}px</span>
                  </div>

                  {/* Y Offset */}
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
                    <span style={{ ...styles.sliderLabel, minWidth: '50px' }}>Offset Y</span>
                    <input type="range" min="-100" max="100" step="1" value={cfg?.valueLabel?.offsetY ?? 0} 
                      onChange={(e) => onConfigChange({ ...config, valueLabel: { ...cfg?.valueLabel, offsetY: Number(e.target.value) } })} 
                      style={{ ...styles.slider, flex: 1 }} />
                    <span style={{ fontSize: '0.7rem', opacity: 0.6, minWidth: '25px' }}>{cfg?.valueLabel?.offsetY ?? 0}px</span>
                  </div>
                </>
              )}
            </div>
          </CollapsibleGroup>
        </Col>
      </Row>
    </Container>
  );
};
