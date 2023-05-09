export interface Arc {
    cornerRadius?: number, //The corner radius of the arc
    padding: number, //The padding between subArcs, in rad
    width: number, //The width of the arc given in percent of the radius
    nbSubArcs?: number, //The number of subArcs, this overrides "subArcs" limits
    colorArray?: Array<string>, //The colors of the arcs, this overrides "subArcs" colors
    subArcs: Array<SubArc>
}
interface SubArc {
    limit?: number, //The limit of the subArc, in accord to the gauge value
    color?: string, //The color of the subArc
    // needleColorWhenWithinLimit?: string, //The color of the needle when it is within the subArc
    showMark?: boolean, //Whether or not to show the mark
}
export const defaultSubArcs: SubArc[] = [
    { limit: 33, color: "#5BE12C"}, // needleColorWhenWithinLimit: "#AA4128"},
    { limit: 66, color: "#F5CD19"},
    { color: "#EA4228"},
];

export const defaultArc: Arc = {
    padding: 0.05,
    width: 0.15,
    cornerRadius: 7,
    nbSubArcs: undefined,
    colorArray: undefined,
    subArcs: defaultSubArcs,
};
