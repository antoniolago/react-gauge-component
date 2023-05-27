import { Arc, defaultArc } from "./Arc";
import { Labels, defaultLabels } from './Labels';
import { PointerProps, defaultPointer } from "./Pointer";
export enum GaugeType {
    Semicircle = "semicircle",
    Radial = "radial"
}
export interface GaugeComponentProps {
    id: string,
    className: string,
    style: React.CSSProperties,
    marginInPercent: number,
    value: number,
    minValue: number,
    maxValue: number,
    arc: Arc,
    labels: Labels,
    pointer: PointerProps,
    type: GaugeType
}

export const defaultGaugeProps: GaugeComponentProps = {
    id: "",
    className: "gauge-component-class",
    style: { width: "100%"},
    marginInPercent: 0.05,
    value: 33,
    minValue: 0,
    maxValue: 100,
    arc: defaultArc,
    labels: defaultLabels,
    pointer: defaultPointer,
    type: GaugeType.Semicircle
}

