/**
 * A certain non-linear RGB color space, like sRGB
 */
export type ColorNonlinearRGB = [number, number, number] & { __brand: "ColorNonlinearRGB" };
/**
 * A certain RGB color space linearly correlated to XYZ
 */
export type ColorLinearRGB = [number, number, number] & { __brand: "ColorLinearRGB" };
/**
 * CIE1931 XYZ
 */
export type ColorXYZ = [number, number, number] & { __brand: "ColorXYZ" };
/**
 * CIE1976 UCS (u', v') coordinate
 */
export type ChromatUV = [number, number] & { __brand: "ChromatUV" };

export function ColorNonlinearRGB(r: number, g: number, b: number): ColorNonlinearRGB {
  return [r, g, b] as ColorNonlinearRGB;
}
export function ColorLinearRGB(r: number, g: number, b: number): ColorLinearRGB {
  return [r, g, b] as ColorLinearRGB;
}
export function ColorXYZ(x: number, y: number, z: number): ColorXYZ {
  return [x, y, z] as ColorXYZ;
}
export function ChromatUV(u: number, v: number): ChromatUV {
  return [u, v] as ChromatUV;
}

export function uvFromXYZ([x, y, z]: ColorXYZ): ChromatUV {
  const denom = x + y * 15 + z * 3;
  const u = 4 * x / denom;
  const v = 9 * y / denom;
  return ChromatUV(u, v);
}
export function xyzFromUV([u, v]: ChromatUV, y: number): ColorXYZ {
  const x = 9 / 4 * y * u / v;
  const z = ((3 - 3 / 4 * u) / v - 5) * y;
  return ColorXYZ(x, y, z);
}

export function lsrgbFromXyz([x, y, z]: ColorXYZ): ColorLinearRGB {
  const lr =  3.2406 * x + -1.5372 * y + -0.4986 * z;
  const lg = -0.9689 * x +  1.8758 * y +  0.0415 * z;
  const lb =  0.0557 * x + -0.2040 * y +  1.0570 * z;
  return ColorLinearRGB(lr, lg, lb);
}
export function xyzFromLsrgb([lr, lg, lb]: ColorLinearRGB): ColorXYZ {
  const x = 0.4124 * lr + 0.3576 * lg + 0.1805 * lb;
  const y = 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
  const z = 0.0193 * lr + 0.1192 * lg + 0.9505 * lb;
  return ColorXYZ(x, y, z);
}

export function srgbFromLsrgb([lr, lg, lb]: ColorLinearRGB): ColorNonlinearRGB {
  const r = applySRGBGamma(lr);
  const g = applySRGBGamma(lg);
  const b = applySRGBGamma(lb);
  return ColorNonlinearRGB(r, g, b);
}
export function lsrgbFromSrgb([r, g, b]: ColorNonlinearRGB): ColorLinearRGB {
  const lr = removeSRGBGamma(r);
  const lg = removeSRGBGamma(g);
  const lb = removeSRGBGamma(b);
  return ColorLinearRGB(lr, lg, lb);
}

export function lp3FromXyz([x, y, z]: ColorXYZ): ColorLinearRGB {
  const lr =  2.4935 * x + -0.9314 * y + -0.4027 * z;
  const lg = -0.8295 * x +  1.7627 * y +  0.0236 * z;
  const lb =  0.0358 * x + -0.0762 * y +  0.9569 * z;
  return ColorLinearRGB(lr, lg, lb);
}
export function xyzFromLp3([lr, lg, lb]: ColorLinearRGB): ColorXYZ {
  const x = 0.4866 * lr + 0.2657 * lg + 0.1982 * lb;
  const y = 0.2290 * lr + 0.6917 * lg + 0.0793 * lb;
  const z = 0.0000 * lr + 0.0451 * lg + 1.0439 * lb;
  return ColorXYZ(x, y, z);
}
export { srgbFromLsrgb as displayP3FromLp3, lsrgbFromSrgb as lp3FromDisplayP3 };

function applySRGBGamma(v: number): number {
  if (v < 0.0031308) {
    return 12.92 * v;
  } else {
    return 1.055 * v ** (1.0 / 2.4) - 0.055;
  }
}

function removeSRGBGamma(v: number): number {
  if (v < 0.04045) {
    return v / 12.92;
  } else {
    return ((v + 0.055) / 1.055) ** 2.4;
  }
}
