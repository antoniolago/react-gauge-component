import { defaultTickLabels, TickLabels } from './Tick';

/** Visual effects for labels */
export interface LabelEffects {
    /** Enable glow effect */
    glow?: boolean,
    /** Glow color (defaults to label color) */
    glowColor?: string,
    /** Glow blur radius (default: 6) */
    glowBlur?: number,
    /** Glow spread (default: 2) */
    glowSpread?: number,
    /** Text shadow for enhanced readability */
    textShadow?: string
}

export interface Labels {
    /** This configures the central value label. */
    valueLabel?: ValueLabel,
    /** This configures the ticks and it's values labels. */
    tickLabels?: TickLabels
}

export interface ValueLabel {
    /** This function enables to format the central value text as you wish. */
    formatTextValue?: (value: any) => string;
    /** 
     * Render a custom React element instead of text for the value label.
     * Receives the current value and arc color as parameters.
     * When provided, this takes precedence over formatTextValue.
     * 
     * @example
     * renderContent: (value, color) => (
     *   <div style={{ textAlign: 'center' }}>
     *     <span style={{ fontSize: '2rem', color }}>{value}</span>
     *     <span style={{ fontSize: '0.8rem' }}>km/h</span>
     *   </div>
     * )
     */
    renderContent?: (value: number, arcColor: string) => React.ReactNode;
    /** This will sync the value label color with the current value of the Gauge. */
    matchColorWithArc?: boolean;
    /** Maximum number of decimal digits to display in the value label. */
    maxDecimalDigits?: number;
    /** Central label value will inherit this */
    style?: React.CSSProperties;
    /** This hides the central value label if true */
    hide?: boolean;
    /** Horizontal offset for the value label position. Positive moves right. */
    offsetX?: number;
    /** Vertical offset for the value label position. Positive moves down. */
    offsetY?: number;
    /** 
     * Width of the foreignObject container for custom React content.
     * Only used when renderContent is provided. Defaults to 100.
     */
    contentWidth?: number;
    /** 
     * Height of the foreignObject container for custom React content.
     * Only used when renderContent is provided. Defaults to 50.
     */
    contentHeight?: number;
    /** Visual effects for the value label */
    effects?: LabelEffects;
    /** 
     * When true, the value label updates in real-time during pointer animation
     * to show the current animated value instead of the target value.
     * Default: false
     */
    animateValue?: boolean;
    /**
     * How to display values in multi-pointer mode.
     * - 'primary': Show only the first pointer's value (default)
     * - 'all': Show all pointer values stacked vertically
     * - 'none': Hide value label entirely in multi-pointer mode
     */
    multiPointerDisplay?: 'primary' | 'all' | 'none';
}

export const defaultValueLabel: ValueLabel = {
    formatTextValue: undefined,
    matchColorWithArc: false,
    maxDecimalDigits: 2,
    style: {
        fontSize: "35px",
        fill: '#fff',
        textShadow: "black 1px 0.5px 0px, black 0px 0px 0.03em, black 0px 0px 0.01em"
    },
    hide: false,
    offsetX: 0,
    offsetY: 0
}
export const defaultLabels: Labels = {
    valueLabel: defaultValueLabel,
    tickLabels: defaultTickLabels
}