import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { FiBriefcase, FiMapPin, FiCalendar, FiExternalLink } from 'react-icons/fi';
import { motion } from 'framer-motion';

interface Experience {
  _id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string | null;
  description: string;
  companyUrl?: string;
  isCurrentPosition?: boolean;
}

interface ExperienceSectionProps {
  experiences: Experience[];
}

export default function ExperienceSection({ experiences }: ExperienceSectionProps) {
  const formatDate = (date: string) => {
    return format(new Date(date), 'MMM yyyy', { locale: fr });
  };

  return (
    <section className="py-20 bg-gradient-to-b from-gray-900 to-black relative">
      {/* Effet de grille en arrière-plan */}
      <div className="absolute inset-0 opacity-[0.05]">
        <div className="absolute inset-0 bg-grid-white/[0.1]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600">
            Expérience Professionnelle
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-blue-600 mx-auto rounded-full" />
        </motion.div>

        <div className="max-w-5xl mx-auto space-y-12">
          {experiences.map((experience, index) => (
            <motion.div
              key={experience._id}
              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group transform hover:scale-[1.01] transition-all duration-300"
            >
              <div className="bg-[#1A1A1A] rounded-2xl p-6 md:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-800 hover:border-blue-500/30 relative overflow-hidden backdrop-blur-sm">
                {/* Effet de gradient amélioré au survol */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative z-10">
                  {/* Badge de date avec animation */}
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-400 px-4 py-1.5 rounded-full text-sm mb-4 border border-blue-500/20"
                  >
                    <FiCalendar className="w-4 h-4" />
                    <span>
                      {formatDate(experience.startDate)}
                      {' - '}
                      {experience.isCurrentPosition 
                        ? 'Présent'
                        : experience.endDate 
                          ? formatDate(experience.endDate)
                          : ''
                      }
                    </span>
                  </motion.div>

                  {/* Titre et Entreprise */}
                  <div className="mb-4">
                    <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                      {experience.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-2 text-gray-400">
                        <FiBriefcase className="w-5 h-5 text-gray-500" />
                        <span className="font-medium">
                          {experience.company}
                          {experience.companyUrl && (
                            <a 
                              href={experience.companyUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center ml-2 text-blue-400 hover:text-blue-300"
                            >
                              <FiExternalLink className="w-4 h-4" />
                            </a>
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400">
                        <FiMapPin className="w-5 h-5 text-gray-500" />
                        <span>{experience.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="prose prose-invert max-w-none">
                    <p className="text-gray-300 leading-relaxed">
                      {experience.description}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}