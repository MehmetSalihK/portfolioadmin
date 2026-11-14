import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import parse from 'html-react-parser';
import DOMPurify from 'isomorphic-dompurify';
import { FiX, FiExternalLink, FiGithub, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useTranslation } from 'next-i18next/pages';
import { EASE } from '@/components/motion/Reveal';
import ProjectFacts from '@/components/projects/ProjectFacts';
import { hasRealDescription } from '@/utils/project-display';

export interface ModalProject {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  technologies?: string[];
  demoUrl?: string;
  githubUrl?: string;
  featured?: boolean;
  gallery?: string[];
  category?: string;
  githubData?: { language?: string | null; stars?: number; forks?: number; lastUpdated?: string | null };
}

interface Props {
  project: ModalProject | null;
  onClose: () => void;
  /** Navigation de laboratoire : planche suivante/précédente dans la liste filtrée */
  position?: { index: number; total: number };
  onPrev?: () => void;
  onNext?: () => void;
  /** Clic sur une technologie : referme et filtre l'index par cette stack */
  onTechSelect?: (tech: string) => void;
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

export default function ProjectModal({ project, onClose, position, onPrev, onNext, onTechSelect }: Props) {
  const { t } = useTranslation('common');
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  /* Élément déclencheur : capturé à l'ouverture, rendu à la fermeture
     définitive (pas à chaque changement de planche dans la modale) */
  const restoreRef = useRef<HTMLElement | null>(null);
  const wasOpen = useRef(false);
  /* Les callbacks changent d'identité à chaque rendu parent : on les fige
     dans une ref pour que l'effet ne dépende que de la planche affichée. */
  const cbRef = useRef({ onClose, onPrev, onNext });
  cbRef.current = { onClose, onPrev, onNext };

  useEffect(() => {
    const open = !!project;
    document.body.style.overflow = open ? 'hidden' : '';

    if (open) {
      if (!wasOpen.current) {
        restoreRef.current =
          document.activeElement instanceof HTMLElement ? document.activeElement : null;
        closeRef.current?.focus();
      }
      /* Nouvelle planche : retour en haut du bordereau */
      dialogRef.current?.scrollTo(0, 0);
    } else if (wasOpen.current) {
      if (restoreRef.current && document.contains(restoreRef.current)) restoreRef.current.focus();
      restoreRef.current = null;
    }
    wasOpen.current = open;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        cbRef.current.onClose();
        return;
      }
      /* Avance de planche : ← / → comme sur une table de montage */
      if (e.key === 'ArrowLeft' && open && cbRef.current.onPrev) {
        e.preventDefault();
        cbRef.current.onPrev();
        return;
      }
      if (e.key === 'ArrowRight' && open && cbRef.current.onNext) {
        e.preventDefault();
        cbRef.current.onNext();
        return;
      }
      /* Piège de focus : Tab circule uniquement à l'intérieur du dialogue */
      if (e.key === 'Tab' && open && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement;
        const inside = active instanceof Node && dialogRef.current.contains(active);
        if (e.shiftKey && (!inside || active === first)) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && (!inside || active === last)) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [project]);

  const panel = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
    exit: { opacity: 0, y: 24, transition: { duration: 0.3, ease: EASE } },
  };

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          ref={dialogRef}
          className="fixed inset-0 z-[100] overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          role="dialog"
          aria-modal="true"
          aria-label={project.title}
        >
          {/* Fond */}
          <div className="fixed inset-0 bg-[rgb(var(--foreground-rgb))]/45 backdrop-blur-[2px]" onClick={onClose} />

          {/* Panneau : bordereau plein écran */}
          <motion.div
            variants={panel}
            initial="hidden"
            animate="show"
            exit="exit"
            className="relative min-h-full bg-[rgb(var(--background-start-rgb))] border-t border-[rgb(var(--foreground-rgb))]/20 sm:border-t-0 sm:border-l md:left-[6vw] md:w-[88vw] lg:left-[12vw] lg:w-[76vw]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Barre supérieure */}
            <div className="sticky top-0 z-10 flex items-center justify-between gap-4 px-[var(--container-px)] h-[4.25rem] bg-[rgb(var(--background-start-rgb))]/95 backdrop-blur-md border-b border-[rgb(var(--foreground-rgb))]/10">
              <div className="flex items-center gap-3 min-w-0">
                <span className="index-num text-[var(--accent-text)] dark:text-[var(--accent)]">
                  {project.featured ? t('projects.featured') : t('projects.view_project')}
                </span>
                <span className="h-3 w-px bg-[rgb(var(--foreground-rgb))]/20 shrink-0" />
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[rgb(var(--foreground-rgb))]/60 truncate">
                  {project.category || t('projects.entry_label')}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {position && onPrev && onNext && position.total > 1 && (
                  <>
                    <span className="index-num tabular-nums mr-1">
                      {String(position.index + 1).padStart(2, '0')} / {String(position.total).padStart(2, '0')}
                    </span>
                    <button
                      type="button"
                      onClick={onPrev}
                      aria-label={t('lab.prev')}
                      className="w-11 h-11 flex items-center justify-center border border-[rgb(var(--foreground-rgb))]/25 hover:bg-[var(--color-surface)] transition-colors duration-300"
                    >
                      <FiChevronLeft className="w-[18px] h-[18px]" />
                    </button>
                    <button
                      type="button"
                      onClick={onNext}
                      aria-label={t('lab.next')}
                      className="w-11 h-11 flex items-center justify-center border border-[rgb(var(--foreground-rgb))]/25 hover:bg-[var(--color-surface)] transition-colors duration-300"
                    >
                      <FiChevronRight className="w-[18px] h-[18px]" />
                    </button>
                  </>
                )}
                <button
                  ref={closeRef}
                  onClick={onClose}
                  aria-label={t('cv_modal.close')}
                  className="w-11 h-11 flex items-center justify-center border border-[rgb(var(--foreground-rgb))]/25 hover:bg-[var(--accent)] hover:border-[var(--accent)] hover:text-[#14130f] transition-all duration-300"
                >
                  <FiX className="w-[18px] h-[18px]" />
                </button>
              </div>
            </div>

            {/* Annonce polie du changement de planche (navigation clavier) */}
            <p role="status" className="sr-only">
              {position ? `${position.index + 1} / ${position.total} — ` : ''}
              {project.title}
            </p>

            <div className="px-[var(--container-px)] py-10 sm:py-14">
              {/* Planche image */}
              <div className="relative w-full aspect-[16/9] overflow-hidden border border-[rgb(var(--foreground-rgb))]/15 mb-10 grain">
                <Image
                  src={project.imageUrl || '/images/default-project.svg'}
                  alt={project.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 80vw"
                  priority
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-[var(--gutter)] gap-y-10">
                {/* Titre + description */}
                <div className="lg:col-span-7">
                  <h2 className="text-balance mb-6">{project.title}</h2>
                  {hasRealDescription(project.description) && (
                    <div className="prose-editorial text-[1.05rem] leading-[1.7] text-[rgb(var(--foreground-rgb))]/75 max-w-[62ch]">
                      {parse(DOMPurify.sanitize(project.description || ''))}
                    </div>
                  )}
                  <ProjectFacts
                    githubData={project.githubData}
                    className={`max-w-[24rem] ${hasRealDescription(project.description) ? 'mt-8' : 'mt-2'}`}
                  />
                </div>

                {/* Fiche technique */}
                <aside className="lg:col-span-5 lg:pl-[var(--gutter)] lg:border-l border-[rgb(var(--foreground-rgb))]/10">
                  <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[rgb(var(--foreground-rgb))]/60 mb-4">
                    {t('projects.tech_label')}
                  </p>
                  <ul className="mb-9">
                    {(project.technologies || []).map((tech, i) => (
                      <li key={i} className="border-b border-[rgb(var(--foreground-rgb))]/10">
                        {onTechSelect ? (
                          <button
                            type="button"
                            onClick={() => onTechSelect(tech)}
                            title={t('lab.filter_by', { tech })}
                            className="group/tech flex w-full items-center gap-3 min-h-[2.75rem] py-2 text-left"
                          >
                            <span className="font-mono text-[10px] tabular-nums text-[rgb(var(--foreground-rgb))]/60">
                              {String(i + 1).padStart(2, '0')}
                            </span>
                            <span className="text-sm text-[rgb(var(--foreground-rgb))]/80 group-hover/tech:text-[var(--accent-text)] dark:group-hover/tech:text-[var(--accent)] transition-colors">
                              {tech}
                            </span>
                            <FiChevronRight className="ml-auto w-3.5 h-3.5 opacity-0 group-hover/tech:opacity-100 group-focus-visible/tech:opacity-100 transition-opacity" />
                          </button>
                        ) : (
                          <span className="flex items-center gap-3 py-2">
                            <span className="font-mono text-[10px] tabular-nums text-[rgb(var(--foreground-rgb))]/60">
                              {String(i + 1).padStart(2, '0')}
                            </span>
                            <span className="text-sm text-[rgb(var(--foreground-rgb))]/80">{tech}</span>
                          </span>
                        )}
                      </li>
                    ))}
                    {(project.technologies || []).length === 0 && (
                      <li className="font-mono text-[11px] text-[rgb(var(--foreground-rgb))]/60">—</li>
                    )}
                  </ul>

                  <div className="flex flex-col gap-3">
                    {project.demoUrl && (
                      <a
                        href={project.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => track(project._id, 'demo')}
                        className="btn btn-primary justify-between w-full"
                      >
                        {t('projects.live_demo')}
                        <FiExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => track(project._id, 'github')}
                        className="btn btn-outline justify-between w-full"
                      >
                        {t('projects.source_code')}
                        <FiGithub className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </aside>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
