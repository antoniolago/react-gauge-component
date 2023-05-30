import { Arc, defaultArc } from "./Arc";
import { Labels, defaultLabels } from './Labels';
import { PointerProps, defaultPointer } from "./Pointer";
export enum GaugeType {
    Semicircle = "semicircle",
    Radial = "radial",
    Grafana = "grafana"
}
export interface GaugeInnerMarginInPercent {
    top: number,
    bottom: number,
    left: number,
    right: number
}
export interface GaugeComponentProps {
    id?: string,
    className?: string,
    style?: React.CSSProperties,
    marginInPercent?: GaugeInnerMarginInPercent | number,
    value?: number,
    minValue?: number,
    maxValue?: number,
    arc?: Arc,
    labels?: Labels,
    pointer?: PointerProps,
    type?: string
}

export const defaultGaugeProps: GaugeComponentProps = {
    id: "",
    className: "gauge-component-class",
    style: { width: "100%"},
    marginInPercent: 0.07,
    value: 33,
    minValue: 0,
    maxValue: 100,
    arc: defaultArc,
    labels: defaultLabels,
    pointer: defaultPointer,
    type: GaugeType.Grafana
}
export const getGaugeMarginByType = (type: string): GaugeInnerMarginInPercent | number => {
    let gaugeTypesMargin: Record<string, GaugeInnerMarginInPercent | number> = {
        [GaugeType.Grafana]: { top: 0.12, bottom: 0.00, left: 0.07, right: 0.07 },
        [GaugeType.Semicircle]: { top: 0.08, bottom: 0.00, left: 0.07, right: 0.07 },
        [GaugeType.Radial]: { top: 0.07, bottom: 0.00, left: 0.07, right: 0.07 },
    };
    return gaugeTypesMargin[type as string];
}