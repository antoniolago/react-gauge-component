import React, { useState, useEffect, useCallback, forwardRef, useImperativeHandle, useRef } from 'react';
import { Copy, Check, Shuffle, ClipboardPaste, Sliders } from 'lucide-react';
import GaugeComponent from '../../../lib';
import { SandboxToolbar } from './SandboxToolbar';
import { styles, createStyles } from '../styles';
import { generateRandomConfig, copyToClipboard, getInitialValue, GRAFANA_NEON_CONFIG } from '../utils';
import { GaugeComponentProps } from '../../../lib/GaugeComponent/types/GaugeComponentProps';

interface SandboxEditorProps {
  isLightTheme: boolean;
}

// Breakpoint for responsive layout
const LAYOUT_BREAKPOINT = 1024;

export interface SandboxEditorHandle {
  loadConfig: (config: Partial<GaugeComponentProps>, value: number) => void;
  scrollToEditor: () => void;
}

export const SandboxEditor = forwardRef<SandboxEditorHandle, SandboxEditorProps>(({ isLightTheme }, ref) => {
  const themeStyles = createStyles(isLightTheme);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [isOpen, setIsOpen] = useState(true);
  const [config, setConfig] = useState<Partial<GaugeComponentProps>>(() => GRAFANA_NEON_CONFIG);
  const [value, setValue] = useState(() => getInitialValue(GRAFANA_NEON_CONFIG));
  const [autoAnimate, setAutoAnimate] = useState(false);
  const [sandboxWidth, setSandboxWidth] = useState('400px');
  const [sandboxHeight, setSandboxHeight] = useState('300px');
  const [gaugeAlign, setGaugeAlign] = useState<'left' | 'center' | 'right'>('center');
  const [copied, setCopied] = useState(false);
  const [key, setKey] = useState(0);
  const [interactionEnabled, setInteractionEnabled] = useState(true);
  const [isHorizontalLayout, setIsHorizontalLayout] = useState(window.innerWidth >= LAYOUT_BREAKPOINT);

  // Handle responsive layout
  useEffect(() => {
    const handleResize = () => {
      setIsHorizontalLayout(window.innerWidth >= LAYOUT_BREAKPOINT);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    loadConfig: (newConfig: Partial<GaugeComponentProps>, newValue: number) => {
      setConfig(newConfig);
      setValue(newValue);
      setKey(k => k + 1);
      setIsOpen(true); // Ensure editor is open
    },
    scrollToEditor: () => {
      // Wait for content to render after setIsOpen(true) before scrolling
      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    },
  }));

  // Auto-animate value
  useEffect(() => {
    if (!autoAnimate) return;
    
    const interval = setInterval(() => {
      const min = (config as any)?.minValue ?? 0;
      const max = (config as any)?.maxValue ?? 100;
      setValue(min + Math.random() * (max - min));
    }, 3000);
    
    return () => clearInterval(interval);
  }, [autoAnimate, config]);

  const handleConfigChange = useCallback((newConfig: Partial<GaugeComponentProps>) => {
    setConfig(newConfig);
    // Don't increment key on normal config changes - let the component handle updates internally
    // This prevents unnecessary remounts which cause the pointer to animate from 0
  }, []);

  const handleRandomize = useCallback(() => {
    const newConfig = generateRandomConfig();
    setConfig(newConfig);
    setValue(getInitialValue(newConfig));
    setKey(k => k + 1);
  }, []);

  const handleCopy = useCallback(() => {
    copyToClipboard(config, value, () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [config, value]);

  const handlePaste = useCallback(() => {
    navigator.clipboard.readText().then(text => {
      try {
        let parsed: any = {};
        
        // Check if it's JSX/hybrid format
        if (text.includes('<GaugeComponent') || text.includes('<Gauge')) {
          // Parse JSX props
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
          
          const propPattern = /(\w+)=(?={|"|')/g;
          let match;
          while ((match = propPattern.exec(text)) !== null) {
            const propName = match[1];
            const startIdx = match.index + match[0].length;
            const { value: rawValue } = extractValue(text, startIdx);
            
            let propValue: any = rawValue;
            
            if (text[startIdx] === '"' || text[startIdx] === "'") {
              propValue = rawValue;
            } else {
              try {
                let jsonStr = rawValue
                  .replace(/(\w+)\s*:/g, '"$1":')
                  .replace(/'/g, '"')
                  .replace(/,(\s*[}\]])/g, '$1');
                propValue = JSON.parse(jsonStr);
              } catch {
                try {
                  propValue = eval(`(${rawValue})`);
                } catch {
                  propValue = rawValue;
                }
              }
            }
            parsed[propName] = propValue;
          }
        } else {
          parsed = JSON.parse(text);
        }
        
        if (parsed.value !== undefined) {
          setValue(Number(parsed.value));
          delete parsed.value;
        }
        if (Object.keys(parsed).length > 0) {
          setConfig(parsed);
          setKey(k => k + 1);
        }
      } catch (e) {
        console.error('Parse error:', e);
        alert('Could not parse clipboard. Use <GaugeComponent .../> JSX format.');
      }
    }).catch(() => {
      alert('Could not read clipboard. Please allow clipboard access.');
    });
  }, []);

  const handleSizeChange = useCallback((width: string, height: string) => {
    setSandboxWidth(width);
    setSandboxHeight(height);
  }, []);

  return (
    <div ref={containerRef} style={styles.sandboxSection}>
      <div style={styles.accordionHeader} onClick={() => setIsOpen(!isOpen)}>
        <div>
          <h2 style={styles.accordionTitle}>
            Sandbox Editor
            <span style={styles.accordionArrow}>{isOpen ? '▼' : '▶'}</span>
          </h2>
          <span style={styles.accordionHint}>
            {isOpen ? 'Click to collapse' : 'Click to expand - Test & customize your gauge'}
          </span>
        </div>
      </div>
      
      {isOpen && (
        <div style={{
          ...styles.sandboxContent,
          display: 'flex',
          flexDirection: isHorizontalLayout ? 'row' : 'column',
          gap: '20px',
          alignItems: isHorizontalLayout ? 'flex-start' : 'stretch',
        }}>
          {/* Gauge Preview - Left side on desktop, top on mobile */}
          <div style={{
            flex: isHorizontalLayout ? '0 0 auto' : '1',
            display: 'flex',
            flexDirection: 'column',
            alignItems: gaugeAlign === 'left' ? 'flex-start' : gaugeAlign === 'right' ? 'flex-end' : 'center',
            minWidth: isHorizontalLayout ? '300px' : undefined,
          }}>
            <div style={{
              ...themeStyles.randomizerCard,
              width: sandboxWidth,
              height: sandboxHeight,
              minWidth: '200px',
              minHeight: '150px',
              maxWidth: '100%',
              position: 'relative',
              resize: 'both',
              overflow: 'hidden',
            }}>
              
              <div style={{ width: '100%', height: 'calc(100% - 30px)' }}>
                <GaugeComponent
                  key={key}
                  {...config}
                  value={value}
                  onValueChange={interactionEnabled ? setValue : undefined}
                  onPointerChange={interactionEnabled ? (index, newValue) => {
                    // Handle multi-pointer drag
                    if (config.pointers && config.pointers.length > 0) {
                      const newPointers = [...config.pointers];
                      newPointers[index] = { ...newPointers[index], value: newValue };
                      setConfig({ ...config, pointers: newPointers });
                    }
                    // Also update main value for primary pointer
                    if (index === 0) setValue(newValue);
                  } : undefined}
                />
              </div>
              
              {/* Action buttons */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '8px',
                padding: '4px 8px',
                background: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '4px',
                margin: '0 8px 4px',
              }}>
                <button
                  onClick={handleRandomize}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'rgba(255, 255, 255, 0.8)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.75rem',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  title="Randomize gauge"
                  type="button"
                >
                  <Shuffle size={14} /> Random
                </button>
                <button
                  onClick={handlePaste}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'rgba(255, 255, 255, 0.8)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.75rem',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  title="Paste from clipboard"
                  type="button"
                >
                  <ClipboardPaste size={14} /> Paste
                </button>
                <button
                  onClick={handleCopy}
                  style={{
                    background: copied ? 'rgba(91, 225, 44, 0.2)' : 'transparent',
                    border: 'none',
                    color: copied ? '#5BE12C' : 'rgba(255, 255, 255, 0.8)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.75rem',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => !copied && (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)')}
                  onMouseLeave={(e) => !copied && (e.currentTarget.style.background = 'transparent')}
                  title="Copy as JSX"
                  type="button"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              
              {/* Resize indicator */}
              <div style={{
                position: 'absolute',
                bottom: '2px',
                right: '2px',
                width: '12px',
                height: '12px',
                opacity: 0.5,
                pointerEvents: 'none',
                background: 'linear-gradient(135deg, transparent 50%, rgba(255,255,255,0.3) 50%)',
              }} />
            </div>
            
            {/* Value & Range - Below gauge */}
            <div style={{
              width: sandboxWidth,
              maxWidth: '100%',
              marginTop: '12px',
              padding: '8px 12px',
              background: 'rgba(0,0,0,0.2)',
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <Sliders size={14} style={{ opacity: 0.6 }} />
                <input type="range" min={config?.minValue ?? 0} max={config?.maxValue ?? 100} value={value} 
                  onChange={(e) => { 
                    const newValue = Number(e.target.value);
                    setValue(newValue); 
                    if (autoAnimate) setAutoAnimate(false);
                    // Sync to pointers[0] if in multi-pointer mode
                    const cfg = config as any;
                    if (cfg?.pointers?.length > 0) {
                      const pointers = [...cfg.pointers];
                      pointers[0] = { ...pointers[0], value: newValue };
                      setConfig({ ...config, pointers });
                    }
                  }} 
                  style={{ ...styles.slider, flex: 1, minWidth: '100px' }} step="0.1" />
                <span style={{ fontWeight: 700, color: '#60a5fa', minWidth: '45px', fontSize: '0.85rem' }}>{value.toFixed(1)}</span>
                <label style={{ ...styles.inlineLabel, fontSize: '0.75rem' }}>
                  <input type="checkbox" checked={autoAnimate} onChange={(e) => setAutoAnimate(e.target.checked)} style={styles.inlineCheckbox} />
                  Auto
                </label>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>Min</span>
                <input type="number" value={config?.minValue ?? 0} 
                  onChange={(e) => {
                    const newMin = Number(e.target.value);
                    setConfig({ ...config, minValue: newMin });
                    if (value < newMin) setValue(newMin);
                  }}
                  style={{ ...styles.toolBtn, width: '55px', padding: '3px 5px', textAlign: 'center' as const, border: '1px solid rgba(255,255,255,0.2)', fontSize: '0.75rem' }}
                />
                <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>Max</span>
                <input type="number" value={config?.maxValue ?? 100} 
                  onChange={(e) => {
                    const newMax = Number(e.target.value);
                    setConfig({ ...config, maxValue: newMax });
                    if (value > newMax) setValue(newMax);
                  }}
                  style={{ ...styles.toolBtn, width: '55px', padding: '3px 5px', textAlign: 'center' as const, border: '1px solid rgba(255,255,255,0.2)', fontSize: '0.75rem' }}
                />
              </div>
            </div>
            
            {/* Type selector - Below Value & Range */}
            <div style={{
              width: sandboxWidth,
              maxWidth: '100%',
              marginTop: '8px',
              display: 'flex',
              gap: '8px',
            }}>
              {(['semicircle', 'radial', 'grafana'] as const).map((gaugeType) => (
                <button 
                  key={gaugeType}
                  onClick={() => setConfig({ ...config, type: gaugeType })} 
                  style={{ 
                    flex: 1,
                    background: config?.type === gaugeType ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    border: config?.type === gaugeType ? '2px solid #3b82f6' : '2px solid transparent',
                    borderRadius: '8px',
                    padding: '6px 4px',
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
                  <div style={{ width: '100%', height: '40px', pointerEvents: 'none' }}>
                    <GaugeComponent 
                      type={gaugeType}
                      arc={{ width: 0.2, subArcs: [{ limit: 40, color: '#5BE12C' }, { limit: 70, color: '#F5CD19' }, { color: '#EA4228' }] }}
                      pointer={{ type: 'needle', color: '#fff', length: 0.7, width: 8 }}
                      labels={{ valueLabel: { hide: true }, tickLabels: { hideMinMax: true } }}
                      value={50} 
                    />
                  </div>
                  <span style={{ 
                    fontSize: '0.65rem', 
                    fontWeight: config?.type === gaugeType ? 600 : 400,
                    color: config?.type === gaugeType ? '#60a5fa' : 'rgba(255,255,255,0.6)',
                    marginTop: '2px',
                  }}>
                    {gaugeType.charAt(0).toUpperCase() + gaugeType.slice(1)}
                  </span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Toolbar - Right side on desktop, bottom on mobile */}
          <div style={{
            flex: isHorizontalLayout ? '1' : '0 0 auto',
            minWidth: 0,
          }}>
            <SandboxToolbar
              config={config}
              value={value}
              autoAnimate={autoAnimate}
              sandboxWidth={sandboxWidth}
              sandboxHeight={sandboxHeight}
              gaugeAlign={gaugeAlign}
              onConfigChange={handleConfigChange}
              onValueChange={setValue}
              onAutoAnimateChange={setAutoAnimate}
              onSizeChange={handleSizeChange}
              onAlignChange={setGaugeAlign}
              interactionEnabled={interactionEnabled}
              onInteractionChange={setInteractionEnabled}
              onForceRemount={() => setKey(k => k + 1)}
            />
          </div>
        </div>
      )}
    </div>
  );
});
