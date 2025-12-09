import { GaugeComponentProps } from './GaugeComponentProps';
import { SubArc } from './Arc';
import { Dimensions } from './Dimensions';

/** Custom content configuration for React element rendering in value label */
export interface CustomContentConfig {
    containerId: string;
    renderContent: (value: number, arcColor: string) => React.ReactNode;
    value: number;
    arcColor: string;
}

export interface Gauge {
    props: GaugeComponentProps;
    prevProps: React.MutableRefObject<GaugeComponentProps>;
    svg: React.MutableRefObject<any>;
    g: React.MutableRefObject<any>;
    doughnut: React.MutableRefObject<any>;
    resizeObserver : React.MutableRefObject<any>;
    pointer: React.MutableRefObject<any>;
    container: React.MutableRefObject<any>;
    isFirstRun: React.MutableRefObject<boolean>;
    currentProgress: React.MutableRefObject<number>;
    dimensions: React.MutableRefObject<Dimensions>;
    //This holds the computed data for the arcs, computed only once and then reused without changing original props to avoid render problems
    arcData: React.MutableRefObject<SubArc[]>;
    pieChart: React.MutableRefObject<d3.Pie<any, any>>;
    //This holds the only tooltip element rendered for any given gauge chart to use
    tooltip: React.MutableRefObject<any>;
    prevGSize: React.MutableRefObject<any>;
    maxGHeight: React.MutableRefObject<any>;
    /** Holds custom React content configuration for value label rendering */
    customContent?: React.MutableRefObject<CustomContentConfig | {}>;
}
