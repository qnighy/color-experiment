"use client";

import { ReactElement, useEffect, useRef } from "react";
import { cmf } from "./cmf";
import { useElementSize } from "./useElementSize";
import { usePixelDensity } from "./usePixelDensity";
import { ChromatUV, ColorXYZ, uvFromXYZ, xyzFromUV } from "./color-transform";

export function ChromatDiagram(): ReactElement | null {
  const ref = useRef<HTMLCanvasElement>(null);
  const elemSize = useElementSize({ ref });
  const { density } = usePixelDensity();
  const aspectRatio = 1;
  const doRender = render;
  useEffect(() => {
    const width = Math.ceil(Math.min(elemSize.width, elemSize.height * aspectRatio) * density);
    const height = Math.ceil(Math.min(elemSize.height, elemSize.width / aspectRatio) * density);
    if (ref.current) {
      ref.current.width = width;
      ref.current.height = height;
      const ctx = ref.current.getContext("2d");
      if (!ctx) {
        throw new TypeError("Failed: getContext(\"2d\")");
      }
      ctx.clearRect(0, 0, width, height);
      doRender(width, height, ctx);
    }
  }, [elemSize.width, elemSize.height, density, doRender]);
  return (
    <canvas ref={ref} className="w-screen h-screen object-contain object-center" />
  );
}

type Coord = (xyz: ColorXYZ) => [number, number];

const uvMultiply = 1.5
function render(width: number, height: number, ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = "#f8f8f8";
  ctx.fillRect(0, 0, width, height);
  if (width > 0 && height > 0) {
    const img = ctx.createImageData(width, height, { colorSpace: "srgb" });
    for (let canvasY = 0; canvasY < height; canvasY += 1) {
      for (let canvasX = 0; canvasX < width; canvasX += 1) {
        const xyz = xyzFromUV(uvFromCanvasCoord([canvasX, canvasY]), 1);
        const [lr, lg, lb] = lsrgbFromXyz(xyz);
        if (lr >= 0 && lg >= 0 && lb >= 0) {
          const len = Math.hypot(lr, lg, lb);
          const srgb = srgbFromLsrgb([lr / len, lg / len, lb / len]);
          const pos = (canvasX + width * canvasY) * 4;
          img.data[pos + 0] = srgb[0] * 255;
          img.data[pos + 1] = srgb[1] * 255;
          img.data[pos + 2] = srgb[2] * 255;
          img.data[pos + 3] = 255;
        }
      }
    }
    ctx.putImageData(img, 0, 0);
  }

  ctx.strokeStyle = "black";
  ctx.lineWidth = 1;
  ctx.beginPath();
  const arc = monochromaticArc((xyz) => canvasCoordFromUv(uvFromXYZ(xyz)));
  const path = new Path2D(arc);
  ctx.stroke(path);
  ctx.closePath();

  function uvFromCanvasCoord([canvasX, canvasY]: [number, number]): ChromatUV {
    const u = canvasX / (uvMultiply * width);
    const v = (1 - canvasY / height) / uvMultiply;
    return ChromatUV(u, v);
  }
  function canvasCoordFromUv([u, v]: ChromatUV): [number, number] {
    const canvasX = u * uvMultiply * width;
    const canvasY = (1 - v * uvMultiply) * height;
    return [canvasX, canvasY];
  }
}

function lsrgbFromXyz([x, y, z]: [number, number, number]): [number, number, number] {
  const lr = 3.2406 * x + -1.5372 * y + -0.4986 * z;
  const lg = -0.9689 * x + 1.8758 * y + 0.0415 * z;
  const lb = 0.0557 * x + -0.2040 * y + 1.0570 * z;
  return [lr, lg, lb];
}

function srgbFromLsrgb([lr, lg, lb]: [number, number, number]): [number, number, number] {
  const r = applySRGBGamma(lr);
  const g = applySRGBGamma(lg);
  const b = applySRGBGamma(lb);
  return [r, g, b];
}

function applySRGBGamma(v: number): number {
  if (v < 0.0031308) {
    return 12.92 * v;
  } else {
    return 1.055 * v ** (1.0 / 2.4) - 0.055;
  }
}

function monochromaticArc(coord: Coord): string {
  let path = "";
  let first = true;
  for (const lam of wavelengths()) {
    const [x, y, z] = cmf("DEG2", lam);
    const c = coord(ColorXYZ(x, y, z));
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
