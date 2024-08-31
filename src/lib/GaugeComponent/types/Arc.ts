import { GaugeType, defaultGaugeProps } from './GaugeComponentProps';
import { Tooltip } from './Tooltip';
export interface Arc {
    /** The corner radius of the arc. */
    cornerRadius?: number,
    /** The padding between subArcs, in rad. */
    padding?: number,
    /** The width of the arc given in percent of the radius. */
    width?: number,
    /** The number of subArcs, this overrides "subArcs" limits. */
    nbSubArcs?: number,
    /** Boolean flag that enables or disables gradient mode, which
     * draws a single arc with provided colors. */
    gradient?: boolean,
    /** The colors of the arcs, this overrides "subArcs" colors. */
    colorArray?: Array<string>,
    /** Color of the grafana's empty subArc  */
    emptyColor?: string,
    /** list of sub arcs segments of the whole arc. */
    subArcs?: Array<SubArc>
}
export interface SubArc {
    /** The limit of the subArc, in accord to the gauge value. */
    limit?: number,
    /** The color of the subArc */
    color?: string | number,
    /** The length of the subArc, in percent */
    length?: number,
    // needleColorWhenWithinLimit?: string, //The color of the needle when it is within the subArc
    /** Whether or not to show the tick */
    showTick?: boolean,
    /** Tooltip that appears onHover of the subArc */
    tooltip?: Tooltip,
    /** This will trigger onClick of the subArc */
    onClick?: () => void,
    /** This will trigger onMouseMove of the subArc */
    onMouseMove?: () => void,
    /** This will trigger onMouseMove of the subArc */
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
    emptyColor: "#5C5C5C",
    colorArray: undefined,
    subArcs: defaultSubArcs,
    gradient: false
};