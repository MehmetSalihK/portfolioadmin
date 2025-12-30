import { motion, AnimatePresence } from 'framer-motion';
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

  const getDifficultyColor = (difficulty?: string) => {
    switch(difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'intermediate': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'advanced': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'expert': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  return (
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
          {project.difficulty && (
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${getDifficultyColor(project.difficulty)}`}>
              {project.difficulty}
            </span>
          )}
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

      {/* Modale pour afficher le projet complet */}
      <AnimatePresence>
        {isModalOpen && (
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={handleModalContentClick}
            >
              {/* Header de la modale */}
              <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
                <div>
                   <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                    {project.title}
                    {project.category && (
                      <span className="text-sm px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 rounded-full font-medium">
                        {project.category}
                      </span>
                    )}
                  </h2>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <FaTimes className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>

              <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Colonne gauche : Galerie */}
                <div className="relative space-y-4">
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-900 shadow-inner group/gallery">
                    <Image
                      src={allImages[currentImageIndex]}
                      alt={`${project.title} - Image ${currentImageIndex + 1}`}
                      fill
                      className="object-contain"
                    />
                    
                    {hasGallery && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white opacity-0 group-hover/gallery:opacity-100 transition-opacity hover:bg-black/70"
                        >
                          <FaChevronLeft />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white opacity-0 group-hover/gallery:opacity-100 transition-opacity hover:bg-black/70"
                        >
                          <FaChevronRight />
                        </button>
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                          {allImages.map((_, idx) => (
                            <button
                              key={idx}
                              onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(idx); }}
                              className={`w-2 h-2 rounded-full transition-colors ${
                                idx === currentImageIndex ? 'bg-white' : 'bg-white/50'
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                  
                  {hasGallery && (
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                      {allImages.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentImageIndex(idx)}
                          className={`relative w-20 h-12 shrink-0 rounded-md overflow-hidden border-2 transition-colors ${
                            idx === currentImageIndex 
                              ? 'border-primary-500 ring-1 ring-primary-500' 
                              : 'border-transparent opacity-70 hover:opacity-100'
                          }`}
                        >
                          <Image src={img} alt="" fill className="object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Colonne droite : Infos */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                       À propos
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                      {project.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-4">
                    {project.difficulty && (
                      <div className="flex-1 min-w-[120px]">
                        <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Difficulté</span>
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(project.difficulty)} capitalize`}>
                          {project.difficulty}
                        </span>
                      </div>
                    )}
                    {project.status && (
                      <div className="flex-1 min-w-[120px]">
                        <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Statut</span>
                        <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 capitalize">
                          {project.status}
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                      Technologies
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium border border-gray-200 dark:border-gray-700"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {project.tags && project.tags.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                        Tags
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {project.tags.map((tag) => (
                          <span
                            key={tag}
                            className="flex items-center gap-1.5 px-3 py-1 text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-full"
                          >
                            <FaTag className="w-3 h-3" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-6 mt-6 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-4">
                    {project.demoUrl && (
                      <a
                        href={project.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 inline-flex justify-center items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
                      >
                        <FaExternalLinkAlt className="w-4 h-4 mr-2" />
                        Voir le site
                      </a>
                    )}
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 inline-flex justify-center items-center px-6 py-3 bg-gray-800 dark:bg-gray-700 hover:bg-gray-900 dark:hover:bg-gray-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
                      >
                        <FaGithub className="w-5 h-5 mr-3" />
                        Code source
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
