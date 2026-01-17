# react-gauge-component 
[![GitHub](https://img.shields.io/badge/github-%23121011.svg?style=for-the-badge&logo=github&logoColor=white)](https://github.com/antoniolago/react-gauge-component)
[![Forgejo](https://img.shields.io/badge/forgejo-%23FB923C.svg?style=for-the-badge&logo=forgejo&logoColor=white)](https://git.lag0.com.br/antoniolago/react-gauge-component)

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
 

## Forked from [@Martin36/react-gauge-chart](https://github.com/Martin36/react-gauge-chart) [0b24a45](https://github.com/Martin36/react-gauge-chart/pull/131).

