# react-gauge-component
React component for displaying a gauge chart, using D3.js 

This is forked from [@Martin36/react-gauge-chart](https://github.com/Martin36/react-gauge-chart) [0b24a45](https://github.com/Martin36/react-gauge-chart/pull/131).

# Demo
https://antoniolago.github.io/react-gauge-component/

# Usage
Install it by running `npm install react-gauge-component`. Then to use it:

```jsx
import GaugeComponent from 'react-gauge-component'

<GaugeComponent id="gauge-component1" />
```

## Examples

#### To create a default chart

```jsx
<GaugeComponent id="gauge-component1" />
```

#### Chart with 20 subArcs and pointer at 86%

```jsx
<GaugeComponent id="gauge-component2" 
  arc={{
    nbSubArcs: 20
  }}
  value={86} 
/>
```

#### Chart with custom colors and larger arc width

```jsx
<GaugeComponent id="gauge-component3"
  arc={{
    nbSubArcs: 30,
    colorArray: ["#FF5F6D", "#FFC371"]},
    width: 0.3
  }}
  value={37} 
/>
```

#### Chart with custom arcs width

```jsx
<GaugeComponent id="gauge-component5"
  arc={{
    nbSubArcs: 420,
    colorArray: ['#5BE12C', '#EA4228'],
    padding: 0.02,
    width: 0.2
  }}
  value={37}
/>
```

### Complex Custom Gauge with minValue/maxValue, marks outside the radius and formatTextValue for value and mark.

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
  id="gauge-component8"
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

# API

### Warning: Do not use the same `id` for multiple charts, as it will put multiple charts in the same container

<h2>Props:</h2>
<ul>
   <li><code>id: string</code>: A unique identifier for the div surrounding the chart. Default:<code>undefined</code>.</li>
   <li><code>className: string</code>: Adds a <code>className</code> to the div container. Default:<code>undefined</code>.</li>
   <li><code>style: React.CSSProperties</code>: Adds a style object to the div container. Default: <code>{width: 100}</code>.</li>
   <li><code>marginInPercent: number</code>: Sets the margin for the chart inside the containing SVG element. Default: <code>0.05</code>.</li>
   <li><code>value: number</code>: The value of the gauge. Default: <code>0</code>.</li>
   <li><code>minValue: number</code>: The minimum value of the gauge. Default: <code>0</code>.</li>
   <li><code>maxValue: number</code>: The maximum value of the gauge. Default: <code>100</code>.</li>
   <li><code>arc: object</code>: The arc of the gauge.
    <ul>
      <li><code>cornerRadius: number</code>: The corner radius of the arc. Default: <code>7</code>.</li>
      <li><code>padding: number</code>: The padding between subArcs, in rad. Default: <code>0.05</code>.</li>
      <li><code>width: number</code>: The width of the arc given in percent of the radius. Default: <code>0.2</code>.</li>
      <li><code>nbSubArcs: number</code>: The number of subArcs. This overrides <code>subArcs</code>. Default: <code>undefined</code></li>
      <li><code>colorArray: Array&lt;string&gt;</code>: The colors of the arcs. This overrides <code>subArcs</code> colors. Default: <code>undefined</code></li>
      <li><code>subArcs: Array&lt;object&gt;</code>: The subArcs of the gauge.
        <ul>
          <li><code>limit: number</code>: The subArc limit value. When no limits are defined in the next subArcs in the list, it's optional and will auto-calculate remaining arcs limits. Example: <code>[{limit: 70}, {}, {}, {}]</code>. In a default <code>minValue/maxValue</code>, the values will be equal to <code>[{limit: 70}, {limit: 80}, {limit: 90}, {limit: 100}]</code>. But <code>[{},{limit: 100}]</code> will not work properly as the not defined subArc limit has a subArc with limit defined ahead in the array.</li>
              <li><code>color: string</code>: The subArc color. When not provided, it will use default subArc's colors and interpolate first and last colors when subArcs number is greater than <code>colorArray</code>.</li>
              <li><code>showMark: boolean</code>: Whether or not to show the mark. Default: <code>false</code>.</li>
        </ul>
        Default:: 
        <code>
          [
            { limit: 33, color: "#5BE12C"},
            { limit: 66, color: "#F5CD19"},
            { color: "#EA4228"},
          ]
        </code>
      </li>
    </ul></li>
    <li><code>needle: object</code>: The needle of the gauge.
        <ul>
            <li><code>color: string</code>: The color of the needle. Default: <code>#464A4F</code></li>
            <li><code>baseColor: string</code>: The color of the base of the needle. Default: <code>#464A4F</code></li>
            <li><code>length: number</code>: The length of the needle 0-1, 1 being the outer radius length. Default: <code>0.70</code></li>
            <li><code>animate: boolean</code>: Whether or not to animate the needle. Default: <code>true</code></li>
            <li><code>elastic: boolean</code>: Whether or not to use elastic needle. Default: <code>false</code></li>
            <li><code>animationDuration: number</code>: The duration of the needle animation. Default: <code>3000</code></li>
            <li><code>animationDelay: number</code>: The delay of the needle animation. Default: <code>100</code></li>
            <li><code>width: number</code>: The width of the needle. Default: <code>15</code></li>
        </ul>
    </li>
    <li><code>labels: object</code>: The labels of the gauge.
      <ul>
         <li><code>valueLabel: object</code>: The center value label of the gauge.
            <ul>
               <li><code>formatTextValue: (value: any) => string</code>: The format of the value label. Default: <code>undefined</code>.</li>
               <li><code>fontSize: number</code>: The font size of the value label. Default: <code>35</code>.</li>
               <li><code>fontColor: string</code>: The font color of the value label. Default: <code>"#fff"</code>.</li>
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
                        <li><code>fontSize: number</code>: The font size of the mark's value label. Default: <code>15</code></li>
                        <li><code>fontColor: string</code>: The font color of the mark's value label. Default: <code>#464A4F</code></li>
                        <li><code>hide: boolean</code>: Whether or not to hide the mark's value label. Default: <code>false</code></li>
                    </ul>
                  </li>
                <li><code>markerConfig: object</code>: The default config of the mark's char.
                  <ul>
                      <li><code>char: string</code>: The char of the mark. Default: <code>'_'</code></li>
                      <li><code>charSize: number</code>: The font size of the mark's char. Default: <code>30</code></li>
                      <li><code>charColor: string</code>: The font color of the mark's char. Default: <code>#464A4F</code></li>
                      <li><code>hide: boolean</code>: Whether or not to hide the mark's char. Default: <code>false</code></li>
                  </ul>
                </li>
            </ul>
        </li>
      </ul>
    </li>
</ul>
##### Colors for the chart

The colors could either be specified as an array of hex color values, such as `["#FF0000", "#00FF00", "#0000FF"]` where
each arc would a color in the array (colors are assigned from left to right). If that is the case, then the **length of the array**
must match the **number of levels** in the arc.
If the number of colors does not match the number of levels, then the **first** and the **last** color from the colors array will
be selected and the arcs will get colors that are interpolated between those. The interpolation is done using [d3.interpolateHsl](https://github.com/d3/d3-interpolate#interpolateHsl).
