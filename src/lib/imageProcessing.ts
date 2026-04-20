export interface Color {
  r: number;
  g: number;
  b: number;
}

export interface Region {
  id: number;
  color: Color;
  pixels: Set<number>;
  path: string;
  label: { x: number; y: number };
}

export interface PaintByNumberData {
  width: number;
  height: number;
  regions: Region[];
  palette: Color[];
}

function colorDistance(a: Color, b: Color): number {
  return Math.sqrt((a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2);
}

function kMeansQuantize(pixels: Color[], k: number, maxIter = 20): Color[] {
  const centroids: Color[] = [];
  const step = Math.max(1, Math.floor(pixels.length / k));
  for (let i = 0; i < k; i++) {
    centroids.push({ ...pixels[Math.min(i * step, pixels.length - 1)] });
  }

  for (let iter = 0; iter < maxIter; iter++) {
    const sums: { r: number; g: number; b: number; count: number }[] =
      centroids.map(() => ({ r: 0, g: 0, b: 0, count: 0 }));

    for (const p of pixels) {
      let minDist = Infinity;
      let closest = 0;
      for (let c = 0; c < centroids.length; c++) {
        const d = colorDistance(p, centroids[c]);
        if (d < minDist) { minDist = d; closest = c; }
      }
      sums[closest].r += p.r;
      sums[closest].g += p.g;
      sums[closest].b += p.b;
      sums[closest].count++;
    }

    let changed = false;
    for (let c = 0; c < centroids.length; c++) {
      if (sums[c].count === 0) continue;
      const nr = Math.round(sums[c].r / sums[c].count);
      const ng = Math.round(sums[c].g / sums[c].count);
      const nb = Math.round(sums[c].b / sums[c].count);
      if (nr !== centroids[c].r || ng !== centroids[c].g || nb !== centroids[c].b) {
        changed = true;
        centroids[c] = { r: nr, g: ng, b: nb };
      }
    }
    if (!changed) break;
  }

  return centroids;
}

function assignColors(pixels: Color[], palette: Color[]): number[] {
  return pixels.map(p => {
    let minDist = Infinity;
    let closest = 0;
    for (let c = 0; c < palette.length; c++) {
      const d = colorDistance(p, palette[c]);
      if (d < minDist) { minDist = d; closest = c; }
    }
    return closest;
  });
}

function findRegions(colorMap: number[], width: number, height: number, minRegionSize: number): { regionMap: number[]; regions: Map<number, { colorIdx: number; pixels: Set<number> }> } {
  const regionMap = new Int32Array(width * height).fill(-1);
  const regions = new Map<number, { colorIdx: number; pixels: Set<number> }>();
  let regionId = 0;

  for (let i = 0; i < width * height; i++) {
    if (regionMap[i] !== -1) continue;
    const colorIdx = colorMap[i];
    const pixels = new Set<number>();
    const queue = [i];
    regionMap[i] = regionId;

    while (queue.length > 0) {
      const idx = queue.pop()!;
      pixels.add(idx);
      const x = idx % width;
      const y = Math.floor(idx / width);

      const neighbors = [
        y > 0 ? idx - width : -1,
        y < height - 1 ? idx + width : -1,
        x > 0 ? idx - 1 : -1,
        x < width - 1 ? idx + 1 : -1,
      ];

      for (const n of neighbors) {
        if (n >= 0 && regionMap[n] === -1 && colorMap[n] === colorIdx) {
          regionMap[n] = regionId;
          queue.push(n);
        }
      }
    }

    regions.set(regionId, { colorIdx, pixels });
    regionId++;
  }

  for (const [rid, region] of regions) {
    if (region.pixels.size >= minRegionSize) continue;
    let bestNeighbor = -1;
    let bestSize = 0;
    for (const px of region.pixels) {
      const x = px % width;
      const y = Math.floor(px / width);
      const neighbors = [
        y > 0 ? px - width : -1,
        y < height - 1 ? px + width : -1,
        x > 0 ? px - 1 : -1,
        x < width - 1 ? px + 1 : -1,
      ];
      for (const n of neighbors) {
        if (n >= 0 && regionMap[n] !== rid) {
          const nRegion = regions.get(regionMap[n]);
          if (nRegion && nRegion.pixels.size > bestSize) {
            bestSize = nRegion.pixels.size;
            bestNeighbor = regionMap[n];
          }
        }
      }
    }

    if (bestNeighbor >= 0) {
      const target = regions.get(bestNeighbor)!;
      for (const px of region.pixels) {
        target.pixels.add(px);
        regionMap[px] = bestNeighbor;
      }
      regions.delete(rid);
    }
  }

  return { regionMap: Array.from(regionMap), regions };
}

function traceRegionPath(pixels: Set<number>, width: number, height: number): string {
  const grid = new Uint8Array(width * height);
  for (const px of pixels) grid[px] = 1;

  const runs: { x: number; y: number; w: number }[] = [];
  for (let y = 0; y < height; y++) {
    let runStart = -1;
    for (let x = 0; x <= width; x++) {
      const inRegion = x < width && grid[y * width + x] === 1;
      if (inRegion && runStart === -1) {
        runStart = x;
      } else if (!inRegion && runStart !== -1) {
        runs.push({ x: runStart, y, w: x - runStart });
        runStart = -1;
      }
    }
  }

  if (runs.length === 0) return "";
  const parts = runs.map(r => `M${r.x},${r.y}h${r.w}v1h${-r.w}z`);
  return parts.join("");
}

function getRegionCenter(pixels: Set<number>, width: number): { x: number; y: number } {
  let sumX = 0, sumY = 0;
  for (const px of pixels) {
    sumX += px % width;
    sumY += Math.floor(px / width);
  }
  const count = pixels.size;
  return { x: Math.round(sumX / count), y: Math.round(sumY / count) };
}

export function colorToHex(c: Color): string {
  return `#${c.r.toString(16).padStart(2, '0')}${c.g.toString(16).padStart(2, '0')}${c.b.toString(16).padStart(2, '0')}`;
}

export async function processImage(
  imageUrl: string,
  numColors: number = 10,
  targetSize: number = 150
): Promise<PaintByNumberData> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const scale = targetSize / Math.max(img.width, img.height);
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);

        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, w, h);

        const imageData = ctx.getImageData(0, 0, w, h);
        const pixels: Color[] = [];
        for (let i = 0; i < imageData.data.length; i += 4) {
          pixels.push({
            r: imageData.data[i],
            g: imageData.data[i + 1],
            b: imageData.data[i + 2],
          });
        }

        const palette = kMeansQuantize(pixels, numColors);
        const colorMap = assignColors(pixels, palette);

        const minSize = Math.max(4, Math.floor(w * h * 0.005));
        const { regions: regionData } = findRegions(colorMap, w, h, minSize);

        const regions: Region[] = [];
        let finalId = 1;
        for (const [, data] of regionData) {
          if (data.pixels.size < 2) continue;
          const path = traceRegionPath(data.pixels, w, h);
          if (!path) continue;
          const center = getRegionCenter(data.pixels, w);
          regions.push({
            id: finalId,
            color: palette[data.colorIdx],
            pixels: data.pixels,
            path,
            label: center,
          });
          finalId++;
        }

        const usedColors = new Set(regions.map(r => colorToHex(r.color)));
        const finalPalette = palette.filter(c => usedColors.has(colorToHex(c)));

        resolve({ width: w, height: h, regions, palette: finalPalette });
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = imageUrl;
  });
}
