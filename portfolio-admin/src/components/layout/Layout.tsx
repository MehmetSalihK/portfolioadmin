import { ReactNode, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useDevToolsProtection } from '@/hooks/useDevToolsProtection';
import Footer from '@/components/layout/Footer';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  useDevToolsProtection();
  const router = useRouter();
  const { asPath, locale, locales } = router;

  // Base URL for canonical/hreflang (should be the production domain)
  const baseUrl = 'https://mehmetsalihk.fr';
  const cleanPath = asPath.split('?')[0].split('#')[0];

  useEffect(() => {
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
  }, [router.pathname]);

  return (
    <>
      <Head>
        <link rel="canonical" href={`${baseUrl}${locale === 'fr' ? '' : `/${locale}`}${cleanPath === '/' ? '' : cleanPath}`} />
        {locales?.map((loc) => (
          <link
            key={loc}
            rel="alternate"
            hrefLang={loc === 'fr' ? 'fr' : (loc === 'en' ? 'en' : 'tr')}
            href={`${baseUrl}${loc === 'fr' ? '' : `/${loc}`}${cleanPath === '/' ? '' : cleanPath}`}
          />
        ))}
        {/* x-default points to French as it is the primary language */}
        <link rel="alternate" hrefLang="x-default" href={`${baseUrl}${cleanPath === '/' ? '' : cleanPath}`} />
      </Head>
      <div className="min-h-screen flex flex-col dark:bg-[#0a0a0f] bg-[#fafafc]">
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Layout;
