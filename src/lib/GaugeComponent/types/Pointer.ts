/** Visual effects for pointer */
export interface PointerEffects {
    /** Enable glow effect */
    glow?: boolean,
    /** Glow color (defaults to pointer color) */
    glowColor?: string,
    /** Glow blur radius (default: 8) */
    glowBlur?: number,
    /** Glow spread (default: 2) */
    glowSpread?: number,
    /** Drop shadow */
    dropShadow?: {
        dx?: number,
        dy?: number,
        blur?: number,
        color?: string,
        opacity?: number
    }
}

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
    /** Stroke width of the pointer border */
    strokeWidth?: number,
    /** Stroke/border color of the pointer. Defaults to a contrasting color */
    strokeColor?: string,
    /** Arrow offset - controls radial position of arrow pointer (0-1, default 0.72). Lower = closer to center, higher = closer to arc edge */
    arrowOffset?: number,
    /** Blob offset - controls radial position of blob pointer (0-1, default 0.5 = centered on arc). Lower = inner edge, higher = outer edge */
    blobOffset?: number,
    /** Hide the grab handle circle shown at pointer tip when drag mode is enabled */
    hideGrabHandle?: boolean,
    /** Visual effects for the pointer */
    effects?: PointerEffects,
    
    // Performance tuning options
    /** 
     * Maximum frames per second for animation updates (default: 60). 
     * Lower values reduce GPU/CPU load on mobile devices.
     * Recommended: 60 (smooth), 30 (balanced), 15 (low-power)
     */
    maxFps?: number,
    /** 
     * Minimum progress change threshold before updating DOM (default: 0.001).
     * Higher values skip more frames, reducing render load.
     * Range: 0.0001 (smooth) to 0.01 (choppy but fast)
     */
    animationThreshold?: number
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
    color: undefined, // undefined = use arc color by default
    baseColor: "white",
    length: 0.70,
    width: 20, // this is a factor to multiply by the width of the gauge
    animate: true,
    elastic: false,
    hide: false,
    animationDuration: 3000,
    animationDelay: 100,
    strokeWidth: 0,
    strokeColor: undefined,
    arrowOffset: 0.72,
    blobOffset: 0.5,
    hideGrabHandle: true,
    // Performance defaults - 60fps, fine threshold
    maxFps: 60,
    animationThreshold: 0.001
}

/**
 * Pointer configuration with an embedded value.
 * Used for multi-pointer gauges where each pointer points to its own value.
 * 
 * @example
 * // Compound turbo gauge with multiple pressure readings
 * pointers={[
 *   { value: 15, color: '#ff0000', label: 'Back Pressure' },
 *   { value: 25, color: '#00ff00', label: 'Turbo 1' },
 *   { value: 35, color: '#0000ff', label: 'Turbo 2' },
 * ]}
 */
export interface PointerWithValue extends PointerProps {
    /** The value this pointer points to */
    value: number;
    /** Optional label for this pointer's value (shown in value display) */
    label?: string;
}

/** Reference for a single pointer in multi-pointer mode */
export interface MultiPointerRef {
    element: any;
    path: any;
    context: PointerContext;
    /** Index of this pointer in the pointers array */
    index: number;
    /** Whether animation is currently in progress for this pointer */
    animationInProgress: boolean;
}
