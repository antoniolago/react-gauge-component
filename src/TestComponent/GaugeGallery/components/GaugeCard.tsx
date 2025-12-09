import React, { useState } from 'react';
import GaugeComponent from '../../../lib';
import { styles, createStyles } from '../styles';
import { copyToClipboard } from '../utils';
import { GaugePreset } from '../types';

interface GaugeCardProps {
  preset: GaugePreset;
  value: number;
  cardHeight: string;
  isLightTheme: boolean;
}

export const GaugeCard: React.FC<GaugeCardProps> = ({ 
  preset, 
  value, 
  cardHeight, 
  isLightTheme 
}) => {
  const [copied, setCopied] = useState(false);
  const themeStyles = createStyles(isLightTheme);

  const handleCopy = () => {
    copyToClipboard(preset.config, value, () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div style={{ ...themeStyles.gaugeCard, height: cardHeight }}>
      <button
        onClick={handleCopy}
        style={{
          ...styles.copyButton,
          background: copied ? '#5BE12C' : 'rgba(0, 0, 0, 0.5)',
        }}
        type="button"
      >
        {copied ? '✓' : '📋'}
      </button>
      
      <div style={themeStyles.cardTitle}>{preset.name}</div>
      <div style={themeStyles.cardDescription}>{preset.description}</div>
      
      <div style={{ flex: 1, minHeight: 0 }}>
        <GaugeComponent {...preset.config} value={value} />
      </div>
    </div>
  );
};
