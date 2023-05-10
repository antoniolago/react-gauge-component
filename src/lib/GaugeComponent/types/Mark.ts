export interface MarkLabel {
    hideMinMax: boolean;
    type: string;
    marks: Array<Mark>;
    valueConfig: MarkValueConfig;
    markerConfig: MarkerConfig;
}
export interface Mark {
    value: number;
    valueConfig?: MarkValueConfig;
    markerConfig?: MarkerConfig;
}
export interface MarkValueConfig {
    formatTextValue?: (value: any) => string;
    fontSize: number;
    fontColor: string;
    hide: boolean;
}
export interface MarkerConfig {
    char: string;
    charSize: number;
    charColor: string;
    hide: boolean;
}

const defaultMarkerConfig: MarkerConfig = {
    char: "_",
    charSize: 25,
    charColor: "#dedbd7",
    hide: false,
};

const defaultMarkValueConfig: MarkValueConfig = {
    formatTextValue: undefined,
    fontSize: 10,
    fontColor: '#dedbd7',
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