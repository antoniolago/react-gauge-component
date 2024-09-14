import React from 'react';
import './App.css';
import MainPreviews from './TestComponent/MainPreviews';
import InputTest from './TestComponent/InputTest';
import GridLayoutComponent from './TestComponent/GridLayout';
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css';

const App = () => {
  return(
    <>
    {/* <GridLayoutComponent /> */}
      <MainPreviews />
      <InputTest />
    </>
  )
};

export default App
