import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { ThemeProvider } from 'next-themes';
import { SessionProvider } from 'next-auth/react';
import { appWithTranslation } from 'next-i18next';
import { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/router';
import { Analytics } from '@vercel/analytics/next';
import Navbar from '@/components/layout/Navbar';
import AutoSync from '@/components/admin/AutoSync';

function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  const router = useRouter();
  const isAdminPage = router.pathname.startsWith('/admin');

  return (
    <SessionProvider session={session}>
      <ThemeProvider attribute="class">
        <AutoSync />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          {!isAdminPage && <Navbar />}
          <div className={!isAdminPage ? "" : ""}>
            <Component {...pageProps} />
          </div>
        </div>
      </ThemeProvider>
      <Toaster position="bottom-right" />
      <Analytics />
    </SessionProvider>
  );
}

export default appWithTranslation(App);