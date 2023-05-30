export interface PointerProps {
    type?: string;
    color?: string,
    baseColor?: string,
    length?: number,
    width?: number, // this is a factor to multiply by the width of the gauge
    animate?: boolean,
    elastic?: boolean,
    animationDuration?: number,
    animationDelay?: number,
}
export interface PointerRef {
    element: any,
    path: any,
    context: PointerContext
}
export interface PointerContext {
    centerPoint: number[],
    pointerRadius: number,
    pathLength: number,
    currentPercent: number,
    prevPercent: number,
    prevProgress: number,
    pathStr: string,
    shouldDrawPath: boolean,
    prevColor: string
}
export enum PointerType {
    Needle = "needle",
    Blob = "blob",
    Arrow = "arrow"
}
export const defaultPointerContext: PointerContext = {
    centerPoint: [0, 0],
    pointerRadius: 0,
    pathLength: 0,
    currentPercent: 0,
    prevPercent: 0,
    prevProgress: 0,
    pathStr: "",
    shouldDrawPath: false,
    prevColor: ""
}
export const defaultPointerRef: PointerRef = {
    element: undefined,
    path: undefined,
    context: defaultPointerContext
}
export const defaultPointer: PointerProps = {
    type: PointerType.Needle,
    color: "#5A5A5A",
    baseColor: "white",
    length: 0.70,
    width: 20, // this is a factor to multiply by the width of the gauge
    animate: true,
    elastic: false,
    animationDuration: 3000,
    animationDelay: 100,
}