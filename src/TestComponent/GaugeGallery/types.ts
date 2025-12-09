import { GaugeComponentProps } from '../../lib/GaugeComponent/types/GaugeComponentProps';

export interface GaugePreset {
  name: string;
  description: string;
  config: Partial<GaugeComponentProps>;
}

export interface SandboxPreset {
  icon: string;
  label: string;
  config: Partial<GaugeComponentProps>;
  value: number;
}

export interface ColorPreset {
  label: string;
  colors: string[];
}

export interface SizePreset {
  name: string;
  width: string;
  height: string;
  icon: string;
}

export type GaugeAlignment = 'left' | 'center' | 'right';
export type ColumnCount = 1 | 2 | 3 | 4;
