import { appWithTranslation } from 'next-i18next/pages';
import i18nConfig from '../../next-i18next.config.js';
import '@/styles/globals.css';
import { useEffect, useRef, useState } from 'react';
import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/router';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { useTranslation } from 'next-i18next/pages';
import Navbar from '@/components/layout/Navbar';
import AutoSync from '@/components/admin/AutoSync';
import { ThemeProvider } from '@/contexts/ThemeContext';

/* Lien d'évitement : rendu AVANT le Navbar pour rester le tout premier
   élément focusable du document (le `#contenu` vit dans le Layout public). */
function SkipLink() {
  const { t } = useTranslation('common');
  return (
    <a
      href="#contenu"
      className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[70] focus:bg-[rgb(var(--foreground-rgb))] focus:text-[rgb(var(--background-start-rgb))] focus:px-4 focus:py-3 focus:font-mono focus:text-[11px] focus:uppercase focus:tracking-[0.16em]"
    >
      {t('a11y.skip_to_content')}
    </a>
  );
}

/* États de la barre de progression de navigation (site public) :
   idle → loading (filet qui se remplit) → done (pleine largeur) → idle (fondu) */
type NavProgress = 'idle' | 'loading' | 'done';

function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  const router = useRouter();

  const isAdminPage = router.pathname.startsWith('/admin');
  const isMaintenancePage = router.pathname === '/maintenance';
  const isPublicPage = !isAdminPage && !isMaintenancePage;

  /* — Progression de route : le filet vermillon en haut du viewport se remplit
       pendant le changement de page, puis se referme. Seules les navigations
       ultérieures sont concernées : le premier rendu (SSR) reste immobile. */
  const [navProgress, setNavProgress] = useState<NavProgress>('idle');
  /* Destination réelle de la navigation en cours (jamais un % fictif) */
  const [pendingPath, setPendingPath] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isPublicPage) return;
    const onStart = (url: string) => {
      if (closeTimer.current) {
        clearTimeout(closeTimer.current);
        closeTimer.current = null;
      }
      setPendingPath(url.split('?')[0].split('#')[0] || '/');
      setNavProgress('loading');
    };
    const onDone = () => setNavProgress('done');
    router.events.on('routeChangeStart', onStart);
    router.events.on('routeChangeComplete', onDone);
    router.events.on('routeChangeError', onDone);
    return () => {
      router.events.off('routeChangeStart', onStart);
      router.events.off('routeChangeComplete', onDone);
      router.events.off('routeChangeError', onDone);
    };
  }, [router.events, isPublicPage]);

  /* Referme la barre après sa phase « done » (laisse le temps au fondu) */
  useEffect(() => {
    if (navProgress !== 'done') return;
    closeTimer.current = setTimeout(() => {
      setNavProgress('idle');
      setPendingPath(null);
    }, 460);
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, [navProgress]);

  /* `key` : à chaque changement de route, la page est remontée et l'animation
     `page-enter` redémarre. Les changements de requête/fragment (même chemin)
     ne redéclenchent rien. */
  const pageKey = isPublicPage ? router.pathname : 'app';

  return (
    <SessionProvider session={session}>
      <ThemeProvider>
        <AutoSync />
        <div className="min-h-screen">
          {isPublicPage && <SkipLink />}
          {!isAdminPage && !isMaintenancePage && <Navbar />}
          {isPublicPage && (
            <div
              aria-hidden="true"
              className={`route-progress nav-progress--${navProgress}`}
            />
          )}
          {isPublicPage && pendingPath && navProgress !== 'idle' && (
            <span
              aria-hidden="true"
              className={`route-chip route-chip--${navProgress}`}
            >
              <span className="route-chip__dot" />
              {pendingPath}
            </span>
          )}
          <div key={pageKey} className={isPublicPage ? 'page-enter' : undefined}>
            <Component {...pageProps} />
          </div>
        </div>
        {/* Toaster aligné sur la direction TRACÉ : bloc d'encre carré,
            filet 1px, texte papier, icône vermillon. */}
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#14130f',
              color: '#f4f1ea',
              border: '1px solid rgba(244, 241, 234, 0.18)',
              borderRadius: 0,
              fontFamily: "'Satoshi', -apple-system, BlinkMacSystemFont, sans-serif",
              fontSize: '0.875rem',
              lineHeight: 1.5,
              padding: '0.875rem 1.1rem',
              maxWidth: '380px',
              boxShadow: '0 18px 40px -28px rgba(0, 0, 0, 0.85)',
            },
            success: {
              iconTheme: { primary: '#ff4a17', secondary: '#ffffff' },
            },
            error: {
              iconTheme: { primary: '#ff4a17', secondary: '#ffffff' },
            },
          }}
        />
        <Analytics />
        <SpeedInsights />
      </ThemeProvider>
    </SessionProvider>
  );
}

export default appWithTranslation(App, i18nConfig);