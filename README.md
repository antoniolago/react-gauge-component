# react-gauge-component
React Gauge Chart Component for data visualization.

This is forked from [@Martin36/react-gauge-chart](https://github.com/Martin36/react-gauge-chart) [0b24a45](https://github.com/Martin36/react-gauge-chart/pull/131).
Key differences:
<ul>
  <li>Added min/max values</li>
  <li>Added arcs limits in value instead of percent</li>
  <li>Added inner/outer marks to the gauge for reference of the values</li>
  <li>More than one gauge type</li>
  <li>More than one pointer type</li>
  <li>Added tooltips on hover for the arcs</li>
  <li>Added arc with linear gradient colors</li>
  <li>Full responsive</li>
  <li>All render flow fixed and optimized avoiding unecessary resource usage (better performance)</li>
  <li>Refactored project structure to separated files</li>
  <li>Refactored to Typescript</li>
  <li>Added complex objects for better modulation and organization of the project</li>
  <li>Fixed Rerenderings making arcs to be repeated in different sizes</li>
  <li>Fixed needing to set height bug</li>
  <li>Fixed needing to set id bug</li>
</ul>

# Demo
https://antoniolago.github.io/react-gauge-component/

# Usage
Install it by running `npm install react-gauge-component --save` or `yarn add react-gauge-component`. Then to use it:

```jsx
import GaugeComponent from 'react-gauge-component'

//Component with default values
<GaugeComponent id="gauge-component1" />
```

## Examples
### Simple Gauge.
![Image of Simple Gauge Component for a simple data visualization](https://antoniolago.github.io/react-gauge-component/images/simpleGauge.jpg "Simple Gauge Component")
<details>
  <summary>Show Simple Gauge code</summary>

  ### Simple Gauge
  
```jsx
<GaugeComponent
  id="simple-gauge"
  value={24.72}
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
  pointer={{ elastic: true }}
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
  id="gauge-component-radial"
  value={50}
  type="radial"
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
### Gradient with arrow gauge.
![Image of Gradient with Blob Gauge Component for a simple data visualization](https://antoniolago.github.io/react-gauge-component/images/blobGauge.jpg "Gradient with Blob Gauge Component")
<details>
  <summary>Show Gradient with blob code</summary>

  ### Custom gradient with blob
  
```jsx
<GaugeComponent
  id="gauge-component-blob"
  arc={{
    colorArray: ['#00FF15', '#FF2121'],
    nbSubArcs: 50,
    padding: 0.01,
  }}
  pointer={{type: "blob", animationDelay: 0, elastic: true }}
  value={90.69}
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
  value={50}
  pointer={{type: "arrow", elastic: true}}
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
  id="bandwidth-gauge"
  arc={{
    nbSubArcs: 30,
    colorArray: ['#5BE12C', '#F5CD19', '#EA4228'],
    width: 0.3,
  }}
  labels={{
    valueLabel: {
      fontSize: 40,
      formatTextValue: kbitsToMbits 
    },
    markLabel: {
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
```
</details>

### Custom Temperature Gauge
![Image of React Gauge Component for temperature visualization](https://antoniolago.github.io/react-gauge-component/images/tempGauge.jpg "Gauge Component for temperature visualization")
<details>
  <summary>Show Temperature Gauge code</summary>

  ### Temperature Gauge
  
```jsx
<GaugeComponent
  id="temperature-gauge"
  arc={{
    width: 0.2,
    padding: 0.01,
    subArcs: [
      { 
        limit: 15, 
        color: '#EA4228', 
        showMark: true ,
        tooltip: { text: 'Too low temperature!' }
      },
      { 
        limit: 17, 
        color: '#F5CD19', 
        showMark: true,
        tooltip: { text: 'Low temperature!' }
      },
      { 
        limit: 28, 
        color: '#5BE12C', 
        showMark: true,
        tooltip: { text: 'OK temperature!' } 
      },
      { 
        limit: 30, 
        color: '#F5CD19', 
        showMark: true,
        tooltip: { text: 'High temperature!' }
      },
      { 
        color: '#EA4228',
        tooltip: { text: 'Too high temperature!' }
      }
    ]
  }}
  pointer={{
    color: '#345243',
    length: 0.90,
    width: 15,
    animDelay: 200,
  }}
  labels={{
    valueLabel: { formatTextValue: value => value + 'ºC' },
    markLabel: {
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
```
</details>

# API
<h2>Props:</h2>
<ul>
   <li><code>id: string</code>: A unique identifier for the div surrounding the chart. Default: <code>""</code>.</li>
   <li><code>className: string</code>: Adds a <code>className</code> to the div container. Default: <code>"gauge-component-class"</code>.</li>
   <li><code>style: React.CSSProperties</code>: Adds a style object to the div container. Default: <code>{width: 100}</code>.</li>
   <li><code>marginInPercent: number</code>: Sets the margin for the chart inside the containing SVG element. Default: <code>0.05</code>.</li>
   <li><code>type: string</code>: The type of the gauge, values can be <code>"semicircle</code> and <code>"radial"</code>. Default: <code>"semicircle"</code>.</li>
   <li><code>value: number</code>: The value of the gauge. Default: <code>33</code>.</li>
   <li><code>minValue: number</code>: The minimum value of the gauge. Default: <code>0</code>.</li>
   <li><code>maxValue: number</code>: The maximum value of the gauge. Default: <code>100</code>.</li>
   <li><code>arc: object</code>: The arc of the gauge.
    <ul>
      <li><code>cornerRadius: number</code>: The corner radius of the arc. Default: <code>7</code>.</li>
      <li><code>padding: number</code>: The padding between subArcs, in rad. Default: <code>0.05</code>.</li>
      <li><code>width: number</code>: The width of the arc given in percent of the radius. Default: <code>0.15</code>.</li>
      <li><code>nbSubArcs: number</code>: The number of subArcs. This overrides <code>subArcs</code>. Default: <code>undefined</code></li>
      <li><code>colorArray: Array&lt;string&gt;</code>: The colors of the arcs. This overrides <code>subArcs</code> colors. Default: <code>undefined</code></li>
      <li><code>gradient: boolean</code>: This will draw a single arc with all colors provided in subArcs, using limits as references to draw the linear-gradient result. (limits may not be accurate in this mode) Default: <code>false</code>.</li>
      <li><code>subArcs: Array&lt;object&gt;</code>: The subArcs of the gauge.
        <ul>
          <li><code>limit: number</code>: The subArc limit value. When no limits are defined in the next subArcs in the list, it's optional and will auto-calculate remaining arcs limits. Example: <code>[{limit: 70}, {}, {}, {}]</code>. In a default <code>minValue/maxValue</code>, the values will be equal to <code>[{limit: 70}, {limit: 80}, {limit: 90}, {limit: 100}]</code>. But <code>[{},{limit: 100}]</code> will not work properly as the not defined subArc limit has a subArc with limit defined ahead in the array.</li>
              <li><code>color: string</code>: The subArc color. When not provided, it will use default subArc's colors and interpolate first and last colors when subArcs number is greater than <code>colorArray</code>.</li>
              <li><code>showMark: boolean</code>: Whether or not to show the mark. Default: <code>false</code>.</li>
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
    <li><code>pointer: object</code>: The value pointer of the gauge.
      <ul>
        <li><code>type: string</code> This can be "needle", "blob" or "arrow". Default: <code>"needle"</code></li>
        <li><code>color: string</code>: The color of the pointer. Default: <code>#464A4F</code></li>
        <li><code>baseColor: string</code>: The color of the base of the pointer. Default: <code>#464A4F</code></li>
        <li><code>length: number</code>: The length of the pointer 0-1, 1 being the outer radius length. Default: <code>0.70</code></li>
        <li><code>animate: boolean</code>: Whether or not to animate the pointer. Default: <code>true</code></li>
        <li><code>elastic: boolean</code>: Whether or not to use elastic pointer. Default: <code>false</code></li>
        <li><code>animationDuration: number</code>: The duration of the pointer animation. Default: <code>3000</code></li>
        <li><code>animationDelay: number</code>: The delay of the pointer animation. Default: <code>100</code></li>
        <li><code>width: number</code>: The width of the pointer. Default: <code>15</code></li>
      </ul>
    </li>
    <li><code>labels: object</code>: The labels of the gauge.
      <ul>
         <li><code>valueLabel: object</code>: The center value label of the gauge.
            <ul>
               <li><code>formatTextValue: (value: any) => string</code>: The format of the value label. Default: <code>undefined</code>.</li>
               <li><code>style: React.CSSProperties</code>: Overrides valueLabel styles. Default: <code>{fontSize: "35px", fill: "#fff", textShadow: "black 1px 1px 0px, black 0px 0px 2.5em, black 0px 0px 0.2em"}</code></li>
               <li><code>hide: boolean</code>: Whether or not to hide the value label. Default: <code>false</code>.</li>
            </ul></li>
          <li><code>markLabel: object</code> The markLabel of the gauge.
            <ul>
                <li><code>type: string</code>: This makes the marks <code>"inner"</code> or <code>"outer"</code> the radius. Default:<code>"outer"</code></li>
                <li><code>hideMinMax: boolean</code>: Whether or not to hide the min and max labels. Default: <code>false</code></li>
                <li><code>marks: Array&lt;object&gt;</code>: The marks of the gauge. When not provided, it will use default gauge marks with five values.
                    <ul>
                        <li><code>value: number</code>: The value of the mark.</li>
                        <li><code>valueConfig: object</code>: The config of the mark's value label. When not provided, it will use default config.</li>
                        <li><code>markerConfig: object</code>: The config of the mark's char. When not provided, it will use default config.</li>
                    </ul>
                  </li>
                <li><code>valueConfig: object</code>: The default config of the mark's value label.
                    <ul>
                        <li><code>formatTextValue: (value: any) => string</code>: The format of the mark's value label. Default: <code>undefined</code></li>
                        <li><code>style: React.CSSProperties</code>: Overrides valueConfig styles. Default: <code>{fontSize: "10px", fill: "#464A4F", textShadow: "black 1px 1px 0px, black 0px 0px 2.5em, black 0px 0px 0.2em"}</code></li>
                        <li><code>hide: boolean</code>: Whether or not to hide the mark's value label. Default: <code>false</code></li>
                    </ul>
                  </li>
                <li><code>markerConfig: object</code>: The default config of the mark's char.
                  <ul>
                      <li><code>char: string</code>: The char of the mark. Default: <code>'_'</code></li>
                      <li><code>style: React.CSSProperties</code>: Overrides markerConfig styles. Default: <code>{fontSize: "18px", fill: "#464A4F", textShadow: "black 1px 1px 0px, black 0px 0px 2.5em, black 0px 0px 0.2em"}</code></li>
                      <li><code>hide: boolean</code>: Whether or not to hide the mark's char. Default: <code>false</code></li>
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
