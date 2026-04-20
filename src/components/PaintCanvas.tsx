import { useState, useMemo } from "react";
import { type PaintByNumberData, colorToHex } from "../lib/imageProcessing.ts";

interface Props {
  data: PaintByNumberData;
  selectedColor: string | null;
  showNumbers: boolean;
}

export default function PaintCanvas({ data, selectedColor, showNumbers }: Props) {
  const [filledRegions, setFilledRegions] = useState<Map<number, string>>(new Map());

  const colorNumberMap = useMemo(() => {
    const map = new Map<string, number>();
    let num = 1;
    for (const c of data.palette) {
      const hex = colorToHex(c);
      if (!map.has(hex)) map.set(hex, num++);
    }
    return map;
  }, [data.palette]);

  const handleRegionClick = (regionId: number) => {
    setFilledRegions((prev) => {
      const next = new Map(prev);
      if (selectedColor === null) {
        next.delete(regionId);
      } else {
        next.set(regionId, selectedColor);
      }
      return next;
    });
  };

  const displayScale = Math.min(600 / data.width, 600 / data.height, 4);

  return (
    <div style={{ overflow: "auto", borderRadius: 12, border: "1px solid #ddd", background: "#fff", padding: 8 }}>
      <svg
        viewBox={`0 0 ${data.width} ${data.height}`}
        width={data.width * displayScale}
        height={data.height * displayScale}
        style={{ display: "block", margin: "0 auto", imageRendering: "pixelated" }}
      >
        <rect x="0" y="0" width={data.width} height={data.height} fill="#fff" />
        {data.regions.map((region) => {
          const filled = filledRegions.get(region.id);
          const originalHex = colorToHex(region.color);
          const colorNum = colorNumberMap.get(originalHex) ?? region.id;
          const isCorrect = filled === originalHex;

          return (
            <g key={region.id}>
              <path
                d={region.path}
                fill={filled || "#fafafa"}
                stroke="#9aa"
                strokeWidth="0.15"
                style={{ cursor: "pointer" }}
                onClick={() => handleRegionClick(region.id)}
              />
              {showNumbers && !isCorrect && region.pixels.size > 15 && (
                <text
                  x={region.label.x}
                  y={region.label.y + 0.5}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={Math.min(4, Math.sqrt(region.pixels.size) * 0.5)}
                  fill="#556"
                  fontWeight="600"
                  fontFamily="Inter, sans-serif"
                  pointerEvents="none"
                >
                  {colorNum}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
