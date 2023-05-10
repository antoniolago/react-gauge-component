import { defaultMarkLabel, MarkLabel } from './Mark';
export interface Labels {
    valueLabel: ValueLabel,
    markLabel: MarkLabel
}

interface ValueLabel {
    formatTextValue?: (value: any) => string;
    fontSize: number;
    fontColor: string;
    hide: boolean;
}

export const defaultValueLabel: ValueLabel = {
    formatTextValue: undefined,
    fontSize: 35,
    fontColor: '#fff',
    hide: false
}
export const defaultLabels: Labels = {
    valueLabel: defaultValueLabel,
    markLabel: defaultMarkLabel
}