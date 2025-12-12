import React, { useState, useEffect, cloneElement } from 'react';
import { styles, createStyles } from '../styles';
import { copyToClipboardFromJsx } from '../utils';
import { GaugePreset } from '../types';
import { GaugeComponentProps } from '../../../lib/GaugeComponent/types/GaugeComponentProps';
import { Pencil, Copy, Check } from 'lucide-react';

interface GaugeCardProps {
  preset: GaugePreset;
  value: number;
  cardHeight: string;
  isLightTheme: boolean;
  onSendToEditor?: (config: Partial<GaugeComponentProps>, value: number) => void;
}

export const GaugeCard: React.FC<GaugeCardProps> = ({ 
  preset, 
  value: externalValue, 
  cardHeight, 
  isLightTheme,
  onSendToEditor
}) => {
  const [copied, setCopied] = useState(false);
  const [localValue, setLocalValue] = useState(externalValue);
  const themeStyles = createStyles(isLightTheme);

  // Sync with external value when it changes (e.g., from animation)
  useEffect(() => {
    setLocalValue(externalValue);
  }, [externalValue]);

  const handleCopy = () => {
    // Extract props from the rendered component
    const element = preset.component(localValue);
    copyToClipboardFromJsx(element, () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleSendToEditor = () => {
    // Extract config from component props for editor
    const element = preset.component(localValue);
    const config = element.props as Partial<GaugeComponentProps>;
    onSendToEditor?.(config, localValue);
  };

  // Render gauge with onValueChange for drag interaction
  const renderGauge = () => {
    const element = preset.component(localValue);
    // Clone the element and add onValueChange for drag interaction
    return cloneElement(element, {
      ...element.props,
      value: localValue,
      onValueChange: setLocalValue,
    });
  };

  return (
    <div style={{ ...themeStyles.gaugeCard, maxHeight: cardHeight }}>
      {/* Card action buttons */}
      <div style={{
        position: 'absolute',
        top: '8px',
        right: '8px',
        display: 'flex',
        gap: '4px',
        zIndex: 10,
      }}>
        <button
          onClick={handleSendToEditor}
          style={{
            ...styles.copyButton,
            position: 'relative',
            background: 'rgba(59, 130, 246, 0.8)',
          }}
          title="Send to Editor"
          type="button"
        >
          <Pencil size={12} />
        </button>
        <button
          onClick={handleCopy}
          style={{
            ...styles.copyButton,
            position: 'relative',
            background: copied ? '#5BE12C' : 'rgba(0, 0, 0, 0.5)',
          }}
          title="Copy code"
          type="button"
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
        </button>
      </div>
      
      <div style={themeStyles.cardTitle}>{preset.name}</div>
      <div style={themeStyles.cardDescription}>{preset.description}</div>
      
      <div style={{ flex: 1, minHeight: 0, height: '100%' }}>
        {renderGauge()}
      </div>
    </div>
  );
};
