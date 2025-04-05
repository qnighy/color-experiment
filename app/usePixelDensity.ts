import { useEffect, useState } from "react";

export type UsePixelDensityResult = {
  density: number;
};

export function usePixelDensity(): UsePixelDensityResult {
  const [density, setDensity] = useState<number>(1);
  useEffect(() => {
    const density = Math.ceil(window.devicePixelRatio || 1);
    setDensity(density);
  }, []);
  useEffect(() => {
    const timer = setInterval(() => {
      const density = Math.ceil(window.devicePixelRatio || 1);
      setDensity(density);
    }, 1000);
    return () => {
      clearInterval(timer);
    };
  }, []);
  return { density };
}
