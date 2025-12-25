import React from 'react';
import { GaugeComponentProps } from './GaugeComponentProps';
import { SubArc } from './Arc';
import { Dimensions } from './Dimensions';
import { MultiPointerRef } from './Pointer';

/** Custom content configuration for React element rendering in value label */
export interface CustomContentItem {
    domNode: HTMLElement;
    renderContent: (value: number, arcColor: string) => React.ReactNode;
    value: number;
    arcColor: string;
}

export interface CustomContentConfig {
    containerId: string;
    renderContent: (value: number, arcColor: string) => React.ReactNode;
    value: number;
    arcColor: string;
    domNode?: HTMLElement;
    items?: CustomContentItem[];
}

export interface Gauge {
    props: GaugeComponentProps;
    /** Original props before merging with defaults - used to detect explicit user configuration */
    originalProps?: Partial<GaugeComponentProps>;
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
    /** Tracks render pass for two-pass optimization (1 = initial, 2 = optimized) */
    renderPass?: React.MutableRefObject<number>;
    /** Stores measured bounds from first render pass */
    measuredBounds?: React.MutableRefObject<{ width: number; height: number; x: number; y: number } | null>;
    /** Tracks if initial animation has been triggered (prevents ResizeObserver from restarting animation) */
    initialAnimationTriggered?: React.MutableRefObject<boolean>;
    /** Tracks if animation is currently in progress (prevents resize from interrupting) */
    animationInProgress?: React.MutableRefObject<boolean>;
    /** Tracks if a resize was skipped during animation (triggers render after animation) */
    pendingResize?: React.MutableRefObject<boolean>;
    /** Array of pointer refs for multi-pointer mode */
    multiPointers?: React.MutableRefObject<MultiPointerRef[]>;
    /** Tracks initial animation triggered state per pointer in multi-pointer mode */
    multiPointerAnimationTriggered?: React.MutableRefObject<boolean[]>;
}
