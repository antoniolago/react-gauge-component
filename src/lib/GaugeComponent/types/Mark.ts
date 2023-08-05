export interface MarkLabel {
    hideMinMax?: boolean;
    type?: string;
    marks?: Array<Mark>;
    valueConfig?: MarkValueConfig;
    markerConfig?: MarkerConfig;
}
export interface Mark {
    value?: number;
    valueConfig?: MarkValueConfig;
    markerConfig?: MarkerConfig;
}
export interface MarkValueConfig {
    formatTextValue?: (value: any) => string;
    maxDecimalDigits?: number;
    style?: React.CSSProperties;
    hide?: boolean;
}
export interface MarkerConfig {
    char?: string;
    style?: React.CSSProperties;
    hide?: boolean;
}

const defaultMarkerConfig: MarkerConfig = {
    char: "_",
    style:{
        fontSize: "18px",
        fill: "#dedbd7",
        textShadow: "black 1px 0.5px 0px, black 0px 0px 0.03em, black 0px 0px 0.01em"
    },
    hide: false
};

const defaultMarkValueConfig: MarkValueConfig = {
    formatTextValue: undefined,
    maxDecimalDigits: 2,
    style:{
        fontSize: "10px",
        fill: "#dedbd7",
        textShadow: "black 1px 0.5px 0px, black 0px 0px 0.03em, black 0px 0px 0.01em"
    },
    hide: false,
};
const defaultMarkList: Mark[] = [];
export const defaultMarkLabel: MarkLabel = {
    type: 'outer',
    hideMinMax: false,
    marks: defaultMarkList,
    valueConfig: defaultMarkValueConfig,
    markerConfig: defaultMarkerConfig
};