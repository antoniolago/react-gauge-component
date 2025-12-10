import React, { useState, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { SandboxEditor, GalleryGrid } from './components';
import { createStyles } from './styles';
import { Github, Sun, Moon } from 'lucide-react';
import { GaugeComponentProps } from '../../lib/GaugeComponent/types/GaugeComponentProps';

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
  const sandboxEditorRef = useRef<{ loadConfig: (config: Partial<GaugeComponentProps>, value: number) => void }>(null);
  
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
              <Github size={18} />
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
