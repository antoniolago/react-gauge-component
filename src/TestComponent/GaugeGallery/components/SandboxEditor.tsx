import React, { useState, useEffect, useCallback } from 'react';
import GaugeComponent from '../../../lib';
import { SandboxToolbar } from './SandboxToolbar';
import { styles, createStyles } from '../styles';
import { generateRandomConfig, copyToClipboard, getInitialValue } from '../utils';
import { GaugeComponentProps } from '../../../lib/GaugeComponent/types/GaugeComponentProps';

interface SandboxEditorProps {
  isLightTheme: boolean;
}

export const SandboxEditor: React.FC<SandboxEditorProps> = ({ isLightTheme }) => {
  const themeStyles = createStyles(isLightTheme);
  
  const [isOpen, setIsOpen] = useState(true);
  const [config, setConfig] = useState<Partial<GaugeComponentProps>>(() => generateRandomConfig());
  const [value, setValue] = useState(() => getInitialValue(config));
  const [autoAnimate, setAutoAnimate] = useState(true);
  const [sandboxWidth, setSandboxWidth] = useState('400px');
  const [sandboxHeight, setSandboxHeight] = useState('300px');
  const [gaugeAlign, setGaugeAlign] = useState<'left' | 'center' | 'right'>('left');
  const [copied, setCopied] = useState(false);
  const [key, setKey] = useState(0);
  const [interactionEnabled, setInteractionEnabled] = useState(true);

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

  const handleSizeChange = useCallback((width: string, height: string) => {
    setSandboxWidth(width);
    setSandboxHeight(height);
  }, []);

  return (
    <div style={styles.sandboxSection}>
      <div style={styles.accordionHeader} onClick={() => setIsOpen(!isOpen)}>
        <div>
          <h2 style={styles.accordionTitle}>
            🧪 Sandbox Editor
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
            onRandomize={handleRandomize}
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
              <button
                onClick={handleCopy}
                style={{
                  ...styles.copyCornerBtn,
                  background: copied ? '#5BE12C' : 'rgba(0, 0, 0, 0.5)',
                }}
                title="Copy code"
                type="button"
              >
                {copied ? '✓' : '📋'}
              </button>
              
              <div style={{ width: '100%', height: 'calc(100% - 30px)' }}>
                <GaugeComponent
                  key={key}
                  {...config}
                  value={value}
                  onValueChange={interactionEnabled ? setValue : undefined}
                />
              </div>
              
              {interactionEnabled && (
                <div style={styles.dragHint}>
                  💡 Drag the pointer to set value
                </div>
              )}
              
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
};
