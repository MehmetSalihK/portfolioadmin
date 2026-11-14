import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX, FiSun, FiMoon, FiMail } from 'react-icons/fi';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from 'next-i18next/pages';
import { BrandMark } from '@/components/identity/Marks';
import SoundToggle from '@/components/ui/SoundToggle';
import LanguageSwitcher from './LanguageSwitcher';

const navItems = [
  { key: '01', name: 'home', path: '/' },
  { key: '02', name: 'about', path: '/about' },
  { key: '03', name: 'projects', path: '/projects' },
  { key: '04', name: 'education', path: '/formations' },
  { key: '05', name: 'experience', path: '/experiences' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation('common');

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 24);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setIsOpen(false); }, [router.pathname]);

  /* Verrouille le défilement derrière le menu mobile */
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  /* Gestion du focus du sommaire : premier lien à l'ouverture,
     Escape ferme et rend le focus au bouton, Tab circule dans le panneau. */
  useEffect(() => {
    if (!isOpen) return;
    const panel = panelRef.current;
    panel?.querySelector<HTMLElement>('a')?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        burgerRef.current?.focus();
        return;
      }
      if (e.key === 'Tab' && panel) {
        const focusables = panel.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement;
        const inside = active instanceof Node && panel.contains(active);
        if (e.shiftKey && (!inside || active === first)) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && (!inside || active === last)) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen]);

  const isDark = theme === 'dark';
  const isActive = (path: string) => router.pathname === path;

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 h-[4.5rem] flex items-center border-b transition-[background-color,border-color,box-shadow] duration-500 ease-out-expo ${
          scrolled
            ? 'bg-[rgb(var(--background-start-rgb))]/90 backdrop-blur-md border-[rgb(var(--foreground-rgb))]/10'
            : 'bg-transparent border-transparent'
        }`}
      >
        <div className="w-full mx-auto px-[var(--container-px)] flex items-center justify-between gap-4 xl:gap-6">

          {/* — Masthead — */}
          {/* `min-h-[2.75rem]` : la zone tactile du logo atteint 44px de haut
              (sa hauteur optique reste celle du bloc-marque) */}
          <Link href="/" className="group flex min-h-[2.75rem] items-center gap-3 shrink-0" aria-label={t('nav.home')}>
            <BrandMark
              size={20}
              className="relative -bottom-px text-[rgb(var(--foreground-rgb))] transition-transform duration-500 ease-out-expo group-hover:rotate-45"
            />
            <span className="font-display text-[1.35rem] font-black leading-none tracking-[-0.06em] text-[rgb(var(--foreground-rgb))]">
              MSK
            </span>
            {/* Affiché uniquement quand la largeur suffit : masqué entre md et lg
                pour que l'index complet tienne sans débordement */}
            <span className="hidden xl:inline font-mono text-[10px] uppercase tracking-[0.24em] text-[rgb(var(--foreground-rgb))]/60 border-l border-[rgb(var(--foreground-rgb))]/20 pl-3">
              Portfolio
            </span>
          </Link>

          {/* — Navigation : index de catalogue — */}
          {/* L'index complet (5 entrées + actions) exige ~1000px : visible à partir
              de lg ; sous ce seuil, le sommaire plein écran prend le relais */}
          <nav className="hidden lg:flex items-center gap-5" aria-label={t('nav.primary_label')}>
            {navItems.map((item) => {
              const active = isActive(item.path);
              // Le trait souligne le texte (calé sur le bloc), tandis que le
              // pseudo-élément étend la zone tactile à 44px de haut sans
              // aucun effet visuel.
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  aria-current={active ? 'page' : undefined}
                  className={`group relative flex items-baseline whitespace-nowrap py-2 font-mono text-[11px] font-medium uppercase tracking-[0.16em] transition-colors duration-300 after:absolute after:-top-2 after:-bottom-2 after:left-0 after:right-0 after:content-[''] ${
                    active
                      ? 'text-[rgb(var(--foreground-rgb))]'
                      : 'text-[rgb(var(--foreground-rgb))]/60 hover:text-[rgb(var(--foreground-rgb))]'
                  }`}
                >
                  {/* L'index hérite de la couleur du lien (jamais d'opacité
                      imbriquée : elle descendait le chiffre sous 2.5:1) */}
                  <span className={`mr-1.5 tabular-nums transition-colors duration-300 ${active ? 'text-[var(--accent-text)] dark:text-[var(--accent)]' : ''}`}>
                    {item.key}
                  </span>
                  {t(`nav.${item.name}`)}
                  <span
                    className={`absolute left-0 right-0 -bottom-0.5 h-px bg-[var(--accent)] origin-left transition-transform duration-500 ease-out-expo ${
                      active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          {/* — Actions — */}
          <div className="flex items-center gap-1 sm:gap-3">
            <SoundToggle className="hidden md:flex" />
            {mounted && (
              /* Zone tactile 44px partout (l'icône reste 16px, aucun
                 changement visuel : le bouton n'a ni fond ni bordure) */
              <button
                onClick={toggleTheme}
                aria-label={isDark ? t('nav.theme_light') : t('nav.theme_dark')}
                className="relative w-11 h-11 flex items-center justify-center text-[rgb(var(--foreground-rgb))]/60 hover:text-[rgb(var(--foreground-rgb))] transition-colors duration-300"
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={theme}
                    initial={{ opacity: 0, rotate: -60, scale: 0.7 }}
                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                    exit={{ opacity: 0, rotate: 60, scale: 0.7 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {isDark ? <FiSun className="w-4 h-4" /> : <FiMoon className="w-4 h-4" />}
                  </motion.span>
                </AnimatePresence>
              </button>
            )}

            <div className="hidden md:block border-l border-[rgb(var(--foreground-rgb))]/15 pl-1">
              <LanguageSwitcher />
            </div>

            <Link href="/contact" className="hidden md:inline-flex btn btn-primary btn-sm min-h-[2.75rem]">
              <FiMail className="w-3.5 h-3.5" />
              {t('nav.contact')}
            </Link>

            <button
              ref={burgerRef}
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden w-11 h-11 lg:w-9 lg:h-9 flex items-center justify-center text-[rgb(var(--foreground-rgb))] hover:text-[var(--accent-text)] dark:hover:text-[var(--accent)] transition-colors"
              aria-label={isOpen ? t('nav.menu_close') : t('nav.menu_open')}
              aria-expanded={isOpen}
              aria-controls="sommaire"
            >
              {/* Morph icône : croix ↔ barres, calé sur la courbe du site */}
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={isOpen ? 'x' : 'menu'}
                  initial={{ opacity: 0, rotate: isOpen ? -45 : -90, scale: 0.6 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: isOpen ? 45 : 90, scale: 0.6 }}
                  transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-center justify-center"
                >
                  {isOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
                </motion.span>
              </AnimatePresence>
            </button>
          </div>
        </div>
      </motion.header>

      {/* — Menu mobile : sommaire plein écran — */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={panelRef}
            id="sommaire"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-40 lg:hidden flex flex-col bg-[rgb(var(--background-start-rgb))] overflow-y-auto"
          >
            <div className="h-[4.5rem] shrink-0" />

            <nav className="flex-1 px-[var(--container-px)] pt-4" aria-label={t('nav.mobile_label')}>
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[rgb(var(--foreground-rgb))]/60 pb-4 border-b border-[rgb(var(--foreground-rgb))]/15">
                {t('nav.sommaire')}
              </p>

              {navItems.map((item, i) => {
                const active = isActive(item.path);
                return (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.06 + i * 0.05, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Link
                      href={item.path}
                      onClick={() => setIsOpen(false)}
                      className="group flex items-baseline gap-4 py-5 border-b border-[rgb(var(--foreground-rgb))]/10"
                    >
                      <span
                        className={`font-mono text-[11px] tabular-nums ${active ? 'text-[var(--accent-text)] dark:text-[var(--accent)]' : 'text-[rgb(var(--foreground-rgb))]/60'}`}
                      >
                        {item.key}
                      </span>
                      <span
                        className={`font-display text-[2rem] font-black leading-none tracking-[-0.045em] transition-transform duration-500 ease-out-expo group-hover:translate-x-1.5 ${
                          active ? 'text-[rgb(var(--foreground-rgb))]' : 'text-[rgb(var(--foreground-rgb))]/75'
                        }`}
                      >
                        {t(`nav.${item.name}`)}
                      </span>
                      {/* La route, en monospace : le sommaire dit où il mène */}
                      <span className="ml-auto flex items-center gap-3 self-center">
                        <span className="font-mono text-[10px] text-[rgb(var(--foreground-rgb))]/55 group-hover:text-[var(--accent-text)] dark:group-hover:text-[var(--accent)] transition-colors">
                          {item.path}
                        </span>
                        {active && <span className="w-2 h-2 bg-[var(--accent)] shrink-0" />}
                      </span>
                    </Link>
                  </motion.div>
                );
              })}
            </nav>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.32, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="px-[var(--container-px)] py-8 mt-6 border-t border-[rgb(var(--foreground-rgb))]/15"
            >
              <div className="flex items-center justify-between mb-5">
                <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-[rgb(var(--foreground-rgb))]/60">
                  {t('nav.language')}
                </span>
                <span className="flex items-center gap-1">
                  <SoundToggle />
                  <LanguageSwitcher direction="up" />
                </span>
              </div>
              <Link
                href="/contact"
                onClick={() => setIsOpen(false)}
                className="btn btn-primary w-full"
              >
                <FiMail className="w-4 h-4" />
                {t('nav.contact')}
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
