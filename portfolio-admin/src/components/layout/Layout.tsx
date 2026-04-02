import { ReactNode } from 'react';
import { useDevToolsProtection } from '@/hooks/useDevToolsProtection';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  useDevToolsProtection();

  // Maintenance check (Client-side with session caching)
  if (typeof window !== 'undefined') {
    const checkMaintenance = async () => {
      // Ignore if on maintenance page or admin
      if (window.location.pathname === '/maintenance' || window.location.pathname.startsWith('/admin')) {
        return;
      }

      // Check for cached status in session storage
      const cachedStatus = sessionStorage.getItem('maintenance_checked');
      if (cachedStatus === 'true') return;

      try {
        const res = await fetch('/api/maintenance');
        if (res.ok) {
          const data = await res.json();
          if (data.isActive) {
            window.location.href = '/maintenance';
          } else {
            // Only cache if NOT in maintenance to allow immediate blocking when enabled
            sessionStorage.setItem('maintenance_checked', 'true');
          }
        }
      } catch (error) {
        // Silent fail
      }
    };

    checkMaintenance();
  }

  return (
    <div className="min-h-screen flex flex-col dark:bg-[#0a0a0f] bg-[#fafafc]">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
