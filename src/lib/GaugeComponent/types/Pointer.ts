export interface Pointer {
    type: string;
    config: PointerConfig;
}
export interface PointerConfig {
    color?: string;
    baseColor?: string;
    length: number;
    animate?: boolean;
    elastic?: boolean;
    animationDuration?: number;
    animationDelay?: number;
    width: number;
}
export enum PointerType {
    Needle = "needle",
    Blob = "blob",
    Arrow = "arrow"
}
export const defaultPointerConfig: PointerConfig = {
    color: "#464A4F",
    baseColor: "#464A4F",
    length: 0.70,
    width: 15, // this is a factor to multiply by the width of the gauge
    animate: true,
    elastic: false,
    animationDuration: 3000,
    animationDelay: 100,
}
export const defaultPointer: Pointer = {
    type: PointerType.Needle,
    config: defaultPointerConfig
}