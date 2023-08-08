export interface TickLabels {
    hideMinMax?: boolean;
    type?: string;
    ticks?: Array<Tick>;
    defaultTickValueConfig?: TickValueConfig;
    defaultTickLineConfig?: TickLineConfig;
}
export interface Tick {
    value?: number;
    valueConfig?: TickValueConfig;
    lineConfig?: TickLineConfig;
}
export interface TickValueConfig {
    formatTextValue?: (value: any) => string;
    maxDecimalDigits?: number;
    style?: React.CSSProperties;
    hide?: boolean;
}
export interface TickLineConfig {
    char?: string;
    style?: React.CSSProperties;
    hide?: boolean;
}

const defaultTickLineConfig: TickLineConfig = {
    char: "_",
    style:{
        fontSize: "18px",
        fill: "#dedbd7",
        textShadow: "black 1px 0.5px 0px, black 0px 0px 0.03em, black 0px 0px 0.01em"
    },
    hide: false
};

const defaultTickValueConfig: TickValueConfig = {
    formatTextValue: undefined,
    maxDecimalDigits: 2,
    style:{
        fontSize: "10px",
        fill: "#dedbd7",
        textShadow: "black 1px 0.5px 0px, black 0px 0px 0.03em, black 0px 0px 0.01em"
    },
    hide: false,
};
const defaultTickList: Tick[] = [];
export const defaultTickLabel: TickLabels = {
    type: 'outer',
    hideMinMax: false,
    ticks: defaultTickList,
    defaultTickValueConfig: defaultTickValueConfig,
    defaultTickLineConfig: defaultTickLineConfig
};