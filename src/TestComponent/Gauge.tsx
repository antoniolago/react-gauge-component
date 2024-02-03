import * as React from "react";
import GaugeComponent from '../lib/GaugeComponent';
export type ReactGaugeComponentProps = {
  value: number;
  min: number;
  max: number;
  hideLabel: boolean;
};

export const ReactGaugeComponent: React.FC<ReactGaugeComponentProps> = ({
  value,
  min,
  max,
  hideLabel,
}) => {
  console.log("rendering", min, max, value);

  return (
    <div>
      <p>ReactGauge</p>
      <GaugeComponent
        type="semicircle"
        arc={{
          // colorArray: ["#00FF15", "#FF2121"],
          padding: 0,
          subArcs: [
            { limit: 40 },
            { limit: 60 },
            { limit: 70 },
            { length: 5, color: "blue" },
            {},
            {},
            {},
          ],
        }}
        pointer={{ type: "blob", animationDelay: 0 }}
        value={value}
        minValue={min}
        maxValue={max}
        labels={{
          tickLabels: {
            // defaultTickValueConfig: { hide: hideLabel },
            // defaultTickLineConfig: { hide: hideLabel },
            ticks: [
              {
                value: min,
                valueConfig: { formatTextValue: (value) => `${value} %` },
                // lineConfig: { hide: hideLabel },
              },
              {
                value,
                valueConfig: { formatTextValue: (value) => `${value} %` },
                // lineConfig: { hide: hideLabel },
              },
              {
                value: max,
                valueConfig: { formatTextValue: (value) => `${value} %` },
                // lineConfig: { hide: hideLabel },
              },
            ],
          },
        }}
      />
    </div>
  );
};
