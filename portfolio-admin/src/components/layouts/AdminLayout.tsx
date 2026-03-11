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
    <div className="min-h-screen transition-colors duration-300 bg-background-dark text-gray-100">
      <CommandPalette />
      <Toaster position="top-right" />
      
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
        />
      )}

      {/* Sidebar */}
      <AnimatePresence>
        <motion.aside
          initial={false}
          animate={isSidebarOpen ? "open" : "closed"}
          variants={sidebarVariants}
          transition={{ type: "spring", bounce: 0, duration: 0.4 }}
          className="fixed inset-y-0 left-0 w-64 z-40 transform md:translate-x-0 transition-colors duration-300 border-r border-border-subtle bg-background-dark"
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-6 py-8 border-b border-border-subtle"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-lg font-bold tracking-tight text-white transition-colors duration-300">
                    Portfolio Admin
                  </h1>
                </div>
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all duration-300"
                  title={`Passer au thème ${theme === 'dark' ? 'clair' : 'sombre'}`}
                >
                  {theme === 'dark' ? (
                    <FiSun className="w-4 h-4" />
                  ) : (
                    <FiMoon className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-xs font-medium text-gray-500 truncate">
                {session?.user?.email}
              </p>
            </motion.div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
              {menuItems.map((item, index) => {
                const isActive = router.pathname === item.href;
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <Link
                      href={item.href}
                      className={`group flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 relative ${isActive
                        ? 'bg-indigo-500/10 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.1)]'
                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                        }`}
                    >
                      <Icon className={`w-4 h-4 mr-3 transition-all duration-200 ${isActive ? 'text-indigo-400 scale-110' : 'group-hover:text-gray-100'
                        }`} />
                      <span className="font-medium text-sm tracking-tight">{item.label}</span>
                      
                      {isActive && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-indigo-500"
                          transition={{ type: "spring", bounce: 0.2 }}
                        />
                      )}
                    </Link>
                  </motion.div>
                );
              })}
            </nav>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 border-t border-border-subtle"
            >
              <button
                onClick={handleSignOut}
                className="flex items-center w-full px-3 py-2.5 rounded-lg transition-all duration-200 group text-gray-400 hover:bg-red-500/10 hover:text-red-400"
              >
                <FiLogOut className="w-4 h-4 mr-3 transition-transform duration-300 group-hover:-translate-x-0.5" />
                <span className="font-medium text-sm">Déconnexion</span>
              </button>
            </motion.div>
          </div>
        </motion.aside>
      </AnimatePresence>

      {/* Main Content */}
      <main className={`transition-all duration-300 ${isSidebarOpen ? 'md:ml-64' : 'ml-0'}`}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="min-h-screen p-8 bg-background-dark"
        >
          <div className="max-w-[1440px] mx-auto">
            {children}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
