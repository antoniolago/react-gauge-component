import { Gauge } from '../types/Gauge';
import { GaugeComponentProps } from '../types/GaugeComponentProps';
export const calculatePercentage = (minValue: number, maxValue: number, value: number) => {
  if (value < minValue) {
    return 0;
  } else if (value > maxValue) {
    return 1;
  } else {
    let percentage = (value - minValue) / (maxValue - minValue)
    return (percentage);
  }
}
export const isEmptyObject = (obj: any) => {
  return Object.keys(obj).length === 0 && obj.constructor === Object;
}
export const mergeObjects = (obj1: any, obj2: Partial<any>): any => {
  const mergedObj = { ...obj1 } as any;

  Object.keys(obj2).forEach(key => {
    const val1 = obj1[key];
    const val2 = obj2[key];

    if (Array.isArray(val1) && Array.isArray(val2)) {
      mergedObj[key] = val2;
    } else if (typeof val1 === 'object' && typeof val2 === 'object') {
      mergedObj[key] = mergeObjects(val1, val2);
    } else if (val2 !== undefined) {
      mergedObj[key] = val2;
    }
  });

  return mergedObj;
}
//Returns the angle (in rad) for the given 'percent' value where percent = 1 means 100% and is 180 degree angle
export const percentToRad = (percent: number, angle: number) => {
  return percent * (Math.PI / angle);
};

export const floatingNumber = (value: number, maxDigits = 2) => {
  return Math.round(value * 10 ** maxDigits) / 10 ** maxDigits;
};
// Function to normalize a value between a new min and max
export function normalize(value: number, min: number, max: number) {
  return ((value - min) / (max - min)) * 100;
}
export const degToRad = (degrees: number) => {
  return degrees * (Math.PI / 180);
}
export const getCurrentGaugePercentageByValue = (value: number, gauge: GaugeComponentProps) => calculatePercentage(gauge.minValue as number, gauge.maxValue as number, value);
export const getCurrentGaugeValueByPercentage = (percentage: number, gauge: Gauge) => {
  let minValue = gauge.props.minValue as number;
  let maxValue = gauge.props.maxValue as number;
  let value = minValue + (percentage) * (maxValue - minValue);
  return value;
}
export const camelCaseToKebabCase = (str: string): string => str.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);