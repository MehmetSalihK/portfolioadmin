import Image from 'next/image';
import { useTranslation } from 'next-i18next';
import { format } from 'date-fns';
import { fr, enUS, tr } from 'date-fns/locale';
import { motion } from 'framer-motion';

interface ExperienceCardProps {
  experience: {
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate?: string;
    current: boolean;
    description: string;
    achievements: string[];
    technologies: string[];
    companyLogo?: string;
  };
}

const ExperienceCard = ({ experience }: ExperienceCardProps) => {
  const { t, i18n } = useTranslation('experience');

  const getLocale = () => {
    switch (i18n.language) {
      case 'fr':
        return fr;
      case 'tr':
        return tr;
      default:
        return enUS;
    }
  };

  const formatDate = (date: string) => {
    return format(new Date(date), 'MMMM yyyy', { locale: getLocale() });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6"
    >
      <div className="flex items-start space-x-4">
        {experience.companyLogo && (
          <div className="flex-shrink-0">
            <Image
              src={experience.companyLogo}
              alt={experience.company}
              width={64}
              height={64}
              className="rounded-lg"
            />
          </div>
        )}
        
        <div className="flex-grow">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {experience.title}
          </h3>
          
          <p className="text-lg text-primary-600 dark:text-primary-400 mb-2">
            {experience.company}
          </p>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {experience.location} • {formatDate(experience.startDate)} - {' '}
            {experience.current ? t('present') : formatDate(experience.endDate!)}
          </p>

          <p className="text-gray-700 dark:text-gray-300 mb-4">
            {experience.description}
          </p>

          {experience.achievements && experience.achievements.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                {t('achievements')}:
              </h4>
              <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                {experience.achievements.map((achievement, index) => (
                  <li key={index}>{achievement}</li>
                ))}
              </ul>
            </div>
          )}

          {experience.technologies && experience.technologies.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {experience.technologies.map((tech, index) => (
                <span
                  key={index}
                  className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full"
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
