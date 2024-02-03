import React from "react";
import { useState } from "react";
import { ReactGaugeComponent } from "./Gauge";
const InputTest = () => {
    const [value, setValue] = useState(50);
    const [min, setMin] = useState(0);
    const [max, setMax] = useState(100);
    const [hideLabel, setHideLabel] = useState(false);
  
    return (
      <div className="App">
        <input
          type={"number"}
          defaultValue={value}
          onChange={(event) =>
            setValue((old) => {
              const newValue = parseFloat(event.target.value);
              if (isNaN(newValue)) {
                return old;
              }
              return newValue;
            })
          }
        />
        <input
          type={"number"}
          defaultValue={min}
          onChange={(event) =>
            setMin((old) => {
              const newValue = parseFloat(event.target.value);
              if (isNaN(newValue)) {
                return old;
              }
              return newValue;
            })
          }
        />
        <input
          type={"number"}
          defaultValue={max}
          onChange={(event) =>
            setMax((old) => {
              const newValue = parseFloat(event.target.value);
              if (isNaN(newValue)) {
                return old;
              }
              return newValue;
            })
          }
        />
        <input
          type="checkbox"
          checked={hideLabel}
          onChange={(event) => setHideLabel(event.target.checked)}
        />
        <ReactGaugeComponent
          value={value}
          min={min}
          max={max}
          hideLabel={hideLabel}
        />
      </div>
    );
  }
export default InputTest;  