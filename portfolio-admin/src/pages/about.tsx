import Head from 'next/head';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Layout from '@/components/layout/Layout';
import JSONLD, { schemas } from '@/components/layout/JSONLD';
import { FiArrowUpRight } from 'react-icons/fi';
import DOMPurify from 'isomorphic-dompurify';
import parse from 'html-react-parser';
import Link from 'next/link';
import { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next/pages';
import { serverSideTranslations } from 'next-i18next/pages/serverSideTranslations';
import { useRouter } from 'next/router';
import connectDB from '@/lib/db';
import Setting from '@/models/Setting';
import { getLocalized } from '@/utils/i18n-utils';
import SectionHead from '@/components/ui/SectionHead';
import { SectionMark } from '@/components/identity/Marks';
import { Reveal, RevealLines, EASE } from '@/components/motion/Reveal';

interface AboutSettings {
  aboutTitle?: string;
  aboutBio?: string;
  aboutImage?: string;
  siteTitle?: string;
}

interface AboutPageProps {
  settings: AboutSettings;
}

/* Les trois dimensions — différenciées par un traitement, pas par un arc-en-ciel */
const expertises = [
  { key: 'dev', index: '01', titleKey: 'about.expertise1_title', descKey: 'about.expertise1_desc', href: '/developpeur', texture: 'grid-lines' },
  { key: 'creative', index: '02', titleKey: 'about.expertise2_title', descKey: 'about.expertise2_desc', href: '/designer', texture: 'grain' },
  { key: 'maker', index: '03', titleKey: 'about.expertise3_title', descKey: 'about.expertise3_desc', href: '/maker', texture: 'hatch' },
];

export default function About({ settings }: AboutPageProps) {
  const { locale } = useRouter();
  const { t } = useTranslation('common');

  return (
    <Layout>
      <JSONLD type="Person" data={schemas.me} />
      <Head>
        <title>{settings.siteTitle ? `${t('about.hero_subtitle')} — ${settings.siteTitle}` : `${t('about.hero_subtitle')} — Portfolio`}</title>
        <meta name="description" content={t('about.hero_description')} />
        <meta property="og:title" content={settings.siteTitle ? `${t('about.hero_subtitle')} — ${settings.siteTitle}` : `${t('about.hero_subtitle')} — Portfolio`} />
        <meta property="og:description" content={t('about.hero_description')} />
        <link rel="icon" href="/favicon.png" />
      </Head>

      {/* ════════════ OUVERTURE ════════════ */}
      <section className="relative pt-[8.5rem] pb-2">
        <div className="mx-auto w-full px-[var(--container-px)] max-w-[var(--container-max)]">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-5 mb-9 border-b border-[rgb(var(--foreground-rgb))]/15">
            <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-[rgb(var(--foreground-rgb))]/60">
              {t('nav.about')} — {t('page_label.about')}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-[rgb(var(--foreground-rgb))]/60 tabular-nums">
              FR / EN / TR
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-[var(--gutter)] gap-y-10">
            <div className="lg:col-span-8">
              <h1 className="font-display font-black text-[clamp(2.4rem,6.6vw,5.75rem)] leading-[0.92] tracking-[-0.05em] m-0 text-balance">
                <RevealLines delay={0.1} stagger={0.09}>
                  <span>{t('about.hero_title_part1')} {t('about.hero_title_part2')}</span>
                  <span>
                    {t('about.hero_title_part3')}{' '}
                    <span className="font-accent text-[1.1em] text-[var(--accent-text)] dark:text-[var(--accent)]">
                      {t('about.hero_title_part4')}
                    </span>
                    <span className="text-[var(--accent-text)] dark:text-[var(--accent)]">.</span>
                  </span>
                </RevealLines>
              </h1>
            </div>

            <div className="lg:col-span-4 lg:pb-3">
              <Reveal delay={0.35}>
                <p className="lead m-0">{t('about.hero_description')}</p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════ 01 — TROIS EXPERTISES ════════════ */}
      <section className="relative mt-[var(--section-gap)]">
        <div className="mx-auto w-full px-[var(--container-px)] max-w-[var(--container-max)]">
          <SectionHead
            index="01"
            kicker={t('about.expertises_subtitle')}
            sigil={<SectionMark name="univers" />}
            title={t('about.expertises_title')}
          />

          {/* Tablet : 2 colonnes (3 à 768px écrasait le texte à ~175px) */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 border-t border-[rgb(var(--foreground-rgb))]/15">
            {expertises.map((e, i) => (
              <Reveal key={e.key} delay={i * 0.07} amount={0.3}>
                <Link
                  href={e.href}
                  className={`group relative block h-full p-7 lg:p-8 sm:min-h-[17rem] lg:min-h-[19rem] border-b border-[rgb(var(--foreground-rgb))]/12 lg:border-b-0 ${
                    i % 2 === 1 ? 'sm:border-l sm:border-[rgb(var(--foreground-rgb))]/12' : ''
                  } ${i > 0 ? 'lg:border-l lg:border-[rgb(var(--foreground-rgb))]/12' : 'lg:border-l-0' } hover:bg-[var(--color-surface)] transition-colors duration-500 ease-out-expo`}
                >
                  {/* Texture propre à chaque dimension */}
                  <span aria-hidden="true" className={`absolute inset-0 pointer-events-none opacity-40 ${e.texture} transition-opacity duration-700 group-hover:opacity-70`} />

                  <div className="relative flex items-start justify-between gap-4 mb-8">
                    <span className="index-num text-[var(--accent-text)] dark:text-[var(--accent)]">{e.index}</span>
                    <FiArrowUpRight className="w-5 h-5 text-[rgb(var(--foreground-rgb))]/60 transition-all duration-500 ease-out-expo group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-[var(--accent)]" />
                  </div>

                  <h3 className="relative text-[1.6rem] font-black leading-[1.02] tracking-[-0.035em] m-0 mb-4 transition-transform duration-500 ease-out-expo group-hover:translate-x-1.5">
                    {t(e.titleKey)}
                  </h3>

                  <p className="relative text-[0.925rem] leading-relaxed text-[rgb(var(--foreground-rgb))]/60 m-0 max-w-[34ch]">
                    {t(e.descKey)}
                  </p>

                  <span className="relative block h-px w-10 bg-[var(--accent)] mt-7 origin-left transition-transform duration-500 ease-out-expo group-hover:scale-x-[3]" />
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ 02 — BIOGRAPHIE ════════════ */}
      {/* Pas de mt : la section précédente se termine déjà par son propre
          rythme — mt + py doublait le vide (160px à 390px). */}
      <section className="relative border-t border-[rgb(var(--foreground-rgb))]/15">
        <div className="mx-auto w-full px-[var(--container-px)] max-w-[var(--container-max)] py-[var(--section-gap)]">
          <SectionHead
            index="02"
            kicker={t('about.philosophy_default_title')}
            title={settings.aboutTitle || t('about.title')}
          />

          <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-x-[var(--gutter)] gap-y-12 items-start">
            {/* Portrait — planche contact (d'abord en mobile : l'ancre visuelle) */}
            <div className="lg:col-span-4 lg:order-1 lg:sticky lg:top-28">
              {settings.aboutImage && (
                <motion.figure
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.8, ease: EASE }}
                  className="m-0"
                >
                  <div className="relative aspect-[4/5] overflow-hidden border border-[rgb(var(--foreground-rgb))]/15 grain bg-[var(--color-surface)]">
                    <Image
                      src={settings.aboutImage}
                      alt={settings.aboutTitle || 'Portrait'}
                      fill
                      sizes="(max-width: 1024px) 100vw, 30vw"
                      className="object-cover grayscale contrast-[1.03] transition-all duration-1000 ease-out-expo hover:grayscale-0"
                    />
                  </div>
                  <figcaption className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[rgb(var(--foreground-rgb))]/60">
                    <span>{settings.aboutTitle || 'Portrait'}</span>
                    <span className="tabular-nums">{locale?.toUpperCase()}</span>
                  </figcaption>
                </motion.figure>
              )}
            </div>

            {/* Texte éditorial */}
            <div className="lg:col-span-7 lg:col-start-6 order-2 lg:order-2">
              <Reveal>
                <div className="border-t border-[rgb(var(--foreground-rgb))]/20 pt-7">
                  <div className="prose-editorial text-[1.05rem] leading-[1.75] text-[rgb(var(--foreground-rgb))]/78 max-w-[62ch]">
                    {settings.aboutBio ? (
                      parse(DOMPurify.sanitize(settings.aboutBio))
                    ) : (
                      <p>{t('about.philosophy_default_bio')}</p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 mt-12 pt-8 border-t border-[rgb(var(--foreground-rgb))]/12">
                    <Link href="/contact" className="btn btn-primary">
                      {t('about.cta_project')}
                      <FiArrowUpRight className="w-4 h-4" />
                    </Link>
                    <Link href="/projects" className="link-arrow text-[rgb(var(--foreground-rgb))]/65">
                      {t('about.cta_work')} <FiArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const currentLocale = locale || 'fr';
  try {
    await connectDB();
    const rawSettings = await Setting.findOne({}).lean();
    const settings = rawSettings ? {
      ...rawSettings,
      _id: (rawSettings as any)._id.toString(),
      aboutTitle: getLocalized(rawSettings, 'aboutTitle', currentLocale),
      aboutBio: getLocalized(rawSettings, 'aboutBio', currentLocale),
    } : {
      aboutTitle: 'Mon Parcours',
      aboutBio: '',
      aboutImage: '',
    };

    return {
      props: { settings: JSON.parse(JSON.stringify(settings)), ...(await serverSideTranslations(currentLocale, ['common'])), },
      revalidate: 60,
    };
  } catch (error) {
    console.error("Error in About getStaticProps:", error);
    return {
      props: { settings: { aboutTitle: 'Mon Parcours', aboutBio: '' }, ...(await serverSideTranslations(currentLocale, ['common'])), },
      revalidate: 60,
    };
  }
};
