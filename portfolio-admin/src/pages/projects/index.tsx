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
        <title>Portfolio - Mes Projets</title>
        <meta name="description" content="Découvrez mes réalisations et projets en développement web." />
      </Head>

      <main className="relative min-h-screen dark:bg-[#09090f] bg-white pt-40 pb-32 overflow-hidden">
        {/* Ambient Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] dark:bg-indigo-600/5 bg-indigo-50/40 rounded-full blur-[120px] opacity-70" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] dark:bg-violet-600/5 bg-violet-50/30 rounded-full blur-[120px] opacity-70" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* Header Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="mb-20 text-center"
          >
            <div className="inline-flex items-center gap-2 text-indigo-500 font-bold text-[10px] uppercase tracking-[0.3em] mb-6">
              <span className="w-10 h-[1px] bg-indigo-500" />
              Portfolio de Projets
              <span className="w-10 h-[1px] bg-indigo-500" />
            </div>
            <h1 className="text-5xl md:text-7xl font-black dark:text-white text-zinc-900 tracking-tight mb-8">
              Sélection de <span className="text-indigo-600 dark:text-indigo-500">Travaux</span>.
            </h1>
            <p className="dark:text-zinc-500 text-zinc-600 text-xl font-medium max-w-2xl mx-auto leading-relaxed">
              Une immersion dans les applications, interfaces et solutions numériques poussées que j&apos;ai conçues avec précision.
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
                Featured Spotlight
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

          {/* Projects Gallery Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {projects.filter(p => !p.featured || projects.indexOf(p) !== projects.findIndex(fp => fp.featured)).map((project, index) => (
              <motion.div
                key={project._id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative flex flex-col"
              >
                <div 
                  onClick={() => openModal(project)}
                  className="relative aspect-[16/10] rounded-[2.5rem] overflow-hidden dark:bg-zinc-900 bg-zinc-50 dark:border-white/5 border-zinc-200 border cursor-pointer mb-8 shadow-sm group-hover:shadow-2xl transition-all duration-500"
                >
                  <Image
                    src={project.imageUrl}
                    alt={project.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, 600px"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-500" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 scale-90 group-hover:scale-100">
                    <span className="px-8 py-3 bg-white text-zinc-900 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl">Explorer le Projet</span>
                  </div>
                </div>

                <div className="px-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-black dark:text-white text-zinc-900 tracking-tight group-hover:text-indigo-500 transition-colors">
                      {project.title}
                    </h3>
                    <div className="flex gap-4">
                       {project.githubUrl && (
                        <button onClick={() => project.githubUrl && handleGithubClick(project._id, project.githubUrl)} className="p-2 dark:text-zinc-500 text-zinc-400 dark:hover:text-white hover:text-zinc-900 transition-colors">
                          <FiGithub className="w-5 h-5" />
                        </button>
                       )}
                       {project.demoUrl && (
                        <button onClick={() => project.demoUrl && handleDemoClick(project._id, project.demoUrl)} className="p-2 dark:text-zinc-500 text-zinc-400 dark:hover:text-white hover:text-zinc-900 transition-colors">
                          <FiExternalLink className="w-5 h-5" />
                        </button>
                       )}
                    </div>
                  </div>
                  <p className="text-zinc-500 dark:text-zinc-500 text-sm leading-relaxed line-clamp-2 mb-6">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.slice(0, 4).map((tech, ti) => (
                      <span key={ti} className="px-3 py-1 dark:bg-white/5 bg-zinc-50 dark:text-zinc-600 text-zinc-400 rounded-lg text-[10px] font-bold uppercase tracking-wider">
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
              className="text-center py-32 dark:bg-zinc-900/20 bg-zinc-50 rounded-[3rem] border-2 border-dashed dark:border-white/5 border-zinc-200"
            >
              <div className="w-24 h-24 rounded-3xl dark:bg-indigo-500/10 bg-indigo-100 flex items-center justify-center mx-auto mb-8">
                <FiCode className="w-10 h-10 text-indigo-500" />
              </div>
              <h3 className="text-2xl font-black dark:text-white text-zinc-900 mb-2">Aucun projet à afficher</h3>
              <p className="dark:text-zinc-500 text-zinc-500 font-medium">Revenez bientôt pour de nouvelles réalisations.</p>
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
                       <span className="w-4 h-[1px] bg-current opacity-40" /> Description
                    </h3>
                    <div className="dark:text-zinc-300 text-zinc-700 leading-relaxed text-base prose prose-zinc dark:prose-invert max-w-none">
                      {parse(DOMPurify.sanitize(selectedProject.description))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-xs font-bold dark:text-indigo-400 text-indigo-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                       <span className="w-4 h-[1px] bg-current opacity-40" /> Technologies
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
                        <FiExternalLink className="w-4 h-4" />Voir la démo
                      </motion.button>
                    )}
                    {selectedProject.githubUrl && (
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => selectedProject.githubUrl && handleGithubClick(selectedProject._id, selectedProject.githubUrl)}
                        className="flex items-center gap-2 px-7 py-3.5 dark:bg-white/5 bg-zinc-100 dark:hover:bg-white/10 hover:bg-zinc-200 dark:text-white text-zinc-900 rounded-xl text-sm font-bold transition-all"
                      >
                        <FiGithub className="w-4 h-4" />Voir le code
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

export const getStaticProps: GetStaticProps = async () => {
  try {
    await connectDB();
    const projects = await ProjectModel.find({ 
      archived: { $ne: true }
    }).sort({ featured: -1, order: 1, createdAt: -1 }).lean();

    return {
      props: {
        projects: JSON.parse(JSON.stringify(projects)),
      },
      revalidate: 60,
    };
  } catch (error) {
    console.error('Error fetching projects:', error);
    return {
      props: {
        projects: [],
      },
      revalidate: 60,
    };
  }
};
