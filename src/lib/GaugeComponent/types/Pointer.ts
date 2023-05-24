export interface Pointer {
    type: string;
    color: string,
    length: number,
    width: number, // this is a factor to multiply by the width of the gauge
    animate: true,
    elastic: false,
    animationDuration: number,
    animationDelay: number,
}
export enum PointerType {
    Needle = "needle",
    Blob = "blob",
    Arrow = "arrow"
}
export const defaultPointer: Pointer = {
    type: PointerType.Needle,
    color: "#5A5A5A",
    length: 0.70,
    width: 15, // this is a factor to multiply by the width of the gauge
    animate: true,
    elastic: false,
    animationDuration: 3000,
    animationDelay: 100,
}