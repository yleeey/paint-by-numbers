import { useCallback, useRef } from "react";

interface Props {
  onImageSelected: (dataUrl: string) => void;
}

export default function ImageUploader({ onImageSelected }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) onImageSelected(e.target.result as string);
    };
    reader.readAsDataURL(file);
  }, [onImageSelected]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const style: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    border: "2px dashed #ccc",
    borderRadius: 12,
    padding: 48,
    cursor: "pointer",
    background: "#fff",
    transition: "border-color 0.2s",
  };

  return (
    <div
      style={style}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#3b6fc0")}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#ccc")}
    >
      <div style={{ fontSize: 40 }}>🎨</div>
      <p style={{ fontSize: 18, fontWeight: 600 }}>Drop an image here</p>
      <p style={{ fontSize: 13, color: "#888" }}>or click to browse · JPG, PNG, WebP</p>
      <button
        style={{
          padding: "8px 20px",
          borderRadius: 8,
          border: "1px solid #ddd",
          background: "#f0f0f0",
          cursor: "pointer",
          fontWeight: 500,
        }}
      >
        Choose Image
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
    </div>
  );
}
