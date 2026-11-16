import { X } from 'lucide-react';

/** Small "×" button used to delete a row. */
export function RemoveButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} className="grid h-11 w-9 shrink-0 cursor-pointer place-items-center text-muted">
      <X className="h-5 w-5" />
    </button>
  );
}
