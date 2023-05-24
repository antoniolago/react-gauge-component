import { GaugeComponentProps } from './GaugeComponentProps';
import { SubArc } from './Arc';
export interface Gauge {
    props: GaugeComponentProps;
    prevProps: React.MutableRefObject<GaugeComponentProps>;
    svg: React.MutableRefObject<any>;
    g: React.MutableRefObject<any>;
    width: React.MutableRefObject<any>;
    height: React.MutableRefObject<any>;
    fixedHeight: React.MutableRefObject<any>;
    doughnut: React.MutableRefObject<any>;
    pointer: React.MutableRefObject<any>;
    outerRadius: React.MutableRefObject<any>;
    innerRadius: React.MutableRefObject<any>;
    margin: React.MutableRefObject<any>;
    container: React.MutableRefObject<any>;
    arcChart: React.MutableRefObject<any>;
    //This holds the computed data for the arcs, computed only once and then reused without changing original props to avoid render problems
    arcData: React.MutableRefObject<SubArc[]>;
    pieChart: React.MutableRefObject<any>;
    //This holds the only tooltip element rendered for any given gauge chart to use
    tooltip: React.MutableRefObject<any>;
}
