export interface PointerProps {
    /** Pointer type */
    type?: "needle" | "blob" | "arrow",
    /** Pointer color */
    color?: string,
    /** Enabling this flag will hide the pointer */
    hide?: boolean,
    /** Pointer color of the central circle */
    baseColor?: string,
    /** Pointer length */
    length?: number,
    /** This is a factor to multiply by the width of the gauge */
    width?: number,
    /** This enables pointer animation for transiction between values when enabled */
    animate?: boolean,
    /** This gives animation an elastic transiction between values */
    elastic?: boolean,
    /** Animation duration in ms */
    animationDuration?: number,
    /** Animation delay in ms */
    animationDelay?: number,
    /** Stroke width of the pointer */
    strokeWidth?: number
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
    hide: false,
    animationDuration: 3000,
    animationDelay: 100,
    strokeWidth: 8
}
