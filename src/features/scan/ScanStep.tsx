import clsx from 'clsx';
import { useRef, useState, type ChangeEvent } from 'react';
import { useI18n } from '@/i18n';
import { Button } from '@/components/ui/Button';
import { useReceiptScanner } from './useReceiptScanner';
import type { OcrLanguage } from './ocr.service';

export function ScanStep() {
  const { dict, lang } = useI18n();
  const d = dict.scan;
  const [ocrLang, setOcrLang] = useState<OcrLanguage>(lang === 'ar' ? 'ara+eng' : 'eng');
  const { status, scanImage, loadSample, startManual, dismiss } = useReceiptScanner(ocrLang);
  const cameraRef = useRef<HTMLInputElement>(null);
  const libraryRef = useRef<HTMLInputElement>(null);

  // Uses the phone's own camera app: faster and more reliable than an in-page camera.
  const onPick = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file && file.type.startsWith('image/')) scanImage(file);
  };

  if (status.kind === 'scanning') {
    const pct = Math.round(status.progress * 100);
    return (
      <div className="flex flex-1 flex-col justify-center gap-3 pb-20">
        <div className="flex justify-between text-sm">
          <span className="font-semibold">{d[status.phase]}</span>
          <span className="font-mono text-muted">{pct}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-line">
          <div className="h-full bg-accent" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-sm text-muted">{d.firstTime}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 pt-4 pb-8">
      <header>
        <h1 className="text-3xl font-bold">{d.title}</h1>
        <p className="mt-2 text-muted">{d.subtitle}</p>
      </header>

      {status.kind === 'error' && (
        <div className="card border-amber-500/50 p-4 text-sm">
          <p>{d[status.reason]}</p>
          <div className="mt-3 flex gap-2">
            <Button size="sm" variant="primary" onClick={startManual}>
              {d.manual}
            </Button>
            <Button size="sm" onClick={dismiss}>
              {d.dismiss}
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Button variant="primary" size="lg" onClick={() => cameraRef.current?.click()}>
          {d.takePhoto}
        </Button>
        <Button size="lg" onClick={() => libraryRef.current?.click()}>
          {d.upload}
        </Button>
        <input ref={cameraRef} type="file" accept="image/*" capture="environment" hidden onChange={onPick} />
        <input ref={libraryRef} type="file" accept="image/*" hidden onChange={onPick} />
      </div>

      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="text-muted">{d.receiptLang}</span>
        <div className="flex rounded-lg border border-line bg-card p-0.5">
          {(['eng', 'ara+eng'] as const).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setOcrLang(l)}
              className={clsx('h-8 cursor-pointer rounded-md px-3 font-medium', ocrLang === l ? 'bg-accent text-accent-fg' : 'text-muted')}
            >
              {l === 'eng' ? d.langEnglish : d.langArabic}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center gap-1 border-t border-line pt-4">
        <Button variant="ghost" onClick={startManual}>
          {d.manual}
        </Button>
        <Button variant="ghost" onClick={loadSample}>
          {d.trySample}
        </Button>
      </div>
    </div>
  );
}
