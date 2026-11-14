import { motion } from 'framer-motion';
import Head from 'next/head';
import { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next/pages';
import { serverSideTranslations } from 'next-i18next/pages/serverSideTranslations';
import Layout from '@/components/layout/Layout';
import connectDB from '@/lib/db';
import ProjectModel from '@/models/Project';
import ExperienceModel from '@/models/Experience';
import SettingModel from '@/models/Setting';
import { useRouter } from 'next/router';
import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { FiArrowUpRight, FiChevronRight, FiDownload } from 'react-icons/fi';
import { FaGithub, FaLinkedin, FaTwitter } from 'react-icons/fa';
import { SiNextdotjs, SiReact, SiNodedotjs, SiMongodb, SiTypescript } from 'react-icons/si';
import Image from 'next/image';
import Link from 'next/link';
import SkillsSection from '@/components/home/SkillsSection';
import JSONLD, { schemas } from '@/components/layout/JSONLD';
import { getLocalized } from '@/utils/i18n-utils';
import type { ModalProject } from '@/components/projects/ProjectModal';
import SectionHead from '@/components/ui/SectionHead';
import { Reveal, RevealWords, DrawRule, EASE } from '@/components/motion/Reveal';
import { SectionMark, DimensionMark, CropMarks } from '@/components/identity/Marks';
import { hasRealDescription } from '@/utils/project-display';

/* Modales : jamais dans le bundle initial (DOMPurify, html-react-parser,
   headlessui) — le chunk part à la première ouverture, sans SSR */
const ProjectModal = dynamic(() => import('@/components/projects/ProjectModal'), { ssr: false });
const CVModal = dynamic(() => import('@/components/modals/CVModal'), { ssr: false });

interface Project {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  technologies: string[];
  demoUrl?: string;
  githubUrl?: string;
  featured?: boolean;
  gallery?: string[];
  category?: string;
}

interface Experience {
  _id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate?: string | null;
  description: string;
  technologies: string[];
}

interface HomePageProps {
  projects: Project[];
  experiences: Experience[];
  homeData: {
    title: string;
    subtitle: string;
    aboutTitle: string;
    aboutText: string;
    navigation: { about: string; projects: string; experience: string; contact: string };
    contactInfo: { email: string; phone: string; location: string };
    footer: { copyright: string; description: string };
    socialLinks: { github: string; linkedin: string; twitter: string; whatsapp: string; telegram: string };
  };
  settings: { email: string; linkedin: string; phone: string; position?: string };
  skillsByCategory: Array<{
    _id: string; name: string; displayOrder: number;
    skills: Array<{ _id: string; name: string; categoryId: { name: string; _id: string }; displayOrder: number }>;
  }>;
  seoData?: { title?: string; description?: string; keywords?: string[]; ogImage?: string };
}

const defaultHomeData = {
  _id: 'default', __v: 0,
  title: 'Portfolio Professionnel',
  subtitle: "J'écris du code, je fais des images, je répare des machines. Trois métiers sur un même établi — et toujours la même méthode : comprendre comment ça marche, puis le faire marcher.",
  aboutTitle: 'À propos',
  aboutText: "Développeur Full Stack : de l'interface à la base de données, en passant par l'API.",
  navigation: { about: 'À propos', projects: 'Projets', experience: 'Expérience', contact: 'Contact' },
  contactInfo: { email: 'contact@mehmetsalihk.fr', phone: '+33 X XX XX XX XX', location: 'France' },
  footer: { copyright: '© 2024 MSK.', description: "Développeur Full Stack." },
  socialLinks: { github: 'https://github.com/mehmetsalihk', linkedin: 'https://www.linkedin.com/in/mehmetsalihk/', twitter: '', whatsapp: '', telegram: '' }
};

export default function Home({
  projects, experiences, homeData = defaultHomeData, skillsByCategory, settings, seoData
}: HomePageProps) {
  const { t } = useTranslation('common');
  const { locale } = useRouter();

  const [selectedProject, setSelectedProject] = useState<ModalProject | null>(null);
  const [isCVModalOpen, setIsCVModalOpen] = useState(false);
  const [cvAvailable, setCvAvailable] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/cv/status')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (!cancelled && d) setCvAvailable(Boolean(d.available)); })
      .catch(() => { /* CV considéré indisponible en cas d'erreur */ });
    return () => { cancelled = true; };
  }, []);

  /* Lumière de table : un halo vermillon suit le curseur dans le hero,
     comme une lampe sous la feuille. Décoratif, pointer:fine seulement,
     jamais attaché sous prefers-reduced-motion. */
  const heroRef = useRef<HTMLElement | null>(null);
  const lightRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const sec = heroRef.current;
    const light = lightRef.current;
    if (!sec || !light) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        const r = sec.getBoundingClientRect();
        light.style.setProperty('--lx', `${e.clientX - r.left}px`);
        light.style.setProperty('--ly', `${e.clientY - r.top}px`);
        light.classList.add('table-light--on');
      });
    };
    sec.addEventListener('pointermove', onMove);
    return () => {
      sec.removeEventListener('pointermove', onMove);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  const featured = projects
    .slice()
    .sort((a, b) => (a.featured && !b.featured ? -1 : !a.featured && b.featured ? 1 : 0))
    .slice(0, 3);

  const univers = [
    {
      key: '01',
      href: '/developpeur',
      dim: 'dev' as const,
      label: t('home.univers.dev_label'),
      title: t('home.univers.dev_title'),
      desc: t('home.univers.dev_desc'),
      image: '/images/developpeur/codage.jpg',
      alt: t('home.univers.alt_dev'),
    },
    {
      key: '02',
      href: '/designer',
      dim: 'creative' as const,
      label: t('home.univers.creative_label'),
      title: t('home.univers.creative_title'),
      desc: t('home.univers.creative_desc'),
      image: '/images/designer/camera.jpg',
      alt: t('home.univers.alt_creative'),
    },
    {
      key: '03',
      href: '/maker',
      dim: 'maker' as const,
      label: t('home.univers.maker_label'),
      title: t('home.univers.maker_title'),
      desc: t('home.univers.maker_desc'),
      image: '/images/maker/Assemblage & Upgrade PC.jpg',
      alt: t('home.univers.alt_maker'),
    },
  ];

  const stack = [
    { icon: SiNextdotjs, label: 'Next.js' },
    { icon: SiReact, label: 'React' },
    { icon: SiNodedotjs, label: 'Node.js' },
    { icon: SiMongodb, label: 'MongoDB' },
    { icon: SiTypescript, label: 'TypeScript' },
  ];

  const socials = [
    { icon: FaGithub, href: homeData.socialLinks.github, label: 'GitHub' },
    { icon: FaLinkedin, href: homeData.socialLinks.linkedin, label: 'LinkedIn' },
    { icon: FaTwitter, href: homeData.socialLinks.twitter, label: 'Twitter' },
  ].filter(s => s.href);

  const dateFmt = locale === 'tr' ? 'tr-TR' : locale === 'en' ? 'en-US' : 'fr-FR';
  const formatRange = (exp: Experience) => {
    const start = new Date(exp.startDate).toLocaleDateString(dateFmt, { month: 'short', year: 'numeric' });
    const end = exp.endDate
      ? new Date(exp.endDate).toLocaleDateString(dateFmt, { month: 'short', year: 'numeric' })
      : t('experience.present');
    return `${start} — ${end}`;
  };

  /* Largeurs asymétriques : rythme éditorial plutôt que grille égale */
  const spans = ['lg:col-span-7', 'lg:col-span-5', 'lg:col-span-12'];
  const ratios = ['aspect-[4/3]', 'aspect-[4/3]', 'aspect-[16/7]'];

  return (
    <Layout>
      <JSONLD type="Person" data={schemas.me} />
      <Head>
        <title>{seoData?.title || t('seo.home_title')}</title>
        <meta name="description" content={seoData?.description || t('seo.home_description')} />
        <meta property="og:title" content={seoData?.title || t('seo.home_title')} />
        <meta property="og:description" content={seoData?.description || t('seo.home_description')} />
        {seoData?.keywords && seoData.keywords.length > 0 && (
          <meta name="keywords" content={seoData.keywords.join(', ')} />
        )}
        <link rel="icon" href="/favicon.png" />
      </Head>

      {/* ════════════ HERO — masthead éditorial ════════════ */}
      <section ref={heroRef} className="relative min-h-[92svh] flex flex-col justify-center pt-[6.5rem] pb-10">
        {/* Trame millimétrée : la table lumineuse sous la feuille */}
        <div aria-hidden="true" className="absolute inset-0 grid-lines pointer-events-none" />
        {/* La lampe : halo qui suit le curseur (décoratif) */}
        <div ref={lightRef} aria-hidden="true" className="table-light pointer-events-none" />
        <div className="relative mx-auto w-full px-[var(--container-px)] max-w-[var(--container-max)]">

          {/* Ligne de métadonnées */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-wrap items-center justify-between gap-3 pb-5 mb-10 border-b border-[rgb(var(--foreground-rgb))]/15"
          >
            {/* Pile technique masquée sous sm : 3 lignes de 10px au-dessus
                du titre écrasaient le hero à 390px */}
            <span className="hidden sm:inline font-mono text-[10px] uppercase tracking-[0.24em] text-[rgb(var(--foreground-rgb))]/60">
              MSK — {t('hero.stack')} · {stack.map(s => s.label).join(' / ')}
            </span>
            <span className="flex items-center gap-2.5 font-mono text-[10px] uppercase tracking-[0.24em] text-[rgb(var(--foreground-rgb))]/60">
              <motion.span
                className="w-1.5 h-1.5 bg-[var(--accent)]"
                animate={{ opacity: [1, 0.25, 1] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
              />
              {t('hero.status')}
            </span>
          </motion.div>

          {/* Titre display — révélation mot à mot, deux plans successifs */}
          <h1 className="font-display font-black text-[clamp(2.6rem,7.4vw,6.75rem)] leading-[0.92] tracking-[-0.05em] m-0 text-balance">
            <RevealWords
              delay={0.15}
              segments={[
                { text: `${t('hero.title_part1')} ${t('hero.title_part2')}` },
                { text: ',', glue: 'none', className: 'text-[var(--accent-text)] dark:text-[var(--accent)]' },
              ]}
            />
            <RevealWords
              delay={0.44}
              segments={[
                { text: t('hero.title_part3') },
                {
                  text: t('hero.title_part4'),
                  className: 'font-accent text-[1.1em] text-[var(--accent-text)] dark:text-[var(--accent)]',
                },
                { text: '.', glue: 'none', className: 'text-[var(--accent-text)] dark:text-[var(--accent)]' },
              ]}
            />
          </h1>

          {/* Le filet d'exposition se trace sous le titre */}
          <DrawRule accent delay={0.6} className="mt-9" />

          {/* Sous-titre + fiche technique */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-[var(--gutter)] gap-y-10 mt-12">
            <div className="lg:col-span-6">
              <Reveal delay={0.45}>
                <p className="lead max-w-[46ch]">
                  {homeData?.subtitle || t('hero.description')}
                </p>
              </Reveal>

              <Reveal delay={0.55}>
                <div className="flex flex-wrap items-stretch gap-3 mt-8">
                  <Link href="/projects" className="btn btn-primary">
                    {t('hero.cta')}
                    <FiArrowUpRight className="w-4 h-4" />
                  </Link>
                  {cvAvailable && (
                    <button onClick={() => setIsCVModalOpen(true)} className="btn btn-outline">
                      <FiDownload className="w-4 h-4" />
                      {t('hero.cv')}
                    </button>
                  )}
                </div>
              </Reveal>
            </div>

            {/* Colonne spec : rôle + réseaux */}
            <div className="lg:col-span-5 lg:col-start-8">
              <Reveal delay={0.6}>
                <div className="border-t border-[rgb(var(--foreground-rgb))]/15 pt-5">
                  <div className="flex items-baseline gap-4 py-2.5 border-b border-[rgb(var(--foreground-rgb))]/10">
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[rgb(var(--foreground-rgb))]/60 w-24 shrink-0">
                      {t('hero.role_label')}
                    </span>
                    <span className="text-[0.95rem] text-[rgb(var(--foreground-rgb))]/85">{t('home.role_line')}</span>
                  </div>

                  {socials.map((s) => (
                    <a
                      key={s.label}
                      href={s.href!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-4 py-2.5 border-b border-[rgb(var(--foreground-rgb))]/10"
                    >
                      <s.icon className="w-4 h-4 text-[rgb(var(--foreground-rgb))]/60 transition-colors group-hover:text-[var(--accent-text)] dark:group-hover:text-[var(--accent)]" />
                      <span className="text-[0.95rem] text-[rgb(var(--foreground-rgb))]/70 group-hover:text-[rgb(var(--foreground-rgb))] transition-colors">
                        {s.label}
                      </span>
                      <FiArrowUpRight className="ml-auto w-3.5 h-3.5 hover-reveal text-[rgb(var(--foreground-rgb))]/60 group-hover:text-[var(--accent)] dark:group-hover:text-[var(--accent)] group-hover:translate-x-0" />
                    </a>
                  ))}
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════ 01 — TROIS UNIVERS ════════════ */}
      <section className="relative border-t border-[rgb(var(--foreground-rgb))]/15">
        <div className="mx-auto w-full px-[var(--container-px)] max-w-[var(--container-max)] py-[var(--section-gap)]">
          <SectionHead
            index="01"
            kicker={t('home.univers_kicker')}
            sigil={<SectionMark name="univers" />}
            title={
              <>
                {t('home.univers.dev_title')}, {t('home.univers.creative_title')}{' '}
                <span className="font-accent text-[1.08em]">&</span> {t('home.univers.maker_title')}
              </>
            }
          />

          <div className="mt-12 border-t border-[rgb(var(--foreground-rgb))]/15">
            {univers.map((u, i) => (
              <Reveal key={u.key} delay={i * 0.06} amount={0.35}>
                <Link
                  href={u.href}
                  className="group grid grid-cols-1 lg:grid-cols-12 gap-x-[var(--gutter)] gap-y-4 items-center py-7 lg:py-8 border-b border-[rgb(var(--foreground-rgb))]/12 hover:bg-[var(--color-surface)] transition-colors duration-500 ease-out-expo -mx-3 px-3"
                >
                  <div className="lg:col-span-1 order-1">
                    <span className="index-num text-[var(--accent-text)] dark:text-[var(--accent)]">{u.key}</span>
                  </div>

                  <div className="lg:col-span-4 order-3 lg:order-2">
                    <span className="flex items-center gap-2.5 mb-2">
                      <DimensionMark dim={u.dim} size={16} className="text-[rgb(var(--foreground-rgb))]/75" />
                      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[rgb(var(--foreground-rgb))]/65">
                        {u.label}
                      </span>
                    </span>
                    <h3 className="text-[clamp(1.75rem,3.4vw,2.75rem)] font-black leading-none tracking-[-0.04em] m-0 transition-transform duration-500 ease-out-expo group-hover:translate-x-2">
                      {u.title}
                    </h3>
                  </div>

                  <p className="lg:col-span-4 order-4 lg:order-3 text-[0.95rem] leading-relaxed text-[rgb(var(--foreground-rgb))]/60 m-0 max-w-[42ch]">
                    {u.desc}
                  </p>

                  <div className="lg:col-span-3 order-2 lg:order-4 flex items-center gap-4 lg:justify-end">
                    <div className="relative w-full max-w-[190px]">
                      <div className="relative w-full aspect-[3/2] overflow-hidden border border-[rgb(var(--foreground-rgb))]/15 grain">
                        <Image
                          src={u.image}
                          alt={u.alt}
                          fill
                          sizes="200px"
                          className="object-cover grayscale contrast-[1.05] transition-all duration-700 ease-out-expo group-hover:grayscale-0 group-hover:scale-105"
                        />
                      </div>
                      {/* Repères de coupe : se posent au survol comme au focus */}
                      <CropMarks className="opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-300" />
                    </div>
                    {/* Flèche visible aussi au doigt (l'indice de tappable ne doit pas dépendre du survol) */}
                    <FiArrowUpRight className="block w-5 h-5 shrink-0 text-[rgb(var(--foreground-rgb))]/60 transition-all duration-500 ease-out-expo group-hover:text-[var(--accent)] group-hover:-translate-y-1 group-hover:translate-x-1" />
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ 02 — RÉALISATIONS ════════════ */}
      <section id="projects" className="relative border-t border-[rgb(var(--foreground-rgb))]/15">
        <div className="mx-auto w-full px-[var(--container-px)] max-w-[var(--container-max)] py-[var(--section-gap)]">
          <SectionHead
            index="02"
            kicker={t('projects.subtitle')}
            sigil={<SectionMark name="projects" />}
            title={
              <>
                {t('projects.hero_title_part1')}{' '}
                <span className="font-accent text-[1.08em]">{t('projects.hero_title_part2')}</span>
              </>
            }
            action={
              <Link href="/projects" className="link-arrow">
                {t('projects.view_all')} <FiChevronRight className="w-3.5 h-3.5" />
              </Link>
            }
          />

          {featured.length === 0 ? (
            <div className="mt-14 border-t border-[rgb(var(--foreground-rgb))]/15 pt-10">
              <p className="font-mono text-[12px] uppercase tracking-[0.16em] text-[rgb(var(--foreground-rgb))]/60">
                — {t('projects.empty')}
              </p>
            </div>
          ) : (
            <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-x-[var(--gutter)] gap-y-14">
              {featured.map((project, index) => (
                <motion.article
                  key={project._id}
                  initial={{ opacity: 0, y: 32 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ duration: 0.7, delay: Math.min(index * 0.08, 0.24), ease: EASE }}
                  className={`${spans[index] || 'lg:col-span-6'} group cursor-pointer`}
                  onClick={() => setSelectedProject(project)}
                  /* Carte interactive : ouvrable au clavier comme au pointeur */
                  role="button"
                  tabIndex={0}
                  aria-label={`${project.title} — ${t('projects.view_project')}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedProject(project);
                    }
                  }}
                >
                  <div className={`relative w-full ${ratios[index] || 'aspect-[4/3]'} overflow-hidden border border-[rgb(var(--foreground-rgb))]/15 grain bg-[var(--color-surface)]`}>
                    <Image
                      src={project.imageUrl || '/images/default-project.svg'}
                      alt={project.title}
                      fill
                      sizes={index === 2 ? '(max-width: 1024px) 100vw, 90vw' : '(max-width: 1024px) 100vw, 45vw'}
                      className="object-cover transition-transform duration-[1200ms] ease-out-expo group-hover:scale-[1.04]"
                    />
                    <div className="absolute inset-0 bg-[rgb(var(--foreground-rgb))]/0 group-hover:bg-[rgb(var(--foreground-rgb))]/15 transition-colors duration-700" />

                    <span className="absolute top-0 left-0 px-3 py-2 bg-[rgb(var(--background-start-rgb))] font-mono text-[10px] uppercase tracking-[0.18em] text-[rgb(var(--foreground-rgb))]/70 border-r border-b border-[rgb(var(--foreground-rgb))]/15">
                      {String(index + 1).padStart(2, '0')}
                      {project.featured && <span className="text-[var(--accent-text)] dark:text-[var(--accent)]"> · {t('projects.featured')}</span>}
                    </span>
                  </div>

                  <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-x-[var(--gutter)] gap-y-3">
                    <div className="lg:col-span-7">
                      <h3 className="text-[1.4rem] sm:text-[1.7rem] font-bold leading-tight tracking-[-0.03em] m-0 transition-colors duration-300 group-hover:text-[var(--accent-text)] dark:group-hover:text-[var(--accent)]">
                        {project.title}
                      </h3>
                      {hasRealDescription(project.description) && (
                        <p className="text-[0.95rem] leading-relaxed text-[rgb(var(--foreground-rgb))]/60 mt-2 mb-0 line-clamp-2 max-w-[54ch]">
                          {project.description}
                        </p>
                      )}
                    </div>

                    <div className="lg:col-span-5 lg:text-right">
                      <div className="flex flex-wrap lg:justify-end gap-x-4 gap-y-1">
                        {(project.technologies || []).slice(0, 4).map((tech, ti) => (
                          <span key={ti} className="font-mono text-[10px] uppercase tracking-[0.14em] text-[rgb(var(--foreground-rgb))]/60">
                            {tech}
                          </span>
                        ))}
                      </div>
                      <span className="link-arrow mt-3 inline-flex text-[var(--accent-text)] dark:text-[var(--accent)]">
                        {t('projects.view_project')} <FiArrowUpRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ════════════ 03 — COMPÉTENCES ════════════ */}
      <div className="border-t border-[rgb(var(--foreground-rgb))]/15">
        <SkillsSection skillsByCategory={skillsByCategory} />
      </div>

      {/* ════════════ 04 — EXPÉRIENCES ════════════ */}
      <section id="experience" className="relative border-t border-[rgb(var(--foreground-rgb))]/15">
        <div className="mx-auto w-full px-[var(--container-px)] max-w-[var(--container-max)] py-[var(--section-gap)]">
          <SectionHead
            index="04"
            kicker={t('experience.subtitle')}
            sigil={<SectionMark name="experience" />}
            title={t('experience.title')}
            action={
              <Link href="/experiences" className="link-arrow">
                {t('projects.view_all')} <FiChevronRight className="w-3.5 h-3.5" />
              </Link>
            }
          />

          {experiences.length === 0 ? (
            <p className="mt-14 font-mono text-[12px] uppercase tracking-[0.16em] text-[rgb(var(--foreground-rgb))]/60">
              — {t('experience.empty')}
            </p>
          ) : (
            <div className="mt-12 border-t border-[rgb(var(--foreground-rgb))]/15">
              {experiences.slice(0, 3).map((exp, i) => (
                <Reveal key={exp._id} delay={i * 0.06} amount={0.35}>
                  <div className="group grid grid-cols-1 lg:grid-cols-12 gap-x-[var(--gutter)] gap-y-3 py-7 border-b border-[rgb(var(--foreground-rgb))]/12 hover:bg-[var(--color-surface)] transition-colors duration-500 ease-out-expo -mx-3 px-3">
                    <div className="lg:col-span-3 flex items-start gap-3">
                      <span className="index-num text-[var(--accent-text)] dark:text-[var(--accent)] tabular-nums pt-1">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="font-mono text-[12px] tracking-[0.04em] text-[rgb(var(--foreground-rgb))]/60 tabular-nums">
                        {formatRange(exp)}
                      </span>
                    </div>

                    <div className="lg:col-span-4">
                      <h3 className="text-[1.25rem] font-bold leading-tight tracking-[-0.025em] m-0">{exp.title}</h3>
                      <p className="text-[0.9rem] text-[rgb(var(--foreground-rgb))]/60 mt-1.5 mb-0">
                        {exp.company} · {exp.location}
                      </p>
                    </div>

                    <div className="lg:col-span-5">
                      <p className="text-[0.95rem] leading-relaxed text-[rgb(var(--foreground-rgb))]/65 m-0 line-clamp-3">
                        {exp.description}
                      </p>
                      {(exp.technologies || []).length > 0 && (
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
                          {exp.technologies.slice(0, 4).map((tech, ti) => (
                            <span key={ti} className="font-mono text-[10px] uppercase tracking-[0.14em] text-[rgb(var(--foreground-rgb))]/60">
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ════════════ 05 — CLÔTURE : la lumière s'éteint ════════════ */}
      <section id="contact" className="relative border-t border-[rgb(var(--foreground-rgb))]/15 encre-block">
        <div className="mx-auto w-full px-[var(--container-px)] max-w-[var(--container-max)] py-[var(--section-gap)]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-[var(--gutter)] gap-y-10 items-end">
            <div className="lg:col-span-8">
              <Reveal>
                <div className="flex items-center gap-4 mb-7">
                  <SectionMark name="contact" size={18} className="text-[rgb(var(--foreground-rgb))]/75" />
                  <span className="index-num text-[var(--accent-text)]">05</span>
                  <span className="kicker kicker--plain">{t('contact.title')}</span>
                </div>
              </Reveal>

              <h2 className="text-[clamp(2.5rem,7vw,6rem)] leading-[0.9] tracking-[-0.05em] m-0 text-balance">
                <RevealWords
                  delay={0.05}
                  segments={[
                    { text: t('home.contact_title_part1') },
                    {
                      text: t('home.contact_title_part2'),
                      className: 'font-accent text-[1.1em] text-[var(--accent-text)]',
                    },
                    { text: '.', glue: 'none', className: 'text-[var(--accent-text)]' },
                  ]}
                />
              </h2>

              <Reveal delay={0.2}>
                <p className="lead max-w-[48ch] mt-7">{t('contact.description')}</p>
              </Reveal>
            </div>

            <div className="lg:col-span-4">
              <Reveal delay={0.15}>
                <div className="flex flex-col gap-3">
                  <Link href="/contact" className="btn btn-primary justify-between w-full">
                    {t('contact.cta')}
                    <FiArrowUpRight className="w-4 h-4" />
                  </Link>
                  {cvAvailable && (
                    <button onClick={() => setIsCVModalOpen(true)} className="btn btn-outline justify-between w-full">
                      {t('contact.cv_btn')}
                      <FiDownload className="w-4 h-4" />
                    </button>
                  )}

                  {settings?.email && (
                    <a
                      href={`mailto:${settings.email}`}
                      className="mt-3 inline-flex items-center min-h-[2.75rem] self-start font-mono text-[13px] text-[rgb(var(--foreground-rgb))]/60 hover:text-[var(--accent-text)] dark:hover:text-[var(--accent)] transition-colors u-line"
                    >
                      {settings.email}
                    </a>
                  )}
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
      <CVModal isOpen={isCVModalOpen} onClose={() => setIsCVModalOpen(false)} />
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const currentLocale = locale || 'fr';
  try {
    await connectDB();

    const Maintenance = (await import('@/models/Maintenance')).default;
    const maintenanceStatus = await Maintenance.findOne().lean();
    if (maintenanceStatus && (maintenanceStatus as any).isEnabled) {
      return { redirect: { destination: '/maintenance', permanent: false } };
    }

    // Phase 3 — source unique du contenu : le document `Setting` (singleton)
    // est la vérité centrale (site + about + socials). Plus de lecture via
    // un modèle HomePage dupliqué.
    const settingsFromDB: any = await SettingModel.findOne().lean();
    const settings = settingsFromDB || { email: 'contact@mehmetsalihk.fr', linkedin: 'https://www.linkedin.com/in/mehmetsalihk' };

    const homeData: any = settingsFromDB
      ? {
          _id: (settingsFromDB as any)._id?.toString?.() ?? 'default',
          title: getLocalized(settingsFromDB, 'siteTitle', currentLocale),
          subtitle: getLocalized(settingsFromDB, 'siteDescription', currentLocale),
          aboutTitle: getLocalized(settingsFromDB, 'aboutTitle', currentLocale),
          aboutText: getLocalized(settingsFromDB, 'aboutBio', currentLocale),
          socialLinks: {
            github: settingsFromDB.github || '',
            linkedin: settingsFromDB.linkedin || '',
            twitter: settingsFromDB.twitter || '',
            whatsapp: settingsFromDB.whatsapp || '',
            telegram: settingsFromDB.telegram || '',
          },
        }
      : defaultHomeData;

    const SEO = (await import('@/models/SEO')).default;
    const seoData = await SEO.findOne({ page: 'home' }).lean();

    const projects = await ProjectModel.aggregate([
      { $match: { archived: { $ne: true }, showOnHomepage: true } },
      {
        $addFields: {
          totalClicks: {
            $add: [
              { $ifNull: ['$stats.demoClicks', 0] },
              { $ifNull: ['$stats.githubClicks', 0] },
              { $ifNull: ['$stats.views', 0] }
            ]
          }
        }
      },
      { $sort: { featured: -1, totalClicks: -1, order: 1 } },
      { $limit: 6 },
      /* Les tableaux `stats` (clickHistory/dailyStats) ne sont jamais affichés
         sur la home : on les écarte du payload statique */
      { $project: { stats: 0, __v: 0 } }
    ]);

    const rawExperiences = await ExperienceModel.find({ isVisible: { $ne: false } })
      .sort({ startDate: -1 })
      .select('title title_en title_tr company location startDate endDate description description_en description_tr technologies')
      .lean();

    const localizedHomeData = homeData ? {
      ...homeData,
      _id: (homeData as any)._id?.toString?.() ?? 'default',
    } : defaultHomeData;

    const localizedProjects = projects.map((proj: any) => ({
      ...proj,
      title: getLocalized(proj, 'title', currentLocale),
      description: getLocalized(proj, 'description', currentLocale),
      _id: proj._id.toString(),
    }));

    const localizedExperiences = rawExperiences.map((exp: any) => ({
      ...exp,
      title: getLocalized(exp, 'title', currentLocale),
      description: getLocalized(exp, 'description', currentLocale),
      _id: exp._id.toString(),
      startDate: exp.startDate.toISOString(),
      endDate: exp.endDate ? exp.endDate.toISOString() : null,
    }));

    const allCategories = await (await import('@/models/SkillCategory')).default.find({ isVisible: true }).sort('displayOrder').lean();
    const uniqueCategories = allCategories.reduce<any[]>((acc, current) => {
      const exists = acc.find((cat: any) => cat.name === current.name);
      if (!exists) acc.push(current);
      return acc;
    }, []);

    const skills = await (await import('@/models/Skill')).default.find({ isHidden: false, categoryId: { $exists: true, $ne: null } })
      .populate('categoryId')
      .lean();

    const skillsByCategory = uniqueCategories.map((category: any) => ({
      _id: category._id.toString(),
      name: category.name,
      displayOrder: category.displayOrder,
      skills: skills.filter((skill: any) =>
        skill.categoryId &&
        typeof skill.categoryId === 'object' &&
        'name' in skill.categoryId &&
        skill.categoryId.name === category.name
      ).sort((a: any, b: any) => a.displayOrder - b.displayOrder).map((s: any) => ({...s, _id: s._id.toString(), categoryId: s.categoryId._id.toString()}))
    })).sort((a: any, b: any) => a.displayOrder - b.displayOrder);

    const localizedSettings = settings ? {
      ...settings,
      position: getLocalized(settings, 'position', currentLocale),
      siteDescription: getLocalized(settings, 'siteDescription', currentLocale),
    } : settings;

    return {
      props: {
        projects: JSON.parse(JSON.stringify(localizedProjects)),
        experiences: JSON.parse(JSON.stringify(localizedExperiences)),
        homeData: JSON.parse(JSON.stringify(localizedHomeData)),
        skillsByCategory: JSON.parse(JSON.stringify(skillsByCategory)),
        settings: JSON.parse(JSON.stringify(localizedSettings)),
        seoData: seoData ? JSON.parse(JSON.stringify({ ...seoData, title: getLocalized(seoData, 'title', currentLocale), description: getLocalized(seoData, 'description', currentLocale) })) : null,
        ...(await serverSideTranslations(currentLocale, ['common'])),
      },
      revalidate: 60,
    };
  } catch (error) {
    console.error('Error in getStaticProps:', error);
    return {
      props: {
        projects: [],
        experiences: [],
        homeData: defaultHomeData,
        skillsByCategory: [],
        settings: { email: '', linkedin: '', phone: '' },
        ...(await serverSideTranslations(currentLocale, ['common'])),
      },
      revalidate: 60,
    };
  }
};
