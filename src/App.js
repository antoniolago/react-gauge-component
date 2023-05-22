import React, { useEffect, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import './App.css';
import GaugeComponent from './lib';
import CONSTANTS from './lib/GaugeComponent/constants';

const App = () => {
  const [currentValue, setCurrentValue] = useState(50);
  const [arcs, setArcs] = useState([{ limit: 30 }, { limit: 50 }, { limit: 100 }])

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentValue(Math.random() * 100);
      // setArcs([{ limit: 30 }, { limit: 35 }, { limit: 100 }])
    }, 3000);

    return () => {
      clearTimeout(timer);
    };
  });
  const kbitsToMbits = (value) => {
    if (value >= 1000) {
      value = value / 1000;
      if (Number.isInteger(value)) {
        return value.toFixed(0) + ' mbit/s';
      } else {
        return value.toFixed(1) + ' mbit/s';
      }
    } else {
      return value.toFixed(0) + ' kbit/s';
    }
  }
  const debugGauge = () => <GaugeComponent
    arc={{
      padding: 0.01,
      // nbSubArcs: 100,
      // colorArray: ['#EA4228', '#EFFF']
      subArcs: [
        { limit: 15, color: '#EA4228', needleColorWhenWithinLimit: '#AA4128', showMark: true },
        { limit: 17, color: '#F5CD19', showMark: true },
        { limit: 28, color: '#5BE12C', showMark: true },
        { limit: 30, color: '#F5CD19', showMark: true },
        { color: '#EA4228' }
      ]
    }}
    needle={{
      color: '#345243',
      length: 0.90,
      width: 15,
      // animate: true,
      // elastic: true,
      animDelay: 200,
    }}
    labels={{
      valueLabel: { formatTextValue: value => value + 'ºC' },
      markLabel: {
        valueConfig: { formatTextValue: value => value + 'ºC', fontSize: 12 },
        marks: [
          { value: 22.5 }
        ]
      }
    }}
    value={100}
    minValue={10}
    maxValue={100}
  />
  return (
    CONSTANTS.debugSingleGauge ?
      <Container>
        <Row>
          <Col lg={{ offset: 2, span: 8 }}>
            <h6 className="mb-1">Single GaugeComponent for debugging</h6>
            {debugGauge()}
          </Col>
          <Col md={4}>
            <h6 className="mb-1">Single GaugeComponent for debugging</h6>
            {debugGauge()}
          </Col>
          <Col md={6}>
            <h6 className="mb-1">Single GaugeComponent for debugging</h6>
            {debugGauge()}
          </Col>
        </Row>
      </Container>
      :
      <>
        <Container fluid>
          <Row>
            <Col xs={12} lg={{ offset: 2, span: 8 }}>
              <h1>React Gauge Component Demo</h1>
            </Col>
          </Row>
          <Row>
            <Col xs={12} lg={12}>
              <p
                className="mx-5"
                style={{ textAlign: 'justify' }}>
                Enhance your projects with this React Gauge chart built with D3 library.
                This component features custom min/max values, marks, and tooltips,
                making it perfect for visualizing various metrics such as speed,
                temperature, charge, and humidity. This data visualization tool can be very useful for React developers looking to create engaging and informative dashboards.
                <br />Documentation at <a href="https://github.com/antoniolago/react-gauge-component" target="_blank">react-gauge-component</a>
              </p>
            </Col>
          </Row>
          <Row>
            <Col xs={12} lg={3}>
              <h6 className="mb-1">Default props</h6>
              <GaugeComponent />
            </Col>
            <Col xs={12} lg={3}>
              <h6 className="mb-1">Gradient arc</h6>
              <GaugeComponent
                id="gauge-component4"
                arc={{
                  gradient: true,
                  padding: 0,
                  subArcs: [
                    {
                      limit: 15,
                      color: '#EA4228',
                      showMark: true
                    },
                    {
                      limit: 37,
                      color: '#F5CD19',
                      showMark: true
                    },
                    {
                      limit: 58,
                      color: '#5BE12C',
                      showMark: true
                    },
                    {
                      limit: 75,
                      color: '#F5CD19',
                      showMark: true
                    },
                    { color: '#EA4228' }
                  ]
                }}
                value={currentValue}
              />
            </Col>
            <Col xs={12} lg={3}>
              <h6 className="mb-1">No animation, custom needle color</h6>
              <GaugeComponent
                id="gauge-component6"
                pointer={{
                  config: { 
                    animate: false,
                    color: '#4A05EC'
                  }
                }}
                arc={{
                  colorArray: ['#830C7336', '#0077FF'],
                  subArcs:
                    [
                      { limit: 20 },
                      { limit: 40 },
                      { limit: 60 },
                      {},
                      {}
                    ]
                }}
                value={currentValue}
              />
            </Col>
            <Col xs={12} lg={3}>
              <h6 className="mb-1">Elastic Live updates</h6>
              <GaugeComponent
                id="gauge-component7"
                arc={{
                  colorArray: ['#00FF15', '#FF2121'],
                  subArcs:
                    [
                      { limit: 40 },
                      { limit: 60},
                      { limit: 70},
                      {},
                      {},
                      {},
                      {}
                    ]
                }}
                pointer={{
                  config: { animationDelay: 0 },
                }}
                value={currentValue}
              />
            </Col>
            <Col xs={12} lg={3}>
              <h6 className="mb-1">Simple Radial Gauge</h6>
              <GaugeComponent
                id="gauge-component-radial3"
                value={currentValue}
                type="radial"
                labels={{
                  markLabel: {
                    marks: [
                      { value: 20 },
                      { value: 50 },
                      { value: 80 },
                      { value: 100 }
                    ]
                  }
                }}
                arc={{
                  colorArray: ['#1EFF00', '#CE1F1F'],
                  subArcs: [
                    {limit: 40},
                    {limit: 50},
                    {},
                    {},
                    {}
                  ],
                  padding: 0.02,
                  width: 0.3
                }}
                pointer={{
                  config: { animationDelay: 0 },
                }}
              />
            </Col>
            <Col xs={12} lg={3}>
              <h6 className="mb-1">Radial custom width</h6>
              <GaugeComponent
                id="gauge-component-radial2"
                value={currentValue}
                type="radial"
                labels={{
                  markLabel: {
                    marks: [
                      { value: 20 },
                      { value: 50 },
                      { value: 80 },
                      { value: 100 }
                    ]
                  }
                }}
                arc={{
                  colorArray: ['#00FF15', '#CE1F1F'],
                  nbSubArcs: 30,
                  padding: 0.02,
                  width: 0.5
                }}
                pointer={{
                  config: { animationDelay: 0 },
                }}
              />
            </Col>
            <Col xs={12} lg={3}>
              <h6 className="mb-1">Radial inner marks</h6>
              <GaugeComponent
                id="gauge-component-radial"
                value={currentValue}
                type="radial"
                arc={{
                  width: 0.2,
                  nbSubArcs: 20,
                  colorArray: ['#FF5F6D', '#FFC371']
                }}
                labels={{
                  markLabel: {
                    type: "inner",
                    marks: [
                      { value: 20 },
                      { value: 40 },
                      { value: 60 },
                      { value: 80 },
                      { value: 100 }
                    ]
                  }
                }}
                pointer={{
                  //type: "arrow",
                  config: { length: 0.2 },
                }}
              />
            </Col>
            <Col xs={12} lg={3}>
              <h6 className="mb-1">Radial elastic</h6>
              <GaugeComponent
                id="gauge-component-radial4"
                value={currentValue}
                type="radial"
                labels={{
                  markLabel: {
                    type: "inner",
                    marks: [
                      { value: 20 },
                      { value: 50 },
                      { value: 80 },
                      { value: 100 }
                    ]
                  }
                }}
                arc={{
                  colorArray: ['#CE1F1F', '#00FF00'],
                  subArcs: [
                    {limit: 10},
                    {limit: 30},
                    {},
                    {},
                    {}
                  ],
                  padding: 0.02,
                  width: 0.3
                }}
                pointer={{
                  config: { 
                    elastic: true,
                    animationDelay: 0
                  }
                }}
              />
            </Col>
          </Row>
          <Row>
            <Col xs={12} lg={6}>
              <h6 className="mb-1">Min/max values and formatted text</h6>
              <GaugeComponent
                id="gauge-component8"
                arc={{
                  nbSubArcs: 150,
                  colorArray: ['#5BE12C', '#F5CD19', '#EA4228'],
                  width: 0.3,
                  padding: 0.01
                }}
                labels={{
                  valueLabel: {
                    fontSize: 40,
                    formatTextValue: kbitsToMbits
                  },
                  markLabel: {
                    type: "outer",
                    marks: [
                      { value: 100 },
                      { value: 200 },
                      { value: 300 },
                      { value: 400 },
                      { value: 500 },
                      { value: 600 },
                      { value: 700 },
                      { value: 800 },
                      { value: 900 },
                      { value: 1000 },
                      { value: 1500 },
                      { value: 2000 },
                      { value: 2500 },
                      { value: 3000 },
                    ],
                    valueConfig: {
                      formatTextValue: kbitsToMbits
                    }
                  }
                }}
                value={900}
                maxValue={3000}
              />
            </Col>

            <Col xs={12} lg={6}>
              <h6 className="mb-1">Custom Temperature Gauge with tooltips on hover</h6>
              <GaugeComponent
                arc={{
                  width: 0.2,
                  padding: 0.01,
                  // gradient: true,
                  subArcs: [
                    {
                      limit: 15,
                      color: '#EA4228',
                      showMark: true,
                      tooltip: {
                        text: 'Too low temperature!'
                      },
                      onClick: () => console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"),
                      onMouseMove: () => console.log("BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB"),
                      onMouseLeave: () => console.log("CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC"),
                    },
                    {
                      limit: 17,
                      color: '#F5CD19',
                      showMark: true,
                      tooltip: {
                        text: 'Low temperature!'
                      }
                    },
                    {
                      limit: 28,
                      color: '#5BE12C',
                      showMark: true,
                      tooltip: {
                        text: 'OK temperature!'
                      }
                    },
                    {
                      limit: 30, color: '#F5CD19', showMark: true,
                      tooltip: {
                        text: 'High temperature!'
                      }
                    },
                    {
                      color: '#EA4228',
                      tooltip: {
                        text: 'Too high temperature!'
                      }
                    }
                  ]
                }}
                pointer={{
                  config: { 
                    color: '#345243',
                    length: 0.90,
                    width: 15,
                    // animate: true,
                    // elastic: true,
                    animDelay: 200,
                  }
                }}
                labels={{
                  valueLabel: { formatTextValue: value => value + 'ºC' },
                  markLabel: {
                    type: 'outer',
                    valueConfig: { formatTextValue: value => value + 'ºC', fontSize: 10 },
                    marks: [
                      { value: 13 },
                      { value: 22.5 },
                      { value: 32 }
                    ],
                  }
                }}
                value={22.5}
                minValue={10}
                maxValue={35}
              />
            </Col>
          </Row>
        </Container >
      </>
  )
};

export default App
