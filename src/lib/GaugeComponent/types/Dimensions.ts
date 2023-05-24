export interface Margin {
    top: number;
    right: number;
    bottom: number;
    left: number;
}
export interface Angles {
    startAngle: number;
    endAngle: number;
    startAngleDeg: number;
    endAngleDeg: number;
}
export interface Dimensions {
    width: number;
    height: number;
    margin: Margin;
    angles: Angles;
    outerRadius: number;
    innerRadius: number;
    fixedHeight: number;
}
export const defaultMargins: Margin = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
}
export const defaultAngles: Angles = {
    startAngle: 0,
    endAngle: 0,
    startAngleDeg: 0,
    endAngleDeg: 0
}
export const defaultDimensions: Dimensions = {
    width: 0,
    height: 0,
    margin: defaultMargins,
    outerRadius: 0,
    innerRadius: 0,
    angles: defaultAngles,
    fixedHeight: 0
}