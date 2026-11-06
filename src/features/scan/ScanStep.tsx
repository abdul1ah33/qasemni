import clsx from 'clsx';
import { AnimatePresence, motion } from 'motion/react';
import { AlertTriangle, Camera, ImageUp, PencilLine, ShieldCheck, Sparkles } from 'lucide-react';
import { useRef, useState, type DragEvent } from 'react';
import { useI18n } from '@/i18n';
import { Button } from '@/components/ui/Button';
import { fadeUp, stagger } from '@/components/layout/StepLayout';
import { CameraModal } from './CameraModal';
import { ReceiptIllustration } from './ReceiptIllustration';
import { ScanningView } from './ScanningView';
import { useReceiptScanner } from './useReceiptScanner';
import type { OcrLanguage } from './ocr.service';

export function ScanStep() {
  const { dict, lang } = useI18n();
  const d = dict.scan;
  const [ocrLang, setOcrLang] = useState<OcrLanguage>(lang === 'ar' ? 'ara+eng' : 'eng');
  const { status, scanImage, loadSample, startManual, dismiss } = useReceiptScanner(ocrLang);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file?: File | Blob | null) => {
    if (file && file.type.startsWith('image/')) scanImage(file);
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  if (status.kind === 'scanning') {
    return (
      <div className="flex min-h-[70vh] items-center py-10">
        <ScanningView imageUrl={status.imageUrl} phase={status.phase} progress={status.progress} />
      </div>
    );
  }

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="flex flex-col gap-8 pt-6 pb-16">
      <div className="grid items-center gap-8 sm:grid-cols-[1fr_auto]">
        <motion.div variants={fadeUp}>
          <span className="glass mb-5 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold text-lime">
            <Sparkles className="h-3.5 w-3.5" /> {dict.tagline}
          </span>
          <h1 className="text-[2.6rem] leading-[1.05] font-extrabold tracking-tight sm:text-6xl">
            {d.title}
            <br />
            <span className="text-gradient">{d.titleAccent}</span>
          </h1>
          <p className="mt-4 max-w-md text-mute">{d.subtitle}</p>
        </motion.div>
        <motion.div variants={fadeUp} className="hidden sm:block">
          <ReceiptIllustration />
        </motion.div>
      </div>

      <AnimatePresence>
        {status.kind === 'error' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-start gap-3 rounded-2xl border border-orange/30 bg-orange/10 p-4 text-sm">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-orange" />
              <div className="flex-1">
                <p>{d[status.reason]}</p>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="primary" onClick={startManual} icon={<PencilLine className="h-4 w-4" />}>
                    {d.manual}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={dismiss}>
                    ✕
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drop zone */}
      <motion.div
        variants={fadeUp}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={clsx(
          'group relative overflow-hidden rounded-[2rem] p-[1.5px] transition-transform duration-300',
          dragging && 'scale-[1.02]',
        )}
      >
        {/* animated gradient border */}
        <motion.div
          className="absolute inset-[-100%] bg-[conic-gradient(from_0deg,transparent_0deg,var(--color-violet)_60deg,var(--color-pink)_120deg,var(--color-orange)_180deg,transparent_240deg)]"
          animate={{ rotate: 360 }}
          transition={{ duration: dragging ? 2 : 8, repeat: Infinity, ease: 'linear' }}
        />
        <div className="relative flex flex-col items-center gap-5 rounded-[calc(2rem-1.5px)] bg-ink-2/95 px-5 py-8 text-center backdrop-blur-xl sm:py-10">
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Button variant="primary" size="lg" onClick={() => setCameraOpen(true)} icon={<Camera className="h-5 w-5" />}>
              {d.takePhoto}
            </Button>
            <Button variant="soft" size="lg" onClick={() => fileRef.current?.click()} icon={<ImageUp className="h-5 w-5" />}>
              {d.upload}
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                handleFile(e.target.files?.[0]);
                e.target.value = '';
              }}
            />
          </div>
          <p className="text-sm text-mute">{dragging ? d.dropActive : d.dropHint}</p>

          {/* receipt language */}
          <div className="flex items-center gap-3 text-xs">
            <span className="text-mute">{d.receiptLang}</span>
            <div className="relative flex rounded-full bg-white/5 p-1">
              {(['eng', 'ara+eng'] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setOcrLang(l)}
                  className={clsx('relative cursor-pointer rounded-full px-3 py-1 font-semibold transition-colors', ocrLang === l ? 'text-ink' : 'text-mute hover:text-white')}
                >
                  {ocrLang === l && <motion.span layoutId="ocr-lang" className="absolute inset-0 rounded-full bg-white" transition={{ type: 'spring', stiffness: 500, damping: 35 }} />}
                  <span className="relative">{l === 'eng' ? d.langEnglish : d.langArabic}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-2">
        <Button variant="ghost" size="sm" onClick={loadSample} icon={<Sparkles className="h-4 w-4 text-pink" />}>
          {d.trySample}
        </Button>
        <span className="text-line">•</span>
        <Button variant="ghost" size="sm" onClick={startManual} icon={<PencilLine className="h-4 w-4" />}>
          {d.manual}
        </Button>
      </motion.div>

      <motion.p variants={fadeUp} className="flex items-center justify-center gap-2 text-xs text-mute">
        <ShieldCheck className="h-4 w-4 text-lime" /> {d.privacy}
      </motion.p>

      {/* On phones the illustration sits below the actions so they stay above the fold. */}
      <motion.div variants={fadeUp} className="sm:hidden">
        <ReceiptIllustration />
      </motion.div>

      <CameraModal
        open={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onCapture={(blob) => {
          setCameraOpen(false);
          handleFile(blob);
        }}
      />
    </motion.div>
  );
}
