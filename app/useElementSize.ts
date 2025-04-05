import { RefObject, useEffect, useState } from "react";

export type UseElementSizeParams = {
  ref: RefObject<HTMLElement | SVGElement | null>;
};
export type UseElementSizeResult = {
  width: number;
  height: number;
};
export function useElementSize(params: UseElementSizeParams): UseElementSizeResult {
  const { ref } = params;

  const [cachedSize, setCachedSize] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    if (ref.current) {
      setCachedSize({
        width: ref.current.clientWidth,
        height: ref.current.clientHeight,
      });
    }
  }, [ref]);

  useEffect(() => {
    const handleResize = () => {
      if (ref.current) {
        setCachedSize({
          width: ref.current.clientWidth,
          height: ref.current.clientHeight,
        });
      }
    };

    if (ref.current) {
      const resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(ref.current!);
      return () => {
        resizeObserver.disconnect();
      };
    }
  }, [ref]);

  return cachedSize || { width: 0, height: 0 };
}
