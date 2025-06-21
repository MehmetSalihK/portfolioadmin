import { motion } from 'framer-motion';
import { FaGraduationCap, FaBriefcase, FaCode, FaHeart } from 'react-icons/fa';

const BiographySection = () => {
  const sections = [
    {
      icon: <FaGraduationCap className="w-6 h-6" />,
      title: "Formation",
      content: "Diplômé en informatique avec une spécialisation en développement web et mobile."
    },
    {
      icon: <FaBriefcase className="w-6 h-6" />,
      title: "Expérience",
      content: "Plusieurs années d'expérience dans le développement d'applications web modernes."
    },
    {
      icon: <FaCode className="w-6 h-6" />,
      title: "Compétences",
      content: "Maîtrise des technologies front-end et back-end, avec une passion pour l'innovation."
    },
    {
      icon: <FaHeart className="w-6 h-6" />,
      title: "Passions",
      content: "Passionné par la technologie, l'apprentissage continu et la création de solutions innovantes."
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
          Biographie
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-xl text-gray-600 dark:text-gray-300"
        >
          Découvrez mon parcours, mes compétences et mes passions
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
          Mes Valeurs
        </h3>
        <div className="grid md:grid-cols-3 gap-6">
          {['Innovation', 'Qualité', 'Collaboration'].map((value, index) => (
            <div
              key={index}
              className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg"
            >
              <p className="text-gray-600 dark:text-gray-300">
                {value}
              </p>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default BiographySection;
