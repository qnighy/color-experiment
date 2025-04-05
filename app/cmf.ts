import { CMF_RAW_DEG10, CMF_RAW_DEG2 } from "./cmf-data";

export type Observer =
  | "DEG2"
  | "DEG10";

export function cmf(observer: Observer, lam: number): [number, number, number] {
  const a = observer === "DEG10" ? CMF_RAW_DEG10 : CMF_RAW_DEG2;
  const lamRelative = lam - a[0][0];
  const idx = Math.floor(lamRelative);
  if (idx === lamRelative) {
    const [, xb, yb, zb] = idx >= 0 && idx < a.length ? a[idx] : [0, 0, 0, 0];
    return [xb, yb, zb];
  } else {
    const frac = lamRelative - idx;
    const [, xb0, yb0, zb0] = idx >= 0 && idx < a.length ? a[idx] : [0, 0, 0, 0];
    const [, xb1, yb1, zb1] = idx + 1 >= 0 && idx + 1 < a.length ? a[idx + 1] : [0, 0, 0, 0];
    const xb = xb0 + (xb1 - xb0) * frac;
    const yb = yb0 + (yb1 - yb0) * frac;
    const zb = zb0 + (zb1 - zb0) * frac;
    return [xb, yb, zb];
  }
}

function assertConsecutive(a: number[]) {
  const s = a[0];
  for (let i = 1; i < a.length; i++) {
    if (a[i] !== s + i) {
      throw new Error(`Non-consecutive index at ${i} (value: ${a[i]})`);
    }
  }
}
assertConsecutive(CMF_RAW_DEG2.map(([lam]) => lam));
assertConsecutive(CMF_RAW_DEG10.map(([lam]) => lam));
