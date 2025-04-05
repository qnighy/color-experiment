/**
 * sRGB (IEC 61966-2-1:1999), where
 * 
 * - each component has Gamma applied and in [0, 1]
 * - (1, 1, 1) is D65 white point
 */
export type ColorSRGB = [number, number, number] & { __brand: "ColorSRGB" };
/**
 * like sRGB but linear, where
 * 
 * - each component in [0, 1]
 * - the vector is linearly related to the XYZ color
 * - (1, 1, 1) is D65 white point
 */
export type ColorLSRGB = [number, number, number] & { __brand: "ColorLSRGB" };
/**
 * CIE1931 XYZ
 */
export type ColorXYZ = [number, number, number] & { __brand: "ColorXYZ" };
/**
 * CIE1976 UCS (u', v') coordinate
 */
export type ChromatUV = [number, number] & { __brand: "ChromatUV" };

export function ColorSRGB(r: number, g: number, b: number): ColorSRGB {
  return [r, g, b] as ColorSRGB;
}
export function ColorLSRGB(r: number, g: number, b: number): ColorLSRGB {
  return [r, g, b] as ColorLSRGB;
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

export function lsrgbFromXyz([x, y, z]: ColorXYZ): ColorLSRGB {
  const lr = 3.2406 * x + -1.5372 * y + -0.4986 * z;
  const lg = -0.9689 * x + 1.8758 * y + 0.0415 * z;
  const lb = 0.0557 * x + -0.2040 * y + 1.0570 * z;
  return ColorLSRGB(lr, lg, lb);
}
export function xyzFromLsrgb([lr, lg, lb]: ColorLSRGB): ColorXYZ {
  const x = 0.4124 * lr + 0.3576 * lg + 0.1805 * lb;
  const y = 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
  const z = 0.0193 * lr + 0.1192 * lg + 0.9505 * lb;
  return ColorXYZ(x, y, z);
}

export function srgbFromLsrgb([lr, lg, lb]: ColorLSRGB): ColorSRGB {
  const r = applySRGBGamma(lr);
  const g = applySRGBGamma(lg);
  const b = applySRGBGamma(lb);
  return ColorSRGB(r, g, b);
}
export function lsrgbFromSrgb([r, g, b]: ColorSRGB): ColorLSRGB {
  const lr = removeSRGBGamma(r);
  const lg = removeSRGBGamma(g);
  const lb = removeSRGBGamma(b);
  return ColorLSRGB(lr, lg, lb);
}

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
