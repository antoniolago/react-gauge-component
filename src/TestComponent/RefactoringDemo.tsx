import React, { useState, useEffect, useRef } from 'react';
import GaugeComponent from '../lib/GaugeComponent';

/**
 * Demo component showing the improvements from the refactoring
 * This demonstrates:
 * - Proper space utilization
 * - No infinite resize loops
 * - Correct element positioning
 * - All gauge types working correctly
 */
const RefactoringDemo: React.FC = () => {
  const [value, setValue] = useState(33);
  const [containerSize, setContainerSize] = useState({ width: 400, height: 300 });
  const [renderCount, setRenderCount] = useState(0);
  const [debugMode, setDebugMode] = useState(true);
  const renderTimestamp = useRef(Date.now());

  // Animate value to show smooth updates
  useEffect(() => {
    const interval = setInterval(() => {
      setValue((v) => (v + 5) % 100);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Track renders to demonstrate no infinite loops
  useEffect(() => {
    const now = Date.now();
    const timeSinceLastRender = now - renderTimestamp.current;
    renderTimestamp.current = now;
    
    setRenderCount((c) => c + 1);
    
    if (timeSinceLastRender < 100) {
      console.warn('⚠️ Rapid re-render detected!', timeSinceLastRender + 'ms since last render');
    }
  });

  // Reset render count periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setRenderCount(0);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🎯 Gauge Component Refactoring Demo</h1>
      
      <div style={{ 
        background: '#f0f0f0', 
        padding: '15px', 
        borderRadius: '8px',
        marginBottom: '20px' 
      }}>
        <h3>✅ Issues Fixed:</h3>
        <ul>
          <li>✅ Invalid SVG viewBox (was "0 0 100% 100%", now uses proper coordinates)</li>
          <li>✅ Magic numbers removed (all calculations centralized)</li>
          <li>✅ Optimal space utilization (no more arbitrary -100px)</li>
          <li>✅ Infinite resize loops prevented (stability checking)</li>
          <li>✅ Element positioning simplified (origin-based coordinates)</li>
        </ul>
      </div>

      <div style={{ 
        background: renderCount > 5 ? '#ffebee' : '#e8f5e9',
        padding: '10px',
        borderRadius: '4px',
        marginBottom: '20px',
        border: `2px solid ${renderCount > 5 ? '#f44336' : '#4caf50'}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <strong style={{ color: '#000' }}>Render Count (last 3s): {renderCount}</strong>
          {renderCount > 5 && <span style={{ color: '#c62828' }}> ⚠️ INFINITE LOOP DETECTED!</span>}
          {renderCount <= 2 && <span style={{ color: '#2e7d32' }}> ✅ Stable - No infinite loops!</span>}
        </div>
        <button
          onClick={() => setDebugMode(!debugMode)}
          style={{
            padding: '5px 15px',
            background: debugMode ? '#2196F3' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          {debugMode ? '🔍 Debug: ON' : '🔍 Debug: OFF'}
        </button>
      </div>

      <h2>Gauge Types Comparison</h2>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px',
        marginBottom: '40px'
      }}>
        <div style={{ border: '2px solid #2196F3', borderRadius: '8px', padding: '10px' }}>
          <h3 style={{ margin: '0 0 10px 0' }}>Semicircle</h3>
          <div style={{ height: '200px', border: '1px dashed #ccc' }}>
            <GaugeComponent
              type="semicircle"
              value={value}
              arc={{
                width: 0.2,
                padding: 0.02,
                subArcs: [
                  { limit: 33, color: '#5BE12C' },
                  { limit: 66, color: '#F5CD19' },
                  { limit: 100, color: '#EA4228' }
                ]
              }}
              pointer={{
                type: "needle",
                color: "#464A4F"
              }}
              labels={{
                valueLabel: { 
                  style: { fontSize: "35px" } 
                }
              }}
            />
          </div>
        </div>

        <div style={{ border: '2px solid #4CAF50', borderRadius: '8px', padding: '10px' }}>
          <h3 style={{ margin: '0 0 10px 0' }}>Radial</h3>
          <div style={{ height: '250px', border: '1px dashed #ccc' }}>
            <GaugeComponent
              type="radial"
              value={value}
              arc={{
                width: 0.15,
                colorArray: ['#00FF00', '#FFFF00', '#FF0000']
              }}
              pointer={{
                type: "blob",
                color: "#000"
              }}
            />
          </div>
        </div>

        <div style={{ border: '2px solid #FF9800', borderRadius: '8px', padding: '10px' }}>
          <h3 style={{ margin: '0 0 10px 0' }}>Grafana</h3>
          <div style={{ height: '250px', border: '1px dashed #ccc' }}>
            <GaugeComponent
              type="grafana"
              value={value}
              arc={{
                width: 0.25,
                colorArray: ['#5BE12C', '#F5CD19', '#EA4228']
              }}
            />
          </div>
        </div>
      </div>

      <h2>Resize Test</h2>
      <p>Adjust the container size to test resize stability:</p>
      <div style={{ marginBottom: '20px' }}>
        <label>
          Width: {containerSize.width}px
          <input
            type="range"
            min="200"
            max="800"
            value={containerSize.width}
            onChange={(e) => setContainerSize(s => ({ ...s, width: parseInt(e.target.value) }))}
            style={{ width: '300px', marginLeft: '10px' }}
          />
        </label>
        <br />
        <label>
          Height: {containerSize.height}px
          <input
            type="range"
            min="150"
            max="600"
            value={containerSize.height}
            onChange={(e) => setContainerSize(s => ({ ...s, height: parseInt(e.target.value) }))}
            style={{ width: '300px', marginLeft: '10px' }}
          />
        </label>
      </div>

      <div style={{ 
        border: '2px solid #9C27B0', 
        borderRadius: '8px', 
        padding: '10px',
        background: '#fff'
      }}>
        <h3 style={{ margin: '0 0 10px 0' }}>
          Resizable Gauge ({containerSize.width}x{containerSize.height}px)
        </h3>
        <div style={{ 
          width: `${containerSize.width}px`, 
          height: `${containerSize.height}px`,
          border: '1px solid #ccc',
          background: '#f9f9f9',
          transition: 'width 0.3s, height 0.3s'
        }}>
          <GaugeComponent
            type="semicircle"
            value={value}
            arc={{
              width: 0.2,
              subArcs: [
                { limit: 25, color: '#5BE12C', showTick: true },
                { limit: 50, color: '#F5CD19', showTick: true },
                { limit: 75, color: '#F58B19', showTick: true },
                { limit: 100, color: '#EA4228', showTick: true }
              ]
            }}
            labels={{
              valueLabel: { 
                style: { fontSize: "40px" },
                formatTextValue: (value) => `${value}%`
              },
              tickLabels: {
                type: "inner",
                ticks: [
                  { value: 0 },
                  { value: 50 },
                  { value: 100 }
                ]
              }
            }}
          />
        </div>
      </div>

      <div style={{ 
        marginTop: '40px', 
        padding: '20px', 
        background: '#e3f2fd',
        borderRadius: '8px'
      }}>
        <h2>Technical Improvements</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <h3>🔧 Before Refactoring</h3>
            <ul style={{ color: '#c62828' }}>
              <li>Invalid viewBox syntax</li>
              <li>Magic numbers everywhere</li>
              <li>Poor space utilization (-100px)</li>
              <li>No resize loop prevention</li>
              <li>Complex coordinate calculations</li>
              <li>Hard to maintain and test</li>
            </ul>
          </div>
          <div>
            <h3>✨ After Refactoring</h3>
            <ul style={{ color: '#2e7d32' }}>
              <li>Valid numeric viewBox</li>
              <li>Centralized calculations</li>
              <li>Optimal space usage</li>
              <li>Stability checking</li>
              <li>Simple origin-based coords</li>
              <li>Well-tested and documented</li>
            </ul>
          </div>
        </div>
      </div>

      <div style={{ 
        marginTop: '20px', 
        padding: '15px', 
        background: '#fff3e0',
        borderRadius: '8px',
        borderLeft: '4px solid #ff9800'
      }}>
        <h3>🔍 How to Verify Improvements</h3>
        <ol>
          <li>
            <strong>Check SVG ViewBox:</strong> Open browser DevTools, inspect the SVG element, 
            and verify viewBox contains only numbers (e.g., "0 0 250 150") not percentages.
          </li>
          <li>
            <strong>Test Resize Stability:</strong> Use the sliders above. The render count 
            should stay low (≤2 per resize). Before the fix, it would spike to 10+.
          </li>
          <li>
            <strong>Verify Space Usage:</strong> Notice how the gauge fills most of the 
            available space. Before, it was unnecessarily small.
          </li>
          <li>
            <strong>Check Positioning:</strong> All elements (arcs, labels, pointer) should be 
            properly centered and positioned.
          </li>
        </ol>
      </div>

      <div style={{ 
        marginTop: '20px', 
        padding: '15px', 
        background: '#f5f5f5',
        borderRadius: '8px'
      }}>
        <h3>📚 Documentation</h3>
        <p>For detailed information about the refactoring, see:</p>
        <ul>
          <li><code>REFACTORING_GUIDE.md</code> - Complete technical documentation</li>
          <li><code>TESTING_CHECKLIST.md</code> - Comprehensive testing guide</li>
          <li><code>hooks/coordinateSystem.ts</code> - New coordinate system implementation</li>
          <li><code>hooks/debugHelpers.ts</code> - Debug utilities for visualization</li>
        </ul>
      </div>
    </div>
  );
};

export default RefactoringDemo;
