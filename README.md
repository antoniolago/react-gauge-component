# react-gauge-component
React Gauge Chart Component for data visualization.

<img width="1840" height="608" alt="image" src="https://github.com/user-attachments/assets/fe12d0f7-805c-4914-9c80-c6a41432726b" />

A gallery of preset gauges and a sandbox editor is provided so you can create and edit your gauges in the [DEMO](https://antoniolago.github.io/react-gauge-component) page

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

# API
 
API reference is auto-generated from the TypeScript types:
 
- **[`API.md`](https://github.com/antoniolago/react-gauge-component/blob/main/API.md)**
 
To regenerate it locally, run:
 
- `yarn docs`
 

### Input Gauge
Use the `onValueChange` callback to enable interactive mode where users can drag the pointer or click on the arc to set values thus making the gauge an input to systems.

<details>
  <summary>Show Input Mode Gauge</summary>

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



### Colors for the chart

The `colorArray` prop can be specified as an array of hex color values, such as `["#FF0000", "#00FF00", "#0000FF"]` where
each arc would get a color in the array (colors are assigned from left to right). 

If the **length of the array matches** the **number of levels** in the arc, each segment gets its exact color.

If the number of colors does not match the number of levels, the colors will be **interpolated through ALL colors** in the array sequentially. For example, with colors `["#FF0000", "#FFFF00", "#00FF00"]` and 9 segments, the gauge will smoothly transition from red → yellow → green. The interpolation is done using [d3.interpolateHsl](https://github.com/d3/d3-interpolate#interpolateHsl).

## Forked from [@Martin36/react-gauge-chart](https://github.com/Martin36/react-gauge-chart) [0b24a45](https://github.com/Martin36/react-gauge-chart/pull/131).

