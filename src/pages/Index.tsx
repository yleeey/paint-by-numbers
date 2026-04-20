import { useState, useCallback, useMemo } from "react";
import { processImage, type PaintByNumberData, colorToHex } from "../lib/imageProcessing.ts";
import ImageUploader from "../components/ImageUploader.tsx";
import ColorPalette from "../components/ColorPalette.tsx";
import PaintCanvas from "../components/PaintCanvas.tsx";
import SettingsPanel from "../components/SettingsPanel.tsx";

export default function Index() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [paintData, setPaintData] = useState<PaintByNumberData | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [numColors, setNumColors] = useState(10);
  const [detail, setDetail] = useState(150);
  const [showNumbers, setShowNumbers] = useState(true);

  const generate = useCallback(async (url: string, colors: number, size: number) => {
    setLoading(true);
    setPaintData(null);
    try {
      const data = await processImage(url, colors, size);
      setPaintData(data);
    } catch (e) {
      console.error("Processing failed:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleImageSelected = useCallback((dataUrl: string) => {
    setImageUrl(dataUrl);
    generate(dataUrl, numColors, detail);
  }, [generate, numColors, detail]);

  const handleRegenerate = useCallback(() => {
    if (imageUrl) generate(imageUrl, numColors, detail);
  }, [imageUrl, generate, numColors, detail]);

  const colorMap = useMemo(() => {
    if (!paintData) return new Map<string, number>();
    const map = new Map<string, number>();
    let num = 1;
    for (const c of paintData.palette) {
      const hex = colorToHex(c);
      if (!map.has(hex)) map.set(hex, num++);
    }
    return map;
  }, [paintData]);

  const btnStyle: React.CSSProperties = {
    padding: "8px 16px",
    borderRadius: 8,
    border: "1px solid #ddd",
    background: "#fff",
    cursor: "pointer",
    fontWeight: 500,
    fontSize: 14,
    width: "100%",
  };

  return (
    <div style={{ minHeight: "100vh" }}>
      <header style={{ borderBottom: "1px solid #ddd", background: "#fff", padding: "16px 24px", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ fontSize: 28 }}>🎨</div>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700 }}>Paint by Number</h1>
          <p style={{ fontSize: 12, color: "#888" }}>Upload an image and get a colourable SVG</p>
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: 32 }}>
        {!imageUrl ? (
          <div style={{ maxWidth: 480, margin: "0 auto" }}>
            <ImageUploader onImageSelected={handleImageSelected} />
          </div>
        ) : (
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            <aside style={{ width: 220, flexShrink: 0, display: "flex", flexDirection: "column", gap: 16 }}>
              <SettingsPanel
                numColors={numColors}
                onNumColorsChange={setNumColors}
                detail={detail}
                onDetailChange={setDetail}
                showNumbers={showNumbers}
                onShowNumbersChange={setShowNumbers}
              />
              <button style={btnStyle} onClick={handleRegenerate} disabled={loading}>
                Regenerate Image
              </button>
              <button style={btnStyle} onClick={() => { setImageUrl(null); setPaintData(null); }}>
                New Image
              </button>
              {paintData && (
                <ColorPalette
                  palette={paintData.palette}
                  selectedColor={selectedColor}
                  onSelectColor={setSelectedColor}
                  colorMap={colorMap}
                />
              )}
            </aside>

            <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "flex-start" }}>
              {loading ? (
                <p style={{ padding: 80, color: "#888" }}>Generating…</p>
              ) : paintData ? (
                <PaintCanvas data={paintData} selectedColor={selectedColor} showNumbers={showNumbers} />
              ) : null}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
