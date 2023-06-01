import { get } from 'lodash';
import { GaugeType, defaultGaugeProps } from './GaugeComponentProps';
import { Tooltip } from './Tooltip';
export interface Arc {
    cornerRadius?: number, //The corner radius of the arc
    padding?: number, //The padding between subArcs, in rad
    width?: number, //The width of the arc given in percent of the radius
    nbSubArcs?: number, //The number of subArcs, this overrides "subArcs" limits
    gradient?: boolean,
    colorArray?: Array<string>, //The colors of the arcs, this overrides "subArcs" colors
    subArcs?: Array<SubArc>
}
export interface SubArc {
    limit?: number, //The limit of the subArc, in accord to the gauge value
    color?: string | number, //The color of the subArc
    length?: number, //The length of the subArc, in percent
    // needleColorWhenWithinLimit?: string, //The color of the needle when it is within the subArc
    showMark?: boolean, //Whether or not to show the mark
    tooltip?: Tooltip,
    onClick?: () => void,
    onMouseMove?: () => void,
    onMouseLeave?: () => void
}
export const defaultSubArcs: SubArc[] = [
    { limit: 33, color: "#5BE12C" }, // needleColorWhenWithinLimit: "#AA4128"},
    { limit: 66, color: "#F5CD19" },
    { color: "#EA4228" },
];

export const getArcWidthByType = (type: string): number => {
    let gaugeTypesWidth: Record<string, number> = {
        [GaugeType.Grafana]: 0.25,
        [GaugeType.Semicircle]: 0.15,
        [GaugeType.Radial]: 0.2,
    };
    if(!type) type = defaultGaugeProps.type as string;
    return gaugeTypesWidth[type as string];
}
export const defaultArc: Arc = {
    padding: 0.05,
    width: 0.25,
    cornerRadius: 7,
    nbSubArcs: undefined,
    colorArray: undefined,
    subArcs: defaultSubArcs,
    gradient: false
};