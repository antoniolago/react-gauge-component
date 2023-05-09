import isEqual from "lodash/isEqual";
import { useEffect, useRef } from "react";

const isDeepEquals = (toCompare: any, reference: any) => {
  return isEqual(toCompare, reference);
};

const useDeepCompareMemo = (dependencies: any) => {
  const ref = useRef(null);
  if (isDeepEquals(dependencies, ref.current)) {
    ref.current = dependencies;
  }
  return ref.current;
};

// this function compares deeply new dependencies with old one
// It works like useEffect but we are using isEqual from lodash to compares deeply
const useDeepCompareEffect = (callback: any, dependencies: any) => {
  useEffect(callback, [useDeepCompareMemo(dependencies), callback]);
};

export default useDeepCompareEffect;
