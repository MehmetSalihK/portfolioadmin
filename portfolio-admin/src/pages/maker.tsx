import React from 'react';
import { motion, useScroll } from 'framer-motion';
import Head from 'next/head';
import { GetStaticProps } from 'next';
import Layout from '@/components/layout/Layout';
import connectDB from '@/lib/db';
import ProjectModel from '@/models/Project';
import { FiArrowUpRight, FiChevronRight } from 'react-icons/fi';
import { SiArduino, SiRaspberrypi, SiDocker, SiLinux } from 'react-icons/si';
import Image from 'next/image';
import Link from 'next/link';
import JSONLD, { schemas } from '@/components/layout/JSONLD';
import { useTranslation } from 'next-i18next/pages';
import { serverSideTranslations } from 'next-i18next/pages/serverSideTranslations';
import { useRouter } from 'next/router';
import { getLocalized } from '@/utils/i18n-utils';
import SectionHead from '@/components/ui/SectionHead';
import { DimensionMark } from '@/components/identity/Marks';
import { Reveal, RevealLines, EASE } from '@/components/motion/Reveal';
import { hasRealDescription } from '@/utils/project-display';

interface Project {
  _id: string; title: string; description: string;
  imageUrl: string; technologies: string[];
  demoUrl?: string; githubUrl?: string; category?: string;
}

interface MakerPageProps { projects: Project[]; }

const services = [
  { n: '01', titleKey: 'maker_page.service1_title', descKey: 'maker_page.service1_desc' },
  { n: '02', titleKey: 'maker_page.service2_title', descKey: 'maker_page.service2_desc' },
  { n: '03', titleKey: 'maker_page.service3_title', descKey: 'maker_page.service3_desc' },
];

const competences = [
  { n: '01', catKey: 'maker_page.cat1', itemsKey: 'maker_page.items1' },
  { n: '02', catKey: 'maker_page.cat2', itemsKey: 'maker_page.items2' },
  { n: '03', catKey: 'maker_page.cat3', itemsKey: 'maker_page.items3' },
  { n: '04', catKey: 'maker_page.cat4', itemsKey: 'maker_page.items4' },
];

const tools = [
  { icon: SiArduino, color: '#00979D', label: 'Arduino' },
  { icon: SiRaspberrypi, color: '#C51A4A', label: 'Raspberry Pi' },
  { icon: SiDocker, color: '#2496ED', label: 'Docker' },
  { icon: SiLinux, color: '#FCC624', label: 'Linux' },
];

export default function MakerPage({ projects = [] }: MakerPageProps) {
  const { scrollYProgress } = useScroll();
  const { t } = useTranslation('common');
  const { locale } = useRouter();

  return (
    <Layout>
      <JSONLD type="ProfessionalService" data={schemas.maker} />
      <Head>
        <title>{`${t('nav.maker')} — Portfolio`}</title>
        <meta name="description" content={t('maker_page.hero_description')} />
        <meta property="og:title" content={`${t('nav.maker')} — Portfolio`} />
        <meta property="og:description" content={t('maker_page.hero_description')} />
        <link rel="icon" href="/favicon.png" />
      </Head>

      {/* Barre de progression — trait d'atelier */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] bg-[var(--color-maker)] origin-left z-50"
        style={{ scaleX: scrollYProgress }}
      />

      {/* ════════════ HERO — hachures de schéma ════════════ */}
      <section className="relative min-h-[92svh] flex flex-col justify-center pt-[7.5rem] pb-12 overflow-hidden">
        <span aria-hidden="true" className="absolute inset-0 hatch pointer-events-none" />
        <span aria-hidden="true" className="absolute right-0 top-0 h-full w-px bg-[rgb(var(--foreground-rgb))]/10 hidden lg:block" />

        <div className="relative mx-auto w-full px-[var(--container-px)] max-w-[var(--container-max)]">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-5 mb-10 border-b border-[rgb(var(--foreground-rgb))]/15">
            <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-[var(--color-maker)]">
              03 / {t('nav.maker')}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-[rgb(var(--foreground-rgb))]/60">
              {t('maker_page.hero_subtitle')}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-[var(--gutter)] gap-y-12 items-end">
            <div className="lg:col-span-8">
              <h1 className="font-display font-black text-[clamp(2.3rem,6vw,5.25rem)] leading-[0.95] tracking-[-0.05em] m-0 text-balance">
                <RevealLines delay={0.1} stagger={0.1}>
                  <span>
                    {t('maker_page.hero_title_part1')}{' '}
                    <span className="font-accent text-[1.1em] text-[var(--color-maker)]">
                      {t('maker_page.hero_title_part2')}
                    </span>
                    <span className="text-[var(--color-maker)]">.</span>
                  </span>
                </RevealLines>
              </h1>

              <Reveal delay={0.45}>
                <p className="lead max-w-[54ch] mt-9 mb-0">{t('maker_page.hero_description')}</p>
              </Reveal>

              <Reveal delay={0.55}>
                <div className="flex flex-wrap items-stretch gap-3 mt-9">
                  <Link href="/contact" className="btn btn-primary">
                    {t('maker_page.cta_start')}
                    <FiArrowUpRight className="w-4 h-4" />
                  </Link>
                  <Link href="/projects" className="btn btn-outline">
                    {t('maker_page.cta_projects')}
                  </Link>
                </div>
              </Reveal>
            </div>

            {/* Planche technique */}
            <div className="lg:col-span-4">
              <Reveal delay={0.3}>
                <figure className="m-0">
                  <div className="relative w-full aspect-[4/3] overflow-hidden border border-[rgb(var(--foreground-rgb))]/15 grain bg-[var(--color-surface)]">
                    <Image
                      src="/images/maker/Assemblage & Upgrade PC.jpg"
                      alt={t('home.univers.alt_maker')}
                      fill
                      priority
                      sizes="(max-width: 1024px) 100vw, 32vw"
                      className="object-cover grayscale contrast-[1.05] transition-all duration-1000 ease-out-expo hover:grayscale-0"
                    />
                    <span className="absolute bottom-0 left-0 flex items-center gap-2 px-3 py-2 bg-[rgb(var(--background-start-rgb))] font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-maker)] border-r border-t border-[rgb(var(--foreground-rgb))]/15">
                      <span className="w-1.5 h-1.5 bg-[var(--color-maker)]" />
                      Maker
                    </span>
                  </div>
                  <figcaption className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[rgb(var(--foreground-rgb))]/60">
                    {locale?.toUpperCase()} — Fig. 03
                  </figcaption>
                </figure>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════ 01 — SERVICES ════════════ */}
      <section className="relative border-t border-[rgb(var(--foreground-rgb))]/15">
        <div className="mx-auto w-full px-[var(--container-px)] max-w-[var(--container-max)] py-[var(--section-gap)]">
          <SectionHead
            index="01"
            kicker={t('maker_page.services_subtitle')}
            sigil={<DimensionMark dim="maker" />}
            title={t('maker_page.services_title')}
          />

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 border-t border-[rgb(var(--foreground-rgb))]/15">
            {services.map((s, i) => (
              <Reveal key={s.n} delay={i * 0.07} amount={0.3}>
                <div className={`relative h-full p-7 lg:p-8 sm:min-h-[17rem] border-b border-[rgb(var(--foreground-rgb))]/12 lg:border-b-0 group hover:bg-[var(--color-surface)] transition-colors duration-500 ease-out-expo overflow-hidden ${i % 2 === 1 ? 'sm:border-l sm:border-[rgb(var(--foreground-rgb))]/12' : ''} ${i > 0 ? 'lg:border-l lg:border-[rgb(var(--foreground-rgb))]/12' : 'lg:border-l-0'}`}>
                  <span aria-hidden="true" className="absolute inset-0 hatch opacity-60 pointer-events-none transition-opacity duration-700 group-hover:opacity-100" />
                  <div className="relative flex items-start justify-between mb-8">
                    <span className="index-num text-[var(--color-maker)]">{s.n}</span>
                    <span className="w-6 h-px bg-[var(--color-maker)] mt-2" />
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

      {/* ════════════ 02 — COMPÉTENCES ════════════ */}
      <section className="relative border-t border-[rgb(var(--foreground-rgb))]/15">
        <div className="mx-auto w-full px-[var(--container-px)] max-w-[var(--container-max)] py-[var(--section-gap)]">
          <SectionHead
            index="02"
            kicker={t('maker_page.competences_subtitle')}
            title={t('maker_page.competences_title')}
          />

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-t border-l border-[rgb(var(--foreground-rgb))]/12">
            {competences.map((cat, i) => {
              const items = t(cat.itemsKey, { returnObjects: true }) as string[];
              return (
                <Reveal key={cat.n} delay={i * 0.06} amount={0.3}>
                  <div className="group h-full p-6 sm:p-7 border-r border-b border-[rgb(var(--foreground-rgb))]/12 hover:bg-[var(--color-surface)] transition-colors duration-500 ease-out-expo">
                    <div className="flex items-center justify-between mb-5">
                      <span className="index-num text-[var(--color-maker)]">{cat.n}</span>
                      <span className="w-4 h-4 border border-[var(--color-maker)] transition-transform duration-500 ease-out-expo group-hover:rotate-45" />
                    </div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[rgb(var(--foreground-rgb))]/70 m-0 mb-4 pb-3 border-b border-[rgb(var(--foreground-rgb))]/12">
                      {t(cat.catKey)}
                    </p>
                    <ul className="list-none p-0 m-0">
                      {Array.isArray(items) && items.map((item, idx) => (
                        <li key={idx} className="flex items-baseline gap-3 py-1.5 text-[0.9rem] text-[rgb(var(--foreground-rgb))]/65">
                          <span className="font-mono text-[10px] tabular-nums text-[var(--color-maker)] shrink-0">
                            {String(idx + 1).padStart(2, '0')}
                          </span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              );
            })}
          </div>

          {/* Outils */}
          <div className="mt-10 pt-6 border-t border-[rgb(var(--foreground-rgb))]/15 flex flex-wrap items-center gap-x-8 gap-y-4">
            <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-[rgb(var(--foreground-rgb))]/60">
              {t('maker_page.tools_label')}
            </span>
            {tools.map((tool) => (
              <span key={tool.label} className="group flex items-center gap-2.5 cursor-default">
                <tool.icon className="w-4.5 h-4.5 opacity-55 group-hover:opacity-100 transition-opacity" style={{ color: tool.color, width: 18, height: 18 }} />
                <span className="font-mono text-[11px] tracking-[0.06em] text-[rgb(var(--foreground-rgb))]/60 group-hover:text-[rgb(var(--foreground-rgb))] transition-colors">
                  {tool.label}
                </span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ 03 — RÉALISATIONS ════════════ */}
      {projects.length > 0 && (
        <section className="relative border-t border-[rgb(var(--foreground-rgb))]/15">
          <div className="mx-auto w-full px-[var(--container-px)] max-w-[var(--container-max)] py-[var(--section-gap)]">
            <SectionHead
              index="03"
              kicker={t('maker_page.projects_subtitle')}
              title={t('maker_page.projects_title')}
              action={
                <Link href="/projects" className="link-arrow">
                  {t('projects.all')} <FiChevronRight className="w-3.5 h-3.5" />
                </Link>
              }
            />

            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-x-[var(--gutter)] gap-y-10">
              {projects.map((p, i) => (
                <motion.div
                  key={p._id}
                  initial={{ opacity: 0, y: 26 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ delay: Math.min(i * 0.07, 0.25), duration: 0.65, ease: EASE }}
                  className="group"
                >
                  <Link href="/projects" className="block">
                    <div className="relative aspect-[16/10] overflow-hidden border border-[rgb(var(--foreground-rgb))]/15 grain bg-[var(--color-surface)]">
                      <Image
                        src={p.imageUrl || '/images/default-project.svg'}
                        alt={p.title}
                        fill
                        sizes="(max-width: 640px) 100vw, 48vw"
                        className="object-cover transition-transform duration-[1200ms] ease-out-expo group-hover:scale-[1.04]"
                      />
                      <div className="absolute inset-0 bg-[rgb(var(--foreground-rgb))]/0 group-hover:bg-[rgb(var(--foreground-rgb))]/15 transition-colors duration-700" />
                      <span className="absolute top-0 left-0 px-3 py-2 bg-[rgb(var(--background-start-rgb))] font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-maker)] border-r border-b border-[rgb(var(--foreground-rgb))]/15">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                    </div>

                    <div className="mt-5 flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-[1.25rem] font-bold leading-tight tracking-[-0.025em] m-0 transition-colors duration-300 group-hover:text-[var(--color-maker)]">
                          {p.title}
                        </h3>
                        {hasRealDescription(p.description) && (
                          <p className="text-[0.9rem] leading-relaxed text-[rgb(var(--foreground-rgb))]/65 mt-2 mb-0 line-clamp-2 max-w-[44ch]">
                            {p.description}
                          </p>
                        )}
                      </div>
                      <FiArrowUpRight className="w-5 h-5 shrink-0 mt-1 text-[rgb(var(--foreground-rgb))]/60 transition-all duration-500 ease-out-expo group-hover:text-[var(--color-maker)] group-hover:-translate-y-1 group-hover:translate-x-1" />
                    </div>

                    {(p.technologies || []).length > 0 && (
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-4 pt-3 border-t border-[rgb(var(--foreground-rgb))]/10">
                        {p.technologies.slice(0, 4).map((tech, ti) => (
                          <span key={ti} className="font-mono text-[10px] uppercase tracking-[0.14em] text-[rgb(var(--foreground-rgb))]/60">
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ════════════ BANDE — CHAPITRE SUIVANT ════════════ */}
      <Link
        href="/developpeur"
        className="group block border-t border-[rgb(var(--foreground-rgb))]/15"
        aria-label={`${t('chapter.next')} — ${t('nav.developer')}`}
      >
        <div className="mx-auto w-full px-[var(--container-px)] max-w-[var(--container-max)] py-9 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-[rgb(var(--foreground-rgb))]/60">
            {t('chapter.next')}
          </span>
          <span className="flex items-center gap-3 font-display font-black text-[clamp(1.5rem,3.5vw,2.4rem)] leading-none tracking-[-0.04em] transition-colors duration-300 group-hover:text-[var(--color-dev)] group-focus-visible:text-[var(--color-dev)]">
            01 — {t('nav.developer')}
            <FiArrowUpRight className="w-5 h-5 shrink-0 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" />
          </span>
        </div>
      </Link>

      {/* ════════════ CLÔTURE ════════════ */}
      <section className="relative border-t border-[rgb(var(--foreground-rgb))]/15 bg-[var(--color-maker)] text-white overflow-hidden">
        <span aria-hidden="true" className="absolute inset-0 opacity-[0.18] pointer-events-none"
          style={{ backgroundImage: 'repeating-linear-gradient(-45deg, rgba(255,255,255,0.7) 0 1px, transparent 1px 9px)' }} />
        <div className="relative mx-auto w-full px-[var(--container-px)] max-w-[var(--container-max)] py-[var(--section-gap)]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-[var(--gutter)] gap-y-9 items-end">
            <div className="lg:col-span-8">
              <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/75 block mb-6">
                04 — {t('maker_page.tools_label')}
              </span>
              <h2 className="text-[clamp(2.1rem,5.5vw,4.5rem)] leading-[0.95] tracking-[-0.045em] m-0 text-balance text-white">
                {t('maker_page.footer_cta_title_part1')}{' '}
                <span className="font-accent text-[1.1em]">{t('maker_page.footer_cta_title_part2')}</span>
                <span className="opacity-70">.</span>
              </h2>
              <p className="text-[1.05rem] leading-[1.65] text-white/85 mt-7 mb-0 max-w-[46ch]">
                {t('maker_page.footer_cta_description')}
              </p>
            </div>
            <div className="lg:col-span-4 flex flex-col gap-3">
              <Link href="/contact" className="btn bg-white text-[var(--color-maker)] border-white hover:bg-white/90 justify-between w-full">
                {t('maker_page.cta_start')}
                <FiArrowUpRight className="w-4 h-4" />
              </Link>
              <Link href="/projects" className="btn bg-transparent text-white border-white/50 hover:bg-white/10 justify-between w-full">
                {t('projects.all_projects')}
                <FiChevronRight className="w-4 h-4" />
              </Link>
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
    const rawProjects = await ProjectModel.find({
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
