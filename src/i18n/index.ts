import { useEffect } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { formatMoney } from '@/core/money';
import type { Piastres } from '@/core/types';
import { ar } from './ar';
import { en, type Dictionary } from './en';

export type Lang = 'en' | 'ar';

const dictionaries: Record<Lang, Dictionary> = { en, ar };
const locales: Record<Lang, string> = { en: 'en-EG', ar: 'ar-EG' };

const useLangStore = create<{ lang: Lang; setLang: (l: Lang) => void }>()(
  persist((set) => ({ lang: 'en', setLang: (lang) => set({ lang }) }), { name: 'qasemni-lang' }),
);

/** Replaces "{name}" placeholders. */
const fill = (s: string, params?: Record<string, string | number>) =>
  params ? s.replace(/\{(\w+)\}/g, (_, k: string) => String(params[k] ?? '')) : s;

export function useI18n() {
  const { lang, setLang } = useLangStore();
  const dict = dictionaries[lang];
  return {
    lang,
    dir: lang === 'ar' ? ('rtl' as const) : ('ltr' as const),
    dict,
    t: fill,
    money: (p: Piastres) => formatMoney(p, locales[lang]),
    toggle: () => setLang(lang === 'en' ? 'ar' : 'en'),
  };
}

/** Keeps <html lang dir> in sync so the browser handles RTL layout & fonts. */
export function useDocumentLang() {
  const lang = useLangStore((s) => s.lang);
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);
}
