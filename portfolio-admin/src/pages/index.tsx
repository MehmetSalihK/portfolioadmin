import { motion, useScroll, AnimatePresence } from 'framer-motion';
import Head from 'next/head';
import { GetStaticProps } from 'next';
import Layout from '@/components/layout/Layout';
import CVModal from '@/components/modals/CVModal';
import { Analytics } from "@vercel/analytics/next";
import connectDB from '@/lib/db';
import ProjectModel from '@/models/Project';
import ExperienceModel from '@/models/Experience';
import SkillModel from '@/models/Skill';
import HomePageModel from '@/models/HomePage';
import SettingModel from '@/models/Setting';
import { useRef, useEffect, useState } from 'react';
import {
  FaGithub, FaLinkedin, FaTwitter, FaWhatsapp, FaTelegram,
} from 'react-icons/fa';
import { HiArrowDown } from 'react-icons/hi';
import {
  FiExternalLink, FiGithub, FiX, FiDownload,
  FiCode, FiSettings, FiStar, FiSend, FiChevronRight
} from 'react-icons/fi';
import parse from 'html-react-parser';
import DOMPurify from 'isomorphic-dompurify';
import SkillCategory from '@/models/SkillCategory';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import Link from 'next/link';
import SkillsSection from '@/components/home/SkillsSection';
import JSONLD, { schemas } from '@/components/layout/JSONLD';

// ─── Interfaces ────────────────────────────────────────────────────────────────
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
  tags?: string[];
  difficulty?: string;
  status?: string;
}

interface Experience {
  _id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate?: string;
  description: string;
  technologies: string[];
}

interface HomePageProps {
  projects: Project[];
  experiences: Experience[];
  skills: Array<{ _id: string; name: string; level: number; category: string }>;
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

interface Category { _id: string; name: string; displayOrder: number }

const defaultHomeData = {
  _id: 'default', __v: 0,
  title: 'Portfolio Professionnel',
  subtitle: "Développeur Full Stack passionné par la création d'applications web modernes et performantes. Spécialisé dans React, Next.js, Node.js et les technologies cloud.",
  aboutTitle: 'À propos',
  aboutText: "Je suis un développeur Full Stack passionné par la création d'applications web innovantes.",
  navigation: { about: 'À propos', projects: 'Projets', experience: 'Expérience', contact: 'Contact' },
  contactInfo: { email: 'contact@portfolio.com', phone: '+33 X XX XX XX XX', location: 'France' },
  footer: { copyright: '© 2024 Portfolio. Fait avec ❤️ et Next.js', description: "Développeur Full Stack." },
  socialLinks: { github: '', linkedin: '', twitter: '', whatsapp: '', telegram: '' }
};

// ─── Component ─────────────────────────────────────────────────────────────────
export default function Home({
  projects, experiences, homeData = defaultHomeData, skillsByCategory, settings, seoData
}: HomePageProps) {
  const { scrollYProgress } = useScroll();
  const mainRef = useRef<HTMLDivElement>(null);
  const [showBanner, setShowBanner] = useState(true);


  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [isCVModalOpen, setIsCVModalOpen] = useState(false);

  // Top 3 featured projects
  const formattedProjects = projects
    .sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return 0;
    })
    .slice(0, 3);

  const scrollToContent = () => mainRef.current?.scrollIntoView({ behavior: 'smooth' });

  const openModal = (project: any) => {
    setSelectedProject(project);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProject(null);
    document.body.style.overflow = 'unset';
  };
  const handleModalContentClick = (e: React.MouseEvent) => e.stopPropagation();

  // Analytics tracking
  const trackClick = async (projectId: string, type: 'demo' | 'github' | 'view') => {
    try {
      await fetch('/api/projects/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, type }),
      });
    } catch {}
  };
  const handleDemoClick = async (projectId: string, url: string) => { await trackClick(projectId, 'demo'); window.open(url, '_blank'); };
  const handleGithubClick = async (projectId: string, url: string) => { await trackClick(projectId, 'github'); window.open(url, '_blank'); };






  return (
    <Layout>
      <JSONLD type="Person" data={schemas.me} />
      <Head>
        <title>{seoData?.title || homeData.title || 'Portfolio - Accueil'}</title>
        <meta name="description" content={seoData?.description || 'Portfolio professionnel - Développeur Full Stack'} />
        {seoData?.keywords && seoData.keywords.length > 0 && (
          <meta name="keywords" content={seoData.keywords.join(', ')} />
        )}
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Beta banner - hidden for production, uncomment if needed for testing */}
      {/* <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 left-0 right-0 z-50 flex justify-center px-4"
          >
            <div className="flex items-center gap-3 bg-amber-500/90 text-amber-900 px-4 py-3 rounded-lg shadow-lg backdrop-blur-sm max-w-2xl">
              <FiAlertTriangle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">Ce site est actuellement en cours de développement (version bêta). Certaines fonctionnalités peuvent ne pas fonctionner correctement.</p>
              <button onClick={() => setShowBanner(false)} className="flex-shrink-0 text-amber-900 hover:text-amber-950 transition-colors">
                <FiX className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence> */}

      {/* Scroll progress bar */}
      <motion.div className="fixed top-0 left-0 right-0 h-0.5 bg-indigo-500 origin-left z-50" style={{ scaleX: scrollYProgress }} />


      {/* ═══════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════ */}
      <section className="relative min-h-[92vh] flex items-center dark:bg-[#0a0a0f] bg-[#fafafc] pt-14">
        {/* Subtle radial glow — lightweight */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] dark:bg-indigo-600/6 bg-indigo-100/40 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-[1100px] mx-auto px-6 w-full relative z-10">
          <div className="max-w-[680px] mx-auto text-center">

            {/* Status badge */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 dark:bg-white/[0.04] bg-zinc-100 dark:border-white/[0.07] border-zinc-200 border rounded-full mb-10"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[12px] font-medium dark:text-zinc-400 text-zinc-500">
                Disponible pour de nouveaux projets
              </span>
            </motion.div>

            {/* H1 */}
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4, ease: [0.2, 0, 0, 1] }}
              className="text-5xl sm:text-6xl lg:text-7xl font-extrabold dark:text-white text-zinc-900 leading-[1.05] tracking-tight mb-6 text-balance"
            >
              Codeur par&nbsp;<span className="text-indigo-500 italic">métier</span>,{' '}<br className="hidden sm:block" />
              créatif par&nbsp;<span className="text-indigo-500 italic">nature</span>.
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18, duration: 0.4, ease: [0.2, 0, 0, 1] }}
              className="text-lg dark:text-zinc-500 text-zinc-500 mb-10 max-w-[520px] mx-auto leading-[1.75] font-normal"
            >
              De l&apos;architecture logicielle au prototypage hardware — je conçois des produits numériques complets où la technique rencontre l&apos;esthétique.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.35 }}
              className="flex flex-wrap items-center justify-center gap-3 mb-14"
            >
              <Link
                href="/projects"
                className="h-11 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors duration-150 flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
              >
                Voir mes projets
              </Link>
              <button
                onClick={() => setIsCVModalOpen(true)}
                className="h-11 px-6 dark:bg-white/[0.04] bg-white dark:hover:bg-white/[0.08] hover:bg-zinc-50 dark:text-zinc-200 text-zinc-700 dark:border-white/[0.08] border-zinc-200 border rounded-lg text-sm font-semibold transition-all duration-150 flex items-center justify-center gap-2"
              >
                <FiDownload className="w-4 h-4" />
                Télécharger le CV
              </button>
            </motion.div>

            {/* Social links */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="flex items-center justify-center gap-2">
              {homeData.socialLinks.github && (
                <a href={homeData.socialLinks.github} target="_blank" rel="noopener noreferrer" title="GitHub"
                  className="p-2 dark:text-zinc-600 text-zinc-400 hover:dark:text-zinc-300 hover:text-zinc-600 transition-colors duration-150"
                ><FaGithub className="w-5 h-5" /></a>
              )}
              {homeData.socialLinks.linkedin && (
                <a href={homeData.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" title="LinkedIn"
                  className="p-2 dark:text-zinc-600 text-zinc-400 hover:dark:text-zinc-300 hover:text-zinc-600 transition-colors duration-150"
                ><FaLinkedin className="w-5 h-5" /></a>
              )}
              {homeData.socialLinks.twitter && (
                <a href={homeData.socialLinks.twitter} target="_blank" rel="noopener noreferrer" title="Twitter"
                  className="p-2 dark:text-zinc-600 text-zinc-400 hover:dark:text-zinc-300 hover:text-zinc-600 transition-colors duration-150"
                ><FaTwitter className="w-5 h-5" /></a>
              )}
              {homeData.socialLinks.whatsapp && (
                <a href={homeData.socialLinks.whatsapp} target="_blank" rel="noopener noreferrer" title="WhatsApp"
                  className="p-2 dark:text-zinc-600 text-zinc-400 hover:dark:text-zinc-300 hover:text-zinc-600 transition-colors duration-150"
                ><FaWhatsapp className="w-5 h-5" /></a>
              )}
              {homeData.socialLinks.telegram && (
                <a href={homeData.socialLinks.telegram} target="_blank" rel="noopener noreferrer" title="Telegram"
                  className="p-2 dark:text-zinc-600 text-zinc-400 hover:dark:text-zinc-300 hover:text-zinc-600 transition-colors duration-150"
                ><FaTelegram className="w-5 h-5" /></a>
              )}
            </motion.div>
          </div>
        </div>
      </section>


      {/* ═══════════════════════════════════════
          3 UNIVERS — Hub identitaire
      ═══════════════════════════════════════ */}
      <section className="py-20 dark:bg-[#0a0a0f] bg-[#fafafc] border-t dark:border-white/[0.05] border-zinc-100">
        <div className="max-w-[1100px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                href: '/developpeur',
                label: 'Développeur',
                title: "L'Architecte",
                desc: 'Stack MERN, Next.js, systèmes complets et automatisation serveur.',
                accent: 'indigo',
                border: 'hover:border-indigo-500/30'
              },
              {
                href: '/designer',
                label: 'Créatif',
                title: "L'Artiste",
                desc: 'Vidéo, montage, color grading, direction artistique et création de contenu.',
                accent: 'rose',
                border: 'hover:border-rose-500/30'
              },
              {
                href: '/maker',
                label: 'Maker',
                title: 'Le Builder',
                desc: 'Diagnostic hardware, réparation smartphones, assemblage PC et IoT.',
                accent: 'amber',
                border: 'hover:border-amber-500/30'
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.35, ease: [0.2, 0, 0, 1] }}
              >
                <Link
                  href={item.href}
                  className={`group block p-6 rounded-2xl dark:bg-white/[0.02] bg-white border dark:border-white/[0.06] border-zinc-200 ${item.border} transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg dark:hover:shadow-black/40`}
                >
                  <div className={`text-[11px] font-semibold uppercase tracking-widest mb-3 ${
                    item.accent === 'indigo' ? 'text-indigo-500' :
                    item.accent === 'rose' ? 'text-rose-500' : 'text-amber-500'
                  }`}>{item.label}</div>
                  <h3 className="text-lg font-bold dark:text-white text-zinc-900 mb-2 tracking-tight">{item.title}</h3>
                  <p className="text-sm dark:text-zinc-500 text-zinc-500 leading-relaxed mb-4">{item.desc}</p>
                  <span className={`text-[12px] font-semibold flex items-center gap-1.5 group-hover:gap-2.5 transition-all duration-150 ${
                    item.accent === 'indigo' ? 'text-indigo-500' :
                    item.accent === 'rose' ? 'text-rose-500' : 'text-amber-500'
                  }`}>
                    Découvrir <FiChevronRight className="w-3.5 h-3.5" />
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <main ref={mainRef}>
        {/* ═══════════════════════════════════════
            FEATURED PROJECTS
        ═══════════════════════════════════════ */}
        <section id="projects" className="py-24 dark:bg-[#09090f] bg-white relative overflow-hidden">
          <div className="absolute inset-0 dark:bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.06)_0%,transparent_60%)] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-6 relative z-10">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-14 gap-4"
            >
              <div>
                <div className="flex items-center gap-2 text-indigo-500 font-bold text-[10px] uppercase tracking-[0.2em] mb-3">
                  <span className="w-8 h-[1px] bg-indigo-500" />
                  Réalisations
                </div>
                <h2 className="text-4xl lg:text-5xl font-black dark:text-white text-zinc-900 tracking-tight">
                  Projets en vedette
                </h2>
              </div>
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest dark:text-zinc-500 text-zinc-500 dark:hover:text-white hover:text-zinc-900 transition-colors group"
              >
                Voir tous les projets
                <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
              </Link>
            </motion.div>

            {/* Projects grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {formattedProjects.map((project, index) => (
                <motion.div
                  key={project._id}
                  data-project-id={project._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -6 }}
                  className="group dark:bg-zinc-900/60 bg-white backdrop-blur-sm rounded-3xl overflow-hidden dark:border-white/5 border-zinc-200 border dark:hover:border-indigo-500/20 hover:border-indigo-300 transition-all duration-300 shadow-sm hover:shadow-lg flex flex-col"
                >
                  {/* Project image */}
                  <div className="relative aspect-video overflow-hidden dark:bg-zinc-800 bg-zinc-100">
                    <Image
                      src={project.imageUrl}
                      alt={project.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-indigo-900/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                      {project.demoUrl && (
                        <motion.button
                          onClick={() => project.demoUrl && handleDemoClick(project._id, project.demoUrl)}
                          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                          className="p-3 bg-white rounded-xl text-zinc-900 shadow-lg"
                          title="Voir la démo"
                        ><FiExternalLink className="w-5 h-5" /></motion.button>
                      )}
                      {project.githubUrl && (
                        <motion.button
                          onClick={() => project.githubUrl && handleGithubClick(project._id, project.githubUrl)}
                          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                          className="p-3 bg-white rounded-xl text-zinc-900 shadow-lg"
                          title="Voir le code"
                        ><FiGithub className="w-5 h-5" /></motion.button>
                      )}
                    </div>
                    {/* Featured badge */}
                    {project.featured && (
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-indigo-600/90 text-white text-[10px] font-black uppercase tracking-widest rounded-full backdrop-blur-sm">
                        <FiStar className="w-3 h-3" />Featured
                      </div>
                    )}
                  </div>

                  {/* Card body */}
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-lg font-black dark:text-white text-zinc-900 tracking-tight mb-2 dark:group-hover:text-indigo-400 group-hover:text-indigo-600 transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-sm dark:text-zinc-500 text-zinc-500 leading-relaxed mb-4 flex-1">
                      {project.description.length > 100 ? (
                        <>
                          {project.description.substring(0, 100)}…{' '}
                          <button onClick={() => openModal(project)} className="text-indigo-500 hover:text-indigo-400 font-bold underline transition-colors">
                            lire plus
                          </button>
                        </>
                      ) : project.description}
                    </p>

                    {/* Tech stack */}
                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {project.technologies.slice(0, 4).map((tech, ti) => (
                        <span key={ti} className="px-2.5 py-1 dark:bg-indigo-500/10 bg-indigo-50 dark:text-indigo-400 text-indigo-600 dark:border-indigo-500/20 border-indigo-200 border rounded-lg text-[10px] font-black uppercase tracking-wider">
                          {tech}
                        </span>
                      ))}
                      {project.technologies.length > 4 && (
                        <span className="px-2.5 py-1 dark:bg-white/5 bg-zinc-100 dark:text-zinc-500 text-zinc-400 rounded-lg text-[10px] font-bold">
                          +{project.technologies.length - 4}
                        </span>
                      )}
                    </div>

                    {/* Action row */}
                    <div className="flex items-center justify-between pt-6 mt-auto border-t dark:border-white/5 border-zinc-100">
                      <div className="flex gap-4">
                        {project.demoUrl && (
                          <button
                            onClick={() => project.demoUrl && handleDemoClick(project._id, project.demoUrl)}
                            className="flex items-center gap-1.5 text-indigo-500 hover:text-indigo-400 font-black text-[10px] uppercase tracking-widest transition-colors"
                          >
                            <FiExternalLink className="w-3.5 h-3.5" />Demo
                          </button>
                        )}
                        {project.githubUrl && (
                          <button
                            onClick={() => project.githubUrl && handleGithubClick(project._id, project.githubUrl)}
                            className="flex items-center gap-1.5 dark:text-zinc-500 text-zinc-400 dark:hover:text-white hover:text-zinc-900 font-black text-[10px] uppercase tracking-widest transition-colors"
                          >
                            <FiGithub className="w-3.5 h-3.5" />Code
                          </button>
                        )}
                      </div>
                      <div className="w-1.5 h-1.5 rounded-full dark:bg-white/10 bg-zinc-200" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Empty state */}
            {formattedProjects.length === 0 && (
              <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center py-20">
                <div className="w-20 h-20 rounded-3xl dark:bg-indigo-500/10 bg-indigo-50 flex items-center justify-center mx-auto mb-6">
                  <FiCode className="w-10 h-10 text-indigo-500" />
                </div>
                <h3 className="text-xl font-black dark:text-white text-zinc-900 mb-3">Projets en cours de développement</h3>
                <p className="dark:text-zinc-500 text-zinc-500 max-w-sm mx-auto font-medium">De nouveaux projets passionnants arrivent bientôt.</p>
              </motion.div>
            )}
          </div>

          {/* ── Project Detail Modal ── */}
          {isModalOpen && selectedProject && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={closeModal}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="dark:bg-[#0d0d14] bg-white dark:border-white/10 border-zinc-200 border rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                onClick={handleModalContentClick}
              >
                <div className="flex justify-between items-center p-6 dark:border-white/5 border-zinc-200 border-b">
                  <h2 className="text-2xl font-black dark:text-white text-zinc-900 tracking-tight">{selectedProject.title}</h2>
                  <button onClick={closeModal} className="p-2 dark:hover:bg-white/10 hover:bg-zinc-100 rounded-xl transition-colors">
                    <FiX className="w-5 h-5 dark:text-zinc-400 text-zinc-600" />
                  </button>
                </div>
                <div className="p-6 space-y-6">
                  <div className="rounded-2xl overflow-hidden aspect-video relative dark:bg-zinc-800 bg-zinc-100">
                    <Image src={selectedProject.imageUrl} alt={selectedProject.title} fill className="object-cover" sizes="800px" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black dark:text-zinc-400 text-zinc-500 uppercase tracking-widest mb-3">Description</h3>
                    <div className="dark:text-zinc-300 text-zinc-700 leading-relaxed text-sm">
                      {parse(DOMPurify.sanitize(selectedProject.description))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xs font-black dark:text-zinc-400 text-zinc-500 uppercase tracking-widest mb-3">Technologies</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.technologies.map((tech: string, i: number) => (
                        <span key={i} className="px-3 py-1.5 dark:bg-indigo-500/10 bg-indigo-50 dark:text-indigo-400 text-indigo-600 dark:border-indigo-500/20 border-indigo-200 border rounded-xl text-sm font-bold">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    {selectedProject.demoUrl && (
                      <a href={selectedProject.demoUrl} target="_blank" rel="noopener noreferrer"
                        onClick={() => handleDemoClick(selectedProject._id, selectedProject.demoUrl)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20"
                      >
                        <FiExternalLink className="w-4 h-4" />Voir la démo
                      </a>
                    )}
                    {selectedProject.githubUrl && (
                      <a href={selectedProject.githubUrl} target="_blank" rel="noopener noreferrer"
                        onClick={() => handleGithubClick(selectedProject._id, selectedProject.githubUrl)}
                        className="flex items-center gap-2 px-5 py-2.5 dark:bg-white/10 bg-zinc-100 dark:hover:bg-white/20 hover:bg-zinc-200 dark:text-white text-zinc-900 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                      >
                        <FiGithub className="w-4 h-4" />Voir le code
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </section>

        {/* ═══════════════════════════════════════
            SKILLS SECTION
        ═══════════════════════════════════════ */}
        <SkillsSection />

        {/* ═══════════════════════════════════════
            EXPERIENCE TIMELINE
        ═══════════════════════════════════════ */}
        <section id="experience" className="py-24 dark:bg-[#09090f] bg-white relative overflow-hidden">
          <div className="absolute inset-0 dark:bg-[radial-gradient(ellipse_at_bottom_left,rgba(99,102,241,0.05)_0%,transparent_60%)] pointer-events-none" />

          <div className="max-w-5xl mx-auto px-6 relative z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-14">
              <div className="flex items-center gap-2 text-indigo-500 font-bold text-[10px] uppercase tracking-[0.2em] mb-3">
                <span className="w-8 h-[1px] bg-indigo-500" />
                Parcours
              </div>
              <h2 className="text-4xl lg:text-5xl font-black dark:text-white text-zinc-900 tracking-tight">
                Expériences professionnelles
              </h2>
            </motion.div>

            {experiences.length > 0 ? (
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-5 top-2 bottom-2 w-px dark:bg-indigo-500/20 bg-indigo-200 hidden md:block" />
                <div className="space-y-8">
                  {experiences.map((exp, index) => (
                    <motion.div
                      key={exp._id}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="md:pl-16 relative"
                    >
                      {/* Timeline dot */}
                      <div className="absolute left-3.5 top-7 w-3.5 h-3.5 rounded-full bg-indigo-500 border-4 dark:border-[#09090f] border-white shadow-md shadow-indigo-500/40 hidden md:block z-10" />

                      <div className="dark:bg-zinc-900/60 bg-white backdrop-blur-sm rounded-3xl p-6 lg:p-8 dark:border-white/5 border-zinc-200 border dark:hover:border-indigo-500/20 hover:border-indigo-300 transition-all shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                          <div>
                            <h3 className="text-xl font-black dark:text-white text-zinc-900 tracking-tight mb-1">{exp.title}</h3>
                            <div className="flex items-center gap-2 text-sm">
                              <span className="font-bold dark:text-white text-zinc-800">{exp.company}</span>
                              <span className="dark:text-zinc-700 text-zinc-400">·</span>
                              <span className="dark:text-zinc-500 text-zinc-500">{exp.location}</span>
                            </div>
                          </div>
                          <span className="flex-shrink-0 px-3 py-1.5 dark:bg-indigo-500/10 bg-indigo-50 dark:text-indigo-400 text-indigo-600 dark:border-indigo-500/20 border-indigo-200 border rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                            {new Date(exp.startDate).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}
                            {' — '}
                            {exp.endDate
                              ? new Date(exp.endDate).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })
                              : 'Présent'}
                          </span>
                        </div>
                        <p className="dark:text-zinc-500 text-zinc-600 leading-relaxed text-sm mb-5">{exp.description}</p>
                        {exp.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {exp.technologies.map((tech, ti) => (
                              <span key={ti} className="px-2.5 py-1 dark:bg-white/5 bg-zinc-100 dark:text-zinc-400 text-zinc-600 dark:border-white/10 border-zinc-200 border rounded-lg text-[10px] font-bold">
                                {tech}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-2xl dark:bg-indigo-500/10 bg-indigo-50 flex items-center justify-center mx-auto mb-4">
                  <FiSettings className="w-8 h-8 text-indigo-500" />
                </div>
                <h3 className="text-lg font-black dark:text-white text-zinc-900 mb-2">Expériences en cours d&apos;ajout</h3>
                <p className="dark:text-zinc-500 text-zinc-500 text-sm font-medium">Mon parcours professionnel sera bientôt détaillé ici.</p>
              </div>
            )}
          </div>
        </section>

        {/* ═══════════════════════════════════════
            FINAL CTA
        ═══════════════════════════════════════ */}
        <section className="py-28 dark:bg-zinc-900/30 bg-indigo-50/60 dark:border-white/5 border-indigo-100 border-y relative overflow-hidden">
          <div className="absolute inset-0 dark:bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.08)_0%,transparent_70%)] bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.04)_0%,transparent_70%)] pointer-events-none" />

          <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
              <div className="flex items-center gap-2 text-indigo-500 font-bold text-[10px] uppercase tracking-[0.2em] justify-center mb-6">
                <span className="w-8 h-[1px] bg-indigo-500" />
                Prêt à collaborer ?
                <span className="w-8 h-[1px] bg-indigo-500" />
              </div>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black dark:text-white text-zinc-900 tracking-tight mb-6">
                Discutons de votre projet
              </h2>
              <p className="dark:text-zinc-400 text-zinc-600 text-lg font-medium mb-10 max-w-xl mx-auto">
                Vous cherchez un développeur pour votre prochain projet ? Je suis disponible pour des missions freelance, CDD ou CDI.
              </p>
              <div className="flex flex-wrap gap-4 justify-center mb-10">
                <Link
                  href="/contact"
                  className="h-16 px-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                  <FiSend className="w-4 h-4" />
                  Démarrer une Collaboration
                </Link>
                
                <button
                  onClick={() => setIsCVModalOpen(true)}
                  className="h-16 px-10 dark:bg-white/5 bg-white dark:hover:bg-white/10 hover:bg-zinc-50 dark:text-white text-zinc-900 dark:border-white/5 border-zinc-200 border rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-3 shadow-sm"
                >
                  <FiDownload className="w-4 h-4" />
                  Consulter le Dossier CV
                </button>
              </div>
              
              {/* Contact options */}
              <div className="flex flex-wrap gap-6 justify-center dark:text-zinc-400 text-zinc-500">
                {homeData.socialLinks.github && (
                  <a href={homeData.socialLinks.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-indigo-500 transition-colors">
                    <FaGithub className="w-5 h-5" />
                    <span className="text-sm font-medium">GitHub</span>
                  </a>
                )}
                {homeData.socialLinks.linkedin && (
                  <a href={homeData.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-indigo-500 transition-colors">
                    <FaLinkedin className="w-5 h-5" />
                    <span className="text-sm font-medium">LinkedIn</span>
                  </a>
                )}
                {homeData.contactInfo?.email && (
                  <a href={`mailto:${homeData.contactInfo.email}`} className="flex items-center gap-2 hover:text-indigo-500 transition-colors">
                    <span className="text-sm font-medium">{homeData.contactInfo.email}</span>
                  </a>
                )}
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Analytics />
      <CVModal isOpen={isCVModalOpen} onClose={() => setIsCVModalOpen(false)} />
    </Layout>
  );
}

// ─── getStaticProps ──────────────────────────────────────────────────────────────
export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const currentLocale = locale || 'fr';

  try {
    await connectDB();

    const Maintenance = (await import('@/models/Maintenance')).default;
    const maintenanceStatus = await Maintenance.findOne().lean();

    if (maintenanceStatus && (maintenanceStatus as any).isEnabled) {
      return { redirect: { destination: '/maintenance', permanent: false } };
    }

    let homeData = await HomePageModel.findOne().lean();
    if (!homeData) homeData = defaultHomeData;

    const settingsFromDB = await SettingModel.findOne().lean();
    const settings = settingsFromDB || { email: 'contact@mehmetsalihk.fr', linkedin: 'https://www.linkedin.com/in/mehmetsalihk' };

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
      { $limit: 6 }
    ]);

    const experiences = await ExperienceModel.find({})
      .sort({ startDate: -1 })
      .select('title company location startDate endDate description technologies')
      .lean();

    const experiencesWithTechnologies = experiences.map(exp => ({
      ...exp,
      technologies: exp.technologies || []
    }));

    const allCategories = await SkillCategory.find({ isVisible: true }).sort('displayOrder').lean();

    const uniqueCategories = allCategories.reduce<typeof allCategories>((acc, current) => {
      const exists = acc.find(cat => cat.name === current.name);
      if (!exists) acc.push(current);
      return acc;
    }, []);

    const skills = await SkillModel.find({ isHidden: false, categoryId: { $exists: true, $ne: null } })
      .populate('categoryId')
      .lean();

    const skillsByCategory = uniqueCategories.map(category => ({
      _id: category._id,
      name: category.name,
      displayOrder: category.displayOrder,
      skills: skills.filter(skill =>
        skill.categoryId &&
        typeof skill.categoryId === 'object' &&
        'name' in skill.categoryId &&
        (skill.categoryId as Category).name === category.name
      ).sort((a, b) => a.displayOrder - b.displayOrder)
    })).sort((a, b) => a.displayOrder - b.displayOrder);

    return {
      props: {
        projects: JSON.parse(JSON.stringify(projects)),
        experiences: JSON.parse(JSON.stringify(experiencesWithTechnologies)),
        skills: JSON.parse(JSON.stringify(skills)),
        homeData: JSON.parse(JSON.stringify(homeData)),
        skillsByCategory: JSON.parse(JSON.stringify(skillsByCategory)),
        settings: JSON.parse(JSON.stringify(settings)),
        seoData: seoData ? JSON.parse(JSON.stringify(seoData)) : null,
      },
      revalidate: 1,
    };
  } catch (error) {
    console.error('Error in getStaticProps:', error);
    return {
      props: {
        projects: [],
        experiences: [],
        skills: [],
        homeData: defaultHomeData,
        skillsByCategory: [],
        settings: { email: '', linkedin: '', phone: '' },
      },
      revalidate: 1,
    };
  }
};
