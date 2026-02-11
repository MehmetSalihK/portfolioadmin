import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { FaGithub, FaExternalLinkAlt, FaTimes, FaImages, FaChevronLeft, FaChevronRight, FaTag } from 'react-icons/fa';
import { useState } from 'react';

interface ProjectCardProps {
  project: {
    title: string;
    description: string;
    image: string;
    technologies: string[];
    demoUrl?: string;
    githubUrl?: string;
    gallery?: string[];
    category?: string;
    tags?: string[];
    difficulty?: string;
    status?: string;
  };
}

export default function EnhancedProjectCard({ project }: ProjectCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const allImages = [project.image, ...(project.gallery || [])].filter(Boolean);
  const hasGallery = allImages.length > 1;

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim();
  };

  const openModal = () => {
    setIsModalOpen(true);
    setCurrentImageIndex(0);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setIsModalOpen(false);
    document.body.style.overflow = 'unset';
  };

  const handleModalContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const shouldShowReadMore = project.description.length > 100;
  const displayDescription = truncateText(project.description);

  /* Removed getDifficultyColor function and difficulty display */

  /* Portal Implementation to fix Stacking Context */
  const ModalPortal = ({ children }: { children: React.ReactNode }) => {
    if (typeof window === 'undefined') return null;
    return createPortal(children, document.body);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        whileHover={{ y: -5 }}
        className="group relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg transform transition-all duration-300 hover:shadow-2xl flex flex-col h-full"
      >
        <div className="relative h-48 w-full overflow-hidden shrink-0 cursor-pointer" onClick={openModal}>
          <Image
            src={project.image}
            alt={project.title}
            fill
            className="object-cover transform transition-transform duration-300 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {hasGallery && (
            <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
              <FaImages />
              <span>{allImages.length}</span>
            </div>
          )}
          
          {project.category && (
            <div className="absolute top-2 left-2 bg-blue-600/90 backdrop-blur-sm text-white px-2 py-1 rounded-lg text-xs font-medium uppercase tracking-wider shadow-sm">
              {project.category}
            </div>
          )}
        </div>

        <div className="p-6 flex flex-col flex-grow">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary-500 transition-colors duration-300 line-clamp-1">
              {project.title}
            </h3>
          </div>

          <div className="text-gray-600 dark:text-gray-300 mb-4 flex-grow">
            <p className="inline line-clamp-3">{project.description}</p>
          </div>

          <div className="mt-auto space-y-4">
            {/* Technologies */}
            <div className="flex flex-wrap gap-2">
              {project.technologies.slice(0, 4).map((tech) => (
                <span
                  key={tech}
                  className="px-2 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-md text-xs font-medium border border-primary-100 dark:border-primary-800/30"
                >
                  {tech}
                </span>
              ))}
              {project.technologies.length > 4 && (
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-md text-xs font-medium">
                  +{project.technologies.length - 4}
                </span>
              )}
            </div>

            {/* Tags */}
            {project.tags && project.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 items-center text-xs text-gray-500 dark:text-gray-400">
                <FaTag className="w-3 h-3" />
                {project.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="hover:text-primary-500 transition-colors">#{tag}</span>
                ))}
              </div>
            )}

            <div className="flex space-x-4 pt-4 border-t border-gray-100 dark:border-gray-700">
              {project.githubUrl && (
                <motion.a
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400"
                  title="Voir le code source"
                >
                  <FaGithub className="w-5 h-5" />
                </motion.a>
              )}
              {project.demoUrl && (
                <motion.a
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  href={project.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400"
                  title="Voir la démo live"
                >
                  <FaExternalLinkAlt className="w-4 h-4" />
                </motion.a>
              )}
              <button
                onClick={openModal}
                className="ml-auto text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline"
              >
                Détails
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Premium Glassmorphism Modal via Portal */}
      <ModalPortal>
        <AnimatePresence>
          {isModalOpen && (
            <div 
              className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6"
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-md transition-all"
                onClick={closeModal}
              />
              
              <motion.div
                layoutId={`card-${project.title}`}
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-white/90 dark:bg-gray-900/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 scrollbar-hide"
                onClick={handleModalContentClick}
              >
                {/* Close Button */}
                <button
                  onClick={closeModal}
                  className="absolute top-4 right-4 z-50 p-2.5 rounded-full bg-black/5 dark:bg-white/10 text-gray-500 dark:text-gray-300 hover:bg-black/10 dark:hover:bg-white/20 transition-all duration-200 backdrop-blur-sm group"
                >
                  <FaTimes className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                </button>

                <div className="flex flex-col lg:flex-row h-full">
                  {/* Left Column: Media Gallery */}
                  <div className="lg:w-7/12 bg-gray-50/50 dark:bg-black/20 p-6 lg:p-8 flex flex-col justify-center">
                     <div className="relative aspect-video w-full rounded-2xl overflow-hidden shadow-2xl shadow-black/10 dark:shadow-black/50 border border-gray-200 dark:border-gray-800 bg-gray-800">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={currentImageIndex}
                          initial={{ opacity: 0, scale: 1.05 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="relative w-full h-full"
                        >
                           <Image
                            src={allImages[currentImageIndex]}
                            alt={`${project.title} - Preview`}
                            fill
                            className="object-contain"
                            sizes="(max-width: 1024px) 100vw, 60vw"
                          />
                        </motion.div>
                      </AnimatePresence>

                      {/* Navigation Arrows */}
                      {hasGallery && (
                        <>
                          <button
                            onClick={prevImage}
                            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-md text-white/90 hover:text-white transition-all hover:scale-110 active:scale-95 opacity-0 group-hover:opacity-100"
                          >
                            <FaChevronLeft className="w-5 h-5" />
                          </button>
                          <button
                            onClick={nextImage}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-md text-white/90 hover:text-white transition-all hover:scale-110 active:scale-95 opacity-0 group-hover:opacity-100"
                          >
                            <FaChevronRight className="w-5 h-5" />
                          </button>
                        </>
                      )}
                     </div>

                     {/* Thumbnails */}
                     {hasGallery && (
                      <div className="mt-6 flex justify-center gap-3 overflow-x-auto py-2 scrollbar-none">
                        {allImages.map((img, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCurrentImageIndex(idx)}
                            className={`relative w-20 h-14 shrink-0 rounded-lg overflow-hidden transition-all duration-300 ${
                              idx === currentImageIndex 
                                ? 'ring-2 ring-primary-500 scale-105 shadow-lg opacity-100' 
                                : 'opacity-60 hover:opacity-100 hover:scale-105'
                            }`}
                          >
                            <Image src={img} alt="" fill className="object-cover" />
                          </button>
                        ))}
                      </div>
                     )}
                  </div>

                  {/* Right Column: Project Details */}
                  <div className="lg:w-5/12 p-6 lg:p-10 flex flex-col h-full bg-white/50 dark:bg-gray-900/50">
                     <div className="mb-6">
                        <div className="flex items-center gap-3 mb-4 flex-wrap">
                          {project.category && (
                            <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-500/10 rounded-full border border-blue-200 dark:border-blue-500/20">
                              {project.category}
                            </span>
                          )}
                          {project.status && (
                            <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border ${
                              project.status === 'completed' 
                                ? 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-500/10 border-green-200 dark:border-green-500/20'
                                : 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20'
                            }`}>
                              {project.status === 'completed' ? 'Terminé' : 'En cours'}
                            </span>
                          )}
                        </div>
                        
                        <h2 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 mb-4">
                          {project.title}
                        </h2>
                        
                        <div className="prose dark:prose-invert prose-sm max-w-none text-gray-600 dark:text-gray-300 leading-relaxed max-h-[200px] overflow-y-auto custom-scrollbar pr-2.5">
                          <p>{project.description}</p>
                        </div>
                     </div>

                     <div className="space-y-6 mt-auto">
                        {/* Tech Stack */}
                        <div>
                          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                             Technologies
                             <span className="h-px flex-1 bg-gray-200 dark:bg-gray-700"></span>
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {project.technologies.map((tech) => (
                              <span
                                key={tech}
                                className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm rounded-lg hover:border-primary-500 dark:hover:border-primary-500 transition-colors"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-4 pt-4">
                           {project.demoUrl ? (
                            <motion.a
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              href={project.demoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all"
                            >
                              <FaExternalLinkAlt className="w-4 h-4" />
                              Voir le site
                            </motion.a>
                          ) : (
                            <div className="flex items-center justify-center gap-2 px-6 py-3.5 bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 rounded-xl font-bold cursor-not-allowed">
                               <FaExternalLinkAlt className="w-4 h-4" />
                               Non disponible
                            </div>
                          )}
                          
                          {project.githubUrl ? (
                            <motion.a
                               whileHover={{ scale: 1.02 }}
                               whileTap={{ scale: 0.98 }}
                               href={project.githubUrl}
                               target="_blank"
                               rel="noopener noreferrer"
                               className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-gray-750 transition-all shadow-sm group"
                            >
                              <FaGithub className="w-5 h-5 group-hover:scale-110 transition-transform" />
                              Code source
                            </motion.a>
                          ) : (
                             <div className="flex items-center justify-center gap-2 px-6 py-3.5 bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 rounded-xl font-bold cursor-not-allowed">
                                <FaGithub className="w-5 h-5" />
                                Privé
                            </div>
                          )}
                        </div>
                     </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </ModalPortal>
    </>
  );
}


