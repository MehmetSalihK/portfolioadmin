import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';

const skillCategories = [
  {
    title: "Développement Web",
    skills: ["JavaScript", "TypeScript", "React", "Next.js", "Vue.js", "HTML", "CSS"]
  },
  {
    title: "Base de données & Backend",
    skills: ["Node.js", "MongoDB", "MySQL", "PostgreSQL", "PHP", "Firebase"]
  },
  {
    title: "Outils de Développement",
    skills: ["Git", "GitHub", "GitLab", "Docker", "VS Code", "Postman"]
  },
  {
    title: "CMS & Frameworks",
    skills: ["WordPress", "Bootstrap", "Tailwind CSS", "Flutter"]
  },
  {
    title: "Logiciels",
    skills: ["Adobe Photoshop", "Adobe After Effects", "Adobe Premiere Pro", "Figma"]
  }
];

export default function SkillsSection() {
  const { theme } = useTheme();

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-6xl mx-auto"
        >
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            Compétences
          </h2>

          <div className="space-y-8">
            {skillCategories.map((category, index) => (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
                  {category.title}
                </h3>
                <div className={`h-1 w-full rounded-full mb-4 overflow-hidden
                  ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: "100%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {category.skills.map((skill) => (
                    <span
                      key={skill}
                      className={`px-3 py-1 rounded-full text-sm
                        ${theme === 'dark' 
                          ? 'bg-gray-800 text-gray-300' 
                          : 'bg-gray-100 text-gray-700'}`}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
} 