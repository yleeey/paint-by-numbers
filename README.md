# Paint by Number

Turn ANY image into an interactive paint-by-number canvas, right in your browser.

Upload a photo → the app reduces it to a small color palette, splits it into numbered regions, and lets you click each region to fill it with the matching color. 100% client-side — no backend, no uploads, no API keys.

## Tech Stack

- **React 18** + **TypeScript**
- **Vite** (dev server & build)
- Plain inline styles (no Tailwind, no PostCSS)
- SVG for the interactive canvas

## How it works

All image processing runs in the browser inside `src/lib/imageProcessing.ts`:

1. **Load & downscale** the image to a working size (the "detail" setting).
2. **K-means quantization** reduces the image to N representative colors.
3. **Flood-fill (BFS)** groups same-colored neighboring pixels into regions.
4. **Path tracing** converts each region's pixels into an SVG `<path>`.
5. The UI renders every region as a clickable SVG shape with a number label.

## Project structure

```
src/
├── lib/
│   └── imageProcessing.ts     # K-means, region detection, SVG path tracing
├── components/
│   ├── ImageUploader.tsx      # File input + FileReader
│   ├── PaintCanvas.tsx        # Interactive SVG canvas
│   ├── ColorPalette.tsx       # Numbered color swatches
│   └── SettingsPanel.tsx      # Sliders for # of colors / detail
├── pages/
│   └── Index.tsx              # Main page, ties everything together
├── App.tsx
├── main.tsx
└── index.css
```

## Getting started

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually `http://localhost:5173`).

## Build for production

```bash
npm run build
npm run preview
```

## Usage

1. Click the uploader and pick an image.
2. Adjust **Number of colors** and **Detail** in the side panel.
3. Click **Regenerate** to re-process with new settings.
4. Pick a color from the palette and click matching numbered regions to fill them.
5. Toggle **Show numbers** to preview the finished look.
