import { motion } from 'framer-motion';
import { useTranslation } from 'next-i18next';
import { FaGraduationCap, FaBriefcase, FaCode, FaHeart } from 'react-icons/fa';

const BiographySection = () => {
  const { t } = useTranslation('about');

  const sections = [
    {
      icon: <FaGraduationCap className="w-6 h-6" />,
      title: t('biography.education.title'),
      content: t('biography.education.content')
    },
    {
      icon: <FaBriefcase className="w-6 h-6" />,
      title: t('biography.experience.title'),
      content: t('biography.experience.content')
    },
    {
      icon: <FaCode className="w-6 h-6" />,
      title: t('biography.skills.title'),
      content: t('biography.skills.content')
    },
    {
      icon: <FaHeart className="w-6 h-6" />,
      title: t('biography.interests.title'),
      content: t('biography.interests.content')
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto px-4 py-12"
    >
      <div className="text-center mb-12">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-4xl font-bold text-gray-900 dark:text-white mb-4"
        >
          {t('biography.title')}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-xl text-gray-600 dark:text-gray-300"
        >
          {t('biography.introduction')}
        </motion.p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {sections.map((section, index) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 * (index + 1) }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            <div className="flex items-center mb-4">
              <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-full mr-4 text-primary-600 dark:text-primary-400">
                {section.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                {section.title}
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              {section.content}
            </p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="mt-12 text-center"
      >
        <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">
          {t('biography.values.title')}
        </h3>
        <div className="grid md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg"
            >
              <p className="text-gray-600 dark:text-gray-300">
                {t(`biography.values.list.${index}`)}
              </p>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default BiographySection;
