import { ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  FiHome, FiUser, FiBriefcase, FiCode, FiFolder, FiLogOut, FiMenu, FiMail,
  FiSettings, FiList, FiBarChart2, FiBookOpen, FiActivity, FiSun, FiMoon,
  FiImage, FiTag, FiShield, FiGlobe, FiX
} from 'react-icons/fi';
import { signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { useTheme } from '@/contexts/ThemeContext';
import CommandPalette from '../admin/CommandPalette';

import { useDevToolsProtection } from '@/hooks/useDevToolsProtection';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  // Activer la protection contre les outils de développement (en production)
  useDevToolsProtection();

  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const { theme, toggleTheme } = useTheme();

  const menuItems = [
    {
      href: '/admin',
      label: 'Dashboard',
      icon: FiHome,
      description: 'Vue d\'ensemble et statistiques'
    },
    {
      href: '/admin/projects',
      label: 'Projets',
      icon: FiFolder,
      description: 'Gestion des projets portfolio'
    },
    {
      href: '/admin/skills',
      label: 'Compétences',
      icon: FiCode,
      description: 'Technologies et compétences'
    },
    {
      href: '/admin/experience',
      label: 'Expériences',
      icon: FiBriefcase,
      description: 'Parcours professionnel'
    },
    {
      href: '/admin/education',
      label: 'Formation',
      icon: FiBookOpen,
      description: 'Parcours académique'
    },
    {
      href: '/admin/media',
      label: 'Médias',
      icon: FiImage,
      description: 'Galerie et fichiers'
    },
    {
      href: '/admin/analytics',
      label: 'Analytics',
      icon: FiBarChart2,
      description: 'Statistiques et suivi'
    },

    {
      href: '/admin/backup',
      label: 'Sauvegardes',
      icon: FiShield,
      description: 'Gestion des sauvegardes'
    },
    {
      href: '/admin/messages',
      label: 'Messages',
      icon: FiMail,
      description: 'Messages de contact'
    },
    {
      href: '/admin/settings',
      label: 'Paramètres',
      icon: FiSettings,
      description: 'Configuration système'
    },
  ];

  const handleSignOut = async () => {
    // Nettoyer le stockage local et de session
    sessionStorage.clear();
    
    await signOut({ redirect: false });
    router.push('/admin/login');
  };

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background-dark">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-12 h-12 border-t-2 border-b-2 border-indigo-500 rounded-full"
        />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/admin/login');
    return null;
  }

  const sidebarVariants = {
    open: { x: 0 },
    closed: { x: "-100%" },
  };

  return (
    <div className="min-h-screen dark:bg-[#09090f] bg-zinc-50 dark:text-gray-100 transition-colors duration-500 overflow-x-hidden">
      <CommandPalette />
      <Toaster position="top-right" />
      
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-[#09090f]/80 backdrop-blur-md z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar - Command Center Vertical Navigation */}
      <motion.aside
        initial={false}
        animate={isSidebarOpen ? "open" : "closed"}
        variants={{
          open: { width: 280, x: 0 },
          closed: { width: 80, x: 0 }
        }}
        className={`fixed inset-y-0 left-0 z-50 dark:bg-zinc-900/40 bg-white backdrop-blur-2xl border-r dark:border-white/5 border-zinc-200 overflow-hidden flex flex-col transition-all duration-300 ${isSidebarOpen ? 'w-[280px]' : 'w-0 md:w-20 -translate-x-full md:translate-x-0'}`}
      >
        {/* Sidebar Header */}
        <div className="p-8 border-b dark:border-white/5 border-zinc-100 flex items-center justify-between">
          <motion.div 
            animate={{ opacity: isSidebarOpen ? 1 : 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
               <FiActivity className="text-white w-4 h-4" />
            </div>
            <span className="font-black text-sm uppercase tracking-widest dark:text-white">HQ</span>
          </motion.div>
          
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-xl hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors"
          >
            <FiMenu className="w-4 h-4 text-zinc-500" />
          </button>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto overflow-x-hidden scrollbar-hide">
          <div className="px-4 py-2 mb-2">
             <span className="text-[10px] font-black uppercase tracking-[0.3em] dark:text-zinc-600 text-zinc-400">Navigation</span>
          </div>
          {menuItems.map((item, index) => {
            const isActive = router.pathname === item.href;
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 relative group cursor-pointer ${
                    isActive 
                    ? 'dark:bg-indigo-600/10 bg-indigo-50 dark:text-indigo-400 text-indigo-600'
                    : 'dark:text-zinc-500 text-zinc-500 hover:dark:bg-white/5 hover:bg-zinc-50 hover:dark:text-white hover:text-zinc-900'
                  }`}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 transition-transform duration-500 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                  <span className={`font-bold text-sm tracking-tight transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>
                    {item.label}
                  </span>
                  
                  {isActive && (
                    <motion.div 
                      layoutId="sidebarActive"
                      className="absolute left-0 top-3 bottom-3 w-1 bg-indigo-500 rounded-r-full"
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer - System Health */}
        <div className="p-6 border-t dark:border-white/5 border-zinc-100 space-y-4">
          <div className={`p-4 rounded-2xl dark:bg-emerald-500/5 bg-emerald-50 border border-emerald-500/10 flex items-center gap-3 transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">System Secure</span>
          </div>

          <button
            onClick={handleSignOut}
            className="flex items-center gap-4 w-full px-4 py-3 rounded-2xl text-zinc-500 hover:bg-red-500/5 hover:text-red-500 transition-all group"
          >
            <FiLogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className={`font-bold text-sm tracking-tight ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>Déconnexion</span>
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main 
        className={`transition-all duration-500 min-h-screen flex flex-col pt-4 md:pt-0 ${
          isSidebarOpen ? 'md:pl-[280px]' : 'md:pl-20'
        }`}
      >
        {/* Top Navbar - Global Controls */}
        <header className="h-20 flex items-center justify-between px-8 bg-transparent sticky top-0 z-30">
           <div className="flex items-center gap-4">
             {/* Command Palette Trigger UI can go here or breadcrumbs */}
              <div className="hidden md:flex items-center gap-2 text-zinc-500 text-xs font-medium">
                 <span>Admin</span>
                 <span>/</span>
                 <span className="dark:text-white capitalize">{router.pathname.split('/').pop() || 'Dashboard'}</span>
              </div>
           </div>

           <div className="flex items-center gap-6">
              <button
                onClick={toggleTheme}
                className="w-10 h-10 rounded-xl dark:bg-zinc-900/60 bg-white border dark:border-white/5 border-zinc-200 flex items-center justify-center text-zinc-500 hover:dark:text-white hover:text-zinc-900 transition-all"
              >
                {theme === 'dark' ? <FiSun /> : <FiMoon />}
              </button>

              <div className="flex items-center gap-3 pl-6 border-l dark:border-white/5 border-zinc-200">
                 <div className="text-right hidden sm:block">
                    <p className="text-xs font-black dark:text-white uppercase tracking-tight">{session?.user?.name || 'Administrator'}</p>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Digital Craftsman</p>
                 </div>
                 <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center font-black text-white text-xs shadow-lg shadow-indigo-600/20">
                    {session?.user?.email?.charAt(0).toUpperCase()}
                 </div>
              </div>
           </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-8 pt-4">
           <motion.div
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             className="max-w-7xl mx-auto"
           >
             {children}
           </motion.div>
        </div>

        {/* Global Footer */}
        <footer className="p-8 border-t dark:border-white/5 border-zinc-200 flex flex-col md:flex-row items-center justify-between gap-4">
           <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
              © 2024 Mehmet Salih K. <span className="mx-2">·</span> Command Center v2.0
           </p>
           <div className="flex items-center gap-4">
              <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-500">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                 API Live
              </span>
              <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-500">
                 <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                 Ready to Deploy
              </span>
           </div>
        </footer>
      </main>
    </div>
  );
}
