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
      setCurrentValue(Math.random()*100);
      // setArcs([{ limit: 30 }, { limit: 35 }, { limit: 100 }])
    }, 3000);

    return () => {
      clearTimeout(timer);
    };
  });
  return (
    CONSTANTS.debugSingleGauge ?
      <Container>
        <Row>
          <Col lg={{ offset: 2, span: 8 }}>
            <h6>Single GaugeComponent for debugging</h6>
            <GaugeComponent
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
                  valueConfig: { formatTextValue: value => value + 'ºC' },
                  marks: [
                    { value: 23 }
                  ]
                }
              }}
              value={10}
              minValue={10}
              maxValue={100}
            />
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
            <Col xs={12} lg={3}>
              <h6>GaugeComponent with default props</h6>
              <GaugeComponent />
            </Col>
            <Col xs={12} lg={3}>
              <h6>GaugeComponent with 20 levels</h6>
              <GaugeComponent
                arc={{
                  nbSubArcs: 20
                }}
                labels={{
                  valueLabel: { fontSize: 40 },
                  markLabel: {
                    marks: [
                      { value: 20 },
                      { value: 40 },
                      { value: 60 },
                      { value: 80 },
                      { value: 100 }
                    ]
                  }
                }}
                value={0}
                needle={{
                  color: '#345243',
                  elastic: true,
                }}
              />
            </Col>
            <Col xs={12} lg={3}>
              <h6>GaugeComponent with custom colors</h6>
              <GaugeComponent
                nrOfLevels={50}
                arcPadding={0.02}
                arc={{
                  width: 0.3,
                  nbSubArcs: 20,
                  colorArray: ['#FF5F6D', '#FFC371']
                }}
                value={50}
              />
            </Col>
            <Col xs={12} lg={3}>
              <h6>GaugeComponent with larger padding between elements</h6>
              <GaugeComponent
                id="gauge-component4"
                arc={{
                  cornerRadius: 3,
                  padding: 0.1,
                  nbSubArcs: 10
                }}
                value={60}
              />
            </Col>
          </Row>
          <Row>
            <Col xs={12} lg={3}>
              <h6>GaugeComponent with custom arcs width</h6>
              <GaugeComponent
                id="gauge-component5"
                arc={{
                  width: 0.4,
                  padding: 0.02,
                  nbSubArcs: 80
                  // colorArray: ['#FF5F6D', '#FFC371']
                }}
                value={37}
              />
            </Col>
            <Col xs={12} lg={3}>
              <h6>GaugeComponent without animation</h6>
              <GaugeComponent
                id="gauge-component6"
                needle={{
                  animate: false,
                  color: '#345243'
                }}
                arc={{
                  nbSubArcs: 15
                }}
                value={currentValue}
              />
            </Col>
            <Col xs={12} lg={3}>
              <h6>GaugeComponent with live updates</h6>
              <GaugeComponent
                id="gauge-component7"
                arc={{
                  colorArray: ['#FF5F6D', '#FFC371'],
                  subArcs:
                    [
                      { limit: 20 },
                      { },
                      { },
                      { }
                    ]
                }}
                needle={{ animationDelay: 0 }}
                value={currentValue}
              />
            </Col>
            <Col xs={12} lg={3}>
              <h6>Elastic GaugeComponent with live updates</h6>
              <GaugeComponent
                id="gauge-component7"
                value={currentValue}
                needle={{
                  elastic: true
                }}
              />
            </Col>
            <Col xs={12} lg={3}>
              <h6>GaugeComponent with min/max values and  formatted text</h6>
              <GaugeComponent
                id="gauge-component8"
                arc={{
                  nbSubArcs: 30,
                  colorArray: ['#5BE12C', '#F5CD19', '#EA4228'],
                  width: 0.3,
                }}
                labels={{
                  valueLabel: { fontSize: 40, 
                    formatTextValue: value => {
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
                  },
                  markLabel: {
                    marks: [
                      { value: 1500},
                    ],
                    valueConfig: {
                      formatTextValue: value => {
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
                    }
                  }
                }}
                value={900}
                maxValue={3000}
              />
            </Col>

            <Col xs={12} lg={3}>
              <h6>GaugeComponent with arcs update</h6>
              <GaugeComponent
                id="gauge-component9"
                arc={{
                  padding: 0.02,
                  subArcs: [
                    { limit: 15, color: '#EA4228', needleColorWhenWithinLimit: '#AA4128' },
                    { limit: 17, color: '#F5CD19' },
                    { limit: 28, color: '#5BE12C' },
                    { limit: 30, color: '#F519' },
                  ]
                }}
                value={37}
              />
            </Col>

            <Col xs={12} lg={3}>
              <h6>Custom Temperature gauge</h6>
              <GaugeComponent
                arc={{
                  padding: 0.01,
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
                    valueConfig: { formatTextValue: value => value + 'ºC' },
                    marks: [
                      { value: 23 }
                    ]
                  }
                }}
                value={10}
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
