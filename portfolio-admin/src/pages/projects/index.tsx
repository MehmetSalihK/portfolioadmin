import { GetStaticProps } from 'next';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import Layout from '@/components/layout/Layout';
import JSONLD from '@/components/layout/JSONLD';
import connectDB from '@/lib/db';
import ProjectModel from '@/models/Project';
import { useMemo, useState } from 'react';
import Image from 'next/image';
import { FiArrowUpRight, FiChevronRight } from 'react-icons/fi';
import { useTranslation } from 'next-i18next/pages';
import { serverSideTranslations } from 'next-i18next/pages/serverSideTranslations';
import { useRouter } from 'next/router';
import { getLocalized } from '@/utils/i18n-utils';
import type { ModalProject } from '@/components/projects/ProjectModal';
import ProjectFacts from '@/components/projects/ProjectFacts';
import { SectionMark, CropMarks } from '@/components/identity/Marks';
import { Reveal, EASE } from '@/components/motion/Reveal';
import { hasRealDescription } from '@/utils/project-display';
import { playSfx } from '@/utils/sound';

/* Modale en chunk séparé : DOMPurify + html-react-parser hors bundle initial */
const ProjectModal = dynamic(() => import('@/components/projects/ProjectModal'), { ssr: false });

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
  githubData?: { language?: string | null; stars?: number; forks?: number; lastUpdated?: string | null };
}

interface ProjectsPageProps {
  projects: Project[];
}

const track = async (projectId: string, type: 'demo' | 'github' | 'view') => {
  try {
    await fetch('/api/projects/stats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId, type }),
    });
  } catch {}
};

/** Nombre de technologies affichées avant dépliement */
const TECH_VISIBLE = 14;

export default function ProjectsPage({ projects = [] }: ProjectsPageProps) {
  const { t } = useTranslation('common');
  const { locale } = useRouter();

  const [selectedProject, setSelectedProject] = useState<ModalProject | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [tech, setTech] = useState<string | null>(null);
  const [view, setView] = useState<'planche' | 'index'>('planche');
  const [allTechs, setAllTechs] = useState(false);

  /* Filtres déduits des catégories réelles — jamais inventés */
  const categories = useMemo(() => {
    const set = new Set<string>();
    projects.forEach(p => p.category && set.add(p.category));
    return Array.from(set);
  }, [projects]);

  /* Explorateur : fréquence réelle de chaque technologie dans l'index */
  const techIndex = useMemo(() => {
    const counts = new Map<string, number>();
    projects.forEach(p => (p.technologies || []).forEach(tech => counts.set(tech, (counts.get(tech) || 0) + 1)));
    return Array.from(counts, ([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [projects]);

  const visible = useMemo(
    () => projects.filter(p =>
      (filter === 'all' || p.category === filter) &&
      (!tech || (p.technologies || []).includes(tech))
    ),
    [projects, filter, tech]
  );

  /* Le projet « vedette » devient la planche d'ouverture (vue index) */
  const [lead, ...rest] = visible;

  const openProject = (p: Project) => {
    track(p._id, 'view');
    playSfx('gate');
    setSelectedProject(p);
  };

  /* Navigation de laboratoire : avance circulaire dans la sélection courante */
  const modalIndex = selectedProject ? visible.findIndex(p => p._id === selectedProject._id) : -1;
  const navigate = (dir: -1 | 1) => {
    if (modalIndex < 0 || visible.length < 2) return;
    const next = (modalIndex + dir + visible.length) % visible.length;
    track(visible[next]._id, 'view');
    setSelectedProject(visible[next]);
  };

  const applyCategory = (value: string) => { setFilter(value); playSfx('tick'); };
  const applyTech = (value: string) => { setTech(prev => (prev === value ? null : value)); playSfx('tick'); };
  const applyView = (value: 'planche' | 'index') => { setView(value); playSfx('tick'); };

  /* Clic sur une technologie de la modale : refermer et filtrer l'index */
  const selectTechFromModal = (value: string) => {
    setFilter('all');
    setTech(value);
    setSelectedProject(null);
    playSfx('tick');
    /* Respect de prefers-reduced-motion : sans lissage si l'utilisateur réduit les animations */
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.getElementById('index-complet')?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  };

  const dateFmt = locale === 'tr' ? 'tr-TR' : locale === 'en' ? 'en-US' : 'fr-FR';

  const techsToShow = allTechs ? techIndex : techIndex.slice(0, TECH_VISIBLE);

  const openOnKey = (p: Project) => (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openProject(p);
    }
  };

  return (
    <Layout>
      <JSONLD
        type="CollectionPage"
        data={{
          name: t('seo.projects_title'),
          description: t('seo.projects_description'),
          url: 'https://mehmetsalihk.fr/projects',
          isPartOf: { '@type': 'WebSite', name: 'MSK — Portfolio', url: 'https://mehmetsalihk.fr' },
        }}
      />
      <Head>
        <title>{t('seo.projects_title')}</title>
        <meta name="description" content={t('seo.projects_description')} />
        <meta property="og:title" content={t('seo.projects_title')} />
        <meta property="og:description" content={t('seo.projects_description')} />
        <link rel="icon" href="/favicon.png" />
      </Head>

      {/* ════════════ EN-TÊTE ════════════ */}
      <section className="relative pt-[8.5rem] pb-2">
        <div className="mx-auto w-full px-[var(--container-px)] max-w-[var(--container-max)]">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-5 mb-9 border-b border-[rgb(var(--foreground-rgb))]/15">
            <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-[rgb(var(--foreground-rgb))]/65">
              {t('nav.projects')} — {t('page_label.projects')}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-[rgb(var(--foreground-rgb))]/65 tabular-nums">
              {String(projects.length).padStart(2, '0')} {t('projects.entries')}
            </span>
          </div>

          <h1 className="font-display font-black text-[clamp(2.6rem,7.5vw,6.5rem)] leading-[0.9] tracking-[-0.05em] m-0 text-balance">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE }}
              className="block"
            >
              {t('projects.title')}
              <span className="text-[var(--accent-text)] dark:text-[var(--accent)]">.</span>
            </motion.span>
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-[var(--gutter)] gap-y-6 mt-10 mb-12">
            <p className="lg:col-span-6 lead m-0">
              {t('projects.description')}
            </p>

            {/* Filtres — carrés, monospace */}
            <div className="lg:col-span-5 lg:col-start-8 lg:pb-1">
              <div className="flex items-baseline justify-between gap-4 mb-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[rgb(var(--foreground-rgb))]/65 m-0">
                  {t('projects.filter_label')}
                </p>
                <span className="index-num tabular-nums">
                  {String(visible.length).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}
                </span>
              </div>
              <div role="group" aria-label={t('projects.filter_label')} className="flex flex-wrap gap-2">
                {[{ id: 'all', label: t('projects.filter_all') }, ...categories.map(c => ({ id: c, label: c }))].map(f => (
                  <button
                    key={f.id}
                    onClick={() => applyCategory(f.id)}
                    aria-pressed={filter === f.id}
                    className={`pill pill-filter ${filter === f.id ? 'bg-[rgb(var(--foreground-rgb))] text-[rgb(var(--background-start-rgb))] border-[rgb(var(--foreground-rgb))]' : ''}`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Explorateur de technologies — fréquences réelles de l'index */}
              {techIndex.length > 0 && (
                <>
                  <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[rgb(var(--foreground-rgb))]/65 mt-7 mb-3 m-0">
                    {t('lab.tech_label')}
                  </p>
                  <div role="group" aria-label={t('lab.tech_label')} className="flex flex-wrap gap-2">
                    {techsToShow.map(tc => (
                      <button
                        key={tc.name}
                        onClick={() => applyTech(tc.name)}
                        aria-pressed={tech === tc.name}
                        className={`pill pill-filter gap-2 ${tech === tc.name ? 'bg-[rgb(var(--foreground-rgb))] text-[rgb(var(--background-start-rgb))] border-[rgb(var(--foreground-rgb))]' : ''}`}
                      >
                        {tc.name}
                        <span className={`tabular-nums ${tech === tc.name ? 'opacity-70' : 'opacity-55'}`}>
                          {String(tc.count).padStart(2, '0')}
                        </span>
                      </button>
                    ))}
                    {techIndex.length > TECH_VISIBLE && (
                      <button
                        onClick={() => setAllTechs(v => !v)}
                        aria-expanded={allTechs}
                        className="pill pill-filter"
                      >
                        {allTechs ? '−' : `+${techIndex.length - TECH_VISIBLE}`}
                      </button>
                    )}
                  </div>
                </>
              )}

              {/* Annonce polie du résultat de filtrage */}
              <p role="status" className="sr-only">
                {t('lab.showing')} : {visible.length} / {projects.length}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════ PLANCHE DE TÊTE (vue index) ════════════ */}
      {view === 'index' && lead && (
        <section className="relative">
          <div className="mx-auto w-full px-[var(--container-px)] max-w-[var(--container-max)]">
            <motion.article
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: EASE }}
              onClick={() => openProject(lead)}
              role="button"
              tabIndex={0}
              aria-label={`${lead.title} — ${t('projects.view_project')}`}
              onKeyDown={openOnKey(lead)}
              className="group cursor-pointer border-t border-[rgb(var(--foreground-rgb))]/20 pt-8"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-[var(--gutter)] gap-y-7 items-start">
                {/* Mobile : l'image d'abord — l'ancre visuelle de la page */}
                <div className="lg:col-span-8 order-1 lg:order-1">
                  <div className="relative">
                    <div className="relative w-full aspect-[16/9] overflow-hidden border border-[rgb(var(--foreground-rgb))]/15 grain bg-[var(--color-surface)]">
                      <Image
                        src={lead.imageUrl || '/images/default-project.svg'}
                        alt={lead.title}
                        fill
                        sizes="(max-width: 1024px) 100vw, 62vw"
                        priority
                        className="object-cover transition-transform duration-[1400ms] ease-out-expo group-hover:scale-[1.04]"
                      />
                      <div className="absolute inset-0 bg-[rgb(var(--foreground-rgb))]/0 group-hover:bg-[rgb(var(--foreground-rgb))]/15 transition-colors duration-700" />
                      {lead.featured && (
                        <span className="absolute top-0 left-0 px-3 py-2 bg-[var(--accent)] text-[#14130f] font-mono text-[10px] font-semibold uppercase tracking-[0.18em] border-r border-b border-[rgb(var(--background-start-rgb))]/30">
                          {t('projects.featured')}
                        </span>
                      )}
                    </div>
                    <CropMarks className="opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-300" />
                  </div>
                </div>

                <div className="lg:col-span-4 order-2 lg:order-2 lg:sticky lg:top-28">
                  <span className="index-num text-[var(--accent-text)] dark:text-[var(--accent)]">
                    01 / {String(visible.length).padStart(2, '0')}
                  </span>

                  <h2 className="text-[clamp(1.75rem,3.6vw,3rem)] font-black leading-[0.98] tracking-[-0.04em] mt-5 mb-5 text-balance transition-colors duration-300 group-hover:text-[var(--accent-text)] dark:group-hover:text-[var(--accent)]">
                    {lead.title}
                  </h2>

                  {hasRealDescription(lead.description) && (
                    <p className="text-[0.975rem] leading-[1.65] text-[rgb(var(--foreground-rgb))]/70 m-0 max-w-[44ch]">
                      {lead.description}
                    </p>
                  )}

                  {(lead.technologies || []).length > 0 && (
                    <ul className="list-none p-0 m-0 mt-7 border-t border-[rgb(var(--foreground-rgb))]/12">
                      {lead.technologies.slice(0, 5).map((item, i) => (
                        <li key={i} className="flex items-center gap-3 py-2 border-b border-[rgb(var(--foreground-rgb))]/10">
                          <span className="font-mono text-[10px] tabular-nums text-[rgb(var(--foreground-rgb))]/65">
                            {String(i + 1).padStart(2, '0')}
                          </span>
                          <span className="text-[0.9rem] text-[rgb(var(--foreground-rgb))]/75">{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  <ProjectFacts githubData={lead.githubData} className="mt-7 border-t border-[rgb(var(--foreground-rgb))]/12 pt-1" />

                  <span className="link-arrow mt-6 inline-flex text-[var(--accent-text)] dark:text-[var(--accent)]">
                    {t('projects.view_project')} <FiArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </motion.article>
          </div>
        </section>
      )}

      {/* ════════════ INDEX COMPLET ════════════ */}
      <section id="index-complet" className="relative scroll-mt-24">
        <div className="mx-auto w-full px-[var(--container-px)] max-w-[var(--container-max)] py-[var(--section-gap)]">
          <div className="flex items-center gap-4 mb-8">
            <SectionMark name="projects" size={18} className="text-[rgb(var(--foreground-rgb))]/75" />
            <span className="kicker kicker--plain">{t('projects.all_projects')}</span>
            <span className="h-px flex-1 bg-[rgb(var(--foreground-rgb))]/12" />

            {/* Bascule de vue : planche-contact ou index éditorial */}
            <div role="group" aria-label={t('lab.view_label')} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => applyView('planche')}
                aria-pressed={view === 'planche'}
                className={`pill pill-filter ${view === 'planche' ? 'bg-[rgb(var(--foreground-rgb))] text-[rgb(var(--background-start-rgb))] border-[rgb(var(--foreground-rgb))]' : ''}`}
              >
                {t('lab.view_planche')}
              </button>
              <button
                type="button"
                onClick={() => applyView('index')}
                aria-pressed={view === 'index'}
                className={`pill pill-filter ${view === 'index' ? 'bg-[rgb(var(--foreground-rgb))] text-[rgb(var(--background-start-rgb))] border-[rgb(var(--foreground-rgb))]' : ''}`}
              >
                {t('lab.view_index')}
              </button>
            </div>
          </div>

          {visible.length === 0 ? (
            <div className="border-t border-[rgb(var(--foreground-rgb))]/15 pt-10">
              <p className="font-mono text-[12px] uppercase tracking-[0.16em] text-[rgb(var(--foreground-rgb))]/65">
                — {t('projects.empty')}
              </p>
            </div>
          ) : view === 'planche' ? (
            /* ── Planche-contact : chaque projet est une case exposée ── */
            <div className="border-t border-[rgb(var(--foreground-rgb))]/15 pt-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-[var(--gutter)] gap-y-10 sm:gap-y-12">
                <AnimatePresence mode="popLayout" initial={false}>
                  {visible.map((project, index) => (
                    <motion.article
                      key={project._id}
                      layout
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.45, ease: EASE, delay: Math.min(index * 0.015, 0.18) }}
                      role="button"
                      tabIndex={0}
                      aria-label={`${project.title} — ${t('projects.view_project')}`}
                      onClick={() => openProject(project)}
                      onKeyDown={openOnKey(project)}
                      className="group cursor-pointer"
                    >
                      <div className="relative">
                        <div className="relative w-full aspect-[4/3] overflow-hidden border border-[rgb(var(--foreground-rgb))]/15 grain bg-[var(--color-surface)]">
                          <Image
                            src={project.imageUrl || '/images/default-project.svg'}
                            alt={project.title}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover grayscale contrast-[1.04] transition-all duration-700 ease-out-expo group-hover:grayscale-0 group-hover:scale-[1.03]"
                          />
                          <div className="absolute inset-0 bg-[rgb(var(--foreground-rgb))]/0 group-hover:bg-[rgb(var(--foreground-rgb))]/12 transition-colors duration-700" />

                          <span className="absolute top-0 left-0 px-2.5 py-1.5 bg-[rgb(var(--background-start-rgb))] font-mono text-[10px] uppercase tracking-[0.18em] text-[rgb(var(--foreground-rgb))]/70 border-r border-b border-[rgb(var(--foreground-rgb))]/15 tabular-nums">
                            {String(index + 1).padStart(2, '0')}
                            {project.featured && <span className="text-[var(--accent-text)] dark:text-[var(--accent)]"> · {t('projects.featured')}</span>}
                          </span>

                          {/* Relevé au survol : la stack réelle, glissée sous le cadre */}
                          {(project.technologies || []).length > 0 && (
                            <span className="absolute inset-x-0 bottom-0 hidden sm:flex flex-wrap gap-x-3 gap-y-1 px-3 py-2.5 bg-[rgb(var(--background-start-rgb))]/95 backdrop-blur-sm border-t border-[rgb(var(--foreground-rgb))]/15 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 transition-all duration-500 ease-out-expo">
                              {project.technologies.slice(0, 4).map((item, ti) => (
                                <span key={ti} className="font-mono text-[10px] uppercase tracking-[0.14em] text-[rgb(var(--foreground-rgb))]/70">
                                  {item}
                                </span>
                              ))}
                            </span>
                          )}
                        </div>
                        <CropMarks className="opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-300" />
                      </div>

                      <div className="mt-4 flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <h3 className="text-[1.15rem] sm:text-[1.3rem] font-bold leading-tight tracking-[-0.025em] m-0 transition-colors duration-300 group-hover:text-[var(--accent-text)] dark:group-hover:text-[var(--accent)]">
                            {project.title}
                          </h3>
                          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[rgb(var(--foreground-rgb))]/65 mt-2 mb-0">
                            {project.category || '—'}
                            {project.demoUrl && (
                              <span className="text-[var(--accent-text)] dark:text-[var(--accent)]"> · {t('projects.live_demo')}</span>
                            )}
                          </p>
                        </div>
                        <FiArrowUpRight className="block w-5 h-5 shrink-0 mt-1 text-[rgb(var(--foreground-rgb))]/60 transition-all duration-500 ease-out-expo group-hover:text-[var(--accent)] group-hover:-translate-y-1 group-hover:translate-x-1" />
                      </div>
                    </motion.article>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          ) : (
            /* ── Index éditorial : rangées numérotées ── */
            <div className="border-t border-[rgb(var(--foreground-rgb))]/15">
              {rest.map((project, index) => (
                <Reveal key={project._id} delay={Math.min(index * 0.05, 0.25)} amount={0.3}>
                  <article
                    onClick={() => openProject(project)}
                    role="button"
                    tabIndex={0}
                    aria-label={`${project.title} — ${t('projects.view_project')}`}
                    onKeyDown={openOnKey(project)}
                    className="group grid grid-cols-1 lg:grid-cols-12 gap-x-[var(--gutter)] gap-y-4 items-center py-7 border-b border-[rgb(var(--foreground-rgb))]/12 hover:bg-[var(--color-surface)] transition-colors duration-500 ease-out-expo -mx-3 px-3 cursor-pointer"
                  >
                    <div className="lg:col-span-1 order-1">
                      <span className="index-num text-[var(--accent-text)] dark:text-[var(--accent)] tabular-nums">
                        {String(index + 2).padStart(2, '0')}
                      </span>
                    </div>

                    <div className="lg:col-span-4 order-3 lg:order-2">
                      <h3 className="text-[1.35rem] sm:text-[1.6rem] font-bold leading-tight tracking-[-0.03em] m-0 transition-transform duration-500 ease-out-expo group-hover:translate-x-2">
                        {project.title}
                      </h3>
                      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[rgb(var(--foreground-rgb))]/65 mt-2 mb-0">
                        {project.category || '—'}
                        {project.demoUrl && (
                          <span className="text-[var(--accent-text)] dark:text-[var(--accent)]"> · {t('projects.live_demo')}</span>
                        )}
                        {project.featured && (
                          <span className="text-[var(--accent-text)] dark:text-[var(--accent)]"> · {t('projects.featured')}</span>
                        )}
                      </p>
                    </div>

                    <p
                      className={`lg:col-span-4 order-4 lg:order-3 m-0 line-clamp-2 max-w-[46ch] ${
                        hasRealDescription(project.description)
                          ? 'text-[0.925rem] leading-relaxed text-[rgb(var(--foreground-rgb))]/65'
                          : 'font-mono text-[11px] uppercase tracking-[0.14em] leading-relaxed text-[rgb(var(--foreground-rgb))]/65'
                      }`}
                    >
                      {hasRealDescription(project.description)
                        ? project.description
                        : (project.technologies || []).slice(0, 4).join(' · ')}
                    </p>

                    <div className="lg:col-span-3 order-2 lg:order-4 flex items-center gap-5 lg:justify-end">
                      <div className="relative w-full max-w-[160px] aspect-[3/2] overflow-hidden border border-[rgb(var(--foreground-rgb))]/15 grain bg-[var(--color-surface)]">
                        <Image
                          src={project.imageUrl || '/images/default-project.svg'}
                          alt={project.title}
                          fill
                          sizes="170px"
                          className="object-cover grayscale transition-all duration-700 ease-out-expo group-hover:grayscale-0"
                        />
                      </div>
                      {/* Flèche visible aussi au doigt */}
                      <FiArrowUpRight className="block w-5 h-5 shrink-0 text-[rgb(var(--foreground-rgb))]/60 transition-all duration-500 ease-out-expo group-hover:text-[var(--accent)] group-hover:-translate-y-1 group-hover:translate-x-1" />
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          )}

          {/* Filet de fin */}
          <div className="mt-16 flex items-center gap-4">
            <span className="index-num tabular-nums">
              {String(visible.length).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}
            </span>
            <span className="h-px flex-1 bg-[rgb(var(--foreground-rgb))]/12" />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[rgb(var(--foreground-rgb))]/65">
              {locale?.toUpperCase()}
            </span>
          </div>
        </div>
      </section>

      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
        position={modalIndex >= 0 ? { index: modalIndex, total: visible.length } : undefined}
        onPrev={modalIndex >= 0 ? () => navigate(-1) : undefined}
        onNext={modalIndex >= 0 ? () => navigate(1) : undefined}
        onTechSelect={selectTechFromModal}
      />
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const currentLocale = locale || 'fr';
  try {
    await connectDB();
    const rawProjects = await ProjectModel.find({ archived: { $ne: true } })
      .sort({ featured: -1, order: 1, createdAt: -1 })
      /* `stats` (clickHistory/dailyStats, sans borne) inutile au rendu public */
      .select('-stats -__v')
      .lean();

    const localizedProjects = rawProjects.map((p: any) => ({
      ...p,
      title: getLocalized(p, 'title', currentLocale),
      description: getLocalized(p, 'description', currentLocale),
      _id: p._id.toString(),
    }));

    return {
      props: {
        projects: JSON.parse(JSON.stringify(localizedProjects)),
        ...(await serverSideTranslations(currentLocale, ['common'])),
      },
      revalidate: 60,
    };
  } catch (error) {
    console.error('Error in getStaticProps:', error);
    return {
      props: {
        projects: [],
        ...(await serverSideTranslations(currentLocale, ['common'])),
      },
      revalidate: 60,
    };
  }
};
