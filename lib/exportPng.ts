import { toPng, toSvg } from "html-to-image";

/**
 * Export PNG d'un noeud très haut, en 2x.
 *
 * Un canvas ne peut pas dépasser 16 384 px de côté dans html-to-image (et 32 767 px
 * dans Chrome), ce qui tronque un board de 18 000 px rendu en 2x. On rend donc le
 * noeud une seule fois en SVG, puis on le rastérise tranche par tranche et on
 * encode le PNG nous-mêmes (zlib via CompressionStream) : aucune limite de hauteur.
 */

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(parts: Uint8Array[]): number {
  let c = 0xffffffff;
  for (const p of parts) for (let i = 0; i < p.length; i++) c = CRC_TABLE[(c ^ p[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function u32(n: number): Uint8Array {
  return new Uint8Array([(n >>> 24) & 0xff, (n >>> 16) & 0xff, (n >>> 8) & 0xff, n & 0xff]);
}

function chunk(type: string, data: Uint8Array): Uint8Array[] {
  const t = new TextEncoder().encode(type);
  return [u32(data.length), t, data, u32(crc32([t, data]))];
}

async function deflate(feed: (write: (rows: Uint8Array) => Promise<void>) => Promise<void>): Promise<Uint8Array[]> {
  const cs = new CompressionStream("deflate");
  const writer = cs.writable.getWriter();
  const out: Uint8Array[] = [];
  const reading = (async () => {
    const reader = cs.readable.getReader();
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      out.push(value);
    }
  })();
  await feed(async (rows) => {
    await writer.write(rows);
  });
  await writer.close();
  await reading;
  return out;
}

export async function exportNodeToPng(node: HTMLElement, fileName: string, pixelRatio = 2, backgroundColor = "#F7F8FB") {
  const w = node.offsetWidth;
  const h = node.offsetHeight;
  const W = Math.round(w * pixelRatio);
  const H = Math.round(h * pixelRatio);

  if (typeof CompressionStream === "undefined" || H <= 16000) {
    const url = await toPng(node, { pixelRatio, cacheBust: true, backgroundColor, width: w, height: h });
    download(url, fileName);
    return;
  }

  const svgUrl = await toSvg(node, { cacheBust: true, backgroundColor, width: w, height: h });
  const img = new Image();
  img.decoding = "async";
  img.src = svgUrl;
  await img.decode();

  const sliceCss = 1600;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = Math.round(sliceCss * pixelRatio);
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("canvas");

  const idat = await deflate(async (write) => {
    for (let y = 0; y < h; y += sliceCss) {
      const sh = Math.min(sliceCss, h - y);
      const rows = Math.round(sh * pixelRatio);
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, W, rows);
      ctx.drawImage(img, 0, y, w, sh, 0, 0, W, rows);
      const data = ctx.getImageData(0, 0, W, rows).data;
      const stride = W * 4;
      const buf = new Uint8Array((stride + 1) * rows);
      for (let r = 0; r < rows; r++) {
        buf[r * (stride + 1)] = 0; // filtre « none »
        buf.set(data.subarray(r * stride, (r + 1) * stride), r * (stride + 1) + 1);
      }
      await write(buf);
      await new Promise((res) => setTimeout(res, 0));
    }
  });

  const ihdr = new Uint8Array(13);
  ihdr.set(u32(W), 0);
  ihdr.set(u32(H), 4);
  ihdr[8] = 8; // 8 bits par canal
  ihdr[9] = 6; // RGBA
  const parts: Uint8Array[] = [new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]), ...chunk("IHDR", ihdr)];
  for (const part of idat) parts.push(...chunk("IDAT", part));
  parts.push(...chunk("IEND", new Uint8Array(0)));

  const blob = new Blob(parts as BlobPart[], { type: "image/png" });
  const url = URL.createObjectURL(blob);
  download(url, fileName);
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

function download(url: string, fileName: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
}
