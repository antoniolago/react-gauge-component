import React from 'react';
import './App.css';
import MainPreviews from './TestComponent/MainPreviews';
import InputTest from './TestComponent/InputTest';
import GridLayoutComponent from './TestComponent/GridLayout';
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css';
import GaugeComponent from './lib';

const App = () => {
  return (
    <>
      <GridLayoutComponent />
      <MainPreviews />
      {/* <GaugeComponent /> */}
      
      {/* <InputTest /> */}
    </>
  )
};

export default App
