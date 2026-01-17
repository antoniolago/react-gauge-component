import React from 'react';

/** Visual effects for ticks */
export interface TickEffects {
    /** Enable glow effect on tick lines. */
    glow?: boolean,
    /** Glow color (defaults to tick line color). */
    glowColor?: string,
    /** Glow blur radius. Unit: pixels (default: 4). */
    glowBlur?: number,
    /** Glow spread. Unit: pixels (default: 2). */
    glowSpread?: number
}

export interface TickLabels {
    /** Hide first and last ticks and it's values */
    hideMinMax?: boolean;
    /** Wheter the ticks are inside or outside the arcs */
    type?: "inner" | "outer";
    /** 
     * When true, automatically detects closely-spaced ticks and separates them 
     * along the arc to prevent overlap. Useful when you have 
     * ticks like 15 and 16 that would otherwise render on top of each other.
     */
    autoSpaceTickLabels?: boolean;
    /** List of desired ticks */
    ticks?: Array<Tick>;
    /** Default tick value label configs, this will apply to all 
     * ticks but the individually configured */
    defaultTickValueConfig?: TickValueConfig;
    /** Default tick line label configs, this will apply to all 
     * ticks but the individually configured */
    defaultTickLineConfig?: TickLineConfig;
    /** Visual effects for all ticks (can be overridden per tick) */
    effects?: TickEffects;
}
export interface Tick {
    /** The value the tick will correspond to */
    value?: number;
    /** This will override defaultTickValueConfig */
    valueConfig?: TickValueConfig;
    /** This will override defaultTickLineConfig */
    lineConfig?: TickLineConfig;
    /** Visual effects for this specific tick (overrides tickLabels.effects) */
    effects?: TickEffects;
}
export interface TickValueConfig {
    /** This function allows to customize the rendered tickValue label */
    formatTextValue?: (value: any) => string;
    /**
     * Render a custom React element instead of text for the tick value label.
     * Receives the current tick value and arc color as parameters.
     */
    renderContent?: (value: number, arcColor: string) => React.ReactNode;
    /** Width of the foreignObject container. Unit: pixels (only used when renderContent is provided). */
    contentWidth?: number;
    /** Height of the foreignObject container. Unit: pixels (only used when renderContent is provided). */
    contentHeight?: number;
    /** Maximum number of decimal digits to display. */
    maxDecimalDigits?: number;
    /** The tick value label will inherit this */
    style?: React.CSSProperties;
    /** If true will hide the tick value label */
    hide?: boolean;
}
export interface TickLineConfig {
    /** The width of the tick's line. Unit: pixels (default: 1). */
    width?: number;
    /** The length of the tick's line. Unit: pixels (default: 7). */
    length?: number;
    /** The distance of the tick's line from the arc. Unit: pixels (default: 3). */
    distanceFromArc?: number;
    /** The distance between the tick's line and the text label. Unit: pixels (default: 2). */
    distanceFromText?: number;
    /** The color of the tick's line */
    color?: string;
    /** If true will hide the tick line */
    hide?: boolean;
    /** Visual effects for the tick line */
    effects?: TickEffects;
}

const defaultTickLineConfig: TickLineConfig = {
    color: "rgb(173 172 171)",
    length: 7,
    width: 1,
    distanceFromArc: 3,
    distanceFromText: 2,
    hide: false
};

const defaultTickValueConfig: TickValueConfig = {
    formatTextValue: undefined,
    maxDecimalDigits: 2,
    style:{
        fontSize: "12px",
        fill: "rgb(173 172 171)",
    },
    hide: false,
};
const defaultTickList: Tick[] = [];
export const defaultTickLabels: TickLabels = {
    type: 'outer',
    hideMinMax: false,
    autoSpaceTickLabels: false,
    ticks: defaultTickList,
    defaultTickValueConfig: defaultTickValueConfig,
    defaultTickLineConfig: defaultTickLineConfig
};