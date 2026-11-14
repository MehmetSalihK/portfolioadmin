import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown } from 'react-icons/fi';
import Link from 'next/link';
import { useTranslation } from 'next-i18next/pages';

const languages = [
  { code: 'fr', name: 'Français' },
  { code: 'en', name: 'English' },
  { code: 'tr', name: 'Türkçe' },
];

interface LanguageSwitcherProps {
  direction?: 'up' | 'down';
}

const LanguageSwitcher = ({ direction = 'down' }: LanguageSwitcherProps) => {
  const router = useRouter();
  const { t } = useTranslation('common');
  const { locale, asPath } = router;
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLanguage = languages.find((lang) => lang.code === locale) || languages[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setIsOpen(false); };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={t('nav.language_switch')}
        className="group flex items-center gap-1.5 min-h-[2.75rem] px-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-[rgb(var(--foreground-rgb))]/60 hover:text-[rgb(var(--foreground-rgb))] transition-colors"
      >
        <span className="border-b border-transparent group-hover:border-current pb-px">
          {currentLanguage.code}
        </span>
        <FiChevronDown
          className={`w-3 h-3 transition-transform duration-300 ease-out-expo ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: direction === 'up' ? 6 : -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: direction === 'up' ? 6 : -6 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            role="listbox"
            className={`absolute right-0 ${direction === 'up' ? 'bottom-full mb-2' : 'top-full mt-2'} w-44 bg-[rgb(var(--background-start-rgb))] border border-[rgb(var(--foreground-rgb))]/20 z-[100] shadow-lift`}
          >
            {languages.map((lang) => {
              const active = locale === lang.code;
              return (
                <Link
                  key={lang.code}
                  href={asPath}
                  locale={lang.code}
                  role="option"
                  aria-selected={active}
                  onClick={() => setIsOpen(false)}
                  className={`flex min-h-[2.75rem] items-center gap-3 px-4 py-3 font-mono text-[11px] uppercase tracking-[0.14em] border-b border-[rgb(var(--foreground-rgb))]/10 last:border-b-0 transition-colors ${
                    active
                      ? 'text-[var(--accent-text)] dark:text-[var(--accent)] hover:bg-[var(--color-surface-hover)]'
                      : 'text-[rgb(var(--foreground-rgb))]/60 hover:text-[rgb(var(--foreground-rgb))] hover:bg-[var(--color-surface-hover)]'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 ${active ? 'bg-[var(--accent)]' : 'bg-[rgb(var(--foreground-rgb))]/25'}`} />
                  <span className="flex-1">{lang.name}</span>
                  <span className="tabular-nums">{lang.code}</span>
                </Link>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageSwitcher;
