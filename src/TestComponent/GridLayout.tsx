import React from 'react';
import GridLayout from 'react-grid-layout';
import GaugeComponent from '../lib';
import WidthProvider from 'react-grid-layout';
import Responsive from 'react-grid-layout';

// const ResponsiveReactGridLayout = WidthProvider(Responsive);
const layout = [
    { i: 'a', x: 0, y: 0, w: 1, h: 4, static: false },
    { i: 'b', x: 1, y: 0, w: 3, h: 4, static: false },
    { i: 'c', x: 4, y: 0, w: 1, h: 4, static: false }
];

const gaugeConfig = [
    {
        limit: 0,
        color: '#FFFFFF',
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
    }
];

const GridLayoutComponent = () => (
    <GridLayout
        className="layout"
        layout={layout}
        cols={12}
        rowHeight={70}
        width={1200}
    >
        <div key="a" style={{ backgroundColor: '#F58B19' }}>
            <GaugeComponent />
        </div>
        <div key="b" style={{ backgroundColor: '#F5CD19' }}>
            <GaugeComponent />
        </div>
        <div key="c" style={{ backgroundColor: '#5BE12C' }}>
            <GaugeComponent />
        </div>
    </GridLayout>
);

export default GridLayoutComponent;