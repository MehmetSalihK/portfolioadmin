import { ReactNode } from 'react';
import { useDevToolsProtection } from '@/hooks/useDevToolsProtection';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  // Activer la protection contre les outils de développement (en production)
  useDevToolsProtection();

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};

export default Layout;
