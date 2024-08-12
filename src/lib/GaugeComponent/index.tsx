import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { pie, select } from "d3";
import { defaultGaugeProps, GaugeComponentProps, GaugeType, getGaugeMarginByType } from "./types/GaugeComponentProps";
import { Gauge } from "./types/Gauge";
import * as chartHooks from "./hooks/chart";
import * as arcHooks from "./hooks/arc";
import { isEmptyObject, mergeObjects } from "./hooks/utils";
import { Dimensions, defaultDimensions } from "./types/Dimensions";
import { PointerRef, defaultPointerRef } from "./types/Pointer";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";
import JsonViewEditor from '@uiw/react-json-view/editor';
import { DarkModeToggle } from 'react-dark-mode-toggle-2';
import './index.css';
import { Arc, getArcWidthByType } from "./types/Arc";

const ErrorFallback: React.FC<FallbackProps> = ({ error, resetErrorBoundary }) => (
  <div role="alert" style={{ color: "red" }}>
    <h1>Something went wrong.</h1>
    <p>{error.message}</p>
    <button onClick={resetErrorBoundary}>Try again</button>
  </div>
);

const GaugeComponent: React.FC<Partial<GaugeComponentProps>> = (props) => {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        // Reset the state of your app so the error doesn't happen again
      }}
    >
      <GaugeComponentContent {...props} />
    </ErrorBoundary>
  );
};

const GaugeComponentContent: React.FC<Partial<GaugeComponentProps>> = (props) => {
  const [currentProps, setCurrentProps] = useState<Partial<GaugeComponentProps>>(mergeObjects(defaultGaugeProps, props));
  const [editMode, setEditMode] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const svg = useRef<any>({});
  const tooltip = useRef<any>({});
  const g = useRef<any>({});
  const doughnut = useRef<any>({});
  const isFirstRun = useRef<boolean>(true);
  const currentProgress = useRef<number>(0);
  const pointer = useRef<PointerRef>({ ...defaultPointerRef });
  const container = useRef<any>({});
  const arcData = useRef<any>([]);
  const pieChart = useRef<any>(pie());
  const dimensions = useRef<Dimensions>({ ...defaultDimensions });
  const mergedProps = useRef<GaugeComponentProps>(currentProps as GaugeComponentProps);
  const prevProps = useRef<any>({});
  const selectedRef = useRef<HTMLDivElement>(null);

  const gauge: Gauge = {
    props: mergedProps.current,
    prevProps,
    svg,
    g,
    dimensions,
    doughnut,
    isFirstRun,
    currentProgress,
    pointer,
    container,
    arcData,
    pieChart,
    tooltip,
  };

  const updateMergedProps = () => {
    let defaultValues = { ...defaultGaugeProps };
    gauge.props = mergedProps.current = mergeObjects(defaultValues, currentProps);
    if (gauge.props.arc?.width === defaultGaugeProps.arc?.width) {
      let mergedArc = mergedProps.current.arc as Arc;
      mergedArc.width = getArcWidthByType(gauge.props.type as GaugeType);
    }
    if (gauge.props.marginInPercent === defaultGaugeProps.marginInPercent) {
      mergedProps.current.marginInPercent = getGaugeMarginByType(gauge.props.type as GaugeType);
    }
    arcHooks.validateArcs(gauge);
  };

  const shouldInitChart = () => {
    let arcsPropsChanged = (JSON.stringify(prevProps.current.arc) !== JSON.stringify(mergedProps.current.arc));
    let subArcsPropsChanged = (JSON.stringify(prevProps.current.arc?.subArc) !== JSON.stringify(mergedProps.current?.arc?.subArcs));
    let pointerPropsChanged = (JSON.stringify(prevProps.current.pointer) !== JSON.stringify(mergedProps.current.pointer));
    let minValueChanged = (JSON.stringify(prevProps.current.minValue) !== JSON.stringify(mergedProps.current.minValue));
    let maxValueChanged = (JSON.stringify(prevProps.current.maxValue) !== JSON.stringify(mergedProps.current.maxValue));
    return arcsPropsChanged || pointerPropsChanged || minValueChanged || maxValueChanged || subArcsPropsChanged;
  };

  useLayoutEffect(() => {
    updateMergedProps();
    isFirstRun.current = isEmptyObject(container.current);
    if (isFirstRun.current) container.current = select(selectedRef.current);
    if (shouldInitChart()) chartHooks.initChart(gauge);
    gauge.prevProps.current = mergedProps.current;
  }, [currentProps]);

  useEffect(() => {
    const observer = new MutationObserver(function () {
      if (!selectedRef.current?.offsetParent) return;

      chartHooks.renderChart(gauge, true);
      observer.disconnect();
    });
    const parentNode = selectedRef.current?.parentNode as HTMLElement | null;
    if (parentNode) {
      observer.observe(parentNode, { attributes: true, subtree: true });
    }
    return () => observer.disconnect();
  }, [selectedRef.current?.parentNode]);

  useEffect(() => {
    const handleResize = () => chartHooks.renderChart(gauge, true);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [currentProps]);

  const { id, style, className, type } = currentProps;

  const gaugeTypeClasses: Record<GaugeType, string> = {
    [GaugeType.Semicircle]: "semicircle-gauge",
    [GaugeType.Radial]: "radial-gauge",
    [GaugeType.Grafana]: "grafana-gauge",
  };

  return (
    <div>
      <div
        id={id}
        className={`${className} ${gaugeTypeClasses[type || GaugeType.Radial]}`}
        style={style}
        ref={selectedRef}
        onClick={() => setEditMode(true)}
      />
      <DebugModal
        editMode={editMode}
        setEditMode={setEditMode}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        currentProps={currentProps}
        setCurrentProps={setCurrentProps}
      />
    </div>
  );
};

export default GaugeComponent;

type DebugModalProps = {
  editMode: boolean;
  setEditMode: React.Dispatch<React.SetStateAction<boolean>>;
  isDarkMode: boolean;
  setIsDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
  currentProps: Partial<GaugeComponentProps>;
  setCurrentProps: React.Dispatch<React.SetStateAction<Partial<GaugeComponentProps>>>;
};
const DebugModal: React.FC<DebugModalProps> = ({ editMode, setEditMode, isDarkMode, setIsDarkMode, currentProps, setCurrentProps }) => {

  const formatPropValue = (value: any, isTopLevel: boolean = true): string => {
    if (value === null || value === undefined) {
      return '';  // Omit null or undefined values
    } else if (typeof value === 'string') {
      return `"${value}"`;
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      return isTopLevel ? `{${value}}` : `${value}`;  // Wrap numbers/booleans in braces only at the top level
    } else if (Array.isArray(value)) {
      return `[
        ${value.map(val => formatPropValue(val, false)).filter(val => val !== '').join(',\n        ')}
      ]`;
    } else if (typeof value === 'object' && value !== null) {
      const formattedObject = Object.entries(value)
        .map(([key, val]) => {
          const formattedVal = formatPropValue(val, false);
          return formattedVal !== '' ? `${key}: ${formattedVal}` : '';
        })
        .filter(val => val !== '') // Remove entries where values were null
        .join(',\n        ');
      return isTopLevel ? `{{${formattedObject}}}` : `{${formattedObject}}`;
    } else {
      return `${JSON.stringify(value)}`;
    }
  };

  const copyGaugeComponent = () => {
    const gaugeJSX = `
<GaugeComponent
  ${Object.entries(currentProps)
    .map(([key, value]) => {
      const formattedValue = formatPropValue(value, true);
      return formattedValue !== '' ? `${key}=${formattedValue}` : '';
    })
    .filter(val => val !== '')  // Remove any empty lines where values were null
    .join('\n  ')}
/>`;
    
    navigator.clipboard.writeText(gaugeJSX).then(() => {
      alert("GaugeComponent JSX copied to clipboard!");
    });
  };

  if (!editMode) return null;

  return (
    <div className={`modal`}>
      <div className={`modal-content ${isDarkMode ? "dark-mode" : "light-mode"}`}>
        <button className="close-button" onClick={() => setEditMode(false)}>
          Close
        </button>
        <div>
          <DarkModeToggle
            onChange={setIsDarkMode}
            isDarkMode={isDarkMode}
            size={80}
          />
        </div>
        <div className="modal-body">
          <div className={`editor json-editor ${isDarkMode ? "dark-mode" : "light-mode"}`}>
            <PropertyEditor
              currentProps={currentProps}
              setCurrentProps={setCurrentProps}
            />
          </div>
          <div className="gauge-preview" style={{display: "flex", flexDirection: "column-reverse"}}>
            <button onClick={copyGaugeComponent}>Copy Gauge JSX</button>
            <GaugeComponentContent key={JSON.stringify(currentProps)} {...currentProps} />
          </div>
        </div>
      </div>
    </div>
  );
};





type PropertyEditorProps = {
  currentProps: Partial<GaugeComponentProps>;
  setCurrentProps: React.Dispatch<React.SetStateAction<Partial<GaugeComponentProps>>>;
};

const PropertyEditor: React.FC<PropertyEditorProps> = ({ currentProps, setCurrentProps }) => {
  const handleEdit = (edit: any) => {
    const { namespace, value } = edit;

    setCurrentProps((prevProps: any) => {
      // Create a shallow copy of the current props
      const updatedProps = { ...prevProps };

      // Recursively apply the value based on the namespace array
      let obj = updatedProps;
      for (let i = 0; i < namespace.length - 1; i++) {
        const key = namespace[i];
        if (!obj[key]) obj[key] = {};  // Create the nested object if it doesn't exist
        obj = obj[key];
      }

      // Apply the new value
      obj[namespace[namespace.length - 1]] = value;
      return updatedProps;
    });
  };

  return (
    <div className="property-editor">
      <h3>Edit Properties</h3>
      <JsonViewEditor
        value={currentProps}
        collapsed={2}
        indentWidth={15}
        enableClipboard={true}
        displayDataTypes={true}
        displayObjectSize={true}
        onEdit={handleEdit}
      />
    </div>
  );
};
