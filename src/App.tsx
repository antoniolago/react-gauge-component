import React, { useEffect, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import './App.css';
import GaugeComponent from './lib';
import CONSTANTS from './lib/GaugeComponent/constants';
import MainPreviews from './TestComponent/MainPreviews';
import InputTest from './TestComponent/InputTest';

const App = () => {
  return(
    <>
      <MainPreviews />
      <InputTest />
    </>
  )
};

export default App
