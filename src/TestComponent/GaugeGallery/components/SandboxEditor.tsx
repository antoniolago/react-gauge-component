import React, { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Copy, Check, Shuffle, ClipboardPaste } from 'lucide-react';
import GaugeComponent from '../../../lib';
import { SandboxToolbar } from './SandboxToolbar';
import { styles, createStyles } from '../styles';
import { generateRandomConfig, copyToClipboard, getInitialValue } from '../utils';
import { GaugeComponentProps } from '../../../lib/GaugeComponent/types/GaugeComponentProps';

interface SandboxEditorProps {
  isLightTheme: boolean;
}

export interface SandboxEditorHandle {
  loadConfig: (config: Partial<GaugeComponentProps>, value: number) => void;
}

export const SandboxEditor = forwardRef<SandboxEditorHandle, SandboxEditorProps>(({ isLightTheme }, ref) => {
  const themeStyles = createStyles(isLightTheme);
  
  const [isOpen, setIsOpen] = useState(true);
  const [config, setConfig] = useState<Partial<GaugeComponentProps>>(() => generateRandomConfig());
  const [value, setValue] = useState(() => getInitialValue(config));
  const [autoAnimate, setAutoAnimate] = useState(false);
  const [sandboxWidth, setSandboxWidth] = useState('400px');
  const [sandboxHeight, setSandboxHeight] = useState('300px');
  const [gaugeAlign, setGaugeAlign] = useState<'left' | 'center' | 'right'>('left');
  const [copied, setCopied] = useState(false);
  const [key, setKey] = useState(0);
  const [interactionEnabled, setInteractionEnabled] = useState(true);

  // Expose loadConfig method via ref
  useImperativeHandle(ref, () => ({
    loadConfig: (newConfig: Partial<GaugeComponentProps>, newValue: number) => {
      setConfig(newConfig);
      setValue(newValue);
      setKey(k => k + 1);
      setIsOpen(true); // Ensure editor is open
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
    setKey(k => k + 1);
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
    <div style={styles.sandboxSection}>
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
        <div style={styles.sandboxContent}>
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
          />

          {/* Gauge Preview - Resizable */}
          <div style={{
            ...styles.gaugePreviewContainer,
            justifyContent: gaugeAlign === 'left' ? 'flex-start' : gaugeAlign === 'right' ? 'flex-end' : 'center',
          }}>
            <div style={{
              ...themeStyles.randomizerCard,
              width: sandboxWidth,
              height: sandboxHeight,
              minWidth: '150px',
              minHeight: '120px',
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
          </div>
        </div>
      )}
    </div>
  );
});
