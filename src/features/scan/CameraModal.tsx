import { Camera, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useI18n } from '@/i18n';
import { captureVideoFrame } from '@/lib/image';
import { Button } from '@/components/ui/Button';

interface CameraModalProps {
  open: boolean;
  onClose: () => void;
  onCapture: (blob: Blob) => void;
}

/** Live in-page camera with a receipt-shaped viewfinder. */
export function CameraModal({ open, onClose, onCapture }: CameraModalProps) {
  const { dict } = useI18n();
  const videoRef = useRef<HTMLVideoElement>(null);
  const fallbackRef = useRef<HTMLInputElement>(null);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    if (!open) return;
    let stream: MediaStream | null = null;
    let cancelled = false;
    setDenied(false);

    if (!navigator.mediaDevices?.getUserMedia) {
      setDenied(true);
      return;
    }
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 2560 }, height: { ideal: 1920 } }, audio: false })
      .then((s) => {
        if (cancelled) {
          s.getTracks().forEach((t) => t.stop());
          return;
        }
        stream = s;
        if (videoRef.current) videoRef.current.srcObject = s;
      })
      .catch(() => setDenied(true));

    return () => {
      cancelled = true;
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [open]);

  const shoot = async () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    onCapture(await captureVideoFrame(video));
  };

  if (!open) return null;

  return (
        <div className="fixed inset-0 z-50 flex flex-col bg-black">
          <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 h-full w-full object-cover" />

          {/* Viewfinder */}
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <div className="relative aspect-[3/5] w-[72vw] max-w-sm rounded-3xl shadow-[0_0_0_9999px_rgb(0_0_0/0.55)]"
            >
              {['top-0 left-0 border-t-4 border-l-4 rounded-tl-3xl', 'top-0 right-0 border-t-4 border-r-4 rounded-tr-3xl', 'bottom-0 left-0 border-b-4 border-l-4 rounded-bl-3xl', 'bottom-0 right-0 border-b-4 border-r-4 rounded-br-3xl'].map((c) => (
                <span key={c} className={`absolute h-10 w-10 border-lime ${c}`} />
              ))}
            </div>
          </div>

          <div className="relative flex items-center justify-between p-4 pt-[max(1rem,env(safe-area-inset-top))]">
            <p className="glass rounded-full px-4 py-2 text-sm font-semibold">{dict.camera.title}</p>
            <Button variant="soft" size="sm" onClick={onClose} aria-label={dict.camera.close} icon={<X className="h-5 w-5" />} />
          </div>

          {denied && (
            <div className="relative mx-4 mt-auto mb-4 rounded-2xl glass p-4 text-sm text-white/90">
              <p>{dict.camera.denied}</p>
              <Button variant="primary" size="sm" className="mt-3" onClick={() => fallbackRef.current?.click()} icon={<Camera className="h-4 w-4" />}>
                {dict.camera.openSystem}
              </Button>
              <input
                ref={fallbackRef}
                type="file"
                accept="image/*"
                capture="environment"
                hidden
                onChange={(e) => e.target.files?.[0] && onCapture(e.target.files[0])}
              />
            </div>
          )}

          {!denied && (
            <div className="relative mt-auto flex justify-center pb-[max(2rem,env(safe-area-inset-bottom))]">
              <button
                onClick={shoot}
                aria-label={dict.camera.capture}
                className="grid h-20 w-20 cursor-pointer place-items-center rounded-full border-4 border-white/80"
              >
                <span className="h-14 w-14 rounded-full bg-[linear-gradient(135deg,var(--color-lime),var(--color-orange))]" />
              </button>
            </div>
          )}

        </div>
  );
}
