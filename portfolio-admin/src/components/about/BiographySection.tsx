import { motion } from 'framer-motion';
import { useTranslation } from 'next-i18next';

const BiographySection = () => {
  const { t } = useTranslation('about');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto px-4 py-12"
    >
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        {t('biography.title')}
      </h2>
      
      <div className="prose dark:prose-invert max-w-none">
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
          {t('biography.introduction')}
        </p>
        
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
          {t('biography.values.title')}
        </h3>
        
        <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-300">
          {Array.from({ length: 3 }).map((_, index) => (
            <li key={index}>
              {t(`biography.values.list.${index}`)}
            </li>
          ))}
        </ul>
        
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-8 mb-4">
          {t('biography.goals.title')}
        </h3>
        
        <p className="text-lg text-gray-600 dark:text-gray-300">
          {t('biography.goals.description')}
        </p>
      </div>
    </motion.div>
  );
};

export default BiographySection;
