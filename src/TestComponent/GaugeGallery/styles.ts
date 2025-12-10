import React from 'react';

/**
 * Theme-aware styles for the Gauge Gallery
 */
export const createStyles = (isLightTheme: boolean) => ({
  container: {
    minHeight: '100vh',
    background: isLightTheme 
      ? 'linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)'
      : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    padding: '20px 20px 40px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color: isLightTheme ? '#333' : '#fff',
  },
  fixedHeader: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    height: '48px',
    background: isLightTheme 
      ? 'rgba(255, 255, 255, 0.95)'
      : 'rgba(15, 23, 42, 0.95)',
    backdropFilter: 'blur(8px)',
    borderBottom: isLightTheme 
      ? '1px solid rgba(0, 0, 0, 0.1)'
      : '1px solid rgba(255, 255, 255, 0.1)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    width: '100%',
    maxWidth: '1400px',
    padding: '0 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: '1.1rem',
    fontWeight: 700,
    background: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    margin: 0,
  },
  headerControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  animateCheckbox: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '0.85rem',
    fontWeight: 500,
    color: isLightTheme ? '#333' : 'rgba(255, 255, 255, 0.9)',
    cursor: 'pointer',
  },
  iconButton: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    border: 'none',
    background: isLightTheme 
      ? 'rgba(0, 0, 0, 0.06)'
      : 'rgba(255, 255, 255, 0.1)',
    color: isLightTheme ? '#333' : '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.15s ease',
    textDecoration: 'none',
  },
  header: {
    textAlign: 'center' as const,
    marginBottom: '40px',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 700,
    background: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '10px',
  },
  subtitle: {
    fontSize: '1.1rem',
    color: isLightTheme ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.6)',
  },
  gaugeCard: {
    background: isLightTheme 
      ? 'rgba(0, 0, 0, 0.04)'
      : 'rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    padding: '15px',
    border: isLightTheme 
      ? '1px solid rgba(0, 0, 0, 0.08)'
      : '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: isLightTheme
      ? '0 2px 8px rgba(0, 0, 0, 0.06)'
      : 'none',
    transition: 'all 0.3s ease',
    display: 'flex',
    flexDirection: 'column' as const,
    position: 'relative' as const,
  },
  randomizerCard: {
    background: isLightTheme 
      ? 'rgba(0, 0, 0, 0.03)'
      : 'rgba(255, 255, 255, 0.08)',
    borderRadius: '20px',
    padding: '20px',
    border: isLightTheme 
      ? '1px solid rgba(0, 0, 0, 0.08)'
      : '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: isLightTheme
      ? '0 2px 12px rgba(0, 0, 0, 0.08)'
      : 'none',
    position: 'relative' as const,
  },
  cardTitle: {
    fontSize: '0.9rem',
    fontWeight: 600,
    color: isLightTheme ? '#333' : 'rgba(255, 255, 255, 0.9)',
    marginBottom: '4px',
  },
  cardDescription: {
    fontSize: '0.75rem',
    color: isLightTheme ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.5)',
    marginBottom: '8px',
  },
});

/**
 * Static styles that don't depend on theme
 */
export const styles: Record<string, React.CSSProperties> = {
  // Sandbox section
  sandboxSection: {
    marginBottom: '40px',
    background: 'rgba(0, 0, 0, 0.2)',
    borderRadius: '20px',
    padding: '24px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  sandboxContent: {
    marginTop: '20px',
    animation: 'fadeIn 0.3s ease',
  },
  
  // Accordion
  accordionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    padding: '8px 0',
  },
  accordionTitle: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  accordionArrow: {
    marginLeft: '12px',
    fontSize: '0.8em',
    opacity: 0.7,
  },
  accordionHint: {
    fontSize: '0.85rem',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  
  // Editor Toolbar
  editorToolbar: {
    marginBottom: '16px',
    background: 'rgba(0, 0, 0, 0.3)',
    borderRadius: '12px',
    padding: '12px',
    overflow: 'hidden',
    maxWidth: '100%',
  },
  toolbarGroup: {
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '6px',
    padding: '8px 10px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    margin: '2px',
    overflow: 'hidden',
    wordBreak: 'break-word' as const,
  },
  groupLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.7rem',
    fontWeight: 700,
    color: '#60a5fa',
    marginBottom: '8px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
  buttonRow: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap' as const,
    alignItems: 'center',
  },
  
  // Buttons
  toolBtn: {
    padding: '6px 10px',
    borderRadius: '6px',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    background: 'rgba(255, 255, 255, 0.08)',
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: '0.75rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    flexShrink: 0,
    whiteSpace: 'nowrap' as const,
  },
  toolBtnActive: {
    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    color: '#fff',
    boxShadow: '0 2px 8px rgba(59, 130, 246, 0.4)',
  },
  
  // Sliders
  slider: {
    minWidth: '80px',
    maxWidth: '100%',
    flex: 1,
    height: '8px',
    borderRadius: '3px',
    cursor: 'pointer',
    accentColor: '#3b82f6',
  },
  sliderLabel: {
    fontSize: '0.7rem',
    fontWeight: 600,
    color: 'rgba(255, 255, 255, 0.85)',
    marginLeft: '8px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.3px',
  },
  sliderValue: {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#60a5fa',
    minWidth: '40px',
  },
  
  // Inputs
  inlineLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.75rem',
    color: 'rgba(255, 255, 255, 0.7)',
    cursor: 'pointer',
  },
  inlineCheckbox: {
    width: '14px',
    height: '14px',
    accentColor: '#3b82f6',
  },
  colorPicker: {
    width: '28px',
    height: '28px',
    padding: '0',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '4px',
    cursor: 'pointer',
    background: 'transparent',
  },
  toolbarDivider: {
    width: '1px',
    height: '20px',
    background: 'rgba(255, 255, 255, 0.2)',
    margin: '0 4px',
  },
  
  // Gauge Preview
  gaugePreviewContainer: {
    display: 'flex',
    justifyContent: 'flex-start',
    padding: '20px',
  },
  dragHint: {
    textAlign: 'center' as const,
    fontSize: '0.75rem',
    color: 'rgba(255, 255, 255, 0.5)',
    padding: '8px',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    marginTop: '8px',
  },
  copyCornerBtn: {
    position: 'absolute' as const,
    top: '8px',
    right: '8px',
    width: '32px',
    height: '32px',
    borderRadius: '6px',
    border: 'none',
    background: 'rgba(0, 0, 0, 0.5)',
    color: '#fff',
    fontSize: '1rem',
    cursor: 'pointer',
    zIndex: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  },
  
  // Gallery Grid
  gallerySection: {
    marginTop: '40px',
  },
  galleryHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap' as const,
    gap: '15px',
  },
  galleryTitle: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#fff',
  },
  galleryControls: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
  },
  columnBtn: {
    padding: '8px 12px',
    borderRadius: '8px',
    border: 'none',
    background: 'rgba(255, 255, 255, 0.1)',
    color: '#fff',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  columnBtnActive: {
    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    color: '#fff',
  },
  copyButton: {
    position: 'absolute' as const,
    top: '8px',
    right: '8px',
    padding: '4px 8px',
    borderRadius: '6px',
    border: 'none',
    background: 'rgba(0, 0, 0, 0.5)',
    color: '#fff',
    fontSize: '0.7rem',
    cursor: 'pointer',
    opacity: 0.7,
    transition: 'all 0.2s ease',
  },
};
