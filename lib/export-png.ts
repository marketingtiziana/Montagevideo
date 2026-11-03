/**
 * Export PNG d’un canvas React Flow : capture du viewport (html-to-image) composée
 * sur un fond uni avec une grille (points ou lignes), à l’échelle demandée.
 */
export interface ExportOptions {
  viewport: HTMLElement;
  bounds: { x: number; y: number; width: number; height: number };
  padding: number;
  scale: number;
  background: string;
  grid: { kind: 'dots' | 'lines'; gap: number; color: string };
  fileName: string;
}

export async function exportCanvasPng(opts: ExportOptions): Promise<void> {
  const { toPng } = await import('html-to-image');
  const width = Math.ceil(opts.bounds.width + opts.padding * 2);
  const height = Math.ceil(opts.bounds.height + opts.padding * 2);
  const tx = -opts.bounds.x + opts.padding;
  const ty = -opts.bounds.y + opts.padding;
  const snapshot = await toPng(opts.viewport, {
    width,
    height,
    pixelRatio: opts.scale,
    cacheBust: true,
    style: { width: `${width}px`, height: `${height}px`, transform: `translate(${tx}px, ${ty}px) scale(1)` },
  });
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = snapshot;
  });
  const canvas = document.createElement('canvas');
  canvas.width = width * opts.scale;
  canvas.height = height * opts.scale;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas indisponible');
  ctx.fillStyle = opts.background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const gap = opts.grid.gap * opts.scale;
  // La grille est alignée sur l’origine du canvas pour correspondre à l’écran.
  const offX = ((tx * opts.scale) % gap + gap) % gap;
  const offY = ((ty * opts.scale) % gap + gap) % gap;
  if (opts.grid.kind === 'dots') {
    ctx.fillStyle = opts.grid.color;
    for (let gx = offX; gx < canvas.width; gx += gap) {
      for (let gy = offY; gy < canvas.height; gy += gap) {
        ctx.beginPath();
        ctx.arc(gx, gy, 1.4 * opts.scale, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else {
    ctx.strokeStyle = opts.grid.color;
    ctx.lineWidth = opts.scale;
    ctx.beginPath();
    for (let gx = offX; gx < canvas.width; gx += gap) {
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, canvas.height);
    }
    for (let gy = offY; gy < canvas.height; gy += gap) {
      ctx.moveTo(0, gy);
      ctx.lineTo(canvas.width, gy);
    }
    ctx.stroke();
  }
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  const link = document.createElement('a');
  link.download = opts.fileName;
  link.href = canvas.toDataURL('image/png');
  link.click();
}
