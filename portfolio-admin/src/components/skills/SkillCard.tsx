import { motion } from 'framer-motion';
import { IconType } from 'react-icons';
import * as ReactIcons from 'react-icons/si';

interface SkillCardProps {
  skill: {
    name: string;
    icon: string;
    level: number;
  };
}

const SkillCard = ({ skill }: SkillCardProps) => {
  // Dynamically get the icon from react-icons
  const IconComponent = (ReactIcons as Record<string, IconType>)[skill.icon] || ReactIcons.SiJavascript;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      viewport={{ once: true }}
      className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow"
    >
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0">
          <IconComponent className="w-8 h-8 text-primary-600 dark:text-primary-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {skill.name}
          </h3>
          <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div
              className="bg-primary-600 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${skill.level}%` }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SkillCard;
