import { ReactElement } from "react";
import { cmf } from "./cmf";

const WIDTH = 500;
const HEIGHT = 500;

export function ChromatDiagram(): ReactElement | null {
  const arc = monochromaticArc(coord);
  return (
    <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-screen h-screen" preserveAspectRatio="xMidYMid meet">
      {/* path from 0,0 to 100,100 */}
      <path d={arc} stroke="black" fill="none" />
    </svg>
  );
}

type Coord = (xyz: [number, number, number]) => [number, number];
function coord([x, y, z]: [number, number, number]): [number, number] {
  const denom = x + y * 15 + z * 3;
  const u = 4 * x / denom;
  const v = 9 * y / denom;
  return [u * 1.5 * WIDTH, (1 - v * 1.5) * HEIGHT];
}

function monochromaticArc(coord: Coord): string {
  let path = "";
  let first = true;
  for (const lam of wavelengths()) {
    const c = coord(cmf("DEG2", lam));
    if (first) {
      path += `M${c[0]},${c[1]}`
      first = false;
    } else {
      path += ` L${c[0]},${c[1]}`
    }
  }
  return path;
}

function* wavelengths(): IterableIterator<number> {
  for (let lam = 360; lam <= 830; lam++) {
    yield lam;
  }
}
