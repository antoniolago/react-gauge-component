import { Gauge } from "../types/Gauge";
import { PointerType } from '../types/Pointer';
import * as needleHooks from "./pointers/needle";
import * as blobHooks from "./pointers/blob";
import * as arrowHooks from "./pointers/arrow";

export const drawPointer = (gauge: Gauge, resize: boolean = false) => {
    if(gauge.props.pointer.type == PointerType.Needle) {
        needleHooks.drawNeedle(gauge, resize);
    } else if (gauge.props.pointer.type == PointerType.Blob) {
        blobHooks.addBlobElement(gauge);
    } else if (gauge.props.pointer.type == PointerType.Arrow) {
        arrowHooks.drawArrow(gauge);
    }
}

export const addPointerElement = (gauge: Gauge) => {
    if(gauge.props.pointer.type == PointerType.Needle) {
        needleHooks.addNeedleElement(gauge);
    } else if (gauge.props.pointer.type == PointerType.Blob) {
        blobHooks.addBlobElement(gauge);
    } else if (gauge.props.pointer.type == PointerType.Arrow) {
        arrowHooks.addArrowElement(gauge);
    }
}
export const clearPointerElement = (gauge: Gauge) => gauge.pointer.current.selectAll("*").remove();
