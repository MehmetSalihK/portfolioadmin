import Head from 'next/head';
import { GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next/pages';
import { serverSideTranslations } from 'next-i18next/pages/serverSideTranslations';
import Link from 'next/link';
import { FiArrowUpRight, FiArrowLeft } from 'react-icons/fi';
import Layout from '@/components/layout/Layout';
import { CropMarks } from '@/components/identity/Marks';
import { Reveal } from '@/components/motion/Reveal';

/**
 * 404 — « Hors calque »
 * Une planche mal repérée : le 404 existe en deux épreuves, l'encre et le
 * fantôme vermillon, décalées. Au survol (ou au focus d'un lien voisin),
 * le fantôme se remet au calque — « mis au point ». Le chemin demandé est
 * affiché tel quel : c'est le seul « contenu » de la page, donc le vrai.
 */
export default function NotFound() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const askedPath = (router.asPath || '/').split('?')[0].split('#')[0];

  const routes = [
    { key: '01', label: t('nav.home'), path: '/' },
    { key: '02', label: t('nav.projects'), path: '/projects' },
    { key: '03', label: t('nav.contact'), path: '/contact' },
  ];

  return (
    <Layout>
      <Head>
        <title>{t('nf.title')}</title>
        <meta name="robots" content="noindex, nofollow" />
        <link rel="icon" href="/favicon.png" />
      </Head>

      <section className="relative min-h-[92svh] flex flex-col justify-center pt-[7.5rem] pb-16">
        <div aria-hidden="true" className="absolute inset-0 grid-lines pointer-events-none" />

        <div className="relative mx-auto w-full px-[var(--container-px)] max-w-[var(--container-max)]">
          {/* Ligne de métadonnées : le chemin réellement demandé */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-5 mb-10 border-b border-[rgb(var(--foreground-rgb))]/15">
            <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-[rgb(var(--foreground-rgb))]/65 truncate max-w-full">
              404 — {t('nf.path_label')} : <span className="normal-case tracking-normal">{askedPath}</span>
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-[var(--accent-text)] dark:text-[var(--accent)]">
              {t('nf.kicker')}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-[var(--gutter)] gap-y-12 items-start">
            {/* La planche décalée — composition pure, aria-hidden */}
            <div className="lg:col-span-6 order-2 lg:order-1">
              <div className="group relative select-none" aria-hidden="true">
                <div className="relative grain border border-[rgb(var(--foreground-rgb))]/15 bg-[var(--color-surface)] py-12 px-6 sm:px-10 flex items-center justify-center overflow-hidden">
                  <span className="relative inline-block font-display font-black text-[clamp(5rem,17vw,11rem)] leading-none tracking-[-0.06em]">
                    {/* Le fantôme vermillon, décalé hors registre */}
                    <span
                      className="absolute inset-0 z-10 text-transparent transition-transform duration-[600ms] ease-out-expo translate-x-[0.45rem] translate-y-[0.45rem] group-hover:translate-x-0 group-hover:translate-y-0 motion-reduce:transition-none"
                      style={{ WebkitTextStroke: '1.5px var(--accent)' }}
                    >
                      404
                    </span>
                    <span className="relative text-[rgb(var(--foreground-rgb))]">404</span>
                  </span>
                </div>
                <CropMarks />
                <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[var(--accent-text)] dark:text-[var(--accent)] mt-4 opacity-0 translate-y-1 transition-all duration-500 ease-out-expo group-hover:opacity-100 group-hover:translate-y-0 motion-reduce:transition-none">
                  {t('nf.registered')}
                </p>
              </div>
            </div>

            {/* Le texte : titre, note, retour */}
            <div className="lg:col-span-5 lg:col-start-8 order-1 lg:order-2">
              <Reveal>
                <h1 className="font-display font-black text-[clamp(2.2rem,5vw,3.75rem)] leading-[0.95] tracking-[-0.045em] m-0 text-balance">
                  {t('nf.title')}
                </h1>
              </Reveal>

              <Reveal delay={0.08}>
                <p className="lead mt-6 max-w-[44ch]">{t('nf.note')}</p>
              </Reveal>

              <Reveal delay={0.16}>
                <div className="flex flex-wrap gap-3 mt-8">
                  <Link href="/" className="btn btn-primary">
                    <FiArrowLeft className="w-4 h-4" />
                    {t('nf.back')}
                  </Link>
                </div>
              </Reveal>

              <Reveal delay={0.24}>
                <nav aria-label={t('nav.sommaire')} className="mt-10 border-t border-[rgb(var(--foreground-rgb))]/15">
                  {routes.map((r) => (
                    <Link
                      key={r.path}
                      href={r.path}
                      className="group flex items-center gap-4 py-4 border-b border-[rgb(var(--foreground-rgb))]/10 hover:bg-[var(--color-surface)] transition-colors duration-300 -mx-3 px-3"
                    >
                      <span className="index-num tabular-nums">{r.key}</span>
                      <span className="text-[0.975rem] text-[rgb(var(--foreground-rgb))]/80 group-hover:text-[rgb(var(--foreground-rgb))] transition-colors">
                        {r.label}
                      </span>
                      <span className="font-mono text-[10px] text-[rgb(var(--foreground-rgb))]/55 group-hover:text-[var(--accent-text)] dark:group-hover:text-[var(--accent)] transition-colors ml-auto">
                        {r.path}
                      </span>
                      <FiArrowUpRight className="w-3.5 h-3.5 shrink-0 text-[rgb(var(--foreground-rgb))]/60 transition-all duration-500 ease-out-expo group-hover:text-[var(--accent)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </Link>
                  ))}
                </nav>
              </Reveal>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: { ...(await serverSideTranslations(locale || 'fr', ['common'])) },
});
