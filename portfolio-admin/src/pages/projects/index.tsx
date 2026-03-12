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

      <main className="relative min-h-screen dark:bg-[#09090f] bg-white pt-32 pb-24 overflow-hidden">
        {/* Ambient Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] dark:bg-indigo-600/5 bg-indigo-50/40 rounded-full blur-3xl opacity-50" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] dark:bg-violet-600/5 bg-violet-50/30 rounded-full blur-3xl opacity-50" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="mb-16"
          >
            <div className="flex items-center gap-2 text-indigo-500 font-bold text-xs uppercase tracking-[0.2em] mb-3">
              <span className="w-8 h-[1px] bg-indigo-500" />
              Réalisations
            </div>
            <h1 className="text-4xl md:text-5xl font-black dark:text-white text-zinc-900 tracking-tight mb-4">
              Mes Projets
            </h1>
            <p className="dark:text-zinc-400 text-zinc-600 text-lg font-medium max-w-xl">
              Une immersion dans les applications et solutions que j&apos;ai conçues.
            </p>
          </motion.div>

          {/* Projects Grid */}
          {projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((project, index) => (
                <motion.div
                  key={project._id}
                  data-project-id={project._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -6 }}
                  className="group dark:bg-zinc-900/60 bg-white backdrop-blur-sm rounded-3xl overflow-hidden dark:border-white/5 border-zinc-200 border dark:hover:border-indigo-500/30 hover:border-indigo-400 transition-all duration-300 shadow-sm hover:shadow-xl flex flex-col"
                >
                  {/* Image Container */}
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
                        ><FiExternalLink className="w-5 h-5" /></motion.button>
                      )}
                      {project.githubUrl && (
                        <motion.button
                          onClick={() => project.githubUrl && handleGithubClick(project._id, project.githubUrl)}
                          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                          className="p-3 bg-white rounded-xl text-zinc-900 shadow-lg"
                        ><FiGithub className="w-5 h-5" /></motion.button>
                      )}
                    </div>
                    {/* Featured badge */}
                    {project.featured && (
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-indigo-600/90 text-white text-[10px] font-black uppercase tracking-widest rounded-full backdrop-blur-sm">
                        <FiStar className="w-3 h-3" />En vedette
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-7 flex flex-col flex-1">
                    <h3 className="text-xl font-bold dark:text-white text-zinc-900 tracking-tight mb-3 dark:group-hover:text-indigo-400 group-hover:text-indigo-600 transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-sm dark:text-zinc-400 text-zinc-600 leading-relaxed mb-6 flex-1 line-clamp-3">
                      {project.description}
                    </p>

                    {/* Tech stack */}
                    <div className="flex flex-wrap gap-2 mb-6">
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

                    {/* Actions */}
                    <div className="flex items-center gap-5 pt-5 dark:border-white/5 border-zinc-100 border-t">
                      <button 
                        onClick={() => openModal(project)}
                        className="text-indigo-500 hover:text-indigo-400 font-bold text-xs uppercase tracking-widest transition-colors"
                      >
                        Détails
                      </button>
                      {project.demoUrl && (
                        <button
                          onClick={() => project.demoUrl && handleDemoClick(project._id, project.demoUrl)}
                          className="flex items-center gap-1.5 dark:text-zinc-400 text-zinc-500 dark:hover:text-white hover:text-zinc-900 font-bold text-xs uppercase tracking-widest transition-colors"
                        >
                          <FiExternalLink className="w-4 h-4" />Demo
                        </button>
                      )}
                      {project.githubUrl && (
                        <button
                          onClick={() => project.githubUrl && handleGithubClick(project._id, project.githubUrl)}
                          className="flex items-center gap-1.5 dark:text-zinc-400 text-zinc-500 dark:hover:text-white hover:text-zinc-900 font-bold text-xs uppercase tracking-widest transition-colors"
                        >
                          <FiGithub className="w-4 h-4" />Code
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="text-center py-20 dark:bg-zinc-900/30 bg-zinc-50 rounded-3xl"
            >
              <div className="w-20 h-20 rounded-3xl dark:bg-indigo-500/10 bg-indigo-100/50 flex items-center justify-center mx-auto mb-6">
                <FiCode className="w-10 h-10 text-indigo-500" />
              </div>
              <h3 className="text-xl font-black dark:text-white text-zinc-900 mb-2">Aucun projet trouvé</h3>
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
