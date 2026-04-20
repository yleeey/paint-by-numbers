interface Props {
  numColors: number;
  onNumColorsChange: (n: number) => void;
  detail: number;
  onDetailChange: (n: number) => void;
  showNumbers: boolean;
  onShowNumbersChange: (v: boolean) => void;
}

const labelStyle: React.CSSProperties = { fontSize: 13, color: "#666", marginBottom: 4, display: "block" };

export default function SettingsPanel({ numColors, onNumColorsChange, detail, onDetailChange, showNumbers, onShowNumbersChange }: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <h3 style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Settings</h3>

      <div>
        <label style={labelStyle}>Colors: {numColors}</label>
        <input type="range" min={4} max={20} step={1} value={numColors} onChange={(e) => onNumColorsChange(+e.target.value)} style={{ width: "100%" }} />
      </div>

      <div>
        <label style={labelStyle}>Detail: {detail}px</label>
        <input type="range" min={80} max={300} step={10} value={detail} onChange={(e) => onDetailChange(+e.target.value)} style={{ width: "100%" }} />
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <label style={{ fontSize: 13, color: "#666" }}>Show Numbers</label>
        <input type="checkbox" checked={showNumbers} onChange={(e) => onShowNumbersChange(e.target.checked)} />
      </div>
    </div>
  );
}
