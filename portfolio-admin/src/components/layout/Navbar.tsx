import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX, FiHome, FiUser, FiCode, FiAward, FiBriefcase, FiMail, FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '@/contexts/ThemeContext';

const navItems = [
  { name: 'Accueil', path: '/', icon: FiHome },
  { name: 'À propos', path: '/about', icon: FiUser },
  { name: 'Projets', path: '/projects', icon: FiCode },
  { name: 'Formations', path: '/formations', icon: FiAward },
  { name: 'Expériences', path: '/experiences', icon: FiBriefcase },
  { name: 'Contact', path: '/contact', icon: FiMail },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setIsOpen(false); }, [router.pathname]);

  const isDark = theme === 'dark';

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-[92%] sm:max-w-[560px] md:max-w-[740px] lg:max-w-[960px]">
      <motion.nav
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={`rounded-2xl px-4 py-2.5 transition-all duration-300 ${
          scrolled
            ? 'dark:bg-[#09090f]/90 bg-white/90 backdrop-blur-xl dark:border-white/10 border-zinc-200 border shadow-2xl dark:shadow-black/40 shadow-zinc-300/40'
            : 'dark:bg-[#09090f]/70 bg-white/70 backdrop-blur-md dark:border-white/5 border-zinc-200/60 border'
        }`}
      >
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs font-black shadow-lg shadow-indigo-600/30">
              S
            </div>
            <span className="text-sm font-black dark:text-white text-zinc-900 tracking-tight group-hover:text-indigo-500 transition-colors">
              Portfolio
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1 dark:bg-white/5 bg-zinc-100 rounded-xl p-1">
            {navItems.map((item) => {
              const isActive = router.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                      : 'dark:text-zinc-400 text-zinc-600 hover:dark:text-white hover:text-zinc-900 dark:hover:bg-white/10 hover:bg-white'
                  }`}
                >
                  <item.icon className="w-3.5 h-3.5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Right side: Theme Toggle + CTA + Mobile hamburger */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            {mounted && (
              <motion.button
                onClick={toggleTheme}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-xl dark:bg-white/5 bg-zinc-100 dark:hover:bg-white/10 hover:bg-zinc-200 dark:text-zinc-400 text-zinc-600 hover:dark:text-white hover:text-zinc-900 transition-all"
                aria-label="Toggle dark/light mode"
                title={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
              >
                {isDark ? <FiSun className="w-3.5 h-3.5" /> : <FiMoon className="w-3.5 h-3.5" />}
              </motion.button>
            )}

            {/* Contact CTA */}
            <Link
              href="/contact"
              className="hidden md:flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl transition-all shadow-lg shadow-indigo-600/20"
            >
              <FiMail className="w-3.5 h-3.5" />
              Me contacter
            </Link>

            {/* Mobile hamburger */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-xl dark:bg-white/5 bg-zinc-100 dark:hover:bg-white/10 hover:bg-zinc-200 dark:text-zinc-400 text-zinc-600 hover:dark:text-white hover:text-zinc-900 transition-all"
              aria-label="Toggle menu"
            >
              {isOpen ? <FiX className="w-4 h-4" /> : <FiMenu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden"
            >
              <div className="pt-3 pb-1 space-y-1 dark:border-white/5 border-zinc-200 border-t mt-2">
                {navItems.map((item) => {
                  const isActive = router.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                        isActive
                          ? 'bg-indigo-600/20 text-indigo-500 border border-indigo-500/20'
                          : 'dark:text-zinc-400 text-zinc-600 hover:dark:text-white hover:text-zinc-900 dark:hover:bg-white/5 hover:bg-zinc-100'
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.name}
                    </Link>
                  );
                })}
                <div className="pt-2">
                  <Link
                    href="/contact"
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-black"
                  >
                    <FiMail className="w-4 h-4" />
                    Me contacter
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </div>
  );
}