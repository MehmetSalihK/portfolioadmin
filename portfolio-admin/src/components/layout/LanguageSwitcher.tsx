import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { FiGlobe, FiChevronDown } from 'react-icons/fi';
import Link from 'next/link';

const languages = [
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
];

interface LanguageSwitcherProps {
  direction?: 'up' | 'down';
}

const LanguageSwitcher = ({ direction = 'down' }: LanguageSwitcherProps) => {
  const router = useRouter();
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
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button - Glassmorphism Style */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full dark:bg-white/5 bg-zinc-100 hover:dark:bg-white/10 hover:bg-zinc-200 border dark:border-white/10 border-zinc-200 transition-all duration-200 backdrop-blur-md group"
      >
        <FiGlobe className="w-4 h-4 dark:text-zinc-400 text-zinc-500 group-hover:dark:text-white group-hover:text-zinc-900 transition-colors" />
        <span className="text-xs font-bold dark:text-zinc-300 text-zinc-700 uppercase tracking-wider">
          {currentLanguage.code}
        </span>
        <FiChevronDown className={`w-3 h-3 dark:text-zinc-400 text-zinc-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu - Premium Glassmorphism */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: direction === 'up' ? -10 : 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: direction === 'up' ? -10 : 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
            className={`absolute right-0 ${direction === 'up' ? 'bottom-full mb-3' : 'mt-3'} w-40 rounded-2xl dark:bg-[#12121a]/80 bg-white/80 backdrop-blur-xl border dark:border-white/10 border-zinc-200 shadow-2xl z-[100] overflow-hidden`}
          >
            <div className="py-2">
              {languages.map((lang) => (
                <Link
                  key={lang.code}
                  href={asPath}
                  locale={lang.code}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-150 ${
                    locale === lang.code
                      ? 'dark:bg-indigo-500/20 bg-indigo-50 dark:text-indigo-400 text-indigo-600 font-bold'
                      : 'dark:text-zinc-400 text-zinc-500 dark:hover:bg-white/5 hover:bg-zinc-100 dark:hover:text-white hover:text-zinc-900 font-medium'
                  }`}
                >
                  <span className="text-base">{lang.flag}</span>
                  <span className="flex-1 tracking-tight">{lang.name}</span>
                  {locale === lang.code && (
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(79,70,229,0.5)]" />
                  )}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageSwitcher;
