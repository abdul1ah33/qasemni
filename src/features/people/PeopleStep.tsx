import { useState, type FormEvent } from 'react';
import { useI18n } from '@/i18n';
import { useBill } from '@/store/billStore';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/layout/Screen';
import { RemoveButton } from '@/components/ui/RemoveButton';

export function PeopleStep() {
  const { dict } = useI18n();
  const d = dict.people;
  const people = useBill((s) => s.people);
  const addPerson = useBill((s) => s.addPerson);
  const removePerson = useBill((s) => s.removePerson);
  const renamePerson = useBill((s) => s.renamePerson);
  const [name, setName] = useState('');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addPerson(name);
    setName('');
  };

  return (
    <Screen
      title={d.title}
      subtitle={d.subtitle}
      canContinue={people.length >= 2}
      note={people.length < 2 ? <p className="text-center text-sm text-muted">{d.needTwo}</p> : undefined}
    >
      <form onSubmit={submit} className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={d.placeholder}
          enterKeyHint="done"
          autoComplete="off"
          className="input flex-1"
        />
        <Button type="submit" variant="primary" disabled={!name.trim()}>
          {d.add}
        </Button>
      </form>

      {people.length > 0 && (
        <ul className="card divide-y divide-line">
          {people.map((p) => (
            <li key={p.id} className="flex items-center gap-2 px-3 py-1.5">
              <input
                value={p.name}
                onChange={(e) => renamePerson(p.id, e.target.value)}
                aria-label={d.placeholder}
                className="h-10 min-w-0 flex-1 bg-transparent outline-none"
              />
              <RemoveButton label={d.remove} onClick={() => removePerson(p.id)} />
            </li>
          ))}
        </ul>
      )}
    </Screen>
  );
}
