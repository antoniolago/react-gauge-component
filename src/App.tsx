import React, { useState } from 'react';
import './App.css';
import MainPreviews from './TestComponent/MainPreviews';
import InputTest from './TestComponent/InputTest';
import GridLayoutComponent from './TestComponent/GridLayout';
import RefactoringDemo from './TestComponent/RefactoringDemo';
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css';
import GaugeComponent from './lib';

const App = () => {
  const [showDemo, setShowDemo] = useState(false);
  
  return (
    <>
      <div style={{ padding: '10px', background: '#4CAF50', color: 'white' }}>
        <button 
          onClick={() => setShowDemo(!showDemo)}
          style={{ 
            padding: '10px 20px', 
            fontSize: '16px', 
            cursor: 'pointer',
            background: 'white',
            color: '#4CAF50',
            border: 'none',
            borderRadius: '4px',
            fontWeight: 'bold'
          }}
        >
          {showDemo ? '← Back to Grid Layout' : '🎯 View Refactoring Demo'}
        </button>
      </div>
      
      {showDemo ? (
        <RefactoringDemo />
      ) : (
        <>
          <GridLayoutComponent />
          <MainPreviews />
          {/* <GaugeComponent /> */}
          
          {/* <InputTest /> */}
        </>
      )}
    </>
  )
};

export default App
