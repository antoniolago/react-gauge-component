import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { SandboxEditor, GalleryGrid } from './components';
import { createStyles } from './styles';

/**
 * GaugeGallery - Interactive showcase for the GaugeComponent library
 * 
 * Features:
 * - Sandbox editor with live configuration
 * - Preset gallery with various gauge styles
 * - Theme toggle (light/dark)
 * - Auto-animate toggle
 * - Copy-to-clipboard functionality
 */
const GaugeGallery: React.FC = () => {
  const [isLightTheme, setIsLightTheme] = useState(false);
  const [autoAnimate, setAutoAnimate] = useState(false);
  
  const themeStyles = createStyles(isLightTheme);

  return (
    <div style={themeStyles.container}>
      {/* Header */}
      <header style={themeStyles.header}>
        <h1 style={themeStyles.title}>React Gauge Component</h1>
        <p style={themeStyles.subtitle}>
          A highly customizable gauge component for React applications
        </p>
        
        {/* Controls */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '20px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setIsLightTheme(!isLightTheme)}
            style={{
              padding: '10px 20px',
              borderRadius: '20px',
              border: 'none',
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: 600,
            }}
            type="button"
          >
            {isLightTheme ? '🌙 Dark' : '☀️ Light'}
          </button>
          
          <button
            onClick={() => setAutoAnimate(!autoAnimate)}
            style={{
              padding: '10px 20px',
              borderRadius: '20px',
              border: 'none',
              background: autoAnimate 
                ? 'linear-gradient(90deg, #00d9ff, #00ff88)' 
                : 'rgba(255, 255, 255, 0.1)',
              color: autoAnimate ? '#1a1a2e' : '#fff',
              cursor: 'pointer',
              fontWeight: 600,
            }}
            type="button"
          >
            {autoAnimate ? '⏸️ Pause' : '▶️ Animate'}
          </button>
        </div>
      </header>

      {/* Sandbox Editor */}
      <SandboxEditor isLightTheme={isLightTheme} />

      {/* Gallery Grid */}
      <GalleryGrid isLightTheme={isLightTheme} autoAnimate={autoAnimate} />
    </div>
  );
};

export default GaugeGallery;
