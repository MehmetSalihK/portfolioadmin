import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { ThemeProvider } from 'next-themes';
import { SessionProvider } from 'next-auth/react';
import { appWithTranslation } from 'next-i18next';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';

function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  const router = useRouter();
  const isAdminPage = router.pathname.startsWith('/admin');

  return (
    <SessionProvider session={session}>
      <ThemeProvider attribute="class">
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          {!isAdminPage && <Navbar />}
          <div className={!isAdminPage ? "pt-20" : ""}>
            <AnimatePresence mode="wait">
              <motion.main
                key={router.pathname}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <Component {...pageProps} />
              </motion.main>
            </AnimatePresence>
          </div>
        </div>
      </ThemeProvider>
      <Toaster position="bottom-right" />
    </SessionProvider>
  );
}

export default appWithTranslation(App);