import React, { useState, useEffect } from 'react';
import { GaugeCard } from './GaugeCard';
import { styles } from '../styles';
import { GAUGE_PRESETS } from '../presets';
import { ColumnCount } from '../types';
import { GaugeComponentProps } from '../../../lib/GaugeComponent/types/GaugeComponentProps';

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
  const [values, setValues] = useState<number[]>(() => 
    GAUGE_PRESETS.map(preset => {
      const min = (preset.config as any)?.minValue ?? 0;
      const max = (preset.config as any)?.maxValue ?? 100;
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
              const preset = GAUGE_PRESETS[idx]?.config;
              const min = (preset as any)?.minValue ?? 0;
              const max = (preset as any)?.maxValue ?? 100;
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

  return (
    <div style={styles.gallerySection}>
      <div style={styles.galleryHeader}>
        <h2 style={styles.galleryTitle}>Gauge Gallery</h2>
        {!isMobile && (
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
        )}
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
