export interface Needle {
    color?: string;
    baseColor?: string;
    length: number;
    animate?: boolean;
    elastic?: boolean;
    animationDuration?: number;
    animationDelay?: number;
    width: number;
}

export const defaultNeedle: Needle = {
    color: "#464A4F",
    baseColor: "#464A4F",
    length: 0.70,
    width: 15, // this is a factor to multiply by the width of the gauge
    animate: true,
    elastic: false,
    animationDuration: 3000,
    animationDelay: 500,
};