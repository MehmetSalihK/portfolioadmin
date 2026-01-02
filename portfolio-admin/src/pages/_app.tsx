import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/router';
import { Analytics } from '@vercel/analytics/next';
import useSecurity from '@/utils/hooks/useSecurity';
import Navbar from '@/components/layout/Navbar';
import AutoSync from '@/components/admin/AutoSync';
import { ThemeProvider } from '@/contexts/ThemeContext';

function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  const router = useRouter();

  // Activer la sécurité globale
  useSecurity();

  const isAdminPage = router.pathname.startsWith('/admin');
  const isMaintenancePage = router.pathname === '/maintenance';

  return (
    <SessionProvider session={session}>
      <ThemeProvider>
        <AutoSync />
        <div className="min-h-screen">
          {!isAdminPage && !isMaintenancePage && <Navbar />}
          <div className={!isAdminPage ? "" : ""}>
            <Component {...pageProps} />
          </div>
        </div>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#1e293b', // Slate 800
              color: '#fff',
              border: '1px solid #334155', // Slate 700
            },
            success: {
              iconTheme: {
                primary: '#4ade80', // Green 400
                secondary: '#1e293b',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444', // Red 500
                secondary: '#1e293b',
              },
            },
          }}
        />
        <Analytics />
      </ThemeProvider>
    </SessionProvider>
  );
}

export default App;