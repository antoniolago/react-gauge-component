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

# API
<h2>Props:</h2>
<ul>
   <li><code>type: string</code>: The type of the gauge, values can be <code>"grafana"</code>, <code>"semicircle</code> and <code>"radial"</code>. Default: <code>"grafana"</code>.</li>
   <li><code>id: string</code>: A unique identifier for the div surrounding the chart. Default: <code>""</code>.</li>
   <li><code>className: string</code>: Adds a <code>className</code> to the div container. Default: <code>"gauge-component-class"</code>.</li>
   <li><code>style: React.CSSProperties</code>: Adds a style object to the div container. Default: <code>{width: 100}</code>.</li>
   <li><code>marginInPercent: number | {left: number, right: number, top: number, bottom: number}</code>: Sets the margin for the chart inside the containing SVG element. Default:
   "grafana": <code>{ top: 0.12, bottom: 0.00, left: 0.07, right: 0.07 }</code>.
   "semicircle": <code>{ top: 0.08, bottom: 0.00, left: 0.07, right: 0.07 }</code>
   "radial": <code>{ top: 0.07, bottom: 0.00, left: 0.07, right: 0.07 }</code></li>
   <li><code>value: number</code>: The value of the gauge. Default: <code>33</code>.</li>
   <li><code>minValue: number</code>: The minimum value of the gauge. Default: <code>0</code>.</li>
   <li><code>maxValue: number</code>: The maximum value of the gauge. Default: <code>100</code>.</li>
   <li><code>arc: object</code>: The arc of the gauge.
    <ul>
      <li><code>cornerRadius: number</code>: The corner radius of the arc. Default: <code>7</code>.</li>
      <li><code>padding: number</code>: The padding between subArcs, in rad. Default: <code>0.05</code>.</li>
      <li><code>width: number</code>: The width of the arc given in percent of the radius. Default: 
      "grafana": <code>0.25</code>.
      "semicircle": <code>0.15</code>
      "radial": <code>0.2</code>.</li>
      <li><code>nbSubArcs: number</code>: The number of subArcs. This overrides <code>subArcs</code>. Default: <code>undefined</code></li>
      <li><code>colorArray: Array&lt;string&gt;</code>: The colors of the arcs. This overrides <code>subArcs</code> colors. Default: <code>undefined</code></li>
      <li><code>emptyColor: string</code>: The default color of the grafana's "empty" subArc color. Default: <code>"#5C5C5C"</code></li>
      <li><code>gradient: boolean</code>: This will draw a single arc with all colors provided in subArcs, using limits as references to draw the linear-gradient result. (limits may not be accurate in this mode) Default: <code>false</code>.</li>
      <li><code>subArcs: Array&lt;object&gt;</code>: The subArcs of the gauge.
        <ul>
          <li><code>limit: number</code>: The subArc length using value as reference. When no limits or lengths are defined will auto-calculate remaining arcs limits. Example of valid input: <code>subArcs: [{limit: 50}, {limit: 100}]</code> this will render 2 arcs 50/50</li>
          <li><code>length: number</code>: The subArc length in percent of the arc (as the behavior of the original project). Example of 
          a valid input: <code>subArcs: [{length: 0.50}, {length: 0.50}]</code>, this will render 2 arcs 50/50</li>
          <li><code>color: string</code>: The subArc color. When not provided, it will use default subArc's colors and interpolate first and last colors when subArcs number is greater than <code>colorArray</code>.</li>
          <li><code>showTick: boolean</code>: Whether or not to show the tick. Default: <code>false</code>.</li>
          <li><code>tooltip: object</code>: Tooltip object.
          <ul>
            <li><code>text: string</code>text that will be displayed in the tooltip when hovering the subArc.</li>
            <li><code>style: React.CSSProperties</code>: Overrides tooltip styles.</li>
          </ul>
          </li>
          <li><code>onClick: (event: any) => void</code>: onClick callback. Default: <code>undefined</code>.</li>
          <li><code>onMouseMove: (event: any) => void</code>: onMouseMove callback. Default: <code>undefined</code>.</li>
          <li><code>onMouseLeave: (event: any) => void</code>: onMouseLeave callback. Default: <code>undefined</code>.</li>
        </ul>
        subArcs default value: 
        <code>
          [
            { limit: 33, color: "#5BE12C"},
            { limit: 66, color: "#F5CD19"},
            { color: "#EA4228"},
          ]
        </code>
      </li>
    </ul></li>
    <li><code>pointer: object</code>: The value pointer of the gauge. Grafana gauge have it's own pointer logic, but animation properties will be applied.
      <ul>
        <li><code>type: string</code> This can be "needle", "blob" or "arrow". Default: <code>"needle"</code></li>
        <li><code>hide: boolean</code> Enabling this flag will hide the pointer. Default: <code>false</code></li>
        <li><code>color: string</code>: The color of the pointer. Default: <code>#464A4F</code></li>
        <li><code>baseColor: string</code>: The color of the base of the pointer. Default: <code>#464A4F</code></li>
        <li><code>length: number</code>: The length of the pointer 0-1, 1 being the outer radius length. Default: <code>0.70</code></li>
        <li><code>animate: boolean</code>: Whether or not to animate the pointer. Default: <code>true</code></li>
        <li><code>elastic: boolean</code>: Whether or not to use elastic pointer. Default: <code>false</code></li>
        <li><code>animationDuration: number</code>: The duration of the pointer animation. Default: <code>3000</code></li>
        <li><code>animationDelay: number</code>: The delay of the pointer animation. Default: <code>100</code></li>
        <li><code>width: number</code>: The width of the pointer. Default: <code>20</code></li>
        <li><code>strokeWidth: number</code>: Only available for blob type. Set the width of the stroke. Default: <code>8</code></li>
      </ul>
    </li>
    <li><code>labels: object</code>: The labels of the gauge.
      <ul>
         <li><code>valueLabel: object</code>: The center value label of the gauge.
            <ul>
               <li><code>matchColorWithArc: boolean</code>: when enabled valueLabel color will match current arc color</li>
               <li><code>formatTextValue: (value: any) => string</code>: The format of the value label. Default: <code>undefined</code>.</li>
               <li><code>style: React.CSSProperties</code>: Overrides valueLabel styles. Default: <code>{fontSize: "35px", fill: "#fff", textShadow: "black 1px 1px 0px, black 0px 0px 2.5em, black 0px 0px 0.2em"}</code></li>
               <li><code>maxDecimalDigits: number</code>: this is the number of decimal digits the value will round up to. Default: <code>2</code></li>
               <li><code>hide: boolean</code>: Whether or not to hide the value label. Default: <code>false</code>.</li>
            </ul></li>
          <li><code>tickLabels: object</code> The tickLabels of the gauge.
            <ul>
                <li><code>type: string</code>: This makes the ticks <code>"inner"</code> or <code>"outer"</code> the radius. Default:<code>"outer"</code></li>
                <li><code>hideMinMax: boolean</code>: Whether or not to hide the min and max labels. Default: <code>false</code></li>
                <li><code>ticks: Array&lt;object&gt;</code>: The ticks of the gauge. When not provided, it will use default gauge ticks with five values.
                    <ul>
                        <li><code>value: number</code>: The value of the tick.</li>
                        <li><code>valueConfig: object</code>: The config of the tick's value label. When not provided, it will use default config.</li>
                        <li><code>lineConfig: object</code>: The config of the tick's line. When not provided, it will use default config.</li>
                    </ul>
                  </li>
                <li><code>defaultTickValueConfig: object</code>: The default config of the tick's value label.
                    <ul>
                        <li><code>formatTextValue: (value: any) => string</code>: The format of the tick's value label. Default: <code>undefined</code></li>
                        <li><code>style: React.CSSProperties</code>: Overrides tick's valueConfig styles. Default: <code>{fontSize: "10px", fill: "#464A4F", textShadow: "black 1px 1px 0px, black 0px 0px 2.5em, black 0px 0px 0.2em"}</code></li>
                        <li><code>maxDecimalDigits: number</code>: this is the number of decimal digits the value will round up to. Default: <code>2</code></li>
                        <li><code>hide: boolean</code>: Whether or not to hide the tick's value label. Default: <code>false</code></li>
                    </ul>
                  </li>
                <li><code>defaultTickLineConfig: object</code>: The default config of the tick's line.
                  <ul>
                      <li><code>width: number</code>: The width of the tick's line. Default: <code>1</code></li>
                      <li><code>length: number</code>: The length of the tick's line. Default: <code>7</code></li>
                      <li><code>color: string</code>: The color of the tick's line. Default: <code>rgb(173 172 171)</code></li>
                      <li><code>distanceFromArc: number</code>: The distance of the tick's line from the arc. Default: <code>3</code></li>
                      <li><code>hide: boolean</code>: Whether or not to hide the tick's line. Default: <code>false</code></li>
                  </ul>
                </li>
            </ul>
        </li>
      </ul>
    </li>
</ul>

##### Colors for the chart

The 'colorArray' prop could either be specified as an array of hex color values, such as `["#FF0000", "#00FF00", "#0000FF"]` where
each arc would a color in the array (colors are assigned from left to right). If that is the case, then the **length of the array**
must match the **number of levels** in the arc.
If the number of colors does not match the number of levels, then the **first** and the **last** color from the colors array will
be selected and the arcs will get colors that are interpolated between those. The interpolation is done using [d3.interpolateHsl](https://github.com/d3/d3-interpolate#interpolateHsl).
