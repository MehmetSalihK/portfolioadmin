import React from 'react';
import { motion, useScroll } from 'framer-motion';
import Head from 'next/head';
import { GetStaticProps } from 'next';
import Layout from '@/components/layout/Layout';
import connectDB from '@/lib/db';
import ProjectModel from '@/models/Project';
import { FiArrowUpRight, FiChevronRight } from 'react-icons/fi';
import { SiAdobepremierepro, SiAdobeaftereffects, SiAdobephotoshop, SiAdobelightroom, SiAdobecreativecloud } from 'react-icons/si';
import Link from 'next/link';
import JSONLD, { schemas } from '@/components/layout/JSONLD';
import { useTranslation } from 'next-i18next/pages';
import { serverSideTranslations } from 'next-i18next/pages/serverSideTranslations';
import { useRouter } from 'next/router';
import { getLocalized } from '@/utils/i18n-utils';
import Image from 'next/image';
import SectionHead from '@/components/ui/SectionHead';
import { DimensionMark } from '@/components/identity/Marks';
import { Reveal, RevealLines, EASE } from '@/components/motion/Reveal';

interface Project {
  _id: string; title: string; description: string;
  imageUrl: string; technologies: string[];
  demoUrl?: string; githubUrl?: string; category?: string;
}

interface DesignerPageProps { projects: Project[]; }

const services = [
  { n: '01', titleKey: 'designer_page.exp1_title', descKey: 'designer_page.exp1_desc' },
  { n: '02', titleKey: 'designer_page.exp2_title', descKey: 'designer_page.exp2_desc' },
  { n: '03', titleKey: 'designer_page.exp3_title', descKey: 'designer_page.exp3_desc' },
];

const formats = [
  { n: '01', titleKey: 'designer_page.format1_title', descKey: 'designer_page.format1_desc' },
  { n: '02', titleKey: 'designer_page.format2_title', descKey: 'designer_page.format2_desc' },
  { n: '03', titleKey: 'designer_page.format3_title', descKey: 'designer_page.format3_desc' },
];

const workflow = [
  { n: '01', tKey: 'designer_page.step1_title', dKey: 'designer_page.step1_desc' },
  { n: '02', tKey: 'designer_page.step2_title', dKey: 'designer_page.step2_desc' },
  { n: '03', tKey: 'designer_page.step3_title', dKey: 'designer_page.step3_desc' },
  { n: '04', tKey: 'designer_page.step4_title', dKey: 'designer_page.step4_desc' },
];

const logiciels = [
  { label: 'Premiere Pro', icon: SiAdobepremierepro, color: '#EA77FF' },
  { label: 'After Effects', icon: SiAdobeaftereffects, color: '#CF96FD' },
  { label: 'Photoshop', icon: SiAdobephotoshop, color: '#31A8FF' },
  { label: 'Lightroom', icon: SiAdobelightroom, color: '#31A8FF' },
  { label: 'Creative Cloud', icon: SiAdobecreativecloud, color: '#DA1F26' },
];

export default function DesignerPage({ projects = [] }: DesignerPageProps) {
  const { scrollYProgress } = useScroll();
  const { t } = useTranslation('common');
  const { locale } = useRouter();

  return (
    <Layout>
      <JSONLD type="ProfessionalService" data={schemas.designer} />
      <Head>
        <title>{`${t('nav.creative')} — Portfolio`}</title>
        <meta name="description" content={t('designer_page.hero_description')} />
        <meta property="og:title" content={`${t('nav.creative')} — Portfolio`} />
        <meta property="og:description" content={t('designer_page.hero_description')} />
        <link rel="icon" href="/favicon.png" />
      </Head>

      {/* Barre de progression — trait de chambre noire */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] bg-[var(--color-creative)] origin-left z-50"
        style={{ scaleX: scrollYProgress }}
      />

      {/* ════════════ HERO — grain de pellicule ════════════ */}
      <section className="relative min-h-[92svh] flex flex-col justify-center pt-[7.5rem] pb-12 overflow-hidden">
        <span aria-hidden="true" className="absolute inset-0 grain pointer-events-none" />
        <span aria-hidden="true" className="absolute left-0 top-0 h-full w-px bg-[rgb(var(--foreground-rgb))]/10 hidden lg:block" />

        <div className="relative mx-auto w-full px-[var(--container-px)] max-w-[var(--container-max)]">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-5 mb-10 border-b border-[rgb(var(--foreground-rgb))]/15">
            <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-[var(--color-creative)]">
              02 / {t('nav.creative')}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-[rgb(var(--foreground-rgb))]/60">
              {t('designer_page.hero_subtitle')}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-[var(--gutter)] gap-y-12 items-end">
            <div className="lg:col-span-7">
              <h1 className="font-display font-black text-[clamp(2.3rem,6vw,5.25rem)] leading-[0.95] tracking-[-0.05em] m-0 text-balance">
                <RevealLines delay={0.1} stagger={0.1}>
                  <span>{t('designer_page.hero_title_part1')}</span>{' '}
                  <span>
                    <span className="font-accent text-[1.1em] text-[var(--color-creative)]">
                      {t('designer_page.hero_title_part2')}
                    </span>
                  </span>
                </RevealLines>
              </h1>

              <Reveal delay={0.45}>
                <p className="lead max-w-[54ch] mt-9 mb-0">{t('designer_page.hero_description')}</p>
              </Reveal>

              <Reveal delay={0.55}>
                <div className="flex flex-wrap items-stretch gap-3 mt-9">
                  <Link href="/contact" className="btn btn-primary">
                    {t('designer_page.cta_talk')}
                    <FiArrowUpRight className="w-4 h-4" />
                  </Link>
                  <Link href="/projects" className="btn btn-outline">
                    {t('designer_page.cta_projects')}
                  </Link>
                </div>
              </Reveal>
            </div>

            {/* Planche contact — caméra */}
            <div className="lg:col-span-5">
              <Reveal delay={0.3}>
                <figure className="m-0">
                  <div className="relative w-full aspect-[4/3] overflow-hidden border border-[rgb(var(--foreground-rgb))]/15 grain bg-[var(--color-surface)]">
                    <Image
                      src="/images/designer/camera.jpg"
                      alt={t('home.univers.alt_creative')}
                      fill
                      priority
                      sizes="(max-width: 1024px) 100vw, 40vw"
                      className="object-cover grayscale contrast-[1.05] transition-all duration-1000 ease-out-expo hover:grayscale-0"
                    />
                    {/* Repères de cadrage */}
                    <span aria-hidden="true" className="absolute top-4 left-4 w-5 h-5 border-t border-l border-white/70" />
                    <span aria-hidden="true" className="absolute top-4 right-4 w-5 h-5 border-t border-r border-white/70" />
                    <span aria-hidden="true" className="absolute bottom-4 left-4 w-5 h-5 border-b border-l border-white/70" />
                    <span aria-hidden="true" className="absolute bottom-4 right-4 w-5 h-5 border-b border-r border-white/70" />
                    <span className="absolute bottom-0 left-0 flex items-center gap-2 px-3 py-2 bg-[rgb(var(--background-start-rgb))] font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-creative)] border-r border-t border-[rgb(var(--foreground-rgb))]/15">
                      <span className="w-1.5 h-1.5 bg-[var(--color-creative)]" />
                      Creative
                    </span>
                  </div>
                  <figcaption className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[rgb(var(--foreground-rgb))]/60">
                    {locale?.toUpperCase()} — Fig. 02
                  </figcaption>
                </figure>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════ 01 — EXPERTISE ════════════ */}
      <section className="relative border-t border-[rgb(var(--foreground-rgb))]/15">
        <div className="mx-auto w-full px-[var(--container-px)] max-w-[var(--container-max)] py-[var(--section-gap)]">
          <SectionHead
            index="01"
            kicker={t('designer_page.expertise_subtitle')}
            sigil={<DimensionMark dim="creative" />}
            title={t('designer_page.expertise_title')}
          />

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 border-t border-[rgb(var(--foreground-rgb))]/15">
            {services.map((s, i) => (
              <Reveal key={s.n} delay={i * 0.07} amount={0.3}>
                <div className={`relative h-full p-7 lg:p-8 sm:min-h-[17rem] border-b border-[rgb(var(--foreground-rgb))]/12 lg:border-b-0 group hover:bg-[var(--color-surface)] transition-colors duration-500 ease-out-expo overflow-hidden ${i % 2 === 1 ? 'sm:border-l sm:border-[rgb(var(--foreground-rgb))]/12' : ''} ${i > 0 ? 'lg:border-l lg:border-[rgb(var(--foreground-rgb))]/12' : 'lg:border-l-0'}`}>
                  <span aria-hidden="true" className="absolute inset-0 grain opacity-70 pointer-events-none transition-opacity duration-700 group-hover:opacity-100" />
                  <div className="relative flex items-start justify-between mb-8">
                    <span className="index-num text-[var(--color-creative)]">{s.n}</span>
                    <span className="w-6 h-px bg-[var(--color-creative)] mt-2" />
                  </div>
                  <h3 className="relative text-[1.3rem] font-bold leading-[1.14] tracking-[-0.025em] m-0 mb-4">
                    {t(s.titleKey)}
                  </h3>
                  <p className="relative text-[0.925rem] leading-relaxed text-[rgb(var(--foreground-rgb))]/62 m-0">
                    {t(s.descKey)}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ 02 — ÉQUIPEMENT ════════════ */}
      {projects.length > 1 && (
        <section className="relative border-t border-[rgb(var(--foreground-rgb))]/15">
          <div className="mx-auto w-full px-[var(--container-px)] max-w-[var(--container-max)] py-[var(--section-gap)]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-[var(--gutter)] gap-y-12 items-start">
              <div className="lg:col-span-6">
                <Reveal>
                  <div className="relative w-full aspect-[4/3] overflow-hidden border border-[rgb(var(--foreground-rgb))]/15 grain bg-[var(--color-surface)]">
                    <Image
                      src={projects[0]?.imageUrl || '/images/designer/camera.jpg'}
                      alt={projects[0]?.title || t('projects.subtitle')}
                      fill
                      sizes="(max-width: 1024px) 100vw, 48vw"
                      className="object-cover transition-transform duration-[1400ms] ease-out-expo hover:scale-[1.04]"
                    />
                  </div>
                </Reveal>
              </div>

              <div className="lg:col-span-5 lg:col-start-8">
                <Reveal delay={0.1}>
                  <DrawRuleLite />
                  <div className="flex items-center gap-4 mb-5 mt-6">
                    <span className="index-num text-[var(--color-creative)]">02</span>
                    <span className="kicker kicker--plain">{t('designer_page.setup_subtitle')}</span>
                  </div>
                  <h2 className="text-[clamp(1.85rem,3.6vw,2.9rem)] leading-[1] tracking-[-0.04em] m-0 mb-7 text-balance">
                    {t('designer_page.setup_title_part1')}{' '}
                    <span className="font-accent text-[1.1em] text-[var(--color-creative)]">
                      {t('designer_page.setup_title_part2')}
                    </span>
                    <span className="text-[var(--color-creative)]">.</span>
                  </h2>
                  <div className="prose-editorial text-[1rem] leading-[1.7] text-[rgb(var(--foreground-rgb))]/70 max-w-[52ch]">
                    <p dangerouslySetInnerHTML={{ __html: t('designer_page.setup_desc1') }} />
                    <p>{t('designer_page.setup_desc2')}</p>
                  </div>
                </Reveal>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ════════════ 03 — TERRAINS ════════════ */}
      <section className="relative border-t border-[rgb(var(--foreground-rgb))]/15">
        <div className="mx-auto w-full px-[var(--container-px)] max-w-[var(--container-max)] py-[var(--section-gap)]">
          <SectionHead
            index="03"
            kicker={t('designer_page.formats_subtitle')}
            title={t('designer_page.formats_title')}
          />

          <div className="mt-12 border-t border-[rgb(var(--foreground-rgb))]/20">
            {formats.map((f, i) => (
              <Reveal key={f.n} delay={i * 0.06} amount={0.35}>
                <div className="group grid grid-cols-1 lg:grid-cols-12 gap-x-[var(--gutter)] gap-y-3 py-7 border-b border-[rgb(var(--foreground-rgb))]/12 hover:bg-[var(--color-surface)] transition-colors duration-500 ease-out-expo -mx-3 px-3">
                  <div className="lg:col-span-1">
                    <span className="index-num text-[var(--color-creative)]">{f.n}</span>
                  </div>
                  <h3 className="lg:col-span-4 text-[1.35rem] font-bold leading-tight tracking-[-0.03em] m-0 transition-transform duration-500 ease-out-expo group-hover:translate-x-2">
                    {t(f.titleKey)}
                  </h3>
                  <p className="lg:col-span-6 lg:col-start-7 text-[0.975rem] leading-relaxed text-[rgb(var(--foreground-rgb))]/62 m-0 max-w-[50ch]">
                    {t(f.descKey)}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ 04 — LOGICIELS ════════════ */}
      <section className="relative border-t border-[rgb(var(--foreground-rgb))]/15">
        <div className="mx-auto w-full px-[var(--container-px)] max-w-[var(--container-max)] py-[var(--section-gap)]">
          <SectionHead
            index="04"
            kicker={t('designer_page.logiciels_subtitle')}
            title={t('designer_page.logiciels_title')}
          />

          {/* 5 colonnes uniquement à lg : à 768px, les libellés n'avaient que ~93px */}
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 border-t border-l border-[rgb(var(--foreground-rgb))]/12">
            {logiciels.map((l, i) => (
              <Reveal key={l.label} delay={i * 0.05} amount={0.3}>
                <div className="group flex flex-col items-center justify-center gap-3 h-full p-6 border-r border-b border-[rgb(var(--foreground-rgb))]/12 hover:bg-[var(--color-surface)] transition-colors duration-500 ease-out-expo">
                  <l.icon
                    className="w-7 h-7 transition-transform duration-500 ease-out-expo group-hover:scale-110"
                    style={{ color: l.color, opacity: 0.85 }}
                  />
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[rgb(var(--foreground-rgb))]/60 text-center leading-tight">
                    {l.label}
                  </span>
                  <span className="index-num">{String(i + 1).padStart(2, '0')}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ 05 — WORKFLOW ════════════ */}
      <section className="relative border-t border-[rgb(var(--foreground-rgb))]/15">
        <div className="mx-auto w-full px-[var(--container-px)] max-w-[var(--container-max)] py-[var(--section-gap)]">
          <SectionHead
            index="05"
            kicker={t('designer_page.workflow_subtitle')}
            title={t('designer_page.workflow_title')}
          />

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-[var(--gutter)] gap-y-9 border-t border-[rgb(var(--foreground-rgb))]/20 pt-9">
            {workflow.map((step, i) => (
              <Reveal key={step.n} delay={i * 0.07} amount={0.3}>
                <div className="group">
                  <div className="flex items-center gap-3 mb-5">
                    <span className="flex items-center justify-center w-9 h-9 border border-[var(--color-creative)] text-[var(--color-creative)] font-mono text-[11px] font-semibold tabular-nums transition-colors duration-[400ms] group-hover:bg-[var(--color-creative)] group-hover:text-white">
                      {step.n}
                    </span>
                    <span className="h-px flex-1 bg-[rgb(var(--foreground-rgb))]/15" />
                  </div>
                  <h4 className="text-[1.05rem] font-bold tracking-[-0.02em] m-0 mb-3">{t(step.tKey)}</h4>
                  <p className="text-[0.9rem] leading-relaxed text-[rgb(var(--foreground-rgb))]/65 m-0">
                    {t(step.dKey)}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ BANDE — CHAPITRE SUIVANT ════════════ */}
      <Link
        href="/maker"
        className="group block border-t border-[rgb(var(--foreground-rgb))]/15"
        aria-label={`${t('chapter.next')} — ${t('nav.maker')}`}
      >
        <div className="mx-auto w-full px-[var(--container-px)] max-w-[var(--container-max)] py-9 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-[rgb(var(--foreground-rgb))]/60">
            {t('chapter.next')}
          </span>
          <span className="flex items-center gap-3 font-display font-black text-[clamp(1.5rem,3.5vw,2.4rem)] leading-none tracking-[-0.04em] transition-colors duration-300 group-hover:text-[var(--color-maker)] group-focus-visible:text-[var(--color-maker)]">
            03 — {t('nav.maker')}
            <FiArrowUpRight className="w-5 h-5 shrink-0 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" />
          </span>
        </div>
      </Link>

      {/* ════════════ CLÔTURE ════════════ */}
      <section className="relative border-t border-[rgb(var(--foreground-rgb))]/15 bg-[var(--color-creative)] text-white overflow-hidden">
        <span aria-hidden="true" className="absolute inset-0 grain opacity-60 pointer-events-none" />
        <div className="relative mx-auto w-full px-[var(--container-px)] max-w-[var(--container-max)] py-[var(--section-gap)]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-[var(--gutter)] gap-y-9 items-end">
            <div className="lg:col-span-8">
              <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/70 block mb-6">
                06 — {t('designer_page.gallery_subtitle')}
              </span>
              <h2 className="text-[clamp(2.1rem,5.5vw,4.5rem)] leading-[0.95] tracking-[-0.045em] m-0 text-balance text-white">
                {t('designer_page.footer_cta_title_part1')}{' '}
                <span className="font-accent text-[1.1em]">{t('designer_page.footer_cta_title_part2')}</span>
                <span className="opacity-70">.</span>
              </h2>
              <p className="text-[1.05rem] leading-[1.65] text-white/85 mt-7 mb-0 max-w-[46ch]">
                {t('designer_page.footer_cta_description')}
              </p>
            </div>
            <div className="lg:col-span-4 flex flex-col gap-3">
              <Link href="/contact" className="btn bg-white text-[var(--color-creative)] border-white hover:bg-white/90 justify-between w-full">
                {t('designer_page.footer_cta_btn1')}
                <FiArrowUpRight className="w-4 h-4" />
              </Link>
              <Link href="/projects" className="btn bg-transparent text-white border-white/50 hover:bg-white/10 justify-between w-full">
                {t('designer_page.footer_cta_btn2')}
                <FiChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

/* Filet éditorial local */
const DrawRuleLite = () => (
  <span aria-hidden="true" className="block h-px w-full bg-[rgb(var(--foreground-rgb))]/20" />
);

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const currentLocale = locale || 'fr';
  try {
    await connectDB();
    const rawProjects = await ProjectModel.find({
      category: { $in: ['design', 'video', 'branding'] },
      archived: { $ne: true }
    }).sort({ featured: -1, order: 1 }).limit(4).lean();

    const projects = rawProjects.map((p: any) => ({
      ...p,
      _id: p._id.toString(),
      title: getLocalized(p, 'title', currentLocale),
      description: getLocalized(p, 'description', currentLocale),
    }));

    return {
      props: { projects: JSON.parse(JSON.stringify(projects)), ...(await serverSideTranslations(currentLocale, ['common'])), },
      revalidate: 60,
    };
  } catch {
    return {
      props: { projects: [], ...(await serverSideTranslations(currentLocale, ['common'])), },
      revalidate: 60,
    };
  }
};
