import { setArcData, getSegmentedProgressColor, getSegmentedProgressGradientArcData } from './arc';
import { Gauge } from '../types/Gauge';

const createGauge = (props: any): Gauge => ({
  props: {
    minValue: 0,
    maxValue: 100,
    value: 0,
    segmentedProgress: true,
    activeSegmentColor: '#5147E8',
    inactiveSegmentColor: '#E6E6E9',
    arc: {
      nbSubArcs: 10,
      colorArray: Array.from({ length: 10 }, () => '#5147E8'),
    },
    ...props,
  },
  arcData: { current: [] },
} as any);

describe('Segmented progress arc colors', () => {
  it('fills full segments up to the current percentage', () => {
    const gauge = createGauge({
      value: 67.2,
      arc: {
        nbSubArcs: 15,
        colorArray: Array.from({ length: 15 }, () => '#5147E8'),
      },
    });

    setArcData(gauge);

    const colors = gauge.arcData.current.map((subArc) => subArc.color);
    expect(colors.filter((color) => color === '#5147E8')).toHaveLength(10);
    expect(colors.filter((color) => color === '#E6E6E9')).toHaveLength(5);
  });

  it('uses inactive color for the segment containing the unfinished partial progress', () => {
    expect(getSegmentedProgressColor(0.7, 0.672, '#5147E8', '#E6E6E9', '#00ff00'))
      .toBe('#E6E6E9');
  });

  it('uses activeSegmentColors as a per-segment active palette', () => {
    const gauge = createGauge({
      value: 80,
      activeSegmentColors: ['#111111', '#222222', '#333333'],
      arc: {
        nbSubArcs: 4,
        colorArray: ['#aaaaaa', '#bbbbbb', '#cccccc', '#dddddd'],
      },
    });

    setArcData(gauge);

    expect(gauge.arcData.current.map((subArc) => subArc.color)).toEqual([
      '#111111',
      '#222222',
      '#333333',
      '#E6E6E9',
    ]);
  });

  it('accepts activeSegmentColor as an active palette', () => {
    const gauge = createGauge({
      value: 80,
      activeSegmentColor: ['#111111', '#222222', '#333333'],
      arc: {
        nbSubArcs: 4,
        colorArray: ['#aaaaaa', '#bbbbbb', '#cccccc', '#dddddd'],
      },
    });

    setArcData(gauge);

    expect(gauge.arcData.current.map((subArc) => subArc.color)).toEqual([
      '#111111',
      '#222222',
      '#333333',
      '#E6E6E9',
    ]);
  });

  it('supports non-zero min and max values', () => {
    const gauge = createGauge({
      minValue: 10,
      maxValue: 50,
      value: 30,
    });

    setArcData(gauge);

    const colors = gauge.arcData.current.map((subArc) => subArc.color);
    expect(colors.filter((color) => color === '#5147E8')).toHaveLength(5);
    expect(colors.filter((color) => color === '#E6E6E9')).toHaveLength(5);
  });

  it('preserves existing static segment colors when segmented progress is disabled', () => {
    const gauge = createGauge({
      segmentedProgress: false,
      arc: {
        nbSubArcs: 3,
        colorArray: ['#111111', '#222222', '#333333'],
      },
    });

    setArcData(gauge);

    expect(gauge.arcData.current.map((subArc) => subArc.color)).toEqual([
      '#111111',
      '#222222',
      '#333333',
    ]);
  });

  it('falls back to each segment color when no active segment color is provided', () => {
    const gauge = createGauge({
      value: 80,
      activeSegmentColor: undefined,
      arc: {
        nbSubArcs: 3,
        colorArray: ['#111111', '#222222', '#333333'],
      },
    });

    setArcData(gauge);

    expect(gauge.arcData.current.map((subArc) => subArc.color)).toEqual([
      '#111111',
      '#222222',
      '#E6E6E9',
    ]);
  });

  it('keeps arc colorArray colors for active segments and inactive color for remaining segments', () => {
    const gauge = createGauge({
      value: 60,
      activeSegmentColor: undefined,
      arc: {
        nbSubArcs: 5,
        colorArray: ['#111111', '#222222', '#333333', '#444444', '#555555'],
      },
    });

    setArcData(gauge);

    expect(gauge.arcData.current.map((subArc) => subArc.color)).toEqual([
      '#111111',
      '#222222',
      '#333333',
      '#E6E6E9',
      '#E6E6E9',
    ]);
  });

  it('keeps active palette colors and marks active paths when arc gradient is enabled', () => {
    const gauge = createGauge({
      value: 60,
      activeSegmentColor: undefined,
      arc: {
        gradient: true,
        nbSubArcs: 5,
        colorArray: ['#111111', '#222222', '#333333', '#444444', '#555555'],
      },
    });

    setArcData(gauge);

    expect(gauge.arcData.current.map((subArc) => subArc.color)).toEqual([
      '#111111',
      '#222222',
      '#333333',
      '#E6E6E9',
      '#E6E6E9',
    ]);
    expect(gauge.arcData.current.map((subArc) => (subArc as any).segmentedProgressActive)).toEqual([
      true,
      true,
      true,
      false,
      false,
    ]);
  });

  it('draws gradient segmented progress as one active arc and one inactive arc', () => {
    const gauge = createGauge({
      value: 67.2,
      activeSegmentColor: undefined,
      arc: {
        gradient: true,
        nbSubArcs: 15,
        colorArray: ['#111111', '#222222', '#333333'],
      },
    });

    setArcData(gauge);

    expect(getSegmentedProgressGradientArcData(gauge)).toEqual([
      expect.objectContaining({
        value: 0.672,
        segmentedProgressGradientActive: true,
      }),
      {
        value: 0.32799999999999996,
        color: '#E6E6E9',
        segmentedProgressGradientActive: false,
      },
    ]);
  });
});
