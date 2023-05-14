import { Gauge } from "../../types/Gauge";
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
export const addBlobElement = (gauge: Gauge) => gauge.pointer.current = gauge.g.current.append("g").attr("class", "blob");
