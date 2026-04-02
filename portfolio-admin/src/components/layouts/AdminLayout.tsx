import { ReactNode, useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  FiHome, FiBriefcase, FiCode, FiFolder, FiLogOut, FiMenu, FiMail,
  FiSettings, FiBarChart2, FiBookOpen, FiActivity, FiSun, FiMoon,
  FiImage, FiShield, FiX, FiSearch, FiBell, FiChevronRight, FiGrid, FiCommand, FiTerminal, FiZap
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { useTheme } from '@/contexts/ThemeContext';
import CommandPalette from '../admin/CommandPalette';
import { useDevToolsProtection } from '@/hooks/useDevToolsProtection';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  useDevToolsProtection();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuGroups = [
    {
      title: 'Contenu',
      items: [
        { href: '/admin/projects', label: 'Projets', icon: FiFolder },
        { href: '/admin/skills', label: 'Compétences', icon: FiCode },
        { href: '/admin/experience', label: 'Expériences', icon: FiBriefcase },
        { href: '/admin/education', label: 'Formation', icon: FiBookOpen },
        { href: '/admin/media', label: 'Médias', icon: FiImage },
      ]
    },
    {
      title: 'Système',
      items: [
        { href: '/admin/analytics', label: 'Analytics', icon: FiBarChart2 },
        { href: '/admin/backup', label: 'Sauvegardes', icon: FiShield },
        { href: '/admin/messages', label: 'Messages', icon: FiMail },
        { href: '/admin/settings', label: 'Paramètres', icon: FiSettings },
      ]
    }
  ];

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#09090b]">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="w-12 h-12 border-2 border-primary-500/20 border-t-primary-500 rounded-full mb-4" />
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Initialisation Gateway...</span>
      </div>
    );
  }

  if (status === 'unauthenticated') { router.push('/admin/login'); return null; }

  return (
    <div className="min-h-screen dark:bg-[#09090c] bg-slate-50 font-jakarta transition-colors duration-500 selection:bg-primary-500/30">
      <CommandPalette />
      <Toaster position="top-right" toastOptions={{
        className: 'font-jakarta text-xs font-bold uppercase tracking-wider',
        style: { background: theme === 'dark' ? 'rgba(15,15,20,0.8)' : '#fff', color: theme === 'dark' ? '#f1f5f9' : '#1e293b', border: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', borderRadius: '24px', padding: '16px 24px' }
      }} />
      
      {/* Dynamic Backgrounds */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-500/5 blur-[120px] rounded-full -mr-64 -mt-64" />
         <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/5 blur-[100px] rounded-full -ml-48 -mb-48" />
      </div>

      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-40 md:hidden" />
        )}
      </AnimatePresence>

      {/* Sidebar Redesign */}
      <motion.aside
        initial={false}
        animate={isSidebarOpen ? "open" : "closed"}
        variants={{ open: { width: 300, x: 0 }, closed: { width: 90, x: 0 } }}
        className={`fixed inset-y-0 left-0 z-50 dark:bg-background-card/60 bg-white/60 backdrop-blur-3xl border-r dark:border-white/5 border-slate-200 flex flex-col transition-all duration-500 shadow-2xl ${isSidebarOpen ? 'w-[300px]' : 'w-0 md:w-[90px] -translate-x-full md:translate-x-0'}`}
      >
        <div className="h-24 px-8 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-4 group">
            <div className="w-11 h-11 rounded-2xl bg-primary-500 flex items-center justify-center shadow-xl shadow-primary-500/25 group-hover:rotate-12 transition-transform">
               <FiTerminal className="text-white w-6 h-6" />
            </div>
            {isSidebarOpen && (
              <div className="flex flex-col">
                 <span className="font-black text-lg tracking-tighter dark:text-white text-slate-900 group-hover:text-primary-500 transition-colors">ADMIN HQ</span>
                 <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">v2.0 Elite</span>
              </div>
            )}
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto py-8 px-5 space-y-10 scrollbar-hide">
          <div>
            <Link href="/admin" className={`flex items-center gap-4 px-5 py-4 rounded-[20px] transition-all duration-300 group ${router.pathname === '/admin' ? 'bg-primary-500 text-white shadow-xl shadow-primary-500/20' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'}`}>
              <FiGrid className="w-5 h-5 shrink-0" />
              {isSidebarOpen && <span className="font-black text-xs uppercase tracking-widest">Aperçu Global</span>}
            </Link>
          </div>

          {menuGroups.map((group, idx) => (
            <div key={idx} className="space-y-4">
              {isSidebarOpen && (
                <div className="flex items-center gap-3 px-5">
                   <div className="h-[1px] grow bg-slate-200 dark:bg-white/5" />
                   <h3 className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400 shrink-0">{group.title}</h3>
                   <div className="h-[1px] w-4 bg-slate-200 dark:bg-white/5" />
                </div>
              )}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = router.pathname === item.href;
                  return (
                    <Link key={item.href} href={item.href} className={`flex items-center gap-4 px-5 py-3.5 rounded-[20px] transition-all duration-500 group relative ${isActive ? 'dark:bg-white/[0.04] bg-primary-500/5 text-primary-500' : 'text-slate-500 hover:dark:bg-white/[0.02] hover:bg-slate-50 hover:text-slate-900 dark:hover:text-white'}`}>
                      {isActive && <motion.div layoutId="activeNav" className="absolute left-0 w-1.5 h-6 bg-primary-500 rounded-r-full" />}
                      <item.icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-primary-500 scale-110 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]' : 'group-hover:scale-110 transition-transform'}`} />
                      {isSidebarOpen && <span className={`font-black text-[11px] uppercase tracking-widest ${isActive ? 'text-primary-500' : ''}`}>{item.label}</span>}
                      {isActive && isSidebarOpen && <FiChevronRight className="ml-auto opacity-50" size={14} />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 space-y-4 border-t dark:border-white/5 border-slate-100 bg-slate-50/50 dark:bg-white/[0.02]">
          {isSidebarOpen && (
            <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-[24px]">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              <div className="flex flex-col">
                 <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">Live Secure</span>
                 <span className="text-[8px] font-bold text-emerald-600/60 dark:text-emerald-400/40 uppercase">Encrypted Session</span>
              </div>
            </div>
          )}

          <button 
            onClick={() => signOut({ callbackUrl: '/admin/login' })} 
            className="flex items-center gap-4 w-full px-5 py-4 rounded-[20px] text-slate-500 hover:bg-rose-500 hover:text-white transition-all shadow-hover-rose group"
            aria-label="Se déconnecter"
            title="Déconnexion"
          >
            <FiLogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            {isSidebarOpen && <span className="font-black text-xs uppercase tracking-widest">Sign Out</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Perspective */}
      <main className={`transition-all duration-700 min-h-screen flex flex-col relative z-10 ${isSidebarOpen ? 'md:pl-[300px]' : 'md:pl-[90px]'}`}>
        
        {/* Superior Top Bar */}
        <header className={`h-24 flex items-center justify-between px-10 sticky top-0 z-40 transition-all duration-500 ${scrolled ? 'dark:bg-[#09090c]/80 bg-white/80 backdrop-blur-xl border-b dark:border-white/5 border-slate-200 shadow-2xl shadow-black/5' : 'bg-transparent'}`}>
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
              className="w-12 h-12 rounded-[18px] dark:bg-zinc-900/50 bg-white border dark:border-white/5 border-slate-200 flex items-center justify-center text-slate-500 hover:text-primary-500 hover:border-primary-500/30 transition-all shadow-sm"
              aria-label={isSidebarOpen ? "Fermer le menu" : "Ouvrir le menu"}
              title={isSidebarOpen ? "Fermer Sidebar" : "Ouvrir Sidebar"}
            >
              <FiMenu className="w-5 h-5" />
            </button>
            <div className="hidden lg:flex items-center gap-3">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Architecture</span>
               <FiChevronRight className="text-slate-300" size={12} />
               <span className="text-xs font-black dark:text-white text-slate-900 uppercase tracking-[0.15em]">{router.pathname.split('/').pop()?.replace(/-/g, ' ') || 'HQ Dashboard'}</span>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <div className="hidden sm:flex items-center dark:bg-zinc-900/50 bg-white border dark:border-white/5 border-slate-200 rounded-[20px] px-5 py-2.5 gap-4 group focus-within:border-primary-500/50 transition-all shadow-sm cursor-pointer" onClick={() => (window as any).dispatchKeyEvent?.(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}>
              <FiSearch className="w-4 h-4 text-slate-400 group-hover:text-primary-500 transition-colors" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest w-32">Quick Command...</span>
              <div className="flex items-center gap-1 opacity-30">
                 <FiCommand size={10} />
                 <span className="text-[9px] font-black">K</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
               <button 
                 onClick={toggleTheme} 
                 className="w-11 h-11 rounded-[16px] dark:bg-zinc-900/50 bg-white border dark:border-white/5 border-slate-200 flex items-center justify-center text-slate-500 hover:text-primary-500 transition-all shadow-sm"
                 aria-label={theme === 'dark' ? "Passer au mode clair" : "Passer au mode sombre"}
                 title={theme === 'dark' ? "Mode Clair" : "Mode Sombre"}
               >
                 <AnimatePresence mode="wait">
                    {theme === 'dark' ? <FiSun className="w-5 h-5" key="sun" /> : <FiMoon className="w-5 h-5" key="moon" />}
                 </AnimatePresence>
               </button>

               <button 
                 className="w-11 h-11 rounded-[16px] dark:bg-zinc-900/50 bg-white border dark:border-white/5 border-slate-200 flex items-center justify-center text-slate-500 relative hover:text-indigo-500 transition-all shadow-sm"
                 aria-label="Voir les notifications"
                 title="Notifications"
               >
                 <FiBell className="w-5 h-5" />
                 <span className="absolute top-3 right-3 w-2 h-2 bg-rose-500 rounded-full border-2 dark:border-[#09090c] border-white" />
               </button>
            </div>

            <div className="h-10 w-[1px] bg-slate-200 dark:bg-white/10 mx-2" />

            <div className="flex items-center gap-4 group cursor-pointer p-1.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-all">
               <div className="text-right hidden sm:flex flex-col">
                  <span className="text-xs font-black dark:text-white text-slate-900 uppercase tracking-tight line-clamp-1">{session?.user?.name || 'Administrator'}</span>
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Main User Node</span>
               </div>
               <div className="w-11 h-11 rounded-[16px] bg-gradient-to-br from-indigo-500 to-primary-600 flex items-center justify-center font-black text-white shadow-xl shadow-primary-500/20 text-sm p-px group-hover:scale-105 transition-transform duration-500 relative overflow-hidden">
                  <div className="absolute inset-0 bg-white/10 animate-pulse" />
                  <span className="relative z-10">{session?.user?.name?.charAt(0).toUpperCase() || 'A'}</span>
               </div>
            </div>
          </div>
        </header>

        {/* Dynamic Content Stream */}
        <div className="flex-1 p-10 pt-6">
           <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} className="max-w-7xl mx-auto">
             {children}
           </motion.div>
        </div>

        {/* Terminal Footer */}
        <footer className="px-10 py-10 border-t dark:border-white/5 border-slate-200 flex flex-col xl:flex-row items-center justify-between gap-8 bg-slate-50/50 dark:bg-black/[0.02]">
          <div className="flex items-center gap-6">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
               © 2024 PORTFOLIO CORE <span className="mx-3 text-primary-500/30">/</span> MSK ADMIN V2.2
             </p>
             <div className="hidden md:flex items-center gap-4">
                <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 text-[9px] font-black text-slate-500 uppercase tracking-widest border dark:border-white/5">AES-256 Enabled</span>
                <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 text-[9px] font-black text-slate-500 uppercase tracking-widest border dark:border-white/5">TLS v1.3</span>
             </div>
          </div>
          
          <div className="flex items-center gap-8">
             <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500">Node Sync Active</span>
             </div>
             <div className="h-6 w-[1px] bg-slate-200 dark:bg-white/5" />
             <div className="flex items-center gap-3">
                <FiZap className="text-primary-500" size={14} />
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary-500">Turbo Optimization</span>
             </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
