import * as utils from '../utils';
import * as labelsHooks from '../labels';
import {
  arc,
  pie,
  select,
  easeElastic,
  easeExpOut,  
  scaleLinear,
  interpolateHsl,
  interpolateNumber,
} from "d3";
import { Gauge } from "../../types/Gauge";

export const addBlobElement = (gauge: Gauge) => gauge.pointer.current = gauge.g.current.append("g").attr("class", "blob");
