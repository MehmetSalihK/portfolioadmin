import { GetStaticProps } from 'next';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '@/components/layout/Layout';
import connectDB from '@/lib/db';
import ProjectModel from '@/models/Project';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FiExternalLink, FiGithub, FiCode, FiStar, FiX } from 'react-icons/fi';
import parse from 'html-react-parser';
import DOMPurify from 'isomorphic-dompurify';
import { useTranslation } from 'react-i18next';
import { serverSideTranslations } from 'next-i18next/pages/serverSideTranslations';
import { useRouter } from 'next/router';
import { getLocalized } from '@/utils/i18n-utils';

interface Project {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  technologies: string[];
  demoUrl?: string;
  githubUrl?: string;
  featured?: boolean;
}

interface ProjectsPageProps {
  projects: Project[];
}

export default function Projects({ projects }: ProjectsPageProps) {
  const { locale } = useRouter();
  const { t } = useTranslation('common');


  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const openModal = (project: Project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProject(null);
    document.body.style.overflow = 'unset';
  };

  const trackClick = async (projectId: string, type: 'demo' | 'github' | 'view') => {
    try {
      await fetch('/api/projects/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, type }),
      });
    } catch {}
  };

  const handleDemoClick = async (projectId: string, url: string) => {
    await trackClick(projectId, 'demo');
    window.open(url, '_blank');
  };

  const handleGithubClick = async (projectId: string, url: string) => {
    await trackClick(projectId, 'github');
    window.open(url, '_blank');
  };



  return (
    <Layout>
      <Head>
        <title>{t('nav.projects')} — Portfolio</title>
        <meta name="description" content={t('projects.description')} />
      </Head>

      <main className="min-h-screen dark:bg-[#0a0a0f] bg-[#fafafc] pt-14">
        <div className="max-w-[1100px] mx-auto px-6 pt-20 pb-24">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.2, 0, 0, 1] }}
            className="mb-16"
          >
            <div className="text-[11px] font-semibold text-indigo-500 uppercase tracking-widest mb-5">
              {t('projects.hero_subtitle')}
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold dark:text-white text-zinc-900 tracking-tight mb-5 text-balance">
              {t('projects.hero_title_part1')} <span className="text-indigo-500 italic">{t('projects.hero_title_part2')}</span>.
            </h1>
            <p className="dark:text-zinc-500 text-zinc-500 text-lg max-w-[520px] leading-[1.75]">
              {t('projects.description')}
            </p>
          </motion.div>

          {/* Featured Project Spotlight */}
          {projects.find(p => p.featured) && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-24"
            >
              <div className="flex items-center gap-2 text-indigo-500 font-bold text-[10px] uppercase tracking-[0.3em] mb-8">
                <FiStar className="w-3 h-3" />
                {t('projects.featured_spotlight')}
              </div>
              {(() => {
                const featured = projects.find(p => p.featured)!;
                return (
                  <div 
                    onClick={() => openModal(featured)}
                    className="group relative h-[400px] md:h-[600px] rounded-[3rem] overflow-hidden dark:bg-zinc-900 bg-zinc-100 dark:border-white/5 border-zinc-200 border-2 cursor-pointer shadow-3xl"
                  >
                    <Image 
                      src={featured.imageUrl} 
                      alt={featured.title} 
                      fill 
                      className="object-cover transition-transform duration-1000 group-hover:scale-105" 
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                    <div className="absolute bottom-12 left-12 right-12">
                      <div className="flex flex-wrap gap-2 mb-6">
                        {featured.technologies.slice(0, 3).map(t => (
                          <span key={t} className="px-4 py-1.5 bg-white/10 backdrop-blur-md text-white border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest">{t}</span>
                        ))}
                      </div>
                      <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-4 group-hover:text-indigo-400 transition-colors">{featured.title}</h2>
                      <p className="text-zinc-400 text-lg max-w-2xl line-clamp-2 md:line-clamp-none">{featured.description}</p>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          )}

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.filter(p => !p.featured || projects.indexOf(p) !== projects.findIndex(fp => fp.featured)).map((project, index) => (
              <motion.div
                key={project._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.06, ease: [0.2, 0, 0, 1] }}
                onClick={() => openModal(project)}
                className="group cursor-pointer dark:bg-white/[0.02] bg-white rounded-2xl border dark:border-white/[0.06] border-zinc-200 hover:dark:border-white/[0.12] hover:border-zinc-300 overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg dark:hover:shadow-black/40"
              >
                {/* Image */}
                <div className="relative aspect-[16/9] dark:bg-zinc-900 bg-zinc-100 overflow-hidden">
                  <Image
                    src={project.imageUrl}
                    alt={project.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 540px"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h3 className="text-base font-bold dark:text-white text-zinc-900 tracking-tight leading-snug">
                      {project.title}
                    </h3>
                    <div className="flex gap-2 shrink-0">
                      {project.githubUrl && (
                        <button
                          onClick={(e) => { e.stopPropagation(); project.githubUrl && handleGithubClick(project._id, project.githubUrl); }}
                          className="p-1.5 dark:text-zinc-600 text-zinc-400 hover:dark:text-zinc-300 hover:text-zinc-600 transition-colors"
                        >
                          <FiGithub className="w-4 h-4" />
                        </button>
                      )}
                      {project.demoUrl && (
                        <button
                          onClick={(e) => { e.stopPropagation(); project.demoUrl && handleDemoClick(project._id, project.demoUrl); }}
                          className="p-1.5 dark:text-zinc-600 text-zinc-400 hover:dark:text-zinc-300 hover:text-zinc-600 transition-colors"
                        >
                          <FiExternalLink className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-zinc-500 text-sm leading-relaxed line-clamp-2 mb-4">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {project.technologies.slice(0, 4).map((tech, ti) => (
                      <span key={ti} className="px-2.5 py-1 dark:bg-white/[0.04] bg-zinc-50 dark:text-zinc-500 text-zinc-500 rounded-md text-[11px] font-medium border dark:border-white/[0.05] border-zinc-100">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {projects.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-24 dark:bg-white/[0.02] bg-white rounded-2xl border dark:border-white/[0.06] border-zinc-200 border-dashed"
            >
              <div className="w-16 h-16 rounded-2xl dark:bg-indigo-500/10 bg-indigo-50 flex items-center justify-center mx-auto mb-6">
                <FiCode className="w-7 h-7 text-indigo-500" />
              </div>
              <h3 className="text-xl font-bold dark:text-white text-zinc-900 mb-2 tracking-tight">{t('projects.empty')}</h3>
              <p className="dark:text-zinc-500 text-zinc-500 text-sm">{t('projects.empty_desc')}</p>
            </motion.div>
          )}
        </div>

        {/* Project Detail Modal */}
        <AnimatePresence>
          {isModalOpen && selectedProject && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-[100]" onClick={closeModal}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="dark:bg-[#0d0d14] bg-white dark:border-white/10 border-zinc-200 border rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center p-6 dark:border-white/5 border-zinc-200 border-b sticky top-0 bg-inherit z-10">
                  <h2 className="text-2xl font-black dark:text-white text-zinc-900 tracking-tight">{selectedProject.title}</h2>
                  <button onClick={closeModal} className="p-2 dark:hover:bg-white/10 hover:bg-zinc-100 rounded-xl transition-colors">
                    <FiX className="w-5 h-5 dark:text-zinc-400 text-zinc-600" />
                  </button>
                </div>
                <div className="p-6 md:p-8 space-y-8">
                  <div className="rounded-2xl overflow-hidden aspect-video relative dark:bg-zinc-800 bg-zinc-100 shadow-xl">
                    <Image src={selectedProject.imageUrl} alt={selectedProject.title} fill className="object-cover" sizes="800px" />
                  </div>
                  
                  <div>
                    <h3 className="text-xs font-bold dark:text-indigo-400 text-indigo-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                       <span className="w-4 h-[1px] bg-current opacity-40" /> {t('projects.description_label')}
                    </h3>
                    <div className="dark:text-zinc-300 text-zinc-700 leading-relaxed text-base prose prose-zinc dark:prose-invert max-w-none">
                      {parse(DOMPurify.sanitize(selectedProject.description))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-xs font-bold dark:text-indigo-400 text-indigo-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                       <span className="w-4 h-[1px] bg-current opacity-40" /> {t('projects.tech_label')}
                    </h3>
                    <div className="flex flex-wrap gap-2.5">
                      {selectedProject.technologies.map((tech, i) => (
                        <span key={i} className="px-3.5 py-2 dark:bg-indigo-500/10 bg-indigo-50 dark:text-indigo-400 text-indigo-600 dark:border-indigo-500/20 border-indigo-200 border rounded-xl text-sm font-bold">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 pt-4">
                    {selectedProject.demoUrl && (
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => selectedProject.demoUrl && handleDemoClick(selectedProject._id, selectedProject.demoUrl)}
                        className="flex items-center gap-2 px-7 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-600/20"
                      >
                        <FiExternalLink className="w-4 h-4" />{t('projects.view_demo')}
                      </motion.button>
                    )}
                    {selectedProject.githubUrl && (
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => selectedProject.githubUrl && handleGithubClick(selectedProject._id, selectedProject.githubUrl)}
                        className="flex items-center gap-2 px-7 py-3.5 dark:bg-white/5 bg-zinc-100 dark:hover:bg-white/10 hover:bg-zinc-200 dark:text-white text-zinc-900 rounded-xl text-sm font-bold transition-all"
                      >
                        <FiGithub className="w-4 h-4" />{t('projects.view_code')}
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const currentLocale = locale || 'fr';
  try {
    await connectDB();
    const rawProjects = await ProjectModel.find({ 
      archived: { $ne: true }
    }).sort({ featured: -1, order: 1, createdAt: -1 }).lean();

    // Map projects to active locale
    const projects = rawProjects.map((p: any) => ({
      ...p,
      _id: p._id.toString(),
      title: getLocalized(p, 'title', currentLocale),
      description: getLocalized(p, 'description', currentLocale),
    }));

    return {
      props: {
        projects: JSON.parse(JSON.stringify(projects)),
        ...(await serverSideTranslations(currentLocale, ['common'])),
      },
      revalidate: 60,
    };
  } catch (error) {
    console.error('Error fetching projects:', error);
    return {
      props: {
        projects: [],
        ...(await serverSideTranslations(currentLocale, ['common'])),
      },
      revalidate: 60,
    };
  }
};

