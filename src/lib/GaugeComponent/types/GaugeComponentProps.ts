import { Arc, defaultArc } from "./Arc";
import { Labels, defaultLabels } from './Labels';
import { PointerProps, PointerWithValue, defaultPointer } from "./Pointer";
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
    /** Gauge element will inherit this. */
    id?: string,
    /** Gauge element will inherit this. */
    className?: string,
    /** Gauge element will inherit this. */
    style?: React.CSSProperties,
    /** Configures the canvas margin relative to the gauge. Can be a single number or per-side object. Unit: ratio (0-1, e.g., 0.07 = 7%). */
    marginInPercent?: GaugeInnerMarginInPercent | number,
    /** Current pointer value. */
    value?: number,
    /** Enables pointerless-style segmented progress coloring for the arc segments. */
    segmentedProgress?: boolean,
    /** Top-level alias for pointer visibility. When false, the pointer is hidden. */
    showPointer?: boolean,
    /** Color or color palette used for filled segments when segmentedProgress is enabled. Falls back to each segment's configured color. */
    activeSegmentColor?: string | string[],
    /** Color palette used for filled segments when segmentedProgress is enabled. Takes precedence over activeSegmentColor. */
    activeSegmentColors?: string[],
    /** Color used for unfilled segments when segmentedProgress is enabled. */
    inactiveSegmentColor?: string,
    /** Minimum value possible for the Gauge. */
    minValue?: number,
    /** Maximum value possible for the Gauge. */
    maxValue?: number,
    /** This configures the arc of the Gauge. */
    arc?: Arc,
    /** This configures the labels of the Gauge. */
    labels?: Labels,
    /** This configures the pointer of the Gauge. Used for single pointer mode. */
    pointer?: PointerProps,
    /** 
     * Array of pointers with their own values for multi-pointer mode.
     * Each pointer can have its own value, color, and configuration.
     * When provided, this takes precedence over the single `value` and `pointer` props.
     * 
     * @example
     * // Compound turbo gauge with multiple pressure readings
     * pointers={[
     *   { value: 15, color: '#ff0000', label: 'Back Pressure' },
     *   { value: 25, color: '#00ff00', label: 'Turbo 1' },
     *   { value: 35, color: '#0000ff', label: 'Turbo 2' },
     * ]}
     */
    pointers?: PointerWithValue[],
    /** This configures the type of the Gauge. */
    type?: "semicircle" | "radial" | "grafana",
    /** Custom start angle. Unit: degrees. -90 = top left, 0 = top, 90 = top right, -180/180 = bottom */
    startAngle?: number,
    /** Custom end angle. Unit: degrees. -90 = top left, 0 = top, 90 = top right, -180/180 = bottom */
    endAngle?: number,
    /** Callback fired when value changes via pointer drag (single pointer mode). Enables input mode. */
    onValueChange?: (value: number) => void,
    /** 
     * Callback fired when any pointer value changes via drag (multi-pointer mode).
     * Receives the index of the pointer and the new value.
     * Enables input mode for all pointers.
     */
    onPointerChange?: (index: number, value: number) => void,
    /** Enable fade-in animation on initial render. Default: false */
    fadeInAnimation?: boolean
}

export const defaultGaugeProps: GaugeComponentProps = {
    id: Math.random().toString(36).slice(2),
    className: "gauge-component-class",
    style: { width: "100%"},
    marginInPercent: 0.07,
    value: 33,
    segmentedProgress: false,
    showPointer: true,
    inactiveSegmentColor: "#E6E6E9",
    minValue: 0,
    maxValue: 100,
    arc: defaultArc,
    labels: defaultLabels,
    pointer: defaultPointer,
    type: GaugeType.Grafana,
    fadeInAnimation: false
}
export const getGaugeMarginByType = (type: string): GaugeInnerMarginInPercent | number => {
    let gaugeTypesMargin: Record<string, GaugeInnerMarginInPercent | number> = {
        [GaugeType.Grafana]: { top: 0.12, bottom: 0.00, left: 0.07, right: 0.07 },
        [GaugeType.Semicircle]: { top: 0.08, bottom: 0.00, left: 0.08, right: 0.08 },
        [GaugeType.Radial]: { top: 0.07, bottom: 0.00, left: 0.07, right: 0.07 },
    };
    return gaugeTypesMargin[type as string];
}
