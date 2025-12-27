import { GaugeType, defaultGaugeProps } from './GaugeComponentProps';
import { Tooltip } from './Tooltip';
export interface Arc {
    /** The corner radius of the arc. */
    cornerRadius?: number,
    /** The padding between subArcs, in rad. */
    padding?: number,
    /** Remove padding from start and end of the arc (first and last subArcs) */
    padEndpoints?: boolean,
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
    subArcs?: Array<SubArc>,
    /** Settings for Grafana's outer decorative arc (only applies to grafana type) */
    outerArc?: {
        /** Corner radius for outer arc (max effective value ~2 due to thin arc) */
        cornerRadius?: number,
        /** Padding between outer arc segments */
        padding?: number,
        /** Width of the outer arc in pixels (default: 5) */
        width?: number,
        /** Visual effects for the outer arc (inherits from arc.effects if not set) */
        effects?: ArcEffects
    },
    /** Stroke/border width for all subArcs */
    subArcsStrokeWidth?: number,
    /** Stroke/border color for all subArcs */
    subArcsStrokeColor?: string,
    /** CSS/SVG effects for the arc */
    effects?: ArcEffects
}

export interface ArcEffects {
    /** Enable glow effect on arcs */
    glow?: boolean,
    /** Glow color (defaults to arc color if not set) */
    glowColor?: string,
    /** Glow intensity/blur radius (default: 10) */
    glowBlur?: number,
    /** Glow spread (default: 3) */
    glowSpread?: number,
    /** Custom SVG filter ID to apply */
    filterUrl?: string,
    /** Drop shadow effect */
    dropShadow?: {
        /** Shadow offset X (default: 0) */
        dx?: number,
        /** Shadow offset Y (default: 2) */
        dy?: number,
        /** Shadow blur (default: 3) */
        blur?: number,
        /** Shadow color (default: rgba(0,0,0,0.3)) */
        color?: string,
        /** Shadow opacity (default: 0.3) */
        opacity?: number
    },
    /** Inner shadow/inset effect for 3D look */
    innerShadow?: boolean
}

/** Effects that can be applied to individual SubArcs - inherits from arc.effects if not specified */
export interface SubArcEffects extends ArcEffects {
    /** Override to disable inherited effects from arc.effects */
    inherit?: boolean
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
    onMouseLeave?: () => void,
    /** Visual effects for this specific subArc (inherits from arc.effects if not set) */
    effects?: SubArcEffects
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
    padding: 0.01,
    width: 0.25,
    cornerRadius: 1,
    nbSubArcs: undefined,
    emptyColor: "#5C5C5C",
    colorArray: undefined,
    subArcs: defaultSubArcs,
    gradient: false,
    subArcsStrokeWidth: 0,
    subArcsStrokeColor: undefined
};