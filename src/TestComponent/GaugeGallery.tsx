import React, { useState, useEffect, useCallback } from 'react';
import GaugeComponent from '../lib';

// Gauge presets with different styles
const GAUGE_PRESETS = [
  {
    name: 'Speedometer',
    description: 'Classic speedometer with gradient arc',
    config: {
      type: 'semicircle' as const,
      arc: {
        gradient: true,
        width: 0.15,
        subArcs: [
          { limit: 30, color: '#5BE12C' },
          { limit: 70, color: '#F5CD19' },
          { color: '#EA4228' },
        ],
      },
      pointer: { type: 'needle' as const, color: '#1a1a2e', length: 0.8, width: 15 },
      labels: {
        valueLabel: { formatTextValue: (v: number) => `${v} km/h`, style: { fontSize: '28px', fill: '#1a1a2e' } },
        tickLabels: {
          type: 'outer' as const,
          ticks: [{ value: 0 }, { value: 20 }, { value: 40 }, { value: 60 }, { value: 80 }, { value: 100 }],
        },
      },
    },
  },
  {
    name: 'Temperature',
    description: 'Temperature gauge with color zones',
    config: {
      type: 'semicircle' as const,
      minValue: -20,
      maxValue: 50,
      arc: {
        width: 0.2,
        padding: 0.005,
        cornerRadius: 1,
        subArcs: [
          { limit: 0, color: '#00bcd4', showTick: true },
          { limit: 15, color: '#4caf50', showTick: true },
          { limit: 25, color: '#8bc34a', showTick: true },
          { limit: 35, color: '#ff9800', showTick: true },
          { color: '#f44336' },
        ],
      },
      pointer: { type: 'blob' as const, color: '#333', animationDelay: 0 },
      labels: {
        valueLabel: { formatTextValue: (v: number) => `${v}°C`, style: { fontSize: '32px' } },
        tickLabels: {
          type: 'outer' as const,
          defaultTickValueConfig: { formatTextValue: (v: number) => `${v}°` },
        },
      },
    },
  },
  {
    name: 'Battery',
    description: 'Simple battery level indicator',
    config: {
      type: 'grafana' as const,
      arc: {
        width: 0.25,
        padding: 0.02,
        subArcs: [
          { limit: 20, color: '#EA4228', showTick: true },
          { limit: 40, color: '#F58B19', showTick: true },
          { limit: 60, color: '#F5CD19', showTick: true },
          { limit: 100, color: '#5BE12C', showTick: true },
        ],
      },
      pointer: { type: 'arrow' as const, color: '#1a1a2e' },
      labels: {
        valueLabel: { formatTextValue: (v: number) => `${v}%`, matchColorWithArc: true },
      },
    },
  },
  {
    name: 'CPU Usage',
    description: 'Radial gauge with smooth gradient',
    config: {
      type: 'radial' as const,
      arc: {
        width: 0.2,
        nbSubArcs: 30,
        colorArray: ['#00c853', '#ffeb3b', '#ff5722'],
        padding: 0.01,
      },
      pointer: { type: 'needle' as const, color: '#263238', elastic: true, animationDelay: 0 },
      labels: {
        valueLabel: { formatTextValue: (v: number) => `${v}%`, style: { fontSize: '24px' } },
        tickLabels: {
          type: 'inner' as const,
          ticks: [{ value: 0 }, { value: 25 }, { value: 50 }, { value: 75 }, { value: 100 }],
        },
      },
    },
  },
  {
    name: 'Performance',
    description: 'Stylish performance meter',
    config: {
      type: 'semicircle' as const,
      arc: {
        width: 0.12,
        padding: 0.02,
        subArcs: [
          { limit: 15, color: '#e91e63' },
          { limit: 35, color: '#9c27b0' },
          { limit: 55, color: '#673ab7' },
          { limit: 75, color: '#3f51b5' },
          { color: '#2196f3' },
        ],
      },
      pointer: { type: 'blob' as const, color: '#1a237e', elastic: true, strokeWidth: 5 },
      labels: {
        valueLabel: { style: { fontSize: '30px', fill: '#1a237e' } },
      },
    },
  },
  {
    name: 'Minimalist',
    description: 'Clean and minimal design',
    config: {
      type: 'semicircle' as const,
      arc: {
        width: 0.08,
        padding: 0,
        subArcs: [{ color: '#37474f' }],
      },
      pointer: { type: 'needle' as const, color: '#37474f', length: 0.7, width: 10 },
      labels: {
        valueLabel: { style: { fontSize: '36px', fill: '#37474f' } },
        tickLabels: { hideMinMax: true },
      },
    },
  },
  {
    name: 'Fuel Gauge',
    description: 'Car-style fuel indicator',
    config: {
      type: 'semicircle' as const,
      arc: {
        width: 0.18,
        subArcs: [
          { limit: 25, color: '#EA4228', showTick: true },
          { color: '#5BE12C' },
        ],
      },
      pointer: { type: 'arrow' as const, color: '#333', width: 20 },
      labels: {
        valueLabel: { hide: true },
        tickLabels: {
          type: 'outer' as const,
          ticks: [{ value: 0 }, { value: 50 }, { value: 100 }],
          defaultTickValueConfig: { formatTextValue: (v: number) => v === 0 ? 'E' : v === 100 ? 'F' : '' },
        },
      },
    },
  },
  {
    name: 'Progress Ring',
    description: 'Modern progress indicator',
    config: {
      type: 'radial' as const,
      arc: {
        width: 0.35,
        nbSubArcs: 1,
        colorArray: ['#00e676'],
        padding: 0,
        cornerRadius: 0,
      },
      pointer: { hide: true },
      labels: {
        valueLabel: { 
          formatTextValue: (v: number) => `${v}%`, 
          style: { fontSize: '42px', fill: '#00e676', fontWeight: 'bold' },
        },
        tickLabels: { hideMinMax: true },
      },
    },
  },
];

// Generate random gauge config
const generateRandomConfig = () => {
  const types = ['semicircle', 'radial', 'grafana'] as const;
  const pointerTypes = ['needle', 'blob', 'arrow'] as const;
  
  const colors = [
    ['#5BE12C', '#F5CD19', '#EA4228'],
    ['#00bcd4', '#4caf50', '#ff5722'],
    ['#e91e63', '#9c27b0', '#2196f3'],
    ['#ff6f00', '#ff8f00', '#ffc107'],
    ['#00c853', '#69f0ae', '#b9f6ca'],
    ['#d500f9', '#651fff', '#3d5afe'],
    ['#1de9b6', '#00e5ff', '#00b0ff'],
    ['#ff1744', '#ff5252', '#ff8a80'],
  ];
  
  const randomType = types[Math.floor(Math.random() * types.length)];
  const randomPointer = pointerTypes[Math.floor(Math.random() * pointerTypes.length)];
  const randomColors = colors[Math.floor(Math.random() * colors.length)];
  const useGradient = Math.random() > 0.5;
  const arcWidth = 0.1 + Math.random() * 0.25;
  
  return {
    type: randomType,
    arc: {
      width: arcWidth,
      ...(useGradient ? {
        gradient: true,
        subArcs: randomColors.map((color, i) => ({ 
          limit: ((i + 1) / randomColors.length) * 100, 
          color 
        })),
      } : {
        nbSubArcs: 15 + Math.floor(Math.random() * 40),
        colorArray: randomColors,
        padding: 0.01 + Math.random() * 0.02,
      }),
    },
    pointer: {
      type: randomPointer,
      elastic: Math.random() > 0.5,
      animationDelay: Math.random() > 0.5 ? 0 : 200,
    },
    labels: {
      valueLabel: {
        formatTextValue: (v: number) => `${v}`,
        matchColorWithArc: Math.random() > 0.5,
      },
    },
  };
};

// Helper to stringify config for copy
const stringifyConfig = (config: any, value: number): string => {
  const replacer = (key: string, val: any) => {
    if (typeof val === 'function') {
      const fnStr = val.toString();
      return fnStr.includes('=>') ? fnStr : `function ${fnStr}`;
    }
    return val;
  };
  
  try {
    const cleanConfig = JSON.parse(JSON.stringify(config, replacer));
    return `<GaugeComponent
  value={${value}}
  ${JSON.stringify(cleanConfig, null, 2).slice(1, -1).trim().replace(/\n/g, '\n  ')}
/>`;
  } catch {
    return `<GaugeComponent value={${value}} {...config} />`;
  }
};

const GaugeGallery: React.FC = () => {
  const [values, setValues] = useState<number[]>(GAUGE_PRESETS.map(() => 50));
  const [randomConfig, setRandomConfig] = useState(() => generateRandomConfig());
  const [randomValue, setRandomValue] = useState(50);
  const [autoAnimate, setAutoAnimate] = useState(true);
  const [copiedIndex, setCopiedIndex] = useState<number | 'random' | null>(null);
  const [randomKey, setRandomKey] = useState(0); // Key to force re-render
  const [showEditor, setShowEditor] = useState(false);
  const [editorValue, setEditorValue] = useState('');

  // Auto-animate values
  useEffect(() => {
    if (!autoAnimate) return;
    
    const interval = setInterval(() => {
      setValues(prev => prev.map(() => Math.floor(Math.random() * 100)));
      setRandomValue(Math.floor(Math.random() * 100));
    }, 3000);
    
    return () => clearInterval(interval);
  }, [autoAnimate]);

  const handleRandomize = useCallback(() => {
    try {
      const newConfig = generateRandomConfig();
      setRandomConfig(newConfig);
      setRandomValue(Math.floor(Math.random() * 100));
      setRandomKey(prev => prev + 1); // Force complete re-render
      setEditorValue(JSON.stringify(newConfig, null, 2));
    } catch (error) {
      console.error('Error generating config:', error);
    }
  }, []);

  // Initialize editor value
  useEffect(() => {
    setEditorValue(JSON.stringify(randomConfig, null, 2));
  }, []);

  // Handle config changes from editor
  const handleEditorChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditorValue(e.target.value);
  }, []);

  const applyEditorConfig = useCallback(() => {
    try {
      const parsed = JSON.parse(editorValue);
      setRandomConfig(parsed);
      setRandomKey(prev => prev + 1); // Force re-render with new config
    } catch (error) {
      console.error('Invalid JSON:', error);
      alert('Invalid JSON configuration');
    }
  }, [editorValue]);

  const copyToClipboard = useCallback(async (config: any, value: number, index: number | 'random') => {
    try {
      const code = stringifyConfig(config, value);
      
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(code);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = code;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  }, []);

  const handleCardClick = useCallback((e: React.MouseEvent, config: any, value: number, index: number | 'random') => {
    e.stopPropagation();
    copyToClipboard(config, value, index);
  }, [copyToClipboard]);

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.title}>
            <span style={styles.titleIcon}>📊</span>
            React Gauge Component
          </h1>
          <p style={styles.subtitle}>
            Beautiful, customizable gauge charts for React applications
          </p>
          <div style={styles.badges}>
            <a href="https://github.com/antoniolago/react-gauge-component" target="_blank" rel="noopener noreferrer" style={styles.badge}>
              ⭐ GitHub
            </a>
            <a href="https://www.npmjs.com/package/react-gauge-component" target="_blank" rel="noopener noreferrer" style={styles.badge}>
              📦 npm
            </a>
          </div>
        </div>
      </header>

      {/* Controls */}
      <div style={styles.controls}>
        <label style={styles.toggleLabel}>
          <input 
            type="checkbox" 
            checked={autoAnimate} 
            onChange={(e) => setAutoAnimate(e.target.checked)}
            style={styles.checkbox}
          />
          <span style={styles.toggleText}>Auto-animate values</span>
        </label>
        <span style={styles.hint}>Click any gauge to copy its code!</span>
      </div>

      {/* Randomizer Section */}
      <section style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>🎲 Playground</h2>
          <div style={styles.headerButtons}>
            <button 
              onClick={() => setShowEditor(!showEditor)} 
              style={styles.editorToggle}
              type="button"
            >
              {showEditor ? '📊 Hide Editor' : '⚙️ Edit Config'}
            </button>
            <button 
              onClick={handleRandomize} 
              style={styles.randomButton}
              type="button"
            >
              🎲 Randomize
            </button>
          </div>
        </div>
        <div style={styles.playgroundContainer}>
          {/* Gauge Display */}
          <div 
            style={{
              ...styles.randomizerCard,
              ...(copiedIndex === 'random' ? styles.copiedCard : {}),
              flex: showEditor ? '1' : 'none',
              maxWidth: showEditor ? '50%' : '100%',
            }}
            onClick={(e) => handleCardClick(e, randomConfig, randomValue, 'random')}
          >
            <div style={styles.randomGaugeContainer}>
              <GaugeComponent key={randomKey} value={randomValue} {...randomConfig} />
            </div>
            <div style={styles.copyOverlay}>
              {copiedIndex === 'random' ? (
                <span style={styles.copiedText}>✓ Copied!</span>
              ) : (
                <span style={styles.copyHint}>Click to copy code</span>
              )}
            </div>
          </div>
          
          {/* Config Editor */}
          {showEditor && (
            <div style={styles.editorPanel}>
              <div style={styles.editorHeader}>
                <span style={styles.editorTitle}>Configuration (JSON)</span>
                <button onClick={applyEditorConfig} style={styles.applyButton} type="button">
                  Apply Changes
                </button>
              </div>
              <div style={styles.editorInputRow}>
                <label style={styles.valueLabel}>Value:</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={randomValue}
                  onChange={(e) => setRandomValue(Number(e.target.value))}
                  style={styles.valueInput}
                />
              </div>
              <textarea
                value={editorValue}
                onChange={handleEditorChange}
                style={styles.editorTextarea}
                spellCheck={false}
              />
            </div>
          )}
        </div>
      </section>

      {/* Gallery Section */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>🎨 Preset Gallery</h2>
        <div style={styles.gallery}>
          {GAUGE_PRESETS.map((preset, index) => (
            <div 
              key={index} 
              style={{
                ...styles.gaugeCard,
                ...(copiedIndex === index ? styles.copiedCard : {}),
              }}
              onClick={(e) => handleCardClick(e, preset.config, values[index], index)}
            >
              <div style={styles.gaugeWrapper}>
                <GaugeComponent value={values[index]} {...preset.config} />
              </div>
              <div style={styles.cardInfo}>
                <h3 style={styles.cardTitle}>{preset.name}</h3>
                <p style={styles.cardDescription}>{preset.description}</p>
                {copiedIndex === index ? (
                  <span style={styles.copiedBadge}>✓ Copied!</span>
                ) : (
                  <span style={styles.clickToCopy}>Click to copy</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Resize Demo */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>📐 Responsive Resize</h2>
        <p style={styles.sectionDescription}>
          Drag the corner to resize the container and see the gauge adapt smoothly.
        </p>
        <div style={styles.resizeDemo}>
          <GaugeComponent 
            value={values[0]} 
            type="semicircle"
            arc={{
              width: 0.2,
              subArcs: [
                { limit: 33, color: '#5BE12C' },
                { limit: 66, color: '#F5CD19' },
                { color: '#EA4228' },
              ],
            }}
          />
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <p>Made with ❤️ by <a href="https://github.com/antoniolago" style={styles.footerLink}>Antonio Lago</a></p>
        <p style={styles.footerSmall}>MIT License • Open Source</p>
      </footer>
    </div>
  );
};

// Styles
const styles: Record<string, React.CSSProperties> = {
  container: {
    fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', sans-serif",
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    minHeight: '100vh',
    color: '#fff',
  },
  header: {
    background: 'rgba(0, 0, 0, 0.3)',
    backdropFilter: 'blur(10px)',
    padding: '40px 20px',
    textAlign: 'center',
  },
  headerContent: {
    maxWidth: '800px',
    margin: '0 auto',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 700,
    margin: '0 0 10px 0',
    background: 'linear-gradient(90deg, #00d9ff, #00ff88)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  titleIcon: {
    marginRight: '10px',
  },
  subtitle: {
    fontSize: '1.1rem',
    color: 'rgba(255, 255, 255, 0.7)',
    margin: '0 0 20px 0',
  },
  badges: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center',
  },
  badge: {
    background: 'rgba(255, 255, 255, 0.1)',
    padding: '8px 16px',
    borderRadius: '20px',
    color: '#fff',
    textDecoration: 'none',
    fontSize: '0.9rem',
    transition: 'all 0.3s ease',
  },
  controls: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '20px',
    padding: '20px',
    flexWrap: 'wrap',
  },
  toggleLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer',
    background: 'rgba(255, 255, 255, 0.1)',
    padding: '10px 20px',
    borderRadius: '25px',
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
  },
  toggleText: {
    fontSize: '0.95rem',
  },
  hint: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: '0.9rem',
  },
  section: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '30px 20px',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '15px',
  },
  sectionTitle: {
    fontSize: '1.8rem',
    fontWeight: 600,
    margin: 0,
  },
  sectionDescription: {
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: '20px',
  },
  randomButton: {
    background: 'linear-gradient(90deg, #00d9ff, #00ff88)',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '25px',
    color: '#1a1a2e',
    fontWeight: 600,
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    boxShadow: '0 4px 15px rgba(0, 217, 255, 0.3)',
  },
  headerButtons: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  editorToggle: {
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    padding: '12px 24px',
    borderRadius: '25px',
    color: '#fff',
    fontWeight: 600,
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  playgroundContainer: {
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap',
  },
  editorPanel: {
    flex: '1',
    minWidth: '300px',
    background: 'rgba(0, 0, 0, 0.3)',
    borderRadius: '16px',
    padding: '20px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  editorHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
    flexWrap: 'wrap',
    gap: '10px',
  },
  editorTitle: {
    fontSize: '1rem',
    fontWeight: 600,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  applyButton: {
    background: 'linear-gradient(90deg, #00ff88, #00d9ff)',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '20px',
    color: '#1a1a2e',
    fontWeight: 600,
    fontSize: '0.9rem',
    cursor: 'pointer',
  },
  editorInputRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '15px',
  },
  valueLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '0.9rem',
  },
  valueInput: {
    width: '80px',
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    background: 'rgba(255, 255, 255, 0.1)',
    color: '#fff',
    fontSize: '1rem',
  },
  editorTextarea: {
    width: '100%',
    height: '300px',
    padding: '15px',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    background: 'rgba(0, 0, 0, 0.4)',
    color: '#00ff88',
    fontSize: '0.85rem',
    fontFamily: 'Monaco, Consolas, "Courier New", monospace',
    lineHeight: '1.5',
    resize: 'vertical',
    boxSizing: 'border-box' as const,
  },
  randomizerCard: {
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '20px',
    padding: '20px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  randomGaugeContainer: {
    height: '220px',
    width: '100%',
    maxWidth: '400px',
    margin: '0 auto',
    overflow: 'hidden',
    position: 'relative',
  },
  copyOverlay: {
    textAlign: 'center',
    marginTop: '15px',
  },
  copyHint: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: '0.9rem',
  },
  copiedText: {
    color: '#00ff88',
    fontSize: '1.1rem',
    fontWeight: 600,
  },
  copiedCard: {
    borderColor: '#00ff88',
    boxShadow: '0 0 25px rgba(0, 255, 136, 0.4)',
  },
  gallery: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '20px',
  },
  gaugeCard: {
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '16px',
    padding: '15px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  gaugeWrapper: {
    height: '160px',
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
  },
  cardInfo: {
    textAlign: 'center',
    marginTop: '10px',
  },
  cardTitle: {
    fontSize: '1rem',
    fontWeight: 600,
    margin: '0 0 4px 0',
  },
  cardDescription: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: '0.8rem',
    margin: '0 0 8px 0',
  },
  clickToCopy: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: '0.75rem',
  },
  copiedBadge: {
    color: '#00ff88',
    fontSize: '0.85rem',
    fontWeight: 600,
  },
  resizeDemo: {
    width: '350px',
    height: '220px',
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '16px',
    padding: '15px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    resize: 'both',
    overflow: 'hidden',
    minWidth: '180px',
    minHeight: '120px',
    maxWidth: '100%',
  },
  footer: {
    textAlign: 'center',
    padding: '40px 20px',
    background: 'rgba(0, 0, 0, 0.2)',
    marginTop: '50px',
  },
  footerLink: {
    color: '#00d9ff',
    textDecoration: 'none',
  },
  footerSmall: {
    fontSize: '0.85rem',
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: '10px',
  },
};

export default GaugeGallery;
