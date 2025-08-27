import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/router';
import { Analytics } from '@vercel/analytics/next';
import Navbar from '@/components/layout/Navbar';
import AutoSync from '@/components/admin/AutoSync';
import { ThemeProvider } from '@/contexts/ThemeContext';

function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  const router = useRouter();
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
        <Toaster position="bottom-right" />
        <Analytics />
      </ThemeProvider>
    </SessionProvider>
  );
}

export default App;