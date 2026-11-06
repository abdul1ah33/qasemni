import { useCallback, useState } from 'react';
import { useBill } from '@/store/billStore';
import { recognizeReceipt, type OcrLanguage, type OcrPhase } from './ocr.service';
import { parseReceiptText } from './parser/receiptParser';
import { SAMPLE_RECEIPT_TEXT } from './sampleReceipt';

export type ScanStatus =
  | { kind: 'idle' }
  | { kind: 'scanning'; phase: OcrPhase | 'parsing'; progress: number; imageUrl: string }
  | { kind: 'error'; reason: 'failed' | 'noItems'; imageUrl: string | null };

/** Maps each OCR phase onto a slice of one overall 0→1 progress bar. */
const PHASE_RANGE: Record<OcrPhase | 'parsing', [number, number]> = {
  preparing: [0, 0.08],
  loading: [0.08, 0.3],
  reading: [0.3, 0.96],
  parsing: [0.96, 1],
};

/**
 * Orchestrates image → OCR → parser → store. UI components only call
 * `scanImage`, `loadSample` or `startManual`.
 */
export function useReceiptScanner(lang: OcrLanguage) {
  const loadReceipt = useBill((s) => s.loadReceipt);
  const [status, setStatus] = useState<ScanStatus>({ kind: 'idle' });

  const scanImage = useCallback(
    async (file: Blob) => {
      const imageUrl = URL.createObjectURL(file);
      const report = (phase: OcrPhase | 'parsing', p: number) => {
        const [a, b] = PHASE_RANGE[phase];
        setStatus({ kind: 'scanning', phase, progress: a + (b - a) * p, imageUrl });
      };
      report('preparing', 0);

      try {
        const text = await recognizeReceipt(file, lang, ({ phase, progress }) => report(phase, progress));
        report('parsing', 0.5);
        const parsed = parseReceiptText(text);
        if (import.meta.env.DEV) console.info('[ocr]', text, parsed);

        if (parsed.items.length === 0) {
          setStatus({ kind: 'error', reason: 'noItems', imageUrl });
          return;
        }
        report('parsing', 1);
        await new Promise((r) => setTimeout(r, 450)); // let the bar finish
        // Navigates away. Status is deliberately not reset: swapping the
        // scanning view mid-exit would stall the page transition.
        loadReceipt(parsed, imageUrl);
      } catch (err) {
        console.error(err);
        setStatus({ kind: 'error', reason: 'failed', imageUrl });
      }
    },
    [lang, loadReceipt],
  );

  const loadSample = useCallback(() => loadReceipt(parseReceiptText(SAMPLE_RECEIPT_TEXT), null), [loadReceipt]);

  const startManual = useCallback(
    () => loadReceipt({ items: [], extras: [] }, status.kind === 'error' ? status.imageUrl : null),
    [loadReceipt, status],
  );

  const dismiss = useCallback(() => setStatus({ kind: 'idle' }), []);

  return { status, scanImage, loadSample, startManual, dismiss };
}
