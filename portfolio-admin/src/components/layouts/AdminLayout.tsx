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

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
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
      href: '/admin/seo', 
      label: 'SEO', 
      icon: FiGlobe,
      description: 'Optimisation SEO'
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
    await signOut({ redirect: false });
    router.push('/admin/login');
  };

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen" style={{ backgroundColor: 'rgb(30, 30, 30)' }}>
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
          className="w-12 h-12 border-t-2 border-b-2 border-blue-500 rounded-full"
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
    <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: 'rgb(30, 30, 30)' }}>
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
        />
      )}

      {/* Toggle Button for Mobile */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-4 left-4 z-50 p-3 rounded-xl shadow-lg transition-all duration-300 md:hidden text-white hover:bg-gray-600"
        style={{ backgroundColor: 'rgb(40, 40, 40)' }}
      >
        {isSidebarOpen ? (
          <FiX className="w-5 h-5" />
        ) : (
          <FiMenu className="w-5 h-5" />
        )}
      </button>

      {/* Sidebar */}
      <AnimatePresence>
        <motion.aside
          initial={false}
          animate={isSidebarOpen ? "open" : "closed"}
          variants={sidebarVariants}
          transition={{ type: "spring", bounce: 0, duration: 0.4 }}
          className="fixed inset-y-0 left-0 w-64 shadow-2xl z-40 transform md:translate-x-0 transition-colors duration-300 border-r border-gray-700"
          style={{ backgroundColor: 'rgb(40, 40, 40)' }}
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-6 py-6 border-b border-gray-600/50 transition-colors duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-xl font-bold text-white transition-colors duration-300">
                    Portfolio Admin
                  </h1>
                  <p className="text-sm mt-1 text-gray-300 transition-colors duration-300">
                    {session?.user?.email}
                  </p>
                </div>
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 hover:scale-110"
                  title={`Passer au thème ${theme === 'dark' ? 'clair' : 'sombre'}`}
                >
                  {theme === 'dark' ? (
                    <FiSun className="w-5 h-5" />
                  ) : (
                    <FiMoon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </motion.div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
              {menuItems.map((item, index) => {
                const isActive = router.pathname === item.href;
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="relative"
                  >
                    <Link
                      href={item.href}
                      className={`group flex items-center px-4 py-3 rounded-xl transition-all duration-300 relative overflow-hidden ${
                        isActive
                          ? 'bg-blue-500/20 text-blue-400 shadow-lg'
                          : 'text-gray-300 hover:bg-gray-600 hover:text-white'
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="absolute left-0 top-0 bottom-0 w-1 rounded-r-full bg-blue-400"
                          transition={{ type: "spring", bounce: 0.2 }}
                        />
                      )}
                      <Icon className={`w-5 h-5 mr-4 transition-all duration-300 ${
                        isActive ? 'scale-110' : 'group-hover:scale-105'
                      }`} />
                      <div className="flex-1">
                        <span className="font-medium text-sm">{item.label}</span>
                        <p className="text-xs mt-0.5 text-gray-400 transition-colors duration-300">
                          {item.description}
                        </p>
                      </div>
                      {isActive && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-2 h-2 rounded-full bg-blue-400"
                        />
                      )}
                    </Link>
                  </motion.div>
                );
              })}
            </nav>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 border-t border-gray-600/50 transition-colors duration-300"
            >
              <button
                onClick={handleSignOut}
                className="flex items-center w-full px-4 py-3 rounded-xl transition-all duration-300 group text-gray-300 hover:bg-red-500/10 hover:text-red-400"
              >
                <FiLogOut className="w-5 h-5 mr-3 transition-transform duration-300 group-hover:-rotate-12" />
                <span className="font-medium">Déconnexion</span>
              </button>
            </motion.div>
          </div>
        </motion.aside>
      </AnimatePresence>

      {/* Main Content */}
      <main className={`transition-all duration-200 ${isSidebarOpen ? 'md:ml-64' : 'ml-0'}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="min-h-screen p-6" style={{ backgroundColor: 'rgb(30, 30, 30)' }}
        >
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#333',
                color: '#fff',
              },
              success: {
                duration: 3000,
              },
              error: {
                duration: 4000,
              },
            }}
          />
        </motion.div>
      </main>
    </div>
  );
}
