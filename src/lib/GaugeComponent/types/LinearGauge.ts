import { DropShadowConfig } from './Arc';

/** Orientation for the linear gauge */
export type LinearGaugeOrientation = 'horizontal' | 'vertical';

/** Visual effects for the linear gauge track/bar */
export interface LinearGaugeEffects {
    /** Enable glow effect. */
    glow?: boolean;
    /** Glow color (defaults to segment color). */
    glowColor?: string;
    /** Glow blur radius. Unit: pixels (default: 6). */
    glowBlur?: number;
    /** Glow spread. Unit: pixels (default: 2). */
    glowSpread?: number;
    /** Drop shadow effect. */
    dropShadow?: DropShadowConfig;
    /** Enable rounded corners. */
    rounded?: boolean;
}

/** Configuration for a segment of the linear gauge */
export interface LinearGaugeSegment {
    /** The limit value for this segment. Unit: gauge value units. */
    limit?: number;
    /** The color of this segment. */
    color?: string;
    /** The length of the segment. Unit: ratio (0-1, e.g., 0.5 = 50% of track). */
    length?: number;
    /** Tooltip text shown on hover. */
    tooltip?: string;
    /** Click handler for this segment. */
    onClick?: () => void;
}

/** Configuration for the pointer/marker */
export interface LinearGaugePointer {
    /** Pointer type: 'arrow' (triangle arrow), 'triangle' (simple triangle), 'diamond', 'line' (line indicator), 'pill' (rounded capsule), or 'none'. */
    type?: 'arrow' | 'triangle' | 'diamond' | 'line' | 'pill' | 'none';
    /** Pointer color. */
    color?: string;
    /** Pointer size (width). Unit: pixels (default: 12). */
    size?: number;
    /** Pointer height (for arrow/triangle). Unit: pixels (default: size * 1.5). */
    height?: number;
    /** Stroke width for the pointer. Unit: pixels. */
    strokeWidth?: number;
    /** Stroke color for the pointer. */
    strokeColor?: string;
    /** Whether to animate pointer movement. */
    animate?: boolean;
    /** Animation duration. Unit: milliseconds (default: 500). */
    animationDuration?: number;
    /** Position: 'top', 'bottom', 'inside', 'both' for horizontal; 'left', 'right', 'inside', 'both' for vertical. */
    position?: 'top' | 'bottom' | 'left' | 'right' | 'inside' | 'both';
    /** Visual effects for the pointer. */
    effects?: LinearGaugeEffects;
    /** Show the fill/paint from min to current value (Grafana-style). Default: true. */
    showFill?: boolean;
    /** Y offset for pointer position. Unit: pixels (default: 0). Positive = away from track. */
    offsetY?: number;
}

/** Configuration for sub-line (reference line like Grafana subarc) */
export interface LinearGaugeSubLine {
    /** Show the sub-line. */
    show?: boolean;
    /** Sub-line color. */
    color?: string;
    /** Sub-line thickness. Unit: pixels (default: 4). */
    thickness?: number;
    /** Sub-line position offset from main track. Unit: pixels (default: 0 = inside track). */
    offset?: number;
    /** Opacity of the sub-line. Unit: 0-1 (default: 0.5). */
    opacity?: number;
}

/** Configuration for the track (background bar) */
export interface LinearGaugeTrack {
    /** Height/width of the track. Unit: pixels (default: 20). */
    thickness?: number;
    /** Background color for empty/unfilled portion. */
    backgroundColor?: string;
    /** Border radius for the track. Unit: pixels (default: 0, or half of thickness if rounded). */
    borderRadius?: number;
    /** Stroke width for track border. Unit: pixels. */
    strokeWidth?: number;
    /** Stroke color for track border. */
    strokeColor?: string;
    /** Visual effects for the track. */
    effects?: LinearGaugeEffects;
    /** List of segments (colored sections of the track). */
    segments?: LinearGaugeSegment[];
    /** Colors array for gradient or segment coloring (overrides segments). */
    colorArray?: string[];
    /** Enable gradient mode for smooth color transitions. */
    gradient?: boolean;
    /** Sub-line configuration (secondary reference line like Grafana subarc). */
    subLine?: LinearGaugeSubLine;
}

/** Configuration for tick marks */
export interface LinearGaugeTick {
    /** Value at which to place the tick. Unit: gauge value units. */
    value: number;
    /** Tick line length. Unit: pixels (default: 8). */
    length?: number;
    /** Tick line width. Unit: pixels (default: 1). */
    width?: number;
    /** Tick line color. */
    color?: string;
    /** Label text (if undefined, uses the value). */
    label?: string;
    /** Hide the tick line but show label. */
    hideLine?: boolean;
    /** Hide the label but show tick line. */
    hideLabel?: boolean;
    /** Whether this is a major tick (larger). */
    major?: boolean;
}

/** Configuration for tick labels and lines */
export interface LinearGaugeTicks {
    /** Array of tick configurations. */
    ticks?: LinearGaugeTick[];
    /** Hide min/max ticks. */
    hideMinMax?: boolean;
    /** Number of auto-generated major ticks (if ticks array not provided). */
    count?: number;
    /** Number of minor ticks between major ticks. */
    minorTicks?: number;
    /** Tick position: 'top', 'bottom', 'inside-top', 'inside-bottom', or 'both' for horizontal; 'left', 'right', 'inside-left', 'inside-right', or 'both' for vertical. */
    position?: 'top' | 'bottom' | 'left' | 'right' | 'inside-top' | 'inside-bottom' | 'inside-left' | 'inside-right' | 'both';
    /** For inside positions: place labels on same side as tick lines (default: false, labels on opposite side). */
    labelsInside?: boolean;
    /** Major tick line length. Unit: pixels (default: 12). */
    majorLength?: number;
    /** Minor tick line length. Unit: pixels (default: 6). */
    minorLength?: number;
    /** Default tick line length (deprecated, use majorLength). Unit: pixels (default: 8). */
    length?: number;
    /** Default tick line width. Unit: pixels (default: 1). */
    width?: number;
    /** Default tick line color. */
    color?: string;
    /** Distance from track (for outside ticks). Unit: pixels (default: 2). */
    distanceFromTrack?: number;
    /** Show labels only for major ticks. */
    labelsOnMajorOnly?: boolean;
    /** Label style. */
    labelStyle?: React.CSSProperties;
    /** Function to format tick labels. */
    formatLabel?: (value: number) => string;
}

/** Configuration for the value label */
export interface LinearGaugeValueLabel {
    /** Hide the value label. */
    hide?: boolean;
    /** Position of the value label: 'center' (inside track), 'right', 'left', 'top', 'bottom'. */
    position?: 'center' | 'right' | 'left' | 'top' | 'bottom';
    /** Custom format function for the value. */
    formatValue?: (value: number) => string;
    /** Style for the value label. */
    style?: React.CSSProperties;
    /** Maximum decimal digits. */
    maxDecimalDigits?: number;
    /** Match color with the current segment. */
    matchColorWithSegment?: boolean;
    /** X offset for value label position. Unit: pixels (default: 0). */
    offsetX?: number;
    /** Y offset for value label position. Unit: pixels (default: 0). */
    offsetY?: number;
}

/** Props for the LinearGaugeComponent */
export interface LinearGaugeComponentProps {
    /** Unique identifier for the gauge. */
    id?: string;
    /** CSS class name. */
    className?: string;
    /** Inline styles. */
    style?: React.CSSProperties;
    /** Current value of the gauge. Unit: gauge value units. */
    value?: number;
    /** Minimum value. Unit: gauge value units (default: 0). */
    minValue?: number;
    /** Maximum value. Unit: gauge value units (default: 100). */
    maxValue?: number;
    /** Gauge orientation: 'horizontal' or 'vertical'. */
    orientation?: LinearGaugeOrientation;
    /** Track configuration. */
    track?: LinearGaugeTrack;
    /** Pointer/marker configuration. */
    pointer?: LinearGaugePointer;
    /** Tick marks configuration. */
    ticks?: LinearGaugeTicks;
    /** Value label configuration. */
    valueLabel?: LinearGaugeValueLabel;
    /** Callback when value changes (for interactive mode). */
    onValueChange?: (value: number) => void;
    /** Enable fade-in animation. */
    fadeInAnimation?: boolean;
    /** Margin around the gauge. Unit: pixels or ratio. */
    margin?: number | { top?: number; bottom?: number; left?: number; right?: number };
}

/** Default segment colors */
export const defaultLinearSegments: LinearGaugeSegment[] = [
    { limit: 33, color: '#5BE12C' },
    { limit: 66, color: '#F5CD19' },
    { color: '#EA4228' },
];

/** Default track configuration */
export const defaultLinearTrack: LinearGaugeTrack = {
    thickness: 20,
    backgroundColor: '#e0e0e0',
    borderRadius: 0,
    strokeWidth: 0,
    segments: defaultLinearSegments,
    gradient: false,
};

/** Default pointer configuration */
export const defaultLinearPointer: LinearGaugePointer = {
    type: 'triangle',
    color: '#464A4F',
    size: 12,
    strokeWidth: 0,
    animate: true,
    animationDuration: 500,
    position: 'top',
    showFill: true,
};

/** Default ticks configuration */
export const defaultLinearTicks: LinearGaugeTicks = {
    hideMinMax: false,
    count: 5,
    minorTicks: 4,
    position: 'inside-top',
    majorLength: 12,
    minorLength: 6,
    width: 1,
    color: '#666',
    distanceFromTrack: 2,
    labelsOnMajorOnly: true,
    labelsInside: false,
    labelStyle: {
        fontSize: '10px',
        fill: '#666',
    },
};

/** Default value label configuration */
export const defaultLinearValueLabel: LinearGaugeValueLabel = {
    hide: false,
    position: 'right',
    maxDecimalDigits: 0,
    matchColorWithSegment: true,
    style: {
        fontSize: '14px',
        fontWeight: 'bold',
    },
};

/** Default props for LinearGaugeComponent */
export const defaultLinearGaugeProps: LinearGaugeComponentProps = {
    value: 50,
    minValue: 0,
    maxValue: 100,
    orientation: 'horizontal',
    track: defaultLinearTrack,
    pointer: defaultLinearPointer,
    ticks: defaultLinearTicks,
    valueLabel: defaultLinearValueLabel,
    fadeInAnimation: false,
    margin: 20,
};
