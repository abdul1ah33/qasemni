import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Extra, ExtraKind, Item, ParsedReceipt, Person, Piastres } from '@/core/types';
import { uid } from '@/lib/id';

export const STEPS = ['scan', 'review', 'people', 'assign', 'summary'] as const;
export type Step = (typeof STEPS)[number];

export const AVATAR_COLORS = 8;

interface BillState {
  step: Step;
  imageUrl: string | null;
  merchant: string;
  detectedTotal: Piastres | null;
  items: Item[];
  extras: Extra[];
  people: Person[];

  goTo: (step: Step) => void;
  next: () => void;
  back: () => void;
  reset: () => void;

  loadReceipt: (parsed: ParsedReceipt, imageUrl: string | null) => void;
  setMerchant: (name: string) => void;

  addItem: () => void;
  updateItem: (id: string, patch: Partial<Omit<Item, 'id'>>) => void;
  removeItem: (id: string) => void;

  addExtra: (kind: ExtraKind, label: string, amount?: Piastres) => void;
  updateExtra: (id: string, patch: Partial<Omit<Extra, 'id'>>) => void;
  removeExtra: (id: string) => void;

  addPerson: (name: string) => void;
  renamePerson: (id: string, name: string) => void;
  removePerson: (id: string) => void;

  toggleAssignee: (itemId: string, personId: string) => void;
  setItemEveryone: (itemId: string, everyone: boolean) => void;
  assignUnassignedToEveryone: () => void;
  splitEverythingEqually: () => void;
}

/** Flat fees are fairer split equally; percentage-based charges proportionally. */
const defaultSplitMode = (kind: ExtraKind): Extra['splitMode'] => (kind === 'delivery' ? 'equal' : 'proportional');

const initial = {
  step: 'scan' as Step,
  imageUrl: null,
  merchant: '',
  detectedTotal: null,
  items: [],
  extras: [],
  people: [],
};

export const useBill = create<BillState>()(
  persist(
    (set, get) => ({
      ...initial,

      goTo: (step) => set({ step }),
      next: () => {
        const i = STEPS.indexOf(get().step);
        if (i < STEPS.length - 1) set({ step: STEPS[i + 1] });
      },
      back: () => {
        const i = STEPS.indexOf(get().step);
        if (i > 0) set({ step: STEPS[i - 1] });
      },
      reset: () => {
        const { imageUrl, people } = get();
        if (imageUrl) URL.revokeObjectURL(imageUrl);
        // Keep the people — friends usually split again together.
        set({ ...initial, people });
      },

      loadReceipt: (parsed, imageUrl) =>
        set({
          imageUrl,
          merchant: parsed.merchant ?? '',
          detectedTotal: parsed.total ?? null,
          items: parsed.items.map((i) => ({ ...i, id: uid(), assignees: [] })),
          extras: parsed.extras.map((e) => ({ ...e, id: uid(), splitMode: defaultSplitMode(e.kind) })),
          step: 'review',
        }),
      setMerchant: (merchant) => set({ merchant }),

      addItem: () =>
        set((s) => ({ items: [...s.items, { id: uid(), name: '', quantity: 1, price: 0, assignees: [] }] })),
      updateItem: (id, patch) => set((s) => ({ items: s.items.map((i) => (i.id === id ? { ...i, ...patch } : i)) })),
      removeItem: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),

      addExtra: (kind, label, amount = 0) =>
        set((s) => ({ extras: [...s.extras, { id: uid(), kind, label, amount, splitMode: defaultSplitMode(kind) }] })),
      updateExtra: (id, patch) => set((s) => ({ extras: s.extras.map((e) => (e.id === id ? { ...e, ...patch } : e)) })),
      removeExtra: (id) => set((s) => ({ extras: s.extras.filter((e) => e.id !== id) })),

      addPerson: (name) =>
        set((s) => {
          const used = new Set(s.people.map((p) => p.color));
          const color = [...Array(AVATAR_COLORS).keys()].find((c) => !used.has(c)) ?? s.people.length % AVATAR_COLORS;
          return { people: [...s.people, { id: uid(), name: name.trim(), color }] };
        }),
      renamePerson: (id, name) => set((s) => ({ people: s.people.map((p) => (p.id === id ? { ...p, name } : p)) })),
      removePerson: (id) =>
        set((s) => ({
          people: s.people.filter((p) => p.id !== id),
          items: s.items.map((i) => ({ ...i, assignees: i.assignees.filter((a) => a !== id) })),
        })),

      toggleAssignee: (itemId, personId) =>
        set((s) => ({
          items: s.items.map((i) =>
            i.id !== itemId
              ? i
              : {
                  ...i,
                  assignees: i.assignees.includes(personId)
                    ? i.assignees.filter((a) => a !== personId)
                    : [...i.assignees, personId],
                },
          ),
        })),
      setItemEveryone: (itemId, everyone) =>
        set((s) => ({
          items: s.items.map((i) => (i.id === itemId ? { ...i, assignees: everyone ? s.people.map((p) => p.id) : [] } : i)),
        })),
      assignUnassignedToEveryone: () =>
        set((s) => ({
          items: s.items.map((i) => (i.assignees.length ? i : { ...i, assignees: s.people.map((p) => p.id) })),
        })),
      splitEverythingEqually: () =>
        set((s) => ({ items: s.items.map((i) => ({ ...i, assignees: s.people.map((p) => p.id) })) })),
    }),
    {
      name: 'qasemni-bill',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      // Object URLs don't survive a reload, so the image isn't persisted.
      partialize: ({ imageUrl: _img, ...rest }) => rest,
    },
  ),
);
