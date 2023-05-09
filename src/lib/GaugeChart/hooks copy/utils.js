export const calculatePercentage = (minValue, maxValue, value) => {
    if (value < minValue) {
        return 0;
    } else if (value > maxValue) {
        return 100;
    } else {
        let percentage = (value - minValue) / (maxValue - minValue)
        return (percentage);
    }
}
//Returns the angle (in rad) for the given 'percent' value where percent = 1 means 100% and is 180 degree angle
export const percentToRad = (percent) => {
    return percent * Math.PI;
};
export const floatingNumber = (value, maxDigits = 2) => {
  return Math.round(value * 10 ** maxDigits) / 10 ** maxDigits;
};
export const degToRad = (degrees) => {
  return degrees * (Math.PI / 180);
}