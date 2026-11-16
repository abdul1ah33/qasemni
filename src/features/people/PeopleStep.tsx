import { Plus, UserRound, X } from 'lucide-react';
import { useRef, useState, type FormEvent } from 'react';
import { useI18n } from '@/i18n';
import { useBill } from '@/store/billStore';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { StepLayout } from '@/components/layout/StepLayout';

export function PeopleStep() {
  const { dict, t } = useI18n();
  const d = dict.people;
  const people = useBill((s) => s.people);
  const addPerson = useBill((s) => s.addPerson);
  const removePerson = useBill((s) => s.removePerson);
  const renamePerson = useBill((s) => s.renamePerson);
  const [name, setName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    if (!name.trim()) return;
    addPerson(name);
    setName('');
    inputRef.current?.focus();
  };

  const hasMe = people.some((p) => p.name === d.me);

  return (
    <StepLayout
      title={d.title}
      subtitle={d.subtitle}
      canContinue={people.length >= 2}
      footerNote={people.length < 2 ? <p className="text-center text-xs text-mute">{d.needTwo}</p> : undefined}
    >
      <form onSubmit={submit} className="glass flex items-center gap-2 rounded-3xl p-2 ps-4">
        <UserRound className="h-5 w-5 shrink-0 text-mute" />
        <input
          ref={inputRef}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={d.placeholder}
          autoFocus
          enterKeyHint="done"
          className="min-w-0 flex-1 bg-transparent py-2 text-lg font-semibold outline-none placeholder:text-mute/60"
        />
        <Button type="submit" variant="primary" disabled={!name.trim()} icon={<Plus className="h-5 w-5" />}>
          {d.add}
        </Button>
      </form>

      {!hasMe && (
        <div>
          <Button variant="soft" size="sm" onClick={() => addPerson(d.me)} icon={<Plus className="h-4 w-4" />}>
            {d.me}
          </Button>
        </div>
      )}

      <div>
        <p className="mb-3 text-sm text-mute">{t(d.count, { n: people.length })}</p>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {people.map((p) => (
              <li
                key={p.id}
                className="glass group relative flex flex-col items-center gap-2 rounded-3xl p-4"
              >
                <Avatar person={p} size={56} />
                <input
                  value={p.name}
                  onChange={(e) => renamePerson(p.id, e.target.value)}
                  className="field text-center font-semibold"
                  aria-label="name"
                />
                <button
                  onClick={() => removePerson(p.id)}
                  className="absolute top-2 end-2 grid h-7 w-7 cursor-pointer place-items-center rounded-full text-mute hover:bg-red-500/15 hover:text-red-400"
                  aria-label="remove"
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
        </ul>
      </div>
    </StepLayout>
  );
}
