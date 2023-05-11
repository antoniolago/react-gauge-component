import { GaugeComponentProps } from './GaugeComponentProps';
export interface Gauge {
    props: GaugeComponentProps;
    prevProps: React.MutableRefObject<GaugeComponentProps>;
    svg: React.MutableRefObject<any>;
    g: React.MutableRefObject<any>;
    width: React.MutableRefObject<any>;
    height: React.MutableRefObject<any>;
    fixedHeight: React.MutableRefObject<any>;
    doughnut: React.MutableRefObject<any>;
    needle: React.MutableRefObject<any>;
    outerRadius: React.MutableRefObject<any>;
    innerRadius: React.MutableRefObject<any>;
    margin: React.MutableRefObject<any>;
    container: React.MutableRefObject<any>;
    nbArcsToDisplay: React.MutableRefObject<any>;
    arcChart: React.MutableRefObject<any>;
    arcData: React.MutableRefObject<any[]>;
    pieChart: React.MutableRefObject<any>;
}