import React, { useState } from 'react';
import GaugeComponent from '../../../lib';
import { styles, createStyles } from '../styles';
import { copyToClipboard } from '../utils';
import { GaugePreset } from '../types';
import { GaugeComponentProps } from '../../../lib/GaugeComponent/types/GaugeComponentProps';
import { Send, Copy, Check } from 'lucide-react';

interface GaugeCardProps {
  preset: GaugePreset;
  value: number;
  cardHeight: string;
  isLightTheme: boolean;
  onSendToEditor?: (config: Partial<GaugeComponentProps>, value: number) => void;
}

export const GaugeCard: React.FC<GaugeCardProps> = ({ 
  preset, 
  value, 
  cardHeight, 
  isLightTheme,
  onSendToEditor
}) => {
  const [copied, setCopied] = useState(false);
  const themeStyles = createStyles(isLightTheme);

  const handleCopy = () => {
    copyToClipboard(preset.config, value, () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleSendToEditor = () => {
    onSendToEditor?.(preset.config, value);
  };

  return (
    <div style={{ ...themeStyles.gaugeCard, height: cardHeight }}>
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
          <Send size={12} />
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
        <GaugeComponent {...preset.config} value={value} />
      </div>
    </div>
  );
};
