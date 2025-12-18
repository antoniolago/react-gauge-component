import { random } from "lodash";
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
    /** This configures the canvas margin in relationship with the gauge. 
     * Default values: 
     * [GaugeType.Grafana]: { top: 0.12, bottom: 0.00, left: 0.07, right: 0.07 },
        [GaugeType.Semicircle]: { top: 0.08, bottom: 0.00, left: 0.07, right: 0.07 },
        [GaugeType.Radial]: { top: 0.07, bottom: 0.00, left: 0.07, right: 0.07 },
    */
    marginInPercent?: GaugeInnerMarginInPercent | number,
    /** Current pointer value. */
    value?: number,
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
    /** Custom start angle in degrees. -90 = top left, 0 = top, 90 = top right, -180/180 = bottom */
    startAngle?: number,
    /** Custom end angle in degrees. -90 = top left, 0 = top, 90 = top right, -180/180 = bottom */
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
    id: random(0, 100000).toString(),
    className: "gauge-component-class",
    style: { width: "100%"},
    marginInPercent: 0.07,
    value: 33,
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