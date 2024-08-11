import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { pie, select } from "d3";
import { defaultGaugeProps, GaugeComponentProps, GaugeType, getGaugeMarginByType } from "./types/GaugeComponentProps";
import { Gauge } from "./types/Gauge";
import * as chartHooks from "./hooks/chart";
import * as arcHooks from "./hooks/arc";
import { isEmptyObject, mergeObjects } from "./hooks/utils";
import { Dimensions, defaultDimensions } from "./types/Dimensions";
import { PointerRef, defaultPointerRef } from "./types/Pointer";
import { Arc, getArcWidthByType } from "./types/Arc";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";
import JsonView from '@uiw/react-json-view';
import './index.css';
import JsonViewEditor from '@uiw/react-json-view/editor';
import { lightTheme } from '@uiw/react-json-view/light';
import { darkTheme } from '@uiw/react-json-view/dark';
import { TriangleArrow } from '@uiw/react-json-view/triangle-arrow';
import { TriangleSolidArrow } from '@uiw/react-json-view/triangle-solid-arrow';
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
        // You might want to do something here
      }}
    >
      <GaugeComponentContent {...props} />
    </ErrorBoundary>
  );
};

const GaugeComponentContent: React.FC<Partial<GaugeComponentProps>> = (props) => {
  const [currentProps, setCurrentProps] = useState<Partial<GaugeComponentProps>>(mergeObjects(defaultGaugeProps, props));
  const [editMode, setEditMode] = useState(false);
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
  let selectedRef = useRef<HTMLDivElement>(null);

  var gauge: Gauge = {
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
    tooltip
  };

  const updateMergedProps = () => {
    let defaultValues = { ...defaultGaugeProps };
    gauge.props = mergedProps.current = mergeObjects(defaultValues, currentProps);
    if (gauge.props.arc?.width == defaultGaugeProps.arc?.width) {
      let mergedArc = mergedProps.current.arc as Arc;
      mergedArc.width = getArcWidthByType(gauge.props.type as GaugeType);
    }
    if (gauge.props.marginInPercent == defaultGaugeProps.marginInPercent) {
      mergedProps.current.marginInPercent = getGaugeMarginByType(gauge.props.type as GaugeType);
    }
    arcHooks.validateArcs(gauge);
  }

  const shouldInitChart = () => {
    let arcsPropsChanged = (JSON.stringify(prevProps.current.arc) !== JSON.stringify(mergedProps.current.arc));
    let subArcsPropsChanged = (JSON.stringify(prevProps.current.arc?.subArc) !== JSON.stringify(mergedProps.current?.arc?.subArcs));
    let pointerPropsChanged = (JSON.stringify(prevProps.current.pointer) !== JSON.stringify(mergedProps.current.pointer));
    let minValueChanged = (JSON.stringify(prevProps.current.minValue) !== JSON.stringify(mergedProps.current.minValue));
    let maxValueChanged = (JSON.stringify(prevProps.current.maxValue) !== JSON.stringify(mergedProps.current.maxValue));
    return arcsPropsChanged || pointerPropsChanged || minValueChanged || maxValueChanged || subArcsPropsChanged;
  }

  useLayoutEffect(() => {
    updateMergedProps();
    isFirstRun.current = isEmptyObject(container.current)
    if (isFirstRun.current) container.current = select(selectedRef.current);
    if (shouldInitChart()) chartHooks.initChart(gauge);
    gauge.prevProps.current = mergedProps.current;
  }, [currentProps]);

  useEffect(() => {
    const observer = new MutationObserver(function () {
      if (!selectedRef.current?.offsetParent) return;

      chartHooks.renderChart(gauge, true);
      observer.disconnect()
    });
    observer.observe(selectedRef.current?.parentNode!, { attributes: true, subtree: true });
    return () => observer.disconnect();
    //@ts-ignore
  }, [selectedRef.current?.parentNode?.offsetWidth, selectedRef.current?.parentNode?.offsetHeight]);

  useEffect(() => {
    const handleResize = () => chartHooks.renderChart(gauge, true);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [currentProps]);

  const { id, style, className, type } = currentProps;

  const gaugeTypeClasses: Record<GaugeType, string> = {
    [GaugeType.Semicircle]: "semicircle-gauge",
    [GaugeType.Radial]: "radial-gauge",
    [GaugeType.Grafana]: "grafana-gauge"
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
      {editMode && (
        <div className="modal">
          <div className="modal-content">
            <button className="close-button" onClick={() => setEditMode(false)}>Close</button>
            <div className="modal-body">
              <div className="editor">
                <PropertyEditor
                  currentProps={currentProps}
                  setCurrentProps={setCurrentProps}
                />
              </div>
              <div className="gauge-preview">
                <GaugeComponentContent {...currentProps} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GaugeComponent;

type PropertyEditorProps = {
  currentProps: Partial<GaugeComponentProps>;
  setCurrentProps: React.Dispatch<React.SetStateAction<Partial<GaugeComponentProps>>>;
};

const PropertyEditor: React.FC<PropertyEditorProps> = ({ currentProps, setCurrentProps }) => {
  const handleEdit = (edit: any) => {
    setCurrentProps((prevProps) => ({
      ...prevProps,
      [edit.name]: edit.updated_src[edit.name]
    }));
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
        // theme="dark"
      />
    </div>
  );
};
