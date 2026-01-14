import React, { useState, useEffect } from 'react';
import { GaugeCard } from './GaugeCard';
import { styles, createStyles } from '../styles';
import { GAUGE_PRESETS } from '../presets';
import { ColumnCount } from '../types';
import { GaugeComponentProps } from '../../../lib/GaugeComponent/types/GaugeComponentProps';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface GalleryGridProps {
  isLightTheme: boolean;
  autoAnimate: boolean;
  onSendToEditor?: (config: Partial<GaugeComponentProps>, value: number) => void;
}

const GRID_CONFIGS = {
  1: { columns: 'repeat(1, 1fr)', cardHeight: '450px' },
  2: { columns: 'repeat(2, 1fr)', cardHeight: '380px' },
  3: { columns: 'repeat(3, 1fr)', cardHeight: '320px' },
  4: { columns: 'repeat(4, 1fr)', cardHeight: '280px' },
};

export const GalleryGrid: React.FC<GalleryGridProps> = ({ isLightTheme, autoAnimate, onSendToEditor }) => {
  const [columnCount, setColumnCount] = useState<ColumnCount>(4);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(() => new Set(GAUGE_PRESETS.map((_, i) => i))); // All items expanded by default
  const themeStyles = createStyles(isLightTheme);

  // Handle responsive column count
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setColumnCount(1);
    };
    
    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  // Helper to extract config from preset component
  const getPresetConfig = (preset: typeof GAUGE_PRESETS[0]) => {
    const element = preset.component(0);
    return element.props;
  };

  const [values, setValues] = useState<number[]>(() => 
    GAUGE_PRESETS.map(preset => {
      const config = getPresetConfig(preset);
      const min = config?.minValue ?? 0;
      const max = config?.maxValue ?? 100;
      return min + (max - min) * 0.5;
    })
  );

  // Staggered animation for better performance
  useEffect(() => {
    if (!autoAnimate) return;
    
    const STAGGER_DELAY = 100;
    const CYCLE_INTERVAL = 4000;
    const BATCH_SIZE = 4;
    
    let timeouts: ReturnType<typeof setTimeout>[] = [];
    
    const runAnimationCycle = () => {
      timeouts.forEach(clearTimeout);
      timeouts = [];
      
      const totalBatches = Math.ceil(GAUGE_PRESETS.length / BATCH_SIZE);
      
      for (let batch = 0; batch < totalBatches; batch++) {
        const timeout = setTimeout(() => {
          setValues(prev => {
            const next = [...prev];
            const startIdx = batch * BATCH_SIZE;
            const endIdx = Math.min(startIdx + BATCH_SIZE, GAUGE_PRESETS.length);
            
            for (let idx = startIdx; idx < endIdx; idx++) {
              const config = getPresetConfig(GAUGE_PRESETS[idx]);
              const min = config?.minValue ?? 0;
              const max = config?.maxValue ?? 100;
              next[idx] = min + Math.random() * (max - min);
            }
            return next;
          });
        }, batch * STAGGER_DELAY);
        
        timeouts.push(timeout);
      }
    };
    
    runAnimationCycle();
    const interval = setInterval(runAnimationCycle, CYCLE_INTERVAL);
    
    return () => {
      clearInterval(interval);
      timeouts.forEach(clearTimeout);
    };
  }, [autoAnimate]);

  const gridConfig = GRID_CONFIGS[columnCount];

  const toggleAccordion = (index: number) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedItems(new Set(GAUGE_PRESETS.map((_, i) => i)));
  };

  const collapseAll = () => {
    setExpandedItems(new Set());
  };

  // Mobile accordion view
  if (isMobile) {
    return (
      <div style={styles.gallerySection}>
        <div style={styles.galleryHeader}>
          <h2 style={styles.galleryTitle}>Gauge Gallery</h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={expandAll}
              style={{
                padding: '6px 12px',
                fontSize: '0.75rem',
                fontWeight: 500,
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                background: isLightTheme ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.1)',
                color: isLightTheme ? '#333' : 'rgba(255, 255, 255, 0.8)',
              }}
              type="button"
            >
              Expand All
            </button>
            <button
              onClick={collapseAll}
              style={{
                padding: '6px 12px',
                fontSize: '0.75rem',
                fontWeight: 500,
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                background: isLightTheme ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.1)',
                color: isLightTheme ? '#333' : 'rgba(255, 255, 255, 0.8)',
              }}
              type="button"
            >
              Collapse All
            </button>
          </div>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {GAUGE_PRESETS.map((preset, index) => {
            const isExpanded = expandedItems.has(index);
            return (
              <div
                key={preset.name}
                style={{
                  background: isLightTheme 
                    ? 'rgba(0, 0, 0, 0.04)'
                    : 'rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  border: isLightTheme 
                    ? '1px solid rgba(0, 0, 0, 0.08)'
                    : '1px solid rgba(255, 255, 255, 0.1)',
                  overflow: 'hidden',
                }}
              >
                {/* Accordion Header */}
                <button
                  onClick={() => toggleAccordion(index)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '14px 16px',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: isLightTheme ? '#333' : '#fff',
                  }}
                  type="button"
                >
                  <div style={{ textAlign: 'left' }}>
                    <div style={{
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      marginBottom: '2px',
                    }}>
                      {preset.name}
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: isLightTheme ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.5)',
                    }}>
                      {preset.description}
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                
                {/* Accordion Content */}
                {isExpanded && (
                  <div style={{ padding: '0 12px 12px' }}>
                    <GaugeCard
                      preset={preset}
                      value={values[index]}
                      cardHeight="250px"
                      isLightTheme={isLightTheme}
                      onSendToEditor={onSendToEditor}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Desktop grid view
  return (
    <div style={styles.gallerySection}>
      <div style={styles.galleryHeader}>
        <h2 style={styles.galleryTitle}>Gauge Gallery</h2>
        <div style={styles.galleryControls}>
          {([1, 2, 3, 4] as ColumnCount[]).map((count) => (
            <button
              key={count}
              onClick={() => setColumnCount(count)}
              style={{
                ...styles.columnBtn,
                ...(columnCount === count ? styles.columnBtnActive : {}),
              }}
              type="button"
            >
              {count}×
            </button>
          ))}
        </div>
      </div>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: gridConfig.columns,
        gap: '16px',
      }}>
        {GAUGE_PRESETS.map((preset, index) => (
          <GaugeCard
            key={preset.name}
            preset={preset}
            value={values[index]}
            cardHeight={gridConfig.cardHeight}
            isLightTheme={isLightTheme}
            onSendToEditor={onSendToEditor}
          />
        ))}
      </div>
    </div>
  );
};
