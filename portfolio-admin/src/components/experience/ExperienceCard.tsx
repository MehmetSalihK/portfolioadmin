import Image from 'next/image';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { FiMapPin } from 'react-icons/fi';

interface ExperienceCardProps {
  experience: {
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate?: string;
    isCurrentPosition: boolean;
    description: string;
    achievements: string[];
    technologies: string[];
    companyLogo?: string;
  };
}

const ExperienceCard = ({ experience }: ExperienceCardProps) => {
  const formatDate = (date: string) => {
    try {
      if (!date) return 'Date non spécifiée';
      const d = new Date(date);
      if (isNaN(d.getTime())) return 'Date invalide';
      return format(d, 'MMMM yyyy', { locale: fr });
    } catch (e) {
      return 'Erreur date';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="group relative"
    >
      <div className="dark:bg-zinc-900/60 bg-white backdrop-blur-sm rounded-3xl p-6 lg:p-8 dark:border-white/5 border-zinc-200 border dark:hover:border-indigo-500/20 hover:border-indigo-300 transition-all duration-300 shadow-sm hover:shadow-lg flex flex-col relative overflow-hidden">
        {/* Hover Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              {experience.companyLogo && (
                <div className="relative w-14 h-14 rounded-2xl overflow-hidden border dark:border-white/10 border-zinc-200 dark:bg-zinc-800 bg-zinc-50 flex-shrink-0">
                  <Image
                    src={experience.companyLogo}
                    alt={experience.company}
                    layout="fill"
                    objectFit="cover"
                  />
                </div>
              )}
              <div>
                <h3 className="text-xl font-black dark:text-white text-zinc-900 tracking-tight mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {experience.title}
                </h3>
                <div className="flex items-center gap-2 text-sm font-bold dark:text-zinc-400 text-zinc-500 uppercase tracking-widest">
                  {experience.company}
                </div>
              </div>
            </div>

            <span className="px-3 py-1.5 dark:bg-indigo-500/10 bg-indigo-50 dark:text-indigo-400 text-indigo-600 dark:border-indigo-500/20 border-indigo-200 border rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap self-start md:self-center">
              {formatDate(experience.startDate)} — {experience.isCurrentPosition ? <span className="animate-pulse">Présent</span> : formatDate(experience.endDate!)}
            </span>
          </div>

          <p className="dark:text-zinc-500 text-zinc-600 leading-relaxed text-sm mb-6 font-medium">
            {experience.description}
          </p>

          {experience.achievements && experience.achievements.length > 0 && (
            <div className="mb-6 space-y-3 pl-4 border-l-2 dark:border-zinc-800 border-zinc-100">
              {experience.achievements.map((achievement, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                  <p className="dark:text-zinc-500 text-zinc-500 text-xs font-medium">{achievement}</p>
                </div>
              ))}
            </div>
          )}

          {experience.technologies && experience.technologies.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-6 border-t dark:border-white/5 border-zinc-100">
              {experience.technologies.map((tech, index) => (
                <span
                  key={index}
                  className="px-2.5 py-1 dark:bg-white/5 bg-zinc-100 dark:text-zinc-400 text-zinc-500 dark:border-white/10 border-zinc-200 border rounded-lg text-[10px] font-bold hover:text-indigo-500 transition-colors cursor-default"
                >
                  {tech}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ExperienceCard;
