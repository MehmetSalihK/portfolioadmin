import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { 
  FaReact, 
  FaNodeJs, 
  FaGit, 
  FaDocker, 
  FaPhp,
  FaWordpress,
  FaGithub,
  FaGitlab,
  FaHtml5,
  FaCss3Alt
} from 'react-icons/fa';
import { 
  SiTypescript, 
  SiJavascript, 
  SiMongodb, 
  SiPostgresql,
  SiTailwindcss,
  SiNextdotjs,
  SiAdobephotoshop,
  SiAdobeaftereffects,
  SiAdobepremierepro,
  SiFlutter,
  SiVuedotjs,
  SiMysql,
  SiFirebase,
  SiVisualstudiocode,
  SiPostman,
  SiBootstrap,
  SiFigma
} from 'react-icons/si';

const skillCategories = [
  {
    title: "Développement Web",
    icon: "🌐",
    color: "from-blue-500 to-cyan-500",
    skills: [
      { name: "JavaScript", icon: <SiJavascript className="w-6 h-6" /> },
      { name: "TypeScript", icon: <SiTypescript className="w-6 h-6" /> },
      { name: "React", icon: <FaReact className="w-6 h-6" /> },
      { name: "Next.js", icon: <SiNextdotjs className="w-6 h-6" /> },
      { name: "Vue.js", icon: <SiVuedotjs className="w-6 h-6" /> },
      { name: "HTML", icon: <FaHtml5 className="w-6 h-6" /> },
      { name: "CSS", icon: <FaCss3Alt className="w-6 h-6" /> }
    ]
  },
  {
    title: "Base de données & Backend",
    icon: "🗄️",
    color: "from-green-500 to-emerald-500",
    skills: [
      { name: "Node.js", icon: <FaNodeJs className="w-6 h-6" /> },
      { name: "MySQL", icon: <SiMysql className="w-6 h-6" /> },
      { name: "PostgreSQL", icon: <SiPostgresql className="w-6 h-6" /> },
      { name: "PHP", icon: <FaPhp className="w-6 h-6" /> },
      { name: "Firebase", icon: <SiFirebase className="w-6 h-6" /> }
    ]
  },
  {
    title: "Outils de Développement",
    icon: "🛠️",
    color: "from-purple-500 to-pink-500",
    skills: [
      { name: "Git", icon: <FaGit className="w-6 h-6" /> },
      { name: "GitHub", icon: <FaGithub className="w-6 h-6" /> },
      { name: "GitLab", icon: <FaGitlab className="w-6 h-6" /> },
      { name: "Docker", icon: <FaDocker className="w-6 h-6" /> },
      { name: "VS Code", icon: <SiVisualstudiocode className="w-6 h-6" /> },
      { name: "Postman", icon: <SiPostman className="w-6 h-6" /> }
    ]
  },
  {
    title: "CMS & Frameworks",
    icon: "⚡",
    color: "from-orange-500 to-red-500",
    skills: [
      { name: "WordPress", icon: <FaWordpress className="w-6 h-6" /> },
      { name: "Bootstrap", icon: <SiBootstrap className="w-6 h-6" /> },
      { name: "Tailwind CSS", icon: <SiTailwindcss className="w-6 h-6" /> },
      { name: "Flutter", icon: <SiFlutter className="w-6 h-6" /> }
    ]
  },
  {
    title: "Logiciels",
    icon: "🎨",
    color: "from-indigo-500 to-purple-500",
    skills: [
      { name: "Adobe Photoshop", icon: <SiAdobephotoshop className="w-6 h-6" /> },
      { name: "Adobe After Effects", icon: <SiAdobeaftereffects className="w-6 h-6" /> },
      { name: "Adobe Premiere Pro", icon: <SiAdobepremierepro className="w-6 h-6" /> },
      { name: "Figma", icon: <SiFigma className="w-6 h-6" /> }
    ]
  }
];

export default function SkillsSection() {
  const [mounted, setMounted] = useState(false);
  const { theme, systemTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = mounted ? (theme === 'system' ? systemTheme : theme) : 'light';

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02]"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-r from-green-400/10 to-cyan-400/10 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-3 mb-6"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl">
                💻
              </div>
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Mes Compétences
              </h2>
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
            >
              Découvrez les technologies et outils que je maîtrise pour créer des solutions innovantes
            </motion.p>
          </div>

          {/* Skills Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {skillCategories.map((category, categoryIndex) => (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
                className="group"
              >
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 dark:border-gray-700 hover:border-transparent hover:bg-gradient-to-br hover:from-white hover:to-gray-50 dark:hover:from-gray-800 dark:hover:to-gray-700 relative overflow-hidden">
                  {/* Category Header */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${category.color} flex items-center justify-center text-white text-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      {category.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
                        {category.title}
                      </h3>
                      <div className={`h-1 w-0 group-hover:w-full bg-gradient-to-r ${category.color} rounded-full transition-all duration-500 mt-1`}></div>
                    </div>
                  </div>

                  {/* Skills List */}
                  <div className="space-y-4">
                    {category.skills.map((skill, skillIndex) => (
                      <motion.div
                        key={skill.name}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: categoryIndex * 0.1 + skillIndex * 0.05 }}
                        className="group/skill"
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-gray-600 dark:text-gray-400 group-hover/skill:text-blue-500 transition-colors duration-300">
                            {skill.icon}
                          </div>
                          <span className="font-medium text-gray-800 dark:text-gray-200 group-hover/skill:text-gray-900 dark:group-hover/skill:text-white transition-colors duration-300">
                            {skill.name}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Decorative elements */}
                  <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full blur-xl group-hover:from-blue-500/10 group-hover:to-purple-500/10 transition-all duration-500"></div>
                  <div className="absolute bottom-4 left-4 w-16 h-16 bg-gradient-to-br from-green-500/5 to-cyan-500/5 rounded-full blur-xl group-hover:from-green-500/10 group-hover:to-cyan-500/10 transition-all duration-500"></div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-center mt-16"
          >
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer">
              <span>Voir tous mes projets</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}