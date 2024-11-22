import React, { useEffect, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import GaugeComponent from '../lib';
import CONSTANTS from '../lib/GaugeComponent/constants';

const MainPreviews = () => {
    const [currentValue, setCurrentValue] = useState(50);
    const [arcs, setArcs] = useState([{ limit: 30 }, { limit: 50 }, { limit: 100 }])

    useEffect(() => {
        const timer = setTimeout(() => {
            setCurrentValue(Math.random() * 100);

            // setCurrentValue(0);
            //   setArcs([{ limit: 30 }, { limit: 35 }, { limit: 100 }])
        }, 3000);

        return () => {
            clearTimeout(timer);
        };
    });
    const kbitsToMbits = (value: number) => {
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
    var ranges = [{ "fieldId": 5, "from": 0, "to": 5000, "state": { "base": "info", "appId": 1, "createdAt": "2023-11-19T11:11:32.039109", "name": "Info", "id": 1, "hexColor": "#3498db", } }, { "fieldId": 5, "from": 5000, "to": 30000, "state": { "base": "error", "appId": 1, "createdAt": "2023-11-19T11:11:32.039109", "name": "Error", "id": 4, "hexColor": "#c0392b", } }, { "fieldId": 5, "from": 30000, "to": 70000, "state": { "base": "critical", "appId": 1, "createdAt": "2023-11-19T11:11:32.039109", "name": "Critical Error", "id": 3, "hexColor": "#e74c3c", } }]
    function generateTickValues(min: number, max: number, count: number): { value: number }[] {
        const step = (max - min) / (count - 1);
        const values: { value: number }[] = [];

        for (let i = 0; i < count; i++) {
            const value = Math.round(min + step * i);
            values.push({ value });
        }

        return values;
    }
    const debugGauge = () => <GaugeComponent
        arc={{
            padding: 0.01,
            // nbSubArcs: 100,
            // colorArray: ['#EA4228', '#EFFF']
            subArcs: [
                { limit: 15, color: '#EA4228', showTick: true },
                { limit: 17, color: '#F5CD19', showTick: true },
                { limit: 28, color: '#5BE12C', showTick: true },
                { limit: 30, color: '#F5CD19', showTick: true },
                { color: '#EA4228' }
            ]
        }}
        labels={{
            valueLabel: { formatTextValue: value => value + 'ºC' },
            tickLabels: {
                defaultTickValueConfig: { formatTextValue: value => value + 'ºC' },
                ticks: [
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
                                This component features custom min/max values, ticks, and tooltips,
                                making it perfect for visualizing various metrics such as speed,
                                temperature, charge, and humidity. This data visualization tool can be very useful for React developers looking to create engaging and informative dashboards.
                                <br />Documentation at <a href="https://github.com/antoniolago/react-gauge-component" target="_blank">react-gauge-component</a>
                            </p>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={12} lg={3}>
                            <h6 className="mb-1">Default Gauge</h6>
                            <GaugeComponent />
                        </Col>
                        <Col xs={12} lg={3}>
                            <h6 className="mb-1">Simple Gauge (w/ tooltips)</h6>
                            <GaugeComponent
                                arc={{
                                    subArcs: [
                                        {
                                            limit: 20,
                                            color: '#EA4228',
                                            showTick: true,
                                            tooltip: { text: 'Empty' }
                                        },
                                        {
                                            limit: 40,
                                            color: '#F58B19',
                                            showTick: true,
                                            tooltip: { text: 'Low' }
                                        },
                                        {
                                            limit: 60,
                                            color: '#F5CD19',
                                            showTick: true,
                                            tooltip: { text: 'Fine' }
                                        },
                                        {
                                            limit: 100,
                                            color: '#5BE12C',
                                            showTick: true,
                                            tooltip: { text: 'Full' }
                                        },
                                    ]
                                }}
                                value={currentValue}
                            />
                        </Col>
                        <Col xs={12} lg={3}>
                            <h6 className="mb-1">Simple interpolated Gauge</h6>
                            <GaugeComponent
                                id="gauge-component-radial3"
                                value={currentValue}
                                type="grafana"
                                arc={{
                                    colorArray: ['#1EFF00', '#CE1F1F'],
                                    nbSubArcs: 80,
                                    padding: 0.02,
                                    width: 0.3
                                }}
                                labels={{
                                    valueLabel: { matchColorWithArc: true },
                                }}
                                pointer={{ animationDelay: 0 }}
                            />
                        </Col>

                        <Col xs={12} lg={3}>
                            <h6 className="mb-1">Min/max values and formatted text</h6>
                            <GaugeComponent
                                id="gauge-component8"
                                arc={{
                                    nbSubArcs: 150,
                                    colorArray: ['#5BE12C', '#F5CD19', '#EA4228'],
                                    width: 0.2,
                                    padding: 0.003
                                }}
                                labels={{
                                    valueLabel: {
                                        formatTextValue: kbitsToMbits
                                    },
                                    tickLabels: {
                                        type: "outer",
                                        ticks: [
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
                                        defaultTickValueConfig: {
                                            formatTextValue: kbitsToMbits
                                        }
                                    }
                                }}
                                value={900}
                                maxValue={3000}
                            />
                        </Col>
                        <Col xs={12} lg={3}>
                            <h6 className="mb-1">Default semicircle Gauge</h6>
                            <GaugeComponent type="semicircle" />
                        </Col>
                        <Col xs={12} lg={3}>
                            <h6 className="mb-1">Gradient arc with arrow</h6>
                            <GaugeComponent
                                id="gauge-component4"
                                type="semicircle"
                                arc={{
                                    gradient: true,
                                    width: 0.15,
                                    padding: 0,
                                    subArcs: [
                                        {
                                            limit: 5,
                                            color: '#EA4228'
                                        },
                                        {
                                            limit: 20,
                                            color: '#F5CD19'
                                        },
                                        {
                                            limit: 58,
                                            color: '#5BE12C'
                                        },
                                        {
                                            limit: 75,
                                            color: '#F5CD19'
                                        },
                                        { color: '#EA4228' }
                                    ]
                                }}
                                labels={{
                                    tickLabels: {
                                        type: "outer",
                                        ticks: [
                                            { value: 0 },
                                            { value: 20 },
                                            { value: 40 },
                                            { value: 60 },
                                            { value: 80 },
                                        ]
                                    }
                                }}
                                value={currentValue}
                                pointer={{ type: "arrow", color: '#dfa810' }}
                            />
                        </Col>
                        <Col xs={12} lg={3}>
                            <h6 className="mb-1">Elastic blob pointer Live updates</h6>
                            <GaugeComponent
                                id="gauge-component7"
                                type="semicircle"
                                arc={{
                                    colorArray: ['#00FF15', '#FF2121'],
                                    padding: 0.02,
                                    subArcs:
                                        [
                                            { limit: 40 },
                                            { limit: 60 },
                                            { limit: 70 },
                                            {},
                                            {},
                                            {},
                                            {}
                                        ]
                                }}
                                pointer={{ type: "blob", animationDelay: 0, elastic: true, strokeWidth: 7 }}
                                value={currentValue}
                            />
                        </Col>
                        <Col xs={12} lg={3}>
                            <h6 className="mb-1">Temperature Gauge with tooltips on hover</h6>
                            <GaugeComponent
                                type="semicircle"
                                arc={{
                                    width: 0.2,
                                    padding: 0.005,
                                    cornerRadius: 1,
                                    // gradient: true,
                                    subArcs: [
                                        {
                                            limit: 15,
                                            color: '#EA4228',
                                            showTick: true,
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
                                            showTick: true,
                                            tooltip: {
                                                text: 'Low temperature!'
                                            }
                                        },
                                        {
                                            limit: 28,
                                            color: '#5BE12C',
                                            showTick: true,
                                            tooltip: {
                                                text: 'OK temperature!'
                                            }
                                        },
                                        {
                                            limit: 30, color: '#F5CD19', showTick: true,
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
                                    color: '#345243',
                                    length: 0.80,
                                    width: 15,
                                    // animate: true,
                                    // elastic: true,
                                    animationDelay: 200,
                                }}
                                labels={{
                                    valueLabel: { formatTextValue: value => value + 'ºC' },
                                    tickLabels: {
                                        type: 'outer',
                                        defaultTickValueConfig: { formatTextValue: value => value + 'ºC' },
                                        ticks: [
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
                        <Col xs={12} lg={3}>
                            <h6 className="mb-1">Default Radial Gauge</h6>
                            <GaugeComponent type="radial" value={33} />
                        </Col>
                        <Col xs={12} lg={3}>
                            <h6 className="mb-1">Radial custom width</h6>
                            <GaugeComponent
                                id="gauge-component-radial2"
                                value={currentValue}
                                type="radial"
                                labels={{
                                    tickLabels: {
                                        ticks: [
                                            { value: 20 },
                                            { value: 50 },
                                            { value: 80 },
                                            { value: 100 }
                                        ]
                                    }
                                }}
                                arc={{
                                    colorArray: ['#00FF15', '#CE1F1F'],
                                    nbSubArcs: 90,
                                    padding: 0.01,
                                    width: 0.4
                                }}
                                pointer={{ animationDelay: 0 }}
                            />
                        </Col>
                        <Col xs={12} lg={3}>
                            <h6 className="mb-1">Radial inner ticks</h6>
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
                                    tickLabels: {
                                        type: "inner",
                                        ticks: [
                                            { value: 20 },
                                            { value: 40 },
                                            { value: 60 },
                                            { value: 80 },
                                            { value: 100 }
                                        ]
                                    }
                                }}
                                pointer={{ length: 0.5 }}
                            />
                        </Col>
                        <Col xs={12} lg={3}>
                            <h6 className="mb-1">Radial elastic</h6>
                            <GaugeComponent
                                id="gauge-component-radial4"
                                value={currentValue}
                                type="radial"
                                labels={{
                                    tickLabels: {
                                        type: "inner",
                                        ticks: [
                                            { value: 20 },
                                            { value: 40 },
                                            { value: 60 },
                                            { value: 80 },
                                            { value: 100 }
                                        ]
                                    }
                                }}
                                arc={{
                                    colorArray: ['#5BE12C', '#EA4228'],
                                    subArcs: [{ limit: 10 }, { limit: 30 }, {}, {}, {}],
                                    padding: 0.02,
                                    width: 0.3
                                }}
                                pointer={{
                                    elastic: true,
                                    animationDelay: 0
                                }}
                            />
                        </Col>
                    </Row>
                </Container >
            </>
    )
};

export default MainPreviews
