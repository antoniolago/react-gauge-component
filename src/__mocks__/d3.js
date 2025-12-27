// Mock for D3 library in Jest tests
// This provides essential D3 functions needed by GaugeComponent

export const pie = () => {
  const pieFunc = () => [];
  pieFunc.value = () => pieFunc;
  pieFunc.padAngle = () => pieFunc;
  pieFunc.startAngle = () => pieFunc;
  pieFunc.endAngle = () => pieFunc;
  pieFunc.sort = () => pieFunc;
  return pieFunc;
};

export const arc = () => {
  const arcFunc = () => 'M0,0';
  arcFunc.innerRadius = () => arcFunc;
  arcFunc.outerRadius = () => arcFunc;
  arcFunc.startAngle = () => arcFunc;
  arcFunc.endAngle = () => arcFunc;
  arcFunc.cornerRadius = () => arcFunc;
  arcFunc.padAngle = () => arcFunc;
  arcFunc.padRadius = () => arcFunc;
  arcFunc.centroid = () => [0, 0];
  return arcFunc;
};

// Create chainable transition object
const createTransition = () => {
  const transition = {
    delay: () => transition,
    duration: () => transition,
    ease: () => transition,
    tween: () => transition,
    attr: () => transition,
    style: () => transition,
    on: () => transition,
    end: () => Promise.resolve(),
  };
  return transition;
};

// Create chainable selection object
const createSelection = () => {
  const selection = {
    node: () => ({ 
      getBoundingClientRect: () => ({ width: 400, height: 300, top: 0, left: 0 }),
      clientWidth: 400,
      clientHeight: 300,
      offsetWidth: 400,
      offsetHeight: 300,
      parentNode: {
        getBoundingClientRect: () => ({ width: 400, height: 300, top: 0, left: 0 }),
        clientWidth: 400,
        clientHeight: 300,
      }
    }),
    select: () => createSelection(),
    selectAll: () => createSelection(),
    append: () => createSelection(),
    attr: () => selection,
    style: () => selection,
    text: () => selection,
    html: () => selection,
    remove: () => selection,
    on: () => selection,
    transition: () => createTransition(),
    duration: () => selection,
    ease: () => selection,
    data: () => selection,
    enter: () => selection,
    exit: () => selection,
    merge: () => selection,
    each: (fn) => selection,
    call: () => selection,
    classed: () => selection,
    property: () => selection,
    datum: () => selection,
    empty: () => false,
    size: () => 1,
    nodes: () => [],
    filter: () => selection,
    sort: () => selection,
    order: () => selection,
    raise: () => selection,
    lower: () => selection,
    insert: () => selection,
    clone: () => selection,
  };
  return selection;
};

export const select = (selector) => createSelection();
export const selectAll = (selector) => createSelection();

export const scaleLinear = () => {
  const scale = (value) => value;
  scale.domain = () => scale;
  scale.range = () => scale;
  scale.clamp = () => scale;
  scale.interpolate = () => scale;
  scale.invert = (value) => value;
  scale.ticks = () => [];
  scale.tickFormat = () => (d) => d.toString();
  scale.nice = () => scale;
  scale.copy = () => scaleLinear();
  return scale;
};

export const interpolate = (a, b) => (t) => a + (b - a) * t;
export const interpolateNumber = interpolate;
export const interpolateHsl = (a, b) => (t) => a;
export const interpolateRgb = (a, b) => (t) => a;

export const easeLinear = (t) => t;
export const easeElastic = (t) => t;
export const easeBounce = (t) => t;
export const easeQuad = (t) => t;
export const easeQuadIn = (t) => t;
export const easeQuadOut = (t) => t;
export const easeQuadInOut = (t) => t;
export const easeCubic = (t) => t;
export const easeCubicIn = (t) => t;
export const easeCubicOut = (t) => t;
export const easeCubicInOut = (t) => t;
export const easeExp = (t) => t;
export const easeExpIn = (t) => t;
export const easeExpOut = (t) => t;
export const easeExpInOut = (t) => t;

export const line = () => {
  const lineFunc = () => 'M0,0L1,1';
  lineFunc.x = () => lineFunc;
  lineFunc.y = () => lineFunc;
  lineFunc.curve = () => lineFunc;
  lineFunc.defined = () => lineFunc;
  return lineFunc;
};

export const curveLinear = {};
export const curveBasis = {};
export const curveCardinal = {};
export const curveCatmullRom = {};

export const color = (str) => ({
  r: 128,
  g: 128,
  b: 128,
  opacity: 1,
  brighter: () => color(str),
  darker: () => color(str),
  rgb: () => ({ r: 128, g: 128, b: 128, opacity: 1 }),
  toString: () => str || '#808080',
  hex: () => '#808080',
  formatHex: () => '#808080',
  copy: () => color(str),
});

export const rgb = (r, g, b, opacity) => {
  const c = color(`rgb(${r},${g},${b})`);
  c.r = r || 0;
  c.g = g || 0;
  c.b = b || 0;
  c.opacity = opacity || 1;
  return c;
};

export const hsl = (h, s, l, opacity) => {
  const c = color(`hsl(${h},${s}%,${l}%)`);
  c.h = h || 0;
  c.s = s || 0;
  c.l = l || 0;
  c.opacity = opacity || 1;
  return c;
};

export const format = (specifier) => (value) => value.toString();
export const formatPrefix = (specifier, value) => (v) => v.toString();

export const range = (start, stop, step) => {
  const result = [];
  for (let i = start; i < stop; i += (step || 1)) {
    result.push(i);
  }
  return result;
};

export const max = (array, accessor) => {
  if (!array || array.length === 0) return undefined;
  if (accessor) {
    return Math.max(...array.map(accessor));
  }
  return Math.max(...array);
};

export const min = (array, accessor) => {
  if (!array || array.length === 0) return undefined;
  if (accessor) {
    return Math.min(...array.map(accessor));
  }
  return Math.min(...array);
};

export const extent = (array, accessor) => {
  return [min(array, accessor), max(array, accessor)];
};

export const quantize = (interpolator, n) => {
  const result = [];
  for (let i = 0; i < n; i++) {
    result.push(interpolator(i / (n - 1)));
  }
  return result;
};

// Drag behavior
export const drag = () => {
  const dragBehavior = () => dragBehavior;
  dragBehavior.on = () => dragBehavior;
  dragBehavior.filter = () => dragBehavior;
  dragBehavior.subject = () => dragBehavior;
  dragBehavior.container = () => dragBehavior;
  dragBehavior.touchable = () => dragBehavior;
  dragBehavior.clickDistance = () => dragBehavior;
  return dragBehavior;
};

export default {
  pie,
  arc,
  select,
  selectAll,
  scaleLinear,
  interpolate,
  interpolateNumber,
  interpolateHsl,
  interpolateRgb,
  easeLinear,
  easeElastic,
  easeBounce,
  easeQuad,
  easeQuadIn,
  easeQuadOut,
  easeQuadInOut,
  easeCubic,
  easeCubicIn,
  easeCubicOut,
  easeCubicInOut,
  easeExp,
  easeExpIn,
  easeExpOut,
  easeExpInOut,
  line,
  curveLinear,
  curveBasis,
  curveCardinal,
  curveCatmullRom,
  color,
  rgb,
  hsl,
  format,
  formatPrefix,
  range,
  max,
  min,
  extent,
  quantize,
  drag,
};
