import { ReactNode } from 'react';
import { useDevToolsProtection } from '@/hooks/useDevToolsProtection';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  useDevToolsProtection();

  return (
    <div className="min-h-screen flex flex-col dark:bg-[#09090f] bg-white transition-colors duration-300">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
