import { type Color, colorToHex } from "../lib/imageProcessing.ts";

interface Props {
  palette: Color[];
  selectedColor: string | null;
  onSelectColor: (hex: string | null) => void;
  colorMap: Map<string, number>;
}

export default function ColorPalette({ palette, selectedColor, onSelectColor, colorMap }: Props) {
  return (
    <div>
      <h3 style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
        Colours
      </h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
        {palette.map((color, i) => {
          const hex = colorToHex(color);
          const isSelected = selectedColor === hex;
          const num = colorMap.get(hex) ?? i + 1;
          return (
            <button
              key={hex}
              onClick={() => onSelectColor(isSelected ? null : hex)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: 6,
                borderRadius: 8,
                border: isSelected ? "2px solid #3b6fc0" : "2px solid #ddd",
                background: "white",
                cursor: "pointer",
                transform: isSelected ? "scale(1.05)" : "scale(1)",
                transition: "all 0.15s",
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 4,
                  backgroundColor: hex,
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: 11, fontWeight: 600, color: "#888" }}>{num}</span>
            </button>
          );
        })}
      </div>
      <button
        onClick={() => onSelectColor(null)}
        style={{
          marginTop: 8,
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 10px",
          borderRadius: 8,
          border: selectedColor === null ? "2px solid #3b6fc0" : "2px solid #ddd",
          background: "white",
          cursor: "pointer",
          width: "100%",
          fontSize: 12,
          fontWeight: 600,
          color: "#888",
        }}
      >
        Select Eraser
      </button>
    </div>
  );
}
