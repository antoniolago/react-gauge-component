import React, { useState, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { SandboxEditor, GalleryGrid, SandboxEditorHandle } from './components';
import { createStyles } from './styles';
import { Sun, Moon } from 'lucide-react';
import { GaugeComponentProps } from '../../lib/GaugeComponent/types/GaugeComponentProps';

// GitHub icon SVG component
const GitHubIcon: React.FC<{ size?: number }> = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
);

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
  const sandboxEditorRef = useRef<SandboxEditorHandle>(null);
  
  const themeStyles = createStyles(isLightTheme);

  const handleSendToEditor = (config: Partial<GaugeComponentProps>, value: number) => {
    sandboxEditorRef.current?.loadConfig(config, value);
    // Scroll to top to show editor
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={themeStyles.container}>
      {/* Fixed Header */}
      <header style={themeStyles.fixedHeader}>
        <div style={themeStyles.headerContent}>
          <h1 style={themeStyles.headerTitle}>React Gauge Component</h1>
          
          <div style={themeStyles.headerControls}>
            <label style={themeStyles.animateCheckbox}>
              <input
                type="checkbox"
                checked={autoAnimate}
                onChange={(e) => setAutoAnimate(e.target.checked)}
                style={{ marginRight: '6px', accentColor: '#3b82f6' }}
              />
              Animate
            </label>
            
            <button
              onClick={() => setIsLightTheme(!isLightTheme)}
              style={themeStyles.iconButton}
              title={isLightTheme ? 'Switch to dark mode' : 'Switch to light mode'}
              type="button"
            >
              {isLightTheme ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            
            <a
              href="https://github.com/antoniolago/react-gauge-component"
              target="_blank"
              rel="noopener noreferrer"
              style={themeStyles.iconButton}
              title="View on GitHub"
            >
              <GitHubIcon size={18} />
            </a>
          </div>
        </div>
      </header>
      
      {/* Spacer for fixed header */}
      <div style={{ height: '56px' }} />

      {/* Sandbox Editor */}
      <SandboxEditor ref={sandboxEditorRef} isLightTheme={isLightTheme} />

      {/* Gallery Grid */}
      <GalleryGrid 
        isLightTheme={isLightTheme} 
        autoAnimate={autoAnimate} 
        onSendToEditor={handleSendToEditor}
      />
    </div>
  );
};

export default GaugeGallery;
