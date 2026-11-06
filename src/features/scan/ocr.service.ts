import type { Worker } from 'tesseract.js';
import { preprocessForOcr } from '@/lib/image';

/**
 * In-browser OCR with Tesseract.js (WebAssembly). No server and no API key:
 * the engine and language data are downloaded once from a CDN and cached by
 * the browser.
 */
export type OcrLanguage = 'eng' | 'ara+eng';

export type OcrPhase = 'preparing' | 'loading' | 'reading';

export interface OcrProgress {
  phase: OcrPhase;
  /** 0 → 1 */
  progress: number;
}

let worker: Worker | null = null;
let workerLang: OcrLanguage | null = null;
let onProgress: ((p: OcrProgress) => void) | null = null;

async function getWorker(lang: OcrLanguage): Promise<Worker> {
  if (worker && workerLang === lang) return worker;
  if (worker) await worker.terminate();

  // Loaded lazily so the ~3MB engine isn't part of the initial page load.
  const { createWorker } = await import('tesseract.js');
  worker = await createWorker(lang.split('+'), 1, {
    logger: (m) => {
      if (!onProgress) return;
      if (m.status === 'recognizing text') onProgress({ phase: 'reading', progress: m.progress });
      else onProgress({ phase: 'loading', progress: m.progress ?? 0 });
    },
  });
  await worker.setParameters({ preserve_interword_spaces: '1' });
  workerLang = lang;
  return worker;
}

export async function recognizeReceipt(
  image: Blob,
  lang: OcrLanguage,
  progress: (p: OcrProgress) => void,
): Promise<string> {
  onProgress = progress;
  try {
    progress({ phase: 'preparing', progress: 0 });
    const [canvas, w] = await Promise.all([preprocessForOcr(image), getWorker(lang)]);
    progress({ phase: 'reading', progress: 0 });
    const { data } = await w.recognize(canvas);
    progress({ phase: 'reading', progress: 1 });
    return data.text;
  } finally {
    onProgress = null;
  }
}
