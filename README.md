# react-gauge-component
React Gauge Chart Component for data visualization.

This is forked from [@Martin36/react-gauge-chart](https://github.com/Martin36/react-gauge-chart) [0b24a45](https://github.com/Martin36/react-gauge-chart/pull/131).
<details> 
<summary>🔑Key differences</summary>

<ul>
  <li>Added min/max values</li>
  <li>Added grafana based gauge</li>
  <li>Added arcs limits in value instead of percent</li>
  <li>Added inner/outer ticks to the gauge for reference of the values</li>
  <li>Added blob pointer type</li>
  <li>Added arrow pointer type</li>
  <li>Added tooltips on hover for the arcs</li>
  <li>Added arc with linear gradient colors</li>
  <li>Added interactive input mode with pointer drag functionality</li>
  <li>Added custom React content rendering for value labels</li>
  <li>Full responsive</li>
  <li>All render flow fixed and optimized avoiding unecessary resource usage. Performance test, left is original: https://user-images.githubusercontent.com/45375617/239447916-217630e7-8e34-4a3e-a59f-7301471b9855.png</li>
  <li>Refactored project structure to separated files</li>
  <li>Refactored to Typescript</li>
  <li>Added complex objects for better modulation and organization of the project</li>
  <li>Fixed Rerenderings making arcs to be repeated in different sizes</li>
  <li>Fixed needing to set height bug</li>
  <li>Fixed needing to set id bug</li>
</ul>
</details>

# Demo
https://antoniolago.github.io/react-gauge-component/

# Usage
Install it by running `npm install react-gauge-component --save` or `yarn add react-gauge-component`. Then to use it:

```jsx
import GaugeComponent from 'react-gauge-component';
//or
import { GaugeComponent } from 'react-gauge-component';

//Component with default values
<GaugeComponent />
```

For next.js you'll have to do dynamic import:
```jsx
import dynamic from "next/dynamic";
const GaugeComponent = dynamic(() => import('react-gauge-component'), { ssr: false });

//Component with default values
<GaugeComponent />
```

## Examples
### Simple Gauge.
![Image of Simple Grafana Gauge Component for a simple data visualization](https://antoniolago.github.io/react-gauge-component/images/simpleGauge.jpg "Simple Grafana Gauge Component")
<details>
  <summary>Show Simple Gauge code</summary>

  ### Simple Gauge
  
```jsx
<GaugeComponent
  arc={{
    subArcs: [
      {
        limit: 20,
        color: '#EA4228',
        showTick: true
      },
      {
        limit: 40,
        color: '#F58B19',
        showTick: true
      },
      {
        limit: 60,
        color: '#F5CD19',
        showTick: true
      },
      {
        limit: 100,
        color: '#5BE12C',
        showTick: true
      },
    ]
  }}
  value={50}
/>
```
</details>

### Custom Bandwidth Gauge.
![Image of Gauge Component for bandwidth visualization](https://antoniolago.github.io/react-gauge-component/images/bandGauge.jpg "Gauge Component for bandwidth visualization")
<details>
  <summary>Show Bandwidth Gauge code</summary>

  ### Bandwidth Gauge
  
```jsx
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
<GaugeComponent
  arc={{
    nbSubArcs: 150,
    colorArray: ['#5BE12C', '#F5CD19', '#EA4228'],
    width: 0.3,
    padding: 0.003
  }}
  labels={{
    valueLabel: {
      style: {fontSize: 40},
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
```
</details>

### Custom Temperature Gauge
![Image of React Gauge Component for temperature visualization](https://antoniolago.github.io/react-gauge-component/images/tempGauge.jpg "Gauge Component for temperature visualization")
<details>
  <summary>Show Temperature Gauge code</summary>

  ### Temperature Gauge
  
```jsx
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
    // elastic: true,
  }}
  labels={{
    valueLabel: { formatTextValue: value => value + 'ºC' },
    tickLabels: {
      type: 'outer',
      defaultTickValueConfig: { 
        formatTextValue: (value: any) => value + 'ºC' ,
        style: {fontSize: 10}
    },
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
```
</details>

### Gauge with blob.
![Image of Blob Gauge Component for a simple data visualization](https://antoniolago.github.io/react-gauge-component/images/blobGauge.jpg "Blob Gauge Component")
<details>
  <summary>Show Gauge with blob code</summary>

  ### Custom gauge with blob
  
```jsx
<GaugeComponent
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
  pointer={{type: "blob", animationDelay: 0 }}
  value={50}
/>
```
</details>


### Gradient with arrow gauge.
![Image of Gradient with Arrow Gauge Component for a simple data visualization](https://antoniolago.github.io/react-gauge-component/images/arrowGauge.jpg "Gradient with Arrow Gauge Component")
<details>
  <summary>Show Gradient with arrow code</summary>

  ### Custom gradient with arrow
  
```jsx
<GaugeComponent
  id="gauge-component4"
  arc={{
    gradient: true,
    width: 0.15,
    padding: 0,
    subArcs: [
      {
        limit: 15,
        color: '#EA4228',
        showTick: true
      },
      {
        limit: 37,
        color: '#F5CD19',
        showTick: true
      },
      {
        limit: 58,
        color: '#5BE12C',
        showTick: true
      },
      {
        limit: 75,
        color: '#F5CD19',
        showTick: true
      },
      { color: '#EA4228' }
    ]
  }}
  value={50}
  pointer={{type: "arrow", elastic: true}}
/>
```
</details>

### Custom radial gauge.
![Image of Radial Gauge Component for a simple data visualization](https://antoniolago.github.io/react-gauge-component/images/radialGauge.jpg "Radial Gauge Component")
<details>
  <summary>Show Custom Radial Gauge code</summary>

  ### Custom Radial Gauge
  
```jsx
<GaugeComponent
  value={50}
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
    colorArray: ['#5BE12C','#EA4228'],
    subArcs: [{limit: 10}, {limit: 30}, {}, {}, {}],
    padding: 0.02,
    width: 0.3
  }}
  pointer={{
    elastic: true,
    animationDelay: 0
  }}
/>
```
</details>

### Interactive Gauge (Input Mode)
Use the `onValueChange` callback to enable interactive mode where users can drag the pointer or click on the arc to set values.

<details>
  <summary>Show Interactive Gauge code</summary>

  ### Interactive Gauge with Drag
  
```jsx
import { useState } from 'react';

function InteractiveGauge() {
  const [value, setValue] = useState(50);
  
  return (
    <div>
      <GaugeComponent
        value={value}
        type="semicircle"
        arc={{
          width: 0.2,
          subArcs: [
            { limit: 40, color: '#5BE12C' },
            { limit: 60, color: '#F5CD19' },
            { color: '#EA4228' }
          ]
        }}
        pointer={{
          type: "needle",
          elastic: true
        }}
        onValueChange={(newValue) => setValue(newValue)}
      />
      <p>Current Value: {value.toFixed(1)}</p>
    </div>
  );
}
```
</details>

### Custom React Content in Value Label
Use `renderContent` to render custom React components instead of plain text for the value label.

<details>
  <summary>Show Custom Content code</summary>

  ### Custom React Content
  
```jsx
<GaugeComponent
  value={75}
  type="semicircle"
  labels={{
    valueLabel: {
      renderContent: (value, arcColor) => (
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '2rem', color: arcColor, fontWeight: 'bold' }}>
            {value}
          </span>
          <span style={{ fontSize: '0.8rem', color: '#888' }}>km/h</span>
        </div>
      ),
      contentWidth: 100,
      contentHeight: 60
    }
  }}
  arc={{
    subArcs: [
      { limit: 50, color: '#5BE12C' },
      { limit: 80, color: '#F5CD19' },
      { color: '#EA4228' }
    ]
  }}
/>
```
</details>

# API
 
API reference is auto-generated from the TypeScript types:
 
- **[`API.md`](https://github.com/antoniolago/react-gauge-component/blob/main/API.md)**
 
To regenerate it locally, run:
 
- `yarn docs`
 


##### Colors for the chart

The `colorArray` prop can be specified as an array of hex color values, such as `["#FF0000", "#00FF00", "#0000FF"]` where
each arc would get a color in the array (colors are assigned from left to right). 

If the **length of the array matches** the **number of levels** in the arc, each segment gets its exact color.

If the number of colors does not match the number of levels, the colors will be **interpolated through ALL colors** in the array sequentially. For example, with colors `["#FF0000", "#FFFF00", "#00FF00"]` and 9 segments, the gauge will smoothly transition from red → yellow → green. The interpolation is done using [d3.interpolateHsl](https://github.com/d3/d3-interpolate#interpolateHsl).
