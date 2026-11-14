import { ReactNode, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { MotionConfig } from 'framer-motion';
import { useDevToolsProtection } from '@/hooks/useDevToolsProtection';
import Footer from '@/components/layout/Footer';
import OpeningSlate from '@/components/cinema/OpeningSlate';
import FilmRail from '@/components/cinema/FilmRail';
import EasterEggs from '@/components/cinema/EasterEggs';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  useDevToolsProtection();
  const router = useRouter();
  const { asPath, locale, locales } = router;

  const baseUrl = 'https://mehmetsalihk.fr';
  const cleanPath = asPath.split('?')[0].split('#')[0];
  const canonicalUrl = `${baseUrl}${locale === 'fr' ? '' : `/${locale}`}${cleanPath === '/' ? '' : cleanPath}`;

  useEffect(() => {
    const checkMaintenance = async () => {
      if (window.location.pathname === '/maintenance' || window.location.pathname.startsWith('/admin')) {
        return;
      }
      const cachedStatus = sessionStorage.getItem('maintenance_checked');
      if (cachedStatus === 'true') return;
      try {
        const res = await fetch('/api/maintenance');
        if (res.ok) {
          const data = await res.json();
          if (data.isActive) {
            window.location.href = '/maintenance';
          } else {
            sessionStorage.setItem('maintenance_checked', 'true');
          }
        }
      } catch {
        // Silent fail
      }
    };
    checkMaintenance();
  }, [router.pathname]);

  return (
    <>
      <Head>
        <link rel="canonical" href={canonicalUrl} />
        {locales?.map((loc) => (
          <link
            key={loc}
            rel="alternate"
            hrefLang={loc}
            href={`${baseUrl}${loc === 'fr' ? '' : `/${loc}`}${cleanPath === '/' ? '' : cleanPath}`}
          />
        ))}
        <link rel="alternate" hrefLang="x-default" href={`${baseUrl}${cleanPath === '/' ? '' : cleanPath}`} />
        {/* Open Graph / Twitter — le titre et la description propres à la page
            sont ajoutés par chaque page (og:title/og:description sont dédupliqués
            par Next sur attribut `property`) */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content="MSK — Portfolio" />
        <meta property="og:image" content={`${baseUrl}/og.png`} />
        <meta property="og:image:alt" content="MSK — Portfolio" />
        <meta property="og:locale" content={locale === 'en' ? 'en_US' : locale === 'tr' ? 'tr_TR' : 'fr_FR'} />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:image" content={`${baseUrl}/og.png`} />
      </Head>
      {/* `reducedMotion="user"` délègue à framer-motion la désactivation des
          translations/échelles pour les utilisateurs « animations réduites ».
          Les `initial` restent donc identiques serveur et client : plus aucune
          divergence d'hydratation possible. */}
      <MotionConfig reducedMotion="user">
        <div className="min-h-screen flex flex-col bg-[rgb(var(--background-start-rgb))] text-[rgb(var(--foreground-rgb))] antialiased">
          {/* Le lien d'évitement est rendu dans _app.tsx, avant le Navbar :
              il doit être le TOUT premier élément focusable du document. */}
          <main id="contenu" className="flex-1 overflow-x-hidden">{children}</main>
          <Footer />
        </div>
        {/* Cinématique : ardoise d'ouverture (une fois par session) +
            rail de pellicule (décoratif, bord gauche en grand écran) +
            repères cachés (grille de repérage sur la touche G) */}
        <OpeningSlate />
        <FilmRail />
        <EasterEggs />
      </MotionConfig>
    </>
  );
};

export default Layout;
