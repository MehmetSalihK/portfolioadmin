import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiMenu, FiX, FiSun, FiMoon,
  FiHome, FiUser, FiGrid, FiBookOpen, FiBriefcase, FiMail
} from 'react-icons/fi';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

const navItems = [
  { name: 'home',      path: '/',           icon: FiHome },
  { name: 'about',     path: '/about',       icon: FiUser },
  { name: 'projects',      path: '/projects',    icon: FiGrid },
  { name: 'education',   path: '/formations',  icon: FiBookOpen },
  { name: 'experience',  path: '/experiences', icon: FiBriefcase },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation('common');

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setIsOpen(false); }, [router.pathname]);

  const isDark = theme === 'dark';

  return (
    <>
      {/* ── Desktop & Tablet Nav ── */}
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 h-14 flex items-center transition-all duration-200 ${
          scrolled
            ? 'dark:bg-[#0a0a0f]/88 bg-white/88 backdrop-blur-xl border-b dark:border-white/[0.06] border-zinc-200/80'
            : 'dark:bg-transparent bg-transparent'
        }`}
      >
        <div className="max-w-[1100px] mx-auto px-6 w-full flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs font-black shadow-md shadow-indigo-600/30">
              S
            </div>
            <span className="text-sm font-bold dark:text-white text-zinc-900 tracking-tight group-hover:text-indigo-500 transition-colors duration-150">
              Portfolio
            </span>
          </Link>

          {/* Desktop Nav links */}
          <nav className="hidden md:flex items-center gap-0.5">
            {navItems.map((item) => {
              const isActive = router.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[13px] font-medium transition-colors duration-150 ${
                    isActive
                      ? 'dark:text-white text-zinc-900'
                      : 'dark:text-zinc-500 text-zinc-500 hover:dark:text-zinc-200 hover:text-zinc-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {t(`nav.${item.name}`)}
                  {isActive && (
                    <motion.span
                      layoutId="nav-dot"
                      className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-indigo-500"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right: theme + CTA + hamburger */}
          <div className="flex items-center gap-2">
            {mounted && (
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg dark:text-zinc-500 text-zinc-400 hover:dark:text-zinc-200 hover:text-zinc-700 transition-colors duration-150"
                aria-label="Basculer thème"
              >
                {isDark ? <FiSun className="w-4 h-4" /> : <FiMoon className="w-4 h-4" />}
              </button>
            )}

            <div className="hidden md:block">
              <LanguageSwitcher />
            </div>

            <Link
              href="/contact"
              className="hidden md:flex items-center gap-1.5 h-8 px-4 text-[12px] font-semibold dark:text-zinc-200 text-zinc-700 border dark:border-white/10 border-zinc-200 rounded-lg hover:dark:bg-white/[0.06] hover:bg-zinc-100 transition-all duration-150"
            >
              <FiMail className="w-3.5 h-3.5" />
              {t('nav.contact')}
            </Link>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-lg dark:text-zinc-400 text-zinc-500 hover:dark:text-white hover:text-zinc-900 transition-colors duration-150"
              aria-label="Menu"
            >
              {isOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* ── Mobile Overlay Menu ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.2, 0, 0, 1] }}
            className="fixed inset-0 z-40 dark:bg-[#0a0a0f] bg-white md:hidden flex flex-col"
          >
            {/* Top bar */}
            <div className="h-14 flex items-center justify-between px-6 border-b dark:border-white/[0.06] border-zinc-100 shrink-0">
              <Link href="/" className="flex items-center gap-2.5" onClick={() => setIsOpen(false)}>
                <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs font-black">
                  S
                </div>
                <span className="text-sm font-bold dark:text-white text-zinc-900">Portfolio</span>
              </Link>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg dark:text-zinc-400 text-zinc-500"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Links */}
            <nav className="flex flex-col px-6 pt-4 flex-1">
              {navItems.map((item, i) => {
                const isActive = router.pathname === item.path;
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.18 }}
                  >
                    <Link
                      href={item.path}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 py-4 border-b dark:border-white/[0.05] border-zinc-100 text-base font-medium transition-colors duration-150 ${
                        isActive
                          ? 'text-indigo-500'
                          : 'dark:text-zinc-300 text-zinc-700'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
                        isActive
                          ? 'dark:bg-indigo-500/15 bg-indigo-50 text-indigo-500'
                          : 'dark:bg-white/[0.04] bg-zinc-100 dark:text-zinc-500 text-zinc-400'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      {t(`nav.${item.name}`)}
                      {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />}
                    </Link>
                  </motion.div>
                );
              })}
            </nav>

            {/* CTA */}
            <div className="px-6 pb-10 shrink-0">
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center px-2">
                   <span className="text-xs font-bold dark:text-zinc-500 text-zinc-400 uppercase tracking-widest">{t('nav.language')}</span>
                   <LanguageSwitcher />
                </div>
                <Link
                  href="/contact"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/20 transition-colors duration-150"
                >
                  <FiMail className="w-4 h-4" />
                  {t('nav.contact')}
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}