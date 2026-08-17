import GaugeComponent from './GaugeComponent';
import LinearGaugeComponent from './GaugeComponent/LinearGaugeComponent';
export type { GaugeComponentProps, GaugeType } from './GaugeComponent/types/GaugeComponentProps';
export type { Arc, SubArc } from './GaugeComponent/types/Arc';
export type { Tooltip } from './GaugeComponent/types/Tooltip';
export type { Labels, ValueLabel } from './GaugeComponent/types/Labels';
export type { PointerContext, PointerProps, PointerRef, PointerType } from './GaugeComponent/types/Pointer';
export type { Tick, TickLabels, TickLineConfig, TickValueConfig } from './GaugeComponent/types/Tick';
export type { Angles, Dimensions, Margin } from './GaugeComponent/types/Dimensions';
export type { 
    LinearGaugeComponentProps, 
    LinearGaugeSegment, 
    LinearGaugeTrack, 
    LinearGaugePointer,
    LinearGaugeTicks,
    LinearGaugeValueLabel,
    LinearGaugeOrientation 
} from './GaugeComponent/types/LinearGauge';
export { GaugeComponent, LinearGaugeComponent };
export default GaugeComponent;