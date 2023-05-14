import { Arc, defaultArc } from "./Arc";
import { Labels, defaultLabels } from './Labels';
import { Needle, defaultNeedle } from './Needle';
import { Blob } from './Blob';
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
    needle: Needle,
    blob?: Blob
}

export const defaultGaugeProps: GaugeComponentProps = {
    id: "gauge",
    className: "gauge",
    style: { width: "100%"},
    marginInPercent: 0.05,
    value: 33,
    minValue: 0,
    maxValue: 100,
    arc: defaultArc,
    labels: defaultLabels,
    needle: defaultNeedle
}

