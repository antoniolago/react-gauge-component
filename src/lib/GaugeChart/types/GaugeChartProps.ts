import { Arc, defaultArc } from "./Arc";
import { Labels, defaultLabels } from './Labels';
import { Needle, defaultNeedle } from './Needle';
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
    needle: Needle
}

export const defaultGaugeProps: GaugeComponentProps = {
    id: "gauge",
    className: "gauge",
    style: { width: "100%", height: '250px' },
    marginInPercent: 0.05,
    value: 33,
    minValue: 0,
    maxValue: 100,
    arc: defaultArc,
    labels: defaultLabels,
    needle: defaultNeedle
}

