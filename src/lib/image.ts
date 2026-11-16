/**
 * Prepares a photo for OCR: resizes it to a size Tesseract handles well,
 * converts it to grayscale and stretches the contrast. Runs on a canvas, so
 * everything stays on the user's device.
 */
const TARGET_LONG_SIDE = 1800;

export async function loadImage(src: Blob | string): Promise<HTMLImageElement> {
  const url = typeof src === 'string' ? src : URL.createObjectURL(src);
  const img = new Image();
  img.decoding = 'async';
  img.src = url;
  try {
    await img.decode();
  } finally {
    if (typeof src !== 'string') URL.revokeObjectURL(url);
  }
  return img;
}

export async function preprocessForOcr(src: Blob | string): Promise<HTMLCanvasElement> {
  const img = await loadImage(src);
  const scale = Math.min(2, TARGET_LONG_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.round(img.naturalWidth * scale);
  const h = Math.round(img.naturalHeight * scale);

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, w, h);

  const data = ctx.getImageData(0, 0, w, h);
  const px = data.data;

  // Grayscale + histogram for a robust contrast stretch (ignore 1% outliers).
  const hist = new Uint32Array(256);
  for (let i = 0; i < px.length; i += 4) {
    const g = (px[i] * 0.299 + px[i + 1] * 0.587 + px[i + 2] * 0.114) | 0;
    px[i] = g;
    hist[g]++;
  }
  const total = w * h;
  let lo = 0;
  let hi = 255;
  for (let acc = 0; lo < 255 && (acc += hist[lo]) < total * 0.01; ) lo++;
  for (let acc = 0; hi > 0 && (acc += hist[hi]) < total * 0.01; ) hi--;
  const range = Math.max(1, hi - lo);

  for (let i = 0; i < px.length; i += 4) {
    const v = Math.max(0, Math.min(255, ((px[i] - lo) * 255) / range));
    px[i] = px[i + 1] = px[i + 2] = v;
  }
  ctx.putImageData(data, 0, 0);
  return canvas;
}
