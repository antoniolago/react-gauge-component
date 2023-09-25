export interface TickLabels {
    /** Hide first and last ticks and it's values */
    hideMinMax?: boolean;
    /** Wheter the ticks are inside or outside the arcs */
    type?: "inner" | "outer";
    /** List of desired ticks */
    ticks?: Array<Tick>;
    /** Default tick value label configs, this will apply to all 
     * ticks but the individually configured */
    defaultTickValueConfig?: TickValueConfig;
    /** Default tick line label configs, this will apply to all 
     * ticks but the individually configured */
    defaultTickLineConfig?: TickLineConfig;
}
export interface Tick {
    /** The value the tick will correspond to */
    value?: number;
    /** This will override defaultTickValueConfig */
    valueConfig?: TickValueConfig;
    /** This will override defaultTickLineConfig */
    lineConfig?: TickLineConfig;
}
export interface TickValueConfig {
    /** This function allows to customize the rendered tickValue label */
    formatTextValue?: (value: any) => string;
    /** This enables configuration for the number of decimal digits of the 
     * central value label */
    maxDecimalDigits?: number;
    /** The tick value label will inherit this */
    style?: React.CSSProperties;
    /** If true will hide the tick value label */
    hide?: boolean;
}
export interface TickLineConfig {
    /** Tick char, currently is "_" but this got to be deprecated
     * when we migrate this with d3 lines
     */
    char?: string;
    /** The tick line label will inherit this */
    style?: React.CSSProperties;
    /** If true will hide the tick line label */
    hide?: boolean;
}

const defaultTickLineConfig: TickLineConfig = {
    char: "_",
    style:{
        fontSize: "18px",
        fill: "#dedbd7",
        // textShadow: "black 1px 0.5px 0px, black 0px 0px 0.03em, black 0px 0px 0.01em"
    },
    hide: false
};

const defaultTickValueConfig: TickValueConfig = {
    formatTextValue: undefined,
    maxDecimalDigits: 2,
    style:{
        fontSize: "10px",
        fill: "rgb(173 172 171)",
    },
    hide: false,
};
const defaultTickList: Tick[] = [];
export const defaultTickLabels: TickLabels = {
    type: 'outer',
    hideMinMax: false,
    ticks: defaultTickList,
    defaultTickValueConfig: defaultTickValueConfig,
    defaultTickLineConfig: defaultTickLineConfig
};